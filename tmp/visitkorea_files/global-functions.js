/** 
 * 로그인 관련 함수.
 */

// 자동로그인
function snsAutoLogin() {
      $.ajax({
          url: mainurl+'/call',
          dataType: 'json',
          type: "POST",
          data: {
              cmd : 'SNS_AUTO_LOGIN',
              appYn : appYn
          },
          success: function(data) {
              if(location.href.indexOf('korean.visitkorea') != -1 || location.href.indexOf('localhost') != -1 || location.href.indexOf('stage.visitkorea') != -1 || location.href.indexOf('dev.ktovisitkorea') != -1) {  // 230725 검증계 삽입
                  setLogintype(data);
              } else {
                  setLogintype(data.body.result);
              }

              if (appYn == 'Y' && !! data.body.result) {
                  const snsId = data.body.result.snsId;
                  const hasSnsId = ! (snsId == null || snsId == 'null' || snsId == undefined || snsId == 'undefined' || snsId == '');

                  if (hasSnsId) {
                      transmitAppGroobeeCdpData(data.body.result, true);// 로그인 진행했을 경우 CDP 데이터 전송.
                      transmitAppLoginProcData(data.body.result, true);// true: Auto Login 여부.
                  }
              }

              if(data.body.autologinyn && data.body.autologinyn == "Y"){
                  autologinyn = 'Y';
                  if(dataLayer){
                      dataLayer.push({
                          'login_comple': 'Y'
                      });
                  } else{
                      window.dataLayer = window.dataLayer || [];
                      dataLayer.push({
                          'login_comple': 'Y'
                      });
                  }
              }

              if(data.body.result && data.body.result.memChek){
                  memcheck = data.body.result.memChek;
              }
          },
          complete: function() {
              try {
                  nextLogin();
                  $('.wrap_layerpop').attr('forcedscroll', 'y');
                  checkDCardDplicateCertResultNShowBlockPopup();
  //                checkNShowMicroServiceJoinEncouragePopup();// 해당 체킹 로직은 디민증 본인인증 중복 체킹 이후 내부 처리 결과에 따라 실행여부가 결정되도록 위치를 이동함.
                  $('.tag_area').css('display','none');
                  setTimeout(function() {
                      $('.tag_area').css('display','none');
                  }, 1000);
              } catch(e) {
              }
          },
          error: function(xhr, textStatus, errorThrown) {
          }
      });
}

/**
 * 로그인 여부 데이터를 사용하여 GNB 우상단의 로그인 버튼을 처리하는 함수.
 *
 * data: 로그인 한 채널에 대한 사용자 메타 정보를 담고있는 객체.
 * (  snsId의 존재 여부로 로그인 여부를 판단하며,
 *   로그인 버튼을 생성할지,
 *   로그인한 채널의 프로필 사진과 마이페이지 버튼을 생성할지를 결정.  )
 */
