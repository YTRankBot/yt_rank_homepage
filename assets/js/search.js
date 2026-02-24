/**
 * 最新ピックアップ一覧を生成（トップページ用）
 */
async function generateLatestPicks() {
  // ページ構成jsonを読み込み
  const configJson = await loadJson("/assets/json/ranking_page_config.json");
  
  // テンプレート読み込み
  const cardTemplate = await loadTemplateHtml("/assets/template/search-card.html");
  
  // ■ 週間ランキング一覧設定
  // Jsonから最新データ一覧のみ抽出
  const latestWeeklyDetails = getLatestDetailPages(configJson, "weekly");
  
  // 週間再生数ランキング一覧枠要素
  const weeklyPicksDom = document.querySelector("div#weekly-picks");
  
  let allCardsHtml = "";
  let max = 7;
  let cnt = 1;
  
  for(const data of latestWeeklyDetails) {
    // 先頭のみNEWバッジをつける
    const newBadgeTag = cnt == 1 ? "<span class='badge-new'>NEW</span>" : "";
  
    allCardsHtml += replaceTemplate(cardTemplate, {
      page_link : "/ranking/weekly/" + data.pageNameList[data.pageNameList.length - 1]
      , page_position : "top"
      , img_link : "https://img.yt-ranking-bot.jp/" + data.pageNameList[0].replace(".html", ".png")
      , durationTypeId : "weekly"
      , durationTypeName : "週間"
      , category : data.categoryName
      , shortTag : (data.isShort ? "<ショート>" : "")
      , dataGetDate : data.dataGetDatetime.split(" ")[0].replaceAll("-", "/")
      , bottom_rank : data.bottomRank
      , comment : data.rankingComment
      , newBadgeTag : newBadgeTag
    }) + "\r\n";
    
    if(cnt++ >= max) {
      break;
    }
  }
  
  weeklyPicksDom.innerHTML = allCardsHtml.trim();
  
  const weeklyEndDate = latestWeeklyDetails[0].dataGetDatetime.split(" ")[0].replaceAll("-", "/");
  const weeklyStartDate = latestWeeklyDetails[latestWeeklyDetails.length - 1].dataGetDatetime.split(" ")[0].replaceAll("-", "/");
  
  // 期間を更新
  document.querySelector("section.panel.weekly_picks_panel span.data_analisis_date").innerHTML = weeklyStartDate + " ～ " + weeklyEndDate;

  // ■ 月間ランキング一覧設定
  // Jsonから最新データ一覧のみ抽出
  const latestMonthlyDetails = getLatestDetailPages(configJson, "monthly");
  
  // 月間再生数ランキング一覧枠要素
  const monthlyPicksDom = document.querySelector("div#monthly-picks");
  
  allCardsHtml = "";
  cnt = 1;
  
  for(const data of latestMonthlyDetails) {
    // 先頭のみNEWバッジをつける
    const newBadgeTag = cnt == 1 ? "<span class='badge-new'>NEW</span>" : "";

    allCardsHtml += replaceTemplate(cardTemplate, {
      page_link : "/ranking/monthly/" + data.pageNameList[data.pageNameList.length - 1]
      , img_link : "https://img.yt-ranking-bot.jp/" + data.pageNameList[0].replace(".html", ".png")
      , page_position : "top"
      , durationTypeId : "monthly"
      , durationTypeName : "月間"
      , category : data.categoryName
      , shortTag : (data.isShort ? "<ショート>" : "")
      , dataGetDate : data.dataGetDatetime.split(" ")[0].replaceAll("-", "/")
      , bottom_rank : data.bottomRank
      , comment : data.rankingComment
      , newBadgeTag : newBadgeTag
    }) + "\r\n";
    
    if(cnt++ >= max) {
      break;
    }
  }
  
  monthlyPicksDom.innerHTML = allCardsHtml.trim();
  
  const monthlyEndDate = latestMonthlyDetails[0].dataAnalisisEndDatetime.split(" ")[0].replaceAll("-", "/");
  const monthlyStartDate = latestMonthlyDetails[0].dataAnalisisStartDatetime.split(" ")[0].replaceAll("-", "/");
  
  // 期間を更新
  document.querySelector("section.panel.monthly_picks_panel span.data_analisis_date").innerHTML = monthlyStartDate + " ～ " + monthlyEndDate;
  
  // 月更新
  const month = Number(latestMonthlyDetails[0].dataAnalisisStartDatetime.split(" ")[0].split("-")[1]);
  document.querySelector("section.panel.monthly_picks_panel .month").innerHTML = month;
}

