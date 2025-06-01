#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const OLD_RECIPES_DIR = path.join(__dirname, 'old_recipes', 'Recipes');
const DATA_DIR = path.join(__dirname, 'data', 'recipes');
const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'recipes');
const OLD_IMAGES_DIR = path.join(OLD_RECIPES_DIR, 'Images');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper function to clean text
function cleanText(text) {
  return text?.replace(/\s+/g, ' ').trim() || '';
}

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to parse ingredient text
function parseIngredient(ingredientText) {
  const cleaned = cleanText(ingredientText);
  
  // Extract amount and unit using regex
  const match = cleaned.match(/^(<strong>)?([^<]*?)(<\/strong>)?\s*(.*)/);
  if (!match) {
    return { amount: 0, unit: '', name: cleaned };
  }

  const amountPart = match[2]?.trim() || '';
  const namePart = match[4]?.replace(/<[^>]*>/g, '').trim() || '';

  // Parse amount (handle fractions)
  let amount = 0;
  if (amountPart) {
    // Handle fractions like "2 ⅓"
    const fractionMatch = amountPart.match(/(\d+)?\s*([¼½¾⅓⅔⅛⅜⅝⅞])?/);
    if (fractionMatch) {
      const whole = parseInt(fractionMatch[1]) || 0;
      const fraction = fractionMatch[2];
      let fractionalValue = 0;
      
      switch (fraction) {
        case '¼': fractionalValue = 0.25; break;
        case '½': fractionalValue = 0.5; break;
        case '¾': fractionalValue = 0.75; break;
        case '⅓': fractionalValue = 0.33; break;
        case '⅔': fractionalValue = 0.67; break;
        case '⅛': fractionalValue = 0.125; break;
        case '⅜': fractionalValue = 0.375; break;
        case '⅝': fractionalValue = 0.625; break;
        case '⅞': fractionalValue = 0.875; break;
      }
      
      amount = whole + fractionalValue;
    } else {
      amount = parseFloat(amountPart) || 0;
    }
  }

  // Extract unit and name
  const words = namePart.split(' ');
  const units = ['cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 'teaspoon', 'teaspoons', 'tsp', 
                'pound', 'pounds', 'lb', 'lbs', 'ounce', 'ounces', 'oz', 'gram', 'grams', 'g',
                'inch', 'inches', 'clove', 'cloves', 'can', 'cans', 'package', 'packages',
                'slice', 'slices', 'piece', 'pieces', 'whole', 'large', 'medium', 'small'];
  
  let unit = '';
  let name = namePart;
  
  if (words.length > 0) {
    const firstWord = words[0].toLowerCase();
    if (units.includes(firstWord)) {
      unit = words[0];
      name = words.slice(1).join(' ');
    }
  }

  return {
    amount,
    unit: unit || '',
    name: name || namePart
  };
}

// Helper function to copy and rename image
function processImage(imagePath, recipeName) {
  if (!imagePath || !fs.existsSync(path.join(OLD_RECIPES_DIR, imagePath))) {
    return null;
  }

  const slug = generateSlug(recipeName);
  const ext = path.extname(imagePath);
  const newImageName = `${slug}${ext}`;
  const oldImagePath = path.join(OLD_RECIPES_DIR, imagePath);
  const newImagePath = path.join(IMAGES_DIR, newImageName);

  try {
    fs.copyFileSync(oldImagePath, newImagePath);
    return `/images/recipes/${newImageName}`;
  } catch (error) {
    console.warn(`Failed to copy image for ${recipeName}:`, error.message);
    return null;
  }
}

// Helper function to extract categories/tags from text
function extractTags(title, content) {
  const tags = [];
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Common recipe tags based on title patterns
  const tagPatterns = {
    'chicken': /chicken/i,
    'beef': /beef/i,
    'pork': /pork/i,
    'vegetarian': /vegetarian/i,
    'dessert': /(cake|cookie|brownie|pie|dessert|sweet)/i,
    'soup': /soup/i,
    'salad': /salad/i,
    'bread': /bread/i,
    'pasta': /(pasta|spaghetti|noodle)/i,
    'rice': /rice/i,
    'slow-cooker': /(slow cooker|crock pot)/i,
    'instant-pot': /instant pot/i,
    'air-fryer': /air fryer/i,
    'baked': /baked/i,
    'grilled': /grilled/i,
    'rhubarb': /rhubarb/i,
    'banana': /banana/i,
    'chocolate': /chocolate/i,
    'quick': /(quick|easy|fast)/i,
    'healthy': /healthy/i
  };

  for (const [tag, pattern] of Object.entries(tagPatterns)) {
    if (pattern.test(titleLower) || pattern.test(contentLower)) {
      tags.push(tag);
    }
  }

  return tags;
}

