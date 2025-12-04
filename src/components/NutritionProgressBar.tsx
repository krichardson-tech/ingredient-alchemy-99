import { Progress } from "@/components/ui/progress";
import { Flame, Beef, Wheat, Droplets } from "lucide-react";

interface NutritionProgressBarProps {
  current: number;
  goal: number;
  label: string;
  type: "calories" | "protein" | "carbs" | "fat";
  compact?: boolean;
}

const typeConfig = {
  calories: { icon: Flame, color: "bg-orange-500", textColor: "text-orange-500" },
  protein: { icon: Beef, color: "bg-red-500", textColor: "text-red-500" },
  carbs: { icon: Wheat, color: "bg-amber-500", textColor: "text-amber-500" },
  fat: { icon: Droplets, color: "bg-blue-500", textColor: "text-blue-500" },
};

export const NutritionProgressBar = ({ current, goal, label, type, compact = false }: NutritionProgressBarProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;
  const percentage = Math.min((current / goal) * 100, 100);
  const isOver = current > goal;

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Icon className={`h-3 w-3 ${config.textColor}`} />
            <span className="text-muted-foreground">{label}</span>
          </div>
          <span className={isOver ? "text-destructive font-medium" : ""}>
            {current}/{goal}{type !== "calories" ? "g" : ""}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${isOver ? "bg-destructive" : config.color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.textColor}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm ${isOver ? "text-destructive font-medium" : "text-muted-foreground"}`}>
          {current} / {goal}{type !== "calories" ? "g" : ""}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isOver ? "bg-destructive" : config.color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(percentage)}% of goal</span>
        {current < goal && <span>{goal - current}{type !== "calories" ? "g" : ""} remaining</span>}
        {isOver && <span className="text-destructive">Over by {current - goal}{type !== "calories" ? "g" : ""}</span>}
      </div>
    </div>
  );
};

interface DailyProgressProps {
  dayName: string;
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  goals: { dailyCalories: number; dailyProtein: number; dailyCarbs: number; dailyFat: number };
  isToday?: boolean;
}

export const DailyProgress = ({ dayName, nutrition, goals, isToday }: DailyProgressProps) => {
  const caloriePercent = Math.min((nutrition.calories / goals.dailyCalories) * 100, 100);
  const proteinPercent = Math.min((nutrition.protein / goals.dailyProtein) * 100, 100);
  const carbsPercent = Math.min((nutrition.carbs / goals.dailyCarbs) * 100, 100);
  const fatPercent = Math.min((nutrition.fat / goals.dailyFat) * 100, 100);

  return (
    <div className={`p-2 rounded-lg space-y-2 ${isToday ? 'bg-primary/10 border border-primary' : 'bg-background'}`}>
      <div className="text-xs font-medium text-center">{dayName}</div>
      
      {/* Mini progress bars */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <Flame className="h-3 w-3 text-orange-500 shrink-0" />
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-orange-500" style={{ width: `${caloriePercent}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(caloriePercent)}%</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Beef className="h-3 w-3 text-red-500 shrink-0" />
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${proteinPercent}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(proteinPercent)}%</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Wheat className="h-3 w-3 text-amber-500 shrink-0" />
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${carbsPercent}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(carbsPercent)}%</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-blue-500 shrink-0" />
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${fatPercent}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(fatPercent)}%</span>
        </div>
      </div>
    </div>
  );
};
