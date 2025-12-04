import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, ChefHat, Sparkles, Loader2, Clock, Users, Sandwich, Salad, UtensilsCrossed, Coffee, Fish, RotateCcw, Soup, Shell, Repeat, Heart, ShoppingCart, Search, Calendar, Sun, Moon, FileDown } from "lucide-react";
import { MealPlanner } from "@/components/MealPlanner";
import { RecipeImport } from "@/components/RecipeImport";
import { useToast } from "@/hooks/use-toast";

const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(!isDark) };
};

type DietaryRestriction = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free";
type CuisineType = "italian" | "asian" | "mexican" | "mediterranean" | "american";
type FlavorPreference = "spicy" | "sweet" | "savory" | "tangy" | "mild" | "bold";
type TasteSensation = "umami" | "salty" | "sour" | "bitter" | "sweet";

const ingredientSubstitutions: { [key: string]: string[] } = {
  "butter": ["margarine", "coconut oil", "olive oil", "ghee"],
  "milk": ["almond milk", "soy milk", "oat milk", "coconut milk"],
  "eggs": ["flax eggs", "chia eggs", "applesauce", "banana"],
  "flour": ["almond flour", "coconut flour", "oat flour", "gluten-free flour"],
  "sugar": ["honey", "maple syrup", "agave nectar", "stevia"],
  "chicken": ["turkey", "tofu", "tempeh", "seitan"],
  "beef": ["ground turkey", "lentils", "mushrooms", "plant-based meat"],
  "cheese": ["nutritional yeast", "cashew cheese", "vegan cheese", "coconut cream"],
  "cream": ["coconut cream", "cashew cream", "silken tofu", "greek yogurt"],
  "yogurt": ["greek yogurt", "coconut yogurt", "sour cream", "buttermilk"],
  "soy sauce": ["tamari", "coconut aminos", "worcestershire sauce", "liquid aminos"],
  "bread": ["gluten-free bread", "lettuce wraps", "rice cakes", "tortillas"],
  "pasta": ["zucchini noodles", "rice noodles", "gluten-free pasta", "spaghetti squash"],
  "rice": ["cauliflower rice", "quinoa", "couscous", "bulgur"],
  "oil": ["butter", "coconut oil", "avocado oil", "ghee"],
};

const ingredientPresets = [
  {
    name: "Quick Pasta Night",
    icon: Soup,
    ingredients: ["pasta", "tomato sauce", "garlic", "olive oil", "basil", "parmesan cheese"],
  },
  {
    name: "Sandwich Bar",
    icon: Sandwich,
    ingredients: ["bread", "lettuce", "tomato", "cheese", "deli meat", "mayo", "mustard"],
  },
  {
    name: "Breakfast Basics",
    icon: Coffee,
    ingredients: ["eggs", "bread", "butter", "bacon", "milk", "cheese"],
  },
  {
    name: "Stir Fry Station",
    icon: UtensilsCrossed,
    ingredients: ["rice", "soy sauce", "mixed vegetables", "chicken breast", "garlic", "ginger"],
  },
  {
    name: "Taco Tuesday",
    icon: Shell,
    ingredients: ["tortillas", "ground beef", "lettuce", "cheese", "tomato", "salsa", "sour cream"],
  },
  {
    name: "Fresh Salad Bowl",
    icon: Salad,
    ingredients: ["lettuce", "cucumber", "tomato", "carrots", "olive oil", "vinegar", "feta cheese"],
  },
];

