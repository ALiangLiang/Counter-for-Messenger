export default class Threads extends Array {
  /**
   * @constructor
   * @param {Array<Object>} threadsData threads with Array.
   */
  constructor (threadsData) {
    super()
    threadsData.forEach((thread) => this.push(thread))
  }

  /**
   * Return users in this threads.
   * @return {Array<User>} Users in this threads.
   */
  get users () {
    return this.reduce((cur, thread) => {
      // Take out all user in this thread.
      const users = (thread.participants || []).map((participant) => participant.user)
      users.forEach((user) => {
        // If this user not in array "cur". Push it.
        if (!cur.find((participant) => participant.id === user.id)) {
          cur.push(thread.participants)
        }
      })
    }, [])
  }

  /**
   * Get user by ID.
   * @param  {String} id User's ID
   * @return {User|null}
   */
  getUserById (id) {
    return this.users.find((user) => user.id === id) || null
  }
}
