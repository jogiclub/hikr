/** 
 * Groobee CDP 관련 전역 함수.
 */

function transmitAppGroobeeCdpData(userInfo, autoLogin) {
    if (appYn != 'Y') {
        return;
    }
    const trssGrade = userInfo.groobeGrade;
    const gender = userInfo.gender;
    const rsdeNm = userInfo.rsdeNm;
    const birthYr = userInfo.birthYr;
    const isAutoLogin = (typeof autoLogin != 'undefined' && autoLogin != null) ? autoLogin : false;

    let groobeeGradeCode = '0';
    let groobeeGenderCode = '';
    let groobeeRsdeCode = '';
    let groobeeAgeCode = '';

    if (!! trssGrade) {
        if (!(trssGrade == '1' ||  trssGrade == '2')) {
            groobeeGradeCode = '0';
        } else if (trssGrade == '1') {
            groobeeGradeCode = trssGrade;
        }
    }
    if (!! gender) {
        if (gender == 'M') {
            groobeeGenderCode = '1';
        } else if (gender == 'F') {
            groobeeGenderCode = '2';
        }
    }
    if (!! rsdeNm) {
        groobeeRsdeCode = userInfo.rsdeCd;
    }
    if (!! birthYr) {
        let age = 0;
        try {
            age = (new Date()).getFullYear() - birthYr + 1;
        } catch(e) {}

        if (age < 100) {
            groobeeAgeCode = 10;
        } else {
            groobeeAgeCode = parseInt(age / 10);
        }
    }

    const args = {
        userId: userInfo.snsId
        , grade: groobeeGradeCode
        , gender: groobeeGenderCode
        , type: groobeeRsdeCode
        , age: groobeeAgeCode
        , isAutoLogin: isAutoLogin
    };
    
    callAppNativeFunction(args, 'setUserInfo');
}

function pushCDP(eventKey, eventValue) {
    if (!eventKey) return;
    try {
        const cdp = getCDPInterface?.();
        if (!cdp || typeof cdp.pushBySpecificFunction !== "function") {
            return;
        }
        cdp.pushBySpecificFunction(
            { eventKey, eventValue },
            "pushGroobeeTaxonomyCustomEvent"
        );
    } catch (e) {
        console.log("CDP 데이터 전송 중 오류가 발생했습니다.\n", e);
    }
}
