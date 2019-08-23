import React from 'react'
import Space from './space'
import PropTypes from 'prop-types'

function Section({children}) {
  return children
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: function(props, propName, componentName) {
    const prop = props[propName]
    let error = null
    React.Children.forEach(prop, function(child) {
      if (child.type !== Space) {
        error = new Error(
          '`' + componentName + '` children should be of type `Space`.'
        )
      }
    })
    return error
  }
}

export default Section
