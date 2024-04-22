import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions, selectors as imageSelectors } from "../../store/image";

class DirectionSelector extends Component {
  constructor() {
    super();
    this.directionRef = createRef();
  }
  state = {
    selectedDirection: null,
    polygonPoints: []
  };

  drawDirections = () => {
    const canvas = this.directionRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "50px Arial";
    ctx.fillText("↑", canvas.width / 2 - 15, 50);
    ctx.fillText("↓", canvas.width / 2 - 15, canvas.height - 20);
    ctx.fillText("←", 30, canvas.height / 2 + 15);
    ctx.fillText("→", canvas.width - 80, canvas.height / 2 + 15);
    ctx.fillText("↖", 30, 70);
    ctx.fillText("↗", canvas.width - 80, 70);
    ctx.fillText("↙", 30, canvas.height - 20);
    ctx.fillText("↘", canvas.width - 80, canvas.height - 20);
  };

  componentDidMount() {
    this.drawDirections();
  }

  selectDirection = e => {
    const rect = this.directionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = this.directionRef.current.width;
    const height = this.directionRef.current.height;
    const position = { x, y };

    const margin = width * 0.3;

    if (x < margin && y < margin) {
      this.setState({ selectedDirection: "TOP-LEFT" });
    } else if (x > width - margin && y < margin) {
      this.setState({ selectedDirection: "TOP-RIGHT" });
    } else if (x < margin && y > height - margin) {
      this.setState({ selectedDirection: "BOTTOM-LEFT" });
    } else if (x > width - margin && y > height - margin) {
      this.setState({ selectedDirection: "BOTTOM-RIGHT" });
    } else if (x > width * 0.3 && x < width * 0.7 && y < height * 0.3) {
      this.setState({ selectedDirection: "UP" });
    } else if (x > width * 0.3 && x < width * 0.7 && y > height * 0.7) {
      this.setState({ selectedDirection: "DOWN" });
    } else if (y > height * 0.3 && y < height * 0.7 && x < width * 0.3) {
      this.setState({ selectedDirection: "LEFT" });
    } else if (y > height * 0.3 && y < height * 0.7 && x > width * 0.7) {
      this.setState({ selectedDirection: "RIGHT" });
    }
  };

  sendDataToBackend = () => {
    const { initDepth } = this.props;
    const { selectedDirection, polygonPoints } = this.state;
    const { pointerList, canvasSize } = this.props;
    if (!selectedDirection) {
      alert("choose a direction");
      return;
    }
    fetch("http://localhost:5000/update_normal_map", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        direction: selectedDirection,
        pointerList: pointerList,
        canvasSize: canvasSize
      })
    })
      .then(response => response.json())
      .then(data => {
        const normal_map_base64String = data["normal_map"];
        const img = new Image();
        img.onload = () => {
          initDepth(img);
        };
        img.src = `data:image/jpeg;base64,${normal_map_base64String}`;
        const shading_base64String = data["shading_image"];
        const shading_image = new Image();
        shading_image.onload = () => {
          window.updateImageViewer(shading_image);
        };
        shading_image.src = `data:image/jpeg;base64,${shading_base64String}`;
      })
      .catch(error => {
        console.error("failed:", error);
      });
  };

  render() {
    const buttonStyle = {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "15px 32px",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      fontSize: "16px",
      margin: "4px 2px",
      cursor: "pointer",
      borderRadius: "8px"
    };

    return (
      <div>
        <canvas ref={this.directionRef} width="250" height="250" onClick={this.selectDirection} />
        {this.state.selectedDirection && (
          <div>
            <p style={{ color: "white" }}>Selected Direction: {this.state.selectedDirection}</p>
            <button style={buttonStyle} onClick={this.sendDataToBackend}>
              Update Normal Map :)
            </button>
          </div>
        )}
      </div>
    );
  }
}
const mapStateToProps = state => ({
  pointerList: imageSelectors.pointerList(state),
  canvasSize: imageSelectors.canvasSize(state)
});

const mapDispatchToProps = {
  initDepth: imageActions.initDepth
};

export default connect(mapStateToProps, mapDispatchToProps)(DirectionSelector);
