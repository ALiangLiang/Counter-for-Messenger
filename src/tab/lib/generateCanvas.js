import {
  getAvatar,
  getTextWidth,
  adjustTextSize
} from './util.js'

const __ = chrome.i18n.getMessage

export default async function generateCanvas (thread, index, imageSize, jar) {
  function loadImage (src) {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = src
    return new Promise((resolve, reject) => (img.onload = () => resolve(img)))
  }

  try {
    const paddingTop = 70
    const avatarWidth = 250
    const userNameSize = 40
    const padding = [20, 25]
    const lineHeight = 15
    const avatarPaddingAside = 70
    const avatarPos = [
      [avatarPaddingAside, paddingTop],
      [imageSize.width - avatarWidth - avatarPaddingAside, paddingTop]
    ]
    const fontSet = 'Verdana, Microsoft JhengHei'
    let textOffsetY = paddingTop + 40

    // draw sharing image
    const canvas = document.createElement('canvas')
    canvas.width = imageSize.width
    canvas.height = imageSize.height
    const ctx = canvas.getContext('2d')

    // paste background
    ctx.fillStyle = 'rgb(0, 131, 255, 0.8)'
    ctx.fillRect(0, 0, imageSize.width, imageSize.height)

    // set logo
    const logoText = `${__('extName')} (${__('unofficial')})`
    const logoTextSize = 40
    const logoTextPosY = canvas.height - padding[1]
    const generatedByPostfixPosX = canvas.width - padding[0]
    const generatedByFontSet = `30px ${fontSet}`
    const logoTextRightPosX = generatedByPostfixPosX -
      ((__('generatedByPostfix')) ? getTextWidth(__('generatedByPostfix'), generatedByFontSet) + 20 : 0)
    ctx.font = `${logoTextSize}px ${fontSet}`
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'right'
    ctx.fillText(logoText, logoTextRightPosX, logoTextPosY)
    const logoWidth = 50
    const logoPos = [
      logoTextRightPosX - getTextWidth(logoText, ctx.font) - logoWidth - 15,
      canvas.height - logoWidth + (logoWidth - logoTextSize) / 2 - padding[1] + 5
    ]
    ctx.drawImage(await loadImage('../icons/128.png'), logoPos[0], logoPos[1], logoWidth, logoWidth)
    // write "generate by"
    ctx.font = generatedByFontSet
    ctx.fillText(__('generatedByPrefix'), logoPos[0] - 20, logoTextPosY)
    ctx.fillText(__('generatedByPostfix'), generatedByPostfixPosX, logoTextPosY)

    const users = thread.participants
      .map((participant) => participant.user)
      .sort((user) => (user.id === jar.selfId) ? -1 : 0)
      .reverse()
    const images = await Promise.all(
      users.map(async (user) => loadImage(await getAvatar(jar, user))))
    const [leftUser, rightUser] = users

    // write user name
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    users.forEach((user, i) => {
      ctx.font = `${adjustTextSize(user.name, userNameSize, avatarWidth, fontSet)}px ${fontSet}`
      ctx.fillText(user.name
        , avatarPos[i][0] + avatarWidth / 2
        , avatarPos[i][1] + avatarWidth + userNameSize + 30)
    })

    // write message count
    // "They have"
    ctx.font = `60px ${fontSet}`
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.fillText(__('countPrefix'), imageSize.width / 2, textOffsetY += 60 + lineHeight)
    // message count background
    const barHeight = 120
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, textOffsetY + lineHeight * 2, imageSize.width, barHeight)
    // message count text
    ctx.fillStyle = 'rgb(0, 131, 255)'
    ctx.font = `${barHeight}px ${fontSet}`
    ctx.fillText(thread.messageCount, imageSize.width / 2, textOffsetY += barHeight + lineHeight)
    // "messages!"
    ctx.fillStyle = '#fff'
    ctx.font = `60px ${fontSet}`
    ctx.fillText(__('countPostfix'), imageSize.width / 2, textOffsetY += 60 + lineHeight)
    // rank
    const rankText = __('rank', [leftUser.name, index + 1, rightUser.name])
    ctx.font = `bold ${adjustTextSize(rankText, 60, canvas.width - 100, fontSet)}px ${fontSet}`
    ctx.fillText(rankText, imageSize.width / 2, textOffsetY += 60 + 50)

    // placed avatars
    images.forEach((image, i) => {
      const outerBorderWidth = 2
      const borderWidth = 8
      // draw black outter border
      ctx.fillStyle = 'rgba(0, 0, 0, .4)'
      ctx.fillRect(
        avatarPos[i][0] - borderWidth - outerBorderWidth,
        avatarPos[i][1] - borderWidth - outerBorderWidth,
        avatarWidth + borderWidth * 2 + outerBorderWidth * 2,
        avatarWidth + borderWidth * 2 + outerBorderWidth * 2)
      // draw white inner border
      ctx.fillStyle = '#fff'
      ctx.fillRect(
        avatarPos[i][0] - borderWidth,
        avatarPos[i][1] - borderWidth,
        avatarWidth + borderWidth * 2,
        avatarWidth + borderWidth * 2)
      // paste avatar
      ctx.drawImage(image, avatarPos[i][0], avatarPos[i][1], avatarWidth, avatarWidth)
    })

    return canvas
  } catch (err) {
    console.error(err)
  }
}
