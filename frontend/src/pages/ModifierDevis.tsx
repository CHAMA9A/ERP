import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, User, Hash, Calculator,
  Plus, Trash2, Truck, MessageSquare, ChevronDown, Receipt, Loader2, FileDown,
} from "lucide-react";
import { generateQuotePDF } from "@/lib/pdf-generator";

type LineItem = {
  id: number;
  qty: string;
  ref: string;
  designation: string;
  unitPrice: string;
};

type Client = { id: string; name: string | null; companyName: string | null };
type CatalogItem = { id: string; name: string; reference: string; unitPrice: string };

let nextId = 1000;
const emptyLine = (): LineItem => ({ id: nextId++, qty: "", ref: "", designation: "", unitPrice: "" });

const Section = ({ title, icon: Icon, children, noPad = false }: {
  title: string; icon: React.ElementType; children: React.ReactNode; noPad?: boolean;
}) => (
  <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]/60">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#5B3EFF]/10 to-[#9B51E0]/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#5B3EFF]" />
      </div>
      <h3 className="font-bold text-sm text-[#0F172A]">{title}</h3>
    </div>
    <div className={noPad ? "" : "p-6"}>{children}</div>
  </div>
);

const inputCls = "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#5B3EFF]/20 focus:border-[#5B3EFF]/40 transition-all placeholder:text-[#94A3B8]";

