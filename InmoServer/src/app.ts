// src/app.ts
import express, { Request, Response } from 'express'; //TODO solo usar express, lo demas a un controller
import dotenv from "dotenv";
import { sequelize, dbSync } from "./config/database";
import propertyRoutes from "./routes/propertyRoutes";
const { auth, requiresAuth } = require("express-openid-connect");
const bodyParser = require("body-parser");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

//TODO mover todo esto a un config file, iria en dotenv?
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
};

app.use(bodyParser.json());

app.use(auth(config));

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const tokenResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        grant_type: "password",
        connection: "Username-Password-Authentication",
        username,
        password,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        scope: "openid profile email",
      }
    );

    res.json(tokenResponse.data);
  } catch (error: any) {
    console.error(
      "Error during login request:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({error: error.response ? error.response.data : error.message });
  }
});

app.get("/api/profile", async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  try {
    const userInfoResponse = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    res.json(userInfoResponse.data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/callback", (req, res) => {
  res.send("Login successful. You can close this tab.");
});

// TODO ---------- hasta aca iria en un controller --------------------

const main = async () => {
    await dbSync(); // Llama a la función de sincronización después de la autenticación
  
    app.use(express.json());
    app.use("/api", propertyRoutes);
  
    app.listen(PORT, async () => {
      console.log(`Server running on http://localhost:${PORT}`);
      try {
        await sequelize.authenticate();
        console.log(
          "Database connection successful"
        );
      } catch (error) {
        console.error("Could not connect to the database:", error);
      }
    });
  };
  
  main();
