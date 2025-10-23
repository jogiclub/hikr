/**
 * 기존의 `gobal.js` 파일 내부 로직들이 담긴, 사이트 전역으로 공유될 일반적인 로직들이 정의.
 */

var nowDate = '';
var timeid = '';
var device;
var snsId;
var autologinyn = 'N';
var snsChannel;
var snsRegYmd;
var snsUsrName;
var beforefocus;
var trssuser = 'N';
var agreeAllChk = false;
let trssinfo;
let loginalertcheck = false;
let deviceviewtype = "PC";
let memcheck = 'N';
let profileImageUrl
let landingYn = 'N';
let trssOgImage;
let trssChk = false;
let trssMissionScsYn = 'N';
let geolocationX = -1;
let geolocationY = -1;
let isDOMContentLoaded = false;
let commentAjaxCount = 0;

function onLoad() {
    nowDate = new Date();
    timeId = nowDate.getTime();

    if (smallerThanTablet()) {  // PC
        deviceviewtype = "MO";
    } else { //모바일
        deviceviewtype = "PC";
    }

    getAppYn();

    // 헤더 영역 로드
    switch ($('header').attr('id')) {
        case 'common_header':
            $("#common_header").load("/common/header/common_header.do?v=" + timeId, function () {
                $('.coronaBanner').hide();
                snsAutoLogin();

                // 검색인덱스 영역 로드
                $('<div class="search_index" style="display: none;"></div>').insertAfter("#common_header");
                $(".search_index").load("/search/search_index.do?v=" + timeId);
            });
            break;
        case 'gnbCommon':

            if ($('#gnbCommon').hasClass('db_gnb')) {
                $("#gnbCommon").load("/common/header/detail_header.do?v=" + timeId, function () {
                    $('.coronaBanner').hide();
                    snsAutoLogin();
                });
            } else if ($('#gnbCommon').hasClass('app_gnb')) {
                $("#gnbCommon").load("/common/header/app_main_header.do?v=" + timeId, function () {
                    snsAutoLogin();
                });
            } else if ($('#gnbCommon').hasClass('location_gnb')) {
                $("#gnbCommon").load("/common/header/location_header.do?v=" + timeId, function () {
                    snsAutoLogin();
                });
            } else if ($('#gnbCommon').hasClass('service_gnb')) {
                $("#gnbCommon").load("/common/header/main_header.do?v=" + timeId, function () {
                    snsAutoLogin();
                });
            } else if ($('#gnbCommon').hasClass('restaurant_map') && ($('#gnbCommon').hasClass('pc'))) {
                $("#gnbCommon").load("/common/header/map_header.do?v=" + timeId, function () {
                    snsAutoLogin();
                });
            }  else if ($('#gnbCommon').hasClass('restaurant_map') && $('#gnbCommon').hasClass('mo')) {
                snsAutoLogin();
            } else {
                $("#gnbCommon").load("/common/header/common_header.do?v=" + timeId, function () {
                    snsAutoLogin();
                });
            }
            // 검색인덱스 영역 로드
            if (document.querySelector('body').classList.contains('app')) {
                $('<div class="search_index" style="display: none;"></div>').insertAfter("#mainContainerM");
            } else {
                $('<div class="search_index" style="display: none;"></div>').insertAfter("#gnbCommon");
            }
            $(".search_index").load("/search/search_index.do?v=" + timeId);
            break;

        case 'detail_header':
            $("#detail_header").load("/common/header/common_header.do?v=" + timeId, function () {
                $('.coronaBanner').hide();
                snsAutoLogin();

                // 검색인덱스 영역 로드
                $('<div class="search_index" style="display: none;"></div>').insertAfter("#detail_header");
                $(".search_index").load("/search/search_index.do?v=" + timeId);
            });
            break;

        case 'kstay_header':
            $("#kstay_header").load("/kstay/ks_header.do?v=" + timeId, function () {
                snsAutoLogin();
                // 검색인덱스 영역 로드
                $('<div class="search_index" style="display: none;"></div>').insertAfter("#kstay_header");
                $(".search_index").load("/search/search_index.do?v=" + timeId);
            });
            break;
        case 'location_header':

            break;
        default:
            snsAutoLogin();
            break;
    }

    // 푸터 페이지 로드
    if (!$('#footer').hasClass("curation_footer")) {
        $("#footer").load("/common/default_footer.do?v=" + timeId);
    }

    DefaultEvent();

    getDevice() === 'iOS' && setTimeout(() => $('.main_mo .quick_menu').addClass('app'), 500);
}

function getNetFunnelActionId() {
    try {
        let {pathname} = location
        if (pathname.startsWith('/mypage')) {
            return 'mypage'
        }
        if (pathname.startsWith('/trss')) {
            return 'trss'
        }
        if (pathname.startsWith('/mylocation/mylocation.do')) {
            return 'mylocation'
        }
        if (pathname.startsWith('/detail/event_detail.do')) {
            return 'event'
        }
        if (pathname.startsWith('/list/travelbenefit.do')) {
            const service = getParameter('service')
            if (service === 'trss') {
                return 'travel_benefit_trss'
            }
            return 'travel_benefit_other'
        }
        if (pathname.startsWith('/')) {
            pathname = pathname.replace('/', '')
        }
        return pathname
            .replaceAll('/', '_')
            .replaceAll(/\..*/g, '')
    } catch (e) {
        return 'unknown'
    }
}

$().ready(function() {
    isDOMContentLoaded = true;
    if (typeof withTrackNetFunnel !== 'undefined') {
        const netFunnelActionId = getNetFunnelActionId()
        withTrackNetFunnel(netFunnelActionId, onLoad)
    } else {
        onLoad()
    }
});

/**
 * @author 2024-03-14 By.dohyeong
 *
 * 대구석 데이터 요청 대부분이 /call URL을 통한
 * 비동기 요청임을 이용해
 *
 * CMD 파라미터와 사전 정의된 정형화된 fetch API를 통해
 * 간편하게 데이터를 주고받을 목적으로 설계한
 * Promise 객체.
 *
 *
 * ex)
 *   fetchByCall('AbstractModule cmd 파라미터').then(d => {// ###. d.body.result 처리...; ###});
 *   위와 같은 방식으로 이용.
 */
