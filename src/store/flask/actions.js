import { types } from "./constants";

export const flaskActions = {
  getNormalMap: payload => ({ type: types.GET_NORMAL_MAP, payload: payload }),
  setRectangle: payload => ({ type: types.SET_RECTANGLE, payload: payload })
};
