export function getFieldFrom(fieldChain, obj) {
  if (!fieldChain.length) return obj

  if (Object.prototype.hasOwnProperty.call(obj, fieldChain[0])) {
    return getFieldFrom(fieldChain.slice(1), obj[fieldChain[0]])
  } else {
    return null
  }
}

export function camelToUpSnake(string) {
  return string
    .replace(/([A-Z])/g, function (m) {
      return "_" + m
    })
    .toUpperCase()
}
