<?php
/**
 * Instagram Feed API
 * 인스타그램 게시물 데이터를 JSON 형식으로 제공하는 API
 */

// CORS 헤더 설정
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS 요청 처리 (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// GET 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 'METHOD_NOT_ALLOWED',
            'message' => 'Only GET requests are allowed'
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // 파라미터 처리
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
    $username = isset($_GET['username']) ? trim($_GET['username']) : null;
    $media_type = isset($_GET['media_type']) ? trim($_GET['media_type']) : null;
    $sort = isset($_GET['sort']) ? trim($_GET['sort']) : 'latest'; // latest, oldest, popular

    $offset = ($page - 1) * $limit;

    // WHERE 조건 구성
    $whereConditions = ['is_active = 1'];
    $params = [];

    if ($username) {
        $whereConditions[] = 'username = :username';
        $params[':username'] = $username;
    }

    if ($media_type && in_array($media_type, ['image', 'video', 'carousel'])) {
        $whereConditions[] = 'media_type = :media_type';
        $params[':media_type'] = $media_type;
    }

    $whereClause = implode(' AND ', $whereConditions);

    // ORDER BY 구성
    switch ($sort) {
        case 'oldest':
            $orderBy = 'posted_at ASC, id ASC';
            break;
        case 'popular':
            $orderBy = 'likes_count DESC, posted_at DESC, id DESC';
            break;
        case 'latest':
        default:
            $orderBy = 'posted_at DESC, id DESC';
            break;
    }

    // 전체 게시물 수 조회
    $countSql = "SELECT COUNT(*) as total FROM instagram_posts WHERE $whereClause";
    $countStmt = $conn->prepare($countSql);
    $countStmt->execute($params);
    $totalPosts = $countStmt->fetch()['total'];
    $totalPages = ceil($totalPosts / $limit);

    // 게시물 목록 조회
    $sql = "SELECT 
                id,
                post_url,
                post_id,
                username,
                profile_image,
                content,
                video_url,
                image_url,
                media_type,
                likes_count,
                audio_name,
                audio_url,
                hashtags,
                posted_at,
                crawled_at,
                updated_at
            FROM instagram_posts 
            WHERE $whereClause
            ORDER BY $orderBy
            LIMIT :limit OFFSET :offset";

    $stmt = $conn->prepare($sql);

    // 바인딩
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $posts = $stmt->fetchAll();

    // 해시태그 JSON 디코딩 및 데이터 정제
    foreach ($posts as &$post) {
        // 해시태그 처리
        if (!empty($post['hashtags'])) {
            $decoded = json_decode($post['hashtags'], true);
            $post['hashtags'] = is_array($decoded) ? $decoded : [];
        } else {
            $post['hashtags'] = [];
        }

        // 숫자 타입 변환
        $post['id'] = intval($post['id']);
        $post['likes_count'] = intval($post['likes_count']);

        // null 값 처리
        $post['profile_image'] = $post['profile_image'] ?: null;
        $post['content'] = $post['content'] ?: null;
        $post['video_url'] = $post['video_url'] ?: null;
        $post['image_url'] = $post['image_url'] ?: null;
        $post['audio_name'] = $post['audio_name'] ?: null;
        $post['audio_url'] = $post['audio_url'] ?: null;
    }

    // 응답 데이터 구성
    $response = [
        'success' => true,
        'data' => [
            'posts' => $posts,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total_posts' => $totalPosts,
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            ],
            'filters' => [
                'username' => $username,
                'media_type' => $media_type,
                'sort' => $sort
            ]
        ],
        'meta' => [
            'timestamp' => date('Y-m-d H:i:s'),
            'api_version' => '1.0'
        ]
    ];

    // JSON 응답 출력
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 'DATABASE_ERROR',
            'message' => 'Database error occurred',
            'details' => $e->getMessage()
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 'INTERNAL_ERROR',
            'message' => 'An internal error occurred',
            'details' => $e->getMessage()
        ]
    ], JSON_UNESCAPED_UNICODE);
}
?>