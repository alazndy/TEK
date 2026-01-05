import React from 'react';
import { AnalysisResult } from '../types';

interface UPHBridgeModuleProps {
  analysisResults: AnalysisResult[];
}

export const UPHBridgeModule: React.FC<UPHBridgeModuleProps> = ({ analysisResults }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ecosystem Integration</h2>
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground mb-4">
          Connect your technical analysis directly with the Unified Project Hub (UPH) to generate project plans and resource estimates.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2">
           <div className="p-4 bg-muted/50 rounded border border-border">
               <h3 className="font-semibold mb-2">Available Analyses</h3>
               <p className="text-2xl font-bold">{analysisResults.length}</p>
           </div>
           
           <div className="p-4 bg-muted/50 rounded border border-border flex items-center justify-center">
               <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                   Sync with UPH
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};
