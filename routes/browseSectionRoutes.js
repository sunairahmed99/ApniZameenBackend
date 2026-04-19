import express from 'express';
import {
  getBrowseSections,
  getBrowseSectionById,
  createBrowseSection,
  updateBrowseSection,
  deleteBrowseSection
} from '../controllers/browseSectionController.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.get('/', cacheMiddleware(600), getBrowseSections);
router.post('/', createBrowseSection);

router.route('/:id')
  .get(getBrowseSectionById)
  .put(updateBrowseSection)
  .delete(deleteBrowseSection);

export default router;
