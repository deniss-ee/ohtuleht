javascript: (function () {
  const headline =
    document.querySelector('meta[property="og:title"]')?.content?.trim() ||
    "Title not found";
  const idMatch = window.location.href.match(
    /ohtuleht\.ee\/(?:[^/]+\/)?(\d{6,})/
  );
  const articleId = idMatch ? idMatch[1] : "";
  const articleUrl = articleId
    ? `https://www.ohtuleht.ee/${articleId}/`
    : window.location.href;
  const ogImage =
    document.querySelector('meta[property="og:image"]')?.content || "";
  const imageUrl = ogImage.replace("/59/", "/54/");
  const bannerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
  <title>Ohtuleht Piano ID</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:wght@700&family=Roboto:wght@700&display=swap" rel="stylesheet">
  <style>
    :where([hidden]), .hidden { display: none !important; visibility: hidden !important; }
    body, * { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; overflow: hidden; }
    .wrapper { width: 100%; height: 100%; background-position: center; background-repeat: no-repeat; background-size: cover; border-radius: 0; overflow: hidden; position: absolute; background-image: url('${imageUrl}'); }
    .gradient { display: block; position: relative; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%); content: ""; }
    .st-text { z-index: 100; position: absolute; bottom: 0; left: 0; padding: 1rem; }
    .badge { margin-bottom: 0.5em; color: #fff; font-family: "Roboto", sans-serif; font-size: 0.875rem; font-style: normal; font-weight: 700; line-height: 1.25em; }
    .header { color: #fff; font-family: "Fira Sans Condensed"; font-size: 1.25rem; font-style: normal; font-weight: 700; line-height: 1.25em; }
  </style>
</head>
<body>
  <div class="wrapper" onclick="window.open(olBanner.getClickTag('${articleUrl}'), '_blank')">
    <div class="st-text">
      <p class="badge">Sisuturundus</p>
      <p class="header">${headline}</p>
    </div>
    <div class="gradient"></div>
  </div>
  <script>
    var olBanner = {
      getQueryStringValue: function (key) {
        return decodeURIComponent(window
          .location
          .search
          .replace(new RegExp("^(?:.*[&?]" + encodeURIComponent(key).replace(/[.+*]/g, "$&") + "(?:=([^&]*))?)?.*$", "i"), "$1"))
      },
      getClickTag: function (customDestinationUrl) {
        this.clickMacro = this.getQueryStringValue('clickMacro');
        this.clickTag = this.getQueryStringValue('clickTag');
        if (customDestinationUrl !== undefined && customDestinationUrl.length > 0) {
          return this.clickMacro + customDestinationUrl
        } else {
          return this.clickTag
        }
      }
    };
    var clickTag = "";
  </script>
</body>
</html>`;

  const blob = new Blob([bannerHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `banner-${articleId || "ohtuleht"}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
})();
