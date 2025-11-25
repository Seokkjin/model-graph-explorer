import { DashboardHeader } from "@/components/DashboardHeader";
import { ModelCard } from "@/components/ModelCard";
import { StatsCard } from "@/components/StatsCard";
import { Activity, TrendingUp, Target, Zap } from "lucide-react";

const Index = () => {
  // Sample data - replace with your actual model data
  const models = [
    {
      name: "Linear Regression",
      accuracy: "87.3%",
      rmse: "245.6",
    },
    {
      name: "Random Forest",
      accuracy: "92.1%",
      rmse: "189.4",
    },
    {
      name: "XGBoost",
      accuracy: "94.5%",
      rmse: "156.8",
    },
    {
      name: "LSTM Neural Network",
      accuracy: "93.8%",
      rmse: "168.2",
    },
    {
      name: "Prophet",
      accuracy: "89.7%",
      rmse: "212.3",
    },
    {
      name: "ARIMA",
      accuracy: "86.4%",
      rmse: "257.9",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Models"
            value={models.length.toString()}
            subtitle="Forecasting models"
            icon={Activity}
          />
          <StatsCard
            title="Best Accuracy"
            value="94.5%"
            subtitle="XGBoost model"
            icon={Target}
            trend="up"
          />
          <StatsCard
            title="Lowest RMSE"
            value="156.8"
            subtitle="XGBoost model"
            icon={TrendingUp}
            trend="up"
          />
          <StatsCard
            title="Avg Performance"
            value="90.6%"
            subtitle="Across all models"
            icon={Zap}
          />
        </div>

        {/* Instructions for adding graphs */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Add Your Model Graphs
          </h2>
          <p className="text-muted-foreground mb-4">
            To display your forecasting model graphs, please extract the images from your ZIP file and provide them. 
            You can then add them to the ModelCard components by specifying the <code className="px-2 py-1 bg-muted rounded text-xs">imageSrc</code> prop.
          </p>
          <div className="text-sm space-y-2 text-muted-foreground">
            <p>Expected graph types for each model:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Actual vs Predicted Sales</li>
              <li>Residual Analysis</li>
              <li>Feature Importance (for tree-based models)</li>
              <li>Time Series Decomposition</li>
              <li>Model Performance Metrics</li>
            </ul>
          </div>
        </div>

        {/* Model Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Model Performance Visualizations</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {models.map((model, index) => (
            <ModelCard
              key={index}
              modelName={model.name}
              accuracy={model.accuracy}
              rmse={model.rmse}
              imageAlt={`${model.name} forecasting graph`}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
