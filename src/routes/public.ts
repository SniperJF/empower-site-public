import express from 'express';
import { serveAboutPage, serveHomePage, serveMediaPage, serveRecDrugsPage } from '../handlers/controllers/public.js';
import sendEmail from '../handlers/send-email.js';

let router = express.Router();

// GET requests
router.get('/', serveHomePage);
router.get('/about', serveAboutPage);
router.get('/media', serveMediaPage);
router.get('/recdrugs', serveRecDrugsPage);

// POST requests
router.post('/contact', sendEmail);

export default router;
