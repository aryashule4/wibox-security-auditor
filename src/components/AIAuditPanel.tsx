import React, { useState } from "react";
import { WifiNetwork, SecurityAuditResult } from "../types";
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle, Lightbulb, RefreshCw, Sparkles, Send } from "lucide-react";

interface AIAuditPanelProps {
  network: WifiNetwork | null;
  auditResult: SecurityAuditResult | null;
  isLoading: boolean;
  onRunAudit: (customQuery?: string) => void;
}

export const AIAuditPanel: React.FC<AIAuditPanelProps> = ({
  network,
  auditResult,
  isLoading,
  onRunAudit,
}) => {
  const [customQuestion, setCustomQuestion] = useState("");

  if (!network) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-950/40 border border-slate-900 rounded-lg min-h-[350px]">
        <Shield className="w-12 h-12 text-slate-700 animate-pulse mb-3" />
        <h3 className="font-mono text-base font-medium text-slate-300">No Network Selected</h3>
        <p className="text-xs text-slate-500 font-mono mt-1 max-w-sm">
          Select a WiFi network from the left sidebar panel or add a custom node, then trigger "Audit Network" to start the automated AI security evaluation.
        </p>
      </div>
    );
  }

  const getVulnerabilityColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return { bg: "bg-red-950/80", border: "border-red-500/50", text: "text-red-400", hex: "#ef4444" };
      case "HIGH":
        return { bg: "bg-rose-950/80", border: "border-rose-500/40", text: "text-rose-400", hex: "#f43f5e" };
      case "MEDIUM":
        return { bg: "bg-yellow-950/80", border: "border-yellow-500/40", text: "text-yellow-400", hex: "#eab308" };
      case "LOW":
        return { bg: "bg-blue-950/80", border: "border-blue-500/40", text: "text-blue-400", hex: "#3b82f6" };
      default:
        return { bg: "bg-emerald-950/80", border: "border-emerald-500/40", text: "text-emerald-400", hex: "#10b981" };
    }
  };

  const colors = auditResult ? getVulnerabilityColor(auditResult.vulnerabilityLevel) : null;

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoading) return;
    onRunAudit(customQuestion);
    setCustomQuestion("");
  };

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-lg overflow-hidden flex flex-col h-full shadow-lg">
      {/* Panel Header */}
      <div className="border-b border-slate-900 p-4 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="font-mono text-sm font-semibold text-slate-100">
            AI WiFi Security Auditor &mdash; <span className="text-indigo-400 font-bold">{network.ssid}</span>
          </h3>
        </div>
        <button
          onClick={() => onRunAudit()}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          Re-Audit
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[300px]">
          <div className="relative flex items-center justify-center w-24 h-24 mb-4">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <p className="font-mono text-sm text-slate-200">Querying WiBox AI Expert...</p>
          <p className="font-mono text-[11px] text-indigo-400 mt-1 max-w-xs text-center animate-pulse">
            Analyzing cipher handshake vectors, WPS PIN entropy, and network gateway configuration...
          </p>
        </div>
      ) : auditResult && colors ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Top stats block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score circle */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3.5 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    style={{ strokeDasharray: `${auditResult.securityScore}, 100` }}
                    className={
                      auditResult.securityScore > 75
                        ? "text-emerald-500"
                        : auditResult.securityScore > 45
                        ? "text-yellow-500"
                        : "text-rose-500"
                    }
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute font-mono text-lg font-bold text-slate-100">
                  {auditResult.securityScore}
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-400 mt-2">Security Score</span>
            </div>

            {/* Vuln Level Badge Card */}
            <div className={`border rounded-lg p-3.5 flex flex-col justify-center ${colors.bg} ${colors.border}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                <span className={`font-mono text-sm font-extrabold tracking-wider ${colors.text}`}>
                  {auditResult.vulnerabilityLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono mt-1.5 leading-relaxed">
                {auditResult.vulnSummary}
              </p>
              <span className="font-mono text-[9px] text-slate-400 mt-1 uppercase">Vulnerability Rating</span>
            </div>

            {/* Exploitation feasibility */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-center">
              <div className="flex items-center justify-between font-mono text-xs text-slate-200">
                <span>Penetration Feasibility</span>
                <span className="font-bold text-indigo-400">{auditResult.feasibilityScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${auditResult.feasibilityScore}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2 leading-tight">
                Probability of successful network auditing using standard testing distributions.
              </p>
            </div>
          </div>

          {/* AI Comprehensive Analysis */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-lg p-4 font-sans text-sm text-slate-300 space-y-2 leading-relaxed">
            <h4 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Deep Technical Analysis
            </h4>
            <div className="font-mono text-xs whitespace-pre-wrap text-slate-300 bg-slate-950 p-3 rounded border border-slate-900 max-h-[220px] overflow-y-auto leading-relaxed">
              {auditResult.aiAnalysisText}
            </div>
          </div>

          {/* Simulated Exploitation Vectors */}
          {auditResult.attackVectors && auditResult.attackVectors.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Discovered Audit / Attack Vectors
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {auditResult.attackVectors.map((vec, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex flex-col gap-1.5">
                    <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-1">
                      ⚠️ Vector: {vec.name}
                    </span>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {vec.description}
                    </p>
                    <div className="text-[11px] font-mono bg-slate-900/60 p-2 rounded text-emerald-400 border border-emerald-950">
                      <strong className="text-emerald-300">Defense Audit Steps:</strong> {vec.remediation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Recommendations */}
          {auditResult.recommendations && auditResult.recommendations.length > 0 && (
            <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-lg p-4 space-y-2">
              <h4 className="font-mono text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                Administrative Hardening Guidelines
              </h4>
              <ul className="space-y-1.5">
                {auditResult.recommendations.map((rec, i) => (
                  <li key={i} className="font-mono text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold mt-0.5">&bull;</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Chat Prompt inside Audit Context */}
          <div className="border-t border-slate-900 pt-4 mt-6">
            <form onSubmit={handleSubmitQuestion} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask WiBox AI about this network's security..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isLoading || !customQuestion.trim()}
                className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Ask
              </button>
            </form>
            <p className="text-[9px] text-slate-500 font-mono mt-1.5">
              Ask custom diagnostic questions (e.g. "What kind of WPS attacks are dangerous here?", "How can I defend against deauth attacks?")
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <ShieldAlert className="w-12 h-12 text-slate-700 animate-pulse mb-3" />
          <h3 className="font-mono text-sm font-semibold text-slate-300">Ready for Audit</h3>
          <p className="text-xs text-slate-500 font-mono mt-1 max-w-xs">
            Trigger "Audit Network" above to send the structural config to WiBox AI for full risk diagnostics.
          </p>
        </div>
      )}
    </div>
  );
};
