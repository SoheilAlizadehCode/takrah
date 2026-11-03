import type { Article } from "@/lib/blog-types";

// English version of "پیکربندی شبکه بی‌سیم و مودم؛ از کارت وایرلس تا تنظیم AP و مودم ADSL (پودمان سوم)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "wireless-network-modem-config-12",
  title: "Wireless Network and Modem Configuration (Unit 3)",
  excerpt:
    "The complete Unit 3 guide: IEEE 802.11 standards, Ad Hoc vs. Infrastructure networks, choosing an access point and antenna, wireless security, AP working modes, and step-by-step ADSL modem setup.",
  category: "student",
  tags: [
    "network textbook",
    "12th grade unit 3",
    "wireless network",
    "access point",
    "ADSL modem",
    "802.11",
  ],
  date: "October 18, 2026",
  readMinutes: 13,
  cover: "/images/covers/wireless-network-modem.png",
  book: "network-hardware-12",
  blocks: [
    {
      type: "p",
      text: "No organization runs today without a wireless segment; mobile phones, laptops, and even smart homes all connect to the network over radio waves. Unit 3 of the Network Equipment Installation and Maintenance textbook opens up exactly this wireless world: from the wireless network card and its standards, to building the two kinds of network — Ad Hoc and Infrastructure — choosing and configuring an access point, and finally setting up an ADSL modem. Let's move through it in order.",
    },
    { type: "h2", text: "The wireless network card and the 802.11 standards" },
    {
      type: "p",
      text: "Everything starts with the wireless network card; with the ncpa.cpl command you can see whether it is enabled or disabled and assign it an IP just like a wired card. Know the selection criteria: the IEEE 802.11 standard is the big family behind WLAN networks (versions a, b, g, n, ac, and newer), it operates in the 2.4GHz or 5GHz frequency range, and data transfer speed is directly tied to the standard. Equipment that works on both frequencies is called dual-band, and the golden rule is that transmitter and receiver must be in a common frequency range, otherwise they cannot see each other at all. A few terms belong in your notebook too: frequency (the number of signal repetitions per second), bandwidth (the gap between the highest and lowest frequency), and antenna gain, measured in dB or dBi. MIMO technology raises transfer speed and quality by using several antennas and several simultaneous paths.",
    },
    { type: "h2", text: "The two wireless modes: Ad Hoc and Infrastructure" },
    {
      type: "p",
      text: "A wireless network has two modes. In Ad Hoc mode, computers connect directly, peer to peer; it is great for the moments when infrastructure equipment is out of reach and you want to move files with a classmate quickly. In Infrastructure mode, everyone communicates through an access point (AP): it offers centralized management, is more secure and faster, and connects easily to the wired network too. In the workshop you check whether your card supports Ad Hoc with netsh wlan show drivers, then create a network with an SSID and password using netsh wlan set hostednetwork, and switch it on and off with start/stop hostednetwork. The network name (SSID) is at most 32 characters and the password between 8 and 63 characters; and if you enable Sharing on your internet, every member of the Ad Hoc network uses your connection — exactly what a phone's mobile hotspot does.",
    },
    {
      type: "tip",
      title: "Security: the two main shields of a wireless network",
      text: "Because data travels through the open air, security matters even more than on a wired network. Data encryption is done in two ways, TKIP and AES, and AES offers the higher security level. Authentication has had three generations: the old and expired WEP, the corrected WPA, and WPA2, which is today's standard. With that in mind, always choose “WPA2 + AES” in the AP settings.",
    },
    { type: "h2", text: "Getting to know the access point and how to choose one" },
    {
      type: "p",
      text: "An AP is the device that joins the wireless world to the wired one and brings the equipment together. Wireless equipment comes in two classes: indoor, for interior spaces with mild conditions, and outdoor, for open air with heat, cold, rain, and sunshine; their level of protection is measured by the IP rating (such as IP67), where the first digit covers protection against dust and the second against liquids. When choosing an AP, pay attention to the supported standards, encryption methods, working modes (such as AP Mode, Client, Repeater, Bridge), frequency and speed per band, IP rating, the number and speed of network ports, PoE support, and the number and type of antennas. For antennas, memorize these three families: the omnidirectional antenna, which throws the signal in every direction like the light of a lamp (the best option inside a building); the semi-directional antenna, such as Yagi and Panel types, suited to a point-to-point link between two buildings; and the fully focused high-directional antenna, such as the parabolic dish, for long distances. Beamforming, meanwhile, steers the signal straight toward the active users instead of scattering it, so each user gets more bandwidth.",
    },
    { type: "h2", text: "Configuring the AP firmware, step by step" },
    {
      type: "p",
      text: "To enter the AP's settings, find the default IP address, username, and password on the label on the back of the device or in the manual (very often it is 192.168.1.254 or 192.168.0.1), set your computer's card to the same IP range, and enter the firmware with a browser. In the quick configuration you set the operation mode, the SSID, and the security method. Then you reach the advanced wireless settings: choosing the channel. On the 2.4GHz band, only channels 1, 6, and 11 do not overlap with each other; so pick a channel your neighbors are not using, and scan the environment with tools like WiFi Analyzer. The default channel width is 20MHz, and 40MHz gives more speed. For extra security you can turn off the Enable SSID Broadcast option so the network name does not appear in the list of Wi-Fi networks; the user then has to add the hidden network manually, and the SSID is case-sensitive!",
    },
    {
      type: "p",
      text: "Three more security tools live in the firmware: MAC address filtering (only approved devices may connect; find the MAC with the getmac command), enabling AP Isolation to separate the wireless network from the wired one (for when you do not want guests reaching the workshop's files), and the AP's own DHCP settings for handing out IPs to wireless users automatically — even with a reserved IP for the trainee's computer! Finally, keep the firmware up to date from the manufacturer's official website — the upgrade exists to fix software problems and stay compatible with new equipment, and if the device loses power in the middle of an update it may be ruined. And if the settings ever get scrambled, hold the Reset button for 8 to 10 seconds, or return to factory settings via System Tools, then Factory Defaults.",
    },
    { type: "h2", text: "AP working modes: get to know these two well" },
    {
      type: "p",
      text: "To connect two buildings wirelessly, you install two APs in line of sight of each other: the first AP stays in Access Point mode and you put the second one in Bridge with AP (or Station) mode; then, in the bridge settings, you enter the first AP's SSID, MAC, and password. The lesson here is that working modes are really the device's “role”, and changing the mode means changing the role. Be sure to check connectivity to both APs with ping.",
    },
    { type: "h2", text: "The ADSL modem: the home's internet gateway" },
    {
      type: "p",
      text: "An ADSL modem uses DSL technology and carries voice and high-speed data at the same time over the very same existing telephone cable; the important catch is that the farther you are from the ISP's center, the lower the speed. To keep voice from interfering with data, a splitter is used: the phone line goes into the input, the telephone into one output, and the modem into the other. Today's modems are usually a switch and AP as well (a wireless modem router), and when choosing one, look at the wireless capability (speed, standard, antennas), the number and speed of LAN ports, having an Ethernet WAN port, USB, and parental control settings. Configuring the modem is like the AP: enter the firmware with the default IP, change the password first (the path is Management, then Access Control, then Passwords), then if needed change the modem's IP from 192.168.1.1 to, say, 192.168.100.1 so it matches the workshop network, and finally enable the modem's DHCP and define the address range. Clients can connect straight to the modem's LAN port, through a switch, or through an AP attached to the modem — in the workshop you test the difference between these three setups with the ping 4.2.2.4 command.",
    },
    {
      type: "quote",
      text: "Wrap-up for the exam: the 802.11 standards, the difference between Ad Hoc and Infrastructure, the three antenna families, WPA2/AES, channels 1, 6, and 11, and the modem splitter. Master these six and you already own more than half of Unit 3's questions!",
    },
  ],
};
