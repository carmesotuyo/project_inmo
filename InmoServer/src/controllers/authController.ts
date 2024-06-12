import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Autenticación con Auth0
    const tokenResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: "password",
        username,
        password,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        scope: "openid profile email",
      }
    );

    const { access_token } = tokenResponse.data;

    // Verificar token con Auth0
    const userInfoResponse = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { email } = userInfoResponse.data;

    // Obtener usuario de la base de datos
    //const user = await findUserByEmail(email);
    const user = { id: 1, email, role: 'admin' };

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Crear nuestro propio JWT
    const tokenPayload = {
      id: user.id,
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

// export const profile = async (req: Request, res: Response) => {
//   const { authorization } = req.headers;

//   if (!authorization) {
//     return res.status(401).json({ error: 'Authorization header is missing' });
//   }

//   try {
//     const userInfoResponse = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
//       headers: {
//         Authorization: authorization,
//       },
//     });

//     res.json(userInfoResponse.data);
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };

export const callback = (req: Request, res: Response) => {
  res.send('Login successful. You can close this tab.');
};
