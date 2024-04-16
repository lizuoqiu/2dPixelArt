import React, { useState, useEffect } from "react";
import ThreeDViewerStyle from "./style";

function ImageContainer() {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const fetchImageData = async () => {
      try {
        const response = await fetch("https://your-backend-url/api/images");
        const blob = await response.blob(); // 假设后端直接返回一个图片的Blob数据
        setImageData(blob);
      } catch (error) {
        console.error("Failed to fetch image data:", error);
      }
    };

    fetchImageData();
  }, []);

  return (
    <div>
      <h1>View 3D Image</h1>
      {imageData && (
        <img
          src={URL.createObjectURL(imageData)}
          alt="3D Visualization"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      )}
    </div>
  );
}

export default ImageContainer;

//1. 8 directions
//2. points movement
//3. zoom in and out
//4. light point(3d viewer)
//5. color picker
//6. dynemic lines.
