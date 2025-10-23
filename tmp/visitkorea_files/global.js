/** ##########. 사이트 전역으로 이용될 변수의 선언 및 초기화. ########## */
_importJavaScript('./global/global-various.js');// global-various.js: 사이트 전역으로 공유될 변수들을 정의한 스크립트 파일. (모든 사이트 전역 변수는 해당 파일에 `선언`만 해주세요...)

/** ##########. 사이트 전역으로 이용될 함수를을 각 비즈니스 서비스 별 파일에 나눠서 정의. ########## */
_importJavaScript('./common-util/system-global-functions.js');// system-global-functions.js: 자바스크립트 시스템 관련 `유틸성` 함수.
_importJavaScript('./common-util/visitkorea-service-global-functions.js');// visitkorea-service-global-functions.js: 대구석 서비스에만 연관성이 있으며, 서비스 전반에 일반적으로 사용될 `유틸성` 함수.
_importJavaScript('./gps/geolocation-global-functions.js');
_importJavaScript('./login/global-functions.js');
_importJavaScript('./selfcert/global-functions.js');
_importJavaScript('./cdp/groobee-global-functions.js');
_importJavaScript('./log/content-log-global-functions.js');
_importJavaScript('./log/system-instant-log-global-functions.js');
_importJavaScript('./app/native-global-functions.js');

/** ##########. 기존의 `gobal.js` 파일 내부 로직들이 담긴, 사이트 전역으로 공유될 일반적인 로직들이 정의. ########## */
_importJavaScript('./global/global-business.js');

/** ##########. onload, onclick 등등... 사이트 전반에 걸쳐 공유될 이벤트 선언과 관련된 로직들을 정의. ########## */
_importJavaScript('./global/init-default-events.js');

/* 
 * 다른 js 파일을 불러오기 위한, 호출 함수.
 */
function _importJavaScript(jsFilePath) {
    try {
        // global.js 파일 기준의 상대경로 표현일 경우.
        if (jsFilePath.charAt(0) == '.') {
            jsFilePath = `/resources/js/${jsFilePath}`;
        }

        //쿼리 스트링 추가
        const scriptUrl = new URL(jsFilePath, window.location.origin);
        scriptUrl.searchParams.set('v', new Date().getTime().toString());

        jsFilePath = scriptUrl.toString();
        document.write(`<script type="text/javascript" src="${jsFilePath}"></script>`);
    } catch(error) {
        console.error('스크립트 로드 중 예외가 발생하였습니다.', error, jsFilePath);
    }
}