
let swiperTabsNav1;
let searchMode;
let tagUlHeight;
let disableSize = window.innerHeight;
let focusOutSize;
var isScrollProgressFlag = false;

const getSearchObj = () =>{
	const SearchObj = {
		P : { // PC
			element : $('#gnbCommon .form.pc'),
			autokeywords : $('#gnbCommon .form.pc .words_list'),
			hotkeywords : $('#gnbCommon .form.pc .area_keyword')
		},
		T : { // 태블릿
			element : $('#gnbCommon .form.pc .search_form_box'),
			autokeywords : $('#gnbCommon .form.pc .search_form_box .words_list'),
			hotkeywords : $('#gnbCommon .form.pc .search_form_box .area_keyword')
		}
		,M : { // 모바일
			element : $('#gnbCommon .mo .search_form'),
			autokeywords : $('#gnbCommon .mo .search_form .words_list'),
			hotkeywords : $('#gnbCommon .mo .search_form .area_keyword')
		}
	}
	return SearchObj[searchMode];
}
headerReady();

function headerReady(){
	headerResizeEvent();
	pagecheck();
	mainNewGnb();
	gnbMain();
	setlogo('#gnbCommon .svgLogo');
	setlogo('.header.pc .svgLogo');
	setForcedScrollAttribute('#gnbCommon .mo .layer');
}

$(document).on('click','#inp_search',function(e) { // 웹접근성으로 인한 수정 focusin -> click
	openSearchForm();
});
$(document).on('click','#inp_search_mo',function(e) {
	openSearchForm();
});

if (getDevice() == 'Android') {
	$(document).on('focusout','#inp_search',function(e) {
		setTimeout(function () {
			focusOutSize = window.innerHeight;
			if (disableSize != focusOutSize) {
				btnGnbSearch();
			}
		}, 500) ;
	});
}

// mobile search_form event

//웹접근성 관련
$(document).on("keydown",".area_keyword .close button",function(e) {
	if (e.keyCode == 13 || e.keyCode == 32) {
		setTimeout(function () {
			$('.search .btn_search').focus();
		}, 100) ;
	}
});

if(location.pathname.indexOf("partners") < 0 ) {
	$('#btnPartners').remove();
	$('.partnersMember').remove();
}

// 	if (navigator.userAgent.match(/android/i) && appYn == "Y") {
// 		$('#appSetup').show();
// 	}
let keyword2 = '';
// 검색어 자동완성
function completechk() {
	keyword2 = $('#inp_search').val();
	if (keyword2 != '' ) {
		$.ajax({
			url : domainIfno + '/trans_json.jsp',
			dataType : 'json',
			type : "POST",
			data : {
				type : 'ark',
				target : 'content',	// 사용자입력 단어: common, 데이터 : content
				convert : 'fw',
				query : keyword2,
				datatype : 'json',
				charset  : 'UTF-8'
			},
			success : function(data) {

				var arr1 = [];
				var arr2 = [];

				var keywordlength = data.result[0].totalcount;
				if( keywordlength > 6 ) keywordlength = 6;

				for(var i=0; i<keywordlength; i++){	//for(var i=0; i<data.result[0].totalcount; i++){
					arr1[i] = data.result[0].items[i].keyword;
				}

				var keywordlength2 = data.result[1].totalcount;


				if( keywordlength >= 6 ) {
					keywordlength2 = 0;
				} else {
					if(keywordlength2 >= (6 - keywordlength))
						keywordlength2 = 6 - keywordlength;

					if( data.result[1].totalcount == 0 ) {
						keywordlength2 = 0;
					}
				}

				if( keywordlength2 != 0 ) {
					for(var j=0; j<keywordlength2; j++){
						arr2[j] = data.result[1].items[j].keyword;
					}
				}

				var resultArr = arr1.concat(arr2);
				ajaxContentLoadComp(resultArr);
			},
			error : function(xhr, textStatus, errorThrown) {
			}
		});
	} else {
		ajaxLoadkeywordPopHeader();
	}
	if(searchMode == 'M')
		$('#inp_search_mo').val(keyword2);
}

//어제의 인기 검색어 ajax 요청 - Header
function ajaxLoadkeywordPopHeader() {

	$.ajax({
		url : domainIfno + '/trans_json.jsp',
		dataType : 'json',
		type : "POST",
		data : {
			collection : 'total', //Collection 구분값
			type : 'popword',
			range : 'D',	// 일간 D, 주간 W, 월간 M
			listCount : 10
		},
		success : function(data) {
			getkeywordPOPHeader(data);	// 인기검색어
		},
		error : function(xhr, textStatus, errorThrown) {
		}
	});
}

