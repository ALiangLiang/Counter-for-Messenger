export default class Thread {
  constructor (data) {
    // Public properties name.
    const publicPropNames = ['id', 'name', 'tooltop', 'type', 'messages', 'participants', 'messageCount', 'textCount', 'needUpdate']
    this.isLoading = false
    // Initial properties.
    publicPropNames.forEach((propName) => {
      this[propName] = data[propName] || null
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

  static culTextCount (messages) {
    return messages.reduce((cur, message) =>
      ((message.text) ? message.text.length : 0) + cur, 0)
  }
}
