import { takeLatest, fork, call, put } from "redux-saga/effects";
import { types } from "./constants";
import api from "./api";

function* flaskSaga({ payload }) {
  yield put({ type: types.GET_NORMAL_MAP_LOADING });
  try {
    let result = yield call(api.getNormalMap, payload);
    yield put({ type: types.GET_NORMAL_MAP_SUCCESS, payload: result.json() });
  } catch (e) {
    yield put({ type: types.GET_NORMAL_MAP_FAILED });
  }
}

function* watchFlask() {
  yield takeLatest(types.GET_NORMAL_MAP, flaskSaga);
}

export const flaskSagas = [fork(watchFlask)];
