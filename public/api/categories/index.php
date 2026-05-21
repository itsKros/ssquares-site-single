<?php
require __DIR__ . '/../config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $type = $_GET['type'] ?? null;
    if ($type) {
        $stmt = db()->prepare("SELECT * FROM categories WHERE type = ? ORDER BY name");
        $stmt->execute([$type]);
    } else {
        $stmt = db()->query("SELECT * FROM categories ORDER BY type, name");
    }
    json_out($stmt->fetchAll());
}

$payload = auth_required();

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = trim($body['name'] ?? '');
    $type = trim($body['type'] ?? '');
    if (!$name || !in_array($type, ['portfolio', 'blog'])) {
        json_out(['error' => 'name and type (portfolio|blog) required'], 400);
    }
    $slug = slugify($name) . '-' . $type;
    $stmt = db()->prepare("INSERT INTO categories (name, slug, type) VALUES (?,?,?)");
    $stmt->execute([$name, $slug, $type]);
    json_out(['id' => db()->lastInsertId(), 'name' => $name, 'slug' => $slug, 'type' => $type], 201);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_out(['error' => 'id required'], 400);
    db()->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
    json_out(['success' => true]);
}

json_out(['error' => 'Method not allowed'], 405);
