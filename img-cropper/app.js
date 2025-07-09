const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dropzone = document.getElementById("dropzone");
const uploadOverlay = document.getElementById("uploadOverlay");
const fileInput = document.getElementById("file-input");
const buttonBar = document.getElementById("button-bar");
const downloadBtn = document.getElementById("download-btn");
const reloadBtn = document.getElementById("reload-btn");
const modeBar = document.getElementById("mode-bar");
const fitModeRadios = document.querySelectorAll(".fitmode-radio");

let imageLoaded = false;
let currentImage = null;
let currentFitMode = "auto";

function setDropzoneState(loaded) {
  if (loaded) {
    dropzone.classList.remove("border-2", "border-dashed", "border-gray-300");
    dropzone.style.border = "none";
    uploadOverlay.style.display = "none";
    buttonBar.classList.remove("hidden");
    modeBar.classList.remove("hidden");
  } else {
    dropzone.classList.add("border-2", "border-dashed", "border-gray-300");
    uploadOverlay.style.display = "";
    buttonBar.classList.add("hidden");
    modeBar.classList.add("hidden");
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
setDropzoneState(false);

// Mode switcher
fitModeRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (imageLoaded && currentImage) {
      currentFitMode = document.querySelector(".fitmode-radio:checked").value;
      drawImage(currentImage, currentFitMode);
    }
  });
});

// Drag&Drop + клик на зону
dropzone.addEventListener("click", () => {
  if (!imageLoaded) fileInput.click();
});

reloadBtn.addEventListener("click", () => {
  fileInput.value = "";
  fileInput.click();
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!imageLoaded) {
    dropzone.classList.add("border-blue-400", "bg-blue-50");
    uploadOverlay.classList.add("text-blue-600");
  }
});
dropzone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  if (!imageLoaded) {
    dropzone.classList.remove("border-blue-400", "bg-blue-50");
    uploadOverlay.classList.remove("text-blue-600");
  }
});
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!imageLoaded) {
    dropzone.classList.remove("border-blue-400", "bg-blue-50");
    uploadOverlay.classList.remove("text-blue-600");
    handleFiles(e.dataTransfer.files);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFiles(e.target.files);
    imageLoaded = true;
    setDropzoneState(true);
    fileInput.value = "";
  }
});

function handleFiles(files) {
  if (!files || !files[0]) return;
  const file = files[0];
  if (!file.type.startsWith("image/")) {
    alert("Загрузите изображение");
    return;
  }
  const img = new Image();
  img.onload = () => {
    imageLoaded = true;
    currentImage = img;
    currentFitMode = document.querySelector(".fitmode-radio:checked").value;
    setDropzoneState(true);
    drawImage(img, currentFitMode);
    fileInput.value = "";
  };
  img.onerror = () => alert("Ошибка загрузки изображения");
  img.src = URL.createObjectURL(file);
}

function drawImage(img, fitMode = "auto") {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Фон: блюр + затемнение
  const scaleBg = Math.max(canvas.width / img.width, canvas.height / img.height);
  const bgW = img.width * scaleBg;
  const bgH = img.height * scaleBg;
  const bgX = (canvas.width - bgW) / 2;
  const bgY = (canvas.height - bgH) / 2;
  ctx.save();
  ctx.filter = "blur(24px) brightness(0.6)";
  ctx.drawImage(img, bgX, bgY, bgW, bgH);
  ctx.restore();

  // 1. Оригинал уже 1920x1080 — не ресайзим
  if (img.width === 1920 && img.height === 1080) {
    ctx.drawImage(img, 0, 0, 1920, 1080);
    return;
  }

  // 2. Оригинальный размер по центру (без ресайза и без увеличения)
  if (fitMode === "center") {
    let drawW = img.width;
    let drawH = img.height;
    let sx = 0,
      sy = 0,
      sWidth = img.width,
      sHeight = img.height;

    // Если изображение шире/выше — рисуем центр фрагмента изображения
    if (drawW > canvas.width) {
      sx = Math.floor((img.width - canvas.width) / 2);
      sWidth = canvas.width;
      drawW = canvas.width;
    }
    if (drawH > canvas.height) {
      sy = Math.floor((img.height - canvas.height) / 2);
      sHeight = canvas.height;
      drawH = canvas.height;
    }
    const drawX = (canvas.width - drawW) / 2;
    const drawY = (canvas.height - drawH) / 2;
    ctx.drawImage(
      img,
      sx,
      sy,
      sWidth,
      sHeight, // источник (обрезаем если больше)
      drawX,
      drawY,
      drawW,
      drawH // на канвасе
    );
    return;
  }

  // 3. Fit (вписать с полосами)
  if (fitMode === "fit") {
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = (canvas.width - drawW) / 2;
    const drawY = (canvas.height - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    return;
  }

  // 4. Cover (обрезать)
  if (fitMode === "cover") {
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = (canvas.width - drawW) / 2;
    const drawY = (canvas.height - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    return;
  }

  // 5. Авто — по старой логике
  if (fitMode === "auto") {
    if (img.width === img.height) {
      // Квадрат
      const targetSize = 1080;
      const scale = targetSize / img.width;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else if (img.width < img.height) {
      // Вертикальные — по ширине 1080
      const targetW = 1080;
      const scale = targetW / img.width;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Горизонтальные — по высоте 1080
      const targetH = 1080;
      const scale = targetH / img.height;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
    return;
  }
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "resized-1920x1080.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
