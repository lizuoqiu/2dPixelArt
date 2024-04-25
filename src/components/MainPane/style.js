import styled from "styled-components";

const MainPaneStyle = styled.div`
  height: 100%;
  width: calc(100% - 250px);
  .main {
    background: #f0f6fd;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    .main-row {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: space-between;
      .main-column {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 10px;
        width: 50%;
        .box {
          background-color: #fff;
          margin: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .rgb-box {
          height: 50%;
          width: 100%;
        }
        .depth-box {
          height: 50%;
          width: 100%;
        }
        .threeD-box {
          height: 50%;
          width: 100%;
        }
        .histogram-box {
          height: 50%;
          width: 100%;
        }
      }
      .main-column-2d {
        width: 50%;
      }
      .main-column-3d {
        width: 50%;
      }
    }
  }
`;

export default MainPaneStyle;
