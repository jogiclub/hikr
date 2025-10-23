let elementReg1 = null;
let elementNormalPicUpload = null;
let elementEventPicUpload = null;

function eventDetail() {
    showPicture();
    // showSticker();
}


function DetailsGo() {

    if (getParameter('cotid') != 'c67a7d54-43c0-49b7-9590-1db176277ccb')
        mbticheck();

    // setTimeout(function() {
    // 	curationProc(locationx, locationy);
    // }, 1000)

}
function showPicture() {

    elementReg1 = document.querySelector('#galleryGo a.reg');
    elementReg2 = document.querySelector('#galleryGo a.reg1');

    elementNormalPicUpload = document.querySelector('#galleryGo #normalPictureUpload');
    elementEventPicUpload  = document.querySelector('.user_reg #eventPictureUpload');

    let pictureTagElement = "";

    if (hostname === "dev.ktovisitkorea.com" || hostname === "localhost") {
        pictureTagElement = document.querySelector('a[href*="4d1c5c4a-83af-11f0-bf9f-0242ac130002"]');
    } else {
        pictureTagElement = document.querySelector('a[href*="77c919b2-122a-4eee-86d1-38eae0c0710c"]');
    }

    if (pictureTagElement) {

        if (elementEventPicUpload) {
            elementEventPicUpload.style.display = 'inline-block';
            elementEventPicUpload.addEventListener('click', function () {

                if( loginYn == 'N') {
                    showLogin(1);
                } else {
                    location.href = "/mypage/tourist_info_reg.do?cotid=" + sContentId + '&title=' + sContentTitle+ '&type=ATTEMPT';
                }
            });
        }

        const commonClickHandler = function (event) {
            event.preventDefault();
            if ( loginYn == 'N') {
                 showLogin(1);
            } else {
                if(getCookie('photoeventPop')){
                    layerPopup.layerShow('userPicReg');
                } else {
                    layerPopup.layerShow('photoeventPop');
                }
            }
        };

        if (elementReg1 || elementReg2) {
            if(elementReg1) {
                elementReg1.href = "";
                elementReg1.onclick = commonClickHandler;
            } else {
                elementReg2.href = "";
                elementReg2.onclick = commonClickHandler;
            }
        }
        if (elementNormalPicUpload) {
            elementNormalPicUpload.href = "";
            elementNormalPicUpload.onclick = commonClickHandler;
        }
    }
}
function showSticker() {

    removeCookie('stickerCodId');
    removeCookie('stickerCotId');

    if (getCookie('stickerCodId')) {
        setCookie('stickerCodId', 'delete', -1);

    }
    if (getCookie('stickerCotId')) {
        setCookie('stickerCotId', 'delete', -1);
    }

    let TaegeukgiTagElement = "";

    if (hostname === "dev.ktovisitkorea.com") {
        TaegeukgiTagElement = document.querySelector('a[href*="147d47da-a5d9-4ed9-ab0b-c20cae25a1c5"]');
    } else {
        TaegeukgiTagElement = document.querySelector('a[href*="7be48401-081b-4bcf-a324-cfbf864ccb42"]');
    }
    
    if (TaegeukgiTagElement) {

        window.onpageshow = function (event) {
            if (smallerThanTablet() && getDevice() == 'iOS' && event.persisted) {
                location.reload();
            }
        };

        if (Math.random() >= 0.64) {
            stickerCheck();
        }
    }
}
function mbticheck() {

    var today = new Date();
    var end_date = new Date(2020, 11, 11);
    if (today < end_date) {
        if (getCookie("forecast_1") != "Y") {
            var gaCookie2 = getCookie('_ga');
            $.ajax({
                url: mainurl + '/call',
                dataType: 'json',
                type: "POST",
                data: {
                    cmd: 'GA_INFO_CHK',
                    ga: gaCookie2
                },
                success: function (data) {
                    if (data.header.process == 'success') {
                        if (data.body.GaInfo == 'N') {
                            var mbtihtml = '';
                            mbtihtml += '<div class="event_quick ">';
                            mbtihtml += '<div class="inner">';
                            mbtihtml += '<a href="https://korean.visitkorea.or.kr/detail/event_detail.do?cotid=e605937d-c663-445a-b12c-da6805741efd" class="btn_go">국내여행 MBTI 이벤트로 이동</a>';
                            mbtihtml += '<button type="button" onclick ="closebutton(1);" class="close">닫기</button>';
                            mbtihtml += '</div>';
                            mbtihtml += '</div>';
                            $('#contents').before(mbtihtml);
                            mbtiBtnScroll();
                        } else {
                            var today = new Date();
                            var end_date = new Date(2020, 10, 27);
                            if (today < end_date) {
                                var mbtihtml = '';
                                mbtihtml += '<div class="event_quick type1">';
                                mbtihtml += '<div class="inner">';
                                mbtihtml += '<a href="https://korean.visitkorea.or.kr/detail/event_detail.do?cotid=5b2a451a-a8f0-4551-a0fb-b117380fa133" class="btn_go">흥확행 이벤트로 이동</a>';
                                mbtihtml += '<button type="button" onclick="closebutton();" class="close">닫기</button>';
                                mbtihtml += '</div>';
                                mbtihtml += '</div>';
                                $('#contents').before(mbtihtml);
                                mbtiBtnScroll();
                            }
                        }
                    }
                },
                complete: function () {
                },
                error: function (xhr, textStatus, errorThrown) {
                }
            });
        }
    }
}


