import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type CatalogItemPayload = {
  name: string;
  reference?: string | null;
  description?: string | null;
  unitPrice: string | number;
};

interface Props {
  mode: "create" | "edit";
  id?: string;
  initial?: Partial<CatalogItemPayload>;
}

export default function ProductForm({ mode, id, initial }: Props) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.name ?? "");
  const [reference, setReference] = useState(initial?.reference ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [unitPrice, setUnitPrice] = useState<string>(
    initial?.unitPrice ? String(initial.unitPrice) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Le nom est requis");
    if (!unitPrice.trim() || Number.isNaN(Number(unitPrice)))
      return setError("Prix unitaire invalide");

    const payload: CatalogItemPayload = {
      name: name.trim(),
      reference: reference.trim() || null,
      description: description.trim() || null,
      unitPrice: unitPrice.trim(),
    };

    try {
      setLoading(true);
      const url = mode === "create" ? "/api/catalog-items" : `/api/catalog-items/${id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Request failed");
      }

        navigate("/devis/catalogue");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nom</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium">Référence</label>
        <Input value={reference ?? ""} onChange={(e) => setReference(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium">Prix unitaire</label>
        <Input
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          placeholder="e.g. 12.50"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {mode === "create" ? "Créer" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
