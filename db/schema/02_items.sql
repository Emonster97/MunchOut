-- Drop and recreate Items table (Example)

DROP TABLE IF EXISTS Items CASCADE;
CREATE TABLE Items (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  thumbnail_url VARCHAR(255),
);