// 리스트 검색
// 검색어 자동완성 삭제
function wordsListDelete() {
	getSearchObj().autokeywords.find('li').remove();
	if(keyword2 !== ''){
		$('.btn_del').addClass('btn_del on');
	}
}

// 검색 창 엔터키 이벤트
$('#inp_search').keyup(function(e) {
	if (e.keyCode == 13) {
		openSearchForm();
	} else{
		$('#inp_search_index').val($('#inp_search').val());
	}
});

function wordsListHide(obj) {
	getSearchObj().autokeywords.hide();
}

function GoSiteMain(kind,url){
	if(kind == 1)
		goMainLogSave('e13adad6-3052-11eb-b08c-0050569dc2b9');
	if(kind == 2)
		goMainLogSave('032d4bac-9aa7-11e8-8165-020027310001');
	if(kind == 3)
		goMainLogSave('0a1ffd26-9aa7-11e8-8165-020027310001');
	if(kind == 4)
		goMainLogSave('d66b6a53-a0d5-4ed3-b4b3-6168c9c82792');
	if(kind == 5)
		goMainLogSave('54736905-8c25-4ce3-8331-8182ea9cabc8');
	setTimeout(function () {
		location.href = url;
	}, 200) ;
}

/* 퀵레이어 추가 */
$('#mainQuickClose').click(function(){
	$(this).closest('.main_quick').hide();
});

$('#consultingBtn').click(function(){
	$('.layer-talk-menu').addClass('on');
	$('.layer-talk-menu .group-talk-menu .tooltip1').eq(0).focus();
});

$('.layer-talk-menu .close').click(function(){
	$('.layer-talk-menu').removeClass('on');
	$('#consultingBtn').focus();
});

function mainQuick(){
	var $w = $(window),
		footerHei = $('#footer').outerHeight(),
		$banner = $('.main_quick');
	$w.on('scroll', function() {
		var sT = $w.scrollTop();
		var val = $(document).height() - $w.height() - footerHei;
		if (sT >= val)
			$banner.addClass('on')
		else
			$banner.removeClass('on')
	});

	//$('.main_quick').remove();
}
// mainQuick();

var WEB_APP_DVCD = "0100";	// WEB/APP구분  : 0100(WEB), 0200(APP)
if(appYn == 'Y') WEB_APP_DVCD = "0200";
var lastPage = location.href.split('/');
var LAST_PAGE = lastPage[lastPage.length-1].split('?')[0].substring(0,100);	//고객이 마지막으로 봤던 페이지(영문100자까지허용)

function openKakao(){
	var userKey = snsId;            //해당홈페이지로그인사용자ID(로그인안한경우없어도됨)
	var HOME_PAGE_DVCD = "0300";     //홈페이지구분 : 0100(1330 Travel Hotline), 0200(Visit Korea), 0300(대한민국구석구석), 0400(기타)
	var SNS_DVCD = "0100";           //SNS채널구분  : 0100(카카오톡), 0200(Line), 0300(Facebook Messenger), 0400(티톡), 0500(WeChat)
	var params = { "uuid" : "@si51kim"
		, "extra" : "userKey= " + userKey
			+ ",HOME_PAGE_DVCD=" + HOME_PAGE_DVCD
			+ ",WEB_APP_DVCD=" + WEB_APP_DVCD
			+ ",SNS_DVCD=" + SNS_DVCD
			+ ",LAST_PAGE=" + LAST_PAGE
			+ ","
	};

	var form = document.createElement("form");
	form.setAttribute("action", "https://bizmessage.kakao.com/chat/open");
	form.setAttribute("method", "post");
	form.setAttribute("target", "_blank");

	document.body.appendChild(form);

	for(var key in params)
	{
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	}
	form.submit();
}

(
	function() {
		function ttalk_load() {
			try{
				var s = document.createElement("script");
				s.type = "text/javascript";
				s.async = true;
				s.src = "https://1330chat.visitkorea.or.kr/ttalk/js/ttalkDev.js";
				s.charset = "UTF-8";
				var x = document.getElementsByTagName("script")[0];
				x.parentNode.insertBefore(s, x);
			} catch (error) {
				console.error(error);
			}
		}
		if (document.readyState === "complete") {
			ttalk_load();
		} else if (window.attachEvent) {
			window.attachEvent("onload", ttalk_load());
		} else {
			window.addEventListener("DOMContentLoaded", ttalk_load(), false);
		}
	}
)();
var ttalk_option = { "uuid" : "HKCTALKMNG_160635739001093018", "button" : "ttalk_quick" };

