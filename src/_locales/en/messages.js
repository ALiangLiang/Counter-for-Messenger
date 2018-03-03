module.exports = {
  // Extension information
  extName: { message: 'Counter for Messenger' },
  extDescription: { message: 'Count and rank your friends by analysing your Messenger! Check out and download the messaging history of you and your best friends!' },

  // Router
  listPage: { message: 'List' },
  chartPage: { message: 'Chart' },

  // Message of loading
  interceptingToken: { message: 'Extracting token...' },
  fetchingThreads: { message: 'Fetching threads...' },
  fetchingMessages: { message: 'Fetching messages...' },
  rendering: { message: 'Rendering...' },
  waitingForLogin: { message: 'Waiting for log in...' },

  // Alert model
  openingAlertTitle: { message: 'Please be patient' },
  openingAlertContent: { message: 'Fetching data from FB may take a long time.' },
  iSee: { message: 'Got it!' },
  sure: { message: 'Sure!!' },
  cancel: { message: 'Cancel' },

  // List Page
  threadName: { message: 'Name' },
  threadType: { message: 'Type' },
  threadTag: { message: 'Tag' },
  threadMessageCount: { message: 'Messages' },
  threadCharacterCount: { message: 'Characters' },
  threadOperation: { message: 'Operations' },
  importMessageHistory: { message: 'Import Messages' },
  importedMessageHistory: { message: 'Imported' },
  downloadMessageHistory: { message: 'Download Messages' },
  totalMessageCount: { message: 'Total Messages' },
  user: { message: 'User' },
  fanpage: { message: 'Fanpage' },
  group: { message: 'Group' },
  inbox: { message: 'Inbox' },
  archived: { message: 'Archived' },
  pending: { message: 'Request' },
  unknown: { message: 'Unknown' },
  fetchDetailOfselected: { message: 'Import Messages of Selected Threads' },
  reset: { message: 'Reset' },
  resetConfirm: { message: 'Sure?' },
  resetConfirmTitle: { message: 'Are you sure you want to clear all cached data?' },
  searchInputLabel: { message: 'Search' },
  searchInputPlaceholder: { message: 'Keyword' },

  // Chart page
  operationBar: { message: 'Operation Bar' },
  drapToLookOtherUsers: { message: 'Drag slider to look other users.' },
  showDetail: { message: 'Show Detail' },
  showTotal: { message: 'Show Total' },
  showMessage: { message: 'Show Messages' },
  showCharacter: { message: 'Show Characters' },
  detail: { message: 'Detail' },
  total: { message: 'Total' },
  message: { message: 'Messages' },
  character: { message: 'Characters' },
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
