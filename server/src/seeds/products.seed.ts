import { DataSource } from 'typeorm';

export async function seedProducts(dataSource: DataSource) {
  const productsRepository = dataSource.getRepository('products');

  const products = [
    {
      name: 'Velvet Silk Moisturizer',
      description:
        'A rich yet lightweight moisturizer that leaves a silky feel, enriched with Hyaluronic Acid and Vitamin E',
      category_id: 1111, // daily_routine
      price: 159.9,
      target_audience: 4, // adults
      skin_type: 2222, // dry
      product_type: 33, // moisturizer
      how_to_use:
        'Apply to clean skin morning and night using gentle circular motions',
      is_available: true,
      rating: 5,
      discount_percentage: 0,
      creating_date: new Date(),
    },
    {
      name: 'Anti-Aging Vitamin C Serum',
      description:
        'Potent serum to reduce wrinkles and spots. Contains 20% pure Vitamin C and peptides',
      category_id: 1113, // pro_againg
      price: 249.5,
      target_audience: 1, // women
      skin_type: 2224, // combination
      product_type: 32, // serum
      how_to_use:
        'Apply 3-4 drops to the face after cleansing and massage until fully absorbed',
      is_available: true,
      rating: 4,
      discount_percentage: 10,
      creating_date: new Date(),
    },
    {
      name: 'Daily Defense Sunscreen SPF 50',
      description:
        'Broad-spectrum, water-resistant sunscreen that leaves no white residue. Perfect for daily use',
      category_id: 1114, // sun_protection
      price: 85.0,
      target_audience: 6, // all
      skin_type: 2221, // normal
      product_type: 37, // sunscreen
      how_to_use:
        'Apply generously 15 minutes before sun exposure and reapply every two hours',
      is_available: true,
      rating: 5,
      discount_percentage: 0,
      creating_date: new Date(),
    },
    {
      name: 'Balancing Facial Toner for Oily Skin',
      description:
        'Alcohol-free toner that helps minimize pores and reduce excess oil',
      category_id: 1111, // daily_routine
      price: 65.9,
      target_audience: 3, // teenagers
      skin_type: 2223, // oily
      product_type: 31, // toner
      how_to_use: 'Soak a cotton pad and gently wipe the face after cleansing',
      is_available: true,
      rating: 3,
      discount_percentage: 0,
      creating_date: new Date(),
    },
    {
      name: 'Restorative Night Cream',
      description:
        'A thick cream for repairing the skin during sleep. Enriched with ceramides and natural oils',
      category_id: 1113, // pro_againg
      price: 189.9,
      target_audience: 4, // adults
      skin_type: 2222, // dry
      product_type: 35, // night_cream
      how_to_use: 'Apply a generous layer to clean, dry skin before bed',
      is_available: true,
      rating: 4,
      discount_percentage: 15,
      creating_date: new Date(),
    },
  ];

  await productsRepository.save(products);
  console.log(`Seeded ${products.length} products`);
}