function setLogintype(data) {

    if(location.href.indexOf('korean.visitkorea') != -1 || location.href.indexOf('localhost') != -1 || location.href.indexOf('stage.visitkorea') != -1 || location.href.indexOf('dev.ktovisitkorea') != -1){ // 230725 검증계 삽입
        const result = data.body.result;
        snsId = result.snsId;
        if(result.grade) {
            trssuser = result.trssUser;
            trssMissionScsYn = result.grade;
        }
        if( snsId == null || snsId == 'null' || snsId == undefined || snsId == 'undefined' || snsId == '' ) {
            // PC버전 헤더 미로그인 상태 처리
            $('#pc_profile').removeClass('type1');
            $('#pc_profile').html('<a href="javascript:showLogin(2);">로그인</a>');
            $('#mo_profile2').removeClass('type1');
            $('#mo_profile2').html('<a href="javascript:showLogin(2);"></a>');
            // 모바일버전 헤더 미로그인 상태 처리
            $('#mo_profile').html(`
                <div class="photo"></div><div class="info">
                <button type="button" onclick="showLogin(2);"><strong>로그인</strong> 하세요</button>
                <p>로그인을 하시면 <br>더 많은 서비스를 이용하실 수 있습니다. </p>
                <div class="btn">
                    <button type="button" onClick="location.href='/dgtourcard'">디지털 관광주민증</button>
                    <button type="button" onClick="location.href='/list/travelbenefit.do?service=trss'">가볼래-터</button>
                </div>
                </div>`)
            // $('#mo_profile').style.height = '170px'
            $('#quick_login_tab').html('<a href="javascript:showLogin(2);" class="mypage">' +
                '<span class="profile"><span>프로필 사진</span></span>로그인</a>');
            // 앱버전 헤더 미로그인 상태 처리
            $('.app_login').css('display', 'none')
            $('.app_logout').css('display', '')
            $('.app_logout').html(`
                                                        <a href="javascript:showLogin(2);">로그인/회원가입</a>
                                                        <p>로그인 후, 서비스 이용 시 <em>“맞춤 추천, 회원 전용 이벤트 등”</em><br>
                                                            당신만을 위한 다양한 서비스가 제공됩니다.
                                                        </p>
                                                        `)
            $('.app_profile_layer').css('display', '')
            $('.app_profile_layer').css('display', '')
            $('.app_profile_layer.after').css('display','none');
            $('.app_profile_layer').html(`
              <div class="photo">

              </div>
              <div class="info">
                <button type="button" class="login" onclick="showLogin(2);"><strong>로그인</strong> 하세요</button>
                <p>로그인을 하시면 <br>더 많은 서비스를 이용하실 수 있습니다. </p>
                <div class="btn">
                  <button type="button" onclick="location.href='/dgtourcard'">디지털 관광주민증</button>
                  <button type="button" onclick="location.href='/list/travelbenefit.do?service=trss'">가볼래-터</button>
<!--                  <button type="button" onclick="location.href='/rewardPage/'">배지콕콕</button>-->
                </div>
              </div>
            `);
            // $('.app_profile_layer').style.height = '170px'
            loginYn = 'N';
        } else {
            if(data.body.privacyagree == 'N' && result.snsType != '10'&& $('#mainAgreement').length > 0){
                layerPopup.layerShow('mainAgreement');
                $('#login .btn_close3').remove();
                $(document).off();
                $('body').css('overflow', 'hidden');
            } else if(data.body.privacyagree && data.body.privacyagree == 'Y')
                ssoprivacyagree = 'Y';

            var strHtml = ''
            var profileImg = '';
            if(result.snsType == '10'){
                strHtml += '    <span class="name">'+result.pUsrName+'</span>';
            } else {
                profileImg = result.profileImg;
                if(result.profileChk == 'Y') {
                    profileImg = mainimgurl+result.imgId;
                } else {
                    if(profileImg != null && profileImg != ''){
                        profileImg = profileImg.replace('http://', 'https://');
                        profileImg = profileImg.replace('th-p.talk.kakao.co.kr', 'k.kakaocdn.net');
                    }
                }
                profileImageUrl = profileImg
                switch (result.snsType+'') {    // 프로필 사진
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
                        //if(result.profileChk != 'Y') {
                        strHtml += '<span class="ico"><img src="../resources/images/sub/ico_kakao.png" alt="카카오톡"></span>';
                        //}
                        break;
                    case '6':   // 구글
                        strHtml += '<span class="ico"><img src="../resources/images/sub/ico_plus.png" alt="구글"></span>';
                        break;
                    case '7':   // 애플
                        strHtml += '<span class="ico"><img src="../resources/images/sub/ico_apple.png" alt="애플"></span>';
                        break;
                }
            }

            let usrname = result.snsUsrName.substring(0,3);
            for (let i = 3; i < result.snsUsrName.length; i++) {
                usrname += '.';
            }
            // PC버전 헤더 로그인 상태 처리

            let emstyle = 'style="display: none;"';
            if(!getCookie('profile_em')){
                emstyle = '';
                setCookie("profile_em",true,1)
            }

            profileImg = profileImg != 'null' ? profileImg : '';

            var arraySplit = profileImg.split("/");

            // 페이스북 기본 이미지 변경
            if (arraySplit[2] == 'scontent-gmp1-1.xx.fbcdn.net' || arraySplit[2] == 'scontent-ssn1-1.xx.fbcdn.net') {

                let splitLastValueFaceBook = profileImg.split('?')[0];
                let splitLastValueFaceBookJpg = splitLastValueFaceBook.split('/')[5];
                profileImg = splitLastValueFaceBookJpg == '84628273_176159830277856_972693363922829312_n.jpg' ?  '' : profileImg;

            }

            // 카카오 기본 이미지 변경
            if (profileImg == 'https://k.kakaocdn.net/dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0/img_640x640.jpg') {
                profileImg = '';
            }

            // 네이버 기본 이미지 변경
            if (profileImg == 'https://ssl.pstatic.net/static/pwe/address/img_profile.png') {
                profileImg = '';
            }

            profileImg = profileImg ? `style="background-image : url(${profileImg});"` : '';
            const strHtmlPc = `<a href="javascript:goMypage();" ${profileImg}>마이페이지</a>`
                + `<em ${emstyle}>${usrname}</em>`;

            $('#mo_profile2').html(strHtmlPc);
            $('#mo_profile2').addClass('type1');
            $('#pc_profile').html(strHtmlPc);
            $('#pc_profile').addClass('type1');

            // 모바일버전 헤더 로그인 상태 처리

            const strHtmlMo = ` <div class="photo" ${profileImg} >${strHtml}</div>
                                                    <div class="info">
                                                        <span>반가워요!</span>
                                                        <strong class="name">${result.snsUsrName}님</strong>
                                                        <div class="in_btn">
                                                                <button type="button" class="mypg" onclick="goMypage();">마이페이지</button>
                                                                <button type="button" class="logout" onclick="showLogin(1);">로그아웃</button>
                                                        </div>
                                                    </div>
                                                    <div class="btn">
                                                        <button type="button" onclick="location.href='/dgtourcard'">디지털 관광주민증</button>
                                                        <button type="button" onclick="location.href='/list/travelbenefit.do?service=trss'">가볼래-터</button>
                                                        <!--                  <button type="button" onclick="location.href='/rewardPage/'">배지콕콕</button>-->
                                                    </div>`

            $('#mo_profile').html(strHtmlMo);
            $('#mo_profile').addClass('after');

            // 앱버전 헤더 로그인 상태 처리
            let mainAppHtml = ` <span class="profile">
                                                            <span class="img" ${profileImg}" alt="프로필"></span>
                                                            ${strHtml}
                                                    </span>
                                                    <p>
                                                        어서와요
                                                        <strong>${result.snsUsrName}님!</strong>
                                                    </p>`

            const appMenuHtml = `
              <div class="photo" ${profileImg} >${strHtml}</div>
              <div class="info">
                <span>반가워요!</span>
                <strong class="name">${result.snsUsrName}님</strong>
                <div class="in_btn">
                    <button type="button" class="mypg" onclick="goMypage();">마이페이지</button>
                    <button type="button" class="logout" onclick="showLogin(1);">로그아웃</button>
                </div>
              </div>
              <div class="btn">
                <button type="button" onclick="location.href='/dgtourcard'">디지털 관광주민증</button>
                <button type="button" onclick="location.href='/list/travelbenefit.do?service=trss'">가볼래-터</button>
                <!--                  <button type="button" onclick="location.href='/rewardPage/'">배지콕콕</button>-->
              </div>
            `

            $('.app_login').css('display', '')
            $('.app_logout').css('display', 'none')
            $('.app_login').html(mainAppHtml)
            $('.app_profile_layer').css('display', 'none')
            $('.app_profile_layer').css('display', 'none')
            $('.app_profile_layer.after').css('display','')
            $('.app_profile_layer.after').html(appMenuHtml)

            $('#quick_login_tab').html('<a href="javascript:goMypage();" class="mypage">' +
                '<span class="profile type1">' +
                `<span ${profileImg}>프로필 사진</span></span>MY페이지</a>`);
            loginYn = 'Y';
            sloginType = result.snsType;
            snsChannel = result.snsTyNm;
            snsUsrName = result.snsUsrName;
            snsRegYmd = result.mbersJoinYmd;

            setGtmSnsDimensions();

            getTrssPreview(() => {
                try{
                    if(!trssinfo.body.user){
                        trssChangeLink();
                    }
                } catch (e){
                    console.log(e);
                }
            })

        }

        // 파트너스 페이지
        if(location.pathname.indexOf("/partners/") > -1 ) {
            $('#commonLoginView').hide();
            $('#partnersLoginView').show();
            partnersLoginChk();
        }

        // 추가 항목 입력 페이지
        if(location.pathname.indexOf("/common/more_info.do") > -1 && loginYn == 'N') {
            location.href = sessionStorage.getItem('beforeUrl');
            sessionStorage.removeItem('beforeUrl');
        }

    } else{ // 운영계, 검증계, 개발계, 로컬 제외 도메인
        const id = data.snsId;

        if( id == null || id == 'null' || id == undefined || id == 'undefined' || id == '' ) {

            // PC버전 헤더 미로그인 상태 처리
            $('#pc_profile').removeClass('type1');
            $('#pc_profile').html('<a href="javascript:showLogin(2);">로그인</a>');
            $('#mo_profile2').removeClass('type1');
            $('#mo_profile2').html('<a href="javascript:showLogin(2);"></a>');
            // 모바일버전 헤더 미로그인 상태 처리
            $('#mo_profile').html(`
                <div class="photo"></div><div class="info">
                <button type="button" onclick="showLogin(2);"><strong>로그인</strong> 하세요</button>
                <p>로그인을 하시면 <br>더 많은 서비스를 이용하실 수 있습니다. </p>
                <div class="btn">
                    <button type="button" onClick="location.href='/dgtourcard'">디지털 관광주민증</button>
                    <button type="button" onClick="location.href='/list/travelbenefit.do?service=trss'">가볼래-터</button>
                </div>
                </div>`)
            $('#mo_profile').style.height = '170px'
            $('#quick_login_tab').html('<a href="javascript:showLogin(2);" class="mypage">' +
                '<span class="profile"><span>프로필 사진</span></span>로그인</a>');
            trssChangeLink();

            loginYn = 'N';
        } else {
            let strHtml = '';
            let profileImg = '';
            if(data.snsType == '10'){
                strHtml += '    <span class="name">'+data.pUsrName+'</span>';
            } else {
                profileImg = data.profileImg;
                if(data.profileChk == 'Y') {
                    profileImg = mainimgurl+data.imgId;
                } else {
                    if(profileImg != null && profileImg != ''){
                        profileImg = profileImg.replace('http://', 'https://');
                        profileImg = profileImg.replace('th-p.talk.kakao.co.kr', 'k.kakaocdn.net');
                    }
                }
                switch (data.snsType+'') {  // 프로필 사진
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
                        //if(data.profileChk != 'Y') {
                        strHtml += '<span class="ico"><img src="../resources/images/sub/ico_kakao.png" alt="카카오톡"></span>';
                        //}
                        break;
                    case '6':   // 구글
                        strHtml += '<span class="ico"><img src="../resources/images/sub/ico_plus.png" alt="구글"></span>';
                        break;
                    case '7':   // 애플
                        strHtml += '<span class="ico"><img src="../resources/images/sub/ico_apple.png" alt="애플"></span>';
                        break;
                }
            }


            let usrname = data.snsUsrName.substring(0,3);
            for (let i = 3; i < data.snsUsrName.length; i++) {
                usrname += '.';
            }
            // PC버전 헤더 로그인 상태 처리

            let emstyle = 'style="display: none;"';
            if(!getCookie('profile_em')){
                emstyle = '';
                setCookie("profile_em",true,1)
            }

            profileImg = profileImg != 'null' ? profileImg : '';

            var arraySplit = profileImg.split("/");

            // 페이스북 기본 이미지 변경
            if (arraySplit[2] == 'scontent-gmp1-1.xx.fbcdn.net' || arraySplit[2] == 'scontent-ssn1-1.xx.fbcdn.net') {

                let splitLastValueFaceBook = profileImg.split('?')[0];
                let splitLastValueFaceBookJpg = splitLastValueFaceBook.split('/')[5];
                profileImg = splitLastValueFaceBookJpg == '84628273_176159830277856_972693363922829312_n.jpg' ?  '' : profileImg;

            }

            // 카카오 기본 이미지 변경
            if (profileImg == 'https://k.kakaocdn.net/dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0/img_640x640.jpg') {
                profileImg = '';
            }

            // 네이버 기본 이미지 변경
            if (profileImg == 'https://ssl.pstatic.net/static/pwe/address/img_profile.png') {
                profileImg = '';
            }

            profileImg = profileImg? `style="background-image : url(${profileImg});"` : '';
            const strHtmlPc = `<a href="javascript:goMypage();" ${profileImg}>프로필 사진</a>`
                + `<em ${emstyle}>${usrname}</em>`;

            $('#mo_profile2').html(strHtmlPc);
            $('#mo_profile2').addClass('type1');
            $('#pc_profile').html(strHtmlPc);
            $('#pc_profile').addClass('type1');

            const strHtmlMo = `<div class="photo" ${profileImg} >${strHtml}</div>`
                + '<div class="info">'
                +   '<span>반가워요!</span>'
                +   `<strong>${data.snsUsrName}님</strong>`
                +   '<div class="btn">'
                +       '<button type="button" onclick="goMypage();">마이페이지</button>'
                +       '<button type="button" onclick="javascript:location.href= mainurl+\'/rewardPage/\'">배지콕콕</button>'
                +       '<button type="button" onclick="showLogin(1);">로그아웃</button>'
                +   '</div>'
                + '</div>';

            $('#mo_profile').html(strHtmlMo);
            $('#mo_profile').addClass('after');
            $('#quick_login_tab').html('<a href="javascript:goMypage();" class="mypage">' +
                '<span class="profile type1">' +
                `<span ${profileImg}>프로필 사진</span></span>MY페이지</a>`);


            loginYn = 'Y';
            sloginType = data.snsType;
            snsChannel = data.snsTyNm;
            snsRegYmd = data.mbersJoinYmd;
            snsId = data.snsId;
            snsUsrName = data.snsUsrName;
            setGtmSnsDimensions();

            getTrssPreview(() => {
                try{
                    if(!trssinfo.body.user){
                        trssChangeLink();
                    }
                } catch (e){
                    console.log(e);
                }
            })
        }

        // 파트너스 페이지
        if(location.pathname.indexOf("/partners/") > -1 ) {
            $('#commonLoginView').hide();
            $('#partnersLoginView').show();
            partnersLoginChk();
        }

        // 추가 항목 입력 페이지
        if(location.pathname.indexOf("/common/more_info.do") > -1 && loginYn == 'N') {
            location.href = sessionStorage.getItem('beforeUrl');
            sessionStorage.removeItem('beforeUrl');
        }
    }

}

