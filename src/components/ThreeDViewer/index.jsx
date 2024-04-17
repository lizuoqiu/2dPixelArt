import React, { useRef, useEffect } from "react";

function ImageViewer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleUpdateImage = event => {
      const image = event.detail.image;
      console.log("Received image dimensions:", image.width, image.height);
      if (canvasRef.current && image) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        // Calculate the scale to ensure the largest side is no more than 1000 pixels
        const maxDimension = Math.max(image.width, image.height);
        const scale = maxDimension > 1000 ? 1000 / maxDimension : 1;

        // Apply the scale to canvas dimensions
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        console.log("Scaled canvas dimensions:", canvas.width, canvas.height);

        // Clear the canvas and draw the new image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      } else {
        console.error("Canvas not available or image not loaded");
      }
    };
    const handleResize = event => {};

    window.addEventListener("update-image", handleUpdateImage);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("update-image", handleUpdateImage);
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: "1000px", // Limit the size of the canvas container
        maxHeight: "100%",
        margin: "auto", // Center the canvas container
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid red" // Temporary border to visualize the container
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: "100%",
          maxHeight: "100%"
        }}
      />
    </div>
  );
}

window.updateImageViewer = function (imageObject) {
  const event = new CustomEvent("update-image", { detail: { image: imageObject } });
  window.dispatchEvent(event);
};

export default ImageViewer;
