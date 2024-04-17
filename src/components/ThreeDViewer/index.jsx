import React, { useState, useEffect, useRef } from "react";

function ImageViewer() {
  const [image, setImage] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleUpdateImage = event => {
      console.log("Event received:", event); // Debug: Check if events are received
      const image = event.detail.image;
      if (canvasRef.current && image) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
      } else {
        console.error("Canvas not available or image not loaded");
      }
      // const img = new Image();
      // img.onload = () => {
      //   // Determine the initial scale to ensure the longest side is no more than 1000 pixels
      //   let maxDimension = Math.max(img.width, img.height);
      //   let initialScale = maxDimension > 1000 ? 1000 / maxDimension : 1;
      //   setImage(img);
      //   setScale(initialScale);
      // };
      // img.src = null; // Set the source to your image URL
    };

    window.addEventListener("update-image", handleUpdateImage);
    return () => {
      window.removeEventListener("update-image", handleUpdateImage);
    };
  }, []);

  useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      // Recalculate the scale for resizing
      let maxDimension = Math.max(image.width, image.height);
      let dynamicScale = maxDimension > 1000 ? 1000 / maxDimension : 1;
      if (scale * maxDimension > 1000) dynamicScale = 1000 / maxDimension;

      canvasRef.current.width = image.width * dynamicScale;
      canvasRef.current.height = image.height * dynamicScale;

      drawImage(ctx, image, offset.x, offset.y, dynamicScale);
    }
  }, [offset, scale, image]);

  function drawImage(ctx, img, offsetX, offsetY, scale) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    ctx.save(); // Save the current state
    ctx.translate(offsetX, offsetY); // Move the context to pan
    ctx.scale(scale, scale); // Apply the scale
    ctx.drawImage(img, 0, 0, img.width, img.height); // Draw the image
    ctx.restore(); // Restore the context to the original state
  }

  const handleWheel = e => {
    e.preventDefault();
    const scaleFactor = 1.1;
    setScale(prevScale => prevScale * (e.deltaY < 0 ? scaleFactor : 1 / scaleFactor));
  };

  const handleMouseDown = e => {
    const startX = e.clientX - offset.x;
    const startY = e.clientY - offset.y;
    const handleMouseMove = moveEvent => {
      setOffset({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div>
      {/*<h1>Image Viewer</h1>*/}
      <canvas ref={canvasRef} onWheel={handleWheel} onMouseDown={handleMouseDown} style={{ cursor: "grab" }}></canvas>
    </div>
  );
}

window.updateImageViewer = function (imageObject) {
  const event = new CustomEvent("update-image", { detail: { image: imageObject } });
  window.dispatchEvent(event);
};

export default ImageViewer;
