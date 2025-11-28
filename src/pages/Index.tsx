import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ModelCard } from "@/components/ModelCard";
import { StatsCard } from "@/components/StatsCard";
import { Activity, TrendingUp, Target, Zap } from "lucide-react";

const Index = () => {
  // Sample data - replace with your actual model data
  const models = [
    {
      name: "Linear Regression",
      rscore: "0.74",
      imageSrc: "/model-images/linear-regression.png",
    },
    {
      name: "Random Forest",
      rscore: "0.33",
      imageSrc: "/model-images/random-forest.png",
    },
    {
      name: "LSTM Neural Network",
      rscore: "0.44",
      imageSrc: "/model-images/lstm-neural-network.png",
    },
    {
      name: "Prophet",
      rscore: "0.70",
      imageSrc: "/model-images/prophet.png",
    },
  ];

  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);

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
            blurred={enlargedIndex !== null}
          />
        </div>

        {/* Model Grid */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold text-foreground mb-6 transition-all duration-300${enlargedIndex !== null ? ' filter blur-md pointer-events-none' : ''}`}>Models</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {models.map((model, index) => (
            <ModelCard
              key={index}
              modelName={model.name}
              rscore={model.rscore}
              imageSrc={model.imageSrc}
              imageAlt={`${model.name} forecasting graph`}
              enlarged={enlargedIndex === index}
              blurred={enlargedIndex !== null && enlargedIndex !== index}
              onToggleEnlarge={() => setEnlargedIndex(enlargedIndex === index ? null : index)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
