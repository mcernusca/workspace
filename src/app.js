import React from "react";
import { Router } from "@reach/router";

import Store from "./models/view-store";
import { initialState } from "./models/persistence";

import Document from "./components/document";
import Section from "./components/section";
import Space from "./components/space";
import Layer from "./components/layer";
// import ColorBlock from "./components/shared/color-block";
import ImageBlock from "./components/shared/image-block";
import VideoBlock from "./components/shared/video-block";
import HeadlineBlock from "./components/shared/headline-block";
import MouseTrail from "./components/mouse-trail";

// Samples
// - Kay
import KayMP4 from "./components/samples/kay.mp4";
import BrickPileJPG from "./components/samples/brick-pile.jpg";
import BrickStackJPG from "./components/samples/brick-stack.jpg";
import GreatWallJPG from "./components/samples/great-wall.jpg";
import EgyptianPyramidsJPG from "./components/samples/egyptian-pyramids.jpg";
import RomanArchJPG from "./components/samples/roman-arch.jpg";
import RomanArch2JPG from "./components/samples/roman-arch-2.jpg";
import Scaffolding2JPG from "./components/samples/scaffolding-2.jpg";
import Scaffolding3JPG from "./components/samples/scaffolding-3.jpg";
// - Scaffolding Tools
import DisneyPatentJPG from "./components/samples/disney-patent.jpg";
import PriceOfPersiaAnimationGIF from "./components/samples/price-of-persia-animation.gif";
import PriceOfPersiaEditorMP4 from "./components/samples/price-of-persia-editor.mp4";
import PriceOfPersiaLevelJPG from "./components/samples/prince-of-persia-level.jpg";
import ScaffoldingHeadline from "./components/samples/scaffolding-headline.js";
import Scaffolding4JPG from "./components/samples/scaffolding-4.jpg";
import ScaffoldingProperties from "./components/samples/scaffolding-properties";

function App({ cursor = 0, navigate }) {
  return (
    <>
      <MouseTrail />
      <Document cursor={parseInt(cursor)} navigate={navigate}>
        <Section title="Sample">
          <Space title="Kay" views={9}>
            <Layer
              title="Kay Clip"
              component={VideoBlock}
              src={KayMP4}
              loop={false}
              hasShadow
            />
            <Layer
              title="Brick Pile"
              component={ImageBlock}
              src={BrickPileJPG}
              hasShadow
            />
            <Layer
              title="Brick Stack"
              component={ImageBlock}
              src={BrickStackJPG}
              hasShadow
            />
            <Layer
              title="Great Wall"
              component={ImageBlock}
              src={GreatWallJPG}
              hasShadow
            />
            <Layer
              title="Egyptian Pyramids"
              component={ImageBlock}
              src={EgyptianPyramidsJPG}
              hasShadow
            />
            <Layer
              title="Roman Arch"
              component={ImageBlock}
              src={RomanArchJPG}
              hasShadow
            />
            <Layer
              title="Roman Arch 2"
              component={ImageBlock}
              src={RomanArch2JPG}
              hasShadow
            />
            <Layer
              title="Scaffodling 2"
              component={ImageBlock}
              src={Scaffolding2JPG}
              hasShadow
            />
            <Layer
              title="Scaffodling 3"
              component={ImageBlock}
              src={Scaffolding3JPG}
              hasShadow
            />
          </Space>

          <Space title="Scaffolding Tools" views={6}>
            <Layer
              title="Disney Patent"
              component={ImageBlock}
              src={DisneyPatentJPG}
              hasShadow
            />
            <Layer
              title="Scaffolding Headline"
              component={ScaffoldingHeadline}
              inverted={true}
            />
            <Layer title="Toolbox emoji" component={HeadlineBlock} value="🧰" />
            <Layer
              title="POP Editor"
              component={VideoBlock}
              src={PriceOfPersiaEditorMP4}
              hasShadow
            />
            <Layer
              title="POP Animation"
              component={ImageBlock}
              src={PriceOfPersiaAnimationGIF}
              hasShadow
            />
            <Layer
              title="POP Level"
              component={ImageBlock}
              src={PriceOfPersiaLevelJPG}
            />
            <Layer
              title="Scaffolding Background"
              component={ImageBlock}
              src={Scaffolding4JPG}
            />
            <Layer
              title="1985 Headline"
              component={HeadlineBlock}
              value="1985"
            />
            <Layer
              title="Jordan Mechner Headline"
              component={HeadlineBlock}
              value="Jordan Mechner"
            />
            <Layer
              title="Scaffolding Properties"
              component={ScaffoldingProperties}
              inverted={true}
            />
          </Space>
        </Section>
      </Document>
    </>
  );
}

function Routes() {
  return (
    <Store.Provider initialState={initialState}>
      <Router id="router">
        <App path="/:cursor" />
        <App path="/" cursor="1" default />
      </Router>
    </Store.Provider>
  );
}

export default Routes;
