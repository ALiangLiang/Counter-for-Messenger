export default class Thread {
  constructor (data) {
    // Public properties name.
    const publicPropNames = ['id', 'name', 'tooltop', 'type', 'messages', 'participants', 'messageCount', 'textCount']
    // Initial properties.
    publicPropNames.forEach((propName) => {
      if (data[propName]) this[propName] = data[propName]
    })
  }
}