/**
 * SSO 로그인(운영계) 제외, 나머지 도메인 소셜 로그인.
 * (운영계는 SSOLogin(); 함수 사용)
 *
 * 이 함수의 로직 처리 순서:
 *
 * 0). 소셜 타입 별 switch 분기.
 * 1). 세션 스토리지에 로그인 후처리 데이터 저장.
 * 2). 새 창으로 로그인 페이지(/common/snsChk.do) 이동.
 */
var reqPart = '';
var reqUsrid = '';
// 로그인시
function goLogin(loginkind) {
    // '000 :: FACEBOOK,\n001 :: TWITTER,\n002 :: INSTAGRAM,\n004 :: NAVER,
    // \n005 :: KAKAOTALK,\n006 :: GOOGLE

    sessionStorage.removeItem('snsType');
    sessionStorage.setItem('beforeUrl', beforeUrl);

    var autoLogin = document.getElementById('autoLogin').checked?'Y':'N';
    var loginType;

    switch (loginkind) {
        case 'facebook': loginType = 0; break;
        case 'twitter': loginType = 1; break;
        case 'naver': loginType = 4; break;
        case 'kakao': loginType = 5; break;
        case 'kf': loginType = 'kf'; break;
        case 'google': loginType = 6; break;
        case 'apple': loginType = 7; break;
    }
    if( appYn == 'N') {
        if(getBrowser() != 'OperaTouch'){
            window.open(supporturl+'/common/snsChk.do?loginType='+loginType+'&appYn=N&reqPart='+reqPart+'&reqUsrid='+reqUsrid+'&autoLogin='+autoLogin);
        } else{
            // 브라우저가 OperaTouch 시에 세션으로 이전 url 저장

            if(beforeUrl == '')
                sessionStorage.setItem('beforeUrl', document.location.href);

            location.href = supporturl+'/common/snsChk.do?loginType='+loginType+'&appYn=N&reqPart='+reqPart+'&reqUsrid='+reqUsrid+'&autoLogin='+autoLogin;
        }
    } else {
        location.href = 'opentab://'+supporturl+'/common/snsChk.do?loginType='+loginType+'&appYn=Y&reqPart='+reqPart+'&reqUsrid='+reqUsrid+'&autoLogin='+autoLogin;
    }
}

