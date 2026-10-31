import type { Article } from "@/lib/blog-types";

// نسخهٔ انگلیسی مقالهٔ «هوش مصنوعی چیست؟» — ترجمهٔ تحریریه، نه ترجمهٔ ماشینی
export const enWhatIsAi: Article = {
  slug: "what-is-ai-beginners-guide",
  title: "What Is Artificial Intelligence? A Complete Beginner's Guide",
  excerpt:
    "AI is everywhere right now — but what exactly is it, and how does it actually work? In this guide, without any complicated jargon, you will learn everything you need to understand artificial intelligence.",
  category: "ai",
  tags: ["artificial intelligence", "machine learning", "ChatGPT", "fundamentals"],
  date: "September 16, 2026",
  readMinutes: 9,
  cover: "/images/covers/ai-guide.png",
  featured: true,
  blocks: [
    {
      type: "p",
      text: "If you follow technology news, you probably come across the phrase “artificial intelligence” every single day. From the voice assistants on our phones to tools that write text and create images on our behalf, AI is quickly becoming part of everyday life. Yet many people still have an unclear picture of this technology and confuse it with the human-like robots of science-fiction movies. In this guide, we will explain — in plain language and without academic jargon — what artificial intelligence really is, how it works, and how it will affect your life.",
    },
    { type: "h2", text: "What exactly is artificial intelligence?" },
    {
      type: "p",
      text: "Artificial intelligence (AI) is the branch of computer science whose goal is to build machines capable of performing tasks that normally require human intelligence: understanding language, recognizing images, making decisions, learning from experience, and solving problems. The important thing is that AI is not a single technology — it is a collection of methods and techniques that all share one common goal: allowing a computer to find the right solution on its own, without being explicitly programmed for every possible situation.",
    },
    {
      type: "p",
      text: "To understand the difference better, compare ordinary software with AI. A calculator only does exactly what the programmer defined for it; but an AI image-recognition model, shown a photo of a cat it has never seen during training, can still tell you it is a cat — because it learned the general pattern of “catness”, not a handful of specific photos. This ability to learn and generalize is the beating heart of artificial intelligence.",
    },
    { type: "h2", text: "Machine learning: the engine that drives AI" },
    {
      type: "p",
      text: "You might ask: how does a computer “learn”? The answer lies in a concept called machine learning. In traditional programming, a human writes the rules and the computer executes them. In machine learning, the process is reversed: we feed the computer a massive amount of data and the algorithms discover the patterns themselves. For example, to build a spam-filtering system, instead of hand-writing hundreds of rules, we show the model thousands of spam and legitimate emails and let it learn the difference.",
    },
    {
      type: "p",
      text: "The more data a model has, the more accurate its learning becomes. That is why large technology companies with access to billions of data points lead this field. But machine learning does not depend on data alone; computing power plays a decisive role too. Modern graphics processors can perform billions of calculations per second — and that is what made the recent AI revolution possible.",
    },
    { type: "h2", text: "The different types of AI" },
    {
      type: "p",
      text: "AI can be classified by its capabilities. The first type — the one we interact with everywhere today — is Narrow AI: a system skilled at exactly one specific task. Your phone's voice assistant, the movie recommender on streaming services, and face detection in your photo gallery are all examples. These systems perform remarkably well inside their specialty but never step beyond it; a voice assistant cannot cook your dinner or write poetry.",
    },
    {
      type: "p",
      text: "The second type, which does not exist yet, is Artificial General Intelligence (AGI): human-level intelligence that could perform any intellectual task. Scientists are still debating whether it is achievable — and if so, how many decades away it is. The third type, Artificial Superintelligence, would surpass the combined capacity of all human minds and currently exists only in theoretical and philosophical discussions.",
    },
    { type: "h2", text: "Generative AI: the star of recent years" },
    {
      type: "p",
      text: "The recent AI boom is largely thanks to a subfield called generative AI. Instead of only analyzing, these systems create new content: text, images, music, video, and even code. Tools like ChatGPT — which answer your questions in natural language, write articles, and debug code — are prominent examples. They are built on “large language models” that, after reading billions of sentences, have learned the structure of language and a broad body of general knowledge.",
    },
    {
      type: "tip",
      title: "Practical tip",
      text: "You do not need any technical background to start using generative AI. Simply create an account with one of the popular tools and ask your questions in plain language. The more precise your question, the better the answer you will get.",
    },
    { type: "h2", text: "AI in everyday life" },
    {
      type: "p",
      text: "You may not realize it, but you use AI dozens of times every day without noticing. When a search engine completes your half-typed word, when maps suggest the less congested route, when your bank blocks a suspicious transaction, and even when your phone groups photos by face — all of that is AI. The technology has also brought massive change to professional fields.",
    },
    {
      type: "list",
      items: [
        "Medicine: early disease detection from medical images, sometimes with accuracy above human specialists",
        "Education: intelligent tutoring systems that measure each student's learning pace and serve suitable content",
        "Agriculture: monitoring crop health with drones and precisely predicting harvest time",
        "Customer service: chatbots that answer customer questions around the clock",
        "Translation: tools that translate between more than a hundred languages at quality close to a human translator",
        "Content creation: writing ad copy, editing photos, and producing short videos in minutes",
      ],
    },
    { type: "h2", text: "Limitations and concerns you should know about" },
    {
      type: "p",
      text: "For all its power, AI is not flawless, and knowing its limitations matters as much as knowing its capabilities. The biggest problem with language models is a phenomenon called hallucination: the model can state completely wrong information with total confidence. That is why you should never trust AI on important medical, legal, or financial matters without verifying against reliable sources. Privacy is another serious issue: many services store your conversations to improve their models, so never enter sensitive information such as passwords or banking details into these tools.",
    },
    {
      type: "p",
      text: "Another concern raised in scientific and professional communities is AI's impact on jobs. History shows that new technologies create new kinds of work in the long run, but in the short term some professions undergo fundamental change. The rational strategy — rather than resisting the wave — is to learn to use these tools so you hold a stronger position in the future job market. People who make AI their working tool will not be replaced by those who ignored it.",
    },
    { type: "h2", text: "Where should you start?" },
    {
      type: "p",
      text: "If this guide has sparked your interest, here are a few simple steps for entering the world of AI. First, try one of the popular generative tools and work with it for a few days to get a feel for it. Then start using it for everyday tasks — writing emails, summarizing text, brainstorming ideas. If you want to go deeper, free courses from leading universities and reputable educational channels are a great starting point.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Pick one generative AI tool and practice with it daily",
        "In every conversation, ask more precise, step-by-step questions",
        "Always verify the answers against reliable sources",
        "Follow AI news from reputable outlets",
        "Gradually discover the more specialized tools for your own field",
      ],
    },
    {
      type: "p",
      text: "Artificial intelligence is neither magic nor a mindless threat; it is a powerful tool whose value depends entirely on how it is used. Those who invest time in learning this technology today will be in a far better position tomorrow. We at TakRah will be by your side, step by step, along that learning path.",
    },
  ],
};
