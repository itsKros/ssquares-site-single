<?php
// ── .env loader ───────────────────────────────────────────────────────────────
function load_env(string $path): void {
    if (!is_file($path)) return;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        if (strpos($line, '=') === false) continue; // PHP 7.4 compatible
        $parts = explode('=', $line, 2);
        $k = trim($parts[0]);
        $v = trim($parts[1] ?? '');
        if (preg_match('/^(["\'])(.*)\\1$/', $v, $m)) $v = $m[2];
        putenv("$k=$v");
        $_ENV[$k] = $v;
    }
}

function env(string $key, string $default = ''): string {
    $v = getenv($key);
    return ($v !== false) ? $v : (isset($_ENV[$key]) ? $_ENV[$key] : $default);
}

load_env(__DIR__ . '/.env');

// ── Constants ─────────────────────────────────────────────────────────────────
define('DB_HOST',    env('DB_HOST', 'localhost'));
define('DB_NAME',    env('DB_NAME', 'ssquares_db'));
define('DB_USER',    env('DB_USER', 'root'));
define('DB_PASS',    env('DB_PASS', ''));
define('JWT_SECRET', env('JWT_SECRET', 'change_me'));
define('UPLOAD_DIR', __DIR__ . '/../assets/uploads/');
define('UPLOAD_URL', env('UPLOAD_URL', '/assets/uploads/'));

// ── Database ──────────────────────────────────────────────────────────────────
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
             PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    return $pdo;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function json_out($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function cors(): void {
    $origin = env('CORS_ORIGIN', '*');
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

function b64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload): string {
    $header  = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = b64url(json_encode($payload));
    $sig     = b64url(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function jwt_decode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = b64url(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(b64url_decode($payload), true);
    if (isset($data['exp']) && $data['exp'] < time()) return null;
    return $data;
}

function auth_required(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? '';
    if (!$header && function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strtolower($k) === 'authorization') { $header = $v; break; }
        }
    }
    if (!preg_match('/Bearer\s+(.+)/i', $header, $m)) {
        json_out(['error' => 'Unauthorized'], 401);
    }
    $payload = jwt_decode(trim($m[1]));
    if (!$payload) json_out(['error' => 'Invalid or expired token'], 401);
    return $payload;
}

function slugify(string $text): string {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-');
}

// ── Pivot helpers ─────────────────────────────────────────────────────────────
function fetch_assoc(string $sql, array $params = []): array {
    try {
        $s = db()->prepare($sql);
        $s->execute($params);
        return $s->fetchAll();
    } catch (\Throwable $e) {
        return [];
    }
}

function get_blog_categories(int $id): array {
    return fetch_assoc(
        "SELECT c.id, c.name FROM categories c
         JOIN blog_categories bc ON bc.category_id = c.id WHERE bc.blog_post_id = ? ORDER BY c.name",
        [$id]
    );
}
function get_blog_tags(int $id): array {
    return fetch_assoc(
        "SELECT t.id, t.name FROM tags t
         JOIN blog_tags bt ON bt.tag_id = t.id WHERE bt.blog_post_id = ? ORDER BY t.name",
        [$id]
    );
}
function get_portfolio_categories(int $id): array {
    return fetch_assoc(
        "SELECT c.id, c.name FROM categories c
         JOIN portfolio_categories pc ON pc.category_id = c.id WHERE pc.portfolio_id = ? ORDER BY c.name",
        [$id]
    );
}
function get_portfolio_tags(int $id): array {
    return fetch_assoc(
        "SELECT t.id, t.name FROM tags t
         JOIN portfolio_tags pt ON pt.tag_id = t.id WHERE pt.portfolio_id = ? ORDER BY t.name",
        [$id]
    );
}

function sync_blog_categories(int $id, array $cat_ids): void {
    db()->prepare("DELETE FROM blog_categories WHERE blog_post_id = ?")->execute([$id]);
    if (!$cat_ids) return;
    $s = db()->prepare("INSERT IGNORE INTO blog_categories (blog_post_id, category_id) VALUES (?,?)");
    foreach (array_unique(array_filter($cat_ids)) as $cid) $s->execute([$id, intval($cid)]);
}
function sync_blog_tags(int $id, array $tag_ids): void {
    db()->prepare("DELETE FROM blog_tags WHERE blog_post_id = ?")->execute([$id]);
    if (!$tag_ids) return;
    $s = db()->prepare("INSERT IGNORE INTO blog_tags (blog_post_id, tag_id) VALUES (?,?)");
    foreach (array_unique(array_filter($tag_ids)) as $tid) $s->execute([$id, intval($tid)]);
}
function sync_portfolio_categories(int $id, array $cat_ids): void {
    db()->prepare("DELETE FROM portfolio_categories WHERE portfolio_id = ?")->execute([$id]);
    if (!$cat_ids) return;
    $s = db()->prepare("INSERT IGNORE INTO portfolio_categories (portfolio_id, category_id) VALUES (?,?)");
    foreach (array_unique(array_filter($cat_ids)) as $cid) $s->execute([$id, intval($cid)]);
}
function sync_portfolio_tags(int $id, array $tag_ids): void {
    db()->prepare("DELETE FROM portfolio_tags WHERE portfolio_id = ?")->execute([$id]);
    if (!$tag_ids) return;
    $s = db()->prepare("INSERT IGNORE INTO portfolio_tags (portfolio_id, tag_id) VALUES (?,?)");
    foreach (array_unique(array_filter($tag_ids)) as $tid) $s->execute([$id, intval($tid)]);
}
