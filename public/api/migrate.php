<?php
/*
 * MIGRATION — run once, then DELETE this file.
 * Visit: http://localhost/ssquares-site/public/api/migrate.php
 *
 * What it does:
 *  1. Removes category_id + tags (JSON) columns from portfolio & blog_posts
 *  2. Creates tags table
 *  3. Creates 4 pivot tables (blog_categories, blog_tags, portfolio_categories, portfolio_tags)
 */
require __DIR__ . '/config.php';
$pdo = db();
$log = [];

function col_exists(PDO $pdo, string $table, string $col): bool {
    $s = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?"
    );
    $s->execute([$table, $col]);
    return (bool)$s->fetchColumn();
}

function fk_exists(PDO $pdo, string $table, string $fk): bool {
    $s = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.table_constraints
         WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = ?
         AND constraint_type = 'FOREIGN KEY'"
    );
    $s->execute([$table, $fk]);
    return (bool)$s->fetchColumn();
}

// --- portfolio: drop category_id & tags ---
if (fk_exists($pdo, 'portfolio', 'portfolio_ibfk_1')) {
    $pdo->exec("ALTER TABLE portfolio DROP FOREIGN KEY portfolio_ibfk_1");
    $log[] = "Dropped FK portfolio_ibfk_1";
}
if (col_exists($pdo, 'portfolio', 'category_id')) {
    $pdo->exec("ALTER TABLE portfolio DROP COLUMN category_id");
    $log[] = "Dropped portfolio.category_id";
}
if (col_exists($pdo, 'portfolio', 'tags')) {
    $pdo->exec("ALTER TABLE portfolio DROP COLUMN tags");
    $log[] = "Dropped portfolio.tags (JSON)";
}

// --- blog_posts: drop category_id & tags ---
if (fk_exists($pdo, 'blog_posts', 'blog_posts_ibfk_1')) {
    $pdo->exec("ALTER TABLE blog_posts DROP FOREIGN KEY blog_posts_ibfk_1");
    $log[] = "Dropped FK blog_posts_ibfk_1";
}
if (col_exists($pdo, 'blog_posts', 'category_id')) {
    $pdo->exec("ALTER TABLE blog_posts DROP COLUMN category_id");
    $log[] = "Dropped blog_posts.category_id";
}
if (col_exists($pdo, 'blog_posts', 'tags')) {
    $pdo->exec("ALTER TABLE blog_posts DROP COLUMN tags");
    $log[] = "Dropped blog_posts.tags (JSON)";
}

// --- tags table ---
$pdo->exec("
CREATE TABLE IF NOT EXISTS tags (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  type ENUM('portfolio','blog') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tag_type (slug, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
$log[] = "Created/verified: tags";

// --- pivot tables ---
$pdo->exec("
CREATE TABLE IF NOT EXISTS blog_categories (
  blog_post_id INT NOT NULL,
  category_id  INT NOT NULL,
  PRIMARY KEY (blog_post_id, category_id),
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
$log[] = "Created/verified: blog_categories";

$pdo->exec("
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_post_id INT NOT NULL,
  tag_id       INT NOT NULL,
  PRIMARY KEY (blog_post_id, tag_id),
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)       REFERENCES tags(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
$log[] = "Created/verified: blog_tags";

$pdo->exec("
CREATE TABLE IF NOT EXISTS portfolio_categories (
  portfolio_id INT NOT NULL,
  category_id  INT NOT NULL,
  PRIMARY KEY (portfolio_id, category_id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolio(id)  ON DELETE CASCADE,
  FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
$log[] = "Created/verified: portfolio_categories";

$pdo->exec("
CREATE TABLE IF NOT EXISTS portfolio_tags (
  portfolio_id INT NOT NULL,
  tag_id       INT NOT NULL,
  PRIMARY KEY (portfolio_id, tag_id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolio(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)       REFERENCES tags(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");
$log[] = "Created/verified: portfolio_tags";

echo '<pre>';
echo "✅ Migration complete.\n\n";
foreach ($log as $l) echo "  • $l\n";
echo "\n⚠️  DELETE this file now: public/api/migrate.php\n";
echo '</pre>';