const decimalToFraction = (decimal: number): string => {
  const tolerance = 0.01;
  const whole = Math.floor(decimal);
  const fractionalPart = decimal - whole;
  
  if (fractionalPart < tolerance) {
    return whole.toString();
  }
  
  // Common fractions
  const fractions: [number, string][] = [
    [0.125, '1/8'],
    [0.25, '1/4'],
    [0.333, '1/3'],
    [0.375, '3/8'],
    [0.5, '1/2'],
    [0.625, '5/8'],
    [0.666, '2/3'],
    [0.75, '3/4'],
    [0.875, '7/8'],
  ];
  
  for (const [value, fraction] of fractions) {
    if (Math.abs(fractionalPart - value) < tolerance) {
      return whole > 0 ? `${whole} ${fraction}` : fraction;
    }
  }
  
  // For other decimals, use simple fraction approximation
  const denominators = [2, 3, 4, 5, 8];
  for (const denom of denominators) {
    const numer = Math.round(fractionalPart * denom);
    if (Math.abs(numer / denom - fractionalPart) < tolerance) {
      return whole > 0 ? `${whole} ${numer}/${denom}` : `${numer}/${denom}`;
    }
  }
  
  // Fallback to one decimal place
  return decimal.toFixed(1);
};

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<CuisineType[]>([]);
  const [flavorPreferences, setFlavorPreferences] = useState<FlavorPreference[]>([]);
  const [tasteSensations, setTasteSensations] = useState<TasteSensation[]>([]);
  const [mealType, setMealType] = useState<string[]>([]);
  const [lastGenerationParams, setLastGenerationParams] = useState<{
    ingredients: string[];
    dietaryRestrictions: DietaryRestriction[];
    cuisinePreferences: CuisineType[];
    flavorPreferences: FlavorPreference[];
    tasteSensations: TasteSensation[];
    mealType: string[];
  } | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllShownMessage, setShowAllShownMessage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);
  const [servingSizes, setServingSizes] = useState<{ [key: string | number]: number }>({});
  const [ingredientSubstitutes, setIngredientSubstitutes] = useState<{ [recipeIndex: string | number]: { [ingredientIndex: number]: string } }>({});
  const [showSubstituteFor, setShowSubstituteFor] = useState<{ recipeIndex: string | number; ingredientIndex: number } | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [showRecipeImport, setShowRecipeImport] = useState(false);
  const [selectedFavoriteIndex, setSelectedFavoriteIndex] = useState<number | null>(null);
  const favoritesRef = useRef<HTMLDivElement>(null);
  const shoppingListRef = useRef<HTMLDivElement>(null);
  const mealPlannerRef = useRef<HTMLDivElement>(null);
  const recipeImportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("ingredients");
    if (stored) {
      setIngredients(JSON.parse(stored));
    }
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (recipe: any) => {
    const isFavorite = favorites.some(fav => fav.name === recipe.name);
    let updated;
    if (isFavorite) {
      updated = favorites.filter(fav => fav.name !== recipe.name);
      toast({
        title: "Removed from favorites",
        description: `${recipe.name} has been removed from your favorites.`,
      });
    } else {
      updated = [...favorites, recipe];
      toast({
        title: "Added to favorites! ❤️",
        description: `${recipe.name} has been saved to your favorites.`,
      });
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleImportRecipe = (recipe: any) => {
    const updated = [...favorites, recipe];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setShowRecipeImport(false);
  };

  const addToShoppingList = (recipe: any) => {
    const missingIngredients = recipe.ingredients
      .filter((ing: any) => {
        const ingredientName = (typeof ing === 'string' ? ing : ing.name).toLowerCase();
        return !ingredients.some(userIng => 
          ingredientName.includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(ingredientName)
        );
      })
      .map((ing: any) => typeof ing === 'string' ? ing : `${ing.amount} ${ing.name}`);

    if (missingIngredients.length === 0) {
      toast({
        title: "No missing ingredients",
        description: "You already have all the ingredients for this recipe!",
      });
      return;
    }

    const newItems = missingIngredients.filter((item: string) => !shoppingList.includes(item));
    if (newItems.length > 0) {
      const updated = [...shoppingList, ...newItems];
      setShoppingList(updated);
      toast({
        title: "Added to shopping list! 🛒",
        description: `${newItems.length} missing ingredients added.`,
      });
    } else {
      toast({
        title: "Already in shopping list",
        description: "These items are already in your shopping list.",
      });
    }
  };

  const removeFromShoppingList = (index: number) => {
    setShoppingList(prev => prev.filter((_, i) => i !== index));
  };

  const clearShoppingList = () => {
    setShoppingList([]);
    toast({
      title: "Shopping list cleared",
      description: "All items have been removed from your shopping list.",
    });
  };

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      const updated = [...ingredients, currentIngredient.trim()];
      setIngredients(updated);
      localStorage.setItem("ingredients", JSON.stringify(updated));
      setCurrentIngredient("");
      toast({
        title: "Ingredient added!",
        description: `${currentIngredient} has been added to your pantry.`,
      });
    }
  };

  const loadPresetIngredients = (presetIngredients: string[], presetName: string) => {
    setIngredients(presetIngredients);
    localStorage.setItem("ingredients", JSON.stringify(presetIngredients));
    toast({
      title: "Preset loaded!",
      description: `${presetName} ingredients have been added to your pantry.`,
    });
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
    localStorage.setItem("ingredients", JSON.stringify(updated));
  };

  const resetAll = () => {
    setIngredients([]);
    setGeneratedRecipes([]);
    setAllRecipes([]);
    setCurrentIndex(0);
    setShowAllShownMessage(false);
    setSelectedRecipeIndex(null);
    setServingSizes({});
    localStorage.removeItem("ingredients");
    toast({
      title: "Reset complete!",
      description: "All ingredients and recipes have been cleared.",
    });
  };

  const toggleDietaryRestriction = (restriction: DietaryRestriction) => {
    setDietaryRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const toggleCuisine = (cuisine: CuisineType) => {
    setCuisinePreferences(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleFlavor = (flavor: FlavorPreference) => {
    setFlavorPreferences(prev =>
      prev.includes(flavor)
        ? prev.filter(f => f !== flavor)
        : [...prev, flavor]
    );
  };

  const toggleTaste = (taste: TasteSensation) => {
    setTasteSensations(prev =>
      prev.includes(taste)
        ? prev.filter(t => t !== taste)
        : [...prev, taste]
    );
  };

  const filterRecipesBySearch = (recipes: any[]) => {
    if (!searchQuery.trim()) return recipes;
    
    const query = searchQuery.toLowerCase();
    return recipes.filter(recipe => {
      // Search in recipe name
      if (recipe.name.toLowerCase().includes(query)) return true;
      
      // Search in ingredients
      const hasIngredient = recipe.ingredients?.some((ing: any) => 
        ing.name.toLowerCase().includes(query)
      );
      if (hasIngredient) return true;
      
      return false;
    });
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add some ingredients first!",
        variant: "destructive",
      });
      return;
    }

    // Check if parameters have changed since last generation
    const currentParams = {
      ingredients: [...ingredients],
      dietaryRestrictions: [...dietaryRestrictions],
      cuisinePreferences: [...cuisinePreferences],
      flavorPreferences: [...flavorPreferences],
      tasteSensations: [...tasteSensations],
      mealType: [...mealType],
    };
    
    const paramsChanged = lastGenerationParams === null || 
      JSON.stringify(currentParams) !== JSON.stringify(lastGenerationParams);

    // If parameters changed, clear cache and force new generation
    if (paramsChanged) {
      setAllRecipes([]);
      setCurrentIndex(0);
      setShowAllShownMessage(false);
    }

    // If we have recipes cached and haven't shown them all yet, show next batch
    if (allRecipes.length > 0 && currentIndex < allRecipes.length && !paramsChanged) {
      const nextRecipes = allRecipes.slice(currentIndex, currentIndex + 3);
      setGeneratedRecipes(nextRecipes);
      setCurrentIndex(prev => prev + 3);
      
      if (currentIndex + 3 >= allRecipes.length) {
        setShowAllShownMessage(true);
      }
      
      toast({
        title: "More recipes! 🎉",
        description: `Showing ${nextRecipes.length} more delicious recipes`,
      });
      return;
    }

    // If we've shown all recipes, cycle back to the beginning
    if (allRecipes.length > 0 && currentIndex >= allRecipes.length && !paramsChanged) {
      setCurrentIndex(0);
      setGeneratedRecipes(allRecipes.slice(0, 3));
      setShowAllShownMessage(false);
      toast({
        title: "Starting over! 🔄",
        description: "Showing recipes from the beginning",
      });
      return;
    }

    // Fetch new recipes from API
    setIsGenerating(true);
    setGeneratedRecipes([]);
    setShowAllShownMessage(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ingredients,
            dietaryRestrictions: dietaryRestrictions.map(d => 
              d.charAt(0).toUpperCase() + d.slice(1).replace('-', ' ')
            ),
            cuisinePreference: cuisinePreferences,
            flavorPreferences,
            tasteSensations,
            mealType,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        
        // Handle quota limit error specifically
        if (response.status === 402) {
          toast({
            title: "API Limit Reached",
            description: error.error || "The recipe API daily limit has been reached. Please try again tomorrow.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
        
        // Handle no recipes found
        if (response.status === 404) {
          toast({
            title: "No Recipes Found",
            description: error.error || "No recipes match your current preferences and ingredients.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
        
        throw new Error(error.error || 'Failed to generate recipes');
      }

      const data = await response.json();
      setAllRecipes(data.recipes);
      setCurrentIndex(3);
      setGeneratedRecipes(data.recipes.slice(0, 3));
      setLastGenerationParams(currentParams);
      
      // Initialize serving sizes for new recipes
      const initialServings: { [key: number]: number } = {};
      data.recipes.forEach((recipe: any, idx: number) => {
        initialServings[idx] = recipe.servings;
      });
      setServingSizes(initialServings);
      
      toast({
        title: "Recipes generated! ✨",
        description: `Found ${data.recipes.length} delicious recipes! Click again for more.`,
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="relative text-center space-y-2">
          {/* Theme Toggle - Top Left */}
          <div className="absolute top-0 left-0">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <div className="absolute top-0 right-0 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowFavorites(!showFavorites);
                if (!showFavorites) {
                  setTimeout(() => {
                    favoritesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
              className="hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-all"
              title="View favorites"
            >
              <Heart className={`h-4 w-4 ${favorites.length > 0 ? 'fill-accent text-accent' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowShoppingList(!showShoppingList);
                if (!showShoppingList) {
                  setTimeout(() => {
                    shoppingListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
              className="hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-all relative"
              title="View shopping list"
            >
              <ShoppingCart className="h-4 w-4" />
              {shoppingList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {shoppingList.length}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowMealPlanner(!showMealPlanner);
                if (!showMealPlanner) {
                  setTimeout(() => {
                    mealPlannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
              title="Meal Planner"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowRecipeImport(!showRecipeImport);
                if (!showRecipeImport) {
                  setTimeout(() => {
                    recipeImportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
              className="hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50 transition-all"
              title="Import Recipe"
            >
              <FileDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={resetAll}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
              title="Reset all ingredients and recipes"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl animate-float">🧙‍♀️</span>
            <ChefHat className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-serif">Ingredient Alchemy</h1>
            <span className="text-4xl animate-float" style={{ animationDelay: '1s' }}>✨</span>
          </div>
          <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
            <span className="animate-bounce-slow">🥘</span>
            Transform your ingredients into delicious recipes
            <span className="animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🍳</span>
          </p>
        </header>

        <Card className="p-6 border-accent/30">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            <h2 className="text-2xl font-semibold text-accent">Quick Start Presets</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Click a preset to quickly fill your pantry with common meal ingredients
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ingredientPresets.map((preset) => {
              const IconComponent = preset.icon;
              return (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent/10 hover:border-accent/50 transition-all hover-scale"
                  onClick={() => loadPresetIngredients(preset.ingredients, preset.name)}
                >
                  <IconComponent className="h-6 w-6 text-accent" />
                  <span className="text-sm font-medium text-center">{preset.name}</span>
                </Button>
              );
            })}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2 font-serif">
              <span className="text-2xl animate-spin-slow">🥕</span>
              <Plus className="w-6 h-6 text-primary" />
              Your Ingredients
            </h2>
            
            <div className="flex gap-2">
              <Input
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                placeholder="Add an ingredient..."
                className="flex-1"
              />
              <Button onClick={addIngredient} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[100px]">
              {ingredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm px-3 py-1.5 flex items-center gap-2"
                >
                  {ingredient}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeIngredient(index)}
                  />
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold font-serif flex items-center gap-2">
              <span className="text-2xl animate-pulse-scale">⚙️</span>
              Preferences
            </h2>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Dietary Restrictions</h3>
              <div className="space-y-2">
                {(["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"] as DietaryRestriction[]).map((restriction) => (
                  <div key={restriction} className="flex items-center gap-2">
                    <Checkbox
                      id={restriction}
                      checked={dietaryRestrictions.includes(restriction)}
                      onCheckedChange={() => toggleDietaryRestriction(restriction)}
                    />
                    <Label htmlFor={restriction} className="capitalize cursor-pointer">
                      {restriction}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Cuisine Preferences</h3>
              <div className="space-y-2">
                {(["italian", "asian", "mexican", "mediterranean", "american"] as CuisineType[]).map((cuisine) => (
                  <div key={cuisine} className="flex items-center gap-2">
                    <Checkbox
                      id={cuisine}
                      checked={cuisinePreferences.includes(cuisine)}
                      onCheckedChange={() => toggleCuisine(cuisine)}
                    />
                    <Label htmlFor={cuisine} className="capitalize cursor-pointer">
                      {cuisine}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Flavor Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {(["spicy", "sweet", "savory", "tangy", "mild", "bold"] as FlavorPreference[]).map((flavor) => (
                  <Badge
                    key={flavor}
                    variant={flavorPreferences.includes(flavor) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFlavor(flavor)}
                  >
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Taste Sensations</h3>
              <div className="flex flex-wrap gap-2">
                {(["umami", "salty", "sour", "bitter", "sweet"] as TasteSensation[]).map((taste) => (
                  <Badge
                    key={taste}
                    variant={tasteSensations.includes(taste) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleTaste(taste)}
                  >
                    {taste}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Recipe Categories</h3>
              <div className="flex flex-wrap gap-2">
                {["breakfast", "brunch", "lunch", "dinner", "dessert", "snack", "appetizer", "side dish", "soup", "salad", "beverage"].map((category) => (
                  <Badge
                    key={category}
                    variant={mealType.includes(category) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      setMealType(prev =>
                        prev.includes(category)
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      );
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateRecipe}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="text-lg mr-2 animate-spin-slow">🔮</span>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <span className="text-lg mr-2">🪄</span>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Recipe
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Meal Planner */}
        {showMealPlanner && (
          <div ref={mealPlannerRef}>
            <MealPlanner
              recipes={allRecipes}
              favorites={favorites}
              userIngredients={ingredients}
              onClose={() => setShowMealPlanner(false)}
              onAddToShoppingList={(items) => {
                const newItems = items.filter(item => !shoppingList.includes(item));
                if (newItems.length > 0) {
                  setShoppingList(prev => [...prev, ...newItems]);
                  toast({
                    title: "Added to shopping list! 🛒",
                    description: `${newItems.length} ingredients added.`,
                  });
                }
              }}
            />
          </div>
        )}

        {/* Recipe Import */}
        {showRecipeImport && (
          <div ref={recipeImportRef}>
            <RecipeImport
              onImport={handleImportRecipe}
              onClose={() => setShowRecipeImport(false)}
            />
          </div>
        )}

        {showFavorites && (
          <Card ref={favoritesRef} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Heart className="w-6 h-6 text-accent fill-accent" />
                Your Favorites
              </h2>
            <Button variant="ghost" size="sm" onClick={() => setShowFavorites(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Input for Favorites */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search favorite recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {favorites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No favorites yet. Add some recipes to your favorites!</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterRecipesBySearch(favorites).length === 0 && searchQuery ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p className="text-lg">No favorite recipes found matching "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try searching with different keywords</p>
                </div>
              ) : (
                filterRecipesBySearch(favorites).map((recipe, idx) => {
                  const isSelected = selectedFavoriteIndex === idx;
                  const currentServings = servingSizes[`fav_${idx}`] || recipe.servings;
                  const servingMultiplier = currentServings / recipe.servings;
                  
                  return (
                    <Card 
                      key={idx} 
                      className={`overflow-hidden flex flex-col cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}
                      onClick={() => setSelectedFavoriteIndex(isSelected ? null : idx)}
                    >
                      {recipe.image && (
                        <img 
                          src={recipe.image} 
                          alt={recipe.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6 space-y-4 flex-1 flex flex-col">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xl font-bold text-foreground font-serif flex-1">{recipe.name}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(recipe);
                              }}
                            >
                              <Heart className="h-4 w-4 fill-accent text-accent" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                          {recipe.nutrition && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline" className="gap-1">
                                <span className="font-semibold">{recipe.nutrition.calories}</span> cal
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <span className="font-semibold">{recipe.nutrition.protein}g</span> protein
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <span className="font-semibold">{recipe.nutrition.carbs}g</span> carbs
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <span className="font-semibold">{recipe.nutrition.fat}g</span> fat
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4 text-sm items-center flex-wrap">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{Math.round(recipe.prepTime * servingMultiplier)} mins</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{currentServings} servings</span>
                          </div>
                          {isSelected && (
                            <Select
                              value={currentServings.toString()}
                              onValueChange={(value) => {
                                setServingSizes(prev => ({
                                  ...prev,
                                  [`fav_${idx}`]: parseInt(value)
                                }));
                              }}
                            >
                              <SelectTrigger className="w-20 h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 4, 6, 8, 10, 12].map(size => (
                                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        <div className="space-y-2 flex-1">
                          <h4 className="font-semibold text-sm font-serif flex items-center gap-1">
                            <span className="animate-bounce-slow">🥗</span>
                            Ingredients
                          </h4>
                          <ul className="text-xs space-y-1 max-h-32 overflow-y-auto text-muted-foreground">
                            {(isSelected ? recipe.ingredients : recipe.ingredients.slice(0, 6)).map((ing: any, i: number) => {
                              const ingredientName = (typeof ing === 'string' ? ing : ing.name).toLowerCase();
                              const hasIngredient = ingredients.some(userIng => 
                                ingredientName.includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(ingredientName)
                              );
                              
                              let displayAmount = ing.amount;
                              if (typeof ing === 'object' && ing.amount) {
                                const numMatch = ing.amount.match(/[\d.]+/);
                                if (numMatch) {
                                  const originalAmount = parseFloat(numMatch[0]);
                                  const adjustedAmount = decimalToFraction(originalAmount * servingMultiplier);
                                  displayAmount = ing.amount.replace(numMatch[0], adjustedAmount);
                                }
                              }

                              const substitutionKey = Object.keys(ingredientSubstitutions).find(key => 
                                ingredientName.includes(key.toLowerCase())
                              );
                              const hasSubstitutes = !!substitutionKey;
                              
                              const favKey = `fav_${idx}`;
                              const currentSubstitute = ingredientSubstitutes[favKey]?.[i];
                              const displayIngredient = currentSubstitute || (typeof ing === 'string' ? ing : `${displayAmount} ${ing.name}`);
                              
                              const isShowingSubstitutes = showSubstituteFor?.recipeIndex === favKey && showSubstituteFor?.ingredientIndex === i;
                              
                              return (
                                <li key={i} className={`${!hasIngredient ? 'text-destructive font-semibold' : ''} ${hasSubstitutes ? 'flex items-start gap-2' : ''}`}>
                                  <span className="flex-1">
                                    • {displayIngredient}
                                  </span>
                                  {hasSubstitutes && (
                                    <div className="relative">
                                      <Repeat 
                                        className="w-3 h-3 cursor-pointer text-accent hover:text-accent/80 flex-shrink-0 mt-0.5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowSubstituteFor(
                                            isShowingSubstitutes 
                                              ? null 
                                              : { recipeIndex: favKey, ingredientIndex: i }
                                          );
                                        }}
                                      />
                                      {isShowingSubstitutes && (
                                        <div 
                                          className="absolute right-0 mt-1 bg-popover border border-border rounded-md shadow-lg p-2 z-50 min-w-[150px]"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="text-xs font-semibold mb-1 text-foreground">Substitutes:</div>
                                          <div className="space-y-1">
                                            <button
                                              className="block w-full text-left px-2 py-1 text-xs hover:bg-accent/10 rounded"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setIngredientSubstitutes(prev => {
                                                  const updated = { ...prev };
                                                  if (updated[favKey]) {
                                                    delete updated[favKey][i];
                                                  }
                                                  return updated;
                                                });
                                                setShowSubstituteFor(null);
                                              }}
                                            >
                                              ↻ Original: {typeof ing === 'string' ? ing : ing.name}
                                            </button>
                                            {ingredientSubstitutions[substitutionKey!].map((sub, subIdx) => (
                                              <button
                                                key={subIdx}
                                                className="block w-full text-left px-2 py-1 text-xs hover:bg-accent/10 rounded"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setIngredientSubstitutes(prev => ({
                                                    ...prev,
                                                    [favKey]: {
                                                      ...prev[favKey],
                                                      [i]: `${typeof ing === 'object' ? displayAmount : ''} ${sub}`.trim()
                                                    }
                                                  }));
                                                  setShowSubstituteFor(null);
                                                  toast({
                                                    title: "Substitute selected",
                                                    description: `Switched to ${sub}`,
                                                  });
                                                }}
                                              >
                                                {sub}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                            {!isSelected && recipe.ingredients.length > 6 && (
                              <li className="text-primary font-medium">+ {recipe.ingredients.length - 6} more...</li>
                            )}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm font-serif flex items-center gap-1">
                            <span className="animate-pulse-scale">👨‍🍳</span>
                            Instructions
                          </h4>
                          <ol className="text-xs space-y-1.5 max-h-40 overflow-y-auto text-muted-foreground">
                            {(isSelected ? recipe.instructions : recipe.instructions.slice(0, 3)).map((step: string, i: number) => {
                              const formattedStep = step.replace(/\.([A-Z])/g, '. $1');
                              return (
                                <li key={i} className="leading-relaxed">
                                  <span className="font-semibold text-primary">{i + 1}. </span>{formattedStep}
                                </li>
                              );
                            })}
                            {!isSelected && recipe.instructions.length > 3 && (
                              <li className="text-primary font-medium">+ {recipe.instructions.length - 3} more steps...</li>
                            )}
                          </ol>
                        </div>
                        
                        {!isSelected && (
                          <p className="text-xs text-center text-muted-foreground italic mt-2">Click to view full recipe</p>
                        )}
                      </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
          </Card>
        )}

        {showShoppingList && (
          <Card ref={shoppingListRef} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-accent" />
                Shopping List
              </h2>
              <div className="flex gap-2">
                {shoppingList.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearShoppingList}>
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowShoppingList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {shoppingList.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Your shopping list is empty. Select recipes to add missing ingredients!</p>
            ) : (
              <ul className="space-y-2">
                {shoppingList.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <span className="text-sm">{item}</span>
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-destructive"
                      onClick={() => removeFromShoppingList(idx)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {generatedRecipes.length > 0 && (
          <div className="space-y-6">
            {showAllShownMessage && (
              <div className="text-center p-6 bg-accent/20 rounded-lg border-2 border-accent animate-fade-in">
                <p className="text-2xl font-bold text-foreground font-serif flex items-center justify-center gap-2">
                  <span className="text-3xl animate-wiggle">🎊</span>
                  All Available Recipes Have Been Shown
                  <span className="text-3xl animate-wiggle" style={{ animationDelay: '0.5s' }}>🎊</span>
                </p>
                <p className="text-muted-foreground mt-2">Click generate again to start over!</p>
              </div>
            )}
            <h2 className="text-3xl font-bold text-center text-foreground font-serif flex items-center justify-center gap-3">
              <span className="text-3xl animate-wiggle">🎉</span>
              Your Recipe Collection
              <span className="text-3xl animate-float">✨</span>
            </h2>
            
            {/* Search Input */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search recipes by name or ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterRecipesBySearch(generatedRecipes).length === 0 && searchQuery ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p className="text-lg">No recipes found matching "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try searching with different keywords</p>
                </div>
              ) : (
                filterRecipesBySearch(generatedRecipes).map((recipe, idx) => {
                const recipeGlobalIndex = allRecipes.findIndex(r => r.name === recipe.name);
                const isSelected = selectedRecipeIndex === recipeGlobalIndex;
                const currentServings = servingSizes[recipeGlobalIndex] || recipe.servings;
                const servingMultiplier = currentServings / recipe.servings;
                
                return (
                  <Card 
                    key={idx} 
                    className={`overflow-hidden flex flex-col animate-in fade-in duration-500 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => setSelectedRecipeIndex(isSelected ? null : recipeGlobalIndex)}
                  >
                    {recipe.image && (
                      <img 
                        src={recipe.image} 
                        alt={recipe.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xl font-bold text-foreground font-serif flex-1">{recipe.name}</h3>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(recipe);
                              }}
                            >
                              <Heart className={`h-4 w-4 ${favorites.some(fav => fav.name === recipe.name) ? 'fill-accent text-accent' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToShoppingList(recipe);
                              }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                        {recipe.nutrition && (
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="gap-1">
                              <span className="font-semibold">{recipe.nutrition.calories}</span> cal
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <span className="font-semibold">{recipe.nutrition.protein}g</span> protein
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <span className="font-semibold">{recipe.nutrition.carbs}g</span> carbs
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <span className="font-semibold">{recipe.nutrition.fat}g</span> fat
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 text-sm items-center flex-wrap">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{Math.round(recipe.prepTime * servingMultiplier)} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{currentServings} servings</span>
                        </div>
                        {isSelected && (
                          <Select
                            value={currentServings.toString()}
                            onValueChange={(value) => {
                              setServingSizes(prev => ({
                                ...prev,
                                [recipeGlobalIndex]: parseInt(value)
                              }));
                            }}
                          >
                            <SelectTrigger className="w-20 h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 4, 6, 8, 10, 12].map(size => (
                                <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        <h4 className="font-semibold text-sm font-serif flex items-center gap-1">
                          <span className="animate-bounce-slow">🥗</span>
                          Ingredients
                        </h4>
                        <ul className="text-xs space-y-1 max-h-32 overflow-y-auto text-muted-foreground">
                          {(isSelected ? recipe.ingredients : recipe.ingredients.slice(0, 6)).map((ing: any, i: number) => {
                            const ingredientName = (typeof ing === 'string' ? ing : ing.name).toLowerCase();
                            const hasIngredient = ingredients.some(userIng => 
                              ingredientName.includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(ingredientName)
                            );
                            
                            let displayAmount = ing.amount;
                            if (typeof ing === 'object' && ing.amount) {
                              const numMatch = ing.amount.match(/[\d.]+/);
                              if (numMatch) {
                                const originalAmount = parseFloat(numMatch[0]);
                                const adjustedAmount = decimalToFraction(originalAmount * servingMultiplier);
                                displayAmount = ing.amount.replace(numMatch[0], adjustedAmount);
                              }
                            }

                            // Check if this ingredient has substitutes
                            const substitutionKey = Object.keys(ingredientSubstitutions).find(key => 
                              ingredientName.includes(key.toLowerCase())
                            );
                            const hasSubstitutes = !!substitutionKey;
                            
                            // Get the current substitute or original ingredient
                            const currentSubstitute = ingredientSubstitutes[recipeGlobalIndex]?.[i];
                            const displayIngredient = currentSubstitute || (typeof ing === 'string' ? ing : `${displayAmount} ${ing.name}`);
                            
                            const isShowingSubstitutes = showSubstituteFor?.recipeIndex === recipeGlobalIndex && showSubstituteFor?.ingredientIndex === i;
                            
                            return (
                              <li key={i} className={`${!hasIngredient ? 'text-destructive font-semibold' : ''} ${hasSubstitutes ? 'flex items-start gap-2' : ''}`}>
                                <span className="flex-1">
                                  • {displayIngredient}
                                </span>
                                {hasSubstitutes && (
                                  <div className="relative">
                                    <Repeat 
                                      className="w-3 h-3 cursor-pointer text-accent hover:text-accent/80 flex-shrink-0 mt-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSubstituteFor(
                                          isShowingSubstitutes 
                                            ? null 
                                            : { recipeIndex: recipeGlobalIndex, ingredientIndex: i }
                                        );
                                      }}
                                    />
                                    {isShowingSubstitutes && (
                                      <div 
                                        className="absolute right-0 mt-1 bg-popover border border-border rounded-md shadow-lg p-2 z-50 min-w-[150px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="text-xs font-semibold mb-1 text-foreground">Substitutes:</div>
                                        <div className="space-y-1">
                                          <button
                                            className="block w-full text-left px-2 py-1 text-xs hover:bg-accent/10 rounded"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setIngredientSubstitutes(prev => {
                                                const updated = { ...prev };
                                                if (updated[recipeGlobalIndex]) {
                                                  delete updated[recipeGlobalIndex][i];
                                                }
                                                return updated;
                                              });
                                              setShowSubstituteFor(null);
                                            }}
                                          >
                                            ↻ Original: {typeof ing === 'string' ? ing : ing.name}
                                          </button>
                                          {ingredientSubstitutions[substitutionKey!].map((sub, subIdx) => (
                                            <button
                                              key={subIdx}
                                              className="block w-full text-left px-2 py-1 text-xs hover:bg-accent/10 rounded"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setIngredientSubstitutes(prev => ({
                                                  ...prev,
                                                  [recipeGlobalIndex]: {
                                                    ...prev[recipeGlobalIndex],
                                                    [i]: `${typeof ing === 'object' ? displayAmount : ''} ${sub}`.trim()
                                                  }
                                                }));
                                                setShowSubstituteFor(null);
                                                toast({
                                                  title: "Substitute selected",
                                                  description: `Switched to ${sub}`,
                                                });
                                              }}
                                            >
                                              {sub}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                          {!isSelected && recipe.ingredients.length > 6 && (
                            <li className="text-primary font-medium">+ {recipe.ingredients.length - 6} more...</li>
                          )}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm font-serif flex items-center gap-1">
                          <span className="animate-pulse-scale">👨‍🍳</span>
                          Instructions
                        </h4>
                        <ol className="text-xs space-y-1.5 max-h-40 overflow-y-auto text-muted-foreground">
                          {(isSelected ? recipe.instructions : recipe.instructions.slice(0, 3)).map((step: string, i: number) => {
                            // Add space after periods if missing
                            const formattedStep = step.replace(/\.([A-Z])/g, '. $1');
                            return (
                              <li key={i} className="leading-relaxed">
                                <span className="font-semibold text-primary">{i + 1}. </span>{formattedStep}
                              </li>
                            );
                          })}
                          {!isSelected && recipe.instructions.length > 3 && (
                            <li className="text-primary font-medium">+ {recipe.instructions.length - 3} more steps...</li>
                          )}
                        </ol>
                      </div>
                      
                      {!isSelected && (
                        <p className="text-xs text-center text-muted-foreground italic mt-2">Click to view full recipe</p>
                      )}
                    </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
