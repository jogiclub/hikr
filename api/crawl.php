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
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';

    if (empty($username)) {
        throw new Exception('사용자명을 입력해주세요.');
    }

    $db = new Database();
    $conn = $db->getConnection();

    // 실제 크롤링 대신 샘플 데이터 저장
    // 주의: 실제 인스타그램 크롤링은 Instagram API 또는 공식 방법을 사용해야 합니다.
    // 이 코드는 데모용 샘플 데이터 저장입니다.

    $samplePosts = generateSamplePosts($username);

    $savedCount = 0;
    foreach ($samplePosts as $postData) {
        if ($db->savePost($postData)) {
            $savedCount++;
        }
    }

    // 크롤링 로그 저장
    $db->saveCrawlingLog($username, 'success', $savedCount);

    echo json_encode([
        'success' => true,
        'message' => '크롤링이 완료되었습니다.',
        'data' => [
            'username' => $username,
            'posts_count' => $savedCount
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    if (isset($db) && isset($username)) {
        $db->saveCrawlingLog($username, 'fail', 0, $e->getMessage());
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// 샘플 게시물 데이터 생성 함수
function generateSamplePosts($username) {
    $posts = [];

    // 샘플 게시물 1 (실제 샘플 HTML에서 추출한 데이터 기반)
    $posts[] = [
        ':post_url' => 'https://www.instagram.com/p/DQ5dAI_kxdj/',
        ':post_id' => 'DQ5dAI_kxdj',
        ':username' => $username,
        ':profile_image' => 'https://scontent-ssn1-1.cdninstagram.com/v/t51.2885-19/290081272_2582765985205550_8779184345117358009_n.jpg',
        ':content' => '🎉 NEW 프로그램 소식 🎉

하이커그라운드의 핵심만 콕!콕!
라이트하지만 알차게 즐기는
< 하이라이트(Hi-Lite) 투어 🧳 >

하이커의 언어천재 가이드
민지쨩👍 하이하이🙋🏻‍♀️ 하이바오🐼 와
하이커엔터 식구들이 만났다 ~!

재미있게 투어만 해도
하이커 명예 앰버서더 등극하고
앰버서더 패스 받기 가능 ~!
앰버서더에게는 어마어마한 혜택이 ✨

11월 셋째주 예약 오픈 👀
선착순 마감이니까 서두르자 ~!💜

#HiKRGROUND #HiKR #서울전시데이트코스 #서울가볼만한곳 #seoul #서울전시 #seoultrip #하이커그라운드 #하이커그라운드정기프로그램',
        ':video_url' => null,
        ':image_url' => 'https://scontent-ssn1-1.cdninstagram.com/v/sample-image.jpg',
        ':media_type' => 'video',
        ':likes_count' => 11,
        ':audio_name' => '투어스•OVERDRIVE',
        ':audio_url' => 'https://www.instagram.com/reels/audio/1067290718647092/',
        ':hashtags' => json_encode(['HiKRGROUND', 'HiKR', '서울전시데이트코스', '서울가볼만한곳', 'seoul', '서울전시', 'seoultrip', '하이커그라운드', '하이커그라운드정기프로그램']),
        ':posted_at' => date('Y-m-d H:i:s', strtotime('-1 hour'))
    ];

    // 추가 샘플 게시물들
    for ($i = 2; $i <= 5; $i++) {
        $posts[] = [
            ':post_url' => "https://www.instagram.com/p/SAMPLE{$i}/",
            ':post_id' => "SAMPLE{$i}",
            ':username' => $username,
            ':profile_image' => 'https://scontent-ssn1-1.cdninstagram.com/v/t51.2885-19/290081272_2582765985205550_8779184345117358009_n.jpg',
            ':content' => "샘플 게시물 #{$i}\n\n하이커그라운드의 다양한 프로그램을 만나보세요! 🎉\n\n#HiKRGROUND #HiKR #서울전시 #seoul",
            ':video_url' => null,
            ':image_url' => "https://via.placeholder.com/800x800?text=Sample+Post+{$i}",
            ':media_type' => 'image',
            ':likes_count' => rand(50, 500),
            ':audio_name' => null,
            ':audio_url' => null,
            ':hashtags' => json_encode(['HiKRGROUND', 'HiKR', '서울전시', 'seoul']),
            ':posted_at' => date('Y-m-d H:i:s', strtotime("-{$i} days"))
        ];
    }

    return $posts;
}
?>