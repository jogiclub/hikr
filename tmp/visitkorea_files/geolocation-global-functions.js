/**
 * GPS 모듈을 통한, 내 위치 값 확인에 필요한 기능들 함수.
 */

/**
 * @deprecated 위지정보 제공 관련 약관 공통처리를 위하여 사용을 지양해주시고, fetchGeolocation() 함수를 이용해주세요!
 */
function getLocation() {
    getLocationYn = 'Y';

    if( appYn == 'N') {

        setTimeout(function() {

            if(GetLocationChk == 'N'){
                if(mobileYn =='N'){
                    GetLocationChk = 'Y';
                    permitLocation = 'N';
                    showPositionNot(0,0);
                }
            }
        }, 500);
        if (navigator.geolocation) {
            if(getBrowser() === 'Firefox'){
                navigator.geolocation.getCurrentPosition(setPosition,showError);
            } else{
                navigator.geolocation.getCurrentPosition(setPosition, showError, showOptions);
            }
        } else {
            GetLocationChk = 'Y';
            permitLocation = 'N';
            showPositionNot(0,0);
        }
    } else {
        location.href = "location:?getXY=location";
    }
}

function setLocationXY(x, y) {
    if (appYn == 'Y' && sessionStorage.getItem('startByGetXYAppModule')) {// fetchGeolocation(); 메서드 사용 도중 앱에서 호출된 경우.
        geolocationX = x;
        geolocationY = y;
        locationx = x;
        locationy = y;

        sessionStorage.removeItem('startByGetXYAppModule');
        sessionStorage.setItem('setFromLocationXYCallback', true);
        fetchGeolocation();

    } else if( x == 0.000000 || y == 0.000000 ) {
        permitLocation = 'N';
        showPositionNot(0, 0);

    } else {
        geolocationX = x;
        geolocationY = y;

        if (x == 10000 && y == 10000) {
            permitLocation = 'N';
            showPositionNot(0,0);
        } else {
            permitLocation = 'Y';
            showPosition(x, y);
        }
    }
}

function setPosition(position) {
    if(GetLocationChk === 'Y') {return;}

    GetLocationChk = 'Y';
    var x = position.coords.latitude;
    var y = position.coords.longitude;
    // 어플에서 위치기반서비스를 종료했을 때 체크되는 좌표 (10000, 10000)
    if (x == 10000 && y == 10000) {
        permitLocation = 'N';
        showPositionNot(0,0);
    } else {
        permitLocation = 'Y';
        showPosition(x, y)
    }
}

/**
 * 위치정보 GPS 모듈을 실행시켜서
 * 사용자의 동의 여부에 따른 분기 처리가 가능하도록
 * 프라미스 객체를 반환하여주는 메서드.
 */
function _getNavigatorCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            if (getBrowser() === 'Firefox') {
                navigator.geolocation.getCurrentPosition(position => {
                        GetLocationChk = 'Y';
                        geolocationX = position.coords.latitude;
                        geolocationY = position.coords.longitude;
                        locationx = position.coords.latitude;
                        locationy = position.coords.longitude;
                        resolve(position);

                    }
                    , error => {
                        GetLocationChk = 'N';
                        reject(error);
                    });

            } else {
                navigator.geolocation.getCurrentPosition(position => {
                        GetLocationChk = 'Y';
                        geolocationX = position.coords.latitude;
                        geolocationY = position.coords.longitude;
                        locationx = position.coords.latitude;
                        locationy = position.coords.longitude;
                        resolve(position);

                    }
                    , error => {
                        GetLocationChk = 'N';
                        reject(error);
                    }
                    , showOptions);
            }

        } else {
            GetLocationChk = 'N';
            reject(new Error(`global.js: isGeolocationInfoProvAgreementPassedUser(); \n'navigator.geolocation' Object Not Found.`));
        }
    });
}

/**
 * 참고.
 * ( 앱에서는 위치 정보를 가져오기 위한 앱 모듈을 사용하는 과정에서 
 *  location:?getXY=location 스킴을 실행하여 
 *  앱 로직 처리 후 javascript:setLocationXY(); 자바스크립트 함수가 실행되며, 
 * 
 *   이 과정에서 
 *  fetchGeolocation() 함수가 
 *  일단은 한 번 완전히 종료 후에 재 실행됩니다. )
 */
