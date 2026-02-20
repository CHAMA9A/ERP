import React, { useState, useEffect, useRef } from "react";
import {
  Save, Building2, Phone, Mail, MapPin, Percent, Hash,
  CreditCard, FileText, Image as ImageIcon, Loader2, CheckCircle2,
  AlertCircle, User, Lock, Bell, ChevronRight, FileSignature,
  Plus, Pencil, Trash2, Users, Activity, X, ChevronUp, ChevronDown,
  Search, Filter, RotateCcw,
} from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#5B3EFF]/20 focus:border-[#5B3EFF]/40 transition-all placeholder:text-[#94A3B8]";

const Section = ({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
    <div className="px-6 py-5 border-b border-[#F1F5F9]">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0">
          <Icon className="h-4.5 w-4.5 text-[#5B3EFF]" style={{ height: 18, width: 18 }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-[#0F172A]">{title}</h3>
          {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-[#94A3B8]">{hint}</p>}
  </div>
);

/* ──────────────────────── TABS ──────────────────────── */

const TABS = [
  { id: "general", label: "Général", icon: User },
  { id: "entreprise", label: "Entreprise", icon: Building2 },
  { id: "devis", label: "Devis", icon: FileSignature },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "securite", label: "Sécurité", icon: Lock },
];

/* ──────────────────────── DEVIS TAB ──────────────────────── */

function DevisTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [defaultTva, setDefaultTva] = useState("20");
  const [siren, setSiren] = useState("");
  const [tvaNumber, setTvaNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [legalNotesDefault, setLegalNotesDefault] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setName(s.name ?? "");
        setAddress(s.address ?? "");
        setPhone(s.phone ?? "");
        setEmail(s.email ?? "");
        setLogoUrl(s.logoUrl ?? "");
        setLogoPreview(s.logoUrl ?? "");
        setDefaultTva(s.defaultTva ? String(s.defaultTva) : "20");
        setSiren(s.siren ?? "");
        setTvaNumber(s.tvaNumber ?? "");
        setPaymentMethod(s.paymentMethod ?? "");
        setLegalNotesDefault(s.legalNotesDefault ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setLogoUrl(b64);
      setLogoPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, address, phone, email, logoUrl,
          defaultTva, siren, tvaNumber, paymentMethod, legalNotesDefault,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la sauvegarde");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin text-[#5B3EFF]" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Logo */}
      <Section title="Logo de l'entreprise" subtitle="Apparaît en haut à droite de chaque devis PDF" icon={ImageIcon}>
        <div className="flex items-center gap-6">
          <div className="h-20 w-44 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <span className="text-xs text-[#94A3B8]">Aucun logo</span>
            )}
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#64748B] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#F8FAFC] hover:border-[#5B3EFF]/40 transition-all"
            >
              <ImageIcon className="h-4 w-4" />
              Choisir une image
            </button>
            <p className="text-[11px] text-[#94A3B8]">PNG, JPG, WEBP — recommandé 200×80px</p>
            {logoPreview && (
              <button
                onClick={() => { setLogoUrl(""); setLogoPreview(""); }}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Infos société */}
      <Section title="Informations de l'entreprise" subtitle="Affichées dans l'en-tête du devis" icon={Building2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Nom commercial">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input className={inputCls + " pl-9"} placeholder="Ex: T-LINK NETWORK OPERATEUR" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Adresse du siège social">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input className={inputCls + " pl-9"} placeholder="6 Bd des Monts d'Or, 69580 Sathonay camp" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </Field>
          </div>
          <Field label="Téléphone">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input className={inputCls + " pl-9"} placeholder="04 26 78 75 35" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </Field>
          <Field label="Email professionnel">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input className={inputCls + " pl-9"} type="email" placeholder="contact@entreprise.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </Field>
        </div>
      </Section>

      {/* Fiscal */}
      <Section title="Informations fiscales & paiement" subtitle="Utilisées dans le pied de page du devis" icon={CreditCard}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="TVA par défaut (%)" hint="Pré-remplie à la création d'un nouveau devis">
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input className={inputCls + " pl-9"} type="number" placeholder="20" value={defaultTva} onChange={(e) => setDefaultTva(e.target.value)} />
            </div>
          </Field>
          <Field label="SIREN">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input className={inputCls + " pl-9"} placeholder="123 456 789" value={siren} onChange={(e) => setSiren(e.target.value)} />
            </div>
          </Field>
          <Field label="N° TVA intracommunautaire">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input className={inputCls + " pl-9"} placeholder="FR12345678901" value={tvaNumber} onChange={(e) => setTvaNumber(e.target.value)} />
            </div>
          </Field>
          <Field label="Méthode de paiement">
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input className={inputCls + " pl-9"} placeholder="Virement bancaire 30 jours" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
            </div>
          </Field>
        </div>
      </Section>

      {/* Mentions légales */}
      <Section title="Mentions légales / Pied de page PDF" subtitle="Texte affiché en bas de chaque devis téléchargé" icon={FileText}>
        <Field label="Mentions légales">
          <textarea
            rows={3}
            className={inputCls + " resize-none"}
            placeholder="Ex: TVA non applicable, art. 293 B du CGI — RCS Lyon — Capital social : 10 000 €"
            value={legalNotesDefault}
            onChange={(e) => setLegalNotesDefault(e.target.value)}
          />
        </Field>
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-1.5 text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Paramètres enregistrés
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#4B2EEF] transition-all shadow-md shadow-[#5B3EFF]/25 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────── PLACEHOLDER TABS ──────────────────────── */

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
      <div className="h-12 w-12 rounded-2xl bg-[#F0EEFF] flex items-center justify-center">
        <ChevronRight className="h-5 w-5 text-[#5B3EFF]" />
      </div>
      <p className="font-semibold text-[#0F172A]">{label}</p>
      <p className="text-sm text-[#94A3B8]">Cette section sera disponible prochainement.</p>
    </div>
  );
}

/* ──────────────────────── GENERAL (USERS) TAB ──────────────────────── */

type UserRole = "admin" | "commercial" | "technicien" | "readonly";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  commercial: "Commercial",
  technicien: "Technicien",
  readonly: "Lecture seule",
};

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-[#F0EEFF] text-[#5B3EFF]",
  commercial: "bg-[#E0F2FE] text-[#0EA5E9]",
  technicien: "bg-[#FEF3C7] text-[#F59E0B]",
  readonly: "bg-[#F1F5F9] text-[#64748B]",
};

const AVATAR_COLORS = [
  "bg-[#5B3EFF]", "bg-[#0EA5E9]", "bg-[#F59E0B]",
  "bg-[#10B981]", "bg-[#EF4444]", "bg-[#8B5CF6]",
];

const LOG_MODULE_STYLES: Record<string, string> = {
  creation: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  modification: "bg-blue-50 text-blue-700 border border-blue-100",
  suppression: "bg-red-50 text-red-700 border border-red-100",
  connexion: "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]",
};

function getActionType(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("créé") || a.includes("crée") || a.includes("ajouté")) return "creation";
  if (a.includes("modifié") || a.includes("modifie") || a.includes("mise à jour")) return "modification";
  if (a.includes("supprimé") || a.includes("supprime") || a.includes("deleted")) return "suppression";
  return "connexion";
}

function UserAvatar({ name, idx }: { name: string; idx: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const bg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div className={`h-9 w-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials || "?"}
    </div>
  );
}

interface UserData {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

interface LogData {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  module?: string;
  createdAt: string;
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "", role: "commercial" as UserRole, status: "active" };

type SortField = "date" | "action" | "user";
type SortDir = "asc" | "desc";

function GeneralTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Journal filters & sort
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [deleteLogConfirm, setDeleteLogConfirm] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  const loadUsers = async () => {
    try {
      const u = await fetch("/api/users").then((r) => r.json());
      setUsers(Array.isArray(u) ? u : []);
    } catch (e) { console.error(e); }
  };

  const loadLogs = async (sb = sortBy, sd = sortDir, fu = filterUser, fa = filterAction) => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ sortBy: sb, sortDir: sd });
      if (fu) params.set("filterUser", fu);
      if (fa) params.set("filterAction", fa);
      const l = await fetch(`/api/activity-log?${params}`).then((r) => r.json());
      setLogs(Array.isArray(l) ? l : []);
    } catch (e) { console.error(e); } finally { setLogsLoading(false); }
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([loadUsers(), loadLogs()]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSort = (field: SortField) => {
    const newDir: SortDir = sortBy === field && sortDir === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortDir(newDir);
    loadLogs(field, newDir, filterUser, filterAction);
  };

  const handleFilter = () => loadLogs(sortBy, sortDir, filterUser, filterAction);

  const resetFilters = () => {
    setFilterUser("");
    setFilterAction("");
    setSortBy("date");
    setSortDir("desc");
    loadLogs("date", "desc", "", "");
  };

  const handleDeleteLog = async (id: string) => {
    await fetch(`/api/activity-log/${id}`, { method: "DELETE" });
    setDeleteLogConfirm(null);
    loadLogs();
  };

  const handleClearAll = async () => {
    await fetch("/api/activity-log", { method: "DELETE" });
    setClearAllConfirm(false);
    setLogs([]);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronUp className="h-3 w-3 text-[#CBD5E1]" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-[#5B3EFF]" />
      : <ChevronDown className="h-3 w-3 text-[#5B3EFF]" />;
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (u: UserData) => {
    setEditUser(u);
    setForm({
      firstName: u.firstName ?? u.fullName?.split(" ")[0] ?? "",
      lastName: u.lastName ?? u.fullName?.split(" ").slice(1).join(" ") ?? "",
      email: u.email ?? "",
      password: "",
      role: (u.role as UserRole) ?? "commercial",
      status: u.status ?? "active",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.email) { setFormError("Email requis"); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload: Record<string, string> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        status: form.status,
      };
      if (form.password) payload.password = form.password;

      if (editUser) {
        await fetch(`/api/users/${editUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u: UserData) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...u, status: newStatus }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin text-[#5B3EFF]" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Users Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0">
              <Users className="h-4.5 w-4.5 text-[#5B3EFF]" style={{ height: 18, width: 18 }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#0F172A]">Gestion des utilisateurs</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">{users.length} utilisateur{users.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#4B2EEF] transition-all shadow-md shadow-[#5B3EFF]/25"
          >
            <Plus className="h-4 w-4" />
            Ajouter un utilisateur
          </button>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <Users className="h-8 w-8 text-[#CBD5E1]" />
            <p className="text-sm text-[#94A3B8]">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {users.map((u, idx) => {
              const displayName = u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "—";
              const role = (u.role as UserRole) ?? "commercial";
              const isActive = u.status !== "inactive";
              return (
                <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#F8FAFC] transition-colors">
                  <UserAvatar name={displayName} idx={idx} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{displayName}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{u.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${ROLE_STYLES[role] ?? ROLE_STYLES.readonly}`}>
                    {ROLE_LABELS[role] ?? role}
                  </span>
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${isActive ? "bg-[#5B3EFF]" : "bg-[#CBD5E1]"}`}
                    title={isActive ? "Désactiver" : "Activer"}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <span className={`text-xs font-medium shrink-0 w-14 ${isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                    {isActive ? "Actif" : "Inactif"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(u)}
                      className="h-8 w-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#5B3EFF] hover:border-[#5B3EFF]/40 hover:bg-[#F0EEFF] transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(u.id)}
                      className="h-8 w-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0">
              <Activity style={{ height: 18, width: 18 }} className="text-[#5B3EFF]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#0F172A]">Journal d'activité</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">{logs.length} entrée{logs.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={() => setClearAllConfirm(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Vider le journal
          </button>
        </div>

        {/* Filtres */}
        <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px] space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide flex items-center gap-1">
              <User className="h-3 w-3" /> Utilisateur
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
              <input
                className="w-full rounded-lg border border-[#E2E8F0] bg-white pl-8 pr-3 py-2 text-xs text-[#0F172A] outline-none focus:ring-2 focus:ring-[#5B3EFF]/20 focus:border-[#5B3EFF]/40 placeholder:text-[#94A3B8]"
                placeholder="Rechercher un utilisateur..."
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>
          </div>
          <div className="flex-1 min-w-[160px] space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide flex items-center gap-1">
              <Filter className="h-3 w-3" /> Action
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
              <input
                className="w-full rounded-lg border border-[#E2E8F0] bg-white pl-8 pr-3 py-2 text-xs text-[#0F172A] outline-none focus:ring-2 focus:ring-[#5B3EFF]/20 focus:border-[#5B3EFF]/40 placeholder:text-[#94A3B8]"
                placeholder="Rechercher une action..."
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleFilter}
              className="inline-flex items-center gap-1.5 bg-[#5B3EFF] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#4B2EEF] transition-all"
            >
              <Search className="h-3.5 w-3.5" /> Filtrer
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 border border-[#E2E8F0] text-[#64748B] px-3 py-2 rounded-lg text-xs font-medium hover:bg-white transition-all"
              title="Réinitialiser"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        {logsLoading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-[#64748B]">
            <Loader2 className="w-4 h-4 animate-spin text-[#5B3EFF]" />
            <span className="text-sm">Chargement...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <Activity className="h-7 w-7 text-[#CBD5E1]" />
            <p className="text-sm text-[#94A3B8]">Aucune activité enregistrée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <th className="px-6 py-3 text-left">
                    <button onClick={() => handleSort("date")} className="flex items-center gap-1 text-xs font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#5B3EFF] transition-colors">
                      Date / Heure <SortIcon field="date" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button onClick={() => handleSort("user")} className="flex items-center gap-1 text-xs font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#5B3EFF] transition-colors">
                      Utilisateur <SortIcon field="user" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <button onClick={() => handleSort("action")} className="flex items-center gap-1 text-xs font-semibold text-[#64748B] uppercase tracking-wide hover:text-[#5B3EFF] transition-colors">
                      Action <SortIcon field="action" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Module</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Suppr.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {logs.map((log) => {
                  const type = getActionType(log.action);
                  const badgeStyle = LOG_MODULE_STYLES[type] ?? LOG_MODULE_STYLES.connexion;
                  const date = new Date(log.createdAt);
                  return (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors group">
                      <td className="px-6 py-3 text-xs text-[#64748B] whitespace-nowrap">
                        {date.toLocaleDateString("fr-FR")} {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-3 text-xs font-medium text-[#0F172A] whitespace-nowrap">{log.userName ?? "—"}</td>
                      <td className="px-6 py-3 text-xs text-[#0F172A] max-w-xs truncate">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${badgeStyle}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-[#64748B]">{log.module ?? "—"}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => setDeleteLogConfirm(log.id)}
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg border border-[#E2E8F0] inline-flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete log entry */}
      {deleteLogConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A]">Supprimer cette entrée</h3>
                <p className="text-xs text-[#94A3B8]">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setDeleteLogConfirm(null)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Annuler</button>
              <button onClick={() => handleDeleteLog(deleteLogConfirm)} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm clear all */}
      {clearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A]">Vider le journal</h3>
                <p className="text-xs text-[#94A3B8]">Toutes les entrées seront supprimées définitivement.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setClearAllConfirm(false)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Annuler</button>
              <button onClick={handleClearAll} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">Tout supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E2E8F0]">
            <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
              <h2 className="font-semibold text-[#0F172A]">{editUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Prénom</label>
                  <input className={inputCls} placeholder="Jean" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Nom</label>
                  <input className={inputCls} placeholder="Dupont" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Email</label>
                <input className={inputCls} type="email" placeholder="jean.dupont@entreprise.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                  Mot de passe {editUser && <span className="text-[#94A3B8] normal-case font-normal">(laisser vide pour ne pas changer)</span>}
                </label>
                <input className={inputCls} type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Rôle</label>
                  <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                    <option value="admin">Admin</option>
                    <option value="commercial">Commercial</option>
                    <option value="technicien">Technicien</option>
                    <option value="readonly">Lecture seule</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Statut</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              {formError && (
                <div className="flex items-center gap-1.5 text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {formError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#F1F5F9] flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-all">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-[#4B2EEF] transition-all shadow-md shadow-[#5B3EFF]/25 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A]">Supprimer l'utilisateur</h3>
                <p className="text-xs text-[#94A3B8]">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── MAIN PAGE ──────────────────────── */

export default function Parametres() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Paramètres</h1>
        <p className="text-sm text-[#64748B] mt-1">Gérez votre compte et les préférences de l'application.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#F1F5F9] rounded-2xl p-1 mb-6 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                active
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "general" && <GeneralTab />}
      {activeTab === "entreprise" && <ComingSoon label="Informations entreprise (profil)" />}
      {activeTab === "devis" && <DevisTab />}
      {activeTab === "notifications" && <ComingSoon label="Notifications" />}
      {activeTab === "securite" && <ComingSoon label="Sécurité & mot de passe" />}
    </div>
  );
}
