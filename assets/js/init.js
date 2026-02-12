// 指定個所にJavaScript読み込みタグを追加
function loadScript(src, beforeEl, opts = {}) {
  return new Promise((resolve, reject) => {
    // すでに読み込み済みならスキップ（AdSenseなどで必須）
    const absSrc = new URL(src, location.href).href;
    const exists = [...document.scripts].some(s => s.src === absSrc);
    if(exists) return resolve();

    const tag = document.createElement("script");
    tag.src = src;

    if(opts.async) tag.async = true;

    // 追加属性
    if(opts.attrs) {
      for(const [k, v] of Object.entries(opts.attrs)) {
        tag.setAttribute(k, v);
      }
    }

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
  
  // AdSense情報
  const ad_client = "ca-pub-4701054377855528";
  
  // 外部スクリプトを読み込み
  return Promise.all([
           ...scripts.map(s => loadScript(s, orgScript))
           , loadScript(
               "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ad_client)
               , orgScript
               , {async: true, attrs: {crossorigin: "anonymous"}}
             )
         ]).then(() => {
           // 何か後続処理あれば
         });
}
