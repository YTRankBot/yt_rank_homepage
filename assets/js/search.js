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
  
  // 週間再生数ランキング一覧枠要素
  const monthlyPicksDom = document.querySelector("div#monthly-picks");
  
  allCardsHtml = "";
  cnt = 1;
  
  for(const data of latestMonthlyDetails) {
    allCardsHtml += replaceTemplate(cardTemplate, {
      page_link : "/ranking/monthly/" + data.pageNameList[0]
      , img_link : "https://img.yt-ranking-bot.jp/" + data.pageNameList[0].replace(".html", ".png")
      , durationType : "月間"
      , category : data.categoryName
      , shortTag : (data.isShort ? "<ショート>" : "")
      , dataGetDate : data.dataGetDatetime.split(" ")[0].replaceAll("-", "/")
      , bottom_rank : data.bottomRank
      , comment : data.rankingComment
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