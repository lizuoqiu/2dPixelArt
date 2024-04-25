import { types } from "./constants";

const initialState = {
  lightingImages: {
    normalMapUrl: null,
    shadingImageUrl: null
  },
  rectangle: null,
  isLoading: false
};

export const flaskReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.SET_RECTANGLE:
      return { ...state, rectangle: payload };
    case types.GET_NORMAL_MAP_SUCCESS:
      return {
        ...state,
        lightingImages: {
          ...state.lightingImages,
          normalMapUrl: payload["normal_map"],
          shadingImageUrl: payload["shading_image"]
        },
        isLoading: false
      };
    case types.GET_NORMAL_MAP_FAILED:
      return {
        ...state,
        lightingImages: {
          normalMapUrl: null,
          shadingImageUrl: null
        },
        isLoading: false
      };
    case types.GET_NORMAL_MAP_LOADING:
      return { ...state, isLoading: true };
    default: {
      return state;
    }
  }
};
