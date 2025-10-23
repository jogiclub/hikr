let HotPlaceSwiper;
let focusOutSize;
let disableSize = window.innerHeight;
let selectedIndex = -1;

let lastInputMethod = null;
let ignoreNextEnter = false;
let ignoreSearchInTablet = true;

let travelInfoCampaignKeyInSearchIndex;

document.addEventListener('keydown', (e) => {
    lastInputMethod = 'keyboard';
});

document.addEventListener('mousedown', (e) => {
    lastInputMethod = 'mouse';
});

function OpenSearchForm() {
    $('#inp_search_mo').hide();
    getMySearchKeywords(setMySearchKeywords); // 최근검색어
    togglePopularSearch(); // 인기 검색어 표시(모바일 / PC)
    settingGroobeeCampaignKeyInSearchIndex(); // 캠페인 키 세팅
    groobeeRecommendCall(); // 추천 여행지 호출
    checkLoginForGroobeeSection();
    togglePopularMoreVisibility();
    setlogo('.search_index .svgLogo');

    $('.search_index').show();
    if (getDevice() != 'Android') {
        $('#inp_search_index').focus();
        $('#selectedAreaButton').addClass('on');
    }

    if (smallerThanTablet()) {
        $('body').css('overflow', 'hidden');
        $('#inp_search_index').focus();
        $('#selectedAreaButton').addClass('on');
    } else {
        $('body').css('overflow', 'hidden');
    }

    const moreRecentBtn = document.querySelector('.recent_search .more_btn button');
    if (moreRecentBtn) {
        moreRecentBtn.addEventListener('click', handleMoreBtnClick);
    }

    const moreKeywordBtn = document.querySelector('.keyword .more_btn button');
    if (moreKeywordBtn) {
        moreKeywordBtn.addEventListener('click', handleKeywordMoreBtnClick);
    }

    adjustLayout();
    adjustKeywordLayout();
    checkAreaButtonClass();

    document.addEventListener('click', function(event) {
        var areaButton = document.getElementById('selectedAreaButton');
        var popup = document.getElementById('areaselectPop');
        var isClickInside = areaButton.contains(event.target) || popup.contains(event.target);

        if (!isClickInside) {
            popup.style.display = "none";
            areaButton.classList.remove('active');
        }
    });

    document.querySelector('.wrap').addEventListener('click', function(event) {
        var areaButton = document.getElementById('selectedAreaButton');
        var popup = document.getElementById('areaselectPop');
        var isClickInside = areaButton.contains(event.target) || popup.contains(event.target);

        if (!isClickInside) {
            popup.style.display = "none";
            areaButton.classList.remove('active');
        }
    });

    if (smallerThanTablet()) {
        document.querySelectorAll('input[name="areaChk"]').forEach((radio) => {
            // 마우스 클릭 처리
            radio.addEventListener('click', function (e) {
                if (lastInputMethod !== 'mouse') {
                    return;
                }

                let selectedArea = this.value;

                selectArea(selectedArea);
            });
        });
    } else {
        document.querySelector('.btn_areaselect').addEventListener('click', function (e) {

            e.preventDefault();

            const selectedRadio = document.querySelector('input[name="areaChk"]:checked');

            document.querySelectorAll('input[name="areaChk"]').forEach(r => {
                r.removeAttribute('title');
            });

            selectedRadio.setAttribute('title', '선택됨');

            const selectedArea = selectedRadio.value;
            selectArea(selectedArea);

            ignoreNextEnter = true;
        });
    }

}

$("input[name='areaChk']").change(function() {
    // 1) 모든 라디오의 title 속성 제거
    $("input[name='areaChk']").removeAttr("title");

    // 2) 현재 체크된 라디오에만 title="선택됨"
    $("input[name='areaChk']:checked").attr("title", "선택됨");
});

