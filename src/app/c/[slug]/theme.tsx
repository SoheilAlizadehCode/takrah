// ─── استایل مشترک صفحات کلینیک‌ها (/c/...) — برگرفته از دموی plan2 ───
// همان رنگ‌ها و لحنی که پزشک در دمو دیده است، این‌بار با داده‌ی واقعی خودش.
export function ClinicStyles(): React.ReactElement {
  const css = `
.c-wrap{--p1:#1a4a7a;--p2:#2d6fb5;--sky:#38bdf8;--gold:#ffd966;--ink:#16324a;--mut:#5b7a99;--bg2:#f4f8fc;--ok:#35a06f;--bord:#d9e6f2;--danger:#d9534f;--warn:#e0a52c;font-family:Vazirmatn,Tahoma,sans-serif;color:var(--ink);background:#fff;line-height:1.8}
.c-wrap *{margin:0;padding:0;box-sizing:border-box}
.c-wrap a{text-decoration:none;color:inherit}
.c-wrap button{font-family:inherit;cursor:pointer;border:none;background:none}
.c-wrap input,.c-wrap textarea{font-family:inherit}
.c-wrap .container{max-width:1080px;margin:0 auto;padding:0 20px}
/* nav */
.c-nav-wrap{position:fixed;inset-inline:0;top:0;z-index:50;padding:12px 16px}
.c-nav{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;height:64px;padding:0 18px;border-radius:18px;background:rgba(255,255,255,.78);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 10px 40px rgba(26,74,122,.12)}
.c-brand{display:flex;align-items:center;gap:10px}
.c-brand .logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(225deg,var(--p1),var(--p2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:19px;box-shadow:0 6px 16px rgba(45,111,181,.35)}
.c-brand b{font-size:14.5px;color:var(--p1);display:block;line-height:1.3}
.c-brand small{font-size:10px;color:var(--mut)}
.c-cta{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 20px;border-radius:14px;background:linear-gradient(270deg,var(--p1),var(--p2));color:#fff;font-weight:800;font-size:13.5px;box-shadow:0 8px 24px rgba(45,111,181,.35);transition:transform .25s}
.c-cta:hover{transform:scale(1.04)}
.c-cta.ok{background:var(--ok);box-shadow:0 8px 24px rgba(53,160,111,.35)}
.c-cta.ghost{background:#fff;color:var(--p1);border:1.5px solid var(--bord);box-shadow:0 6px 18px rgba(26,74,122,.08)}
.c-cta:disabled{opacity:.45;cursor:not-allowed;transform:none}
/* hero */
.c-hero{position:relative;overflow:hidden;background:linear-gradient(225deg,#123a63,#16497d,#2d6fb5);padding:140px 0 64px;color:#fff}
.c-aurora{position:absolute;border-radius:999px;filter:blur(70px);animation:c-drift 16s ease-in-out infinite;pointer-events:none}
.c-a1{width:300px;height:300px;background:rgba(56,189,248,.28);top:10%;left:6%}
.c-a2{width:340px;height:340px;background:rgba(45,111,181,.4);top:35%;right:4%;animation-direction:reverse}
.c-a3{width:280px;height:280px;background:rgba(255,217,102,.14);bottom:-8%;left:32%;animation-duration:22s}
@keyframes c-drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(38px,-26px) scale(1.12)}66%{transform:translate(-26px,22px) scale(.94)}}
.c-gridp{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:34px 34px}
.c-hero-grid{position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:44px;align-items:center}
@media(max-width:800px){.c-hero-grid{grid-template-columns:1fr}}
.c-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border-radius:999px;padding:8px 16px;font-size:12px;font-weight:700;margin-bottom:22px}
.c-hero h1{font-size:33px;line-height:1.5;font-weight:900}
.c-hero h1 .gold{background:linear-gradient(120deg,#ffd966,#f0b429);-webkit-background-clip:text;background-clip:text;color:transparent}
.c-hero p.lead{margin-top:14px;max-width:460px;font-size:15px;color:rgba(255,255,255,.82)}
.c-info-chips{display:flex;flex-direction:column;gap:9px;margin-top:22px}
.c-chip{display:flex;gap:9px;align-items:flex-start;font-size:13px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:13px;padding:10px 14px;white-space:pre-line}
.c-qr-card{background:rgba(255,255,255,.9);backdrop-filter:blur(12px);border-radius:22px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.28);color:var(--ink);text-align:center}
.c-qr-card img{width:170px;height:170px}
.c-qr-card b{font-size:13.5px;display:block;margin-top:8px}
.c-qr-card small{font-size:11px;color:var(--mut);word-break:break-all}
.c-badge{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(120deg,#f0b429,#ffd966);color:#5c4500;font-size:11px;font-weight:800;padding:6px 12px;border-radius:999px}
/* sections */
.c-sec{padding:64px 0}
.c-sec.alt{background:var(--bg2)}
.c-kicker{display:inline-flex;align-items:center;gap:8px;background:rgba(45,111,181,.1);color:var(--p2);font-size:12px;font-weight:800;border-radius:999px;padding:7px 15px;margin-bottom:14px}
.c-sec h2{font-size:25px;font-weight:900;text-align:center;line-height:1.6}
.c-sec .sub{max-width:520px;margin:10px auto 0;text-align:center;font-size:13px;color:var(--mut)}
.c-doc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:34px}
@media(max-width:860px){.c-doc-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.c-doc-grid{grid-template-columns:1fr}}
.c-doc{background:#fff;border:1px solid var(--bord);border-radius:18px;padding:18px;transition:all .3s}
.c-doc:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(26,74,122,.12)}
.c-doc .av{width:46px;height:46px;border-radius:14px;background:linear-gradient(225deg,var(--p1),var(--p2));color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:12px}
.c-doc b{font-size:14px;display:block}
.c-doc .spec{font-size:12px;color:var(--p2);font-weight:700;margin-top:2px}
.c-doc .days{font-size:11.5px;color:var(--mut);margin-top:6px}
/* booking widget */
.c-book{background:#fff;border:1px solid var(--bord);border-radius:22px;padding:22px;margin-top:32px;box-shadow:0 16px 44px rgba(26,74,122,.08)}
.c-steps{display:flex;gap:6px;justify-content:center;margin-bottom:18px;flex-wrap:wrap}
.c-steps span{font-size:11px;font-weight:800;color:var(--mut);background:var(--bg2);border-radius:999px;padding:6px 13px}
.c-steps span.on{background:linear-gradient(120deg,var(--p1),var(--p2));color:#fff}
.c-label{font-size:12.5px;font-weight:800;color:var(--ink);margin:16px 0 8px;display:block}
.c-doc-chips{display:flex;gap:8px;flex-wrap:wrap}
.c-doc-chips button{border:1.5px solid var(--bord);border-radius:13px;padding:9px 14px;font-size:12.5px;font-weight:700;background:#fff;transition:all .2s}
.c-doc-chips button.on{border-color:var(--p2);background:rgba(45,111,181,.08);color:var(--p1)}
.c-date-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}
.c-date-scroll::-webkit-scrollbar{height:5px}
.c-date-scroll::-webkit-scrollbar-thumb{background:var(--bord);border-radius:9px}
.c-date{flex-shrink:0;border:1.5px solid var(--bord);border-radius:14px;padding:9px 14px;text-align:center;min-width:86px;transition:all .2s;background:#fff}
.c-date b{font-size:12px;display:block}
.c-date small{font-size:10.5px;color:var(--mut)}
.c-date.on{border-color:var(--p2);background:linear-gradient(225deg,var(--p1),var(--p2));color:#fff}
.c-date.on small{color:rgba(255,255,255,.75)}
.c-slot-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:8px}
.c-slot{border:1.5px solid var(--bord);border-radius:11px;padding:9px 4px;font-size:13px;font-weight:800;text-align:center;background:#fff;transition:all .2s}
.c-slot:hover:not(:disabled){border-color:var(--p2)}
.c-slot.on{background:linear-gradient(225deg,var(--p1),var(--p2));color:#fff;border-color:var(--p2)}
.c-slot:disabled{background:var(--bg2);color:#b6c8d9;text-decoration:line-through;cursor:not-allowed}
.c-in{width:100%;border:1.5px solid var(--bord);border-radius:13px;padding:11px 14px;font-size:13.5px;background:#fff;color:var(--ink);outline:none;transition:border .2s}
.c-in:focus{border-color:var(--p2)}
.c-in::placeholder{color:#9fb3c8}
textarea.c-in{resize:vertical;min-height:74px}
.c-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:560px){.c-row{grid-template-columns:1fr}}
.c-err{background:rgba(217,83,79,.09);color:var(--danger);border:1px solid rgba(217,83,79,.3);border-radius:12px;padding:10px 14px;font-size:12.5px;margin-top:14px}
.c-okbox{background:rgba(53,160,111,.08);border:1px solid rgba(53,160,111,.35);border-radius:16px;padding:18px;text-align:center}
.c-okbox .big{font-size:15px;font-weight:900;color:#2e7d55}
.c-okbox p{font-size:12.5px;color:var(--mut);margin-top:6px}
/* intake strip */
.c-intake-strip{display:flex;gap:14px;align-items:center;background:linear-gradient(225deg,#123a63,#16497d);color:#fff;border-radius:20px;padding:20px 22px;margin-top:30px;flex-wrap:wrap}
.c-intake-strip .ic{width:44px;height:44px;border-radius:14px;background:rgba(255,217,102,.18);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.c-intake-strip b{font-size:14px}
.c-intake-strip p{font-size:12px;color:rgba(255,255,255,.78);margin-top:3px}
.c-intake-strip button{margin-inline-start:auto}
@media(max-width:600px){.c-intake-strip button{margin-inline-start:0;width:100%;justify-content:center}}
/* intake form */
.c-form-card{background:#fff;border:1px solid var(--bord);border-radius:22px;padding:24px;max-width:640px;margin:32px auto 0;box-shadow:0 16px 44px rgba(26,74,122,.08)}
.c-range{width:100%;accent-color:var(--p2)}
.c-pain-val{display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:38px;border-radius:12px;background:linear-gradient(225deg,var(--p1),var(--p2));color:#fff;font-weight:900;font-size:15px}
.c-note{font-size:11.5px;color:var(--mut);background:var(--bg2);border-radius:12px;padding:10px 14px;margin-top:14px;line-height:1.9}
.c-urg{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:7px 15px;font-size:12px;font-weight:800}
.c-urg.low{background:rgba(53,160,111,.12);color:#2e7d55}
.c-urg.mid{background:rgba(224,165,44,.14);color:#9a6d00}
.c-urg.high{background:rgba(217,83,79,.12);color:#b23b37}
.c-summary{background:var(--bg2);border:1px solid var(--bord);border-radius:14px;padding:16px;font-size:13.5px;white-space:pre-line;line-height:2;margin-top:14px}
.c-audio{width:100%;margin-top:14px}
/* footer + expired */
.c-footer{background:#0f2c4b;color:#fff;padding:34px 0;text-align:center;font-size:12.5px}
.c-footer b{color:var(--gold)}
.c-footer a{color:var(--sky)}
.c-expired{min-height:70vh;display:flex;align-items:center;justify-content:center;background:var(--bg2);padding:120px 20px 60px}
.c-expired .card{background:#fff;border:1px solid var(--bord);border-radius:22px;box-shadow:0 16px 44px rgba(26,74,122,.1);padding:36px;text-align:center;max-width:460px}
.c-expired h2{font-size:19px;font-weight:900;margin:14px 0 8px}
.c-expired p{font-size:13px;color:var(--mut)}
.c-loading{text-align:center;color:var(--mut);font-size:13px;padding:40px 0}
`;
  return <style>{css}</style>;
}