function closebutton(kind) {

    switch (kind) {
        case 1 :
            setCookie('forecast_1', 'Y', 1);
            $('.mbti_quick').remove();
            break;
    }
}

function mbtiBtnScroll() {
    $('.event_quick a').click(function () {
        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 500);
        return false;
    });
    var btnW = $('.event_quick')
        , btnTop = btnW.find('.close');

    var $w = $(window),
        footerHei = $('#footer').outerHeight(),
        $banner = $('.event_quick');

    $w.on('scroll', function () {

        var sT = $w.scrollTop();
        var val = $(document).height() - $w.height() - footerHei;

        if (sT >= val)
            $banner.addClass('on')
        else
            $banner.removeClass('on')

    });

    btnTop.click(function () {
        btnW.addClass('none');
    });

}

function stickerButtons(kind) {

    var stickerCotId = "";

    if (hostname === "dev.ktovisitkorea.com") {
        stickerCotId = "/detail/event_detail.do?cotid=d6c03db8-471f-46e2-9f77-822ded7680e7";
    } else {
        stickerCotId = "/detail/event_detail.do?cotid=cf3c685c-ba91-4793-9918-bd4e7d6e6310";
    }

    switch (kind) {

        case 1 :
            layerPopup.layerHide('stickerPop');
            setCookie('stickerCodId', 'delete', -1);
            removeCookie('stickerCodId');
            setCookie('sticker_scroll', true, 1);
            location.href = stickerCotId;
            break;
        case 2 :
            setCookie('stickerCotId', cotId, 1);
            layerPopup.layerHide('stickerPop');
            setCookie('sticker_beforeUrl', stickerCotId, 1);
            beforeUrl = getCookie('sticker_beforeUrl');
            showLogin(2);
            break;
        case 3 :
            $('#showStickerHtml').remove();
            layerPopup.layerHide('stickerPop');
            setCookie('stickerCodId', 'delete', -1);
            removeCookie('stickerCodId');

            break;
        case 4 :
            layerPopup.layerHide('stickerPop');
            setCookie('stickerCodId', 'delete', -1);
            removeCookie('stickerCodId');

            break;
        case 5 :
            $('#showStickerHtml').remove();
            break;
    }

    $('#login .btn_close3').on('click', function () {
        removeCookie('stickerCodId');
        removeCookie('stickerCotId');

        if (getCookie('stickerCodId')) {
            setCookie('stickerCodId', 'delete', -1);

        }
        if (getCookie('stickerCotId')) {
            setCookie('stickerCotId', 'delete', -1);

        }
    });

    $('#socialLogin .btn_close3').on('click', function () {
        removeCookie('stickerCodId');
        removeCookie('stickerCotId');

        if (getCookie('stickerCodId')) {
            setCookie('stickerCodId', 'delete', -1);

        }
        if (getCookie('stickerCotId')) {
            setCookie('stickerCotId', 'delete', -1);

        }
    });

}

