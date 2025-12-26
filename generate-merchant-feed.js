/*
 Script: generate-merchant-feed.js
 Purpose: Connect to Supabase and generate Google Merchant Center JSON feed.
 Requirements satisfied:
 - Uses @supabase/supabase-js
 - Connects with provided Supabase URL
 - Auth via SUPABASE_SERVICE_KEY environment variable
 - Fetches all rows from products table
 - Maps fields as specified
 - Handles availability based on stock presence/value
 - Adds static fields condition and shipping
 - Saves feed to /public_html/merchant-products.json (project root/public_html)
 - Logs progress and errors clearly
*/

// Import dependencies
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuration
const SUPABASE_URL = 'https://evmiakneqtoxvnzeiwlz.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('[ERROR] SUPABASE_SERVICE_KEY environment variable is not set.')
  process.exit(1)
}

console.log('[INFO] Initializing Supabase client...')
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// Resolve output path
const OUTPUT_DIR = path.resolve(process.cwd(), 'public_html')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'merchant-products.json')

async function fetchProducts() {
  console.log('[INFO] Fetching products from Supabase...')
  const { data, error } = await supabase.from('products').select('*')

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  if (!Array.isArray(data)) {
    console.warn('[WARN] Response from Supabase is not an array. Coercing to empty list.')
    return []
  }

  console.log(`[INFO] Retrieved ${data.length} products.`)
  return data
}

function mapToMerchantItem(product) {
  const {
    id,
    name,
    description,
    price,
    image,
    category,
    brand,
    stock,
  } = product

  // Determine availability
  let availability = 'in stock'
  if (Object.prototype.hasOwnProperty.call(product, 'stock')) {
    try {
      const s = typeof stock === 'number' ? stock : parseFloat(stock)
      availability = !isNaN(s) && s <= 0 ? 'out of stock' : 'in stock'
    } catch {
      availability = 'in stock'
    }
  } else {
    // If stock column does not exist
    availability = 'in stock'
  }

  // Construct image link and product link
  const image_link = image
    ? `https://sharkimtraders.co.ke/images/${String(image).replace(/^\/+/, '')}`
    : ''
  const link = `https://sharkimtraders.co.ke/product.html?id=${encodeURIComponent(id)}`

  // Price with currency suffix
  const priceFormatted = price != null ? `${price} KES` : ''

  // Build merchant item
  return {
    id: id != null ? String(id) : '',
    title: name != null ? String(name) : '',
    description: description != null ? String(description) : '',
    link,
    image_link,
    price: priceFormatted,
    google_product_category: category != null ? String(category) : '',
    brand: brand != null ? String(brand) : '',
    availability,
    condition: 'new',
    shipping: [
      { country: 'KE', price: '0.00 KES' },
    ],
  }
}

async function writeFeed(items) {
  console.log('[INFO] Ensuring output directory exists:', OUTPUT_DIR)
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true })

  const payload = {
    updated_at: new Date().toISOString(),
    items,
  }

  const json = JSON.stringify(payload, null, 2)

  console.log('[INFO] Writing feed to', OUTPUT_FILE)
  await fs.promises.writeFile(OUTPUT_FILE, json, 'utf8')

  console.log('[SUCCESS] Feed written:', OUTPUT_FILE)
}

async function main() {
  console.time('[TIMER] Total time')
  try {
    const products = await fetchProducts()

    console.log('[INFO] Mapping products to Merchant Center items...')
    const items = products.map(mapToMerchantItem)

    await writeFeed(items)

    console.log('[INFO] Feed generation complete. Verify it is accessible at:')
    console.log('       https://sharkimtraders.co.ke/merchant-products.json')
  } catch (err) {
    console.error('[ERROR] Feed generation failed:', err?.message || err)
    process.exitCode = 1
  } finally {
    console.timeEnd('[TIMER] Total time')
  }
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
