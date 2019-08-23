import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import cx from 'classnames'

export default function GridWindow({children, size}) {
  let ref = React.useRef(null)
  const classes = cx({
    'grid-window': true,
    'has-shadow': children.props.hasShadow
  })
  return (
    <Container className={classes} ref={ref}>
      {React.cloneElement(children, {size: size})}
    </Container>
  )
}

GridWindow.propTypes = {
  children: PropTypes.element.isRequired
}

const Container = styled.div`
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
`
