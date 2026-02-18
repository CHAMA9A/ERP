import { ModulePage } from "@/components/ModulePage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CataloguePage() {
  const res = await fetch("/api/catalog-items", { cache: "no-store" });

  if (!res.ok) {
    return (
      <ModulePage title="Catalogue" subtitle="Produits et services">
        <Card className="border border-border shadow-none">
          <CardHeader>
            <CardTitle>Produits et services</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger le catalogue.</p>
          </CardContent>
        </Card>
      </ModulePage>
    );
  }

  const items: Array<any> = await res.json();

  return (
    <ModulePage title="Catalogue" subtitle="Produits et services">
      <Card className="border border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-medium">Produits et services</CardTitle>
          <Button size="sm" asChild>
            <a href="/devis/catalogue/nouveau">+ Ajouter un produit</a>
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p>Aucun produit trouvé.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.reference}</TableCell>
                    <TableCell>{String(item.unitPrice)}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/devis/catalogue/${item.id}`}>Voir</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/devis/catalogue/${item.id}`}>Modifier</a>
                      </Button>
                      <form
                        action={async () => {
                          try {
                            await fetch(`/api/catalog-items/${item.id}`, { method: "DELETE" });
                            // no-op: navigation will refresh on client after delete
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        <Button variant="destructive" size="sm">Supprimer</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ModulePage>
  );
}

