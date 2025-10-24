'use strict';

// 기본 경로 설정
const BASE_PATH = '/hikr';

$(document).ready(function() {
    // Offcanvas를 애니메이션 없이 먼저 열기 (1200px 이상에서만)
    initOffcanvas();

    // 페이지 라우팅 초기화
    initRouting();

    // 메뉴 클릭 이벤트 바인딩
    bindMenuEvents();

    // 화면 높이 적용 함수
    applyScreenHeight();

    $(window).resize(function() {
        applyScreenHeight();
        handleOffcanvasResize();
    });

    // 슬라이드 초기화 (부드러운 fade 효과)
    if ($('.cover-slide').length) {
        $('.cover-slide').slick({
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
        });
    }
});

/**
 * 기본 경로를 가져오는 함수
 * 현재 URL에서 기본 경로를 자동으로 감지합니다
 */
function getBasePath() {
    const path = window.location.pathname;
    // /hikr/로 시작하면 /hikr를 기본 경로로 사용
    if (path.startsWith('/hikr')) {
        return '/hikr';
    }
    return '';
}

/**
 * 화면 높이 적용 함수
 * 메인 페이지와 슬라이드 높이를 뷰포트에 맞춥니다
 */
function applyScreenHeight() {
    const viewportHeight = $(window).height();
    $('#main, .slick-slide, .cover-slide .item').height(viewportHeight);
}

/**
 * Offcanvas 초기화 함수
 * 1200px 이상 화면에서만 페이지 로딩 시 offcanvas를 애니메이션 없이 열린 상태로 표시합니다
 */
function initOffcanvas() {
    const offcanvasElement = $('#offcanvasGnb');

    if (offcanvasElement.length) {
        if ($(window).width() >= 1200) {
            offcanvasElement.addClass('no-transition');
            offcanvasElement.addClass('show');

            setTimeout(function() {
                offcanvasElement.removeClass('no-transition');
            }, 50);
        }
    }
}

/**
 * 화면 크기 변경 시 Offcanvas 표시 상태 제어 함수
 * 1200px 이상에서는 항상 열린 상태를 유지하고 1200px 미만에서는 닫힌 상태로 변경합니다
 */
function handleOffcanvasResize() {
    const offcanvasElement = $('#offcanvasGnb');
    const windowWidth = $(window).width();

    if (offcanvasElement.length) {
        if (windowWidth >= 1200) {
            if (!offcanvasElement.hasClass('show')) {
                offcanvasElement.addClass('no-transition');
                offcanvasElement.addClass('show');
                setTimeout(function() {
                    offcanvasElement.removeClass('no-transition');
                }, 50);
            }
        } else {
            if (offcanvasElement.hasClass('show')) {
                offcanvasElement.removeClass('show');
            }
        }
    }
}

/**
 * 페이지 라우팅 초기화 함수
 * URL에 따라 적절한 페이지를 표시합니다
 */
function initRouting() {
    const basePath = getBasePath();
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');

    console.log('Init routing - basePath:', basePath, 'path:', path, 'hash:', hash);

    if (hash) {
        showPage(hash, false);
    } else if (path === basePath + '/introduce' || path === basePath + '/introduce/') {
        showPage('introduce', false);
    } else if (path === basePath + '/visit' || path === basePath + '/visit/') {
        showPage('visit', false);
    } else {
        showPage('main', false);
    }

    // 브라우저 뒤로가기/앞으로가기 처리
    $(window).on('popstate', function(event) {
        const state = event.originalEvent.state;
        console.log('Popstate event:', state);

        if (state && state.page) {
            showPage(state.page, false);
        } else {
            const currentPath = window.location.pathname;
            const currentBasePath = getBasePath();

            if (currentPath === currentBasePath + '/introduce' || currentPath === currentBasePath + '/introduce/') {
                showPage('introduce', false);
            } else if (currentPath === currentBasePath + '/visit' || currentPath === currentBasePath + '/visit/') {
                showPage('visit', false);
            } else {
                showPage('main', false);
            }
        }
    });
}

/**
 * 메뉴 클릭 이벤트 바인딩 함수
 * 메뉴 항목 클릭 시 페이지 전환을 처리합니다
 */
function bindMenuEvents() {
    // 내부 메뉴 링크 클릭 (data-page 속성이 있는 링크)
    $(document).on('click', '.menu-link', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        console.log('Menu link clicked:', page);
        if (page) {
            navigateToPage(page);
        }
    });

    // 로고 클릭 (홈으로) - 모든 header 내의 로고 링크
    $(document).on('click', 'header a[href="/"], header a[href="/hikr/"], header a[href="/hikr"]', function(e) {
        e.preventDefault();
        console.log('Logo clicked');
        navigateToPage('main');
    });

    // HOME 버튼 클릭
    $(document).on('click', 'a[href*="intro.php"]', function(e) {
        e.preventDefault();
        console.log('Home button clicked');
        navigateToPage('main');
    });
}

/**
 * 페이지 네비게이션 함수
 * 지정된 페이지로 이동하고 URL을 업데이트합니다
 */
function navigateToPage(page) {
    const basePath = getBasePath();
    const url = page === 'main' ? basePath + '/' : basePath + '/' + page;
    console.log('Navigate to page:', page, 'url:', url);
    showPage(page, true, url);
}

/**
 * 페이지 표시 함수
 * 지정된 페이지를 표시하고 다른 페이지는 숨깁니다
 */
function showPage(page, updateHistory = false, url = null) {
    console.log('Show page:', page, 'updateHistory:', updateHistory, 'url:', url);

    // 모든 main 섹션 숨기기
    $('main[id]').hide();

    // 선택된 페이지만 표시
    const targetPage = $('#' + page);
    console.log('Target page:', page, 'found:', targetPage.length);

    if (targetPage.length) {
        targetPage.show();

        if (updateHistory) {
            const basePath = getBasePath();
            const finalUrl = url || (page === 'main' ? basePath + '/' : basePath + '/' + page);
            history.pushState({ page: page }, '', finalUrl);
            console.log('History updated:', finalUrl);
        }
    } else {
        // 페이지를 찾지 못한 경우 메인 페이지 표시
        console.log('Page not found, showing main');
        $('#main').show();
        if (updateHistory) {
            const basePath = getBasePath();
            history.pushState({ page: 'main' }, '', basePath + '/');
        }
    }

    // 모바일에서 메뉴 클릭 시 offcanvas 닫기
    if ($(window).width() < 1200) {
        const offcanvasEl = document.getElementById('offcanvasGnb');
        if (offcanvasEl) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (offcanvas) {
                offcanvas.hide();
            }
        }
    }

    // 페이지 전환 후 스크롤을 최상단으로
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 100);
}