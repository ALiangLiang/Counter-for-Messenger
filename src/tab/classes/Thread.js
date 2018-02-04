export default class Thread {
  constructor (data) {
    // Public properties name.
    const publicPropNames = ['id', 'name', 'tooltop', 'type', 'messages', 'participants', 'messageCount', 'textCount', 'isLoading']
    this.isLoading = false
    // Initial properties.
    publicPropNames.forEach((propName) => {
      if (data[propName]) this[propName] = data[propName]
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
}
