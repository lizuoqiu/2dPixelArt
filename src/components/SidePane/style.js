import styled from "styled-components";

const SidePaneStyle = styled.div`
  display: flex;
  position: relative;
  width: 250px;
  .custom-primary-button {
    background-color: #3e8de3;
    border: none;
    color: #fff;
    &:hover {
      opacity: 0.9;
    }
    &:focus {
      box-shadow: none;
    }
  }
  .custom-secondary-button {
    background-color: #c3dcf6;
    border: none;
    color: #3e8de3;
    &:hover {
      opacity: 0.9;
    }
    &:focus {
      box-shadow: none;
    }
  }
  .tools-ext {
    position: absolute;
    height: 100%;
    width: 250px;
    background: #0f3a68;
    color: #97c2f0;
    .tools-ext-body {
      height: calc(100% - 50px);
      .tools-ext-elements {
        height: 100%;
        padding: 16px 24px;
        overflow-x: hidden;
        overflow-y: auto;
        .tool-ext {
          .tool-ext-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            .dropdown-button {
              width: 100%;
            }
            .tool-ext-card {
              background: transparent;
              border: none;
              .tool-ext-card-body {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 1rem 0;
              }
              .tool-ext-input {
                .tool-ext-input-slider {
                  width: 70%;
                }
                .tool-ext-input-number {
                  width: 25%;
                  padding: 0.2em;
                }
              }
            }
          }
          .tool-ext-selection {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .tool-ext-selection-title {
              margin: 1.5rem 0 0.5rem 0;
            }
            .tool-ext-selection-image-card {
              background: #1e1f22;
              width: 100%;
              .tool-ext-selection-image {
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                width: 100%;
                height: 100px;
                padding: 0;
                img {
                  max-width: 100%;
                  max-height: 100%;
                }
              }
            }
            .tool-ext-selection-icons {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              .selection-tool {
                flex-shrink: 0;
                width: 45px;
                height: 45px;
                color: #97c2f0;
                font-size: 12px;
                line-height: 1rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                padding: 2px;
                svg {
                  margin-bottom: 0.25rem;
                  width: 1.5rem;
                  height: 1.5rem;
                }
                &:hover {
                  color: #fff;
                }
              }
              .selection-tool-active {
                background: #06192d;
                color: #fff;
              }
            }
          }
        }
        .toggle-button {
          z-index: 1000;
          width: 14px;
          height: 80px;
          cursor: pointer;
          position: absolute;
          bottom: 50%;
          left: 100%;
          background: #06192d;
          color: #fff;
          border: none;
          border-radius: 0 20px 20px 0;
          svg {
            margin-left: -10px;
          }
          &:hover {
            color: #97c2f0;
          }
          &:focus {
            outline: none;
            box-shadow: none;
          }
        }
      }
    }
  }
`;

export default SidePaneStyle;
