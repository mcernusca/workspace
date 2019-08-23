import React from 'react'

function Layer({title, path, component, ...rest}) {
  if (component) {
    return React.createElement(component, rest)
  }
  return null
}

export default Layer
