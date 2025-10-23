var groobeeSETypeCallFlag = false;
// 검색 영역에서 groobeeRecommendAsync 함수의 호출이 groobee.action 함수 호출 이후에 이루어져야 한다는 제약에 따라.
// 두 함수의 호출 싱크 제어를 위해서 해당 플래그를 추가함..
// SE 타입, action 함수 호출 이후에는 true로 바꿔주도록 설정.
let cdpInterfaceObj = null;

const EVENT_KEY_MAP = {
    "1": "EV1755666430967",
    "2": "EV1755668447146",
    "success": "EV1755069550144",
    "fail": "EV1755666316558"
};


function getCDPInterface(cdpServiceName) {
    if (cdpInterfaceObj == null) {

        if (typeof cdpServiceName == 'undefined' || cdpServiceName == null || cdpServiceName == '') {
//            cdpInterfaceObj = new NoActCdpInterface();// 아무 동작을 하지 않는 default CDP 인터페이스. (소스 코드는 남겨둔채로 CDP 전송 처리를 중지시켜야 할 경우 주석 해제)
            cdpInterfaceObj = new GroobeeVisitkoreaCdpInterface();// 그루비 CDP를 기본 인터페이스로 생성.

        } else if (cdpServiceName.toLowerCase() == 'groobee') {
            cdpInterfaceObj = new NoActCdpInterface();

        }
    }
    return cdpInterfaceObj;
}

class NoActCdpInterface {

    push = (data) => {/* NO ACT. */}

    pushBySpecificFunction = (data, specificFunctionName) => {/* NO ACT. */}

}

class GroobeeVisitkoreaCdpInterface {

    push = (data) => {
        this.goGroobeeCDPMainProcess(data);
    }

    /**
     * 메인 함수의 실행 순서:
     * 1. 타입 정의
     * 2. goods 데이터 레이아웃 구성 (해당 사 개발 가이드 참고.)
     *  (1) groobeeGoods 배열 생성.
     *  (2) 타입 별 goodItem 객체 필수 포함 데이터 구성.
     *  (3) 택소노미 별 데이터 구성.
     * 3. 데어터 전송
     */
    goGroobeeCDPMainProcess = async (data) => {
        // SE, VG, PU 등등 그루비 CDP 타입 정의.
        const type = this.extractGroobeeType(data);

        // goods 데이터 구성.
        const groobeeGoods = [];
        const typeEssentialData = this.getEssentialGoodsDataByGroobeeType(type);
        const taxonomyCustomData = await this.getTaxonomyCustomDataByGroobeeType(type);

        const goodItem = Object.assign(data, typeEssentialData, taxonomyCustomData);
        groobeeGoods.push(goodItem);

        // push.
        if (type == 'SE') {
            this.pushGroobeeAction(type, data);

        } else if (type == 'CA') {
            if (data.device != null && data.device == 'mobile') {
                this.pushGroobeeAction(type, {
                    category: goodItem
                });

            } else {
                this.pushGroobeeAction(type, {
                    category: goodItem
                });
            }

        } else if (type == 'PU') {
            const uniqueId = (typeof snsId == 'undefined' ? '' : snsId + '-');
            const orderNo = uniqueId + Date.now();
            this.pushGroobeeAction(type, {
                orderNo: orderNo,
                goods: groobeeGoods
            });

        } else {
            this.pushGroobeeAction(type, {
                goods: groobeeGoods
            });
        }
    }

    /**
     * groobee 함수를 이용한 데이터 전송. (서버사이드 렌더링 방식)
     */
    pushGroobee(type, obj) {
        if (groobee) {
            groobee(type, obj);
        } else {
            console.log(`'groobee' object not found !`);
        }
    }

