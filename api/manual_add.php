<?php
header('Content-Type: application/json; charset=utf-8');

require_once './database.php';

// POST 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'POST 요청만 허용됩니다.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $postIds = isset($_POST['post_ids']) ? trim($_POST['post_ids']) : '';

    if (empty($postIds)) {
        throw new Exception('게시물 ID를 입력해주세요.');
    }

    // 줄바꿈으로 구분된 ID들을 배열로 변환
    $idArray = array_filter(array_map('trim', explode("\n", $postIds)));

    if (empty($idArray)) {
        throw new Exception('유효한 게시물 ID를 입력해주세요.');
    }

    $db = new Database();
    $conn = $db->getConnection();

    $successCount = 0;
    $failedIds = [];
    $results = [];

    foreach ($idArray as $postId) {
        // URL에서 ID만 추출
        if (strpos($postId, 'instagram.com') !== false) {
            preg_match('/\/p\/([A-Za-z0-9_-]+)/', $postId, $matches);
            if (isset($matches[1])) {
                $postId = $matches[1];
            }
        }

        try {
            // Instagram 게시물 정보 가져오기
            $postData = fetchInstagramPost($postId);

            if ($postData && $db->savePost($postData)) {
                $successCount++;
                $results[] = [
                    'post_id' => $postId,
                    'status' => 'success'
                ];
            } else {
                $failedIds[] = $postId;
                $results[] = [
                    'post_id' => $postId,
                    'status' => 'failed',
                    'message' => '게시물 정보를 가져올 수 없습니다.'
                ];
            }
        } catch (Exception $e) {
            $failedIds[] = $postId;
            $results[] = [
                'post_id' => $postId,
                'status' => 'failed',
                'message' => $e->getMessage()
            ];
        }
    }

    // 크롤링 로그 저장
    $db->saveCrawlingLog('manual_add', 'success', $successCount);

    $response = [
        'success' => true,
        'message' => "총 " . count($idArray) . "개 중 {$successCount}개 추가 완료",
        'data' => [
            'total' => count($idArray),
            'success' => $successCount,
            'failed' => count($failedIds),
            'failed_ids' => $failedIds,
            'details' => $results
        ]
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    if (isset($db)) {
        $db->saveCrawlingLog('manual_add', 'fail', 0, $e->getMessage());
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// Instagram 게시물 정보 가져오기 (샘플 데이터)
function fetchInstagramPost($postId) {
    // 실제로는 Instagram Graph API나 공식 API를 사용해야 합니다.
    // 여기서는 데모용 샘플 데이터를 반환합니다.

    // 게시물 ID가 유효한지 확인
    if (!preg_match('/^[A-Za-z0-9_-]+$/', $postId)) {
        throw new Exception('유효하지 않은 게시물 ID입니다.');
    }

    // 샘플 데이터 생성
    $sampleUsernames = ['hikrground_official', 'sample_user', 'test_account'];
    $username = $sampleUsernames[array_rand($sampleUsernames)];

    return [
        ':post_url' => "https://www.instagram.com/p/{$postId}/",
        ':post_id' => $postId,
        ':username' => $username,
        ':profile_image' => 'https://scontent-ssn1-1.cdninstagram.com/v/t51.2885-19/290081272_2582765985205550_8779184345117358009_n.jpg',
        ':content' => "수동으로 추가된 게시물 (ID: {$postId})\n\n이것은 샘플 데이터입니다.\n실제 구현에서는 Instagram API를 사용하여 게시물 정보를 가져와야 합니다.\n\n#HiKRGROUND #HiKR #서울전시 #seoul",
        ':video_url' => null,
        ':image_url' => "https://via.placeholder.com/800x800?text=Post+{$postId}",
        ':media_type' => 'image',
        ':likes_count' => rand(10, 1000),
        ':audio_name' => null,
        ':audio_url' => null,
        ':hashtags' => json_encode(['HiKRGROUND', 'HiKR', '서울전시', 'seoul']),
        ':posted_at' => date('Y-m-d H:i:s', strtotime('-' . rand(1, 48) . ' hours'))
    ];
}
?>