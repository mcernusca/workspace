export const heightForWidth = function(contentAspectRatio, width) {
  return Math.floor(width / contentAspectRatio)
}

export const boundsFit = function(contentAspectRatio, containerWidth, containerHeight) {
  const contentHeight = containerWidth / contentAspectRatio
  const contentWidth = contentHeight * contentAspectRatio
  const scale = Math.min(containerWidth / contentWidth, containerHeight / contentHeight)

  const adjustedWidth = Math.floor(contentWidth * scale)
  // const adjustedHeight = contentHeight * scale
  const adjustedHeight = heightForWidth(contentAspectRatio, adjustedWidth)

  return [adjustedWidth, adjustedHeight]
}
