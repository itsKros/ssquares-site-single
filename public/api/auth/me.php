<?php
require __DIR__ . '/../config.php';
cors();

$payload = auth_required();
$stmt = db()->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
$stmt->execute([$payload['sub']]);
$user = $stmt->fetch();
if (!$user) json_out(['error' => 'User not found'], 404);
json_out($user);