function fetchByCall(cmd, data) {
    if (typeof data == 'undefined' || data == null) {
        data = {};
    }
    data.cmd = cmd;

    return new Promise((resolve, reject) => {
        fetch('/call', {
            method: 'post'
            , headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            , body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
        ;
    });
}

// ajax 호출 => /* TODO :: 체크하여 비슷한 구현함수가 존재하면, 대체 후 제거가 필오함. */
const $ajax = (cmd, data, async = true) => $.ajax({
    type: 'POST',
    dataType: 'json',
    url: mainurl + '/call',
    data: {cmd, ...data},
    async,
    error: console.log
});

/*
 * 디지털 관광주민증 본인인증 중복 가입 소셜
 * 경고 및 1순위 소셜 선택 창 노출.
 */
function checkDCardDplicateCertResultNShowBlockPopup() {
    if (! (location.href.indexOf('/main/main.do') > -1 || location.href.indexOf('/mypage/mypage_main.do') > -1)) {
        return;
    }
    if (typeof snsId == 'undefined' || snsId == null || snsId == '') {
        return;
    }
    if (sessionStorage.getItem('spfyLgnStepFin') != null) {
        if (sessionStorage.getItem('spfyLgnStepFin') == snsId) {
            return;
        }
    }
    if (document.querySelector('#mainAgreement') != null && document.querySelector('#mainAgreement').style.display == 'block') {
        return;
    }
    if (sessionStorage.getItem('dCardCertDuplicateSnsSelection') != null) {
        if (sessionStorage.getItem('dCardCertDuplicateSnsSelection') == snsId) {
            checkNShowMicroServiceJoinEncouragePopup();
            return;
        }
    }

    fetchByCall('VRFY_MEMB_JOIN_SVC_CHCK')
    .then(d => d.body.svcJoinChckRstl)
    .then(c => {
        let chckRslt = c.loginCertCheck;
        if (chckRslt == null) {
            return;
        }

        let dCardChckRslt = c.dCardCheck;
        let imDCardMber = dCardChckRslt == null ? false : dCardChckRslt.dCardMemberNow;
        let imFrstSlctdSnsAccnt = dCardChckRslt == null ? false : dCardChckRslt.dCardDplctCertFrstSlctdSns;
        if (dCardChckRslt == null || imFrstSlctdSnsAccnt || ! imDCardMber) {
            checkNShowMicroServiceJoinEncouragePopup();
            return;
        }

        let dplctLst = chckRslt.dCardMobNoDuplicateSnsLst;
        if (dplctLst == null || dplctLst.length == 0) {
            checkNShowMicroServiceJoinEncouragePopup();
            return;
            // CERT END.
        } else {
            let hasFrstSlctSns = dplctLst.some(dplctDCard => dplctDCard.dCardFrstAccnt);
            if (hasFrstSlctSns) {
                // 이미 1순위 계정 선택 완료되었기때문에 추가 처리 필요 없음.
                checkNShowMicroServiceJoinEncouragePopup();
            } else {
                showDCardFirstPlaceSnsSelectionPopup(dCardChckRslt, dplctLst);
            }
        }
    });
}

function showDCardFirstPlaceSnsSelectionPopup(dCardChckRslt, dplctLst) {
    let myDCardInfo = dCardChckRslt;
    let dplctSnsInfoLst = dplctLst;

    let dplctSlctnPpup = document.querySelector('#digitalIssuePop');
    let snsLstEl = dplctSlctnPpup.querySelector('.digital_account > ul');
    snsLstEl.innerHTML = ``;

    let snsId = myDCardInfo.snsId;
    let snsImgCssClss = myDCardInfo.snsImgCssClss;
    let snsTyNm = myDCardInfo.snsTyNm;
    let snsIdntfy = myDCardInfo.snsIdntfy;
    let dCardAreaNm = myDCardInfo.dcardRepAreaNm;
    let dCardAmnt = myDCardInfo.joinedDclIds == null ? 0 : myDCardInfo.joinedDclIds.length;
    let lstLgnDt = myDCardInfo.lstLgnDt;
    let snsImgId = myDCardInfo.snsImgId;
    let snsImagePath = myDCardInfo.snsImagePath;
    let cstmImgYn = myDCardInfo.snsCstmImgYn;
    let profImg = getSnsProfileImageUrl(snsImagePath, cstmImgYn, snsImgId);
    if (profImg.indexOf('icon_header_profile2') > -1) {
        profImg = profImg.replace('icon_header_profile2', 'ico_m_profile01');
    }

    sessionStorage.setItem('dCardCertDuplicateSnsSelection', snsId);

    let mySnsEl = `
        <li>                            
            <input type="radio" id="account9" name="digitalAccount" data-sns-id="${snsId}">
            <label for="account9">                                                                
                <strong>${snsIdntfy}님</strong>
                <em>${dCardAreaNm}${dCardAmnt == 0 ? '' : ' 외 ' + dCardAmnt + '건'}</em>                               
                <span class="login">최근 로그인 <span>${lstLgnDt}</span></span>                                
            </label>
            <span class="sns ${snsImgCssClss}">${snsTyNm}</span>
            <span class="profile"><img src="${profImg}" alt="프로필"></span>
        </li>`;
    snsLstEl.innerHTML += mySnsEl;

    let liEls = ``;
    dplctSnsInfoLst.forEach((snsInfo, i) => {
        snsId = snsInfo.snsId;
        snsImgCssClss = snsInfo.snsImgCssClss;
        snsTyNm = snsInfo.snsTyNm;
        snsIdntfy = snsInfo.snsIdntfy;
        dCardAreaNm = snsInfo.dCardAreaNm;
        dCardAmnt = snsInfo.dCardAmnt - 1;
        lstLgnDt = snsInfo.lstLgnDt;
        snsImgId = snsInfo.snsImgId;
        snsImagePath = snsInfo.snsImagePath;
        cstmImgYn = snsInfo.snsCstmImgYn;
        profImg = getSnsProfileImageUrl(snsImagePath, cstmImgYn, snsImgId);
        if (profImg.indexOf('icon_header_profile2') > -1) {
            profImg = profImg.replace('icon_header_profile2', 'ico_m_profile01');
        }

        liEls += `
         <li>
             <input type="radio" id="account${i + 10}" name="digitalAccount" data-sns-id="${snsId}">
             <label for="account${i + 10}">                                                                
                 <strong>${snsIdntfy}님</strong>
                 <em>${dCardAreaNm}${dCardAmnt == 0 ? '' : ' 외 ' + dCardAmnt + '건'}</em>                               
                 <span class="login">최근 로그인 <span>${lstLgnDt}</span></span>                                
             </label>
             <span class="sns ${snsImgCssClss}">${snsTyNm}</span>
             <span class="profile"><img src="${profImg}" alt="프로필"></span>
         </li>`;
    });
    snsLstEl.innerHTML += liEls;

    document.querySelector('#joinRecommendationPop1').style.display = 'none';
    document.querySelector('#joinRecommendationPop2').style.display = 'none';
    document.querySelector('#joinRecommendationPop3').style.display = 'none';
    document.querySelector('#digitalIssuePop').style.zIndex = 1000;
    layerPopup.layerShow('digitalIssuePop');

    document.querySelector('#digitalIssuePop .btn_close').onclick = _=> {
        if (confirm('계정 미선택 시 디지털 관광주민증 서비스를 이용할 수 없습니다. \n다음에 선택하시겠습니까?')) {
            layerPopup.layerHide('digitalIssuePop');
        }
    }

    document.querySelector('#digitalIssuePop .box_cont > .btn_area > a').onclick = _=> {
        let dplctInpts = Array.from(document.querySelectorAll('.digital_account > ul > li > input'));
        let hasSelectedInputs = dplctInpts.some(inpt => inpt.checked);

        if (! hasSelectedInputs) {
            if (confirm('계정 미선택 시 디지털 관광주민증 서비스를 이용할 수 없습니다. \n다음에 선택하시겠습니까?')) {
                layerPopup.layerHide('digitalIssuePop');
            }
        } else {
            saveDuplicateDCardFirstSnsInfoSelection();
        }
    }
}

/* 디지털 관광주민증 중복 인증 1순위 선택 SNS 계정 정보 저장. */
function saveDuplicateDCardFirstSnsInfoSelection() {
    let checkedInpt = document.querySelector('#digitalIssuePop .digital_account > ul > li > input:checked');
    let frstrstSlctdDCardSnsId = checkedInpt.dataset.snsId;

    fetchByCall('SAVE_SVC_PRVC_AGRE', {
        data: {
            svcId: '645185b0-ed09-11ee-95cd-0050569dc2b9'// 디지털 관광주민증 가입 중복 1순위 설정 동의. (SELECT * FROM CODE WHERE CODE_TYPE = '15')
            , snsId: frstrstSlctdDCardSnsId
            , agreTyCd: 1
        }
    })
    .then(d => d.body.result)
    .then(r => {
        console.log(r);// 비동기 실행으로 fetchByCall 실행이 제대로 작동 안하게 되는 부분 방지.
        layerPopup.layerHide('digitalIssuePop');
    })
    ;
}

/**
 * 로그인 완료 후,
 * 필요 시
 * 마이크로 서비스(여행구독, 디민증, ...(가입 간소화)) 가입 독려 팝업을 노출.
 */
async function checkNShowMicroServiceJoinEncouragePopup() {
    if (! (location.href.indexOf('/main/main.do') > -1 || location.href.indexOf('/mypage/mypage_main.do') > -1)) {
        return;
    }
    if (typeof snsId == 'undefined' || snsId == null || snsId == '') {
        return;
    }
    if (location.href.indexOf('/spfyLgn/') > -1) {
        return;
    }
    if (sessionStorage.getItem('spfyLgnStepFin') != null) {
        if (sessionStorage.getItem('spfyLgnStepFin') == snsId) {
            console.log(`\n\nSpfyAllStepsFinBefore.\n\n`);
            return;
        }
    }
    if (sessionStorage.getItem('spfyLgnMicroSvcJoinRecomm') != null) {
        if (sessionStorage.getItem('spfyLgnMicroSvcJoinRecomm') == snsId) {
            console.log(`\n\nSpfyLgnMicroSvcJoinRecommPopup Already Shownd.\n\n`);
            return;
        }
    }
    if (! await checkSvcRecommShowYn()) {
        return;
    }


    fetchByCall('VRFY_MEMB_JOIN_SVC_CHCK')
    .then(d => d.body.svcJoinChckRstl)
    .then(r => {
        let certChck = r.loginCertCheck;
        let trssInfoChck = r.trssCheck;
        let dCardInfoChck = r.dCardCheck;

        // 각 서비스 가입 독려 팝업을 띄울지 결정할 boolean 값을 담을 플래그.
        let trssSvcJoinEncouragement = false;
        let dCardSvcJoinEncouragement = false;

        if (trssInfoChck != null && trssInfoChck.trssMemberNow) {// 기존 여행구독 가입정보가 있을 시.
            trssSvcJoinEncouragement = false;

        } else {
            snsId = certChck.snsId;
            let preventSvcJoin = certChck.joinUnavailableTrssSvc;
            let dplctSnsLst = certChck.trssMobNoDuplicateSnsLst;
            if (dplctSnsLst == null) {
                dplctSnsLst = new Array();
            }
            dplctSnsLst = dplctSnsLst.filter(dplctSns => dplctSns.snsId != snsId);

            if (! preventSvcJoin && dplctSnsLst.length == 0) {
                trssSvcJoinEncouragement = true;
            } else {
                trssSvcJoinEncouragement = false;
            }
        }

        if (dCardInfoChck != null && dCardInfoChck.dCardMemberNow) {// 기존 디민증 가입정보가 있을 시.
            dCardSvcJoinEncouragement = false;

        } else {
            snsId = certChck.snsId;
            let preventSvcJoin = certChck.joinUnavailableDCardSvc;
            let dplctSnsLst = certChck.dCardMobNoDuplicateSnsLst;
            if (dplctSnsLst == null) {
                dplctSnsLst = new Array();
            }
            dplctSnsLst = dplctSnsLst.filter(dplctSns => dplctSns.snsId != snsId);

            if (! preventSvcJoin && dplctSnsLst.length == 0) {
                dCardSvcJoinEncouragement = true;
            } else {
                dCardSvcJoinEncouragement = false;
            }
        }

        showMicroServiceJoinEncouragePopup({trssSvcJoinEncouragement, dCardSvcJoinEncouragement});
    })
    ;
}

async function checkSvcRecommShowYn() {
    const RECOMM_SVC_TERMS_ID = '04bec5ee-1c11-11ef-b59d-0242ac130002';
    const resultData = await fetchByCall('GET_SVC_PRVC_AGRE_YN', {
        data: {
            svcId: RECOMM_SVC_TERMS_ID,
            snsId: snsId
        }
    });

    return (resultData == null || resultData.result == null
            || resultData.result.AGRE_TY_CD == null|| resultData.result.AGRE_TY_CD == 1);
}

/* (가입 간소화) 서비스 추천 팝업 노출 및 팝업 기본 이벤트 정의. */
function showMicroServiceJoinEncouragePopup(data) {
    sessionStorage.setItem('spfyLgnMicroSvcJoinRecomm', snsId);
    let trssRecomm = data.trssSvcJoinEncouragement;
    let dCardRecomm = data.dCardSvcJoinEncouragement;

    if (trssRecomm && dCardRecomm) {
        layerPopup.layerShow('joinRecommendationPop1');
    } else if (trssRecomm) {
        layerPopup.layerShow('joinRecommendationPop2');
    } else if (dCardRecomm) {
        layerPopup.layerShow('joinRecommendationPop3');
    }


    let svcDescrBnnrsEls = Array.from(document.querySelectorAll('.join_recommendation .banner a'));
    let trssDescrBnnrs = svcDescrBnnrsEls.filter(bnnr => bnnr.children[0].alt.indexOf('가볼래터') > -1);
    let dCardDescrBnnrs = svcDescrBnnrsEls.filter(bnnr => bnnr.children[0].alt.indexOf('관광주민증') > -1);

    trssDescrBnnrs.forEach(bnnr => bnnr.addEventListener('click', _=> {
        layerPopup.layerShow('serviceJoinPop1');
    }));

    document.querySelector('#serviceJoinPop1 .btn_close').addEventListener('click', _=> {
        $('#joinRecommendationPop1').append(`<div class="dimmed"></div>`);
        $('#joinRecommendationPop2').append(`<div class="dimmed"></div>`);
        $('#joinRecommendationPop3').append(`<div class="dimmed"></div>`);
    });

    dCardDescrBnnrs.forEach(bnnr => bnnr.addEventListener('click', _=> {
        layerPopup.layerShow('serviceJoinPop2');
    }));

    document.querySelector('#serviceJoinPop2 .btn_close').addEventListener('click', _=> {
        $('#joinRecommendationPop1').append(`<div class="dimmed"></div>`);
        $('#joinRecommendationPop2').append(`<div class="dimmed"></div>`);
        $('#joinRecommendationPop3').append(`<div class="dimmed"></div>`);
    });

    Array.from(document.querySelectorAll('.join_recommendation .bot_box > button')).forEach(btnEl => btnEl.addEventListener('click', e => {
        layerPopup.layerHide('joinRecommendationPop1');
        layerPopup.layerHide('joinRecommendationPop2');
        layerPopup.layerHide('joinRecommendationPop3');

        let doNotShowInptEl = e.target.previousElementSibling.previousElementSibling;
        if (doNotShowInptEl.checked) {
            addMicroServcieJoinRecommPolicyDisagreement();
        }
    }));

    Array.from(document.querySelectorAll('.join_recommendation .btn_area > a')).forEach(aEl => aEl.addEventListener('click', _=> {
        showLoding();
        sessionStorage.removeItem('spfyLgnMicroSvcJoinRecomm');
        let randomKey = Date.now();
        location.href = `/spfyLgn/clause?joinType=EXISTING&trssReq=${trssRecomm}&dCardReq=${dCardRecomm}&cacheClearRandomKey=${randomKey}`;
    }));
}

/* 서비스 가입 제안 팝업 영구 비노출 처리. */
function addMicroServcieJoinRecommPolicyDisagreement() {
    const RECOMM_SVC_TERMS_ID = '04bec5ee-1c11-11ef-b59d-0242ac130002';

    fetchByCall('SET_SVC_PRVC_AGRE_YN', {
        data: {
            svcId: RECOMM_SVC_TERMS_ID,
            snsId: snsId,
            agreTyCd: 0,
        }
    });
}

var baseApiUrl = 'https://korean.visitkorea.or.kr';
var mainurl = 'https://korean.visitkorea.or.kr';
var mainfileurl = 'https://cdn.visitkorea.or.kr';
var mainimgurl = 'https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=';
var mainfileurlpath = 'https://cdn.visitkorea.or.kr/img/call?cmd=TEMP_VIEW&name=';
var mainfiledownloadurl = 'https://cdn.visitkorea.or.kr/img/call?cmd=TEMP_VIEW&name=';
var mainUploadUrl = 'https://support.visitkorea.or.kr/img/call';
var supporturl = mainurl;
var domainIfno = 'https://korean.visitkorea.or.kr/json/jsp';
var domainIfno2 = 'https://korean.visitkorea.or.kr/json/jsp';
var partnersurl = 'https://vsup.visitkorea.or.kr';
var facebookappid = '1628836140497717';
// 발도장 이벤트 id
var stampId = '1589345b-b030-11ea-b8bd-020027310001';

var hostname  = location.hostname;

if (hostname.indexOf("localhost") > -1 || hostname.indexOf("127.0.0.1") > -1) {
    if (location.protocol == "https:") {
        mainurl = 'https://' + hostname + ':8443';
    } else {
        mainurl = 'http://' + hostname + ':8080';
    }
    baseApiUrl = 'https://dev.ktovisitkorea.com';
    mainfileurl = mainurl;
    mainimgurl = 'https://dev.ktovisitkorea.com/img/call?cmd=VIEW&id=';
    mainfileurlpath = 'https://dev.ktovisitkorea.com/img/call?cmd=TEMP_VIEW&name=';
    mainUploadUrl = 'https://dev.ktovisitkorea.com/img/call';
    facebookappid = '630196877343144';
    stampId = '1589345b-b030-11ea-b8bd-020027310001';
    supporturl = mainurl;
    partnersurl ='http://127.0.0.1:8080/visitKoreaAdmin';
    // localhost의 경우 검색 서버가 없으므로, 개발계 검색엔진 사용.
    domainIfno = 'https://dev.ktovisitkorea.com/json/jsp';
    domainIfno2 = 'https://dev.ktovisitkorea.com/json/jsp';
} else if (hostname.indexOf("kor.uniess.co.kr") > -1) {
    mainurl = 'https://kor.uniess.co.kr';
    mainfileurl = 'https://kor.uniess.co.kr';
    mainimgurl = 'https://kor.uniess.co.kr/img/call?cmd=VIEW&id=';
    mainfileurlpath = 'https://kor.uniess.co.kr/img/call?cmd=TEMP_VIEW&name=';
    mainUploadUrl = 'https://kor.uniess.co.kr/img/call';
    facebookappid = '630196877343144';
    stampId = '1589345b-b030-11ea-b8bd-020027310001';
    supporturl = mainurl;
} else if (hostname === "stage.visitkorea.or.kr") {
    baseApiUrl = 'https://stage.visitkorea.or.kr';
    mainurl = 'https://stage.visitkorea.or.kr';
    mainfileurl = 'https://support.visitkorea.or.kr';
    mainimgurl = 'https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=';
    mainfileurlpath = 'https://cdn.visitkorea.or.kr/img/call?cmd=TEMP_VIEW&name=';
    mainUploadUrl = 'https://support.visitkorea.or.kr/img/call';
    domainIfno = 'https://stage.visitkorea.or.kr/json/jsp';
    domainIfno2 = 'https://stage.visitkorea.or.kr/json/jsp';
    facebookappid = '630196877343144';
    stampId = '1589345b-b030-11ea-b8bd-020027310001';
    supporturl = mainurl;
    partnersurl ='https://stage.visitkorea.or.kr/visitKoreaAdmin';
} else if (hostname === "kor.visitkorea.or.kr") {
    mainurl = 'https://kor.visitkorea.or.kr';
    mainfileurl = 'https://kor.visitkorea.or.kr';
    mainimgurl = 'https://kor.visitkorea.or.kr/img/call?cmd=VIEW&id=';
    mainfileurlpath = 'https://kor.visitkorea.or.kr/img/call?cmd=TEMP_VIEW&name=';
    mainUploadUrl = 'https://kor.visitkorea.or.kr/img/call';
    domainIfno = 'https://korean.visitkorea.or.kr/json/jsp';
    domainIfno2 = 'https://korean.visitkorea.or.kr/json/jsp';
    facebookappid = '630196877343144';
    stampId = '1589345b-b030-11ea-b8bd-020027310001';
    supporturl = mainurl;
    partnersurl ='https://kor.visitkorea.or.kr/visitKoreaAdmin';
} else if (hostname === "vkor.visitkorea.or.kr") {
    mainurl = 'https://vkor.visitkorea.or.kr';
    domainIfno = 'https://vkor.visitkorea.or.kr/json/jsp';
    domainIfno2 = 'https://vkor.visitkorea.or.kr/json/jsp';
    facebookappid = '1628836140497717';
    stampId = '1589345b-b030-11ea-b8bd-020027310001';
} else if (hostname === "dev.ktovisitkorea.com") {
    baseApiUrl = 'https://dev.ktovisitkorea.com';
    mainurl = 'https://dev.ktovisitkorea.com';
    mainfileurl = mainurl;
    mainimgurl = 'https://dev.ktovisitkorea.com/img/call?cmd=VIEW&id=';
    mainfileurlpath = 'https://dev.ktovisitkorea.com/img/call?cmd=TEMP_VIEW&name=';
    mainUploadUrl = 'https://dev.ktovisitkorea.com/img/call';
    supporturl = mainurl;
    domainIfno = 'https://dev.ktovisitkorea.com/json/jsp';
    domainIfno2 = 'https://dev.ktovisitkorea.com/json/jsp';
    facebookappid = '1628836140497717';
    mainfiledownloadurl = 'https://dev.ktovisitkorea.com/img/call?cmd=TEMP_VIEW&name=';
    partnersurl ='https://dev.ktovisitkorea.com/visitKoreaAdmin';
}
let isProduction = function() {
    return mainurl.indexOf("korean.visitkorea.or.kr") !== -1
}()
var imgmode = '&mode=raw';
var imgmodeThumb = '&mode=thumb';
var detailheight = 610;

var pagingSize = 5;
var locationx = 0;
var locationy = 0;
var appYn = 'N';
var mobileYn = 'N';
var responsiveWebType;// P: PC, T: Tablet, M: Mobile
var uid = '';
var loginYn = 'N';
var getLocationYn = 'N';
var GetLocationChk = 'N';
var userImgYn = 'N';
var permitLocation = '';
var gaCookie = '';
var ShareTitle = '';
var ShareDesc1 = '';
var ShareDesc2 = '';
var sContentTitle;
var sContentImg;
var sContentId;
var sContentType;
var sOtdid = '';
var sloginType = '';
var beforeUrl = '';
var server = location.href;
var protocol = location.protocol;
var bannerview = false;
var ssoprivacyagree = 'N';
getAppYn();

function showGeolocationInfoPrvdAgrePopup(agreeCallback, rejectCallback) {
    if (document.querySelector('#locationServicePop') == null) {
        addGeolocationInfoPrvdAgrePopupLayer();
    }
    if (document.querySelector('#locationServicePop').className.indexOf('eventAdded') == -1) {
        addGeolocationInfoPrvdAgrePopupDefaultEvent();
    }
    addGeolocationInfoPrvdAgrePopupCallbackEvent(agreeCallback, rejectCallback);

    layerPopup.layerShow('locationServicePop');
}

/**
 * 위치정보 제공동의 약관 팝업 이벤트 초기화.
 */
function addGeolocationInfoPrvdAgrePopupDefaultEvent() {
    const anchorHowToUseEl = document.querySelector('#locationServicePop .link > a:first-child');
    const anchorLocTermsEl = document.querySelector('#locationServicePop .link > a:nth-child(2)');
    const anchorPerTermsEl = document.querySelector('#locationServicePop .link > a:nth-child(3)');

    document.querySelector('#locationServicePop').style.zIndex = 200000;
    if (appYn == 'Y') {
        anchorLocTermsEl.href = `opentab://${mainurl}/term/term01.do?frmSpfyLgnApp=true`;
        anchorHowToUseEl.href = `opentab://${mainurl}/detail/rem_detail.do?cotid=6b3a7a2f-cffc-483e-b3c6-f74bf974dc8c&con_type=10000&frmSpfyLgnApp=true`;
        anchorPerTermsEl.href = `opentab://${mainurl}/term/term04.do?frmSpfyLgnApp=true`;
    } else {
        anchorHowToUseEl.href = `${mainurl}/detail/rem_detail.do?cotid=6b3a7a2f-cffc-483e-b3c6-f74bf974dc8c&con_type=10000`;
        anchorHowToUseEl.target = '_blank';
        anchorLocTermsEl.href = `${mainurl}/term/term01.do`;
        anchorLocTermsEl.target = '_blank';
        anchorPerTermsEl.href = `${mainurl}/term/term04.do`;
        anchorPerTermsEl.target = '_blank';
    }

    document.querySelector('#locationServicePop').className += ' eventAdded';
}

function addGeolocationInfoPrvdAgrePopupLayer() {
    let footerEl = document.querySelector('#footer');
    if (footerEl == null) {
        return;
    }

    let geolocPrvdAgrePopup = `
        <div id="locationServicePop" class="wrap_layerpop">
            <div class="layerpop">      
                <div class="box_cont">
                    <strong>위치기반 서비스 이용 동의</strong>
                    <p>
                        한국관광공사 대한민국 구석구석 홈페이지는 위치 정보의 <br>보호 및 이용 등에 관한 법률에 따라 현재 위치 확인, 
                        주변 <br>관광지 찾기가 포함된 서비스 이용을 위해서 위치기반 <br>서비스 이용 약관 동의가 필요합니다.
                        동의하지 않는 경우 <br>위치기반 서비스 이용에 제약을 받을 수 있습니다.
                    </p>
                    <div class="link">
                        <a href="javascript:;">위치 서비스 이용 방법 안내</a>
                        <a href="javascript:;">위치기반 서비스 이용약관 보기</a>
                        <a href="javascript:;">개인위치정보 처리방침 보기</a>
                    </div>
                    <div class="btn">
                        <a href="javascript:;">거절</a>
                        <a href="javascript:;">동의</a>
                    </div>
                </div>
                <button type="button" class="btn_close" onclick="layerPopup.layerHide('locationServicePop');">닫기</button>
            </div>
        </div>
    `;

    footerEl.innerHTML += geolocPrvdAgrePopup;
}

/**
 * 팝업에 전달받은 콜백을 추가 (팝업 열 때 매번 확인하여 추가).
 */
function addGeolocationInfoPrvdAgrePopupCallbackEvent(agreeCallback, rejectCallback) {
    const popupCloseBtnEl = document.querySelector('#locationServicePop .btn_close');
    const rejectBtnEl = document.querySelector('#locationServicePop .box_cont > .btn > a:first-child');
    const agreeBtnEl = document.querySelector('#locationServicePop .box_cont > .btn > a:nth-child(2)');

    popupCloseBtnEl.onclick = async _=> {
        localStorage.removeItem('useGeolocDataAgre');
        localStorage.removeItem('useGeolocDataAgreYn');
        if (appYn == 'Y' && snsId != null) {
            await saveGeolocAgreData(false);
            layerPopup.layerHide('locationServicePop');
        } else {
            layerPopup.layerHide('locationServicePop');
        }
        if (typeof rejectCallback == 'function') {
            rejectCallback();
        }
    }
    rejectBtnEl.onclick = async _=> {
        localStorage.removeItem('useGeolocDataAgre');
        localStorage.removeItem('useGeolocDataAgreYn');
        if (appYn == 'Y' && snsId != null) {
            await saveGeolocAgreData(false);
            layerPopup.layerHide('locationServicePop');
        } else {
            layerPopup.layerHide('locationServicePop');
        }
        if (typeof rejectCallback == 'function') {
            rejectCallback();
        }
    }
    agreeBtnEl.onclick = async _=> {
        if (appYn == 'Y' && snsId != null) {
            await saveGeolocAgreData(true);
            localStorage.setItem('useGeolocDataAgre', snsId);
            layerPopup.layerHide('locationServicePop');
            if (typeof agreeCallback == 'function') {
                agreeCallback();
            }

        } else {
            localStorage.setItem('useGeolocDataAgreYn', true);
            layerPopup.layerHide('locationServicePop');
            if (typeof agreeCallback == 'function') {
                agreeCallback();
            }
        }
    };
}

function setDist(val) {
    let val2 = val + "";
    let distval;
    let dot = val2.indexOf(".");
    distval = val2.substr(0,dot);
    distval += val2.substr(dot,2);

    return distval;
}

function showSetup() {
    if ( appYn == 'Y') {
        $('#app_setup').css("display", "block");
    }
}

/*
 * 간소화 회원가입 로직 시작.
 *
 * (  만약 앱에서 로그인 한 경우,
 *   authByToken 메서드가 앱 로그인 완료 후 콜백으로 실행되는 걸 대체하기 위하여
 *
 *   loginResult.jsp 페이지에
 *   authByToken 함수를 본 함수로 변경하는 로직을 추가하였습니다.. )
 */
var goSpfyJoinStep = (authByTokenParam) => {
    let authByTokenParamJSONStr = encodeURIComponent(JSON.stringify(authByTokenParam));
    fetchByCall('ADD_INSTANT_LOGGER_LOG'
            , {title: 'javascript:global.js, goSpfyJoinStep();', content: `authByTokenParam: ${authByTokenParamJSONStr}`});

    if (typeof authByToken != 'undefined') {
        sessionStorage.setItem('authByTokenParam', authByTokenParam);
    }

    if (checkSpecificExceptionalCase()) {
        return;
    }

    setTimeout(_=> {
        if (document.querySelector('#serviceJoinPop') == null) {
            addServiceJoinPopupLayer();
        } else {
            addServiceJoinPopupEvent();
        }

        if (location.href.indexOf('login.do') != -1) {
            layerPopup.layerShow('serviceJoinPop');
            callAppNativeFunction({'domain': window.location.host, 'code': 201}, 'sendCrashlyticsError');

        } else {
            try {  layerPopup.layerHide('socialLogin');  } catch {}
            try {  document.querySelector('#socialLogin').style.display = 'none';  } catch {}
            try {  layerPopup.layerHide('login');  } catch {}
            try {  document.querySelector('#login').style.display = 'none';  } catch {}

            layerPopup.layerShow('serviceJoinPop');

            callAppNativeFunction({'domain': window.location.host, 'code': 202}, 'sendCrashlyticsError');

        }
    }, 750);
}

let checkSpecificExceptionalCase = _=> {
    let hasExceptionalUrl = false;
    // 로그인 시도한 페이지 URL을 통해서, 특정 예외 케이스에 해당하면 로직을 실행. (ex: 서비스 가입 페이지.. 등)
    let beforeLoginPage = location.href;

    let randomKey = Date.now();
    if (beforeLoginPage.indexOf('/list/travelbenefit.do?service=trss') > -1) {
        showLoding();
        location.href = `/spfyLgn/clause?joinType=VIP&trssReq=true&dCardReq=false&cacheClearRandomKey=${randomKey}`;
        hasExceptionalUrl = true;

    } else if (beforeLoginPage.indexOf('/list/travelbenefit.do?service=digt') > -1
        || beforeLoginPage.indexOf('/dgtlCard/useBnfitInflow.do') > -1
        || beforeLoginPage.indexOf('/common/login/dgtourcard-login.do') > -1
        ) {
        showLoding();
        location.href = `/spfyLgn/clause?joinType=VIP&trssReq=false&dCardReq=true&cacheClearRandomKey=${randomKey}`;
        hasExceptionalUrl = true;

    } else if (beforeLoginPage.indexOf('/dgtlCard/useBnfitInterface') > -1) {
        showLoding();
        sessionStorage.setItem('fromDigtCardQrScan', true);
        sessionStorage.setItem('beforeUrl', beforeLoginPage);
        if (typeof insttCertCd != 'undefined') {
            sessionStorage.setItem('beforeUrlCertCd', insttCertCd);
        }
        setTimeout(_=> {
            location.href = `/spfyLgn/clause?joinType=VIP&trssReq=false&dCardReq=true&cacheClearRandomKey=${randomKey}`;
        }, 500);
        hasExceptionalUrl = true;
    }

    if (! (beforeLoginPage.indexOf('/dgtlCard/useBnfitInterface') > -1 || beforeLoginPage.indexOf('/dgtlCard/useBnfitInflow.do') > -1)) {// QR 스캔 후 회원가입 도중 이탈하여 회원가입 임시 데이터가 남아있는 경우 제거.
        sessionStorage.removeItem('fromDigtCardQrScan');
        sessionStorage.removeItem('beforeUrlCertCd');
    }
    return hasExceptionalUrl;
}

/* 서비스 가입 종류 선택 팝업 추가. */
let addServiceJoinPopupLayer = _=> {
    let footerEl = (() => {
      if (isAppMain()) {
        return document.querySelector('#footerMobile')
      }
      return document.querySelector('#footer')
    })();

    let serviceJoinPopup = `
        <div id="serviceJoinPop" class="wrap_layerpop" style="z-index: 12001;">
            <div class="layerpop">      
                <strong class="tit">서비스 가입 종류 선택</strong>
                <div class="box_cont">
                    <div class="tab">
                        <ul>
                            <li><a href="#joinTab1">일반 회원</a></li>
                            <li class="on"><a href="#joinTab2">플러스 회원</a></li>
                        </ul>
                    </div>
                    <div class="tab_cont general" id="joinTab1">
                        <strong>일반 회원</strong>
                        <p>본인 인증절차 없이 기본 서비스만 이용하기</p>
                        <ul>
                            <li>가볼래-터, 디지털 관광주민증 서비스 제외</li>
                            <li>추가 서비스를 이용하려면 플러스 회원을 선택해 주세요.</li>
                        </ul>
                        <div class="btn"><button type="button">가입하기</button></div>
                    </div>
                    <div class="tab_cont vip active" id="joinTab2">
                        <strong>플러스 회원</strong>
                        <p>본인 인증하고 추가 서비스 이용하기<br>(14세 미만 사용자는 일반 회원 가입만 가능)</p>
                        <ul>
                            <li>
                                <input type="checkbox" id="serviceJoin01" checked="checked">
                                <label for="serviceJoin01">[가볼래-터] 국내 여행 정보 무료 구독 서비스</label>
                                <button type="button">안내팝업</button>
                            </li>
                            <li>
                                <input type="checkbox" id="serviceJoin02" checked="checked">
                                <label for="serviceJoin02">[디지털 관광주민증] 지역 여행에 필요한 혜택 제공</label>
                                <button type="button">안내팝업</button>
                            </li>
                        </ul>
                        <div class="btn"><button type="button">가입하기</button></div>
                    </div>
                </div>
                <button type="button" class="btn_close">닫기</button>
            </div>
        </div>
    `

    if (isAppMain()) {
      document.body.innerHTML += serviceJoinPopup;

    } else if (footerEl != null) {
      footerEl.innerHTML += serviceJoinPopup;

    } else {
      document.body.innerHTML += serviceJoinPopup;
    }
    addServiceJoinPopupEvent();
}

/* 서비스 가입 종류 선택 팝업의 이벤트 정의. */
let addServiceJoinPopupEvent = _=> {
    if (!isDOMContentLoaded) {
        addEventListener('DOMContentLoaded', addServiceJoinPopupEvent);
        return;
    }

    if (addServiceJoinPopupEvent.isJoinPopupEventHandlerAdded) {
        return;
    }
    addServiceJoinPopupEvent.isJoinPopupEventHandlerAdded = true;

    $("#serviceJoinPop .tab a").click(function() {
        let tabParent = $(this).parent();
        $('#serviceJoinPop .tab li').removeClass('on');
        if (!tabParent.hasClass('on')){
            tabParent.addClass("on");
        } else {
            $('#serviceJoinPop .tab li').removeClass('on');
        }

        let activeTab = $(this).attr("href");
        $(".tab_cont").removeClass('active');
        $(activeTab).addClass('active');
        return false;
    });

    document.querySelector("#serviceJoin01").nextElementSibling.nextElementSibling.addEventListener('click', _=> {
        document.querySelector("#serviceJoinPop1").style.zIndex = 15000;
        layerPopup.layerShow('serviceJoinPop1');
    });

    if (document.querySelector('#serviceJoinPop1 .btn_close') != null) {
        document.querySelector('#serviceJoinPop1 .btn_close').addEventListener('click', _=> {
            $('#serviceJoinPop').append(`<div class="dimmed"></div>`);
        });
    }

    document.querySelector("#serviceJoin02").nextElementSibling.nextElementSibling.addEventListener('click', _=> {
        document.querySelector("#serviceJoinPop2").style.zIndex = 15000;
        layerPopup.layerShow('serviceJoinPop2');
    });

    if (document.querySelector('#serviceJoinPop2 .btn_close') != null) {
        document.querySelector('#serviceJoinPop2 .btn_close').addEventListener('click', _=> {
            $('#serviceJoinPop').append(`<div class="dimmed"></div>`);
        });
    }

    document.querySelector('#serviceJoinPop .btn_close').addEventListener('click', e => {

        if (confirm('회원가입이 완료되지 않았습니다. \n가입을 취소하시겠습니까?')) {
            layerPopup.layerHide('serviceJoinPop');

            const isLoginPopupNotCommonPage = _=> {
                if (location.href.includes('login.do')) {
                    return false;
                }
                return true;
            }

            if (isLoginPopupNotCommonPage()
                && document.querySelector('#socialLogin') != null) {

                try {
                    layerPopup.layerHide('socialLogin');
                } catch {}
                try {
                    document.querySelector('#socialLogin').style.display = 'none';
                } catch {}
            }
            if (isLoginPopupNotCommonPage()
                && document.querySelector('#login') != null) {

                try {
                    layerPopup.layerHide('login');
                } catch {}
                try {
                    document.querySelector('#login').style.display = 'none';
                } catch {}
            }
            removeSpfyJoinSessionData();
        }
    });

    document.querySelector('#serviceJoinPop .general > .btn > button')
    .addEventListener('click', e => {
        showLoding();
        let randomKey = Date.now();
        if (e.target.className.indexOf('off') < 0) {
            location.href = `/spfyLgn/clause?joinType=GENERAL&cacheClearRandomKey=${randomKey}`;
        }
    });

    document.querySelector('#serviceJoinPop .vip > .btn > button')
    .addEventListener('click', e => {
        if (e.target.className.indexOf('off') < 0) {
            decideServiceVipJoinNextStep();
        }
    });

    let chckEls = Array.from(document.querySelectorAll('#serviceJoinPop input[type=checkbox]'));
    chckEls.forEach(
        el => el.addEventListener('change', e => {
            let hasChckEl = chckEls.some(t => t.checked);

            document.querySelector('#serviceJoinPop .vip > .btn > button').className = hasChckEl ? '' : 'off';
        })
    );
}

/* 사용자의 서비스 가입 선택 여부에 따라, 다음 스텝을 정의. */
let decideServiceVipJoinNextStep = _=> {
    showLoding();

    if (location.href.indexOf('/spfyLgn/') == -1) {
        sessionStorage.setItem('beforeUrl', location.href);
    }

    let trssChck = document.getElementById('serviceJoin01').checked;
    let dCardChck = document.getElementById('serviceJoin02').checked;
    let randomKey = Date.now();

    location.href = `/spfyLgn/clause?joinType=VIP&trssReq=${trssChck}&dCardReq=${dCardChck}&cacheClearRandomKey=${randomKey}`;
}

/* 간소화 가입 절차 진행에 따라 세션에 정의한 임시 데이터를 초기화. */
let removeSpfyJoinSessionData = _=> {
    fetchByCall('RMV_SPFY_JOIN_TMPR_DATA_FRM_SESSION');
}

/**
 * 간소화 가입 진행 중 앱에서 소셜 로그인 가입 시,
 * 웹 뷰의 새 창 켜짐으로 인한 앱 세션과의 세션 불일치 이슈에 대하여
 * 후처리(앱 세션에 데이터 저장)를 지원하는 함수.
 */
function addSpfyTmpDataToAppSessionNGoSpfyJoinStep(usrInfoJSONStr) {
    fetchByCall('ADD_SPFY_TMP_DATA_TO_APP_SESSION', {
        usrData: JSON.parse(usrInfoJSONStr)
    })
    .then(goSpfyJoinStep)
    .catch(e => {
        addErrorToInstantLoggerLog(e, 'ERROR :: javascript:global.js, addSpfyTmpDataToAppSessionNGoSpfyJoinStep();');
        alert('일시적인 오류가 발생하였습니다. \n잠시후에 다시 시도해주세요.');
    });
}

// 로그인후 reload - app
var authByToken = token => {
    let tokenJSONStr = encodeURIComponent(JSON.stringify(token));
    fetchByCall('ADD_INSTANT_LOGGER_LOG'
            , {title: 'javascript:global.js, authByToken();', content: `token: ${tokenJSONStr}`});
    if (token.indexOf('fromSpfyJoin') > -1) {// 가입 간소화 단계 추가로 인한, 간소화 진형 여부 확인 및 분기.
        let usrInfoJSONStr = token.replace('fromSpfyJoin,', '');
        if (usrInfoJSONStr.indexOf('%22') > -1) {
            usrInfoJSONStr = decodeURIComponent(usrInfoJSONStr);
        }
        addSpfyTmpDataToAppSessionNGoSpfyJoinStep(usrInfoJSONStr);

        return;
    }

    var tokenArr = token.split(',');
    var uuid = tokenArr[0];
    var autoLogin = tokenArr[1];

    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'SNS_SESSION_SAVE',
            uuid : uuid,
            autoLogin : autoLogin
        },
        success: function(data) {
            loginResult();
            if (appYn == 'Y' && data.body.result != null && data.body.result[0] != null) {
                transmitAppGroobeeCdpData(data.body.result[0], false);// false: Auto Login 여부.
            }
        },
        complete: function() {
            callAppNativeFunction({'domain': window.location.host, 'code': 210}, 'sendCrashlyticsError');
        }
    });
}

