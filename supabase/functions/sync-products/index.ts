import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hardcoded product data to sync to database
const HARDCODED_PRODUCTS = [
  {
    title: "DRKSHDW Rick Owens Vans",
    brand: "Rick Owens",
    category: "High-Top",
    price: 899,
    stock: 5,
    infinite_stock: false,
    limited: true,
    availability: "Limited Stock",
    description: "Avant-garde collaboration between Rick Owens and Vans",
    materials: "Canvas, Leather",
    care_instructions: "Spot clean only",
    shipping_time: "3-5 days",
    size_type: "US",
    images: [
      "/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 1.jpeg",
      "/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 2.jpeg",
      "/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 3.jpeg",
      "/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 4.jpeg"
    ]
  },
  {
    title: "Maison Margiela Gum Sole Sneakers",
    brand: "Maison Margiela",
    category: "Low-Top",
    price: 1299,
    stock: 3,
    infinite_stock: false,
    limited: true,
    availability: "Limited Stock",
    description: "Iconic GATs with signature gum sole",
    materials: "Leather, Rubber",
    care_instructions: "Professional cleaning recommended",
    shipping_time: "5-7 days",
    size_type: "EU",
    images: [
      "/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 1.png",
      "/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 2.png",
      "/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 3.png",
      "/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 4.png"
    ]
  },
  {
    title: "Rick Owens Geobaskets",
    brand: "Rick Owens",
    category: "High-Top",
    price: 1599,
    stock: 2,
    infinite_stock: false,
    limited: true,
    availability: "Very Limited",
    description: "Iconic avant-garde high-top sneakers",
    materials: "Leather, Canvas",
    care_instructions: "Leather conditioner recommended",
    shipping_time: "7-14 days",
    size_type: "EU",
    images: [
      "/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 1.png",
      "/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 2.png",
      "/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 3.png",
      "/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 4.png",
      "/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 5.png"
    ]
  },
  {
    title: "Travis Scott x Air Jordan 1 Low 'Reverse Mocha'",
    brand: "Nike",
    category: "Low-Top",
    price: 2299,
    stock: 1,
    infinite_stock: false,
    limited: true,
    availability: "Extremely Limited",
    description: "Collaboration between Travis Scott and Jordan Brand",
    materials: "Leather, Suede",
    care_instructions: "Suede brush for maintenance",
    shipping_time: "5-9 days",
    size_type: "US",
    images: [
      "/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 1.png",
      "/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 2.png",
      "/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 3.png",
      "/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 4.png",
      "/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 5.png",
      "/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 6.png",
      "/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 7.png"
    ]
  }
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('title')
      .limit(1)

    if (existingProducts && existingProducts.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Products already synced', count: existingProducts.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert products
    const { data, error } = await supabase
      .from('products')
      .insert(HARDCODED_PRODUCTS)
      .select()

    if (error) throw error

    // Add product media for each product
    for (const product of data) {
      const originalProduct = HARDCODED_PRODUCTS.find(p => p.title === product.title)
      if (originalProduct?.images) {
        const mediaEntries = originalProduct.images.map((url, index) => ({
          product_id: product.id,
          url,
          role: index === 0 ? 'primary' : 'gallery'
        }))

        await supabase
          .from('product_media')
          .insert(mediaEntries)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Products synced successfully', 
        count: data.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Product sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})