import { ModelCard } from "@/components/ModelCard";
import React, { useState } from "react";

// Sample data - replace with your actual model data
const models = [
  {
    name: "Linear Regression",
    rscore: 0.85,
    accuracy: 0.78,
    rmse: 2.1,
    imageSrc: "/model-images/linear-regression.png",
    imageAlt: "Linear Regression forecasting graph",
  },
  {
    name: "Random Forest",
    rscore: 0.92,
    accuracy: 0.81,
    rmse: 1.7,
    imageSrc: "/model-images/random-forest.png",
    imageAlt: "Random Forest forecasting graph",
  },
  {
    name: "LSTM Neural Network",
    rscore: 0.88,
    accuracy: 0.79,
    rmse: 1.9,
    imageSrc: "/model-images/lstm-neural-network.png",
    imageAlt: "LSTM Neural Network forecasting graph",
  },
  {
    name: "Prophet",
    rscore: 0.80,
    accuracy: 0.75,
    rmse: 2.3,
    imageSrc: "/model-images/prophet.png",
    imageAlt: "Prophet forecasting graph",
  },
];

const Models: React.FC = () => {
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">Models</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {models.map((model, index) => (
          <ModelCard
            key={model.name}
            modelName={model.name}
            rscore={model.rscore}
            accuracy={model.accuracy}
            rmse={model.rmse}
            imageSrc={model.imageSrc}
            imageAlt={model.imageAlt}
            enlarged={enlargedIndex === index}
            blurred={enlargedIndex !== null && enlargedIndex !== index}
            onToggleEnlarge={() => setEnlargedIndex(enlargedIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Models;
