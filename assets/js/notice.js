'use strict';

$(function() {
    const noticeSectionId = '#notice';
    let noticeLoaded = false;

    // This function will be called when the notice page is shown
    function initializeNoticeSection() {
        if (noticeLoaded) {
            // return;
        }
        loadNoticeFromAPI();
        bindAPINoticeClickEvents();
        noticeLoaded = true;
    }

    // Function to check hash and load notices
    function checkHashAndLoadNotice() {
        if (window.location.hash === noticeSectionId) {
            initializeNoticeSection();
        }
    }

    // Initial check on page load
    checkHashAndLoadNotice();

    // Listen for hash changes
    $(window).on('hashchange', checkHashAndLoadNotice);

    /**
     * API에서 인스타그램 게시물을 가져와 공지사항으로 표시
     */
    async function loadNoticeFromAPI() {
        try {
            // API에서 최신 게시물 16개 가져오기
            const response = await fetch('./api/get_posts.php?page=1&limit=16');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success || !result.data || !result.data.posts) {
                throw new Error('API 응답 형식이 올바르지 않습니다.');
            }

            const posts = result.data.posts;

            if (posts.length === 0) {
                displayNoNotices();
                return;
            }

            displayNoticeCards(posts);

        } catch (error) {
            console.error('공지사항 로드 실패:', error);
            displayNoticeError(error.message);
        }
    }

    /**
     * 공지사항 카드를 화면에 표시
     */
    function displayNoticeCards(posts) {
        // 공지사항 컨테이너 찾기
        const $noticeContainer = $('#notice .row.g-4.my-5');

        if (!$noticeContainer.length) {
            console.error('공지사항 컨테이너를 찾을 수 없습니다.');
            return;
        }

        // 기존 내용 제거
        $noticeContainer.empty();

        // 각 게시물을 카드로 생성
        posts.forEach((post) => {
            const card = createNoticeCard(post);
            $noticeContainer.append(card);
        });

        console.log(`${posts.length}개의 공지사항이 로드되었습니다.`);
    }

    /**
     * 개별 공지사항 카드 HTML 생성
     */
    function createNoticeCard(post) {
        const imageUrl = post.image_url || './assets/img/tmp_notice_01.png';

        let title = '공지사항';
        if (post.content) {
            const lines = post.content.split('\n').filter(line => line.trim() !== '');
            if(lines.length > 0) {
                title = lines[0];
            }
        }

        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }

        const postDate = formatNoticeDate(post.posted_at);

        // 카드 HTML 생성
        return `
            <div class="col-6 col-xl-3">
                <div class="card h-100 notice-card api-notice" 
                     data-title="${escapeHtml(title)}"
                     data-date="${postDate}"
                     data-content="${escapeHtml(post.content)}"
                     style="cursor: pointer;">
                    <img src="${imageUrl}" 
                         class="card-img" 
                         alt="${escapeHtml(title)}"
                         onerror="this.src='./assets/img/tmp_notice_01.png'">
                    <div class="card-img-overlay d-flex flex-column justify-content-end">
                        <div class="notice-overlay-gradient"></div>
                        <div class="notice-content">
                            <div class="d-flex justify-content-start align-items-center">
                                <h5 class="card-title text-white">${escapeHtml(title)}</h5>
                            </div>
                            <small class="text-white">${postDate}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 날짜 포맷팅 함수
     */
    function formatNoticeDate(dateString) {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch (e) {
            return dateString;
        }
    }

    /**
     * HTML 이스케이프 함수
     */
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * 공지사항이 없을 때 표시
     */
    function displayNoNotices() {
        const $noticeContainer = $('#notice .row.g-4.my-5');
        $noticeContainer.html(`
            <div class="col-12 text-center py-5">
                <p class="mt-3 text-muted">등록된 공지사항이 없습니다.</p>
            </div>`);
    }

    /**
     * 에러 표시
     */
    function displayNoticeError(errorMessage) {
        const $noticeContainer = $('#notice .row.g-4.my-5');
        $noticeContainer.html(`
            <div class="col-12">
                <div class="alert alert-warning" role="alert">
                    공지사항을 불러오는 중 오류가 발생했습니다.
                    <br>
                    <small>${escapeHtml(errorMessage)}</small>
                </div>
            </div>`);
    }

    /**
     * API 공지사항 카드 클릭 이벤트 바인딩
     */
    function bindAPINoticeClickEvents() {
        $(document).off('click', '.api-notice').on('click', '.api-notice', function() {
            const title = $(this).data('title');
            const date = $(this).data('date');
            const content = $(this).data('content');

            showNoticeModal(title, date, content);
        });
    }
});