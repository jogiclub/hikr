let main = {
    init: () => {
        main.initLanguages();
    },
    initLanguages: () => {
        const url = location.href;
        const pathname = location.pathname;
        const languageSwitches = document.querySelectorAll('#hd_wrap a[data-lang]');
        const currentLanguage = (url.indexOf('/en/') > -1 || url.indexOf('lang=en') > -1) ? 'en' : 'kr';

        /**
         * lang 파라미터 추가
         * params {String} urlString
         * params {String} key
         * params {String} value
         */
        const addLangParam = (urlString, key, value) => {
            const url = new URL(urlString);
            url.searchParams.set(key, value);
            return url.toString();
        };

        /**
         * lang 파라미터 제거
         * params {String} urlString
         * params {String} key
         */
        const removeLangParam = (urlString, key) => {
            const url = new URL(urlString);
            url.searchParams.delete(key);
            return url.toString();
        };
        
        for (button of languageSwitches) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = e.currentTarget.dataset.lang;
                const slashCount = location.pathname.split('/').length;

                if ( lang === currentLanguage ) return;

                if ( lang === 'en' ) {
                    if ( url.indexOf('/board.php') > -1 ) {
                        const replaceURL = addLangParam(url, 'lang', 'en')
                        location.href = replaceURL;
                    } else if (pathname.indexOf('/station/') > -1) {
                        // /station/이 포함된 경우: /en/station/으로 이동
                        const replaceURL = pathname.replace('/station/', '/en/station/');
                        location.href = replaceURL;
                    } else {
                        const replaceURL = slashCount > 2 ? `${pathname.split('/')[0]}/${pathname.split('/')[1]}/en/${pathname.split('/')[2]}` : `${pathname.split('/')[0]}/en/${pathname.split('/')[1]}`;
                        location.href = replaceURL;
                    }
                } else {
                    if ( url.indexOf('/board.php') > -1 ) {
                        const replaceURL = removeLangParam(url, 'lang');
                        location.href = replaceURL;
                    } else {
                        const replaceURL = url.replace('/en/', '/');
                        location.href = replaceURL;
                    }
                }
            });
        }
    }
};

$(function () {
    main.init();
});