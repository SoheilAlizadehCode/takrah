#!/bin/bash
# کاورهای بخش دانش‌آموز — ۱۲ تصویر پایه بدون متن
cd /home/z/my-project
OUT=scripts/student-covers
mkdir -p $OUT

STYLE="dark navy background with glowing teal and cyan accents, modern minimal 3D illustration style, soft studio lighting, clean composition with empty space in upper left corner, no text, no letters, no words, no watermark, no logo, high quality, detailed"

gen() {
  local file="$1"; local prompt="$2"
  if [ -f "$OUT/$file" ]; then echo "skip $file"; return; fi
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$file" -s 1344x768 && echo "OK $file" || echo "FAIL $file"
}

gen book-network-hardware.png "stack of textbooks and networking hardware on a desk, ethernet cables coiled neatly, a small network switch with glowing ports, floating holographic laptop"
gen book-ecommerce-security.png "online store concept, shopping cart and padlock floating over laptop, glowing shield hologram, coins and package boxes, digital marketplace atmosphere"
gen network-equipment-installation.png "close-up of colorful ethernet cables being plugged into network switch ports, RJ45 connectors, punch tool and cable tester on workbench, network installation scene"
gen network-setup-dhcp-dns.png "abstract visualization of IP addresses flowing as glowing packets between servers, hierarchical tree of connected nodes, digital address labels as glowing dots"
gen wireless-network-modem.png "modern wifi router with glowing signal waves radiating outward, wireless access point on shelf, soft radio wave rings in the air"
gen network-management-ad-gpo.png "central server tower connected with glowing lines to many client computers arranged in a tree hierarchy, control dashboard hologram above the server"
gen network-troubleshooting.png "laptop screen showing abstract network topology simulation with nodes and green connection dots, magnifying glass hovering over a glowing cable, diagnostic scene"
gen ecommerce-business-idea.png "creative brainstorm concept, lightbulb with growing sprout, sticky notes and business model canvas floating as holograms, young entrepreneur desk with laptop"
gen online-store-development.png "e-commerce storefront on laptop screen with product grid and shopping bags, floating admin dashboard panels, delivery box and credit card"
gen mikrotik-router-setup.png "professional black desktop network router with multiple antennas and ethernet ports, glowing green status lights, terminal window hologram floating beside it"
gen network-security-firewall.png "glowing blue firewall wall protecting a digital city of servers, shield emblem, blocking arrows of attacks mid-air, defense concept"
gen ip-camera-nvr.png "modern white CCTV dome security camera mounted on ceiling corner with infrared LED ring, multiple cameras connected by glowing network lines to a recording device"

ls -la $OUT/ | tail -14
