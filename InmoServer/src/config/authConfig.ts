import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET!,
  baseURL: process.env.BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email',
  },
};
