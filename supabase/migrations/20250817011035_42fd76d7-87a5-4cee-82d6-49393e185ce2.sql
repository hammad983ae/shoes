-- Insert product media for the products
INSERT INTO public.product_media (product_id, url, role) VALUES
-- Rick Owens DRKSHDW images
('11111111-1111-1111-1111-111111111111', '/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 1.jpeg', 'primary'),
('11111111-1111-1111-1111-111111111111', '/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 2.jpeg', 'gallery'),
('11111111-1111-1111-1111-111111111111', '/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 3.jpeg', 'gallery'),
('11111111-1111-1111-1111-111111111111', '/src/assets/Product Images/DRKSHDW Rick Owens Vans/DRKSHDW Rick Owens Vans Product IMG 4.jpeg', 'gallery'),

-- Maison Margiela images
('22222222-2222-2222-2222-222222222222', '/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 1.png', 'primary'),
('22222222-2222-2222-2222-222222222222', '/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 2.png', 'gallery'),
('22222222-2222-2222-2222-222222222222', '/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 3.png', 'gallery'),
('22222222-2222-2222-2222-222222222222', '/src/assets/Product Images/Mason Margiela Gum Sole Sneakers/Maison Margiela Gum Sole Product IMG 4.png', 'gallery'),

-- Rick Owens Geobaskets images
('33333333-3333-3333-3333-333333333333', '/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 1.png', 'primary'),
('33333333-3333-3333-3333-333333333333', '/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 2.png', 'gallery'),
('33333333-3333-3333-3333-333333333333', '/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 3.png', 'gallery'),
('33333333-3333-3333-3333-333333333333', '/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 4.png', 'gallery'),
('33333333-3333-3333-3333-333333333333', '/src/assets/Product Images/Rick Owens Geobaskets/Rick Owens Geobaskets Product IMG 5.png', 'gallery'),

-- Travis Scott images  
('44444444-4444-4444-4444-444444444444', '/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 1.png', 'primary'),
('44444444-4444-4444-4444-444444444444', '/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 2.png', 'gallery'),
('44444444-4444-4444-4444-444444444444', '/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 3.png', 'gallery'),
('44444444-4444-4444-4444-444444444444', '/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 4.png', 'gallery'),
('44444444-4444-4444-4444-444444444444', '/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 5.png', 'gallery'),
('44444444-4444-4444-4444-444444444444', '/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 6.png', 'gallery'),
('44444444-4444-4444-4444-444444444444', '/src/assets/Product Images/Travis Reverse Mocha Lows/Travis Reverse Mocha Lows Product IMG 7.png', 'gallery')
ON CONFLICT DO NOTHING;