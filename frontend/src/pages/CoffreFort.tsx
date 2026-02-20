import { useState } from "react";
import { Lock, ExternalLink, X, ArrowRight, Shield } from "lucide-react";

const COFFRE_URL = "https://coffre.tlinkoperateur.fr/credentials";

const CoffreFort = () => {
  const [opened, setOpened] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (opened) {
    return (
      <div className="flex flex-col w-full h-full min-h-[calc(100vh-4rem)] -m-6 lg:-m-8">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-white/40 shrink-0">
          <div className="flex items-center gap-2 flex-1 bg-white/60 rounded-xl px-3 py-2 border border-white/40">
            <Lock className="w-4 h-4 text-[#5B3EFF] shrink-0" />
            <span className="text-[#64748B] text-sm truncate">{COFFRE_URL}</span>
          </div>
          <a
            href={COFFRE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 text-[#64748B] text-xs font-medium transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ouvrir dans un onglet
          </a>
          <button
            onClick={() => setOpened(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 text-xs font-medium transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Fermer
          </button>
        </div>

        {/* iframe */}
        <iframe
          src={COFFRE_URL}
          className="flex-1 w-full border-none"
          title="Coffre-Fort"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-12rem)]">
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className={`absolute rounded-full border border-[#5B3EFF]/10 transition-all duration-700 ${hovered ? "w-[500px] h-[500px]" : "w-[300px] h-[300px]"}`} />
        <div className={`absolute rounded-full border border-[#5B3EFF]/08 transition-all duration-700 delay-75 ${hovered ? "w-[650px] h-[650px]" : "w-[420px] h-[420px]"}`} />
        <div className={`absolute rounded-full border border-[#5B3EFF]/06 transition-all duration-700 delay-150 ${hovered ? "w-[800px] h-[800px]" : "w-[540px] h-[540px]"}`} />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <div className="glass-card rounded-[24px] p-10 flex flex-col items-center gap-6 max-w-sm w-full text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B3EFF] to-[#9B51E0] flex items-center justify-center shadow-lg shadow-[#5B3EFF]/30">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1">Coffre-Fort</h2>
            <p className="text-sm text-[#64748B]">Accès sécurisé à vos identifiants</p>
          </div>

          <button
            onClick={() => setOpened(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-xl font-semibold text-white text-base overflow-hidden transition-all duration-200 active:scale-95 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #5B3EFF 0%, #9B51E0 100%)",
              boxShadow: hovered
                ? "0 8px 30px rgba(91,62,255,0.5)"
                : "0 4px 14px rgba(91,62,255,0.3)",
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
              }}
            />
            <Lock className={`w-5 h-5 relative transition-transform duration-500 ${hovered ? "-translate-y-0.5" : ""}`} />
            <span className="relative">Ouvrir le site sécurisé</span>
            <ArrowRight className={`w-4 h-4 relative transition-transform duration-300 ${hovered ? "translate-x-1" : ""}`} />
          </button>

          <p className="text-[#64748B] text-xs">
            coffre.tlinkoperateur.fr
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoffreFort;
