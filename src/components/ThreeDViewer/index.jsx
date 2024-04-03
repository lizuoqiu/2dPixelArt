import React from "react";
import ThreeDViewerStyle from "./style"; // 保留样式import，以便您可以自定义图片和容器的样式

function ThreeDViewer({ imageUrl }) {
  return (
    <ThreeDViewerStyle>
      <img src={imageUrl} alt="Max,Crimson,Scoot" style={{ maxWidth: "100%", maxHeight: "100%" }} />
    </ThreeDViewerStyle>
  );
}

export default ThreeDViewer;
