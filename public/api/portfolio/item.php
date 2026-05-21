<?php
require __DIR__ . '/../config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$id     = intval($_GET['id']   ?? 0);
$slug   = trim($_GET['slug']   ?? '');

if (!$id && !$slug) json_out(['error' => 'id or slug required'], 400);

if ($method === 'GET') {
    try {
        if ($slug) {
            $stmt = db()->prepare("SELECT * FROM portfolio WHERE slug = ?");
            $stmt->execute([$slug]);
        } else {
            $stmt = db()->prepare("SELECT * FROM portfolio WHERE id = ?");
            $stmt->execute([$id]);
        }
        $row = $stmt->fetch();
        if (!$row) json_out(['error' => 'Not found'], 404);

        $rid = (int)$row['id'];
        $row['images']     = $row['images'] ? json_decode($row['images']) : [];
        $row['categories'] = get_portfolio_categories($rid);
        $row['tags']       = get_portfolio_tags($rid);

        // Prev / Next for bottom navigation
        $prevStmt = db()->prepare("SELECT id,title,slug,cover_image FROM portfolio WHERE id < ? ORDER BY id DESC LIMIT 1");
        $prevStmt->execute([$rid]);
        $row['prev'] = $prevStmt->fetch() ?: null;

        $nextStmt = db()->prepare("SELECT id,title,slug,cover_image FROM portfolio WHERE id > ? ORDER BY id ASC LIMIT 1");
        $nextStmt->execute([$rid]);
        $row['next'] = $nextStmt->fetch() ?: null;

        json_out($row);
    } catch (\Throwable $e) {
        json_out(['error' => $e->getMessage()], 500);
    }
}

if (!$id) json_out(['error' => 'id required'], 400);
auth_required();

if ($method === 'PUT') {
    try {
        $body        = json_decode(file_get_contents('php://input'), true);
        $title       = trim($body['title'] ?? '');
        if (!$title) json_out(['error' => 'title required'], 400);
        $slug        = slugify($title);
        $description = $body['description'] ?? '';
        $cover_image = $body['cover_image'] ?? '';
        $images      = json_encode($body['images'] ?? []);
        $live_url    = $body['live_url'] ?? '';

        $stmt = db()->prepare(
            "UPDATE portfolio SET title=?,slug=?,description=?,cover_image=?,images=?,live_url=? WHERE id=?"
        );
        $stmt->execute([$title,$slug,$description,$cover_image,$images,$live_url,$id]);

        sync_portfolio_categories($id, $body['category_ids'] ?? []);
        sync_portfolio_tags($id, $body['tag_ids'] ?? []);

        json_out(['success' => true, 'slug' => $slug]);
    } catch (\Throwable $e) {
        json_out(['error' => $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    db()->prepare("DELETE FROM portfolio WHERE id = ?")->execute([$id]);
    json_out(['success' => true]);
}

json_out(['error' => 'Method not allowed'], 405);
