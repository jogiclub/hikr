/** 
 * 자바스크립트 시스템 관련 `유틸성` 함수.
 */

function fn_addMonth(pAddMonthCnt) {

    var yyyy,m,d;
    var dt = new Date();

    // Display the month, day, and year. getMonth() returns a 0-based number.
    var pMonth = dt.getMonth()+1;
    var pDay = dt.getDate();
    var pYear = dt.getFullYear();

    var oDate = new Date(pYear, pMonth, 1);
    oDate.setMonth(oDate.getMonth() + Number(pAddMonthCnt));
    yyyy = oDate.getFullYear();

    m = oDate.getMonth();
    d = oDate.getDate();
    if( pAddMonthCnt >= 0 ) {
        if( m == '0' ) { m = '12'; yyyy = yyyy - 1;}
    } else {
        if( m == '0' ) { m = '12'; yyyy = yyyy - 1;}
    }
    return yyyy + "-" + m + "-" + d;
}

// date(yyyyMMddhhmm형식)
// format(yyyyMMdd,yyyyMMddhhmm)
// splitStr(ko or '-' or '/')
function conDateFormat(date, format, splitStr) {
    var rtnDate = '';

    if(format == "yyyy-MM-dd"){
        format = "yyyyMMdd";
        date = replaceAll(date,'-','');
    } else if(format == "yyyy.MM.dd"){
        format = "yyyyMMdd";
        date = replaceAll(date,'.','');
    } else if(format == "yyyy.MM"){
        format = "yyyyMM";
        date = replaceAll(date,'.','');
    }
    if( "yyyyMMdd" == format ) {
        if(date.length >= 8 ) {
            if("" == splitStr) {
                rtnDate += date.substring(0,4)+date.substring(4,6)+date.substring(6,8);
            } else {
                if("ko" == splitStr ) {
                    rtnDate += date.substring(0,4) + '년';
                    rtnDate += date.substring(4,6) + '월';
                    rtnDate += date.substring(6,8) + '일';
                } else {
                    let firstMonth = date.substr(4,1);
                    let firstDate = date.substr(6,1);
                    if (firstMonth.indexOf('0') !== -1) {
                        if(firstDate.indexOf('0') !== -1) {
                            rtnDate += date.substring(0,4) + splitStr + " ";
                            rtnDate += date.substring(5,6) + splitStr + " ";
                            rtnDate += date.substring(7,8) + splitStr;
                        } else {
                            rtnDate += date.substring(0,4) + splitStr + " ";
                            rtnDate += date.substring(5,6) + splitStr + " ";
                            rtnDate += date.substring(6,8) + splitStr;
                        }
                    } else if(firstDate.indexOf('0') !== -1) {
                        rtnDate += date.substring(0,4) + splitStr + " ";
                        rtnDate += date.substring(4,6) + splitStr + " ";
                        rtnDate += date.substring(7,8) + splitStr;
                    } else {
                        rtnDate += date.substring(0,4) + splitStr + " ";
                        rtnDate += date.substring(4,6) + splitStr + " ";
                        rtnDate += date.substring(6,8) + splitStr;
                    }
                }
            }
        } else {
            rtnDate = date;
        }
    } else if( "yyyyMM" == format ) {
        if(date.length >= 6 ) {
            if("" == splitStr) {
                rtnDate += date.substring(0,4)+date.substring(4,6);
            } else {
                if("ko" == splitStr ) {
                    rtnDate += date.substring(0,4) + '년';
                    rtnDate += date.substring(4,6) + '월';
                } else {
                    let firstMonth = date.substr(4,1);
                    let firstDate = date.substr(6,1);
                    if (firstMonth.indexOf('0') !== -1) {
                        rtnDate += date.substring(0,4) + splitStr + " ";
                        rtnDate += date.substring(5,6) + splitStr;
                    } else if(firstDate.indexOf('0') !== -1) {
                        rtnDate += date.substring(0,4) + splitStr + " ";
                        rtnDate += date.substring(4,6) + splitStr;
                    } else {
                        rtnDate += date.substring(0,4) + splitStr + " ";
                        rtnDate += date.substring(4,6) + splitStr;
                    }
                }
            }
        } else {
            rtnDate = date;
        }
    } else if( "yyyyMMddHHmm" == format ) {
        if(date.length >= 12 ) {
            if("" == splitStr) {
                rtnDate += date.substring(0,4)+date.substring(4,6)+date.substring(6,8)+date.substring(8,10)+date.substring(10,12);
            } else {
                if("ko" == splitStr ) {
                    rtnDate += date.substring(0,4) + '년';
                    rtnDate += date.substring(4,6) + '월';
                    rtnDate += date.substring(6,8) + '일';
                    rtnDate += date.substring(8,10) + '시';
                    rtnDate += date.substring(10,12) + '분';
                } else {
                    rtnDate += date.substring(0,4) + splitStr;
                    rtnDate += date.substring(4,6) + splitStr;
                    rtnDate += date.substring(6,8) + splitStr;
                    rtnDate += date.substring(8,10) + splitStr;
                    rtnDate += date.substring(10,12);
                }
            }
        } else {
            rtnDate = date;
        }
    } else if("MMdd" == format){
        if(date.length >= 8 ) {
            if("" == splitStr) {
                rtnDate += date.substring(0,4)+date.substring(4,6)+date.substring(6,8);
            } else {
                if("ko" == splitStr ) {
                    rtnDate += date.substring(4,6) + '월';
                    rtnDate += date.substring(6,8) + '일';
                } else {
                    rtnDate += date.substring(4,6) + splitStr;
                    rtnDate += date.substring(6,8);
                }
            }
        } else {
            rtnDate = date;
        }
    } else if("hhmmss" == format){
        if(date.length >= 6 ) {
            if("" == splitStr) {
                rtnDate += date.substring(8,10)+date.substring(10,12)+date.substring(12,14);
            } else {
                if("ko" == splitStr ) {
                    rtnDate += date.substring(8,10) + '시';
                    rtnDate += date.substring(10,12) + '분';
                    rtnDate += date.substring(12,14) + '초';
                } else {
                    rtnDate += date.substring(8,10) + splitStr;
                    rtnDate += date.substring(10,12) + splitStr;
                    rtnDate += date.substring(12,14);
                }
            }
        } else {
            rtnDate = date;
        }
    }else if('yyyy. M. d.' === format){
        const m = date.charAt(4) === '0' ? date.substring(5, 6) : date.substring(4, 6);
        const d = date.charAt(6) === '0' ? date.substring(7, 8) : date.substring(6, 8);
        rtnDate = `${date.substring(0,4)}. ${m}. ${d}.`;
    }
    return rtnDate;
}

