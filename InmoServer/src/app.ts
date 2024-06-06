import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auhtRoutes';

const app = express();
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api", authRoutes);

const main = async () => {
  app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

main();
