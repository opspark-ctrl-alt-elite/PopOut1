import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "./models/User";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { google_id: profile.id } });
        if (!user) {
          user = await User.create({
            google_id: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value,
            profile_picture: profile.photos?.[0].value,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error, null as any);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  console.log("serializing user", user);
  console.log("user id", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
