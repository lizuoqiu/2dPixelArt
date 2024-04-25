import React, { Component } from "react";
import DepthViewer from "components/DepthViewer";
import RgbViewer from "components/RgbViewer";
import HistViewer from "components/HistViewer";
import ThreeDViewer from "components/ThreeDViewer";
import MainPaneStyle from "./style";

class MainPane extends Component {
  render() {
    return (
      <MainPaneStyle>
        <div className={"main"}>
          <div className="main-row">
            <div className="main-column main-column-2d">
              <div className="box rgb-box">
                <RgbViewer />
              </div>
              <div className="box depth-box">
                <DepthViewer />
              </div>
            </div>
            <div className="main-column main-column-3d">
              <div className="box threeD-box">
                <ThreeDViewer />
              </div>
              <div className="box histogram-box">
                <HistViewer />
              </div>
            </div>
          </div>
        </div>
      </MainPaneStyle>
    );
  }
}

export default MainPane;
