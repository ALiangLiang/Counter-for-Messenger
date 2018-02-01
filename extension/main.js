const REQ_URL_ROOT = 'https://www.messenger.com';
const DISPLAY_MAX = 50;
const DEFAULT_LOAD_NUM = 20000;
var ctx = [];
var myBarChart = [];
var counter = {

  token: undefined,
  userid: undefined,
  data: undefined,
  last_right_click_bar: undefined,
  last_right_click_bar_index: undefined,

  main: function() {
    counter.setup_receiver().then(function() { // receive token
      location.hash = '#counter-for-messenger'
      var btn = document.getElementById('dl_all');
      btn.onclick = function() {
        toastr['info'](chrome.i18n.getMessage('toast_import_msgs'))
        var i = counter.data.length;

        function dump() {
          i--;
          if (i > -1)
            counter.dump_history_from_FB([], 'thread_fbids', counter.data[i].fbid, 0, null, DEFAULT_LOAD_NUM, i).then(dump);
        }
        dump();
      }
    });
  },

  dump_history_from_DB: function(chatrooms) {
    return new Promise(function(resolve) {
      for (var i = 0; i < DISPLAY_MAX; i++) {
        (function(i) {
          spin.show();
          const index = i;
          db.get_history(chatrooms[i].fbid)
            .then((msgs) => {
              if (msgs.length)
                counter.dump_history_done(msgs, index, chatrooms[index].fbid)
                .then(() => spin.hide());
              else
                spin.hide();
            }, () => spin.hide());
        })(i);
      }
      return resolve();
    });
  },

  dump_history_from_FB: function(messages = [], type, user_ids, offset, timestamp, limit, index) {
    spin.show();

    function dump(messages, type, user_ids, offset, timestamp, limit, index) {
      const formdata = {
        batch_name:'MessengerGraphQLThreadFetcher',
        fb_dtsg: counter.token,
        client: 'mercury',
        __a: 1,
        counter: 'true',
        queries: {
          o0: {
            doc_id: '1479680738780118',
            query_params: {
              id: user_ids,
              message_limit: limit,
              load_messages: 1,
              load_read_receipts: true,
              before: timestamp
            }
          }
        }
      };

      return new Promise(function(resolve, reject) {
        counter.xhr('/api/graphqlbatch/', formdata, function(response) {
          const promise = response.text()
            .then((text) => {
              try {
                const json = counter.res_tranformat_to_JSON(text);
                // if (json.o0 && json.o0.errors)
                //   throw new Error(json.o0.errors);
                return json;
              } catch (err) {
                console.warn('Request error.')
                return Promise.resolve(err);
              }
            })
            .then((data) => {
                const messages_data = data.o0.data.message_thread.messages.nodes;
                const newMessages = messages_data.concat(messages);
                if (data.o0.data.message_thread.messages.page_info.has_previous_page)
                  return dump(newMessages, type, user_ids, offset + limit, messages_data[0].timestamp_precise, limit, index);
                return Promise.resolve(newMessages);
              },
              // If server internal error happened, retry with half messages limit.
              (err) => {
                console.warn('Retry with half messages limit: ', limit / 2);
                return (limit > 1000) ?
                  dump(messages, type, user_ids, offset, timestamp, limit / 2, index) :
                  Promise.reject('Limit too low. Cancel this action.');
              });
          return resolve(promise);
        });
      })
    }

    return dump(messages, type, user_ids, offset, timestamp, limit, index)
      .then((newMessages) => {
        if (!newMessages)
          return Promise.reject('Oops! Something wrong.')
        return counter.dump_history_done(newMessages, index, user_ids)
          .then(() => {
            db.setup(user_ids, newMessages);
            spin.hide();
            return void 0;
          })
      })
      .catch((err) => {
        console.error('Dump from FB error.', err);
        spin.hide();
        toastr['error'](err);
      });
  },

  dump_history_done: function(messages, index) {
    var msg_own_count = 0;
    var msg_other_count = 0;
    var char_own_count = 0;
    var char_other_count = 0;
    messages.forEach(function(e) {
      if (e.message_sender.id == counter.userid) {
        msg_own_count++;
        if (e.message && e.message.text)
          char_own_count += e.message.text.length;
      } else {
        msg_other_count++;
        if (e.message && e.message.text)
          char_other_count += e.message.text.length;
      }
    });
    myBarChart[0].data.datasets[0].data[index] = msg_own_count;
    myBarChart[0].data.datasets[1].data[index] = msg_other_count;
    myBarChart[0].data.datasets[2].data[index] = undefined;
    myBarChart[0].update();
    myBarChart[1].data.datasets[0].data[index] = char_own_count;
    myBarChart[1].data.datasets[1].data[index] = char_other_count;
    myBarChart[1].update();
    return Promise.resolve();
  },

  setup_receiver: function() {
    return new Promise(function(solve) {
      chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.token && message.userid) {
          if (counter.token)
            return;
          counter.token = message.token;
          counter.userid = message.userid;

          var title_name = chrome.i18n.getMessage('extName');
          var btn_text = chrome.i18n.getMessage('DownloadAllHistory');
          var html_str = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title_name + '</title></head><body><button id="dl_all">' + btn_text + '</button>提示：雙擊圖表中的長柱，可匯入該訊息歷史紀錄。 提示2：對長柱右鍵，可下載歷史訊息。<canvas id="chart_msg" width="500" height="250"></canvas><canvas id="chart_char" width="500" height="250"></canvas></script></body></html>';
          document.write(html_str);
          setup_spin_lib(window);
          window.stop();

          spin.setup_spinner();
          spin.show();

          ctx[0] = document.getElementById('chart_msg');
          ctx[1] = document.getElementById('chart_char');
          solve();

          const data_json = {
            fb_dtsg: counter.token,
            __a: 1,
            counter: 'true',
            queries: {
              o0: {
                doc_id: '1780638668674992',
                query_params: {
                  limit: 5000,
                  before: 9999999999999,
                  tags: ['INBOX'],
                  includeDeliveryReceipts: true,
                  includeSeqID: false
                }
              }
            }
          };

          counter.xhr('/api/graphqlbatch/', data_json, function(response) {
            response.text()
              .then((text) => counter.res_tranformat_to_JSON(text))
              .then((json) => counter.res_handle(json))
              .then((chatrooms) => {
                counter.data_handle(chatrooms) // Render chartbar with total messages.
                  .then(() => db.update_objectstores(chatrooms.map((chatroom) => chatroom.fbid))) // Update DB schema.
                  .then(() => {
                    console.info('First render done!!');
                    toastr['info'](chrome.i18n.getMessage('toast_loading_from_local'));
                    return counter.dump_history_from_DB(chatrooms); // Render chartbar with local DB data.
                  })
                  .then(() => spin.hide());
              });
          });
        } else if (message.info === 'click_contextMenu' && message.tab) {
          spin.show();
          const tab = message.tab;
          const bar = counter.last_right_click_bar;
          const index = counter.last_right_click_bar_index;
          if (bar !== undefined)
            counter.download_history(bar, index);
        }
      });
    });
  },

  download_history: function(bar, index) {
    var other_fbid = bar.fbid;
    var other_name = bar.name;
    toastr['info'](chrome.i18n.getMessage('toast_download_history'));
    db.get_history(other_fbid)
      .then(function(messages) {
        var html = document.createElement('html');
        html.innerHTML = html_pattern;
        var body = html.querySelector('#container');
        for (var i in messages) {
          var msg = messages[i];
          var content = (msg.message) ? msg.message.text : '';

          var div = document.createElement('div');
          var div_box = document.createElement('div');
          div_box.innerText = content;
          div.classList = 'outer';
          div.appendChild(div_box);
          const date = new Date(Number(msg.timestamp_precise));
          const localTimeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
          if (msg.message_sender.id == counter.userid) {
            div.className += ' right';
            div_box.classList = 'box_r';
            div_box.id = msg.timestamp_precise;
            div_box.title = localTimeString;
          } else {
            div_box.classList = 'box_l';
            div_box.id = msg.timestamp_precise;
            div_box.title = localTimeString;
          }
          body.appendChild(div);
        }
        var tmp = document.createElement('div');
        tmp.appendChild(html);
        var html_str = tmp.innerHTML;

        function padLeft(str, len) {
          str = '' + str;
          if (str.length >= len) {
            return str;
          } else {
            return padLeft('0' + str, len);
          }
        }
        var date = new Date();
        var time = (date.getYear() + 1900) + padLeft(date.getMonth(), 2) + padLeft(date.getDate(), 2)
        download(html_str, other_name + '-' + time + '.html', 'text/html');
        spin.hide();
      }, function() {
        spin.hide();
        chart.chart_flash(index).then(function() {
          chart.chart_flash(index);
        });
      });
  },

  /**
   * url: req url
   * data_json: req body
   * callback: the function you need to handle the response
   */
  xhr: function(url, data_json, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', REQ_URL_ROOT + url);
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    xhr.onprogress = function(event) {
      //console.log(event, event.lengthComputable);
    };
    xhr.onerror = function(err) {
      callback({
        text: function() {
          return new Promise(function(solve, reject) {
            reject(err);
          });
        }
      });
    };
    xhr.onload = function() {
      callback({
        text: function() {
          return new Promise(function(solve) {
            solve(xhr.responseText);
          });
        }
      });
    };
    xhr.send(counter.json2urlencode(data_json));
    /*fetch(REQ_URL_ROOT + url, {
    headers : {
    'content-type' : 'application/x-www-form-urlencoded; charset=utf-8',
    'x-msgr-region' : 'ATN'
    },
    mode : 'cors',
    method : 'POST',
    credentials : 'include',
    cache : 'default',
    body : counter.json2urlencode(data_json)
    }).then(callback);*/
  },

  res_tranformat_to_JSON: function(text = '{}') {
    var res = text.split('\n')[0];
    return JSON.parse(res);
  },

  data_handle: function(responseData) {
    return new Promise(function(solve) {
      counter.data = responseData = responseData.slice(0, DISPLAY_MAX);
      var labels = [],
        values = [];
      responseData.forEach(function(d) {
        labels.push(d.name);
        values.push(d.count);
      });
      chart.msg_chart_render(labels, values);
      chart.char_chart_render(labels, values);

      ctx[0].ondblclick = function(e) {
        toastr['info'](chrome.i18n.getMessage('toast_import_msgs'));
        var bar = myBarChart[0].getElementAtEvent(e)[0];
        if (bar) {
          counter.dump_history_from_FB([], 'thread_fbids', responseData[bar._index].fbid, 0, null, DEFAULT_LOAD_NUM, bar._index);
        }
      };

      ctx[0].oncontextmenu = ctx[1].oncontextmenu = function(e) {
        var bar = myBarChart[0].getElementAtEvent(e)[0] || myBarChart[1].getElementAtEvent(e)[0];
        if (bar) {
          counter.last_right_click_bar = responseData[bar._index];
          counter.last_right_click_bar_index = bar._index;
        } else {
          counter.last_right_click_bar = undefined;
        }
      }

      solve(responseData);
    });
  },

  res_handle: function(json) {
    return new Promise(function(solve) {
      const threads = json.o0.data.viewer.message_threads.nodes;
      const list = threads.sort((a, b) => b.messages_count - a.messages_count);
      const rList = list.map(function(obj) {
        const rObj = {};
        const thread_fbid = obj.thread_key.thread_fbid;
        const other_fbid = obj.other_user_fbid;
        if (obj.thread_type === 'ONE_TO_ONE') { //personal room
          const other_user_id = obj.thread_key.other_user_id;
          const other_user = obj.all_participants.nodes.find((u) => Number(u.messaging_actor.id) === Number(other_user_id));
          rObj.name = other_user.messaging_actor.name;
          rObj.fbid = other_user_id;
          rObj.count = obj.messages_count;
          return rObj;
        } else if (obj.thread_type === 'GROUP') { //group room
          rObj.name = obj.name; // Group name.
          rObj.fbid = thread_fbid;
          rObj.count = obj.messages_count;
          return rObj;
        } else
          console.warn('Unknown message room type.', obj);
      });
      solve(rList)
    });
  },

  find_other_side: function(participants, fbid) {
    return participants.find(function(e) {
      return e.fbid == fbid;
    });
  },

  json2urlencode: function(data_json) {
    return Object.keys(data_json).map(function(key) {
      let val;
      if (typeof data_json[key] === 'object')
        val = JSON.stringify(data_json[key]);
      else
        val = data_json[key];
      return encodeURIComponent(key) + ((data_json[key] !== undefined) ? ('=' + encodeURIComponent(val)) : '');
    }).join('&');
  },

  send_to_background: function(data) {
    chrome.runtime.sendMessage(data, function(response) {
      if (response.status === 'suc');
      //window.close();
    });
  }

};

