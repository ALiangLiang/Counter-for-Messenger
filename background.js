var ranking = [];
var background = {

  setup_package_listener : function () {
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
      var str = background.arrayBuffer2utf8(details.requestBody.raw[0].bytes);
      var url = background.url_decode(str);
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

  setup_ranking_receiver : function () {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.ranking) {
        console.log(request.ranking)
        ranking = request.ranking;
      } else if (request.cmd) {
        if (request.cmd === 'request_data') {
          console.log('receive_request_data');
          sendResponse(ranking);
        }
      }
    });
  }

};

var page_action = {
  setup_page_action : function () {
    var rule = {
      conditions : [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl : {
            hostEquals : 'www.messenger.com',
            schemes : ['https']
          }
        })
      ],
      actions : [new chrome.declarativeContent.ShowPageAction()]
    };
    chrome.runtime.onInstalled.addListener(function (details) {
      chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([rule]);
      });
    });
    chrome.tabs.query({}, function (tabs) {
      for (var i in tabs)
        chrome.pageAction.show(tabs[i]);
    });
    chrome.pageAction.onClicked.addListener(function (tab) {
      chrome.pageAction.show(tab.id);
      chrome.windows.create({
        url : "analysis.html",
        width : 1080,
        height : 700
      });
    });

  }
};

page_action.setup_page_action();
background.setup_ranking_receiver();
background.setup_package_listener();
