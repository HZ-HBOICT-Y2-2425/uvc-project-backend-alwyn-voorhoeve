import { JSONFilePreset } from "lowdb/node";

// Initialize database
const defaultData = { 
  "meta": { title: "Recipes"},
   recipes: [],
   ingredients: [] 
  };

const db = await JSONFilePreset('db.json', defaultData);
const recipes = db.data;

export async function getRecipes(req, res) {
  const allrecipes = db.data.recipes;
  res.status(200).json(recipes);
}

export async function getRecipeById(req, res) {
  const recipe = recipes.find(r => r.id === req.params.id);
  if (recipe) {
    res.status(200).json(recipe);
  } else {
    res.status(404).send('Recipe not found');
  }
}

export async function addRecipe(req, res) {
  const { id, name, description, image } = req.body;
  if (!id || !name || !description || !image) {
    return res.status(400).send("Missing required fields");
  }
  const newRecipe = { id, name, description, image, ingredients: [] };
  recipes.push(newRecipe);
  await db.write();
  res.status(201).json(newRecipe);
}

export async function addIngredient(req, res) {
  const { recipeId, ingredient } = req.body;
  if (!recipeId || !ingredient) {
    return res.status(400).send("Missing recipe ID or ingredient");
  }
  const recipe = recipes.find(r => r.id === recipeId);
  if (recipe) {
    recipe.ingredients.push(ingredient);
    await db.write();
    res.status(200).json(recipe);
  } else {
    res.status(404).send('Recipe not found');
  }
}

export async function deleteRecipe(req, res) {
  const index = recipes.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    recipes.splice(index, 1);
    await db.write();
    res.status(200).send("Recipe deleted");
  } else {
    res.status(404).send('Recipe not found');
  }
}
