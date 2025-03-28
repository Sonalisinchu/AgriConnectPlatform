import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Season colors
const seasonColors = {
  winter: "bg-green-100",
  spring: "bg-yellow-100",
  summer: "bg-orange-100",
  monsoon: "bg-blue-100",
  autumn: "bg-amber-100",
};

const vegetablePlanting = [
  {
    name: "Tomato",
    seasons: [
      { name: "monsoon", months: "Jul - Sep", position: "50%", width: "24%" },
      { name: "autumn", months: "Oct - Dec", position: "74%", width: "16%" },
    ],
    duration: "Jul - Dec (6 months)",
    info: "Requires well-drained soil, regular watering, and full sun exposure."
  },
  {
    name: "Cabbage",
    seasons: [
      { name: "winter", months: "Jan - Feb", position: "0%", width: "16%" },
      { name: "autumn", months: "Oct - Dec", position: "74%", width: "26%" },
    ],
    duration: "Jan - Feb, Oct - Dec (5 months)",
    info: "Prefers cool weather, needs rich soil and consistent moisture."
  },
  {
    name: "Cucumber",
    seasons: [
      { name: "summer", months: "May - Jun", position: "33%", width: "17%" },
    ],
    duration: "May - Jun (2 months)",
    info: "Fast-growing vine that requires warm temperatures and steady moisture."
  },
];

const fruitPlanting = [
  {
    name: "Mango",
    seasons: [
      { name: "spring", months: "Mar - Apr", position: "16%", width: "17%" },
    ],
    duration: "Mar - Apr (2 months)",
    info: "Needs full sun, protection from strong winds, and well-draining soil."
  },
  {
    name: "Strawberry",
    seasons: [
      { name: "autumn", months: "Oct - Dec", position: "74%", width: "16%" },
      { name: "winter", months: "Jan - Feb", position: "0%", width: "16%" },
    ],
    duration: "Oct - Feb (5 months)",
    info: "Prefers cooler temperatures, needs rich soil and regular watering."
  },
];

const grainPlanting = [
  {
    name: "Rice",
    seasons: [
      { name: "monsoon", months: "Jul - Sep", position: "50%", width: "24%" },
    ],
    duration: "Jul - Sep (3 months)",
    info: "Needs standing water during growth, warm temperatures, and full sun."
  },
  {
    name: "Wheat",
    seasons: [
      { name: "winter", months: "Jan - Feb", position: "0%", width: "16%" },
      { name: "autumn", months: "Oct - Dec", position: "74%", width: "26%" },
    ],
    duration: "Oct - Feb (5 months)",
    info: "Cold-season crop that requires moderate temperatures and regular watering."
  },
];

interface PlantingCalendarProps {
  className?: string;
}

export function PlantingCalendar({ className }: PlantingCalendarProps) {
  const [region, setRegion] = useState("Western Maharashtra");
  
  return (
    <section id="planting-calendar" className={cn("mb-10", className)}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-2xl">Planting Calendar</h3>
        <div className="flex items-center">
          <span className="text-sm text-neutral-500 mr-3">Region:</span>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Western Maharashtra">Western Maharashtra</SelectItem>
              <SelectItem value="Coastal Maharashtra">Coastal Maharashtra</SelectItem>
              <SelectItem value="Vidarbha">Vidarbha</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex mb-8 text-center text-sm font-medium">
            <div className="flex-1">
              <div className="p-2 bg-green-100 text-primary rounded-t-lg">Winter</div>
              <div className="p-1 text-xs text-neutral-500">Jan - Feb</div>
            </div>
            <div className="flex-1">
              <div className="p-2 bg-yellow-100 text-yellow-800 rounded-t-lg">Spring</div>
              <div className="p-1 text-xs text-neutral-500">Mar - Apr</div>
            </div>
            <div className="flex-1">
              <div className="p-2 bg-orange-100 text-orange-800 rounded-t-lg">Summer</div>
              <div className="p-1 text-xs text-neutral-500">May - Jun</div>
            </div>
            <div className="flex-1">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-t-lg">Monsoon</div>
              <div className="p-1 text-xs text-neutral-500">Jul - Sep</div>
            </div>
            <div className="flex-1">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-t-lg">Autumn</div>
              <div className="p-1 text-xs text-neutral-500">Oct - Dec</div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Vegetables */}
            <div>
              <h4 className="font-semibold text-lg mb-3">Vegetables</h4>
              <div className="space-y-4">
                {vegetablePlanting.map((veg) => (
                  <div key={veg.name} className="relative h-12 border border-neutral-200 rounded-lg">
                    <div className="absolute top-0 left-0 bottom-0 flex items-center pl-4 font-medium">
                      {veg.name}
                    </div>
                    
                    {veg.seasons.map((season, index) => (
                      <div 
                        key={index}
                        className={`absolute top-0 h-1 ${seasonColors[season.name as keyof typeof seasonColors]}`} 
                        style={{ left: season.position, width: season.width }}
                      ></div>
                    ))}
                    
                    <div className="absolute left-1/2 top-0 bottom-0 flex items-center justify-center w-full text-xs">
                      <span className="bg-white px-2">{veg.duration}</span>
                    </div>
                    
                    <div className="absolute right-4 top-0 bottom-0 flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-primary hover:text-primary-dark">
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{veg.info}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Fruits */}
            <div>
              <h4 className="font-semibold text-lg mb-3">Fruits</h4>
              <div className="space-y-4">
                {fruitPlanting.map((fruit) => (
                  <div key={fruit.name} className="relative h-12 border border-neutral-200 rounded-lg">
                    <div className="absolute top-0 left-0 bottom-0 flex items-center pl-4 font-medium">
                      {fruit.name}
                    </div>
                    
                    {fruit.seasons.map((season, index) => (
                      <div 
                        key={index}
                        className={`absolute top-0 h-1 ${seasonColors[season.name as keyof typeof seasonColors]}`} 
                        style={{ left: season.position, width: season.width }}
                      ></div>
                    ))}
                    
                    <div className="absolute left-1/2 top-0 bottom-0 flex items-center justify-center w-full text-xs">
                      <span className="bg-white px-2">{fruit.duration}</span>
                    </div>
                    
                    <div className="absolute right-4 top-0 bottom-0 flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-primary hover:text-primary-dark">
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{fruit.info}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grains */}
            <div>
              <h4 className="font-semibold text-lg mb-3">Grains</h4>
              <div className="space-y-4">
                {grainPlanting.map((grain) => (
                  <div key={grain.name} className="relative h-12 border border-neutral-200 rounded-lg">
                    <div className="absolute top-0 left-0 bottom-0 flex items-center pl-4 font-medium">
                      {grain.name}
                    </div>
                    
                    {grain.seasons.map((season, index) => (
                      <div 
                        key={index}
                        className={`absolute top-0 h-1 ${seasonColors[season.name as keyof typeof seasonColors]}`} 
                        style={{ left: season.position, width: season.width }}
                      ></div>
                    ))}
                    
                    <div className="absolute left-1/2 top-0 bottom-0 flex items-center justify-center w-full text-xs">
                      <span className="bg-white px-2">{grain.duration}</span>
                    </div>
                    
                    <div className="absolute right-4 top-0 bottom-0 flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-primary hover:text-primary-dark">
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{grain.info}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default PlantingCalendar;
