import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import passport from "./auth";
import session from "express-session";
import authRoutes from './routes/authRoutes';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
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


app.get("*", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "..", "dist") });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