//마이그레이션 후 reload - web
function migrationResult() {
    sessionStorage.setItem('migration', 'Y');
    window.location.reload(true);
}

function privacyagreechk(){
    if (!$("#mainAgreement input:checkbox[id='check01']").prop("checked")) {
        alert('서비스 이용약관에 동의를 하셔야 합니다.');
        $('#mainAgreement #check01').focus();
        return;
    }

    if (!$("#mainAgreement input:checkbox[id='check02']").prop("checked")) {
        alert('개인정보 수집 및 이용에 동의를 하셔야 합니다.');
        $('#mainAgreement #check02').focus();
        return;
    }

    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'SET_SSO_AGREE'
        },
        success: function(data) {
            $('body').css('overflow', '');
            if (data.header.process != 'success') {
                alert("알 수 없는 오류가 발생하였습니다.");
            }
            location.reload();
        }
    });
}

$(document).on("click", "#plogin", function(){
    goPartnersLogin();
});

// 로딩화면 show
function showLoding() {
    if ($('.loading').hasClass('defaultloading')) {
        $('.loading').show();
    }
}

// 로딩화면 show
function hideLoding() {
    $('.loading').hide();
}

function disableScroll() {
    document.body.style.overflow = 'hidden'
    document.querySelector('html').scrollTop = window.scrollY
}

