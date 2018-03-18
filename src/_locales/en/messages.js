module.exports = {
  // Extension information
  extName: { message: 'Counter for Messenger' },
  extDescription: { message: 'Count and rank your friends by analysing your Messenger! Check out and download the messaging history of you and your best friends!' },
  unofficial: { message: 'Unofficial' },

  // Router
  listPage: { message: 'List' },
  chartPage: { message: 'Chart' },
  shareOnFacebook: { message: 'Share on Facebook' },

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
  editNicknameTitle: { message: 'Edit Nickname' }, // ThreadList/DetailTemplate
  editNicknameContent: { message: 'Everyone in this conversation will see this.' }, // ThreadList/DetailTemplate
  iSee: { message: 'Got it!' },
  ok: { message: 'OK' },
  sure: { message: 'Sure!!' },
  refresh: { message: 'Refresh' },
  cancel: { message: 'Cancel' },

  // About Page
  support: { message: 'Support' },
  support1Title: { message: 'Found a bug? Got a question or new idea?' },
  support1Content: {
    message: 'Why don\'t you send us a <a href="$url$" target="_blank">report</a>?',
    placeholders: { url: { content: '$1' } }
  },
  support2Title: { message: 'Like this extension?' },
  support2Content: {
    message: 'Let us know on <a href="$url$" target="_blank">Chrome web store</a>!',
    placeholders: { url: { content: '$1' } }
  },
  support3Title: { message: 'Want to add feature or help translating?' },
  support3Content: {
    message: 'Why not fork in <a href="$github$" target="_blank">github</a>? 😄',
    placeholders: { github: { content: '$1' } }
  },
  QA: { message: 'Frequently Asked Questions' },
  QA1Title: { message: 'Is my information safe?' },
  QA1Content: { message: 'This extension only fetches your data from Messenger to your local device. If your device is not public, your information is safe. On the other hand, if you\'re using a public device, be sure to remove this extension after you finish using this extension. ' },
  QA2Title: { message: 'How can I help Counter of Messenger?' },
  QA2Content: {
    message: 'You can <a href="$donation_url$" target="_blank">donate</a> to support our work. You can tell others to try Counter of Messenger. And, if you\'re technically-savvy, you can <a href="$beta_url$" target="_blank">use our beta version</a> and help us find bugs before they\'re released to the public.',
    placeholders: { donation_url: { content: '$1' }, beta_url: { content: '$2' } }
  },
  QA3Title: { message: 'How to switch FB account?' },
  QA3Content: { message: 'Just changing your account in Facebook page and reload this extension page.' },
  note: { message: 'Note' },
  noteContent: { message: 'It\'a web extension you know. Inspired by the fact that I want to know how many messages I have with my best friends. In the beginning it was just a little project. Very simple and ugly. But recently, more and more users installed this extension, and encouraged me to develop it further. I don\'t want to disappoint them. So I\'ve updated this project, Making it more powerful and beautiful. If you really like this extension, tell me. I would very happy. 😄😄😄 Thanks everyone. ' },

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
  participants: { message: 'Participants' },
  generateSharingImage: { message: 'Generate Shaing Image' },
  shareToFb: { message: 'Share on Facebook' },
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

  // Sharing dialog
  countPrefix: { message: 'They have' },
  countPostfix: { message: 'messages!!' },
  rank: {
    message: '$friend$ is #$rank$ of $self$\'s friends',
    placeholders: { friend: { content: '$1' }, rank: { content: '$2' }, self: { content: '$3' } }
  },
  generatedByPrefix: { message: 'generated by' },
  generatedByPostfix: { message: '' },

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
