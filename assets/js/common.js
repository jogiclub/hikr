'use strict';

let noticeLoaded = false;

async function loadNoticeFromAPI() {
    try {
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

function displayNoticeCards(posts) {
    const $noticeContainer = $('#notice .row.g-4.my-5');
    if (!$noticeContainer.length) {
        console.error('공지사항 컨테이너를 찾을 수 없습니다.');
        return;
    }
    $noticeContainer.empty();
    posts.forEach((post) => {
        const card = createNoticeCard(post);
        $noticeContainer.append(card);
    });
    console.log(`${posts.length}개의 공지사항이 로드되었습니다.`);
}

function createNoticeCard(post) {
    const imageUrl = post.image_url || './assets/img/tmp_notice_01.png';
    let title = '공지사항';
    if (post.content) {
        const lines = post.content.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
            title = lines[0];
        }
    }
    if (title.length > 50) {
        title = title.substring(0, 47) + '...';
    }
    const postDate = formatNoticeDate(post.posted_at);
    return `
        <div class="col-6 col-xl-3">
            <div class="card h-100 notice-card api-notice" 
                 data-title="${escapeHtml(title)}"
                 data-date="${postDate}"
                 data-content="${escapeHtml(post.content).replace(/\n/g, '<br>')}"
                 data-image-url="${imageUrl}"
                 style="cursor: pointer;">
                <img src="${imageUrl}" class="card-img" alt="${escapeHtml(title)}" onerror="this.src='./assets/img/tmp_notice_01.png'">
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

function formatNoticeDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (e) {
        return dateString;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function displayNoNotices() {
    $('#notice .row.g-4.my-5').html(`<div class="col-12 text-center py-5"><p class="mt-3 text-muted">등록된 공지사항이 없습니다.</p></div>`);
}

function displayNoticeError(errorMessage) {
    $('#notice .row.g-4.my-5').html(`<div class="col-12"><div class="alert alert-warning" role="alert">공지사항을 불러오는 중 오류가 발생했습니다.<br><small>${escapeHtml(errorMessage)}</small></div></div>`);
}

function bindAPINoticeClickEvents() {
    $(document).off('click', '.api-notice').on('click', '.api-notice', function() {
        const title = $(this).data('title');
        const date = $(this).data('date');
        const content = $(this).data('content');
        const imageUrl = $(this).data('image-url');
        showNoticeModal(title, date, content, imageUrl);
    });
}

function initializeNoticeSection() {
    if (noticeLoaded) {
        return;
    }
    loadNoticeFromAPI();
    bindAPINoticeClickEvents();
    noticeLoaded = true;
}

$(function() {
    hidePageLoader();
    initAOS();
    initOffcanvas();
    initRouting();
    bindMenuEvents();
    // bindNoticeEvents();
    $(window).on('resize', function() {
        applyScreenHeight();
        handleOffcanvasResize();
        AOS.refresh();
    }).trigger('resize');
    initSlide();
    loadInstagramEvents();
    handleIntroLayout();
});

function hidePageLoader() {
    const $loader = $('#pageLoader');
    if ($loader.length) {
        $loader.addClass('fade-out');
        setTimeout(() => $loader.remove(), 300);
    }
}

function initSlide() {
    const slickOptions = { dots: true, infinite: true, speed: 1500, fade: true, autoplay: true, autoplaySpeed: 3000, cssEase: 'ease', pauseOnHover: false, pauseOnFocus: false, waitForAnimate: true };
    const $coverSlide = $('.cover-slide');
    if ($coverSlide.length && !$coverSlide.hasClass('slick-initialized')) {
        $coverSlide.slick(slickOptions);
    }
    const programSliderOptions = { dots: true, infinite: true, speed: 500, arrows: true, prevArrow: '<button type="button" class="slick-prev"></button>', nextArrow: '<button type="button" class="slick-next"></button>', slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, cssEase: 'ease-in-out' };
    const $mobileSlider = $('.v2-cards-mobile-slider');
    if ($mobileSlider.length && !$mobileSlider.hasClass('slick-initialized')) {
        $mobileSlider.slick({ ...programSliderOptions, arrows: false });
    }
    const $cardsSlider = $('.v2-cards-slider');
    if ($cardsSlider.length && !$cardsSlider.hasClass('slick-initialized')) {
        $cardsSlider.slick({ ...programSliderOptions, prevArrow: '<button type="button" class="slick-prev v2-cards-prev"></button>', nextArrow: '<button type="button" class="slick-next v2-cards-next"></button>' });
    }
}

function reinitializeMainSlider() {
    const $coverSlide = $('.cover-slide');
    if ($coverSlide.hasClass('slick-initialized')) {
        $coverSlide.slick('unslick');
    }
    const slickOptions = { dots: true, infinite: true, speed: 1500, fade: true, autoplay: true, autoplaySpeed: 3000, cssEase: 'ease', pauseOnHover: false, pauseOnFocus: false, waitForAnimate: true };
    if ($coverSlide.length) {
        $coverSlide.slick(slickOptions);
    }
}

function applyScreenHeight() {
    $('#main, .cover-slide .item, .main-bg, .main-bg-img, #main_station, .station-cover').height($(window).height());
}

function initOffcanvas() {
    const $offcanvasGnb = $('#offcanvasGnb');
    if ($(window).width() >= 1200) {
        $offcanvasGnb.removeAttr('style').addClass('no-transition show');
        setTimeout(() => $offcanvasGnb.removeClass('no-transition'), 50);
    }
}

function handleOffcanvasResize() {
    const $offcanvasGnb = $('#offcanvasGnb');
    if ($(window).width() >= 1200) {
        if (!$offcanvasGnb.hasClass('show')) {
            $offcanvasGnb.removeAttr('style').addClass('no-transition show');
            setTimeout(() => $offcanvasGnb.removeClass('no-transition'), 50);
        }
    } else {
        $offcanvasGnb.removeClass('show');
    }
}

function initRouting() {
    const hash = window.location.hash.replace('#', '');
    showPage(hash || 'main');
    $(window).on('hashchange', function() {
        showPage(window.location.hash.replace('#', '') || 'main');
    });
}

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

function navigateToPage(page) {
    const hash = page === 'main' ? '' : '#' + page;
    if (window.location.hash !== hash) {
        window.location.hash = hash;
    } else if (!hash) {
        history.pushState(null, '', window.location.pathname);
        showPage('main');
    }
}

function showPage(page) {
    $('main[id]').hide();
    const $targetPage = $('#' + page);
    if ($targetPage.length) {
        $targetPage.show();
    } else {
        $('#main').show();
    }
    toggleOffcanvas(page);
    updateWrapperClass(page);

    if (page === 'notice') {
        initializeNoticeSection();
    }

    if (page === 'main') {
        setTimeout(() => reinitializeMainSlider(), 100);
    } else if (page === 'regular_program') {
        setTimeout(initSlide, 100);
    }
    if ($(window).width() < 1200) {
        const offcanvas = bootstrap.Offcanvas.getInstance($('#offcanvasGnb').get(0));
        if (offcanvas) offcanvas.hide();
    }
    setTimeout(() => {
        $('.scrollable-container .simplebar-content-wrapper').scrollTop(0);
        AOS.refresh();
    }, 100);
}

function updateWrapperClass(page) {
    const $wrapper = $('#wrapper');
    $wrapper.removeClass('intro-wrap main-wrap sub-wrap');
    if (page === 'intro') {
        $wrapper.addClass('intro-wrap');
    } else if (page === 'main' || page === 'main_station') {
        $wrapper.addClass('main-wrap');
    } else {
        $wrapper.addClass('sub-wrap');
    }
}

function showNoticeModal(title, date, content, imageUrl, postUrl) {
    $('#noticeModalLabel').text(title);
    $('#noticeModalDate').text(date);
    $('#noticeModalLink').attr('href', postUrl);

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


// function getNoticeContent(noticeId) {
//     const notices = {
//         'notice_1': { title: '하이커 그라운드 촬영 가이드', date: '2025-02-27', content: `<p>하이커 그라운드 촬영 가이드 안내입니다.</p><br><img src="./assets/img/insta_01.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_02.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_03.jpg" style="width: 100%" alt=""/><p>촬영 시 다음 사항을 준수해 주시기 바랍니다:</p><ul><li>장시간 특정 공간을 독점하거나 다른 관람객에게 피해가 가는 경우 촬영 행위가 제한될 수 있습니다. 전시관의 동선을 방해하는 촬영은 제한됩니다.</li><li>플래시 및 전문촬영 장비는 사용이 제한됩니다.</li><li>전시관 성격과 무관한 단체촬영, 또는 개인작업물 촬영은 제한됩니다.</li><li>다른 관람객들이 불편함을 느끼거나, 저작권 및 초상권을 침해하는 촬영은 불가합니다. 취재 및 인터뷰가 포함된 촬영은 제한됩니다.</li><li>상업적 촬영 진행 시, 하이커 그라운드 대관신청을 선행하고 허가 후 진행해야 합니다.</li></ul><br><p>문의사항은 이메일(hikr@knto.or.kr) 또는 전화(02-729-9497~8)로 연락 주시기 바랍니다.</p>` },
//         'notice_2': { title: '하이커그라운드 리플렛', date: '2025-04-25', content: `<p>하이커 그라운드 리플렛을 다운로드 받으실 수 있습니다.</p><br><img src="./assets/img/insta_11.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_12.jpg" style="width: 100%" alt=""/><img src="./assets/img/insta_13.jpg" style="width: 100%" alt=""/><p>리플렛에는 다음과 같은 내용이 포함되어 있습니다:</p><ul><li>하이커 그라운드 소개</li><li>층별 전시 안내</li><li>운영 시간 및 휴무일</li><li>오시는 길</li></ul><br><p>자세한 내용은 현장에서 확인하실 수 있습니다.</p>` },
//         'notice_3': { title: '하이커 그라운드 대관 및 촬영 안내 자료', date: '2025-04-25', content: `<p>하이커 그라운드 대관 및 촬영 안내 자료입니다.</p><br><p>대관 및 촬영 신청 절차:</p><ol><li>이메일을 통한 사전 문의</li><li>신청서 작성 및 제출</li><li>일정 및 비용 협의</li><li>계약서 작성</li></ol><br><p>자세한 상담을 원하시면 hikr@knto.or.kr로 문의해 주시기 바랍니다.</p>` }
//     };
//     return notices[noticeId] || null;
// }

// function bindNoticeEvents() {
//     $(document).on('click', '.notice-card[data-notice-id]', function() {
//         const noticeId = $(this).data('notice-id');
//         const noticeData = getNoticeContent(noticeId);
//         if (noticeData) {
//             showNoticeModal(noticeData.title, noticeData.date, noticeData.content);
//         }
//     });
// }

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

async function loadInstagramEvents() {
    try {
        const response = await fetch('./api/api_feed.php');
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

function initAOS() {
    AOS.init({
        startEvent: 'load',
        offset: 120,
        duration: 800,
        easing: 'ease',
        once: false,
        mirror: false
    });
    const simplebarContent = document.querySelector('.scrollable-container .simplebar-content-wrapper');
    if (simplebarContent) {
        simplebarContent.addEventListener('scroll', () => AOS.refresh());
    } else {
        console.warn('SimpleBar 스크롤 컨테이너를 찾을 수 없습니다');
    }
}

function handleIntroLayout() {
    const $leftSection = $('.item--left');
    const $rightSection = $('.item--right');
    let isLeftHovered = false;
    let isRightHovered = false;
    const isMobile = () => $(window).width() <= 1000;
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