function checkAreaButtonClass() {
    const inputBox = document.querySelector('#inp_search_index');
    const areaButton = document.querySelector('#selectedAreaButton');

    inputBox.addEventListener('input', function() {
        if (!areaButton.classList.contains('on')) {
            areaButton.classList.add('on');
        }
    });

    inputBox.addEventListener('focus', function () {
        if (!areaButton.classList.contains('on')) {
            areaButton.classList.add('on');
        }
    });

    inputBox.addEventListener('blur', function () {
        if (areaButton.classList.contains('on')) {
            if (inputBox.value.length === 0) {
                areaButton.classList.remove('on');
            }
        } else {
            areaButton.classList.add('on');
        }
    });
}

function CloseSearchForm () {
    $('.search_index').hide();
    $('#inp_search_mo').show();
    if ($('body').css('overflow') == 'hidden') {
        $('body').css('overflow', '');
    }

}

function showAreaPopup() {
    var areaButton = document.getElementById('selectedAreaButton');
    var popup = document.getElementById('areaselectPop');

    if (areaButton.classList.contains('active')) {
        areaButton.classList.remove('active');
        areaButton.setAttribute('title', '지역 선택 레이어 닫힘');
    } else {
        areaButton.classList.add('active');
        areaButton.setAttribute('title', '지역 선택 레이어 열림');
    }
    if (popup.style.display === "none" || popup.style.display === "") {
        popup.style.display = "block";
    } else {
        popup.style.display = "none";
        areaButton.classList.remove('active');
    }
}

/* 최근 검색어 시작 */
const getMySearchKeywords = (callback) => {
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd: 'GET_MY_SEARCH_KEYWORDS',
            ga: setGaCookie(getCookie('_ga')),
        },
        success: function (data) {
            callback(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            $('.recent_search .btn').hide();
            $('.recent_search ul').html('');
            $('.recent_search .no_data').show();
            $('.recent_search .close').hide();
        }
    });
}

const setMySearchKeywords = (data) => {
    const pcviewSearches = document.querySelector('.recent_search .swiper-container.pcview .swiper-wrapper');
    const moviewSearches = document.querySelector('.recent_search .swiper-container.moview .swiper-wrapper');

    if (data.header.process == 'success' && data.body.Keywords.length > 0) {
        const keywords = data.body.Keywords;

        pcviewSearches.innerHTML = '';
        moviewSearches.innerHTML = '';

        keywords.forEach((item) => {
            const searchMoItem = `
                <li class="swiper-slide" style="margin-right: 7px;">
                    <a href="javascript:goSearchList('${quotReplace(item.keyword)}','',0);">${xssFilter(item.keyword)}</a>
                    <button type="button" class="delete" onclick="DeleteMySearchKeywords(0,'${item.srkId}',this);">삭제</button>
                </li>
            `;

            const searchPcItem = `
                <li class="swiper-slide">
                    <a href="javascript:goSearchList('${quotReplace(item.keyword)}','',0);">${xssFilter(item.keyword)}</a>
                    <button type="button" class="delete" onclick="DeleteMySearchKeywords(0,'${item.srkId}',this);">삭제</button>
                </li>
            `;

            moviewSearches.innerHTML += searchMoItem;
            pcviewSearches.innerHTML += searchPcItem;

        });

        $('.recent_search .no_data').hide();
        $('.recent_search .close').show();

        if (smallerThanTablet()) {
            moviewSearches.parentElement.style.display = 'block';
            pcviewSearches.parentElement.style.display = 'none';
        } else {
            pcviewSearches.parentElement.style.display = 'block';
            moviewSearches.parentElement.style.display = 'none';
        }

        adjustLayout();
    } else {
        pcviewSearches.innerHTML = '';
        moviewSearches.innerHTML = '';
        $('.recent_search .no_data').show();
        $('.recent_search .close').hide();
        pcviewSearches.parentElement.style.display = 'none';
        moviewSearches.parentElement.style.display = 'none';
    }
};

