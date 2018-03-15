import fetchThreadDetail from '../lib/fetchThreadDetail.js'
import fetchThread from './../lib/fetchThread.js'
import User from './User.js'
import _set from 'lodash/set'
import _get from 'lodash/get'
const __ = chrome.i18n.getMessage

export default class Thread {
  constructor (data) {
    Object.assign(this, data)
    this.isLoading = false
  }

  /**
   * Get participant by ID.
   * @param  {String} id User's ID
   * @return {User|null}
   */
  getParticipantById (id) {
    return (this.participants && this.participants.length)
      ? this.participants.find((participant) => _get(participant, 'user.id') === id) || null
      : null
  }

  analyzeMessages (messages = this.messages) {
    if (!messages) throw new Error('Need messages.')

    let characterSum = 0
    // Statistic messages with every participants. And count character.
    const participantsStats = {}
    messages.forEach((message) => {
      const textLength = (message.body) ? message.body.length : 0
      characterSum += textLength
      const participantStats = participantsStats[message.senderID]
      _set(participantsStats, `${message.senderID}.messageCount`,
        _get(participantStats, 'messageCount', 0) + 1)
      _set(participantsStats, `${message.senderID}.characterCount`,
        _get(participantStats, 'characterCount', 0) + textLength)
    })
    this.characterCount = characterSum

    // Set statistic results on Thread Object.
    // Don't let vue instance trigger "messages". Will cause memory leak.
    Object.keys(participantsStats)
      .forEach((participantId) => {
        const participantStats = participantsStats[participantId]
        let messageSender = this.getParticipantById(participantId)
        if (messageSender) {
          messageSender.messageCount = participantStats.messageCount
          messageSender.characterCount = participantStats.characterCount
        } else {
          messageSender = {
            user: new User({
              id: participantId,
              name: `<${__('unknown')}>`,
              type: null,
              url: null
            }),
            messageCount: participantStats.messageCount,
            characterCount: participantStats.characterCount,
            inGroup: false
          }
          this.participants.push(messageSender)
        }
      })
  }

  static culCharacterCount (messages) {
    return messages.reduce((cur, message) =>
      ((message.body) ? message.body.length : 0) + cur, 0)
  }

  async reload (jar) {
    const newThreadData = await fetchThread(jar, this.id)
    // This API cannot load detail of participant information like name, nickname...
    // So don't overwrite original participants data.
    delete newThreadData.participants
    Object.assign(this, newThreadData)
    return this
  }

  async loadDetail (ctx, $set) {
    this.isLoading = true
    const cachedThread = await ctx.db.get(this.id)
    let messageLimit
    if (cachedThread) {
      const cachedThreadMessagesLength = _get(cachedThread, 'messages.length')
      if (cachedThreadMessagesLength !== undefined) {
        if (cachedThreadMessagesLength === this.messageCount) { // No need to update cache.
          this.isLoading = false
          return
        }
        if (!this.messages) {
          messageLimit = this.messageCount - cachedThreadMessagesLength
        }
      }
    }

    if (!this.messages) {
      const result = await fetchThreadDetail({
        jar: ctx.jar, thread: this, $set: $set, messageLimit
      })
      this.messages = (_get(cachedThread, 'messages') || []).concat(result)
      this.characterCount = Thread.culCharacterCount(this.messages)
      this.analyzeMessages()
      ctx.db.put({ id: this.id, messages: this.messages })
      this.needUpdate = false
    }
    this.isLoading = false
    return this
  }
}
