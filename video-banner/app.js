document.addEventListener("DOMContentLoaded", function () {
  const videoInput = document.getElementById("videoInput");
  const downloadBtn = document.getElementById("downloadBtn");
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");

  let videoFile = null;
  let videoFileName = "video";

  function sanitizeFileName(name) {
    // Remove extension, spaces, and special characters
    return name
      .replace(/\.[^/.]+$/, "") // remove extension
      .replace(/[^a-zA-Z0-9_-]/g, "_"); // replace space and special chars with '_'
  }

  videoInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("video/")) {
      status.textContent = "Выберите видео файл.";
      videoFile = null;
      preview.classList.add("hidden");
      downloadBtn.disabled = true;
      return;
    }
    videoFile = file;
    videoFileName = sanitizeFileName(file.name);
    status.textContent = `Выбран: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
    downloadBtn.disabled = false;
  });

  downloadBtn.addEventListener("click", async function () {
    if (!videoFile) return;

    status.textContent = "Генерируем ZIP...";

    // HTML template (use your code)
    const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Video Banner</title>
  <meta name="viewport" content="width=600, user-scalable=yes">
  <style>
    html, body {
      height: 100%;
      margin: 0;
      background: #fff;
    }
    .video-banner {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #fff;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: #000;
      display: block;
    }
  </style>
</head>
<body>
  <div class="video-banner">
    <video
      src="video.mp4"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
    ></video>
  </div>
</body>
</html>`;

    const zip = new JSZip();
    zip.file("index.html", htmlString);
    zip.file("video.mp4", videoFile);

    try {
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 }
      });
      saveAs(content, `${videoFileName}.zip`);
      status.textContent = "ZIP успешно скачан!";
    } catch (err) {
      status.textContent = "Ошибка: " + err.message;
    }
  });
});