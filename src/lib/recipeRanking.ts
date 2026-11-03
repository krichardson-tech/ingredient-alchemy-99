import { recipes, type LocalRecipe } from "../data/recipes";

export interface RecipePreferences {
  ingredients: string[];
  dietaryRestrictions: string[];
  cuisinePreferences: string[];
  flavorPreferences: string[];
  tasteSensations: string[];
  mealType: string[];
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

// Keep the same name matching semantics as existing missing-ingredient views.
export function ingredientMatches(required: string, available: string): boolean {
  const a = normalize(required);
  const b = normalize(available);
  return Boolean(a && b && (a.includes(b) || b.includes(a)));
}

export function rankRecipes(preferences: RecipePreferences, catalog: LocalRecipe[] = recipes): LocalRecipe[] {
  const pantry = preferences.ingredients.map(normalize).filter(Boolean);
  if (pantry.length === 0) return [];
  const matches = (tags: string[], selections: string[]) =>
    selections.filter(selection => tags.includes(normalize(selection))).length;

  return catalog
    .filter(recipe => preferences.dietaryRestrictions.every(tag => recipe.dietaryTags.includes(normalize(tag))))
    .filter(recipe => preferences.mealType.length === 0 || matches(recipe.mealCategory, preferences.mealType) > 0)
    .map(recipe => {
      const ingredientCount = recipe.ingredients.filter(ingredient => pantry.some(item => ingredientMatches(ingredient.name, item))).length;
      // Pantry coverage dominates, then ingredient count and preference matches break ties.
      const score = (ingredientCount / recipe.ingredients.length) * 100 + ingredientCount * 2
        + matches([recipe.cuisine], preferences.cuisinePreferences) * 10
        + matches(recipe.flavorTags, preferences.flavorPreferences) * 5
        + matches(recipe.tasteTags, preferences.tasteSensations) * 5;
      return { recipe, ingredientCount, score };
    })
    .filter(result => result.ingredientCount > 0)
    .sort((a, b) => b.score - a.score || a.recipe.id.localeCompare(b.recipe.id))
    .map(result => result.recipe);
}