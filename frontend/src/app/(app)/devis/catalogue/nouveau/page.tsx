import { ModulePage } from "@/components/ModulePage";
import ProductForm from "@/components/catalog/ProductForm";

export default function NewProductPage() {
  return (
    <ModulePage title="Nouveau produit" subtitle="Ajouter un produit au catalogue">
      <div className="max-w-2xl">
        <ProductForm mode="create" />
      </div>
    </ModulePage>
  );
}
