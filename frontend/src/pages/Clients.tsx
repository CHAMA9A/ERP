import { useState, useEffect, useRef } from "react";
import { Building2, Mail, Phone, MapPin, Plus, Search, Pen, Trash2, Users, TrendingUp, Star, Loader2, X, Save, User, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";

interface Client {
  id: string;
  name: string | null;
  customId: number | null;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  _count?: { quotes: number };
}

const emptyForm = {
  companyName: "",
  customId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<Record<string, string>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => { setClients(data); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const displayName = c.companyName ?? c.name ?? "";
    return (
      displayName.toLowerCase().includes(q) ||
      (c.firstName ?? "").toLowerCase().includes(q) ||
      (c.lastName ?? "").toLowerCase().includes(q) ||
      String(c.customId ?? "").includes(q)
    );
  });

  function openModal() {
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError(null);
  }

  // ── Import helpers ──
  function openImport() {
    setImportRows([]);
    setImportError(null);
    setImportResult(null);
    setShowImport(true);
  }

  function closeImport() {
    setShowImport(false);
  }

  function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    // support ; or ,
    const sep = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
    return lines.slice(1).map((line) => {
      const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });
      return row;
    }).filter((row) => Object.values(row).some((v) => v));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target?.result as string);
        if (rows.length === 0) {
          setImportError("Aucune donnée trouvée. Vérifiez le format du fichier.");
          setImportRows([]);
        } else {
          setImportError(null);
          setImportRows(rows);
        }
      } catch {
        setImportError("Impossible de lire le fichier.");
      }
    };
    reader.readAsText(file, "utf-8");
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  function mapRow(row: Record<string, string>) {
    // flexible column names
    const get = (...keys: string[]) => keys.map((k) => row[k] ?? row[k.toLowerCase()] ?? "").find(Boolean) ?? "";
    return {
      companyName: get("companyname", "company", "entreprise", "nom entreprise", "société") || undefined,
      customId: get("customid", "id client", "identifiant", "client id") ? Number(get("customid", "id client", "identifiant", "client id")) : undefined,
      firstName: get("firstname", "prénom", "prenom") || undefined,
      lastName: get("lastname", "nom", "name") || undefined,
      email: get("email", "mail", "e-mail") || undefined,
      phone: get("phone", "téléphone", "telephone", "tel") || undefined,
      address: get("address", "adresse") || undefined,
    };
  }

  async function handleImport() {
    if (!importRows.length) return;
    setImporting(true);
    setImportError(null);
    let ok = 0;
    let errors = 0;
    const created: Client[] = [];
    for (const row of importRows) {
      const payload = mapRow(row);
      if (!payload.companyName && !payload.lastName) { errors++; continue; }
      try {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { errors++; continue; }
        created.push(await res.json());
        ok++;
      } catch { errors++; }
    }
    setClients((prev) => [...created, ...prev]);
    setImportResult({ ok, errors });
    setImporting(false);
    setImportRows([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.companyName.trim()) {
      setFormError("Le nom de l'entreprise est obligatoire.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          customId: form.customId ? Number(form.customId) : undefined,
          firstName: form.firstName.trim() || undefined,
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const created: Client = await res.json();
      setClients((prev) => [created, ...prev]);
      closeModal();
    } catch (err) {
      setFormError("Impossible de créer le client. Vérifiez votre connexion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">

        {/* ── KPI bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, color: "primary", label: "Total clients", value: clients.length },
            { icon: TrendingUp, color: "emerald", label: "Avec devis", value: clients.filter((c) => (c._count?.quotes ?? 0) > 0).length },
            { icon: Star, color: "amber", label: "Clients fidèles", value: clients.filter((c) => (c._count?.quotes ?? 0) >= 2).length },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[20px] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl ${color === "primary" ? "bg-primary/10" : color === "emerald" ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                <Icon className={`w-5 h-5 ${color === "primary" ? "text-primary" : color === "emerald" ? "text-emerald-500" : "text-amber-500"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Header + search ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-[20px] border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des Clients</h2>
            <p className="text-muted-foreground mt-1 text-sm">Gérez votre base de données clients B2B.</p>
          </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#F8FAFC] border border-slate-200 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 outline-none transition-all"
                />
              </div>
              <button
                onClick={openImport}
                className="border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                Importer
              </button>
              <button
                onClick={openModal}
                className="bg-gradient-to-r from-[#5B3EFF] to-[#7C5CFF] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                Nouveau Client
              </button>
            </div>
        </div>

        {/* ── States ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span>Chargement des clients...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <p className="font-medium">Erreur : {error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((client) => (
              <ClientCard key={client.id} client={client} onDelete={() => setClients(prev => prev.filter(c => c.id !== client.id))} />
            ))}
          </div>
          )}
        </div>

        {/* ── Modal Nouveau Client ── */}
        {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal */}
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#F8FAFC]/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B3EFF] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-primary/30">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Nouveau client</h2>
                  <p className="text-xs text-slate-400">Remplissez les informations du client</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 space-y-4">

              {/* Erreur */}
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                  {formError}
                </div>
              )}

              {/* Entreprise + ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">
                    Nom de l'entreprise <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Ex: Acme Corp"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">
                    Identifiant Client
                  </label>
                  <input
                    type="number"
                    value={form.customId}
                    onChange={(e) => setForm({ ...form, customId: e.target.value })}
                    placeholder="Ex: 1001"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Prénom + Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">Prénom</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Jean"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">Nom</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Dupont"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Email + Téléphone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jean@acme.com"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5">Adresse</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="12 rue de la Paix, 75001 Paris"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all resize-none placeholder:text-slate-300"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#5B3EFF] to-[#7C5CFF] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
          )}

        {/* ── Modal Import CSV ── */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeImport} />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#F8FAFC]/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Importer des clients</h2>
                  <p className="text-xs text-slate-400">Fichier CSV avec séparateur , ou ;</p>
                </div>
              </div>
              <button onClick={closeImport} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7 space-y-5">

              {/* Colonnes attendues */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed">
                <p className="font-semibold text-slate-600 mb-1">Colonnes reconnues (en-têtes) :</p>
                <p>
                  <span className="font-mono bg-white border border-slate-200 px-1 rounded">entreprise</span>{" "}
                  <span className="font-mono bg-white border border-slate-200 px-1 rounded">id client</span>{" "}
                  <span className="font-mono bg-white border border-slate-200 px-1 rounded">prénom</span>{" "}
                  <span className="font-mono bg-white border border-slate-200 px-1 rounded">nom</span>{" "}
                  <span className="font-mono bg-white border border-slate-200 px-1 rounded">email</span>{" "}
                  <span className="font-mono bg-white border border-slate-200 px-1 rounded">téléphone</span>{" "}
                  <span className="font-mono bg-white border border-slate-200 px-1 rounded">adresse</span>
                </p>
                <p className="mt-1 text-slate-400">Les noms anglais sont aussi acceptés (company, firstname, phone, address…)</p>
              </div>

              {/* Zone de drop */}
              <div
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                <p className="text-sm font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">
                  Cliquez pour sélectionner un fichier CSV
                </p>
                <p className="text-xs text-slate-400 mt-1">ou glissez-déposez votre fichier ici</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Erreur */}
              {importError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {importError}
                </div>
              )}

              {/* Résultat import */}
              {importResult && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>{importResult.ok}</strong> client{importResult.ok > 1 ? "s" : ""} importé{importResult.ok > 1 ? "s" : ""} avec succès
                    {importResult.errors > 0 && <span className="text-red-500 ml-2">({importResult.errors} erreur{importResult.errors > 1 ? "s" : ""})</span>}
                  </span>
                </div>
              )}

              {/* Aperçu lignes */}
              {importRows.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    {importRows.length} ligne{importRows.length > 1 ? "s" : ""} détectée{importRows.length > 1 ? "s" : ""} — aperçu
                  </div>
                  <div className="overflow-x-auto max-h-40 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 sticky top-0">
                        <tr>
                          {Object.keys(importRows[0]).map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            {Object.values(row).map((v, j) => (
                              <td key={j} className="px-3 py-1.5 text-slate-600 whitespace-nowrap max-w-[160px] truncate">{v || "—"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importRows.length > 5 && (
                      <p className="text-xs text-center py-2 text-slate-400">+ {importRows.length - 5} ligne{importRows.length - 5 > 1 ? "s" : ""} supplémentaire{importRows.length - 5 > 1 ? "s" : ""}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeImport}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  {importResult ? "Fermer" : "Annuler"}
                </button>
                {importRows.length > 0 && !importResult && (
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {importing ? "Importation..." : `Importer ${importRows.length} client${importRows.length > 1 ? "s" : ""}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, onDelete }: { client: Client; onDelete: () => void }) {
  const displayName = client.companyName ?? client.name ?? "Client sans nom";
  const contact = [client.firstName, client.lastName].filter(Boolean).join(" ") || "—";

  async function handleDelete() {
    if (!confirm(`Supprimer le client "${displayName}" ?`)) return;
    await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[20px] border border-slate-100 p-6 hover:shadow-xl transition-all group flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex gap-1">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
              <Pen className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1">{displayName}</h3>
        {client.customId && (
          <p className="text-primary font-semibold text-xs mb-2 bg-primary/8 inline-block px-2.5 py-1 rounded-lg border border-primary/15">
            ID: {client.customId}
          </p>
        )}
        <p className="text-muted-foreground font-medium text-sm mb-4">{contact}</p>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{client.email ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            {client.phone ?? "—"}
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2 whitespace-pre-line">{client.address ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <button className="flex-1 py-2 rounded-xl border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/5 transition-all">
          Voir les devis →
        </button>
        {(client._count?.quotes ?? 0) > 0 && (
          <span className="ml-3 text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-xl">
            {client._count!.quotes} devis
          </span>
        )}
      </div>
    </div>
  );
}
