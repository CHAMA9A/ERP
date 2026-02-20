import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

function SpaceIllustration() {
  return (
    <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
      {/* Ground / hills */}
      <ellipse cx="120" cy="270" rx="110" ry="40" fill="#C8D8E8" opacity="0.6" />
      <ellipse cx="360" cy="275" rx="90" ry="35" fill="#B8CCE0" opacity="0.5" />
      <ellipse cx="240" cy="290" rx="200" ry="30" fill="#D0DFF0" opacity="0.4" />

      {/* Big cloud shape */}
      <ellipse cx="210" cy="190" rx="130" ry="70" fill="#DCE9F5" opacity="0.7" />
      <ellipse cx="160" cy="200" rx="70" ry="55" fill="#E4EEF8" opacity="0.6" />
      <ellipse cx="270" cy="195" rx="80" ry="50" fill="#E4EEF8" opacity="0.6" />

      {/* Planet large teal */}
      <circle cx="240" cy="155" r="28" fill="#4DC8C0" opacity="0.85" />
      <ellipse cx="240" cy="155" rx="38" ry="8" fill="none" stroke="#3BBAB2" strokeWidth="2.5" opacity="0.7" />

      {/* Planet small purple */}
      <circle cx="155" cy="115" r="14" fill="#A78BFA" opacity="0.8" />

      {/* Planet small green */}
      <circle cx="310" cy="200" r="10" fill="#6EE7B7" opacity="0.75" />

      {/* Moon / crescent */}
      <circle cx="80" cy="130" r="18" fill="#93C5FD" opacity="0.6" />
      <circle cx="88" cy="124" r="14" fill="#E4EEF8" opacity="0.85" />

      {/* Stars */}
      <polygon points="340,90 342,96 348,96 343,100 345,106 340,102 335,106 337,100 332,96 338,96" fill="#FCD34D" opacity="0.9" />
      <circle cx="390" cy="60" r="3" fill="#FCD34D" opacity="0.7" />
      <circle cx="60" cy="70" r="2" fill="#FCD34D" opacity="0.6" />
      <circle cx="420" cy="150" r="2.5" fill="#FCD34D" opacity="0.5" />

      {/* Dotted orbit lines */}
      <ellipse cx="240" cy="170" rx="95" ry="30" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 5" opacity="0.4" />

      {/* Small dots scattered */}
      <circle cx="300" cy="100" r="3" fill="#60A5FA" opacity="0.6" />
      <circle cx="170" cy="230" r="4" fill="#60A5FA" opacity="0.4" />
      <circle cx="360" cy="130" r="2.5" fill="#A78BFA" opacity="0.5" />

      {/* Rocket / small spaceship hint */}
      <rect x="232" y="230" width="16" height="24" rx="8" fill="#64748B" opacity="0.5" />
      <polygon points="240,218 234,230 246,230" fill="#94A3B8" opacity="0.6" />
      <rect x="229" y="248" width="5" height="8" rx="2" fill="#F97316" opacity="0.7" />
      <rect x="246" y="248" width="5" height="8" rx="2" fill="#F97316" opacity="0.7" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#EEF4FB" }}>
      {/* Left — Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center px-12">
        <div className="flex flex-col items-center gap-8 w-full max-w-lg">
          <SpaceIllustration />
          <p className="text-[#64748B] text-sm text-center max-w-xs leading-relaxed">
            Gérez vos clients, interventions et équipes depuis une seule plateforme.
          </p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex items-center justify-center w-full lg:w-[460px] lg:shrink-0 px-6 py-12">
        <div
          className="w-full max-w-sm bg-white rounded-2xl shadow-lg px-8 py-10"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
            >
              <span className="text-white font-extrabold text-2xl tracking-tight">R</span>
            </div>
            <h1 className="text-xl font-bold text-[#0F172A]">Bienvenue !</h1>
            <p className="text-[#94A3B8] text-sm mt-0.5">Connectez-vous à votre espace</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 rounded-lg px-4 py-2.5 text-sm mb-5 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                Adresse e-mail
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] placeholder-[#CBD5E1] text-sm bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[#E2E8F0] text-[#0F172A] placeholder-[#CBD5E1] text-sm bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

              {/* Remember */}
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E1] accent-blue-500"
                  />
                  <span className="text-sm text-[#64748B]">Se souvenir de moi</span>
                </label>
              </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-1 shadow-md"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)" }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#CBD5E1] mt-6">
            © {new Date().getFullYear()} RIZAT ERP — T-Link Opérateur
          </p>
        </div>
      </div>
    </div>
  );
}