//로그인후 reload - web
function loginResult() {

    if(typeof dataLayer != 'undefined'){
        dataLayer.push({
            'login_comple': 'Y'
        });
    } else{
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({
            'login_comple': 'Y'
        });
    }

    gaCookie = getCookie('_ga');
    $.ajax({
        url: mainurl+'/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'SNS_MORE_INFO_CHK',
            ga : gaCookie
        },
        success: function(data) {
            loginReload();
        },
        complete: function() {
        },
        error: function(xhr, textStatus, errorThrown) {
        }
    });
}

function transmitAppLoginProcData(userInfo, autoLogin) {
    const snsId = userInfo.snsId;
    const isAutoLogin = (typeof autoLogin != 'undefined' && autoLogin != null) ? autoLogin : false;
    const snsTypeTxt = parseAppToastSocialTypeText(userInfo.snsType);
    
    callAppNativeFunction(
        {
            userId: snsId
            , isAutoLogin: isAutoLogin
            , loginChannel: snsTypeTxt
        }
        , 'signInComplete');
}

function parseAppToastSocialTypeText(snsTypeCode) {
    if (snsTypeCode == null) {
        snsTypeCode = '';
    }
    
    switch (snsTypeCode + '') {
        case '0': 
            return '페이스북';
        case '1': 
            return '트위터';
        case '2': 
            return '인스타그램';
        case '3': 
            return '다음';
        case '4': 
            return '네이버';
        case '5': 
            return '카카오';
        case '6': 
            return '구글';
        case '7': 
            return '애플';
        default : 
            return '기타';
    }
}

