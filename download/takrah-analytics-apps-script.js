/**
 * ─────────────────────────────────────────────────────────────────
 *  تک‌راه — گزارش آنالیتیکس + سرچ‌کنسول (نسخهٔ ۳ — رفع خطای ۴۰۰)
 * ─────────────────────────────────────────────────────────────────
 *  تغییر نسخهٔ ۳ نسبت به قبل:
 *   • بعد «dateRange» از فهرست dimensions حذف شد — GA4 خودش برچسب دوره را
 *     به هر سطر می‌چسباند و اگر در dimensions لیستش کنی خطای ۴۰۰
 *     (Field dateRange is not a dimension) می‌دهد. پیام خطای اجرای قبلی
 *     دقیقاً همین را گفت؛ فقط کافی بود از درخواست برداشته شود.
 *   • (نسخهٔ ۲) تفکیک دقیق: «فارسی» = همهٔ صفحه‌ها به‌جز /en؛ سرویس
 *     پیشرفتهٔ Search Console از منیفست حذف شد (در کاتالوگ اکانت تو نیست
 *     و باعث خطای service not found می‌شد)
 *   • نکتهٔ سرچ‌کنسول: API اش روی پروژهٔ پیش‌فرض اسکریپت فعال نیست (خطای
 *     ۴۰۳ می‌دهد). برای این بخش از روش OAuth Playground طبق پیام چت
 *     استفاده می‌کنیم؛ این خطا مانع گزارش GA4 نیست.
 *
 *  نحوهٔ استفاده (۵ دقیقه):
 *   ۱) برو به script.google.com (با همان اکانتی که analytics.google.com را
 *      باز می‌کنی) → همان پروژهٔ قبلی
 *   ۲) کل این فایل را در Code.gs پیست کن و Save بزن (💾)
 *   ۳) چرخ‌دندهٔ Project Settings → تیک «Show "appsscript.json" manifest
 *      file in editor» → برگرد به ادیتور → فایل appsscript.json را باز کن
 *      و «کل» محتوایش را با منیفست پایین همین فایل جایگزین کن → Save
 *      ⚠️ اگر باز هم خطای service not found داد: داخل appsscript.json کل
 *      بلوک "dependencies" (از خط dependencies تا } آخرش) را پاک کن و Save
 *      بزن — اسکریپت بدونش هم کار می‌کند.
 *   ۴) بالای ادیتور تابع takrahReport را انتخاب کن → Run
 *      • بار اول: Review permissions → اکانتت → Advanced → «Go to … (unsafe)»
 *        → Allow
 *   ۵) Execution log پایین صفحه:
 *      • بخش اول: گزارش فارسی خوانا
 *      • JSON بین دو خط ===COPY_JSON=== را کپی کن و در چت بفرست
 *
 *  محتوای منیفست (appsscript.json) — این را عیناً پیست کن:
 *  {
 *    "timeZone": "Asia/Tehran",
 *    "exceptionLogging": "STACKDRIVER",
 *    "runtimeVersion": "V8",
 *    "oauthScopes": [
 *      "https://www.googleapis.com/auth/analytics.readonly",
 *      "https://www.googleapis.com/auth/webmasters.readonly",
 *      "https://www.googleapis.com/auth/script.external_request"
 *    ],
 *    "dependencies": {
 *      "enabledAdvancedServices": [
 *        { "userSymbol": "AnalyticsData", "serviceId": "analyticsdata", "version": "v1beta" }
 *      ]
 *    }
 *  }
 */

var PROPERTY_ID = "556099118";
var SITE = "https://takrah.top/";

function takrahReport() {
  var out = { generated: new Date().toISOString(), property_id: PROPERTY_ID, site: SITE };
  try { out.ga4 = ga4Block_(); } catch (e) { out.ga4_error = String(e && e.message ? e.message : e); }
  try { out.gsc = gscBlock_(); } catch (e) { out.gsc_error = String(e && e.message ? e.message : e); }

  Logger.log(readable_(out));
  Logger.log("===COPY_JSON===");
  Logger.log(JSON.stringify(out));
  Logger.log("===COPY_JSON===");
  return out;
}

/* ── ابزار مشترک ─────────────────────────────────────────────── */

