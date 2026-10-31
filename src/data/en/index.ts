import type { Article } from "@/lib/blog-types";
import { enWhatIsAi } from "./what-is-ai-beginners-guide";
import { EN_ARTICLE as en_chatgpt_pro_tips } from "./chatgpt-pro-tips";
import { EN_ARTICLE as en_smartphone_buying_guide } from "./smartphone-buying-guide";
import { EN_ARTICLE as en_battery_life_tips } from "./battery-life-tips";
import { EN_ARTICLE as en_strong_password_guide } from "./strong-password-guide";
import { enPhishing } from "./phishing-awareness";
import { EN_ARTICLE as en_excel_for_everyday } from "./excel-for-everyday";
import { EN_ARTICLE as en_free_productivity_tools } from "./free-productivity-tools";
import { EN_ARTICLE as en_programming_roadmap } from "./programming-roadmap";
import { EN_ARTICLE as en_build_website_with_wordpress } from "./build-website-with-wordpress";
import { EN_ARTICLE as en_make_money_with_ai } from "./make-money-with-ai";
import { EN_ARTICLE as en_freelancing_with_ai_guide } from "./freelancing-with-ai-guide";
import { EN_ARTICLE as en_free_ai_tools } from "./free-ai-tools";
import { EN_ARTICLE as en_ai_income_iran } from "./ai-income-iran";
import { EN_ARTICLE as en_learn_ai_from_zero } from "./learn-ai-from-zero";
import { EN_ARTICLE as en_chatgpt_vs_gemini_vs_claude } from "./chatgpt-vs-gemini-vs-claude";
import { EN_ARTICLE as en_ai_income_methods_comparison } from "./ai-income-methods-comparison";
import { EN_ARTICLE as en_prompt_engineering_guide } from "./prompt-engineering-guide";
import { EN_ARTICLE as en_ai_image_generators_comparison } from "./ai-image-generators-comparison";
import { EN_ARTICLE as en_ai_video_income } from "./ai-video-income";
import { EN_ARTICLE as en_digital_products_ai_income } from "./digital-products-ai-income";
import { EN_ARTICLE as en_adsense_vs_yektanet } from "./adsense-vs-yektanet";
import { EN_ARTICLE as en_ai_in_sales_guide } from "./ai-in-sales-guide";
import { EN_ARTICLE as en_ai_chatbot_business } from "./ai-chatbot-business";
import { EN_ARTICLE as en_ai_ecommerce_guide } from "./ai-ecommerce-guide";
import { EN_ARTICLE as en_ai_marketing_business } from "./ai-marketing-business";
import { EN_ARTICLE as en_ai_agents_guide } from "./ai-agents-guide";
import { EN_ARTICLE as en_vibe_coding_guide } from "./vibe-coding-guide";
import { EN_ARTICLE as en_ai_music_income } from "./ai-music-income";
import { EN_ARTICLE as en_deepfake_guide } from "./deepfake-guide";
import { EN_ARTICLE as en_learn_python_from_zero } from "./learn-python-from-zero";
import { EN_ARTICLE as en_python_automation_income } from "./python-automation-income";
import { EN_ARTICLE as en_python_for_ai_guide } from "./python-for-ai-guide";
import { EN_ARTICLE as en_best_iranian_crypto_exchanges } from "./best-iranian-crypto-exchanges";
import { EN_ARTICLE as en_affiliate_marketing_guide } from "./affiliate-marketing-guide";
import { EN_ARTICLE as en_ai_service_business } from "./ai-service-business";
import { EN_ARTICLE as en_network_equipment_installation_12 } from "./network-equipment-installation-12";
import { EN_ARTICLE as en_network_setup_dhcp_dns_12 } from "./network-setup-dhcp-dns-12";
import { EN_ARTICLE as en_wireless_network_modem_config_12 } from "./wireless-network-modem-config-12";
import { EN_ARTICLE as en_centralized_network_management_ad_gpo_12 } from "./centralized-network-management-ad-gpo-12";
import { EN_ARTICLE as en_network_troubleshooting_packet_tracer_12 } from "./network-troubleshooting-packet-tracer-12";
import { EN_ARTICLE as en_e_commerce_business_idea_12 } from "./e-commerce-business-idea-12";
import { EN_ARTICLE as en_online_store_development_12 } from "./online-store-development-12";
import { EN_ARTICLE as en_mikrotik_router_setup_12 } from "./mikrotik-router-setup-12";
import { EN_ARTICLE as en_network_security_firewall_12 } from "./network-security-firewall-12";
import { EN_ARTICLE as en_ip_camera_nvr_setup_12 } from "./ip-camera-nvr-setup-12";
import { EN_ARTICLE_SLUGS } from "@/data/en-slugs";

/**
 * مقاله‌های ترجمه‌شدهٔ انگلیسی — ۴۶ مقاله (برابر کامل نسخهٔ فارسی).
 * این فایل به‌صورت خودکار با scripts/build-en-index.py تولید شده؛
 * برای ترجمهٔ جدید فقط فایل را در همین پوشه بساز و اسکریپت را اجرا کن.
 */
export const englishArticles: Article[] = [
  enWhatIsAi,
  en_chatgpt_pro_tips,
  en_smartphone_buying_guide,
  en_battery_life_tips,
  en_strong_password_guide,
  enPhishing,
  en_excel_for_everyday,
  en_free_productivity_tools,
  en_programming_roadmap,
  en_build_website_with_wordpress,
  en_make_money_with_ai,
  en_freelancing_with_ai_guide,
  en_free_ai_tools,
  en_ai_income_iran,
  en_learn_ai_from_zero,
  en_chatgpt_vs_gemini_vs_claude,
  en_ai_income_methods_comparison,
  en_prompt_engineering_guide,
  en_ai_image_generators_comparison,
  en_ai_video_income,
  en_digital_products_ai_income,
  en_adsense_vs_yektanet,
  en_ai_in_sales_guide,
  en_ai_chatbot_business,
  en_ai_ecommerce_guide,
  en_ai_marketing_business,
  en_ai_agents_guide,
  en_vibe_coding_guide,
  en_ai_music_income,
  en_deepfake_guide,
  en_learn_python_from_zero,
  en_python_automation_income,
  en_python_for_ai_guide,
  en_best_iranian_crypto_exchanges,
  en_affiliate_marketing_guide,
  en_ai_service_business,
  en_network_equipment_installation_12,
  en_network_setup_dhcp_dns_12,
  en_wireless_network_modem_config_12,
  en_centralized_network_management_ad_gpo_12,
  en_network_troubleshooting_packet_tracer_12,
  en_e_commerce_business_idea_12,
  en_online_store_development_12,
  en_mikrotik_router_setup_12,
  en_network_security_firewall_12,
  en_ip_camera_nvr_setup_12,
];

export const getEnArticle = (slug: string): Article | undefined =>
  englishArticles.find((a) => a.slug === slug);

/** آیا برای این اسلاگ نسخهٔ انگلیسی وجود دارد؟ */
export const hasEnglishVersion = (slug: string): boolean =>
  EN_ARTICLE_SLUGS.includes(slug);

/** نام انگلیسی دسته‌بندی‌ها */
export const EN_CATEGORY_NAMES: Record<string, string> = {
  ai: "Artificial Intelligence",
  mobile: "Mobile",
  security: "Security & Privacy",
  software: "Software",
  "web-tools": "Web & Tools",
  programming: "Programming",
  student: "Student",
};
