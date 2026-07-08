import { WifiNetwork, RouterStatus } from "./types";

export const mockNetworks: WifiNetwork[] = [
  {
    id: "net-1",
    ssid: "KOPI_TIAM_FREE_WIFI",
    bssid: "7C:8B:CA:91:DE:3F",
    signalStrength: -42,
    securityType: "OPEN",
    frequency: 2.4,
    channel: 1,
    manufacturer: "TP-Link Technologies"
  },
  {
    id: "net-2",
    ssid: "IndiHome-Fiber-99B2",
    bssid: "D4:6E:0E:11:99:B2",
    signalStrength: -68,
    securityType: "WPS-WPA2",
    frequency: 2.4,
    channel: 6,
    manufacturer: "ZTE Corporation"
  },
  {
    id: "net-3",
    ssid: "MY_FAMILY_HOME",
    bssid: "18:E8:29:A0:BC:11",
    signalStrength: -55,
    securityType: "WPA2-PSK",
    frequency: 5.0,
    channel: 36,
    manufacturer: "ASUSTeK Computer Inc."
  },
  {
    id: "net-4",
    ssid: "CORP_SECURE_OFFICE",
    bssid: "A4:2B:B0:FF:E1:92",
    signalStrength: -75,
    securityType: "WPA3",
    frequency: 5.0,
    channel: 149,
    manufacturer: "Cisco Systems"
  },
  {
    id: "net-5",
    ssid: "MikroTik-Hotspot-B9",
    bssid: "08:55:31:DE:C2:B9",
    signalStrength: -80,
    securityType: "WEP",
    frequency: 2.4,
    channel: 11,
    manufacturer: "MikroTik RouterOS"
  },
  {
    id: "net-6",
    ssid: "DIRECT-SmartTV-A9",
    bssid: "2A:1E:5E:8D:C0:11",
    signalStrength: -88,
    securityType: "WPA2-PSK",
    frequency: 2.4,
    channel: 13,
    manufacturer: "Samsung Electronics"
  }
];

export const mockRouterStatus: RouterStatus = {
  cpuUsage: 12,
  ramUsage: 43,
  uptime: "4d 18h 32m 10s",
  activeClients: 14,
  gatewayIp: "192.168.88.1",
  dnsServer: "8.8.8.8",
  subnetMask: "255.255.255.0"
};

export const simulatedAuditTools = [
  {
    id: "wps-pin",
    name: "WPS Pixie-Dust Audit / Pin Recovery",
    description: "Evaluates vulnerable PIN configurations using simulated offline/online Pixie-Dust entropy analysis and Reaver-style pin space reduction.",
    icon: "KeyRound"
  },
  {
    id: "handshake",
    name: "WPA/WPA2 Handshake Capture & Crack Test",
    description: "Monitors and simulates four-way key exchange verification, checking susceptibility to dictionary testing and weak pre-shared key (PSK) matching.",
    icon: "Activity"
  },
  {
    id: "deauth",
    name: "Deauthentication Testing & Jamming Test",
    description: "Emulates simulated 802.11 management frames injection to verify router resiliency against deauth floods and test PMKID harvesting vulnerabilities.",
    icon: "ShieldAlert"
  },
  {
    id: "wep-crack",
    name: "WEP IV Packet Injection Audit",
    description: "Simulates high-speed initialization vector (IV) ARP-replay packet generation (equivalent to aircrack-ng) to demonstrate the inherent weakness of WEP encryptions.",
    icon: "Radio"
  },
  {
    id: "port-scan",
    name: "Router Port Diagnostics & Exploits Scan",
    description: "Scans for open administrative or legacy ports (80, 443, 8291, 23, 21) exposing RouterOS configurations and weak SNMP public communities.",
    icon: "Network"
  },
  {
    id: "client-inspect",
    name: "Connected Client Sniffer & ARP Audit",
    description: "Discovers active devices connected to the local default gateway, analyzing ARP cache poisoning vulnerability levels.",
    icon: "Laptop"
  }
];
