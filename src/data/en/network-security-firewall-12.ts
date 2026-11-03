import type { Article } from "@/lib/blog-types";

// English version of "تنظیمات امنیت شبکه؛ از تست نفوذ تا فایروال ویندوز و میکروتیک (پودمان چهارم)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "network-security-firewall-12",
  title: "Network Security Basics: Attack Phases and Firewalls (Unit 4)",
  excerpt:
    "Unit 4 of the e-commerce textbook: hacker types, the four phases of a cyber attack, DoS and DDoS, firewall filtering types, Windows Firewall rules, and MikroTik firewall chains.",
  category: "student",
  tags: [
    "e-commerce textbook",
    "12th grade unit 4",
    "network security",
    "firewall",
    "DDoS",
    "penetration testing",
  ],
  date: "October 18, 2026",
  readMinutes: 13,
  cover: "/images/covers/network-security-firewall.png",
  book: "ecommerce-security-12",
  blocks: [
    {
      type: "p",
      text: "Any e-commerce business we built in the previous units is a shop with the front door wide open if it is not secure! Unit 4 of the E-Commerce and Network Security textbook has two halves: first we learn how attacks are carried out (because defense is impossible without understanding the attack), and then we build the network's defensive fortress with firewalls. This is the unit that is both fun to read and a favorite of security job interviewers.",
    },
    { type: "h2", text: "Security vocabulary: attacker, target, vulnerability" },
    {
      type: "p",
      text: "Anyone or anything in the network that launches an attack against a system is called an attacker or intruder; every attack has a target and exploits a vulnerability to get results. Hackers are classified by their motives, and the book highlights three groups: the black hat hacker, or cracker, who breaks in illegally and steals information; the white hat hacker, a security professional who performs authorized penetration tests so the organization's weak points are found and fixed; and the gray hat hacker, who combines both behaviors. The job of “penetration and vulnerability testing specialist” is today one of the most in-demand security roles: organizations seek to hire these people to do — legally and ethically — exactly what crackers do, and to report the vulnerabilities to management.",
    },
    { type: "h2", text: "The four phases of a cyber attack" },
    {
      type: "p",
      text: "Penetration testing professionals follow exactly the same path crackers take — with permission and ethics. Get to know the four phases using the book's workshop examples:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Phase 1 — Information gathering (footprinting): the attacker collects as much information about the target as possible, through passive reconnaissance (unobtrusive: watching comings and goings, searching for information online) and active reconnaissance (probing the network to discover computers and IPs, which may leave traces). Tools: Whois, which publicly shows a domain owner's details (name, phone, email, domain expiry date); nslookup for resolving a domain name to an IP and testing DNS; tracert for finding the path and the intermediate routers; and the Google Hacking technique — clever use of the search engine itself to uncover exposed information.",
        "Phase 2 — Scanning: with the previous phase's information, the attacker hunts for weak points: scanning for open ports (for example with Net Tools 5 or the well-known NMAP and Angry IP Scanner) — because every unwatched open port is an entry door; scanning the network's active IP addresses with Ping Tester; and website vulnerability scanning with tools such as Acunetix, Nessus, and Retina, which produce analytical reports. The netstat command also shows the open ports on your own system.",
        "Phase 3 — Gaining and maintaining access: an attack matching the vulnerability is chosen, the break-in is performed, and access is then kept with a backdoor — a hidden gateway inside a program that grants entry without security checks. Malware that arrives disguised as emails and unknown programs does the same thing. Defense: complete security tools and distrust of unknown software.",
        "Phase 4 — Covering tracks: the attacker erases the evidence of the attack; the common method is deleting the log files in Windows' Event Viewer service. Which is exactly why logging and keeping logs on a separate server is one of an organization's most important defensive measures.",
      ],
    },
    { type: "h2", text: "DoS and DDoS attacks: when a server drowns" },
    {
      type: "p",
      text: "In a DoS — denial of service — attack the goal is disruption and cutting off the service, not theft! The book's example: students go to the university website to check their grades, and the hacker floods the server with a massive volume of traffic, keeping it so busy answering that it loses the ability to respond to real users. In the more dangerous form, DDoS, the attack is launched from thousands of systems simultaneously. The book's real example is chilling: the famous 2018 DDoS attack on the GitHub website, in which the attackers reached a rate of 1.35 terabits of packets per second! In the workshop you simulate an attack on a practice target with the LOIC tool and watch the traffic in Wireshark — make sure it is only on a lab network and with your instructor's permission. To see a live map of global attacks, the book also introduces the norse-corp.com website: you can see which countries are targeted the most.",
    },
    { type: "h2", text: "Defensive services: IDS, IPS, and antivirus" },
    {
      type: "p",
      text: "Against these threats, dedicated defensive services exist. The IDS (intrusion detection system) service relies on a database of attack patterns to identify various attacks and usually works alongside the IPS (intrusion prevention system) service, which can also neutralize an attack. Antivirus and anti-spam services likewise block viruses and nuisance messages from entering the network and systems. And the main pillar of defense is the firewall: a service that inspects every passing packet and stops suspicious packets from entering the network — the checkpoint officer of computer networks.",
    },
    { type: "h2", text: "Hardware and software firewalls; filtering types" },
    {
      type: "p",
      text: "A software firewall installs on the operating system like any other program; it is cheap and easy — examples include the Windows Firewall itself, ISA Server, Kerio Control, and even some antivirus products. A hardware firewall is implemented on dedicated boards and offered as a standalone appliance: it has more advanced settings, imposes a lighter traffic load on the network, and suits large networks — but it is more expensive and its configuration takes a specialist. The MikroTik router's firewall is of this type. Filtering also comes in levels, from simple to powerful: MAC filtering (based on the network card's MAC address), packet filtering (deciding by IP address and port), stateful filtering (based on the state of connections — the most powerful and specialized), and application filtering at the program level. UTM appliances combine all of these filters in one place and also deliver integrated VPN/IPsec, antivirus, anti-spam, and IDPS services; that is why they meet the security requirements of many mid-sized organizations.",
    },
    { type: "h2", text: "Windows Firewall: profiles and rules" },
    {
      type: "p",
      text: "The first time you connect to a network, Windows asks what kind of network it is — and that choice determines your security! You have three profiles: Domain (connected to an organization's domain), Private for trusted private networks such as home (file sharing and seeing the network's computers is allowed), and Public for anonymous public networks like airport Wi-Fi (the strictest mode; resource sharing is closed). Firewall rules also have two directions: Inbound for traffic trying to enter the system and Outbound for traffic leaving the system; each rule can be tied to a specific program, port, or IP address and applied to a particular profile. The book's workshop example: write a rule so your computer cannot get an address from the workshop's DHCP server! Firewall logging matters too: in each profile's settings, the Customize button lets you enable Log dropped packets (recording blocked packets) and Log successful connections (recording passing packets); then read the log file to find out whether your rules are working correctly or the firewall is disrupting some software somewhere. The trick instead of turning the whole firewall off: find only the relevant rule and disable it temporarily!",
    },
    { type: "h2", text: "The MikroTik firewall and its chains" },
    {
      type: "p",
      text: "The MikroTik firewall is one of the router's most powerful services, offering stateful filtering, application filtering, and filtering by address, port, and packet content. Its structure is built on chains: the Input Chain for traffic whose destination is the router itself, the Output Chain for traffic leaving the router itself, and the Forward Chain — a MikroTik specialty — for traffic that comes from one network, passes through the router, and heads to another network. In the workshop you implement a real scenario: we want nobody from the outside network to reach the router's WinBox through the internet (IP 10.1.1.1 on the internet-receiving interface); so in IP → Firewall → Filter Rules we create a rule that blocks connections to the WinBox port coming from the internet interface. The firewall's place in the network also has two important scenarios: the network edge (between the internal network and the internet; it controls both inbound and outbound traffic) and separating the server network from the organization's internal network (external users only reach the servers, and the internal network stays safe behind the firewall). The book's final security lesson: MikroTik security starts with the MikroTik itself — check who has access to WinBox and disable unnecessary services.",
    },
    {
      type: "quote",
      text: "Exam summary: hacker types + the four attack phases + each phase's tools (Whois, nslookup, tracert, port scanning, Acunetix) + the difference between DoS and DDoS + IDS/IPS + the Windows profiles + the three MikroTik chains. This list is the complete roadmap of Unit 4!",
    },
  ],
};