function enableScroll() {
    document.body.style.overflow = '';
}

function shareHistory(kind, shareCotid) {
    if (trssChk == true) {
        shareCotid = '5b838244-5d29-401d-a99e-e5783f3be7cb';
    } // 마이페이지 COT_ID 5b838244-5d29-401d-a99e-e5783f3be7cb 공유하기 하드코딩

    let sharekind;

    if ( kind == 'facebook' ) {
        sharekind = 0;
    } else if (kind == 'twitter') {
        sharekind = 1;
    } else if (kind == 'kakaostory') {
        sharekind = 2
    } else if (kind == 'kakaotalk') {
        sharekind = 3
    } else if (kind == 'band') {
        sharekind = 4
    }

    if (typeof (ShareNewsSave) == 'function') {
        ShareNewsSave(sharekind);
        return;
    }

    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'SHARE_HISTORY_SAVE',
            sharekind : sharekind+'',
            // SNS 타입 : 000 ::
            // FACEBOOK, 001 ::
            // TWITTER, 002 ::
            // KAKAOSTORY , 003
            // :: KAKAOTALK, 004
            // :: BAND'
            cotid : shareCotid
        },
        success: function(data) {
            $("#conShare").text(Number($("#conShare").text())+1);

            if ($("#conShare2").length >0){
                $("#conShare2").text(Number($("#conShare2").text())+1);
            }
        }
    });
}

function mainLogAndMove(id, url){
    if (isAppMain()) {
        const traceConsumeRequest = new PersonalizationConsume({
          typeName: 'F',
          typeDescription: '스페셜관',
          page: 'app_main',
          snsId
        })
        __save([ traceConsumeRequest ])
    }
    goMainLogSave(id);
    location.href = url;
}

function goSubMainMarketingSave( rkind, rlinkurl, rtitle, rcotid, rcontenttype ) {
    let maintitle = '';

    if (rkind == 'Recom') {
        maintitle = '추천메인';
    } else if (rkind == 'Course') {
        maintitle = '코스메인';
    } else if (rkind == 'Tour') {
        maintitle = '명소목록';
    } else if (rkind == 'Notice') {
        maintitle = '소식목록';
    }  else if (rkind == 'QnA') {
        maintitle = 'QnA';
    }

    goBannerLogSave( maintitle,rlinkurl, rtitle);

    setTimeout(function () {
        if ( rcotid == 'undefined' || rcotid == 'null' ) {
            if ( rlinkurl.indexOf(mainurl) > -1  ) {
                location.href = rlinkurl;
            } else {
                window.open(rlinkurl)
            }
        } else {
            if ( rcontenttype == '12' || rcontenttype == '14' || rcontenttype == '28' || rcontenttype == '38' || rcontenttype == '39' || rcontenttype == '32' || rcontenttype == '2000') {
                location.href = mainurl+'/detail/ms_detail.do?cotid='+rcotid;
            } else if ( rcontenttype == '15' ) {
                location.href = mainurl+'/detail/fes_detail.do?cotid='+rcotid;
            } else if ( rcontenttype == '25' ) {
                location.href = mainurl+'/detail/cs_detail.do?cotid='+rcotid;
            } else {
                if (rcontenttype == undefined || rcontenttype == null || rcontenttype == ''){
                    location.href = mainurl+'/detail/rem_detail.do?cotid='+rcotid+'&con_type=10000';
                } else {
                    location.href = mainurl+'/detail/rem_detail.do?cotid='+rcotid+'&con_type='+rcontenttype;
                }
            }
        }
    }, 200) ;
}

function goMypage() {
    if (loginYn == 'N') {
        showLogin(1);
    } else {
        if ( sloginType == '10' ) {
            layerPopup.layerShow('cosConfirm4');
            return;
        } else {
            location.href = "/mypage/mypage_main.do";
        }
    }
}

function addCookie(name, value, expire, unit) {
    const date = new Date()
    const expiry = getPlusDateTime(date, expire, unit)
    addCookie(name, value, expiry)
}

function addCookie(name, value, expiry) {
    document.cookie = name + '=' + escape(value) + '; path=/; expires=' + expiry.toString() + ';'
}

// 쿠키 설정
function setCookie(name, value, expiredays) {
    let todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + expiredays);

    if (getDevice() == 'Android' && appYn == 'Y') { // AOS 앱일때는 로컬스토리지 사용
        setAndroidAppLS(name, value, 1440);
    } else {
        document.cookie = name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";";
    }
}

//쿠키 불러오기
function getCookie(name) {
    if (getDevice() == 'Android' && appYn == 'Y') { // AOS 앱일때는 로컬스토리지 사용
        let result = getAndroidAppLS(name);
        if (result == null) {
            return gatherCookie(name);
        }
        return result;

    } else {
        return gatherCookie(name);
    }
}

