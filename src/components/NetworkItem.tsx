import React from "react";
import { WifiNetwork } from "../types";
import { Wifi, WifiLow, Shield, ShieldCheck, ShieldAlert, Cpu, AlertTriangle, Radio } from "lucide-react";

interface NetworkItemProps {
  network: WifiNetwork;
  isSelected: boolean;
  onSelect: () => void;
  onAudit: () => void;
}

export const NetworkItem: React.FC<NetworkItemProps> = ({
  network,
  isSelected,
  onSelect,
  onAudit,
}) => {
  const getSignalIcon = (strength: number) => {
    if (strength >= -50) return <Wifi className="w-5 h-5 text-emerald-400" />;
    if (strength >= -70) return <Wifi className="w-5 h-5 text-yellow-400" />;
    return <WifiLow className="w-5 h-5 text-rose-400" />;
  };

  const getSecurityBadge = (type: string) => {
    switch (type) {
      case "WPA3":
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> WPA3
          </span>
        );
      case "WPA2-PSK":
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-500/30">
            <Shield className="w-3 h-3" /> WPA2-PSK
          </span>
        );
      case "WPS-WPA2":
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-yellow-950/80 text-yellow-400 border border-yellow-500/30">
            <Cpu className="w-3 h-3" /> WPS/WPA2
          </span>
        );
      case "WEP":
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> WEP (WEAK)
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-500/20">
            <AlertTriangle className="w-3 h-3" /> OPEN (UNSAFE)
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "bg-slate-900 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          : "bg-slate-950/80 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex items-center justify-center p-2 rounded bg-slate-900 border border-slate-800">
          {getSignalIcon(network.signalStrength)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-mono text-sm font-semibold text-slate-100 group-hover:text-white transition-colors break-all">
              {network.ssid}
            </h4>
            {network.isCustom && (
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                CUSTOM
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 font-mono">
            <span>BSSID: <span className="text-slate-300">{network.bssid}</span></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3" /> {network.frequency} GHz (Ch {network.channel})
            </span>
            {network.manufacturer && (
              <>
                <span>•</span>
                <span className="text-slate-400 max-w-[120px] truncate">{network.manufacturer}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 sm:mt-0 justify-end">
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-xs font-mono text-slate-300">
            {network.signalStrength} dBm
          </div>
          {getSecurityBadge(network.securityType)}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAudit();
          }}
          className="px-3 py-1.5 text-xs font-mono rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95"
        >
          Audit Network
        </button>
      </div>
    </div>
  );
};
