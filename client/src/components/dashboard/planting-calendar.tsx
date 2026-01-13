import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Calendar as CalendarIcon, Sprout, Droplets, Thermometer, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Month names for the calendar columns
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface CropInfo {
  name: string;
  category: "Vegetable" | "Fruit" | "Grain";
  startMonth: number; // 0-indexed
  endMonth: number; // 0-indexed
  info: string;
  bestSoil: string;
  watering: string;
  temp: string;
  harvestTime: string;
  tips: string[];
}

const plantingData: CropInfo[] = [
  {
    name: "Tomato",
    category: "Vegetable",
    startMonth: 6, // July
    endMonth: 11, // December
    info: "Tomatoes are a versatile crop that requires a lot of sun and regular feeding.",
    bestSoil: "Loamy, well-drained, pH 6.0-6.8",
    watering: "High (2-3 times/week)",
    temp: "21°C - 32°C",
    harvestTime: "60-80 days",
    tips: ["Use stakes for support", "Prune side shoots", "Avoid overhead watering"]
  },
  {
    name: "Cabbage",
    category: "Vegetable",
    startMonth: 9, // October
    endMonth: 1, // February
    info: "Cabbage is a cool-season crop that can handle light frost.",
    bestSoil: "Heavy clay or loamy, rich in organic matter",
    watering: "Moderate",
    temp: "15°C - 20°C",
    harvestTime: "70-100 days",
    tips: ["Keep soil consistently moist", "Watch for cabbage worms", "Rotate crops yearly"]
  },
  {
    name: "Wheat",
    category: "Grain",
    startMonth: 9, // October
    endMonth: 2, // March
    info: "Rabi wheat is sown in autumn and harvested in spring.",
    bestSoil: "Well-drained loamy soil",
    watering: "Moderate (critical at crown root stage)",
    temp: "10°C - 25°C",
    harvestTime: "120-150 days",
    tips: ["Ensure proper seed depth", "Timely irrigation is key", "Control weeds early"]
  },
  {
    name: "Mango",
    category: "Fruit",
    startMonth: 2, // March
    endMonth: 5, // June
    info: "Mangoes are the king of fruits, thriving in tropical climates.",
    bestSoil: "Deep, well-drained alluvial soil",
    watering: "Low (once established)",
    temp: "24°C - 30°C",
    harvestTime: "100-150 days from flowering",
    tips: ["Protect from frost when young", "Prune after harvest", "Monitor for mealy bugs"]
  },
  {
    name: "Rice",
    category: "Grain",
    startMonth: 5, // June
    endMonth: 9, // October
    info: "Kharif rice requires high humidity and heavy rainfall/irrigation.",
    bestSoil: "Clay or clayey loam, retains water",
    watering: "Very High (standing water)",
    temp: "20°C - 37°C",
    harvestTime: "110-150 days",
    tips: ["Land should be leveled", "Use nursery for seedlings", "Manage nitrogen levels"]
  }
];

