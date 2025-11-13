// app.js - Instagram Feed Application

let currentPage = 1;
let totalPages = 1;
const postsPerPage = 10;

// 기본 이미지들
const defaultProfileImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2U1ZTVlNSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTYiIHI9IjYiIGZpbGw9IiM5OTk5OTkiLz48cGF0aCBkPSJNIDggMzAgQyA4IDI0IDEyIDIwIDIwIDIwIEMgMjggMjAgMzIgMjQgMzIgMzAiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=';
const defaultPostImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

// 페이지 로드 시 실행
$(document).ready(function() {
    loadPosts();

    // 현재 시간을 datetime-local 입력에 설정
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    $('input[name="posted_at"]').val(now.toISOString().slice(0, 16));
});

// 게시물 목록 불러오기
function loadPosts(page = 1) {
    currentPage = page;

    $.ajax({
        url: './get_posts.php',
        method: 'GET',
        data: { page: page, limit: postsPerPage },
        dataType: 'json',
        beforeSend: function() {
            $('#postsContainer').html(`
                <div class="loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">로딩중...</span>
                    </div>
                </div>
            `);
        },
        success: function(response) {
            if (response.success) {
                displayPosts(response.data.posts);
                displayPagination(response.data.pagination);
                $('#totalPosts').text(response.data.pagination.total);
            } else {
                showError(response.message || '데이터를 불러올 수 없습니다.');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error:', status, error);
            console.error('Response:', xhr.responseText);
            showError('게시물을 불러오는데 실패했습니다.');
        }
    });
}

// 게시물 표시
function displayPosts(posts) {
    if (!posts || posts.length === 0) {
        $('#postsContainer').html(`
            <div class="no-posts">
                <i class="bi bi-inbox" style="font-size: 48px;"></i>
                <p class="mt-3">게시물이 없습니다.</p>
                <button class="btn btn-primary mt-2" onclick="openCrawlModal()">
                    <i class="bi bi-arrow-clockwise"></i> 크롤링 시작
                </button>
            </div>
        `);
        return;
    }

    let html = '';
    posts.forEach(post => {
        html += createPostCard(post);
    });

    $('#postsContainer').html(html);
}

// 게시물 카드 생성
function createPostCard(post) {
    const mediaHtml = getMediaHtml(post);
    const content = formatContent(post.content);
    const audioHtml = post.audio_name ? `
        <div class="audio-info">
            <i class="bi bi-music-note-beamed"></i>
            <strong>${escapeHtml(post.audio_name)}</strong>
        </div>
    ` : '';

    const profileImg = post.profile_image || defaultProfileImg;
    const username = escapeHtml(post.username || 'unknown');

    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${profileImg}" alt="${username}"
                     onerror="this.src='${defaultProfileImg}'">
                <a href="https://www.instagram.com/${username}/"
                   class="username" target="_blank">${username}</a>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditModal(${post.id})" title="수정">
                        <i class="bi bi-pencil"></i> 수정
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})" title="삭제">
                        <i class="bi bi-trash"></i> 삭제
                    </button>
                </div>
            </div>

            <div class="row g-0">
                <div class="col-md-5">
                    <div class="post-media">
                        ${mediaHtml}
                    </div>
                </div>

                <div class="col-md-7">
                    <div class="p-3">
                        <div class="post-likes mb-2">
                            <i class="bi bi-heart-fill text-danger"></i> 좋아요 ${post.likes_count || 0}개
                        </div>

                        <div class="post-content" style="max-height: 400px; overflow-y: auto;">
                            <a href="https://www.instagram.com/${username}/" 
                               class="username" target="_blank">${username}</a>
                            ${content}
                        </div>

                        ${audioHtml}

                        <div class="post-date mt-3">
                            ${formatDate(post.posted_at)}
                            <a href="${post.post_url}" target="_blank" class="ms-2">
                                <i class="bi bi-box-arrow-up-right"></i> 원본 보기
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 미디어 HTML 생성
function getMediaHtml(post) {
    if (post.media_type === 'video' && post.video_url) {
        return `
            <div style="position: relative;">
                <video controls style="width: 100%; display: block;">
                    <source src="${post.video_url}" type="video/mp4">
                    브라우저가 비디오를 지원하지 않습니다.
                </video>
                <div class="video-indicator">
                    <i class="bi bi-play-circle-fill"></i> VIDEO
                </div>
            </div>
        `;
    } else if (post.image_url) {
        return `<img src="${post.image_url}" alt="Post image" style="width: 100%; display: block;"
                     onerror="this.src='${defaultPostImg}'">`;
    } else {
        return `<img src="${defaultPostImg}" alt="No image" style="width: 100%; display: block;">`;
    }
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 내용 포맷팅
function formatContent(content) {
    if (!content) return '';
    content = escapeHtml(content);
    content = content.replace(/\n/g, '<br>');
    content = content.replace(/#([^\s#<]+)/g,
        '<a href="https://www.instagram.com/explore/tags/$1/" class="hashtag" target="_blank">#$1</a>');
    return content;
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR');
}

// 페이지네이션 표시
function displayPagination(pagination) {
    totalPages = pagination.totalPages;

    if (totalPages <= 1) {
        $('#paginationContainer').html('');
        return;
    }

    let html = '<nav><ul class="pagination">';

    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadPosts(${currentPage - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="loadPosts(${i}); return false;">${i}</a>
            </li>
        `;
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadPosts(${currentPage + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;

    html += '</ul></nav>';
    $('#paginationContainer').html(html);
    $('html, body').animate({ scrollTop: 0 }, 300);
}

// 크롤링 모달 열기
function openCrawlModal() {
    const modal = new bootstrap.Modal(document.getElementById('crawlModal'));
    modal.show();
    $('#crawlProgress').addClass('d-none');
}

// 수동추가 모달 열기
function openManualAddModal() {
    const modal = new bootstrap.Modal(document.getElementById('manualAddModal'));
    modal.show();
    $('#manualAddProgress').addClass('d-none');
    $('#manualAddForm')[0].reset();

    // 현재 시간 설정
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    $('#manualAddForm input[name="posted_at"]').val(now.toISOString().slice(0, 16));
}

// 수정 모달 열기
function openEditModal(postId) {
    $.ajax({
        url: './get_posts.php',
        method: 'GET',
        data: { page: 1, limit: 10000 },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const post = response.data.posts.find(p => p.id === postId);
                if (post) {
                    fillEditForm(post);
                    const modal = new bootstrap.Modal(document.getElementById('editModal'));
                    modal.show();
                }
            }
        },
        error: function() {
            alert('게시물 정보를 불러오는데 실패했습니다.');
        }
    });
}

// 수정 폼 채우기
function fillEditForm(post) {
    $('#edit_id').val(post.id);
    $('#edit_post_url').val(post.post_url || '');
    $('#edit_post_id').val(post.post_id || '');
    $('#edit_username').val(post.username || '');
    $('#edit_profile_image').val(post.profile_image || '');
    $('#edit_content').val(post.content || '');
    $('#edit_image_url').val(post.image_url || '');
    $('#edit_video_url').val(post.video_url || '');
    $('#edit_media_type').val(post.media_type || 'image');
    $('#edit_likes_count').val(post.likes_count || 0);
    $('#edit_audio_name').val(post.audio_name || '');
    $('#edit_audio_url').val(post.audio_url || '');

    // 해시태그 배열을 문자열로 변환
    if (post.hashtags_array && post.hashtags_array.length > 0) {
        $('#edit_hashtags').val(post.hashtags_array.join(', '));
    } else {
        $('#edit_hashtags').val('');
    }

    // 날짜 형식 변환
    if (post.posted_at) {
        const date = new Date(post.posted_at);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        $('#edit_posted_at').val(date.toISOString().slice(0, 16));
    }
}

// 크롤링 시작
function startCrawl() {
    const username = $('#crawlUsername').val().trim();

    if (!username) {
        alert('사용자명을 입력해주세요.');
        return;
    }

    $('#crawlProgress').removeClass('d-none');

    $.ajax({
        url: './crawl.php',
        method: 'POST',
        data: { username: username },
        dataType: 'json',
        success: function(response) {
            $('#crawlProgress').addClass('d-none');

            if (response.success) {
                alert(`크롤링 완료!\n수집된 게시물: ${response.data.posts_count}개`);
                bootstrap.Modal.getInstance(document.getElementById('crawlModal')).hide();
                loadPosts(1);
            } else {
                alert('크롤링 실패: ' + response.message);
            }
        },
        error: function(xhr) {
            $('#crawlProgress').addClass('d-none');
            console.error('Crawl error:', xhr.responseText);
            alert('크롤링 중 오류가 발생했습니다.');
        }
    });
}

// 수동추가 제출
function submitManualAdd() {
    const form = $('#manualAddForm')[0];

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    $('#manualAddProgress').removeClass('d-none');

    $.ajax({
        url: './manual_add_v2.php',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(response) {
            $('#manualAddProgress').addClass('d-none');

            if (response.success) {
                alert('게시물이 추가되었습니다.');
                bootstrap.Modal.getInstance(document.getElementById('manualAddModal')).hide();
                loadPosts(1);
            } else {
                alert('추가 실패: ' + response.message);
            }
        },
        error: function(xhr) {
            $('#manualAddProgress').addClass('d-none');
            console.error('Manual add error:', xhr.responseText);

            let errorMsg = '게시물 추가 중 오류가 발생했습니다.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            }
            alert(errorMsg);
        }
    });
}

// 수정 제출
function submitEdit() {
    const form = $('#editForm')[0];

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    $('#editProgress').removeClass('d-none');

    $.ajax({
        url: './update_post.php',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        success: function(response) {
            $('#editProgress').addClass('d-none');

            if (response.success) {
                alert('게시물이 업데이트되었습니다.');
                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                loadPosts(currentPage);
            } else {
                alert('업데이트 실패: ' + response.message);
            }
        },
        error: function(xhr) {
            $('#editProgress').addClass('d-none');
            console.error('Update error:', xhr.responseText);

            let errorMsg = '게시물 업데이트 중 오류가 발생했습니다.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            }
            alert(errorMsg);
        }
    });
}

// 게시물 삭제
function deletePost(postId) {
    if (!confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
        return;
    }

    $.ajax({
        url: './delete_post.php',
        method: 'POST',
        data: { id: postId },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                alert('게시물이 삭제되었습니다.');
                loadPosts(currentPage);
            } else {
                alert('삭제 실패: ' + response.message);
            }
        },
        error: function(xhr) {
            console.error('Delete error:', xhr.responseText);

            let errorMsg = '게시물 삭제 중 오류가 발생했습니다.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            }
            alert(errorMsg);
        }
    });
}

// 에러 표시
function showError(message) {
    $('#postsContainer').html(`
        <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle"></i> ${message}
            <hr>
            <p class="mb-0">
                <small>
                    • get_posts.php 파일이 올바른 위치에 있는지 확인하세요.<br>
                    • 데이터베이스 연결을 확인하세요.<br>
                    • PHP 에러 로그를 확인하세요.
                </small>
            </p>
        </div>
    `);
}