const adjustLayout = () => {
    const recentSearch = document.querySelector('.recent_search');
    const swiperContainerMoview = recentSearch.querySelector('.swiper-container.moview');
    const swiperWrapperMoview = swiperContainerMoview.querySelector('.swiper-wrapper');
    const containerWidthMoview = swiperContainerMoview.clientWidth;
    let totalWidthMoview = 0;

    Array.from(swiperWrapperMoview.children).forEach(child => {
        totalWidthMoview += child.getBoundingClientRect().width + parseFloat(window.getComputedStyle(child).marginRight);
    });


    const swiperContainerPc = recentSearch.querySelector('.swiper-container.pcview');
    const swiperWrapperPc = swiperContainerPc.querySelector('.swiper-wrapper');
    const moreBtnDivForPc = recentSearch.querySelector('.more_btn');
    const moreBtnForPc = recentSearch.querySelector('.more_btn button');
    const containerWidthPc = swiperContainerPc.clientWidth;
    let currentRowWidthPc = 0;
    let isWrappedPc = false;

    Array.from(swiperWrapperPc.children).forEach(child => {
        const childWidth = child.getBoundingClientRect().width + parseFloat(window.getComputedStyle(child).marginRight);
        if (currentRowWidthPc + childWidth > containerWidthPc) {
            isWrappedPc = true;
        } else {
            currentRowWidthPc += childWidth;
        }
    });

    if (isWrappedPc || swiperWrapperPc.scrollHeight > swiperContainerPc.clientHeight) {
        moreBtnDivForPc.style.display = 'block';
        moreBtnForPc.style.display = 'block';
    } else {
        moreBtnDivForPc.style.display = 'none';
        moreBtnForPc.style.display = 'none';
    }
};

window.addEventListener('resize', () => {
    adjustLayout();
});
window.addEventListener('load', () => {
    adjustLayout();
});

function handleMoreBtnClick() {
    const moreBtn = this;
    const recentWordWhole = document.querySelector('.recent_search');

    if (moreBtn.classList.contains('up')) {
        moreBtn.textContent = '더보기';
        moreBtn.classList.remove('up');
        recentWordWhole.classList.remove('open');
    } else {
        moreBtn.textContent = '접기';
        moreBtn.classList.add('up');
        recentWordWhole.classList.add('open');
    }
}

function DeleteMySearchKeywords(kind, srkId, el) {
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd: 'DELETE_MY_SEARCH_KEYWORDS',
            kind: kind,
            srkId: srkId,
            ga: setGaCookie(getCookie('_ga'))
        },
        success: function(data) {
            if (data.header.process == 'success') {
                getMySearchKeywords(setMySearchKeywords);
            } else {
                alert('검색어 삭제에 실패하였습니다.');
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            alert('삭제하는데 오류가 발생하였습니다.');
        }
    });
}

/* 최근 검색어 종료 */

const checkKeyword = (kwrd) =>{
    let keyword = replaceAll(kwrd,`'`,`\\\'`);
    keyword = replaceAll(keyword,`"`,`\\\"`);
    return keyword;
}

/* 최근 인기 검색어 시작 */
const getHotKeywords = (callback)=>{
    $.ajax({
        url : domainIfno + '/trans_json.jsp',
        dataType : 'json',
        type : "POST",
        data : {
            collection : 'total', //Collection 구분값
            type : 'popword',
            range : 'W',	// 일간 D, 주간 W, 월간 M
            listCount : 10
        },
        success : function(data) {
            callback(data);	// 인기검색어
        },
        error : function(xhr, textStatus, errorThrown) {
        }
    });
}

