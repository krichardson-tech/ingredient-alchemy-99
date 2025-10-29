type DietaryRestriction = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "nut-free";
type CuisineType = "italian" | "asian" | "mexican" | "mediterranean" | "american";
type FlavorPreference = "spicy" | "sweet" | "savory" | "tangy" | "mild" | "bold";
type TasteSensation = "umami" | "salty" | "sour" | "bitter" | "sweet";

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
  cuisines: CuisineType[],
  flavors: FlavorPreference[] = [],
  tastes: TasteSensation[] = []
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

  // Select a random subset of ingredients (3-6 ingredients or all if less than 3)
  const numberOfIngredientsToUse = Math.min(
    filteredIngredients.length,
    Math.max(3, Math.floor(Math.random() * 4) + 3) // Random between 3-6
  );
  
  // Shuffle and select random ingredients
  const shuffled = [...filteredIngredients].sort(() => Math.random() - 0.5);
  const selectedIngredients = shuffled.slice(0, numberOfIngredientsToUse);

  // Only use the selected ingredients with specific measurements
  const measurements = ["1 cup", "2 cups", "1/2 cup", "3/4 cup", "1 lb", "8 oz", "2-3 pieces"];
  const recipeIngredients = selectedIngredients.map(ing => {
    const measurement = measurements[Math.floor(Math.random() * measurements.length)];
    return `${measurement} ${ing}`;
  });
  
  const instructions: string[] = [];
  const temps = { baked: "375°F", roasted: "400°F", grilled: "medium-high heat", "sautéed": "medium heat", "stir-fried": "high heat", steamed: "boiling water" };
  const temp = temps[cookingMethod as keyof typeof temps] || "medium heat";
  
  if (selectedIngredients.length > 0) {
    instructions.push(`Preheat your cooking surface to ${temp}.`);
    
    if (cookingMethod === "baked" || cookingMethod === "roasted") {
      instructions.push(`${cookingMethod.charAt(0).toUpperCase() + cookingMethod.slice(1)} the ${selectedIngredients[0]} for 20-25 minutes, turning halfway through.`);
    } else if (cookingMethod === "grilled") {
      instructions.push(`Grill the ${selectedIngredients[0]} for 4-5 minutes per side until charred and cooked through.`);
    } else if (cookingMethod === "sautéed" || cookingMethod === "stir-fried") {
      instructions.push(`Heat a large pan and cook the ${selectedIngredients[0]} for 6-8 minutes, stirring occasionally.`);
    } else {
      instructions.push(`Cook the ${selectedIngredients[0]} for 8-10 minutes until tender.`);
    }
    
    if (selectedIngredients.length > 1) {
      instructions.push(`Add the ${selectedIngredients.slice(1, 3).join(" and ")} to the pan and cook for an additional 5-7 minutes.`);
    }
    
    if (selectedIngredients.length > 3) {
      instructions.push(`Stir in the remaining ingredients (${selectedIngredients.slice(3).join(", ")}) and cook for 3-4 minutes until everything is heated through.`);
    }
    
    instructions.push(`Remove from heat and let rest for 2-3 minutes before serving.`);
    instructions.push(`Serve hot and enjoy your ${cuisine}-inspired dish!`);
  }

  const dietaryTags = dietary.length > 0 ? ` (${dietary.join(", ")})` : "";
  const ingredientList = selectedIngredients.slice(0, 3).join(", ");
  
  // Build flavor description
  let flavorDescription = "";
  if (flavors.length > 0) {
    flavorDescription = ` with ${flavors.join(" and ")} notes`;
  }
  if (tastes.length > 0) {
    const tasteDesc = tastes.length > 0 ? ` emphasizing ${tastes.join(", ")} flavors` : "";
    flavorDescription += tasteDesc;
  }

  return {
    name: `${recipeName}${dietaryTags}`,
    description: `A delicious ${cuisine} dish made with ${ingredientList}${selectedIngredients.length > 3 ? " and more" : ""}${flavorDescription}.`,
    cuisine: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
    cookTime: "20-30 minutes",
    servings: 2,
    ingredients: recipeIngredients,
    instructions,
  };
}
