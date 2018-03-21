import {
  toQuerystring,
  uploadImage
} from './util.js'
import { fb } from '@/../core/.env.js'

const __ = chrome.i18n.getMessage

export default async function shareOnFb (canvas, jar) {
  /** @see https://developers.facebook.com/docs/sharing/best-practices/#images **/
  const imageSize = { width: 1200, height: 630 }

  try {
    // output blob
    const blob = await new Promise((resolve, reject) => canvas.toBlob(resolve))

    // upload image to fb
    const metadata = (await uploadImage(jar, blob)).payload.metadata[0]

    // construct fb sharing dialog url
    const channelUrlHash = toQuerystring({
      cb: 'f2c3a60a05f73a4',
      domain: fb.domain,
      origin: fb.website,
      relation: 'opener'
    })
    const channelUrl = 'http://staticxx.facebook.com/connect/xd_arbiter/r/Ms1VZf1Vg1J.js?version=42#' + channelUrlHash
    const next = `${channelUrl}&relation=opener&frame=f236fd3a78b853&result=%22xxRESULTTOKENxx%22`
    const qs = toQuerystring({
      action_properties: {
        object: {
          'og:url': fb.website,
          'og:title': __('extName'),
          'og:description': __('extDescription'),
          'og:image': metadata.src,
          'og:image:width': imageSize.width,
          'og:image:height': imageSize.height,
          'og:image:type': metadata.filetype
        }
      },
      action_type: 'og.likes', // Coz "og.shares" cannot show bigger preview image, use "og.likes" instead of "og.shares".
      app_id: fb.id,
      channel_url: channelUrl,
      e2e: {},
      locale: __('@@ui_locale'),
      mobile_iframe: false,
      next,
      sdk: 'joey',
      version: fb.version
    })
    const url = `https://www.facebook.com/${fb.version}/dialog/share_open_graph?${qs}`

    // create fb dialog page
    chrome.tabs.create({
      url
    })
  } catch (err) {
    console.error(err)
  }
}
