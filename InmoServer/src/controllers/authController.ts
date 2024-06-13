import { Request, Response } from 'express';
import { UserService } from '../services/authService';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export class AuthController {
  constructor(private service: UserService) {}

  public login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
      // Autenticación con Auth0
      const tokenResponse = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        grant_type: 'password',
        username,
        password,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        scope: 'openid profile email',
      });

      const { access_token } = tokenResponse.data;

      console.log('Access token:', access_token);

      // Verificar token con Auth0
      const userInfoResponse = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const { email } = userInfoResponse.data;
      const user: any = await this.service.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Crear nuestro propio JWT
      const tokenPayload = {
        id: user.auth0_id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });

      res.json({ token });
    } catch (error: any) {
      console.error('Error during login request:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
  };

  public callback = (req: Request, res: Response) => {
    res.send('Login successful. You can close this tab.');
  };
}