    /**
     * groobee.action 함수를 이용한 데이터 전송. ()
     */
    pushGroobeeAction(type, obj, delayTime = 500) {
        setTimeout(_=> {// groobee.action 함수 호출을 전체적으로 500ms 딜레이 이후 실행시키도록 처리.. (= 그루비 쪽에서 내부적인 스크립트 처리 속도를 염두해서 안정성 증가를 목적으로 추가 요청함.)

            if (groobee && groobee.action) {
                groobee.action(type, obj)
                if (type == 'SE') {
                    groobeeSETypeCallFlag = true;
                }

            } else {
                let tryCnt = 0;
                let _timer = setInterval(() => {
                    // 3회 넘어갈시 중지
                    if (tryCnt == 3) {
                        clearInterval(_timer);
                        console.log(`'groobee.action' function not found !`);
                        return;
                    }
                    tryCnt++;
                    if (groobee.action && typeof groobee.action == 'function') {
                        groobee.action(type, obj)
                        if (type == 'SE') {
                            groobeeSETypeCallFlag = true;
                        }

                        clearInterval(_timer);
                    }
                }, delayTime);
            }

        }, 500);
    }

    /**
     * 전달받은 데이터 인자로부터
     * 그루비 CDP 타입을 추출.
     * ( 함께 전달받은 데이터에 그루비 호출 타입이 포함되어있으면 타입을 반환하고,
     *   없으면 URL을 기반으로 타입을 추정함.. )
     */
    extractGroobeeType = (data) => {
        let groobeeCdpType = '';

        if (data.type != null) {
            groobeeCdpType = data.type;
            delete data.type;
        } else {// 데이터에 그루비 타입이 없으면 URL을 기반으로 타입을 추정함.
            groobeeCdpType = this.getGroobeeTypeByUrlPath();
        }

        return groobeeCdpType;
    }

    /**
     * 각 URL 패턴에 해당하는 그루비 타입을 반환.
     */
    getGroobeeTypeByUrlPath = _=> {
        let groobeeCdpType = '';

        if (
            location.href.indexOf('search/search_list.do?keyword') > -1
        ) {
            groobeeCdpType = 'SE';

        } else if (
            location.href.indexOf('detail/ms_detail.do') > -1
            || location.href.indexOf('detail/rem_detail.do') > -1
            || location.href.indexOf('detail/cs_detail_cos.do') > -1
            || location.href.indexOf('detail/fstvlDetail.do') > -1
            || location.href.indexOf('detail/fes_detail.do') > -1
            || location.href.indexOf('detail/event_detail.do') > -1
        ) {
            groobeeCdpType = 'VG';

        } else if (
            location.href.indexOf('main/theme.do') > -1
            || location.href.indexOf('main/area.do') > -1
            || location.href.indexOf('list/travelcourse.do?service=cs') > -1
            || location.href.indexOf('list/travelcourse.do?service=abc') > -1
            || location.href.indexOf('list/travelinfo.do?service=tgpr') > -1
            || location.href.indexOf('list/travelinfo.do?service=ms') > -1
            || location.href.indexOf('list/travelinfo.do?service=rem') > -1
            || location.href.indexOf('kfes/list/wntyFstvlList.do') > -1
            || location.href.indexOf('list/travelinfo.do?service=show') > -1
            || location.href.indexOf('list/travelinfo.do?service=ai') > -1
            || location.href.indexOf('list/travelbenefit.do?service=event') > -1
            || location.href.indexOf('list/travelbenefit.do?service=trss') > -1
            || location.href.indexOf('list/travelbenefit.do?service=digt') > -1
            || location.href.indexOf('mypage/trss_main.do') > -1
            || location.href.indexOf('list/travelbenefit.do?service=cockcock') > -1
            || location.href.indexOf('/rewardPage') > -1
        ) {
            groobeeCdpType = 'CA';

        } else if (
            location.href.indexOf('mypage/mypage_list_fav.do') > -1
        ) {
            groobeeCdpType = 'VC';

        }

        return groobeeCdpType;
    }