function openTtalk2(){
	window.open('https://1330chat.visitkorea.or.kr:3000/#/ttalk_main/CHAT1330_160635739001093018/_0300_'+WEB_APP_DVCD+'_'+LAST_PAGE.replace('_','').substring(0,30), "ttalkFrame", "width=500, height=700, toolbar=no, menubar=no, scrollbars=no, resizable=yes, fullscreen=yes " );
}
/* 퀵레이어 추가 끝 */

function OpenMissionPop(){
	layerPopup.layerShow('missionPop');
	$('#missionPop').addClass("active");
	$('body').css('overflow','hidden');
	$('img[usemap]').rwdImageMaps();
	$(document).scrollTop(0);
}

/* 검색영역 placeholder */
function fetchMainSearchData() {
	$.ajax({
		url: mainurl + "/call"
		, dataType: "json"
		, type: "POST"
		, data: {
			cmd: "MAIN_SEARCH_VIEW",
            type: window.innerWidth <= 1700 ? "MO" : "PC"
		}
		, success: function(data) {
			addMainPlaceholder(data);
		}, complete: function(){
			$(document).on('keyup','#inp_search',function(e) {
				if (e.keyCode == 13) {
					openSearchForm();
				} else {
					$('#inp_search_index').val($('#inp_search').val());
				}
			});
		}, error: function(){
			addMainPlaceholder();
		}
	});
}

function addMainPlaceholder(data) {
	let strHtml = ''

	keyword2 = '';
	$('#placeHolder').remove();
	let placeHolder = '';
	if(data) {
		$.each(data.body.result, function (index, items) {
			if (index == 0) {
				strHtml += '<span class="input" id="placeHolder">'
				strHtml += '		<!-- 크롬 아이디 자동완성 기능 방지용 -->'
				strHtml += '	<input type="text" style="display:none">'
				strHtml += '		<input type="password" style="display:none">'
				strHtml += '		<!-- //크롬 아이디 자동완성 기능 방지용 -->'
				// strHtml += '			<input type="text" placeholder="' + items.placeHolder + '" title="검색" id="inp_search" onkeyup="completechk();" onkeydown="wordsListDelete();" autocomplete="off">'
				strHtml += `			<input type="text" placeholder="${items.placeHolder}" title="검색" id="${deviceviewtype == "PC" ?'inp_search' :'inp_search_mo'}" autocomplete="off">`
				strHtml += '			<input type="text" aria-hidden="true" tabindex="-1" style="width:0;height:0;position:absolute;top:-9999px">'
				strHtml += '		<a href="javascript:btnGnbSearch();" class="btn_search">검색</a>'
				strHtml += '</span>'

				placeHolder = items.placeHolder
			}
		})
	} else{
		strHtml += '<span class="input" id="placeHolder">'
		strHtml += '	<input type="text" style="display:none">'
		strHtml += '		<input type="password" style="display:none">'
		strHtml += `			<input type="text" placeholder="어디로, 어떤 여행을 떠날 예정인가요?" title="검색" id="${deviceviewtype == "PC" ?'inp_search' :'inp_search_mo'}"  autocomplete="off">`
		strHtml += '			<input type="text" aria-hidden="true" tabindex="-1" style="width:0;height:0;position:absolute;top:-9999px">'
		strHtml += '		<a href="javascript:btnGnbSearch();" class="btn_search">검색</a>'
		strHtml += '</span>'

	}

	if(deviceviewtype == "PC" && window.innerWidth <= 1700 && searchMode == 'P'){
		headerResizeEvent();
		return;
	}

	if(deviceviewtype == "PC" && window.innerWidth <= 1700) { // 태블릿
		$(".gnb .form.pc").prepend('<span class="input" id="placeHolder"><a href="javascript:openSearchForm();" class="btn_search" onkeyup="completechk();">검색</a></span>');
		CreateTabletSearchForm(placeHolder);
		$('#inp_search_index').attr('placeholder',placeHolder);
	} else if (deviceviewtype == "PC"){ // PC
		$(".gnb .form.pc").prepend(strHtml);
		CreatePcSearchForm(placeHolder);
		$('#inp_search_index').attr('placeholder',placeHolder);
	} else { // Mobile
		$(".gnb .form.mo").prepend(strHtml);
	}

}

