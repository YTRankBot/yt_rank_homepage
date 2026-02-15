// 表示状態の切り替え
async function change_disp() {
  
  // 人気リンクタグ作成
  // 人気リンクJson読み込み
  popularLinksJson = await loadJson("/assets/json/popular_links.json");
  
  // 書き込み先タグを取得 & 中身を空にする
  const popularLinksParent = document.querySelector("aside.panel.right div.side-list");
  popularLinksParent.replaceChildren();
  
  for(let data of popularLinksJson) {
    createPopularLink(popularLinksParent, data.labelName, data.linkUrl);
  }

  // ヘッダーメニューのアクティブ設定
  if(GlobalVar.data.currentUrl == GlobalVar.data.originUrl) {
    // トップページの場合
    document.querySelector("nav.top-nav > a.top").classList.add("is-active");
  } else if(GlobalVar.data.currentUrl.includes("ranking")) {
    // ランキングページの場合
    document.querySelector("nav.top-nav > a.rank").classList.add("is-active");
    
    // ページ下部の次ページリンク設定
    // URLから日付, ページ番号, カテゴリを取得
    const match = GlobalVar.data.currentUrl.match(/(20\d{6})-(\d+)/);
    const pageDate = match[1];
    const pageNum = Number(match[2]);

    // ページ構成jsonを読み込み
    const configJson = await loadJson("/assets/json/ranking_page_config.json");
    let files = [];

    // configJsonからページリストを取得する
    for(let rankingDurationTypePage of configJson.rankingDurationTypes) {
      if(GlobalVar.data.rankingDurationType[0] == rankingDurationTypePage.durationType) {
        for(let page of rankingDurationTypePage.pageList) {
          if(pageDate == page.dataGetStartTiming) {
            for(detailPage of page.detailPages) {
              if(GlobalVar.data.category[0] == detailPage.categoryId && GlobalVar.data.isShort == detailPage.isShort) {
                files = detailPage.pageNameList;
                break;
              }
            }
          }
        }
      }
    }

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

  // パンくずリスト作成
  buildBreadcrumb(GlobalVar.data.rankingDurationType, GlobalVar.data.category);

  // サイドメニューの検索欄設定
  setupSideFilterSearch({
    baseUrl: "/ranking/index.html"
    , initialRankingDurationType: GlobalVar.data.rankingDurationType[0]
    , initialCategory: GlobalVar.data.category[0]
    , initialVideoWidth: GlobalVar.data.videoWidth
  });

  // Googleアドセンス関連（エラー対策に最後に呼び出し）
  (adsbygoogle = window.adsbygoogle || []).push({});
}

// パンくずリスト
function buildBreadcrumb(rankingDurationType, category) {
  const list = document.getElementById("breadcrumb");
  if (!list) return;

  const crumbs = [];
  crumbs.push({ name: "トップ", url: "/" });

  // ranking 配下
  if (location.pathname.includes("ranking")) {
    
    // ランキング期間タイプ
    crumbs.push({name: "ランキング（" + rankingDurationType[1] + "）"
                 , url: "/ranking/index.html?duration=" + rankingDurationType[0]
                });

    // カテゴリ
    crumbs.push({name: GlobalVar.data.category[1]
                 , url: "/ranking/index.html?duration=" + rankingDurationType[0] + "&category=" + GlobalVar.data.category[0]
                });
  }

  // 描画
  list.innerHTML = "";
  crumbs.forEach((c, i) => {
    const li = document.createElement("li");
    //const isLast = i === crumbs.length - 1;

    if (c.url) li.innerHTML = `<a href="${c.url}">${c.name}</a>`;
    else li.innerHTML = `<span>${c.name}</span>`;

    list.appendChild(li);
  });
}

/**
 * 検索機能
 */
function setupSideFilterSearch({ baseUrl, initialRankingDurationType = null, initialCategory = null, initialVideoWidth = false }) {

  // --- 対象要素の取得 ---
  const durationTags = [...document.querySelectorAll("div.side-list.duration .tag[data-duration]")];
  const categoryTags = [...document.querySelectorAll("div.side-list.catgory .tag[data-category]")];
  const videoWidthTags = [...document.querySelectorAll("div.side-list.video-width .tag[data-video-width]")];

  // いずれの要素も選択されていないときは何もしない
  const isSelectedSearchEles = (categoryTags.length + durationTags.length + videoWidthTags.length) > 0;
  if(!isSelectedSearchEles) return;

  // 検索ボタン取得
  let searchBtn = document.querySelector(".side-search-btn");

  // 初期値：URLクエリがあれば優先
  const params = new URLSearchParams(location.search);
  let selectedDuration = params.get("duration") || initialRankingDurationType;
  let selectedCategory = params.get("category") || initialCategory;
  let selectedVideoWidth = params.get("videoWidth") || initialVideoWidth;

  // 共通：選択1つだけ active にする
  function selectOne(elems, elemToSelect) {
    elems.forEach(el => el.classList.remove("is-active"));
    if(elemToSelect) elemToSelect.classList.add("is-active");
  }

  // キーボードとタブ操作可能にする
  function makeTagInteractive(tag) {
    tag.setAttribute("role", "button");
    tag.setAttribute("tabindex", "0");
    tag.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tag.click();
      }
    });
  }

  if(isSelectedSearchEles) {
    durationTags.forEach(makeTagInteractive);
    categoryTags.forEach(makeTagInteractive);
    videoWidthTags.forEach(makeTagInteractive);

    // 初期表示反映
    if(selectedDuration) {
      const t = durationTags.find(x => x.dataset.duration === selectedDuration);
      if(t) selectOne(durationTags, t);
    }

    if(selectedCategory) {
      const t = categoryTags.find(x => x.dataset.category === selectedCategory);
      if(t) selectOne(categoryTags, t);
    }

    if(selectedVideoWidth) {
      const t = videoWidthTags.find(x => x.dataset.videoWidth === selectedVideoWidth);
      if(t) selectOne(videoWidthTags, t);
    }

    // クリックで選択
    durationTags.forEach(tag => {
      tag.addEventListener("click", () => {
        selectOne(durationTags, tag);
        selectedDuration = tag.dataset.duration;
      });
    });

    categoryTags.forEach(tag => {
      tag.addEventListener("click", () => {
        selectOne(categoryTags, tag);
        selectedCategory = tag.dataset.category;
      });
    });

    videoWidthTags.forEach(tag => {
      tag.addEventListener("click", () => {
        selectOne(videoWidthTags, tag);
        selectedVideoWidth = tag.dataset.videoWidth;
      });
    });
  }

  // 検索ボタン：選択値をクエリにして遷移
  searchBtn.addEventListener("click", () => {
    if(!selectedDuration || !selectedCategory || !selectedVideoWidth) {
      alert("カテゴリと期間を選択してください");
      return;
    }

    const url = new URL(baseUrl, location.origin);
    url.searchParams.set("duration", selectedDuration);
    url.searchParams.set("category", selectedCategory);
    url.searchParams.set("videoWidth", selectedVideoWidth);

    location.href = url.toString();
  });
}

