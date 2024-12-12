import { JSONFilePreset } from "lowdb/node";

// Initialize database
const defaultData = {
  meta: { title: "Recipes" },
  recipes: [],
  ingredients: []
};

const db = await JSONFilePreset("db.json", defaultData);
const recipes = db.data.recipes || [];
const ingredients = db.data.ingredients || [];

// Get all recipes
export async function getRecipes(req, res) {
  res.status(200).json(recipes);
}

// Get recipe by ID
export async function getRecipeById(req, res) {
  const recipe = recipes.find((r) => r.id === parseInt(req.params.id, 10));
  if (recipe) {
    res.status(200).json(recipe);
  } else {
    res.status(404).send("Recipe not found");
  }
}

// Add a new recipe
export async function addRecipe(req, res) {
  const { Name, Ingredients, Description } = req.body;

  if (!Name || !Ingredients || !Description) {
    return res.status(400).send("Missing required fields: Name, Ingredients, or Description.");
  }

  const newRecipeId = recipes.length ? Math.max(...recipes.map((r) => r.id)) + 1 : 1;

  const newRecipe = {
    id: newRecipeId,
    Name,
    Ingredients: [],
    Description
  };

  const ingredientIds = Ingredients.split(",").map((ingredientName) => {
    ingredientName = ingredientName.trim();
    const existingIngredient = ingredients.find((i) => i.Name.toLowerCase() === ingredientName.toLowerCase());

    if (existingIngredient) {
      return existingIngredient.IngredientId;
    } else {
      const newIngredientId = ingredients.length ? Math.max(...ingredients.map((i) => i.IngredientId)) + 1 : 1;
      const newIngredient = { IngredientId: newIngredientId, Name: ingredientName };
      ingredients.push(newIngredient);
      return newIngredientId;
    }
  });

  newRecipe.Ingredients = ingredientIds;

  recipes.push(newRecipe);
  await db.write();

  res.status(201).json(newRecipe);
}

// Add an ingredient to a recipe
export async function addIngredient(req, res) {
  const { recipeId, ingredient } = req.body;

  if (!recipeId || !ingredient) {
    return res.status(400).send("Missing recipe ID or ingredient.");
  }

  const recipe = recipes.find((r) => r.id === parseInt(recipeId, 10));
  if (recipe) {
    const existingIngredient = ingredients.find((i) => i.Name.toLowerCase() === ingredient.toLowerCase());

    let ingredientId;
    if (existingIngredient) {
      ingredientId = existingIngredient.IngredientId;
    } else {
      ingredientId = ingredients.length ? Math.max(...ingredients.map((i) => i.IngredientId)) + 1 : 1;
      const newIngredient = { IngredientId: ingredientId, Name: ingredient };
      ingredients.push(newIngredient);
    }

    if (!recipe.Ingredients.includes(ingredientId)) {
      recipe.Ingredients.push(ingredientId);
    }

    await db.write();
    res.status(200).json({ recipe, ingredient });
  } else {
    res.status(404).send("Recipe not found.");
  }
}

// Delete a recipe
export async function deleteRecipe(req, res) {
  const index = recipes.findIndex((r) => r.id === parseInt(req.params.id, 10));
  if (index !== -1) {
    recipes.splice(index, 1);
    await db.write();
    res.status(200).send("Recipe deleted");
  } else {
    res.status(404).send("Recipe not found.");
  }
}