import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar, ChevronLeft, ChevronRight, Trash2, ShoppingCart, GripVertical, Check } from "lucide-react";
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
      // Moving from another slot
      moveRecipe(draggedRecipe.source.date, draggedRecipe.source.mealType, dateKey, mealType);
    } else {
      // Adding from recipe list
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

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2 font-serif">
          <Calendar className="w-6 h-6 text-primary" />
          Meal Planner
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant={showGroceryList ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowGroceryList(!showGroceryList)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Grocery List
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
              {/* Missing Ingredients */}
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
              
              {/* Available Ingredients */}
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

                return (
                  <div
                    key={`${dateKey}-${mealType}`}
                    className={`min-h-[80px] border rounded-lg p-2 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    } ${isDragOver ? 'ring-2 ring-secondary bg-secondary/10' : 'hover:bg-muted/50'}`}
                    onClick={() => setSelectedSlot(isSelected ? null : { date: dateKey, mealType })}
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
                          <div className="flex items-start gap-1">
                            <GripVertical className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-xs font-medium line-clamp-2">{meal.name}</span>
                          </div>
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
                        {isDragOver ? 'Drop here' : isSelected ? 'Select recipe' : '+ Add'}
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
