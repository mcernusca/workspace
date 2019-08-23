import React from 'react'
import PropTypes from 'prop-types'

export default function CodeBlock({language = 'javascript', children, ...rest}) {
  const ref = React.useRef()
  React.useEffect(() => {
    if (window.Prism) window.Prism.highlightElement(ref.current)
  }, [children])
  return (
    <pre className="code-block" {...rest}>
      <code className={`language-${language}`} ref={ref}>
        {children}
      </code>
    </pre>
  )
}

CodeBlock.propTypes = {
  children: PropTypes.string.isRequired
}
