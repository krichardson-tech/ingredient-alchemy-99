import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, X, ChefHat, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRecipe } from "@/lib/recipeGenerator";

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
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
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

  const handleGenerateRecipe = () => {
    if (ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add some ingredients first!",
        variant: "destructive",
      });
      return;
    }

    const recipe = generateRecipe(ingredients, dietaryRestrictions, cuisinePreferences, flavorPreferences, tasteSensations);
    setGeneratedRecipe(recipe);
    toast({
      title: "Recipe generated!",
      description: "Your custom recipe is ready.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-serif">Ingredient Alchemy</h1>
          </div>
          <p className="text-muted-foreground text-lg">Transform your ingredients into delicious recipes</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2 font-serif">
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
            <h2 className="text-2xl font-semibold font-serif">Preferences</h2>
            
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
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Recipe
            </Button>
          </Card>
        </div>

        {generatedRecipe && (
          <Card className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground font-serif">{generatedRecipe.name}</h2>
              <p className="text-muted-foreground">{generatedRecipe.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{generatedRecipe.cookTime}</Badge>
                <Badge variant="outline">{generatedRecipe.servings} servings</Badge>
                {generatedRecipe.cuisine && <Badge className="bg-secondary">{generatedRecipe.cuisine}</Badge>}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold font-serif">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1">
                {generatedRecipe.ingredients.map((ing: string, i: number) => (
                  <li key={i} className="text-foreground/80">{ing}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold font-serif">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {generatedRecipe.instructions.map((step: string, i: number) => (
                  <li key={i} className="text-foreground/80 leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