function loginrewordChk(){
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd: 'SNS_REWORD_CHK'
        },
        success: function (data) {

        }, complete: function () {
        },
        error: function (xhr, textStatus, errorThrown) {
        }
    });
}

function loginReload() {
    loginrewordChk();
    if(window.location.href.indexOf('/kstay/ks_intro') != -1){
        $.ajax({
            url: mainurl+'/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'KSTAY_USER_CHECK'
            },
            success: function(data) {
                if(data.header.process == 'success') {
                    location.href = '/kstay/ks_main.do';
                } else {
                    layerPopup.layerShow('loginFpop2');
                }
            },
            complete: function() {
            },
            error: function(xhr, textStatus, errorThrown) {
            }
        });

    } else if (window.location.href.includes('/common/login/dgtourcard-login')) {
        sessionStorage.removeItem('beforeUrl');
        const hasQueryString = location.href.includes('?');
        if (hasQueryString) {
            location.href = (location.href + '&landingYn=Y');
        } else {
            location.href = (location.href + '?landingYn=Y');
        }
        
    } else if (window.location.href.includes('/common/login.do')) {
        location.href = mainurl+'/common/login.do?landingYn=Y';
        
    } else{
        if(appYn !='Y' && sessionStorage.getItem('beforeUrl') != ''){
            if (getParameter("service") == 'trss' && landingYn == 'Y') {
                location.href = sessionStorage.getItem('beforeUrl') + '&landingYn=Y';
                sessionStorage.removeItem('beforeUrl');
            } else {
                location.href = sessionStorage.getItem('beforeUrl');
                sessionStorage.removeItem('beforeUrl');
            }
        } else{
            if (getParameter("service") == 'trss' && landingYn == 'Y') {
                location.href = sessionStorage.getItem('beforeUrl') + '&landingYn=Y';
                sessionStorage.removeItem('beforeUrl');
            } else if(getCookie('sticker_beforeUrl')){
                location.href = getCookie('sticker_beforeUrl');
            } else {
                window.location.reload(true);
            }
        }
    }
}

