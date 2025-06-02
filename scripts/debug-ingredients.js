const { PrismaClient } = require('@prisma/client')
const { promises: fs } = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function deepCompareIngredients() {
  console.log('🔍 Deep comparing ingredients structure...')
  
  try {
    // Load original
    const jsonFile = path.join(process.cwd(), 'data', 'recipes', 'slow-cooker-texas-pulled-pork.json')
    const jsonData = await fs.readFile(jsonFile, 'utf-8')
    const originalRecipe = JSON.parse(jsonData)
    
    // Get from database
    const dbRecipe = await prisma.recipe.findUnique({
      where: { slug: 'slow-cooker-texas-pulled-pork' }
    })
    
    console.log('Original ingredient keys:', Object.keys(originalRecipe.ingredients[0]))
    console.log('Database ingredient keys:', Object.keys(dbRecipe.ingredients[0]))
    
    console.log('')
    console.log('Original first ingredient (raw):')
    console.log(JSON.stringify(originalRecipe.ingredients[0], null, 2))
    
    console.log('')
    console.log('Database first ingredient (raw):')
    console.log(JSON.stringify(dbRecipe.ingredients[0], null, 2))
    
    // Clean and compare
    const cleanOriginal = originalRecipe.ingredients.map(({ _originalAmount, ...ingredient }) => ingredient)
    console.log('')
    console.log('Original first ingredient (cleaned):')
    console.log(JSON.stringify(cleanOriginal[0], null, 2))
    
    // Check if object properties match despite order
    const orig = cleanOriginal[0]
    const db = dbRecipe.ingredients[0]
    
    const keyMatches = {
      amount: orig.amount === db.amount,
      unit: orig.unit === db.unit,
      name: orig.name === db.name
    }
    
    console.log('')
    console.log('Property by property comparison:')
    Object.entries(keyMatches).forEach(([key, matches]) => {
      console.log(`   ${key}: ${matches ? '✅' : '❌'} (${orig[key]} vs ${db[key]})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deepCompareIngredients()
