import { z } from "zod"

export const fundingAmountSchema = z
  .number()
  .min(1000, "Minimum funding amount is $1,000")
  .max(10000000, "Maximum funding amount exceeded")

export const emailSchema = z
  .string()
  .email("Invalid email address")

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
