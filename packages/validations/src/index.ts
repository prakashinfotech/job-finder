import { z } from "zod";

export const userRoleSchema = z.enum(["JOB_SEEKER", "RECRUITER", "ADMIN"]);

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  location: z.string().min(2),
  skills: z.array(z.string()).min(1),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