const setHotKeywords = (data) =>{
    let strHtml1 = "";
    let strHtml2 = "";
    if (data.Data.Query.querycount != 0) {
        $.each(data.Data.Query,function(index, items) {
            if (index <10) {
                let indexNum = ++index;
                let contTypeNm =items.content;
                if (indexNum < 6) {
                    strHtml1 +=`<li><span class="num">${indexNum}</span><a href="javascript:goSearchList('${contTypeNm}', 'popKeyword',1);">${xssFilter(contTypeNm)}</a></li>`;
                } else {
                    strHtml2 +=`<li><span class="num">${indexNum}</span><a href="javascript:goSearchList('${contTypeNm}', 'popKeyword',1);">${xssFilter(contTypeNm)}</a></li>`;
                }
            }
        });
        $('#popul1').html(strHtml1);
        $('#popul2').html(strHtml2);
        $('.popular_search').show();
    } else {
        $('.popular_search').hide();
    }
}
function togglePopularSearch() {
    if (smallerThanTablet()) {
        getHotKeywords(setHotKeywords); // 최근 인기검색어
        $('.popular_search').show();
    } else {
        $('.popular_search').hide();
    }
}

$(window).resize(function() {
    togglePopularSearch();
});
/* 최근 인기 검색어 종료 */

/* 추천 키워드 시작 */
function getTop5Tags() {
    $.ajax({
        url: baseApiUrl + '/api/v1/user/tendency/tag/top5',
        type: 'GET',
        traditional : true,
        dataType: 'json',
        cache: false,
        headers : {
            'Content-Type': 'application/json;',
            "X-SNS-ID": snsId,
        },
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            if (response.code === 0) {
                // 20240710 KYG => 추천 키워드 영역 display: none 처리(내부 로직 미정)
                // setTop5TagsSearchIndex(response.data);
                noTagExistInSearchIndex();
            } else {
                console.error('상위 5건 API 호출 실패:', response.message);
                noTagExistInSearchIndex();
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            console.error('상위 5건 API 호출 중 오류 발생:', textStatus);
            noTagExistInSearchIndex();
        },
        complete: () => {
            //	NetFunnel 완료 처리 → 모든 페이지 로딩 후 호출되도록 해당 부분에서 처리
            if (typeof NetFunnel_Complete !== 'undefined') {
                NetFunnel_Complete()
            }
        },
    });
}

const setTop5TagsSearchIndex = (data) => {
    const pcviewWrapper = document.querySelector('.keyword .swiper-container.pcview .swiper-wrapper');
    const moviewWrapper = document.querySelector('.keyword .swiper-container.moview .swiper-wrapper');
    const keywordSection = document.querySelector('.keyword');

    const userNameSetting = document.querySelector('.keyword h2 em');

    pcviewWrapper.innerHTML = '';
    moviewWrapper.innerHTML = '';
    if (typeof snsUsrName === 'undefined' || snsUsrName === null || snsUsrName === '') {
        userNameSetting.innerHTML = '';
    } else {
        userNameSetting.innerHTML = `'${snsUsrName}'님을 위한 `;
    }


    if (data.length > 0) {
        data.forEach((item) => {
            const tagMoItem = `
                <li class="swiper-slide" style="margin-right: 7px;">
                    <a href="javascript:goSearchList('${item}','',0);">${xssFilter(item)}</a>
                </li>
            `;
            const tagPcItem = `
                <li class="swiper-slide">
                    <a href="javascript:goSearchList('${item}','',0);">${xssFilter(item)}</a>
                </li>
            `;
            moviewWrapper.innerHTML += tagMoItem;
            pcviewWrapper.innerHTML += tagPcItem;
        });
        document.querySelector('.keyword .no_data').style.display = 'none';
        keywordSection.style.display = 'block';
        adjustKeywordLayout();
    } else {
        noTagExistInSearchIndex();
    }
};

function noTagExistInSearchIndex() {
    const keywordSection = document.querySelector('.keyword');
    keywordSection.style.display = 'none';
}

