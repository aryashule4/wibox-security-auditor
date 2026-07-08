export interface WifiNetwork {
  id: string;
  ssid: string;
  bssid: string;
  signalStrength: number; // dBm e.g., -50 to -90
  securityType: string; // "WPA3", "WPA2-PSK", "WEP", "WPS-WPA2", "OPEN"
  frequency: number; // 2.4 or 5
  channel: number;
  manufacturer?: string;
  isCustom?: boolean;
}

export interface AttackVector {
  name: string;
  description: string;
  remediation: string;
}

export interface SecurityAuditResult {
  securityScore: number;
  vulnerabilityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SECURE";
  vulnSummary: string;
  feasibilityScore: number;
  attackVectors: AttackVector[];
  recommendations: string[];
  aiAnalysisText: string;
}

export interface RouterStatus {
  cpuUsage: number;
  ramUsage: number;
  uptime: string;
  activeClients: number;
  gatewayIp: string;
  dnsServer: string;
  subnetMask: string;
}

export interface ToolTerminal {
  logs: string[];
  status: "COMPLETED" | "WARNING" | "SECURE" | "RUNNING" | "IDLE";
  findings: string;
}