function fetchGeolocation(successCallbackName, failCallbackName) {
    let usrAgreementChckPromise = isGeolocationInfoProvAgreementPassedUser();
    
    usrAgreementChckPromise
    .then(isProvAgrePassedUser => {
        
        if (isProvAgrePassedUser) {
            __getGeolocationCoords(successCallbackName, failCallbackName);
            return;
        }
        
        /* 아직 사용자 위치 정보 제공 미동의 사용자일 경우 
         * 동의 팝업을 띄우고, 
         * 사용자 선택 여부에 따라 
         * 위치 값 조회 함수를 재실행.
         */
        showGeolocationInfoPrvdAgrePopup(
            // 동의 클릭 콜백.
            _=> {
                fetchGeolocation(successCallbackName, failCallbackName);
            }
            // 거부 클릭 콜백.
            , _=> {
                const error = new Error(`global.js: fetchGeolocation(); \nUser disagree geolocation info terms. \n사용자가 약관에 동의하지 않아서 GPS 모듈을 실행하지 않습니다.`);
                geolocationX = 0;
                geolocationY = 0;
                locationx = 0;
                locationy = 0;

                if (typeof failCallbackName == 'function') {
                    failCallbackName(error);
                } else if (failCallbackName != null) {
                    eval(`${failCallbackName}(error);`);
                }
            }
        );
        
    })
    .catch(err => 
         eval(`${failCallbackName}(err);`)
    );
}

/**
 * 디바이스 종류 별, 각 GPS 모듈을 사용하여 
 * 실제 사용자 위치 좌표 값을 가져오는 실행 로직.
 */
function __getGeolocationCoords(successCallbackName, failCallbackName) {
    
    let {staticSuccessCallbackName, staticFailCallbackName} = 
            __initGeolocationGlobalCallback(successCallbackName, failCallbackName);

    if (appYn == 'Y') {
        const isExistGPSAppModuleStartFlag = (sessionStorage.getItem('startByGetXYAppModule') != null);
        const startByAppSetLocationXYCallbackFlag = (sessionStorage.getItem('setFromLocationXYCallback') != null);

        if (! startByAppSetLocationXYCallbackFlag) {
            __initGeolocationAppCallbackMeta(staticSuccessCallbackName, staticFailCallbackName);
            
            if (! isExistGPSAppModuleStartFlag) {// location:?getXY=location 모듈의 중복적 소환 방지.
                __startGetAppLocationCoordsModule();
            }
            
        } else {// 'location:?getXY=location' 실행 후 'setLocationXY();' 함수를 통해서 재진입하였을 경우.
            __runAppCallbackAfterRecallByNativeAppModule();
        }
        
        return;
    }
    
    // 앱이 아닌 경우.
    _getNavigatorCurrentPosition()
        .then(position => {
            if (staticSuccessCallbackName != null) {
                eval(`${staticSuccessCallbackName}(position);`);
            }
        })
        .catch(error => {
            if (staticFailCallbackName != null) {
                eval(`${staticFailCallbackName}(error);`);
            }
        });
}

/*
 * 앱에서의 위치 값 가져오기 모듈 실행 전, 
 * 콜백 관련 메타 데이터 초기화.
 */
function __initGeolocationAppCallbackMeta(successCallbackNm, failCallbackNm) {
    if (successCallbackNm != null) {
        sessionStorage.setItem('geolocSuccCB', successCallbackNm);
    }
    if (failCallbackNm != null) {
        sessionStorage.setItem('geolocFailCB', failCallbackNm);
    }
}

/*
 * 앱에서의 위치 값 가져오기 모듈 실행.
 */
function __startGetAppLocationCoordsModule() {
    sessionStorage.setItem('startByGetXYAppModule', true);
    location.href = 'location:?getXY=location';
}

/*
 * fetchGeolocation() 함수가 
 * 'location:?getXY=location'에 의해 재실행 되었을 때 
 * 위치 값을 사용하여 콜백을 실행.
 */
function __runAppCallbackAfterRecallByNativeAppModule() {
    sessionStorage.removeItem('setFromLocationXYCallback');
    const successCallbackNm = sessionStorage.getItem('geolocSuccCB');
    const failCallbackNm = sessionStorage.getItem('geolocFailCB');
    sessionStorage.removeItem('geolocSuccCB');
    sessionStorage.removeItem('geolocFailCB');
    
    const isAppModuleFailure = (geolocationX == 0.000000 && geolocationY == 0.000000) || (geolocationX == 10000 && geolocationY == 10000);
    if (isAppModuleFailure) {
        GetLocationChk = 'N';
        permitLocation = 'N';
        if (failCallbackNm == null) {
            return;
        }
        const appGeolocError = new Error(`global.js: fetchGeolocation(); \nApp Geolocation module not work.`);
        geolocationX = 0;
        geolocationY = 0;
        locationx = 0;
        locationy = 0;
    
        if (typeof tmpStaticFailCBFn == 'function') {
            tmpStaticFailCBFn(appGeolocError);
        } else {
            eval(`${failCallbackNm}(appGeolocError);`);
        }
    
    } else {// 수신 성공 시.
        GetLocationChk = 'Y';
        permitLocation = 'Y';
        const position = {
            coords: {
                latitude: geolocationX,
                longitude: geolocationY,
            }
        };
        if (typeof tmpStaticSuccCBFn == 'function') {
            tmpStaticSuccCBFn(position);
        } else {
            eval(`${successCallbackNm}(position);`);
        }
    }
}

