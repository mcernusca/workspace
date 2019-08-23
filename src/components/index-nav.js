import React from 'react'
import styled from 'styled-components'
import {Link} from '@reach/router'

export default function IndexNav({model}) {
  return (
    <Wrapper>
      {model.map((section, sectionIndex) => {
        return (
          <Section key={sectionIndex}>
            <strong>{section.title}</strong>
            <ol>
              {section.spaces.map((space, spaceIndex) => {
                return (
                  <li key={spaceIndex}>
                    <span>└</span>
                    <Link to={`/${space.slide}`}>{space.title}</Link>
                  </li>
                )
              })}
            </ol>
          </Section>
        )
      })}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: absolute;
  width: 300px;
  height: 100%;
  background: #fff;
  color: #000;
  box-shadow: 0 0.15em 0.85em 0 rgba(0, 0, 0, 0.4);
  padding: 3em;

  overflow-y: auto;
`

const Section = styled.section`
  width: 100%;

  ol {
    margin-top: 0.5em;
    margin-bottom: 1.5em;
    margin-left: -0.2em;
  }

  ol li {
    margin-bottom: 0.5em;
    padding-left: 0;
  }

  ol li a {
    text-decoration: none;
    color: inherit;
  }

  ol li span {
    opacity: 0.4;
    font-size: 80%;
    margin-right: 0.5em;
  }
`
