-- AlterEnum: add roadmap modules for MLOps, Architect, Design Patterns, and Claude cert
ALTER TYPE "Module" ADD VALUE IF NOT EXISTS 'mlops';
ALTER TYPE "Module" ADD VALUE IF NOT EXISTS 'architect';
ALTER TYPE "Module" ADD VALUE IF NOT EXISTS 'patterns';
ALTER TYPE "Module" ADD VALUE IF NOT EXISTS 'claude';
