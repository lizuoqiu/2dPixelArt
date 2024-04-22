import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { SketchPicker } from "react-color"; // Color picker from react-color

function LightSource({
  initialPosition,
  initialColor = "white",
  onPositionChange,
  onDelete,
  canvasParent,
  onColorChange
}) {
  const [position, setPosition] = useState(initialPosition);
  const [color, setColor] = useState(initialColor);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleDragEnd = event => {
    const newX = event.clientX;
    const newY = event.clientY;
    const adjustedX = newX - canvasParent.left;
    const adjustedY = newY - canvasParent.top;
    const newPosition = { x: adjustedX, y: adjustedY };
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
