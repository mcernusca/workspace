export const SET = 'SET'

const reducer = (draft, action) => {
  switch (action.type) {
    case SET: {
      Object.entries(action.payload).forEach(([key, value]) => {
        draft[key] = value
      })
    }
    // no default
  }
}

export default reducer
