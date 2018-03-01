import _isUndefined from 'lodash/isUndefined'

export default class User {
  constructor (data) {
    // Public properties name.
    const publicPropNames = ['id', 'name', 'type', 'url']
    // Initial properties.
    publicPropNames.forEach((propName) => {
      this[propName] = _isUndefined(data[propName]) ? null : data[propName]
    })
  }
}
