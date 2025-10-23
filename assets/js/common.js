'use strict';



$(document).ready(function() {
    function applyScreenHeight() {
        const viewportHeight = $(window).height();
        $('main, .slick-slide, .cover-slide .item').height(viewportHeight);
    }
    applyScreenHeight();

    $(window).resize(function() {
        applyScreenHeight();
    });

    $('.cover-slide').slick({
        dots: true,
        infinite: true,
        speed: 500,
        fade: true,
        autoplay: true,
        cssEase: 'linear'
    });

});