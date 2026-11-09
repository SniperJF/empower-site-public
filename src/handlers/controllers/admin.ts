import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __dashboardDir = path.join(__dirname, '../../../public/empowerDash');

export async function adminHomePage(req: Request, res: Response) {
  res.sendFile(path.join(__dashboardDir, 'dashboard.html'));
}
  
export async function wastePanel(req: Request, res: Response) {
  res.sendFile(path.join(__dashboardDir, 'wastewater.html'));
}
