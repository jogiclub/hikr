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

    // 공지사항 클릭 이벤트 바인딩
    bindNoticeEvents();

    // 화면 높이 적용 함수
    applyScreenHeight();

    $(window).resize(function() {
        applyScreenHeight();
        handleOffcanvasResize();
    });

    // 슬라이드 초기화 (부드러운 fade 효과)
    initSlide();
});

/**
 * 슬라이드 초기화 함수
 * 슬라이드를 파괴하고 다시 초기화합니다
 */
function initSlide() {
    if ($('.cover-slide').length) {
        // 기존 슬라이드가 초기화되어 있다면 파괴
        if ($('.cover-slide').hasClass('slick-initialized')) {
            $('.cover-slide').slick('unslick');
        }

        // 슬라이드 재초기화
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


    // 프로그램 슬라이드 (모바일)
    if ($('.v2-cards-mobile-slider').length) {
        // 기존 슬라이드가 초기화되어 있다면 파괴
        if ($('.v2-cards-mobile-slider').hasClass('slick-initialized')) {
            $('.v2-cards-mobile-slider').slick('unslick');
        }

        // 슬라이드 재초기화
        $('.v2-cards-mobile-slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            cssEase: 'ease-in-out'
        });
    }

    // 프로그램 슬라이드 (PC)
    if ($('.v2-cards-slider').length) {
        // 기존 슬라이드가 초기화되어 있다면 파괴
        if ($('.v2-cards-slider').hasClass('slick-initialized')) {
            $('.v2-cards-slider').slick('unslick');
        }

        // 슬라이드 재초기화
        $('.v2-cards-slider').slick({
            dots: true,
            arrows: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            cssEase: 'ease-in-out',
            prevArrow: '<button type="button" class="slick-prev v2-cards-prev">Previous</button>',
            nextArrow: '<button type="button" class="slick-next v2-cards-next">Next</button>'
        });
    }


}

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
    $('#main, .slick-slide, .cover-slide .item, .main-bg, .main-bg-img').height(viewportHeight);
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
 * URL 해시에 따라 적절한 페이지를 표시합니다
 */
