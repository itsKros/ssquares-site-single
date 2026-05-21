<?php
require __DIR__ . '/../config.php';
cors();

$payload = auth_required();
if ($payload['role'] !== 'admin') json_out(['error' => 'Admin only'], 403);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = db()->query("SELECT id,name,email,username,role,created_at FROM users ORDER BY created_at DESC")->fetchAll();
    json_out($rows);
}

if ($method === 'POST') {
    $body     = json_decode(file_get_contents('php://input'), true);
    $name     = trim($body['name'] ?? '');
    $email    = trim($body['email'] ?? '');
    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');
    $role     = in_array($body['role'] ?? '', ['admin','editor']) ? $body['role'] : 'editor';

    if (!$name || !$email || !$username || !$password) {
        json_out(['error' => 'name, email, username, password required'], 400);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    try {
        $stmt = db()->prepare("INSERT INTO users (name,email,username,password_hash,role) VALUES (?,?,?,?,?)");
        $stmt->execute([$name,$email,$username,$hash,$role]);
        json_out(['id' => db()->lastInsertId()], 201);
    } catch (PDOException $e) {
        json_out(['error' => 'Email or username already exists'], 409);
    }
}

json_out(['error' => 'Method not allowed'], 405);
