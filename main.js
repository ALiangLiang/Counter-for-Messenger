var counter = {

  main : function () {
    counter.setup_receiver();
    //counter.xhr();
  },

  grab_token : function () {},

  setup_receiver : function () {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.token)
        counter.xhr(message.token);
      else if (message.cmd === refresh)
        location.reload();
    });
  },

  data_json : {
    "inbox[offset]" : 0,
    "inbox[limit]" : 100,
    "inbox[filter]" : undefined, // empty or 'unread'
    fb_dtsg : '',
    __a : 1,
    counter : 'true'
  },

  xhr : function (token) {
    counter.data_json.fb_dtsg = token;
    fetch("https://www.messenger.com/ajax/mercury/threadlist_info.php?dpr=1", {
      headers : {
        'content-type' : 'application/x-www-form-urlencoded; charset=utf-8',
        'x-msgr-region' : 'ATN'
      },
      mode : 'cors',
      method : "POST",
      credentials : 'include',
      cache : 'default',
      body : counter.json2urlencode(counter.data_json)
    }).then(counter.res_get_text);
  },

  res_get_text : function (response) {
    response.text().then(counter.res_handle)
  },

  res_handle : function (text) {
    var json = counter.res_tranformat_to_JSON(text);
    var threads = json.payload.threads;
    var list = threads.sort(function (a, b) {
        return b.message_count - a.message_count
      });
    var participants = json.payload.participants;
    var rList = list.map(function (obj) {
        var rObj = {};
        var fbid = obj.other_user_fbid;
        var match = counter.rank(participants, fbid); // Ranking by mount of messages.
        if (!fbid) { // It's a group.
          var name = obj.name; // Group name.
          var count = obj.message_count;
          rObj[name] = count;
          return rObj;
        }
        if (match) {
          var name = match.name;
          var count = obj.message_count;
          rObj[name] = count;
          return rObj;
        } else { // Its name cannot be found.
          var count = obj.message_count;
          rObj[fbid] = count;
          return rObj
        }
      });
    counter.send_to_background(rList);
  },

  rank : function (participants, fbid) {
    return participants.find(function (e) {
      return e.fbid == fbid;
    });
  },

  res_tranformat_to_JSON : function (text) {
    var res = text.replace(/^for \(;;\);/, '');
    return JSON.parse(res);
  },

  json2urlencode : function (data_json) {
    return Object.keys(data_json).map(function (key) {
      return encodeURIComponent(key) + ((data_json[key] !== undefined) ? ('=' + encodeURIComponent(data_json[key])) : '');
    }).join('&');
  },

  send_to_background : function (ranking) {
    chrome.runtime.sendMessage({
      ranking : ranking
    }, function (response) {
      if (response.status === 'suc')
        window.close()
    });
  }

};

if (location.hash === '#counter-for-messenger') {
  if (location.pathname === '/login.php' && location.search === "?next=https%3A%2F%2Fwww.messenger.com%2Ft%2F895691373877847%2F") {
    location = location.href.replace(/#/, '%23');
    alert('Please login the messenger.');
  } else if (location.pathname.search(/\/t\//) !== -1) {
    counter.main();
  }
}
