import React from 'react'

export const RATIO = 16 / 9
export const COLS = 32 * 2
export const ROWS = 18 * 2

export const slugFromTitle = function(title) {
  return title
    .trim()
    .split(' ')
    .join('-')
    .toLowerCase()
}

export const buildIndex = function(children, activeCursor) {
  const index = []
  let cursor = 1

  React.Children.forEach(children, section => {
    const sectionIndex = {}
    sectionIndex.title = section.props.title
    sectionIndex.spaces = []
    React.Children.forEach(section.props.children, space => {
      sectionIndex.spaces.push({
        title: space.props.title,
        slide: cursor,
        views: space.props.views
      })
      cursor += space.props.views
    })
    index.push(sectionIndex)
  })
  return index
}

export const queryForSpaceAtCursor = function(cursor, children) {
  let index = 0
  let pathParts = []
  let depth = 0
  function recurse(cursor, children) {
    const arr = React.Children.toArray(children)
    depth++
    for (let i = 0; i < arr.length; i++) {
      let child = arr[i]
      pathParts[depth - 1] = slugFromTitle(child.props.title)
      if (child.props.views) {
        index += child.props.views
        if (cursor <= index) {
          return child
        }
      }
      const found = recurse(cursor, child.props.children, index)
      if (found) {
        return found
      }
    }
    depth--
  }
  const needle = recurse(cursor, children)
  if (needle) {
    return {
      component: needle,
      props: {
        from: index - needle.props.views,
        to: index,
        view: cursor - (index - needle.props.views),
        path: '/' + [...pathParts.slice(0, depth)].join('/')
      }
    }
  }
}

export const countViews = function(children) {
  let count = 0
  function recurse(children) {
    const arr = React.Children.toArray(children)
    for (let i = 0; i < arr.length; i++) {
      let child = arr[i]
      if (child.props.views) {
        count += child.props.views
      }
      recurse(child.props.children)
    }
  }
  recurse(children)
  return count
}
