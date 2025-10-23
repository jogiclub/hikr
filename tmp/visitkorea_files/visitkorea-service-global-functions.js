/** 
 * 대구석 서비스에만 연관성이 있으며, 사이트 전역에 일반적으로 사용될 `유틸성` 함수.
 */

// 파라메타 값 가져오기
var getParameter = function (param) {
    let returnValue;
    var url = location.href;
    var parameters = (url.slice(url.indexOf('?') + 1, url.length)).split('&');
    for (let i = 0; i < parameters.length; i++) {
        var varName = parameters[i].split('=')[0];
        if (varName.toUpperCase() == param.toUpperCase()) {
            returnValue = parameters[i].split('=')[1];
            return decodeURIComponent(returnValue);
        }
    }
};

function getDevice() {
    var agent = navigator.userAgent.toLowerCase();
    if (agent.indexOf('iphone') != -1 || agent.indexOf('ipad') != -1) { // iPhone
        // 기기, IOS별 모바일 버전 조정
        if (/iPhone/.test(navigator.platform)) {
            mobileYn = 'Y';
        } else {
            mobileYn = 'N';
        }
        return 'iOS';
    } else if (agent.indexOf('android') != -1) { // Android OS
        mobileYn = 'Y';
        return 'Android';
    } else if (agent.indexOf('macintosh') != -1) {  // 아이패드 어플에서는 매킨토시로 잡힘
        mobileYn = 'N';
        return 'iOS';
    } else if (agent.indexOf('ipod') != -1) {
        mobileYn = 'Y';
        return 'iOS';
    } else if (agent.indexOf('windows') != -1) {
        return 'Windows';
    } else {
        return 'Etc';
    }
}

function getOS() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;

    if (/Win/i.test(platform)) {
        return "Windows";
    }
    if (/Mac/i.test(platform)) {
        return "macOS";
    }
    if (/Linux/i.test(platform)) {
        return "Linux";
    }
    if (/Android/i.test(userAgent)) {
        return "Android";
    }
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        return "iOS";
    }
    return "ETC";
}

function getValueFromUserAgent(key) {
    let ua = navigator.userAgent;
    if (! ua.includes(key)) {
        return null;
    }
    
    const valueStartIndex = ua.indexOf(key);
    const hasValue = ( valueStartIndex != -1 )
    if (! hasValue) {
        return null;
    }
    ua = ua.substring(valueStartIndex);
    
    const valueStartAt = ( ua.indexOf('/') + 1 );
    const valueEndAt = ua.indexOf(' ')
    
    return ua.substring(valueStartAt, valueEndAt);
}

function getResponsiveTypeByDeviceWidth() {
    let deviceWidth = window.innerWidth;

    if (deviceWidth > 1535) {
        return 'P';// PC.

    } else if (deviceWidth < 1024) {
        return 'M';// Mobile.

    } else if (deviceWidth <= 1535 && deviceWidth >= 1024) {
        return 'T';// Tablet.

    } else {
        return null;
    }
}

function getBrowser() {
    var agt = navigator.userAgent.toLowerCase();
    if (agt.indexOf("kakaotalk") != -1) {
        return 'Kakao';
    }
    if (agt.indexOf("chrome") != -1) {
        return 'Chrome';
    }
    if (agt.indexOf("opera") != -1) {
        return 'Opera';
    }
    if (agt.indexOf("opt") != -1) {
        return 'OperaTouch';
    }
    if (agt.indexOf("staroffice") != -1) {
        return 'Star Office';
    }
    if (agt.indexOf("webtv") != -1) {
        return 'WebTV';
    }
    if (agt.indexOf("beonex") != -1) {
        return 'Beonex';
    }
    if (agt.indexOf("chimera") != -1) {
        return 'Chimera';
    }
    if (agt.indexOf("netpositive") != -1) {
        return 'NetPositive';
    }
    if (agt.indexOf("phoenix") != -1) {
        return 'Phoenix';
    }
    if (agt.indexOf("firefox") != -1) {
        return 'Firefox';
    }
    if (agt.indexOf("fxios") != -1) {
        return 'Firefox';
    }
    if (agt.indexOf("whale") != -1) {
        return 'Whale';
    }
    if (agt.indexOf("crios") != -1) {
        return 'CriOS';
    }
    if (agt.indexOf("naver") != -1) {
        return 'Naver';
    }
    if (agt.indexOf("safari") != -1) {
        return 'Safari';
    }
    if (agt.indexOf("skipstone") != -1) {
        return 'SkipStone';
    }
    if (agt.indexOf("netscape") != -1) {
        return 'Netscape';
    }
    if (agt.indexOf("trident") != -1) {
        return 'Internet Explorer';
    }
    if (agt.indexOf("msie") != -1) { // 익스플로러 일 경우 var rv = -1;
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return 'Internet Explorer '+rv;
    }
    if (agt.indexOf("mozilla/5.0") != -1) {
        return 'Mozilla';
    }
}

