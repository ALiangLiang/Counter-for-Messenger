/// //////////////////////////////////////////////////////
// Let client backup(download) their messages history. //
// Dump and wrapper to a HTML page                     //
/// //////////////////////////////////////////////////////
// TODO: This function maybe broken when too much messages. Coz device resource leak.
import { Message } from 'element-ui'
import Vue from 'vue'
import ThreadComponenet from '../components/download/Thread.vue'
const __ = chrome.i18n.getMessage

export default async function downloadMessages (info, selfId) {
  if (!selfId) {
    return Message({
      type: 'error',
      dangerouslyUseHTMLString: true,
      message: `<p><span>Oops, cannot download messages. </span>
      <a href="https://github.com/ALiangLiang/Counter-for-Messenger/issues" target="_blank">Please contact developer.</a></p>`
    })
  }
  const { messages } = info

  const html = new Vue({
    components: { Thread: ThreadComponenet },
    data: { messages, selfId },
    render (h) {
      return (
        <thread messages-data={ messages } self-id={ selfId }></thread>
      )
    }
  }).$mount().$el

  const padLeft = (str, len) => String(str).padStart(len, '0')
  const date = new Date()
  const time = `${date.getFullYear()}${padLeft(date.getMonth() + 1, 2)}${padLeft(date.getDate(), 2)}`
  const folderName = __('extName')
  const blob = new Blob(['<!DOCTYPE html>', html.outerHTML], {type: 'text/html'})
  chrome.downloads.download({
    filename: `${folderName}/${info.name}/${time}.html`,
    url: URL.createObjectURL(blob)
  })
  // download assets
  chrome.downloads.download({
    filename: folderName + '/download.css',
    url: 'chrome-extension://ldlagicdigidgnhniajpmoddkoakdoca/assets/download.css',
    conflictAction: 'overwrite'
  })
}
