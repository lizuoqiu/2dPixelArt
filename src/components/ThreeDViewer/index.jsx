import React, { useState, useEffect } from "react";
import ThreeDViewerStyle from "./style";

function ThreeDViewer({ imageData }) {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (imageData) {
      // 将ArrayBuffer转换为Blob
      const blob = new Blob([imageData], { type: "image/png" }); // 假设图片格式为JPEG，根据实际情况调整
      // 创建Blob URL
      const url = URL.createObjectURL(blob);
      setImageSrc(url);

      // 清理函数：当组件卸载或者imageData变化时，释放URL对象
      return () => URL.revokeObjectURL(url);
    }
  }, [imageData]);

  return (
    <ThreeDViewerStyle>
      {imageSrc && <img src={imageSrc} alt="123" style={{ maxWidth: "100%", maxHeight: "100%" }} />}
    </ThreeDViewerStyle>
  );
}

export default ThreeDViewer;