function pagecheck(){
	let url = location.href;
	if(url.indexOf('main/main.do') != -1){
		$('.gnb .s_menu .icon1').addClass('on');
		$($('.gnb .menu .swiper-wrapper').children()[0]).addClass('on');
		checkCoachMark(1);
	} else if(url.indexOf('main/theme.do') != -1){
		$('.gnb .s_menu .icon2').addClass('on');
		$($('.gnb .menu .swiper-wrapper').children()[1]).addClass('on');
	} else if(url.indexOf('main/area.do') != -1){
		$('.gnb .s_menu .icon3').addClass('on');
		$($('.gnb .menu .swiper-wrapper').children()[2]).addClass('on');
	} else if(url.indexOf('list/travelcourse.do') != -1){
		$('.gnb .s_menu .icon8').addClass('on');
		$($('.gnb .menu .swiper-wrapper').children()[3]).addClass('on');
	} else if(url.indexOf('list/travelinfo.do') != -1){
		$('.gnb .s_menu .icon6').addClass('on');
		$($('.gnb .menu .swiper-wrapper').children()[4]).addClass('on');
	}  else if(url.indexOf('list/travelbenefit.do') != -1){
		$('.gnb .s_menu .icon9').addClass('on');
		$($('.gnb .menu .swiper-wrapper').children()[5]).addClass('on');
	} else if(url.indexOf('detail') != -1){
		if(url.indexOf('ms_detail') != -1){
			$('.gnb .s_menu .icon6').addClass('on');
			$($('.gnb .menu .swiper-wrapper').children()[4]).addClass('on');
			$('#top_menu_ms').addClass('on');
		} else if(url.indexOf('rem_detail') != -1){
			$('.gnb .s_menu .icon6').addClass('on');
			$($('.gnb .menu .swiper-wrapper').children()[4]).addClass('on');
			$('#top_menu_rem').addClass('on');
		} else if(url.indexOf('cs_detail') != -1){
			$('.gnb .s_menu .icon8').addClass('on');
			$($('.gnb .menu .swiper-wrapper').children()[3]).addClass('on');
			$('#top_menu_cs').addClass('on');
		} else if(url.indexOf('fes_detail') != -1){
			$('.gnb .s_menu .icon6').addClass('on');
			$($('.gnb .menu .swiper-wrapper').children()[4]).addClass('on');
			$('#top_menu_show').addClass('on');
		} else if(url.indexOf('event_detail') != -1){
			$('.gnb .s_menu .icon9').addClass('on');
			$($('.gnb .menu .swiper-wrapper').children()[5]).addClass('on');
			$('#top_menu_event').addClass('on');
		}
	} else if(url.indexOf('trss/lottery_ev.do') != -1) {
		$('.gnb .s_menu .icon9').addClass('on');
		$($('.gnb .menu .swiper-wrapper').children()[5]).addClass('on');
		$('#top_menu_trss').addClass('on');
	}
}

$(function(){
	$(window).resize(function() {
		headerResizeEvent();
	});
});


function headerResizeEvent(){

	if (smallerThanTablet() && searchMode != 'M') { // M
		deviceviewtype = "MO";
		searchMode = 'M';
		CreateMobileSearchForm();
		setTimeout(function(){
			var swiperContainer = document.querySelector("#gnbCommon .depth1 .swiper-container");
			if (swiperContainer) {
				swiperTabsNav1 =
					new Swiper("#gnbCommon .depth1 .swiper-container", {
						watchOverflow:true,
						slidesPerView: 'auto',
					});
				swiperTabsNav1.init();
			}
		},1000);

		fetchMainSearchData();
		getSearchTaglist();
		if(typeof ViewBottomMenubar === 'function')
			ViewBottomMenubar();
	} else if (!smallerThanTablet() && window.innerWidth <= 1700 && searchMode != 'T') { //T
		searchMode = "T";
		deviceviewtype = "PC";
		$('#gnbCommon .search .mo .search_form').remove();
		fetchMainSearchData();
	} else if (!smallerThanTablet() && window.innerWidth > 1700 && searchMode != 'P') { //P
		$('#gnbCommon .search .mo .search_form').remove();
		deviceviewtype = "PC";
		searchMode = "P";
		if(swiperTabsNav1){
			swiperTabsNav1.destroy();
			swiperTabsNav1 = undefined;
		}
		fetchMainSearchData();

		if(typeof ViewBottomMenubar === 'function')
			ViewBottomMenubar();
	}

}

