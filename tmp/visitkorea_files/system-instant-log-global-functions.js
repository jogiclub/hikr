/** 
 * 프론트엔드 자바스크립트 에러 로그를 간단하게 DB에 적재시킬 수 있는, 임시 로그적재 로직을 담은 함수.
 */

/* 에러 객체를 사용하여 Javascript 에러 메시지를 서버에 기록. */
function addErrorToInstantLoggerLog(error, logTitle) {
    if (logTitle == null) {
        logTitle = 'ERROR :: javascript:global.js';
    }
    let errorMsg = parseErrorToMessageString(error);
    
    fetchByCall('ADD_INSTANT_LOGGER_LOG'
            , {title: logTitle, content: errorMsg});
}

/* Javascript 에러 객체로부터, 오류 내용에 대한 확인이 가능한 메시지를 추출.  */
function parseErrorToMessageString(error) {
    try{
        let localeString = error.toLocaleString();
        let columnNumber = ('columnNumber: ' + error.columnNumber);
        let fileName = ('fileName: ' + error.fileName);
        let lineNumber = ('lineNumber: ' + error.lineNumber);
        let stack = ('stack: ' + error.stack);
        let locationUrl = ('href: ' + location.href);
        let gaCookieValue = ('_ga: ' + getCookie('_ga'));
        let ua = ('userAgent: ' + navigator.userAgent);
        
        let errorMessageString = '';
        errorMessageString += localeString;
        errorMessageString += '\n';
        errorMessageString += columnNumber;
        errorMessageString += '\n';
        errorMessageString += fileName;
        errorMessageString += '\n';
        errorMessageString += lineNumber;
        errorMessageString += '\n';
        errorMessageString += stack;
        errorMessageString += '\n';
        errorMessageString += locationUrl;
        errorMessageString += '\n';
        errorMessageString += gaCookieValue;
        errorMessageString += '\n';
        errorMessageString += ua;
        
        return errorMessageString;
        
    } catch (parseError) {
        return `Error is occured from 'parseErrorToMessageString().'\n${parseError.stack}`;
    }
}
