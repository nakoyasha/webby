let text = "helo!";
let rotation = 0;
const image = "assets/stickers/Haruka_09.png";
let positionX = 0;
let positionY = 0;

function draw(context) {
  const img = new Image();
  const yurukaFont = new FontFace(
    "Yuruka",
    'url("assets/fonts/YurukaStd.woff2") format("woff2")'
  );

  yurukaFont.load().then(function (font) {
    document.fonts.add(font);
    img.src = image;

    img.onload = () => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      const centerX = context.canvas.width / 2;
      const centerY = context.canvas.height / 2;

      const widthRatio = context.canvas.width / img.width;
      const heightRatio = context.canvas.height / img.height;
      const ratio = Math.min(widthRatio, heightRatio);

      var centerShiftX = (context.canvas.width - img.width * ratio) / 2;
      var centerShiftY = (context.canvas.height - img.height * ratio) / 2;

      const imageCenterX = img.width / ratio;
      const imageCenterY = img.height / ratio;

      context.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShiftX,
        centerShiftY,
        img.width * ratio,
        img.height * ratio
      );
      context.font = "30px Yuruka";
      context.lineWidth = 9;
      context.save();

      context.strokeStyle = "white";
      context.fillStyle = "#6495f0";
      context.textAlign = "center";
      context.translate(positionX, positionY);
      context.rotate(rotation / 10);
      context.strokeText(text, centerX, centerY);
      context.fillText(text, centerX, centerY);

      context.restore();
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("sticker");
  const context = canvas.getContext("2d");
  const sliderX = document.getElementById("X");
  const sliderY = document.getElementById("Y");
  const sliderRotation = document.getElementById("Rotation");
  const textInput = document.getElementById("text");

  sliderX.addEventListener("input", function () {
    positionX = sliderX.value;
    draw(context);
  });

  textInput.addEventListener("input", function () {
    text = textInput.value;
    draw(context);
  });

  sliderY.addEventListener("input", function () {
    positionY = sliderY.value;
    draw(context);
  });

  sliderRotation.addEventListener("input", function () {
    rotation = sliderRotation.value;
    draw(context);
  });

  context.canvas.width = 296;
  context.canvas.height = 256;

  draw(context);
});
