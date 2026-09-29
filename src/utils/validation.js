const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(72)
});
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.").max(72)
});
const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z.string().trim().max(1000).optional().default(""),
  status: z.enum(["pending", "in_progress", "completed"]).optional().default("pending"),
  due_date: z.string().date("due_date must use YYYY-MM-DD.").nullable().optional()
});
const taskUpdateSchema = taskCreateSchema.partial().refine(v => Object.keys(v).length > 0, {
  message: "At least one field must be supplied for an update."
});
function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) return { ok: false, errors: result.error.issues.map(i => ({ field: i.path.join(".") || "body", message: i.message })) };
  return { ok: true, data: result.data };
}
module.exports = { registerSchema, loginSchema, taskCreateSchema, taskUpdateSchema, parse };