/**
 * 각 디바이스(PC/Mobile)의 GPS 모듈에서 
 * 위치 값을 수신한 이후 실행해야 할 콜백 함수를 
 * 전역 변수로 초기화 함.
 * 
 * 1. window.{함수명}을 사용하여 전역 함수로 지정하고 
 *   이 함수를 추후 실행할 수 있도록 
 * 
 * 2. 전역 함수 명을 구조화하여 리턴.
 *   (사용 함수에서는 객체 구조 분해 할당 형식으로 취급할 것을 권장합니다.)
 */
function __initGeolocationGlobalCallback(successCallbackName, failCallbackName) {
    /*
     * 전달받은 인자(콜백)가 자바스크립트 함수 이름이 아닌, 함수 객체일 경우
     * 임시(전역) 변수에 담아뒀다가 추후에 콜백으로 직접 실행.
     */
    if (typeof successCallbackName == 'function') {
        window.tmpStaticSuccCBFn = successCallbackName;
        successCallbackName = 'tmpStaticSuccCBFn';
    }
    if (typeof failCallbackName == 'function') {
        window.tmpStaticFailCBFn = failCallbackName;
        failCallbackName = 'tmpStaticFailCBFn';
    }
    
    return {
        staticSuccessCallbackName: successCallbackName
        , staticFailCallbackName: failCallbackName
    };
}

/**
 * 사용자의 위치정보 제공 동의여부 체크.
 * Case 1. 앱 아닐 경우: sessionStorage를 체킹.
 * Case 2. 앱일 경우: 2-(1). 로그인 사용자: DB 저장 값 체킹.
 * Case 2. 앱일 경우: 2-(2). 미로그인 사용자: sessionStorage를 체킹.
 */
async function isGeolocationInfoProvAgreementPassedUser() {
    let agreementChckForLocSession = localStorage.getItem('useGeolocDataAgreYn');
    if (agreementChckForLocSession == null) {
        agreementChckForLocSession = false;
    }

    if (appYn == 'N' || typeof snsId == 'undefined'|| snsId == 'null' || snsId == null || snsId == 'undefined' || snsId == undefined) {
        return agreementChckForLocSession;
    } else {
        return await isGeolocAgreDBPassedUserCheck();
    }
}

/**
 * 사용자의 위치정보 제공 동의여부 DB 저장 값 체크.
 */
async function isGeolocAgreDBPassedUserCheck() {
    if (typeof snsId == 'undefined'|| snsId == 'null' || snsId == null || snsId == 'undefined' || snsId == undefined) {
        return false;
    }

    const checkResult =
        await fetchByCall('GET_GEOLOCATION_INFO_PRVD_AGRE_YN')
            .then(data => {
                const agreementData = data.agreementResult;
                const isProvAgree = ( agreementData != null && agreementData.LOC_INFO_PRVD_AGRE_YN == 'Y' );

                if (isProvAgree) {
                    localStorage.setItem('useGeolocDataAgre', snsId)
                } else {
                    localStorage.removeItem('useGeolocDataAgre');
                    localStorage.removeItem('useGeolocDataAgreYn');
                }
                return isProvAgree;
            })
            .catch(err => {
                console.dir(err);
                return false;
            });

    return checkResult;
}

/**
 * 로그인 사용자의 위치정보 제공 동의여부 결정 값 DB 저장.
 */
async function saveGeolocAgreData(isAgreement) {
    if (snsId == null) {
        throw new Error(`global.js:: func: saveGelocAgreData() :: \n'snsId' is null. \n'snsId' 값이 존재하지 않아서 함수를 실행하는게 무의미합니다.`);
    }

    return await fetchByCall('SET_GEOLOCATION_INFO_PRVD_AGRE_YN', {
        data: {
            snsId: snsId,
            geolocPrvdYn: (isAgreement ? 'Y' : 'N'),
        }
    })
        .then(d => {
            if (d.result == 1 && isAgreement) {
                localStorage.setItem('useGeolocDataAgre', snsId);
            } else if (d.result == 1 && ! isAgreement) {
                localStorage.removeItem('useGeolocDataAgre');
                localStorage.removeItem('useGeolocDataAgreYn');
            }

            return d.result;
        })
        .catch(e => {
            throw e;
        });
}

function showError(error) {
    switch(error.code) {

        case error.PERMISSION_DENIED:
            // alert("User denied the request for Geolocation");
            break;
        case error.POSITION_UNAVAILABLE:
            // alert("Location information is unavailable");
            break;
        case error.TIMEOUT:
            // alert("The request to get user location timed out");
            break;
        case error.UNKNOWN_ERROR:
            // alert("An unknown error occurred.");
            break;
    }
    GetLocationChk = 'Y';
    permitLocation = 'N';
    showPositionNot(0, 0, error);
}

var showOptions = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 2000
};

async function saveUserLocationApprovalLog(serviceType) {
    try {
        const result = await fetchByCall('SAVE_USER_LOCATION_APPROVAL_LOG', {
            osType: getOS(),
            serviceType: serviceType,
            ga: getCookie('_ga')
        });
    } catch (error) {
        console.error('Error occurred:', error);
    }
}
