// تست محلی منطق بات قبل از دیپلوی (بدون ارسال به تلگرام)
import {
  mainKeyboard,
  articleKeyboard,
  topReplyMessage,
  newReplyMessage,
  welcomeText,
  refWelcomeText,
  shareBotUrl,
  searchArticles,
} from "../src/lib/bot-search";
import { articles } from "../src/data";

const kb = mainKeyboard();
console.log("BUTTONS:", JSON.stringify(kb.inline_keyboard.flat().map((b) => b.text), null, 0));

const top = topReplyMessage();
console.log("\nTOP LEN:", top.length, "| HTML OK:", !/[<>](?![\/]?[ab])/.test(top.replace(/<a href="[^"]*">|<\/a>|<b>|<\/b>|<code>|<\/code>/g, "")));
console.log("TOP HEAD:\n", top.slice(0, 260));

const a = articles.find((x) => x.slug === "learn-python-from-zero")!;
console.log("\nREF LEN:", refWelcomeText(a).length);
console.log("ARTICLE KB:", JSON.stringify(articleKeyboard(a).inline_keyboard.flat().map((b) => b.text)));
console.log("\nSHARE BOT URL:", shareBotUrl().slice(0, 90) + "...");
console.log("WELCOME(non-member) LEN:", welcomeText(false).length);
console.log("SEARCH «پایتون»:", searchArticles("پایتون").map((x) => x.slug));
console.log("SEARCH «درآمد اینترنت»:", searchArticles("درآمد اینترنت").map((x) => x.slug));
