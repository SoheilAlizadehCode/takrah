import type { Article } from "@/lib/blog-types";

// English version of "چطور رمز عبور امن بسازیم؟ راهنمای جامع و عملی" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "strong-password-guide",
  title: "How to Create Strong Passwords: A Complete Practical Guide",
  excerpt:
    "Your accounts can be hacked in minutes with a simple password. Learn how to build strong, memorable passwords and secure your accounts for good.",
  category: "security",
  tags: ["passwords", "security", "password manager", "two-factor authentication"],
  date: "July 16, 2026",
  readMinutes: 9,
  cover: "/images/covers/strong-password.png",
  blocks: [
    {
      type: "p",
      text: "Every year millions of accounts are stolen worldwide, and in most cases the main culprit is a weak or reused password. With today's automated tools, attackers can try millions of password combinations in a matter of minutes — and unfortunately many users still rely on passwords like their birth date, their mobile number, or sequences like 123456. The good news is that creating and managing a secure password requires no special technical knowledge, only an understanding of a few simple principles. In this guide you will learn, step by step, how to make your accounts practically unbreakable.",
    },
    { type: "h2", text: "What does a weak password look like?" },
    {
      type: "p",
      text: "Before building a good password, we need to know which passwords break easily. Intrusion tools first run through the list of the world's most common passwords and then move on to familiar combinations of letters and numbers. If your password falls into the categories below, you have effectively left the door open for intruders.",
    },
    {
      type: "list",
      items: [
        "Short passwords of fewer than 8 characters, which today's computing power cracks in seconds",
        "Personal information such as your birth date, family name, mobile number, or pet's name, all of it available on social media",
        "Simple keyboard patterns like qwerty or a row of numbers",
        "An ordinary word even with substitutions, such as adding a period or digits at the start and end of simple words",
        "Using a single password for every site; if one site is breached, all of your accounts are at risk",
      ],
    },
    {
      type: "quote",
      text: "The golden rule of security: your password is only as secure as the weakest account that uses it.",
    },
    { type: "h2", text: "What qualities does a secure password have?" },
    {
      type: "p",
      text: "Contrary to popular belief, length matters more than complexity. A simple 12-character password is far more resistant than an 8-character one packed with strange symbols. The time needed to crack a password grows exponentially with its length; a password that today falls in a few hours at 8 characters becomes an operation lasting centuries at 14. So make this your standard: at least 12 to 16 characters, a mix of uppercase and lowercase letters, numbers, and symbols, and no guessable personal information anywhere.",
    },
    { type: "h2", text: "The passphrase method: strong passwords you will not forget" },
    {
      type: "p",
      text: "The main problem with random passwords is remembering them, and the clever solution to this problem is the passphrase method. The idea is simple: instead of one word, use a meaningless yet memorable phrase. For example, the sentence “I planted 4 tulips in the garden” can become a password like I-Planted-4-Tulips-In-The-Garden, which is long, varied in characters, and at the same time completely memorable for you. You can build a different sentence for every important account too. This method combines the best of both worlds: the security of long passwords and the simplicity of remembering them.",
    },
    {
      type: "tip",
      title: "A hands-on exercise",
      text: "Try it right now: build an eight-word sentence about a memory only you know, connect its words with hyphens, and add a number and a symbol as well. Test the password you have created in password-strength checkers — local ones only, without ever entering your real password into a website.",
    },
    { type: "h2", text: "Password managers: a memory that remembers every password" },
    {
      type: "p",
      text: "The golden rule of security is that every account must have a unique password; but no one can memorize fifty complex ones. The official solution to this problem is password manager software. These tools keep all your passwords in an encrypted vault that opens with only one master password. Tools such as Bitwarden (free and open source), 1Password, and KeePass do exactly this, with features like random password generation, automatic form filling, and alerts when a password is reused. The vault's master password should be the strongest passphrase you have ever built, and you should never repeat it anywhere else.",
    },
    { type: "h2", text: "Two-factor authentication: the second lock that changes everything" },
    {
      type: "p",
      text: "Even the strongest password can be stolen in a major breach. Two-factor authentication (2FA) is designed for exactly that moment: after the correct password is entered, a second code or approval is required through another channel. If someone has your password, they still cannot get in without access to the second step. Several methods exist: SMS (not the best, but better than nothing), code-generating apps such as Google Authenticator or Authy (more secure than SMS), and physical security keys (the most secure method available). Practical advice: at the very least, enable two-factor authentication with a code-generating app today for your vital accounts — email, banking, your main messenger, and social media.",
    },
    { type: "h2", text: "The final account-security checklist" },
    {
      type: "list",
      ordered: true,
      items: [
        "Review the current passwords of your important accounts; change any password that is shorter than 12 characters or reused.",
        "Priority one: your main email. Because every password reset leads there, your email is the main castle.",
        "Install a password manager and replace your important accounts one by one with unique generated passwords.",
        "Enable two-factor authentication for email, banking, messengers, and social media.",
        "Keep the recovery codes that services give you when enabling 2FA in a secure physical place.",
        "Every few months, check the recent activity of your important accounts (the Security Activity section) so you spot unfamiliar logins quickly.",
        "Do not trust emails and messages that say “your password has expired, change it right now”; always go directly through the official app or website.",
      ],
    },
    { type: "h2", text: "Wrapping up" },
    {
      type: "p",
      text: "The security of your digital accounts rests on three pillars: long and unique passwords, a reputable password manager, and two-factor authentication. Implementing these three pillars completely might take an hour, but it can spare you years of trouble and loss caused by stolen accounts. Start today with your most important account and finish the rest over the week. In the next article of this series, we take a complete look at one of the most common security traps — phishing — so you know exactly how the scammers operate.",
    },
  ],
};
