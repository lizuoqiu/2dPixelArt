import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faTrash, faPalette } from "@fortawesome/free-solid-svg-icons";
import { SketchPicker } from "react-color"; // Color picker from react-color

function LightSource({
  initialPosition,
  initialColor = "white",
  onPositionChange,
  onDelete,
  canvasParent,
  canvasBounds,
  onColorChange
}) {
  const [position, setPosition] = useState(initialPosition);
  const [color, setColor] = useState(initialColor);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const handleDragEnd = event => {
    const newX = event.clientX;
    const newY = event.clientY;
    const adjustedX = newX - canvasParent.left;
    const adjustedY = newY - canvasParent.top;
    const newPosition = { x: adjustedX, y: adjustedY };
    console.log("new point position: ", newPosition);
    onPositionChange(newPosition);
    setPosition(newPosition);
  };

  const handleContextMenu = event => {
    event.preventDefault();
    setContextMenuVisible(true);
  };

  const handleDelete = () => {
    onDelete();
    setContextMenuVisible(false);
  };

  const handleColorPicker = () => {
    setShowColorPicker(!showColorPicker);
    setContextMenuVisible(false);
  };

  const handleColorChange = newColor => {
    setColor(newColor.hex);
    onColorChange(newColor.hex);
    setShowColorPicker(false); // Close the color picker
    setContextMenuVisible(false);
  };

  return (
    <div
      draggable
      onDragEnd={handleDragEnd}
      onContextMenu={handleContextMenu}
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
        cursor: "move",
        zIndex: 999
      }}
    >
      <FontAwesomeIcon icon={faLightbulb} />
      {contextMenuVisible && (
        <div
          style={{
            position: "absolute",
            top: `25px`,
            left: `25px`,
            background: "#f9f9f9",
            border: "1px solid #ccc",
            padding: "10px"
          }}
        >
          <div onClick={handleDelete} style={{ cursor: "pointer", marginBottom: "10px" }}>
            <FontAwesomeIcon icon={faTrash} /> Delete
          </div>
          <div onClick={handleColorPicker} style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faPalette} /> Change Color
          </div>
        </div>
      )}
      {showColorPicker && (
        <div style={{ position: "absolute", top: 30 }}>
          <SketchPicker color={color} onChangeComplete={handleColorChange} />
        </div>
      )}
    </div>
  );
}

export default LightSource;
