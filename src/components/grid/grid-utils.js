import {Frame} from '../../models/frame'
import {zip} from 'lodash'

export const gridFrameToPxFrame = function(frame, cellSize) {
  const _origin = zipMap(gridToPx, frame.origin, cellSize)
  const _size = zipMap(gridToPx, frame.size, cellSize)
  return Frame(..._origin, ..._size)
}

export const gridSizeForContainerSize = function(containerSize, cols, rows) {
  // return [Math.round(containerSize[0] / cols), Math.round(containerSize[1] / rows)]
  return [containerSize[0] / cols, containerSize[1] / rows]
}

export const pxToGrid = function(val, cellDim) {
  return Math.round(val / cellDim)
}

export const gridToPx = function(val, cellDim) {
  return val * cellDim
}

export const snapToGrid = function(val, cellDim) {
  return pxToGrid(val, cellDim) * cellDim
}

export const cap = function(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export const zipMap = function(fn, ...arrs) {
  return zip(...arrs).map(v => fn(...v))
}

export const moveH = function(count, direction, frame, cols) {
  const {origin, size} = frame
  const x = cap(origin[0] + count * direction, 0, cols - size[0])
  return {
    ...frame,
    origin: [x, origin[1]]
  }
}

export const moveV = function(count, direction, frame, rows) {
  const {origin, size} = frame
  const y = cap(origin[1] + +(count * direction), 0, rows - size[1])
  return {
    ...frame,
    origin: [origin[0], y]
  }
}

//

export const heightForWidth = function(aspectRatio, width) {
  return Math.floor(width / aspectRatio)
}

export const boundsFit = function(contentSize, containerSize) {
  const [contentWidth, contentHeight] = contentSize
  const [containerWidth, containerHeight] = containerSize
  const contentAspectRatio = contentWidth / contentHeight
  const scale = Math.min(containerWidth / contentWidth, containerHeight / contentHeight)

  const adjustedWidth = contentWidth * scale
  // const adjustedHeight = contentHeight * scale
  const adjustedHeight = heightForWidth(contentAspectRatio, adjustedWidth)

  return [adjustedWidth, adjustedHeight]
}

export const frameFit = function(contentFrame, containerFrame, padding) {
  const paddedContainerSize = [containerFrame.size[0] - padding, containerFrame.size[1] - padding]
  const bounds = boundsFit(contentFrame.size, paddedContainerSize)
  const containerOrigin = containerFrame.origin
  const centeredOrigin = [
    containerOrigin[0] + (containerFrame.size[0] - bounds[0]) / 2,
    containerOrigin[1] + (containerFrame.size[1] - bounds[1]) / 2
  ]
  return {
    origin: centeredOrigin,
    size: bounds
  }
}
