import { RequestHandler } from 'express';
import { handlePageVisit } from '../handle-visitor.js';

// List of known HTML pages
const htmlPages = ['/', '/about', '/media', '/recdrugs', '/admin', '/admin/wastewater'];

export const logPageVisit: RequestHandler = (req, res, next) => {
  const ip = req.clientIp;
  const pageUrl = req.path;

  if (ip && htmlPages.includes(pageUrl)) {
    handlePageVisit(ip, pageUrl);
  }
  next();
}
