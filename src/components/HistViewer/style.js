import styled from "styled-components";

const DirectionSelectorStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px; /* 调整按钮之间的间距 */
  padding: 20px;

  button {
    padding: 10px 20px; /* 调整按钮大小 */
    cursor: pointer;
    border: 1px solid #ccc; /* 给按钮添加边框 */
    border-radius: 5px; /* 按钮圆角 */

    &:hover {
      background-color: #f0f0f0; /* 鼠标悬停时按钮背景色 */
    }

    &:active {
      background-color: #e0e0e0; /* 按钮被按下时的背景色 */
    }
  }
`;

export default DirectionSelectorStyle;
