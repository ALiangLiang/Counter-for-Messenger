module.exports = {
  // Extension information
  extName: { message: 'Counter for Messenger' },
  extDescription: { message: 'Count and rank your friends or lover by analysis you Messenger!! Take a look what you and your best friend chat!!' },

  // Router
  listPage: { message: 'List' },
  chartPage: { message: 'Chart' },

  // Message of loading
  interceptingToken: { message: 'Intercept token...' },
  fetchingThreads: { message: 'Fetching threads...' },
  fetchingMessages: { message: 'Fetching messages...' },
  rendering: { message: 'Rendering...' },
  waitingForLogin: { message: 'Waiting for log in...' },

  // Alert model
  openingAlertTitle: { message: 'Please be patient' },
  openingAlertContent: { message: '1. Fetch data from FB maybe take a long time. 2. If you fetch a lot of messages in a short time, may cause some functions of your FB and Messenger could\'t be used.' },
  iSee: { message: 'Got it!' },
  cancel: { message: 'Cancel' },

  // List Page
  threadName: { message: 'Name' },
  threadType: { message: 'Type' },
  threadMessageCount: { message: 'Messages' },
  threadTextCount: { message: 'Texts' },
  threadOperation: { message: 'Operations' },
  importMessageHistory: { message: 'Import Messages' },
  importedMessageHistory: { message: 'Imported' },
  downloadMessageHistory: { message: 'Download Messages' },
  totalMessageCount: { message: 'Total Messages' },
  user: { message: 'User' },
  fanpage: { message: 'Fanpage' },
  group: { message: 'Group' },
  unknown: { message: 'Unknown' },
  fetchDetailOfselected: { message: 'Import Messages of Selected Threads' },
  searchInputLabel: { message: 'Search' },
  searchInputPlaceholder: { message: 'Keyword' },

  // Chart page
  drapToLookOtherUsers: { message: 'Drag slider to look other users.' },
  showDetail: { message: 'Show Detail' },
  showTotal: { message: 'Show Total' },
  showMessage: { message: 'Show Messages' },
  showText: { message: 'Show Texts' },
  total: { message: 'Total' },
  me: { message: 'Me' },
  other: { message: 'Other' },

  // Error message
  fetchError: { message: 'Oops, cannot fetch messages.' },
  contactDevelper: { message: 'Please contact developer.' },
  messengerIsDead: { message: 'Your Messenger is temporarily unavailable. Please take a while to use again.' },

  // Symbol
  comma: { message: ', ' },
  colon: { message: ': ' },

  // Thread Object
  others: { message: '$1 Others' },

  // ALert message of content script
  loginAlert: { message: 'Please log in to messenger to count your messages.' }
}
