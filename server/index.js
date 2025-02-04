const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const authRoutes = require('./routes/authRoutes.js'); // Import the routes
const otpRoutes = require('./routes/otpRoutes.js');
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User.js");

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Vite frontend
  credentials: true, // Allow cookies and sessions
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Hello World from me");
});

// Passport Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value,
          });
          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Google OAuth Authentication Route
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173/dashboard",
    failureRedirect: "http://localhost:5173",
  })
);

// Google Token Authentication (Used by Frontend)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.post("/auth/google/token", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Check if the user exists
    let user = await User.findOne({ email: payload.email });

    if (user) {
      // If user exists, respond accordingly
      return res.status(200).json({
        existingUser: true,
        message: "User already exists",
      });
    }

    // Create a new user if not exists
    user = new User({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
    await user.save();

    req.login(user, (err) => {
      if (err) {
        return res.status(500).send("Error logging in");
      }
      res.status(200).json({ message: "Signup successful" });
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});


// Logout Route
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5173");
  });
});

// Protected Route Example
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }
  res.json(req.user);
});

// Use the routes
app.use('/api/auth', authRoutes); // This sets the base path for routes
app.use('/api/otp', otpRoutes); // OTP verification route

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
