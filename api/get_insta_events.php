<?php
header('Content-Type: application/json');


// accounts?fields=instagram_business_account{id,username},name

// 앱아이디 - 681385368356155
// 시크릿 - a6166f855616b3f5c7c6830f374c9b77
// 단기 - EAAJrt2TWBTsBPxs0tZBxm2hgEW3fbVYdOti91M611rvmqEajZBrYsjWIKe3DmUYVXmVn2VsAsZCrZBkMmvYvAaxMpjZBsZCYlUdQKkfZCosIyY555al07ZBVscQ0QDKyaEb2TminC1H38r3PcgX1RJP3xKQwxcmzGjUJhyhtBEQco0tlnMR2LGbA5ZBl1wE7ZA5WqFNlqeF0JbGaZBoVKIW2A5qfo2ZBZBZBuZCws7R
// 1. 설정: 발급받은 액세스 토큰과 인스타그램 사용자 ID를 입력하세요.
// 인스타그램 사용자 ID는 API를 통해 얻을 수 있습니다.
$accessToken = 'EAAJrt2TWBTsBPxpouoXT8XhGajt4NVNSMjVs84JXWoiDSs6sui0ZCNUzjKZBYcGeUP1lybzx2m8NnqutFbKxvG9ObLEjDLVHHOFDZCWAWkhZCKgDGQtAI01MmFuosaHCdaPZAxRjwHojBf4Klsa7X4RmY2STcemtp2Yie31bEeUDnBjq6AnHnUjAgg0oApEcVplpsYvNOIgZAB22AvMQWN1Ufo0aTgM97PbAZDZD'; // 여기에 발급받은 장기 액세스 토큰을 입력하세요.
$userId = '122104135173076394'; // webhows 계정의 인스타그램 사용자 ID
$hashtag = '#이벤트';

// 2. API 요청 URL 생성
// 가져올 필드: 캡션(caption), 미디어 URL(media_url), 게시물 링크(permalink), 썸네일(thumbnail_url), 타임스탬프(timestamp) 등
$fields = "media_url,media_type,caption,permalink,thumbnail_url,timestamp";
$url = "https://graph.instagram.com/{$userId}/media?fields={$fields}&access_token={$accessToken}";

// 3. cURL을 사용해 API 호출
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$eventPosts = [];

// 4. 응답 데이터 필터링
if (isset($data['data'])) {
    foreach ($data['data'] as $post) {
        // 캡션에 '#이벤트' 해시태그가 포함된 게시물만 필터링
        if (isset($post['caption']) && strpos($post['caption'], $hashtag) !== false) {
            // 동영상인 경우 썸네일 이미지를 사용
            if ($post['media_type'] === 'VIDEO') {
                $post['media_url'] = $post['thumbnail_url'];
            }
            $eventPosts[] = $post;
        }
    }
}

// 5. 필터링된 결과를 JSON으로 출력
echo json_encode($eventPosts);
?>