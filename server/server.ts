import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv"
import passport from "./auth";
import session from "express-session";

dotenv.config()
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '..', "dist")));



//routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/',  })
);


app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '..', 'dist') });
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});