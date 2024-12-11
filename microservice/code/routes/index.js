import express from 'express';
import { getRecipes, getRecipeById, addRecipe, addIngredient, deleteRecipe } from '../controllers/recipeController.js';

const router = express.Router();

router.get('/recipes', getRecipes);
router.get('/recipes/:id', getRecipeById);
router.post('/recipes', addRecipe);
router.post('/ingredients', addIngredient);
router.delete('/recipes/:id', deleteRecipe);
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Adjust the origin as needed
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
export default router;
