import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes

// WiFi & Network Analysis endpoint backed by Gemini
app.post("/api/audit-network", async (req, res) => {
  try {
    const { 
      ssid, 
      bssid, 
      signalStrength, 
      securityType, 
      frequency, 
      channel,
      ipAddress,
      gateway,
      dns,
      manufacturer,
      customQuery 
    } = req.body;

    if (!ssid || !securityType) {
      return res.status(400).json({ error: "SSID and Security Type are required for auditing." });
    }

    const systemPrompt = `You are WiBox AI, a premium wireless security analysis agent.
Analyze the provided WiFi network context and generate a professional-grade vulnerability assessment, penetration-testing feasibility score, security score, and specific mitigation/hardening guidelines.

Rules:
1. Speak in professional cyber-security analyst terminology.
2. Keep the advice realistic, helpful, educational, and legal (educational penetration testing guidelines, defense first).
3. Do not provide real functional exploit code or raw execution malware. Provide conceptual explanations, weaknesses, and step-by-step audit steps (e.g., WPS PIN checking, Handshake capturing concept, Deauth attack countermeasures).
4. Return the response as JSON adhering exactly to this TypeScript structure:
{
  "securityScore": number (0-100),
  "vulnerabilityLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SECURE",
  "vulnSummary": string,
  "feasibilityScore": number (0-100, probability of successful audit/penetration test with tools like aircrack-ng or pixiewiewp),
  "attackVectors": [
    {
      "name": string,
      "description": string,
      "remediation": string
    }
  ],
  "recommendations": string[],
  "aiAnalysisText": string (markdown formatting allowed, beautiful, extensive, technical)
}`;

    const prompt = `Network Context:
- SSID: ${ssid}
- BSSID: ${bssid || "N/A"}
- Signal Strength: ${signalStrength || -65} dBm
- Security Protocol: ${securityType} (e.g. WEP, WPA, WPA2-PSK, WPA3, OPEN, WPS-Enabled)
- Frequency: ${frequency || 2.4} GHz
- Channel: ${channel || 6}
- Local IP / Client Info: IP ${ipAddress || "192.168.1.100"}, Gateway ${gateway || "192.168.1.1"}, DNS ${dns || "8.8.8.8"}
- Device/Router Manufacturer (OUI lookup approximation): ${manufacturer || "Unknown"}
${customQuery ? `\nUser Special Diagnostic Request: ${customQuery}` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const auditData = JSON.parse(text.trim());
    return res.json(auditData);

  } catch (error: any) {
    console.error("AI Network Audit failed:", error);
    return res.status(500).json({ 
      error: "Could not generate security audit. Ensure GEMINI_API_KEY is configured correctly.", 
      details: error?.message || error 
    });
  }
});

// Mock simulation of live tool suites for Winbox-style interface
// To make the interface fully responsive and provide premium realistic tools
app.post("/api/simulate-tool", async (req, res) => {
  const { toolType, targetNetwork } = req.body;
  
  try {
    const systemPrompt = `You are WiBox Security Simulator. Simulate the terminal / diagnostic execution logs for a professional educational network testing tool.
Tool type requested: "${toolType}" on target network: "${targetNetwork?.ssid || 'Default Gateway'}" (BSSID: ${targetNetwork?.bssid || '00:11:22:33:44:55'}).

Generate realistic, high-fidelity terminal console output (including step-by-step scans, beacons, WPS PIN trials, handshake captures, initialization vector checks, ARP spoofing) that demonstrates how a security administrator tests their own network defenses.
Conclude with a clear security recommendation on how to block this vector.
Provide a JSON response:
{
  "logs": string[],
  "status": "COMPLETED" | "WARNING" | "SECURE",
  "findings": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate high-fidelity terminal console logs showing step-by-step wireless auditing for tool: "${toolType}" on network SSID: "${targetNetwork?.ssid || 'Default'}" under channel ${targetNetwork?.channel || 6}. Keep logs under 12 lines.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const simulatedData = JSON.parse(response.text || "{}");
    return res.json(simulatedData);
  } catch (err: any) {
    // Fallback static output if Gemini is busy
    return res.json({
      logs: [
        "[+] Initializing WiBox Terminal Lab Suite...",
        `[i] Scanning interface wlan0mon...`,
        `[+] Setting channel of wlan0mon to ${targetNetwork?.channel || 6}`,
        `[!] Target Network: ${targetNetwork?.ssid || 'Default'}`,
        `[+] Testing vulnerability vector: ${toolType}...`,
        `[+] Handshake target check initiated.`,
        `[i] Scanning complete. Security hardening recommended.`,
      ],
      status: "COMPLETED",
      findings: "WiFi audit diagnostic finished. Review the results in the console."
    });
  }
});

// Mount Vite middleware for serving SPA in dev mode, or express static in production
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WiBox Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
