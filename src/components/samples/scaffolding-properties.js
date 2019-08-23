import React from "react";
import TextBlock from "../shared/text-block";

export default function FinScaffoldingProperties(props) {
  return (
    <TextBlock {...props}>
      <h1>Scaffolding</h1> <br />
      <br />
      <h2>├ Cheap</h2>
      <h2>├ Modular</h2>
      <h2>├ Temporary</h2>
    </TextBlock>
  );
}
