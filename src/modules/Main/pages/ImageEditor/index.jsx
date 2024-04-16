import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { imageActions } from "store/image";
import { selectors as imageSelectors } from "store/image";
import { Helmet } from "react-helmet";
import {
  Container,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip
} from "reactstrap";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { MdOutlinePanTool } from "react-icons/md";
import ImageEditorStyle from "./style";
import SidePane from "components/SidePane";
import MainPane from "components/MainPane";
import { canvasResize, cloneCanvas, downloadCanvas, maskToImage } from "utils/canvasUtils";
import { getImageUrl } from "utils/generalUtils";
import Logo from "assets/images/png/logo.png";
import LogoLong from "assets/images/png/logo-long.png";
import SFULogo from "assets/images/png/sfu-logo.png";
import SampleRgb from "assets/images/rgb/rgb.jpg";
import SampleDepth from "assets/images/depth/depth.png";

let objectUrl = null;

export function ImageEditor({
  normal_map_change,
  selectionImageUrl,
  maskImageUrl,
  depthImageSize,
  mainRgbCanvas,
  mainDepthCanvas,
  memoryDepthCanvas,
  isPanActive,
  operationStack,
  togglePan,
  zoomIn,
  zoomOut,
  undo,
  clear,
  reset,
  initImage,
  handleChange,
  initDepth,
  updateLayer
}) {
  const onHandleChange = async e => {
    const file = e.target.files[0]; // Get the file from the event
    if (!file) return; // Exit if no file is selected
    const formData = new FormData();
    formData.append("file", file); // Prepare the file for uploading
    // e.target.name = "depthImageUrl";
    console.log(e.target.name);
    console.error("upload");
    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      }); // Upload the file
      if (response.ok) {
        const data = await response.json(); // Process the response
        console.error(data["normal_map"]);
        const normal_map_base64String = data["normal_map"]; // replace with your actual base64 string key
        const img = new Image();
        img.onload = () => {
          initDepth(img);
        };
        img.src = `data:image/jpeg;base64,${normal_map_base64String}`;
        const shading_base64String = data["shading_image"]; // replace with your actual base64 string key
        const shading_image = new Image();
        shading_image.onload = () => {
          // TODO: Replace by the image update function from 3d viewer
          // initDepth(shading_base64String);
        };
        shading_image.src = `data:image/jpeg;base64,${shading_base64String}`;
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    handleChange(e); // Handle the change event (first part)
  };
  const openAttachment = id => {
    document.getElementById(id).click();
  };
  const loadSample = () => {
    initImage({
      rgbImageUrl: SampleRgb,
      depthImageUrl: SampleDepth
    });
  };
  useEffect(loadSample, []);
  useEffect(() => {
    if (selectionImageUrl) {
      let selectionImage = new Image();
      objectUrl = getImageUrl(selectionImageUrl);
      selectionImage.src = objectUrl;
      selectionImage.onload = () => {
        updateLayer({
          index: operationStack.activeIndex,
          value: {
            bitmap: cloneCanvas(selectionImage)
          }
        });
      };
    }
  }, [selectionImageUrl]);
  useEffect(() => {
    if (maskImageUrl) {
      let maskImage = new Image();
      objectUrl = getImageUrl(maskImageUrl);
      maskImage.src = objectUrl;
      maskImage.onload = () => {
        let maskBitmap = maskToImage(cloneCanvas(maskImage), mainDepthCanvas);
        updateLayer({
          index: operationStack.activeIndex,
          value: {
            bitmap: maskBitmap
          }
        });
      };
    }
  }, [maskImageUrl]);
  return (
    <ImageEditorStyle>
      <Helmet>
        <title>CP Lab Depth Editing Application</title>
      </Helmet>
      <header>
        <input
          id="upload-rgb-image"
          type="file"
          name="rgbImageUrl"
          onChange={onHandleChange}
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />
        <input
          id="upload-depth-image"
          type="file"
          name="depthImageUrl"
          onChange={onHandleChange}
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />
        <input
          id="upload-selection-image"
          type="file"
          name="selectionImageUrl"
          onChange={onHandleChange}
          accept="image/png"
        />
        <input id="upload-mask-image" type="file" name="maskImageUrl" onChange={onHandleChange} accept="image/png" />
        <Container className="h-100" fluid>
          <div className="nav-bar h-100">
            <div className="nav-intro h-100">
              <h4>
                <Link className="external-link" to={{ pathname: "http://yaksoy.github.io/group" }} target="_blank">
                  <img src={Logo} />
                </Link>
              </h4>
              <div className="nav-intro-tabs">
                <UncontrolledDropdown>
                  <DropdownToggle>Files</DropdownToggle>
                  <DropdownMenu>
                    {/* <DropdownItem header>Header</DropdownItem> */}
                    <DropdownItem
                      onClick={() => {
                        openAttachment("upload-rgb-image");
                        console.log(selectionImageUrl);
                      }}
                    >
                      <label htmlFor="upload-rgb-image">Open RGB Image</label>
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => {
                        openAttachment("upload-depth-image");
                      }}
                    >
                      <label htmlFor="upload-depth-image">Open Depth Image</label>
                    </DropdownItem>
                    <DropdownItem onClick={loadSample}>
                      <label>Load Sample Images</label>
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      disabled={operationStack.activeIndex < 1}
                      onClick={() => {
                        openAttachment("upload-selection-image");
                      }}
                    >
                      <label htmlFor="upload-selection-image">Import Selection Image</label>
                    </DropdownItem>
                    <DropdownItem
                      disabled={operationStack.activeIndex < 1}
                      onClick={() => {
                        openAttachment("upload-mask-image");
                      }}
                    >
                      <label htmlFor="upload-mask-image">Import Selection Mask</label>
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      disabled={memoryDepthCanvas === null}
                      onClick={() => {
                        downloadCanvas(canvasResize(memoryDepthCanvas, depthImageSize), "modified-depth.png");
                      }}
                    >
                      <label>Export Depth Image</label>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <UncontrolledDropdown>
                  <DropdownToggle>Edit</DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      disabled={memoryDepthCanvas === null || operationStack.depthStack.length <= 1}
                      onClick={() => {
                        undo();
                      }}
                    >
                      <label>Undo</label>
                    </DropdownItem>
                    <DropdownItem
                      disabled={memoryDepthCanvas === null || mainRgbCanvas === null}
                      onClick={() => {
                        clear();
                      }}
                    >
                      <label>Clear</label>
                    </DropdownItem>
                    <DropdownItem
                      disabled={memoryDepthCanvas === null || mainRgbCanvas === null}
                      onClick={() => {
                        reset();
                      }}
                    >
                      <label>Reset</label>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <UncontrolledDropdown>
                  <DropdownToggle>About</DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem tag={Link} to={{ pathname: "http://yaksoy.github.io/group" }} target="_blank">
                      <label>Project Webpage</label>
                    </DropdownItem>
                    <DropdownItem tag={Link} to={{ pathname: "http://yaksoy.github.io/group" }} target="_blank">
                      <label>Video Tutorial</label>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </div>
            <div className="nav-button">
              <Button
                disabled={!memoryDepthCanvas}
                onClick={() => {
                  if (memoryDepthCanvas) {
                    togglePan();
                  }
                }}
                size="sm"
                color="outline"
                style={isPanActive ? { backgroundColor: "#97c2f0", color: "#fff" } : null}
                id={`menu-pan-tooltip`}
              >
                <MdOutlinePanTool />
                <UncontrolledTooltip placement="bottom" target={`menu-pan-tooltip`}>
                  Pan
                </UncontrolledTooltip>
              </Button>
              <Button
                disabled={!memoryDepthCanvas}
                onClick={() => {
                  zoomOut();
                }}
                size="sm"
                color="outline"
                id={`menu-zoomout-tooltip`}
              >
                <AiOutlineMinus />
                <UncontrolledTooltip placement="bottom" target={`menu-zoomout-tooltip`}>
                  Zoom out
                </UncontrolledTooltip>
              </Button>
              <Button
                disabled={!memoryDepthCanvas}
                onClick={() => {
                  zoomIn();
                }}
                size="sm"
                color="outline"
                id={`menu-zoomin-tooltip`}
              >
                <AiOutlinePlus />
                <UncontrolledTooltip placement="bottom" target={`menu-zoomin-tooltip`}>
                  Zoom in
                </UncontrolledTooltip>
              </Button>
            </div>
          </div>
        </Container>
      </header>
      <section>
        <SidePane />
        <MainPane />
      </section>
      <footer>
        <div className="footer-text">
          <Link className="external-link" to={{ pathname: "http://yaksoy.github.io/group" }} target="_blank">
            <img src={LogoLong} />
          </Link>
        </div>
        <div className="footer-logo">
          <Link className="external-link" to={{ pathname: "https://www.sfu.ca" }} target="_blank">
            <img src={SFULogo} />
          </Link>
        </div>
      </footer>
    </ImageEditorStyle>
  );
}