/**
 * 検索条件でのピックアップ一覧を表示する
 */
async function generateSearchPicks() {
  // パラメータを取得する
  const params = new URLSearchParams(window.location.search);
  const duration = params.get("duration");
  const category = params.get("category");
  const videoWidth = params.get("videoWidth");
  const keyword = params.get("keyword");
  const pageNum = params.get("page") != null ? Number(params.get("page")) : 1;
  
  // ページ構成jsonを読み込み
  const configJson = await loadJson("/assets/json/ranking_page_config.json");
  
  // ページ構成抽出用
  let allDetails = [];
  
  // 検索条件：ランキング期間タイプ
  if(duration != null && duration.length > 0) {
    // ランキング期間タイプの指定がある場合
    allDetails.push(...getDetailPagesFilteredDurationType(configJson, duration));
  } else {
    // ランキング期間タイプの指定がない場合
    const allDurationTypes = ["weekly", "monthly", "yearly"];
    
    for(dt of allDurationTypes) {
      let data = getDetailPagesFilteredDurationType(configJson, dt);
      if(data != null && data.length > 0) {
        allDetails.push(...data);
      }
    }
  }
  
  // 検索条件：カテゴリ
  if(category != null && category.length > 0) {
    // カテゴリの指定がある場合
    allDetails = allDetails.filter(d => d.categoryId === category);
  }
  
  // 検索条件：動画幅
  if(videoWidth != null && videoWidth.length > 0) {
    if(videoWidth === "short") {
      // ショート動画
      allDetails = allDetails.filter(d => d.isShort === true);
    } else if(videoWidth === "full") {
      // フル動画
      allDetails = allDetails.filter(d => d.isShort === false);
    }
  }
  
  // 検索条件：キーワード
  if(keyword != null && keyword.length > 0) {
    const decKeyword = decodeURIComponent(keyword);
    
    // キーワード群でクエリ化
    const query = parseQuery(decKeyword);
    
    allDetails = allDetails.filter(d => matchesQuery(d, query));
  }
  
  // データ取得日時の降順（新しい順）に並び替えて取得
  allDetails = [...allDetails].sort((a, b) => toTimestamp(b.dataGetDatetime) - toTimestamp(a.dataGetDatetime));
  
  // 1ページ内の最大表示要素数
  const MAX_DISPLAY_ELEMENT = 7;
  
  // 最大ページ数（余りがある場合は、1追加）
  const max_page = Math.ceil(allDetails.length / MAX_DISPLAY_ELEMENT);
  
  // 指定したページのランキングデータ
  let selectPageDetails = [];
  
  // 検索条件：ページ
  selectPageDetails = getPageData(allDetails, pageNum, MAX_DISPLAY_ELEMENT);


  // ■ ランキング一覧作成
  // テンプレート読み込み
  const cardTemplate = await loadTemplateHtml("/assets/template/search-card.html");
  
  // 検索結果表示枠要素
  const searchRankingPicksDom = document.querySelector("div#search-ranking-picks");
  
  let allCardsHtml = "";
  
  for(const data of selectPageDetails) {
    allCardsHtml += replaceTemplate(cardTemplate, {
      page_link : "/ranking/" + data.durationType + "/" + data.pageNameList[data.pageNameList.length - 1]
      , page_position : "search"
      , img_link : "https://img.yt-ranking-bot.jp/" + data.pageNameList[0].replace(".html", ".png")
      , durationTypeId : data.durationType
      , durationTypeName : getDurationTypeName(data.durationType)
      , category : data.categoryName
      , shortTag : (data.isShort ? "<ショート>" : "")
      , dataGetDate : data.dataGetDatetime.split(" ")[0].replaceAll("-", "/")
      , bottom_rank : data.bottomRank
      , comment : data.rankingComment
      , newBadgeTag : ""
    }) + "\r\n";
  }

  if(selectPageDetails != null && selectPageDetails.length != 0) {
    searchRankingPicksDom.innerHTML = allCardsHtml.trim();
  } else {
    // 検索結果が0件の場合
    searchRankingPicksDom.innerHTML = "データがありません。検索条件を変更してください。";
  }
  
  // 総ページ数
  const totalPages = Math.ceil(allDetails.length / MAX_DISPLAY_ELEMENT);
  
  // ページ番号設定
  document.querySelector("div.pager-note b.display_page").innerHTML = pageNum;
  
  // 最大ページ数設定
  document.querySelector("div.pager-note b.max_page").innerHTML = totalPages;
  
  // ページ送り設定
  // 前へボタン設定
  if(pageNum == 1) {
    //先頭ページの場合
    document.querySelector("a.pager-btn.previous").classList.add("is-disabled");
    document.querySelector("a.pager-btn.previous").setAttribute("aria-disabled", "true");
  } else {
    // 先頭ページではない場合
    document.querySelector("a.pager-btn.previous").href = changeParam(GlobalVar.data.currentUrl, "page", pageNum - 1);
  }

  // 次へボタン設定
  if(pageNum == totalPages || totalPages == 0) {
    //末尾ページの場合
    document.querySelector("a.pager-btn.next").classList.add("is-disabled");
    document.querySelector("a.pager-btn.next").setAttribute("aria-disabled", "true");
  } else {
    // 末尾ページではない場合
    document.querySelector("a.pager-btn.next").href = changeParam(GlobalVar.data.currentUrl, "page", pageNum + 1);
  }
  
  // 番号ボタン
  if(totalPages <= 6) {
    
    const pageBtnsAll = document.querySelectorAll("div.pager-pages a.pager-page");
    
    // 全体が6ページ以内の場合
    for(let i = 0; i < 6; i++) {
      if(totalPages >= i+1) {
        pageBtnsAll[i].href = changeParam(GlobalVar.data.currentUrl, "page", i + 1);
        pageBtnsAll[i].innerHTML = i + 1;
      } else {
        pageBtnsAll[i].remove();
      }
    }
  } else {
    // 全体が7ページ以上の場合
    // 先頭ページボタン設定
    document.querySelector("div.pager-pages a.pager-page.first").href = changeParam(GlobalVar.data.currentUrl, "page", 1);
    document.querySelector("div.pager-pages a.pager-page.first").innerHTML = 1;
        
    // 最終ページボタン設定
    document.querySelector("div.pager-pages a.pager-page.last").href = changeParam(GlobalVar.data.currentUrl, "page", totalPages);
    document.querySelector("div.pager-pages a.pager-page.last").innerHTML = totalPages;
    
    // 中間ページボタン
    const middlePageBtns = document.querySelectorAll("div.pager-pages a.pager-page.middle");
    
    if(pageNum - 1 < 3) {
      // 現在ページが先頭ページから3ページ以内の場合
      for(let i = 0; i < middlePageBtns.length; i++) {
        middlePageBtns[i].href = changeParam(GlobalVar.data.currentUrl, "page", i + 2);
        middlePageBtns[i].innerHTML = i + 2;
      }
    } else if(totalPages - pageNum < 3) {
      // 現在ページが最終ページから3ページ以内の場合
      let num = totalPages - middlePageBtns.length;
      
      for(let i = 0; i < middlePageBtns.length; i++) {
        if(num == totalPages) continue;
        middlePageBtns[i].href = changeParam(GlobalVar.data.currentUrl, "page", num);
        middlePageBtns[i].innerHTML = num;
        num += 1;
      }
    } else {
      // それ以外の場合
      let num = pageNum - 1;

      for(let i = 0; i < middlePageBtns.length; i++) {
        middlePageBtns[i].href = changeParam(GlobalVar.data.currentUrl, "page", num);
        middlePageBtns[i].innerHTML = num;
        num += 1;
      }
    }
  }
  
  // 全番号ボタン要素（再取得）
  const pageBtnsAll = document.querySelectorAll("div.pager-pages a.pager-page");
  
  // ボタンアクティブ設定
  for(const pageBtn of pageBtnsAll) {
    if(pageBtn.innerHTML == pageNum) {
      pageBtn.classList.add("is-active");
      break;
    }
  }
  
  
  // 現在ページが先頭ページから3ページ以内の場合（もしくは全体が6ページ以内の場合）
  if(pageNum - 1 < 3 || totalPages <= 6) {
    // previous省略マーク削除
    document.querySelector("div.pager-pages > b.previous").remove();
  }
  
  // 現在ページが最終ページから3ページ以内の場合（もしくは全体が6ページ以内の場合）
  if(totalPages - pageNum <= 3 || totalPages <= 6) {
    // next省略マーク削除
    document.querySelector("div.pager-pages > b.next").remove();
  }
}

