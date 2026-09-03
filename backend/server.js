const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// USER SCHEMA
// ===============================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);


// ===============================
// APPLIED JOB SCHEMA
// ===============================

const appliedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    jobId: {
      type: Number,
      required: true,
    },

    title: String,
    company: String,
    location: String,
    type: String,
    salary: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

const AppliedJob = mongoose.model(
  "AppliedJob",
  appliedJobSchema
);


// ===============================
// RESUME SCHEMA
// ===============================

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    resumeText: {
      type: String,
      required: true,
    },

    analysis: {
      score: {
        type: Number,
        default: 0,
      },

      skills: {
        type: [String],
        default: [],
      },

      missingSkills: {
        type: [String],
        default: [],
      },

      suggestions: {
        type: [String],
        default: [],
      },

      recommendedRole: {
        type: String,
        default: "Software Developer",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model(
  "Resume",
  resumeSchema
);


// ===============================
// JWT AUTH MIDDLEWARE
// ===============================

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access denied. Invalid token.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    console.error(
      "JWT Authentication Error:",
      error.message
    );

    return res.status(403).json({
      message: "Invalid or expired token.",
    });
  }
};


// ===============================
// REGISTER
// ===============================

app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Email already registered.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message:
        "Registration successful!",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "Register Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during registration.",
    });
  }
});


// ===============================
// LOGIN + JWT
// ===============================

app.post("/api/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }


    // ===============================
    // CREATE JWT
    // ===============================

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }
    );


    // ===============================
    // SEND RESPONSE
    // ===============================

    res.json({
      message:
        "Login successful!",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during login.",
    });
  }
});


// ===============================
// JOBS DATA
// ===============================

const jobs = [
  {
    id: 1,

    title: "Frontend Developer",

    company: "Google",

    location: "Remote",

    type: "Full Time",

    salary: "$80,000 - $100,000",

    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Git",
    ],

    description:
      "Build modern and responsive web applications using React and JavaScript.",
  },

  {
    id: 2,

    title: "Backend Developer",

    company: "Microsoft",

    location: "Remote",

    type: "Full Time",

    salary: "$85,000 - $110,000",

    skills: [
      "Node.js",
      "Express",
      "MongoDB",
      "SQL",
      "Git",
    ],

    description:
      "Develop scalable backend APIs and services using Node.js, Express and MongoDB.",
  },

  {
    id: 3,

    title: "Full Stack Developer",

    company: "Shopify",

    location: "Hybrid",

    type: "Full Time",

    salary: "$90,000 - $120,000",

    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "MongoDB",
    ],

    description:
      "Work on both frontend and backend systems to build complete web applications.",
  },

  {
    id: 4,

    title: "Python Developer",

    company: "Systems Ltd",

    location: "Lahore",

    type: "Full Time",

    salary: "PKR 100,000 - 180,000",

    skills: [
      "Python",
      "Django",
      "SQL",
      "Git",
    ],

    description:
      "Develop Python-based applications and backend systems using Django and SQL.",
  },
];


// ===============================
// GET ALL JOBS
// ===============================

app.get(
  "/api/jobs",
  (req, res) => {
    res.json(jobs);
  }
);


// ===============================
// GET SINGLE JOB
// ===============================

app.get(
  "/api/jobs/:id",
  (req, res) => {
    const job = jobs.find(
      (job) =>
        job.id ===
        Number(req.params.id)
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    res.json(job);
  }
);


// ===============================
// APPLY FOR JOB
// ===============================

app.post(
  "/api/jobs/:id/apply",
  authenticateToken,
  async (req, res) => {
    try {

      // User ID comes from JWT
      const userId =
        req.user.userId;

      const job = jobs.find(
        (job) =>
          job.id ===
          Number(req.params.id)
      );

      if (!job) {
        return res.status(404).json({
          message:
            "Job not found.",
        });
      }


      // Check user
      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }


      // Check duplicate application
      const alreadyApplied =
        await AppliedJob.findOne({
          userId,
          jobId: job.id,
        });

      if (alreadyApplied) {
        return res.status(400).json({
          message:
            "You have already applied for this job.",
        });
      }


      // Save application
      const appliedJob =
        await AppliedJob.create({
          userId,

          jobId: job.id,

          title: job.title,

          company: job.company,

          location: job.location,

          type: job.type,

          salary: job.salary,

          description:
            job.description,
        });


      res.status(201).json({
        message:
          "Job application submitted successfully!",

        appliedJob,
      });

    } catch (error) {

      console.error(
        "Apply Job Error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while applying for job.",
      });
    }
  }
);


