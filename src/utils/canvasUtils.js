import { solveCubic } from "./calculation";

export const dimensionToBox = dimension => {
  return [dimension[0], dimension[1], dimension[2] - dimension[0], dimension[3] - dimension[1]];
};

export const canvasToImage = canvas => {
  if (canvas) return canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  return null;
};

export const cloneCanvas = oldCanvas => {
  const newCanvas = document.createElement("canvas");
  const context = newCanvas.getContext("2d");
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  context.drawImage(oldCanvas, 0, 0);
  return newCanvas;
};

export const getRatio = (image, canvas) => {
  let hRatio = canvas.width / image.width;
  let vRatio = canvas.height / image.height;
  let ratio = Math.min(hRatio, vRatio);
  let centerShift_x = (canvas.width - image.width * ratio) / 2;
  let centerShift_y = (canvas.height - image.height * ratio) / 2;
  return {
    ratio: ratio,
    centerShift_x: centerShift_x,
    centerShift_y: centerShift_y
  };
};

export const getDimension = (image, ratio, centerShift_x, centerShift_y) => {
  let x1 = centerShift_x;
  let y1 = centerShift_y;
  let x2 = centerShift_x + image.width * ratio;
  let y2 = centerShift_y + image.height * ratio;
  return [x1, y1, x2, y2];
};

export const cropCanvas = (oldCanvas, boundingBox) => {
  if (oldCanvas && boundingBox) {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = boundingBox[2];
    newCanvas.height = boundingBox[3];
    const context = newCanvas.getContext("2d");
    context.drawImage(
      oldCanvas,
      boundingBox[0],
      boundingBox[1],
      boundingBox[2],
      boundingBox[3],
      0,
      0,
      boundingBox[2],
      boundingBox[3]
    );
    return newCanvas;
  }
  return null;
};

export const drawCanvasImage = (image, context, ratio, centerShift_x, centerShift_y) => {
  context.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    centerShift_x,
    centerShift_y,
    image.width * ratio,
    image.height * ratio
  );
};

export const drawScaledCanvasImage = (
  image,
  context,
  canvas,
  ratio,
  centerShift_x,
  centerShift_y,
  scale,
  translatePos
) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(translatePos.x, translatePos.y);
  context.scale(scale, scale);
  context.drawImage(
    image,
    0,
    0,
    image.width,
    image.height,
    centerShift_x,
    centerShift_y,
    image.width * ratio,
    image.height * ratio
  );
  context.restore();
};

export const drawBox = (image, context, new_x, new_y, new_w, new_h) => {
  context.beginPath();
  context.strokeStyle = "red";
  context.rect(new_x, new_y, new_w, new_h);
  context.stroke();
};

export const getRgbBitmap = (bitmapCanvas, rgbCanvas) => {
  const bitmapContext = bitmapCanvas.getContext("2d");
  bitmapContext.globalCompositeOperation = "source-in";
  bitmapContext.drawImage(rgbCanvas, 0, 0);
  return bitmapCanvas;
};

export const highlightPixelArea = (image, context, boundingBox, pixelRange) => {
  if (context && boundingBox) {
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i] < pixelRange[0] || src[i] > pixelRange[1]) {
        src[i] -= 150;
        src[i + 1] -= 150;
        src[i + 2] -= 150;
      }
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const highlightPixelAreaRgb = (image, rgbContext, depthContext, boundingBox, pixelRange) => {
  if (rgbContext && depthContext && boundingBox) {
    const imageData = rgbContext.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const rgbSrc = imageData.data;
    const depthSrc = depthContext.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]).data;
    for (let i = 0; i < rgbSrc.length; i += 4) {
      if (depthSrc[i] < pixelRange[0] || depthSrc[i] > pixelRange[1]) {
        rgbSrc[i] -= 150;
        rgbSrc[i + 1] -= 150;
        rgbSrc[i + 2] -= 150;
      }
    }
    rgbContext.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const modifyBitmap = (bitmapCanvas, croppedCanvas, box, currentTool, pixelRange) => {
  const bitmapContext = bitmapCanvas.getContext("2d");
  const croppedContext = croppedCanvas.getContext("2d");
  if (currentTool === "singleSelection") {
    bitmapContext.clearRect(0, 0, bitmapCanvas.width, bitmapCanvas.height);
  }
  const imageData = croppedContext.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
  const src = imageData.data;
  for (let i = 0; i < src.length; i += 4) {
    if (src[i] < pixelRange[0] || src[i] > pixelRange[1]) {
      src[i + 3] = 0;
    }
  }
  croppedContext.putImageData(imageData, 0, 0);
  bitmapContext.globalCompositeOperation = "source-over";
  if (currentTool === "subtractSelection") {
    bitmapContext.globalCompositeOperation = "destination-out";
  }
  if (currentTool === "intersectSelection") {
    bitmapContext.globalCompositeOperation = "source-in";
  }
  bitmapContext.drawImage(croppedCanvas, box[0], box[1]);
};

