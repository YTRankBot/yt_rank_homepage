// 表示状態の切り替え
async function change_disp() {

  // パンくずリスト作成
  buildBreadcrumb();
  
  // 現在のページURLを取得
  let currentUrl = window.location.href;
  let originUrl = window.location.origin + "/";
  
  // ヘッダーメニューのアクティブ設定
  if(currentUrl == originUrl) {
    // トップページの場合
    document.querySelector("nav.top-nav > a.top").classList.add("is-active");
  } else if(currentUrl.includes("ranking")) {
    // ランキングページの場合
    document.querySelector("nav.top-nav > a.rank").classList.add("is-active");
    
    // サイドメニュー（期間）のアクティブ設定
    if(currentUrl.includes("weekly")) {
      // 週間の場合
      document.querySelector("div.side-list.duration > a.side-item.weekly").classList.add("is-active");
    } else if(currentUrl.includes("monthly")) {
      // 月間の場合
      document.querySelector("div.side-list.duration > a.side-item.monthly").classList.add("is-active");
    } else if(currentUrl.includes("yearly")) {
      // 年間の場合
      document.querySelector("div.side-list.duration > a.side-item.yearly").classList.add("is-active");
    }
    
    // サイドメニュー（ジャンル）のアクティブ設定
    if(currentUrl.toLowerCase().includes("all")) {
      // 総合
      document.querySelector("div.side-list.catgory > a.side-item.all").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("gaming")){
      // ゲーム
      document.querySelector("div.side-list.catgory > a.side-item.gaming").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("music")){
      // 音楽
      document.querySelector("div.side-list.catgory > a.side-item.music").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("film_animation")){
      // 映画とアニメ
      document.querySelector("div.side-list.catgory > a.side-item.film_animation").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("pets_animals")){
      // ペットと動物
      document.querySelector("div.side-list.catgory > a.side-item.pets_animals").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("entertainment")){
      // エンターテイメント
      document.querySelector("div.side-list.catgory > a.side-item.entertainment").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("sports")){
      // スポーツ
      document.querySelector("div.side-list.catgory > a.side-item.sports").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("autos_vehicles")){
      // 自動車と乗り物
      document.querySelector("div.side-list.catgory > a.side-item.autos_vehicles").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("travel_events")){
      // 旅行とイベント
      document.querySelector("div.side-list.catgory > a.side-item.travel_events").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("people_blogs")){
      // ブログ
      document.querySelector("div.side-list.catgory > a.side-item.people_blogs").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("comedy")){
      // コメディー
      document.querySelector("div.side-list.catgory > a.side-item.comedy").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("news_politics")){
      // ニュースと政治
      document.querySelector("div.side-list.catgory > a.side-item.news_politics").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("howto_style")){
      // ハウツーとスタイル
      document.querySelector("div.side-list.catgory > a.side-item.howto_style").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("education")){
      // 教育
      document.querySelector("div.side-list.catgory > a.side-item.education").classList.add("is-active");
    } else if(currentUrl.toLowerCase().includes("science_technology")){
      // 科学と技術
      document.querySelector("div.side-list.catgory > a.side-item.science_technology").classList.add("is-active");
    }
    
    // Xで共有リンク設定
    const title = document.querySelector("h2.panel__title").innerText;
    document.querySelector("a.share-btn.x").href = "https://x.com/intent/post?text=" + title + "&url=" + currentUrl;
    
    // ページ下部の次ページリンク設定
    // URLから日付とページ番号を取得
    const match = currentUrl.match(/(20\d{6})-(\d+)/);
    const pageDate = match[1];
    const pageNum = Number(match[2]);
    
    // ページ構成jsonを読み込む
    const json = await loadConfig();
    const files = json.data.weekly[pageDate];
    console.log("ページ番号：" + pageNum);
    // 前へボタン設定
    if(pageNum == 1) {
      //先頭ページの場合
      document.querySelector("a.pager-btn.previous").classList.add("is-disabled");
      document.querySelector("a.pager-btn.previous").setAttribute("aria-disabled", "true");
    } else {
      // 先頭ページではない場合
      document.querySelector("a.pager-btn.previous").href = "./" + files[(pageNum - 1) - 1];
    }
    
    // 次へボタン設定
    if(pageNum == files.length) {
      //末尾ページの場合
      document.querySelector("a.pager-btn.next").classList.add("is-disabled");
      document.querySelector("a.pager-btn.next").setAttribute("aria-disabled", "true");
    } else {
      // 末尾ページではない場合
      document.querySelector("a.pager-btn.next").href = "./" + files[(pageNum - 1) + 1];
    }
    
    // 各ページ番号ボタン要素を取得
    const pageBtnEles = document.querySelectorAll("div.pager-pages > a.pager-page");
    
    // 各ページ番号ボタン設定
    for(let i = 0; i < pageBtnEles.length; i++) {
      // ページ数が少ない場合は後続の不要なページ番号を削除する
      if(files.length < i+1) {
        pageBtnEles[i].remove();
        continue;
      }
      
      // 自身のページ番号ボタンの場合
      if(pageNum == i+1) {
        pageBtnEles[i].classList.add("is-active");
      }
      
      // URLを設定
      pageBtnEles[i].href = "./" + files[i];
    }
  }

}

