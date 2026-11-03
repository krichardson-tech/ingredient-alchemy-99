# Architecture

- Keep the built-in recipe catalog in `src/data/recipes.ts` and deterministic filtering/ranking in `src/lib/recipeRanking.ts`; generation must run locally without recipe API requests.
- Preserve the existing recipe object contract (ingredient name/amount, instructions, prepTime, servings, nutrition) so generated and saved recipes remain compatible with all recipe views.