<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once './database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'POST 요청만 허용됩니다.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // 필수 필드 검증
    $requiredFields = ['post_url', 'post_id', 'username'];
    foreach ($requiredFields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("필수 필드 '{$field}'를 입력해주세요.");
        }
    }

    // 데이터 준비
    $postData = [
        ':post_url' => trim($_POST['post_url']),
        ':post_id' => trim($_POST['post_id']),
        ':username' => trim($_POST['username']),
        ':profile_image' => isset($_POST['profile_image']) ? trim($_POST['profile_image']) : null,
        ':content' => isset($_POST['content']) ? trim($_POST['content']) : null,
        ':video_url' => isset($_POST['video_url']) ? trim($_POST['video_url']) : null,
        ':image_url' => isset($_POST['image_url']) ? trim($_POST['image_url']) : null,
        ':media_type' => isset($_POST['media_type']) ? trim($_POST['media_type']) : 'image',
        ':likes_count' => isset($_POST['likes_count']) ? intval($_POST['likes_count']) : 0,
        ':audio_name' => isset($_POST['audio_name']) ? trim($_POST['audio_name']) : null,
        ':audio_url' => isset($_POST['audio_url']) ? trim($_POST['audio_url']) : null,
        ':hashtags' => null,
        ':posted_at' => isset($_POST['posted_at']) ? trim($_POST['posted_at']) : date('Y-m-d H:i:s')
    ];

    // 해시태그 처리
    if (isset($_POST['hashtags']) && !empty($_POST['hashtags'])) {
        $hashtags = trim($_POST['hashtags']);
        // 쉼표로 분리된 해시태그를 배열로 변환
        $hashtagArray = array_map('trim', explode(',', $hashtags));
        $hashtagArray = array_filter($hashtagArray); // 빈 값 제거
        $postData[':hashtags'] = json_encode($hashtagArray, JSON_UNESCAPED_UNICODE);
    }

    // 게시물 저장
    if ($db->savePost($postData)) {
        // 크롤링 로그 저장
        $db->saveCrawlingLog($postData[':username'], 'success', 1);

        echo json_encode([
            'success' => true,
            'message' => '게시물이 추가되었습니다.',
            'data' => [
                'post_id' => $postData[':post_id']
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('게시물 저장에 실패했습니다.');
    }

} catch (Exception $e) {
    if (isset($db) && isset($postData[':username'])) {
        $db->saveCrawlingLog($postData[':username'], 'fail', 0, $e->getMessage());
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>