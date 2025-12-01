import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, dietaryRestrictions, cuisinePreference, flavorPreferences, tasteSensations, mealType } = await req.json();
    const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY');

    if (!SPOONACULAR_API_KEY) {
      throw new Error('SPOONACULAR_API_KEY is not configured');
    }

    console.log('Generating recipe with ingredients:', ingredients);

    // Build query parameters
    const ingredientsQuery = ingredients.join(',');
    let diet = '';
    
    if (dietaryRestrictions.includes('Vegetarian')) diet = 'vegetarian';
    else if (dietaryRestrictions.includes('Vegan')) diet = 'vegan';
    else if (dietaryRestrictions.includes('Gluten-Free')) diet = 'gluten free';
    else if (dietaryRestrictions.includes('Keto')) diet = 'ketogenic';
    else if (dietaryRestrictions.includes('Paleo')) diet = 'paleo';

    // Search for recipes by ingredients
    const searchUrl = new URL('https://api.spoonacular.com/recipes/findByIngredients');
    searchUrl.searchParams.append('apiKey', SPOONACULAR_API_KEY);
    searchUrl.searchParams.append('ingredients', ingredientsQuery);
    searchUrl.searchParams.append('number', '15');
    searchUrl.searchParams.append('ranking', '2'); // Maximize used ingredients
    searchUrl.searchParams.append('ignorePantry', 'true');
    
    if (diet) {
      searchUrl.searchParams.append('diet', diet);
    }
    
    if (cuisinePreference && cuisinePreference.length > 0) {
      searchUrl.searchParams.append('cuisine', cuisinePreference.join(','));
    }
    
    if (mealType && mealType.length > 0) {
      searchUrl.searchParams.append('type', mealType.join(','));
    }

    console.log('Searching recipes:', searchUrl.toString().replace(SPOONACULAR_API_KEY, 'HIDDEN'));

    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      console.error('Spoonacular search error:', searchResponse.status, await searchResponse.text());
      throw new Error(`Spoonacular API error: ${searchResponse.status}`);
    }

    const recipes = await searchResponse.json();
    console.log('Found recipes:', recipes.length);

    if (!recipes || recipes.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No recipes found with those ingredients. Try different ingredients!' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get detailed information for all recipes
    const recipesToFetch = recipes.slice(0, 12);
    
    const detailPromises = recipesToFetch.map(async (recipe: any) => {
      const detailUrl = new URL(`https://api.spoonacular.com/recipes/${recipe.id}/information`);
      detailUrl.searchParams.append('apiKey', SPOONACULAR_API_KEY);
      detailUrl.searchParams.append('includeNutrition', 'true');

      console.log('Getting recipe details for ID:', recipe.id);

      const detailResponse = await fetch(detailUrl.toString());
      
      if (!detailResponse.ok) {
        console.error('Spoonacular detail error:', detailResponse.status, await detailResponse.text());
        return null;
      }

      return await detailResponse.json();
    });

    const recipeDetails = await Promise.all(detailPromises);
    const validRecipes = recipeDetails.filter(detail => detail !== null);

    if (validRecipes.length === 0) {
      throw new Error('Failed to fetch recipe details');
    }

    // Format the recipes
    const formattedRecipes = validRecipes.map((recipeDetail: any) => {
      const nutrition = recipeDetail.nutrition?.nutrients;
      const getNutrient = (name: string) => {
        const nutrient = nutrition?.find((n: any) => n.name === name);
        return nutrient ? Math.round(nutrient.amount) : 0;
      };

      return {
        name: recipeDetail.title,
        description: recipeDetail.summary?.replace(/<[^>]*>/g, '') || 'A delicious recipe made with your ingredients.',
        ingredients: recipeDetail.extendedIngredients.map((ing: any) => ({
          name: ing.name,
          amount: `${ing.amount} ${ing.unit}`,
        })),
        instructions: recipeDetail.analyzedInstructions?.[0]?.steps?.map((step: any) => 
          step.step
        ) || [recipeDetail.instructions?.replace(/<[^>]*>/g, '') || 'Follow standard cooking procedures.'],
        prepTime: recipeDetail.readyInMinutes || 30,
        servings: recipeDetail.servings || 4,
        image: recipeDetail.image,
        nutrition: {
          calories: getNutrient('Calories'),
          protein: getNutrient('Protein'),
          carbs: getNutrient('Carbohydrates'),
          fat: getNutrient('Fat'),
        },
      };
    });

    console.log('Recipes generated successfully:', formattedRecipes.length);

    return new Response(
      JSON.stringify({ recipes: formattedRecipes }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
