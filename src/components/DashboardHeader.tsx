import { BarChart3, TrendingUp } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Store Sales Forecasting
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Model Performance Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Analytics View</span>
          </div>
        </div>
      </div>
    </div>
  );
};
