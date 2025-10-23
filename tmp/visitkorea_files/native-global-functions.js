/**
 * 대한민국 구석구석 앱 ~ 자바스크립트 간 연동 지원 전역함수.
 */

function getAppVersionCode() {
    versionCode = getValueFromUserAgent('versionCode');
    if (versionCode == null) {
        return 0;
    }
    return versionCode;
}

/**
 * Web에서
 * App 소스의 네이티브 함수를 호출.
 *
 * appSourceFunctionNm: 호출할 앱 소스의 메서드 명.
 * args: 앱으로 전달할 파라미터의 자바스크립트 객체.
 */
function callAppNativeFunction(args, appSourceFunctionNm) {
    if (appYn != 'Y') {
        console.log('Called App only function by WEB !!');
        return;
    }

    if (! args) {
        args = {};
    }
    if (!! appSourceFunctionNm) {
        args["funcname"] = appSourceFunctionNm;
    }

    const encodedMessageValue = encodeURIComponent(JSON.stringify(args));
    const deviceInfo = getDevice().toLocaleLowerCase();

    try {
        if (deviceInfo == 'android' && typeof vkinterface != 'undefined' && !! vkinterface) {
            vkinterface.postMessage(encodedMessageValue);

        } else if (deviceInfo == 'ios' && (!! window.webkit) && (!! window.webkit.messageHandlers.vkinterface)) {
            window.webkit.messageHandlers.vkinterface.postMessage(encodedMessageValue);
        }

    } catch(e) {}
}