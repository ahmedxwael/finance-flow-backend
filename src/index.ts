import express from "express";
import { z } from "zod";
import { PORT, connectToDB } from "./config";
import { errorHandler, notFoundHandler, validateRequest } from "./middlewares";
import { log } from "./utils";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const testSchema = z.object({
  name: z.string().min(1),
});

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/api/v1/test", validateRequest(testSchema), (req, res) => {
  res.json({ message: "Test successful" });
});

app.use(errorHandler);
app.use(notFoundHandler);

// Connect to database
connectToDB();

// Start server
app.listen(PORT, () => {
  log.info(`Server is running on port http://localhost:${PORT}`);
});
