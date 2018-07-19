module.exports = {
    // 扩充套件资讯
    extName: { message: 'Messenger 计数器' },
    extDescription: { message: '统计并排名你在 Messenger 中与朋友的讯息量！也可以顺便打包下载讯息记录。 ' },
    unofficial: { message: '非官方' },
    
    // 路由
    listPage: { message: '清单' },
    chartPage: { message: '图表' },
    shareOnFacebook: { message: '分享至 Facebook' },
    
    // Loading 讯息
    interceptingToken: { message: '取得权杖中...' },
    fetchingThreads: { message: '抓取讯息总数中...' },
    fetchingMessages: { message: '抓取讯息中...' },
    rendering: { message: '渲染中...' },
    waitingForLogin: { message: '等待登入中...' },
    
      // 提醒视窗
      openingAlertTitle: { message: '请保持耐心' },
      openingAlertContent: { message: '从 FB 捞取资料可能会花费许多时间。 ' },
      resetConfirmTitle: { message: '确定？ ' },
      resetConfirmContent: { message: '你确定要清除所有快取资料？ ' },
      error: { message: '错误' },
      cannotDetectLoginContent: { message: '无法侦测登入 Facebook。 ' },
      editNicknameTitle: { message: '编辑昵称' }, // ThreadList/DetailTemplate
      editNicknameContent: { message: '此对话中的所有人都会看到这个。 ' }, // ThreadList/DetailTemplate
      iSee: { message: '我了解' },
      ok: { message: '确定' },
      sure: { message: '确定' },
      refresh: { message: '重新整理' },
      cancel: { message: '取消' },
    
      // ‘关于’ 页面
      support: { message: '支援' },
      support1Title: { message: '发现错误？或是有新的点子？ ' },
      support1Content: {
        message: '来<a href="$url$" target="_blank">这里</a>回报吧。 ',
        placeholders: { url: { content: '$1' } }
      },
      support2Title: { message: '喜欢这支扩充功能吗？ ' },
      support2Content: {
        message: '在 <a href="$url$" target="_blank">Chrome web store</a> 上评论来让我知道吧。 😄',
        placeholders: { url: { content: '$1' } }
      },
      support3Title: { message: '想协助新增功能或是新增翻译？ ' },
      support3Content: {
        message: '为何不干脆在 <a href="$github$" target="_blank">github</a> 上 fork 一份回来改呢？ ',
        placeholders: { github: { content: '$1' } }
      },
      QA: { message: '常见问题' },
      QA1Title: { message: '我的资讯安全吗？ ' },
      QA1Content: { message: '甭担心，这支扩充功能仅会替您将资料从Messenger 抓到您的本机装置中，如果您使用的是公共装置，建议离开前将此扩充功能删除，或是按下「重置」钮并关闭页面。 ' },
      QA2Title: { message: '如何帮助这支扩充功能？ ' },
      QA2Content: {
        message: '欢迎各种<a href="$donation_url$" target="_blank">捐款</a>来协助我提神改程式XD，或是告诉其他朋友来使用它；如果你也是个开发者或是热爱新科技，欢迎使用<a href="$beta_url$" target="_blank">公开测试版本</a>来协助我们在正式发布前，找到错误。 ',
        placeholders: { donation_url: { content: '$1' }, beta_url: { content: '$2' } }
      },
      QA3Title: { message: '如何变更 Facebook 帐号' },
      QA3Content: { message: '只要打开 Facebook 页面，登出并使用另一个帐号登入，再重新整理或开启这个页面就可以啰。 ' },
      note: { message: '作者的话' },
      noteContent: { message: '首先，这是一个扩充功能你知道的，启发自我想知道，我跟「朋友」们之间有多少讯息量，所以才开始着手这套小小的专案，刚开始时非常阳春且难看，但是到了最近越来越多人安装使用，鼓励了我继续开发维护改进它，当然尔我不会辜负各位，未来为持续更新这个专案，让它有更多功能。最后，如果你欢这支扩充功能，欢迎给予5星评价，我会很开心的XDDD，谢谢各位。 ' },
    
      // 清单 页面
      threadName: { message: '名称' },
      threadType: { message: '种类' },
      threadTag: { message: '标签' },
      threadMessageCount: { message: '讯息数量' },
      threadCharacterCount: { message: '文字数量' },
      threadOperation: { message: '操作' },
      importMessageHistory: { message: '载入讯息记录' },
      importedMessageHistory: { message: '已载入' },
      downloadMessageHistory: { message: '储存/下载讯息记录' },
      totalMessageCount: { message: '总计讯息数量' },
      user: { message: '用户' },
      fanpage: { message: '粉丝专页' },
      group: { message: '群组' },
      inbox: { message: '收件匣' },
      archived: { message: '封存' },
      pending: { message: '陌生' },
      unknown: { message: '未知' },
      fetchDetailOfselected: { message: '载入所选讯息的记录' },
      reset: { message: '清除所有资料' },
      searchInputLabel: { message: '搜寻' },
      searchInputPlaceholder: { message: '请输入关键字' },
      edit: { message: '编辑' },
      emoji: { message: '表情符号' },
      color: { message: '颜色' },
      participants: { message: '成员' },
      generateSharingImage: { message: '产生分享图' },
      shareToFb: { message: '分享到 Facebook' },
      // MuteUntil 元件
      muteUntil: { message: '关闭通知直到' },
      muteForever: { message: '世界末日' },
      unmute: { message: '开启通知' },
      minutes: { message: '分钟' },
      hour: { message: '小时' },
      hours: { message: '小时' },
      day: { message: '天' },
      week: { message: '周' },
      month: { message: '个月' },
      always: { message: '永远' },
    
      // 图表 页面
      operationBar: { message: '工具栏' },
      drapToLookOtherUsers: { message: '滑动以查看其他排名' },
      showDetail: { message: '显示详细' },
      showTotal: { message: '显示总和' },
      showMessage: { message: '显示讯息数量' },
      showCharacter: { message: '显示文字数量' },
      detail: { message: '详细' },
      total: { message: '总共' },
      message: { message: '讯息数量' },
      character: { message: '文字数量' },
      me: { message: '我' },
      other: { message: '其他人' },
    
      // 分享对话视窗
      countPrefix: { message: 'Ta们之间有' },
      countPostfix: { message: ' 则讯息！！' },
      rank: {
        message: '$friend$ 是 $self$ 好友之中的第 $rank$ 名',
        placeholders: { self: { content: '$1' }, rank: { content: '$2' }, friend: { content: '$3' } }
      },
      generatedByPrefix: { message: '使用' },
      generatedByPostfix: { message: '统计' },
      download: { message: '下载' },
    
      // 错误讯息
      fetchError: { message: '啊！捞取资料时发生错误。 ' },
      contactDevelper: { message: '请联系开发者以解决问题。 ' },
      loginRequired: { message: '请先登入您的 Facebook。 ' },
    
      // 符号
      comma: { message: '、' },
      colon: { message: '：' },
    
      // Thread 物件
      others: { message: '其他$1个人' },
    
      // Content 脚本的提示讯息
    loginAlert: { message: '请登入 Messenger 网页版以统计您的讯息。 ' }
}