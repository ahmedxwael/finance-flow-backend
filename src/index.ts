import express from "express";
import { PORT, connectToDB } from "./config";
import { errorHandler, notFoundHandler } from "./middlewares";
import { log } from "./utils";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.use(errorHandler);
app.use(notFoundHandler);

// Connect to database
connectToDB();

// Start server
app.listen(PORT, () => {
  log.info(`Server is running on port http://localhost:${PORT}`);
});