var chart = {
  msg_chart_render: function(labels, values) {
    function color_array(color) {
      var colors = Array(DISPLAY_MAX).fill(color, 0, DISPLAY_MAX);
      return colors;
    }
    var data = {
      labels: labels,
      datasets: [{
        label: chrome.i18n.getMessage('You'),
        backgroundColor: color_array('rgba(100,0,0,0.7)'),
        borderColor: [].fill('rgba(220,220,220,1)'),
        data: []
      }, {
        label: chrome.i18n.getMessage('OtherPeople'),
        backgroundColor: color_array('rgba(0,100,0,0.7)'),
        borderColor: [].fill('rgba(220,220,220,1)'),
        data: []
      }, {
        label: chrome.i18n.getMessage('Total'),
        backgroundColor: color_array('rgba(151,187,245,0.8)'),
        borderColor: [].fill('rgba(220,220,220,0.5)'),
        data: values
      }],
      borderWidth: 1
    };
    var options = {
      responsive: true,
      scales: {
        yAxes: [{
          type: 'linear',
          position: 'left',
          stacked: true,
          gridLines: {},
          scaleLabel: {
            display: true
          },
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          ticks: {
            maxRotation: 90,
            minRotation: 0,
            min: 1,
            max: 1000
          },
          stacked: true
        }]
      },
      title: {
        display: true,
        text: chrome.i18n.getMessage('AmountOfMessages')
      }
    };
    myBarChart[0] = new Chart(ctx[0], {
      type: 'bar',
      data: data,
      options: options
    });
    myBarChart[0].update()
  },

  char_chart_render: function(labels) {
    var data = {
      labels: labels,
      datasets: [{
        label: chrome.i18n.getMessage('You'),
        backgroundColor: 'rgba(100,0,0,0.7)',
        borderColor: 'rgba(220,220,220,1)',
        data: []
      }, {
        label: chrome.i18n.getMessage('OtherPeople'),
        backgroundColor: 'rgba(0,100,0,0.7)',
        borderColor: 'rgba(220,220,220,1)',
        data: []
      }],
      borderWidth: 1
    };
    var options = {
      responsive: true,
      scales: {
        yAxes: [{
          type: 'linear',
          position: 'left',
          stacked: true,
          gridLines: {},
          scaleLabel: {
            display: true
          },
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          ticks: {
            maxRotation: 90,
            minRotation: 0,
            min: 1,
            max: 1000
          },
          stacked: true
        }]
      },
      title: {
        display: true,
        text: chrome.i18n.getMessage('AmountOfCharacters')
      }
    };
    myBarChart[1] = new Chart(ctx[1], {
      type: 'bar',
      data: data,
      options: options
    });
  },

  chart_flash: function(index) {
    return new Promise(function(solve) {
      for (var i = 0; i < 3; i++) {
        var color = myBarChart[0].data.datasets[i].backgroundColor[index];
        myBarChart[0].data.datasets[i].backgroundColor[index] = color.replace(/\d\.\d\)$/, '0.1)');
        myBarChart[0].update();
        setTimeout(function(i) {
          var color = myBarChart[0].data.datasets[i].backgroundColor[index];
          myBarChart[0].data.datasets[i].backgroundColor[index] = color.replace(/\d\.\d\)$/, '0.8)');
          myBarChart[0].update();
          setTimeout(function() {
            solve()
          }, 150)
        }, 150, i)
      }
    });
  }
};

