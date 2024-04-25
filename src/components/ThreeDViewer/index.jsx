import React, { useRef, useEffect, useState } from "react";
import LightSource from "../LightSource";

function ImageViewer() {
  const [imageObject, setImageObject] = useState(null);
  const canvasRef = useRef(null);
  // const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [lightSources, setLightSources] = useState([
    {
      // Position relative to the top-right corner of the canvas
      x: 1, // 100% of the canvas width
      y: 0, // Top edge
      color: "#ffffff"
    }
  ]); // Initial position
  const [canvasBounds, setCanvasBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [canvasParent, setCanvasParent] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const sendLightSourceData = () => {
    // Extract position, height (based on canvas), and color for each light source
    const lightSourceData = lightSources.map(source => ({
      position: {
        x: source.x, // Convert relative to absolute
        y: source.y
      },
      canvasWidth: canvasBounds.width,
      canvasHeight: canvasBounds.height,
      height: canvasBounds.height || 0,
      color: hexToRGB(source.color)
    }));

    fetch("http://localhost:5000/update_light", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ lightSources: lightSourceData })
    })
      .then(response => response.json())
      .then(data => {
        const shading_base64String = data["shading_image"]; // replace with your actual base64 string key
        const shading_image = new Image();
        shading_image.onload = () => {
          window.updateImageViewer(shading_image);
        };
        shading_image.src = `data:image/jpeg;base64,${shading_base64String}`;
      })
      .catch(error => {
        console.error("Error updating light sources:", error);
      });
  };
  const handleLightSourceChange = (index, newPosition) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Canvas not available.");
      return;
    }
    const parentDiv = canvas.parentElement;

    const parentBounds = parentDiv.getBoundingClientRect();
    const relativeX = canvasBounds.left - parentBounds.left;
    const relativeY = canvasBounds.top - parentBounds.top;

    const { width, height, left, top } = canvas.getBoundingClientRect();

    if (width === 0 || height === 0) {
      console.error("Canvas size is zero, unable to update light source.");
      return;
    }

    const adjustedX = newPosition.x - relativeX;
    const adjustedY = newPosition.y - relativeY;
    const clampedX = Math.max(0, Math.min(adjustedX, width));
    const clampedY = Math.max(0, Math.min(adjustedY, height));
    const updatedLightSources = [...lightSources];

    updatedLightSources[index] = {
      ...updatedLightSources[index],
      x: clampedX,
      y: clampedY
    };
    setLightSources(updatedLightSources);
  };

  const handleAddLightSource = () => {
    const newLightSource = {
      x: 0.5, // Center of the canvas
      y: 0.5,
      color: "#ffffff"
    };

    setLightSources([...lightSources, newLightSource]);
  };

  const handleDeleteLightSource = index => {
    const updatedLightSources = lightSources.filter((_, i) => i !== index);
    setLightSources(updatedLightSources);
  };

  const handleColorChange = (index, newColor) => {
    const updatedLightSources = [...lightSources];
    updatedLightSources[index].color = newColor;
    setLightSources(updatedLightSources);
  };

  useEffect(() => {
    sendLightSourceData(); // Send the updated data
  }, [lightSources]); // Dependency on `lightSources`

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const bounds = canvas.getBoundingClientRect(); // Get canvas bounds
      setCanvasBounds(bounds); // Set initial canvas bounds
      const parentDiv = canvas.parentElement;

      const parentBounds = parentDiv.getBoundingClientRect();
      setCanvasParent(parentBounds);
    }
    const handleUpdateImage = event => {
      const image = event.detail.image;
      setImageObject(image);
      // Ensure we are targeting the correct canvas by adding a unique identifier if necessary
      if (canvasRef.current && image) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const parentDiv = canvas.parentElement;
        const { width: parentWidth, height: parentHeight } = parentDiv.getBoundingClientRect();

        const scaleWidth = (parentWidth * 0.9) / image.width;
        const scaleHeight = (parentHeight * 0.9) / image.height;
        const scale = Math.min(scaleWidth, scaleHeight, 1); // 确保不放大超过原始尺寸

        const canvasWidth = image.width * scale;
        const canvasHeight = image.height * scale;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        // setCanvasSize({ width: canvasWidth, height: canvasHeight }); // Update canvas size
        if (canvas) {
          const bounds = canvas.getBoundingClientRect(); // Get canvas bounds
          setCanvasBounds(bounds); // Set initial canvas bounds
          const parentDiv = canvas.parentElement;
          const parentBounds = parentDiv.getBoundingClientRect();
          setCanvasParent(parentBounds);
        }
        // Additional logging to check if the drawing happens
        console.log(`Image drawn on canvas: ${canvas.toDataURL().substring(0, 30)}...`);
      } else {
        console.error("Canvas not available or image not loaded");
      }
    };
    const handleResize = event => {
      const image = imageObject;
      if (canvasRef.current && image) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const parentDiv = canvas.parentElement;
        const rect = parentDiv.getBoundingClientRect();

        const scaleWidth = (rect.width * 0.9) / imageObject.width;
        const scaleHeight = (rect.height * 0.9) / imageObject.height;
        const scale = Math.min(scaleWidth, scaleHeight, 1);

        const canvasWidth = imageObject.width * scale;
        const canvasHeight = imageObject.height * scale;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        if (canvas) {
          const bounds = canvas.getBoundingClientRect(); // Get canvas bounds
          setCanvasBounds(bounds); // Set initial canvas bounds
          const parentDiv = canvas.parentElement;
          const parentBounds = parentDiv.getBoundingClientRect();
          setCanvasParent(parentBounds);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        // setCanvasSize({ canvasWidth, canvasHeight });
      }
    };

    window.addEventListener("update-image", handleUpdateImage);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("update-image", handleUpdateImage);
      window.removeEventListener("resize", handleResize);
    };
  }, [imageObject]);

  const buttonStyle = {
    backgroundColor: "#4CAF50", // Green background
    color: "white",
    padding: "15px 32px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    cursor: "pointer",
    borderRadius: "8px" // Rounded corners
  };
  return (
    <div
      style={{
        position: "relative", // Required for absolute positioning
        display: "flex",
        justifyContent: "center", // centers canvas horizontally
        alignItems: "center", // centers canvas vertically
        width: "100%", // ensures container takes full width
        height: "100%" // ensures container takes full height
      }}
    >
      {lightSources.map((lightSource, index) => (
        <LightSource
          key={index}
          initialPosition={{
            x: lightSource.x, // Absolute position relative to the canvas size
            y: lightSource.y
          }}
          initialColor={lightSource.color || "white"}
          onPositionChange={newPosition => handleLightSourceChange(index, newPosition)}
          onDelete={() => handleDeleteLightSource(index)}
          onColorChange={newColor => handleColorChange(index, newColor)}
          canvasParent={canvasParent}
        />
      ))}
      <canvas ref={canvasRef} />
      <button
        onClick={handleAddLightSource}
        style={{
          ...buttonStyle,
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)" // Center the button horizontally
        }}
      >
        Add Light Source
      </button>
    </div>
  );
}

window.updateImageViewer = function (imageObject) {
  const event = new CustomEvent("update-image", { detail: { image: imageObject } });
  window.dispatchEvent(event);
};

function hexToRGB(hex) {
  // Remove the hash symbol if it's there
  const trimmedHex = hex.replace("#", "");

  // Parse the hexadecimal values
  const bigint = parseInt(trimmedHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

export default ImageViewer;
