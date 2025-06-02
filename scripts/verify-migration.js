const { PrismaClient } = require('@prisma/client')
const { promises: fs } = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function compareRecipe(slug) {
  console.log(`🔍 Comparing recipe: ${slug}`)
  console.log('='.repeat(50))
  
  try {
    // Load original JSON file
    const jsonFile = path.join(process.cwd(), 'data', 'recipes', `${slug}.json`)
    const jsonData = await fs.readFile(jsonFile, 'utf-8')
    const originalRecipe = JSON.parse(jsonData)
    
    // Query database
    const dbRecipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: true
      }
    })
    
    if (!dbRecipe) {
      console.log('❌ Recipe not found in database!')
      return
    }
    
    console.log('📄 ORIGINAL JSON:')
    console.log(`   Title: ${originalRecipe.title}`)
    console.log(`   Description: ${originalRecipe.description}`)
    console.log(`   Ingredients: ${originalRecipe.ingredients.length} items`)
    console.log(`   Instructions: ${originalRecipe.instructions.length} steps`)
    console.log(`   Tags: [${originalRecipe.tags.join(', ')}]`)
    console.log(`   Yield: ${originalRecipe.yield}`)
    console.log(`   Prep Time: ${originalRecipe.prepTime}`)
    console.log(`   Cook Time: ${originalRecipe.cookTime}`)
    console.log(`   Image: ${originalRecipe.image}`)
    
    console.log('')
    console.log('💾 DATABASE RECORD:')
    console.log(`   Title: ${dbRecipe.title}`)
    console.log(`   Description: ${dbRecipe.description}`)
    console.log(`   Ingredients: ${dbRecipe.ingredients.length} items`)
    console.log(`   Instructions: ${dbRecipe.instructions.length} steps`)
    console.log(`   Tags: [${dbRecipe.tags.join(', ')}]`)
    console.log(`   Yield: ${dbRecipe.yield}`)
    console.log(`   Prep Time: ${dbRecipe.prepTime}`)
    console.log(`   Cook Time: ${dbRecipe.cookTime}`)
    console.log(`   Image: ${dbRecipe.image}`)
    console.log(`   Visibility: ${dbRecipe.visibility}`)
    console.log(`   Author: ${dbRecipe.author.name} (${dbRecipe.author.email})`)
    console.log(`   Created: ${dbRecipe.createdAt}`)
    
    console.log('')
    console.log('🔍 DETAILED COMPARISON:')
    
    // Compare basic fields
    const matches = {
      title: originalRecipe.title === dbRecipe.title,
      description: originalRecipe.description === dbRecipe.description,
      yield: originalRecipe.yield === dbRecipe.yield,
      prepTime: originalRecipe.prepTime === dbRecipe.prepTime,
      cookTime: originalRecipe.cookTime === dbRecipe.cookTime,
      image: originalRecipe.image === dbRecipe.image,
      tagsLength: originalRecipe.tags.length === dbRecipe.tags.length,
      instructionsLength: originalRecipe.instructions.length === dbRecipe.instructions.length,
      ingredientsLength: originalRecipe.ingredients.length === dbRecipe.ingredients.length
    }
    
    Object.entries(matches).forEach(([field, isMatch]) => {
      console.log(`   ${field}: ${isMatch ? '✅' : '❌'}`)
    })
    
    // Compare ingredients in detail
    console.log('')
    console.log('🥘 INGREDIENTS COMPARISON:')
    
    // Clean original ingredients (remove _originalAmount)
    const cleanOriginalIngredients = originalRecipe.ingredients.map(({ _originalAmount, ...ingredient }) => ingredient)
    
    console.log('   Sample ingredient from JSON:')
    console.log(`   ${JSON.stringify(cleanOriginalIngredients[0], null, 4)}`)
    
    console.log('   Same ingredient from database:')
    console.log(`   ${JSON.stringify(dbRecipe.ingredients[0], null, 4)}`)
    
    // Deep compare first few ingredients
    const ingredientsMatch = JSON.stringify(cleanOriginalIngredients.slice(0, 3)) === JSON.stringify(dbRecipe.ingredients.slice(0, 3))
    console.log(`   First 3 ingredients match: ${ingredientsMatch ? '✅' : '❌'}`)
    
    // Compare instructions
    console.log('')
    console.log('📝 INSTRUCTIONS COMPARISON:')
    console.log('   Original first instruction:')
    console.log(`   "${originalRecipe.instructions[0]}"`)
    console.log('   Database first instruction:')
    console.log(`   "${dbRecipe.instructions[0]}"`)
    
    const instructionsMatch = originalRecipe.instructions[0] === dbRecipe.instructions[0]
    console.log(`   First instruction matches: ${instructionsMatch ? '✅' : '❌'}`)
    
    // Overall assessment
    const allBasicFieldsMatch = Object.values(matches).every(Boolean)
    console.log('')
    console.log(`🎯 OVERALL: ${allBasicFieldsMatch && ingredientsMatch && instructionsMatch ? '✅ PERFECT MATCH' : '⚠️  SOME DIFFERENCES FOUND'}`)
    
  } catch (error) {
    console.error('❌ Error comparing recipe:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run comparison
compareRecipe('slow-cooker-texas-pulled-pork').catch(console.error)
