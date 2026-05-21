<?php
require __DIR__ . '/config.php';
cors();

auth_required();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'POST only'], 405);

$file = $_FILES['file'] ?? null;
if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    json_out(['error' => 'No file or upload error'], 400);
}

$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$mime    = mime_content_type($file['tmp_name']);
if (!in_array($mime, $allowed)) {
    json_out(['error' => 'Only JPG, PNG, GIF, WEBP allowed'], 400);
}

if ($file['size'] > 5 * 1024 * 1024) {
    json_out(['error' => 'Max file size 5MB'], 400);
}

$ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . strtolower($ext);
$dest     = UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    json_out(['error' => 'Failed to save file'], 500);
}

json_out(['url' => UPLOAD_URL . $filename]);
