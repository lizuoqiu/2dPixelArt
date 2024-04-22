import React, { Component, createRef } from "react";

class CombinedInfoSender extends Component {
  constructor() {
    super();
    this.canvasRef = createRef();
    this.state = {
      selectedDirection: null,
      points: []
    };
  }

  componentDidMount() {
    this.drawDirections();
  }

  drawDirections = () => {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext("2d");
  };

  selectDirection = e => {};

  handlePointSelection = e => {
    const newPoint = { x: e.clientX, y: e.clientY };
    this.setState(prevState => ({
      points: [...prevState.points, newPoint]
    }));
  };

  sendDataToBackend = async () => {
    const { selectedDirection, points } = this.state;
    console.log(selectedDirection);
    try {
      const response = await fetch("/api/send-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ direction: selectedDirection, points: points })
      });
      if (response.ok) {
        console.log("Data sent successfully");
      } else {
        console.log("Failed to send data");
      }
    } catch (error) {
      console.error("Failed to send data", error);
    }
  };

  render() {
    return (
      <div>
        <canvas ref={this.canvasRef} width="300" height="300" onClick={this.selectDirection} />
        {this.state.selectedDirection && <p>SelectedDirection: {this.state.selectedDirection}</p>}
        {this.state.points.length > 0 && (
          <ul>
            {this.state.points.map((point, index) => (
              <li key={index}>{`${index + 1}: (${point.x}, ${point.y})`}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default CombinedInfoSender;
