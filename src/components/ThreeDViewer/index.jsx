import React, { useRef, useEffect, useState } from "react";

function ImageViewer() {
  const [imageObject, setImageObject] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleUpdateImage = event => {
      const image = event.detail.image;
      console.log("Received image dimensions:", image.width, image.height);
      setImageObject(image);
      // Ensure we are targeting the correct canvas by adding a unique identifier if necessary
      if (canvasRef.current && image) {
        const canvas = canvasRef.current;
        console.log("Canvas element:", canvas); // Check if the canvas element is correct
        const ctx = canvas.getContext("2d");

        const parentDiv = canvas.parentElement;
        const { width: parentWidth, height: parentHeight } = parentDiv.getBoundingClientRect();

        const scaleWidth = (parentWidth * 0.75) / image.width;
        const scaleHeight = (parentHeight * 0.75) / image.height;
        const scale = Math.min(scaleWidth, scaleHeight, 1); // 确保不放大超过原始尺寸

        const canvasWidth = image.width * scale;
        const canvasHeight = image.height * scale;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        console.log("windows element:", window.innerWidth);
        console.log("Canvas dimensions set to image size:", canvas.width, canvas.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Additional logging to check if the drawing happens
        console.log(`Image drawn on canvas: ${canvas.toDataURL().substring(0, 30)}...`);
      } else {
        console.error("Canvas not available or image not loaded");
      }
    };
    const handleResize = event => {
      const image = imageObject; // 您需要在这里正确地引用图片对象
      if (canvasRef.current && image) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const parentDiv = canvas.parentElement;
        const rect = parentDiv.getBoundingClientRect(); // 这里获取宽高

        const scaleWidth = (rect.width * 0.75) / imageObject.width;
        const scaleHeight = (rect.height * 0.75) / imageObject.height;
        const scale = Math.min(scaleWidth, scaleHeight, 1); // 确保不放大超过原始尺寸

        const canvasWidth = imageObject.width * scale;
        const canvasHeight = imageObject.height * scale;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 清除画布并绘制新尺寸的图片
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener("update-image", handleUpdateImage);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("update-image", handleUpdateImage);
      window.removeEventListener("resize", handleResize);
    };
  }, [imageObject]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center", // centers canvas horizontally
        alignItems: "center", // centers canvas vertically
        width: "100%", // ensures container takes full width
        height: "100%" // ensures container takes full height
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

window.updateImageViewer = function (imageObject) {
  const event = new CustomEvent("update-image", { detail: { image: imageObject } });
  window.dispatchEvent(event);
};

export default ImageViewer;
