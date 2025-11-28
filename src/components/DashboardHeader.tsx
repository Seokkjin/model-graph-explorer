import { BarChart3, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const DashboardHeader = () => {
  const location = useLocation();
  
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Store Sales Forecasting
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Model Performance Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button 
                variant={location.pathname === "/" ? "default" : "outline"}
                size="sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Models
              </Button>
            </Link>
            <Link to="/analytics">
              <Button 
                variant={location.pathname === "/analytics" ? "default" : "outline"}
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
