import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModelCardProps {
  modelName: string;
  rscore?: string;
  accuracy?: string;
  rmse?: string;
  imageSrc?: string;
  imageAlt: string;
  enlarged?: boolean;
  blurred?: boolean;
  onToggleEnlarge?: () => void;
}

export const ModelCard = ({ modelName, rscore, accuracy, rmse, imageSrc, imageAlt, enlarged, blurred, onToggleEnlarge }: ModelCardProps) => {
  return (
    <Card
      className={`overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer ${enlarged ? "fixed z-50 max-w-4xl w-[90vw] top-36 bottom-8 max-h-[calc(100vh-10rem)] scale-105 shadow-2xl m-auto left-0 right-0" : ""} ${blurred ? "pointer-events-none filter blur-md" : ""}`}
      style={enlarged ? { } : {}}
      onClick={onToggleEnlarge}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">{modelName}</h3>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            Model
          </Badge>
        </div>
        <div className="flex gap-8 text-sm">
          {rscore && (
            <div className="flex flex-col items-start">
              <span className="text-muted-foreground">R<sup>2</sup> Score</span>
              <span className="font-mono font-semibold text-foreground text-lg">{parseFloat(rscore).toFixed(2)}</span>
            </div>
          )}
          {accuracy && (
            <div className="flex flex-col items-start">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-mono font-semibold text-foreground">{accuracy}</span>
            </div>
          )}
          {rmse && (
            <div className="flex flex-col items-start">
              <span className="text-muted-foreground">RMSE</span>
              <span className="font-mono font-semibold text-foreground">{rmse}</span>
            </div>
          )}
        </div>
      </div>
      <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
        {imageSrc ? (
          <img 
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Graph visualization</p>
          </div>
        )}
      </div>
    </Card>
  );
};
