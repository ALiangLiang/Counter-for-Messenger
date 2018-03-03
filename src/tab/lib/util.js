import fetchService from './fetchService.js'

// http get
export function get (url) {
  return fetchService(url, {
    credentials: 'same-origin',
    mode: 'cors'
  })
}

// http post
export function post (url, form) {
  // stringify value of form.
  const body = Object.keys(form).map(function (key) {
    const val = (typeof form[key] === 'object')
      ? JSON.stringify(form[key]) : form[key]
    return encodeURIComponent(key) +
      ((form[key] !== undefined) ? ('=' + encodeURIComponent(val)) : '')
  }).join('&')

  return fetchService(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
    },
    credentials: 'same-origin',
    mode: 'cors',
    body
  })
}

// handle graphql response.
export function graphql (url, form) {
  return post(url, form)
    .then((res) => res.text())
    .then((body) => JSON.parse(body.split('\n')[0]))
}

export function getQraphqlForm (queries, jar) {
  return Object.assign({
    batch_name: 'MessengerGraphQLThreadFetcher',
    fb_dtsg: jar.token, // It's required!!
    __rev: jar.revision, // optional
    __user: jar.selfId, // optional
    jazoest: '2' + Array.from(jar.token).map((char) => char.charCodeAt(0)).join(''),
    client: 'mercury',
    __a: 1
  }, { queries })
}

// extract form from html.
export function getFrom (str, startToken, endToken) {
  var start = str.indexOf(startToken) + startToken.length
  if (start < startToken.length) return ''

  var lastHalf = str.substring(start)
  var end = lastHalf.indexOf(endToken)
  if (end === -1) {
    throw Error('Could not find endTime `' + endToken + '` in the given string.')
  }
  return lastHalf.substring(0, end)
}

/**
 * Extract request data from Facebook page.
 * @return {Promise<{token, selfId, revision}>} return a Promise include "token", "selfId" and "revision"
 */
export async function getJar () {
  // fetch facebook page and extract data from their.
  const res = await get('https://www.facebook.com/')
  const html = await res.text()
  try {
    // required
    const token = getFrom(html, 'name="fb_dtsg" value="', '"')
    const selfId = getFrom(html, 'name="xhpc_targetid" value="', '"')
    // optional
    let revision
    try { revision = getFrom(html, 'revision":', ',') } catch (err) {}

    return {
      token,
      selfId,
      revision
    }
  } catch (err) {
    console.error(err)
    throw new Error('Cannot extract from facebook page.')
  }
}
