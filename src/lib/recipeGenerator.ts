type DietaryRestriction = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free";
type CuisineType = "italian" | "asian" | "mexican" | "mediterranean" | "american";

const recipeTemplates = {
  italian: {
    names: ["Italian Pasta", "Rustic Italian Bowl", "Mediterranean Delight"],
    bases: ["pasta", "rice", "polenta"],
    cooking: ["sautéed", "roasted", "grilled"],
  },
  asian: {
    names: ["Asian Stir-Fry", "Oriental Bowl", "Fusion Delight"],
    bases: ["rice", "noodles"],
    cooking: ["stir-fried", "steamed", "sautéed"],
  },
  mexican: {
    names: ["Mexican Fiesta", "Southwestern Bowl", "Tex-Mex Delight"],
    bases: ["tortillas", "rice", "beans"],
    cooking: ["grilled", "roasted", "sautéed"],
  },
  mediterranean: {
    names: ["Mediterranean Bowl", "Greek-Inspired Dish", "Coastal Feast"],
    bases: ["couscous", "rice", "quinoa"],
    cooking: ["roasted", "grilled", "baked"],
  },
  american: {
    names: ["Classic American", "Comfort Bowl", "Home-Style Dish"],
    bases: ["potatoes", "rice", "bread"],
    cooking: ["roasted", "baked", "grilled"],
  },
};

export function generateRecipe(
  ingredients: string[],
  dietary: DietaryRestriction[],
  cuisines: CuisineType[]
) {
  const cuisine = cuisines.length > 0 
    ? cuisines[Math.floor(Math.random() * cuisines.length)]
    : "mediterranean";
  
  const template = recipeTemplates[cuisine];
  const recipeName = template.names[Math.floor(Math.random() * template.names.length)];
  const cookingMethod = template.cooking[Math.floor(Math.random() * template.cooking.length)];
  const base = template.bases[Math.floor(Math.random() * template.bases.length)];

  // Filter ingredients based on dietary restrictions
  let filteredIngredients = [...ingredients];
  if (dietary.includes("vegan") || dietary.includes("vegetarian")) {
    filteredIngredients = filteredIngredients.filter(
      i => !["chicken", "beef", "pork", "fish", "meat"].some(m => i.toLowerCase().includes(m))
    );
  }
  if (dietary.includes("gluten-free")) {
    filteredIngredients = filteredIngredients.filter(
      i => !["bread", "pasta", "flour"].some(m => i.toLowerCase().includes(m))
    );
  }

  const mainIngredients = filteredIngredients.slice(0, Math.min(6, filteredIngredients.length));
  
  const recipeIngredients = [
    `2 cups ${base}`,
    ...mainIngredients.map(ing => `1 cup ${ing}`),
    "2 tablespoons olive oil",
    "Salt and pepper to taste",
    "Fresh herbs for garnish",
  ];

  const instructions = [
    `Prepare the ${base} according to package instructions.`,
    `Heat olive oil in a large pan over medium heat.`,
    `Add ${mainIngredients.slice(0, 2).join(" and ")} to the pan and cook for 5-7 minutes.`,
    mainIngredients.length > 2 
      ? `Add ${mainIngredients.slice(2).join(", ")} and continue cooking for another 5 minutes.`
      : "Season with salt and pepper.",
    `Combine everything with the prepared ${base}.`,
    `Serve hot, garnished with fresh herbs.`,
  ];

  const dietaryTags = dietary.length > 0 ? ` (${dietary.join(", ")})` : "";

  return {
    name: `${recipeName}${dietaryTags}`,
    description: `A delicious ${cuisine} dish featuring ${mainIngredients.slice(0, 3).join(", ")} and more.`,
    cuisine: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
    cookTime: "30-40 minutes",
    servings: 4,
    ingredients: recipeIngredients,
    instructions,
  };
}