export default function ModifierDevis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [quoteNumber, setQuoteNumber] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientRef, setClientRef] = useState("");
  const [status, setStatus] = useState("draft");
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);
  const [tva, setTva] = useState("20");
  const [deliveryDelay, setDeliveryDelay] = useState("");
  const [shippingPoint, setShippingPoint] = useState("");
  const [shippingTerms, setShippingTerms] = useState("");
  const [seller, setSeller] = useState("");
  const [comments, setComments] = useState("");
  const [remarks, setRemarks] = useState("");

  const [clients, setClients] = useState<Client[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/catalog").then((r) => r.json()),
      fetch(`/api/quotes/${id}`).then((r) => r.json()),
    ])
      .then(([clientsData, catalogData, quoteData]) => {
        setClients(clientsData);
        setCatalog(catalogData);

          setQuoteNumber(quoteData.quoteNumber ?? "");
          setClientId(quoteData.clientId ?? "");
          setClientRef(quoteData.customerReference ?? quoteData.clientRef ?? "");
          setStatus(quoteData.status ?? "draft");
          setTva(String(quoteData.tvaRate ?? 20));
          setDeliveryDelay(quoteData.deliveryDelay ?? "");
          setShippingPoint(quoteData.shippingPoint ?? "");
          setShippingTerms(quoteData.shippingTerms ?? "");
          setSeller(quoteData.salesPerson ?? "");
          setComments(quoteData.comments ?? "");
          setRemarks(quoteData.remarks ?? "");

        if (quoteData.items?.length) {
          setLines(
            quoteData.items.map((item: any, i: number) => ({
              id: i + 1,
              qty: String(item.quantity ?? ""),
              ref: item.productRef ?? "",
              designation: item.description ?? item.designation ?? "",
              unitPrice: String(item.unitPrice ?? ""),
            }))
          );
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [id]);

  const updateLine = (lineId: number, field: keyof LineItem, value: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        const updated = { ...l, [field]: value };
        if (field === "ref") {
          const found = catalog.find((c) => c.reference === value || c.name === value);
          if (found) {
            updated.designation = found.name;
            updated.unitPrice = found.unitPrice ?? "0";
          }
        }
        return updated;
      })
    );
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (lineId: number) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== lineId) : prev));

  const totalHT = lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0), 0);
  const tvaRate = parseFloat(tva) || 0;
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const handleDownloadPDF = async () => {
    try {
      const [quoteRes, settingsRes] = await Promise.all([
        fetch(`/api/quotes/${id}`),
        fetch("/api/settings"),
      ]);
      const quoteData = await quoteRes.json();
      const settings = await settingsRes.json();
      const doc = await generateQuotePDF(quoteData, settings);
      doc.save(`Devis_${quoteNumber}.pdf`);
    } catch (e) {
      console.error("Erreur génération PDF", e);
    }
  };

  const handleSave = async () => {
    if (!clientId) { setError("Veuillez sélectionner un client."); return; }
    setSaving(true);
    setError("");
    try {
      const body = {
          quoteNumber,
          clientId,
          customerReference: clientRef,
          status,
          tvaRate: tva,
          totalHt: totalHT.toFixed(2),
          totalTva: totalTVA.toFixed(2),
          totalTtc: totalTTC.toFixed(2),
          total: totalTTC.toFixed(2),
          deliveryDelay,
          shippingPoint,
          shippingTerms,
          salesPerson: seller,
          comments,
          remarks,
          items: lines
          .filter((l) => l.designation || l.ref)
          .map((l) => ({
            productRef: l.ref,
            description: l.designation,
            quantity: parseFloat(l.qty) || 0,
            unitPrice: parseFloat(l.unitPrice) || 0,
            totalPrice: (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
            total: (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
          })),
      };

      const res = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la sauvegarde");
      }
      navigate("/devis");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-[#64748B] gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#5B3EFF]" />
        <span className="text-sm font-medium">Chargement du devis...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/devis"
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Modifier le devis <span className="text-[#5B3EFF]">{quoteNumber}</span>
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">Modifiez les informations et enregistrez.</p>
          </div>
        </div>
          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">{error}</p>}
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#64748B] px-4 py-2.5 rounded-2xl font-semibold text-sm hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-all shadow-sm"
            >
              <FileDown className="h-4 w-4" />
              Télécharger PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white px-6 py-2.5 rounded-2xl font-semibold text-sm hover:bg-[#4B2EEF] transition-all shadow-lg shadow-[#5B3EFF]/25 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT — 2/3 */}
        <div className="xl:col-span-2 space-y-6">

          {/* Client */}
          <Section title="Sélection du client" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Client entreprise *</label>
                <div className="relative">
                  <select
                    className={inputCls + " appearance-none pr-9 font-medium"}
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    <option value="">Sélectionner un client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">N° devis</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5B3EFF]/60" />
                  <input
                    className={inputCls + " pl-9 font-bold text-[#5B3EFF]"}
                    placeholder="DEV-2026-0001"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Référence client</label>
                <input className={inputCls} value={clientRef} onChange={(e) => setClientRef(e.target.value)} placeholder="Réf. commande client..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Statut</label>
                <div className="relative">
                  <select
                    className={inputCls + " appearance-none pr-9 font-medium"}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="draft">Brouillon</option>
                    <option value="pending">En attente</option>
                    <option value="validated">Validé</option>
                    <option value="rejected">Refusé</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
            </div>
          </Section>

          {/* Articles */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#5B3EFF]/10 to-[#9B51E0]/10 flex items-center justify-center shrink-0">
                  <Calculator className="h-4 w-4 text-[#5B3EFF]" />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A]">Articles & Services</h3>
              </div>
              <button
                onClick={addLine}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B3EFF] bg-[#5B3EFF]/10 hover:bg-[#5B3EFF] hover:text-white px-3 py-1.5 rounded-xl transition-all border border-[#5B3EFF]/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F8FAFC]">
                    <th className="px-5 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider w-20">Qté</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider w-48">Référence</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Désignation</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-right w-32">Prix U.</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-right w-32">Total</th>
                    <th className="px-5 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const lineTotal = (parseFloat(line.qty) || 0) * (parseFloat(line.unitPrice) || 0);
                    return (
                      <tr
                        key={line.id}
                        className={`group transition-colors hover:bg-[#F8FAFC] ${i !== lines.length - 1 ? "border-b border-slate-100" : ""}`}
                      >
                        <td className="px-5 py-3">
                          <input
                            type="number" min="0"
                            className="w-full bg-transparent text-center text-sm font-bold text-[#0F172A] outline-none"
                            placeholder="0"
                            value={line.qty}
                            onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            list={`refs-${line.id}`}
                            className="w-full bg-transparent text-sm font-mono text-[#5B3EFF] font-medium outline-none"
                            placeholder="Sélectionner..."
                            value={line.ref}
                            onChange={(e) => updateLine(line.id, "ref", e.target.value)}
                          />
                          <datalist id={`refs-${line.id}`}>
                            {catalog.map((c) => (
                              <option key={c.id} value={c.reference}>{c.name}</option>
                            ))}
                          </datalist>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            className="w-full bg-transparent text-sm text-[#0F172A] font-medium outline-none"
                            placeholder="Description..."
                            value={line.designation}
                            onChange={(e) => updateLine(line.id, "designation", e.target.value)}
                          />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number" min="0" step="0.01"
                              className="w-20 bg-transparent text-right text-sm font-bold text-[#0F172A] outline-none"
                              placeholder="0.00"
                              value={line.unitPrice}
                              onChange={(e) => updateLine(line.id, "unitPrice", e.target.value)}
                            />
                            <span className="text-xs text-[#94A3B8]">€</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-bold text-[#5B3EFF]">
                            {lineTotal > 0 ? fmt(lineTotal) : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => removeLine(line.id)}
                            className="h-7 w-7 rounded-xl flex items-center justify-center text-[#CBD5E1] hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT — 1/3 */}
        <div className="space-y-6">

          {/* Récapitulatif */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]/60">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#5B3EFF]/10 to-[#9B51E0]/10 flex items-center justify-center shrink-0">
                <Receipt className="h-4 w-4 text-[#5B3EFF]" />
              </div>
              <h3 className="font-bold text-sm text-[#0F172A]">Récapitulatif</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Total HT</span>
                  <span className="font-bold text-[#0F172A]">{fmt(totalHT)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <span>TVA</span>
                    <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-0.5">
                      <input
                        className="w-10 bg-transparent text-center text-xs font-bold text-[#5B3EFF] outline-none"
                        value={tva}
                        onChange={(e) => setTva(e.target.value)}
                      />
                      <span className="text-xs text-[#94A3B8]">%</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#0F172A]">{fmt(totalTVA)}</span>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="bg-gradient-to-br from-[#5B3EFF]/8 to-[#9B51E0]/8 rounded-2xl p-4 border border-[#5B3EFF]/10">
                <p className="text-[10px] text-[#5B3EFF]/70 uppercase font-bold tracking-[0.15em] mb-1">Total TTC</p>
                <p className="text-3xl font-black text-[#5B3EFF] tracking-tight">{fmt(totalTTC)}</p>
              </div>
            </div>
          </div>

          {/* Logistique */}
          <Section title="Logistique" icon={Truck}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Délai de livraison</label>
                <input className={inputCls} placeholder="Ex: 4 à 6 semaines" value={deliveryDelay} onChange={(e) => setDeliveryDelay(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Point d'expédition</label>
                <input className={inputCls} placeholder="Ex: Lyon" value={shippingPoint} onChange={(e) => setShippingPoint(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Conditions de livraison</label>
                <input className={inputCls} placeholder="Ex: Franco de port" value={shippingTerms} onChange={(e) => setShippingTerms(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Commercial</label>
                <input className={inputCls} placeholder="Nom du commercial" value={seller} onChange={(e) => setSeller(e.target.value)} />
              </div>
            </div>
          </Section>

          {/* Notes */}
          <Section title="Notes & Instructions" icon={MessageSquare}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Commentaires</label>
                <textarea
                  rows={3}
                  className={inputCls + " resize-none"}
                  placeholder="Instructions spéciales..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Remarques (bas de page)</label>
                <textarea
                  rows={3}
                  className={inputCls + " resize-none"}
                  placeholder="Remarques..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
