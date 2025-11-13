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
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

    if ($id <= 0) {
        throw new Exception('유효하지 않은 게시물 ID입니다.');
    }

    $db = new Database();
    $conn = $db->getConnection();

    // 게시물 존재 여부 확인
    $checkSql = "SELECT id FROM instagram_posts WHERE id = :id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([':id' => $id]);

    if (!$checkStmt->fetch()) {
        throw new Exception('게시물을 찾을 수 없습니다.');
    }

    // 업데이트 데이터 준비
    $updateFields = [];
    $params = [':id' => $id];

    $allowedFields = [
        'post_url', 'post_id', 'username', 'profile_image', 'content',
        'video_url', 'image_url', 'media_type', 'likes_count',
        'audio_name', 'audio_url', 'hashtags', 'posted_at'
    ];

    foreach ($allowedFields as $field) {
        if (isset($_POST[$field])) {
            $value = trim($_POST[$field]);

            // 특수 처리
            if ($field === 'likes_count') {
                $value = intval($value);
            } elseif ($field === 'hashtags' && !empty($value)) {
                // 해시태그가 배열 형태로 온 경우 처리
                if (is_array($_POST[$field])) {
                    $value = json_encode($_POST[$field], JSON_UNESCAPED_UNICODE);
                } elseif (!json_decode($value)) {
                    // JSON이 아닌 경우 쉼표로 분리하여 배열로 변환
                    $hashtagArray = array_map('trim', explode(',', $value));
                    $value = json_encode($hashtagArray, JSON_UNESCAPED_UNICODE);
                }
            }

            $updateFields[] = "$field = :$field";
            $params[":$field"] = $value;
        }
    }

    if (empty($updateFields)) {
        throw new Exception('업데이트할 필드가 없습니다.');
    }

    $sql = "UPDATE instagram_posts SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute($params);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => '게시물이 업데이트되었습니다.',
            'data' => ['id' => $id]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('게시물 업데이트에 실패했습니다.');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>