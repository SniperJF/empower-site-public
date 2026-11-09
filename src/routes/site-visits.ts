import express from 'express';
import { getSiteVisitSummary, getSiteVisitsByCountry, getSiteVisitsByDateRange, getSiteVisitsByState } from '../api/site-visits.js';

let router = express.Router();

router.get('/summary', getSiteVisitSummary);
router.get('/range', getSiteVisitsByDateRange);
router.get('/us', getSiteVisitsByState);
router.get('/world', getSiteVisitsByCountry);

export default router;