// 2023 gnb 고도화 추가 시작
function mainNewGnb(){


	// 모바일 레이어 이벤트 시작
	$('#gnbCommon .layer .s_menu > ul > li > a').on('click', function(){
		if(!$(this).hasClass('on')){
			$(this).addClass('on');
			$(this).siblings('ul').slideDown();
		}else{
			$(this).removeClass('on');
			$(this).siblings('ul').slideUp();
		}
	});

	$(document).on('click','.m_menu', function(){
		if(!$(this).hasClass('on')){
			$(this).addClass('on');
			$('body').css('overflow','hidden');
		}else{
			$(this).removeClass('on');
		}
	});
	$('#gnbCommon .search .layer .close').on('click', function(){
		$('.m_menu').removeClass('on');
		$('body').css('overflow','inherit');
	});

	// 모바일 레이어 이벤트 끝
	// PC 이벤트 시작
	$('#gnbCommon .depth1').on('mouseover focusin', function(){
		if(searchMode != 'M'){
			$('body').addClass('dim');
			$(this).addClass('on');
			$('#gnbCommon').addClass('on');
			$('#gnbCommon').stop().animate({
				height: '310px'
			}, 300);
		}
	});


	$('#gnbCommon .depth1').on('mouseleave focusout', function(){
		if(searchMode != 'M'){
			$('#gnbCommon').stop().animate({ height: '90px'}, 300,function(){
				$('body').removeClass('dim');
				$('#gnbCommon .depth1').removeClass('on');
				$('#gnbCommon').removeClass('on');
			});
		}
	});

    $(document).on('scroll', function() {
        const deviceWidthType = getResponsiveTypeByDeviceWidth();
        let isFixedTopGnb = ( deviceWidthType != null && deviceWidthType != 'M' );

        if (isScrollProgressFlag || ! isFixedTopGnb || mobileYn == 'Y' || searchMode == 'M' ) {
            return;
        }

        $('#gnbCommon').stop().animate({ height: '90px'}, 300, function() {
            $('body').removeClass('dim');
            $('#gnbCommon .depth1').removeClass('on');
            $('#gnbCommon').removeClass('on');
        });

        // 스크롤 이벤트의 반복 호출을 대비한 플래그 처리 로직.
        isScrollProgressFlag = true;
        setTimeout(_=> {
            isScrollProgressFlag = false;
        }, 300);

        // 방금 클릭된 요소의 포커스 없애기.
        let isGnbElFocused = ( $('#gnbCommon').find(document.activeElement).length > 0 );
        if (isGnbElFocused) {
            document.activeElement.blur();
        }
    });

	// PC 이벤트 끝
	setTimeout(function () {
		$('#gnbCommon .profile em').css('display','none');
	}, 5000);

}

function gnbMain(){// 위치 이동 및 수정
	var lastScrollPos = 0
		,delta = 15;
	$(window).scroll(function (event) {
		var st = $(this).scrollTop();
		//if (Math.abs(lastScrollPos - st) <= delta) return;
		if (st < 0) {
			$("#gnbCommon").addClass('app');
			return;
		}
		if ((st > lastScrollPos) && (lastScrollPos > 0)) {//내릴때
			$("#gnbCommon").addClass('up');
			$("#gnbCommon").removeClass('down');
			$(".app_main #gnbCommon").addClass('fix');
			$(".app_main #gnbCommon").removeClass('up');
			$("#gnbCommon").removeClass('app');
		} else {//올릴때
			$("#gnbCommon").addClass('down');
			$("#gnbCommon").removeClass('up');
			$(".app_main #gnbCommon").addClass('fix');
			$(".app_main #gnbCommon").removeClass('down');
		}
		if (st == 0) {
			$("#gnbCommon").removeClass('up');
			$("#gnbCommon").removeClass('down');
			$(".app_main #gnbCommon").removeClass('fix');
		}

		lastScrollPos = st;
	});
}

