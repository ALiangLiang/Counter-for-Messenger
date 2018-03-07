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
  resetConfirmTitle: { message: 'Sure?' },
  resetConfirmContent: { message: 'Are you sure you want to clear all cached data?' },
  error: { message: 'Error' },
  cannotDetectLoginContent: { message: 'Cannot detect facebook login.' },
  iSee: { message: 'Got it!' },
  sure: { message: 'Sure!!' },
  refresh: { message: 'Refresh' },
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
  searchInputLabel: { message: 'Search' },
  searchInputPlaceholder: { message: 'Keyword' },
  edit: { message: 'Edit' },
  emoji: { message: 'Emoji' },
  color: { message: 'Color' },
  // MuteUntil component
  muteUntil: { message: 'Mute until' },
  muteForever: { message: 'End of the world' },
  unmute: { message: 'Unmute' },
  minutes: { message: 'minutes' },
  hour: { message: 'hour' },
  hours: { message: 'hours' },
  day: { message: 'day' },
  week: { message: 'week' },
  month: { message: 'month' },
  always: { message: 'Always' },

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
  loginRequired: { message: 'Please login Facebook first.' },

  // Symbol
  comma: { message: ', ' },
  colon: { message: ': ' },

  // Thread Object
  others: { message: '$1 Others' },

  // ALert message of content script
  loginAlert: { message: 'Please log in to messenger to count your messages.' }
}
