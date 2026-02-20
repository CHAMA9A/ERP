import React, { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Users, Activity, X, Save,
  Loader2, AlertCircle, Search, Shield, ChevronDown,
  UserCheck, UserX, Key,
} from "lucide-react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#5B3EFF]/20 focus:border-[#5B3EFF]/40 transition-all placeholder:text-[#94A3B8]";

type UserRole = "admin" | "commercial" | "technicien" | "readonly";

const ROLES: { value: UserRole; label: string; style: string; desc: string }[] = [
  { value: "admin",      label: "Admin",         style: "bg-[#F0EEFF] text-[#5B3EFF]",  desc: "Accès total" },
  { value: "commercial", label: "Commercial",    style: "bg-[#E0F2FE] text-[#0EA5E9]",  desc: "Devis, Clients, Factures" },
  { value: "technicien", label: "Technicien",    style: "bg-[#FEF3C7] text-[#F59E0B]",  desc: "Interventions, SAV" },
  { value: "readonly",   label: "Lecture seule", style: "bg-[#F1F5F9] text-[#64748B]",  desc: "Consultation uniquement" },
];

const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.value, r]));

const AVATAR_COLORS = [
  "bg-[#5B3EFF]", "bg-[#0EA5E9]", "bg-[#F59E0B]",
  "bg-[#10B981]", "bg-[#EF4444]", "bg-[#8B5CF6]",
];

const LOG_STYLES: Record<string, string> = {
  creation:     "bg-emerald-50 text-emerald-700 border border-emerald-100",
  modification: "bg-blue-50 text-blue-700 border border-blue-100",
  suppression:  "bg-red-50 text-red-700 border border-red-100",
  connexion:    "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]",
};

function getActionType(action: string) {
  const a = action.toLowerCase();
  if (a.includes("créé") || a.includes("crée") || a.includes("ajouté")) return "creation";
  if (a.includes("modifié") || a.includes("modifie") || a.includes("mise à jour")) return "modification";
  if (a.includes("supprimé") || a.includes("supprime")) return "suppression";
  return "connexion";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

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

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "",
  password: "", role: "commercial" as UserRole, status: "active",
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Avatar({ name, idx }: { name: string; idx: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className={`h-10 w-10 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const r = ROLE_MAP[role as UserRole];
  if (!r) return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F1F5F9] text-[#64748B]">{role}</span>;
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${r.style}`}>{r.label}</span>;
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? "bg-[#5B3EFF]" : "bg-[#CBD5E1]"}`}
      title={active ? "Désactiver" : "Activer"}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

function UserModal({
  editUser, onClose, onSaved,
}: {
  editUser: UserData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editUser) {
      setForm({
        firstName: editUser.firstName ?? editUser.fullName?.split(" ")[0] ?? "",
        lastName:  editUser.lastName  ?? editUser.fullName?.split(" ").slice(1).join(" ") ?? "",
        email:     editUser.email ?? "",
        password:  "",
        role:      (editUser.role as UserRole) ?? "commercial",
        status:    editUser.status ?? "active",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setError("");
  }, [editUser]);

  const handleSave = async () => {
    if (!form.email) { setError("L'email est requis"); return; }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string> = {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        role:      form.role,
        status:    form.status,
      };
      if (form.password) payload.password = form.password;

      const url    = editUser ? `/api/users/${editUser.id}` : "/api/users";
      const method = editUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Erreur serveur");
      }
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E2E8F0]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              {editUser ? <Pencil className="h-4 w-4 text-[#5B3EFF]" /> : <Plus className="h-4 w-4 text-[#5B3EFF]" />}
            </div>
            <h2 className="font-semibold text-[#0F172A]">
              {editUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
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
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide flex items-center gap-1.5">
              <Key className="h-3 w-3" />
              Mot de passe
              {editUser && <span className="text-[#94A3B8] normal-case font-normal text-[11px]">(laisser vide pour conserver)</span>}
            </label>
            <input className={inputCls} type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          {/* Role picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Rôle & permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                    form.role === r.value
                      ? "border-[#5B3EFF] bg-[#F0EEFF]"
                      : "border-[#E2E8F0] hover:border-[#5B3EFF]/40 hover:bg-[#F8FAFC]"
                  }`}
                >
                  <p className={`text-xs font-semibold ${form.role === r.value ? "text-[#5B3EFF]" : "text-[#0F172A]"}`}>{r.label}</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Compte actif</p>
              <p className="text-xs text-[#94A3B8]">L'utilisateur peut se connecter</p>
            </div>
            <Toggle active={form.status === "active"} onToggle={() => setForm({ ...form, status: form.status === "active" ? "inactive" : "active" })} />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F1F5F9] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-all">
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
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

type Tab = "users" | "activity";

