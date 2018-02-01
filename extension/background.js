chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    console.info("This is a first install!");
    chrome.tabs.create({url:"firstRun.html"});
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version;
    var previousVersion = details.previousVersion
    console.info("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    if (thisVersion.replace(/\.\d*$/, '') !== previousVersion.replace(/\.\d*$/, '')) {
      chrome.tabs.create({url:"firstRun.html"});
    }
  }
});

var background = {

  token : undefined,

  setup_package_listener : function () {
    chrome.webRequest.onBeforeRequest.addListener(function (details) {
		const url = details.url;
		const token = details.requestBody.formData.fb_dtsg[0];
		const userid = details.requestBody.formData.__user[0];
      if (url.match(/counter=true/)) {
        console.log('It\'s form extension.');
        return;
      }
      background.send_to_tabs({
        token : token,
        userid : userid
      });
    }, {
      urls : ["*://www.messenger.com/api/graphqlbatch/"]
    }, ['requestBody']);
  },

  set_contextMenu : function () {
    var cm_id = chrome.contextMenus.create({
      "title" : chrome.i18n.getMessage("dl_msg"),
      "contexts" : ["all"],
      "documentUrlPatterns" : ["*://www.messenger.com/t/ALiangLiang.top/*"],
      "onclick" : function (e, tab) {
        chrome.tabs.sendMessage(tab.id, {
          info : "click_contextMenu",
          tab : tab
        }, function (response) {});
      }
    });
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

  toke_out_userid : function (url) {
    var matches = url.match(/__user=\d*/);
    if (matches !== null)
      return matches[0].replace(/^__user=/, "");
    else {
      console.error('User ID not found');
      return "";
    }
  },

  send_to_tabs : function (data) {
    chrome.tabs.query({}, function (tabs) {
      for (var i in tabs)
        chrome.tabs.sendMessage(tabs[i].id, data, function (response) {});
    });
  }

};

var browser_action = {
  setup_browser_action : function () {
    chrome.browserAction.onClicked.addListener(function (tab) {
      window.open('https://www.messenger.com/t/ALiangLiang.top#counter-for-messenger');
    });

  }
};

browser_action.setup_browser_action();
background.setup_package_listener();
background.set_contextMenu();
