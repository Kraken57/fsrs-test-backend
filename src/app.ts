import express from "express";
import bodyParser from "body-parser";
import cardRoutes from "./routes/cards";

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/cards", cardRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});