const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
];

const app = express();
app.use(cors({
  origin: function(origin, cb) {
    // allow requests with no origin (e.g., curl, mobile apps)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // set true only if you use cookies
}));


const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const ticketsRouter = require("./routes/tickets");


app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter); // you can protect these later with auth middleware
app.use("/api/tickets", ticketsRouter);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern_hierarchy";
const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error(err));
