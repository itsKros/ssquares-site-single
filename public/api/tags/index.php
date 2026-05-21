<?php
require __DIR__ . '/../config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? null;
    if ($type && in_array($type, ['portfolio', 'blog'])) {
        $stmt = db()->prepare("SELECT * FROM tags WHERE type = ? ORDER BY name");
        $stmt->execute([$type]);
    } else {
        $stmt = db()->query("SELECT * FROM tags ORDER BY type, name");
    }
    json_out($stmt->fetchAll());
}

auth_required();

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = trim($body['name'] ?? '');
    $type = trim($body['type'] ?? '');
    if (!$name || !in_array($type, ['portfolio', 'blog'])) {
        json_out(['error' => 'name and type (portfolio|blog) required'], 400);
    }
    $slug = slugify($name);

    // Return existing if it already exists for this type
    $existing = db()->prepare("SELECT id, name, slug, type FROM tags WHERE slug = ? AND type = ?");
    $existing->execute([$slug, $type]);
    $row = $existing->fetch();
    if ($row) json_out($row);

    $stmt = db()->prepare("INSERT INTO tags (name, slug, type) VALUES (?,?,?)");
    $stmt->execute([$name, $slug, $type]);
    json_out(['id' => (int)db()->lastInsertId(), 'name' => $name, 'slug' => $slug, 'type' => $type], 201);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    db()->prepare("DELETE FROM tags WHERE id = ?")->execute([$id]);
    json_out(['success' => true]);
}

json_out(['error' => 'Method not allowed'], 405);