function gatherCookie(name) {
    let obj = name + "=";
    let x = 0;
    while (x <= document.cookie.length) {
        let y = (x+obj.length);
        if ( document.cookie.substring( x, y ) == obj ) {
            if ((endOfCookie=document.cookie.indexOf( ";", y )) == -1 )
                endOfCookie = document.cookie.length;
            return unescape( document.cookie.substring( y, endOfCookie ) );
        }
        x = document.cookie.indexOf( " ", x ) + 1;
        if ( x == 0 ) {
            break;
        }
    }
}

function setAndroidAppLS(key, value, expirationMinutes) {
    let expirationMs = expirationMinutes * 60 * 1000;
    let now = new Date().getTime();
    let item = {
        value: value,
        expiration: now + expirationMs
    };
    localStorage.setItem(key, JSON.stringify(item));
}

function getAndroidAppLS(name) {
    let item = JSON.parse(localStorage.getItem(name));
    if (!item || new Date().getTime() > item.expiration) {
        localStorage.removeItem(name);
        return null;
    }
    return item.value;
}

function removeCookie(name){
    document.cookie = name + '=; expires=Thu, 01 Jan 2023 00:00:10 GMT;';
    if (getDevice() == 'Android' && appYn == 'Y') { // AOS 앱일때는 로컬스토리지 사용
        localStorage.removeItem(name);
    }
}

function hiddenbanner() {
    $('.bannerLayer').removeClass('on');
}

function openWindow(linkurl,domainYn) {
    if (appYn == 'Y') {
        if (domainYn) {
            if (linkurl.indexOf(mainurl) == -1) {
                location.href = "opentab://" + linkurl;
            } else {
                location.href = linkurl;
            }
        } else {
            location.href = "opentab://" + linkurl;
        }
    } else {
        let popup = window.open(linkurl);
        if (popup == null){
            if (confirm("팝업차단설정이 되어있습니다. 팝업을 현재창에서 여시겠습니까?")){
                location.href = linkurl;
                return;
            }
        }
    }
}

function openImg(imgId) {
    if (appYn == 'Y') {
        location.href = "opentab://"+mainurl+'/common/image_viewer.do?imgId=' + imgId;
    } else {
        let imgObj = new Image();
        imgObj.src = mainimgurl + imgId;
        setTimeout(function(){
            imageWin = window.open("", "profile_popup", "width=" + imgObj.width + "px, height=" + imgObj.height + "px");
            imageWin.document.write("<html><body style='margin:0; overflow-x:hidden; overflow-y:hidden;'>");
            imageWin.document.write("<a href=javascript:window.close()><img src='" + imgObj.src + "' border=0></a>");
            imageWin.document.write("</body><html>");
            imageWin.document.title = "Image Viewer";
        }, 100);
    }
}

function eventShare(kind){
    getShuturlEvent(mainurl + '/sns/snsShare.jsp?cotid=' + sContentId + '&contenttype=' + sContentType + '&title=' + sContentTitle + '&img=' + sContentImg,kind);
}

function goDetail(cotId, mod){
    if (mod == 'openWindow'){
        openWindow(mainurl + '/detail/detail_view.do?cotid=' + cotId);
    } else {
        location.href = '/detail/detail_view.do?cotid=' + cotId;
    }
}

function goTagList(ctype, tagname, rtagid ) {
    let agent = navigator.userAgent.toLowerCase();
    if (agent.indexOf('trident') != -1) {
        tagname = encodeURIComponent(tagname);
    }

    goTagLogSave(rtagid);

    setTimeout(function () {
        if ( ctype == '15' ) {
            location.href = '/list/fes_list.do?choiceTag=' + tagname + '&choiceTagId=' + rtagid;
        } else if ( ctype == '25' ) {
            location.href = '/list/cs_list.do?choiceTag=' + tagname + '&choiceTagId=' + rtagid;
        } else {
            location.href = '/list/ms_list.do?choiceTag=' + tagname + '&choiceTagId=' + rtagid;
        }
    }, 200) ;
}

function profileImg(items){
    let profileImg = '';

    if (items.snsImg === '') {
        profileImg = '';
    } else if (items.snsImg.indexOf("http") > -1) {
        profileImg = items.snsImg.replace('http://', 'https://');
        profileImg = profileImg.replace('th-p.talk.kakao.co.kr', 'k.kakaocdn.net');
    } else {
        profileImg = mainimgurl + items.snsImgId;
    }

    let strHtml = ' <div class="profile">';
    if (items.snsType == '10'){
        strHtml += '        <div class="photo"></div>';
    } else {
        strHtml += '        <div class="photo"><img id="' + items.snsId + '" src="' + profileImg + '" alt="' + items.userName + ' 님의 프로필 사진" onerror="this.style.visibility=\'hidden\'"></div>';

        switch (items.snsType+'') { // 프로필 사진
            case '0':   // 페이스북
                strHtml += '<span class="ico"><img src="../resources/images/sub/ico_facebook.png" alt="페이스북"></span>';
                break;
            case '1':   // 트위터
                strHtml += '<span class="ico"><img src="../resources/images/sub/ico_twitter.png" alt="트위터"></span>';
                break;
            case '2':   // 인스타그램
                strHtml += '<span class="ico"><img src="../resources/images/sub/ico_insta.png" alt="인스타그램"></span>';
                break;
            case '4':   // 네이버
                strHtml += '<span class="ico"><img src="../resources/images/sub/ico_naver.png" alt="네이버"></span>';
                break;
            case '5':   // 카카오톡
                strHtml += '<span class="ico"><img src="../resources/images/sub/ico_kakao.png" alt="카카오톡"></span>';
                break;
            case '6':   // 구글
                strHtml += '<span class="ico"><img src="../resources/images/sub/ico_plus.png" alt="구글"></span>';
                break;
            case '7':   // 애플
                strHtml += '<span class="ico"><img src="../resources/images/sub/ico_apple.png" alt="애플"></span>';
                break;
        }
    }
    strHtml += '    </div>';

    return strHtml;
}

function getSnsProfileImageUrl(imagePath, customImageYN, imgId) {
    let profileImageUrl = imagePath;

    if (customImageYN == 'Y' && imgId != null) {
        profileImageUrl = mainimgurl + imgId;

    } else if (imagePath != null) {
        profileImageUrl = imagePath;

        if (profileImageUrl != '') {
            profileImageUrl = profileImageUrl.replace('http://', 'https://');
            profileImageUrl = profileImageUrl.replace('th-p.talk.kakao.co.kr', 'k.kakaocdn.net');
        }
    }

    if (profileImageUrl == null || profileImageUrl == '' || profileImageUrl.indexOf('https://scontent-ssn1') != -1 || profileImageUrl.indexOf('https://ssl.pstatic.net') != -1 || profileImageUrl.indexOf('dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0') != -1) {
        if (getResponsiveTypeByDeviceWidth() == 'M') {
            profileImageUrl = '/resources/images/common/ico_m_profile01.png';

        } else {
            profileImageUrl = '/resources/images/common/icon_header_profile2.png';
        }
    }

    return profileImageUrl;
}

function getRegionNameByCode(code) {
    switch (code) {
        case 1: return "서울";
        case 2: return "인천";
        case 3: return "대전";
        case 4: return "대구";
        case 5: return "광주";
        case 6: return "부산";
        case 7: return "울산";
        case 8: return "세종시";
        case 31: return "경기도";
        case 32: return "강원도";
        case 33: return "충청북도";
        case 34: return "충청남도";
        case 35: return "경상북도";
        case 36: return "경상남도";
        case 37: return "전라북도";
        case 38: return "전라남도";
        case 39: return "제주도";
        default: return "";
    }
}

function getRegionCodeByName(name) {
    switch (name) {
        case "서울": return  1;
        case "인천": return  2;
        case "대전": return  3;
        case "대구": return  4;
        case "광주": return  5;
        case "부산": return  6;
        case "울산": return  7;
        case "세종시": return  8;
        case "경기":
        case "경기도": return 31;
        case "강원":
        case "강원도": return 32;
        case "충북":
        case "충청북도": return 33;
        case "충남":
        case "충청남도": return 34;
        case "경북":
        case "경상북도": return 35;
        case "경남":
        case "경상남도": return 36;
        case "전북":
        case "전라북도": return 37;
        case "전남":
        case "전라남도": return 38;
        case "제주":
        case "제주도": return 39;
        default: return -1;
    }
}

function setGtmSnsDimensions() {
    if (typeof dataLayer == 'undefined' || dataLayer == null) {
        return;
    }

    let d7 = snsId == null ? null : snsId;
    let d8 = snsRegYmd == null ? null : snsRegYmd;
    let d9 = loginYn == 'Y' ? loginYn : null;
    let d10 = snsChannel == null ? null : snsChannel;

    dataLayer.push({
        "dimension7": d7,
        "dimension8": d8,
        "dimension9": d9,
        "dimension10": d10,
    });
}

$.ajaxSetup({
    beforeSend: function(xmlHttpRequest, settings) {
        const uri = settings.data
        if (uri === undefined) {
            return
        }
        try {
            /**
             * - 관리 항목
             * 콘텐츠 상세 소비 : VIEW
             * 좋아요 : LIKE
             * 즐겨찾기 : BOOKMARK
             * 공유하기 : SHARE
             * 사용자 사진 등록 : UPLOAD_PHOTO
             * 관광정보 수정요청 : REQUEST_EDIT_CONTENT
             * 인쇄하기 : PRINT
             * 사용자 댓글 작성 : COMMENT
             * 사용자 댓글 좋아요 : COMMENT_LIKE
             * 사용자 댓글 답글 작성 : COMMENT_REPLY
             * 태그 클릭 : TAG
             * 지역 클릭 : AREA
             * 네비 호출 : NAVI
             * 여행구독 가볼래/안가볼래, 구독신청/탈퇴 : TRSS
             * AI콕콕플래너 생성 : ABC_COURSE
             * 발도장 찍기 / 사용자 만족도 별점: STAMP
             * 별로에요 피드백 : FEEDBACK
             * 디지털주민증 신청/탈퇴 : DIGT
             * Q&A 등록 : QA
             * 사용자 코스 생성 : USER_COURSE
             * 이벤트플랫폼 이벤트 참여 : EVENT
             */
            const traceCommands = [
                "CONTENT_VIEW_LOG_SAVE",    //  콘텐츠 상세 소비
                "CONTENT_LIKE_SAVE",    //  좋아요
                "FAVO_CONTENTINFO_SAVE",    //  즐겨찾기
                "SHARE_HISTORY_SAVE",   //  공유하기
                "USER_IMG_UPLOAD",  //  사용자 사진 등록
                "MY_JIKIMI_SAVE",   //  관광정보 수정요청
                "MY_JIKIMI_HISTORY_SAVE",   //  관광정보 신규,수정요청
                "PRINT_CONTENT_LOG_SAVE",   //  인쇄하기
                "CONTENT_COMMENT_SAVE", //  사용자 댓글 작성
                "SNS_COMMENT_LIKE_SAVE",    //  사용자 댓글 좋아요
                "CONTENT_RECOMMENT_SAVE",   //  사용자 댓글 답글 작성
                "TAG_LOG_SAVE", //  태그 클릭
                "AREA_TAB_VIEW",    //  지역 클릭 - 지역메인 > 지자체 쇼케이스
                "AREA_LOG_SAVE",    //  지역 클릭 - 지역메인 > 지자체 쇼케이스 or 지역 클릭 - AI콕콕플래너 > 코스만들기
                "ABC_COURSE_AREA_LOG_SAVE", //  AI 콕콕 플래너 생성 시 지역코드
                "GET_TRAVEL_100SCENE_SEARCH_LIST", // 여행 홍보관 지역 클릭
                "INSERT_USER_SEARCH_KEYWORD",   //  내부 검색, 외부 서비스의 검색을 통한 유입
                "MY_LOCATION_DETAIL", //    여행 지도 페이지 상세 조회
                "FAVO_CONTENTINFO_DELETE", //   즐겨찾기 취소
                "ADD_STAMP", // 발도장
                "USER_STAMP_STARS", //  발도장 만족도 별점
                "NAVI_LOG_SAVE", // 내비
                "TRSS_INSERT_LOG", //   여행구독
                "LIKE_FEEDBACK_LOG", // 좋아요, 별로에요 피드백
                "COURSE_CONTENT_SAVE", //   사용자 코스 생성
                "TRSS_SUBSCRIBE", // 여행구독 구독신청시
                "TRSS_SUBSCRIBE_CANCEL", // 여행구독 구독해제
                "DIGT_CARD_ISSUANCE", // 디지털 주민증 발급시
                "DELETE_MY_DIGT_CARD", // 디지털주민증 발급해지시
                "MY_QA_HISTORY_SAVE", // Q&A 등록시
                "EVENT_PROGRAM_LOG_SAVE", // 이벤트 참여시
                "EVENT_VIEW_LOG_SAVE", // 이벤트 조회시
                "SAVE_APP_MAIN_VIEW_ACTION", // 앱 메인 페이지뷰
            ]
            let parameters = getParameterFromUri(decodeURIComponent(uri))
            const command = parameters.cmd

            if (traceCommands.indexOf(command) !== -1) {
                if (parameters.cotid !== undefined) {
                    const isEvent = () => location.pathname.indexOf('event_detail') !== -1
                        && command !== 'EVENT_VIEW_LOG_SAVE' && command !== 'EVENT_PROGRAM_LOG_SAVE'
                    if (isEvent()) {
                        return
                    }
                }
                if ("TRSS_INSERT_LOG" === command) {
                    if (parameters.cotid === undefined) {
                        return
                    }
                }
                //일부 cmd 디코딩 한번더 실행
                if ("ABC_COURSE_AREA_LOG_SAVE" === command
                    || "MY_JIKIMI_HISTORY_SAVE" === command
                    || "EVENT_VIEW_LOG_SAVE" === command
                    || "EVENT_PROGRAM_LOG_SAVE" === command
                    || "MY_QA_HISTORY_SAVE" === command){
                    traceSave(getParameterFromUri(decodeURIComponent(decodeURIComponent(uri))))
                } else {
                    traceSave(parameters)
                }
            }
        } catch (e) {
            console.error('error', e)
        }
    }
})

