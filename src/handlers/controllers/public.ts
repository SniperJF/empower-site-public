import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __publicDir = path.join(__dirname, '../../../public');

export const serveHomePage = async (req: Request, res: Response) => {
  res.sendFile(path.join(__publicDir, 'home.html'));
}

export const serveAboutPage = async (req: Request, res: Response) => {
  res.sendFile(path.join(__publicDir, 'about.html'));
}

export const serveMediaPage = async (req: Request, res: Response) => {
  res.sendFile(path.join(__publicDir, 'media.html'));
}

export const serveRecDrugsPage = async (req: Request, res: Response) => {
  res.sendFile(path.join(__publicDir, 'recdrugs.html'));
}
