<?php
require __DIR__ . '/../config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $search = $_GET['search'] ?? null;
        $page   = isset($_GET['page']) ? max(1, intval($_GET['page'])) : null;
        $limit  = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 9;

        $where  = [];
        $params = [];

        if ($search) {
            $where[] = "(title LIKE ? OR description LIKE ?)";
            $params[] = "%$search%"; $params[] = "%$search%";
        }

        $whereSQL = $where ? "WHERE " . implode(" AND ", $where) : "";

        // Paginated (public archive)
        if ($page !== null || $search !== null) {
            $pg     = $page ?? 1;
            $offset = ($pg - 1) * $limit;

            $countStmt = db()->prepare("SELECT COUNT(*) FROM portfolio $whereSQL");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            $stmt = db()->prepare(
                "SELECT id,title,slug,description,cover_image,live_url,created_at
                 FROM portfolio $whereSQL ORDER BY created_at DESC LIMIT $limit OFFSET $offset"
            );
            $stmt->execute($params);
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) {
                $r['categories'] = get_portfolio_categories((int)$r['id']);
                $r['tags']       = get_portfolio_tags((int)$r['id']);
            }
            json_out(['total' => $total, 'items' => $rows, 'page' => $pg, 'limit' => $limit]);
        }

        // Plain array (dashboard)
        $stmt = db()->query(
            "SELECT id,title,slug,description,cover_image,images,live_url,created_at,updated_at
             FROM portfolio ORDER BY created_at DESC"
        );
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['images']     = $r['images'] ? json_decode($r['images']) : [];
            $r['categories'] = get_portfolio_categories((int)$r['id']);
            $r['tags']       = get_portfolio_tags((int)$r['id']);
        }
        json_out($rows);

    } catch (\Throwable $e) {
        json_out(['error' => $e->getMessage()], 500);
    }
}

auth_required();

if ($method === 'POST') {
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
            "INSERT INTO portfolio (title,slug,description,cover_image,images,live_url) VALUES (?,?,?,?,?,?)"
        );
        $stmt->execute([$title,$slug,$description,$cover_image,$images,$live_url]);
        $new_id = (int)db()->lastInsertId();

        sync_portfolio_categories($new_id, $body['category_ids'] ?? []);
        sync_portfolio_tags($new_id, $body['tag_ids'] ?? []);

        json_out(['id' => $new_id, 'slug' => $slug], 201);
    } catch (\Throwable $e) {
        json_out(['error' => $e->getMessage()], 500);
    }
}

json_out(['error' => 'Method not allowed'], 405);
