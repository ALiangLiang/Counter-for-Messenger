/// //////////////////////////////////////////////////////
// Let client backup(download) their messages history. //
// Dump and wrapper to a HTML page                     //
/// //////////////////////////////////////////////////////
// TODO: This function maybe broken when too much messages. Coz device resource leak.
import { Message } from 'element-ui'
import download from 'downloadjs'
import { htmlPattern } from './htmlPattern'

export default async function downloadMessages (info, selfId) {
  if (!selfId) {
    return Message({
      type: 'error',
      dangerouslyUseHTMLString: true,
      message: `<p><span>Oops, cannot download messages. </span><a href="https://github.com/ALiangLiang/Counter-for-Messenger/issues" target="_blank">Please contact developer.</a></p>`
    })
  }
  const { messages } = info
  const html = document.createElement('html')
  html.innerHTML = htmlPattern
  const body = html.querySelector('#container')
  for (const i in messages) {
    const msg = messages[i]
    const content = (msg.text) ? msg.text : ''

    const div = document.createElement('div')
    const divBox = document.createElement('div')
    divBox.innerText = content
    div.classList = 'outer'
    div.appendChild(divBox)
    const date = new Date(Number(msg.timestamp))
    const localTimeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    if (Number(msg.senderId) === Number(selfId)) {
      div.className += ' right'
      divBox.classList = 'box_r'
      divBox.id = msg.timestamp
      divBox.title = localTimeString
    } else {
      divBox.classList = 'box_l'
      divBox.id = msg.timestamp
      divBox.title = localTimeString
    }
    body.appendChild(div)
  }

  function padLeft (str, len) {
    str = '' + str
    if (str.length >= len) {
      return str
    } else {
      return padLeft('0' + str, len)
    }
  }
  const date = new Date()
  const time = (date.getYear() + 1900) + padLeft(date.getMonth(), 2) + padLeft(date.getDate(), 2)
  download(html.outerHTML, info.name + '-' + time + '.html', 'text/html')
}
