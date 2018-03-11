/// //////////////////////////////////////////////////////
// Let client backup(download) their messages history. //
// Dump and wrapper to a HTML page                     //
/// //////////////////////////////////////////////////////
// TODO: This function maybe broken when too much messages. Coz device resource leak.
import { Message } from 'element-ui'
import Vue from 'vue'
import JSZip from 'jszip'
import _chunk from 'lodash/chunk'
import HtmlComponenet from '../components/download/Html.vue'
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
  const title = `${folderName} - ${info.threadName} - ${time}`
  const { messages, participants } = info
  _chunk(messages, 10000) // split every 10000 messages into chunks
    .forEach((messageChunk, i) => {
      const html = new Vue({
        components: { HtmlElement: HtmlComponenet },
        render (h) {
          return (
            <html-element
              title={ title }
              messages-data={ messageChunk }
              participants={ participants }
              self-id={ selfId }></html-element>
          )
        }
      }).$mount().$el

      // Create a empty document which is independant. Used to avoid load resource
      // like image, audio, video...
      const doc = document.implementation.createDocument(null, '', null)

      // initial a html element in document
      doc.appendChild(document.createElement('html'))

      // extract html element from document.
      const docHtml = doc.lastElementChild

      // append rendered head and body to independant document.
      Array.from(html.children).forEach((child) => docHtml.appendChild(child))

      // html -> string -> blob<text/html>
      const pageBlob = new Blob([
        '<!DOCTYPE html>',
        docHtml.outerHTML
      ], { type: 'text/html' })

      // put file blob into zip
      zip.file(`${folderName} - ${info.threadName} - ${time} - ${i + 1}.html`, pageBlob)
    })

  try {
    // fetch assets into blob
    const assetBlob = await (await fetch('/assets/download.css')).blob()

    // also put into zip
    zip.file('download.css', assetBlob)

    // generate zip blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE'
    })

    // start download
    chrome.downloads.download({
      filename: `${folderName} - ${info.threadName} - ${time}.zip`,
      url: URL.createObjectURL(zipBlob)
    })
  } catch (err) {
    console.error(err)
    return _errorHandler()
  }
}