// Main conversion function
async function convertRecipe(htmlFile) {
  const htmlPath = path.join(OLD_RECIPES_DIR, htmlFile);
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  
  const dom = new JSDOM(htmlContent);
  const doc = dom.window.document;

  try {
    // Extract recipe data
    const nameEl = doc.querySelector('h1[itemprop="name"]');
    const title = cleanText(nameEl?.textContent) || path.basename(htmlFile, '.html');
    
    const slug = generateSlug(title);
    
    // Extract image
    const imgEl = doc.querySelector('img.photo');
    const imageSrc = imgEl?.getAttribute('src');
    const image = processImage(imageSrc, title);
    
    // Extract metadata
    const prepTimeEl = doc.querySelector('[itemprop="prepTime"]');
    const cookTimeEl = doc.querySelector('[itemprop="cookTime"]');
    const servingsEl = doc.querySelector('[itemprop="recipeYield"]');
    
    const prepTime = cleanText(prepTimeEl?.textContent);
    const cookTime = cleanText(cookTimeEl?.textContent);
    const yield_ = cleanText(servingsEl?.textContent).replace(/^Servings:\s*/i, '') || '4 servings';
    
    // Extract ingredients
    const ingredientEls = doc.querySelectorAll('[itemprop="recipeIngredient"]');
    const ingredients = Array.from(ingredientEls).map(el => {
      const ingredientText = el.innerHTML;
      return parseIngredient(ingredientText);
    }).filter(ing => ing.name); // Filter out empty ingredients
    
    // Extract instructions
    const instructionsEl = doc.querySelector('[itemprop="recipeInstructions"]');
    const instructionLines = instructionsEl?.querySelectorAll('p.line') || [];
    const instructions = Array.from(instructionLines).map(el => 
      cleanText(el.textContent)
    ).filter(inst => inst); // Filter out empty instructions
    
    // Extract description (if available)
    const descriptionEl = doc.querySelector('.description');
    let description = cleanText(descriptionEl?.textContent) || '';
    
    // If no description, create one from the title
    if (!description) {
      description = `Delicious ${title.toLowerCase()} recipe`;
    }
    
    // Generate tags
    const tags = extractTags(title, htmlContent);
    
    // Create recipe object
    const recipe = {
      slug,
      title,
      description,
      ingredients,
      instructions,
      tags,
      yield: yield_,
      ...(image && { image }),
      ...(prepTime && { prepTime }),
      ...(cookTime && { cookTime })
    };
    
    // Save JSON file
    const jsonPath = path.join(DATA_DIR, `${slug}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(recipe, null, 2));
    
    console.log(`✅ Converted: ${title} -> ${slug}.json`);
    return recipe;
    
  } catch (error) {
    console.error(`❌ Failed to convert ${htmlFile}:`, error.message);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🍳 Starting recipe conversion...\n');
  console.log('OLD_RECIPES_DIR:', OLD_RECIPES_DIR);
  console.log('DATA_DIR:', DATA_DIR);
  console.log('IMAGES_DIR:', IMAGES_DIR);
  
  // Check if directories exist
  if (!fs.existsSync(OLD_RECIPES_DIR)) {
    console.error('❌ Old recipes directory does not exist:', OLD_RECIPES_DIR);
    return;
  }
  
  // Get all HTML files
  const htmlFiles = fs.readdirSync(OLD_RECIPES_DIR)
    .filter(file => file.endsWith('.html'));
  
  console.log('HTML files found:', htmlFiles.slice(0, 5)); // Show first 5
  
  console.log(`Found ${htmlFiles.length} recipe files to convert.\n`);
  
  const converted = [];
  const failed = [];
  
  for (const htmlFile of htmlFiles) {
    const result = await convertRecipe(htmlFile);
    if (result) {
      converted.push(result);
    } else {
      failed.push(htmlFile);
    }
  }
  
  console.log(`\n📊 Conversion Summary:`);
  console.log(`✅ Successfully converted: ${converted.length} recipes`);
  console.log(`❌ Failed: ${failed.length} recipes`);
  
  if (failed.length > 0) {
    console.log(`\nFailed files:`);
    failed.forEach(file => console.log(`  - ${file}`));
  }
  
  console.log(`\n🎉 All recipes have been converted!`);
  console.log(`📁 JSON files saved to: ${DATA_DIR}`);
  console.log(`🖼️  Images saved to: ${IMAGES_DIR}`);
}

main().catch(console.error);
