export interface LocalRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  cuisine: string;
  mealCategory: string[];
  dietaryTags: string[];
  flavorTags: string[];
  tasteTags: string[];
  prepTime: number;
  servings: number;
  /** Approximate nutrition per serving. */
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
}

export const recipes: LocalRecipe[] = [
  {
    id: "tomato-basil-pasta", name: "Tomato Basil Spaghetti",
    description: "Spaghetti tossed in a garlicky tomato sauce. Nutrition is approximate per serving.",
    ingredients: [{ name: "pasta", amount: "8 oz" }, { name: "tomato sauce", amount: "1 cup" }, { name: "garlic", amount: "2 cloves" }, { name: "olive oil", amount: "1 tbsp" }, { name: "basil", amount: "2 tbsp" }, { name: "parmesan cheese", amount: "0.25 cup" }],
    instructions: ["Bring 8 cups of water to a boil in a large pot. Add 8 oz pasta and cook for 8–12 minutes, following the package timing, until al dente. Drain.", "Heat 1 tbsp olive oil in a skillet over medium-low heat. Mince 2 garlic cloves and cook for 1 minute without browning.", "Add 1 cup tomato sauce and simmer gently for 5 minutes, stirring occasionally.", "Toss the drained pasta with the sauce for 1 minute. Divide between 2 bowls and top with 2 tbsp chopped basil and 0.25 cup parmesan cheese."],
    cuisine: "italian", mealCategory: ["lunch", "dinner"], dietaryTags: ["vegetarian", "nut-free"], flavorTags: ["savory", "mild"], tasteTags: ["umami"], prepTime: 20, servings: 2, nutrition: { calories: 580, protein: 20, carbs: 91, fat: 15 },
  },
  {
    id: "garlic-basil-pasta", name: "Garlic Basil Pasta",
    description: "A simple dairy-free pasta with garlic and fresh basil. Nutrition is approximate per serving.",
    ingredients: [{ name: "pasta", amount: "8 oz" }, { name: "garlic", amount: "3 cloves" }, { name: "olive oil", amount: "2 tbsp" }, { name: "basil", amount: "0.25 cup" }],
    instructions: ["Boil 8 oz pasta in 8 cups of water for the package's recommended 8–12 minutes. Reserve 0.25 cup cooking water before draining.", "Thinly slice 3 garlic cloves. Heat 2 tbsp olive oil over medium-low heat and cook the garlic for 2 minutes until fragrant, not brown.", "Add the drained pasta and reserved cooking water. Toss over low heat for 1 minute.", "Turn off the heat, fold in 0.25 cup chopped basil, and divide between 2 bowls."],
    cuisine: "italian", mealCategory: ["lunch", "dinner"], dietaryTags: ["vegetarian", "vegan", "dairy-free", "nut-free"], flavorTags: ["savory", "mild"], tasteTags: ["umami"], prepTime: 15, servings: 2, nutrition: { calories: 540, protein: 15, carbs: 86, fat: 16 },
  },
  {
    id: "deli-sandwich", name: "Deli Sandwich",
    description: "A no-cook sandwich with crisp vegetables. Nutrition is approximate per serving.",
    ingredients: [{ name: "bread", amount: "4 slices" }, { name: "deli meat", amount: "4 oz" }, { name: "cheese", amount: "2 slices" }, { name: "lettuce", amount: "2 leaves" }, { name: "tomato", amount: "1 whole" }, { name: "mayo", amount: "1 tbsp" }, { name: "mustard", amount: "1 tsp" }],
    instructions: ["Wash 2 lettuce leaves and 1 tomato. Pat the lettuce dry and cut the tomato into thin slices.", "Spread 1 tbsp mayo and 1 tsp mustard evenly over 4 bread slices.", "Divide 4 oz deli meat, 2 cheese slices, lettuce, and tomato between 2 bread slices.", "Top with the remaining bread, cut each sandwich in half, and serve immediately. No cooking is required."],
    cuisine: "american", mealCategory: ["lunch", "dinner", "snack"], dietaryTags: ["nut-free"], flavorTags: ["savory", "tangy"], tasteTags: ["salty", "umami"], prepTime: 10, servings: 2, nutrition: { calories: 410, protein: 25, carbs: 32, fat: 20 },
  },
  {
    id: "tomato-cheese-sandwich", name: "Tomato and Cheese Sandwich",
    description: "A vegetarian, no-cook sandwich. Nutrition is approximate per serving.",
    ingredients: [{ name: "bread", amount: "4 slices" }, { name: "cheese", amount: "4 slices" }, { name: "tomato", amount: "1 whole" }, { name: "lettuce", amount: "2 leaves" }, { name: "mustard", amount: "2 tsp" }],
    instructions: ["Wash and thinly slice 1 tomato. Wash 2 lettuce leaves and pat dry.", "Spread 2 tsp mustard across 2 bread slices. Place 2 cheese slices on each.", "Divide the tomato and lettuce between the sandwiches, then close with the remaining 2 bread slices.", "Cut in half and serve immediately. No cooking is required."],
    cuisine: "american", mealCategory: ["lunch", "snack"], dietaryTags: ["vegetarian", "nut-free"], flavorTags: ["mild", "tangy"], tasteTags: ["salty"], prepTime: 5, servings: 2, nutrition: { calories: 370, protein: 18, carbs: 34, fat: 18 },
  },
  {
    id: "cheesy-eggs-toast", name: "Cheesy Scrambled Eggs on Toast",
    description: "Soft scrambled eggs on buttered toast. Nutrition is approximate per serving.",
    ingredients: [{ name: "eggs", amount: "4 whole" }, { name: "bread", amount: "2 slices" }, { name: "butter", amount: "1 tbsp" }, { name: "milk", amount: "2 tbsp" }, { name: "cheese", amount: "0.25 cup" }],
    instructions: ["Whisk 4 eggs with 2 tbsp milk until evenly combined. Grate 0.25 cup cheese.", "Melt 0.5 tbsp butter in a nonstick skillet over medium-low heat. Add the eggs and gently stir for 3–5 minutes until set, with no liquid egg remaining.", "Turn off the heat and fold in the cheese until melted, about 30 seconds.", "Toast 2 bread slices for 2–3 minutes and spread with the remaining 0.5 tbsp butter. Divide the eggs over the toast and serve."],
    cuisine: "american", mealCategory: ["breakfast", "brunch"], dietaryTags: ["vegetarian", "nut-free"], flavorTags: ["savory", "mild"], tasteTags: ["umami", "salty"], prepTime: 10, servings: 2, nutrition: { calories: 350, protein: 21, carbs: 17, fat: 23 },
  },
  {
    id: "chicken-stir-fry", name: "Chicken Vegetable Stir-Fry",
    description: "Ginger-garlic chicken and vegetables with rice. Nutrition is approximate per serving.",
    ingredients: [{ name: "rice", amount: "0.75 cup" }, { name: "chicken breast", amount: "8 oz" }, { name: "mixed vegetables", amount: "2 cups" }, { name: "soy sauce", amount: "2 tbsp" }, { name: "garlic", amount: "2 cloves" }, { name: "ginger", amount: "1 tsp" }],
    instructions: ["Combine 0.75 cup rice with 1.5 cups water in a saucepan. Bring to a boil, cover, and simmer over low heat for 15–18 minutes; rest off heat for 5 minutes.", "Cut 8 oz chicken breast into 0.5-inch pieces. Mince 2 garlic cloves and grate 1 tsp ginger.", "Heat a nonstick skillet over medium-high heat. Add chicken and 2 tbsp water; cook for 6–8 minutes, stirring and adding a splash of water if needed.", "Add 2 cups mixed vegetables, garlic, ginger, and 2 tbsp soy sauce. Stir-fry for 4–5 minutes until vegetables are tender and chicken reaches 165°F internally. Serve with rice."],
    cuisine: "asian", mealCategory: ["lunch", "dinner"], dietaryTags: ["dairy-free", "nut-free"], flavorTags: ["savory", "bold"], tasteTags: ["umami", "salty"], prepTime: 30, servings: 2, nutrition: { calories: 480, protein: 32, carbs: 69, fat: 6 },
  },
  {
    id: "beef-tacos", name: "Beef and Salsa Tacos",
    description: "Warm beef tacos with fresh toppings. Nutrition is approximate per serving.",
    ingredients: [{ name: "tortillas", amount: "4 whole" }, { name: "ground beef", amount: "8 oz" }, { name: "lettuce", amount: "1 cup" }, { name: "tomato", amount: "1 whole" }, { name: "cheese", amount: "0.25 cup" }, { name: "salsa", amount: "0.25 cup" }, { name: "sour cream", amount: "2 tbsp" }],
    instructions: ["Brown 8 oz ground beef in a skillet over medium-high heat for 7–10 minutes, breaking it into small pieces, until it reaches 160°F internally. Drain excess fat.", "Stir 0.25 cup salsa into the beef and simmer for 2 minutes.", "Shred 1 cup lettuce, dice 1 tomato, and grate 0.25 cup cheese. Warm 4 tortillas in a dry skillet for 20–30 seconds per side.", "Divide the beef and vegetables among the tortillas. Top with cheese and 2 tbsp sour cream, then serve 2 tacos per person."],
    cuisine: "mexican", mealCategory: ["lunch", "dinner"], dietaryTags: ["nut-free"], flavorTags: ["spicy", "bold", "savory"], tasteTags: ["umami", "sour"], prepTime: 20, servings: 2, nutrition: { calories: 560, protein: 30, carbs: 44, fat: 29 },
  },
  {
    id: "garden-feta-salad", name: "Garden Feta Salad",
    description: "A crunchy no-cook salad with a tangy dressing. Nutrition is approximate per serving.",
    ingredients: [{ name: "lettuce", amount: "3 cups" }, { name: "cucumber", amount: "1 whole" }, { name: "tomato", amount: "1 whole" }, { name: "carrots", amount: "1 whole" }, { name: "feta cheese", amount: "0.5 cup" }, { name: "olive oil", amount: "1 tbsp" }, { name: "vinegar", amount: "1 tbsp" }],
    instructions: ["Wash and dry 3 cups lettuce. Dice 1 cucumber and 1 tomato, and grate 1 carrot.", "Whisk 1 tbsp olive oil with 1 tbsp vinegar in a large bowl for 20 seconds.", "Add the vegetables and toss until evenly coated. Crumble 0.5 cup feta over the salad.", "Divide between 2 bowls and serve immediately. No cooking is required."],
    cuisine: "mediterranean", mealCategory: ["lunch", "salad", "side dish"], dietaryTags: ["vegetarian", "gluten-free", "nut-free"], flavorTags: ["tangy", "mild"], tasteTags: ["sour", "salty", "bitter"], prepTime: 10, servings: 2, nutrition: { calories: 240, protein: 8, carbs: 15, fat: 17 },
  },
  {
    id: "banana-oat-cookies", name: "Banana Oat Cookies",
    description: "Two-ingredient, naturally sweet cookies. Nutrition is approximate per serving.",
    ingredients: [{ name: "banana", amount: "2 whole" }, { name: "oats", amount: "1 cup" }],
    instructions: ["Preheat the oven to 350°F. Line a baking sheet with parchment paper.", "Mash 2 ripe bananas until smooth. Stir in 1 cup rolled oats and let stand for 5 minutes.", "Divide into 8 equal mounds on the baking sheet and flatten each to about 0.5 inch thick.", "Bake for 15–18 minutes until the edges are set and lightly golden. Cool for 10 minutes. Serve 2 cookies per person."],
    cuisine: "american", mealCategory: ["dessert", "snack", "breakfast"], dietaryTags: ["vegetarian", "vegan", "dairy-free", "nut-free"], flavorTags: ["sweet", "mild"], tasteTags: ["sweet"], prepTime: 30, servings: 4, nutrition: { calories: 130, protein: 3, carbs: 27, fat: 2 },
  },
  {
    id: "berry-banana-smoothie", name: "Berry Banana Smoothie",
    description: "A chilled fruit smoothie with milk. Nutrition is approximate per serving.",
    ingredients: [{ name: "banana", amount: "1 whole" }, { name: "berries", amount: "1 cup" }, { name: "milk", amount: "1 cup" }],
    instructions: ["Peel 1 banana and rinse 1 cup berries, or use frozen berries.", "Add the fruit and 1 cup milk to a blender.", "Blend for 30–60 seconds until smooth, stopping to scrape the sides if needed.", "Pour into 2 glasses and serve immediately. No cooking is required."],
    cuisine: "american", mealCategory: ["beverage", "breakfast", "snack"], dietaryTags: ["vegetarian", "gluten-free", "nut-free"], flavorTags: ["sweet", "tangy"], tasteTags: ["sweet", "sour"], prepTime: 5, servings: 2, nutrition: { calories: 150, protein: 5, carbs: 27, fat: 3 },
  },
  {
    id: "tomato-bean-soup", name: "Tomato and White Bean Soup",
    description: "A hearty dairy-free tomato soup. Use cooked beans. Nutrition is approximate per serving.",
    ingredients: [{ name: "white beans", amount: "1.5 cups" }, { name: "tomato sauce", amount: "1 cup" }, { name: "garlic", amount: "2 cloves" }, { name: "olive oil", amount: "1 tbsp" }, { name: "basil", amount: "1 tbsp" }],
    instructions: ["Drain and rinse 1.5 cups canned or fully cooked white beans. Mince 2 garlic cloves.", "Heat 1 tbsp olive oil in a saucepan over medium-low heat. Cook the garlic for 1 minute.", "Add the beans, 1 cup tomato sauce, and 1 cup water. Bring to a simmer and cook uncovered for 12 minutes, stirring occasionally.", "Mash a few beans against the side of the pan to thicken the soup. Stir in 1 tbsp chopped basil and divide between 2 bowls."],
    cuisine: "mediterranean", mealCategory: ["soup", "lunch", "dinner"], dietaryTags: ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"], flavorTags: ["savory", "mild"], tasteTags: ["umami"], prepTime: 20, servings: 2, nutrition: { calories: 300, protein: 14, carbs: 43, fat: 8 },
  },
  {
    id: "cucumber-tomato-salad", name: "Cucumber Tomato Salad",
    description: "A light no-cook side with vinegar dressing. Nutrition is approximate per serving.",
    ingredients: [{ name: "cucumber", amount: "1 whole" }, { name: "tomato", amount: "2 whole" }, { name: "olive oil", amount: "1 tbsp" }, { name: "vinegar", amount: "1 tbsp" }],
    instructions: ["Wash 1 cucumber and 2 tomatoes. Dice them into 0.5-inch pieces.", "Whisk 1 tbsp olive oil and 1 tbsp vinegar together in a bowl.", "Add the vegetables and toss for 20 seconds to coat evenly.", "Let stand for 5 minutes, then divide between 2 plates. No cooking is required."],
    cuisine: "mediterranean", mealCategory: ["salad", "side dish", "appetizer", "snack"], dietaryTags: ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free"], flavorTags: ["tangy", "mild"], tasteTags: ["sour"], prepTime: 10, servings: 2, nutrition: { calories: 110, protein: 2, carbs: 10, fat: 7 },
  },
];