module.exports = {
  // Extension information
  extName: { message: 'Counter for Messenger' },
  extDescription: { message: 'Statistics your Messenger , the number of messages with friends and rank ! ! Take a look at what you and your best friend best friends chant !' },

  // Router
  indexPage: { message: 'Index' },
  messageChart: { message: 'Chart of Messages' },
  textChart: { message: 'Chart of Text' },

  // Message of loading
  interceptingToken: { message: 'Intercept token...' },
  fetchingThreads: { message: 'Fetching threads...' },
  fetchingMessages: { message: 'Fetching messages...' },
  rendering: { message: 'Rendering...' },
  waitingForLogin: { message: 'Waiting for log in...' },

  // Alert model
  openingAlertTitle: { message: 'Please be patient' },
  openingAlertContent: { message: 'Fetch data from FB maybe take a long time.' },
  iSee: { message: 'I see!!' },
  cancel: { message: 'Cancel' },

  // Index
  threadName: { message: 'Name' },
  threadType: { message: 'Type' },
  threadMessageCount: { message: 'Messages' },
  threadTextCount: { message: 'Texts' },
  threadOperation: { message: 'Operation' },
  importMessageHistory: { message: 'Import Messages' },
  importedMessageHistory: { message: 'Imported' },
  downloadMessageHistory: { message: 'Download Messages' },
  totalMessageCount: { message: 'Total Messages' },
  user: { message: 'User' },
  fanpage: { message: 'Fanpage' },
  group: { message: 'Group' },
  unknown: { message: 'Unknown' },
  fetchDetailOfselected: { message: 'Import Messages of Selected Threads' },

  // Charts
  drapToLookOtherUsers: { message: 'Drag slider to look other users.' },
  showDetail: { message: 'Show Detail' },
  dontShowDetail: { message: 'Don\'t show Detail' },
  total: { message: 'Total' },

  // Error message
  fetchError: { message: 'Oops, cannot fetch messages.' },
  contactDevelper: { message: 'Please contact developer.' },

  // Symbol
  comma: { message: ', ' },

  // Thread Object
  others: {
    message: '$otherCount$ Others',
    placeholders: {
      otherCount: {
        content: '$1',
        example: '87 Others'
      }
    }
  },

  // ALert message of content script
  loginAlert: { message: 'Please log in to messenger to count your messages.' }
}
