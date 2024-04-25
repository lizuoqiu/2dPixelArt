import React, { useEffect, useState, Fragment } from "react";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Button, CardBody, Card, FormGroup, Label, Input, UncontrolledTooltip } from "reactstrap";
import SidePaneStyle from "./style";

import PointCurve from "components/PointCurve";
import { SelectionBox } from "config/toolBox";

export function SidePane({ memoryDepthCanvas, activeDepthTool, parameters, operationStack, selectTool }) {
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
      <div disabled={operationStack.isSelectActive} className="tools-ext">
        <div className="tools-ext-body">
          <div className="tools-ext-elements">{toolBox()}</div>
        </div>
      </div>
    </SidePaneStyle>
  );
}

const mapStateToProps = state => ({
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  activeDepthTool: imageSelectors.activeDepthTool(state),
  parameters: imageSelectors.parameters(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
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