/**
 * 指定したページのJsonデータを取得する
 */
function getPageData(list, page, maxSize) {
  // 総ページ数（切り上げ）
  const totalPages = Math.ceil(list.length / maxSize);

  if(page < 1 || page > totalPages) {
    return [];
  }

  const start = (page - 1) * maxSize;
  return list.slice(start, start + maxSize);
}

/** ================================= 関数 ================================= */

/**
 * ランキングページ構成Jsonから最新のランキングデータのみ取得
 */
function getLatestDetailPages(config, currentDurationtype) {
  // Jsonから指定のランキング期間タイプのデータを抽出
  const duration = (config.rankingDurationTypes || []).find(
    (x) => x.durationType === currentDurationtype
  );
  if(!duration) return [];
  
  // ページ一覧のデータを抽出
  const pageList = duration.pageList || [];
  if(pageList.length === 0) return [];
  
  // データ取得開始タイミングが最新のデータのみ抽出
  const latestPage = pageList.reduce((best, cur) => {
    if(!best) return cur;
    return cur.dataGetStartTiming > best.dataGetStartTiming ? cur : best;
  }, null);
  
  
  // 詳細データを抽出する（ない場合はundefined）
  const detailPages = latestPage?.detailPages || [];
  
  // データ取得日時の降順（新しい順）に並び替えて取得
  return [...detailPages].sort((a, b) => toTimestamp(b.dataGetDatetime) - toTimestamp(a.dataGetDatetime));
}

