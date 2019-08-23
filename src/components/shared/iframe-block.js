import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export default function IframeBlock({src}) {
  return <Frame sandbox="allow-same-origin allow-scripts allow-popups allow-forms" src={src} />
}

IframeBlock.propTypes = {
  src: PropTypes.string.isRequired
}

export const Frame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
`
