import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import passport from "./auth";
import session from "express-session";

// router imports
import authRoutes from './routes/authRoutes';
import mapRoutes from "./routes/mapRoutes";
import userRoutes from './routes/userRoutes'
import vendorRouter from "./routes/vendorRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "..", "dist")));

//routes
app.use(authRoutes);
app.use(mapRoutes);
app.use("/vendor", vendorRouter);
app.use('/user', userRoutes);

app.get("*", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "..", "dist") });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