    /**
     * goobee CDP 플랫폼의 각 타입에 따른 필수 goods 데이터.
     *
     * ( 그루비 솔루션은 주요 비즈니스 타깃이 쇼핑몰 사용자 마케팅 데이터 수집인 것으로 보여지며,
     *  수집하는 데이터의 레이아웃도 쇼핑 행동에 대한 전제로 구성된 것으로 보임..
     *
     *  따라서 대구석쪽에는 큰 의미가 없지만 해당사의 개발 가이드에 맞춘 의미없는 고정 값을 추가하도록 유도됨. )
     */
    getEssentialGoodsDataByGroobeeType = (type) => {
        let essentialGoodsData = null;

        switch(type.toUpperCase()) {
            case 'VG':
                essentialGoodsData = { amt: 1, prc: 1, salePrc: 1 };
                break;

            case 'VC':
            case 'PU':
                essentialGoodsData = { amt: 1, prc: 1, salePrc: 1, cnt: 1 };
                break;

            default:
                essentialGoodsData = {};
        }

        return essentialGoodsData;
    }

    /**
     * 메뉴 별 택소노미(분류체계) 데이터 구성.
     */
    getTaxonomyCustomDataByGroobeeType = async (type) => {
        let taxonomyCustomData = {};

        if (type == 'VG') {
            if (location.href.indexOf('detail/ms_detail.do') > -1) {
                taxonomyCustomData = {
                    brand: '7f2e6054-1986-11ef-b16c-0242ac130002',
                    brandNm: '여행지',
                };
            }
            if (location.href.indexOf('detail/rem_detail.do') > -1) {
                taxonomyCustomData = {
                    brand: '7f2e6162-1986-11ef-b16c-0242ac130002',
                    brandNm: '여행기사',
                };
            }
            if (location.href.indexOf('detail/cs_detail_cos.do') > -1) {
                taxonomyCustomData = {
                    brand: '7f2e6272-1986-11ef-b16c-0242ac130002',
                    brandNm: '여행코스',
                };
            }
            if (location.href.indexOf('detail/fstvlDetail.do') > -1) {
                taxonomyCustomData = {
                    brand: '7f2e6385-1986-11ef-b16c-0242ac130002',
                    brandNm: '축제',
                };
            }
            if (location.href.indexOf('detail/fes_detail.do') > -1) {
                taxonomyCustomData = {
                    brand: '7f2e64a4-1986-11ef-b16c-0242ac130002',
                    brandNm: '공연 / 행사',
                };
            }
            if (location.href.indexOf('detail/event_detail.do') > -1) {
                taxonomyCustomData = {
                    brand: '7f2e65d1-1986-11ef-b16c-0242ac130002',
                    brandNm: '이벤트',
                };
            }
        }

        if (type == 'CA') {
            // 메뉴 정보를 서버에서 불러오는 시간만큼 groobee 함수 호출이 지연되어 데이터가 간헐적으로 누락됨에 따라
            // 사전 정의하도록 변경.
            //
            // let data = await fetchByCall('GET_MENU_TAXONOMY_INFO_LST');
            // if (data == null || data.menuList == null) {
            //     console.log('택소노미 정보를 받아올 수 없습니다.');
            //     return taxonomyCustomData;
            // }

            let data = {
                "menuList": [
                    {
                        "PTTRN_URL": "/main/main.do",
                        "VSM_ID": "150997a6-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 0,
                        "DEPTH": 0,
                        "NAME": "홈"
                    },
                    {
                        "PTTRN_URL": "/main/theme.do",
                        "VSM_ID": "150b6e3b-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 1,
                        "DEPTH": 0,
                        "NAME": "테마"
                    },
                    {
                        "PTTRN_URL": "/main/area.do",
                        "VSM_ID": "150b7016-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 2,
                        "DEPTH": 0,
                        "NAME": "지역"
                    },
                    {
                        "VSM_ID": "94e87995-a7f2-4f2b-b626-29fe4965bf3a",
                        "SRT_ORDR": 3,
                        "DEPTH": 0,
                        "NAME": "여행코스"
                    },
                    {
                        "VSM_ID": "150b7122-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 4,
                        "DEPTH": 0,
                        "NAME": "여행정보"
                    },
                    {
                        "VSM_ID": "f8a2edbf-4ab5-4afd-b6d6-91f3c1c581e6",
                        "SRT_ORDR": 5,
                        "DEPTH": 0,
                        "NAME": "여행혜택"
                    },
                    {
                        "PTTRN_URL": "/mylocation/mylocation.do",
                        "VSM_ID": "150b7169-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 6,
                        "DEPTH": 0,
                        "NAME": "여행지도"
                    },
                    {
                        "PARNTS_VSM_ID": "94e87995-a7f2-4f2b-b626-29fe4965bf3a",
                        "PTTRN_URL": "/list/travelcourse.do?service=cs",
                        "VSM_ID": "7f2e6272-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 0,
                        "DEPTH": 1,
                        "NAME": "추천코스",
                        "PARNTS_NAME": "여행코스"
                    },
                    {
                        "PARNTS_VSM_ID": "94e87995-a7f2-4f2b-b626-29fe4965bf3a",
                        "PTTRN_URL": "/list/travelcourse.do?service=abc",
                        "VSM_ID": "7f2e5f1d-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 1,
                        "DEPTH": 1,
                        "NAME": "AI콕콕 플래너",
                        "PARNTS_NAME": "여행코스"
                    },
                    {
                        "PARNTS_VSM_ID": "150b7122-1986-11ef-b16c-0242ac130002",
                        "PTTRN_URL": "/list/travelinfo.do?service=ms",
                        "VSM_ID": "7f2e6054-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 0,
                        "DEPTH": 1,
                        "NAME": "여행지",
                        "PARNTS_NAME": "여행정보"
                    },
                    {
                        "PARNTS_VSM_ID": "150b7122-1986-11ef-b16c-0242ac130002",
                        "PTTRN_URL": "/list/travelinfo.do?service=rem",
                        "VSM_ID": "7f2e6162-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 1,
                        "DEPTH": 1,
                        "NAME": "여행기사",
                        "PARNTS_NAME": "여행정보"
                    },
                    {
                        "PARNTS_VSM_ID": "150b7122-1986-11ef-b16c-0242ac130002",
                        "PTTRN_URL": "/list/travelinfo.do?service=fes",
                        "VSM_ID": "7f2e6385-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 2,
                        "DEPTH": 1,
                        "NAME": "축제",
                        "PARNTS_NAME": "여행정보"
                    },
                    {
                        "PARNTS_VSM_ID": "150b7122-1986-11ef-b16c-0242ac130002",
                        "PTTRN_URL": "/list/travelinfo.do?service=show",
                        "VSM_ID": "7f2e64a4-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 3,
                        "DEPTH": 1,
                        "NAME": "공연 / 행사",
                        "PARNTS_NAME": "여행정보"
                    },
                    {
                        "PARNTS_VSM_ID": "150b7122-1986-11ef-b16c-0242ac130002",
                        "PTTRN_URL": "/list/travelinfo.do?service=ai",
                        "VSM_ID": "7f2bde1c-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 4,
                        "DEPTH": 1,
                        "NAME": "AI콕콕",
                        "PARNTS_NAME": "여행정보"
                    },
                    {
                        "PARNTS_VSM_ID": "150b7122-1986-11ef-b16c-0242ac130002",
                        "PTTRN_URL": "/list/travelinfo.do?service=tgpr",
                        "VSM_ID": "150b70d4-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 5,
                        "DEPTH": 1,
                        "NAME": "여행상품",
                        "PARNTS_NAME": "여행정보"
                    },
                    {
                        "PARNTS_VSM_ID": "f8a2edbf-4ab5-4afd-b6d6-91f3c1c581e6",
                        "PTTRN_URL": "/list/travelbenefit.do?service=event",
                        "VSM_ID": "7f2e65d1-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 0,
                        "DEPTH": 1,
                        "NAME": "이벤트",
                        "PARNTS_NAME": "여행혜택"
                    },
                    {
                        "PARNTS_VSM_ID": "f8a2edbf-4ab5-4afd-b6d6-91f3c1c581e6",
                        "PTTRN_URL": "/list/travelbenefit.do?service=trss",
                        "VSM_ID": "7f2e66f8-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 1,
                        "DEPTH": 1,
                        "NAME": "가볼래-터",
                        "PARNTS_NAME": "여행혜택"
                    },
                    {
                        "PARNTS_VSM_ID": "f8a2edbf-4ab5-4afd-b6d6-91f3c1c581e6",
                        "PTTRN_URL": "/mypage/trss_main.do",
                        "VSM_ID": "7f2e66f8-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 1,
                        "DEPTH": 1,
                        "NAME": "가볼래-터",
                        "PARNTS_NAME": "여행혜택"
                    },
                    {
                        "PARNTS_VSM_ID": "f8a2edbf-4ab5-4afd-b6d6-91f3c1c581e6",
                        "PTTRN_URL": "/list/travelbenefit.do?service=digt",
                        "VSM_ID": "7f2e681e-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 2,
                        "DEPTH": 1,
                        "NAME": "디지털관광주민증",
                        "PARNTS_NAME": "여행혜택"
                    },
                    {
                        "PARNTS_VSM_ID": "f8a2edbf-4ab5-4afd-b6d6-91f3c1c581e6",
                        "PTTRN_URL": "/rewardPage",
                        "VSM_ID": "7f2e694a-1986-11ef-b16c-0242ac130002",
                        "SRT_ORDR": 3,
                        "DEPTH": 1,
                        "NAME": "배치콕콕",
                        "PARNTS_NAME": "여행혜택"
                    }
                ]
            };

            // URL 경로로 메뉴명, 카테고리 아이디 파악.
            let menuData = data.menuList.find(m => {
                return (
                    m.PTTRN_URL != null
                    && location.href.indexOf(m.PTTRN_URL) > -1
                );
            });

            if (menuData == null) {
                return taxonomyCustomData;
            }

            if (menuData.DEPTH == 0) {
                taxonomyCustomData = {
                    cateCd: menuData.VSM_ID,
                    cateNm: menuData.NAME,
                    catL: menuData.VSM_ID,
                    cateLNm: menuData.NAME,
                };

            } else {
                taxonomyCustomData = {
                    cateCd: menuData.VSM_ID,
                    cateNm: menuData.NAME,
                    catL: menuData.PARNTS_VSM_ID,
                    cateLNm: menuData.PARNTS_NAME,
                    catM: menuData.VSM_ID,
                    cateMNm: menuData.NAME,
                };

            }
        }

        return taxonomyCustomData;
    }

