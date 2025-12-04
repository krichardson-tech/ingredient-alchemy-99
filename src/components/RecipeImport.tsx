import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Link, FileText, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  name: string;
  image?: string;
  prepTime: number;
  servings: number;
  description?: string;
  ingredients: { name: string; amount: number; unit: string }[];
  instructions: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface RecipeImportProps {
  onImport: (recipe: Recipe) => void;
  onClose: () => void;
}

export const RecipeImport = ({ onImport, onClose }: RecipeImportProps) => {
  const [url, setUrl] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  // Manual entry state
  const [manualName, setManualName] = useState("");
  const [manualPrepTime, setManualPrepTime] = useState(30);
  const [manualServings, setManualServings] = useState(4);
  const [manualIngredients, setManualIngredients] = useState("");
  const [manualInstructions, setManualInstructions] = useState("");
  const [manualCalories, setManualCalories] = useState(400);
  const [manualProtein, setManualProtein] = useState(20);
  const [manualCarbs, setManualCarbs] = useState(50);
  const [manualFat, setManualFat] = useState(15);

  const parseRecipeFromText = (text: string): Recipe | null => {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      // Try to find recipe name (usually first non-empty line or line with common patterns)
      let name = lines[0] || "Imported Recipe";
      
      // Find ingredients section
      const ingredientKeywords = ['ingredients', 'you will need', 'what you need'];
      const instructionKeywords = ['instructions', 'directions', 'steps', 'method', 'how to make'];
      
      let ingredientStartIdx = lines.findIndex(l => 
        ingredientKeywords.some(k => l.toLowerCase().includes(k))
      );
      let instructionStartIdx = lines.findIndex(l => 
        instructionKeywords.some(k => l.toLowerCase().includes(k))
      );
      
      // Parse ingredients
      const ingredients: { name: string; amount: number; unit: string }[] = [];
      const ingredientLines = ingredientStartIdx >= 0 
        ? lines.slice(ingredientStartIdx + 1, instructionStartIdx > ingredientStartIdx ? instructionStartIdx : undefined)
        : [];
      
      ingredientLines.forEach(line => {
        if (line && !instructionKeywords.some(k => line.toLowerCase().includes(k))) {
          // Try to parse amount and unit
          const match = line.match(/^([\d./]+)?\s*(\w+)?\s*(.+)$/);
          if (match) {
            const amount = match[1] ? parseFloat(eval(match[1])) : 1;
            ingredients.push({
              name: match[3] || line,
              amount: isNaN(amount) ? 1 : amount,
              unit: match[2] || "unit"
            });
          } else {
            ingredients.push({ name: line, amount: 1, unit: "unit" });
          }
        }
      });
      
      // Parse instructions
      const instructions: string[] = [];
      if (instructionStartIdx >= 0) {
        lines.slice(instructionStartIdx + 1).forEach(line => {
          if (line) {
            // Remove step numbers
            const cleanLine = line.replace(/^\d+[.)]\s*/, '').trim();
            if (cleanLine) instructions.push(cleanLine);
          }
        });
      }
      
      // Try to find prep time
      const timeMatch = text.match(/(\d+)\s*(min|minutes|mins)/i);
      const prepTime = timeMatch ? parseInt(timeMatch[1]) : 30;
      
      // Try to find servings
      const servingsMatch = text.match(/serves?\s*(\d+)|(\d+)\s*servings?/i);
      const servings = servingsMatch ? parseInt(servingsMatch[1] || servingsMatch[2]) : 4;
      
      return {
        name,
        prepTime,
        servings,
        ingredients: ingredients.length > 0 ? ingredients : [{ name: "Ingredients not parsed", amount: 1, unit: "unit" }],
        instructions: instructions.length > 0 ? instructions : ["Instructions not parsed"],
        nutrition: {
          calories: 400,
          protein: 20,
          carbs: 50,
          fat: 15
        }
      };
    } catch (error) {
      console.error("Error parsing recipe:", error);
      return null;
    }
  };

  const handleParseText = () => {
    if (!recipeText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste recipe text to parse.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const parsed = parseRecipeFromText(recipeText);
      if (parsed) {
        setParsedRecipe(parsed);
        toast({
          title: "Recipe parsed",
          description: "Review the parsed recipe and import it."
        });
      } else {
        toast({
          title: "Parse failed",
          description: "Could not parse recipe. Try manual entry instead.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleUrlImport = async () => {
    if (!url.trim()) {
      toast({
        title: "No URL provided",
        description: "Please enter a recipe URL.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    toast({
      title: "Fetching recipe",
      description: "This may take a moment..."
    });
    
    // For now, show a message that URL import requires additional setup
    setTimeout(() => {
      toast({
        title: "URL Import",
        description: "URL import requires API integration. Please use text paste or manual entry instead.",
        variant: "destructive"
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleManualImport = () => {
    if (!manualName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a recipe name.",
        variant: "destructive"
      });
      return;
    }

    const ingredients = manualIngredients.split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        const match = line.match(/^([\d./]+)?\s*(\w+)?\s*(.+)$/);
        if (match) {
          let amount = 1;
          try {
            amount = match[1] ? parseFloat(eval(match[1])) : 1;
          } catch {
            amount = 1;
          }
          return {
            name: match[3] || line,
            amount: isNaN(amount) ? 1 : amount,
            unit: match[2] || "unit"
          };
        }
        return { name: line, amount: 1, unit: "unit" };
      });

    const instructions = manualInstructions.split('\n')
      .map(line => line.trim().replace(/^\d+[.)]\s*/, ''))
      .filter(line => line);

    const recipe: Recipe = {
      name: manualName,
      prepTime: manualPrepTime,
      servings: manualServings,
      ingredients: ingredients.length > 0 ? ingredients : [{ name: "No ingredients", amount: 1, unit: "unit" }],
      instructions: instructions.length > 0 ? instructions : ["No instructions"],
      nutrition: {
        calories: manualCalories,
        protein: manualProtein,
        carbs: manualCarbs,
        fat: manualFat
      }
    };

    onImport(recipe);
    toast({
      title: "Recipe imported!",
      description: `${recipe.name} has been added to your collection.`
    });
    onClose();
  };

  const handleImportParsed = () => {
    if (parsedRecipe) {
      onImport(parsedRecipe);
      toast({
        title: "Recipe imported!",
        description: `${parsedRecipe.name} has been added to your collection.`
      });
      onClose();
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold font-serif">Import Recipe</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">
            <Plus className="h-4 w-4 mr-1" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="paste">
            <FileText className="h-4 w-4 mr-1" />
            Paste Text
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link className="h-4 w-4 mr-1" />
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-name">Recipe Name *</Label>
            <Input
              id="recipe-name"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Chicken Stir Fry"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prep-time">Prep Time (min)</Label>
              <Input
                id="prep-time"
                type="number"
                value={manualPrepTime}
                onChange={(e) => setManualPrepTime(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={manualServings}
                onChange={(e) => setManualServings(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients (one per line)</Label>
            <Textarea
              id="ingredients"
              value={manualIngredients}
              onChange={(e) => setManualIngredients(e.target.value)}
              placeholder="2 cups rice&#10;1 lb chicken&#10;2 tbsp soy sauce"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (one step per line)</Label>
            <Textarea
              id="instructions"
              value={manualInstructions}
              onChange={(e) => setManualInstructions(e.target.value)}
              placeholder="1. Cook rice according to package&#10;2. Cut chicken into cubes&#10;3. Stir fry with vegetables"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Nutrition (per serving)</Label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Calories</Label>
                <Input
                  type="number"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Protein (g)</Label>
                <Input
                  type="number"
                  value={manualProtein}
                  onChange={(e) => setManualProtein(parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Carbs (g)</Label>
                <Input
                  type="number"
                  value={manualCarbs}
                  onChange={(e) => setManualCarbs(parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Fat (g)</Label>
                <Input
                  type="number"
                  value={manualFat}
                  onChange={(e) => setManualFat(parseInt(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleManualImport} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Import Recipe
          </Button>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-text">Paste Recipe Text</Label>
            <Textarea
              id="recipe-text"
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Paste the full recipe text here including name, ingredients, and instructions..."
              rows={10}
            />
          </div>

          <Button onClick={handleParseText} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Parse Recipe
              </>
            )}
          </Button>

          {parsedRecipe && (
            <Card className="p-4 bg-muted/30 space-y-2">
              <h3 className="font-medium">{parsedRecipe.name}</h3>
              <p className="text-sm text-muted-foreground">
                {parsedRecipe.prepTime} min • {parsedRecipe.servings} servings • {parsedRecipe.ingredients.length} ingredients
              </p>
              <Button onClick={handleImportParsed} size="sm" className="w-full">
                Import This Recipe
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-url">Recipe URL</Label>
            <Input
              id="recipe-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/recipe/..."
            />
          </div>

          <Button onClick={handleUrlImport} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Import from URL
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Note: URL import works best with popular recipe sites. For other sites, try pasting the recipe text instead.
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