const adjustKeywordLayout = () => {
    const keywordSection = document.querySelector('.keyword');
    const swiperContainerMoview = keywordSection.querySelector('.swiper-container.moview');
    const swiperWrapperMoview = swiperContainerMoview.querySelector('.swiper-wrapper');
    const containerWidthMoview = swiperContainerMoview.clientWidth;
    let totalWidthMoview = 0;

    Array.from(swiperWrapperMoview.children).forEach(child => {
        totalWidthMoview += child.getBoundingClientRect().width + parseFloat(window.getComputedStyle(child).marginRight);
    });

    const swiperContainerPc = keywordSection.querySelector('.swiper-container.pcview');
    const swiperWrapperPc = swiperContainerPc.querySelector('.swiper-wrapper');
    const moreBtnDivForPc = keywordSection.querySelector('.more_btn');
    const moreBtnForPc = keywordSection.querySelector('.more_btn button');
    const containerWidthPc = swiperContainerPc.clientWidth;
    let currentRowWidthPc = 0;
    let isWrappedPc = false;

    Array.from(swiperWrapperPc.children).forEach(child => {
        const childWidth = child.getBoundingClientRect().width + parseFloat(window.getComputedStyle(child).marginRight);
        if (currentRowWidthPc + childWidth > containerWidthPc) {
            isWrappedPc = true;
        } else {
            currentRowWidthPc += childWidth;
        }
    });

    if (isWrappedPc || swiperWrapperPc.scrollHeight > swiperContainerPc.clientHeight) {
        moreBtnDivForPc.style.display = 'block';
        moreBtnForPc.style.display = 'block';
        moreBtnDivForPc.style.zIndex = '1';
    } else {
        moreBtnDivForPc.style.display = 'none';
        moreBtnForPc.style.display = 'none';
    }
};

window.addEventListener('resize', () => {
    adjustKeywordLayout();
    // getTop5Tags();
});
window.addEventListener('load', () => {
    adjustKeywordLayout();
    // getTop5Tags();
});


function handleKeywordMoreBtnClick() {
    const moreBtn = this;
    const keywordSection = document.querySelector('.keyword');

    if (moreBtn.classList.contains('up')) {
        moreBtn.textContent = '더보기';
        moreBtn.classList.remove('up');
        keywordSection.classList.remove('open');
    } else {
        moreBtn.textContent = '접기';
        moreBtn.classList.add('up');
        keywordSection.classList.add('open');
    }
}
/* 추천 키워드 종료 */
/* 추천 여행지 시작 */
function groobeeRecommendCall() {
    const popular_more_Section = document.querySelector('.popular_more');
    const popular_more_ul_section = document.querySelector('.popular_more ul');

    popular_more_ul_section.innerHTML = '';
    popular_more_Section.style.display = 'none';

    if (groobee && groobee.getGroobeeRecommendAsync) {
        groobee.getGroobeeRecommendAsync(travelInfoCampaignKeyInSearchIndex)
            .then(data => {
                const algorithmCd = data.algorithmCd;
                setGroobeeRecommendCall(data.goodsList, algorithmCd);
            });
    } else {
        let tryCnt = 0;
        let _timer = setInterval(() => {
            if (tryCnt === 3) {
                clearInterval(_timer);
                return;
            }
            tryCnt++;

            if (groobee.getGroobeeRecommendAsync && typeof groobee.getGroobeeRecommendAsync === 'function') {
                groobee.getGroobeeRecommendAsync(travelInfoCampaignKeyInSearchIndex)
                    .then(data => {
                        const algorithmCd = data.algorithmCd;
                        setGroobeeRecommendCall(data.goodsList, algorithmCd);
                    });
                clearInterval(_timer);
            }
        }, 500);
    }
}

