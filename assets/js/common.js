'use strict';

/**
 * Instagram Feed API를 사용하여 공지사항 표시
 * common.js 파일의 loadInstagramEvents() 함수를 이것으로 대체하거나
 * 별도로 호출하여 공지사항 섹션을 채웁니다
 */

/**
 * API에서 인스타그램 게시물을 가져와 공지사항으로 표시
 */
async function loadNoticeFromAPI() {
    try {
        // API에서 최신 게시물 12개 가져오기 (공지사항 그리드에 맞춤)
        const response = await fetch('./api/api_feed.php?page=1&limit=12&sort=latest');

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
    posts.forEach((post, index) => {
        const card = createNoticeCard(post, index);
        $noticeContainer.append(card);
    });

    console.log(`${posts.length}개의 공지사항이 로드되었습니다.`);
}

/**
 * 개별 공지사항 카드 HTML 생성
 */
function createNoticeCard(post, index) {
    // 이미지 URL 결정 (이미지 또는 비디오 썸네일)
    const imageUrl = post.image_url || post.video_url || './assets/img/tmp_notice_01.png';

    // 제목 추출 (content의 첫 줄 또는 첫 50자)
    let title = post.content ? post.content.split('\n')[0] : '공지사항';
    if (title.length > 50) {
        title = title.substring(0, 50) + '...';
    }

    // 날짜 포맷팅
    const postDate = formatNoticeDate(post.posted_at);

    // 카드 HTML 생성
    const cardHtml = `
        <div class="col-6 col-xl-3">
            <div class="card h-100 notice-card api-notice" 
                 data-post-id="${post.post_id}" 
                 data-post-url="${post.post_url}"
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

    return cardHtml;
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
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
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
            <i class="bi bi-inbox" style="font-size: 48px; color: #ccc;"></i>
            <p class="mt-3 text-muted">등록된 공지사항이 없습니다.</p>
        </div>
    `);
}

/**
 * 에러 표시
 */
function displayNoticeError(errorMessage) {
    const $noticeContainer = $('#notice .row.g-4.my-5');

    $noticeContainer.html(`
        <div class="col-12">
            <div class="alert alert-warning" role="alert">
                <i class="bi bi-exclamation-triangle"></i>
                공지사항을 불러오는 중 오류가 발생했습니다.
                <br>
                <small>${escapeHtml(errorMessage)}</small>
            </div>
        </div>
    `);
}

/**
 * API 공지사항 카드 클릭 이벤트 바인딩
 */
function bindAPINoticeClickEvents() {
    $(document).on('click', '.api-notice', function(e) {
        e.preventDefault();

        const postUrl = $(this).data('post-url');
        const postId = $(this).data('post-id');

        if (postUrl) {
            // 인스타그램 게시물을 새 창에서 열기
            window.open(postUrl, '_blank');
        } else {
            console.warn('게시물 URL을 찾을 수 없습니다:', postId);
        }
    });
}

/**
 * 페이지 로드 시 공지사항 초기화
 * 이 함수를 $(document).ready() 안에서 호출하세요
 */
function initializeNoticeSection() {
    // API에서 공지사항 로드
    loadNoticeFromAPI();

    // 클릭 이벤트 바인딩
    bindAPINoticeClickEvents();
}

$(function() {
    // 페이지 로드 완료 시 스피너 제거
    hidePageLoader();

    // AOS 초기화 및 SimpleBar 연동
    initAOS();

    // Offcanvas 초기화
    initOffcanvas();

    // 페이지 라우팅 초기화
    initRouting();

    // 메뉴 이벤트 바인딩
    bindMenuEvents();



    // 화면 크기 변경에 따른 이벤트 처리
    $(window).on('resize', function() {
        applyScreenHeight();
        handleOffcanvasResize();
        AOS.refresh();
    }).trigger('resize');

    // 슬라이드 초기화
    initSlide();

    // 인스타그램 이벤트 로드
    // loadInstagramEvents();

    // 인트로 섹션 레이아웃 업데이트
    handleIntroLayout();
});

/**
 * 페이지 로더 숨김 함수
 */
function hidePageLoader() {
    const $loader = $('#pageLoader');
    if ($loader.length) {
        $loader.addClass('fade-out');
        setTimeout(function() {
            $loader.remove();
        }, 300);
    }
}



/**
 * 슬라이드 초기화 함수
 */
function initSlide() {
    const slickOptions = {
        dots: true,
        infinite: true,
        speed: 1500,
        fade: true,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: 'ease',
        pauseOnHover: false,
        pauseOnFocus: false,
        waitForAnimate: true
    };

    const $coverSlide = $('.cover-slide');
    if ($coverSlide.length && !$coverSlide.hasClass('slick-initialized')) {
        $coverSlide.slick(slickOptions);
    }

    const programSliderOptions = {
        dots: true,
        infinite: true,
        speed: 500,
        arrows: true,
        prevArrow: '<button type="button" class="slick-prev"></button>',
        nextArrow: '<button type="button" class="slick-next"></button>',
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: 'ease-in-out'
    };

    const $mobileSlider = $('.v2-cards-mobile-slider');
    if ($mobileSlider.length && !$mobileSlider.hasClass('slick-initialized')) {
        $mobileSlider.slick($.extend({}, programSliderOptions, { arrows: false }));
    }

    const $cardsSlider = $('.v2-cards-slider');
    if ($cardsSlider.length && !$cardsSlider.hasClass('slick-initialized')) {
        $cardsSlider.slick($.extend({}, programSliderOptions, {
            arrows: true,
            prevArrow: '<button type="button" class="slick-prev v2-cards-prev"></button>',
            nextArrow: '<button type="button" class="slick-next v2-cards-next"></button>'
        }));
    }
}

