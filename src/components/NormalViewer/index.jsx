import React, { Component, createRef } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { selectors as flaskSelectors } from "store/flask";
import NormalViewerStyle from "./style";
import {
  cloneCanvas,
  drawCanvasImage,
  cropCanvas,
  highlightPixelArea,
  getRatio,
  getDimension,
  drawBox,
  drawScaledCanvasImage,
  getBoundingArea,
  getBoundingBox,
  upScaleBox,
  downScaleBox,
  drawScribble,
  upScalePoint,
  downScalePoint,
  getScribbleRange,
  boxToDimension,
  canvasResize
} from "utils/canvasUtils";
import { runNormalOperations, runCachedNormalOperations } from "utils/stackOperations";
import { SelectionBox } from "config/toolBox";
import { getScribbleValues } from "utils/calculation";

let objectUrl = null;

class NormalViewer extends Component {
  constructor() {
    super();
    this.normalImageRef = createRef();
  }
  state = {
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    initBoundingBox: null
  };
  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }
  componentDidUpdate(prevProps) {
    let { normalImageRef } = this;
    let {
      lightingImages,
      mainNormalCanvas,
      memoryNormalCanvas,
      isEffectNew,
      prevNormalSize,
      scribbleParams,
      normalScaleParams,
      boxParams,
      isPanActive,
      activeNormalTool,
      parameters,
      operationStack,
      initImage,
      initNormal,
      initLayer,
      addLayer,
      storeScaleParams,
      storeParameters,
      addEffect
    } = this.props;
    let normalCanvas = normalImageRef.current;
    let normalContext = normalCanvas.getContext("2d");
    // Load image and initialize main normal canvas
    if (prevProps.lightingImages !== lightingImages) {
      console.warn("lightingImages", lightingImages);
      if (lightingImages.normalMapUrl && lightingImages.shadingImageUrl) {
        normalContext.clearRect(0, 0, prevNormalSize.width, prevNormalSize.height);
        let normalImage = new Image();
        normalImage.src = `data:image/jpeg;base64,${lightingImages.normalMapUrl}`;
        normalImage.onload = () => {
          let maxi = Math.max(normalImage.height, normalImage.width);
          if (maxi > 1000) {
            normalImage = canvasResize(normalImage);
          } else {
            maxi = null;
          }
          initImage({ normalImageSize: maxi });
          initNormal(cloneCanvas(normalImage));
        };
        const shadingImage = new Image();
        shadingImage.onload = () => {
          window.updateImageViewer(shadingImage);
        };
        shadingImage.src = `data:image/jpeg;base64,${lightingImages.shadingImageUrl}`;
      }
    }
    // If main image changes, add draw/redraw canvas to operation
    if (prevProps.mainNormalCanvas !== mainNormalCanvas) {
      if (mainNormalCanvas) {
        const { ratio, centerShift_x, centerShift_y } = getRatio(mainNormalCanvas, normalCanvas);
        initImage({
          prevNormalSize: { width: normalCanvas.width, height: normalCanvas.height }
        });
        storeScaleParams({ name: "normalScaleParams", value: { ratio, centerShift_x, centerShift_y } });
        addEffect({
          name: "normalStack",
          value: {
            func: drawCanvasImage,
            params: []
          }
        });
        initLayer();
        addLayer();
      }
    }
    // If operation is added to the stack, rerun all operations in operation stack
    if (prevProps.operationStack.normalStack !== operationStack.normalStack) {
      if (mainNormalCanvas) {
        if (isEffectNew) {
          runNormalOperations(mainNormalCanvas);
        } else {
          runCachedNormalOperations(mainNormalCanvas);
        }
      }
    }
    if (
      prevProps.memoryNormalCanvas !== memoryNormalCanvas ||
      prevProps.parameters.histogramParams.pixelRange !== parameters.histogramParams.pixelRange ||
      prevProps.normalScaleParams !== normalScaleParams ||
      prevProps.boxParams.end !== boxParams.end
    ) {
      if (memoryNormalCanvas) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = normalScaleParams;
        drawScaledCanvasImage(
          memoryNormalCanvas,
          normalCanvas,
          ratio,
          centerShift_x,
          centerShift_y,
          scale,
          translatePos
        );
        if (parameters.histogramParams.pixelRange || parameters.croppedArea) {
          const { croppedArea, histogramParams } = parameters;
          let newArea = null;
          if (croppedArea) {
            newArea = croppedArea;
          } else {
            newArea = getBoundingArea(memoryNormalCanvas);
          }
          highlightPixelArea(
            normalCanvas,
            downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
            histogramParams.pixelRange
          );
        }
        if (parameters.croppedArea) {
          drawBox(
            normalCanvas,
            downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
        if (boxParams.end) {
          let { x1, y1 } = boxParams.start;
          let { x2, y2 } = boxParams.end;
          let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryNormalCanvas, normalScaleParams);
          if (croppedArea) drawBox(normalCanvas, croppedArea);
        }
        if (Array.isArray(scribbleParams.path) || scribbleParams.path.length) {
          for (let i = 0; i < scribbleParams.path.length; i++) {
            drawScribble(
              normalCanvas.getContext("2d"),
              downScalePoint(scribbleParams.path[i].start, ratio, centerShift_x, centerShift_y, translatePos, scale),
              downScalePoint(scribbleParams.path[i].end, ratio, centerShift_x, centerShift_y, translatePos, scale)
            );
          }
        }
      } else {
        let normalContext = normalCanvas.getContext("2d");
        normalContext.clearRect(0, 0, normalCanvas.width, normalCanvas.height);
      }
    }
    if (prevProps.isPanActive !== isPanActive) {
      if (isPanActive && activeNormalTool) {
        normalCanvas.removeEventListener("mousedown", this.handleMouseDown);
        normalCanvas.removeEventListener("mouseup", this.handleMouseUp);
        normalCanvas.removeEventListener("mouseout", this.handleMouseUp);
        normalCanvas.removeEventListener("mouseover", this.handleMouseUp);
        normalCanvas.removeEventListener("mousemove", this.handleMouseMove);
      }
      if (!isPanActive && activeNormalTool) {
        normalCanvas.addEventListener("mousedown", this.handleMouseDown);
        normalCanvas.addEventListener("mouseup", this.handleMouseUp);
        normalCanvas.addEventListener("mouseout", this.handleMouseUp);
        normalCanvas.addEventListener("mouseover", this.handleMouseUp);
        normalCanvas.addEventListener("mousemove", this.handleMouseMove);
      }
    }
    // Listens for mouse movements around the normal canvas and draw bounding box
    if (prevProps.activeNormalTool !== activeNormalTool) {
      if (activeNormalTool) {
        if (!isPanActive) {
          normalCanvas.addEventListener("mousedown", this.handleMouseDown);
          normalCanvas.addEventListener("mouseup", this.handleMouseUp);
          normalCanvas.addEventListener("mouseout", this.handleMouseUp);
          normalCanvas.addEventListener("mouseover", this.handleMouseUp);
          normalCanvas.addEventListener("mousemove", this.handleMouseMove);
        } else {
          normalCanvas.removeEventListener("mousedown", this.handleMouseDown);
          normalCanvas.removeEventListener("mouseup", this.handleMouseUp);
          normalCanvas.removeEventListener("mouseout", this.handleMouseUp);
          normalCanvas.removeEventListener("mouseover", this.handleMouseUp);
          normalCanvas.removeEventListener("mousemove", this.handleMouseMove);
        }
      } else {
        normalCanvas.removeEventListener("mousedown", this.handleMouseDown);
        normalCanvas.removeEventListener("mouseup", this.handleMouseUp);
        normalCanvas.removeEventListener("mouseout", this.handleMouseUp);
        normalCanvas.removeEventListener("mouseover", this.handleMouseUp);
        normalCanvas.removeEventListener("mousemove", this.handleMouseMove);
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
  }
  componentWillUnmount() {
    let normalCanvas = this.normalImageRef.current;
    window.removeEventListener("resize", this.handleResize);
    normalCanvas.removeEventListener("mousedown", this.handleMouseDown);
    normalCanvas.removeEventListener("mouseup", this.handleMouseUp);
    normalCanvas.removeEventListener("mouseout", this.handleMouseUp);
    normalCanvas.removeEventListener("mouseover", this.handleMouseUp);
    normalCanvas.removeEventListener("mousemove", this.handleMouseMove);
    URL.revokeObjectURL(objectUrl);
  }
  handleResize = () => {
    const {
      memoryNormalCanvas,
      scribbleParams,
      normalScaleParams,
      parameters,
      boxParams,
      initImage,
      storeScaleParams
    } = this.props;
    const { translatePos, scale } = normalScaleParams;
    const normalCanvas = this.normalImageRef.current;
    this.setState({ ...this.state, windowWidth: window.innerWidth });
    if (normalCanvas && memoryNormalCanvas) {
      normalCanvas.width = (window.innerWidth / 1500) * 521;
      normalCanvas.height = (window.innerHeight / 1200) * 352;
      const { ratio, centerShift_x, centerShift_y } = getRatio(memoryNormalCanvas, normalCanvas);
      initImage({
        prevNormalSize: { width: normalCanvas.width, height: normalCanvas.height }
      });
      storeScaleParams({ name: "normalScaleParams", value: { ratio, centerShift_x, centerShift_y } });
      drawScaledCanvasImage(memoryNormalCanvas, normalCanvas, ratio, centerShift_x, centerShift_y, scale, translatePos);
      if (parameters.histogramParams.pixelRange || parameters.croppedArea) {
        const { croppedArea, histogramParams } = parameters;
        let newArea = null;
        if (croppedArea) {
          newArea = croppedArea;
        } else {
          newArea = getBoundingArea(memoryNormalCanvas);
        }
        highlightPixelArea(
          normalCanvas,
          downScaleBox(newArea, ratio, centerShift_x, centerShift_y, translatePos, scale),
          histogramParams.pixelRange
        );
      }
      if (parameters.croppedArea) {
        drawBox(
          normalCanvas,
          downScaleBox(parameters.croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale)
        );
      }
      if (boxParams.end) {
        let { x1, y1 } = boxParams.start;
        let { x2, y2 } = boxParams.end;
        let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryNormalCanvas, normalScaleParams);
        if (croppedArea) drawBox(normalCanvas, croppedArea);
      }
      if (Array.isArray(scribbleParams.path) || scribbleParams.path.length) {
        for (let i = 0; i < scribbleParams.path.length; i++) {
          drawScribble(
            normalCanvas.getContext("2d"),
            downScalePoint(scribbleParams.path[i].start, ratio, centerShift_x, centerShift_y, translatePos, scale),
            downScalePoint(scribbleParams.path[i].end, ratio, centerShift_x, centerShift_y, translatePos, scale)
          );
        }
      }
    }
  };
  handleMouseDown = event => {
    let { memoryNormalCanvas, storeParameters, storeBoxParams } = this.props;
    if (memoryNormalCanvas) {
      const normalCanvas = this.normalImageRef.current;
      normalCanvas.style.cursor = "crosshair";
      let x = event.offsetX;
      let y = event.offsetY;
      storeBoxParams({
        start: { x1: x, y1: y },
        end: null
      });
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
  };
  handleMouseMove = event => {
    let { memoryNormalCanvas, boxParams, storeBoxParams } = this.props;
    if (event.buttons !== 1 || !boxParams.start) return;
    if (memoryNormalCanvas) {
      let x = event.offsetX;
      let y = event.offsetY;
      storeBoxParams({
        end: { x2: x, y2: y }
      });
    }
  };
  handleMouseUp = () => {
    let { memoryNormalCanvas, boxParams, normalScaleParams, storeBoxParams, storeParameters } = this.props;
    if (memoryNormalCanvas && boxParams.end) {
      let { x1, y1 } = boxParams.start;
      let { x2, y2 } = boxParams.end;
      let croppedArea = getBoundingBox(x1, y1, x2, y2, memoryNormalCanvas, normalScaleParams);
      if (croppedArea) {
        const { ratio, centerShift_x, centerShift_y, translatePos, scale } = normalScaleParams;
        croppedArea = upScaleBox(croppedArea, ratio, centerShift_x, centerShift_y, translatePos, scale);
        storeParameters({
          croppedCanvasImage: cropCanvas(memoryNormalCanvas, croppedArea),
          croppedArea: croppedArea
        });
      }
    }
    const normalCanvas = this.normalImageRef.current;
    normalCanvas.style.cursor = "default";
    storeBoxParams({
      start: null,
      end: null
    });
  };
  render() {
    const { normalImageRef } = this;
    const {
      memoryNormalCanvas,
      rgbScaleParams,
      normalScaleParams,
      parameters,
      isPanActive,
      activeNormalTool,
      scribbleParams,
      storeScribbleParams,
      storeScaleParams,
      storeParameters
    } = this.props;
    const normalCanvas = normalImageRef.current;
    return (
      <NormalViewerStyle>
        <canvas
          width={(window.innerWidth / 1500) * 521}
          height={(window.innerHeight / 1200) * 352}
          ref={normalImageRef}
          style={{ cursor: isPanActive ? "grab" : "default" }}
          onMouseDown={e => {
            if (activeNormalTool) {
              if (activeNormalTool && SelectionBox[activeNormalTool].type === "scribble") {
                const { croppedArea } = parameters;
                let { ratio, centerShift_x, centerShift_y, translatePos, scale } = normalScaleParams;
                let dimension = null;
                if (croppedArea) {
                  dimension = boxToDimension(croppedArea);
                } else {
                  dimension = getDimension(
                    memoryNormalCanvas,
                    ratio,
                    centerShift_x,
                    centerShift_y,
                    translatePos,
                    scale
                  );
                }
                let [x, y] = getScribbleValues(
                  e.clientX - normalCanvas.offsetLeft,
                  e.clientY - normalCanvas.offsetTop,
                  dimension
                );
                storeScribbleParams({
                  pos: { x, y }
                });
              }
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
                name: "normalScaleParams",
                value: {
                  startDragOffset: {
                    x: e.clientX - normalScaleParams.translatePos.x,
                    y: e.clientY - normalScaleParams.translatePos.y
                  },
                  mouseDown: true
                }
              });
            }
          }}
          onMouseUp={e => {
            if (activeNormalTool) {
              if (activeNormalTool && SelectionBox[activeNormalTool].type === "scribble") {
                if (Array.isArray(scribbleParams.path) || scribbleParams.path.length) {
                  if (activeNormalTool) {
                    let range = getScribbleRange(memoryNormalCanvas, scribbleParams.path);
                    storeParameters({
                      histogramParams: {
                        ...parameters.histogramParams,
                        pixelRange: range
                      }
                    });
                  }
                }
              }
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              normalScaleParams.mouseDown &&
                storeScaleParams({ name: "normalScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOver={e => {
            if (activeNormalTool) {
              if (activeNormalTool && SelectionBox[activeNormalTool].type === "scribble") {
              }
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              normalScaleParams.mouseDown &&
                storeScaleParams({ name: "normalScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseOut={e => {
            if (activeNormalTool) {
              if (activeNormalTool && SelectionBox[activeNormalTool].type === "scribble") {
              }
            }
            if (isPanActive) {
              rgbScaleParams.mouseDown && storeScaleParams({ name: "rgbScaleParams", value: { mouseDown: false } });
              normalScaleParams.mouseDown &&
                storeScaleParams({ name: "normalScaleParams", value: { mouseDown: false } });
            }
          }}
          onMouseEnter={e => {
            if (activeNormalTool) {
              if (activeNormalTool && SelectionBox[activeNormalTool].type === "scribble") {
                const { croppedArea } = parameters;
                let { ratio, centerShift_x, centerShift_y, translatePos, scale } = normalScaleParams;
                let dimension = null;
                if (croppedArea) {
                  dimension = boxToDimension(croppedArea);
                } else {
                  dimension = getDimension(
                    memoryNormalCanvas,
                    ratio,
                    centerShift_x,
                    centerShift_y,
                    translatePos,
                    scale
                  );
                }
                let [x, y] = getScribbleValues(
                  e.clientX - normalCanvas.offsetLeft,
                  e.clientY - normalCanvas.offsetTop,
                  dimension
                );
                storeScribbleParams({
                  pos: { x, y }
                });
              }
            }
            if (isPanActive) {
            }
          }}
          onMouseMove={e => {
            if (activeNormalTool) {
              if (activeNormalTool && SelectionBox[activeNormalTool].type === "scribble") {
                if (e.buttons !== 1) return;
                const { croppedArea } = parameters;
                let { ratio, centerShift_x, centerShift_y, translatePos, scale } = normalScaleParams;
                let dimension = null;
                if (croppedArea) {
                  dimension = boxToDimension(croppedArea);
                } else {
                  dimension = getDimension(
                    memoryNormalCanvas,
                    ratio,
                    centerShift_x,
                    centerShift_y,
                    translatePos,
                    scale
                  );
                }
                let [x, y] = getScribbleValues(
                  e.clientX - normalCanvas.offsetLeft,
                  e.clientY - normalCanvas.offsetTop,
                  dimension
                );
                const normalContext = normalCanvas.getContext("2d");
                let start = { x: scribbleParams.pos.x, y: scribbleParams.pos.y };
                let end = { x, y };
                drawScribble(normalContext, start, end);
                storeScribbleParams({
                  pos: { x, y },
                  path: [
                    ...scribbleParams.path,
                    {
                      start: upScalePoint(start, ratio, centerShift_x, centerShift_y, translatePos, scale),
                      end: upScalePoint(end, ratio, centerShift_x, centerShift_y, translatePos, scale)
                    }
                  ]
                });
              }
            }
            if (isPanActive) {
              if (normalScaleParams.mouseDown) {
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
                  name: "normalScaleParams",
                  value: {
                    translatePos: {
                      x: e.clientX - normalScaleParams.startDragOffset.x,
                      y: e.clientY - normalScaleParams.startDragOffset.y
                    }
                  }
                });
              }
            }
          }}
        ></canvas>
      </NormalViewerStyle>
    );
  }
}

const mapStateToProps = state => ({
  lightingImages: flaskSelectors.lightingImages(state),
  mainNormalCanvas: imageSelectors.mainNormalCanvas(state),
  memoryNormalCanvas: imageSelectors.memoryNormalCanvas(state),
  isEffectNew: imageSelectors.isEffectNew(state),
  prevNormalSize: imageSelectors.prevNormalSize(state),
  scribbleParams: imageSelectors.scribbleParams(state),
  boxParams: imageSelectors.boxParams(state),
  rgbScaleParams: imageSelectors.rgbScaleParams(state),
  normalScaleParams: imageSelectors.normalScaleParams(state),
  isPanActive: imageSelectors.isPanActive(state),
  activeNormalTool: imageSelectors.activeNormalTool(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  initImage: imageActions.initImage,
  initNormal: imageActions.initNormal,
  initLayer: imageActions.initLayer,
  addLayer: imageActions.addLayer,
  storeScribbleParams: imageActions.storeScribbleParams,
  storeBoxParams: imageActions.storeBoxParams,
  storeScaleParams: imageActions.storeScaleParams,
  storeParameters: imageActions.storeParameters,
  addEffect: imageActions.addEffect
};

export default connect(mapStateToProps, mapDispatchToProps)(NormalViewer);