var db = {
  DB_NAME: 'msg_history',
  request: undefined,

  openDB: function(suc, fail) {
    db.request = indexedDB.open(db.DB_NAME);
    db.request.onsuccess = suc;
    db.request.onerror = fail;
  },

  error_handle: (e) => console.error(e),

  setup: function(OS_name, messages) {
    db.openDB(function(event) {
      var database = event.target.result;

      if (!database.objectStoreNames.contains(OS_name))
        return console.warn('Cannot found the objectstore.');

      var transaction = database.transaction([OS_name], 'readwrite');
      transaction.oncomplete = (event) => console.log('All done!');
      var objectStore = transaction.objectStore(OS_name);
      var countRequest = objectStore.count();
      countRequest.onsuccess = function() {
        const length = countRequest.result;
        // If length updated, clear and resave all messages.
        if (length !== messages.length) {
          console.info('Messages length of this chatroom were updated.')
          var clearObjectStoreRequest = objectStore.clear();
          // Cleared.
          clearObjectStoreRequest.onsuccess = function(event) {
            for (let i in messages) {
              const request = objectStore.add(messages[i]);
              request.onerror = (event) => console.error('add error!');
            }
          };
        } else
          return console.info('No need to update objectstore.');
      }
    }, db.error_handle);
  },

  // If chatrooms list changed, update database schema(objectstore list).
  update_objectstores: function(ids) {
    const request = indexedDB.open(db.DB_NAME);
    const new_ids = [];
    return new Promise((resolve, reject) => {
      request.onsuccess = function(event) {
        const database = event.target.result;
        const list = database.objectStoreNames;
        const version = parseInt(database.version);
        database.close();
        ids.forEach((id) => {
          if (!list.contains(id))
            new_ids.push(id);
        });
        if (new_ids.length !== 0) {
          const new_request = indexedDB.open(db.DB_NAME, version + 1);
          new_request.onupgradeneeded = function(event) {
            new_ids.forEach((id) => {
              event.target.result.createObjectStore(id, {
                autoIncrement: true
              });
            });
          }
          new_request.onerror = function(event) {
            console.error(event);
          };
        } else
          console.info('No need to update version.')
        return resolve();
      };
      request.onerror = () => reject();
    });
  },

  create_user: function(OS_name, data) {
    db.openDB(function(event) {
      var transaction = db.transaction([OS_name]);
      var objectStore = transaction.objectStore(OS_name);
      for (var i in data) {
        var request = objectStore.add(data[i]);
        request.onsuccess = function(event) {};
      }
    }, db.error_handle);
  },

  get_history: function(user) {
    return new Promise(function(solve, reject) {
      return db.openDB(function(event) {
        const database = event.target.result;
        try {
          const transaction = database.transaction([user]);
          transaction.onerror = function(e) {
            console.error(e);
            return reject();
          };

          const objectStore = transaction.objectStore(user);
          const request = objectStore.getAll();
          request.onerror = db.error_handle;
          request.onsuccess = (event) => solve(request.result);
        } catch (e) {
          console.error(e);
          reject(user.fbid);
        }
      }, db.error_handle);
    });
  }
};

