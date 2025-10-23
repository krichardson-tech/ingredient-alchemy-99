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
  if (dietary.includes("dairy-free")) {
    filteredIngredients = filteredIngredients.filter(
      i => !["milk", "cheese", "butter", "cream", "yogurt"].some(m => i.toLowerCase().includes(m))
    );
  }
  if (dietary.includes("nut-free")) {
    filteredIngredients = filteredIngredients.filter(
      i => !["nut", "almond", "peanut", "cashew", "walnut"].some(m => i.toLowerCase().includes(m))
    );
  }

  // Only use the actual ingredients provided
  const recipeIngredients = filteredIngredients.map(ing => `1 portion ${ing}`);
  
  const instructions: string[] = [];
  
  if (filteredIngredients.length > 0) {
    instructions.push(`Gather your ingredients: ${filteredIngredients.join(", ")}.`);
    instructions.push(`${cookingMethod.charAt(0).toUpperCase() + cookingMethod.slice(1)} the ${filteredIngredients[0]} until ready.`);
    
    if (filteredIngredients.length > 1) {
      instructions.push(`Prepare the ${filteredIngredients.slice(1).join(", ")} using your preferred ${cuisine} cooking technique.`);
    }
    
    if (filteredIngredients.length > 2) {
      instructions.push(`Combine all ingredients together in a ${cuisine}-style presentation.`);
    }
    
    instructions.push(`Serve and enjoy your ${cuisine} creation!`);
  }

  const dietaryTags = dietary.length > 0 ? ` (${dietary.join(", ")})` : "";
  const ingredientList = filteredIngredients.slice(0, 3).join(", ");

  return {
    name: `${recipeName}${dietaryTags}`,
    description: `A delicious ${cuisine} dish made with ${ingredientList}${filteredIngredients.length > 3 ? " and more" : ""}.`,
    cuisine: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
    cookTime: "20-30 minutes",
    servings: 2,
    ingredients: recipeIngredients,
    instructions,
  };
}