/**
 * 메인 슬라이더 재초기화 함수
 */
function reinitializeMainSlider() {
    const $coverSlide = $('.cover-slide');

    // 기존 슬라이더가 초기화되어 있으면 제거
    if ($coverSlide.hasClass('slick-initialized')) {
        $coverSlide.slick('unslick');
    }

    // 슬라이더 재초기화
    const slickOptions = {
        dots: true,
        infinite: true,
        speed: 1500,
        fade: true,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: 'ease',
        pauseOnHover: false,
        pauseOnFocus: false,
        waitForAnimate: true
    };

    if ($coverSlide.length) {
        $coverSlide.slick(slickOptions);
    }
}

/**
 * 화면 높이를 뷰포트에 맞게 적용하는 함수
 */
function applyScreenHeight() {
    const viewportHeight = $(window).height();
    $('#main, .cover-slide .item, .main-bg, .main-bg-img, #main_station, .station-cover').height(viewportHeight);
}

/**
 * Offcanvas 초기화 함수 (1200px 이상에서)
 */
function initOffcanvas() {
    const windowWidth = $(window).width();
    const $offcanvasGnb = $('#offcanvasGnb');

    if (windowWidth >= 1200) {
        $offcanvasGnb.removeAttr('style').addClass('no-transition show');
        setTimeout(() => $offcanvasGnb.removeClass('no-transition'), 50);
    }
}

/**
 * 화면 크기 변경 시 Offcanvas 상태 제어 함수
 */
function handleOffcanvasResize() {
    const windowWidth = $(window).width();
    const $offcanvasGnb = $('#offcanvasGnb');

    if (windowWidth >= 1200) {
        if (!$offcanvasGnb.hasClass('show')) {
            $offcanvasGnb.removeAttr('style').addClass('no-transition show');
            setTimeout(() => $offcanvasGnb.removeClass('no-transition'), 50);
        }
    } else {
        $offcanvasGnb.removeClass('show');
    }
}

/**
 * 페이지 라우팅 초기화 함수
 */
function initRouting() {
    const hash = window.location.hash.replace('#', '');
    showPage(hash || 'main');

    $(window).on('hashchange', function() {
        const currentHash = window.location.hash.replace('#', '');
        showPage(currentHash || 'main');
    });
}

/**
 * 메뉴 이벤트 바인딩 함수
 */
function bindMenuEvents() {
    $(document).on('click', '.menu-link', function(e) {
        e.preventDefault();
        navigateToPage($(this).data('page'));
    });

    $(document).on('click', 'header a[href="/"], header a[href="/hikr/"], header a[href="/hikr"], a[href*="intro.php"]', function(e) {
        e.preventDefault();
        navigateToPage('main');
    });
}

/**
 * 페이지 네비게이션 함수
 */
function navigateToPage(page) {
    const hash = page === 'main' ? '' : '#' + page;
    if (window.location.hash !== hash) {
        window.location.hash = hash;
    } else if (!hash) {
        history.pushState(null, '', window.location.pathname);
        showPage('main');
    }
}




/**
 * 페이지 표시 함수
 */
function showPage(page) {
    $('main[id]').hide();
    const $targetPage = $('#' + page);

    if ($targetPage.length) {
        $targetPage.show();
    } else {
        $('#main').show();
    }

    toggleOffcanvas(page);

    // wrapper에 페이지별 클래스 추가
    updateWrapperClass(page);

    // main 페이지로 이동 시 슬라이더 재초기화
    if (page === 'main') {
        setTimeout(function() {
            reinitializeMainSlider();
        }, 100);
    } else if (page === 'regular_program') {
        setTimeout(initSlide, 100);
    }

    if ($(window).width() < 1200) {
        const offcanvas = bootstrap.Offcanvas.getInstance($('#offcanvasGnb').get(0));
        if (offcanvas) {
            offcanvas.hide();
        }
    }

    setTimeout(() => {
        $('.scrollable-container .simplebar-content-wrapper').scrollTop(0);
        AOS.refresh();
    }, 100);
}

/**
 * wrapper 클래스 업데이트 함수
 * 페이지별로 wrapper에 적절한 클래스를 추가합니다
 */
function updateWrapperClass(page) {
    const $wrapper = $('#wrapper');

    // 기존 페이지 클래스 제거
    $wrapper.removeClass('intro-wrap main-wrap sub-wrap');

    // 페이지별 클래스 추가
    if (page === 'intro') {
        $wrapper.addClass('intro-wrap');
    } else if (page === 'main' || page === 'main_station') {
        $wrapper.addClass('main-wrap');
    } else {
        $wrapper.addClass('sub-wrap');
    }
}

