import express from 'express';
import {
    createBox,
    getAllBoxes,
    getBoxById,
    updateBox,
    deleteBox
} from '../controllers/homePageBoxController.js';

const router = express.Router();

router.route('/')
    .post(createBox)
    .get(getAllBoxes);

router.route('/:id')
    .get(getBoxById)
    .put(updateBox)
    .delete(deleteBox);

export default router;
