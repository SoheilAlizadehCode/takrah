import type { Article } from "@/lib/blog-types";

// English version of "راه‌اندازی شبکه؛ آموزش کامل IP، DHCP و DNS و اشتراک‌گذاری منابع (پودمان دوم)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "network-setup-dhcp-dns-12",
  title: "Network Setup: IP, DHCP, DNS and Sharing Explained (Unit 2)",
  excerpt:
    "Unit 2 of the Grade-12 network book in one article: IPv4 addressing and classes, subnetting, workgroups, user accounts, NTFS permissions, and installing DHCP and DNS on Windows Server.",
  category: "student",
  tags: [
    "network textbook",
    "12th grade unit 2",
    "DHCP",
    "DNS",
    "IP addressing",
    "resource sharing",
  ],
  date: "October 18, 2026",
  readMinutes: 14,
  cover: "/images/covers/network-setup-dhcp-dns.png",
  book: "network-hardware-12",
  blocks: [
    {
      type: "p",
      text: "Now that you know the equipment and have run the cabling, it is time to give the network its “soul”! Unit 2 of the Network Equipment Installation and Maintenance textbook has two sections: first, addressing and building a workgroup network with resource sharing, and second, installing and using the DHCP and DNS services on Windows Server. Judged by volume, this is one of the heaviest units in the book — and exactly the part that will meet you every single day in the job market. In this article we have rewritten all of it for you in a tidy, compact form.",
    },
    { type: "h2", text: "Protocols: the common language of computers" },
    {
      type: "p",
      text: "Two computers need a shared language to talk to each other; the set of rules that determines how data is packaged, sent, received, and checked is called a protocol. The most famous and most important of them is TCP/IP, which works both on the internet and on local networks. Every data packet carries a source address and a destination address, and the protocol's job is to split the data into small packets, reassemble them at the destination, and correct errors. Keep two key terms from the book in mind: a node is any device on which a network address can be configured, and a host is a node that plays the role of source or destination in communications.",
    },
    { type: "h2", text: "The IPv4 address: a computer's postal code" },
    {
      type: "p",
      text: "An IPv4 address is a 32-bit number divided into four 8-bit sections (octets) separated by dots, such as 192.168.100.138. Each address has two parts: the network ID, which is like your city's code, and the host ID, which is your exact home address. A subnet mask is used to separate these two parts. Based on their first byte, addresses fall into classes A through E: class A for giant networks with more than 16 million hosts, class B for medium networks (about 65 thousand hosts), class C for small networks (254 hosts), class D for multicast, and class E for experimentation. Memorize two special addresses as well: 127.0.0.1, the loopback address for testing TCP/IP on the machine itself, and the broadcast address (all host bits set to 1) for sending to every member of the network.",
    },
    {
      type: "p",
      text: "Because public addresses are limited, private addresses have been defined for internal networks, usable without IANA's permission: the 10.x.x.x range, the 172.16 to 172.31 range, and everyone's favorite, the 192.168.x.x range. Addressing itself comes in two flavors: manual or static (simple, but slow and prone to duplicate-address mistakes) and dynamic, handled by the DHCP service. In the workshop you read the network configuration with the ipconfig and ipconfig /all commands and confirm connectivity to other nodes with ping — these two commands are going to stay with you for the rest of your career!",
    },
    { type: "h2", text: "Subnetting in plain language" },
    {
      type: "p",
      text: "When an organization grows, it is better to split the network into smaller subnets so there is less traffic and management gets easier. The core trick is this: sneak a few bits out of the host portion and add them to the network ID. For example, a class C address with subnet mask 255.255.255.0 supports at most 254 hosts; if you borrow 4 bits for the network ID (mask 255.255.255.240), you get only 14 hosts per subnet instead of 254, but you gain 16 subnets. In the workshop you practice calculating the subnet mask and address ranges with tools like Advanced IP Address Calculator. The general rule: the more network bits, the more networks — and the fewer hosts in each one.",
    },
    { type: "h2", text: "The workgroup network and user management" },
    {
      type: "p",
      text: "A workgroup is a small set of computers that share their resources with each other — it is also called a peer-to-peer network. It is perfect for small environments, but in large organizations, for security reasons, the sensible choice is a Domain. Using System Properties, you join the computer to a common workgroup name. Next comes the local user account, which only allows signing in to that one computer; its two main tools are User Accounts in the Control Panel and, more powerfully, Computer Management. The built-in administrator and guest accounts cannot be deleted, but you can rename them or disable them.",
    },
    {
      type: "p",
      text: "Instead of assigning permissions to each user one by one, organize users into groups. The important local groups are Administrators (all administrative tasks), Backup Operators (backup and restore), Guests, and Users. System groups such as Everyone and Creator Owner have their membership managed by the operating system itself. In the assessment, creating a group, adding a user to it, and using the right technical vocabulary when explaining your work are among the grading criteria.",
    },
    { type: "h2", text: "Sharing resources and permissions" },
    {
      type: "p",
      text: "To share a folder you have two routes: Shared Folders in Computer Management, or File Explorer (the Sharing tab, then Advanced Sharing). Share permissions have three levels: Read (viewing only), Change (viewing plus modifying and deleting), and Full Control (everything, even changing permissions). A professional trick: change the share name so the folder's real name stays hidden from the network, and if you put a $ sign at the end of the share name, the folder becomes completely hidden and reachable only through its UNC path, \\\\IP\\ShareName. With Map Network Drive you can also give a shared path a drive letter so you never have to type the address again.",
    },
    {
      type: "p",
      text: "But share permission is not the whole story; NTFS drives have their own independent permissions, which apply even when the user is sitting at the machine itself. The main ones are Full Control, Modify, Read & Execute, List Folder Contents, Read, and Write. By default permissions are inherited from the parent folder (Inheritance) and appear grayed out; if you disable inheritance, Windows offers you the choice of copying or removing the inherited permissions. The golden rule for effective permission: the sum of all Allow entries minus the Deny entries. Because Deny takes priority over Allow, even a user in a group with full permission can be shut out by a single Deny. Explicit permissions also take priority over inherited ones.",
    },
    { type: "h2", text: "Section two: the DHCP service on Windows Server" },
    {
      type: "p",
      text: "As long as your network has 5 systems, handing out IPs manually is tolerable; but what about 100 systems? DHCP (Dynamic Host Configuration Protocol) is a client/server service that automatically gives every computer that connects an IP address and its side settings. Its benefits: preventing address conflicts, eliminating typing errors, saving time, and centralized management; and when a device leaves the network, its address is freed up for someone else to use. On Windows Server 2012, after installing the service you must define a scope, that is, a range of addresses: for example, from 192.168.20.1 to 192.168.20.100. Inside the same wizard you can set exclusions (addresses that must never be handed out) and the lease duration.",
    },
    {
      type: "tip",
      title: "Advanced settings the assessment asks about",
      text: "A reservation reserves a fixed IP for one specific device based on its MAC address; MAC filtering blocks a particular device from receiving an IP. Remember that the server must always have a static IP, and before use you must activate the scope. The commands ipconfig /release and ipconfig /renew free the address and then request a fresh one from the server.",
    },
    {
      type: "p",
      text: "One interesting exam point: when no DHCP server is reachable, Windows uses the APIPA service to give the network card a temporary address from the 169.254.x.y range so it is not left completely addressless. The APIPA service searches the network again every five minutes, and the moment DHCP shows up, the card gets its real address. If the output of ipconfig /all shows an address in that range, you already know where the problem is!",
    },
    { type: "h2", text: "The DNS service: the network's phone book" },
    {
      type: "p",
      text: "Memorizing the IP of every website is impossible — it would be like having to memorize a phone number for every call you make! DNS is the network's directory-assistance hotline (in Iran, the 118 number-lookup service): it converts a domain name into an IP address, and back again. This conversion is called name resolution: the client hands the name to the DNS server, the server returns the IP, and communication is established. Domain naming is hierarchical, and the full name, the FQDN, is separated by dots from the host down to the root (like fa.wikipedia.org). In the DNS console, a zone comes in two main types: a forward lookup zone for converting name to IP, and a reverse lookup zone for the opposite. Each zone stores its data in resource records; the most widely used are the Host (A) record, meaning name to IPv4, and the Pointer (PTR) record, meaning IP to name.",
    },
    {
      type: "p",
      text: "The client side must have its DNS address configured too; you fill in two boxes: the Preferred DNS Server, which is tried first, and the Alternate DNS Server, which you fall back on if the first one fails. Testing the service is simple: if you ping the name of a record you created and get a reply, DNS is healthy, and with the nslookup command you see the name and address together. Finally, remember that every important service, DHCP included, must be backed up (Backup and Restore live in the same console) so that one failure does not wipe out the whole network's settings.",
    },
    {
      type: "quote",
      text: "Unit 2 exam checklist: setting the name and IP type, creating a subnet, joining the workgroup, sharing resources and permissions, building a scope and a reservation, and creating a zone with an A record. Each one is an assessment stage — practice them one by one!",
    },
  ],
};
