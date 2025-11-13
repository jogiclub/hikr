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

    // 소프트 삭제 (is_active = 0)
    $sql = "UPDATE instagram_posts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([':id' => $id]);

    if ($result && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => '게시물이 삭제되었습니다.',
            'data' => ['id' => $id]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception('게시물을 찾을 수 없거나 이미 삭제되었습니다.');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>