const setGroobeeRecommendCall = async (data, algorithmCd) => {
    const popular_more_Section = document.querySelector('.popular_more');
    const popular_more_ul_section = document.querySelector('.popular_more ul');

    if (!data || data.length === 0) return;

    const cotIds = [];

    try {
        for (const item of data) {
            const cotId = await callContentMasterStatusInSearchIndex(item.goodsCd);
            if (cotId) cotIds.push(cotId);
        }

        if (cotIds.length === 0) {
            popular_more_Section.style.display = 'none';
            return;
        } else {
            popular_more_Section.style.display = 'block';
        }

        // 필터된 데이터와 최대 5개 컨텐츠 선택
        const filteredData = data.filter(item => cotIds.includes(item.goodsCd)).slice(0, 5);

        // 동적으로 노출된 데이터를 화면에 표시
        filteredData.forEach(item => {
            const groobeeRecommendItem = `
                    <li class="swiper-slide">
                        <a href="javascript:groobeeClickEventInSearchIndex('${algorithmCd}', '${item.goodsCd}');">
                            <img src='${item.goodsImg}' alt='${item.goodsNm}'>
                            <strong>${item.goodsNm}</strong>
                        </a>
                    </li>
                `;
            popular_more_ul_section.innerHTML += groobeeRecommendItem;
        });

        popular_more_Section.style.display = 'block';

        // 노출된 데이터를 기반으로 groobeeObj 생성
        const groobeeObj = {
            algorithmCd: algorithmCd,
            campaignKey: travelInfoCampaignKeyInSearchIndex,
            campaignTypeCd: "RE",
            goods: filteredData.map(item => ({ goodsCd: item.goodsCd }))
        };

        // testCode = groobeeObj;
        // 강제 호출 테스트 시(DI) 전역 변수로 testCode 선언하여 console 창에서 강제 호출 해볼 것!
        // groobee.send() 호출
        groobee.send("DI", groobeeObj);

        // checkLoginForGroobeeSection(); // 로그인 상태 체크
        togglePopularMoreVisibility(); // UI 표시/숨김 처리
    } catch (error) {
        console.warn("::: callContentMasterStatusInSearchIndex 호출 에러 :::", error);
    }
};

function groobeeClickEventInSearchIndex(algorithmCd, goodsCd) {
    const groobeeObj = {
        algorithmCd: algorithmCd,
        campaignKey: travelInfoCampaignKeyInSearchIndex,
        campaignTypeCd: "RE",
        goods: [{ goodsCd: goodsCd }]
    };

    // groobee.send()는 즉시 호출
    groobee.send("CL", groobeeObj);

    // 800ms 후 goSearchList 호출
    setTimeout(() => {
        goSearchGroobeeDetail(goodsCd);
    }, 800);
}

function settingGroobeeCampaignKeyInSearchIndex() {
    if (smallerThanTablet()) {
        travelInfoCampaignKeyInSearchIndex = searchIndexTravelInfoMobileCampaignKey;
    } else {
        travelInfoCampaignKeyInSearchIndex = searchIndexTravelInfoCampaignKey;
    }
}

function callContentMasterStatusInSearchIndex(goodsCd) {

    return new Promise((resolve, reject) => {
        $.ajax({
            url: mainurl + "/call",
            dataType: 'json',
            type: "POST",
            data: {
                cmd: 'CONTENT_MASTER_STATUS_CHECK',
                goodsCd: goodsCd
            },
            success: function (response) {
                const cotId = response.body?.cotId || null;
                resolve(cotId);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Error fetching ContentMaster info:", textStatus, errorThrown);
                reject(errorThrown);
            }
        });
    });
}

function checkLoginForGroobeeSection() {
    const popular_more_section = document.querySelector('.popular_more');
    if (loginYn === 'N' ) {
        popular_more_section.style.display = 'none';
    } else {
        popular_more_section.style.display = 'block';
    }
}

function togglePopularMoreVisibility() {
    var ulElement = document.querySelector('.popular_more ul');

    var liElements = ulElement.querySelectorAll('li');

    if (liElements.length === 0) {
        document.querySelector('.popular_more').style.display = 'none';
    }
}
/* 추천 여행지 종료 */


