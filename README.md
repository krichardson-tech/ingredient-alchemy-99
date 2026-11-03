# Ingredient Alchemy

Ingredient Alchemy is a recipe generator that helps users turn the ingredients they already have into meal ideas.

## Live Demo

https://ingredient-alchemy-99.netlify.app/

## Buildathon Path

Useful — the project helps reduce food waste and makes meal planning easier by suggesting recipes from available ingredients.

## Approved Tool

This project uses **p5.js** as a meaningful part of the experience. The p5.js animation visualizes the recipe-generation process with floating ingredient particles and displays the currently generated recipe.

p5.js is loaded from the jsDelivr CDN in `index.html`.

## Features

- Generate recipes from available ingredients
- Quick-start ingredient presets
- Dietary restriction filters
- Cuisine, flavor, taste, and meal-category preferences
- Recipe ranking based on ingredient matches
- Favorites
- Shopping list
- Meal planner
- Ingredient substitutions
- Light and dark themes
- Animated p5.js alchemy visual

## How It Works

Recipes are stored locally in `src/data/recipes.ts`. When the user generates a recipe, the app ranks recipes by ingredient coverage and selected preferences. This avoids external recipe API quotas and keeps the demo reliable.

## Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- p5.js
- Supabase project configuration

## Outside Resources and AI Disclosure

AI tools, including Lovable and ChatGPT/Codex, assisted with scaffolding, debugging, code suggestions, and documentation. The project code and final design were reviewed and tested by the project author.

The original prototype used Spoonacular during development. The submitted version uses a local recipe dataset so the application does not depend on Spoonacular’s request quota.

## Running Locally

```bash
npm install
npm run dev
```
