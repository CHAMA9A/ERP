import { Users, FileText, CheckSquare, CalendarDays, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stats = [
  { label: "Nombre total de clients", value: "1,248", change: "+12%", icon: Users, color: "text-primary" },
  { label: "Devis en attente", value: "23", change: "+3", icon: FileText, color: "text-warning" },
  { label: "Tâches en cours", value: "47", change: "-5", icon: CheckSquare, color: "text-success" },
  { label: "Événements aujourd'hui", value: "8", change: "+2", icon: CalendarDays, color: "text-accent-foreground" },
];

const chartData = [
  { name: "Lun", value: 30 },
  { name: "Mar", value: 45 },
  { name: "Mer", value: 38 },
  { name: "Jeu", value: 52 },
  { name: "Ven", value: 48 },
  { name: "Sam", value: 35 },
  { name: "Dim", value: 42 },
];

const activities = [
  { text: "Nouveau devis #1042 créé pour Client ABC", time: "Il y a 5 min" },
  { text: "Tâche « Revue design » marquée comme terminée", time: "Il y a 20 min" },
  { text: "Client « Entreprise XYZ » ajouté", time: "Il y a 1h" },
  { text: "Événement « Réunion équipe » planifié pour demain", time: "Il y a 2h" },
  { text: "Paramètres de facturation mis à jour", time: "Il y a 3h" },
];

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Bienvenue sur RIZAT</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Voici un aperçu de votre activité aujourd'hui.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-border shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                  {stat.change} <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chart */}
        <Card className="border border-border shadow-none lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              Aperçu de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(234 89% 60%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(234 89% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220 9% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 9% 46%)" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(234 89% 60%)"
                  strokeWidth={2}
                  fill="url(#colorPrimary)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="border border-border shadow-none lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{a.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
