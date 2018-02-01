let Token = null
// let UserId = null

/**
 * 接收從 background 來的 token 等資訊。
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.token && message.userid) {
    if (Token) { return }
    Token = message.token
    // UserId = message.userid
    const dataJson = {
      fb_dtsg: Token,
      __a: 1,
      counter: 'true',
      queries: {
        o0: {
          doc_id: '1780638668674992',
          query_params: {
            limit: 5000,
            before: 9999999999999,
            tags: ['INBOX'],
            includeDeliveryReceipts: true,
            includeSeqID: false
          }
        }
      }
    }

    try {
      const response = await fetch('/api/graphqlbatch/', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: JSON.stringify(dataJson)
      })
      console.log(response)
    } catch (err) {
      console.error(err)
    }

    // counter.xhr('/api/graphqlbatch/', dataJson, function (response) {
    //   response.text()
    //     .then((text) => counter.res_tranformat_to_JSON(text))
    //     .then((json) => counter.res_handle(json))
    //     .then((chatrooms) => {
    //       counter.data_handle(chatrooms) // Render chartbar with total messages.
    //         .then(() => db.update_objectstores(chatrooms.map((chatroom) => chatroom.fbid))) // Update DB schema.
    //         .then(() => {
    //           console.info('First render done!!')
    //           toastr['info'](chrome.i18n.getMessage('toast_loading_from_local'))
    //           return counter.dump_history_from_DB(chatrooms) // Render chartbar with local DB data.
    //         })
    //         .then(() => spin.hide())
    //     })
    // })
  }
})