const mapStateToProps = state => ({
  selectionImageUrl: imageSelectors.selectionImageUrl(state),
  maskImageUrl: imageSelectors.maskImageUrl(state),
  depthImageSize: imageSelectors.depthImageSize(state),
  mainRgbCanvas: imageSelectors.mainRgbCanvas(state),
  mainDepthCanvas: imageSelectors.mainDepthCanvas(state),
  memoryDepthCanvas: imageSelectors.memoryDepthCanvas(state),
  isPanActive: imageSelectors.isPanActive(state),
  operationStack: imageSelectors.operationStack(state)
});

const mapDispatchToProps = {
  normal_map_change: imageActions.normal_map_change,
  initDepth: imageActions.initDepth,
  handleChange: imageActions.handleChange,
  initImage: imageActions.initImage,
  updateLayer: imageActions.updateLayer,
  togglePan: imageActions.togglePan,
  zoomIn: imageActions.zoomIn,
  zoomOut: imageActions.zoomOut,
  undo: imageActions.undo,
  clear: imageActions.clear,
  reset: imageActions.reset
};
const submitting = async e => {
  const file = e.target.files[0]; // Get the selected file
  if (!file) {
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // Match the name ('file') with your Python backend's expectation

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      //console.log("Upload·successful");
      const data = await response.json();
      // Do something with the response data
    } else {
      console.error("Upload·failed");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ImageEditor);
