import React from 'react'

export default function ColorBlock({color, ...rest}) {
  return (
    <div
      className="color-block"
      style={{
        backgroundColor: color
      }}
      {...rest}
    />
  )
}
