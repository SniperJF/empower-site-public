import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const reject = (res: Response) => {
  res.setHeader('www-authenticate', 'Basic');
  res.sendStatus(401);
}

export async function authCheck(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];

  if (!auth) return reject(res);

  const [username, password] = Buffer.from(auth.replace('Basic ', ''), 'base64').toString().split(':');
  const user = { name: username };
  const isValidLogin = (username === process.env.DASHBOARD_USERNAME && password === process.env.DASHBOARD_PASSWORD);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as Secret, { expiresIn: '1h' });

  if (!isValidLogin) return reject(res);
  if (!token) return res.sendStatus(401);
  
  res.cookie('token', token, { httpOnly: true });
  next();
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  
  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;
    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/');
  }
}