    /**
     * CDP 데이터 push 케이스에 따라,
     * 일반적인 push 공통 처리가 불가능하여
     *
     * class에서 직접 선언한
     * 특정 함수를 사용해야 할 경우
     *
     * 함수명 파라미터를 이용하여
     * 구현한 함수를 직접 실행.
     *
     * ex) pushBySpecificFunction({test001: 'test001'}, 'testFunction001');
     */
    pushBySpecificFunction = (data, specificFunctionName) => {
        try {
            eval(`this.${specificFunctionName}(data);`);

        } catch(e) {
            console.log(`evel 함수와 함수명을 활용한, \nJavascript 함수 강제 실행 실패 \n(functionName :: ${specificFunctionName})\n\n`, e);
        }
    }

    /**
     * pushBySpecificFunction(); 함수 테스트 용.
     */
    /*
    testFunction001 = (data) => {
        console.log('testFunction => data :: ');
        console.dir(data);
    }
    */

    /**
     * 컨텐츠 데이터로부터 CDP 전송 데이터를 추출하여
     * 그루비 VG 타입으로 데이터 전송.
     */
    pushByUsingContentData = (contentData) => {
        let groobeeCdpType = 'VG';
        let groobeeVGTypeData = '';

        if (contentData.type != null) {
            groobeeCdpType = contentData.type;
        }

        if (contentData.dataDetailType !== undefined && contentData.dataDetailType === 'rem') {
            const modifyDate = this.toDashedDate(contentData.modifiedTime)
            let today = new Date();
            let threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(today.getFullYear() - 3)
            today = today.toISOString().substring(0, 10);
            threeYearsAgo = threeYearsAgo.toISOString().substring(0, 10);
            const status = modifyDate >= threeYearsAgo && modifyDate <= today;
            groobeeVGTypeData = {
                type: groobeeCdpType,
                name: contentData.title,
                code: contentData.cotId,
                img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                status: status ? '' : 'SS',
                cat: contentData.sigugunCode,
                cateNm: "여행기사",
                catL: "150b7122-1986-11ef-b16c-0242ac130002",
                cateLNm: "여행정보",
                catM: "7f2e6162-1986-11ef-b16c-0242ac130002",
                cateMNm: "여행기사",
                cateCd: "7f2e6162-1986-11ef-b16c-0242ac130002",
                catS: contentData.cat3,
                cateSNm: contentData.cat3Nm,
                catD: contentData.sigugunCode,
                cateDNm: (typeof getSigunguName == 'function') ?
                    contentData.sigugunCode ? `${getAreaName(contentData.areaCode)} ${getSigunguName(contentData.areaCode, contentData.sigugunCode)}`
                        : `${getAreaName(contentData.areaCode)}`
                    : contentData.sigugunName,
                lCd: "150b7122-1986-11ef-b16c-0242ac130002",
                lNm: "여행정보",
                mCd: "7f2e6162-1986-11ef-b16c-0242ac130002",
                mNm: "여행기사"
            };
        } else if (contentData.dataDetailType !== undefined && contentData.dataDetailType === 'cos') {
            groobeeVGTypeData = {
                type: groobeeCdpType,
                name: contentData.title,
                code: contentData.cotId,
                img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                status: '',
                cat: contentData.sigugunCode,
                cateNm: "추천코스",
                catL: "94e87995-a7f2-4f2b-b626-29fe4965bf3a",
                cateLNm: "여행코스",
                catM: "7f2e6272-1986-11ef-b16c-0242ac130002",
                cateMNm: "추천코스",
                catS: contentData.cat3,
                cateSNm: contentData.cat3Nm,
                cateDNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
                cateCd: "7f2e6272-1986-11ef-b16c-0242ac130002",
                lCd: "94e87995-a7f2-4f2b-b626-29fe4965bf3a",
                lNm: "여행코스",
                mCd: "7f2e6272-1986-11ef-b16c-0242ac130002",
                mNm: "추천코스"
            };
        } else {
            groobeeVGTypeData = {
                type: groobeeCdpType,
                name: contentData.title,
                code: contentData.cotId,
                img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                status: '',
                cat: contentData.sigugunCode,
                cateNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
                catL: contentData.cat1,
                cateLNm: contentData.cat1Nm,
                catM: contentData.cat2,
                cateMNm: contentData.cat2Nm ? contentData.cat2Nm : contentData.cat2 ? contentData.cat1Nm : contentData.cat2Nm,
                catS: contentData.cat3,
                cateSNm: contentData.cat3Nm,
                catD: contentData.sigugunCode,
                cateDNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
            };
            /*
            기본 데이터 레이아웃:
            {
                name: "새만금 메타버스 체험관", // 컨텐츠명
                code: "34937b72-6e25-4409-8a07-69717f03accf", // URL에 표시되는 유니크한 컨텐츠 코드
                img: "https://cdn.visitkorea.or.kr/img/call?cmd=VIEW&id=05ff70b5-9fc2-4a7a-9548-65c638616eef"
                status: ""
                cat: "6", // 지역 분류(시군구코드)
                cateNm: "부안군 ", // 지역 분류(지역명(시군구))
                catL: "A02", // DB 콘텐츠 타입(대분류코드)
                cateLNm: "인문(문화/예술/역사)", // DB 콘텐츠 타입(대분류이름)
                catM: "A0206", // DB 콘텐츠 타입(중분류코드)
                cateMNm: "문화시설", // DB 콘텐츠 타입(중분류이름)
                catS: "A2061100", // DB 콘텐츠 타입(소분류코드)
                cateSNm: "문화전수시설", // DB 콘텐츠 타입(소분류이름)
                catD: "6", // 지역 분류(시군구코드)
                cateDNm: "부안군 ", // 지역 분류(지역명(시군구))
                brand: "여행지 코드", // 대구석 메뉴 중분류 코드
                brandNm: "여행지" // 대구석 메뉴 중분류명
            }
             */
        }

        this.push(groobeeVGTypeData);
    }