/**
 * ランキングページ構成JSONの指定のランキング期間タイプのデータをすべて取得
 */
function getDetailPagesFilteredDurationType(root, durationType) {

  // 指定のランキング期間タイプを取得
  const duration = root.rankingDurationTypes.find(
    x => x.durationType === durationType
  );

  if(!duration) return [];

  // 親情報を保持して flatMap
  return duration.pageList.flatMap(p =>
    p.detailPages.map(d => ({
      durationType: durationType
      , dataGetStartTiming: p.dataGetStartTiming
      , ...d
    }))
  );
}

// HTML文字列内の{{key}} を data[key] で置換（なければ空）
function replaceTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = data[key];
    return v === undefined || v === null ? "" : String(v);
  });
}

/**
 * クエリ文字列をトークン化する
 * 対応：囲み文字（ダブルクォート）, OR演算子, 除外文字（ハイフン）
 */
function tokenizeQuery(input) {
  const s = (input ?? "").trim();
  if(!s) return [];

  // "..." または 空白で区切られた語 を取り出す
  const re = /"([^"]*)"|(\S+)/g;
  const tokens = [];
  let m;

  while((m = re.exec(s)) !== null) {
    const phrase = m[1];
    const word = m[2];

    const raw = (phrase !== undefined ? phrase : word).trim();
    if(!raw) continue;

    // OR 演算子
    if(/^or$/i.test(raw)) {
      tokens.push({ type: "OR" });
      continue;
    }

    // NOT（-xxx）
    if(raw.startsWith("-") && raw.length > 1) {
      tokens.push({ type: "TERM", value: raw.slice(1), neg: true });
      continue;
    }

    // 通常TERM（フレーズ含む）
    tokens.push({ type: "TERM", value: raw, neg: false });
  }

  return tokens;
}

/**
 * ANDがORより優先の簡易パーサ
 * - ORでグループを分け、各グループ内はAND条件として扱う
 * - 各グループは { must: [..], mustNot: [..] }
 */
function parseQuery(input) {
  const tokens = tokenizeQuery(input);

  // OR で分割した AND グループ配列を作る
  const groups = [];
  let cur = { must: [], mustNot: [] };

  const flush = () => {
    // 空グループは捨てる（ORだけとか）
    if(cur.must.length > 0 || cur.mustNot.length > 0) groups.push(cur);
    cur = { must: [], mustNot: [] };
  };

  for(const t of tokens) {
    if(t.type === "OR") {
      flush();
      continue;
    }
    if(t.type === "TERM") {
      if(t.neg) cur.mustNot.push(t.value);
      else cur.must.push(t.value);
    }
  }
  flush();

  // 何も入っていないなら null 扱い
  return groups.length ? groups : null;
}

/**
 * 1つのランキング詳細(d)がクエリにマッチするか判定
 * - どれか1グループでも満たせばOK（OR）
 * - グループ内は must 全部含む（AND）
 * - mustNot は1つでも含んだらNG
 *
 * ※ jpIncludes(text, keyword) は既存の日本語ゆらぎ対応（ひら/カタなど）を利用
 */
function matchesQuery(d, queryGroups) {
  if(!queryGroups) return true;

  const text = ((d.indexChannelNames ?? "") + " " + (d.indexVideoTitles ?? "")).trim();

  // OR: いずれかのグループが true ならOK
  return queryGroups.some(g => {
    // NOT: 1つでも含まれたらこのグループは不成立
    for(const ng of g.mustNot) {
      if(ng && jpIncludes(text, ng)) return false;
    }
    // AND: must を全部含む必要あり
    for(const must of g.must) {
      if(must && !jpIncludes(text, must)) return false;
    }
    return true;
  });
}

