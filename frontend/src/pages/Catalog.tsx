import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, Package, Pen, Trash2, Save, X, Upload, Download, LayoutGrid, List, Table2, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

type ViewMode = "table" | "grid" | "compact";

interface CatalogItem {
  id: string;
  reference: string;
  name: string;
  description: string;
  unitPrice: string;
}

const emptyForm = { reference: "", name: "", description: "", unitPrice: "" };

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPos, setExportPos] = useState({ top: 0, left: 0 });
  const exportRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLButtonElement>(null);

  const openExport = useCallback(() => {
    if (exportBtnRef.current) {
      const rect = exportBtnRef.current.getBoundingClientRect();
      setExportPos({ top: rect.bottom + 8, left: rect.right - 208 });
    }
    setExportOpen((v) => !v);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExportCSV = () => {
    setExportOpen(false);
    const header = "reference,name,description,unitPrice";
    const rows = items.map((i) =>
      [i.reference, i.name, i.description, i.unitPrice]
        .map((v) => `"${(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catalogue.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    setExportOpen(false);
    const wsData = [
      ["Référence", "Article", "Description", "Prix HT (€)"],
      ...items.map((i) => [i.reference, i.name, i.description, parseFloat(i.unitPrice) || 0]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 20 }, { wch: 40 }, { wch: 40 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catalogue");
    XLSX.writeFile(wb, "catalogue.xlsx");
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Catalogue Produits & Services", margin, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")} — ${items.length} article(s)`, margin, 27);
    doc.setTextColor(0);
    const colX = [margin, margin + 42, margin + 130, margin + 200];
    const headers = ["Référence", "Article", "Description", "Prix HT (€)"];
    let y = 36;
    doc.setFillColor(245, 245, 250);
    doc.rect(margin, y - 5, pageW - margin * 2, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    headers.forEach((h, i) => doc.text(h, colX[i], y));
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    items.forEach((item, idx) => {
      if (y > 185) { doc.addPage(); y = 20; }
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 255);
        doc.rect(margin, y - 5, pageW - margin * 2, 8, "F");
      }
      doc.text(item.reference || "—", colX[0], y, { maxWidth: 38 });
      doc.text(item.name || "", colX[1], y, { maxWidth: 84 });
      doc.text(item.description || "", colX[2], y, { maxWidth: 64 });
      const price = (parseFloat(item.unitPrice) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
      doc.text(price, colX[3], y, { maxWidth: 36 });
      y += 8;
    });
    doc.save("catalogue.pdf");
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
        if (lines.length === 0) throw new Error("Fichier vide");
        const firstLine = lines[0].toLowerCase();
        const hasHeader = firstLine.includes("name") || firstLine.includes("reference") || firstLine.includes("nom") || firstLine.includes("prix") || firstLine.includes("price");
        const dataLines = hasHeader ? lines.slice(1) : lines;
        let colRef = 0, colName = 1, colDesc = 2, colPrice = 3;
        if (hasHeader) {
          const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
          headers.forEach((h, i) => {
            if (h.includes("ref")) colRef = i;
            else if (h.includes("name") || h.includes("nom") || h.includes("article")) colName = i;
            else if (h.includes("desc")) colDesc = i;
            else if (h.includes("price") || h.includes("prix") || h.includes("unit")) colPrice = i;
          });
        }
        const rows = dataLines.filter((l) => l.trim()).map((line) => {
          const cols = parseCSVLine(line);
          return { reference: cols[colRef] ?? "", name: cols[colName] ?? "", description: cols[colDesc] ?? "", unitPrice: cols[colPrice] ?? "0" };
        }).filter((r) => r.name);
        if (rows.length === 0) throw new Error("Aucune ligne valide trouvée dans le CSV");
        const res = await fetch("/api/catalog/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rows) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
        await load();
        alert(`${data.count} article(s) importé(s) avec succès.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        alert(`Erreur lors de l'import : ${msg}`);
      } finally {
        setImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const load = () =>
    fetch("/api/catalog").then((r) => r.json()).then(setItems).catch(console.error);

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditItem(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (item: CatalogItem) => { setEditItem(item); setForm({ reference: item.reference ?? "", name: item.name ?? "", description: item.description ?? "", unitPrice: item.unitPrice ?? "" }); setError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setForm(emptyForm); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Le nom de l'article est requis."); return; }
    if (!form.unitPrice.trim()) { setError("Le prix HT est requis."); return; }
    setSaving(true);
    try {
      const url = editItem ? `/api/catalog/${editItem.id}` : "/api/catalog";
      const method = editItem ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Erreur serveur");
      await load();
      closeModal();
    } catch { setError("Une erreur est survenue."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    await fetch(`/api/catalog/${id}`, { method: "DELETE" });
    await load();
  };

  const filtered = items.filter(
    (i) => i.name?.toLowerCase().includes(search.toLowerCase()) || i.reference?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (v: string) =>
    Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="glass-card rounded-[20px] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary/30">
            <Package size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Catalogue Produits & Services</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {items.length} article{items.length !== 1 ? "s" : ""} au catalogue
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Import */}
          <label className={`h-10 px-4 rounded-xl border border-border bg-white/60 font-medium text-muted-foreground hover:bg-secondary transition-all flex items-center gap-2 cursor-pointer text-sm ${importing ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={15} />
            {importing ? "Import..." : "Importer"}
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
              {/* Export */}
              <div ref={exportRef}>
                <button
                  ref={exportBtnRef}
                  onClick={openExport}
                  className="h-10 px-4 rounded-xl border border-border bg-white/60 font-medium text-muted-foreground hover:bg-secondary transition-all flex items-center gap-2 text-sm"
                >
                  <Download size={15} />
                  Exporter
                  <ChevronDown size={13} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
                </button>
                {exportOpen && createPortal(
                  <div
                    style={{ position: "fixed", top: exportPos.top, left: exportPos.left, width: 208, zIndex: 9999 }}
                    className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-slate-50 transition-colors">
                      <Download size={14} className="text-slate-400" /> CSV
                    </button>
                    <button onClick={handleExportExcel} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-slate-50 transition-colors border-t border-slate-100">
                      <FileSpreadsheet size={14} className="text-green-600" /> Excel (.xlsx)
                    </button>
                    <button onClick={handleExportPDF} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-slate-50 transition-colors border-t border-slate-100">
                      <FileText size={14} className="text-red-500" /> PDF
                    </button>
                  </div>,
                  document.body
                )}
              </div>
          <button
            onClick={openNew}
            className="h-10 px-5 bg-primary-gradient text-white rounded-xl flex items-center gap-2 font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
          >
            <Plus size={16} />
            Nouvel article
          </button>
        </div>
      </div>

      {/* Search + View toggle */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article ou une référence..."
            className="w-full glass-card rounded-[14px] py-3 pl-11 pr-4 focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex glass-card rounded-[14px] p-1 gap-1">
          {([["table", Table2], ["grid", LayoutGrid], ["compact", List]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2.5 rounded-xl transition-all ${viewMode === mode ? "bg-primary-gradient text-white shadow" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      </div>

      {/* Vue Tableau */}
      {viewMode === "table" && (
        <div className="glass-card rounded-[20px] overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-[#F8FAFC]">Référence</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-[#F8FAFC]">Article</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right bg-[#F8FAFC]">Prix HT</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right bg-[#F8FAFC]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground text-sm">
                      {search ? "Aucun article trouvé pour cette recherche." : "Aucun article dans le catalogue. Créez votre premier article !"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-primary/[0.03] transition-colors group">
                      <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-primary/10 px-2.5 py-1 rounded-lg text-primary font-medium tracking-wide border border-primary/20">
                            {item.reference || "—"}
                          </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors shrink-0">
                            <Package size={17} />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-sm mt-0.5">{item.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-foreground">{formatPrice(item.unitPrice)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                            <Pen size={15} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-border bg-[#F8FAFC]/50">
              <p className="text-xs text-muted-foreground">{filtered.length} article{filtered.length > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      )}

      {/* Vue Grille */}
      {viewMode === "grid" && (
        <div className="animate-in fade-in duration-300">
          {filtered.length === 0 ? (
            <div className="glass-card rounded-[20px] py-16 text-center text-muted-foreground text-sm">
              {search ? "Aucun article trouvé." : "Aucun article dans le catalogue."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <div key={item.id} className="glass-card rounded-[20px] p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200 group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                      <Package size={20} />
                    </div>
                      <span className="font-mono text-xs bg-primary/10 px-2 py-1 rounded-lg text-primary font-medium tracking-wide border border-primary/20">
                        {item.reference || "—"}
                      </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground text-sm leading-tight">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="font-bold text-foreground">{formatPrice(item.unitPrice)}</div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <Pen size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vue Liste compacte */}
      {viewMode === "compact" && (
        <div className="glass-card rounded-[20px] overflow-hidden animate-in fade-in duration-300">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {search ? "Aucun article trouvé." : "Aucun article dans le catalogue."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-primary/[0.03] transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Package size={15} />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">{item.reference || "—"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground text-sm">{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground ml-2 truncate hidden sm:inline">{item.description}</span>
                    )}
                  </div>
                  <span className="font-bold text-foreground text-sm shrink-0">{formatPrice(item.unitPrice)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                      <Pen size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card rounded-[24px] shadow-2xl w-full max-w-lg mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center rounded-t-[24px] bg-[#F8FAFC]/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center shadow-md shadow-primary/30">
                  <Package size={17} className="text-white" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  {editItem ? "Modifier l'article" : "Nouvel article"}
                </h2>
              </div>
              <button onClick={closeModal} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Référence</label>
                  <input
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    placeholder="Ex: AA-VE-I13"
                    className="w-full rounded-xl border border-border bg-[#F8FAFC] px-4 py-2.5 text-sm text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Prix HT *</label>
                  <input
                    value={form.unitPrice}
                    onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    placeholder="285.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-xl border border-border bg-[#F8FAFC] px-4 py-2.5 text-sm text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Nom de l'article *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: 6930wt IP Phone"
                  className="w-full rounded-xl border border-border bg-[#F8FAFC] px-4 py-2.5 text-sm text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description optionnelle..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-[#F8FAFC] px-4 py-2.5 text-sm text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/40 outline-none transition-all resize-none"
                />
              </div>
              {error && <p className="text-destructive text-xs font-medium">{error}</p>}
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 rounded-xl border border-border font-semibold text-muted-foreground hover:bg-secondary transition-all text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary-gradient text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                  <Save size={15} />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
