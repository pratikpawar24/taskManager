const express = require("express");
const db = require("../db/database");
const { authenticateToken } = require("../middleware/auth");
const { taskCreateSchema, taskUpdateSchema, parse } = require("../utils/validation");
const router = express.Router();
router.use(authenticateToken);
const getTask = id => db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
const parseId = value => { const id = Number(value); return Number.isInteger(id) && id > 0 ? id : null; };

router.get("/", (req, res) => {
  const tasks = db.prepare(`SELECT id,title,description,status,due_date,created_at,updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC`).all(req.user.id);
  res.status(200).json({ success: true, data: { tasks, count: tasks.length } });
});

router.get("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Task id must be a positive integer." });
  const task = getTask(id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  if (task.user_id !== req.user.id) return res.status(403).json({ success: false, message: "You cannot access this task." });
  res.status(200).json({ success: true, data: { task } });
});

router.post("/", (req, res) => {
  const validation = parse(taskCreateSchema, req.body);
  if (!validation.ok) return res.status(400).json({ success: false, message: "Validation failed.", errors: validation.errors });
  const { title, description, status, due_date } = validation.data;
  const result = db.prepare(`INSERT INTO tasks (user_id,title,description,status,due_date) VALUES (?,?,?,?,?)`).run(req.user.id, title, description, status, due_date ?? null);
  res.status(201).json({ success: true, message: "Task created successfully.", data: { task: getTask(result.lastInsertRowid) } });
});

router.put("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Task id must be a positive integer." });
  const task = getTask(id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  if (task.user_id !== req.user.id) return res.status(403).json({ success: false, message: "You cannot modify this task." });
  const validation = parse(taskUpdateSchema, req.body);
  if (!validation.ok) return res.status(400).json({ success: false, message: "Validation failed.", errors: validation.errors });
  const f = validation.data;
  db.prepare(`UPDATE tasks SET title=?,description=?,status=?,due_date=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(f.title ?? task.title, f.description ?? task.description, f.status ?? task.status, f.due_date !== undefined ? f.due_date : task.due_date, id);
  res.status(200).json({ success: true, message: "Task updated successfully.", data: { task: getTask(id) } });
});

router.delete("/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Task id must be a positive integer." });
  const task = getTask(id);
  if (!task) return res.status(404).json({ success: false, message: "Task not found." });
  if (task.user_id !== req.user.id) return res.status(403).json({ success: false, message: "You cannot delete this task." });
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  res.status(200).json({ success: true, message: "Task deleted successfully." });
});
module.exports = router;
