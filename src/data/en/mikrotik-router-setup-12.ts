import type { Article } from "@/lib/blog-types";

// English version of "راه‌اندازی مسیریاب میکروتیک؛ آموزش گام‌به‌گام با WinBox (پودمان سوم)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "mikrotik-router-setup-12",
  title: "MikroTik Router Setup: A Step-by-Step WinBox Guide (Unit 3)",
  excerpt:
    "Unit 3 of the 12th-grade e-commerce textbook: MikroTik and RouterOS, virtual router setup, initial configuration and backups, static routing, DHCP, NAT, bandwidth management, and the Hotspot service.",
  category: "student",
  tags: [
    "e-commerce textbook",
    "12th grade unit 3",
    "MikroTik",
    "RouterOS",
    "WinBox",
    "Hotspot",
  ],
  date: "October 18, 2026",
  readMinutes: 13,
  cover: "/images/covers/mikrotik-router-setup.png",
  book: "ecommerce-security-12",
  blocks: [
    {
      type: "p",
      text: "In Unit 3 of the E-Commerce and Network Security textbook you meet the unrivaled star of the networking equipment world: the MikroTik router. If you have heard network technicians mention the name, here is why: professional features at a reasonable price. This unit is a hands-on lesson in router setup — from virtual installation to connecting to the internet and controlling users — and the skill is among the most in-demand in Iran's job market. Let's move forward step by step with the book.",
    },
    { type: "h2", text: "Get to know MikroTik and RouterOS" },
    {
      type: "p",
      text: "The MikroTik company was founded in Lithuania in 1996 with the goal of building wireless network equipment, and gradually moved into switches and routers as well. Its flagship product is the RouterOS operating system: a Linux-based core that installs on the company's own hardware and even on standard x86 computers — meaning you can turn an ordinary PC into a network router by installing RouterOS! RouterOS comes in license levels 0 through 6; each level unlocks more features and costs a different amount. The naming of the routers follows logic too: it consists of three parts that indicate the board type, the board's features, and the wireless features; for example, RB in the names stands for Router Board. Visit the MikroTik wiki site and you will see each model's specifications, such as the number of VPN connections, Hotspot users, and ports.",
    },
    { type: "h2", text: "Setting up a virtual router: practice without hardware" },
    {
      type: "p",
      text: "The book's modern trick for practice: virtualization. Instead of buying hardware, you create a virtual machine with VMware Workstation and install RouterOS on it. The boot image comes in two forms: an ISO image, installed like any operating system, and ova/ovf/vmdk files, which import a ready-made router straight into the virtual machine. During the ISO installation, on the package-selection screen press the A key so all packages are selected, then start the installation with the i key and answer yes to the disk-wiping questions. For the virtual machine's network you have four modes: Bridge (a real connection to the local network that can obtain an IP), NAT (traffic reaches the network through the host system), Host Only (it communicates only with the host and the other machines) and a manual VMNet for complex scenarios. For practice, set the machine's network adapter to Host Only.",
    },
    { type: "h2", text: "Connecting with WinBox and initial configuration" },
    {
      type: "p",
      text: "The most common tool for connecting to MikroTik is the WinBox utility. Connect the router to a switch or straight to your computer, and in WinBox hit Refresh on the Neighbors tab so the router shows up, then connect via its MAC address — a MAC connection works even when no IP has been configured yet, which makes it the first choice. The first login uses the admin user with no password; the first security task is exactly that: set a password for admin (System → Users → Password). If the configuration gets tangled, use Reset Configuration to return to factory settings; the Keep User Configuration option preserves user settings, and No Default Configuration means no default settings are loaded after the reset. Once you have set an IP on the Ether1 port, you can also connect by IP address instead of MAC. Two housekeeping tasks matter: rename the device under System → Identity (for managing several routers more easily) and create a new user in the full group instead of working directly with admin.",
    },
    {
      type: "tip",
      title: "Backups: the habit of every professional admin",
      text: "Under the Files menu you have three important buttons: Backup to create a backup (with a name and even a password of your choice), Restore to bring it back, and Upload to load a backup file from your computer. After running Backup, drag and drop the file onto your own computer so that if the router dies, hours of configuration work sit safe in a single file.",
    },
    { type: "h2", text: "The gateway and the routing table" },
    {
      type: "p",
      text: "The gateway is the network's edge point, responsible for packets entering and leaving and for handing them to their destination — like a postal clerk who decides where each package goes. Routing means choosing the best path for packets. In MikroTik you have two kinds of routes: dynamic routes, which the router builds itself, automatically, and which the administrator may not delete or edit, and static routes, which the administrator defines manually. The special static route defined with the address 0.0.0.0/0 is the default route: “any packet whose destination is not the internal network, send toward the internet”. In the first workshop you see a no route to host error when you ping 8.8.8.8; after you create the default route with a gateway, the error changes to timeout — meaning the path exists but the next setting (NAT) is still missing. From the Terminal menu you can do everything command-driven; the console and WinBox are fed by one shared core.",
    },
    { type: "h2", text: "DHCP in MikroTik: both client and server" },
    {
      type: "p",
      text: "A MikroTik can act as both a DHCP client and a DHCP server. Client mode is for when the router itself must obtain an IP from a modem or an upstream server: go to IP → DHCP Client, select the interface, and after a few seconds you will see the assigned IP. Before configuring server mode, disable the interface's previous static IP to avoid a conflict — and remember, one interface cannot hold both roles at once! For serving addresses you have two options: full manual configuration or the DHCP Setup wizard, which asks you step by step. Afterwards, set the computer's network card to automatic, restart it, and check that it has received an IP from the MikroTik.",
    },
    { type: "h2", text: "NAT: the magic of connecting to the internet" },
    {
      type: "p",
      text: "Why is there still no internet despite the route? Because the network's internal (private) addresses are not valid on the internet! NAT, or network address translation, is a process on the edge router that converts users' internal addresses into the router's public address — like a mailroom that sends out every employee's letter stamped with its own address and remembers whom to route the reply back to. NAT has two kinds: source NAT, which rewrites the sender's address when a packet leaves, and destination NAT, which changes the recipient's address when a packet arrives. In the workshop you go to IP → Firewall, create a new rule of type srcnat on the NAT tab, and choose masquerade in the Action field; after that, a ping to the internet from the user's computer gets a reply, and the network is truly alive!",
    },
    { type: "h2", text: "Quality of service and bandwidth management" },
    {
      type: "p",
      text: "When bandwidth is limited and one person decides to download a multi-gigabyte file, everyone else stares at blank pages! MikroTik's answer is the queue mechanism. You have two kinds of queues: the Simple Queue for straightforward bandwidth limiting in small scenarios, and the Queue Tree for medium and large networks, with traffic classification and marking. In a Simple Queue you set three main things: the Target (the IP address or interface the limit applies to), the Dst (the traffic's destination), and the Target Upload/Download values — the maximum upload and download speeds. The Burst feature lets traffic exceed the limit briefly (burst traffic), and the Time section says on which days and hours the queue is active — for example, limiting only during office hours! Also keep the three main goals of QoS in mind: prioritizing sensitive traffic, controlling latency, and improving the quality metrics of the online connection.",
    },
    { type: "h2", text: "AAA and Hotspot: controlling user access" },
    {
      type: "p",
      text: "Speed limits are not enough; sometimes you want the connection to require a username, you want to know each user's data usage, and you want to shut out anonymous people. The AAA framework is the three pillars of this control: Authentication (comparing the username and password against a central database), Authorization (deciding which services a verified user may access), and Accounting (recording resource usage: connection time, data sent and received — the foundation of every ISP's billing!). In MikroTik, the Hotspot service delivers all of this in one place: with IP → Hotspot → Hotspot Setup you bring the service up on the interface of your choice; from then on, anyone who connects over Wi-Fi is met with a login page (one embedded inside the router) before reaching any website, and only after authentication gets to the internet — exactly how you set up a secure public access point such as in a hotel or internet café.",
    },
    { type: "h2", text: "Configuring the MikroTik wireless interface" },
    {
      type: "p",
      text: "The final section is the wireless interface, which is usually disabled by default. Enable it from the Wireless menu and configure its tabs: under General, the interface's name and MAC; and on the Wireless tab the essentials — Mode (the interface's role), Band (the frequency band), SSID (the name users see), Frequency, and the Security Profile. Keep the two most common Mode settings in mind: ap bridge means the device becomes an access point that other devices can connect to (first create a new Security Profile with WPA2/PSK and dynamic keys so your network is locked), and station bridge means the device itself connects to another access point like an ordinary client and no longer broadcasts. You also have three wireless troubleshooting tools: Scanner to see the access points around you, Wireless Sniffer to capture and analyze 802.11 packets (savable for later review), and Wireless Snooper to display the frequency range and nearby devices. With these three, you can read the wireless environment like a real technician!",
    },
    {
      type: "quote",
      text: "Unit 3 assessment checklist: set up the router virtually + connect with WinBox via MAC and IP + initial configuration and a new user + backup + DHCP Server + create a route and view the routing table + connect the network to the internet with NAT + set up a public access point with Hotspot.",
    },
  ],
};