// date(yyyyMMddhhmm형식)
// format(yyyyMMdd,yyyyMMddhhmm)
// splitStr(ko or '-' or '/')
function conDateFormat2(date, format, splitStr) {
    var rtnDate = '';
    if( "yyyyMMdd" == format ) {
        if(date.length >= 8 ) {
            if("" == splitStr) {
                rtnDate += date.substring(0,4)+date.substring(4,6)+date.substring(6,8);
            } else {
                if("ko" == splitStr ) {
                    rtnDate += date.substring(0,4) + '년';
                    rtnDate += date.substring(4,6) + '월';
                    rtnDate += date.substring(6,8) + '일';
                } else {
                    let firstMonth = date.substr(4,1);
                    let firstDate = date.substr(6,1);
                    if (firstMonth.indexOf('0') !== -1) {
                        if(firstDate.indexOf('0') !== -1) {
                            rtnDate += date.substring(5,6) + splitStr;
                            rtnDate += date.substring(7,8);
                        } else {
                            rtnDate += date.substring(5,6) + splitStr;
                            rtnDate += date.substring(6,8);
                        }
                    } else if(firstDate.indexOf('0') !== -1) {
                        rtnDate += date.substring(4,6) + splitStr;
                        rtnDate += date.substring(7,8);
                    } else {
                        rtnDate += date.substring(4,6) + splitStr;
                        rtnDate += date.substring(6,8);
                    }
                }
            }
        } else {
            rtnDate = date;
        }
    } else if( "yyyyMMddHHmm" == format ) {
        if(date.length >= 12 ) {
            if("" == splitStr) {
                rtnDate += date.substring(0,4)+date.substring(4,6)+date.substring(6,8)+date.substring(8,10)+date.substring(10,12);
            } else {
                if("ko" == splitStr ) {
                    rtnDate += date.substring(0,4) + '년';
                    rtnDate += date.substring(4,6) + '월';
                    rtnDate += date.substring(6,8) + '일';
                    rtnDate += date.substring(8,10) + '시';
                    rtnDate += date.substring(10,12) + '분';
                } else {
                    rtnDate += date.substring(0,4) + splitStr;
                    rtnDate += date.substring(4,6) + splitStr;
                    rtnDate += date.substring(6,8) + splitStr;
                    rtnDate += date.substring(8,10) + splitStr;
                    rtnDate += date.substring(10,12);
                }
            }
        } else {
            rtnDate = date;
        }
    } else {
    }

    return rtnDate;
}