// ajax 사용시 팝업 차단 뜨는 브라우저들
function getBrowserPopup() {
    var browser = getBrowser();

    if (browser == 'Firefox'
        || browser == 'Whale'
        || browser == 'Internet Explorer') {
        return true;
    } else {
        return false;
    }
}

function getAppYn() {
    var agent = navigator.userAgent.toLowerCase();
    if (agent.indexOf('visitkor') != -1 ) {
        appYn = 'Y';
        mobileYn = 'Y';
    }

    responsiveWebType = getResponsiveTypeByDeviceWidth();
    device = getDevice();
}

function chkword(srch_val) {
    return srch_val.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\?/g,"&#63;");
}

function chkwordDecode(srch_val) {
    return srch_val.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function chkalttag(srch_val) {
    var result = srch_val;
    result = result.replace(/<br>/gi, ' ');
    result = result.replace(/<\/b>/gi, ' ');
    result = result.replace(/<b>/gi, ' ');
    result = result.split('&lt;br&gt;').join(' ');
    result = result.split('&lt;/b&gt;').join(' ');
    result = result.split('&lt;b&gt;').join(' ');
    result = result.split('&lt;BR&gt;').join(' ');
    result = result.split('&lt;/B&gt;').join(' ');
    result = result.split('&lt;B&gt;').join(' ');
    return result;
}

// 리스트 랜덤 정렬
function listRandomOrder(ul_class) {
    $('.' + ul_class).each(function() {
        var len = $('.'+ul_class+' li').length;
        var ul = $(this);

        var liArr = ul.children('li');

        liArr.sort(function() {

            var temp = parseInt(Math.random()*len);

            var temp1 = parseInt(Math.random()*len); // ie 에서 동작하기 위해 필요, 크롬 파폭에서는 없어도 동작가능

            return temp1-temp;

        }).appendTo(ul);
    });
}

function getPlusDateTime(date, amountToAdd, unit) {
    switch (unit) {
        case "second":
            date.setSeconds(date.getSeconds() + amountToAdd)
            break
        case "minute":
            date.setMinutes(date.getMinutes() + amountToAdd)
            break
        case "hour":
            date.setHours(date.getHours() + amountToAdd)
            break
        case "day":
            date.setDate(date.getDate() + amountToAdd)
            break
        case "month":
            date.setMonth(date.getMonth() + amountToAdd)
            break
        case "year":
            date.setFullYear(date.getFullYear() + amountToAdd)
            break
    }
    return date
}

// 요일 변환
function weekTrans(week, type) {
    let weekTran = ''

    switch (week) {
        case 1: weekTran = '일'; break;
        case 2: weekTran = '월'; break;
        case 3: weekTran = '화'; break;
        case 4: weekTran = '수'; break;
        case 5: weekTran = '목'; break;
        case 6: weekTran = '금'; break;
        case 7: weekTran = '토'; break;
        default: return '';
    }

    if (type == 1) {
        weekTran += '요일';
    }
    return weekTran;
}

function CreateDate(Stringdate) {
    var year = Stringdate.substring(0,4);
    var month = Stringdate.substring(5,7);
    var day = Stringdate.substring(8,10);
    var hour = Stringdate.substring(11,13);
    var minute = Stringdate.substring(14,16);
    var date = new Date(year,month-1,day,hour,minute);

    return date;
}

function getReadNumber(num) {
    if (!isNaN(num)) {
        if (num > 999999) {
            num =  Math.round(num /100000) /10+ 'M';
        } else if (num > 999) {
            num = Math.round(num /100) /10+ 'K';
        }
    }

    return num;
}

// 태블릿 이하 사이즈 여부 => /* TODO :: 체크하여 비슷한 구현함수가 존재하면, 대체 후 제거가 필오함. */
const smallerThanTablet = () => $(window).width() < 1023;

// url파라미터 get => /* TODO :: 체크하여 비슷한 구현함수가 존재하면, 대체 후 제거가 필오함. */
const urlGet = (k) => new URLSearchParams(location.search).get(k);

// 오페라 모바일 여부 => /* TODO :: 체크하여 비슷한 구현함수가 존재하면, 대체 후 제거가 필오함. */
const isOperaMobile = () => /^(?=.*\bopr\b)(?=.*\bandroid\b)(?=.*\bmobile\b).*$/i.test(navigator.userAgent);

function isAppMain() {
  return appYn === 'Y' || getParameter('appMain')
}

function hasJongseong(str) {
    if (typeof str !== 'string' || !str.trim()) {
        return false;
    }

    str = str.trim().replace(/ /g,"")

    let lastChar = str.charAt(str.length - 1);

    if (str.includes('(') && str.indexOf('(') > 0 && lastChar === ')') {
        lastChar = str.charAt(str.indexOf('(') - 1);
    }

    if (!lastChar) {
        return false;
    }

    const lastCharCode = lastChar.charCodeAt(0);

    if (isNaN(lastCharCode) || lastCharCode < 0xAC00 || lastCharCode > 0xD7A3) {
        return false;
    }

    return (lastCharCode - 0xAC00) % 28 !== 0;
}
