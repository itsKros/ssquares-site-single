<?php
require __DIR__ . '/../config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$id     = intval($_GET['id']   ?? 0);
$slug   = trim($_GET['slug']   ?? '');

if (!$id && !$slug) json_out(['error' => 'id or slug required'], 400);

if ($method === 'GET') {
    if ($slug) {
        $stmt = db()->prepare("SELECT * FROM blog_posts WHERE slug = ?");
        $stmt->execute([$slug]);
    } else {
        $stmt = db()->prepare("SELECT * FROM blog_posts WHERE id = ?");
        $stmt->execute([$id]);
    }
    $row = $stmt->fetch();
    if (!$row) json_out(['error' => 'Not found'], 404);
    $rid = (int)$row['id'];
    $row['categories'] = get_blog_categories($rid);
    $row['tags']       = get_blog_tags($rid);
    json_out($row);
}

if (!$id) json_out(['error' => 'id required'], 400);
auth_required();

if ($method === 'PUT') {
    $body        = json_decode(file_get_contents('php://input'), true);
    $title       = trim($body['title'] ?? '');
    if (!$title) json_out(['error' => 'title required'], 400);
    $slug        = slugify($title);
    $excerpt     = $body['excerpt']     ?? '';
    $content     = $body['content']     ?? '';
    $cover_image = $body['cover_image'] ?? '';
    $status      = in_array($body['status'] ?? '', ['draft','published']) ? $body['status'] : 'draft';

    // Check if author column exists before including it
    $hasAuthor = db()->prepare(
        "SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = 'blog_posts' AND column_name = 'author'"
    );
    $hasAuthor->execute();

    if ($hasAuthor->fetchColumn()) {
        $author = trim($body['author'] ?? '');
        $stmt = db()->prepare(
            "UPDATE blog_posts SET title=?,slug=?,excerpt=?,content=?,cover_image=?,author=?,status=? WHERE id=?"
        );
        $stmt->execute([$title,$slug,$excerpt,$content,$cover_image,$author,$status,$id]);
    } else {
        $stmt = db()->prepare(
            "UPDATE blog_posts SET title=?,slug=?,excerpt=?,content=?,cover_image=?,status=? WHERE id=?"
        );
        $stmt->execute([$title,$slug,$excerpt,$content,$cover_image,$status,$id]);
    }

    sync_blog_categories($id, $body['category_ids'] ?? []);
    sync_blog_tags($id, $body['tag_ids'] ?? []);

    json_out(['success' => true, 'slug' => $slug]);
}

if ($method === 'DELETE') {
    db()->prepare("DELETE FROM blog_posts WHERE id = ?")->execute([$id]);
    json_out(['success' => true]);
}

json_out(['error' => 'Method not allowed'], 405);