export function PlantingCalendar({ className }: { className?: string }) {
  const [region, setRegion] = useState("Western Maharashtra");
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(null);

  const getMonthSpan = (start: number, end: number) => {
    if (start <= end) {
      return { start, span: end - start + 1 };
    } else {
      // Over-year span (e.g., Oct to Feb)
      return { start, span: 12 - start + end + 1 };
    }
  };

  const renderCropBar = (crop: CropInfo) => {
    const { start, span } = getMonthSpan(crop.startMonth, crop.endMonth);
    const colorClass =
      crop.category === "Vegetable" ? "bg-emerald-500" :
        crop.category === "Fruit" ? "bg-orange-500" : "bg-amber-600";

    // If it spans across the year (e.g., Oct to Feb), we need two parts or 
    // we can use a simpler approach for visual representation.
    // Let's handle the wraparound visually.
    const parts = [];
    if (crop.startMonth <= crop.endMonth) {
      parts.push({ start: crop.startMonth, span: crop.endMonth - crop.startMonth + 1 });
    } else {
      parts.push({ start: crop.startMonth, span: 12 - crop.startMonth });
      parts.push({ start: 0, span: crop.endMonth + 1 });
    }

    return (
      <div key={crop.name} className="relative h-14 w-full flex items-center border-b border-neutral-100 last:border-0 group">
        <div className="w-32 flex-shrink-0 font-medium text-sm text-neutral-700 pr-2">
          {crop.name}
        </div>
        <div className="flex-1 h-full relative grid grid-cols-12 gap-0">
          {/* Calendar Grid Lines */}
          {months.map((_, i) => (
            <div key={i} className="border-l border-neutral-100 h-full first:border-l-0"></div>
          ))}

          {/* Crop Activity Bar */}
          {parts.map((part, i) => (
            <div
              key={i}
              className={cn(
                "absolute h-6 rounded-full top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center text-[10px] text-white font-bold px-2 shadow-sm",
                colorClass
              )}
              style={{
                left: `${(part.start / 12) * 100}%`,
                width: `${(part.span / 12) * 100}%`,
              }}
              onClick={() => setSelectedCrop(crop)}
            >
              <span className="truncate">{crop.name}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSelectedCrop(crop)}
          className="ml-2 p-1 text-neutral-400 hover:text-primary transition-colors"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <section id="planting-calendar" className={cn("mb-10", className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-bold text-2xl text-neutral-800">Agricultural Planting Calendar</h3>
          <p className="text-neutral-500 text-sm">Optimal sowing and harvest periods for your region</p>
        </div>
        <div className="flex items-center bg-white p-1 rounded-lg border border-neutral-200">
          <span className="text-xs font-semibold text-neutral-500 px-3 uppercase tracking-wider">Region</span>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Western Maharashtra">Western Maharashtra</SelectItem>
              <SelectItem value="Vidarbha">Vidarbha</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Punjab">Punjab</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-neutral-200 shadow-md">
        <CardContent className="p-0">
          {/* Calendar Header */}
          <div className="bg-neutral-50 border-b border-neutral-200 flex py-3">
            <div className="w-32 flex-shrink-0"></div>
            <div className="flex-1 grid grid-cols-12">
              {months.map((m) => (
                <div key={m} className="text-center">
                  <span className="text-xs font-bold text-neutral-600 uppercase">{m}</span>
                </div>
              ))}
            </div>
            <div className="w-8"></div>
          </div>

          {/* Calendar Body */}
          <div className="p-4 bg-white">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Sprout className="h-3 w-3 mr-1" /> Vegetables
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <Sprout className="h-3 w-3 mr-1" /> Fruits
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Sprout className="h-3 w-3 mr-1" /> Grains
                </Badge>
              </div>

              <div className="border border-neutral-100 rounded-xl px-4 py-2">
                {plantingData.map((crop) => renderCropBar(crop))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crop Info Dialog */}
      <Dialog open={!!selectedCrop} onOpenChange={(open) => !open && setSelectedCrop(null)}>
        <DialogContent className="max-w-2xl bg-white border-0 shadow-2xl overflow-hidden p-0">
          {selectedCrop && (
            <>
              <div className={cn(
                "h-32 p-8 flex items-end relative overflow-hidden",
                selectedCrop.category === "Vegetable" ? "bg-emerald-600" :
                  selectedCrop.category === "Fruit" ? "bg-orange-500" : "bg-amber-600"
              )}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sprout className="h-40 w-40 rotate-12" />
                </div>
                <div className="relative z-10">
                  <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                    {selectedCrop.category}
                  </Badge>
                  <DialogTitle className="text-4xl font-bold text-white uppercase tracking-tight">
                    {selectedCrop.name}
                  </DialogTitle>
                </div>
              </div>

              <div className="p-8">
                <DialogDescription className="text-neutral-600 text-lg leading-relaxed mb-8">
                  {selectedCrop.info}
                </DialogDescription>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider">
                      <Thermometer className="h-4 w-4 mr-2" /> Temperature
                    </div>
                    <span className="text-neutral-800 font-medium">{selectedCrop.temp}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider">
                      <Droplets className="h-4 w-4 mr-2" /> Watering
                    </div>
                    <span className="text-neutral-800 font-medium">{selectedCrop.watering}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider">
                      <Clock className="h-4 w-4 mr-2" /> Harvest
                    </div>
                    <span className="text-neutral-800 font-medium">{selectedCrop.harvestTime}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider">
                      <CalendarIcon className="h-4 w-4 mr-2" /> Months
                    </div>
                    <span className="text-neutral-800 font-medium">
                      {months[selectedCrop.startMonth]} - {months[selectedCrop.endMonth]}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                  <h4 className="font-bold text-neutral-800 mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary" /> Expert Growing Tips
                  </h4>
                  <ul className="space-y-3">
                    {selectedCrop.tips.map((tip, i) => (
                      <li key={i} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <span className="text-neutral-700 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default PlantingCalendar;
