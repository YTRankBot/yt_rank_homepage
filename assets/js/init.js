// 指定個所にJavaScript読み込みタグを追加
function loadScript(src, beforeEl) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = src;
    tag.onload = resolve;
    tag.onerror = reject;
    beforeEl.parentNode.insertBefore(tag, beforeEl);
  });
}

// 初期セットアップ
function init() {
  
  // 既存スクリプト位置
  const orgScript = document.querySelector("script#org_js");
  
  // 外部スクリプト一覧
  const scripts = [
    "/assets/js/common.js"
  ]
  
  // 外部スクリプトを読み込み
  return Promise.all(scripts.map(s => loadScript(s, orgScript)));
}
