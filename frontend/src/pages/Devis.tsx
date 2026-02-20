import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search, FileText, Calendar,
  Pencil, FileDown, Trash2,
  TrendingUp, Clock, CheckCircle2, Loader2, Plus, ArrowUpRight, Eye, X,
} from "lucide-react";
import { generateQuotePDF } from "@/lib/pdf-generator";


interface Quote {
  id: string;
  quoteNumber: string;
  globalIndex: number | null;
  status: string;
  date: string | null;
  totalHt: string | null;
  client: { name: string | null; companyName: string | null; customId: number | null };
}

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  "pending":     { color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   dot: "bg-amber-400" },
  "En attente":  { color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   dot: "bg-amber-400" },
  "validated":   { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  "Validé":      { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  "draft":       { color: "text-slate-500",   bg: "bg-slate-50 border-slate-200",   dot: "bg-slate-400" },
  "Brouillon":   { color: "text-slate-500",   bg: "bg-slate-50 border-slate-200",   dot: "bg-slate-400" },
};

const statusLabel: Record<string, string> = {
  pending: "En attente", validated: "Validé", draft: "Brouillon",
};

function fmt(n: number | string | null) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR");
}

const Devis = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewBlobRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => { setQuotes(data); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const filtered = quotes.filter((d) => {
    const clientName = d.client?.companyName ?? d.client?.name ?? "";
    return (
      d.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const total = quotes.reduce((s, d) => s + Number(d.totalHt ?? 0), 0);
  const enAttente = quotes.filter((d) => d.status === "pending" || d.status === "En attente").length;
  const valides = quotes.filter((d) => d.status === "validated" || d.status === "Validé").length;

  async function handleDownloadPDF(id: string, quoteNumber: string) {
    try {
      const [quoteRes, settingsRes] = await Promise.all([
        fetch(`/api/quotes/${id}`),
        fetch("/api/settings"),
      ]);
      const quote = await quoteRes.json();
      const settings = await settingsRes.json();
      const doc = await generateQuotePDF(quote, settings);
      doc.save(`Devis_${quoteNumber}.pdf`);
    } catch (e) {
      console.error("Erreur génération PDF", e);
    }
  }

  async function handlePreviewPDF(id: string) {
    setPreviewLoading(true);
    try {
      const [quoteRes, settingsRes] = await Promise.all([
        fetch(`/api/quotes/${id}`),
        fetch("/api/settings"),
      ]);
      const quote = await quoteRes.json();
      const settings = await settingsRes.json();
      const doc = await generateQuotePDF(quote, settings);
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      if (previewBlobRef.current) URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = url;
      setPreviewUrl(url);
    } catch (e) {
      console.error("Erreur prévisualisation PDF", e);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewUrl(null);
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce devis ?")) return;
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Devis</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{quotes.length} devis au total</p>
        </div>
        <Link
          to="/devis/nouveau"
          state={{ fromDevis: true }}
          className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white text-sm font-semibold px-5 py-2.5 rounded-2xl hover:bg-[#4B2EEF] transition-all shadow-lg shadow-[#5B3EFF]/25"
        >
          <Plus className="h-4 w-4" />
          Nouveau devis
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total HT */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5B3EFF] to-[#9B51E0] rounded-[20px] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] p-6 hover:shadow-[0_20px_50px_rgba(91,62,255,0.12)] transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-1.5">Montant total HT</p>
                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight">{fmt(total)}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 text-[#10B981] ring-1 ring-white/50">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 w-fit">
              <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
              <span className="text-xs font-semibold text-[#10B981]">Total cumulé</span>
            </div>
          </div>
        </div>

        {/* En attente */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F59E0B] to-[#F97316] rounded-[20px] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] p-6 hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)] transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-1.5">En attente</p>
                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight">{enAttente}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 text-[#F59E0B] ring-1 ring-white/50">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-semibold text-[#F59E0B]">À traiter</span>
            </div>
          </div>
        </div>

        {/* Validés */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#5B3EFF] to-[#9B51E0] rounded-[20px] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] p-6 hover:shadow-[0_20px_50px_rgba(91,62,255,0.12)] transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#64748B] mb-1.5">Validés</p>
                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight">{valides}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#5B3EFF]/10 to-[#5B3EFF]/5 text-[#5B3EFF] ring-1 ring-white/50">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5B3EFF]/10 w-fit">
              <ArrowUpRight className="w-3 h-3 text-[#5B3EFF]" />
              <span className="text-xs font-semibold text-[#5B3EFF]">Confirmés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un devis..."
              className="pl-10 pr-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:ring-2 focus:ring-[#5B3EFF]/20 focus:border-[#5B3EFF]/40 transition-all w-72 text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-[#94A3B8] gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#5B3EFF]" />
              <span className="text-sm">Chargement des devis...</span>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-red-500 text-sm">{error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-[#F8FAFC]">
                  <th className="px-6 py-3.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Référence</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Montant HT</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#5B3EFF]/8 flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-[#5B3EFF]/40" />
                      </div>
                      <p className="text-[#94A3B8] text-sm font-medium">Aucun devis trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((d, i) => {
                    const stKey = d.status;
                    const st = statusConfig[stKey] ?? statusConfig["draft"];
                    const label = statusLabel[stKey] ?? stKey;
                    return (
                      <tr
                        key={d.id}
                        className={`group transition-colors hover:bg-[#F8FAFC] ${i !== filtered.length - 1 ? "border-b border-slate-100" : ""}`}
                      >
                        {/* Référence */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#5B3EFF]/10 to-[#9B51E0]/10 flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-[#5B3EFF]" />
                            </div>
                            <span className="font-bold text-[#0F172A] text-sm">{d.quoteNumber}</span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[#0F172A]">{d.client?.companyName ?? d.client?.name ?? "—"}</p>
                          {d.client?.customId && (
                            <p className="text-xs text-[#94A3B8] mt-0.5">Réf. {d.client.customId}</p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                            <Calendar className="h-3.5 w-3.5 text-[#5B3EFF]/50" />
                            {fmtDate(d.date)}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${st.bg} ${st.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {label}
                          </span>
                        </td>

                        {/* Montant */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-[#0F172A]">{fmt(d.totalHt)}</span>
                        </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <Link
                                to={`/devis/${d.id}/modifier`}
                                className="h-8 w-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-[#5B3EFF] hover:bg-[#5B3EFF]/10 transition-all"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                onClick={() => handlePreviewPDF(d.id)}
                                className="h-8 w-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-violet-600 hover:bg-violet-50 transition-all"
                                title="Prévisualiser PDF"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                                <button
                                  onClick={() => handleDownloadPDF(d.id, d.quoteNumber)}
                                  className="h-8 w-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-sky-600 hover:bg-sky-50 transition-all"
                                  title="Télécharger PDF"
                                >
                                  <FileDown className="h-3.5 w-3.5" />
                                </button>
                              <button
                                onClick={() => handleDelete(d.id)}
                                className="h-8 w-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-[#F8FAFC]/60 flex items-center justify-between">
            <p className="text-xs text-[#94A3B8] font-medium">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</p>
            <p className="text-xs text-[#94A3B8] font-medium">Page 1 sur 1</p>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {(previewUrl || previewLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-[90vw] max-w-4xl h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
              <span className="text-sm font-semibold text-[#0F172A]">Prévisualisation du devis</span>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download="Devis.pdf"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#5B3EFF] text-white px-3.5 py-1.5 rounded-xl hover:bg-[#4B2EEF] transition-all"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Télécharger
                  </a>
                )}
                <button
                  onClick={closePreview}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden rounded-b-2xl">
              {previewLoading ? (
                <div className="flex items-center justify-center h-full gap-3 text-[#94A3B8]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5B3EFF]" />
                  <span className="text-sm">Génération du PDF...</span>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full rounded-b-2xl"
                  title="Prévisualisation PDF"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devis;
