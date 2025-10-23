/** 
 * 대구석 서비스 컨텐츠들에서 이용할, 다양한 로그 적재 함수들 모음.
 */

// 타부서 메인 영역 클릭수 save
function goOtherDepartmentLogSave( smid, rotdid ) {if ( rotdid == '' || rotdid == null || rotdid == undefined ) {
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'OTHER_DEPARTMENT_LOG_SAVE',
                smid : smid,
                otdid : rotdid
            }
        });
    }
}

function goTagLogSave( rtagid ) {
    if ( rtagid == '' || rtagid == null || rtagid == undefined ) {
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'TAG_LOG_SAVE',
                tagid : rtagid,
                otdid : '0a01eb7b-96de-11e8-8165-020027310001'
            }
        });
    }
}

// 전체메인 메인 영역 클릭수 save
function goMainLogSave( smid ) {
    if ( smid == '' || smid == null || smid == undefined ) {
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'MAIN_LOG_SAVE',
                smid : smid
            }
        });
    }
}

// 전체메인 자자체 섹션 영역 클릭수 save
function goLocalGovernmentLogSave( rareacode, section, rurl, rtitle, rheader ) {
    if ( rareacode == '' || rareacode == null || rareacode == undefined ) {
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'LOCAL_GOVERNMENT_LOG_SAVE',
                areaCode : rareacode + '',
                section : section + '',
                linkurl : rurl + '',
                title : quotReplace(rtitle),
                header : quotReplace(rheader)
            }
        });
    }
}

// 전체메인 자자체 섹션(시군구) 영역 클릭수 save
function goLocalGovernmentSubLogSave( rareacode, rsigungucode, rtitle ) {
    if ( rareacode == '' || rareacode == null || rareacode == undefined ) {
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'LOCAL_GOVERNMENT_SUB_LOG_SAVE',
                areaCode : rareacode + '',
                sigunguCode : rsigungucode + '',
                title : rtitle
            }
        });
    }
}

// 홍보배너 영역 클릭수 save
function goBannerLogSave( rsection, rlinkUrl, rtitle ) {
    if ( rsection == '' || rsection == null || rsection == undefined ) {
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'BANNER_LOG_SAVE',
                section : rsection + '',
                linkurl : rlinkUrl + '',
                title : rtitle
            }
        });
    }
}

// 접속지역 save
function goConnectLocationLogSave( gaddress, gaddress2 ) {
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'CONNECT_LOCATION_LOG_SAVE',
            areaname : gaddress + '',
            sigunguname : gaddress2 + ''
        }
    });
}

function setPrintContentLogSave(rcotid, crsid) {
    var obj = new Object();
    obj.cmd = 'PRINT_CONTENT_LOG_SAVE';
    if (rcotid) {
        obj.cotid = rcotid;
    } else if (crsid) {
        obj.crsid = crsid;
    }
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: obj
    });
}

function goTagOtherSectionLogSave( rtagid, rotdid, rsection ) {
    if ( rtagid == '' || rtagid == null || rtagid == undefined ) {
    } else {
        $.ajax({
            url: mainurl + '/call',
            dataType: 'json',
            type: "POST",
            data: {
                cmd : 'TAG_OTHER_SECTION_LOG_SAVE',
                tagid : rtagid,
                otdid : rotdid,
                section : rsection + ''
            }
        });
    }
}

function saveAreaClickLog(areaCode, sigunguCode) {
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        enable: false,  //  false 일 경우 실제 요청을 하지 않음
        data: {
            cmd: 'AREA_LOG_SAVE',
            areaCode: areaCode,
            sigunguCode: sigunguCode
        }
    });
}
function saveNaviClickLog(kind, cotId, areaCode, sigunguCode) {
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        enable: false,
        data: {
            cmd: 'NAVI_LOG_SAVE',
            cotId: cotId,
            kind: kind,
            areaCode: areaCode,
            sigunguCode: sigunguCode,
        },
        async: false
    });
}

function traceSave(parameters) {
    const actionType = {
        CONTENT_VIEW_LOG_SAVE: 'VIEW',
        CONTENT_LIKE_SAVE: 'LIKE',
        FAVO_CONTENTINFO_SAVE: 'BOOKMARK',
        SHARE_HISTORY_SAVE: 'SHARE',
        USER_IMG_UPLOAD: 'UPLOAD_PHOTO',
        MY_JIKIMI_SAVE: 'REQUEST_EDIT_CONTENT',
        MY_JIKIMI_HISTORY_SAVE: 'REQUEST_EDIT_CONTENT',
        PRINT_CONTENT_LOG_SAVE: 'PRINT',
        CONTENT_COMMENT_SAVE: 'COMMENT',
        SNS_COMMENT_LIKE_SAVE: 'COMMENT_LIKE',
        CONTENT_RECOMMENT_SAVE: 'COMMENT_REPLY',
        TAG_LOG_SAVE: 'TAG',
        AREA_TAB_VIEW: 'AREA',
        AREA_LOG_SAVE: 'AREA',
        GET_TRAVEL_100SCENE_SEARCH_LIST: 'PROMOTION',
        INSERT_USER_SEARCH_KEYWORD: 'SEARCH_KEYWORD',
        MY_LOCATION_DETAIL: 'VIEW_LOCATION',
        FAVO_CONTENTINFO_DELETE: 'BOOKMARK_DELETE',
        ADD_STAMP: 'STAMP',
        USER_STAMP_STARS: 'STAMP_STARS',
        LIKE_FEEDBACK_LOG: 'FEEDBACK',
        NAVI_LOG_SAVE : 'NAVI',
        TRSS_INSERT_LOG : "TRSS",
        TRSS_SUBSCRIBE : "TRSS",
        TRSS_SUBSCRIBE_CANCEL : "TRSS",
        ABC_COURSE_AREA_LOG_SAVE : "ABC_COURSE",
        COURSE_CONTENT_SAVE : "USER_COURSE",
        DIGT_CARD_ISSUANCE : "DIGT",
        DELETE_MY_DIGT_CARD : "DIGT",
        MY_QA_HISTORY_SAVE : "QA",
        EVENT_PROGRAM_LOG_SAVE : "EVENT",
        EVENT_VIEW_LOG_SAVE : "EVENT",
        SAVE_APP_MAIN_VIEW_ACTION : "APP_MAIN_VIEW",
    }
    const action = parameters
    action.command = parameters.cmd
    action.type = actionType[parameters.cmd]
    action.ga = getCookie('_ga')
    action.fromUri = window.location.pathname
    if (hasText(snsId)) {
        action.snsId = snsId
    }
    delete action.cmd
    if (!isProduction) {
        console.log('action', action)
    }
    postAction(action)
    putRenewal()
}

function SaverewordData(rwmid,pinkey,type,response_data){
    let referrer = document.referrer;
    let data = {
        cmd : 'REWORD_LOG_SAVE',
        url : location.href.toString(),
        type : type
    };

    if (rwmid) {
        data.rwmid = rwmid;
    }
    if (pinkey) {
        data.pinkey = pinkey;
    }
    if (referrer) {
        data.referrer = referrer;
    }
    if (response_data) {
        data.response_data = response_data;
    }

    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: data
    });
}
