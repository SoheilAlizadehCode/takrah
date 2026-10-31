import type { Article } from "@/lib/blog-types";

// English version of "عیب‌یابی شبکه؛ آموزش Packet Tracer و رفع قطعی اینترنت (پودمان پنجم)" — editorial translation
export const EN_ARTICLE: Article = {
  slug: "network-troubleshooting-packet-tracer-12",
  title: "Network Troubleshooting: Packet Tracer and Outages (Unit 5)",
  excerpt:
    "The final and most practical unit: a four-step troubleshooting algorithm, simulating networks in Packet Tracer, diagnosing NIC and cable faults, Windows tools, and fixing switch and wireless problems.",
  category: "student",
  tags: [
    "network textbook",
    "12th grade unit 5",
    "Packet Tracer",
    "network troubleshooting",
    "ping",
    "tracert",
  ],
  date: "October 18, 2026",
  readMinutes: 14,
  cover: "/images/covers/network-troubleshooting.png",
  book: "network-hardware-12",
  blocks: [
    {
      type: "p",
      text: "Every network goes down one day; the real question is whether you can find and fix the problem. Unit 5 of the Network Equipment Installation and Maintenance textbook is the book's practical masterpiece: first you build real scenarios with the Packet Tracer simulator and watch how data packets behave, then you learn a systematic method for real-world troubleshooting — the very skill that “network support” job postings demand from you. In this article we have covered both halves of the unit in full.",
    },
    { type: "h2", text: "Simulators: the network's safe practice ground" },
    {
      type: "p",
      text: "Before laying hands on an organization's real network, practicing in a simulator is the sensible move. The simulators introduced in the book: Cisco Packet Tracer, which simulates network scenarios with Cisco equipment and allows analysis and debugging; GNS3, for configuring Cisco, MikroTik, and Juniper equipment; and Omnet++, open-source, for simulating wired and wireless networks and even modeling the energy consumption of nodes. In Packet Tracer, with the Connections option you can pick the cable automatically or go manually: a straight cable for connecting a computer to a switch, a crossover cable for connecting two computers to each other. After connecting, a green circle on each device means the connection is healthy and up; a red circle means the connection is not established or the device is off (power it on from the Physical tab).",
    },
    {
      type: "p",
      text: "Practice the book's four key scenarios in the right order: first, a two-computer network with a crossover cable and manual IP settings; second, a star topology with a switch (straight cable) and sending a packet with Simulation Mode and the Add Simple PDU button so you can watch the packet's path with your own eyes; third, connecting two workshops with two switches — here you make the big discovery that when the two networks' IP ranges are different, a switch alone is not enough; and fourth, connecting two different networks with a router: you set up the router's GigabitEthernet ports in the Config tab, and each port becomes the gateway of its own network. The packet first goes to the source network's switch, the switch hands it to the router (the gateway), and the router passes it to the destination network's switch — exactly the logic of the post office and its central office!",
    },
    {
      type: "tip",
      title: "A few side scenarios that appear in the final assessment",
      text: "Simulating a wireless network with an AP, a laptop, and a smartphone; DHCP, DNS, and HTTP services on a simulated server; file transfer with FTP (the put and get commands); and even a smart home with IoT devices managed remotely from IoT Monitor. The book brings these in workshops 5 through 11 of the unit, and the final performance standard is “simulating a wired network plus wireless plus a specific service”.",
    },
    { type: "h2", text: "The troubleshooting algorithm: four disciplined steps" },
    {
      type: "p",
      text: "Troubleshooting means a systematic approach to finding and fixing hardware or software faults. Network faults come in two classes: hardware (broken equipment, severed connections) and software (wrong configuration, viruses, firewall restrictions). The fault's scope has two states too: only part of the network is broken, or the whole network is down. The book gives a four-step algorithm: 1) identify the problem precisely by questioning the users (ask in a way that does not make the user feel blamed, so they give accurate information), prioritize the problems, gather information, and review the network plan; 2) evaluate and test with hardware tools (the cable tester and the network toolbox; professional testers even report the cable's length and the location of the break) and software tools (command-line commands); 3) determine the problem and fix it (replace the defective part or correct the configuration) and recheck performance; and 4) prepare a performance report for the client covering the type of problem, the reason it happened, and the prevention method. This report both shows your professionalism and is the basis for paying your wage under the contract.",
    },
    { type: "h2", text: "Troubleshooting the network card and cable: start from the icon" },
    {
      type: "p",
      text: "The first place to look: the network icon in the taskbar's notification area. Memorize its states: Connected means the connection is up; Not connected with a red cross means the cable is not plugged in or the card is disabled (right-click in Network Connections and enable it); Unidentified network means there is a connection but the IP configuration is wrong; and cable unplugged is the sign of a physical cable break. If there is no icon at all, see the status in that area's tooltip. After the visual check, enter the experiment with ping: if you get a destination host unreachable reply, it means the destination computer has not been given an IP; if it is general failure, it means your system's IP does not match the network's range (the NetId is not the same). To be sure the protocol itself is healthy, also run ping 127.0.0.1. If the cable falls under suspicion, always disconnect it from the equipment first and then test it: lights 1 through 8 must come on in both the Master and Remote sections, simultaneously and in order — a light that fails to come on means that very wire strand has the problem. Remember that using the tester on a cable that is still attached to equipment can damage the hardware!",
    },
    { type: "h2", text: "Internet outages and Windows troubleshooting" },
    {
      type: "p",
      text: "When one of the systems has no internet but the others do, the book's suggested check order is: ping the local network connection, then review the Default Gateway settings with ipconfig (it must be in the same subnet range), then test reaching a website. If ping to an IP like 8.8.8.8 answers but a domain name does not, the problem is DNS: set or change the DNS address. The ipconfig /flushdns command empties the DNS cache, and do not forget the browser cache either. The magic tool is tracert: when ping only says “there is a problem” without saying where, tracert shows the route to the destination node by node, and the first node that no longer answers is the starting point of troubleshooting. The Windows Network Diagnostic tool also automatically detects and fixes many problems, and Event Viewer keeps the log of system events. If the local network is healthy but the whole workshop's internet is down, go behind the modem: check its lights, review its configuration, and in the end call the ISP.",
    },
    { type: "h2", text: "Troubleshooting the switch and the wireless network" },
    {
      type: "p",
      text: "For the switch, read the LED lights: a blinking green Link light means the port is healthy and data is moving; no light means there is no connection at all; alternating orange and green means an error; and all the lights blinking together means a component has failed. One classic problem: the loop — both ends of one cable get connected to a switch, the packet gets stuck circling in the loop, and the network slows down or stops working; managed switches have a loop-prevention capability. Resetting the switch sometimes works miracles too. In the wireless network, if only one device will not connect: check the system's wireless status and the laptop's wireless on/off switch, make sure Airplane mode is off, add the hidden SSID manually, and take the distance from the AP and obstacles like concrete walls into account. If the entire wireless network is down, the AP or modem is most likely at fault: power it off and on for 30 seconds, check the antenna, reconfigure it if needed — and if you realize the problem is not with the local equipment, take the matter up with the ISP.",
    },
    { type: "h2", text: "Remote management: the professional technician's tool" },
    {
      type: "p",
      text: "The unit's closing section says you do not need to run over there yourself for every problem. Remote management means reaching the network's nodes regardless of geographic location. Its methods come in two classes: text-based and graphical. The famous text method is Telnet: a network-based protocol that gives you a text terminal on the destination system, with which you can check servers' open ports (the default port is 23). One important security note: Telnet does not encrypt data, and hackers abuse it to break in; that is why you should disable unnecessary services on the internal network, and know that its safer successor is SSH. Graphical methods let you control the destination computer as if you were sitting in front of it — exactly what support companies use to fix users' problems. In the final assessment, preparing documentation and delivering the report to the customer are among the non-technical competency criteria — being a professional is not only about being technical!",
    },
    {
      type: "quote",
      text: "The golden wrap-up: the 4-step algorithm, the meaning of the network icons, ping, tracert, and flushdns, reading the switch's LEDs, and the cable tester. These five pillars will rescue your exam — and land your first job!",
    },
  ],
};
