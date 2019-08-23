export const Size = function(width, height) {
  return [width, height]
}

export const Origin = function(x, y) {
  return [x, y]
}

export const Frame = function(x, y, width, height) {
  return {
    origin: Origin(x, y),
    size: Size(width, height)
  }
}
