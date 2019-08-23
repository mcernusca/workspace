import React from 'react'
import TextBlock from './text-block'

export default function HeadlineBlock({value, ...rest}) {
  return (
    <TextBlock {...rest}>
      <h1>{value}</h1>
    </TextBlock>
  )
}