function goPartnersLogin() {
    if( $('#plogin').text() == '로그아웃' ) {

        if( confirm("로그아웃을 하시겠습니까 ?") == true) {

            $.ajax({
                url: mainurl+'/call',
                dataType: 'json',
                type: "POST",
                data: {
                    cmd : 'SNS_SESSION_DELETE'
                },
                success: function(data) {
                    loginYn = 'N';
                    location.href = '/partners/partners_main.do';
                },
                complete: function() {
                },
                error: function(xhr, textStatus, errorThrown) {
                }
            });
        }
    } else {
        location.href = '/partners/partners_login.do';
    }
}


function showLogin(kind) {

    let logintest = getParameter('logintest');
    if(logintest){
        if(logintest.indexOf('#') != -1)
            logintest = logintest.replace(logintest.substring(logintest.indexOf('#'),logintest.length),'')
        if(logintest != 'true')
            logintest = 'false';
    } else{
        logintest = 'false';
    }

    if(location.href.indexOf('korean.visitkorea') != -1 && logintest == 'false'){

        if( loginYn == 'N' ) {
            beforefocus =  document.activeElement;
            layerPopup.layerShow('socialLogin');
            // layerPopup.layerShow('serviceStopPop');
        } else {
            if( confirm("로그아웃을 하시겠습니까 ?") == true) {
                logout();
            }
        }

    } else{

        if(getBrowser() == 'Kakao'){
            $('#login .google').remove();
        }

        if( loginYn == 'N' ) {
            beforefocus = document.activeElement;
            $("#gnbMain .all_menu .menu").removeClass("active");
            if( kind == 1 ) {
                $('#loginChk p').remove();
            } else {
                $('#loginChk').html('<p>로그인이 필요한 기능입니다.<br>로그인 후 재 진행 바랍니다. </p>');
            }
            layerPopup.layerShow('login');
            // layerPopup.layerShow('serviceStopPop');
            // $('.pop_log').show();
        } else {
            if( confirm("로그아웃을 하시겠습니까 ?") == true) {
                logout();
            }
        }
    }
}

