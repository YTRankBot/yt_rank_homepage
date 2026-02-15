async function generateLatestPics() {
  // ページ構成jsonを読み込み
  const configJson = await loadJson("/assets/json/ranking_page_config.json");
  
  // Jsonから最新データ一覧のみ抽出
  const latestWeeklyDetails = getLatestDetailPages(configJson, "weekly");
  
  // 週間再生数ランキング一覧枠要素
  const weeklyPicsDom = document.querySelector("div#weekly-picks");
  
  // テンプレート読み込み
  const cardTemplate = await loadTemplateHtml("/assets/template/search-card.html");
  let allCardsHtml = "";
  
  for(const data of latestWeeklyDetails) {
    allCardsHtml += replaceTemplate(cardTemplate, {
      page_link : "/ranking/weekly/" + data.pageNameList[0]
      , img_link : "https://img.yt-ranking-bot.jp/" + data.pageNameList[0].replace(".html", ".png")
      , durationType : "週間"
      , category : data.categoryName
      , shortTag : (data.isShort ? "<ショート>" : "")
      , dataGetDate : data.dataGetDatetime.split(" ")[0].replaceAll("-", "/")
      , bottom_rank : data.bottomRank
      , comment : data.rankingComment
    }) + "\r\n";
  }
  
  weeklyPicsDom.innerHTML = allCardsHtml.trim();
  
  const endDate = latestWeeklyDetails[0].dataGetDatetime.split(" ")[0].replaceAll("-", "/");
  const startDate = latestWeeklyDetails[latestWeeklyDetails.length - 1].dataGetDatetime.split(" ")[0].replaceAll("-", "/");
  
  // 期間を更新
  document.querySelector("section.panel.weekly_pics span.data_analisis_date").innerHTML = startDate + " ～ " + endDate;
}

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

// {{key}} を data[key] で置換（なければ空）
function replaceTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = data[key];
    return v === undefined || v === null ? "" : String(v);
  });
}