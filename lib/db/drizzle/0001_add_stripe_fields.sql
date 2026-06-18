-- Migration: add Stripe subscription columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" varchar(64) UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" varchar(64) UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_provider" varchar(16);
