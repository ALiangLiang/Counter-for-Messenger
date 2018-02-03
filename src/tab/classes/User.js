export default class User {
  constructor (data) {
    // Public properties name.
    const publicPropNames = ['id', 'name', 'type', 'url']
    // Initial properties.
    publicPropNames.forEach((propName) => {
      this[propName] = data[propName] || null
    })
  }
}
