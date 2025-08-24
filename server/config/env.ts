import { z } from "zod";

export const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  SESSION_SECRET: z.string().min(32).optional(), // Optional for client app
  CSRF_SECRET: z.string().min(32).optional(),    // Optional for client app
  STAFF_API_URL: z.string().url().optional(),    // Staff API base URL
  STAFF_API_BASE: z.string().url().optional(),   // Alternative name
  CLIENT_SYNC_KEY: z.string().optional(),        // Client sync secret
  OPENAI_API_KEY: z.string().optional(),         // OpenAI integration
  VAPID_PUBLIC_KEY: z.string().optional(),       // Push notifications
  VAPID_PRIVATE_KEY: z.string().optional(),      // Push notifications
}).parse(process.env);

// Export for use in application
export default Env;