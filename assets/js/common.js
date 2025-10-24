// 파일 위치: assets/js/common.js
// 역할: 화면 크기에 따라 Offcanvas 표시 여부를 동적으로 제어하는 함수

'use strict';

$(document).ready(function() {
    // Offcanvas를 애니메이션 없이 먼저 열기 (1200px 이상에서만)
    initOffcanvas();

    // 화면 높이 적용 함수
    function applyScreenHeight() {
        const viewportHeight = $(window).height();
        $('main, .slick-slide, .cover-slide .item').height(viewportHeight);
    }

    applyScreenHeight();

    $(window).resize(function() {
        applyScreenHeight();
        handleOffcanvasResize();
    });

    // 슬라이드 초기화 (부드러운 fade 효과)
    $('.cover-slide').slick({
        dots: true,
        infinite: true,
        speed: 1500,  // fade 전환 속도를 더 느리게 (1.5초)
        fade: true,  // fade 효과 사용
        autoplay: true,
        autoplaySpeed: 300,  // 이미지 표시 시간 (5초)
        cssEase: 'ease',  // 기본 easing
        pauseOnHover: false,
        pauseOnFocus: false,
        waitForAnimate: true  // 애니메이션이 완료될 때까지 대기
    });
});

/**
 * Offcanvas 초기화 함수
 * 1200px 이상 화면에서만 페이지 로딩 시 offcanvas를 애니메이션 없이 열린 상태로 표시합니다
 * 이후 사용자가 열고 닫을 때는 애니메이션이 적용됩니다
 */
function initOffcanvas() {
    const offcanvasElement = $('#offcanvasGnb');

    if (offcanvasElement.length) {
        // 화면 크기가 1200px 이상인 경우에만 offcanvas를 자동으로 열기
        if ($(window).width() >= 1200) {
            // 애니메이션 제거를 위한 클래스 추가
            offcanvasElement.addClass('no-transition');

            // 애니메이션 없이 바로 show 클래스 추가
            offcanvasElement.addClass('show');

            // 다음 프레임에서 no-transition 클래스 제거 (이후 애니메이션 활성화)
            setTimeout(function() {
                offcanvasElement.removeClass('no-transition');
            }, 50);
        }
    }
}

/**
 * 화면 크기 변경 시 Offcanvas 표시 상태 제어 함수
 * 1200px 이상에서는 항상 열린 상태를 유지하고
 * 1200px 미만에서는 닫힌 상태로 변경합니다
 */
function handleOffcanvasResize() {
    const offcanvasElement = $('#offcanvasGnb');
    const windowWidth = $(window).width();

    if (offcanvasElement.length) {
        if (windowWidth >= 1200) {
            // 1200px 이상: 항상 열린 상태 유지
            if (!offcanvasElement.hasClass('show')) {
                offcanvasElement.addClass('no-transition');
                offcanvasElement.addClass('show');
                setTimeout(function() {
                    offcanvasElement.removeClass('no-transition');
                }, 50);
            }
        } else {
            // 1200px 미만: offcanvas 닫기
            if (offcanvasElement.hasClass('show')) {
                offcanvasElement.removeClass('show');
            }
        }
    }
}