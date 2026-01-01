const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const DB_FILE = path.join(__dirname, "db.json");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));

// Initialize database if not exists
async function initDB() {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ requests: [] }, null, 2));
  }
}

// Read database
async function readDB() {
  const data = await fs.readFile(DB_FILE, "utf8");
  return JSON.parse(data);
}

// Write database
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// ==================== API ENDPOINTS ====================

// POST /api/request - Create new lab request
app.post("/api/request", async (req, res) => {
  try {
    const { name, email, labName } = req.body;

    // Validation
    if (!name || !email || !labName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const db = await readDB();

    // Check if email already has a pending or approved request
    const existingRequest = db.requests.find(
      (r) =>
        r.email.toLowerCase() === email.toLowerCase() &&
        (r.status === "pending" || r.status === "approved")
    );

    if (existingRequest) {
      return res.status(400).json({
        error: "You already have an active request. Please check your status.",
      });
    }

    // Create new request
    const newRequest = {
      id: crypto.randomBytes(8).toString("hex"),
      name,
      email: email.toLowerCase(),
      labName,
      status: "pending",
      labUrl: null,
      createdAt: new Date().toISOString(),
    };

    db.requests.push(newRequest);
    await writeDB(db);

    res.json({
      success: true,
      message: "Request submitted successfully",
      requestId: newRequest.id,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/status - Fetch request status
app.get("/api/status", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const db = await readDB();
    const request = db.requests.find(
      (r) =>
        r.email.toLowerCase() === email.toLowerCase() &&
        (r.status === "pending" || r.status === "approved")
    );

    if (!request) {
      return res.json({ found: false });
    }

    res.json({
      found: true,
      status: request.status,
      name: request.name,
      labName: request.labName,
      labUrl: request.status === "approved" ? request.labUrl : null,
      createdAt: request.createdAt,
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/requests - List all requests (admin only)
app.get("/api/admin/requests", async (req, res) => {
  try {
    const { username, password } = req.query;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const db = await readDB();

    // Sort by creation date, newest first
    const sortedRequests = db.requests.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ requests: sortedRequests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/approve/:id - Approve request and attach lab URL
app.post("/api/admin/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, labUrl } = req.body;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!labUrl || !labUrl.trim()) {
      return res.status(400).json({ error: "Lab URL is required" });
    }

    const db = await readDB();
    const request = db.requests.find((r) => r.id === id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Update request
    request.status = "approved";
    request.labUrl = labUrl.trim();
    request.approvedAt = new Date().toISOString();

    await writeDB(db);

    res.json({
      success: true,
      message: "Request approved successfully",
    });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== ROUTES ====================

// Student request page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Student status page
app.get("/status", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/status.html"));
});

// Admin dashboard
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});

// ==================== START SERVER ====================

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Lab Access Portal running on http://localhost:${PORT}`);
      console.log(
        `Admin credentials - Username: ${ADMIN_USERNAME}, Password: ${ADMIN_PASSWORD}`
      );
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
