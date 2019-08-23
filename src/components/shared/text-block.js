import React from 'react'
import cx from 'classnames'

export default function TextBlock({children, inverted = false, ...rest}) {
  const classes = cx({
    'text-block': true,
    'is-inverted': inverted
  })
  return (
    <div className="text-block-wrapper">
      <div className={classes} {...rest}>
        {children}
      </div>
    </div>
  )
}
