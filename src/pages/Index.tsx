import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, X, ChefHat, Sparkles, Loader2, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DietaryRestriction = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free";
type CuisineType = "italian" | "asian" | "mexican" | "mediterranean" | "american";
type FlavorPreference = "spicy" | "sweet" | "savory" | "tangy" | "mild" | "bold";
type TasteSensation = "umami" | "salty" | "sour" | "bitter" | "sweet";

const Index = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);
  const [cuisinePreferences, setCuisinePreferences] = useState<CuisineType[]>([]);
  const [flavorPreferences, setFlavorPreferences] = useState<FlavorPreference[]>([]);
  const [tasteSensations, setTasteSensations] = useState<TasteSensation[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("ingredients");
    if (stored) {
      setIngredients(JSON.parse(stored));
    }
  }, []);

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

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
    localStorage.setItem("ingredients", JSON.stringify(updated));
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

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add some ingredients first!",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipes([]);

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
            cuisinePreference: cuisinePreferences[0] || '',
            flavorPreferences,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate recipes');
      }

      const data = await response.json();
      setGeneratedRecipes(data.recipes);
      toast({
        title: "Recipes generated! ✨",
        description: `Here are ${data.recipes.length} delicious recipes for you!`,
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
        <header className="text-center space-y-2">
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

        {generatedRecipes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-foreground font-serif flex items-center justify-center gap-3">
              <span className="text-3xl animate-wiggle">🎉</span>
              Your Recipe Collection
              <span className="text-3xl animate-float">✨</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedRecipes.map((recipe, idx) => (
                <Card key={idx} className="overflow-hidden flex flex-col animate-in fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  {recipe.image && (
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground font-serif">{recipe.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.prepTime} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-sm font-serif flex items-center gap-1">
                        <span className="animate-bounce-slow">🥗</span>
                        Ingredients
                      </h4>
                      <ul className="text-xs space-y-1 max-h-32 overflow-y-auto text-muted-foreground">
                        {recipe.ingredients.slice(0, 6).map((ing: any, i: number) => (
                          <li key={i}>
                            • {typeof ing === 'string' ? ing : `${ing.amount} ${ing.name}`}
                          </li>
                        ))}
                        {recipe.ingredients.length > 6 && (
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
                        {recipe.instructions.slice(0, 3).map((step: string, i: number) => (
                          <li key={i} className="leading-relaxed">
                            <span className="font-semibold text-primary">{i + 1}.</span> {step}
                          </li>
                        ))}
                        {recipe.instructions.length > 3 && (
                          <li className="text-primary font-medium">+ {recipe.instructions.length - 3} more steps...</li>
                        )}
                      </ol>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