export default function Utilisateurs() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers]   = useState<UserData[]>([]);
  const [logs, setLogs]     = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [showModal, setShowModal]       = useState(false);
  const [editUser, setEditUser]         = useState<UserData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserData | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [u, l] = await Promise.all([
        fetch("/api/users").then((r) => r.json()),
        fetch("/api/activity-log").then((r) => r.json()),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setLogs(Array.isArray(l) ? l : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditUser(null); setShowModal(true); };
  const openEdit = (u: UserData) => { setEditUser(u); setShowModal(true); };

  const handleToggleStatus = async (u: UserData) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    await fetch(`/api/users/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...u, status: newStatus }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await fetch(`/api/users/${deleteConfirm.id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  // Stats
  const total    = users.length;
  const active   = users.filter((u) => u.status !== "inactive").length;
  const inactive = total - active;
  const admins   = users.filter((u) => u.role === "admin").length;

  // Filtered list
  const filtered = users.filter((u) => {
    const name = [u.firstName, u.lastName, u.fullName, u.email].filter(Boolean).join(" ").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-[#64748B] mt-1">Gérez les accès et les permissions de l'équipe.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4B2EEF] transition-all shadow-md shadow-[#5B3EFF]/25"
        >
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",        value: total,    icon: Users,     color: "bg-[#F0EEFF] text-[#5B3EFF]" },
          { label: "Actifs",       value: active,   icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
          { label: "Inactifs",     value: inactive, icon: UserX,     color: "bg-red-50 text-red-500" },
          { label: "Admins",       value: admins,   icon: Shield,    color: "bg-[#FEF3C7] text-[#F59E0B]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
              <p className="text-xs text-[#94A3B8]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] rounded-2xl p-1 w-fit">
        {([
          { id: "users",    label: "Utilisateurs", icon: Users },
          { id: "activity", label: "Journal d'activité", icon: Activity },
        ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === id ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-[#F1F5F9] flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input
                className={inputCls + " pl-9"}
                placeholder="Rechercher un utilisateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Role filter */}
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={inputCls + " pr-8 appearance-none min-w-[160px]"}
              >
                <option value="all">Tous les rôles</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
              <Loader2 className="w-5 h-5 animate-spin text-[#5B3EFF]" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Users className="h-10 w-10 text-[#CBD5E1]" />
              <p className="font-semibold text-[#0F172A]">Aucun utilisateur trouvé</p>
              <p className="text-sm text-[#94A3B8]">
                {search || roleFilter !== "all" ? "Essayez d'autres filtres." : "Ajoutez votre premier utilisateur."}
              </p>
              {!search && roleFilter === "all" && (
                <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#5B3EFF] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#4B2EEF] transition-all mt-2">
                  <Plus className="h-4 w-4" /> Ajouter un utilisateur
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[auto_1fr_160px_100px_80px_100px] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#F1F5F9] text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                <div className="w-10" />
                <div>Utilisateur</div>
                <div>Rôle</div>
                <div>Statut</div>
                <div />
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-[#F1F5F9]">
                {filtered.map((u, idx) => {
                  const displayName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.fullName || u.email || "—";
                  const isActive = u.status !== "inactive";
                  return (
                    <div key={u.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#F8FAFC] transition-colors">
                      <Avatar name={displayName} idx={idx} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] truncate">{displayName}</p>
                        <p className="text-xs text-[#94A3B8] truncate">{u.email}</p>
                      </div>
                      <div className="hidden sm:block shrink-0">
                        <RoleBadge role={u.role ?? "commercial"} />
                      </div>
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <Toggle active={isActive} onToggle={() => handleToggleStatus(u)} />
                        <span className={`text-xs font-medium w-12 ${isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                          {isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        <button
                          onClick={() => openEdit(u)}
                          className="h-8 w-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#5B3EFF] hover:border-[#5B3EFF]/40 hover:bg-[#F0EEFF] transition-all"
                          title="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(u)}
                          className="h-8 w-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer count */}
              <div className="px-6 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
                <p className="text-xs text-[#94A3B8]">{filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {tab === "activity" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0">
              <Activity className="h-4.5 w-4.5 text-[#5B3EFF]" style={{ height: 18, width: 18 }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#0F172A]">Journal d'activité</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">20 dernières actions enregistrées</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-[#64748B]">
              <Loader2 className="w-5 h-5 animate-spin text-[#5B3EFF]" />
              <span className="text-sm">Chargement...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <Activity className="h-10 w-10 text-[#CBD5E1]" />
              <p className="font-semibold text-[#0F172A]">Aucune activité enregistrée</p>
              <p className="text-sm text-[#94A3B8]">Les actions de l'équipe apparaîtront ici.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                    {["Date / Heure", "Utilisateur", "Action", "Module"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {logs.map((log) => {
                    const type = getActionType(log.action);
                    return (
                      <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <p className="text-xs text-[#0F172A] font-medium">
                            {new Date(log.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                          <p className="text-[11px] text-[#94A3B8]">{timeAgo(log.createdAt)}</p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-xs font-semibold text-[#0F172A]">{log.userName ?? "—"}</p>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${LOG_STYLES[type]}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-[#64748B]">{log.module ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {showModal && (
        <UserModal
          editUser={editUser}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-[#E2E8F0] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F172A]">Supprimer l'utilisateur</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {[deleteConfirm.firstName, deleteConfirm.lastName].filter(Boolean).join(" ") || deleteConfirm.email}
                </p>
              </div>
            </div>
            <p className="text-sm text-[#64748B]">Cette action est irréversible. L'utilisateur perdra l'accès immédiatement.</p>
            <div className="flex gap-3 justify-end pt-1">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                Annuler
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
