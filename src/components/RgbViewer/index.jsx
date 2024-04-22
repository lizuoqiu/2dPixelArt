import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import RgbViewerStyle from "./style";
import { getImageUrl } from "utils/generalUtils";
import {
  canvasLike,
  canvasResize,
  cloneCanvas,
  cropCanvas,
  downScaleBox,
  drawBox,
  drawCanvasImage,
  drawScaledCanvasImage,
  getBoundingArea,
  getBoundingBox,
  upScaleBox,
  getRatio,
  highlightPixelAreaRgb
} from "utils/canvasUtils";
import { runRgbOperations } from "utils/stackOperations";

let objectUrl = null;

class RgbViewer extends Component {
  constructor() {
    super();
    this.rgbImageRef = createRef();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    polygonPoints: [],
    isDrawingMode: false,
    originalImageSize: { width: 0, height: 0 }
  };
  toggleDrawingMode = () => {
    this.setState(prevState => ({
      isDrawingMode: !prevState.isDrawingMode
    }));
  };
  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
    const canvas = this.rgbImageRef.current;
    canvas.addEventListener("click", this.addPolygonPoint);
    canvas.addEventListener("dblclick", this.closePolygon);
    let width = canvas.width;
    let height = canvas.height;
    this.props.canvas_size_update({ width, height });
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    const canvas = this.rgbImageRef.current;
    canvas.removeEventListener("click", this.addPolygonPoint);
    canvas.removeEventListener("dblclick", this.closePolygon);
  }
  componentDidUpdate(prevProps, prevState) {
    let { rgbImageRef } = this;
    let {
      canvasSize,
      pointerList,
      rgbImageUrl,
      mainRgbCanvas,
      memoryRgbCanvas,
      memoryDepthCanvas,
      boxParams,
      rgbScaleParams,
      prevRgbSize,
      isPanActive,
      activeDepthTool,
      parameters,
      operationStack,
      initImage,
      initRgb,
      storeScaleParams,
      storeParameters,
      addEffect
    } = this.props;
    let rgbCanvas = rgbImageRef.current;
    let rgbContext = rgbCanvas.getContext("2d");
    if (prevState.polygonPoints !== this.state.polygonPoints) {
      this.props.point_list_update(this.state.polygonPoints);
    }
    if (prevProps.rgbImageUrl !== rgbImageUrl) {
      rgbContext.clearRect(0, 0, prevRgbSize.width, prevRgbSize.height);
      let rgbImage = new Image();
      if (typeof rgbImageUrl === "object") {
        objectUrl = getImageUrl(rgbImageUrl);
        rgbImage.src = objectUrl;
      } else {
        rgbImage.src = rgbImageUrl;
      }
      rgbImage.onload = () => {
        this.setState({
          originalImageSize: { width: rgbImage.width, height: rgbImage.height }
        });
        if (Math.max(rgbImage.height, rgbImage.width) > 1000) {
          rgbImage = canvasResize(rgbImage);
        }
        initRgb(cloneCanvas(rgbImage));
      };
    }
    if (prevProps.mainRgbCanvas !== mainRgbCanvas) {
      if (mainRgbCanvas) {
        const { ratio, centerShift_x, centerShift_y } = getRatio(mainRgbCanvas, rgbCanvas);
        initImage({
          prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
        });
        storeScaleParams({ name: "rgbScaleParams", value: { ratio, centerShift_x, centerShift_y } });
        addEffect({
          name: "rgbStack",
          value: {
            func: drawCanvasImage,
            params: []
          }
        });
      }
    }
    if (prevProps.operationStack.rgbStack !== operationStack.rgbStack) {
      if (mainRgbCanvas) {
        runRgbOperations(mainRgbCanvas);
      }
    }
    if (
      prevProps.memoryRgbCanvas !== memoryRgbCanvas ||
      prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange ||
      prevProps.rgbScaleParams !== rgbScaleParams ||
      prevProps.boxParams.end !== boxParams.end
    ) {
      if (memoryRgbCanvas) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = rgbScaleParams;
        drawScaledCanvasImage(memoryRgbCanvas, rgbCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
        if ((parameters.histogramParams.pixelRange || parameters.croppedArea) && memoryDepthCanvas) {
          const { croppedArea, histogramParams } = parameters;
          const depthCanvas = canvasLike(rgbCanvas);
          drawScaledCanvasImage(
            memoryDepthCanvas,
            depthCanvas,
            ratio,
            centerShift_x,
            centerShift_y,
            scale,
            translatePos
          );
          const depthContext = depthCanvas.getContext("2d");
          let newArea = null;
          if (croppedArea) {
            newArea = croppedArea;
          } else {
            newArea = getBoundingArea(memoryRgbCanvas);
          }
          highlightPixelAreaRgb(
            rgbCanvas,
            depthContext,
            downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
            histogramParams.pixelRange
          );
        }
        if (parameters.croppedArea) {
          drawBox(
            rgbCanvas,
            downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
        if (boxParams.end) {
          let { x1, y1 } = boxParams.start;
          let { x2, y2 } = boxParams.end;
          let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryRgbCanvas, rgbScaleParams);
          if (croppedArea) drawBox(rgbCanvas, croppedArea);
        }
      } else {
        let rgbContext = rgbCanvas.getContext("2d");
        rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
      }
    }
    if (prevProps.isPanActive !== isPanActive) {
      if (isPanActive && activeDepthTool) {
        rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
        rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
        rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
      }
      if (!isPanActive && activeDepthTool) {
        rgbCanvas.addEventListener("mousedown", this.handleMouseDown);
        rgbCanvas.addEventListener("mouseup", this.handleMouseUp);
        rgbCanvas.addEventListener("mouseout", this.handleMouseUp);
        rgbCanvas.addEventListener("mouseover", this.handleMouseUp);
        rgbCanvas.addEventListener("mousemove", this.handleMouseMove);
      }
    }
    if (prevProps.activeDepthTool !== activeDepthTool) {
      if (activeDepthTool) {
        if (!isPanActive) {
          rgbCanvas.addEventListener("mousedown", this.handleMouseDown);
          rgbCanvas.addEventListener("mouseup", this.handleMouseUp);
          rgbCanvas.addEventListener("mouseout", this.handleMouseUp);
          rgbCanvas.addEventListener("mouseover", this.handleMouseUp);
          rgbCanvas.addEventListener("mousemove", this.handleMouseMove);
        } else {
          rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
          rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
          rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
          rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
          rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
        }
      } else {
        rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
        rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
        rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
        rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
        storeParameters({
          croppedCanvasImage: null,
          croppedArea: null,
          histogramParams: {
            pixelRange: [0, 255],
            domain: [0, 255],
            values: [0, 255],
            update: [0, 255]
          }
        });
      }
    }
    if (prevProps.rgbImageUrl !== rgbImageUrl) {
      rgbContext.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
      let rgbImage = new Image();
      if (typeof rgbImageUrl === "object") {
        objectUrl = getImageUrl(rgbImageUrl);
        rgbImage.src = objectUrl;
      } else {
        rgbImage.src = rgbImageUrl;
      }
      rgbImage.onload = () => {
        if (Math.max(rgbImage.height, rgbImage.width) > 1000) {
          rgbImage = canvasResize(rgbImage);
        }
        rgbCanvas.getContext("2d").drawImage(rgbImage, 0, 0, rgbCanvas.width, rgbCanvas.height);
        initRgb(cloneCanvas(rgbImage));
        this.drawPolygon();
      };
    }
  }
  componentWillUnmount() {
    let rgbCanvas = this.rgbImageRef.current;
    window.removeEventListener("resize", this.handleResize);
    rgbCanvas.removeEventListener("mousedown", this.handleMouseDown);
    rgbCanvas.removeEventListener("mouseup", this.handleMouseUp);
    rgbCanvas.removeEventListener("mouseout", this.handleMouseUp);
    rgbCanvas.removeEventListener("mouseover", this.handleMouseUp);
    rgbCanvas.removeEventListener("mousemove", this.handleMouseMove);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    const { memoryRgbCanvas, memoryDepthCanvas, rgbScaleParams, boxParams, parameters, initImage, storeScaleParams } =
      this.props;
    const { translatePos, scale } = rgbScaleParams;
    const rgbCanvas = this.rgbImageRef.current;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    if (rgbCanvas && memoryRgbCanvas) {
      rgbCanvas.width = (window.innerWidth / 1500) * 521;
      rgbCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(memoryRgbCanvas, rgbCanvas);
      initImage({
        prevRgbSize: { width: rgbCanvas.width, height: rgbCanvas.height }
      });
      storeScaleParams({ name: "rgbScaleParams", value: { ratio, centerShift_x, centerShift_y } });
      drawScaledCanvasImage(memoryRgbCanvas, rgbCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
      if ((parameters.histogramParams.pixelRange || parameters.croppedArea) && memoryDepthCanvas) {
        const { croppedArea, histogramParams } = parameters;
        const depthCanvas = canvasLike(rgbCanvas);
        drawScaledCanvasImage(memoryDepthCanvas, depthCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
        const depthContext = depthCanvas.getContext("2d");
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = getBoundingArea(memoryRgbCanvas);
        }
        highlightPixelAreaRgb(
          rgbCanvas,
          depthContext,
          downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
          histogramParams.pixelRange
        );
      }
      if (parameters.croppedArea) {
        drawBox(
          rgbCanvas,
          downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
        );
      }
      if (boxParams.end) {
        let { x1, y1 } = boxParams.start;
        let { x2, y2 } = boxParams.end;
        let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryRgbCanvas, rgbScaleParams);
        if (croppedArea) drawBox(rgbCanvas, croppedArea);
      }
    }
  };

  handleMouseDown = event => {
    if (this.state.isDrawingMode) {
      const { offsetX, offsetY } = event.nativeEvent;
      this.setState(prevState => ({
        polygonPoints: [...prevState.polygonPoints, { x: offsetX, y: offsetY }]
      }));
    }
  };
  handleMouseMove = event => {
    if (!this.state.isDrawingMode || event.buttons !== 1) return;
    let { memoryRgbCanvas, boxParams, storeBoxParams } = this.props;
    if (event.buttons !== 1 || !boxParams.start) return;
    if (memoryRgbCanvas) {
      let x = event.offsetX;
      let y = event.offsetY;
      storeBoxParams({
        end: { x2: x, y2: y }
      });
    }
  };
  handleMouseUp = () => {
    let { memoryDepthCanvas, boxParams, depthScaleParams, storeBoxParams, storeParameters } = this.props;
    if (memoryDepthCanvas && boxParams.end) {
      let { x1, y1 } = boxParams.start;
      let { x2, y2 } = boxParams.end;
      let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryDepthCanvas, depthScaleParams);
      if (croppedArea) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = depthScaleParams;
        croppedArea = upScaleBox(croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale);
        storeParameters({
          croppedCanvasImage: cropCanvas(memoryDepthCanvas, croppedArea),
          croppedArea: croppedArea
        });
      }
    }
    const rgbCanvas = this.rgbImageRef.current;
    rgbCanvas.style.cursor = "default";
    storeBoxParams({
      start: null,
      end: null
    });
  };
  addPolygonPoint = e => {
    const { offsetX, offsetY } = e;
    const newPoint = { x: offsetX, y: offsetY };
    const { polygonPoints } = this.state;
    this.setState(
      {
        polygonPoints: [...polygonPoints, newPoint]
      },
      () => {
        this.drawPolygon();
      }
    );
  };
  drawPolygon = () => {
    const { polygonPoints } = this.state;
    const ctx = this.rgbImageRef.current.getContext("2d");
    ctx.beginPath();
    polygonPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  };
  closePolygon = () => {
    const { polygonPoints } = this.state;
    if (polygonPoints.length > 2) {
      this.setState(
        {
          polygonPoints: [...polygonPoints, polygonPoints[0]]
        },
        () => {
          this.drawPolygon();
        }
      );
    }
  };
  render() {
    const { rgbImageRef } = this;
    const { rgbScaleParams, depthScaleParams, isPanActive, activeDepthTool, storeScaleParams } = this.props;
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
      <RgbViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={rgbImageRef}
          style={{ cursor: isPanActive ? "grab" : "default" }}
          onMouseDown={e => {
            if (activeDepthTool) {
            }
            if (isPanActive) {
              storeScaleParams({
                name: "rgbScaleParams",
                value: {
                  startDragOffset: {
                    x: e.clientX - rgbScaleParams.translatePos.x,
                    y: e.clientY - rgbScaleParams.translatePos.y
                  },
                  mouseDown: true
                }
              });
              storeScaleParams({
                name: "depthScaleParams",
                value: {
                  startDragOffset: {
                    x: e.clientX - depthScaleParams.translatePos.x,
                    y: e.clientY - depthScaleParams.translatePos.y
                  },
                  mouseDown: true
                }
              });
            }
          }}
          onMouseUp={e => {
            if (activeDepthTool) {
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOver={e => {
            if (activeDepthTool) {
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOut={e => {
            if (activeDepthTool) {
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              depthScaleParams.mouseDown && storeScaleParams({ name: "depthScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseMove={e => {
            if (activeDepthTool) {
            }
            if (isPanActive) {
              if (depthScaleParams.mouseDown) {
                storeScaleParams({
                  name: "rgbScaleParams",
                  value: {
                    translatePos: {
                      x: e.clientX - rgbScaleParams.startDragOffset.x,
                      y: e.clientY - rgbScaleParams.startDragOffset.y
                    }
                  }
                });
                storeScaleParams({
                  name: "depthScaleParams",
                  value: {
                    translatePos: {
                      x: e.clientX - depthScaleParams.startDragOffset.x,
                      y: e.clientY - depthScaleParams.startDragOffset.y
                    }
                  }
                });
              }
            }
          }}
        ></canvas>
        <div style={{ textAlign: "center" }}>
          <button style={buttonStyle} onClick={this.undoLastPoint}>
            Undo
          </button>
          <button style={buttonStyle} onClick={this.clearPoints}>
            Clear
          </button>
        </div>
      </RgbViewerStyle>
    );
  }
  undoLastPoint = () => {
    const { polygonPoints } = this.state;
    if (polygonPoints.length > 0) {
      this.setState(
        {
          polygonPoints: polygonPoints.slice(0, -1)
        },
        () => {
          this.redrawCanvas();
        }
      );
    }
  };

  clearPoints = () => {
    this.setState({ polygonPoints: [] }, this.redrawCanvas);
  };
  redrawCanvas = () => {
    let { mainRgbCanvas, initImage, storeScaleParams } = this.props;
    const ctx = this.rgbImageRef.current.getContext("2d");
    const rgbCanvas = this.rgbImageRef.current;
    ctx.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
    const { ratio, centerShift_x, centerShift_y } = getRatio(mainRgbCanvas, rgbCanvas);
    ctx.drawImage(
      mainRgbCanvas,
      centerShift_x,
      centerShift_y,
      mainRgbCanvas.width * ratio,
      mainRgbCanvas.height * ratio
    );
    this.drawPolygon();
  };
  sendDataToBackend = async () => {
    const { polygonPoints } = this.state;
    try {
      const rgbCanvas = this.rgbImageRef.current;
      const response = await fetch("http://localhost:5000/update_normal_map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ points: polygonPoints, canvasWidth: rgbCanvas.width, canvasHeight: rgbCanvas.height })
      });
      const data = await response.json();
    } catch (error) {
      console.error("Error sending data to backend", error);
    }
  };
}

const mapStateToProps = state => ({
  canvasSize: imageSelectors.canvasSize(state),
  pointerList: imageSelectors.pointerList(state),
  rgbImageUrl: imageSelectors.rgbImageUrl(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  memoryRgbCanvas: imageSelectors.memoryRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  prevRgbSize: imageSelectors.prevRgbSize(state),
  boxParams: imageSelectors.boxParams(state),
  rgbScaleParams: imageSelectors.rgbScaleParams(state),
  depthScaleParams: imageSelectors.depthScaleParams(state),
  isPanActive: imageSelectors.isPanActive(state),
  activeDepthTool: imageSelectors.activeDepthTool(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  canvas_size_update: imageActions.canvas_size_update,
  point_list_update: imageActions.point_list_update,
  normal_map_change: imageActions.normal_map_change,
  initImage: imageActions.initImage,
  initRgb: imageActions.initRgb,
  storeBoxParams: imageActions.storeBoxParams,
  storeScaleParams: imageActions.storeScaleParams,
  storeParameters: imageActions.storeParameters,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(RgbViewer);
