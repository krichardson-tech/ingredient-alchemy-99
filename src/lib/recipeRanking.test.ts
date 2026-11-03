import { describe, expect, test } from "bun:test";
import { recipes } from "../data/recipes";
import { rankRecipes, type RecipePreferences } from "./recipeRanking";

const preferences = (changes: Partial<RecipePreferences> = {}): RecipePreferences => ({
  ingredients: ["pasta", "tomato sauce", "garlic", "olive oil", "basil", "parmesan cheese"],
  dietaryRestrictions: [], cuisinePreferences: [], flavorPreferences: [], tasteSensations: [], mealType: [],
  ...changes,
});

describe("local recipe generation", () => {
  test("catalog contains exactly 12 complete compatible recipes", () => {
    expect(recipes).toHaveLength(12);
    expect(new Set(recipes.map(recipe => recipe.name)).size).toBe(12);
    for (const recipe of recipes) {
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.instructions.length).toBeGreaterThan(0);
      expect(recipe.cuisine.length).toBeGreaterThan(0);
      expect(recipe.mealCategory.length).toBeGreaterThan(0);
      expect(recipe.dietaryTags.length).toBeGreaterThan(0);
      expect(recipe.flavorTags.length).toBeGreaterThan(0);
      expect(recipe.servings).toBeGreaterThan(0);
      expect(recipe.ingredients.every(ingredient => typeof ingredient.amount === "string")).toBe(true);
    }
  });
  test("complete pantry matches rank ahead of partial matches", () => {
    expect(rankRecipes(preferences())[0].id).toBe("tomato-basil-pasta");
  });
  test("all selected dietary restrictions must be satisfied", () => {
    const result = rankRecipes(preferences({ dietaryRestrictions: ["vegan", "gluten-free"] }));
    expect(result.map(recipe => recipe.id)).toEqual(["tomato-bean-soup", "cucumber-tomato-salad"]);
  });
  test("meal category excludes incompatible recipes", () => {
    expect(rankRecipes(preferences({ mealType: ["dessert"] }))).toEqual([]);
    expect(rankRecipes(preferences({ ingredients: ["banana", "oats"], mealType: ["dessert"] }))[0].id).toBe("banana-oat-cookies");
  });
  test("cuisine preferences improve ranking for equal pantry coverage", () => {
    const input = preferences({ ingredients: ["garlic", "olive oil"] });
    expect(rankRecipes(input)[0].id).toBe("garlic-basil-pasta");
    expect(rankRecipes({ ...input, cuisinePreferences: ["mediterranean"] })[0].id).toBe("tomato-bean-soup");
  });
  test("flavor and taste preferences improve ranking for equal pantry coverage", () => {
    const input = preferences({ ingredients: ["banana"] });
    expect(rankRecipes(input)[0].id).toBe("banana-oat-cookies");
    expect(rankRecipes({ ...input, flavorPreferences: ["tangy"], tasteSensations: ["sour"] })[0].id).toBe("berry-banana-smoothie");
  });
  test("changed pantry produces fresh matches and empty pantry returns none", () => {
    expect(rankRecipes(preferences({ ingredients: ["bread", "deli meat", "cheese", "lettuce", "tomato", "mayo", "mustard"] }))[0].id).toBe("deli-sandwich");
    expect(rankRecipes(preferences({ ingredients: [] }))).toEqual([]);
  });
});