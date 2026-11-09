import express from 'express';
import { adminHomePage, wastePanel } from '../handlers/controllers/admin.js';
import { local_check, uploadCovidData, uploadVariantData } from '../handlers/read-files.js'
import { authCheck, verifyToken } from '../handlers/controllers/auth.js';

let router = express.Router(); 

// GET requests
router.get('/', authCheck, adminHomePage);
router.get('/env_check', verifyToken, local_check);
router.get('/wastewater', verifyToken, wastePanel);

// POST requests
router.post('/uploadCovid', verifyToken, uploadCovidData);
router.post('/uploadVariant', verifyToken, uploadVariantData);

export default router;
