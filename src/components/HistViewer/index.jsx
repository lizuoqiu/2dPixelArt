import React, { Component } from "react";
import { connect } from "react-redux";
import { selectors as imageSelectors } from "store/image";
import RangeSlider from "./rangeslider";
import HistViewerStyle from "./style";
import { getImageData } from "utils/drawHistogram";

class DirectionSelector extends Component {
  constructor() {
    super();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    data: []
  };
  componentDidUpdate(prevProps) {
    let { memoryDepthCanvas, parameters } = this.props;
    if (
      prevProps.parameters.croppedCanvasImage !== parameters.croppedCanvasImage ||
      prevProps.memoryDepthCanvas !== memoryDepthCanvas
    ) {
      if (memoryDepthCanvas) {
        if (parameters.croppedCanvasImage) {
          let histDepthData = getImageData(parameters.croppedCanvasImage);
          this.setState({ data: histDepthData });
        } else {
          let histDepthData = getImageData(memoryDepthCanvas);
          this.setState({ data: histDepthData });
        }
      } else {
        this.setState({ data: [] });
      }
    }
  }
  render() {
    const handleDirectionClick = direction => {
      console.log("Selected Direction:", direction);
      // 这里可以根据所选方向执行更多动作
    };
    return (
      <div className="direction-selector">
        <button onClick={() => handleDirectionClick("Up")}>Up</button>
        <button onClick={() => handleDirectionClick("Down")}>Down</button>
        <button onClick={() => handleDirectionClick("Left")}>Left</button>
        <button onClick={() => handleDirectionClick("Right")}>Right</button>
        <button onClick={() => handleDirectionClick("Upper Left")}>Upper Left</button>
        <button onClick={() => handleDirectionClick("Upper Right")}>Upper Right</button>
        <button onClick={() => handleDirectionClick("Lower Left")}>Lower Left</button>
        <button onClick={() => handleDirectionClick("Lower Right")}>Lower Right</button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  parameters: imageSelectors.parameters(state)
});

const mapDispatchToProps = {};

export default DirectionSelector;