function mobilesubmain(type){

	$('#gnbCommon .gnb .depth2.mo').remove();
	$('#gnbCommon .gnb .menu').append(' <div class="depth2 mo"><div class="swiper-container swiper-tabs-nav"><div class="swiper-wrapper"></div></div></div>')

	let html = '';
	let menuarr;
	if(type == 'travelcourse'){
		menuarr = [
			{name : '추천코스', url : '/list/travelcourse.do?service=cs', type : 'cs', icon : 'icon03'}
			, {name : 'AI콕콕 플래너', url : '/list/travelcourse.do?service=abc&detailType=best' , type : 'abc', icon : 'icon2'}
		];
	} else if (type == 'travelinfo'){
		menuarr = [
			{name : '여행지', url : '/list/travelinfo.do?service=ms', type : 'ms', icon : 'icon01'}
			,{name : '여행기사', url : '/list/travelinfo.do?service=rem', type : 'rem', icon : 'icon02'}
			,{name : '축제', url : 'https://korean.visitkorea.or.kr/kfes/list/wntyFstvlList.do', type : 'fes', icon : 'icon04'}
			,{name : '공연 / 행사', url : '/list/travelinfo.do?service=show', type : 'show', icon : 'icon08'}
			,{name : 'AI콕콕', url : '/list/travelinfo.do?service=ai' , type : 'ai', icon : 'icon3'}
			,{name : '여행상품', url : '/list/travelinfo.do?service=tgpr' , type : 'tgpr', icon : 'icon09'}
		];
	} else {
		menuarr = [
			{name : '이벤트', url : '/list/travelbenefit.do?service=event', type : 'event', icon : 'icon05'}
			,{name : '가볼래-터', url : '/list/travelbenefit.do?service=trss', type : 'trss', icon : 'icon06'}
			// ,{name : '배지콕콕', url : '/list/travelbenefit.do?service=cockcock', type : 'cockcock', icon : 'icon10'}
		]
	}
	menuarr.forEach((item) =>{
		html += '';
		html += `<div class="swiper-slide"><a href="javascript:changetab('${item.url}','${item.type}');" class="${item.icon}">${item.name}</a></div>`;
	});

	$('#gnbCommon .gnb .menu .depth2.mo .swiper-wrapper').html(html);
	getServiceInfo().browsersizeEvent(true);
}


function changetab(url,type) {
	if (type == 'trss') {
		goListTrss();
	} else if (type === 'tgpr') {		//	홍보관 탭
		const screen = getParameter('screen') || 'main'
		if (screen !== 'main') {
			location.href = mainurl + url
		}
	} else {
		if (type == 'all') {
			location.href = url;
		} else if (type == 'mobile') {
			if (smallerThanTablet()) location.href = mainurl + url;
		} else if (location.href.indexOf('travelcourse') == -1 && location.href.indexOf('travelinfo') == -1 && location.href.indexOf('travelbenefit')) {
			location.href = mainurl + url;
		}
	}
}

$('#gnbCommon .area_keyword .close').on({
	click: function(){
		$('.area_keyword').css('display','none');
	}
});
$('#gnbCommon .words_list .close').on({
	click: function(){
		getSearchObj().autokeywords.css('display','none');
	}
});

function openSearchForm(){
	OpenSearchForm();
	// if(searchMode == 'M'){
	// 	$('.mo .search_form').show();
	// 	$('body').css('overflow','hidden');
	// 	$('#inp_search').focus();
	// 	tagUlHeight = $(".search_tag").find("ul").css("height");
	// 	tagUlHeight = tagUlHeight.replace("px", "");
	// 	tagUlHeight *= 1;
	//
	// 	if (tagUlHeight <= 120) {
	// 		$("#tagBtn").css("display", "none");
	// 		$(".search_tag").find("ul").css("height", tagUlHeight + "px");
	// 	} else {
	// 		$("#tagBtn").css("display", "block");
	// 		$(".search_tag").find("ul").css("height", "120px");
	// 	}
	// } else if(searchMode == 'T'){
	// 	$('.pc .search_form_box').show();
	// }
}

function closeSearchForm(){
	$('.mo .search_form').hide();
	$('body').css('overflow','inherit');
}

function pagemove(kind){
	switch (kind){
		case 1 : history.back(); break;
		case 2 : location.href = mainurl+'/main/main.do'; break;
		case 3 : openSearchForm(); break;
		case 4 : if(!$('#gnbCommon button.m_menu').hasClass('on')){
					$('#gnbCommon button.m_menu').addClass('on');
					$('body').css('overflow','hidden');
				}else{
					$('#gnbCommon button.m_menu').removeClass('on');
				}
				break;
	}

}

function getSearchTaglist(){
	$.ajax({
		url: mainurl + "/call",
		dataType: "json",
		type: "post",
		data: {
			cmd: "HEADER_OTD_TAGS",
			otdId: "ab097fc9-daa6-423d-8fcb-50aec7852e21"
		},
		success: function(data) {
			setSearchTaglist(data);
		}
	});
}