function putRenewal() {
    const TRACK_GA_LATEST_MODIFY_TIME_KEY = "t:g_lmt"
    const trackGaLatestModifyTime = localStorage.getItem(TRACK_GA_LATEST_MODIFY_TIME_KEY)
    if (trackGaLatestModifyTime !== null) {
        const period = getPeriodOfDates(new Date(Number.parseInt(trackGaLatestModifyTime)), new Date())
        if (period.dates >= 1) {
            const nowTime = new Date().getTime()
            localStorage.setItem(TRACK_GA_LATEST_MODIFY_TIME_KEY, nowTime.toString())
        } else {
            return
        }
    } else {
        const nowTime = new Date().getTime()
        localStorage.setItem(TRACK_GA_LATEST_MODIFY_TIME_KEY, nowTime.toString())
    }
    $.ajax({
        url: mainurl + '/api/v1/track/renewal',
        type: 'PUT',
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        headers: { 'Content-Type': 'application/json' }
    })
}

function postAction(action) {
    const baseUrl = (() => {
        if (location.hostname.indexOf('korean.visitkorea.or.kr') !== -1) {
            return 'https://korean.visitkorea.or.kr'
        } else {
            return 'https://stage.visitkorea.or.kr'
        }
    })()
    $.ajax({
        url: baseUrl + '/api/v1/track',
        type: 'POST',
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(action),
        success: function(response) {

        }
    })
}

function rewordPostBack(data,rwmid,pinkey,type){
    if (data.body.data && data.body.data.url){
        fetch(data.body.data.url).then(response => response.json()).then(data => {
            SaverewordData(rwmid,pinkey,type,data)
        }).catch((error) => {
            console.log(error);
        });
    }
}

function DefaultEvent() {
    if (location.href.toString().indexOf('digt') != -1) {
        let rwmid = 'ff9a0b3d-54d0-11ed-86be-0242ac1b0002';
        if (getParameter('utm_source')) {
            let utm_source = getParameter('utm_source');
            let pinkey = getParameter('pinkey');
            SaverewordData(rwmid, pinkey, 0);
        } else {
            SaverewordData(rwmid, null, 0);
        }
    }
}

const trssChangeLink = () => $('.all_menu li a[href="/mypage/trss_main.do"]').attr("href", "/trss/applyintro.do?utm_source=main_showcase");

const getTrssPreview = (cb, snsId) => {
    if (!trssinfo) {
        const data = {cmd: "GET_TRSS_PRIVIEW"}
        if (snsId) data.snsId = snsId;
        JSON.parse($.ajax({
            type: "POST",
            url: mainurl + "/call",
            async: false,
            data,
            success: (data) => trssinfo = data,
            error: console.log
        }).responseText);
    }
    if (cb) {
        return cb(trssinfo);
    }
}

//프로필업로드 체크(적용하기 버튼)
function profileUpload() {
    let imgId = $('#profileList li .on').attr('id');

    if (imgId == "undefined" || imgId == null || imgId == "") {
        alert("프로필을 선택해 주세요.");
        return false;
    }

    if (imgId == "profileUpdate") {
        if (appYn == 'Y' && getDevice() == 'Android') {
            const fileuploadlist = AppsaveName+'|'+AppfullPath;
            profileUpdate(fileuploadlist, AppsaveName);
        } else {
            let form = $('#pform')[0];
            let formData = new FormData(form);

            $.ajax({
                url: mainUploadUrl,
                type: 'POST',
                enctype: 'multipart/form-data',
                cache : false,
                contentType: false,
                processData: false,
                data: formData,
                success : function (data) {
                    let obj = JSON.parse(data);
                    let savename = obj.body.result[0].saveName;
                    let dot = savename.indexOf(".");
                    savename = savename.substr(0, dot);

                    let fullPath = obj.body.result[0].fullPath;
                    fullPath = fullPath.replace('/data/images','');

                    let fileuploadlist = savename + '|' + fullPath;
                    profileUpdate(fileuploadlist, savename);
                }
            });
        }
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            traditional: true,
            data: {
                cmd : 'UPDATE_MY_DIGT_CARD_PROFILE_IMAGE',
                dclmId : dclmId,
                imgId : imgId
            },
            success: function(data) {
                $('.profile').css('background-image', 'url(' + (mainimgurl+imgId) + ')');

                if (imgId == "432bc9a8-ded5-406c-b206-420bbcea8104") {
                    $("#profileDiv").removeClass();
                    $("#profileDiv").addClass('box okcheon2');
                } else if (imgId == "fb71cce7-50cf-431c-862d-fa0b3907e9a0") {
                    $("#profileDiv").removeClass();
                    $("#profileDiv").addClass('box okcheon1');
                } else if (imgId == "c76950ad-7755-4962-bc50-974893e84191") {
                    $("#profileDiv").removeClass();
                    $("#profileDiv").addClass('box bg1');
                } else if (imgId == "173ab370-60bc-48c1-9404-a8e522d6b9f3") {
                    $("#profileDiv").removeClass();
                    $("#profileDiv").addClass('box bg2');
                } else if (imgId == "48a1c759-9e8e-49eb-b0c2-04b7d0ae9783") {
                    $("#profileDiv").removeClass();
                    $("#profileDiv").addClass('box bg3');
                } else if (imgId == "bd343613-627d-4030-b296-81fd1df2d531") {
                    $("#profileDiv").removeClass();
                    $("#profileDiv").addClass('box pyeongchang');
                } else {
                    $("#profileDiv").removeClass();
                    $("#profileDiv").addClass('box bg4');
                }

                alert("프로필이 변경되었습니다.");
                layerPopup.layerHide('profilePop');
                $('#'+imgId).removeClass('on');
            },
            complete: function() {
                hideLoding();
            },
            error: function(xhr, textStatus, errorThrown) {
                hideLoding();
            }
        });
    }

}

// 좋아요
function setLike(kind, $this) {
    let cotId;
    if (kind == 2){
        cotId = selectcotId;
    } else {
        cotId = this.cotId;
    }

    if ($.cookie('content_'+cotId) == 'Y') {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'CONTENT_LIKE_DELETE',
                cotid : cotId
            },
            success: function(data) {
                if (kind == 2 && this.cotId != selectcotId) {
                    $('#map .layer .btn .good').removeClass('on');
                    $('#mapMo .layer .btn .good').removeClass('on');
                    if (detail) {
                        detail.useLike = 0;
                    } else {
                        alert('좋아요가 취소되었습니다.');
                        $("#conLike").text(Number($("#conLike").text())-1);
                        $.cookie('content_'+cotId, 'N', {expires: 1, path:'/'});
                        $("input:radio[id=estimateForm1]").prop('checked', false);
                        $('.btn_good').attr('class','btn_good');
                        $('.btn_good').attr('title','');
                        contentlike = false;
                        if (selectcotId == this.cotId) {
                            $('#map .layer .btn .good').removeClass('on');
                            $('#mapMo .layer .btn .good').removeClass('on');
                        }
                    }
                } else {
                    alert('좋아요가 취소되었습니다.');
                    $("#conLike").text(Number($("#conLike").text())-1);
                    $.cookie('content_'+cotId, 'N', {expires: 1, path:'/'});
                    $("input:radio[id=estimateForm1]").prop('checked', false);
                    $('.btn_good').attr('class','btn_good');
                    $('.btn_good').attr('title','');
                    contentlike = false;
                    if (kind === 2 && selectcotId == this.cotId) {
                        $('#map .layer .btn .good').removeClass('on');
                        $('#mapMo .layer .btn .good').removeClass('on');
                    }
                }
            }
        });
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'CONTENT_LIKE_SAVE',
                cotid : cotId
            },
            success: function(data) {
                if (kind == 2 && this.cotId != selectcotId) {
                    $('#map .layer .btn .good').addClass('on');
                    $('#mapMo .layer .btn .good').addClass('on');
                    let detail = getContentdata(cotId);
                    if (detail) {
                        detail.useLike = 1;
                    } else {
                        alert('좋아요를 누르셨습니다.');
                        $("#conLike").text(Number($("#conLike").text())+1);
                        $.cookie('content_'+cotId, 'Y', {expires: 1, path:'/'});
                        $("input:radio[id=estimateForm1]").prop('checked', true);
                        $('.btn_good').attr('class','btn_good on');
                        $('.btn_good').attr('title','선택됨');
                        contentlike = true;
                        if (selectcotId == this.cotId) {
                            $('#map .layer .btn .good').addClass('on');
                            $('#mapMo .layer .btn .good').addClass('on');
                        }
                    }
                } else {
                    alert('좋아요를 누르셨습니다.');
                    $("#conLike").text(Number($("#conLike").text())+1);
                    $.cookie('content_'+cotId, 'Y', {expires: 1, path:'/'});
                    $("input:radio[id=estimateForm1]").prop('checked', true);
                    $('.btn_good').attr('class','btn_good on');
                    $('.btn_good').attr('title','선택됨');
                    contentlike = true;
                    if (kind === 2 && selectcotId == this.cotId){
                        $('#map .layer .btn .good').addClass('on');
                        $('#mapMo .layer .btn .good').addClass('on');
                    }
                }
                loginPositiveActionUserReviewApp();
            }
        });
    }
}

function setLike2(cotId, $this){
    if ($this instanceof Event) {
        $this.preventDefault();
        $this = $this.target
    }
    this.cotId = cotId;
    if ( $.cookie('content_'+cotId) != 'Y') {
        $this.classList.add('on');
        $($this).attr('title', '선택됨');
    } else {
        $this.classList.remove('on');
        $($this).attr('title', '');
    }
    setLike();
}

function getPageType() {
    let page = '';
    if (location.pathname.indexOf('cs_detail') > -1) {
        page = 'cs_detail';
    } else if (location.pathname.indexOf('ms_detail') > -1) {
        page = 'ms_detail';
    } else if (location.pathname.indexOf('rem_detail') > -1) {
        page = 'rem_detail';
    } else if (location.pathname.indexOf('fes_detail') > -1) {
        page = 'fes_detail';
    }
    switch (page) {
        case 'ms_detail':
            page = '여행지';
            break;
        case 'cs_detail':
            page = '코스';
            break;
        case 'rem_detail':
            page = '여행기사';
            break;
        case 'fes_detail':
            page = '축제';
            break;
        default:
            page = '여행기사';
    }
    return page;
}

//여행구독 본인인증 및 가입 완료
function trssSelfCertNJoin() {
    alert("본인 인증 및 가볼래-터 가입이 완료되었습니다.");
    layerPopup.layerHide('verifiyPop1');
}

/**
 * 여행구독 공용 동작 명세.
 */
class TrssCommonFunctions {
    verifyDigtCommonSelfCert(returnUrlPc, returnUrlMo, service) {
        fetch('/call', {
            method: 'post'
            , headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            , body: JSON.stringify({
                cmd: 'GET_SELF_CERT_YN_DATA'
                , data: {
                }
            })
        })
        .then(res => res.json())
        .then(data => {
            //본인인증 O
            if (data.body.result.CERT_EXST == 1 && data.body.result.IS_EXPIRED == 0) {
                const setviceType = String(service);
                if (setviceType == "writeTrss") {
                    if (loginYn == 'Y') {
                        this.showTrssCommonPrivacyAgreementPop(returnUrlPc, returnUrlMo, service,false);
                    } else {
                        showLogin(2);
                        if (getParameter("loginYn") != 'Y'){
                            if (location.search.indexOf('pinkey') != -1) {
                                beforeUrl = location.href +'&loginYn=' + 'Y'
                            } else {
                                beforeUrl = location.href
                            }
                        }
                    }
                } else {
                    if (loginYn == 'Y') {
                        this.showTrssCommonPrivacyAgreementPop(returnUrlPc, returnUrlMo, service,true);
                    } else {
                        showLogin(2);
                        if (getParameter("loginYn") != 'Y'){
                            if (location.search.indexOf('pinkey') != -1) {
                                beforeUrl = location.href +'&loginYn=' + 'Y'
                            } else {
                                beforeUrl = location.href
                            }
                        }
                    }
                }
                //GoSubscribe();
                // END.
            } else {
                //본인인증 X
                if ( loginYn == 'Y'){
                    this.showTrssCommonPrivacyAgreementPop(returnUrlPc, returnUrlMo, service);
                } else {
                    showLogin(2);
                    if (getParameter("loginYn") != 'Y'){
                        if (location.search.indexOf('pinkey') != -1) {
                            beforeUrl = location.href +'&loginYn=' + 'Y'
                        } else {
                            beforeUrl = location.href
                        }
                    }
                }
            }
        })
    }

