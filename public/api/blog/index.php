<?php
require __DIR__ . '/../config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $status  = $_GET['status']  ?? null;
        $search  = $_GET['search']  ?? null;
        $page    = isset($_GET['page'])  ? max(1, intval($_GET['page']))  : null;
        $limit   = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 9;

        $where  = [];
        $params = [];

        if ($status && in_array($status, ['draft','published'])) {
            $where[] = "status = ?"; $params[] = $status;
        }
        if ($search) {
            $where[] = "(title LIKE ? OR excerpt LIKE ?)";
            $params[] = "%$search%"; $params[] = "%$search%";
        }

        $whereSQL = $where ? "WHERE " . implode(" AND ", $where) : "";

        // Paginated response (public archive / search)
        if ($page !== null || $search !== null) {
            $pg     = $page ?? 1;
            $offset = ($pg - 1) * $limit;

            $countStmt = db()->prepare("SELECT COUNT(*) FROM blog_posts $whereSQL");
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            $stmt = db()->prepare(
                "SELECT id,title,slug,excerpt,cover_image,status,created_at
                 FROM blog_posts $whereSQL
                 ORDER BY created_at DESC LIMIT $limit OFFSET $offset"
            );
            $stmt->execute($params);
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) {
                $r['categories'] = get_blog_categories((int)$r['id']);
                $r['tags']       = get_blog_tags((int)$r['id']);
            }
            json_out(['total' => $total, 'posts' => $rows, 'page' => $pg, 'limit' => $limit]);
        }

        // Plain array (dashboard)
        $stmt = db()->prepare(
            "SELECT id,title,slug,excerpt,cover_image,status,created_at,updated_at
             FROM blog_posts $whereSQL ORDER BY created_at DESC"
        );
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['categories'] = get_blog_categories((int)$r['id']);
            $r['tags']       = get_blog_tags((int)$r['id']);
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
        $excerpt     = $body['excerpt']     ?? '';
        $content     = $body['content']     ?? '';
        $cover_image = $body['cover_image'] ?? '';
        $status      = in_array($body['status'] ?? '', ['draft','published']) ? $body['status'] : 'draft';

        // Check if author column exists
        $hasAuthor = (bool)db()->query(
            "SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema=DATABASE() AND table_name='blog_posts' AND column_name='author'"
        )->fetchColumn();

        if ($hasAuthor) {
            $author = trim($body['author'] ?? '');
            $stmt = db()->prepare(
                "INSERT INTO blog_posts (title,slug,excerpt,content,cover_image,author,status) VALUES (?,?,?,?,?,?,?)"
            );
            $stmt->execute([$title,$slug,$excerpt,$content,$cover_image,$author,$status]);
        } else {
            $stmt = db()->prepare(
                "INSERT INTO blog_posts (title,slug,excerpt,content,cover_image,status) VALUES (?,?,?,?,?,?)"
            );
            $stmt->execute([$title,$slug,$excerpt,$content,$cover_image,$status]);
        }

        $new_id = (int)db()->lastInsertId();
        sync_blog_categories($new_id, $body['category_ids'] ?? []);
        sync_blog_tags($new_id, $body['tag_ids'] ?? []);

        json_out(['id' => $new_id, 'slug' => $slug], 201);
    } catch (\Throwable $e) {
        json_out(['error' => $e->getMessage()], 500);
    }
}

json_out(['error' => 'Method not allowed'], 405);
