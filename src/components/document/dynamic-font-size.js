import React from 'react'

// We're going to say that at 1440px our base font size is 16px
// and scale proportionally from that
const BASE_FONT_SIZE_PX = 16
const BASE_RES_WIDTH_PX = 1440

export default function DynamicFontSize({frame, children}) {
  const factor = frame.size[0] / BASE_RES_WIDTH_PX
  const size = Math.round(BASE_FONT_SIZE_PX * factor * 10) / 10
  return <div style={{fontSize: `${size}px`}}>{children}</div>
}
