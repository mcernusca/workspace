import {ToStr, ApplyStr, ApplyLog} from './operation'

import {initialState} from './persistence'

export const FRAME = 'FRAME'
export const ORDER = 'ORDER'
export const REMOVE = 'REMOVE'
export const ADD = 'ADD'

export const UNDO = 'UNDO'
export const REDO = 'REDO'

const reducer = (draft, action) => {
  switch (action.type) {
    case FRAME: {
      const {path, ...rest} = action.payload
      let opStr = null
      if (rest.origin && rest.size) {
        opStr = ToStr('xywh', [path, ...rest.origin, ...rest.size])
      } else if (rest.origin) {
        opStr = ToStr('xy', [path, ...rest.origin])
      } else if (rest.size) {
        opStr = ToStr('wh', [path, ...rest.size])
      } else {
        console.warn('Reducer: invalid SET payload', action.payload)
        break
      }
      draft.log.push(opStr)
      return void ApplyStr(draft.viewState, opStr)
    }

    case ORDER: {
      const {path, direction} = action.payload
      let opStr = ToStr(direction > 0 ? 'zup' : 'zdown', [path])
      draft.log.push(opStr)
      return void ApplyStr(draft.viewState, opStr)
    }

    case REMOVE: {
      const {path} = action.payload
      let opStr = ToStr('rmv', [path])
      draft.log.push(opStr)
      return void ApplyStr(draft.viewState, opStr)
    }

    case ADD: {
      const {path, frame} = action.payload
      let opStr = ToStr('add', [path])
      draft.log.push(opStr)
      ApplyStr(draft.viewState, opStr)
      opStr = ToStr('xywh', [path, ...frame.origin, ...frame.size])
      draft.log.push(opStr)
      return void ApplyStr(draft.viewState, opStr)
    }

    case UNDO: {
      if (!draft.log.length) {
        return
      }
      draft.future.push(draft.log.pop())
      draft.viewState = {...initialState.viewState}
      return void ApplyLog(draft.viewState, draft.log)
      // @TODO: pass through action.payload.path
      // reverse scan log and find an op for this view path
      // take it out and push it on future array
      // blow away viewState and replace it by Ingesting the whole log again
    }

    case REDO: {
      if (!draft.future.length) {
        return
      }
      draft.log.push(draft.future.pop())
      draft.viewState = {...initialState.viewState}
      return void ApplyLog(draft.viewState, draft.log)
    }

    // no default
  }
}

export default reducer
