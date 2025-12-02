import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  name: string;
  image?: string;
  prepTime: number;
  servings: number;
  description?: string;
  ingredients: any[];
  instructions: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealPlan {
  [date: string]: {
    [mealType: string]: Recipe | null;
  };
}

interface MealPlannerProps {
  recipes: Recipe[];
  favorites: Recipe[];
  onClose: () => void;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay()); // Start from Sunday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const formatDayNumber = (date: Date): string => {
  return date.getDate().toString();
};

export const MealPlanner = ({ recipes, favorites, onClose }: MealPlannerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    return today;
  });
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: string } | null>(null);
  const { toast } = useToast();

  const weekDates = getWeekDates(currentWeekStart);
  const allRecipes = [...recipes, ...favorites.filter(f => !recipes.some(r => r.name === f.name))];

  useEffect(() => {
    const stored = localStorage.getItem("mealPlan");
    if (stored) {
      setMealPlan(JSON.parse(stored));
    }
  }, []);

  const saveMealPlan = (newPlan: MealPlan) => {
    setMealPlan(newPlan);
    localStorage.setItem("mealPlan", JSON.stringify(newPlan));
  };

  const assignRecipe = (dateKey: string, mealType: string, recipe: Recipe) => {
    const newPlan = {
      ...mealPlan,
      [dateKey]: {
        ...mealPlan[dateKey],
        [mealType]: recipe,
      },
    };
    saveMealPlan(newPlan);
    setSelectedSlot(null);
    toast({
      title: "Recipe added to meal plan",
      description: `${recipe.name} added for ${mealType}`,
    });
  };

  const removeRecipe = (dateKey: string, mealType: string) => {
    const newPlan = {
      ...mealPlan,
      [dateKey]: {
        ...mealPlan[dateKey],
        [mealType]: null,
      },
    };
    saveMealPlan(newPlan);
    toast({
      title: "Recipe removed",
      description: "Recipe removed from meal plan",
    });
  };

  const navigateWeek = (direction: number) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setCurrentWeekStart(newStart);
  };

  const clearWeek = () => {
    const newPlan = { ...mealPlan };
    weekDates.forEach(date => {
      delete newPlan[formatDateKey(date)];
    });
    saveMealPlan(newPlan);
    toast({
      title: "Week cleared",
      description: "All meals for this week have been removed",
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2 font-serif">
          <Calendar className="w-6 h-6 text-primary" />
          Meal Planner
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearWeek}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Week
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="p-2"></div>
            {weekDates.map((date) => (
              <div
                key={formatDateKey(date)}
                className={`p-2 text-center rounded-lg ${
                  isToday(date) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <div className="text-xs font-medium">{formatDayName(date)}</div>
                <div className="text-lg font-bold">{formatDayNumber(date)}</div>
              </div>
            ))}
          </div>

          {/* Meal Rows */}
          {MEAL_TYPES.map((mealType) => (
            <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
              <div className="p-2 flex items-center">
                <span className="text-sm font-medium capitalize text-muted-foreground">{mealType}</span>
              </div>
              {weekDates.map((date) => {
                const dateKey = formatDateKey(date);
                const meal = mealPlan[dateKey]?.[mealType];
                const isSelected = selectedSlot?.date === dateKey && selectedSlot?.mealType === mealType;

                return (
                  <div
                    key={`${dateKey}-${mealType}`}
                    className={`min-h-[80px] border rounded-lg p-2 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedSlot(isSelected ? null : { date: dateKey, mealType })}
                  >
                    {meal ? (
                      <div className="h-full flex flex-col">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-medium line-clamp-2">{meal.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecipe(dateKey, mealType);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {meal.nutrition && (
                          <Badge variant="outline" className="text-[10px] mt-auto w-fit">
                            {meal.nutrition.calories} cal
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                        {isSelected ? 'Select recipe' : '+ Add'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Selection */}
      {selectedSlot && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-medium">Select a recipe for {selectedSlot.mealType}</h3>
          {allRecipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recipes available. Generate some recipes or add favorites first!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
              {allRecipes.map((recipe, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start text-left"
                  onClick={() => assignRecipe(selectedSlot.date, selectedSlot.mealType, recipe)}
                >
                  <span className="font-medium text-sm line-clamp-1">{recipe.name}</span>
                  {recipe.nutrition && (
                    <span className="text-xs text-muted-foreground">{recipe.nutrition.calories} cal</span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
