#!/usr/bin/env node
"use strict";
/**
 * Migration script to move data from JSON files to PostgreSQL database
 * Run with: npx ts-node scripts/migrate-data.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = main;
const client_1 = require("@prisma/client");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
async function migrateUsers() {
    console.log('🔄 Migrating users from JSON to database...');
    try {
        const usersFile = path_1.default.join(process.cwd(), 'data', 'users.json');
        const usersData = await fs_1.promises.readFile(usersFile, 'utf-8');
        const jsonUsers = JSON.parse(usersData);
        console.log(`Found ${jsonUsers.length} users to migrate`);
        for (const jsonUser of jsonUsers) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: jsonUser.email }
            });
            if (existingUser) {
                console.log(`⚠️  User ${jsonUser.email} already exists, skipping`);
                continue;
            }
            // Create user in database
            const createdUser = await prisma.user.create({
                data: {
                    id: jsonUser.id, // Keep the original ID for consistency
                    email: jsonUser.email,
                    name: jsonUser.name,
                    password: jsonUser.password, // Already hashed
                    role: jsonUser.role,
                    createdAt: new Date(jsonUser.createdAt),
                    updatedAt: new Date(jsonUser.createdAt)
                }
            });
            console.log(`✅ Migrated user: ${createdUser.email}`);
        }
        console.log('✅ User migration completed');
        return jsonUsers;
    }
    catch (error) {
        console.error('❌ Error migrating users:', error);
        throw error;
    }
}
async function migrateRecipes(users) {
    console.log('🔄 Migrating recipes from JSON to database...');
    try {
        const recipesDir = path_1.default.join(process.cwd(), 'data', 'recipes');
        const recipeFiles = await fs_1.promises.readdir(recipesDir);
        const jsonFiles = recipeFiles.filter(file => file.endsWith('.json'));
        console.log(`Found ${jsonFiles.length} recipes to migrate`);
        // Default to first user as the author for existing recipes
        // In a real scenario, you'd have some logic to determine ownership
        const defaultAuthor = users[0];
        if (!defaultAuthor) {
            throw new Error('No users found to assign recipes to');
        }
        console.log(`📝 Assigning all recipes to user: ${defaultAuthor.email}`);
        for (const filename of jsonFiles) {
            const filePath = path_1.default.join(recipesDir, filename);
            const recipeData = await fs_1.promises.readFile(filePath, 'utf-8');
            const jsonRecipe = JSON.parse(recipeData);
            // Check if recipe already exists
            const existingRecipe = await prisma.recipe.findUnique({
                where: { slug: jsonRecipe.slug }
            });
            if (existingRecipe) {
                console.log(`⚠️  Recipe ${jsonRecipe.slug} already exists, skipping`);
                continue;
            }
            // Clean up ingredients data - remove _originalAmount field for storage
            const cleanIngredients = jsonRecipe.ingredients.map(({ _originalAmount, ...ingredient }) => ingredient);
            // Create recipe in database
            const createdRecipe = await prisma.recipe.create({
                data: {
                    slug: jsonRecipe.slug,
                    title: jsonRecipe.title,
                    description: jsonRecipe.description,
                    ingredients: cleanIngredients, // Store as JSON
                    instructions: jsonRecipe.instructions,
                    tags: jsonRecipe.tags,
                    yield: jsonRecipe.yield || null,
                    prepTime: jsonRecipe.prepTime || null,
                    cookTime: jsonRecipe.cookTime || null,
                    image: jsonRecipe.image || null,
                    visibility: 'public', // Default all existing recipes to public
                    authorId: defaultAuthor.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            console.log(`✅ Migrated recipe: ${createdRecipe.title}`);
        }
        console.log('✅ Recipe migration completed');
    }
    catch (error) {
        console.error('❌ Error migrating recipes:', error);
        throw error;
    }
}
async function verifyMigration() {
    console.log('🔍 Verifying migration...');
    try {
        const userCount = await prisma.user.count();
        const recipeCount = await prisma.recipe.count();
        console.log(`📊 Migration Summary:`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Recipes: ${recipeCount}`);
        // Sample some data to verify structure
        const sampleUser = await prisma.user.findFirst({
            include: {
                recipes: {
                    take: 1
                }
            }
        });
        if (sampleUser) {
            console.log(`🔍 Sample user: ${sampleUser.email} with ${sampleUser.recipes.length > 0 ? 'recipes' : 'no recipes'}`);
        }
        const sampleRecipe = await prisma.recipe.findFirst({
            include: {
                author: true
            }
        });
        if (sampleRecipe) {
            console.log(`🔍 Sample recipe: "${sampleRecipe.title}" by ${sampleRecipe.author.name}`);
            console.log(`   Ingredients: ${Array.isArray(sampleRecipe.ingredients) ? 'Array (JSON)' : 'Invalid'}`);
            console.log(`   Instructions: ${sampleRecipe.instructions.length} steps`);
        }
    }
    catch (error) {
        console.error('❌ Error verifying migration:', error);
        throw error;
    }
}
async function main() {
    console.log('🚀 Starting data migration from JSON to PostgreSQL');
    console.log('================================================');
    try {
        // Run migrations
        const users = await migrateUsers();
        await migrateRecipes(users);
        await verifyMigration();
        console.log('');
        console.log('🎉 Migration completed successfully!');
        console.log('⚠️  Note: Original JSON files are preserved for backup');
        console.log('💡 You can now update your application to use the database');
    }
    catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
