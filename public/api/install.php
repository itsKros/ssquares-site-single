<?php
/*
 * ONE-TIME SETUP — run once, then DELETE this file.
 * Visit: http://localhost/ssquares-site/public/api/install.php
 */
require __DIR__ . '/config.php';
$pdo = db();

$pdo->exec("
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  username      VARCHAR(80)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(120) NOT NULL,
  type       ENUM('portfolio','blog') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cat_type (slug, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  slug       VARCHAR(120) NOT NULL,
  type       ENUM('portfolio','blog') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tag_type (slug, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  slug         VARCHAR(220) NOT NULL UNIQUE,
  description  TEXT,
  cover_image  VARCHAR(255),
  images       JSON,
  live_url     VARCHAR(255),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  slug        VARCHAR(220) NOT NULL UNIQUE,
  excerpt     TEXT,
  content     LONGTEXT,
  cover_image VARCHAR(255),
  status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_categories (
  blog_post_id INT NOT NULL,
  category_id  INT NOT NULL,
  PRIMARY KEY (blog_post_id, category_id),
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_tags (
  blog_post_id INT NOT NULL,
  tag_id       INT NOT NULL,
  PRIMARY KEY (blog_post_id, tag_id),
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)       REFERENCES tags(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_categories (
  portfolio_id INT NOT NULL,
  category_id  INT NOT NULL,
  PRIMARY KEY (portfolio_id, category_id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolio(id)  ON DELETE CASCADE,
  FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio_tags (
  portfolio_id INT NOT NULL,
  tag_id       INT NOT NULL,
  PRIMARY KEY (portfolio_id, tag_id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolio(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)       REFERENCES tags(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

$hash = password_hash('Admin@123', PASSWORD_BCRYPT);
$pdo->prepare("
  INSERT IGNORE INTO users (name, email, username, password_hash, role)
  VALUES ('Ssquares Admin', 'admin@ssquares.co.in', 'ssquares', ?, 'admin')
")->execute([$hash]);

echo '<pre>';
echo "✅ All tables created.\n";
echo "✅ Admin user seeded.\n\n";
echo "Login  username : ssquares\n";
echo "       password : Admin@123\n\n";
echo "⚠️  DELETE this file: public/api/install.php\n";
echo '</pre>';
