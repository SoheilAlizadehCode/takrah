import type { Article } from "@/lib/blog-types";

// English version of "عصر دایپ‌فیک؛ چطور ویدیوها و صداهای جعلی هوش مصنوعی را تشخیص دهیم؟" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "deepfake-guide",
  title: "The Deepfake Era: How to Spot AI-Faked Videos and Voices",
  excerpt:
    "You cannot trust your eyes anymore — executives have lost millions of dollars to a single fake video call. Learn 12 practical signs that expose fake videos and voices, plus a family security protocol.",
  category: "security",
  tags: ["deepfake", "security", "fraud", "fake video detection", "artificial intelligence"],
  date: "October 13, 2026",
  readMinutes: 11,
  cover: "/images/covers/deepfake-guide.png",
  blocks: [
    {
      type: "p",
      text: "A multinational company in Hong Kong wired 25 million dollars to fraudsters — because in a video meeting, it saw and heard their company's chief financial officer and several other colleagues. Everyone was fake. None of them were in that meeting. That was 2024 news, not science fiction; and since that day the technology for making deepfakes has become cheaper, faster and more convincing. Today, with a laptop and a few minutes of time, one can make a video that makes anyone say anything — and that means the new “skeptical eye” has started its shift: any video or voice that pulls you toward a hasty decision must first pass a test. In this article you will learn what a deepfake is and how it is made, which signs expose a fake video or voice using just your phone, which tools help, and most importantly, how to keep yourself and your family safe with a few simple habits.",
    },
    { type: "h2", text: "What is a deepfake and how is it made?" },
    {
      type: "p",
      text: "A deepfake is fake content that uses artificial intelligence to borrow the face or voice of a real person. It has three main types: a video where one person's face is mounted onto another's, a voice that learns an exact imitation of one person from a few short speech samples, and a third type built entirely from scratch — a person who does not exist in reality but looks completely real. What for years required an expert team and heavy server power, mobile apps now do: give a few photos, a few seconds of audio, and the output is ready. It is this very democratization that has created the problem: when the tool reaches everyone's hands, bad use spreads at the same speed.",
    },
    {
      type: "p",
      text: "But here is the hopeful point: making a flawless fake is still hard. The models have been trained on the “average” of humanity and leave traces in the details — irregular blinks, the hairline edge, shadows, the coherence of voice with lip movement. You only need to know these traces; and knowing them is not an art, it is a checklist.",
    },
    { type: "h2", text: "Seven signs of a fake video (with your own phone)" },
    {
      type: "list",
      ordered: true,
      items: [
        "Blink and watch what the eyes say: deepfake blinks are often either too few or too uniform; a real human's eyes change in step with the conversation.",
        "Look at the face's edge, not its center: the boundary of face and neck, the border of hair and forehead, and the area around the ears is where the forgery shows; the skin's color and texture there look like a separate layer.",
        "Teeth and tongue: teeth have a regular, repeating structure that models struggle to preserve; when S, T and SH sounds are spoken, keep an eye on the mouth.",
        "Do light and shadow read together? If the nose's shadow contradicts the wall's shadow, or the glint in the eyes does not align with the light source, it is fake.",
        "Zoom into the head-turning moments: when the head turns or tilts up or down, fake faces go “soupy” and blurred in the middle of the motion; pause that exact spot several times.",
        "Check the audio-lip sync: is the sound simultaneous and logical with the lip movement, or half a second ahead or behind? Especially on words with hard consonants like B and P.",
        "Inconsistent quality: if the middle of the video is sharp but the moment a face comes toward the camera the quality suddenly drops, the face has probably been replaced with AI and the rest of the frames are real.",
      ],
    },
    { type: "h2", text: "Five signs of a fake voice" },
    {
      type: "list",
      ordered: true,
      items: [
        "A monotone melody: a fake voice does not have a real human's energy; people “crack” in laughter, anger and surprise, while a fake voice stays smooth even at its peak.",
        "The pronunciation of certain words: complex words, foreign names and numbers are usually where a fake voice breaks; if you are in doubt, ask for that same word again.",
        "Artificial pauses: the pauses are either uniform everywhere or missing altogether; natural breathing between sentences is absent.",
        "The audio background: the room, street or car ambience does not match the claimed location, or is not heard at all; a clean voice with no ambience is itself suspicious.",
        "Illogical answers: ask them something only “the real person of that situation” would know — “when you called yesterday, what were the last words you said?” The fakes take the hook.",
      ],
    },
    {
      type: "table",
      headers: ["Tool", "What it does", "Note"],
      rows: [
        ["Hive Moderation", "Analyzes video and images for AI generation", "Free web version for a quick check"],
        ["Deepware", "Scans video for deepfakes", "Simple and suitable for ordinary users"],
        ["Google's SynthID", "Invisible watermark for AI content", "Only content produced with Google's tools"],
        ["Reverse image search", "Finds the original source of frames", "Use Google Lens or TinEye"],
      ],
    },
    {
      type: "p",
      text: "Let's honestly state one reality: no tool is one hundred percent accurate, and the detection tools are always a few steps behind the making tools. For that reason, the human checklist (the signs above) plus the logic test (a question only the real person knows) is more reliable than any tool. Consider the tool a second layer, not the first savior.",
    },
    {
      type: "tip",
      title: "The 10-second rule",
      text: "The deepfake is built for time pressure: “transfer the money right now”, “sign by tomorrow morning”, “you must not tell anyone”. Every message that makes you hurry is itself a warning sign. The simple rule: for every financial or sensitive decision, at least ten seconds of pause, then confirmation through another channel — a separate call to that same person on the number saved in your phone, not the number they themselves provided. The fraudster works with fear and haste; you win with a ten-second calm.",
    },
    { type: "h2", text: "The family security protocol; three things to do today" },
    {
      type: "p",
      text: "In Iran, the biggest victims of deepfakes are mothers and fathers — the call that says “it's your son, he has had an accident, I need money”. Do these three simple things tonight:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Pick a family code word: a name or a private memory that only family members know and that appears on no social network; whenever someone asks for money “urgently and on behalf of the family”, the code word comes first. This is a golden line of defense.",
        "Agree that you will call back: let the family rule be that for every money request, the receiver dials the sender's saved number themselves — even if the voice is exactly their brother's voice.",
        "Teach the family once: open this very article for them, or in a family call, go over the three main signs. The minutes you spend may save millions of toman — and more seriously than money, reputation and peace of mind.",
      ],
    },
    { type: "h2", text: "And when you yourself become the victim?" },
    {
      type: "p",
      text: "If a fake video or voice of you gets published: first, preserve the evidence — screenshots and links with the date. Second, report it to the platform; most social networks and messengers have a path for reporting fake content, and deepfake content violates their rules. Third, announce to the people around you that it is fake before it spreads; your speed matters more than the rumor's speed. And if money has been taken from you, follow up immediately through your bank's support service and the judicial authorities; the documented evidence you gathered exists precisely for this stage. For this topic's wider family of digital fraud, see our article on phishing awareness — and if you have not yet secured your passwords, the strong password guide is also a good thing to start today.",
    },
    {
      type: "quote",
      text: "In the deepfake era, security no longer lives in the lock on the house's door; it lives in healthy doubt toward every voice that asks for money. A skeptical person is the fraudster's hardest target.",
    },
    {
      type: "p",
      text: "Deepfakes are not meant to take us to total distrust; they are meant to make our trust targeted: trust the official channel, trust the second confirmation, trust the logic test. Save this article's checklist, set up the family code word tonight, and if you see a suspicious case, write about it for us in the comments so we can investigate it together — and follow TakRah's Telegram channel for what's new in digital security.",
    },
  ],
};
