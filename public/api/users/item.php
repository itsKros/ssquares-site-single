<?php
require __DIR__ . '/../config.php';
cors();

$payload = auth_required();
if ($payload['role'] !== 'admin') json_out(['error' => 'Admin only'], 403);

$method = $_SERVER['REQUEST_METHOD'];
$id     = intval($_GET['id'] ?? 0);
if (!$id) json_out(['error' => 'id required'], 400);

if ($method === 'GET') {
    $stmt = db()->prepare("SELECT id,name,email,username,role,created_at FROM users WHERE id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) json_out(['error' => 'Not found'], 404);
    json_out($row);
}

if ($method === 'PUT') {
    $body  = json_decode(file_get_contents('php://input'), true);
    $name  = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $role  = in_array($body['role'] ?? '', ['admin','editor']) ? $body['role'] : 'editor';
    if (!$name || !$email) json_out(['error' => 'name and email required'], 400);

    if (!empty($body['password'])) {
        $hash = password_hash($body['password'], PASSWORD_BCRYPT);
        $stmt = db()->prepare("UPDATE users SET name=?,email=?,role=?,password_hash=? WHERE id=?");
        $stmt->execute([$name,$email,$role,$hash,$id]);
    } else {
        $stmt = db()->prepare("UPDATE users SET name=?,email=?,role=? WHERE id=?");
        $stmt->execute([$name,$email,$role,$id]);
    }
    json_out(['success' => true]);
}

if ($method === 'DELETE') {
    if ($id === intval($payload['sub'])) json_out(['error' => 'Cannot delete yourself'], 400);
    db()->prepare("DELETE FROM users WHERE id=?")->execute([$id]);
    json_out(['success' => true]);
}

json_out(['error' => 'Method not allowed'], 405);
