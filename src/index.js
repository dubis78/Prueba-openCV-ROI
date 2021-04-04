import cv from "opencv.js";

const loadImageToCanvas = (url, cavansId, callback) => {
  let canvas = document.getElementById(cavansId);
  let ctx = canvas.getContext("2d");
  let img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    callback();
  };
  img.src = url;
};

let vol = document.getElementById("volume");
let volume = 625;
let firstVal = 3;

vol.addEventListener(
  "input",
  function() {
    volume = parseInt(vol.value);
    if (volume % 2 === 0 || volume === 0) {
      volume++;
    }
    console.log('vol ', volume);
    transform();
  },
  false
);

function transform() {
  let src = cv.imread("canvasInput");
  let dst = new cv.Mat(), result = new cv.Mat();
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  let M = cv.Mat.ones(4, 4, cv.CV_8U);
  cv.adaptiveThreshold(
    src,
    dst,
    255,
    cv.ADAPTIVE_THRESH_MEAN_C,
    cv.THRESH_BINARY,
    volume,
    firstVal
  );
  cv.morphologyEx(dst, dst, cv.MORPH_GRADIENT, M); 
  //morphologyEx nos permite aplicar varias operaciones morfológicas, incluso la erosión y la dilatación.
  cv.threshold(dst, dst, 177, 200, cv.THRESH_BINARY);
  cv.findContours(dst, contours, hierarchy, 1, 2);
  let cnt = contours.get(0);
  console.log(contours,cnt);
  let rect = cv.boundingRect(cnt); 
  let rectangleColor = new cv.Scalar(255, 255, 0);
  let point1 = new cv.Point(rect.x, rect.y);
  let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
  cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
  console.log(rect,point1,point2);
  result = src.roi(rect);
  cv.imshow("canvasOutput", dst);
  cv.imshow("canvasResult", result);
  src.delete();
  dst.delete();
  contours.delete();
  hierarchy.delete();
  cnt.delete();
}

loadImageToCanvas("/public/radio.png", "canvasInput", () => {
  transform();
});
