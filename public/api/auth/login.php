<?php
require __DIR__ . '/../config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Method not allowed'], 405);

$body = json_decode(file_get_contents('php://input'), true);
$identifier = trim($body['username'] ?? '');
$password   = trim($body['password'] ?? '');

if (!$identifier || !$password) json_out(['error' => 'Username and password required'], 400);

$stmt = db()->prepare(
    "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1"
);
$stmt->execute([$identifier, $identifier]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_out(['error' => 'Invalid credentials'], 401);
}

$token = jwt_encode([
    'sub'  => $user['id'],
    'name' => $user['name'],
    'role' => $user['role'],
    'exp'  => time() + 86400 * 7,
]);

json_out([
    'token' => $token,
    'user'  => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
    ],
]);