function initRouting() {
    const hash = window.location.hash.replace('#', '');

    if (hash) {
        showPage(hash, false);
    } else {
        showPage('main', false);
    }

    // 해시 변경 이벤트 처리
    $(window).on('hashchange', function() {
        const currentHash = window.location.hash.replace('#', '');

        if (currentHash) {
            showPage(currentHash, false);
        } else {
            showPage('main', false);
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

        if (page) {
            navigateToPage(page);
        }
    });

    // 로고 클릭 (홈으로) - 모든 header 내의 로고 링크
    $(document).on('click', 'header a[href="/"], header a[href="/hikr/"], header a[href="/hikr"]', function(e) {
        e.preventDefault();

        navigateToPage('main');
    });

    // HOME 버튼 클릭
    $(document).on('click', 'a[href*="intro.php"]', function(e) {
        e.preventDefault();

        navigateToPage('main');
    });
}

/**
 * 페이지 네비게이션 함수
 * 지정된 페이지로 이동하고 URL 해시를 업데이트합니다
 */
function navigateToPage(page) {
    const hash = page === 'main' ? '' : '#' + page;


    if (hash) {
        window.location.hash = hash;
    } else {
        // 메인 페이지로 이동 시 해시 제거
        history.pushState(null, '', window.location.pathname);
        showPage('main', false);
    }
}

/**
 * 페이지 표시 함수
 * 지정된 페이지를 표시하고 다른 페이지는 숨깁니다
 */
/**
 * 페이지 표시 함수
 * 지정된 페이지를 표시하고 다른 페이지는 숨깁니다
 */
function showPage(page, updateHistory = false, url = null) {
    // 모든 main 섹션 숨기기
    $('main[id]').hide();

    // 선택된 페이지만 표시
    const targetPage = $('#' + page);

    if (targetPage.length) {
        targetPage.show();

        // 메인 페이지인 경우 슬라이드 재초기화
        if (page === 'main') {
            setTimeout(function() {
                initSlide();
            }, 100);
        }

        // 프로그램 페이지인 경우 슬라이드 재초기화
        if (page === 'regular_program') {
            setTimeout(function() {
                initSlide();
            }, 100);
        }
    } else {
        // 페이지를 찾지 못한 경우 메인 페이지 표시
        $('#main').show();

        // 메인 페이지 표시 시 슬라이드 재초기화
        setTimeout(function() {
            initSlide();
        }, 100);
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



/**
 * 공지사항 상세 모달 표시 함수
 * 공지사항 제목 클릭 시 상세 내용을 모달로 표시합니다
 */
function showNoticeModal(title, date, content) {
    $('#noticeModalLabel').text(title);
    $('#noticeModalDate').text(date);
    $('#noticeModalContent').html(content);

    // SimpleBar 재초기화
    const simplebarElement = document.querySelector('#noticeModalContent');
    if (simplebarElement) {
        // 기존 SimpleBar 인스턴스 제거
        if (simplebarElement.SimpleBar) {
            simplebarElement.SimpleBar.unMount();
        }
        // 새로운 SimpleBar 인스턴스 생성
        new SimpleBar(simplebarElement);
    }

    const modal = new bootstrap.Modal(document.getElementById('noticeModal'));
    modal.show();
}

/**
 * 공지사항 데이터 반환 함수
 * 공지사항 번호에 따른 상세 내용을 반환합니다
 */
function getNoticeContent(noticeId) {
    // 실제로는 서버에서 데이터를 가져와야 하지만, 현재는 더미 데이터 사용
    const notices = {
        'notice_1': {
            title: '하이커 그라운드 촬영 가이드',
            date: '2025-02-27',
            content: `
                <p>하이커 그라운드 촬영 가이드 안내입니다.</p>
                <br>
                <img src="./assets/img/tmp_notice_01.png" style="width: 100%" alt=""/>
                <p>촬영 시 다음 사항을 준수해 주시기 바랍니다:</p>
                <ul>
                    <li>장시간 특정 공간을 독점하거나 다른 관람객에게 피해가 가는 경우 촬영 행위가 제한될 수 있습니다. 전시관의 동선을 방해하는 촬영은 제한됩니다.</li>
                    <li>플래시 및 전문촬영 장비는 사용이 제한됩니다.</li>
                    <li>전시관 성격과 무관한 단체촬영, 또는 개인작업물 촬영은 제한됩니다.</li>
                    <li>다른 관람객들이 불편함을 느끼거나, 저작권 및 초상권을 침해하는 촬영은 불가합니다. 취재 및 인터뷰가 포함된 촬영은 제한됩니다.</li>
                    <li>상업적 촬영 진행 시, 하이커 그라운드 대관신청을 선행하고 허가 후 진행해야 합니다.</li>
                </ul>
                <br>
                <p>문의사항은 이메일(hikr@knto.or.kr) 또는 전화(02-729-9497~8)로 연락 주시기 바랍니다.</p>
            `
        },
        'notice_2': {
            title: '하이커그라운드 리플렛',
            date: '2025-04-25',
            content: `
                <p>하이커 그라운드 리플렛을 다운로드 받으실 수 있습니다.</p>
                <br>
                <p>리플렛에는 다음과 같은 내용이 포함되어 있습니다:</p>
                <ul>
                    <li>하이커 그라운드 소개</li>
                    <li>층별 전시 안내</li>
                    <li>운영 시간 및 휴무일</li>
                    <li>오시는 길</li>
                </ul>
                <br>
                <p>자세한 내용은 현장에서 확인하실 수 있습니다.</p>
            `
        },
        'notice_3': {
            title: '하이커 그라운드 대관 및 촬영 안내 자료',
            date: '2025-04-25',
            content: `
                <p>하이커 그라운드 대관 및 촬영 안내 자료입니다.</p>
                <br>
                <p>대관 및 촬영 신청 절차:</p>
                <ol>
                    <li>이메일을 통한 사전 문의</li>
                    <li>신청서 작성 및 제출</li>
                    <li>일정 및 비용 협의</li>
                    <li>계약서 작성</li>
                </ol>
                <br>
                <p>자세한 상담을 원하시면 hikr@knto.or.kr로 문의해 주시기 바랍니다.</p>
            `
        }
    };

    return notices[noticeId] || null;
}

/**
 * 공지사항 테이블 행 클릭 이벤트 바인딩 함수
 * 공지사항 클릭 시 상세 모달을 표시합니다
 */
function bindNoticeEvents() {
    $(document).on('click', '.notice-card[data-notice-id]', function() {
        const noticeId = $(this).data('notice-id');
        const noticeData = getNoticeContent(noticeId);

        if (noticeData) {
            showNoticeModal(noticeData.title, noticeData.date, noticeData.content);
        }
    });
}