    showTrssCommonPrivacyAgreementPop(returnUrlPc, returnUrlMo, service,selfcertYn) {
        $('#verifiyPop1').remove();

        agreeAllChk = false;
        let funName = '';
        let consent = `
            <p>[개인 정보 제3자 제공 동의 ]</p>
            <ul>
                <li>
                    ◎ 개인정보 제3자 제공 내역
                    <ul>
                        <li style="font-weight: 800; font-size: 120%">- 제공받는자 : (주)신안정보통신 비즈모아샷</li>
                        <li style="font-weight: 800; font-size: 120%">- 제공목적 : 여행구독 서비스 ‘가볼래-터’ 구독자 대상 카카오톡 알림톡 및 LMS를 통한 레터 발행 홍보, 미션 참여 독려 및 기타 여행구독 서비스 공지</li>
                        <li>- 제공 항목 (필수) : 이름, 휴대전화 번호, 중복가입 확인정보(DI), 암호화 된 동일인 식별정보(CI)</li>
                        <li  style="font-weight: 800; font-size: 120%">- 보유기간 : 개인정보 수집 일로부터 구독 취소 시까지<br>
                            단, 메시지 발송 이력은 발송 후 6개월까지 보유</li>
                    </ul>
                </li>
            </ul>
            <p>※ 위의 개인정보 제공에 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 여행구독 서비스 구독자 대상 카카오톡 알림톡 및 LMS를 통한 여행구독 서비스 공지 등에 제한될 수 있습니다. 위와 같이 개인정보를 제3자에게 제공하는데 동의합니다.</p>
        `

        if (service == "lotteryEv" && agreehtml) {
            consent = agreehtml;
        }

        if (service == 'travelinfo'){
            funName = 'SubscribeSave';
        } else if (service == "writeTrss"){
            funName = 'SubscribeUpdate';
        } else if (service == "lotteryEv"){
            funName = 'SubscribeLotteryReload';
        }

        let popup = `
            <div id="verifiyPop1" class="wrap_layerpop verifiyPop">
                <div class="layerpop" tabindex="0">
                    <div class="pop_tit">
                        <strong>개인정보 수집 및 본인 인증</strong>
                    </div>
                    <div class="verifiy_pop">
                    <strong class="stit">대한민국 구석구석의 다양한 서비스 이용을 위해<span>아래 항목을 확인해주세요!</span></strong>
                        <div class="verifiy_scr">
                            <div class="consent_wrap">
                                <div class="wrap">
                                    <span class="chk">개인 정보 수집 및 이용 동의 <em>(필수)</em></span>
                                    <div class="btn_chk">
                                        <div class="col">
                                        <input type="radio" name="consent03" id="radio03_o" class="agree" onclick="agreeChk('radio03_o')"/>
                                        <label for="radio03_o">동의</label>
                                        </div>
                                        <div class="col">
                                        <input type="radio" name="consent03" id="radio03_x" class="notagree" onclick="agreeChk('radio03_x')"/>
                                        <label for="radio03_x">동의안함</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="consent" tabindex="0">
                                    <p>[개인 정보 수집 및 활용 동의]</p>
                                    <p>안녕하세요. 한국관광공사 대한민국 구석구석입니다.</p>
                                    <p>
                                        대한민국 구석구석 여행구독 서비스 '가볼래-터'에 대한 안내 문자 발송 및 향후 미션 완료자 대상 가볼래터 경품 제공을 위하여 고객님의 개인 정보 수집 및 이용에 관한 동의를 요청 드립니다.
                                    </p>
                                    <ul>
                                        <li>
                                        ◎ 수집 &middot; 이용 목적 : 구독 회원 대상 ‘가볼래-터‘ 서비스 제공, 서비스 관련 안내·홍보 문자 발
                                        </li>
                                        <li>◎ 수집 항목 (필수) : 이름, 휴대전화 번호, 중복가입 확인정보(DI), 암호화 된 동일인 식별정보(CI)</li>
                                        <li>
                                        <strong class="type1">◎ 개인정보 보유 및 이용 기간 : 개인정보 수집 일로부터 구독 취소 시까지 또는 회원탈퇴 시까지</strong> 
                                        </li>
                                        <li>◎ 수집된 구독자의 개인정보는 보유 및 이용 기간이 종료되면 지체없이 파기하며, 별도로 보관하지 않습니다.</li>
                                    </ul>
                                    <p>개인정보보호법 15조에 따라서 개인정보 수집 및 활용에 동의를 거부할 권리가 있습니다. <br>
                                        단, 동의를 거부할 경우 ‘가볼래-터’ 서비스의 이용이 제한될 수 있습니다. 
                                    </p>
                                    <p>
                                        또한, 한국관광공사는 대한민국 구석구석 여행구독 서비스 ‘가볼래-터’ 서비스의 안정적인 운영을 위하여 아래와 같이 개인정보 처리를 위·수탁 하고 있음을 안내드립니다.
                                    </p>
                                    <ul>
                                        <li>◎ 수탁업체명 : (주)여행노트앤투어 / 업무 내용 :  ‘가볼래-터’ 서비스 운영</li>
                                        <li>◎ 수탁업체명 : (주)신안정보통신 비즈모아샷 / 업무 내용:  ‘가볼래-터’ 구독자 대상 카카오톡 알림톡 및 LMS를 통한 레터 발행 홍보, 미션 참여 독려 및 기타 ‘가볼래-터’ 서비스 관련 공지</li>
                                    </ul>
                                </div>
                            </div>
                            <p class="txt1">※ 만 14세 미만 사용자는 본인인증이 불가하여 가볼래-터 서비스 이용 및 여행복권 이벤트 참여가 불가합니다.</p>
                        </div>
                        <div class="btn">
                            <a href="javascript:getPrivacyCommonCert('${service}',${funName});" class="step1" title="새창 열림">본인 인증</a><!--본인인증 완료 후 비노출-->
                            <a href="javascript:${funName}();" class="step2" style="display: none">확인</a><!--본인인증 완료 후 노출-->
                        </div>
                    </div> 
                    <button type="button" class="btn_close" onclick="layerPopup.layerHide('verifiyPop1');">닫기</button>
                </div>
            </div>
        `

        if (service == "lotteryEv") {
            $("#personalInformation").after(popup);
        } else {
            document.body.innerHTML += popup;
        }

        if (selfcertYn) {
            $('.step2').show();
            $('.step1').hide();
        }

        layerPopup.layerShow('verifiyPop1');
    }

    goPrivacyCommonCert(returnUrlPc, returnUrlMo,callback,service) {
        let agree1 = 'N';

        if (document.querySelector('#radio03_o').checked){
            agree1 = 'Y';
        }

        if (agree1 == 'N') {
            alert('개인 정보 수집 및 이용 동의 후 진행할 수 있습니다.');
            return;
        } else {
            // SELECT * FROM CODE C WHERE C.CODE_TYPE = 15.
            if (appYn == 'Y') {
                goNICEApiSelfCert('c3ae749c-f08f-11ed-8f10-0242ac130002',callback,service);
            } else {
                goNiceApiCertProcess('c3ae749c-f08f-11ed-8f10-0242ac130002', returnUrlPc);
            }
            document.querySelector('#radio03_o').style.pointerEvents = 'none';
            document.querySelector('#radio03_x').style.pointerEvents = 'none';
        }
    }

    // OS 에 따라, 각 스토어로 Redirect.
    redirectToStore() {
        let agent = navigator.userAgent.toLowerCase();

        if (agent.indexOf('iphone') != -1 || agent.indexOf('ipad') != -1) {// iPhone.
            location.href = 'http://itunes.apple.com/kr/app/id417340980';
        } else if (agent.indexOf('android') != -1) {// Google Android.
            location.href = 'market://details?id=com.visitkorea.kr';
        } else {
            location.href = 'https://play.google.com/store/apps/details?id=com.visitkorea.kr';
        }
    }

    // 검증 체인.
    verifyChain() {
        this.verifyLoginYnData();
    }

    verifyLoginYnData() {
        if (loginYn == 'N') {
            let popup = `
                <!-- 로그인 팝업(통합 로그인) -->
                <div id="socialLogin" class="wrap_layerpop">
                    <div class="layerpop">
                        <div class="tit">
                            <h2>대한민국구석구석 통합 로그인</h2>
                            <button type="button" class="btn_close3" onclick="layerPopup.layerHide('socialLogin');">닫기</button>
                        </div>
                        <div class="box_cont">
                            <span class="img">TOUR ONEPASS</span>
                            <p>투어원패스는 한국관광공사 통합로그인 서비스로<br/>
                                SNS인증을 통해 간편하게 이용할 수 있으며, <br/>
                                한 번의 로그인으로 한국관광공사에서 운영하는<br/>
                                다양한 서비스를 이용하실 수 있습니다.
                            </p>
                            <a href="javascript:SSOLogin();" title="새창열림" class="logo">투어원패스 로그인</a>
                            <div id="loginChk"></div>
                            <div class="auto_login"><input type="checkbox" id="autoLogin2" name="" checked="checked" ><label for="autoLogin2">자동 로그인</label></div>
                        </div>
                    </div>
                </div>
                <!-- // 로그인 팝업(통합 로그인) -->
                <!-- 로그인 팝업 -->
                <div id="login" class="wrap_layerpop">
                    <div class="layerpop">
                        <div class="tit">
                            <h2>소셜 로그인</h2>
                            <button type="button" class="btn_close3" onclick="loginClose();">닫기</button><!-- 0807 script onclick 추가 -->
                        </div>
                        <div class="box_cont">
                            <div class="login">
                                <ul class="list_sns clfix">
                                    <li class="naver"><a href="javascript:;" onclick="goLogin('naver');" title="새창 열림">네이버</a></li>
                                    <li class="kakao"><a href="javascript:;" onclick="goLogin('kakao');" title="새창 열림">카카오톡</a></li>
                                    <li class="facebook"><a href="javascript:;" onclick="goLogin('facebook');" title="새창 열림">페이스북</a></li>
                                    <li class="twitter"><a href="javascript:;" onclick="goLogin('twitter');" title="새창 열림">트위터</a></li>
                                    <li class="google"><a href="javascript:;" onclick="goLogin('google');" title="새창 열림">구글</a></li>
                                    <li class="apple"><a href="javascript:;" onclick="goLogin('apple');" title="새창 열림">애플</a></li>
                                </ul>
                                <div id="loginChk"></div>
                                <div class="auto_login"><input type="checkbox" id="autoLogin" name="" checked="checked"><label for="autoLogin">자동 로그인</label></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- // 로그인 팝업 -->
            `
            document.body.innerHTML += popup;
            showLogin(2);
        } else {
            setTimeout(() => {
                this.verifySelfCertYnData();
            }, 100);
        }
    }

