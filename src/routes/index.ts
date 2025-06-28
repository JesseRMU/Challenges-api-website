import { Router } from 'express';
import { getGenres, getRandomMovieOrShow } from '../controllers/indexController.js';
import { getTagsIndex } from '../controllers/tagController.js';
import { getCategoryIndex } from '../controllers/categoryController.js';

const router: Router = Router();

router.get('/', getGenres);
router.get('/tags', getTagsIndex);
router.get('/categories', getCategoryIndex);
router.get('/random', getRandomMovieOrShow);

export default router;

