<?php
// webhook_handler.php

// 1. 필요한 파일 로드
require_once 'database.php';

// 응답 헤더 설정 (JSON 응답을 기대하는 웹훅 서비스에 적합)
header('Content-Type: application/json');

// POST 요청이 아니거나, 데이터가 없으면 종료
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Only POST requests are allowed.']);
    exit;
}

// 2. 웹훅 데이터 수신 (raw POST body)
$json_data = file_get_contents('php://input');

// 3. JSON 파싱
$data = json_decode($json_data, true);

// 데이터가 유효한지 확인
if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data received.']);
    exit;
}

// 4. 데이터베이스 인스턴스 생성
try {
    $db = new Database();
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    // 실제 서비스에서는 에러 로그를 남겨야 합니다.
    exit;
}


// 5. 웹훅 데이터 준비 및 정리
$post_data = [
    // 웹훅 예시의 키를 기준으로 매핑
    ':post_url'      => $data['permalink'] ?? null,
    ':post_id'       => $data['id'] ?? null, // post_id는 고유 키로 사용됨
    ':username'      => $data['username'] ?? null,
    ':profile_image' => $data['profile_image'] ?? null, // 웹훅 예시에는 없지만, DB 스키마에 있음
    ':content'       => $data['caption'] ?? null,

    // 미디어 타입에 따라 URL 분리 (media_url이 VIDEO면 video_url, 아니면 image_url)
    ':video_url'     => ($data['media_type'] ?? '') === 'VIDEO' ? ($data['media_url'] ?? null) : null,
    ':image_url'     => ($data['media_type'] ?? '') !== 'VIDEO' ? ($data['media_url'] ?? null) : ($data['thumbnail_url'] ?? null),

    ':media_type'    => strtolower($data['media_type'] ?? 'image'),
    ':likes_count'   => (int)($data['like_count'] ?? 0),

    // 오디오 관련 정보 (웹훅 예시에는 없지만, DB 스키마에 있음)
    ':audio_name'    => null,
    ':audio_url'     => null,

    // 해시태그 파싱 (content에서 추출하거나 별도의 필드가 있다면 사용)
    ':hashtags'      => $data['hashtags'] ?? null, // 웹훅 예시의 caption에서 추출하는 로직은 복잡하여 일단 NULL 처리

    // posted_at은 '2025-11-07T01:50:25+0000' 포맷으로 들어오므로, DB 클래스에서 처리함
    ':posted_at'     => $data['timestamp'] ?? null,
];


// 6. 데이터 검증 (필수 필드 확인)
if (empty($post_data[':post_id']) || empty($post_data[':post_url']) || empty($post_data[':username']) || empty($post_data[':posted_at'])) {
    http_response_code(422); // Unprocessable Entity
    echo json_encode(['status' => 'fail', 'message' => 'Missing required fields (post_id, post_url, username, timestamp).', 'received_data' => $data]);
    // 로그 남기기: $db->saveCrawlingLog('N/A', 'fail', 0, 'Missing required fields for post ID: ' . ($data['id'] ?? 'N/A'));
    exit;
}


// 7. DB에 게시물 저장
try {
    $result = $db->savePost($post_data);

    if ($result) {
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Post saved/updated successfully.', 'post_id' => $post_data[':post_id']]);

        // (선택 사항) 로그 테이블에 성공 기록 (크롤링 완료 시점에 해당)
        // $db->saveCrawlingLog($post_data[':username'], 'success', 1, '');

    } else {
        http_response_code(500);
        echo json_encode(['status' => 'fail', 'message' => 'Failed to save post to database.', 'post_id' => $post_data[':post_id']]);
        // 로그 남기기: $db->saveCrawlingLog($post_data[':username'], 'fail', 0, 'DB save operation failed for post ID: ' . $post_data[':post_id']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'fail', 'message' => 'Database error: ' . $e->getMessage(), 'post_id' => $post_data[':post_id']]);
    // 로그 남기기
    // $db->saveCrawlingLog($post_data[':username'], 'fail', 0, 'PDOException for post ID ' . $post_data[':post_id'] . ': ' . $e->getMessage());
}

?>