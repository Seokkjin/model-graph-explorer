import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
  blurred?: boolean;
}

export const StatsCard = ({ title, value, subtitle, icon: Icon, trend, blurred }: StatsCardProps) => {
  return (
    <Card className={`p-6 border-border bg-gradient-to-br from-card to-muted/30 transition-all duration-300 ${blurred ? "pointer-events-none filter blur-md" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          trend === "up" ? "bg-chart-3/20" : trend === "down" ? "bg-destructive/20" : "bg-primary/20"
        }`}>
          <Icon className={`w-6 h-6 ${
            trend === "up" ? "text-chart-3" : trend === "down" ? "text-destructive" : "text-primary"
          }`} />
        </div>
      </div>
    </Card>
  );
};
