<?php
// 에러 표시 활성화 (디버깅용)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // database.php 파일 확인
    if (!file_exists('./database.php')) {
        throw new Exception('database.php 파일을 찾을 수 없습니다.');
    }

    require_once './database.php';

    $db = new Database();
    $conn = $db->getConnection();

    // 페이지 파라미터
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(50, intval($_GET['limit']))) : 10;
    $offset = ($page - 1) * $limit;

    // 전체 게시물 수 조회
    $totalPosts = $db->getTotalPostsCount();
    $totalPages = ceil($totalPosts / $limit);

    // 게시물 목록 조회
    $posts = $db->getPosts($limit, $offset);

    // 해시태그 JSON 디코딩
    foreach ($posts as &$post) {
        if (!empty($post['hashtags'])) {
            $decoded = json_decode($post['hashtags'], true);
            $post['hashtags_array'] = is_array($decoded) ? $decoded : [];
        } else {
            $post['hashtags_array'] = [];
        }
    }

    // 응답 데이터
    $response = [
        'success' => true,
        'data' => [
            'posts' => $posts,
            'pagination' => [
                'currentPage' => $page,
                'totalPages' => $totalPages,
                'total' => $totalPosts,
                'limit' => $limit
            ]
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);

    $errorResponse = [
        'success' => false,
        'message' => '데이터 조회 중 오류가 발생했습니다.',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ];

    echo json_encode($errorResponse, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>