<?php
// Quick server health check — DELETE after confirming production works
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$envPath = __DIR__ . '/.env';
$dbOk    = false;
$dbError = '';

if (file_exists($envPath)) {
    require __DIR__ . '/config.php';
    try {
        db()->query("SELECT 1");
        $dbOk = true;
    } catch (Exception $e) {
        $dbError = $e->getMessage();
    }
}

echo json_encode([
    'php'       => PHP_VERSION,
    'env_file'  => file_exists($envPath) ? 'found at ' . $envPath : 'MISSING — upload .env here: ' . $envPath,
    'db'        => $dbOk ? 'connected' : 'FAILED: ' . $dbError,
    'dir'       => __DIR__,
]);
