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
  const recipesWithIngredients = recipes.map(recipe => ({
    ...recipe,
    Ingredients: recipe.Ingredients.map(id => {
      const ingredient = ingredients.find(i => i.IngredientId === id);
      return ingredient ? ingredient.Name : `Unknown ingredient (ID: ${id})`;
    })
  }));

  res.status(200).json(recipesWithIngredients);
}

// Get recipe by ID
export async function getRecipeById(req, res) {
  const recipe = recipes.find(r => r.id === parseInt(req.params.id, 10));
  if (recipe) {
    const recipeWithIngredients = {
      ...recipe,
      Ingredients: recipe.Ingredients.map(id => {
        const ingredient = ingredients.find(i => i.IngredientId === id);
        return ingredient ? ingredient.Name : `Unknown ingredient (ID: ${id})`;
      })
    };
    res.status(200).json(recipeWithIngredients);
  } else {
    res.status(404).send('Recipe not found');
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

// Update a recipe (this is the 'update' API called by PUT)
export async function updateRecipe(req, res) {
  const { id, Name, Ingredients, Description } = req.body; 

  if (!id || !Name || !Ingredients || !Description) {
    return res.status(400).send("ID, Name, Ingredients, and Description are required.");
  }

  let recipeIndex = recipes.findIndex((recipe) => recipe.id === id);

  if (recipeIndex === -1) {
    return res.status(404).send("Recipe not found.");
  }

  // Convert ingredient names to IngredientIds
  const ingredientIds = Ingredients.map((ingredientName) => {
    const existingIngredient = ingredients.find((i) => i.Name.toLowerCase() === ingredientName.toLowerCase());
    if (existingIngredient) {
      return existingIngredient.IngredientId;
    } else {
      // If the ingredient does not exist, create it
      const newIngredientId = ingredients.length ? Math.max(...ingredients.map((i) => i.IngredientId)) + 1 : 1;
      const newIngredient = { IngredientId: newIngredientId, Name: ingredientName };
      ingredients.push(newIngredient);
      return newIngredientId;
    }
  });

  // Update the recipe
  recipes[recipeIndex] = {
    ...recipes[recipeIndex],
    Name,
    Ingredients: ingredientIds, 
    Description
  };

  await db.write(); 

  res.status(200).json(recipes[recipeIndex]); 
}

// Get all shopping list items
export async function getShoppingList(req, res) {
  const shoppingList = db.data.shoppingList || [];
  res.status(200).json(shoppingList);
}

// Add an item to the shopping list
export async function addShoppingListItem(req, res) {
  const { Name } = req.body;

  if (!Name) {
    return res.status(400).send("Item name is required.");
  }

  const newItem = {
    id: db.data.shoppingList.length ? Math.max(...db.data.shoppingList.map((i) => i.id)) + 1 : 1,
    Name,
  };

  db.data.shoppingList.push(newItem);
  await db.write();

  res.status(201).json(newItem);
}

// Delete an item from the shopping list
export async function deleteShoppingListItem(req, res) {
  const itemId = parseInt(req.params.id, 10);
  const index = db.data.shoppingList.findIndex((item) => item.id === itemId);

  if (index !== -1) {
    db.data.shoppingList.splice(index, 1);
    await db.write();
    res.status(204).send();
  } else {
    res.status(404).send("Item not found.");
  }
}

export const addIngredientToShoppingList = async (req, res) => {
  const { ingredient } = req.body;

  if (!ingredient) {
      return res.status(400).json({ error: 'Ingredient is required' });
  }

  try {
      await db.ShoppingList.create({ name: ingredient });
      res.status(201).json({ message: 'Ingredient added to shopping list' });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};