function daysAgo_(n) {
  return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
}
function ranges_() {
  return [
    { startDate: daysAgo_(28), endDate: daysAgo_(1), name: "current" },
    { startDate: daysAgo_(56), endDate: daysAgo_(29), name: "previous" }
  ];
}
function post_(url, body, token) {
  var res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body),
    headers: { Authorization: "Bearer " + token },
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  var text = res.getContentText();
  if (code !== 200) throw new Error(code + ": " + text.slice(0, 300));
  return JSON.parse(text);
}
function ga4Rows_(res) {
  var dims = (res.dimensionHeaders || []).map(function (h) { return h.name; });
  var mets = (res.metricHeaders || []).map(function (h) { return h.name; });
  return (res.rows || []).map(function (r) {
    var o = {};
    (r.dimensionValues || []).forEach(function (v, i) { o[dims[i]] = v.value; });
    (r.metricValues || []).forEach(function (v, i) { o[mets[i]] = parseFloat(v.value); });
    return o;
  });
}
function pickRange_(rows, name) {
  // GA4 برچسب dateRange هر سطر را خودش می‌گذارد (بدون درخواست ما) —
  // همیشه برچسب را بخوان، نه ایندکس؛ ترتیب سطرها تضمین‌شده نیست
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].dateRange === name) return rows[i];
  }
  // اگر به هر دلیلی برچسب نبود: سطر اول = دورهٔ اخیر (ترتیب درخواست)
  return rows[0] || {};
}

/* ── بخش GA4 ─────────────────────────────────────────────────── */