function dateToStr(date, format){
    const month = date.getMonth() + 1,
        day = date.getDate(),
        formattedMonth = month < 10 ? "0" + month : month.toString(),
        formattedDay = day < 10 ? "0" + day : day.toString();
    let result = '';

    switch(format){
        case 'yyyyMMdd':
            result = date.getFullYear() + formattedMonth + formattedDay; break;
        case 'yyMMdd':
            result = date.getFullYear() % 100 + formattedMonth + formattedDay; break;
        case 'yy년 M월 d일':
            result = `${date.getFullYear() % 100}년 ${month}월 ${day}일`; break;
        case 'yy년 MM월 dd일':
            result = `${date.getFullYear() % 100}년 ${formattedMonth}월 ${formattedDay}`; break;
        case 'yyyy년 MM월 dd일':
            result = `${date.getFullYear()}년 ${formattedMonth}월 ${formattedDay}일`; break;
        case 'yyyy년 M월 d일':
            result = `${date.getFullYear()}년 ${month}월 ${day}일`; break;
    }

    return result;
}

function pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function numberWithCommas(x) {
    if( x == undefined || x == 'undefined' ) {
        return 0;
    } else {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

Number.prototype.toRad = function() {
    return this * Math.PI / 180;
}

// javascript 거리계산.
function calculateDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {
    function deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lng2-lng1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function ctrim(stringToTrim) {
    // return stringToTrim.replace(/^\s+|\s+$/g,"");
    return stringToTrim.replace(/(\s*)/g,"");
}

function quotReplace(Str,kind) {
    if( Str == undefined || Str == 'undefined' || Str == null || Str == '' ) {
        return '';
    } else {
        if(kind && kind == 1){
            return replaceAll(replaceAll(Str,"&quot;","\""),"&#39;","\'");
        } else{
            return Str.replace(/\"/g,"&quot;").replace(/\'/g,"&#39;");
        }
    }
}

function onlyNumber(event){
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;
    if ( (keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) || keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39 )
        return;
    else
        return false;
}

function removeChar(event) {
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;
    if ( keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39 )
        return;
    else
        event.target.value = event.target.value.replace(/[^0-9]/g, "");
}

function getPeriodOfDates(from, to) {
    const times = to - from
    const seconds = times / 1000
    return {
        seconds: seconds,
        minutes: seconds / 60,
        hours: seconds / 60 / 60,
        dates: seconds / 60 / 60 / 24,
    }
}

function getParameterFromUri(uri) {
    const parameters = uri.split('&');
    const parameterObject = {}

    for (let i = 0; i < parameters.length; i++) {
        const parameter = parameters[i].split('=')
        const key = parameter[0].toLowerCase()
        if (key.indexOf("[]") !== -1) {
            const substrKey = key.replace("[]", "")
            if (parameterObject[substrKey] !== undefined) {
                parameterObject[substrKey].push(parameter[1])
            } else {
                parameterObject[substrKey] = [parameter[1]]
            }
        } else if(key === 'areacode' || key === 'sigungucode') {
            let value = parameter[1]
            if (value.indexOf(",") !== -1) {
                parameterObject[key] = value.split(",")
            } else {
                if (value === '0' || value === '99' || value === 'All') {
                    value = '0';
                }
                parameterObject[key] = value
            }
        } else {
            parameterObject[key] = parameter[1]
        }
    }
    return parameterObject
}

function hasText(str) {
    return str !== undefined && str !== 'null' && str !== '';
}

function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}

// 날짜 형식 문자열에 시간 추가
const addTimeToDate = (d) => d + "T23:59:59.999";

/*
    날짜 타입 데이터를 구분자가 포함된 날짜&시간 형식 문자열로 바꾸는 함수
    ex) dateTransfer(new Date) → '2023.04.17T17:10:43'
    ex) dateTransfer(new Date,'-') → '2023-04-17T17:10:43'
 */
const dateTransfer = (d, sep = '.') => {
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    const dateString = year + sep + month  + sep + day;

    const hours = ('0' + d.getHours()).slice(-2);
    const minutes = ('0' + d.getMinutes()).slice(-2);
    const seconds = ('0' + d.getSeconds()).slice(-2);

    const timeString = hours + ':' + minutes  + ':' + seconds;

    return dateString + "T" + timeString;
}

/*
    구분자가 있는 날짜 형식 문자열을 yyyy?MM?dd 와 같이 구분자를 변경하고 길이를 맞추는 함수
    ex) dateStrChangeSeparator('2023-04-17', '.') → 2023.04.17
    ex) dateStrChangeSeparator('23-4-17') → 2023.04.17
 */
const dateStrChangeSeparator = (str, sep = '.') => {
    const parts = str.split(/[.-]/);
    if (parts.length !== 3)
        return str;
    const [yearStr, monthStr, dayStr] = parts.map((part) => part.trim().padStart(2, '0'));
    const year = yearStr.length === 4 ? yearStr : `20${yearStr}`;
    return `${year}${sep}${monthStr}${sep}${dayStr}`;
};

/*
    구분자가 없는 8자리 날짜 형식 문자열을 yyyy?MM?dd 와 같이 구분자를 삽입하는 함수
    ex) dateAddSeparator('20230417', '.') → 2023.04.17
 */
const dateAddSeparator = (str, sep) => str.replace(/(\d{4})(\d{2})(\d{2})/, `$1${sep}$2${sep}$3`);

// 특수문자 제거
const removeSpecialChars = (str) => str.replace(/[^\w\s]/gi, '');

// 빈 객체 여부
const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;

// 배열 중복 객체 제거
const removeDuplicates = (arr) => {
    const uniqueArr = [];
    const uniqueValues = new Set();

    for (let i = 0; i < arr.length; i++) {
        const { odmId, ...rest } = arr[i];
        const values = Object.values(rest);

        if (!uniqueValues.has(values.join())) {
            uniqueArr.push(arr[i]);
            uniqueValues.add(values.join());
        }
    }

    return uniqueArr;
}

// null 변환
const nullConvert = (str) => isEmpty(str) ? '' : str;

//화면에 렌더링 할 때 html escape 처리
const escapeHtml = (unsafe) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return unsafe.replace(/[&<>"']/g, (match) => map[match]);
}

const unescapeHtml = (safe) => {
    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };
    return safe.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => map[match]);
};

const setForcedScrollAttribute = (obj) => {
    $(obj).attr('forcedscroll', 'y');
};
