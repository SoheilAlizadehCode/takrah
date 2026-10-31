import type { Article } from "@/lib/blog-types";

// English version of "ایجاد کار و کسب الکترونیکی؛ از ایده‌پردازی SCAMPER تا بوم مدل کسب‌وکار (پودمان اول)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "e-commerce-business-idea-12",
  title: "E-Commerce Unit 1: From SCAMPER to the Business Model Canvas",
  excerpt:
    "Unit 1 of the 12th-grade e-commerce textbook, made engaging: the SCAMPER technique with its seven golden questions, needs vs. wants vs. demand, idea scoring, and the nine-block Business Model Canvas.",
  category: "student",
  tags: [
    "e-commerce textbook",
    "12th grade unit 1",
    "SCAMPER",
    "business model canvas",
    "ideation",
    "online business",
  ],
  date: "October 18, 2026",
  readMinutes: 12,
  cover: "/images/covers/ecommerce-business-idea.png",
  book: "ecommerce-security-12",
  blocks: [
    {
      type: "p",
      text: "The E-Commerce and Network Security textbook opens with a realistic story: Maher, a 12th-grade student in the Network and Software program, and his twin sister Mobina, who is skilled in graphic design and multimedia production. Their family owns an orchard and a handicraft business, but every year they wrestle with the same problem — selling. Tourists visiting the village love the products, yet there is no larger market. The task of this unit is clear: use professional ideation and business-modeling tools to design a real electronic solution to this problem. In this article we review every tool of the unit with the same examples, so you both understand the lesson and can complete your own project.",
    },
    { type: "h2", text: "Where do ideas come from? The SCAMPER technique" },
    {
      type: "p",
      text: "Does a new idea always mean inventing something from scratch? No! You can reach fresh ideas by strengthening or modifying existing patterns. The best-known tool for this is the SCAMPER technique — a set of question-triggering words that spin your mind in seven different directions. For any product or problem, ask these seven questions:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Substitute: which part of the product or process can I swap for something else? The book's example: honey instead of sugar in lavashak (fruit leather) production, or online sales instead of in-person sales.",
        "Combine: what things can I merge together? Like pairing nut packaging with the mother's hand-embroidered cloth bundles — two products, one fresh experience.",
        "Adapt: which existing idea can I draw inspiration from? Like using the traditional patterns of the fabrics in the packaging design.",
        "Modify: what can I make bigger, smaller, sweeter, or different? For example, highlighting the creativity of the packaging so the embroidered bag's value rises.",
        "Put to another use: what other market does this same product fit? The book's example: leftover fabric pieces become traditional brooches, and Mobina's graphic designs become packaging cover art.",
        "Eliminate: which part is unnecessary? Like shelled, pitted nuts — removing one nuisance creates new value.",
        "Reverse/Rearrange: what happens if we work backwards? Instead of the tourist coming to buy, Maher delivers the product to the customer.",
      ],
    },
    {
      type: "p",
      text: "Alongside SCAMPER, the book introduces other methods your instructor may ask about in assignments, such as the Morphological method and the TRIZ technique. All you need to know is that they share one goal: breaking out of mental repetition and generating more solutions for a single problem. In the project, first identify a problem in your own family or among your friends, then analyze it with one of these techniques — exactly what the book asks of you in steps 1 through 8 of the project.",
    },
    { type: "h2", text: "Need, want, demand: three words you must not mix up" },
    {
      type: "p",
      text: "Teacher Farahmand stresses in the book's story that every idea must rest on a market need. Keep three concepts precisely apart. A need (Need) means the basic items every human requires — food and shelter, for example; these are roughly the same for all people. A want (Want) is the specific form each culture and individual chooses to satisfy a need — the need for food is the same for everyone, but one person wants dried nuts and fruit while another wants fast food. And demand (Demand) is a want backed by money: many people “want” a laptop, but not everyone can afford one, so only those buyers constitute demand. Build the same table for your own business: what does the village customer need? What form does that want take? And which form of the product will they actually pay for? (The book's example: a 500-gram travel pack of nuts.)",
    },
    { type: "h2", text: "Evaluating ideas with a scoring table" },
    {
      type: "p",
      text: "After generating several ideas, you have to choose. A good idea meets certain criteria: customers exist for it, the target market is accessible and has buying power, it outperforms similar products, it creates special value, and it offers several reasons to buy. A practical idea, in turn, does not require heavy capital or costs and can be executed with available resources. The book provides a table where you score each idea from 1 to 5 — and here is the subtle part: for capital and cost, the scoring is reversed, because lower cost means a higher score! In the story, the ideas of selling dried nuts and handicrafts online earn the highest marks, while building an amusement park fails. After the table, you can also stress-test the result by surveying business owners.",
    },
    { type: "h2", text: "The Business Model Canvas: the whole story mapped in 9 blocks" },
    {
      type: "p",
      text: "Before any venture begins, the Business Model Canvas answers three essential questions: how is value created, how is it delivered, and where does revenue come from? The canvas has nine components, which we have grouped for you here:",
    },
    {
      type: "table",
      headers: ["Canvas component", "What it means", "Maher and Mobina's example"],
      rows: [
        ["Customers", "Who buys, and why?", "Tourists and customers of Aliabad village"],
        ["Value proposition", "What distinctive advantage do we offer?", "Organic dried nuts and fruit + packaging in traditional fabric"],
        ["Distribution channels", "How does the product reach buyers?", "In-person sales + an online store website"],
        ["Customer relationships", "How do we attract and retain them?", "A customer club on social media + surveys"],
        ["Revenue streams", "Where does the money come from?", "Product sales, renting rooms to tourists, membership fees"],
        ["Key resources", "What do we need?", "The father's orchard, the mother's fabrics, Mobina's multimedia skills"],
        ["Key activities", "What are the most important tasks?", "Producing organic dried nuts and fruit, creating educational content"],
        ["Key partners", "Who do we work with?", "Tourists, handicraft shops, the ISP"],
        ["Cost structure", "Where does the money go?", "Production, packaging, advertising, wages"],
      ],
    },
    {
      type: "p",
      text: "Pay extra attention to two components. In the value proposition you can create value by answering new needs, customization, easy access, risk reduction, improved performance, and special pricing. And in customer relationships you have six approaches, ranging from personal assistance to self-service automation and customer clubs. Your choice of relationship approach directly affects both cost and customer loyalty.",
    },
    { type: "h2", text: "Persona, customer journey, and MVP: the final three steps to launch" },
    {
      type: "p",
      text: "The closing section of the unit brings the idea down to execution. A persona is a precise, realistic portrait of one representative customer (age, job, interests, pain points) so that design is done for “someone” rather than “everyone”. The customer journey map then shows the stages a customer goes through, from first hearing about you to buying and returning, so you can find and fix every point of friction. After that, instead of building a full but flawed product, you build a minimum viable product (MVP): the simplest version that demonstrates value. You release it to the audience and refine it with real feedback. Choosing the domain name, the host, and the technology infrastructure are the last steps of launching. Remember: online, you take the first step, but audience feedback steers the rest — these course changes are called a pivot, and they come from smartness, not regret!",
    },
    {
      type: "tip",
      title: "Assessment notes for this unit",
      text: "The stage 1 assessment expects you to: identify the problem, select and apply an ideation technique, determine need, want, and demand, define the idea evaluation criteria, and build the business model canvas. Among the non-technical competencies, creative thinking and “protecting customer privacy” are emphasized — be sure to mention them when presenting your work.",
    },
  ],
};
