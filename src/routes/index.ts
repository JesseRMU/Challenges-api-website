import { Router } from 'express';
// import { getIndex } from '../controllers/indexController.js';
import { getIndex, getRandomMovieOrShow } from '../controllers/indexController.js';
import { getTagsIndex } from '../controllers/tagController.js';
import { getCategoryIndex } from '../controllers/categoryController.js';

const router: Router = Router();

router.get('/', getIndex);
router.get('/tags', getTagsIndex);
router.get('/categories', getCategoryIndex);
router.get('/random', getRandomMovieOrShow);

export default router;

