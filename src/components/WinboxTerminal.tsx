import React from "react";
import { WifiNetwork, ToolTerminal } from "../types";
import { Terminal, Shield, Play, Square, AlertCircle, CheckCircle2 } from "lucide-react";

interface WinboxTerminalProps {
  network: WifiNetwork | null;
  toolName: string;
  toolDescription: string;
  terminalState: ToolTerminal;
  isRunning: boolean;
  onStartTool: () => void;
  onStopTool: () => void;
}

export const WinboxTerminal: React.FC<WinboxTerminalProps> = ({
  network,
  toolName,
  toolDescription,
  terminalState,
  isRunning,
  onStartTool,
  onStopTool,
}) => {
  if (!network) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-950/40 border border-slate-900 rounded-lg h-full min-h-[300px]">
        <Terminal className="w-10 h-10 text-slate-700 mb-2" />
        <h4 className="font-mono text-sm text-slate-300">No Target Target Assigned</h4>
        <p className="text-[11px] text-slate-500 font-mono mt-1 max-w-xs">
          Assigned target WiFi details are required to initialize the RouterOS security testbeds.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-lg overflow-hidden flex flex-col h-full shadow-lg">
      {/* Terminal Title Bar */}
      <div className="border-b border-slate-900 p-3 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-200">{toolName}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
              RouterOS Toolbed
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        </div>
      </div>

      {/* Description Header */}
      <div className="bg-slate-900/30 p-3 border-b border-slate-900">
        <p className="text-xs text-slate-300 font-mono">
          <strong className="text-indigo-400">Target SSID:</strong> {network.ssid} ({network.bssid})
        </p>
        <p className="text-[11px] text-slate-400 font-mono mt-1">
          {toolDescription}
        </p>
      </div>

      {/* Terminal Logs Canvas */}
      <div className="flex-1 bg-black p-4 font-mono text-xs text-emerald-500 space-y-1.5 overflow-y-auto max-h-[250px] min-h-[200px] border-b border-slate-900 custom-scrollbar">
        {terminalState.logs.length === 0 ? (
          <div className="text-slate-600 h-full flex items-center justify-center italic select-none">
            [System Idle] Click "Run Diagnostic Suite" to start simulation...
          </div>
        ) : (
          terminalState.logs.map((log, index) => {
            let color = "text-emerald-500";
            if (log.startsWith("[-] ") || log.includes("FAILED") || log.includes("Error")) {
              color = "text-rose-500";
            } else if (log.startsWith("[!] ") || log.includes("WARNING")) {
              color = "text-yellow-400";
            } else if (log.startsWith("[+] ") || log.includes("SUCCESS")) {
              color = "text-cyan-400";
            } else if (log.startsWith("[i] ")) {
              color = "text-slate-400";
            }

            return (
              <div key={index} className={`leading-relaxed whitespace-pre-wrap ${color}`}>
                {log}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Panel */}
      <div className="p-3 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {terminalState.status === "RUNNING" ? (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-yellow-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              Processing diagnostics...
            </div>
          ) : terminalState.status === "COMPLETED" ? (
            <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Scan Completed
            </div>
          ) : terminalState.status === "WARNING" ? (
            <div className="flex items-center gap-1 font-mono text-[11px] text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              Risk Findings Detected
            </div>
          ) : (
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              Terminal idle
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={onStopTool}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-mono text-xs rounded flex items-center gap-1 transition-all"
            >
              <Square className="w-3 h-3 fill-white" />
              Stop Test
            </button>
          ) : (
            <button
              onClick={onStartTool}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-mono text-xs rounded flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/20"
            >
              <Play className="w-3 h-3 fill-white" />
              Run Diagnostic Suite
            </button>
          )}
        </div>
      </div>

      {terminalState.findings && (
        <div className="p-3 bg-slate-900 border-t border-slate-950 font-mono text-[11px] text-slate-300">
          <span className="text-indigo-400 font-bold">Conclusion:</span> {terminalState.findings}
        </div>
      )}
    </div>
  );
};