function htmlYn(stickerResult, stickerMent) {

    var html = '';

    html += `<div id="stickerPop" class="confirm_popup" tabindex="0">`
    html += `		<div class="box">`;
    html += `			<p>${stickerMent}</p>`;
    html += `			<div class="btn_wrap">`;

    // 0 : 로그인상태   , 1 : 비로그인상태 , 2 : 오류 실패
    switch (stickerResult) {
        case 0 :
            html += `				<button type="button" class="btn_type_1" onclick="javascript:stickerButtons(1);" tabindex="0" >예</button>`;
            html += `				<button type="button" class="btn_type_2" onclick="javascript:stickerButtons(3);" tabindex="0">아니오</button>`;
            break;
        case 1 :
            html += `				<button type="button" class="btn_type_1" onclick="javascript:stickerButtons(2);"  tabindex="0" >예</button>`;
            html += `				<button type="button" class="btn_type_2" onclick="javascript:stickerButtons(4);" tabindex="0">아니오</button>`;
            break;
        case 2 :
            html += `				<button type="button" class="btn_type_1" onclick="javascript:stickerButtons(3);"  tabindex="0" >확인</button>`;
            break;
    }

    html += `			</div>`;
    html += `		</div>`;
    html += `	</div>`;

    $('#contents').before(html);
}

function stickerCheck() {
    if (hostname === "dev.ktovisitkorea.com") {
        evtId = "512232d2-1a77-459a-89e9-3890e0392aac";
    } else {
        evtId = "0aa5477f-2aab-469a-9363-03dff3619231";
    }

    let stickerImgId = '';
    let stickerCodId = '';

    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd: 'EVENT_LIBERATIONDAY_STICKER_CHECK',
            cotId: cotId,
            evtId: evtId
        },
        success: function (data) {

            if (data.header.process == 'success') {

                if (data.body.resultBody !== undefined) {

                    stickerImgId = data.body.resultBody.fileDescription;
                    stickerCodId = data.body.resultBody.codId

                    var mbtihtml = '';
                    mbtihtml += `<div id="showStickerHtml" class="mission_sticker">`;
                    mbtihtml += `<button type="button" class="btn_click" onclick="showNextStickerPopup(this,'${stickerCodId}',evtId);" tabindex="0">`;
                    if (hostname === "dev.ktovisitkorea.com") {
                        mbtihtml += `<img  src="https://dev.ktovisitkorea.com/img/call?cmd=VIEW&id=${stickerImgId}" alt="광복 80주년 이벤트 태극기를 찾았어요!">`;
                    } else {
                        mbtihtml += `<img  src="https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=${stickerImgId}" alt="광복 80주년 이벤트 태극기를 찾았어요!">`;
                    }
                    mbtihtml += `</button>`;
                    mbtihtml += `<button type="button" onclick="stickerButtons(5);" class="btn_close" tabindex="0">닫기</button>`;
                    mbtihtml += `</div>`;
                    mbtihtml += `</div>`;

                    $('#contents').before(mbtihtml);
                    mbtiBtnScroll();
                }
            } else {
                console.log(data.header.ment);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
        }
    });

}

function showNextStickerPopup(clickedButtonElement, stickerCodId, evtId) {
    $(clickedButtonElement).prop('disabled', true)

    setCookie('stickerCodId', stickerCodId, 1);
    insertSticker(evtId, stickerCodId);
}

function insertSticker(evtId, stickerCodId) {

    let stickerMent = '';
    let stickerResult = 0;

    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd: 'EVENT_LIBERATIONDAY_STICKER_SAVE',
            evtId: evtId,
            cotId: cotId,
            codId: stickerCodId
        },
        success: function (data) {

            stickerResult = data.body.result;
            stickerMent = data.header.ment;

            htmlYn(stickerResult, stickerMent);
            layerPopup.layerShow('stickerPop');

        },

        complete: function () {
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
}


