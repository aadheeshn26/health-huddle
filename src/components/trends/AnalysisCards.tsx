
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { AnalysisData } from '@/types/trends';

interface AnalysisCardsProps {
  analysis: AnalysisData | null;
}

const AnalysisCards = ({ analysis }: AnalysisCardsProps) => {
  return (
    <>
      {/* AI Analysis */}
      {analysis?.gpt_summary && (
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertCircle className="text-blue-400 mr-2" size={20} />
            Health Summary & Recommendations
          </h3>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">
            {analysis.gpt_summary}
          </div>
        </Card>
      )}

      {/* Patterns */}
      {analysis?.claude_patterns && (
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Identified Patterns</h3>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">
            {typeof analysis.claude_patterns === 'string' 
              ? analysis.claude_patterns 
              : JSON.stringify(analysis.claude_patterns, null, 2)
            }
          </div>
        </Card>
      )}
    </>
  );
};

export default AnalysisCards;