function logout(){
    //프로필 닉네임 노출 관련 쿠키 제거
    removeCookie("profile_em");

    $.ajax({
        url: mainurl+'/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'SNS_SESSION_DELETE'
        },
        success: function(data) {
            $('body').css('overflow', '');
            loginYn = 'N';
            sessionStorage.removeItem('dCardCertDuplicateSnsSelection');
            sessionStorage.removeItem('spfyLgnMicroSvcJoinRecomm');
            sessionStorage.removeItem('spfyLgnStepFin');
            try {
                if(appYn == 'Y'){
                    callAppNativeFunction({}, 'logOut');
                }
                spasapLoginOut('logout');
            } catch (e) {
            }
            if( location.href.indexOf("mypage") > -1 ) {
                location.href = '/main/main.do';
            } else {
                window.location.reload(true);
            }
        },
        complete: function() {
        },
        error: function(xhr, textStatus, errorThrown) {
        }
    });
}

function logincheckurl(url,kind){

    if( loginYn == 'N') {
        showLogin(2);
    } else {
        if(kind == 1)
            openWindow(url)
        else
            location.href = url;
    }
}

/**
 * SSO 소셜 로그인(운영계).
 * (나머지 도메인의 로그인 처리는 goLogin(); 함수 사용)
 *
 * 해당 함수의 로직 처리 순서:
 *
 * (1). 자동 로그인 체크박스 확인 후 쿠키 추가
 * (2). 세션 스토리지에 로그인 후처리 정보 저장
 * (3). 새 창으로 SSO 로그인 창(/ssoagent/ssologin.do) 열기
 */