/* 검색어 자동완성 시작 */
const setKeyboardEventHandlers = () => {
    if (smallerThanTablet()) return;

    $('#inp_search_index').off('keydown').on('keydown', function (e) {
        const items = $('.related_search ul li');
        if (items.length > 0) {
            if (e.keyCode === 40) {
                e.preventDefault();
                if (selectedIndex < items.length - 1) {
                    selectedIndex++;
                } else {
                    selectedIndex = 0;
                }
                items.removeClass('on');
                items.eq(selectedIndex).addClass('on');
            } else if (e.keyCode === 38) {
                e.preventDefault();
                if (selectedIndex > 0) {
                    selectedIndex--;
                } else {
                    selectedIndex = items.length - 1;
                }
                items.removeClass('on');
                items.eq(selectedIndex).addClass('on');
            } else if (e.keyCode === 13) {
                e.preventDefault();
                if (selectedIndex >= 0) {
                    const selectedItem = items.eq(selectedIndex).find('a');
                    selectedItem[0].click();
                }
            }
        }
    });
};

const setMouseEventHandlers = () => {
    if (smallerThanTablet()) return;

    const items = $('.related_search ul li');

    items.on('mouseover', function () {
        items.removeClass('on');
        $(this).addClass('on');
        selectedIndex = items.index(this);
    });

    items.on('mouseout', function () {
        $(this).removeClass('on');
    });
};

const completechk = () => {
    let keyword = $('#inp_search_index').val();
    if (keyword != '') {
        $('.search_wrap .form .delete').show();
        $.ajax({
            url: domainIfno + '/trans_json.jsp',
            dataType: 'json',
            type: "POST",
            data: {
                type: 'ark',
                target: 'content',
                convert: 'fw',
                query: keyword,
                datatype: 'json',
                charset: 'UTF-8'
            },
            success: function (data) {
                let resultArr = [];
                let compHtml = '';
                if (data.result[0].totalcount > 0)
                    data.result[0].items.forEach((item, index) => { if (index < 6) resultArr.push(item.keyword); });
                if (resultArr.length < 6 && data.result[1].totalcount > 0)
                    data.result[1].items.forEach((item) => { if (resultArr.length < 6) resultArr.push(item.keyword); });

                if (resultArr.length === 0) {
                    $('.related_search ul').empty();
                    $('.related_search').hide();
                    return;
                }
                resultArr.forEach((item, index) => {
                    let keyTxt = '';
                    if (item.indexOf(keyword) > -1)
                        keyTxt = xssFilter(item).replace(keyword, `<strong>${keyword}</strong>`);
                    else
                        keyTxt = xssFilter(item);
                    compHtml += `<li><a href="javascript:goSearchList('${item}','',4);">${keyTxt}</a></li>`;
                });

                $('.related_search ul').html(compHtml);
                $('.related_search').show();

                const items = $('.related_search ul li');
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    items.eq(selectedIndex).addClass('on');
                }

                setMouseEventHandlers();
            },
            error: function (xhr, textStatus, errorThrown) {
                $('.related_search').hide();
            }
        });
    } else {
        $('.search_wrap .form .delete').hide();
        $('.related_search').hide();
    }
};

$(document).ready(() => {
    setKeyboardEventHandlers();
});

$('#inp_search_index').keyup((e) => {
    if (e.keyCode != 13) {
        $('#inp_search').val($('#inp_search_index').val());
        $('#inp_search_mo').val($('#inp_search_index').val());
        completechk();
    }
});

function goPage(linktype,linkurl,cotId,type) {
    saveSearchIndexClickLog(type);
    if (linktype == 'I') {
        location.href ='/detail/detail_view.html?cotId='+cotId;
    } else {
        openWindow(linkurl);
    }
}

function recomkeywordMore(el) {
    $('.search_wrap .keyword .inr').toggleClass('view');
    if ($('.search_wrap .keyword .inr').hasClass('view')) {
        $(el).text('닫기');
        $(el).addClass('close');
    }else {
        $(el).text('더보기');
        $(el).removeClass('close');
    }
}