function setSearchTaglist(data){
	let searchStrHtml = '';
	searchStrHtml += `<h2>${data.body.tagTitle.TITLE}</h2>`;
	searchStrHtml += '<ul>';
	searchStrHtml += '<li><a href="javascript:goAlllist(\'\',\'\');" class="all">전체</a></li>';

	$.each(data.body.tag, function (index, tags) {

		if (tags.DISP_ACT_YN == 'Y') {
			searchStrHtml += `<li><a href="javascript:goAlllist('${tags.TAG_ID}','${tags.TAG_NAME}');">#${tags.DISP_TAG_NAME}</a></li>`;
		} else {
			searchStrHtml += `<li><a href="javascript:goAlllist('${tags.TAG_ID}','${tags.TAG_NAME}');">#${tags.TAG_NAME}</a></li>`;
		}
	});
	searchStrHtml += '</ul>';
	searchStrHtml += '<div class="more" id="tagBtn">';
	searchStrHtml += '<button type="button" onclick="tagBtn();">더보기</button>';
	searchStrHtml += '</div>';

	$(".search_tag").html(searchStrHtml);
}

function CreateMobileSearchForm(){
	$('#gnbCommon .search .mo .search_form').remove();
	let strHtml = '';
	strHtml += '<div class="search_form">';
	strHtml += '	<div class="header">';
	strHtml += '		<button type="button" onclick="closeSearchForm();"class="back_btn">뒤로</button>';
	strHtml += '	</div>';
	strHtml += '	<div class="search">';
	strHtml += '		<span>';
	strHtml += '			<input type="text" id="inp_search" placeholder="" onkeyup="completechk();"  title="검색">';
	strHtml += '			<a href="javascript:btnGnbSearch();" class="btn_search">검색</a>';
	strHtml += '		</span>';
	strHtml += '	</div>';
	strHtml += '	<div class="search">';
	strHtml += '		<div class="area_keyword">';
	strHtml += '			<h2>어제의 인기 검색어</h2>';
	strHtml += '			<ul id="m_search_hd1"></ul>';
	strHtml += '			<ul id="m_search_hd2"></ul>';
	strHtml += '		</div>';
	strHtml += '	</div>';
	strHtml += ' 	<div class="words_list">';
	strHtml += '		<ul></ul>';
	strHtml += '	</div>';
	strHtml += '	<div class="search_tag">';
	strHtml += '	</div>';
	strHtml += '</div>';

	$('#gnbCommon .search .mo .layer').after(strHtml);
}

function tagBtn() {
	let nowHeight = $(".search_tag").find("ul").css("height");

	nowHeight = nowHeight.replace("px", "");
	nowHeight *= 1;
	nowHeight += 115;
	if (nowHeight >= tagUlHeight) {
		$("#tagBtn").css("display", "none");
		nowHeight = tagUlHeight;
	}

	$(".search_tag").find("ul").css("height", nowHeight + "px")

}

function CreateTabletSearchForm(placeHolder){
	$('.search_form_box').empty();
	let strHtml = '';
	strHtml += '<div class="search_form">';
	strHtml += `	<input type="text" id="inp_search" placeholder="${placeHolder}" onkeyup="completechk();" title="검색">`;
	strHtml += '	<a href="javascript:btnGnbSearch();" class="btn_search">검색</a>';
	strHtml += '</div>';
	strHtml += '<div class="area_keyword" style="display:none" tabindex="0">';
	strHtml += '	<h2>어제의 인기 검색어</h2>';
	strHtml += '	<ul id="p_search_hd1"></ul>';
	strHtml += '	<ul id="p_search_hd2"></ul>';
	strHtml += '	<div class="close"><button type="button">닫기</button></div>';
	strHtml += '</div>';
	strHtml += '<div class="words_list">';
	strHtml += '	<ul></ul>';
	strHtml += '	<div class="close"><button type="button">닫기</button></div>';
	strHtml += '</div>';

	$('.search_form_box').append(strHtml);
}

function CreatePcSearchForm(placeHolder){
	$('.search_form_box').empty();
	let strHtml = '';
	strHtml += '<div class="area_keyword" style="display:none" tabindex="0">';
	strHtml += '	<h2>어제의 인기 검색어</h2>';
	strHtml += '	<ul id="p_search_hd1"></ul>';
	strHtml += '	<ul id="p_search_hd2"></ul>';
	strHtml += '	<div class="close"><button type="button">닫기</button></div>';
	strHtml += '</div>';
	strHtml += '<div class="words_list">';
	strHtml += '	<ul></ul>';
	strHtml += '	<div class="close"><button type="button">닫기</button></div>';
	strHtml += '</div>';

	$('.search_form_box').append(strHtml);
}

$(document).on('click','.search_form_box .close',function(){
	$('.search_form_box').hide();
})


