import styled from "styled-components";
// #2e2f34

const ImageEditorStyle = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .external-link {
    text-decoration: none;
    img {
      height: 100%;
    }
  }
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9); // 半透明背景
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999; // 确保在最上层
    color: white;
    font-size: 1.5em;
  }
  header {
    height: 56px;
    background-color: #fff;
    color: #000;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    input {
      display: none;
    }
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .nav-intro {
        display: flex;
        h4 {
          margin: 0;
        }
        .nav-intro-tabs {
          margin: 0 2rem;
          display: flex;
          align-items: end;
          .dropdown {
            .btn-secondary {
              color: #124276;
              background: none;
              border: none;
              box-shadow: none;
              &:hover {
                color: #06192d;
              }
              &:focus {
                color: #06192d;
              }
            }
            .dropdown-menu {
              z-index: 1200;
              .dropdown-item {
                color: #124276;
                padding: 0.75rem 1rem;
                p {
                  margin: 0;
                }
              }
            }
          }
        }
      }
      .nav-button {
        svg {
          color: #124276;
          &:hover {
            color: #06192d;
          }
        }
      }
    }
  }
  section {
    height: calc(100vh - 90px);
    display: flex;
  }
  footer {
    padding: 3px;
    height: 34px;
    background-color: #124276;
    color: #fff;
    display: flex;
    justify-content: right;
    align-items: center;
    .footer-text {
      height: 100%;
      margin: 0 10px;
      padding: 2px 0;
    }
    .footer-logo {
      height: 100%;
    }
  }
`;

export default ImageEditorStyle;
