'use strict';

$(function() {
    // AOS 초기화 및 SimpleBar 연동
    initAOS();

    // Offcanvas 초기화
    initOffcanvas();

    // 페이지 라우팅 초기화
    initRouting();

    // 메뉴 이벤트 바인딩
    bindMenuEvents();

    // 공지사항 이벤트 바인딩
    bindNoticeEvents();

    // 화면 크기 변경에 따른 이벤트 처리
    $(window).on('resize', function() {
        applyScreenHeight();
        handleOffcanvasResize();
        AOS.refresh(); // 리사이즈 시에도 AOS 새로고침
    }).trigger('resize');

    // 슬라이드 초기화
    initSlide();

    // 인스타그램 이벤트 로드
    loadInstagramEvents();

    // 인트로 섹션 레이아웃 업데이트
    handleIntroLayout();
});

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

    if ($('.cover-slide').length && !$('.cover-slide').hasClass('slick-initialized')) {
        $('.cover-slide').slick(slickOptions);
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

    if ($('.v2-cards-mobile-slider').length && !$('.v2-cards-mobile-slider').hasClass('slick-initialized')) {
        $('.v2-cards-mobile-slider').slick($.extend({}, programSliderOptions, { arrows: false }));
    }

    if ($('.v2-cards-slider').length && !$('.v2-cards-slider').hasClass('slick-initialized')) {
        $('.v2-cards-slider').slick($.extend({}, programSliderOptions, {
            arrows: true,
            prevArrow: '<button type="button" class="slick-prev v2-cards-prev"></button>',
            nextArrow: '<button type="button" class="slick-next v2-cards-next"></button>'
        }));
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

    if (page === 'main' || page === 'regular_program') {
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
function showNoticeModal(title, date, content) {
    $('#noticeModalLabel').text(title);
    $('#noticeModalDate').text(date);
    $('#noticeModalContent').html(content);

    const simplebarElement = $('#noticeModalContent')[0];
    if (simplebarElement.SimpleBar) {
        simplebarElement.SimpleBar.unMount();
    }
    new SimpleBar(simplebarElement);

    const modal = new bootstrap.Modal($('#noticeModal')[0]);
    modal.show();
}

/**
 * 공지사항 데이터 반환 함수
 */
function getNoticeContent(noticeId) {
    const notices = {
        'notice_1': { title: '하이커 그라운드 촬영 가이드', date: '2025-02-27', content: `<p>하이커 그라운드 촬영 가이드 안내입니다.</p><br><img src="./assets/img/insta_01.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_02.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_03.jpg" style="width: 100%" alt=""/><p>촬영 시 다음 사항을 준수해 주시기 바랍니다:</p><ul><li>장시간 특정 공간을 독점하거나 다른 관람객에게 피해가 가는 경우 촬영 행위가 제한될 수 있습니다. 전시관의 동선을 방해하는 촬영은 제한됩니다.</li><li>플래시 및 전문촬영 장비는 사용이 제한됩니다.</li><li>전시관 성격과 무관한 단체촬영, 또는 개인작업물 촬영은 제한됩니다.</li><li>다른 관람객들이 불편함을 느끼거나, 저작권 및 초상권을 침해하는 촬영은 불가합니다. 취재 및 인터뷰가 포함된 촬영은 제한됩니다.</li><li>상업적 촬영 진행 시, 하이커 그라운드 대관신청을 선행하고 허가 후 진행해야 합니다.</li></ul><br><p>문의사항은 이메일(hikr@knto.or.kr) 또는 전화(02-729-9497~8)로 연락 주시기 바랍니다.</p>` },
        'notice_2': { title: '하이커그라운드 리플렛', date: '2025-04-25', content: `<p>하이커 그라운드 리플렛을 다운로드 받으실 수 있습니다.</p><br><img src="./assets/img/insta_11.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_12.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_13.jpg" style="width: 100%" alt=""/><p>리플렛에는 다음과 같은 내용이 포함되어 있습니다:</p><ul><li>하이커 그라운드 소개</li><li>층별 전시 안내</li><li>운영 시간 및 휴무일</li><li>오시는 길</li></ul><br><p>자세한 내용은 현장에서 확인하실 수 있습니다.</p>` },
        'notice_3': { title: '하이커 그라운드 대관 및 촬영 안내 자료', date: '2025-04-25', content: `<p>하이커 그라운드 대관 및 촬영 안내 자료입니다.</p><br><p>대관 및 촬영 신청 절차:</p><ol><li>이메일을 통한 사전 문의</li><li>신청서 작성 및 제출</li><li>일정 및 비용 협의</li><li>계약서 작성</li></ol><br><p>자세한 상담을 원하시면 hikr@knto.or.kr로 문의해 주시기 바랍니다.</p>` }
    };
    return notices[noticeId] || null;
}

/**
 * 공지사항 이벤트 바인딩 함수
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

/**
 * 인스타그램 이벤트 로드 함수
 */
async function loadInstagramEvents() {
    try {
        const response = await fetch('./api/get_insta_events.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const posts = await response.json();
        const $eventList = $('#event-list');

        if (posts.length === 0) {
            $eventList.html('<p class="text-center col-12">진행 중인 이벤트가 없습니다.</p>');
            return;
        }

        const postElements = posts.map(post => `
            <div class="col">
                <a href="${post.permalink}" target="_blank" class="card-link">
                    <div class="card h-100 notice-card">
                        <img src="${post.media_url}" class="card-img-top" alt="이벤트 이미지" style="aspect-ratio: 1 / 1; object-fit: cover;">
                        <div class="card-body">
                            <p class="card-text-insta">${post.caption.substring(0, 100)}...</p>
                        </div>
                    </div>
                </a>
            </div>`);
        $eventList.html(postElements.join(''));
    } catch (error) {
        console.error('Error fetching Instagram events:', error);
        $('#event-list').html('<p class="text-center col-12">이벤트 정보를 불러오는 데 실패했습니다.</p>');
    }
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

        console.log('AOS와 SimpleBar 스크롤 연동 완료');
    } else {
        console.warn('SimpleBar 스크롤 컨테이너를 찾을 수 없습니다');
    }
}