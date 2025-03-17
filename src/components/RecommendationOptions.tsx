
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RecommendationSource } from "@/types";
import { useState } from "react";

interface RecommendationOptionsProps {
  count: number;
  setCount: (value: number) => void;
  source: RecommendationSource;
  setSource: (source: RecommendationSource) => void;
  onSubmit: () => void;
}

export function RecommendationOptions({
  count,
  setCount,
  source,
  setSource,
  onSubmit,
}: RecommendationOptionsProps) {
  const [showCount, setShowCount] = useState(count.toString());
  
  const handleSliderChange = (value: number[]) => {
    setCount(value[0]);
    setShowCount(value[0].toString());
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">How many recommendations do you want?</h3>
        <div className="space-y-2">
          <Slider
            value={[count]}
            min={1}
            max={50}
            step={1}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between">
            <span>1</span>
            <span className="font-bold">{showCount}</span>
            <span>50</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recommendation source</h3>
        <RadioGroup
          value={source}
          onValueChange={(value) => setSource(value as RecommendationSource)}
          className="flex space-x-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tmdb" id="tmdb" />
            <Label htmlFor="tmdb">TMDB Algorithm</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ai" id="ai" />
            <Label htmlFor="ai">AI Powered</Label>
          </div>
        </RadioGroup>
      </div>

      <Button onClick={onSubmit} className="w-full">Get Recommendations</Button>
    </div>
  );
}
