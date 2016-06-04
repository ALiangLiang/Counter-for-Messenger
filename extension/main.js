const req_url_root = "https://www.messenger.com/ajax/mercury";
const display_max = 50;
var ctx = [];
var myBarChart = [];
var counter = {

  token : undefined,
  userid : undefined,
  data : undefined,
  last_right_click_bar : undefined,
  last_right_click_bar_index : undefined,

  main : function () {
    counter.setup_receiver().then(function () { // receive token
      var btn = document.getElementById("dl_all");
      btn.onclick = function () {
        console.log("click");
        var i = counter.data.length;
        function dump() {
          i--;
          if (i > -1)
            counter.dump_history_from_FB([], "thread_fbids", counter.data[i].fbid, 0, "", 20000, i).then(dump);
        }
        dump();
      }
    });
  },

  dump_history_from_DB : function (charrooms) {
    return new Promise(function (resolve) {
      for (var i = 0; i < display_max; i++) {
        (function (i) {
          var index = i;
          db.get_history(charrooms[i].fbid, i).then(function (msgs) {
            counter.dump_history_done(msgs, index, charrooms[index].fbid);
          });
        })(i);
      }
      resolve();
    });
  },

  dump_history_from_FB : function (messages, type, user_ids, offset, timestamp, limit, index) {
    return new Promise(function (resolve) {
      spin.show();
      var data_json_history = new counter.data_json_history(counter.token);
      data_json_history["messages[" + type + "][" + user_ids + "][offset]"] = offset;
      data_json_history["messages[" + type + "][" + user_ids + "][timestamp]"] = timestamp;
      data_json_history["messages[" + type + "][" + user_ids + "][limit]"] = limit;
      data_json_history["fb_dtsg"] = counter.token;
      counter.xhr("/thread_info.php?dpr=1", data_json_history, function (response) {
        response.text().then(function (text) {
          var data = counter.res_tranformat_to_JSON(text);
          console.log(data);
          var messages_data = data.payload.actions;
          messages = messages_data.concat(messages);
          if (!data.payload.end_of_history)
            counter.dump_history_from_FB(messages, type, user_ids, offset + limit, messages_data[0].timestamp, limit, index).then(function () {
              spin.hide();
              resolve();
            });
          else
            counter.dump_history_done(messages, index, user_ids).then(function () {
              spin.hide();
              resolve();
            });
        });
      });
    });
  },

  dump_history_done : function (messages, index, user_ids) {
    return new Promise(function (resolve) {
      var msg_own_count = 0;
      var msg_other_count = 0;
      var char_own_count = 0;
      var char_other_count = 0;
      messages.forEach(function (e) {
        if (e.author.replace('fbid:', "") == counter.userid) {
          msg_own_count++;
          if (e.body)
            char_own_count += e.body.length;
        } else {
          msg_other_count++;
          if (e.body)
            char_other_count += e.body.length;
        }
      });
      myBarChart[0].data.datasets[0].data[index] = msg_own_count;
      myBarChart[0].data.datasets[1].data[index] = msg_other_count;
      myBarChart[0].data.datasets[2].data[index] = undefined;
      myBarChart[0].update();
      myBarChart[1].data.datasets[0].data[index] = char_own_count;
      myBarChart[1].data.datasets[1].data[index] = char_other_count;
      myBarChart[1].update();
      resolve();
      db.setup(user_ids, messages);
    });
  },

  setup_receiver : function () {
    return new Promise(function (solve) {
      chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.token && message.userid) {
          if (counter.token)
            return;
          counter.token = message.token;
          counter.userid = message.userid;

          var title_name = chrome.i18n.getMessage("extName");
          var btn_text = chrome.i18n.getMessage("DownloadAllHistory");
          var html_str = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title_name + '</title></head><body><button id="dl_all">' + btn_text + '</button>提示：雙擊圖表中的長柱，可匯入該訊息歷史紀錄。 提示2：對長柱右鍵，可下載歷史訊息。<canvas id="chart_msg" width="500" height="250"></canvas><canvas id="chart_char" width="500" height="250"></canvas></script></body></html>';
          document.write(html_str);
          setup_spin_lib(window);
          window.stop();

          spin.setup_spinner();
          spin.show();

          ctx[0] = document.getElementById("chart_msg");
          ctx[1] = document.getElementById("chart_char");
          solve();

          var data_json = {
            "inbox[offset]" : 0,
            "inbox[limit]" : 1000,
            "inbox[filter]" : undefined, // empty or 'unread'
            fb_dtsg : counter.token,
            __a : 1,
            counter : 'true'
          };
          counter.xhr("/threadlist_info.php?dpr=1", data_json, function (response) {
            response.text().then(function (text) {
              var json = counter.res_tranformat_to_JSON(text);
              console.log(json);
              counter.res_handle(json).then(function (charrooms) {
                console.log(charrooms);
                counter.data_handle(charrooms).then(function (charrooms) {
                  console.log("First render done!!");
                  var charrooms_sorted = charrooms.sort(function (a, b) {
                      return b.count - a.count;
                    });
                  console.log(charrooms_sorted);
                  counter.dump_history_from_DB(charrooms).then(function () {
                    spin.hide();
                  });
                });
              });
            });
          });
        } else if (message.info === "click_contextMenu" && message.tab) {
          spin.show();
          var tab = message.tab;
          var bar = counter.last_right_click_bar;
          var index = counter.last_right_click_bar_index;
          if (bar !== undefined) {
            counter.download_history(bar, index);
          }
        }
      });
    });
  },

  download_history : function (bar, index) {
    var other_fbid = bar.fbid;
    var other_name = bar.name;
    db.get_history(other_fbid).then(function (messages) {
      var html = document.createElement("html");
      html.innerHTML = '<head><meta charset="UTF-8" /></head><body></body>';
      var body = html.getElementsByTagName("body")[0];
      for (var i in messages) {
        var msg = messages[i];
        var content = msg.body;

        var div = document.createElement("div");
        var div_box = document.createElement("div");
        div_box.innerText = content;
        div.classList = 'outer';
        div.appendChild(div_box);

        if (msg.author.replace('fbid:', "") == counter.userid) {
          div_box.style['text-align'] = 'right';
          div_box.style['color'] = 'white';
          div_box.style["background-color"] = "#2fc1c1";
          div_box.classList = 'box_r';
          div_box.id = msg.timestamp;
          div_box.title = msg.timestamp_datetime;
        } else {
          div_box.style["background-color"] = "#c0e298";
          div_box.classList = 'box_l';
          div_box.id = msg.timestamp;
          div_box.title = msg.timestamp_datetime;
        }
        body.appendChild(div);
      }
      var tmp = document.createElement("div");
      tmp.appendChild(html);
      var html_str = tmp.innerHTML;
      function padLeft(str, len) {
        str = '' + str;
        if (str.length >= len) {
          return str;
        } else {
          return padLeft("0" + str, len);
        }
      }
      var date = new Date();
      var time = (date.getYear() + 1900) + padLeft(date.getMonth(), 2) + padLeft(date.getDate(), 2)
      download(html_str, other_name + "-" + time + ".html", "text/html");
      spin.hide();
    }, function () {
      spin.hide();
      chart.chart_flash(index).then(function () {
        chart.chart_flash(index);
      });
    });
  },

  data_json_history : function (token) {
    this.fb_dtsg = token;
    this.client = "mercury";
    this.__a = 1;
    this.counter = 'true';
  },

  /**
   * url: req url
   * data_json: req body
   * callback: the function you need to handle the response
   */
  xhr : function (url, data_json, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', req_url_root + url);
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    xhr.onprogress = function (event) {
      //console.log(event, event.lengthComputable);
    };
    xhr.onload = function () {
      callback({
        text : function () {
          return new Promise(function (solve) {
            solve(xhr.responseText);
          });
        }
      });
    };
    xhr.send(counter.json2urlencode(data_json));
    /*fetch(req_url_root + url, {
    headers : {
    'content-type' : 'application/x-www-form-urlencoded; charset=utf-8',
    'x-msgr-region' : 'ATN'
    },
    mode : 'cors',
    method : "POST",
    credentials : 'include',
    cache : 'default',
    body : counter.json2urlencode(data_json)
    }).then(callback);*/
  },

  res_tranformat_to_JSON : function (text) {
    var res = text.replace(/^for \(;;\);/, '');
    return JSON.parse(res);
  },

  data_handle : function (responseData) {
    return new Promise(function (solve) {
      counter.data = responseData = responseData.splice(0, display_max);
      var labels = [],
      values = [];
      responseData.forEach(function (d) {
        labels.push(d.name);
        values.push(d.count);
      });

      chart.msg_chart_render(labels, values);
      chart.char_chart_render(labels, values);

      ctx[0].ondblclick = function (e) {
        var bar = myBarChart[0].getElementAtEvent(e)[0];
        if (bar) {
          counter.dump_history_from_FB([], "thread_fbids", responseData[bar._index].fbid, 0, "", 20000, bar._index);
        }
      };

      ctx[0].oncontextmenu = function (e) {
        var bar = myBarChart[0].getElementAtEvent(e)[0];
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

  res_handle : function (json) {
    return new Promise(function (solve) {
      var threads = json.payload.threads;
      var list = threads.sort(function (a, b) {
          return b.message_count - a.message_count
        });
      var participants = json.payload.participants;
      var rList = list.map(function (obj) {
          var rObj = {};
          var thread_fbid = obj.thread_fbid;
          var other_fbid = obj.other_user_fbid;
          var other_side = counter.find_other_side(participants, other_fbid);
          if (obj.other_user_fbid) { //personal room
            rObj.name = other_side.name;
            rObj.fbid = thread_fbid;
            rObj.count = obj.message_count;
            return rObj;
          } else { //group room
            rObj.name = obj.name; // Group name.
            rObj.fbid = thread_fbid;
            rObj.count = obj.message_count;
            return rObj;
          }
        });
      solve(rList)
    });
  },

  find_other_side : function (participants, fbid) {
    return participants.find(function (e) {
      return e.fbid == fbid;
    });
  },

  json2urlencode : function (data_json) {
    return Object.keys(data_json).map(function (key) {
      return encodeURIComponent(key) + ((data_json[key] !== undefined) ? ('=' + encodeURIComponent(data_json[key])) : '');
    }).join('&');
  },

  send_to_background : function (data) {
    chrome.runtime.sendMessage(data, function (response) {
      if (response.status === 'suc');
      //window.close();
    });
  }

};

var chart = {
  msg_chart_render : function (labels, values) {
    function color_array(color) {
      var colors = Array(display_max).fill(color, 0, display_max);
      return colors;
    }
    var data = {
      labels : labels,
      datasets : [{
          label : chrome.i18n.getMessage("You"),
          backgroundColor : color_array("rgba(100,0,0,0.7)"),
          borderColor : [].fill("rgba(220,220,220,1)"),
          data : []
        }, {
          label : chrome.i18n.getMessage("OtherPeople"),
          backgroundColor : color_array("rgba(0,100,0,0.7)"),
          borderColor : [].fill("rgba(220,220,220,1)"),
          data : []
        }, {
          label : chrome.i18n.getMessage("Total"),
          backgroundColor : color_array("rgba(151,187,245,0.8)"),
          borderColor : [].fill("rgba(220,220,220,0.5)"),
          data : values
        }
      ],
      borderWidth : 1
    };
    var options = {
      responsive : true,
      scales : {
        yAxes : [{
            type : 'linear',
            position : "left",
            stacked : true,
            gridLines : {},
            scaleLabel : {
              display : true
            },
            ticks : {
              beginAtZero : true
            }
          }
        ],
        xAxes : [{
            ticks : {
              maxRotation : 90,
              minRotation : 0,
              min : 1,
              max : 1000
            },
            stacked : true
          }
        ]
      },
      title : {
        display : true,
        text : chrome.i18n.getMessage("AmountOfMessages")
      }
    };
    myBarChart[0] = new Chart(ctx[0], {
        type : 'bar',
        data : data,
        options : options
      });
  },

  char_chart_render : function (labels) {
    var data = {
      labels : labels,
      datasets : [{
          label : chrome.i18n.getMessage("You"),
          backgroundColor : "rgba(100,0,0,0.7)",
          borderColor : "rgba(220,220,220,1)",
          data : []
        }, {
          label : chrome.i18n.getMessage("OtherPeople"),
          backgroundColor : "rgba(0,100,0,0.7)",
          borderColor : "rgba(220,220,220,1)",
          data : []
        }
      ],
      borderWidth : 1
    };
    var options = {
      responsive : true,
      scales : {
        yAxes : [{
            type : 'linear',
            position : "left",
            stacked : true,
            gridLines : {},
            scaleLabel : {
              display : true
            },
            ticks : {
              beginAtZero : true
            }
          }
        ],
        xAxes : [{
            ticks : {
              maxRotation : 90,
              minRotation : 0,
              min : 1,
              max : 1000
            },
            stacked : true
          }
        ]
      },
      title : {
        display : true,
        text : chrome.i18n.getMessage("AmountOfCharacters")
      }
    };
    myBarChart[1] = new Chart(ctx[1], {
        type : 'bar',
        data : data,
        options : options
      });
  },

  chart_flash : function (index) {
    return new Promise(function (solve) {
      for (var i = 0; i < 3; i++) {
        var color = myBarChart[0].data.datasets[i].backgroundColor[index];
        myBarChart[0].data.datasets[i].backgroundColor[index] = color.replace(/\d\.\d\)$/, '0.1)');
        myBarChart[0].update();
        setTimeout(function (i) {
          var color = myBarChart[0].data.datasets[i].backgroundColor[index];
          myBarChart[0].data.datasets[i].backgroundColor[index] = color.replace(/\d\.\d\)$/, '0.8)');
          myBarChart[0].update();
          setTimeout(function () {
            solve()
          }, 150)
        }, 150, i)
      }
    });
  }
};

var db = {
  dbName : 'msg_history',
  request : undefined,

  openDB : function (suc, fail) {
    db.request = indexedDB.open(db.dbName);
    db.request.onsuccess = suc;
    db.request.onerror = fail;
  },

  error_handle : function (e) {
    console.error(e);
  },

  setup : function (OS_name, data) {
    db.openDB(function (event) {
      var database = event.target.result;
      var version = parseInt(event.target.result.version);
      database.close();
      var request = indexedDB.open(db.dbName, version + 1);

      request.onupgradeneeded = function (event) {
        var db = event.target.result;

        if (db.objectStoreNames.contains(OS_name))
          db.deleteObjectStore(OS_name);

        var objStore = db.createObjectStore(OS_name, {
            autoIncrement : true
          });
        for (var i in data) {
          objStore.add(data[i]);
        }
      }
    }, db.error_handle);
  },

  create_user : function (OS_name, data) {
    db.openDB(function (event) {
      var transaction = db.transaction([OS_name]);
      var objectStore = transaction.objectStore(OS_name);
      for (var i in data) {
        var request = objectStore.add(data[i]);
        request.onsuccess = function (event) {};
      }
    }, db.error_handle);
  },

  get_history : function (user) {
    return new Promise(function (solve, reject) {
      db.openDB(function (event) {
        var db = event.target.result;
        try {
          var transaction = db.transaction([user]);
          transaction.onerror = function (e) {
            console.error(e);
            reject();
          };
          var objectStore = transaction.objectStore(user);
          var request = objectStore.getAll();
          request.onerror = db.error_handle;
          request.onsuccess = function (event) {
            solve(request.result);
          };
        } catch (e) {
          console.error(e);
          console.log(user);
          reject(user.fbid);
        }
      }, db.error_handle);
    });
  }
};

var spin = {
  spinner : undefined,
  job_num : 0,

  setup_spinner : function () {
    var opts = {
      lines : 13,
      length : 28,
      width : 14,
      radius : 42,
      scale : 1,
      corners : 1,
      color : '#000',
      opacity : 0.25,
      rotate : 0,
      direction : 1,
      speed : 1,
      trail : 60,
      fps : 20,
      zIndex : 2e9,
      className : 'spinner',
      top : '50%',
      left : '50%',
      shadow : false,
      hwaccel : false,
      position : 'absolute'
    };
    var target = document.body;
    spin.spinner = new Spinner(opts);
  },

  show : function () {
    spin.job_num++;
    spin.spinner.spin(document.body);
  },

  hide : function () {
    spin.job_num--;
    if (spin.job_num === 0)
      spin.spinner.spin();
  }
}

var first = false;
if (location.hash === '#counter-for-messenger') {
  if (location.pathname === '/login.php' && location.search === "?next=https%3A%2F%2Fwww.messenger.com%2Ft%2F1070726462942749%2F") {
    location = location.href.replace(/#/, '%23');
    alert('Please login the messenger.');
  } else if (location.pathname.search(/\/t\//) !== -1) {
    counter.main();
  }
}
