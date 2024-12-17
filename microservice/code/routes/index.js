import express from 'express';
import { getRecipes, getRecipeById, addRecipe, addIngredient, deleteRecipe, updateRecipe } from '../controllers/recipeController.js';

const router = express.Router();

// GET all recipes
router.get('/recipes', getRecipes);
router.get('/recipes/:id', getRecipeById);
router.post('/recipes', addRecipe);
router.post('/ingredients', addIngredient);
router.delete('/recipes/:id', deleteRecipe);
router.put('/recipes/:id', updateRecipe);  // Make sure this line is here for PUT requests

// CORS and other middleware
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Adjust the origin if needed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

export default router;