import { Recipe as PrismaRecipe, User as PrismaUser } from '@prisma/client'

export interface Ingredient {
  amount: number; // Always store as decimal number for easy scaling
  unit: string;
  name: string;
}

// Use Prisma types as the base, but add the author relation type
export type Recipe = PrismaRecipe & {
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export type User = PrismaUser