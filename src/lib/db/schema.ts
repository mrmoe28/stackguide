import { pgTable, text, timestamp, uuid, jsonb, primaryKey, integer, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { AdapterAccount } from 'next-auth/adapters'

// Users table - Extended for NextAuth
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// NextAuth Sessions table
export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

// NextAuth Accounts table (for OAuth providers)
export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

// NextAuth Verification Tokens table
export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Recommendations table
export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Knowledge base table
export const knowledge = pgTable('knowledge', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceUrl: text('source_url').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull(),
  category: text('category'),
  language: text('language'),
  features: jsonb('features').$type<string[]>(),
  rawContent: text('raw_content'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Chats table
export const chats = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  message: text('message').notNull(),
  response: text('response').notNull(),
  recommendations: jsonb('recommendations').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Shared recommendations table - for public sharing
export const sharedRecommendations = pgTable('shared_recommendations', {
  id: text('id').primaryKey(), // Custom short ID for clean URLs
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  projectTitle: text('project_title').notNull(),
  projectDescription: text('project_description'),
  recommendations: jsonb('recommendations').notNull(),
  claudePrompt: text('claude_prompt'),
  metadata: jsonb('metadata'),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiration
})

// Subscription Plans table
export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  squarePlanId: text('square_plan_id').unique(), // Square Catalog subscription plan ID
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Price in cents
  interval: text('interval').notNull(), // 'month', 'year', etc.
  features: jsonb('features').$type<string[]>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  trialDays: integer('trial_days').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User Subscriptions table
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  planId: uuid('plan_id')
    .references(() => subscriptionPlans.id, { onDelete: 'restrict' })
    .notNull(),
  squareSubscriptionId: text('square_subscription_id').unique(), // Square subscription ID
  squareCustomerId: text('square_customer_id'), // Square customer ID
  status: text('status').notNull(), // 'active', 'canceled', 'past_due', 'trialing', etc.
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  canceledAt: timestamp('canceled_at'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Subscription Events table - for audit trail
export const subscriptionEvents = pgTable('subscription_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id')
    .references(() => userSubscriptions.id, { onDelete: 'cascade' })
    .notNull(),
  eventType: text('event_type').notNull(), // 'created', 'updated', 'canceled', 'renewed', etc.
  squareEventId: text('square_event_id'), // Square webhook event ID
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  chats: many(chats),
  subscriptions: many(userSubscriptions),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  recommendations: many(recommendations),
  chats: many(chats),
}))

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  project: one(projects, {
    fields: [recommendations.projectId],
    references: [projects.id],
  }),
}))

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [chats.projectId],
    references: [projects.id],
  }),
}))

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}))

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  events: many(subscriptionEvents),
}))

export const subscriptionEventsRelations = relations(subscriptionEvents, ({ one }) => ({
  subscription: one(userSubscriptions, {
    fields: [subscriptionEvents.subscriptionId],
    references: [userSubscriptions.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type Recommendation = typeof recommendations.$inferSelect
export type NewRecommendation = typeof recommendations.$inferInsert

export type Knowledge = typeof knowledge.$inferSelect
export type NewKnowledge = typeof knowledge.$inferInsert

export type Chat = typeof chats.$inferSelect
export type NewChat = typeof chats.$inferInsert

export type SharedRecommendation = typeof sharedRecommendations.$inferSelect
export type NewSharedRecommendation = typeof sharedRecommendations.$inferInsert

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert

export type UserSubscription = typeof userSubscriptions.$inferSelect
export type NewUserSubscription = typeof userSubscriptions.$inferInsert

export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect
export type NewSubscriptionEvent = typeof subscriptionEvents.$inferInsert
