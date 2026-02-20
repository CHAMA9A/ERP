import { ModulePage } from "@/components/ModulePage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NouveauDevisPage() {
  return (
    <ModulePage title="Nouveau devis" subtitle="Créer un nouveau devis">
      <Card className="border border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Informations du devis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" placeholder="Nom du client" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tva">TVA</Label>
              <Input id="tva" placeholder="20%" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="commentaires">Commentaires</Label>
              <Textarea
                id="commentaires"
                placeholder="Ajouter des commentaires ou des conditions particulières..."
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Produits</h2>
              <Button size="sm">+ Ajouter un produit</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ajoutez les produits et services qui composeront ce devis.
            </p>
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Aucun produit ajouté pour le moment.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Annuler</Button>
            <Button>Créer le devis</Button>
          </div>
        </CardContent>
      </Card>
    </ModulePage>
  );
}