function SSOLogin() {
    if (typeof withTrackNetFunnel !== 'undefined') {
        withTrackNetFunnel('act_sso_login', SSOLoginProxy)
    } else {
        SSOLoginProxy()
    }
}

function SSOLoginProxy(){

    if(loginalertcheck){
        alert('서비스 점검 중입니다. 서비스 이용에 불편을 드려 죄송합니다.\n' +
            '빠른 시간안에 작업을 마칠 수 있도록 최선을 다하겠습니다.');
        return;
    }


    let boolAlc = false;
    if (document.getElementById('autoLogin2')) {
        boolAlc = document.getElementById('autoLogin2').checked;
    } else if (document.getElementById('autoLogin1')) {
        boolAlc = document.getElementById('autoLogin1').checked;
    }
    
    let autoLogin = boolAlc ? 'Y':'N';
    setCookie("alc", boolAlc, 365);


    let devicetype = 'PC';
    if(appYn == 'Y')
        devicetype = 'APP'
    else if (mobileYn == 'Y')
        devicetype = 'MOBILE'



    var req_url = mainurl+"/ssoagent/ssologin.do?autologin="+autoLogin+"&appYn="+appYn+"&device="+devicetype;

    if(beforeUrl == '')
        beforeUrl = location.href;
    sessionStorage.setItem('beforeUrl', beforeUrl);
    sessionStorage.setItem('appYn', appYn);

    // 듀얼 모니터 기준
    var popupX =  (window.screen.width  / 2) - 280;
    if( window.screenLeft < 0){
        popupX = ((window.screen.width  / 2) + 280) * -1;
    }

    var popupY= (window.screen.height  / 2) - 300;
    var options = "width=560, height=600, left="+popupX+", top="+popupY; //팝업사이즈

    if( appYn == 'Y') {
        location.href = "opentab://"+req_url;
    } else {
        var popup = window.open(req_url, "한국관광공사 통합로그인", options);
        if (popup == null){
            if (confirm("팝업차단설정이 되어있습니다. 팝업 해제후 다시 시도해주시기 바랍니다.")){
            }
        }
    }
}

function commentShowLogin(kind) { // 상세 댓글관련 임시 적용

    let logintest = getParameter('logintest');
    if(logintest){
        if(logintest.indexOf('#') != -1)
            logintest = logintest.replace(logintest.substring(logintest.indexOf('#'),logintest.length),'')
        if(logintest != 'true')
            logintest = 'false';
    } else{
        logintest = 'false';
    }

    if(location.href.indexOf('korean.visitkorea') != -1 && logintest == 'false'){

        if( loginYn == 'N' ) {
            beforefocus =  document.activeElement;
            layerPopup.layerShow('socialLogin');
        } else {
            if( confirm("로그아웃을 하시겠습니까 ?") == true) {
                logout();
            }
        }

    } else{

        if(getBrowser() == 'Kakao'){
            $('#login .google').remove();
        }

        if( loginYn == 'N' ) {
            beforefocus = document.activeElement;
            $("#gnbMain .all_menu .menu").removeClass("active");
            if( kind == 1 ) {
                $('#loginChk p').remove();
            } else {
                $('#loginChk').html('<p>로그인이 필요한 기능입니다.<br>로그인 후 재 진행 바랍니다. </p>');
            }
            layerPopup.layerShow('login');
        }
    }
}
