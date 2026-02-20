import Link from "next/link";
import { ModulePage } from "@/components/ModulePage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockDevis = [
  {
    id: "DEV-001",
    client: "T-LINK NETWORK OPERATOR",
    date: "2026-02-17",
    status: "En attente",
    total: "2400 €",
  },
];

export default function DevisListPage() {
  return (
    <ModulePage title="Devis" subtitle="Liste de tous les devis">
      <Card className="border border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-medium">
            Liste des devis
          </CardTitle>
          <Button asChild size="sm">
            <Link href="/devis/nouveau">+ Nouveau devis</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDevis.map((devis) => (
                <TableRow key={devis.id}>
                  <TableCell className="font-medium">{devis.id}</TableCell>
                  <TableCell>{devis.client}</TableCell>
                  <TableCell>{devis.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{devis.status}</Badge>
                  </TableCell>
                  <TableCell>{devis.total}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ModulePage>
  );
}

