import express from "express";
import cors from "cors";
import pino from "pino-http";

const app = express();
app.use(pino());
app.use(express.json({ limit: "5mb" }));

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
