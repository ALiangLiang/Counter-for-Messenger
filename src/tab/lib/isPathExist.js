import get from 'lodash/get'

export default function isPathExist (...args) { return !!get(...args) }
