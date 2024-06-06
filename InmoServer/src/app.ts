// src/app.ts
import { sequelize, dbSync } from "./config/database";
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auhtRoutes';
import propertyRoutes from "./routes/propertyRoutes";

const app = express();
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use("/api", authRoutes);
app.use("/api", propertyRoutes);

const main = async () => {
  await dbSync(); // Llama a la función de sincronización después de la autenticación

  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database: ", error);
    }
  });
};

main();