    verifySelfCertYnData() {
        fetch('/call', {
            method: 'post'
            , headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            , body: JSON.stringify({
                cmd: 'GET_SELF_CERT_YN_DATA'
                , data: {
                }
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.body.result.CERT_EXST == 1 && data.body.result.IS_EXPIRED == 0) {
                    //본인인증 이력 있을 경우
                } else {
                    //본인인증 이력 없을 경우
                    this.showPrivacyAgreementPopup();
                }
            })
        ;
    }

    showPrivacyAgreementPopup() {
        let insttCertCd = document.querySelector('#contents').dataset.insttCd;
        let certCd = document.querySelector('#contents').dataset.certCd;
        agreeAllChk = false;
        let popup = `
            <div id="verifiyPop1" class="wrap_layerpop verifiyPop">
                <div class="layerpop" tabindex="0">
                    <div class="pop_tit">
                        <strong>개인정보 수집 및 본인 인증</strong>
                    </div>
                    <div class="verifiy_pop">
                    <strong class="stit">대한민국 구석구석의 다양한 서비스 이용을 위해<span>아래 항목을 확인해주세요!</span></strong>
                        <div class="verifiy_scr">
                            <div class="consent_wrap">
                                <div class="wrap">
                                    <span class="chk">개인 정보 수집 및 이용 동의 <em>(필수)</em></span>
                                    <div class="btn_chk">
                                        <div class="col">
                                        <input type="radio" name="consent03" id="radio03_o" class="agree" onclick="agreeChk('radio03_o')"/>
                                        <label for="radio03_o">동의</label>
                                        </div>
                                        <div class="col">
                                        <input type="radio" name="consent03" id="radio03_x" class="notagree" onclick="agreeChk('radio03_x')"/>
                                        <label for="radio03_x">동의안함</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="consent" tabindex="0">
                                    <p>[개인 정보 수집 및 활용 동의]</p>
                                    <p>안녕하세요. 한국관광공사 대한민국 구석구석입니다.</p>
                                    <p>
                                        대한민국 구석구석 여행구독 서비스 '가볼래-터'에 대한 안내 문자 발송 및 향후 미션 완료자 대상 가볼래터 경품 제공을 위하여 고객님의 개인 정보 수집 및 이용에 관한 동의를 요청 드립니다.
                                    </p>
                                    <ul>
                                        <li>
                                        ◎ 수집 &middot; 이용 목적 : 구독 회원 대상 ‘가볼래-터‘ 서비스 제공, 서비스 관련 안내·홍보 문자 발
                                        </li>
                                        <li>◎ 수집 항목 (필수) : 이름, 휴대전화 번호, 중복가입 확인정보(DI), 암호화 된 동일인 식별정보(CI)</li>
                                        <li>
                                        <strong class="type1">◎ 개인정보 보유 및 이용 기간 : 개인정보 수집 일로부터 구독 취소 시까지 또는 회원탈퇴 시까지 </strong> 
                                        </li>
                                        <li>◎ 수집된 구독자의 개인정보는 보유 및 이용 기간이 종료되면 지체없이 파기하며, 별도로 보관하지 않습니다.</li>
                                    </ul>
                                    <p>개인정보보호법 15조에 따라서 개인정보 수집 및 활용에 동의를 거부할 권리가 있습니다. <br>
                                        단, 동의를 거부할 경우 ‘가볼래-터’ 서비스의 이용이 제한될 수 있습니다. 
                                    </p>
                                    <p>
                                        또한, 한국관광공사는 대한민국 구석구석 여행구독 서비스 ‘가볼래-터’ 서비스의 안정적인 운영을 위하여 아래와 같이 개인정보 처리를 위·수탁 하고 있음을 안내드립니다.
                                    </p>
                                    <ul>
                                        <li>◎ 수탁업체명 : (주)여행노트앤투어 / 업무 내용 :  ‘가볼래-터’ 서비스 운영</li>
                                        <li>◎ 수탁업체명 : (주)신안정보통신 비즈모아샷 / 업무 내용:  ‘가볼래-터’ 구독자 대상 카카오톡 알림톡 및 LMS를 통한 레터 발행 홍보, 미션 참여 독려 및 기타 ‘가볼래-터’ 서비스 관련 공지</li>
                                    </ul>
                                </div>
                            </div>
                            <p class="txt1">※ 만 14세 미만 사용자는 본인인증이 불가하여 가볼래-터 서비스 이용 및 여행복권 이벤트 참여가 불가합니다.</p>
                        </div>
                        <div class="btn">
                            <a href="javascript:getPrivacyCommonCert('` + service + `');" class="step1" title="새창 열림">본인 인증</a><!--본인인증 완료 후 비노출-->
                            <a href="javascript:window.location.href=window.location.href;" class="step2" style="display: none">확인</a><!--본인인증 완료 후 노출-->
                        </div>
                    </div>  
                    <button
                      type="button"
                      class="btn_close"
                      onclick="javascript:if (confirm('대한민국구석구석 메인으로 이동됩니다.')) location.href='/main/main.do#home';"
                    >
                      닫기
                    </button>
                </div>
            </div>
        `

        document.body.innerHTML += popup;
        layerPopup.layerShow('verifiyPop1');
    }

    goSelfCert() {
        if (!document.querySelector('#radio03_o').checked) {
            alert('동의 체크 후 진행할 수 있습니다.');
        } else {
            // SELECT * FROM CODE C WHERE C.CODE_TYPE = 15.
            goNiceApiCertProcess('c3ae749c-f08f-11ed-8f10-0242ac130002', `visitkorea://?url=${mainurl}/dgtlCard/useBnfitInterface/` + insttCertCd + '/' + insttCertCd);
            document.querySelector('#verifiyPop1 .btn > .step1').style.display = 'none';
            document.querySelector('#verifiyPop1 .btn > .step2').style.display = 'block';
            document.querySelector('#radio03_o').style.pointerEvents = 'none';
            document.querySelector('#radio03_x').style.pointerEvents = 'none';
        }
    }

    goMainPage() {
        if (confirm('메인페이지로 돌아갑니다.')) {
            location.href = '/main/main.do#home';
        }
    }
}

function agreeChk(type) {
    if (type == "radio03_x") {
        agreeAllChk = false;
        $("input[class='checkbox01_o']").prop("checked", false);
    }
}

function allChk() {
    if (agreeAllChk == false) {
        agreeAllChk = true;
        $("input[class='agree']").prop("checked", true);
        $("input[class='notagree']").prop("checked", false);
    } else {
        agreeAllChk = false;
        $("input[class='notagree']").prop("checked", true);
        $("input[class='agree']").prop("checked", false);
    }
}

function getPrivacyCommonCert(service,callback) {
    let returnUrl = "";
    new TrssCommonFunctions().goPrivacyCommonCert('/selfCert/' + service + '/close.do', returnUrl, callback);
}

const setlogo = (el) => {
    const logoIcon = [
        'M483.7,49.5h-39.2c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7h28.3v17c0,0.9,0.8,1.7,1.7,1.7c5.8,0,10.4-4.7,10.4-10.4V50.6C484.8,50,484.3,49.5,483.7,49.5z M453,41.3c3.3,3.8,8,5.4,13.7,5.4h1.8c0.9,0,1.7-0.7,1.7-1.7c0-0.9-0.7-1.7-1.7-1.7h0c-4.6,0-9.4-2.4-9.4-7.7V20.8c0-0.9-0.8-1.7-1.7-1.7h-8.7c-0.9,0-1.7,0.8-1.7,1.7v14.7c0,5.4-4.8,7.7-9.4,7.7h0c0,0-18.7,0-18.7,0c4.8-2,10.7-6.4,10.7-15.6v-6.8c0-0.9-0.8-1.7-1.7-1.7h-33.7c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7h23.3v5.2c0,15.3-7.7,15.6-7.7,15.6h-24.5c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7h19.7v23.2c0,0.9,0.8,1.7,1.7,1.7c5.8,0,10.4-4.7,10.4-10.4V46.6h22.3C445,46.6,449.7,45,453,41.3z M483.1,19.1h-8.7c-0.9,0-1.7,0.8-1.7,1.7v8.1h-4c-0.9,0-1.7,0.7-1.7,1.7s0.7,1.7,1.7,1.7h4v12.7c0,0.9,0.8,1.7,1.7,1.7h8.7c0.9,0,1.7-0.8,1.7-1.7V20.8C484.8,19.9,484.1,19.1,483.1,19.1z M467.1,0H351.6c-23.1,0-42,18.3-43,41.2H272C271,18.3,252.1,0,229,0c-23.7,0-43,19.3-43,43c0,23.7,19.3,43,43,43c23.1,0,42-18.3,43-41.2h36.6c1,22.9,19.9,41.2,43,41.2h115.5c23.7,0,43-19.3,43-43C510.1,19.3,490.8,0,467.1,0z M229,82.3c-21.7,0-39.3-17.6-39.3-39.3c0-21.7,17.6-39.3,39.3-39.3c21.7,0,39.3,17.6,39.3,39.3C268.3,64.7,250.7,82.3,229,82.3z M467.1,82.3H351.6c-21.7,0-39.3-17.6-39.3-39.3c0-21.7,17.6-39.3,39.3-39.3h115.5c21.7,0,39.3,17.6,39.3,39.3C506.4,64.7,488.7,82.3,467.1,82.3z M347.5,41.3c3.3,3.8,8,5.4,13.7,5.4h1.8c0.9,0,1.7-0.7,1.7-1.7c0-0.9-0.7-1.7-1.7-1.7h0c-4.6,0-9.4-2.4-9.4-7.7V20.8c0-0.9-0.8-1.7-1.7-1.7h-8.7c-0.9,0-1.7,0.8-1.7,1.7v14.7c0,5.4-4.8,7.7-9.4,7.7h0c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7h1.8C339.4,46.6,344.1,45,347.5,41.3z M377.6,19.1h-8.7c-0.9,0-1.7,0.8-1.7,1.7v8.1h-4c-0.9,0-1.7,0.7-1.7,1.7s0.7,1.7,1.7,1.7h4v12.7c0,0.9,0.8,1.7,1.7,1.7h8.7c0.9,0,1.7-0.8,1.7-1.7V20.8C379.3,19.9,378.5,19.1,377.6,19.1z M254.8,43.3h-18c4.8-2,10.7-6.4,10.7-15.7v-6.8c0-0.9-0.8-1.7-1.7-1.7h-33.7c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7h23.3v5.2c0,15.3-7.7,15.7-7.7,15.7h-24.5c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7h19.7v23.2c0,0.9,0.8,1.7,1.7,1.7c5.8,0,10.4-4.7,10.4-10.4V46.6h19.7c0.9,0,1.7-0.7,1.7-1.7C256.4,44,255.7,43.3,254.8,43.3z M378.1,49.5h-39.2c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7h28.3v17c0,0.9,0.8,1.7,1.7,1.7c5.8,0,10.4-4.7,10.4-10.4V50.6C379.3,50,378.8,49.5,378.1,49.5z',
        'M66.2,35.2c0-3.3-1.4-6.2-4.2-8h4.1c0.8,0,1.5-0.7,1.5-1.5c0-0.8-0.7-1.5-1.5-1.5h-7.4v-4c0-0.6-0.5-1.1-1.1-1.1H53c-0.6,0-1.1,0.5-1.1,1.1v4h-7.4c-0.8,0-1.5,0.7-1.5,1.5c0,0.8,0.7,1.5,1.5,1.5h4.2c-2.7,1.8-4.2,4.7-4.2,8c0,5.4,3.9,9.8,10.9,9.8C62.4,45.1,66.2,40.7,66.2,35.2z M51.2,35.2c0-3.8,1.5-6.8,4.2-6.8c2.7,0,4.2,3.1,4.2,6.8c0,3.8-1.5,6.8-4.2,6.8C52.7,42.1,51.2,39,51.2,35.2z M35.4,19.6H31c-0.6,0-1.1,0.5-1.1,1.1v10.4h-4.2V21.1c0-0.6-0.5-1.1-1.1-1.1h-4.4c-0.6,0-1.1,0.5-1.1,1.1v21.8c-0.6,0.2-1.3,0.5-2.1,0.6c-0.9,0.2-1.9,0.3-3.1,0.3h-7V24.3H14c0.8,0,1.5-0.7,1.5-1.5c0-0.8-0.7-1.5-1.5-1.5H1c-0.6,0-1.1,0.5-1.1,1.1v23.4c0,0.6,0.5,1.1,1.1,1.1h12.6c1.3,0,2.4-0.1,3.3-0.4c0.9-0.3,1.6-0.6,2.2-1.1v15c0,0.6,0.5,1.1,1.1,1.1H22c2.1,0,3.7-1.6,3.7-3.7V35.1h4.2v25.9c0,0.6,0.5,1.1,1.1,1.1h1.8c2.1,0,3.7-1.6,3.7-3.7V20.7C36.5,20.1,36,19.6,35.4,19.6z M78.5,59H57.8v-9.6c0-0.6-0.5-1.1-1.1-1.1h-4.8c-0.6,0-1.1,0.5-1.1,1.1v11.5c0,0.6,0.5,1.1,1.1,1.1h26.6c0.8,0,1.5-0.7,1.5-1.5C80,59.7,79.3,59,78.5,59z M119,51h1.4c2.5,0,4.5-2,4.5-4.4V20.7c0-0.6-0.5-1.1-1.1-1.1H119c-0.6,0-1.1,0.5-1.1,1.1v29.1C117.9,50.5,118.4,51,119,51z M168.8,36h-5.3c0.5-0.6,0.9-1.6,1.2-3c0.3-1.4,0.5-2.6,0.5-3.8v-6.9c0-0.6-0.5-1.1-1.1-1.1h-27.3c-0.8,0-1.5,0.7-1.5,1.5c0,0.8,0.7,1.5,1.5,1.5h21.4v5.2c0,1.2-0.1,2.4-0.2,3.5c-0.1,1.2-0.3,2.2-0.7,3.1H132c-0.8,0-1.5,0.7-1.5,1.5c0,0.8,0.7,1.5,1.5,1.5h14.7v7.7h-10.1c-0.8,0-1.5,0.7-1.5,1.5c0,0.8,0.7,1.5,1.5,1.5h21.5v11.3c0,0.6,0.5,1.1,1.1,1.1h1.4c2.5,0,4.5-2,4.5-4.4v-9.9c0-0.6-0.5-1.1-1.1-1.1h-10.3v-7.7h15c0.8,0,1.5-0.7,1.5-1.5C170.3,36.6,169.6,36,168.8,36z M84,30.3h-5.5v-9.6c0-0.6-0.5-1.1-1.1-1.1h-4.8c-0.6,0-1.1,0.5-1.1,1.1v29.1c0,0.6,0.5,1.1,1.1,1.1H74c2.5,0,4.5-2,4.5-4.4V33.3H84c0.8,0,1.5-0.7,1.5-1.5C85.5,31,84.8,30.3,84,30.3z M124.8,59h-21.7V48.6c0-0.6-0.5-1.1-1.1-1.1h-4.8c-0.6,0-1.1,0.5-1.1,1.1v12.3c0,0.6,0.5,1.1,1.1,1.1h27.6c0.8,0,1.5-0.7,1.5-1.5C126.3,59.7,125.6,59,124.8,59z M111.8,38.5V22.3c0-0.6-0.5-1.1-1.1-1.1H90.9c-0.6,0-1.1,0.5-1.1,1.1v19.6c0,0.6,0.5,1.1,1.1,1.1h16.4C109.8,42.9,111.8,41,111.8,38.5z M104.8,40h-8V24.2h8V40z',
    ]
    const icon1Color = $(el).data('stokecolor');
    let strhtml = '대한민국구석구석';
    strhtml += '<svg id="pathicon1" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="510px" height="86px" viewBox="0 0 510 86" style="enable-background:new 0 0 510 86;" xml:space="preserve">';
    logoIcon.forEach((item)=>{
        strhtml += `<path class="text-path" d="${item}" stroke="${icon1Color}" stroke-width="1"/>`;
    });
    strhtml += '</svg>';
    $(el).html(strhtml);
}

function goListTrss() {
    location.href = '/list/travelbenefit.do?service=trss';
}

/* 투어원패스쪽에서 요청한 소스 */
window.addEventListener('message', function(event) {
    if (event.origin === 'https://pass.knto.or.kr' && event.data.type === 'login_success') {
        let redirectUrl = event.data.redirectUrl;
        window.location.href = redirectUrl;
    }
}, false);

(function() {
    const hostname = location.hostname;
    if (hostname.includes('stage.visitkorea.or.kr') || hostname.includes('dev.ktovisitkorea.com')) {
        const existing = document.querySelector('meta[name="robots"]');
        if (!existing) {
            const metaTag = document.createElement('meta');
            metaTag.name = 'robots';
            metaTag.content = 'noindex, nofollow';
            document.head.appendChild(metaTag);
        } else {
            existing.content = 'noindex, nofollow';
        }
    }
})();

function loginPositiveActionUserReviewApp() {
    if (loginYn == 'Y') {
        callAppNativeFunction({}, 'StoreReview');
    }
}

function commentShowLoading() {
    if (commentAjaxCount === 0) {
        showLoding();
    }
    commentAjaxCount++;
}

function commentHideLoading() {
    commentAjaxCount--;
    if (commentAjaxCount <= 0) {
        commentAjaxCount = 0;
        hideLoding();
    }
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

function getProperParticle(voca) {
    const charCode = voca.charCodeAt(voca.length - 1);
    const consonantCode = (charCode - 44032) % 28;
    if (consonantCode === 0) {
        return `${voca}와`;
    } else {
        return `${voca}과`;
    }
}

function xssFilter(str) {
    if (!str) return '';
    return str
        // .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}