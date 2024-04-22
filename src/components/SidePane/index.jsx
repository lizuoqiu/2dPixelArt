import React, { useEffect, useState, Fragment } from "react";
import { connect } from "react-redux";
import { toolExtActions } from "store/toolext";
import { imageActions } from "store/image";
import { selectors as toolExtSelectors } from "store/toolext";
import { selectors as imageSelectors } from "store/image";
import { Button, CardBody, Card, FormGroup, Label, Input, UncontrolledTooltip } from "reactstrap";
import SidePaneStyle from "./style";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdDownload, MdDelete, MdContentCopy } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { RiArrowUpDownLine } from "react-icons/ri";

import {
  addScaleShift,
  cloneCanvas,
  editHighlightPixelArea,
  scaleSelection,
  getBoundingArea,
  canvasToImage,
  invertBitmap,
  downloadCanvas
} from "utils/canvasUtils";
import PointCurve from "components/PointCurve";
import { SelectionBox } from "config/toolBox";

export function SidePane({
  toolExtOpen,
  toolExtActions,
  mainDepthCanvas,
  memoryDepthCanvas,
  mainRgbCanvas,
  activeDepthTool,
  toolsParameters,
  parameters,
  operationStack,
  selectTool,
  storeToolParameters,
  addEffect,
  addLayer,
  updateLayerIndex,
  updateLayer,
  duplicateLayer,
  removeLayer,
  removeAllLayers,
  toggleLayerSelect,
  mergeLayerSelect,
  removeLayerSelect,
  clear
}) {
  const [layers, setLayers] = useState(null);
  const [tempToolsParams, setTempToolsParams] = useState({
    disparity: 0,
    scale: 1,
    aConstant: 1,
    bConstant: 0
  });

  const onHandleChange = e => {
    let { name, value } = e.target;
    setTempToolsParams({ ...tempToolsParams, [name]: +value });
  };
  const onHandleUpdate = e => {
    let { name } = e.target;
    const { activeIndex } = operationStack;
    updateLayer({
      index: activeIndex,
      value: {
        toolsParameters: tempToolsParams
      }
    });
    storeToolParameters({ [name]: tempToolsParams[name] });
  };
  const onHandleEnter = e => {
    let { name } = e.target;
    const { activeIndex } = operationStack;
    if (e.key === "Enter") {
      updateLayer({
        index: activeIndex,
        value: {
          toolsParameters: tempToolsParams
        }
      });
      storeToolParameters({ [name]: tempToolsParams[name] });
    }
  };

  const onModifyBitmap = () => {
    if (memoryDepthCanvas) {
      if (!activeDepthTool || SelectionBox[activeDepthTool].type === "boundingBox") {
        const { croppedCanvasImage, croppedArea, histogramParams } = parameters;
        const { activeIndex, layerStack } = operationStack;
        if (activeIndex > 0) {
          let newArea = null;
          let newCroppedCanvasImage = null;
          if (croppedArea) {
            newArea = croppedArea;
            newCroppedCanvasImage = croppedCanvasImage;
          } else {
            newArea = getBoundingArea(memoryDepthCanvas);
            newCroppedCanvasImage = cloneCanvas(memoryDepthCanvas);
          }
          const newBitmapCanvas = SelectionBox[activeDepthTool || "singleSelection"].func(
            cloneCanvas(layerStack[activeIndex].bitmap),
            newCroppedCanvasImage,
            newArea,
            histogramParams.pixelRange
          );
          updateLayer({
            index: activeIndex,
            value: {
              bitmap: newBitmapCanvas,
              toolsParameters: {
                disparity: 0,
                scale: 1,
                aConstant: 1,
                bConstant: 0
              }
            }
          });
          clear();
        }
      }
    }
  };
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (memoryDepthCanvas && activeIndex === 0) {
      selectTool(null);
    }
    if (layerStack[activeIndex]) {
      setTempToolsParams({ ...layerStack[activeIndex].toolsParameters });
    }
  }, [operationStack.activeIndex]);
  useEffect(() => {
    let tempLayer = operationStack.layerStack.map((element, key) => {
      let image = canvasToImage(element.bitmap);
      return (
        <Fragment key={key}>
          <div
            onClick={() => {
              updateLayerIndex(key);
            }}
            className={
              (!operationStack.isSelectActive && operationStack.activeIndex === key) ||
              (operationStack.isSelectActive && operationStack.selectedLayers.has(key))
                ? "my-2 layer-mode-body-content layer-mode-body-content-active"
                : "my-2 layer-mode-body-content"
            }
          >
            <Card className="layer-mode-body-content-image-card">
              <CardBody className="layer-mode-body-content-image">
                <img src={image} />
              </CardBody>
            </Card>
            {key !== 0 && !operationStack.isSelectActive ? (
              <div className="top-right-options">
                <div
                  onClick={e => {
                    e.stopPropagation();
                    let newBitmapCanvas = invertBitmap(
                      cloneCanvas(memoryDepthCanvas),
                      cloneCanvas(operationStack.layerStack[key].bitmap)
                    );
                    updateLayer({
                      index: key,
                      value: {
                        bitmap: newBitmapCanvas,
                        toolsParameters: {
                          disparity: 0,
                          scale: 1,
                          aConstant: 1,
                          bConstant: 0
                        }
                      }
                    });
                  }}
                  className="top-right-option"
                >
                  <RiArrowUpDownLine />
                </div>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    duplicateLayer(key);
                  }}
                  className="top-right-option"
                >
                  <MdContentCopy />
                </div>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    downloadCanvas(operationStack.layerStack[key].bitmap, "bitmap.png");
                  }}
                  className="top-right-option"
                >
                  <MdDownload />
                </div>
                <div
                  onClick={e => {
                    e.stopPropagation();
                    removeLayer(key);
                  }}
                  className="top-right-option"
                >
                  <MdDelete />
                </div>
              </div>
            ) : null}
          </div>
          {key === 0 ? <hr style={{ borderTop: "1px solid #97c2f0", width: "100%", marginBottom: "20px" }} /> : null}
        </Fragment>
      );
    });
    setLayers(tempLayer);
  }, [operationStack.layerStack, operationStack.isSelectActive]);
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (parameters.histogramParams.pixelRange && activeIndex > -1 && layerStack.length) {
      addEffect({
        name: "depthStack",
        value: {
          func: editHighlightPixelArea,
          params: [cloneCanvas(layerStack[activeIndex].bitmap), toolsParameters.disparity]
        }
      });
    }
  }, [toolsParameters.disparity]);
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (parameters.histogramParams.pixelRange && activeIndex > -1 && layerStack.length) {
      addEffect({
        name: "depthStack",
        value: {
          func: scaleSelection,
          params: [cloneCanvas(layerStack[activeIndex].bitmap), toolsParameters.scale]
        }
      });
    }
  }, [toolsParameters.scale]);
  useEffect(() => {
    const { activeIndex, layerStack } = operationStack;
    if (parameters.histogramParams.pixelRange && activeIndex > -1 && layerStack.length) {
      addEffect({
        name: "depthStack",
        value: {
          func: addScaleShift,
          params: [cloneCanvas(layerStack[activeIndex].bitmap), toolsParameters.aConstant, toolsParameters.bConstant]
        }
      });
    }
  }, [toolsParameters.aConstant, toolsParameters.bConstant]);
  const toolBox = () => {
    return (
      <>
        <div className="tool-ext w-100">
          <div className="w-100 mt-3 tool-ext-selection">
            <p className="mb-1">Selection Tools</p>
            <div disabled={operationStack.activeIndex <= 0} className="mt-4 tool-ext-selection-icons">
              {Object.keys(SelectionBox).map((key, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (memoryDepthCanvas) {
                      selectTool(key);
                    }
                  }}
                  id={`tool-tooltip-${index}`}
                  className={
                    activeDepthTool === key && memoryDepthCanvas
                      ? "selection-tool selection-tool-active"
                      : "selection-tool"
                  }
                >
                  {SelectionBox[key].icon}
                  <UncontrolledTooltip placement="bottom" target={`tool-tooltip-${index}`}>
                    {SelectionBox[key].tooltip}
                  </UncontrolledTooltip>
                </div>
              ))}
            </div>
            {activeDepthTool ? (
              <div className="d-flex my-2">
                <Button
                  className="custom-primary-button"
                  disabled={
                    !memoryDepthCanvas ||
                    !activeDepthTool ||
                    (activeDepthTool && SelectionBox[activeDepthTool].type !== "boundingBox") ||
                    operationStack.activeIndex <= 0
                  }
                  size="sm"
                  onClick={() => {
                    onModifyBitmap();
                  }}
                >
                  {SelectionBox[activeDepthTool].text}
                </Button>
              </div>
            ) : null}
          </div>
          <div className="w-100 mt-4 tool-ext-section">
            <p className="mb-1">Normal Map Selection</p>
            <Card className="tool-ext-card">
              <CardBody className="tool-ext-card-body">
                <PointCurve
                  pointCurveProps={{
                    disabled: !memoryDepthCanvas || !parameters.histogramParams.pixelRange
                  }}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </>
    );
  };
  return (
    <SidePaneStyle>
      <div className="layer-mode-pane">
        <div className="layer-mode-header">
          <div className="layer-mode-header-title">
            <p>Normal Map Selection Pane</p>
          </div>
        </div>
        <div className="layer-mode-body">
          {layers || null}
          {/* if later stack is empty, disable this */}
          <div
            disabled={mainDepthCanvas === null || mainRgbCanvas === null || operationStack.isSelectActive}
            className="my-2 layer-mode-body-add"
          >
            <Card className="layer-mode-body-add-card" onClick={addLayer}>
              <AiOutlinePlus />
            </Card>
          </div>
        </div>
      </div>

      <div
        disabled={operationStack.isSelectActive}
        className={toolExtOpen ? "tools-ext tool-ext-active" : "tools-ext tool-ext-inactive"}
      >
        <div className="tools-ext-body">
          <div className="tools-ext-elements">
            {toolBox()}
            <Button onClick={toolExtActions} className="toggle-button">
              {toolExtOpen ? <MdKeyboardArrowLeft /> : <MdKeyboardArrowRight />}
            </Button>
          </div>
        </div>
      </div>
    </SidePaneStyle>
  );
}

const mapStateToProps = state => ({
  toolExtOpen: toolExtSelectors.toolExtOpen(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  activeDepthTool: imageSelectors.activeDepthTool(state),
  toolsParameters: imageSelectors.toolsParameters(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  toolExtActions: toolExtActions.toggleToolExt,
  selectTool: imageActions.selectTool,
  addEffect: imageActions.addEffect,
  storeScribbleParams: imageActions.storeScribbleParams,
  addLayer: imageActions.addLayer,
  updateLayerIndex: imageActions.updateLayerIndex,
  updateLayer: imageActions.updateLayer,
  duplicateLayer: imageActions.duplicateLayer,
  removeLayer: imageActions.removeLayer,
  removeAllLayers: imageActions.removeAllLayers,
  toggleLayerSelect: imageActions.toggleLayerSelect,
  mergeLayerSelect: imageActions.mergeLayerSelect,
  removeLayerSelect: imageActions.removeLayerSelect,
  storeToolParameters: imageActions.storeToolParameters,
  clear: imageActions.clear
};

export default connect(mapStateToProps, mapDispatchToProps)(SidePane);
