import User from './User.js'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'

export default class Thread {
  constructor (data) {
    // Public properties name.
    const publicPropNames = ['id', 'name', 'tooltop', 'type', 'messages', 'participants', 'messageCount', 'characterCount', 'needUpdate']
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

    let characterSum = 0
    // Statistic messages with every participants. And count character.
    const participantsStats = {}
    messages.forEach((message) => {
      const textLength = (message.text) ? message.text.length : 0
      characterSum += textLength
      const participantStats = participantsStats[message.senderId]
      _set(participantsStats, `${message.senderId}.messageCount`,
        _get(participantStats, 'messageCount', 0) + 1)
      _set(participantsStats, `${message.senderId}.characterCount`,
        _get(participantStats, 'characterCount', 0) + textLength)
    })
    this.characterCount = characterSum

    // Set statistic results on Thread Object.
    // Don't let vue instance trigger "messages". Will cause memory leak.
    Object.keys(participantsStats)
      .forEach((participantId) => {
        const participantStats = participantsStats[participantId]
        let messageSender = this.getParticipantById(participantId) ||
        (threads) ? threads.getUserById(participantId) : null
        if (messageSender) {
          messageSender.messageCount = participantStats.messageCount
          messageSender.characterCount = participantStats.characterCount
        } else { // This sender is not inside the thread.
          messageSender = {
            user: new User({
              id: participantId,
              name: null,
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
      ((message.text) ? message.text.length : 0) + cur, 0)
  }
}
