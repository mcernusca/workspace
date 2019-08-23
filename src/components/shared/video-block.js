import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

export default function VideoBlock({src, loop = true}) {
  return (
    <Video loop={loop} playsinline preload="auto" controls>
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </Video>
  )
}

VideoBlock.propTypes = {
  src: PropTypes.string.isRequired
}

export const Video = styled.video`
  object-fit: cover;
  width: 100%;
  height: 100%;
`
