<?php
/**
 * Instagram Post Detail API
 * 특정 게시물의 상세 정보를 제공하는 API
 */

// CORS 헤더 설정
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS 요청 처리
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
    // post_id 또는 id 파라미터 확인
    $post_id = isset($_GET['post_id']) ? trim($_GET['post_id']) : null;
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if (!$post_id && !$id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 'MISSING_PARAMETER',
                'message' => 'Either post_id or id parameter is required'
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db = new Database();
    $conn = $db->getConnection();

    // SQL 쿼리 구성
    if ($post_id) {
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
                WHERE post_id = :post_id AND is_active = 1
                LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':post_id', $post_id);
    } else {
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
                WHERE id = :id AND is_active = 1
                LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    }

    $stmt->execute();
    $post = $stmt->fetch();

    if (!$post) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 'POST_NOT_FOUND',
                'message' => 'The requested post was not found'
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 데이터 정제
    if (!empty($post['hashtags'])) {
        $decoded = json_decode($post['hashtags'], true);
        $post['hashtags'] = is_array($decoded) ? $decoded : [];
    } else {
        $post['hashtags'] = [];
    }

    $post['id'] = intval($post['id']);
    $post['likes_count'] = intval($post['likes_count']);
    $post['profile_image'] = $post['profile_image'] ?: null;
    $post['content'] = $post['content'] ?: null;
    $post['video_url'] = $post['video_url'] ?: null;
    $post['image_url'] = $post['image_url'] ?: null;
    $post['audio_name'] = $post['audio_name'] ?: null;
    $post['audio_url'] = $post['audio_url'] ?: null;

    // 응답 구성
    $response = [
        'success' => true,
        'data' => [
            'post' => $post
        ],
        'meta' => [
            'timestamp' => date('Y-m-d H:i:s'),
            'api_version' => '1.0'
        ]
    ];

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