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

  // グローバル変数用
  window.GlobalVar = {
    data : {}
  };
  
  // 現在のページURLを取得
  GlobalVar.data.currentUrl = window.location.href;
  GlobalVar.data.originUrl = window.location.origin + "/";

  // ランキング期間タイプ取得
  if(GlobalVar.data.currentUrl.includes("weekly")) {
    // 週間の場合
    GlobalVar.data.rankingDurationType = ["weekly", "週間"];
  } else if(GlobalVar.data.currentUrl.includes("monthly")) {
    // 月間の場合
    GlobalVar.data.rankingDurationType = ["monthly", "月間"];
  } else if(GlobalVar.data.currentUrl.includes("yearly")) {
    // 年間の場合
    GlobalVar.data.rankingDurationType = ["yearly", "年間"];
  } else {
    GlobalVar.data.rankingDurationType = [];
  }

  // ランキングカテゴリ取得
  if(GlobalVar.data.currentUrl.includes("FILM_ANIMATION")){
    // 映画とアニメ
    GlobalVar.data.category = ["FILM_ANIMATION", "映画とアニメ"];
  } else if(GlobalVar.data.currentUrl.includes("AUTOS_VEHICLES")){
    // 自動車と乗り物
    GlobalVar.data.category = ["AUTOS_VEHICLES", "自動車と乗り物"];
  } else if(GlobalVar.data.currentUrl.includes("MUSIC")){
    // 音楽
    GlobalVar.data.category = ["MUSIC", "音楽"];
  } else if(GlobalVar.data.currentUrl.includes("PETS_ANIMALS")){
    // ペットと動物
    GlobalVar.data.category = ["PETS_ANIMALS", "ペットと動物"];
  } else if(GlobalVar.data.currentUrl.includes("SPORTS")){
    // スポーツ
    GlobalVar.data.category = ["SPORTS", "スポーツ"];
  } else if(GlobalVar.data.currentUrl.includes("TRAVEL_EVENTS")){
    // 旅行とイベント
    GlobalVar.data.category = ["TRAVEL_EVENTS", "旅行とイベント"];
  } else if(GlobalVar.data.currentUrl.includes("GAMING")){
    // ゲーム
    GlobalVar.data.category = ["GAMING", "ゲーム"];
  } else if(GlobalVar.data.currentUrl.includes("PEOPLE_BLOGS")){
    // ブログ
    GlobalVar.data.category = ["PEOPLE_BLOGS", "ブログ"];
  } else if(GlobalVar.data.currentUrl.includes("COMEDY")){
    // コメディー
    GlobalVar.data.category = ["COMEDY", "コメディー"];
  } else if(GlobalVar.data.currentUrl.includes("ENTERTAINMENT")){
    // エンターテイメント
    GlobalVar.data.category = ["ENTERTAINMENT", "エンターテイメント"];
  } else if(GlobalVar.data.currentUrl.includes("NEWS_POLITICS")){
    // ニュースと政治
    GlobalVar.data.category = ["NEWS_POLITICS", "ニュースと政治"];
  } else if(GlobalVar.data.currentUrl.includes("HOWTO_STYLE")){
    // ハウツーとスタイル
    GlobalVar.data.category = ["HOWTO_STYLE", "‍ハウツーとスタイル"];
  } else if(GlobalVar.data.currentUrl.includes("EDUCATION")){
    // 教育
    GlobalVar.data.category = ["EDUCATION", "‍教育"];
  } else if(GlobalVar.data.currentUrl.includes("SCIENCE_TECHNOLOGY")){
    // 科学と技術
    GlobalVar.data.category = ["SCIENCE_TECHNOLOGY", "科学と技術‍"];
  } else if(GlobalVar.data.currentUrl.includes("All")) {
    // 総合
    GlobalVar.data.category = ["All", "総合‍"];
  } else {
    GlobalVar.data.category = [];
  }

  // ショート動画かどうか取得
  if(GlobalVar.data.currentUrl.includes("_ranking")) {
    if(GlobalVar.data.currentUrl.includes("_short")) {
      GlobalVar.data.isShort = true;
      GlobalVar.data.videoWidth = "short";
    } else {
      GlobalVar.data.isShort = false;
      GlobalVar.data.videoWidth = "full";
    }
  } else {
    if(GlobalVar.data.currentUrl.includes("videoWidth=short")) {
      GlobalVar.data.isShort = true;
      GlobalVar.data.videoWidth = "short";
    } else if(GlobalVar.data.currentUrl.includes("videoWidth=full")) {
      GlobalVar.data.isShort = false;
      GlobalVar.data.videoWidth = "full";
    }
  }
  
  // 既存スクリプト位置
  const orgScript = document.querySelector("script#org_js");
  
  // 外部スクリプト一覧
  const scripts = [
    "/assets/js/common.js"
    , "/assets/js/search.js"
  ]
  
  // GoogleAdSense情報
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
