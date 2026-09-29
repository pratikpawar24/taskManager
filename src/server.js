require("dotenv").config();
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Copy .env.example to .env and set a secret.");
  process.exit(1);
}
const express = require("express");
require("./db/database");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.get("/health", (req,res) => res.status(200).json({ success:true, message:"Task Manager API is running.", timestamp:new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use((req,res) => res.status(404).json({ success:false, message:"Route not found." }));
app.use((err,req,res,next) => {
  console.error(err);
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ success:false, message:"Malformed JSON request body." });
  res.status(500).json({ success:false, message:"Internal server error." });
});
app.listen(PORT, () => console.log(`Task Manager API running at http://localhost:${PORT}`));
