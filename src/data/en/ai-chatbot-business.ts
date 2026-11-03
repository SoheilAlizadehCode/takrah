import type { Article } from "@/lib/blog-types";

// English version of "ساخت چت‌بات فروش و پشتیبانی با هوش مصنوعی؛ بدون حتی یک خط کد" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "ai-chatbot-business",
  title: "Build a Sales and Support Chatbot with AI — No Code Needed",
  excerpt:
    "Smart chatbots now understand customers, close sales, and work around the clock. Learn to build one for your website, WhatsApp, or Instagram without code — and turn the skill into a business.",
  category: "ai",
  tags: ["chatbot", "customer support", "WhatsApp", "online sales", "business", "artificial intelligence"],
  date: "October 5, 2026",
  readMinutes: 12,
  cover: "/images/covers/ai-chatbot-business.png",
  blocks: [
    {
      type: "p",
      text: "The customer wants an answer at 2:30 a.m., not tomorrow morning. In today's world, response speed means sales; research shows that a large share of customers will go to a competitor if they do not get a fast answer. But hiring an around-the-clock support agent is not economical for most businesses. The solution? A smart chatbot. And not the old chatbots that chased customers away with “press 1 for sales, 2 for complaints” — today's chatbots, built on language models, genuinely understand the customer's question, answer from your business documents, and can even complete a sale. The best part of the story: building one no longer requires a programmer, and in this article you will learn how to build one — for your own business, or as a service you sell to others.",
    },
    { type: "h2", text: "What makes an AI chatbot different from the old kind?" },
    {
      type: "p",
      text: "Old chatbots were like a receptionist who had memorized only exact sentences: change a single word in the question and the answer falls apart. An AI-powered chatbot, however, is like a real employee who has read your business documentation: it understands the question however it is phrased, honestly admits it and hands over to a human agent when the answer is not in the documents, speaks several languages, and preserves your brand's tone of voice. This leap from “button box” to “digital employee” is exactly what turned the chatbot from an amusement into a sales machine.",
    },
    { type: "h2", text: "Step by step: building your first chatbot in a day" },
    {
      type: "p",
      text: "Do these seven steps in order; for a typical business, the whole journey is one to two days of serious work:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Define the goal: support? sales? appointment booking? A chatbot that tries to do everything ends up doing nothing; for your first bot, pick one main goal with three to five concrete tasks.",
        "Collect the knowledge: the most frequent customer questions, the price list, warranty and return policies, address and working hours — this is exactly what the bot must know. The cleaner this documentation, the smarter the bot.",
        "Build the platform: for a no-code start, tools like Chatbase, Botpress, and Voiceflow ingest your questions and documents and hand you a finished bot; Iranian platforms also exist for WhatsApp and homegrown messengers such as Eitaa and Bale.",
        "Give it a personality and a tone: in the settings, tell the bot how to speak — formal, friendly, playful — and what to say when it does not know an answer; this “system prompt” is the single biggest factor in bot quality, and its techniques are covered in the article on professional prompt writing.",
        "Test with the worst questions: talk to it yourself as the angry customer, the confused customer, and the curious customer; find every bad answer, fix the document or the instruction, and test again.",
        "Connect the channels: hook the bot up to your website (chat widget), WhatsApp Business, and Instagram; most platforms make this a few clicks.",
        "Monitor and improve: read the real conversations every week; add the questions that went unanswered to the bot's knowledge — a bot that is never fed grows old.",
      ],
    },
    {
      type: "table",
      headers: ["Use case", "Example bot task", "Impact on business"],
      rows: [
        ["Support", "Answering questions about price, warranty, returns", "Heavy reduction in repetitive calls"],
        ["Sales", "Product introduction, comparison, guidance to checkout", "Higher visitor-to-purchase conversion"],
        ["Appointments", "Booking, changing, and reminding about appointments", "No more booking calls and fewer no-shows"],
        ["Lead capture", "Taking the phone number and need before the salesperson", "A warm-call list for the sales team"],
        ["Order taking", "Logging orders on a restaurant's or shop's WhatsApp", "Around-the-clock orders without staff"],
      ],
    },
    {
      type: "tip",
      title: "The golden rule of human handoff",
      text: "Always leave a clear path for the customer to reach a human agent, and train the bot to hand over quickly on sensitive questions (complaints, money, contracts). The worst bot is the one that spins an angry customer in a loop of “I didn't understand”; a timely human handoff builds trust instead of destroying it.",
    },
    { type: "h2", text: "The chatbot is itself a business" },
    {
      type: "p",
      text: "Here comes the most interesting part of the story: thousands of small and medium Iranian businesses — restaurants, clinics, agencies, shops — have around-the-clock customers but no around-the-clock support. You can package a “sales chatbot setup” service: you collect their documentation, build the bot, and charge a monthly fee for maintenance and updates. The startup cost is close to zero, you acquired the skill in this very article, and the market is not saturated yet. This is exactly one of the paths we introduced under the heading “automation and chatbots” in our comparison of five ways to earn from AI, and the roadmap for freelancing with AI is the best companion for getting started.",
    },
    { type: "h2", text: "Three mistakes that kill a chatbot" },
    {
      type: "list",
      items: [
        "Incomplete knowledge: a bot that does not know your prices and policies burns customer trust; complete the documentation before publishing.",
        "Hiding its identity: the bot must admit it is a bot; trying to deceive the customer is unethical, and the moment it is exposed, it wrecks the brand.",
        "Launch and abandon: read the real conversations weekly and update the bot; an abandoned bot gradually becomes worse than having no bot at all.",
      ],
    },
    {
      type: "quote",
      text: "A good chatbot is like a good employee: it knows everything, never gets tired, and is on the night shift too — you just have to train it properly.",
    },
    {
      type: "p",
      text: "Start today: gather the most frequent questions from the customers of your business (or a business you know) and build the first bot with Chatbase; the next day you can test it on your website. To continue the path, read AI in Sales for your sales team, AI in E-Commerce for online retail, and Smart Marketing with AI for customer acquisition. If you have built a bot, leave its link in the comments so we can test it together — and for the latest trends in the chatbot world, follow TakRah's Telegram channel.",
    },
  ],
};
