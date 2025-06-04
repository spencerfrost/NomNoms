import { User as PrismaUser } from '@prisma/client';

// Use Prisma User type directly - it has name as nullable which matches the schema
export type User = PrismaUser;
