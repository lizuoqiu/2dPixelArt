import { publicRequest } from "../../network/https";
import { urls } from "./constants";

const api = {
  getNormalMap: payload =>
    publicRequest({ method: "post", route: urls.upload, payload: payload, responseType: "arraybuffer" })
};

export default api;