function checkCoachMark(version){

	// if(searchMode != 'M' && !smallerThanTablet()){
	// 	return;
	// } else{
	// 	if( version == 1 && getCookie(`coach_1`) != "Y"){
	// 		setCoachMark(1);
	// 	} else if (version == 2 && getCookie(`coach_2&3`) != "Y"){
	// 		setCoachMark(2);
	// 	}  else if (version == 3 && getCookie(`coach_2&3`) != "Y"){
	// 		setCoachMark(3);
	// 	}
	// }
}

function setCoachMark(version){

	let strHtml = '';
	strHtml += '<div class="m_coach_mark">';
	strHtml += '    <div class="cont">';
	switch (version){
		case 1 :
			strHtml += '<img src="../resources/images/common/img_coach_mark1.png" class="mo" alt="">';
			strHtml += '<img src="../resources/images/common/img_coach_mark1_ta.png" class="ta" alt="">';
			strHtml += '<strong class="stit">각 메뉴에서 <em>다양한 여행정보</em>를 확인해 보세요.</strong>';
			strHtml += '<ul>';
			strHtml += '    <li><strong>홈</strong><p>다양한 여행트렌드와 취향에 맞는 여행지 추천</p></li>';
			strHtml += '    <li><strong>테마</strong><p>테마별 여행 추천</p></li>';
			strHtml += '    <li><strong>지역</strong><p>지자체별 축제 및 여행정보</p></li>';
			strHtml += '    <li><strong>여행콕콕</strong><p>빅데이터 기반 여행지 및 코스 추천</p></li>';
			strHtml += '    <li><strong>여행상품홍보관</strong><p>지역/테마별 다양한 여행상품 소개</p></li>';
			strHtml += '    <li><strong>여행정보</strong><p>여행지부터 이벤트까지 다양한 여행정보 소개</p></li>';
			strHtml += '    <li><strong>여행지도</strong><p>지도로 보여주는 여행정보</p></li>';
			strHtml += '</ul>';
			break;
		case 2 :
			strHtml += '        <img src="../resources/images/common/img_coach_mark2.png" class="mo" alt="">';
			strHtml += '        <img src="../resources/images/common/img_coach_mark2_ta.png" class="ta" alt="">';
			break;

		case 3 :
			strHtml += '        <img src="../resources/images/common/img_coach_mark3.png" class="mo" alt="">';
			strHtml += '        <img src="../resources/images/common/img_coach_mark3_ta.png" class="ta" alt="">';
			break;
	}
	strHtml += '    </div>';
	strHtml += `    <button type="button" onclick="closeCoachMark(this,${version});">닫기</button>`;
	strHtml += '</div>';
	$('body').append(strHtml);
	$('body').css('overflow','hidden');
	if(version == 2 || version == 3){
		setCookie(`coach_2&3`, 'Y' , 365);
	} else{
		setCookie(`coach_1`, 'Y' , 365);
	}
}

function closeCoachMark(element,version){
	$($(element).parent()).remove();
	$('body').css('overflow','inherit');

	if(getCookie("main_popup1") != 'Y' && $('#mainAgreement').css('display') != 'block' && location.href.indexOf('main.do') != -1){
		getLayerPopup();
	}
}

function goAlllist( rtagid, rtagname ) {
	var agent = navigator.userAgent.toLowerCase();
	if (agent.indexOf('trident') != -1) {
		rtagname = encodeURIComponent(rtagname);
	}

	//메인 tag 섹션 클릭
	goMainLogSave('28d91274-9aa7-11e8-8165-020027310001');

	setTimeout(function () {
		//위치별 태그 클릭수 save
		goTagOtherSectionLogSave(rtagid,'0a01eb7b-96de-11e8-8165-020027310001','0');
	}, 200) ;

	setTimeout(function () {
		//태그 클릭수 save
		goTagLogSave(rtagid);
	}, 200) ;

	var golistUrl = '/list/all_list.do?choiceTag=';

	setTimeout(function () {
		//태그 클릭수 save
		location.href = mainurl+golistUrl+rtagname+'&choiceTagId='+rtagid;
	}, 200) ;
}

function btnGnbSearch() {
	location.href=  mainurl+'/search/search_list.do?keyword='+encodeURIComponent($('#inp_search').val());
}

function toggleLangSelector() {
	let selector = $('.lang_selector');
	selector.toggleClass('on');
}

function openVKLocaleURL(selectElement) {
	var url = selectElement.value;
	if (url) {
		window.open(url, '_blank');
	}
	selectElement.selectedIndex = 0;
}

function landingFaq() {
	location.href = '/help/faq.do';
}