function ga4Block_() {
  var token = ScriptApp.getOAuthToken();
  var url = "https://analyticsdata.googleapis.com/v1beta/properties/" + PROPERTY_ID + ":runReport";
  var R = ranges_();
  function call(body) { return post_(url, body, token); }

  // ۱) نمای کلی — ۲۸ روز اخیر vs ۲۸ روز قبل
  //    ⚠️ بعد dateRange را در dimensions ننویس! GA4 خودش برچسبش را به سطرها
  //    اضافه می‌کند؛ لیست‌کردنش خطای ۴۰۰ می‌دهد (اجرای ۱۴۰۵/۸/۱۴)
  var ov = ga4Rows_(call({
    dateRanges: R,
    metrics: [
      { name: "activeUsers" }, { name: "newUsers" }, { name: "sessions" },
      { name: "screenPageViews" }, { name: "engagementRate" },
      { name: "averageSessionDuration" }, { name: "keyEvents" }
    ]
  }));

  // ۲) تفکیک فارسی/انگلیسی بر اساس پیشوند مسیر
  //    en = صفحه‌هایی که با /en شروع می‌شوند، fa = بقیه (غیر-/en)
  var enExpr = { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/en" } } };
  var fa = ga4Rows_(call({
    dateRanges: R,
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    dimensionFilter: { notExpression: enExpr }
  }));
  var en = ga4Rows_(call({
    dateRanges: R,
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    dimensionFilter: enExpr
  }));

  // ۳) پربازدیدترین صفحه‌ها
  var pages = ga4Rows_(call({
    dateRanges: [R[0]],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 15
  }));

  // ۴) رویدادها (affiliate_click و…)
  var events = ga4Rows_(call({
    dateRanges: [R[0]],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 20
  }));

  var metrics = ["activeUsers", "newUsers", "sessions", "screenPageViews", "engagementRate", "averageSessionDuration", "keyEvents"];
  var ovC = pickRange_(ov, "current"), ovP = pickRange_(ov, "previous");
  var overview = { current: {}, previous: {} };
  metrics.forEach(function (m) {
    overview.current[m] = ovC[m] || 0;
    overview.previous[m] = ovP[m] || 0;
  });

  return {
    overview: overview,
    views: {
      fa: { current: pickRange_(fa, "current"), previous: pickRange_(fa, "previous") },
      en: { current: pickRange_(en, "current"), previous: pickRange_(en, "previous") }
    },
    top_pages: pages.map(function (p) { return { path: p.pagePath, views: p.screenPageViews, users: p.activeUsers }; }),
    events: events.map(function (e) { return { name: e.eventName, count: e.eventCount }; })
  };
}

/* ── بخش Search Console ──────────────────────────────────────── */

function gscBlock_() {
  var token = ScriptApp.getOAuthToken();
  var url = "https://searchconsole.googleapis.com/webmasters/v3/sites/" +
    encodeURIComponent(SITE) + "/searchAnalytics/query";
  var R = ranges_();

  function fetchRows(dims, range, limit) {
    var body = { startDate: range.startDate, endDate: range.endDate, dimensions: dims, rowLimit: limit || 250 };
    return post_(url, body, token).rows || [];
  }
  function agg(rows, wantEn) {
    var clicks = 0, imps = 0, posW = 0;
    rows.forEach(function (r) {
      var k = r.keys[0] || "";
      var isEn = k.indexOf(SITE + "en") === 0;
      if (wantEn === true && !isEn) return;
      if (wantEn === false && isEn) return;
      clicks += r.clicks || 0;
      imps += r.impressions || 0;
      posW += (r.position || 0) * (r.clicks || 0);
    });
    return { clicks: Math.round(clicks), impressions: Math.round(imps), position: clicks ? Math.round(posW / clicks * 10) / 10 : null };
  }

  var pagesCur = fetchRows(["page"], R[0]);
  var pagesPrev = fetchRows(["page"], R[1]);
  var queries = fetchRows(["query"], R[0], 20);

  queries.sort(function (a, b) { return (b.clicks || 0) - (a.clicks || 0); });

  return {
    current: { all: agg(pagesCur, null), fa: agg(pagesCur, false), en: agg(pagesCur, true) },
    previous: { all: agg(pagesPrev, null), fa: agg(pagesPrev, false), en: agg(pagesPrev, true) },
    top_queries: queries.slice(0, 12).map(function (q) {
      return { query: q.keys[0], clicks: Math.round(q.clicks || 0), impressions: Math.round(q.impressions || 0), position: Math.round((q.position || 0) * 10) / 10 };
    })
  };
}

/* ── گزارش فارسی خوانا (برای خودت، نه من) ───────────────────── */

function readable_(o) {
  var L = [];
  L.push("📊 گزارش تک‌راه — " + new Date().toLocaleDateString("fa-IR"));
  if (o.ga4) {
    var c = o.ga4.overview.current, p = o.ga4.overview.previous;
    L.push("── GA4 (۲۸ روز اخیر vs قبلی) ──");
    L.push("کاربر فعال: " + c.activeUsers + " (قبلی " + p.activeUsers + ")");
    L.push("بازدید صفحه: " + c.screenPageViews + " (قبلی " + p.screenPageViews + ")");
    L.push("جلسه: " + c.sessions + " (قبلی " + p.sessions + ")");
    var vf = o.ga4.views.fa, ve = o.ga4.views.en;
    L.push("بازدید فارسی (غیر /en): " + (vf.current.screenPageViews || 0) + " (قبلی " + (vf.previous.screenPageViews || 0) + ")");
    L.push("بازدید انگلیسی (/en): " + (ve.current.screenPageViews || 0) + " (قبلی " + (ve.previous.screenPageViews || 0) + ")");
    L.push("پربازدیدترین‌ها:");
    o.ga4.top_pages.slice(0, 8).forEach(function (x) { L.push("  " + x.views + " — " + x.path); });
    L.push("رویدادها:");
    o.ga4.events.slice(0, 10).forEach(function (x) { L.push("  " + x.count + "× " + x.name); });
  } else {
    L.push("⚠️ GA4 خطا داد: " + o.ga4_error);
    L.push("   راه حل: منوی Services (+) → جستجو کن Google Analytics Data API → Add → Run دوباره");
  }
  if (o.gsc) {
    L.push("── Search Console (۲۸ روز اخیر) ──");
    var g = o.gsc.current, gp = o.gsc.previous;
    L.push("کل: " + g.all.clicks + " کلیک (قبلی " + gp.all.clicks + ") | " + g.all.impressions + " نمایش (قبلی " + gp.all.impressions + ")");
    L.push("فارسی: " + g.fa.clicks + " کلیک (قبلی " + gp.fa.clicks + ") | " + g.fa.impressions + " نمایش (قبلی " + gp.fa.impressions + ")");
    L.push("انگلیسی: " + g.en.clicks + " کلیک (قبلی " + gp.en.clicks + ") | " + g.en.impressions + " نمایش (قبلی " + gp.en.impressions + ")");
    L.push("کوئری‌های برتر:");
    o.gsc.top_queries.slice(0, 8).forEach(function (q) { L.push("  " + q.clicks + " کلیک، رتبه " + q.position + " — «" + q.query + "»"); });
  } else {
    L.push("⚠️ Search Console خطا داد: " + o.gsc_error);
    L.push("   مهم نیست — طبق پیام چت، توکن OAuth Playground را برای من بفرست تا این بخش را خودم بگیرم.");
  }
  L.push("⬇️ حالا JSON بین دو خط ===COPY_JSON=== را کپی کن و در چت بفرست.");
  return L.join("\n");
}
