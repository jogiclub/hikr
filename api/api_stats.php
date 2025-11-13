<?php
/**
 * Instagram Feed Statistics API
 * 게시물 통계 정보를 제공하는 API
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
    $db = new Database();
    $conn = $db->getConnection();

    // 전체 통계
    $statsSql = "SELECT 
                    COUNT(*) as total_posts,
                    SUM(CASE WHEN media_type = 'image' THEN 1 ELSE 0 END) as image_posts,
                    SUM(CASE WHEN media_type = 'video' THEN 1 ELSE 0 END) as video_posts,
                    SUM(CASE WHEN media_type = 'carousel' THEN 1 ELSE 0 END) as carousel_posts,
                    SUM(likes_count) as total_likes,
                    AVG(likes_count) as avg_likes,
                    MAX(likes_count) as max_likes,
                    MIN(posted_at) as first_post_date,
                    MAX(posted_at) as last_post_date
                FROM instagram_posts 
                WHERE is_active = 1";

    $statsStmt = $conn->query($statsSql);
    $stats = $statsStmt->fetch();

    // 사용자별 통계
    $userStatsSql = "SELECT 
                        username,
                        COUNT(*) as post_count,
                        SUM(likes_count) as total_likes,
                        AVG(likes_count) as avg_likes
                    FROM instagram_posts 
                    WHERE is_active = 1
                    GROUP BY username
                    ORDER BY post_count DESC";

    $userStatsStmt = $conn->query($userStatsSql);
    $userStats = $userStatsStmt->fetchAll();

    // 최근 게시물 (최근 10개)
    $recentSql = "SELECT 
                    post_id,
                    username,
                    media_type,
                    likes_count,
                    posted_at
                FROM instagram_posts 
                WHERE is_active = 1
                ORDER BY posted_at DESC 
                LIMIT 10";

    $recentStmt = $conn->query($recentSql);
    $recentPosts = $recentStmt->fetchAll();

    // 인기 게시물 (좋아요 기준 상위 10개)
    $popularSql = "SELECT 
                    post_id,
                    username,
                    media_type,
                    likes_count,
                    posted_at
                FROM instagram_posts 
                WHERE is_active = 1
                ORDER BY likes_count DESC 
                LIMIT 10";

    $popularStmt = $conn->query($popularSql);
    $popularPosts = $popularStmt->fetchAll();

    // 날짜별 게시물 수 (최근 30일)
    $dailySql = "SELECT 
                    DATE(posted_at) as date,
                    COUNT(*) as post_count,
                    SUM(likes_count) as total_likes
                FROM instagram_posts 
                WHERE is_active = 1 
                    AND posted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(posted_at)
                ORDER BY date DESC";

    $dailyStmt = $conn->query($dailySql);
    $dailyStats = $dailyStmt->fetchAll();

    // 해시태그 통계 (상위 20개)
    $hashtagSql = "SELECT hashtags FROM instagram_posts WHERE is_active = 1 AND hashtags IS NOT NULL";
    $hashtagStmt = $conn->query($hashtagSql);
    $allHashtags = $hashtagStmt->fetchAll();

    $hashtagCounts = [];
    foreach ($allHashtags as $row) {
        $tags = json_decode($row['hashtags'], true);
        if (is_array($tags)) {
            foreach ($tags as $tag) {
                $tag = trim($tag);
                if (!empty($tag)) {
                    $hashtagCounts[$tag] = isset($hashtagCounts[$tag]) ? $hashtagCounts[$tag] + 1 : 1;
                }
            }
        }
    }

    arsort($hashtagCounts);
    $topHashtags = array_slice($hashtagCounts, 0, 20, true);

    $hashtagStats = [];
    foreach ($topHashtags as $tag => $count) {
        $hashtagStats[] = [
            'hashtag' => $tag,
            'count' => $count
        ];
    }

    // 데이터 타입 변환
    $stats['total_posts'] = intval($stats['total_posts']);
    $stats['image_posts'] = intval($stats['image_posts']);
    $stats['video_posts'] = intval($stats['video_posts']);
    $stats['carousel_posts'] = intval($stats['carousel_posts']);
    $stats['total_likes'] = intval($stats['total_likes']);
    $stats['avg_likes'] = round(floatval($stats['avg_likes']), 2);
    $stats['max_likes'] = intval($stats['max_likes']);

    foreach ($userStats as &$user) {
        $user['post_count'] = intval($user['post_count']);
        $user['total_likes'] = intval($user['total_likes']);
        $user['avg_likes'] = round(floatval($user['avg_likes']), 2);
    }

    foreach ($recentPosts as &$post) {
        $post['likes_count'] = intval($post['likes_count']);
    }

    foreach ($popularPosts as &$post) {
        $post['likes_count'] = intval($post['likes_count']);
    }

    foreach ($dailyStats as &$day) {
        $day['post_count'] = intval($day['post_count']);
        $day['total_likes'] = intval($day['total_likes']);
    }

    // 응답 구성
    $response = [
        'success' => true,
        'data' => [
            'overview' => $stats,
            'by_user' => $userStats,
            'recent_posts' => $recentPosts,
            'popular_posts' => $popularPosts,
            'daily_stats' => $dailyStats,
            'top_hashtags' => $hashtagStats
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