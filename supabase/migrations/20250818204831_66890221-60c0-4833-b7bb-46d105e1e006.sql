-- Add sample slashed prices to existing products for demonstration
UPDATE products 
SET slashed_price = CASE 
  WHEN title = 'DRKSHDW Rick Owens Vans' THEN 350.00
  WHEN title = 'Maison Margiela Gum Sole Sneakers' THEN 285.00
  WHEN title = 'Rick Owens Geobaskets' THEN 420.00
  WHEN title = 'Travis Scott x Jordan 1 Low OG "Reverse Mocha"' THEN 299.00
  ELSE slashed_price
END;