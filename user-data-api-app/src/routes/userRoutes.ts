import { Router } from 'express';
import * as userController from '../controllers/userController';


const router = Router();

// GET /users/:id - Retrieve a user by ID
router.get('/users/:id', userController.getUser);

// POST /users - Create a new user
router.post('/users', userController.createUser);

// DELETE /cache - Clear the in-memory cache
router.delete('/cache', userController.clearCache);

// GET /cache-status - Get current cache statistics
router.get('/cache-status', userController.getCacheStatus);

export default router;
