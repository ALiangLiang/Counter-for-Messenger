/// //////////////////////////////////////////////////////
// Let client backup(download) their messages history. //
// Dump and wrapper to a HTML page                     //
/// //////////////////////////////////////////////////////
// TODO: This function maybe broken when too much messages. Coz device resource leak.
import { Message } from 'element-ui'
import Vue from 'vue'
import JSZip from 'jszip'
import _chunk from 'lodash/chunk'
import ThreadComponenet from '../components/download/Thread.vue'
const __ = chrome.i18n.getMessage

const _errorHandler = () => {
  return Message({
    type: 'error',
    dangerouslyUseHTMLString: true,
    message: `<p><span>Oops, cannot download messages. </span>
    <a href="https://github.com/ALiangLiang/Counter-for-Messenger/issues" target="_blank">Please contact developer.</a></p>`
  })
}

export default async function downloadMessages (info, selfId) {
  if (!selfId) {
    return _errorHandler()
  }
  const zip = new JSZip()
  const folderName = __('extName')
  const padLeft = (str, len) => String(str).padStart(len, '0')
  const date = new Date()
  const time = `${date.getFullYear()}${padLeft(date.getMonth() + 1, 2)}${padLeft(date.getDate(), 2)}`
  const { messages, participants } = info
  _chunk(messages, 10000).forEach((messageChunk, i) => {
    const html = new Vue({
      components: { Thread: ThreadComponenet },
      render (h) {
        return (
          <thread messages-data={ messageChunk } participants={ participants } self-id={ selfId }></thread>
        )
      }
    }).$mount().$el
    const pageBlob = new Blob(['<!DOCTYPE html>', html.outerHTML], {type: 'text/html'})
    zip.file(`${folderName} - ${info.name} - ${time} - ${i + 1}.html`, pageBlob)
  })

  try {
    const assetBlob = await (await fetch('/assets/download.css')).blob()
    zip.file('download.css', assetBlob)
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE'
    })
    chrome.downloads.download({
      filename: `${folderName} - ${info.name} - ${time}.zip`,
      url: URL.createObjectURL(zipBlob)
    })
  } catch (err) {
    console.error(err)
    return _errorHandler()
  }
}