export const editHighlightPixelArea = (image, context, canvas, depth) => {
  if (context && canvas) {
    const bitmapCanvas = cloneCanvas(canvas);
    const bitmapContext = bitmapCanvas.getContext("2d");
    const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        src[i] += 255 * (depth / 100);
        src[i + 1] += 255 * (depth / 100);
        src[i + 2] += 255 * (depth / 100);
      }
    }
    bitmapContext.putImageData(imageData, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(bitmapCanvas, 0, 0);
    return bitmapCanvas;
  }
};

export const scaleSelection = (image, context, canvas, scale) => {
  if (context && canvas) {
    const bitmapCanvas = cloneCanvas(canvas);
    const bitmapContext = bitmapCanvas.getContext("2d");
    const imageData = bitmapContext.getImageData(0, 0, bitmapCanvas.width, bitmapCanvas.height);
    const src = imageData.data;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        sum += src[i];
        count += 1;
      }
    }
    let mean = sum / count;
    for (let i = 0; i < src.length; i += 4) {
      if (src[i + 3] !== 0) {
        let output = mean + scale * (src[i] - mean);
        src[i] = output;
        src[i + 1] = output;
        src[i + 2] = output;
      }
    }
    bitmapContext.putImageData(imageData, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(bitmapCanvas, 0, 0);
    return bitmapCanvas;
  }
};

export const editBrightness = (image, context, boundingBox, brightness) => {
  if (context && boundingBox) {
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      src[i] += 255 * (brightness / 100);
      src[i + 1] += 255 * (brightness / 100);
      src[i + 2] += 255 * (brightness / 100);
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const editContrast = (image, context, boundingBox, contrast) => {
  function truncateColor(value) {
    if (value < 0) {
      value = 0;
    } else if (value > 255) {
      value = 255;
    }
    return value;
  }

  if (context && boundingBox) {
    const factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      src[i] = truncateColor(factor * (src[i] - 128.0) + 128.0);
      src[i + 1] = truncateColor(factor * (src[i + 1] - 128.0) + 128.0);
      src[i + 2] = truncateColor(factor * (src[i + 2] - 128.0) + 128.0);
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const adjustTone = (image, context, boundingBox, cpS, cp1, cp2, cpE) => {
  function getT(x, cpSx, cp1x, cp2x, cpEx) {
    let a = -cpSx + 3 * cp1x - 3 * cp2x + cpEx;
    let b = 3 * cpSx - 6 * cp1x + 3 * cp2x;
    let c = -3 * cpSx + 3 * cp1x;
    let d = cpSx - x;
    let solution = solveCubic(a, b, c, d);
    for (let i = 0; i < solution.length; i++) {
      if (solution[i] >= 0 && solution[i] <= 1.09) {
        return solution[i];
      }
    }
  }
  function getD(t, cpSy, cp1y, cp2y, cpEy) {
    let y =
      Math.pow(1 - t, 3) * cpSy +
      3 * Math.pow(1 - t, 2) * t * cp1y +
      3 * (1 - t) * Math.pow(t, 2) * cp2y +
      Math.pow(t, 3) * cpEy;
    return y;
  }
  function getX(x, w = 200) {
    return (255 * x) / w;
  }
  function getY(y, h = 200) {
    return (255 * (h - y)) / h;
  }
  if (context && boundingBox) {
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      let output = getD(
        getT(src[i], getX(cpS.x), getX(cp1.x), getX(cp2.x), getX(cpE.x)),
        getY(cpS.y),
        getY(cp1.y),
        getY(cp2.y),
        getY(cpE.y)
      );
      src[i] = output;
      src[i + 1] = output;
      src[i + 2] = output;
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};

export const addScaleShift = (image, context, boundingBox, a, b) => {
  if (context && boundingBox) {
    const imageData = context.getImageData(boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]);
    const src = imageData.data;
    for (let i = 0; i < src.length; i += 4) {
      let output = a * src[i] + 255 * (b / 2);
      src[i] = output;
      src[i + 1] = output;
      src[i + 2] = output;
    }
    context.putImageData(imageData, boundingBox[0], boundingBox[1]);
  }
};