/**
 * 人気リンク作成
 */
function createPopularLink(parentEle, labelName, linkUrl) {
  // リンク設定
  const childEle = document.createElement("a");
  childEle.className = "side-item";
  childEle.href = linkUrl;
  
  // ラベル設定
  const textEle = document.createElement("b");
  textEle.textContent = labelName;
  
  childEle.appendChild(textEle);
  parentEle.appendChild(childEle);
}

/** ============================ X関連 ============================ */
function postToX(){

  // Xで共有リンク情報設定
  const title = document.querySelector("h2.panel__title").innerText;
  const dataAnalisisDate = document.querySelector("span.data_analisis_date").innerText;
  const message = encodeURIComponent(title
                                     + "\n" + "集計期間：" + dataAnalisisDate
                                     + "\n"
                                     + "\n");
  const url = GlobalVar.data.currentUrl;

  // アプリ用
  const appUrl = "twitter://post?message=" + message + url;

  // Webフォールバック
  const webUrl = "https://x.com/intent/post?text=" + message + "&url=" + url;

  // アプリ起動を試す
  const now = Date.now();
  location.href = appUrl;
  
  const timer = 800;

  // スマホの場合は時間を10秒にする
  if(window.innerWidth <= 680) {
    timer = 10000;
  }

  // 起動しなかった場合Webへ
  setTimeout(function(){
    if(Date.now() - now < timer){
      window.open(webUrl, "_blank");
    }
  }, 500);
}

/** ============================ 共通関数 ============================ */
/** 
 * ページ構成jsonを取得
 */
async function loadJson(jsonPath) {
  const res = await fetch(jsonPath);
  return await res.json();
}

/**
 * "YYYY-MM-DD HH:mm:ss" / "YYYY-MM-DDTHH:mm:ss" を
 * タイムスタンプ(ms)に変換する
 * 失敗時は 0 を返す
 */
function toTimestamp(datetimeStr) {
  if (!datetimeStr) return 0;

  try {
    // 文字列化 → スペースをTに変換 → Date
    const iso = String(datetimeStr).replace(" ", "T");
    const time = new Date(iso).getTime();

    return isNaN(time) ? 0 : time;
  } catch (e) {
    return 0;
  }
}

/**
 * テンプレートHTMLを読み込む
 */
async function loadTemplateHtml(templateHtmlPath) {
  const res = await fetch(templateHtmlPath, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Template fetch failed: ${res.status} ${templateHtmlPath}`);
  return await res.text();
}

