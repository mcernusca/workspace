import {Frame} from './frame'

const LAYER_STATE_MIN = -1
const LAYER_STATE_NORMAL = 0
const LAYER_STATE_MAX = 1

// Models

export const EmptyViewState = {
  layers: {},
  layerProps: {}
}

const DefaultFrame = Frame(0, 0, 5, 5)

export const LayerProp = function(frame, state = LAYER_STATE_NORMAL) {
  return {
    frame: frame,
    state: state
  }
}

const Operations = {
  // Layers
  zup: function(state, path) {
    const [parentPath, slug] = extractLayerFromPath(path)
    const layers = state.layers[parentPath]
    if (!layers) {
      console.warn('zup: failed lookup', path)
      return
    }

    const copy = [...layers]
    const index = copy.indexOf(slug)
    if (index >= copy.length - 1) {
      return
    }

    ;[copy[index + 1], copy[index]] = [copy[index], copy[index + 1]]

    state.layers[parentPath] = copy
  },

  zdown: function(state, path) {
    const [parentPath, slug] = extractLayerFromPath(path)
    const layers = state.layers[parentPath]
    if (!layers) {
      console.warn('zdown: failed lookup', path)
      return
    }

    const copy = [...layers]
    const index = copy.indexOf(slug)
    if (index <= 0) {
      return
    }

    ;[copy[index - 1], copy[index]] = [copy[index], copy[index - 1]]

    state.layers[parentPath] = copy
  },

  min: function(state, path) {
    const props = state.layerProps[path]
    if (props.state === LAYER_STATE_MIN) {
      props.state = LAYER_STATE_NORMAL
    } else {
      props.state = LAYER_STATE_MIN
    }
  },

  max: function(state, path) {
    const props = state.layerProps[path]
    if (props.state === LAYER_STATE_MAX) {
      props.state = LAYER_STATE_NORMAL
    } else {
      props.state = LAYER_STATE_MAX
    }
  },

  xy: function(state, path, x, y) {
    const props = state.layerProps[path]
    const [width, height] = props.frame.size
    this.xywh(state, path, parseInt(x), parseInt(y), width, height)
  },

  wh: function(state, path, w, h) {
    const props = state.layerProps[path]
    const [x, y] = props.frame.origin
    this.xywh(state, path, x, y, parseInt(w), parseInt(h))
  },

  xywh: function(state, path, x, y, w, h) {
    const props = state.layerProps[path]
    props.frame = Frame(parseInt(x), parseInt(y), parseInt(w), parseInt(h))
  },

  add: function(state, path) {
    const [parentPath, slug] = extractLayerFromPath(path)
    // Add layer to view
    if (!state.layers[parentPath]) {
      state.layers[parentPath] = []
    }
    // Add to layer array
    state.layers[parentPath].push(slug)
    // Add default props
    state.layerProps[`${parentPath}/${slug}`] = LayerProp(DefaultFrame)
  },

  rmv: function(state, path) {
    const [parentPath, slug] = extractLayerFromPath(path)
    // Remove layer from view
    if (!state.layers[parentPath]) {
      return
    }
    //Remove properties
    delete state.layerProps[path]
    // Filter it out of layer list
    const layers = state.layers[parentPath]
    state.layers[parentPath] = layers.filter(id => id !== slug)
  },

  // Views

  copy: function(state, fromPath, toPath) {
    // TODO make sure the two paths are siblings

    // Clear toPath view first
    this.clear(state, toPath)
    // Copy over layers array
    state.layers[toPath] = [...state.layers[fromPath]]
    // Copy over props
    const layers = state.layers[fromPath]
    layers.forEach(slug => {
      state.layerProps[`${toPath}/${slug}`] = state.layerProps[`${fromPath}/${slug}`]
    })
  },

  clear: function(state, path) {
    // Clear view
    const layers = state.layers[path]
    if (layers) {
      //Delete props for each slug
      layers.forEach(slug => {
        delete state.layerProps[`${path}/${slug}`]
      })
      // Delete layers array
      delete state.layers[path]
    }
  }
}

// Utils

function extractLayerFromPath(path) {
  const parts = path.split('/')
  const slug = parts.pop()
  return [parts.join('/'), slug]
}

export function ApplyStr(state, opStr) {
  const str = opStr.trim()
  if (!str.length) {
    return
  }
  const args = parse(opStr)
  apply(state, args[0], args.slice(1))
}

function parse(op) {
  return op.split(' ').map(p => p.trim().toLowerCase())
}

function apply(state, op, args) {
  if (!Operations[op]) {
    throw new Error('Unknown operation: ' + op)
  }
  Operations[op](state, ...args)
}

export function ToStr(op, args) {
  const arr = [op, ...args]
  return arr.join(' ')
}

export function StrToLog(str) {
  const ops = str.split(/\n/)
  const output = []
  ops.forEach(entry => {
    if (entry.length) {
      output.push(entry.trim())
    }
  })
  return output
}

export function ApplyLog(draftState, log) {
  if (!draftState) {
    throw new Error('IngestLog: expecting a draft state object, got', draftState)
  }
  if (!Array.isArray(log)) {
    throw new Error('IngestLog: expecting an array log, got ', typeof log)
  }

  log.forEach(optStr => {
    ApplyStr(draftState, optStr)
  })
}

export default {}