$('#inp_search_index').keyup((e)=>{
    if (e.keyCode == 13) {
        if (ignoreNextEnter) {
            // 지역 선택 후 바로 검색 되는 것 방지
            ignoreNextEnter = false;
            return;
        }

        goSearchList();
    } else {
        $('#inp_search').val($('#inp_search_index').val());
        $('#inp_search_mo').val($('#inp_search_index').val());
        completechk();
    }
});




$('#inp_search_index').focus((e)=>{
    $('.search_wrap .form').addClass('on');
    $('#inp_search_index').attr('placeholder','');
    checkAreaButtonClass();
});

$('#inp_search_index').focusout((e)=>{
    $('.search_wrap .form').removeClass('on');
    if (smallerThanTablet()) {
        $('#inp_search_index').attr('placeholder', $('#inp_search_mo').attr('placeholder'));
        if (getDevice() == 'Android') {
            setTimeout(function () {
                focusOutSize = window.innerHeight;
                if (disableSize != focusOutSize) {
                    if ($('#inp_search_index').val()) {
                        location.href = mainurl + '/search/search_list.do?keyword=' + encodeURIComponent($('#inp_search_index').val());
                    }
                }
            }, 500) ;
        }
    }else {
        $('#inp_search_index').attr('placeholder',$('#inp_search').attr('placeholder'));
    }

    checkAreaButtonClass();
});

function selectArea(area) {
    const selectedAreaButton = document.getElementById('selectedAreaButton');
    selectedAreaButton.innerText = area;
    selectedAreaButton.setAttribute('title', '지역 선택 레이어 닫힘');
    const areaPopup = document.getElementById('areaselectPop');
    areaPopup.style.display = 'none';

    const areaButton = document.querySelector('.area');
    areaButton.classList.remove('active');
    areaButton.classList.add('on');

    setTimeout(function() {
        $('#inp_search_index').focus();
    }, 100);
}


function getSelectedArea() {
    const areaRadios = document.getElementsByName('areaChk');
    for (let i = 0; i < areaRadios.length; i++) {
        if (areaRadios[i].checked) {
            return areaRadios[i].id;
        }
    }
    return 'All';
}


function goSearchList(kWord, inflowType, type) {
    if (!kWord) kWord = encodeURIComponent($('#inp_search_index').val());
    let editionalParams = '';
    if (inflowType == 'popKeyword') {
        editionalParams = '&popKeywordYn=Y';
    }

    const area = getSelectedArea();

    saveSearchIndexClickLog(type);

    kWord = replaceAll(kWord, '&', '%26');
    const targetUrl = `${mainurl}/search/search_list.do?keyword=${kWord}${editionalParams}&area=${encodeURIComponent(area)}`;

    location.href = targetUrl;
}

function DeleteKeyword() {
    $('#inp_search_index').val('');
    $('#inp_search_index').focus();
    $('.search_wrap .form .delete').hide();
    $('.related_search').hide();
}

//웹접근성 관련
$(document).on("keydown",".search_index .layer_close",function(e) {
    CloseSearchForm();
    if (e.keyCode == 13) {
        $('.btn_search').focus();
    }
});

$('.search_index .wrap').click(function (e) {
    e.stopPropagation()
});

function setGaCookie(ga) {
    let gaCookie;
    if (getBrowser() === 'Safari') {
        gaCookie = ga;
    } else {
        if (mainurl.indexOf('ktovisitkorea') != -1) {
            gaCookie = ga.replace('GA1.1','GA1.2');
        } else if (mainurl.indexOf('visitkorea.or.kr') != -1) {
            gaCookie = ga.replace('GA1.1','GA1.3');
        } else {
            gaCookie = ga;
        }
    }
    return gaCookie;
}

const saveSearchIndexClickLog = (type) =>{
    $.ajax({
        url: mainurl+'/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'SET_SEARCH_INDEX_LOG',
            type : type
        }
    });
}
