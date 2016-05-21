var ranking = [];
var background = {

  setup_package_listener : function () {
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
      var str = background.arrayBuffer2utf8(details.requestBody.raw[0].bytes);
      var url = background.url_decode(str);
      console.log(url);
      if (url.match(/counter=true/)) {
        console.log('It\'s form extension.');
        return;
      }
      var token = background.toke_out_token(url);
      background.send_to_tabs(token);
    }, {
      urls : ["*://www.messenger.com/ajax/mercury/threadlist_info.php?dpr=1"]
    }, ['requestBody']);
  },

  arrayBuffer2utf8 : function (bytes) {
    return String.fromCharCode.apply(null, new Uint8Array(bytes));
  },

  url_decode : function (str) {
    return decodeURIComponent(str);
  },

  toke_out_token : function (url) {
    var matches = url.match(/fb_dtsg=.*:/);
    if (matches !== null)
      return matches[0].replace(/^fb_dtsg=/, "");
    else {
      console.error('Token not found');
      return "";
    }
  },

  send_to_tabs : function (token) {
    chrome.tabs.query({}, function (tabs) {
      for (var i in tabs)
        chrome.tabs.sendMessage(tabs[i].id, {
          token : token
        }, function (response) {});
    });
  },

  create_analysis_page : function () {
    chrome.windows.create({
      url : "analysis.html",
      width : 1080,
      height : 700
    });
  },

  setup_ranking_receiver : function () {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.ranking) {
        console.log(request.ranking)
        ranking = request.ranking;
        background.create_analysis_page();
        sendResponse({
          status : 'suc'
        });
      } else if (request.cmd) {
        if (request.cmd === 'request_data') {
          console.log('receive_request_data');
          sendResponse(ranking);
        }
      }
    });
  }

};

var browser_action = {
  setup_browser_action : function () {
    chrome.browserAction.onClicked.addListener(function (tab) {
      window.open('https://www.messenger.com/t/895691373877847/#counter-for-messenger');
    });

  }
};

browser_action.setup_browser_action();
background.setup_ranking_receiver();
background.setup_package_listener();
