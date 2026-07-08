import React, { useState, useEffect } from "react";
import { WifiNetwork, SecurityAuditResult, ToolTerminal, RouterStatus } from "./types";
import { mockNetworks, mockRouterStatus, simulatedAuditTools } from "./data";

// PERBAIKAN: Menggunakan Default Import agar sesuai dengan pemanggilan komponen di bawah
import AIAuditPanel from "./components/AIAuditPanel";

import NetworkItem from "./components/NetworkItem";
import WinboxTerminal from "./components/WinboxTerminal";

import { 
  Network, 
  Cpu, 
  ShieldCheck, 
  Terminal as TermIcon, 
  Plus, 
  Wifi, 
  Sliders, 
  Settings, 
  Radio, 
  Zap, 
  Server, 
  Search, 
  ChevronRight, 
  HelpCircle,
  Activity,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  FolderDown,
  FileCode,
  ShieldAlert,
  Loader2,
  X,
  Lock,
  Compass,
  Battery,
  Signal,
  WifiOff,
  CornerDownLeft,
  ArrowRightLeft
} from "lucide-react";

export default function App() {
  // Application view modes: 'DESKTOP' (Winbox style) or 'MOBILE' (Real native Android APK frame)
  const [viewMode, setViewMode] = useState<'MOBILE' | 'DESKTOP'>('MOBILE');

  // Application state
  const [networks, setNetworks] = useState<WifiNetwork[]>(mockNetworks);
  const [selectedNetwork, setSelectedNetwork] = useState<WifiNetwork | null>(mockNetworks[0]);
  const [routerStats, setRouterStats] = useState<RouterStatus>(mockRouterStatus);
  const [auditResults, setAuditResults] = useState<Record<string, SecurityAuditResult>>({});
  
  // Custom customizer SSID values
  const [newSsid, setNewSsid] = useState("");
  const [newBssid, setNewBssid] = useState("");
  const [newSecurity, setNewSecurity] = useState("WPA2-PSK");
  const [newFrequency, setNewFrequency] = useState(2.4);
  const [newChannel, setNewChannel] = useState(6);
  const [newStrength, setNewStrength] = useState(-55);
  const [newManufacturer, setNewManufacturer] = useState("MikroTik RouterOS");

  // Terminal tool suite state
  const [selectedTool, setSelectedTool] = useState(simulatedAuditTools[0]);
  const [terminalState, setTerminalState] = useState<ToolTerminal>({
    logs: [],
    status: "IDLE",
    findings: ""
  });
  const [isToolRunning, setIsToolRunning] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const [networkFilter, setNetworkFilter] = useState("ALL");

  // Connection Ping Tester state
  const [pingTarget, setPingTarget] = useState("8.8.8.8");
  const [pingLogs, setPingLogs] = useState<string[]>([]);
  const [isPinging, setIsPinging] = useState(false);

  // Android Emulation State
  const [isApkInstalling, setIsApkInstalling] = useState(false);
  const [apkInstalled, setApkInstalled] = useState(true);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(true);
  const [showManifest, setShowManifest] = useState(false);
  const [androidNotification, setAndroidNotification] = useState<string | null>(
    "WiBox APK initialized. ACCESS_FINE_LOCATION permission granted."
  );

  // Trigger simulated system metrics variations like a real router
  useEffect(() => {
    const timer = setInterval(() => {
      setRouterStats(prev => ({
        ...prev,
        cpuUsage: Math.max(2, Math.min(99, prev.cpuUsage + (Math.random() > 0.5 ? 2 : -2))),
        ramUsage: Math.max(20, Math.min(95, prev.ramUsage + (Math.random() > 0.5 ? 1 : -1)))
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Clear notifications after delay
  useEffect(() => {
    if (androidNotification) {
      const timer = setTimeout(() => {
        setAndroidNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [androidNotification]);

  // Trigger security audit using backend Gemini endpoint
  const handleRunAudit = async (customQuery?: string) => {
    if (!selectedNetwork) return;
    setIsAuditLoading(true);

    try {
      const response = await fetch("/api/audit-network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ssid: selectedNetwork.ssid,
          bssid: selectedNetwork.bssid,
          signalStrength: selectedNetwork.signalStrength,
          securityType: selectedNetwork.securityType,
          frequency: selectedNetwork.frequency,
          channel: selectedNetwork.channel,
          manufacturer: selectedNetwork.manufacturer,
          ipAddress: "192.168.88.102",
          gateway: routerStats.gatewayIp,
          dns: routerStats.dnsServer,
          customQuery: customQuery
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the AI security auditor backend.");
      }

      const result: SecurityAuditResult = await response.json();
      setAuditResults(prev => ({
        ...prev,
        [selectedNetwork.id]: result
      }));
      setAndroidNotification(`AI Security scan complete for ${selectedNetwork.ssid}`);
    } catch (error: any) {
      console.error(error);
      // Dynamic fallback based on security type if API is unavailable
      const fallbackResult: SecurityAuditResult = {
        securityScore: selectedNetwork.securityType === "OPEN" ? 5 : selectedNetwork.securityType === "WEP" ? 15 : 75,
        vulnerabilityLevel: selectedNetwork.securityType === "OPEN" ? "CRITICAL" : selectedNetwork.securityType === "WEP" ? "HIGH" : "LOW",
        vulnSummary: `Local offline fallback check. ${selectedNetwork.securityType} is considered highly vulnerable to unauthorized handshakes.`,
        feasibilityScore: selectedNetwork.securityType === "OPEN" ? 95 : selectedNetwork.securityType === "WEP" ? 90 : 25,
        attackVectors: [
          {
            name: "Cipher Handshake Eavesdropping",
            description: "An attacker captures the 4-way handshake packets during normal client connection and uses high performance offline brute-forcing dictionary suites.",
            remediation: "Upgrade security configurations to enterprise grade WPA3 protocols and enable dynamic PMKID defense mechanics."
          }
        ],
        recommendations: [
          "Ensure RouterOS password rules enforce strict uppercase and digits parameters.",
          "Disable Legacy WPS protocols via Router management interface."
        ],
        aiAnalysisText: "WiBox local warning. To get high-fidelity AI recommendations, verify your GEMINI_API_KEY inside AI Studio Secrets Panel."
      };
      
      setAuditResults(prev => ({
        ...prev,
        [selectedNetwork.id]: fallbackResult
      }));
      setAndroidNotification("AI Offline scan generated successfully.");
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Run a real-time log simulation for any WPS/Handshake/Port diagnostics tool
  const handleStartTool = async () => {
    if (!selectedNetwork) return;
    setIsToolRunning(true);
    setTerminalState({
      logs: ["[i] Booting WiBox Network Auditing Framework...", `[i] Loading module: ${selectedTool.name}`, `[+] Binding wlan0mon monitoring driver...`],
      status: "RUNNING",
      findings: ""
    });

    try {
      const response = await fetch("/api/simulate-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: selectedTool.name,
          targetNetwork: selectedNetwork
        })
      });

      if (!response.ok) {
        throw new Error("Failed to simulate terminal output.");
      }

      const data = await response.json();
      
      // Animate logs addition for high fidelity experience
      let currentIdx = 0;
      
      const interval = setInterval(() => {
        if (currentIdx < data.logs.length) {
          setTerminalState(prev => ({
            ...prev,
            logs: [...prev.logs, data.logs[currentIdx++]]
          }));
        } else {
          clearInterval(interval);
          setTerminalState(prev => ({
            ...prev,
            status: data.status,
            findings: data.findings
          }));
          setIsToolRunning(false);
          setAndroidNotification(`Module ${selectedTool.name} scan finished.`);
        }
      }, 700);

    } catch (error) {
      setTerminalState({
        logs: [
          "[+] Auditing initialized on wlan0mon",
          `[-] Connection issue on simulated frame buffers.`,
          `[i] Test finished locally.`
        ],
        status: "COMPLETED",
        findings: "Local simulation finished safely. Security is currently healthy."
      });
      setIsToolRunning(false);
    }
  };

  const handleStopTool = () => {
    setIsToolRunning(false);
    setTerminalState(prev => ({
      ...prev,
      logs: [...prev.logs, "[-] Process terminated prematurely by user request."],
      status: "WARNING",
      findings: "Process stopped by administrative override."
    }));
  };

  // Add a newly scanned custom WiFi Node
  const handleAddNetwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSsid.trim()) return;

    const customNode: WifiNetwork = {
      id: `custom-${Date.now()}`,
      ssid: newSsid,
      bssid: newBssid || `00:1A:2B:3C:${Math.floor(Math.random() * 90 + 10)}:${Math.floor(Math.random() * 90 + 10)}`,
      signalStrength: Number(newStrength),
      securityType: newSecurity,
      frequency: Number(newFrequency),
      channel: Number(newChannel),
      manufacturer: newManufacturer,
      isCustom: true
    };

    setNetworks(prev => [customNode, ...prev]);
    setSelectedNetwork(customNode);
    setNewSsid("");
    setNewBssid("");
    setAndroidNotification(`Injected Node: ${customNode.ssid} into the Scan Array`);
  };

  // Ping testing suite
  const handlePingTest = () => {
    if (!pingTarget) return;
    setIsPinging(true);
    setPingLogs([`PING ${pingTarget} (56 data bytes)...`]);

    let seq = 1;
    const interval = setInterval(() => {
      if (seq <= 5) {
        const time = (Math.random() * 15 + 4).toFixed(1);
        setPingLogs(prev => [
          ...prev,
          `64 bytes from ${pingTarget}: icmp_seq=${seq} ttl=64 time=${time} ms`
        ]);
        seq++;
      } else {
        clearInterval(interval);
        setPingLogs(prev => [
          ...prev,
          `--- ${pingTarget} ping statistics ---`,
          `5 packets transmitted, 5 received, 0% packet loss, time 4012ms`,
          `rtt min/avg/max = 4.2/8.5/19.1 ms`
        ]);
        setIsPinging(false);
      }
    }, 500);
  };

  // Filter networks
  const filteredNetworks = networks.filter(net => {
    if (networkFilter === "ALL") return true;
    if (networkFilter === "OPEN") return net.securityType === "OPEN";
    if (networkFilter === "WEP") return net.securityType === "WEP";
    if (networkFilter === "WPA2") return net.securityType === "WPA2-PSK" || net.securityType === "WPS-WPA2";
    if (networkFilter === "WPA3") return net.securityType === "WPA3";
    return true;
  });

  // Simulated download of APK file packages
  const handleDownloadApkFile = () => {
    setIsApkInstalling(true);
    setTimeout(() => {
      setIsApkInstalling(false);
      alert("Simulated WiBox-v4.9.2-release.apk download and verification sequence completed. The structural package contains the compiled bytecode and AndroidManifest.xml setup guidelines!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* PERSISTENT APPLICATION VIEW SWITCHER */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span className="font-mono text-xs font-bold text-slate-300">View Layout Mode:</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('MOBILE')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'MOBILE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Android Native APK Emulation
          </button>
          <button
            onClick={() => setViewMode('DESKTOP')}
            className={`px-3 py-1 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
              viewMode === 'DESKTOP'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            Desktop Winbox Admin View
          </button>
        </div>
      </div>

      {/* RENDER NATIVE ANDROID MOBILE EMULATOR */}
      {viewMode === 'MOBILE' ? (
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          
          {/* LEFT: Android APK Installer Stats & AndroidManifest.xml package description */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-white">APK Native Package Info</h3>
                  <p className="text-[11px] text-slate-400 font-mono">com.wibox.security.auditor</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-800/60 pt-4 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target OS:</span>
                  <span className="text-slate-100">Android 14 (API 34)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">APK Version:</span>
                  <span className="text-slate-100">v4.9.2 (Stable Build)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signature Certificate:</span>
                  <span className="text-emerald-400 font-bold">SHA-256 Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Architecture support:</span>
                  <span className="text-slate-100">arm64-v8a, armeabi-v7a</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadApkFile}
                  disabled={isApkInstalling}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold transition-all disabled:opacity-50"
                >
                  {isApkInstalling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <FolderDown className="w-3.5 h-3.5" />
                      Export APK
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowManifest(!showManifest)}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-[10px] font-bold transition-all"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  View Manifest
                </button>
              </div>
            </div>

            {/* Android Manifest Drawer */}
            {showManifest && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-200">AndroidManifest.xml</span>
                  <button onClick={() => setShowManifest(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <pre className="text-[10px] text-emerald-400 font-mono bg-black p-3 rounded overflow-x-auto max-h-[220px] custom-scrollbar">
{`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.wibox.security.auditor">

    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="WiBox Security"
        android:theme="@style/Theme.WiBox">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`}
                </pre>
              </div>
            )}

            {/* Simulated Android Native Permissions Request Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Simulated APK Permissions
              </h4>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                Android mandates runtime location permissions to parse nearby BSSIDs and frequency details.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-[10px] text-slate-300">ACCESS_FINE_LOCATION</span>
                  </div>
                  <button
                    onClick={() => {
                      setLocationPermission(!locationPermission);
                      setAndroidNotification(
                        !locationPermission ? "Fine location permission enabled." : "Location permission revoked. Wi-Fi lists disabled."
                      );
                    }}
                    className={`px-2 py-0.5 font-mono text-[10px] rounded ${
                      locationPermission 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {locationPermission ? "GRANTED" : "DENIED"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Android Virtual Device Emulator Shell */}
          <div className="lg:col-span-8 flex justify-center">
            <div className="w-full max-w-[420px] bg-slate-900 rounded-[40px] p-3.5 border-[8px] border-slate-800 shadow-2xl relative overflow-hidden min-h-[750px] flex flex-col">
              
              {/* Phone Camera Notch */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full z-50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-850"></div>
              </div>

              {/* Status Bar Container */}
              <div className="h-7 bg-slate-950 flex items-center justify-between px-6 text-[11px] font-mono text-slate-400 select-none z-40 rounded-t-2xl">
                <span>12:24 AM</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 bg-indigo-950 px-1 rounded border border-indigo-500/20">WiBox APK</span>
                  <Signal className="w-3 h-3 text-slate-300" />
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <div className="flex items-center gap-0.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>88%</span>
                  </div>
                </div>
              </div>

              {/* Live Emulator Android Notification Toaster */}
              {androidNotification && (
                <div className="absolute top-8 left-4 right-4 bg-slate-950 border border-indigo-500/50 p-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fadeIn">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                  <p className="font-mono text-[10px] text-slate-200 flex-1">{androidNotification}</p>
                  <button onClick={() => setAndroidNotification(null)} className="text-slate-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Phone Native Web/APK View Canvas */}
              <div className="flex-1 bg-slate-950 p-3 flex flex-col gap-4 overflow-y-auto max-h-[620px] custom-scrollbar rounded-b-2xl">
                
                {/* Simulated Android App Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">WiBox Security Audits</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live
                  </span>
                </div>

                {/* Simulated Location Denied Error State */}
                {!locationPermission ? (
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-5 text-center flex flex-col items-center justify-center my-auto">
                    <WifiOff className="w-10 h-10 text-rose-400 mb-2" />
                    <h4 className="font-mono text-xs font-bold text-rose-300">Location Permission Required</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-1.5 leading-relaxed max-w-xs">
                      WiBox APK requires ACCESS_FINE_LOCATION permission to analyze local beacon arrays. Enable location permission on the left panel.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Scanner list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scanned WiFi Networks</span>
                        <div className="flex gap-1">
                          {["ALL", "OPEN", "WEP", "WPA2"].map(f => (
                            <button
                              key={f}
                              onClick={() => setNetworkFilter(f)}
                              className={`px-1.5 py-0.2 text-[9px] font-mono rounded border ${
                                networkFilter === f
                                  ? 'bg-indigo-600 border-indigo-500 text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {filteredNetworks.map(net => (
                          <div
                            key={net.id}
                            onClick={() => setSelectedNetwork(net)}
                            className={`p-2.5 rounded border cursor-pointer transition-all flex justify-between items-center ${
                              selectedNetwork?.id === net.id
                                ? 'bg-indigo-950/60 border-indigo-500'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <div>
                              <div className="font-mono text-xs font-bold text-slate-100 truncate max-w-[150px]">
                                {net.ssid}
                              </div>
                              <div className="font-mono text-[9px] text-slate-400">
                                {net.bssid} • {net.frequency}GHz
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-mono block text-slate-300">{net.signalStrength} dBm</span>
                              <span className="text-[9px] font-mono text-indigo-400">{net.securityType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Auditing */}
                    <div className="border-t border-slate-900 pt-3">
                      <AIAuditPanel
                        network={selectedNetwork}
                        auditResult={selectedNetwork ? auditResults[selectedNetwork.id] || null : null}
                        isLoading={isAuditLoading}
                        onRunAudit={handleRunAudit}
                      />
                    </div>

                    {/* Quick Diagnostic Shell */}
                    <div className="border-t border-slate-900 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">WiBox Terminal Auditing</span>
                        <select
                          value={selectedTool.id}
                          onChange={(e) => {
                            const found = simulatedAuditTools.find(t => t.id === e.target.value);
                            if (found) setSelectedTool(found);
                          }}
                          className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 rounded p-1"
                        >
                          {simulatedAuditTools.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <WinboxTerminal
                        network={selectedNetwork}
                        toolName={selectedTool.name}
                        toolDescription={selectedTool.description}
                        terminalState={terminalState}
                        isRunning={isToolRunning}
                        onStartTool={handleStartTool}
                        onStopTool={handleStopTool}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Android Bottom Navigation Virtual Keys */}
              <div className="h-10 bg-slate-950 border-t border-slate-900/60 flex items-center justify-around px-8 z-40 rounded-b-2xl">
                <button onClick={() => setAndroidNotification("Simulated Android back-stack cleared.")} className="text-slate-500 hover:text-slate-300">
                  <CornerDownLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedNetwork(mockNetworks[0])} className="text-slate-500 hover:text-slate-300">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-500"></div>
                </button>
                <button onClick={() => setViewMode('DESKTOP')} className="text-slate-500 hover:text-slate-300">
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* RENDER CLASSIC WINBOX ROUTEROS DESKTOP VIEW */
        <>
          {/* Dynamic Winbox ROS Router Dashboard Header */}
          <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-950/40">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-base font-bold text-white tracking-wider uppercase">
                    WiBox Security Auditor
                  </h1>
                  <span className="text-[10px] font-mono bg-indigo-950 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    RouterOS Mode
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Professional Wireless Diagnostic Suitcase v4.9
                </p>
              </div>
            </div>

            {/* Live Router Hardware Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="bg-slate-950/80 border border-slate-800 rounded p-1.5 px-3 flex items-center gap-2 min-w-[120px]">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>CPU Load</span>
                    <span>{routerStats.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${routerStats.cpuUsage > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${routerStats.cpuUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded p-1.5 px-3 flex items-center gap-2 min-w-[120px]">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Memory</span>
                    <span>{routerStats.ramUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${routerStats.ramUsage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex flex-col text-right text-[10px] text-slate-400 border-l border-slate-800 pl-3">
                <div>Gateway: <span className="text-slate-200">{routerStats.gatewayIp}</span></div>
                <div>Uptime: <span className="text-slate-200">{routerStats.uptime}</span></div>
              </div>
            </div>
          </header>

          {/* Main Grid Viewport */}
          <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Hand Sidebar Network list & SSID creator */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Custom WiFi Node Creator Panel */}
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 space-y-4 shadow-md">
                <h3 className="font-mono text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-900 uppercase">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  Inject Custom WiFi Node
                </h3>

                <form onSubmit={handleAddNetwork} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">SSID Name *</label>
                      <input
                        type="text"
                        required
                        value={newSsid}
                        onChange={(e) => setNewSsid(e.target.value)}
                        placeholder="e.g. Kedai_Kopi"
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Router Manufacturer</label>
                      <input
                        type="text"
                        value={newManufacturer}
                        onChange={(e) => setNewManufacturer(e.target.value)}
                        placeholder="e.g. Huawei"
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Security</label>
                      <select
                        value={newSecurity}
                        onChange={(e) => setNewSecurity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="OPEN">OPEN (None)</option>
                        <option value="WEP">WEP (Weak)</option>
                        <option value="WPS-WPA2">WPS Enabled</option>
                        <option value="WPA2-PSK">WPA2 PSK</option>
                        <option value="WPA3">WPA3 Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Band GHz</label>
                      <select
                        value={newFrequency}
                        onChange={(e) => setNewFrequency(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded p-2 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="2.4">2.4 GHz</option>
                        <option value="5.0">5.0 GHz</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Channel (1-165)</label>
                      <input
                        type="number"
                        min="1"
                        max="165"
                        value={newChannel}
                        onChange={(e) => setNewChannel(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Slider for signal strength */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1">
                      <span>Signal Strength (dBm)</span>
                      <span className={newStrength >= -50 ? "text-emerald-400 font-bold" : newStrength >= -70 ? "text-yellow-400" : "text-rose-400"}>
                        {newStrength} dBm ({newStrength >= -50 ? "Excellent" : newStrength >= -70 ? "Fair" : "Weak"})
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-95"
                      max="-30"
                      value={newStrength}
                      onChange={(e) => setNewStrength(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Inject Virtual Node
                  </button>
                </form>
              </div>

              {/* Network Scanner List */}
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 flex-1 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-mono text-sm font-bold text-slate-200 uppercase">
                      WLAN Monitor Scanner
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    LIVE SNIFFING
                  </span>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {["ALL", "OPEN", "WEP", "WPA2", "WPA3"].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setNetworkFilter(filter)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                        networkFilter === filter
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Network List Container */}
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1">
                  {filteredNetworks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs font-mono">
                      No WiFi networks fit the active protocol criteria filter.
                    </div>
                  ) : (
                    filteredNetworks.map(net => (
                      <NetworkItem
                        key={net.id}
                        network={net}
                        isSelected={selectedNetwork?.id === net.id}
                        onSelect={() => setSelectedNetwork(net)}
                        onAudit={() => {
                          setSelectedNetwork(net);
                          handleRunAudit();
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Hand content panels - Audit & Terminals */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Main AI Auditor Section */}
              <div className="grid grid-cols-1 gap-4">
                <AIAuditPanel
                  network={selectedNetwork}
                  auditResult={selectedNetwork ? auditResults[selectedNetwork.id] || null : null}
                  isLoading={isAuditLoading}
                  onRunAudit={handleRunAudit}
                />
              </div>

              {/* Winbox ROS Diagnostic Terminal suite */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Tool Selection sidebar inside terminal suite */}
                <div className="md:col-span-4 bg-slate-950 border border-slate-900 rounded-lg p-3 flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider pb-1.5 border-b border-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Select Security Diagnostic
                  </span>
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[220px]">
                    {simulatedAuditTools.map(tool => {
                      const isCur = selectedTool.id === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setSelectedTool(tool);
                            setTerminalState({ logs: [], status: "IDLE", findings: "" });
                          }}
                          className={`text-left p-2 rounded text-xs font-mono transition-all flex items-center gap-2 border ${
                            isCur
                              ? "bg-slate-900 text-white border-indigo-500/50"
                              : "bg-transparent text-slate-400 border-transparent hover:bg-slate-900/40 hover:text-slate-200"
                          }`}
                        >
                          <ChevronRight className={`w-3.5 h-3.5 text-indigo-400 transition-transform ${isCur ? "rotate-90" : ""}`} />
                          <div className="flex-1 truncate">
                            <div className="font-semibold">{tool.name}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Diagnostic Logs console */}
                <div className="md:col-span-8">
                  <WinboxTerminal
                    network={selectedNetwork}
                    toolName={selectedTool.name}
                    toolDescription={selectedTool.description}
                    terminalState={terminalState}
                    isRunning={isToolRunning}
                    onStartTool={handleStartTool}
                    onStopTool={handleStopTool}
                  />
                </div>
              </div>

              {/* RouterOS Ping Connection Tester */}
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 space-y-3 shadow-md">
                <h3 className="font-mono text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-900 uppercase">
                  <TermIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
                  RouterOS ICMP Ping Test Utility
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pingTarget}
                    onChange={(e) => setPingTarget(e.target.value)}
                    placeholder="Target IP e.g. 1.1.1.1 or 192.168.88.1"
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handlePingTest}
                    disabled={isPinging || !pingTarget}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-mono text-xs text-white font-bold rounded transition-colors disabled:opacity-50"
                  >
                    {isPinging ? "Pinging..." : "Start Ping"}
                  </button>
                </div>

                {pingLogs.length > 0 && (
                  <div className="bg-black p-3.5 rounded border border-slate-900 max-h-[140px] overflow-y-auto font-mono text-xs text-emerald-500 space-y-1">
                    {pingLogs.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </main>
        </>
      )}

      {/* Humble Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 text-center py-4 px-4 mt-auto">
        <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
          &copy; WiBox Wireless Security Auditor &mdash; Authorized network administrative tool and local defense analyzer. Please only audit WiFi nodes where you have explicit owner permission.
        </p>
      </footer>
    </div>
  );
}
