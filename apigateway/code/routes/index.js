import express from 'express';
import { getRecipes, getRecipeById, addRecipe, addIngredient, deleteRecipe } from '../controllers/recipeController.js';
const router = express.Router();

// Recipes routes
router.get('/recipes', getRecipes);
router.get('/recipes/:id', getRecipeById);
router.post('/recipes', addRecipe);
router.post('/ingredients', addIngredient);
router.delete('/recipes/:id', deleteRecipe);

export default router;