var spin = {
  spinner: undefined,
  job_num: 0,

  setup_spinner: function() {
    var opts = {
      lines: 13,
      length: 28,
      width: 14,
      radius: 42,
      scale: 1,
      corners: 1,
      color: '#000',
      opacity: 0.25,
      rotate: 0,
      direction: 1,
      speed: 1,
      trail: 60,
      fps: 20,
      zIndex: 2e9,
      className: 'spinner',
      top: '50%',
      left: '50%',
      shadow: false,
      hwaccel: false,
      position: 'absolute'
    };
    var target = document.body;
    spin.spinner = new Spinner(opts);
  },

  show: function() {
    spin.job_num++;
    spin.spinner.spin(document.body);
  },

  hide: function() {
    if (spin.job_num > 0)
      spin.job_num--;
    if (spin.job_num === 0)
      spin.spinner.spin();
  }
}

var first = false;
if (location.hash === '#counter-for-messenger') {
  if (location.pathname === '/login.php' && location.search === '?next=https%3A%2F%2Fwww.messenger.com%2Ft%2FALiangLiang.top') {
    location = location.href.replace(/#/, '%23');
    alert('Please login the messenger to count your messages.');
  } else if (location.pathname.search(/\/t\//) !== -1) {
    counter.main();
  }
}
