import express from 'express';
import { connectUser, getFeed, getPulse, getSavedSearches, getSuggestions, patchSavedSearch, savePost, reportPost } from '../controllers/connect.controller';

const router = express.Router();

router.get('/feed', getFeed);
router.get('/suggestions', getSuggestions);
router.get('/saved-searches', getSavedSearches);
router.patch('/saved-searches/:id', patchSavedSearch);
router.get('/pulse', getPulse);
router.post('/connect/:userId', connectUser);
router.post('/posts/:id/save', savePost);
router.post('/posts/:id/report', reportPost);

export default router;
