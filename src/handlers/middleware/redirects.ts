import { RequestHandler } from 'express';

// Function to handle .html redirects
export const redirectPathsEndingInHtml: RequestHandler = (req, res, next) => {
  if (req.path.endsWith('.html')) {
    const newPath = req.path.replace('.html', '');
    res.redirect(301, newPath);
  } else {
    next();
  }
}

// Function to handle /home redirects
export const redirectHomePath: RequestHandler = (req, res, next) => {
  if (req.path === '/home') {
    res.redirect(301, '/');
  } else {
    next();
  }
}
