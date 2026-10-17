// Local test of bot search logic (no deployment needed)
import { searchReplyMessage, topReplyMessage, searchArticles } from "../src/lib/bot-search";

const queries = ["پایتون", "درآمد با هوش مصنوعی", "صرافی", "امنیت رمز", "دایپ فیک", "ناموجود xyz"];
for (const q of queries) {
  const hits = searchArticles(q, 5);
  console.log(`\n=== "${q}" -> ${hits.length} hits ===`);
  hits.slice(0, 3).forEach((a) => console.log(`  - ${a.title}`));
}
console.log("\n--- sample reply (پایتون) ---");
console.log(searchReplyMessage("پایتون"));
console.log("\n--- sample reply (recent) ---");
console.log(topReplyMessage().slice(0, 300));
