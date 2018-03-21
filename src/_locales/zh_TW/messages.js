module.exports = {
  // 擴充套件資訊
  extName: { message: 'Messenger 計數器' },
  extDescription: { message: '統計並排名你在 Messenger 中與朋友的訊息量！也可以順便打包下載訊息記錄。' },
  unofficial: { message: '非官方' },

  // 路由
  listPage: { message: '清單' },
  chartPage: { message: '圖表' },
  shareOnFacebook: { message: '分享至 Facebook' },

  // Loading 訊息
  interceptingToken: { message: '取得權杖中...' },
  fetchingThreads: { message: '抓取訊息總數中...' },
  fetchingMessages: { message: '抓取訊息中...' },
  rendering: { message: '渲染中...' },
  waitingForLogin: { message: '等待登入中...' },

  // 提醒視窗
  openingAlertTitle: { message: '請保持耐心' },
  openingAlertContent: { message: '從 FB 撈取資料可能會花費許多時間。' },
  resetConfirmTitle: { message: '確定？' },
  resetConfirmContent: { message: '你確定要清除所有快取資料？' },
  error: { message: '錯誤' },
  cannotDetectLoginContent: { message: '無法偵測登入 Facebook。' },
  editNicknameTitle: { message: '編輯暱稱' }, // ThreadList/DetailTemplate
  editNicknameContent: { message: '此對話中的所有人都會看到這個。' }, // ThreadList/DetailTemplate
  iSee: { message: '我瞭解' },
  ok: { message: '確定' },
  sure: { message: '確定' },
  refresh: { message: '重新整理' },
  cancel: { message: '取消' },

  // About Page
  support: { message: '支援' },
  support1Title: { message: '發現錯誤？或是有新的點子？' },
  support1Content: {
    message: '來<a href="$url$" target="_blank">這裡</a>回報吧。',
    placeholders: { url: { content: '$1' } }
  },
  support2Title: { message: '喜歡這支擴充功能嗎？' },
  support2Content: {
    message: '在 <a href="$url$" target="_blank">Chrome web store</a> 上評論來讓我知道吧。😄',
    placeholders: { url: { content: '$1' } }
  },
  support3Title: { message: '想協助新增功能或是新增翻譯？' },
  support3Content: {
    message: '為何不乾脆在 <a href="$github$" target="_blank">github</a> 上 fork 一份回來改呢？',
    placeholders: { github: { content: '$1' } }
  },
  QA: { message: '常見問題' },
  QA1Title: { message: '我的資訊安全嗎？' },
  QA1Content: { message: '甭擔心，這支擴充功能僅會替您將資料從 Messenger 抓到您的本機裝置中，如果您使用的是公共裝置，建議離開前將此擴充功能刪除，或是按下「重置」鈕並關閉頁面。' },
  QA2Title: { message: '如何幫助這支擴充功能？' },
  QA2Content: {
    message: '歡迎各種<a href="$donation_url$" target="_blank">捐款</a>來協助我提神改程式XD，或是告訴其他朋友來使用它；如果你也是個開發者或是熱愛新科技，歡迎使用 <a href="$beta_url$" target="_blank">公開測試版本</a>來協助我們在正式發布前，找到錯誤。',
    placeholders: { donation_url: { content: '$1' }, beta_url: { content: '$2' } }
  },
  QA3Title: { message: '如何變更 Facebook 帳號' },
  QA3Content: { message: '只要打開 Facebook 頁面，登出並使用另一個帳號登入，再重新整理或開啟這個頁面就可以囉。' },
  note: { message: '作者的話' },
  noteContent: { message: '首先，這是一個擴充功能你知道的，啟發自我想知道，我跟「朋友」們之間有多少訊息量，所以才開始著手這套小小的專案，剛開始時非常陽春且難看，但是到了最近越來越多人安裝使用，鼓勵了我繼續開發維護改進它，當然爾我不會辜負各位，未來為持續更新這個專案，讓它有更多功能。最後，如果你歡這支擴充功能，歡迎給予5星評價，我會很開心的XDDD，謝謝各位。' },

  // 清單
  threadName: { message: '名稱' },
  threadType: { message: '種類' },
  threadTag: { message: '標籤' },
  threadMessageCount: { message: '訊息數量' },
  threadCharacterCount: { message: '文字數量' },
  threadOperation: { message: '操作' },
  importMessageHistory: { message: '載入訊息記錄' },
  importedMessageHistory: { message: '已載入' },
  downloadMessageHistory: { message: '儲存/下載訊息記錄' },
  totalMessageCount: { message: '總計訊息數量' },
  user: { message: '用戶' },
  fanpage: { message: '粉絲專頁' },
  group: { message: '群組' },
  inbox: { message: '收件匣' },
  archived: { message: '封存' },
  pending: { message: '陌生' },
  unknown: { message: '未知' },
  fetchDetailOfselected: { message: '載入所選訊息的記錄' },
  reset: { message: '清除所有資料' },
  searchInputLabel: { message: '搜尋' },
  searchInputPlaceholder: { message: '請輸入關鍵字' },
  edit: { message: '編輯' },
  emoji: { message: '表情符號' },
  color: { message: '顏色' },
  participants: { message: '成員' },
  generateSharingImage: { message: '產生分享圖' },
  shareToFb: { message: '分享到 Facebook' },
  // MuteUntil 元件
  muteUntil: { message: '關閉通知直到' },
  muteForever: { message: '世界末日' },
  unmute: { message: '開啟通知' },
  minutes: { message: '分鐘' },
  hour: { message: '小時' },
  hours: { message: '小時' },
  day: { message: '天' },
  week: { message: '週' },
  month: { message: '個月' },
  always: { message: '永遠' },

  // 圖表
  operationBar: { message: '工具欄' },
  drapToLookOtherUsers: { message: '滑動以查看其他排名' },
  showDetail: { message: '顯示詳細' },
  showTotal: { message: '顯示總和' },
  showMessage: { message: '顯示訊息數量' },
  showCharacter: { message: '顯示文字數量' },
  detail: { message: '詳細' },
  total: { message: '總共' },
  message: { message: '訊息數量' },
  character: { message: '文字數量' },
  me: { message: '我' },
  other: { message: '其他人' },

  // 分享對話視窗
  countPrefix: { message: '他們之間有' },
  countPostfix: { message: '  則訊息！！' },
  rank: {
    message: '$friend$ 是 $self$ 好友之中的第 $rank$ 名',
    placeholders: { self: { content: '$1' }, rank: { content: '$2' }, friend: { content: '$3' } }
  },
  generatedByPrefix: { message: '使用' },
  generatedByPostfix: { message: '統計' },
  download: { message: '下載' },

  // 錯誤訊息
  fetchError: { message: '啊！撈取資料時發生錯誤。' },
  contactDevelper: { message: '請聯絡開發者以解決問題。' },
  loginRequired: { message: '請先登入您的 Facebook。' },

  // 符號
  comma: { message: '、' },
  colon: { message: '：' },

  // Thread 物件
  others: { message: '其他$1個人' },

  // Content 腳本的提示訊息
  loginAlert: { message: '請登入 Messenger 網頁版以統計您的訊息。' }
}
