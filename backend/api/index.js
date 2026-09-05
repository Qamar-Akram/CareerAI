const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MongoDB Connection
========================= */

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;

  console.log("✅ MongoDB Connected Successfully");
}

/* =========================
   User Schema
========================= */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

/* =========================
   Root Route
========================= */

app.get("/", async (req, res) => {
  try {
    await connectDB();

    res.json({
      message: "CareerAI Backend is running 🚀",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

/* =========================
   Register
========================= */

app.post("/api/register", async (req, res) => {
  try {
    await connectDB();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Login
========================= */

app.post("/api/login", async (req, res) => {
  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Jobs
========================= */

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Solutions",
    location: "Lahore",
    type: "Full Time",
    skills: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "Software House",
    location: "Islamabad",
    type: "Full Time",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: 3,
    title: "React Developer",
    company: "Digital Agency",
    location: "Remote",
    type: "Remote",
    skills: ["React", "JavaScript", "CSS"],
  },
];

/* =========================
   Get Jobs
========================= */

app.get("/api/jobs", async (req, res) => {
  try {
    await connectDB();

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================
   Get Single Job
========================= */

app.get("/api/jobs/:id", async (req, res) => {
  try {
    await connectDB();

    const job = jobs.find(
      (job) => job.id === Number(req.params.id)
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================
   Export for Vercel
========================= */

module.exports = app;