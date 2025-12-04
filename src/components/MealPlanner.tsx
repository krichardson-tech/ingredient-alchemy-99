import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Calendar, ChevronLeft, ChevronRight, Trash2, ShoppingCart, GripVertical, Check, Copy, Flame, Beef, Wheat, Droplets, Lightbulb } from "lucide-react";
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
  userIngredients: string[];
  onClose: () => void;
  onAddToShoppingList?: (items: string[]) => void;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay());
  
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

export const MealPlanner = ({ recipes, favorites, userIngredients, onClose, onAddToShoppingList }: MealPlannerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    return today;
  });
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: string } | null>(null);
  const [draggedRecipe, setDraggedRecipe] = useState<{ recipe: Recipe; source?: { date: string; mealType: string } } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; mealType: string } | null>(null);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showNutritionSuggestions, setShowNutritionSuggestions] = useState(false);
  const [copyingRecipe, setCopyingRecipe] = useState<{ recipe: Recipe; fromDate: string; fromMeal: string } | null>(null);
  const { toast } = useToast();

  // Default nutrition goals
  const nutritionGoals = {
    dailyCalories: 2000,
    dailyProtein: 50,
    dailyCarbs: 250,
    dailyFat: 65,
  };

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

  // Calculate daily nutrition totals
  const dailyNutrition = useMemo(() => {
    const totals: { [dateKey: string]: NutritionTotals } = {};
    
    weekDates.forEach(date => {
      const dateKey = formatDateKey(date);
      const dayPlan = mealPlan[dateKey];
      const dayTotal: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      if (dayPlan) {
        MEAL_TYPES.forEach(mealType => {
          const recipe = dayPlan[mealType];
          if (recipe?.nutrition) {
            dayTotal.calories += recipe.nutrition.calories;
            dayTotal.protein += recipe.nutrition.protein;
            dayTotal.carbs += recipe.nutrition.carbs;
            dayTotal.fat += recipe.nutrition.fat;
          }
        });
      }
      
      totals[dateKey] = dayTotal;
    });
    
    return totals;
  }, [mealPlan, weekDates]);

  // Calculate weekly nutrition totals
  const weeklyNutrition = useMemo(() => {
    const total: NutritionTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    Object.values(dailyNutrition).forEach(day => {
      total.calories += day.calories;
      total.protein += day.protein;
      total.carbs += day.carbs;
      total.fat += day.fat;
    });
    
    return total;
  }, [dailyNutrition]);

  // Calculate nutrition-based recipe suggestions
  const nutritionSuggestions = useMemo(() => {
    const suggestions: { day: string; dateKey: string; mealType: string; recipes: Recipe[]; reason: string }[] = [];
    
    weekDates.forEach(date => {
      const dateKey = formatDateKey(date);
      const dayNutrition = dailyNutrition[dateKey];
      const dayPlan = mealPlan[dateKey] || {};
      
      // Calculate remaining targets for the day
      const remainingCalories = nutritionGoals.dailyCalories - dayNutrition.calories;
      const remainingProtein = nutritionGoals.dailyProtein - dayNutrition.protein;
      const remainingCarbs = nutritionGoals.dailyCarbs - dayNutrition.carbs;
      const remainingFat = nutritionGoals.dailyFat - dayNutrition.fat;
      
      // Find empty meal slots
      MEAL_TYPES.forEach(mealType => {
        if (!dayPlan[mealType]) {
          // Filter recipes that fit the remaining nutrition targets
          const suitableRecipes = allRecipes
            .filter(recipe => recipe.nutrition)
            .filter(recipe => {
              const n = recipe.nutrition!;
              return n.calories <= remainingCalories + 100 && // Allow some flexibility
                n.calories >= 100; // Minimum meaningful calories
            })
            .sort((a, b) => {
              // Score recipes based on how well they fill macro gaps
              const scoreA = calculateNutritionScore(a.nutrition!, remainingProtein, remainingCarbs, remainingFat);
              const scoreB = calculateNutritionScore(b.nutrition!, remainingProtein, remainingCarbs, remainingFat);
              return scoreB - scoreA;
            })
            .slice(0, 3);
          
          if (suitableRecipes.length > 0 && remainingCalories > 200) {
            let reason = `~${Math.round(remainingCalories)} cal remaining`;
            if (remainingProtein > 15) reason += `, need ${Math.round(remainingProtein)}g protein`;
            
            suggestions.push({
              day: formatDayName(date),
              dateKey,
              mealType,
              recipes: suitableRecipes,
              reason,
            });
          }
        }
      });
    });
    
    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }, [weekDates, dailyNutrition, mealPlan, allRecipes, nutritionGoals]);

  const calculateNutritionScore = (
    nutrition: { calories: number; protein: number; carbs: number; fat: number },
    targetProtein: number,
    targetCarbs: number,
    targetFat: number
  ): number => {
    // Higher score = better fit for remaining targets
    let score = 0;
    if (targetProtein > 0) score += Math.min(nutrition.protein / targetProtein, 1) * 40;
    if (targetCarbs > 0) score += Math.min(nutrition.carbs / targetCarbs, 1) * 30;
    if (targetFat > 0) score += Math.min(nutrition.fat / targetFat, 1) * 30;
    return score;
  };

  // Calculate weekly grocery list
  const weeklyGroceryList = useMemo(() => {
    const ingredientMap = new Map<string, { amount: string; needed: boolean }>();
    
    weekDates.forEach(date => {
      const dateKey = formatDateKey(date);
      const dayPlan = mealPlan[dateKey];
      if (!dayPlan) return;
      
      MEAL_TYPES.forEach(mealType => {
        const recipe = dayPlan[mealType];
        if (!recipe?.ingredients) return;
        
        recipe.ingredients.forEach((ing: any) => {
          const name = (typeof ing === 'string' ? ing : ing.name).toLowerCase();
          const amount = typeof ing === 'string' ? '' : `${ing.amount || ''} ${ing.unit || ''}`.trim();
          
          const isAvailable = userIngredients.some(userIng => 
            name.includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(name)
          );
          
          if (ingredientMap.has(name)) {
            const existing = ingredientMap.get(name)!;
            if (amount && existing.amount) {
              existing.amount = `${existing.amount}, ${amount}`;
            }
          } else {
            ingredientMap.set(name, { amount, needed: !isAvailable });
          }
        });
      });
    });
    
    return Array.from(ingredientMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => (b.needed ? 1 : 0) - (a.needed ? 1 : 0));
  }, [mealPlan, weekDates, userIngredients]);

  const missingIngredients = weeklyGroceryList.filter(i => i.needed);

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
    setCopyingRecipe(null);
    toast({
      title: copyingRecipe ? "Recipe copied" : "Recipe added to meal plan",
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
  };

  const moveRecipe = (fromDate: string, fromMeal: string, toDate: string, toMeal: string) => {
    const recipe = mealPlan[fromDate]?.[fromMeal];
    if (!recipe) return;
    
    const newPlan = {
      ...mealPlan,
      [fromDate]: {
        ...mealPlan[fromDate],
        [fromMeal]: null,
      },
      [toDate]: {
        ...mealPlan[toDate],
        [toMeal]: recipe,
      },
    };
    saveMealPlan(newPlan);
    toast({
      title: "Recipe moved",
      description: `${recipe.name} moved to ${toMeal}`,
    });
  };

  const startCopyRecipe = (recipe: Recipe, dateKey: string, mealType: string) => {
    setCopyingRecipe({ recipe, fromDate: dateKey, fromMeal: mealType });
    setSelectedSlot(null);
    toast({
      title: "Select destination",
      description: "Click on an empty slot to paste the recipe",
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

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, recipe: Recipe, source?: { date: string; mealType: string }) => {
    setDraggedRecipe({ recipe, source });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateKey: string, mealType: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date: dateKey, mealType });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, dateKey: string, mealType: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (!draggedRecipe) return;
    
    if (draggedRecipe.source) {
      moveRecipe(draggedRecipe.source.date, draggedRecipe.source.mealType, dateKey, mealType);
    } else {
      assignRecipe(dateKey, mealType, draggedRecipe.recipe);
    }
    
    setDraggedRecipe(null);
  };

  const handleDragEnd = () => {
    setDraggedRecipe(null);
    setDragOverSlot(null);
  };

  const addAllToShoppingList = () => {
    if (onAddToShoppingList && missingIngredients.length > 0) {
      const items = missingIngredients.map(i => i.amount ? `${i.amount} ${i.name}` : i.name);
      onAddToShoppingList(items);
      toast({
        title: "Added to shopping list",
        description: `${missingIngredients.length} ingredients added`,
      });
    }
  };

  const handleSlotClick = (dateKey: string, mealType: string) => {
    if (copyingRecipe) {
      assignRecipe(dateKey, mealType, copyingRecipe.recipe);
    } else {
      const isSelected = selectedSlot?.date === dateKey && selectedSlot?.mealType === mealType;
      setSelectedSlot(isSelected ? null : { date: dateKey, mealType });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2 font-serif">
          <Calendar className="w-6 h-6 text-primary" />
          Meal Planner
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant={showNutrition ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowNutrition(!showNutrition)}
          >
            <Flame className="h-4 w-4 mr-1" />
            Nutrition
          </Button>
          <Button 
            variant={showGroceryList ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowGroceryList(!showGroceryList)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Grocery
            {missingIngredients.length > 0 && (
              <Badge variant="secondary" className="ml-1">{missingIngredients.length}</Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={clearWeek}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Copy Mode Indicator */}
      {copyingRecipe && (
        <Card className="p-3 bg-secondary/20 border-secondary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-secondary" />
              <span className="text-sm">Copying: <strong>{copyingRecipe.recipe.name}</strong> - Click on any slot to paste</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCopyingRecipe(null)}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Nutrition Summary */}
      {showNutrition && (
        <Card className="p-4 bg-muted/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              Weekly Nutrition Summary
            </h3>
            <div className="flex items-center gap-2">
              <Switch
                id="nutrition-suggestions"
                checked={showNutritionSuggestions}
                onCheckedChange={setShowNutritionSuggestions}
              />
              <Label htmlFor="nutrition-suggestions" className="text-sm cursor-pointer">
                Show Suggestions
              </Label>
            </div>
          </div>
          
          {/* Weekly Totals */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-background rounded-lg">
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{weeklyNutrition.calories.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Beef className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{weeklyNutrition.protein}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Wheat className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{weeklyNutrition.carbs}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{weeklyNutrition.fat}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
          </div>

          {/* Nutrition-Based Suggestions */}
          {showNutritionSuggestions && nutritionSuggestions.length > 0 && (
            <div className="space-y-3 border-t pt-3">
              <h4 className="text-sm font-medium flex items-center gap-2 text-secondary">
                <Lightbulb className="h-4 w-4" />
                Recipe Suggestions to Meet Goals
              </h4>
              <div className="grid gap-2 max-h-[200px] overflow-y-auto">
                {nutritionSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-background rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {suggestion.day} - {suggestion.mealType}
                      </span>
                      <span className="text-xs text-muted-foreground">{suggestion.reason}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.recipes.map((recipe, rIdx) => (
                        <Button
                          key={rIdx}
                          variant="outline"
                          size="sm"
                          className="h-auto py-1 px-2 text-xs"
                          onClick={() => assignRecipe(suggestion.dateKey, suggestion.mealType, recipe)}
                        >
                          {recipe.name}
                          {recipe.nutrition && (
                            <Badge variant="secondary" className="ml-1 text-[10px]">
                              {recipe.nutrition.calories}cal
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showNutritionSuggestions && nutritionSuggestions.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-2 border-t">
              No suggestions available. Add more recipes or clear some meal slots.
            </div>
          )}

          {/* Daily Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Daily Breakdown</h4>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {weekDates.map((date) => {
                const dateKey = formatDateKey(date);
                const dayNutrition = dailyNutrition[dateKey];
                const hasNutrition = dayNutrition.calories > 0;
                
                return (
                  <div 
                    key={dateKey} 
                    className={`p-2 rounded-lg ${isToday(date) ? 'bg-primary/10 border border-primary' : 'bg-background'}`}
                  >
                    <div className="font-medium mb-1">{formatDayName(date)}</div>
                    {hasNutrition ? (
                      <>
                        <div className="text-orange-500 font-semibold">{dayNutrition.calories}</div>
                        <div className="text-muted-foreground">cal</div>
                        <div className="mt-1 space-y-0.5">
                          <div>P: {dayNutrition.protein}g</div>
                          <div>C: {dayNutrition.carbs}g</div>
                          <div>F: {dayNutrition.fat}g</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">No meals</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Grocery Summary */}
      {showGroceryList && (
        <Card className="p-4 bg-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Weekly Grocery Summary
            </h3>
            {missingIngredients.length > 0 && onAddToShoppingList && (
              <Button size="sm" onClick={addAllToShoppingList}>
                Add All to Shopping List
              </Button>
            )}
          </div>
          
          {weeklyGroceryList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meals planned yet. Add recipes to see ingredients!</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2">Need to Buy ({missingIngredients.length})</h4>
                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  {missingIngredients.length === 0 ? (
                    <p className="text-xs text-muted-foreground">You have all ingredients!</p>
                  ) : (
                    missingIngredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                        <span className="capitalize">{ing.name}</span>
                        {ing.amount && <span className="text-xs text-muted-foreground">({ing.amount})</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-accent mb-2">Already Have ({weeklyGroceryList.length - missingIngredients.length})</h4>
                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  {weeklyGroceryList.filter(i => !i.needed).map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3 h-3 text-accent shrink-0" />
                      <span className="capitalize">{ing.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

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
                const isDragOver = dragOverSlot?.date === dateKey && dragOverSlot?.mealType === mealType;
                const isCopyTarget = copyingRecipe && !meal;

                return (
                  <div
                    key={`${dateKey}-${mealType}`}
                    className={`min-h-[80px] border rounded-lg p-2 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    } ${isDragOver ? 'ring-2 ring-secondary bg-secondary/10' : ''} ${
                      isCopyTarget ? 'ring-2 ring-secondary/50 bg-secondary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSlotClick(dateKey, mealType)}
                    onDragOver={(e) => handleDragOver(e, dateKey, mealType)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, dateKey, mealType)}
                  >
                    {meal ? (
                      <div 
                        className="h-full flex flex-col cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, meal, { date: dateKey, mealType })}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-start gap-1 flex-1 min-w-0">
                            <GripVertical className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-xs font-medium line-clamp-2">{meal.name}</span>
                          </div>
                          <div className="flex shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                startCopyRecipe(meal, dateKey, mealType);
                              }}
                              title="Copy to another slot"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecipe(dateKey, mealType);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {meal.nutrition && (
                          <Badge variant="outline" className="text-[10px] mt-auto w-fit">
                            {meal.nutrition.calories} cal
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                        {isDragOver ? 'Drop here' : isCopyTarget ? 'Click to paste' : isSelected ? 'Select recipe' : '+ Add'}
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
      {selectedSlot && !copyingRecipe && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-medium">Select a recipe for {selectedSlot.mealType} <span className="text-xs text-muted-foreground">(or drag & drop)</span></h3>
          {allRecipes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recipes available. Generate some recipes or add favorites first!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
              {allRecipes.map((recipe, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Button
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-start text-left w-full"
                    onClick={() => assignRecipe(selectedSlot.date, selectedSlot.mealType, recipe)}
                  >
                    <div className="flex items-center gap-1 w-full">
                      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm line-clamp-1">{recipe.name}</span>
                    </div>
                    {recipe.nutrition && (
                      <span className="text-xs text-muted-foreground ml-4">{recipe.nutrition.calories} cal</span>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
