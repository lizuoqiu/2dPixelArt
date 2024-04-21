import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { SketchPicker } from "react-color"; // Color picker from react-color

function LightSource({
  initialPosition,
  initialColor = "white",
  onPositionChange,
  onDelete,
  onColorChange,
  canvasBounds
}) {
  const [position, setPosition] = useState(initialPosition);
  const [color, setColor] = useState(initialColor);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleDragEnd = event => {
    const newX = event.clientX;
    const newY = event.clientY;
    // Adjust by the canvas's top-left offset
    const adjustedX = newX - canvasBounds.left;
    const adjustedY = newY - canvasBounds.top;

    // Clamp within the canvas's bounds
    const clampedX = Math.max(0, Math.min(adjustedX, canvasBounds.width));
    const clampedY = Math.max(0, Math.min(adjustedY, canvasBounds.height));

    const newPosition = { x: clampedX, y: clampedY };
    console.log("new posisiton: ", newPosition);
    console.log("new canvasBounds: ", canvasBounds);
    onPositionChange(newPosition);
    setPosition(newPosition);
  };

  const handleRightClick = event => {
    event.preventDefault(); // Prevent default context menu
    setShowColorPicker(!showColorPicker);
  };

  const handleColorChange = newColor => {
    setColor(newColor.hex);
    onColorChange(newColor.hex);
    setShowColorPicker(false); // Close the color picker
  };

  return (
    <div
      draggable
      onDragEnd={handleDragEnd}
      onContextMenu={handleRightClick}
      style={{
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: "30px",
        height: "30px",
        backgroundColor: color,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "move"
      }}
    >
      <FontAwesomeIcon icon={faLightbulb} />
      {showColorPicker && (
        <div style={{ position: "absolute", top: 30 }}>
          <SketchPicker color={color} onChangeComplete={handleColorChange} />
        </div>
      )}
    </div>
  );
}

export default LightSource;
