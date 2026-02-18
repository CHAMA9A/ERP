import ProductForm from "@/components/catalog/ProductForm";
import { ModulePage } from "@/components/ModulePage";

type Props = { params: { id: string } };

export default async function EditProductPage({ params }: Props) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/catalog-items/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <ModulePage title="Modifier produit" subtitle="Erreur">
        <p>Impossible de charger le produit.</p>
      </ModulePage>
    );
  }

  const item = await res.json();

  return (
    <ModulePage title="Modifier produit" subtitle={item.name}>
      <div className="max-w-2xl">
        {/* ProductForm is a client component so we pass initial data as props */}
        {/* @ts-expect-error Server -> Client prop */}
        <ProductForm mode="edit" id={params.id} initial={item} />
      </div>
    </ModulePage>
  );
}
