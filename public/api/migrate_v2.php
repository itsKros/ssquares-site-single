<?php
/*
 * MIGRATION v2 — adds the `author` column to blog_posts.
 * Visit: http://localhost/ssquares-site/public/api/migrate_v2.php
 * DELETE this file after running.
 */
require __DIR__ . '/config.php';
$pdo = db();

$check = $pdo->prepare(
    "SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'blog_posts' AND column_name = 'author'"
);
$check->execute();

if ($check->fetchColumn()) {
    echo "<pre>ℹ️  Column 'author' already exists in blog_posts — nothing to do.</pre>";
} else {
    $pdo->exec("ALTER TABLE blog_posts ADD COLUMN author VARCHAR(100) DEFAULT NULL AFTER cover_image");
    echo "<pre>✅ Added 'author' column to blog_posts.\n\n⚠️  DELETE this file: public/api/migrate_v2.php</pre>";
}
