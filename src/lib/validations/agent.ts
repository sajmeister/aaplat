import { z } from 'zod';

export const agentRuntimeSchema = z.enum(['python', 'nodejs', 'rust']);

export const agentCategorySchema = z.enum([
  'automation',
  'data-processing',
  'ai-ml',
  'web-scraping',
  'api-integration',
  'monitoring',
  'utilities',
  'other',
]);

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  category: agentCategorySchema,
  runtime: agentRuntimeSchema,
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  dockerImage: z.string().url().optional(),
  sourceCodeUrl: z.string().url().optional(),
  configSchema: z.string().optional(), // JSON string
  isPublic: z.boolean().default(false),
});

export const updateAgentSchema = createAgentSchema.partial();

export const agentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  category: agentCategorySchema.optional(),
  runtime: agentRuntimeSchema.optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentQueryInput = z.infer<typeof agentQuerySchema>; 