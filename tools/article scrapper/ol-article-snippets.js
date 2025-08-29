(function(){
  /**
   * Ohtuleht Article Banner Snippet Generator
   * Extracts title, image, and URL from current article page and opens a new
   * tab with ready-made Mobile & Desktop banner HTML snippets. Clicking a
   * snippet copies it to the clipboard.
   */
  try {
    function esc(html){
      return (html||"")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");
    }

    const doc = document;
    const rawTitle = doc.querySelector('meta[property="og:title"], meta[name="twitter:title"], title')?.content || doc.title || "Title not found";
    const headline = rawTitle.trim();

    // Prefer og:url or canonical; fallback to location.href
    const canonicalUrl = doc.querySelector('meta[property="og:url"], link[rel="canonical"]')?.content || window.location.href;

    // Extract first 6+ digit token in path as article ID (if exists)
    const pathIds = window.location.pathname.match(/\d{6,}/g);
    const articleId = pathIds ? pathIds[0] : "";

    // Normalize URL pattern if ID found
    let articleUrl = canonicalUrl;
    if(articleId){
      articleUrl = `https://www.ohtuleht.ee/${articleId}/`;
    }

    // Image
    const ogImage = doc.querySelector('meta[property="og:image"], meta[name="twitter:image"]')?.content || "";
    // Attempt to swap size directory /59/ -> /54/ if present
    let imageUrl = ogImage.replace(/\/([0-9]{2})\//, function(_,size){
      return size === '59' ? '/54/' : '/' + size + '/';
    });

    // Badge text fixed for now; could be made dynamic
    const badge = 'Sisuturundus';

    // Build snippet strings
    const mobileSnippet = `<div class="swiper-slide" onclick="window.open(olBanner.getClickTag('${esc(articleUrl)}'), '_blank')">\n  <div class=\"st-wrapper\" style=\"background-image: url('${esc(imageUrl)}')\">\n    <div class=\"st-text\">\n      <p class=\"badge\">${esc(badge)}</p>\n      <p class=\"header\">${esc(headline)}</p>\n    </div>\n    <div class=\"gradient\"></div>\n  </div>\n</div>`;

    const desktopSnippet = `<div class=\"swiper-slide\" onclick=\"window.open(olBanner.getClickTag('${esc(articleUrl)}'), '_blank')\">\n  <div class=\"article\">\n    <div class=\"img\" style=\"background-image: url('${esc(imageUrl)}')\">\n      <p class=\"badge\">${esc(badge)}</p>\n    </div>\n    <p class=\"title\">${esc(headline)}</p>\n  </div>\n</div>`;

    const htmlPage = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />\n<title>Generated Banner Snippets</title>\n<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;margin:0;padding:1.25rem;background:#111;color:#eee;line-height:1.4}h1{font-size:1.25rem;margin:0 0 .75rem;font-weight:600}section{margin-bottom:1.5rem}pre{background:#1e1e1e;padding:.75rem 1rem;border:1px solid #333;border-radius:6px;overflow:auto;position:relative;font-size:.78rem;line-height:1.3}button.copy{position:absolute;top:6px;right:6px;background:#2563eb;color:#fff;border:none;font-size:.65rem;padding:.4rem .55rem;border-radius:4px;cursor:pointer;display:flex;gap:.35rem;align-items:center;font-weight:600;letter-spacing:.5px}button.copy:active{transform:translateY(1px)}.copied{background:#059669 !important}footer{font-size:.65rem;opacity:.6;margin-top:2rem;text-align:center}.id-tag{font-size:.65rem;opacity:.7;margin-bottom:.5rem}.meta{font-size:.7rem;margin-bottom:.75rem;color:#aaa}code{font-family:SFMono-Regular,Menlo,Consolas,monospace;}</style></head><body>\n<h1>Ohtuleht Banner Snippets</h1>\n<div class="meta">Article: <a href="${esc(articleUrl)}" target="_blank" style="color:#3b82f6">${esc(articleUrl)}</a></div>\n${articleId?`<div class="id-tag">Article ID: ${articleId}</div>`:''}\n<section><h2 style="font-size:1rem;margin:0 0 .35rem">Mobile</h2><pre><button class="copy" data-target="mobile">Copy</button><code id="mobile">${esc(mobileSnippet)}</code></pre></section>\n<section><h2 style="font-size:1rem;margin:0 0 .35rem">Desktop</h2><pre><button class="copy" data-target="desktop">Copy</button><code id="desktop">${esc(desktopSnippet)}</code></pre></section>\n<footer>Click Copy to put snippet into clipboard. Generated ${(new Date()).toLocaleString()}</footer>\n<script>\n(function(){\n  function copy(id,btn){\n    var el=document.getElementById(id);\n    var text=el.textContent;\n    if(navigator.clipboard&&navigator.clipboard.writeText){\n      navigator.clipboard.writeText(text).then(function(){flash(btn);});\n    }else{\n      var ta=document.createElement('textarea');\n      ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');flash(btn);}catch(e){};document.body.removeChild(ta);\n    }\n  }\n  function flash(btn){\n    var orig=btn.textContent;btn.classList.add('copied');btn.textContent='Copied';setTimeout(function(){btn.classList.remove('copied');btn.textContent=orig;},1600);\n  }\n  document.addEventListener('click',function(e){\n    var b=e.target.closest('button.copy');\n    if(!b)return;copy(b.getAttribute('data-target'),b);\n  });\n})();\n</script>\n</body></html>`;

    const w = window.open('about:blank','_blank');
    if(!w){ alert('Popup blocked. Please allow popups for this site.'); return; }
    w.document.open();
    w.document.write(htmlPage);
    w.document.close();
  } catch(err){
    console.error('Snippet generator error:', err);
    alert('Failed to generate snippets: '+ err.message);
  }
})();