// ===============================
// GET APPLIED JOBS
// ===============================

app.get(
  "/api/applied-jobs/:userId",
  authenticateToken,
  async (req, res) => {
    try {

      // User can only access own jobs
      if (
        req.user.userId !==
        req.params.userId
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to access these jobs.",
        });
      }

      const appliedJobs =
        await AppliedJob.find({
          userId:
            req.params.userId,
        }).sort({
          createdAt: -1,
        });

      res.json(appliedJobs);

    } catch (error) {

      console.error(
        "Get Applied Jobs Error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while getting applied jobs.",
      });
    }
  }
);


// ===============================
// REMOVE APPLIED JOB
// ===============================

app.delete(
  "/api/applied-jobs/:userId/:jobId",
  authenticateToken,
  async (req, res) => {
    try {

      // User can only remove own application
      if (
        req.user.userId !==
        req.params.userId
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to remove this job.",
        });
      }


      const deletedJob =
        await AppliedJob.findOneAndDelete({
          userId:
            req.params.userId,

          jobId:
            Number(req.params.jobId),
        });


      if (!deletedJob) {
        return res.status(404).json({
          message:
            "Applied job not found.",
        });
      }


      res.json({
        message:
          "Job removed successfully.",
      });

    } catch (error) {

      console.error(
        "Remove Applied Job Error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while removing job.",
      });
    }
  }
);


// ===============================
// SAVE RESUME
// ===============================

app.post(
  "/api/resume",
  authenticateToken,
  async (req, res) => {
    try {

      // User ID comes from JWT
      const userId =
        req.user.userId;

      const {
        resumeText,
        analysis,
      } = req.body;


      if (
        !resumeText ||
        !resumeText.trim()
      ) {
        return res.status(400).json({
          message:
            "Resume information is required.",
        });
      }


      const savedResume =
        await Resume.findOneAndUpdate(

          {
            userId,
          },

          {
            userId,

            resumeText,

            analysis:
              analysis || null,
          },

          {
            new: true,

            upsert: true,

            runValidators: true,
          }
        );


      res.json({
        message:
          "Resume saved successfully!",

        resume:
          savedResume,
      });

    } catch (error) {

      console.error(
        "Save Resume Error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while saving resume.",
      });
    }
  }
);


// ===============================
// GET RESUME
// ===============================

app.get(
  "/api/resume/:userId",
  authenticateToken,
  async (req, res) => {
    try {

      // User can only access own resume
      if (
        req.user.userId !==
        req.params.userId
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to access this resume.",
        });
      }


      const resume =
        await Resume.findOne({
          userId:
            req.params.userId,
        });


      if (!resume) {
        return res.status(404).json({
          message:
            "No saved resume found.",
        });
      }


      res.json(resume);

    } catch (error) {

      console.error(
        "Get Resume Error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while loading resume.",
      });
    }
  }
);


// ===============================
// DELETE RESUME
// ===============================

app.delete(
  "/api/resume/:userId",
  authenticateToken,
  async (req, res) => {
    try {

      // User can only delete own resume
      if (
        req.user.userId !==
        req.params.userId
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to delete this resume.",
        });
      }


      const deletedResume =
        await Resume.findOneAndDelete({
          userId:
            req.params.userId,
        });


      if (!deletedResume) {
        return res.status(404).json({
          message:
            "No saved resume found.",
        });
      }


      res.json({
        message:
          "Resume deleted successfully.",
      });

    } catch (error) {

      console.error(
        "Delete Resume Error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while deleting resume.",
      });
    }
  }
);


// ===============================
// TEST ROUTE
// ===============================

app.get(
  "/",
  (req, res) => {
    res.send(
      "CareerAI Backend is running 🚀"
    );
  }
);


// ===============================
// MONGODB CONNECTION
// ===============================

const PORT = 5000;

console.log(
  "🔄 Trying to connect to MongoDB..."
);


if (!process.env.MONGO_URI) {

  console.error(
    "❌ MONGO_URI is not found in .env file."
  );

} else if (!process.env.JWT_SECRET) {

  console.error(
    "❌ JWT_SECRET is not found in .env file."
  );

} else {

  console.log(
    "📡 Using connection string: ✅ Set"
  );

  mongoose
    .connect(
      process.env.MONGO_URI
    )

    .then(() => {

      console.log(
        "✅ MongoDB Connected Successfully"
      );

      app.listen(
        PORT,
        () => {

          console.log(
            `🚀 Server running on http://localhost:${PORT}`
          );

        }
      );

    })

    .catch((error) => {

      console.error(
        "❌ MongoDB Connection Error:",
        error.message
      );

    });
}

