import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Agents table
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  runtime: text('runtime').notNull(), // 'python', 'nodejs', 'rust'
  version: text('version').notNull().default('1.0.0'),
  userId: text('user_id').references(() => users.id).notNull(),
  dockerImage: text('docker_image'),
  sourceCodeUrl: text('source_code_url'),
  configSchema: text('config_schema'), // JSON schema for agent configuration
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  downloads: integer('downloads').default(0),
  rating: real('rating').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Deployments table
export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  agentId: text('agent_id').references(() => agents.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'deploying', 'running', 'stopped', 'failed'
  railwayServiceId: text('railway_service_id'),
  url: text('url'),
  environment: text('environment'), // JSON string of environment variables
  config: text('config'), // JSON string of agent configuration
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Deployment logs table
export const deploymentLogs = sqliteTable('deployment_logs', {
  id: text('id').primaryKey(),
  deploymentId: text('deployment_id').references(() => deployments.id).notNull(),
  level: text('level').notNull(), // 'info', 'warning', 'error'
  message: text('message').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Agent reviews table (for marketplace)
export const agentReviews = sqliteTable('agent_reviews', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Deployment = typeof deployments.$inferSelect;
export type NewDeployment = typeof deployments.$inferInsert;
export type DeploymentLog = typeof deploymentLogs.$inferSelect;
export type NewDeploymentLog = typeof deploymentLogs.$inferInsert;
export type AgentReview = typeof agentReviews.$inferSelect;
export type NewAgentReview = typeof agentReviews.$inferInsert; 