/**
 * 공지사항 모달 표시 함수
 */
function showNoticeModal(title, date, content, imageUrl) {
    $('#noticeModalLabel').text(title);
    $('#noticeModalDate').text(date);

    let modalContent = '';
    modalContent += '<div class="row">';
    if (imageUrl) {
        modalContent += `<div class="col-12 col-lg-6"><img src="${imageUrl}" style="width: 100%; max-width: 100%; height: auto; margin-bottom: 1rem;" alt="${title}" onerror="this.style.display='none'"></div>`;
    }
    modalContent += `<div class="col-12 col-lg-6"><div style="height: 80vh; overflow-y: auto;">${content}</div></div>`;
    modalContent += `</div>`;

    $('#noticeModalContent').html(modalContent);



    const modal = new bootstrap.Modal($('#noticeModal')[0]);
    modal.show();
}


/**
 * Offcanvas 전환 함수
 */
function toggleOffcanvas(page) {
    const stationPages = ['main_station', 'station_notice', 'station_qna', 'station_event', 'station_about', 'station_visit'];
    const $offcanvasGnb = $('#offcanvasGnb');
    const $gnbGround = $('.gnb-ground');
    const $gnbStation = $('.gnb-station');
    const $logoStation = $('.logo-station');
    const $logoGround = $('.logo-ground');

    if ($(window).width() >= 1200) {
        $offcanvasGnb.addClass('no-transition show');
        setTimeout(() => $offcanvasGnb.removeClass('no-transition'), 50);
    }

    if (stationPages.includes(page)) {
        $gnbGround.css('display', 'none');
        $gnbStation.css('display', 'block');
        $logoStation.css('display', 'block');
        $logoGround.css('display', 'none');
    } else {
        $gnbGround.css('display', 'block');
        $gnbStation.css('display', 'none');
        $logoStation.css('display', 'none');
        $logoGround.css('display', 'block');
    }
}


/* Bootstrap Offcanvas를 초기화하는 함수 (추가됨)
* Bootstrap JS가 로드되면 기본 기능은 Data API로 동작하지만,
* 함수 정의가 누락된 오류를 해결하기 위해 빈 함수로 추가합니다.
*/
function initOffcanvas() {
    // 여기에 Offcanvas 관련 추가적인 자바스크립트 로직을 구현할 수 있습니다.
    // 예: 특정 Offcanvas 이벤트 리스너 등록

    // 기본 Bootstrap Offcanvas 기능은 data-bs-toggle="offcanvas" 속성으로 작동합니다.
    // 현재 코드에서는 오류 해결을 위해 함수만 정의합니다.
    console.log('Offcanvas initialized (via function definition).');
}

/**
 * 인트로 섹션 레이아웃 처리 함수
 */
function handleIntroLayout() {
    const $leftSection = $('.item--left');
    const $rightSection = $('.item--right');
    let isLeftHovered = false;
    let isRightHovered = false;

    function isMobile() {
        return $(window).width() <= 1000;
    }

    function updateLayout() {
        if (isMobile()) {
            $leftSection.add($rightSection).removeAttr('style');
            return;
        }

        if (isLeftHovered) {
            $leftSection.css({ width: '85%', clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)', zIndex: 5 });
            $rightSection.css({ width: '40%', right: 0, clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)', zIndex: 1 });
        } else if (isRightHovered) {
            $rightSection.css({ width: '85%', right: 0, clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)', zIndex: 5 });
            $leftSection.css({ width: '40%', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)', zIndex: 1 });
        } else {
            $leftSection.css({ width: '60%', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)', zIndex: 1 });
            $rightSection.css({ width: '60%', clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)', zIndex: 1 });
        }
    }

    $leftSection.on('mouseenter mouseleave', function(e) {
        if (isMobile()) return;
        isLeftHovered = e.type === 'mouseenter';
        updateLayout();
    });

    $rightSection.on('mouseenter mouseleave', function(e) {
        if (isMobile()) return;
        isRightHovered = e.type === 'mouseenter';
        updateLayout();
    });

    $(window).on('resize', updateLayout).trigger('resize');
}


/**
 * AOS 초기화 및 SimpleBar 스크롤 이벤트 연동 함수 (대안)
 */
function initAOS() {
    AOS.init({
        startEvent: 'load',
        offset: 120,
        duration: 800,
        easing: 'ease',
        once: false,
        mirror: false
    });

    // SimpleBar의 실제 스크롤 컨테이너를 직접 찾기
    const simplebarContent = document.querySelector('.scrollable-container .simplebar-content-wrapper');

    if (simplebarContent) {
        simplebarContent.addEventListener('scroll', function() {
            AOS.refresh();
        });

        // console.log('AOS와 SimpleBar 스크롤 연동 완료');
    } else {
        console.warn('SimpleBar 스크롤 컨테이너를 찾을 수 없습니다');
    }
}