import { z } from 'zod'

export const whitelistSchema = z.object({
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  label: z.string().optional()
})

export const botConfigSchema = z.object({
  system_prompt: z.string().min(10, 'System prompt must be at least 10 characters'),
  temperature: z.number().min(0).max(1),
  model: z.enum(['gemini-pro', 'gpt-4', 'gpt-3.5-turbo']),
  max_tokens: z.number().min(100).max(2000)
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address')
})

export const kbUploadSchema = z.object({
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.string().min(1, 'File type is required'),
  file_size: z.number().max(10 * 1024 * 1024, 'File must be less than 10MB')
})
