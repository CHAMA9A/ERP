import React, { useState, useEffect } from "react";
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, User, Hash, Calculator,
  Plus, Trash2, Truck, MessageSquare, ChevronDown, Receipt,
} from "lucide-react";

type LineItem = {
  id: number;
  qty: string;
  ref: string;
  designation: string;
  unitPrice: string;
};

type Client = {
  id: string;
  name: string;
  companyName: string | null;
};

type CatalogItem = {
  id: string;
  name: string;
  reference: string;
  unitPrice: string;
};

let nextId = 2;
const emptyLine = (): LineItem => ({ id: nextId++, qty: "", ref: "", designation: "", unitPrice: "" });

const Section = ({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) => (
  <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]/60">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#5B3EFF]/10 to-[#9B51E0]/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#5B3EFF]" />
      </div>
      <h3 className="font-bold text-sm text-[#0F172A]">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const inputCls = "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#5B3EFF]/20 focus:border-[#5B3EFF]/40 transition-all placeholder:text-[#94A3B8]";

export default function NouveauDevis() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state?.fromDevis) {
    return <Navigate to="/devis" replace />;
  }

  const [clients, setClients] = useState<Client[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [nextIndex, setNextIndex] = useState(100);
  const [clientId, setClientId] = useState("");
  const [clientRef, setClientRef] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { id: 1, qty: "", ref: "", designation: "", unitPrice: "" },
  ]);
  const [tva, setTva] = useState("20");
  const [deliveryDelay, setDeliveryDelay] = useState("");
  const [shippingPoint, setShippingPoint] = useState("");
  const [shippingTerms, setShippingTerms] = useState("");
  const [seller, setSeller] = useState("");
  const [comments, setComments] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients).catch(console.error);
    fetch("/api/catalog").then((r) => r.json()).then(setCatalog).catch(console.error);
    fetch("/api/settings").then((r) => r.json()).then((s) => {
      if (s.defaultTva) setTva(String(s.defaultTva));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const url = clientId
      ? `/api/quotes/next-number?clientId=${clientId}`
      : "/api/quotes/next-number";
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setQuoteNumber(d.number); setNextIndex(d.index); })
      .catch(console.error);
  }, [clientId]);

  const updateLine = (id: number, field: keyof LineItem, value: string) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        if (field === "ref") {
          const found = catalog.find((c) => c.reference === value || c.name === value);
          if (found) {
            updated.designation = found.name;
            updated.unitPrice = found.unitPrice;
          }
        }
        return updated;
      })
    );
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (id: number) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));

  const totalHT = lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0), 0);
  const tvaRate = parseFloat(tva) || 0;
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const handleSave = async () => {
    if (!clientId) { setError("Veuillez sélectionner un client."); return; }
    setSaving(true);
    setError("");
    try {
      const items = lines
        .filter((l) => l.designation || l.ref)
        .map((l) => ({
          productRef: l.ref,
          description: l.designation,
          quantity: parseFloat(l.qty) || 0,
          unitPrice: parseFloat(l.unitPrice) || 0,
          totalPrice: (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
          total: (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
        }));

      const payload = {
        quoteNumber,
        clientId,
        customerReference: clientRef,
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
        globalIndex: nextIndex,
        status: "draft",
        items,
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur serveur");
      }

      navigate("/devis");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Nouveau devis</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Configurez les articles et les détails du devis.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">{error}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white px-6 py-2.5 rounded-2xl font-semibold text-sm hover:bg-[#4B2EEF] transition-all shadow-lg shadow-[#5B3EFF]/25 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Générer le devis"}
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
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Référence client</label>
                <input
                  className={inputCls}
                  value={clientRef}
                  onChange={(e) => setClientRef(e.target.value)}
                  placeholder="Réf. commande client..."
                />
              </div>
            </div>
          </Section>

          {/* Articles */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[20px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden">

            {/* Section header */}
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]/60">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#5B3EFF]/10 to-[#9B51E0]/10 flex items-center justify-center shrink-0">
                <Calculator className="h-4 w-4 text-[#5B3EFF]" />
              </div>
              <h3 className="font-bold text-sm text-[#0F172A]">Articles & Services</h3>
              <span className="ml-auto text-xs text-[#94A3B8] font-medium">{lines.length} ligne{lines.length > 1 ? "s" : ""}</span>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[28px_56px_150px_1fr_110px_104px_32px] gap-2 px-5 py-2.5 border-b border-slate-100 bg-[#F8FAFC]">
              <div />
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-center">Qté</span>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Référence</span>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Désignation</span>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Prix U. HT</span>
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Total HT</span>
              <div />
            </div>

            {/* Lines */}
            <div className="divide-y divide-slate-100">
              {lines.map((line, i) => {
                const lineTotal = (parseFloat(line.qty) || 0) * (parseFloat(line.unitPrice) || 0);
                return (
                  <div
                    key={line.id}
                    className="group grid grid-cols-[28px_56px_150px_1fr_110px_104px_32px] gap-2 items-center px-5 py-3 hover:bg-[#F8FAFC]/70 transition-colors"
                  >
                    {/* Line number */}
                    <span className="text-[10px] font-bold text-[#CBD5E1] text-center select-none">{i + 1}</span>

                    {/* Qty */}
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-transparent bg-[#F1F5F9] hover:border-[#E2E8F0] focus:border-[#5B3EFF]/40 focus:bg-white text-center text-sm font-bold text-[#0F172A] outline-none px-1 py-1.5 transition-all"
                      placeholder="0"
                      value={line.qty}
                      onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                    />

                    {/* Ref */}
                    <div className="relative">
                      <input
                        list={`refs-${line.id}`}
                        className="w-full rounded-lg border border-transparent bg-[#F1F5F9] hover:border-[#E2E8F0] focus:border-[#5B3EFF]/40 focus:bg-white text-xs font-mono text-[#5B3EFF] font-semibold outline-none px-2.5 py-1.5 transition-all"
                        placeholder="Réf..."
                        value={line.ref}
                        onChange={(e) => updateLine(line.id, "ref", e.target.value)}
                      />
                      <datalist id={`refs-${line.id}`}>
                        {catalog.map((c) => (
                          <option key={c.id} value={c.reference}>{c.name}</option>
                        ))}
                      </datalist>
                    </div>

                    {/* Designation */}
                    <input
                      className="w-full rounded-lg border border-transparent bg-[#F1F5F9] hover:border-[#E2E8F0] focus:border-[#5B3EFF]/40 focus:bg-white text-sm text-[#0F172A] font-medium outline-none px-2.5 py-1.5 transition-all"
                      placeholder="Description du produit ou service..."
                      value={line.designation}
                      onChange={(e) => updateLine(line.id, "designation", e.target.value)}
                    />

                    {/* Unit price */}
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-transparent bg-[#F1F5F9] hover:border-[#E2E8F0] focus:border-[#5B3EFF]/40 focus:bg-white text-right text-sm font-bold text-[#0F172A] outline-none pl-2 pr-6 py-1.5 transition-all"
                        placeholder="0.00"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(line.id, "unitPrice", e.target.value)}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#94A3B8] pointer-events-none">€</span>
                    </div>

                    {/* Total */}
                    <div className={`text-right px-2 py-1 rounded-lg text-sm font-bold transition-all ${lineTotal > 0 ? "text-[#5B3EFF] bg-[#5B3EFF]/6" : "text-[#CBD5E1]"}`}>
                      {lineTotal > 0 ? fmt(lineTotal) : "—"}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeLine(line.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-[#CBD5E1] hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer — add line */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-[#F8FAFC]/40">
              <button
                onClick={addLine}
                className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#5B3EFF] transition-colors group"
              >
                <div className="h-5 w-5 rounded-md border-2 border-dashed border-[#CBD5E1] group-hover:border-[#5B3EFF] flex items-center justify-center transition-colors">
                  <Plus className="h-3 w-3" />
                </div>
                Ajouter une ligne
              </button>
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
