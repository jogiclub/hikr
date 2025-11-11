<?php
// 데이터베이스 연결 설정
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '!inpion00');
define('DB_NAME', 'hikr_instagram');
define('DB_CHARSET', 'utf8mb4');

// 데이터베이스 연결 클래스
class Database {
    private $conn = null;

    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("데이터베이스 연결 실패: " . $e->getMessage());
        }
    }

    public function getConnection() {
        return $this->conn;
    }

    // 게시물 목록 조회
    public function getPosts($limit = 20, $offset = 0) {
        $sql = "SELECT * FROM instagram_posts 
                WHERE is_active = 1 
                ORDER BY posted_at DESC, id DESC 
                LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // 전체 게시물 수 조회
    public function getTotalPostsCount() {
        $sql = "SELECT COUNT(*) as total FROM instagram_posts WHERE is_active = 1";
        $stmt = $this->conn->query($sql);
        $row = $stmt->fetch();
        return $row['total'];
    }

    // 게시물 저장 또는 업데이트
    public function savePost($data) {
        $sql = "INSERT INTO instagram_posts 
                (post_url, post_id, username, profile_image, content, video_url, 
                 image_url, media_type, likes_count, audio_name, audio_url, 
                 hashtags, posted_at) 
                VALUES 
                (:post_url, :post_id, :username, :profile_image, :content, :video_url, 
                 :image_url, :media_type, :likes_count, :audio_name, :audio_url, 
                 :hashtags, :posted_at)
                ON DUPLICATE KEY UPDATE
                content = VALUES(content),
                likes_count = VALUES(likes_count),
                updated_at = CURRENT_TIMESTAMP";

        $stmt = $this->conn->prepare($sql);
        return $stmt->execute($data);
    }

    // 크롤링 로그 저장
    public function saveCrawlingLog($username, $status, $posts_count = 0, $error_message = '') {
        $sql = "INSERT INTO crawling_logs 
                (username, status, posts_count, error_message, finished_at) 
                VALUES 
                (:username, :status, :posts_count, :error_message, NOW())";

        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':username' => $username,
            ':status' => $status,
            ':posts_count' => $posts_count,
            ':error_message' => $error_message
        ]);
    }
}
?>