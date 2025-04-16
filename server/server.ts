import './models/associations';

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
import vendorRoutes from "./routes/vendorRoutes";
import eventRoutes from './routes/eventRoutes';
import categoryRoutes from './routes/categoryRoutes';
import imageRoutes from './routes/imageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import vendorSpotlightRouter from './routes/vendorSpotlightRoutes';
import reviewRoutes from './routes/reviewRoutes';
import userBookmarkRoutes from './routes/userBookmarkRoutes';
import statsRouter from './routes/statsRoutes';
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
app.use("/api/map", mapRoutes);
app.use("/api/vendor", vendorRoutes);
app.use('/vendors', vendorSpotlightRouter); 
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', reviewRoutes);
app.use('/vendors', reviewRoutes);
app.use('/api', userBookmarkRoutes);
app.use('/users', userBookmarkRoutes);
app.use('/vendors', statsRouter);
app.use('/vendors', vendorRoutes);
app.use('/vendors', reviewRoutes);

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

app.get('/firebase-messaging-sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/firebase-messaging-sw.js'));
});

app.get("*", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "..", "dist") });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