    toDashedDate = s => s.replace(/^(\d{4})(\d{2})(\d{2})(?:\d{6})?$/, '$1-$2-$3');

    /**
     * 그루비 CA 타입 데이터 전송.
     */
    pushGroobeeDefaultCATypeData = (data) => {
        if (data == null) {
            data = { type: 'CA' };

        } else {
            data.type = 'CA';
        }

        this.push(data);
    }

    /**
     * SPA 형식의 컴포넌트 렌더링 방식 페이지에서의
     * 그루비 CA 타입(모바일) 데이터 전송.
     */
    pushGroobeeCATypeMobileUsingGroobeeActionData = (data) => {
        if (data == null) {
            data = { type: 'CA' };

        } else {
            data.type = 'CA';
        }
        data.device = 'mobile';

        this.push(data);
    }

    /**
     * 즐겨찾기 컨텐츠 리스트로부터 CDP 전송 데이터를 추출하여
     * 그루비 VC 타입(즐겨찾기, 북마크) 데이터 전송.
     */
    pushGroobeeDefaultVCTypeData = async (dataList) => {
        // goods 데이터 구성.
        const groobeeCdpType = 'VC';
        const groobeeGoods = [];
        let goodItem = '';

        if (dataList == null) {
            dataList = [];
        }
        dataList.forEach(contentData => {
            const typeEssentialData = this.getEssentialGoodsDataByGroobeeType(groobeeCdpType);

            if (contentData.favoriteContentType !== undefined && contentData.favoriteContentType === 'ms') {
                goodItem = Object.assign({
                    name: contentData.title,
                    code: contentData.cotId,
                    img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                    status: '',
                    cat: contentData.sigugunCode,
                    cateCd: '7f2e6054-1986-11ef-b16c-0242ac130002',
                    cateNm: '여행지',
                    catL: '150b7122-1986-11ef-b16c-0242ac130002',
                    cateLNm: '여행정보',
                    catM: '7f2e6054-1986-11ef-b16c-0242ac130002',
                    cateMNm: '여행지',
                    catS: contentData.cat3,
                    cateSNm: contentData.cat3Nm,
                    catD: contentData.sigugunCode,
                    cateDNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
                    brand: '7f2e69d6-1986-11ef-b16c-0242ac130002', // 대분류 코드: '150b718b-1986-11ef-b16c-0242ac130002'
                    brandNm: '즐겨찾기',
                }, typeEssentialData);
            } else if (contentData.favoriteContentType !== undefined && contentData.favoriteContentType === 'fes') {
                goodItem = Object.assign({
                    name: contentData.title,
                    code: contentData.cotId,
                    img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                    status: '',
                    cat: contentData.sigugunCode,
                    cateCd: '7f2e64a4-1986-11ef-b16c-0242ac130002',
                    cateNm: '공연 / 행사',
                    catL: '150b7122-1986-11ef-b16c-0242ac130002',
                    cateLNm: '여행정보',
                    catM: '7f2e64a4-1986-11ef-b16c-0242ac130002',
                    cateMNm: '공연 / 행사',
                    catS: contentData.cat3,
                    cateSNm: contentData.cat3Nm,
                    catD: contentData.sigugunCode,
                    cateDNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
                    brand: '7f2e69d6-1986-11ef-b16c-0242ac130002', // 대분류 코드: '150b718b-1986-11ef-b16c-0242ac130002'
                    brandNm: '즐겨찾기',
                }, typeEssentialData);
            } else if (contentData.favoriteContentType !== undefined && contentData.favoriteContentType === 'recomCos') {
                goodItem = Object.assign({
                    name: contentData.title,
                    code: contentData.cotId,
                    img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                    status: '',
                    cat: contentData.sigugunCode,
                    cateCd: '7f2e6272-1986-11ef-b16c-0242ac130002',
                    cateNm: '추천코스',
                    catL: '94e87995-a7f2-4f2b-b626-29fe4965bf3a',
                    cateLNm: '여행코스',
                    catM: '7f2e6272-1986-11ef-b16c-0242ac130002',
                    cateMNm: '추천코스',
                    catS: contentData.cat3,
                    cateSNm: contentData.cat3Nm,
                    catD: contentData.sigugunCode,
                    cateDNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
                    brand: '7f2e69d6-1986-11ef-b16c-0242ac130002', // 대분류 코드: '150b718b-1986-11ef-b16c-0242ac130002'
                    brandNm: '즐겨찾기',
                }, typeEssentialData);
            } else if (contentData.favoriteContentType !== undefined && contentData.favoriteContentType === 'event') {
                goodItem = Object.assign({
                    name: contentData.title,
                    code: contentData.cotId,
                    img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                    status: '',
                    cat: contentData.sigugunCode,
                    cateCd: '7f2e65d1-1986-11ef-b16c-0242ac130002',
                    cateNm: '이벤트',
                    catL: 'f8a2edbf-4ab5-4afd-b6d6-91f3c1c581e6',
                    cateLNm: '여행혜택',
                    catM: '7f2e65d1-1986-11ef-b16c-0242ac130002',
                    cateMNm: '이벤트',
                    catS: contentData.cat3,
                    cateSNm: contentData.cat3Nm,
                    catD: contentData.sigugunCode,
                    cateDNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
                    brand: '7f2e69d6-1986-11ef-b16c-0242ac130002', // 대분류 코드: '150b718b-1986-11ef-b16c-0242ac130002'
                    brandNm: '즐겨찾기',
                }, typeEssentialData);
            } else if (contentData.favoriteContentType !== undefined && contentData.favoriteContentType === 'ETC') {
                goodItem = Object.assign({
                    name: contentData.title,
                    code: contentData.cotId,
                    img: contentData.imgPath ? `${mainimgurl}${contentData.imgPath}` : contentData.imgId ? `${mainimgurl}${contentData.imgId}` : '',
                    status: '',
                    cat: contentData.sigugunCode,
                    cateCd: '7f2e6162-1986-11ef-b16c-0242ac130002',
                    cateNm: '여행기사',
                    catL: '150b7122-1986-11ef-b16c-0242ac130002',
                    cateLNm: '여행정보',
                    catM: '7f2e6162-1986-11ef-b16c-0242ac130002',
                    cateMNm: '여행기사',
                    catS: contentData.cat3,
                    cateSNm: contentData.cat3Nm,
                    catD: contentData.sigugunCode,
                    cateDNm: (typeof getSigunguName == 'function') ? getSigunguName(contentData.areaCode, contentData.sigugunCode) : contentData.sigugunName,
                    brand: '7f2e69d6-1986-11ef-b16c-0242ac130002', // 대분류 코드: '150b718b-1986-11ef-b16c-0242ac130002'
                    brandNm: '즐겨찾기',
                }, typeEssentialData);
            }
            groobeeGoods.push(goodItem);
        });

        // push.
        this.pushGroobeeAction(groobeeCdpType, {
            goods: groobeeGoods
        });
    }

    /**
     * 그루비 PU 타입 데이터 전송.
     */
    pushGroobeeDefaultPUTypeData = (data) => {
        if (data == null) {
            data = { type: 'PU' };

        } else {
            data.type = 'PU';
        }

        this.push(data);
    }

    /**
     * 그루비 택소노미 커스텀 이벤트 데이터 전송.
     */
    pushGroobeeTaxonomyCustomEvent = ({eventKey, eventValue}) => {
        if (groobee && groobee.customEvent) {
            groobee.customEvent(eventKey, eventValue);
            
        } else {
            let tryCnt = 0;
            let _timer = setInterval(()=> {
                // 3회 넘어갈시 중지
                if (tryCnt == 3) {
                    clearInterval(_timer);
                    console.log(`'groobee.customEvent' function not found !`);
                    return;
                }
                tryCnt++;
                if (groobee.customEvent && typeof groobee.customEvent == 'function') {
                    groobee.customEvent(eventKey, eventValue);
                    clearInterval(_timer);
                }
            }, 500);
        }
    }

}
