import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

export default function ImageBlock({src, alt = '', cover = true, style = {}}) {
  const classes = cx({
    'image-block': true,
    cover: cover
  })
  return (
    <div className={classes}>
      <img src={src} alt={alt} style={style} />
    </div>
  )
}

ImageBlock.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string
}
