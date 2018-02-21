import User from './User.js'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'

export default class Thread {
  constructor (data) {
    // Public properties name.
    const publicPropNames = ['id', 'name', 'tooltop', 'type', 'messages', 'participants', 'messageCount', 'textCount', 'needUpdate']
    this.isLoading = false
    // Initial properties.
    publicPropNames.forEach((propName) => {
      this[propName] = _isUndefined(data[propName]) ? null : data[propName]
    })
  }

  /**
   * Get participant by ID.
   * @param  {String} id User's ID
   * @return {User|null}
   */
  getParticipantById (id) {
    return (this.participants && this.participants.length)
      ? this.participants.find((participant) => participant.id === id) || null
      : null
  }

  analyzeMessages (messages = this.messages, threads) {
    if (!messages) throw new Error('Need messages.')

    let textSum = 0
    // Statistic messages with every participants. And count text.
    const participantsStats = {}
    messages.forEach((message) => {
      const textLength = (message.text) ? message.text.length : 0
      textSum += textLength
      const participantStats = participantsStats[message.senderId]
      _set(participantsStats, `${message.senderId}.messageCount`,
        _get(participantStats, 'messageCount', 0) + 1)
      _set(participantsStats, `${message.senderId}.textCount`,
        _get(participantStats, 'textCount', 0) + textLength)
    })
    this.textCount = textSum

    // Set statistic results on Thread Object.
    // Don't let vue instance trigger "messages". Will cause memory leak.
    Object.keys(participantsStats)
      .forEach((participantId) => {
        const participantStats = participantsStats[participantId]
        let messageSender = this.getParticipantById(participantId) ||
        (threads) ? threads.getUserById(participantId) : null
        if (messageSender) {
          messageSender.messageCount = participantStats.messageCount
          messageSender.textCount = participantStats.textCount
        } else { // This sender is not inside the thread.
          messageSender = {
            user: new User({
              id: participantId,
              name: null,
              type: null,
              url: null
            }),
            messageCount: participantStats.messageCount,
            textCount: participantStats.textCount,
            inGroup: false
          }
          this.participants.push(messageSender)
        }
      })
  }

  static culTextCount (messages) {
    return messages.reduce((cur, message) =>
      ((message.text) ? message.text.length : 0) + cur, 0)
  }
}