// ページ構成jsonを取得
async function loadConfig() {
  const res = await fetch('/assets/json/ranking_page_config.json');
  return await res.json();
}



// パンくずリスト
function buildBreadcrumb() {
  const list = document.getElementById("breadcrumb");
  if (!list) return;

  const path = location.pathname.replace(/\/$/, "");

  const crumbs = [];
  crumbs.push({ name: "トップ", url: "/" });

  // ranking 配下
  if (path.includes("/ranking/")) {
    crumbs.push({ name: "ランキング", url: "/rank-weekly-all.html" }); // ランキング導線の代表リンク

    if (path.includes("/weekly/")) crumbs.push({ name: "週間" });
    else if (path.includes("/monthly/")) crumbs.push({ name: "月間" });
    else if (path.includes("/yearly/")) crumbs.push({ name: "年間" });

    // カテゴリ（URL文字列ベース）
    const lower = path.toLowerCase();
    if (lower.includes("all")) crumbs.push({ name: "総合" });
    else if (lower.includes("gaming")) crumbs.push({ name: "ゲーム" });
    else if (lower.includes("music")) crumbs.push({ name: "音楽" });
    else if (lower.includes("film_animation")) crumbs.push({ name: "映画とアニメ" });
    else if (lower.includes("pets_animals")) crumbs.push({ name: "ペットと動物" });
    else if (lower.includes("entertainment")) crumbs.push({ name: "エンターテイメント" });
    else if (lower.includes("sports")) crumbs.push({ name: "スポーツ" });
    else if (lower.includes("autos_vehicles")) crumbs.push({ name: "自動車と乗り物" });
    else if (lower.includes("travel_events")) crumbs.push({ name: "旅行とイベント" });
    else if (lower.includes("people_blogs")) crumbs.push({ name: "ブログ" });
    else if (lower.includes("comedy")) crumbs.push({ name: "コメディー" });
    else if (lower.includes("news_politics")) crumbs.push({ name: "ニュースと政治" });
    else if (lower.includes("howto_style")) crumbs.push({ name: "ハウツーとスタイル" });
    else if (lower.includes("education")) crumbs.push({ name: "教育" });
    else if (lower.includes("science_technology")) crumbs.push({ name: "科学と技術" });
  }

  // 描画
  list.innerHTML = "";
  crumbs.forEach((c, i) => {
    const li = document.createElement("li");
    const isLast = i === crumbs.length - 1;

    if (c.url && !isLast) li.innerHTML = `<a href="${c.url}">${c.name}</a>`;
    else li.innerHTML = `<span>${c.name}</span>`;

    list.appendChild(li);
  });
}