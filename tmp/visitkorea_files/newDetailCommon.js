const flow = new DetailFlow()

var pageChk = '';

var AppFileName = null;
var AppsaveName = null;
var AppfullPath = null;
var imguploadcheck = 0;

var focusjoin = null;
var conSnsId = '';
var conTitle = '';
var conTelNo = '';
var conInfoCenter = '';
var conAreaCode = '';
var conSigunguCode = '';
var areaName = '';
var sigunguName = '';
var resizecheck = false;
var mainPlayer;
var culturetourismurl;
var tnmid = '';
var videoId ='';
// 이미지
var galleryTopHtml = '';
var galleryThumbsHtml = '';
var imgCnt = 0;
var pImgCnt = 0;
var uImgCnt = 0;

let contentfavo = false;
let contentlike = false;
let stamphtml = '';
var condition = null;
var drawer1;
let titleHeight
let titleTextHeight

var isTopOpened = false;
var trssCommentTitle;

function detailReady () {
	if (pageChk == 'rem') {
		if ( mobileYn == 'Y') {
			$('.btn_print').hide();
		}
	} else {
		try {
			geocoder = new kakao.maps.services.Geocoder();
		} catch (e) {
			mapStat = 'N';
			$('#map .position').remove();
		}
	}
	getContentList();
}

var originDetail;
//상세 보여주기
function goContentListView(data) {
	let detail = data.body.detail;
	originDetail = detail;
	let subArticle = data.body.subArticle;
	let bFree = data.body.bfree;
	let accommo = data.body.accommo;
	let referrer = document.referrer;
	if (!(detail.contentStatus == '0' || detail.contentStatus == '2') && referrer.indexOf('detail_view.html') == -1) {
		alert('잘못된 접근입니다.');
		location.href = '/main/main.do';
		return;
	}
	var fesstatus = false;
	let htm = $('.area_txtView .inr p');

	// 글로벌 변수
	sContentTitle = detail.title;
	sContentTitle = replaceAll(sContentTitle,'<br>','');
	sContentTitle = replaceAll(sContentTitle,'<br/>','');
	sContentTitle = replaceAll(sContentTitle,'<br />','');
	sContentImg = detail.imgPath;
	sContentId = detail.cotId;
	sContentType = detail.contentType;
	if (detail.conRead) {
		$('#conRead').text(getReadNumber(detail.conRead));
	}

	// 컨텐츠 변수
	conSnsId = data.header.id;
	conTitle = detail.title;
	conTelNo = detail.telNo;
	conInfoCenter = detail.infoCenter;
	conLocationx = detail.mapX;
	conLocationy = detail.mapY;
	mapCenterlocationx = conLocationy;
	mapCenterlocationy = conLocationx;
	conAreaCode = detail.areaCode;
	conSigunguCode = detail.sigunguCode;
	culturetourismurl = data.body.culturetourismurl;
	if (conSigunguCode == '' || conSigunguCode == undefined || conSigunguCode == null) {
		conSigunguCode = detail.sigugunCode;
	}

	flow.showRelationSpot({ cotId, mobileYn, snsId }, sContentTitle)
	flow.showRecommendTourGoods({
		areaCode : conAreaCode,
		sigugunCode : conSigunguCode,
		search: conAreaCode ? '' : 'ALL',
	})

	if (culturetourismurl) {
		let chtml = '<div class="reserve_btn">';
		chtml += '<a href="javascript:openWindow(\''+culturetourismurl+'\');" title="새창열림">관광해설 예약하기</a></div>';
		$('#detailinfoview').append(chtml);
	}
	if (typeof otherDepartmentContentCheck != 'undefined') {
		otherDepartmentContentCheck();
	}

	// 브랜딩 노출 항목 시작
	const branding = data.body.branding;
	if (branding != null) {
		let brandingHtml = '<ul class="'+branding.type+'">';
		switch (branding.type) {
		case 'tour':		// 관광지/문화시설/레포츠
			if ((branding.wellnessManualYn == null && branding.wellnessAutoYn == 1) || branding.wellnessManualYn == 1) {
				brandingHtml += '<li class="icon6"><a href="/other/otherService.do?otdid=287776d6-8939-11e8-8165-020027310001"><span>우수웰니스관광지 88선</span></a></li>';
			}
			if ((branding.korHManualYn == null && branding.korHAutoYn == 1) || branding.korHManualYn == 1) {
				brandingHtml += '<li class="icon1"><a href="/other/otherService.do?otdid=622bcd99-84fa-11e8-8165-020027310001"><span>한국관광 100선</span></a></li>';
			}
			if ((branding.korOpenManualYn == null && branding.korOpenAutoYn == 1) || branding.korOpenManualYn == 1) {
				brandingHtml += '<li class="icon2"><a href="/other/otherService.do?otdid=b55ffe10-84c3-11e8-8165-020027310001"><span>열린관광지</span></a></li>';
			}
			if ((branding.korStarManualYn == null && branding.korStarAutoYn == 1) || branding.korStarManualYn == 1) {
				brandingHtml += '<li class="icon3"><a href="/other/otherService.do?otdid=64e29192-8939-11e8-8165-020027310001"><span>한국관광의 별</span></a></li>';
			}
			break;
		case 'food':		// 음식점
			const obj = ['좋음', '우수', '매우우수'];
			$('.sanitation_class .class' + (obj.indexOf(branding.hgAsgnLv) + 1)).show();
			if ((branding.wellnessManualYn == null && branding.wellnessAutoYn == 1) || branding.wellnessManualYn == 1) {
				brandingHtml += '<li class="icon6"><a href="/other/otherService.do?otdid=287776d6-8939-11e8-8165-020027310001"><span>우수웰니스관광지 88선</span></a></li>';
			}
			if (branding.goodManualYn == 1) {
				brandingHtml += '<li class="icon4"><a href="javascript:;"><span>착한가격업소</span></a></li>';
			}
			if (branding.hundredManualYn == 1) {
				brandingHtml += '<li class="icon5"><a href="javascript:;"><span>백년가게</span></a></li>';
			}
			break;
		case 'lodging':		// 숙박
			if ((branding.wellnessManualYn == null && branding.wellnessAutoYn == 1) || branding.wellnessManualYn == 1) {
				brandingHtml += '<li class="icon6"><a href="/other/otherService.do?otdid=287776d6-8939-11e8-8165-020027310001"><span>우수웰니스관광지 88선</span></a></li>';
			}
			if ((branding.korStarManualYn == null && branding.korStarAutoYn == 1) || branding.korStarManualYn == 1) {
				brandingHtml += '<li class="icon1"><a href="javascript:;"><span>한국관광의 별</span></a></li>';
			}
			if ((branding.kqManualYn == null && branding.kqAutoYn == 1) || branding.kqManualYn == 1) {
				brandingHtml += '<li class="icon2"><a href="javascript:;"><span>한국관광품질인증(KQ)</span></a></li>';
				GetOTALinkList();
				GetAccommodation();
				GetInstaTagSearch(detail.title,sContentId);
			}
			break;
		case 'shopping':	// 쇼핑
			if ((branding.wellnessManualYn == null && branding.wellnessAutoYn == 1) || branding.wellnessManualYn == 1) {
				brandingHtml += '<li class="icon6"><a href="/other/otherService.do?otdid=287776d6-8939-11e8-8165-020027310001"><span>우수웰니스관광지 88선</span></a></li>';
			}
			if ((branding.korStarManualYn == null && branding.korStarAutoYn == 1) || branding.korStarManualYn == 1) {
				brandingHtml += '<li class="icon1"><a href="/other/otherService.do?otdid=64e29192-8939-11e8-8165-020027310001"><span>한국관광의 별</span></a></li>';
			}
			if ((branding.kqManualYn == null && branding.kqAutoYn == 1) || branding.kqManualYn == 1) {
				brandingHtml += '<li class="icon2"><a href="javascript:;"><span>한국관광품질인증(KQ)</span></a></li>';
			}
			if (branding.hundredManualYn == 1) {
				brandingHtml += '<li class="icon3"><a href="javascript:;"><span>백년가게</span></a></li>';
			}
			break;
		case 'festival':	// 축제
			if ((branding.korStarManualYn == null && branding.korStarAutoYn == 1) || branding.korStarManualYn == 1) {
				brandingHtml += '<li class="icon1"><a href="/other/otherService.do?otdid=64e29192-8939-11e8-8165-020027310001"><span>한국관광의 별</span></a></li>';
			}
			if ((branding.cultureTourManualYn == null && branding.cultureTourAutoYn == 1) || branding.cultureTourManualYn == 1) {
				brandingHtml += '<li class="icon2"><a href="javascript:;"><span>문화관광축제</span></a></li>';
			}
			break;
		}

		brandingHtml += '</ul>';

		$('.brandingIcon').html(brandingHtml);
	}
	// 브랜딩 노출 항목 끝

	// 상단 제목 부분 시작
	$('#conLike').html(detail.conLike);
	$('#conShare').html(detail.conShare);

	$('#topTitle').html(detail.title);
	$('#eventSource').html(`[${detail.title}] 운영기관`);
	// 상단 제목 부분 끝

	// 상단 주소, 축제 기간 부분 시작
	let topAddrHtml = '';
	areaName = getAreaName(detail.areaCode);
	sigunguName = getSigunguName(detail.areaCode, detail.sigugunCode);
	$('.coronic h4').text('‘'+areaName+'’ 코로나 확진자 현황');
	$('.inoculator h4').text('‘'+areaName+'’ 백신 접종 현황');
	topAddrHtml += '<span>'+areaName+' '+sigunguName+'</span>';
	let fesstatushtml = '';
	if (sContentType == 15) {
		topAddrHtml += '<span>'+conDateFormat(detail.eventStartDate,"yyyyMMdd",".")+' ~ '+conDateFormat(detail.eventEndDate,"yyyyMMdd",".")+'</span>';
		if (detail.progflag == undefined) {
			if ( detail.eventStartDate > curDate ) {
				fesstatushtml += '<span class="status2">진행전</span>';
			} else if ( detail.eventStartDate <= curDate && detail.eventEndDate >= curDate ) {
				fesstatushtml += '<span class="status1">진행중</span>';
			} else if ( detail.eventEndDate < curDate ) {
				fesstatushtml += '<span class="status5">종료</span>';
			}
		} else {
			if (detail.progflag == 0) {
				fesstatushtml += '<span class="status2">미정</span>';
				topAddrHtml = '<span>'+areaName+' '+sigunguName+'</span>';
				topAddrHtml += '<span>개최여부 확인 중 입니다.</span>';
				fesstatus = true;
			} else if (detail.progflag == 1) {
				fesstatushtml += '<span class="status5">취소</span>';
				topAddrHtml = '<span>'+areaName+' '+sigunguName+'</span>';
				topAddrHtml += '<span>해당 축제는 올해 취소되었습니다.</span>';
				fesstatus = true;
			} else if (detail.progflag == 2) {
				fesstatushtml += '<span class="status2">행사연기</span>';
				topAddrHtml = '<span>'+areaName+' '+sigunguName+'</span>';
				topAddrHtml += '<span>해당 축제는 잠정 연기되었습니다.</span>';
				fesstatus = true;
			}
		}

		if (detail.formflag != undefined) {
			if (detail.formflag == 0) {
				fesstatushtml += '<span class="status3">오프라인</span>';
			} else if (detail.formflag == 1) {
				fesstatushtml += '<span class="status3">온라인</span>';
			}
		}

		if (detail.cycleflag != undefined ) {
			if (detail.cycleflag == 0) {
				fesstatushtml += '<span class="status4">상시</span>';
			} else if (detail.cycleflag == 1) {
				fesstatushtml += '<span class="status4">격년제</span>';
			}
		}
	}

	$('.fes_status').html(fesstatushtml);
	$('#topAddr').html(topAddrHtml);
	// 상단 주소, 축제 기간 부분 끝

	// 캐치플레이스 부분 시작
	if (detail.catchtitle != null && $.trim(detail.catchtitle) != '' && detail.catchuse == 1) {
		let cpTarget = $('#topCp').find('em');

		cpTarget.html(detail.catchtitle);
		if (detail.catchbg =="1") {
			if (detail.catchflow =="0") {
				cpTarget.css("background","url("+mainimgurl +detail.catchimg+")repeat-x left bottom");
			}
		} else {
			$(".dbDetail").addClass("titBg");
		}

		if (detail.catchcolor == '' || detail.catchcolor == null || detail.catchcolor == undefined) {
		} else {
			cpTarget.css("color",detail.catchcolor);
		}

		if (detail.catchflow =="1") {
			setTimeout(function() {
				$(".dbDetail").addClass("titType1");
				marqueesetting(data);
			}, 3000);
		}
	} else {
		$('#topCp').hide();
	}
	// 캐치플레이스 부분 끝

	// 이미지 부분 시작
	var pImg = data.body.publicImage;	// 공사 사진
	pImgCnt = pImg.length;
	let pImgListHtml = '';

	let videohtml='';

	if (data.body.video != undefined) {

	if (data.body.video.viewyn != undefined) {
			let mainYoutubeTag = document.createElement('script');
			mainYoutubeTag.src = "https://www.youtube.com/player_api";
			let firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(mainYoutubeTag, firstScriptTag);

			videoId = data.body.video.url;

			videohtml += '<div class="db_detail_youtube" id="youtubeGo">';
			videohtml += '<div class="video_wrap">';
			videohtml += '<img src="../resources/images/temp/temp_video.jpg" alt="video dummy">';
			videohtml += '<div class="video_area">';
			videohtml += '<div id="youtube" style="height: 100%;"></div>';
			videohtml += '</div>';
			if (data.body.video.type == '1') {
				videohtml += '<div class="iosLayer">';
				videohtml += '<div>';
				if (getDevice()=='iOS') {
					videohtml += '<p>해당 동영상은 VR 동영상으로<br/>';
					videohtml += '아이폰 Youtube APP을 통해서만<br/>';
					videohtml += '원활한 재생이 가능합니다.</p>'
					videohtml += '<a href="javascript:ios_go_url(\''+videoId+'\');">Youtube APP 으로 시청</a>';
				} else {
					videohtml += '<p>본 동영상은 VR기능을 지원합니다<br/>';
					videohtml += '화면을 상/하/좌/우로 이동하여 감상해 보세요.<br/>';
					if (mobileYn == 'N') {
						videohtml += '(단, IE브라우저는 지원하지 않습니다.)</p>';
					}
				}

				videohtml += '</div>';
				videohtml += '<button type="button" onclick="closeIosLayer();">닫기</button>';
				videohtml += '</div>';
			}
			videohtml += '</div></div>';
			$('.detail_tab').after(videohtml);
			$('#photoTab span').text('동영상/사진');
		}
	}

	$.each(pImg, function(index, items) {
		pImgListHtml += '<div class="swiper-slide" >';
		pImgListHtml += '	  <a href="javascript:;" onclick="openPhotoView('+index+')">';
		pImgListHtml += '		  <img class="swiper-lazy" data-src="'+mainimgurl+items.imgPath+'" alt="'+items.imgAlt+'" onclick="openPhotoView('+index+')" style="width:100%; height:100%;object-fit: contain;" tabindex="0"><div class="swiper-lazy-preloader"></div>';
		pImgListHtml += '	  </a>';
		pImgListHtml += '</div>';
	});

	if (pImgListHtml == '') {
		pImgListHtml += '<div class="swiper-slide" style="background-image: url(/resources/images/common/no_img_01.png);"><a>이미지없음</a></div>';
		$('.photo_gallery .swiper-pagination').remove();
		$('.photo_gallery .swiper-button-next').remove();
		$('.photo_gallery .swiper-button-prev').remove();
	}
	$('#pImgList').html(pImgListHtml);

	var swiper = new Swiper('.photo_gallery .swiper-container', {
		pagination: {
			el: '.swiper-pagination',
			type: 'fraction',
		},
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
			preloadImages: false,
			lazyLoading: true,
			lazy: {
				loadPrevNext: true,
				loadOnTransitionStart : true
			}
	});

	var uImg = data.body.userImage;	// user image
	uImgCnt = uImg.length;
	let uImgListHtml = '';
	switch (uImgCnt) {
	case 0:
		uImgListHtml += `<li class="type2">`;
		uImgListHtml += `	<a href="javascript:imgupload();" class="reg1">`;
		uImgListHtml += `		<span>직접 찍은 사진을 등록해 주세요.</span>`;
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		break;
	case 1:
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+pImgCnt+`);" style="background-image: url(`+mainimgurl+uImg[0].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[0].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[0]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		uImgListHtml += `<li class="type1">`;
		uImgListHtml += `	<a href="javascript:imgupload();" class="reg">`;
		uImgListHtml += `		<p>직접 찍은 사진을<br/>등록해 주세요.</p>`;
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		break;
	case 2:
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+pImgCnt+`);" style="background-image: url(`+mainimgurl+uImg[0].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[0].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[0]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+(pImgCnt+1)+`);" style="background-image: url(`+mainimgurl+uImg[1].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[1].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[1]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:imgupload();" class="reg">`;
		uImgListHtml += `		<p>직접 찍은 사진을<br/>등록해 주세요.</p>`;
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		break;
	case 3:
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+pImgCnt+`);" style="background-image: url(`+mainimgurl+uImg[0].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[0].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[0]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+(pImgCnt+1)+`);" style="background-image: url(`+mainimgurl+uImg[1].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[1].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[1]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+(pImgCnt+2)+`);" style="background-image: url(`+mainimgurl+uImg[2].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[2].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[2]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		break;

	default:
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+pImgCnt+`);" style="background-image: url(`+mainimgurl+uImg[0].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[0].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[0]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+(pImgCnt+1)+`);" style="background-image: url(`+mainimgurl+uImg[1].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<strong>`+uImg[1].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[1]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		uImgListHtml += `<li>`;
		uImgListHtml += `	<a href="javascript:openPhotoView(`+(pImgCnt+2)+`);" class="more" style="background-image: url(`+mainimgurl+uImg[2].imgPath+`&mode=custom&width=300&height=300);">`;
		uImgListHtml += `		<span class="view_layer">+ `+uImgCnt+`</span>`;
		uImgListHtml += `		<strong>`+uImg[2].imgAlt+`</strong>`;
		uImgListHtml += profileImg(uImg[2]);	// 프로필 사진
		uImgListHtml += `	</a>`;
		uImgListHtml += `</li>`;
		break;
	}

	$('.simg ul').html(uImgListHtml);
	if (uImgCnt > 2) {
		$('.festivalBanner').removeClass('type1');
		$('.user_reg #normalPictureUpload').css('display','inline-block');
	}

	// 이미지 뷰어
	imgCnt = data.body.image.length;
	$.each(data.body.image, function (index, items) {

		galleryTopHtml += '<div class="swiper-slide">';

		if (items.imgType == 'User') {
			galleryTopHtml += '<div class="btn">';
			if (items.snsId == conSnsId) {
				galleryTopHtml += '<button type="button" class="btn_del" onclick="imgDel(this);">삭제하기</button>';
			} else {
				galleryTopHtml += '	<button type="button" data-index="99" class="btn_report" onclick="imgReport(this);">신고하기</button>';
			}
			galleryTopHtml += '</div>';
		}

		galleryTopHtml += '	<div class="wrap">';
		galleryTopHtml += '		<img src="/resources/images/common/nonbg.png" delayedsrc="'+mainimgurl+items.imgPath+'" alt="'+items.imgAlt+'" id="img'+index+'">';
		galleryTopHtml += '	</div>';

		if ($.trim(items.userName) != '') {
			galleryTopHtml += '<div class="tit_wrap">';
			galleryTopHtml += profileImg(items);
			galleryTopHtml += '	<em>'+items.userName+'</em>';
			galleryTopHtml += '</div>';
		}
		galleryTopHtml += '</div>';

		galleryThumbsHtml +=
			'<div class="swiper-slide">' +
			'<a ' +
			'href="javascript:;" ' +
			'data-index="' + index + '" ' +  // 여기서 index를 동적으로 주입
			'style="background-image:url(' + mainimgurl + items.imgPath + '&mode=custom&height=100&width=100);">' +
			items.imgAlt +
			'</a>' +
			'</div>';
	});
	if ($.trim($('#galleryTop').html()) == '') {
		$('#galleryTop').html(galleryTopHtml);
	}
	if ($.trim($('#galleryThumbs').html()) == '') {
		$('#galleryThumbs').html(galleryThumbsHtml);
	}
	// 이미지 부분 끝

	// 기본정보 시작
	if (sContentType == 15) {
		let noticehtml = '';
		let eventEndDate = detail.eventEndDate;
		eventEndDate = eventEndDate.substring(0,4);

		if (detail.progflag != null || detail.progflag != undefined) {
			if (detail.progflag == 0 || detail.progflag == 2) {
				noticehtml += '<p class="notice">'+data.body.detail.thisyear+'년 행사 정보는 준비중입니다. 지난 정보임에 유의하세요</p>'
				$('.area_txtView.top').prepend(noticehtml);
			} else if (detail.progflag == 1) {
				noticehtml += '<p class="notice">'+data.body.detail.thisyear+'년 행사는 취소되었습니다. 지난 정보임에 유의하세요</p>'
				$('.area_txtView.top').prepend(noticehtml);
			}
		}

		let descHtml = '';

		if (subArticle != null) {
			$.each(subArticle, function(index, items) {
				if (items.notice.length > 0 && items.notice != '<p><br></p>') {
					if (index != 0) {
						descHtml += '<br><br>['+items.title+']<br>';
					}
					descHtml += items.notice.replace(/(\n|\r\n)/g, '<br>');
				}
			});
			htm.html(detail.overView == null ? descHtml : descHtml.length > 0 ? descHtml : detail.overView.replace(/(\n|\r\n)/g, '<br>'));
		}
	} else {
		htm.html(detail.overView.replace(/(\n|\r\n)/g, '<br>'));
	}

	if (data.body.detail.always_yn) {
		let noticehtml = '';
		if (data.body.detail.always_yn == 'Y') {
			noticehtml += '<p class="notice">'+data.body.detail.noticecontents+'</p>'
		} else {
			if (data.body.detail.startDate && data.body.detail.endDate) {
				const today = new Date();
				const startdate = CreateDate(data.body.detail.startDate);
				const enddate = CreateDate(data.body.detail.endDate);
				if ( startdate <= today && today <= enddate ) {
					noticehtml += '<p class="notice">'+data.body.detail.noticecontents+'</p>'
				}
			}
		}
		$('.area_txtView.top').prepend(noticehtml);
	}
	// 기본정보 끝

	// 맵
	setLocationMap(data);

	// 상세정보 항목 시작
	var regex= /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
	var regex2 = /[a-zA-Z]/g;
	var regex3 = /[\{\}\[\]\/?.,;:|\)*~`!^\_+<>@\#$%&\\\=\(\'\"]/gi;
	var infoHtml = '';
	var telArry = '';

	if (sContentType == 15) {
		if (fesstatus == false) {
			infoHtml += '<li><strong>시작일</strong><span>'+conDateFormat(detail.eventStartDate,"yyyyMMdd",".")+'</span></li>';
			infoHtml += '<li><strong>종료일</strong><span>'+conDateFormat(detail.eventEndDate,"yyyyMMdd",".")+'</span></li>';
		}

		if ( detail.telNo1 == null || detail.telNo1 == '' || detail.telNo1 == 'null' ) {
			$('.link_phone').hide();
		} else {
			//전화걸기
			conInfoCenter = detail.telNo1;

			if ( conInfoCenter.indexOf(',') > -1  ) {
				telArry = conInfoCenter.split(",");
			} else if ( conInfoCenter.indexOf('<br />') > -1 ) {
				telArry = conInfoCenter.split("<br />");
				if ( telArry[0].indexOf('~') > -1  ) {
					telArry = conInfoCenter.split("~");
				}
			} else if ( conInfoCenter.indexOf('<br/>') > -1  ) {
				telArry = conInfoCenter.split("<br/>");
				if ( telArry[0].indexOf('~') > -1  ) {
					telArry = conInfoCenter.split("~");
				}
			} else if ( conInfoCenter.indexOf('<br>') > -1  ) {
				telArry = conInfoCenter.split("<br>");
				if ( telArry[0].indexOf('~') > -1  ) {
					telArry = conInfoCenter.split("~");
				}
			} else if ( conInfoCenter.indexOf('~') > -1  ) {
				telArry = conInfoCenter.split("~");
			} else if ( conInfoCenter.indexOf('/') > -1  ) {
				telArry = conInfoCenter.split("/");
			} else {
				telArry = [ conInfoCenter, ''];
			}

			$('.link_phone a').attr("href", "tel:"+telArry[0].replace(regex,'').replace(regex2,'').replace(regex3,''));	//conTelNo
		}
	} else {
		if ( conInfoCenter == null || conInfoCenter == '' || conInfoCenter == 'null' ) {
			$('.link_phone').hide();
		} else {
			if ( conInfoCenter.indexOf(',') > -1  ) {
				telArry = conInfoCenter.split(",");
			} else if ( conInfoCenter.indexOf('<br />') > -1 ) {
				telArry = conInfoCenter.split("<br />");
				if ( telArry[0].indexOf('~') > -1  ) {
					telArry = conInfoCenter.split("~");
				}
			} else if ( conInfoCenter.indexOf('<br/>') > -1  ) {
				telArry = conInfoCenter.split("<br/>");
				if ( telArry[0].indexOf('~') > -1  ) {
					telArry = conInfoCenter.split("~");
				}
			} else if ( conInfoCenter.indexOf('<br>') > -1  ) {
				telArry = conInfoCenter.split("<br>");
				if ( telArry[0].indexOf('~') > -1  ) {
					telArry = conInfoCenter.split("~");
				}
			} else if ( conInfoCenter.indexOf('~') > -1  ) {
				telArry = conInfoCenter.split("~");
			} else if ( conInfoCenter.indexOf('/') > -1  ) {
				telArry = conInfoCenter.split("/");
			} else {
				telArry = [ conInfoCenter, ''];
			}
			//전화걸기
			$('.link_phone a').attr("href", "tel:"+telArry[0].replace(regex,'').replace(regex2,'').replace(regex3,''));	//conTelNo
		}
	}

	if ( detail.infoCenter == null || detail.infoCenter == '' || detail.infoCenter == 'null' || detail.infoCenter == '<p><br></p>'  ) {
	} else {
			if (telArry[0] == undefined || telArry[0] == '') {
			} else {
				infoHtml += '<li><strong>문의 및 안내</strong><span class="mo"><a href="tel:'+telArry[0].replace(regex,'').replace(regex2,'').replace(regex3,'')+'">'+detail.infoCenter+'</a></span>';
				infoHtml += '<span class="pc">'+detail.infoCenter+'</span></li>';
				if (detail.contentType == '32')
				ShareDesc2 = '연락처 : ' + detail.infoCenter;
			}
	}

	if ( detail.contentType == '15' ) {
		if ( detail.telNo1 == null || detail.telNo1 == '' || detail.telNo1 == 'null' || detail.telNo1 == '<p><br></p>') {
		} else {
			infoHtml += '<li><strong>전화번호</strong><span class="mo"><a href="tel:'+telArry[0].replace(regex,'').replace(regex2,'').replace(regex3,'')+'">'+detail.telNo1+'</a></span>';
			infoHtml += '<span class="pc">'+detail.telNo1+'</span></li>';
		}
	}

	if ( detail.homepage == null || detail.homepage == '' || detail.homepage == 'null' || detail.homepage == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>홈페이지</strong><span>'+detail.homepage+'</span></li>';
	}

	if ( detail.addr1 == undefined || detail.addr1 == 'null' || detail.addr1 == '<p><br></p>') {
	} else {
		ShareDesc1 = '주소 : ' +detail.addr1 + ' ' +(detail.addr2 ? detail.addr2 : '');
		infoHtml += '<li><strong>주소</strong><span>'+detail.addr1+' ' + (detail.addr2 ? detail.addr2 : '') + '</span></li>';
	}

	if ( detail.eventPlace == undefined || detail.eventPlace == 'null' || detail.eventPlace == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>행사장소</strong><span>'+detail.eventPlace+'</span></li>';
	}

	if ( detail.sponsor1 == null || detail.sponsor1 == '' || detail.sponsor1 == 'null' || detail.sponsor1 == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>주최</strong><span>'+detail.sponsor1+'</span></li>';
	}

	if ( detail.sponsor2 == null || detail.sponsor2 == '' || detail.sponsor2 == 'null' || detail.sponsor2 == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>주관</strong><span>'+detail.sponsor2+'</span></li>';
	}

	if ( detail.ageLimit == null || detail.ageLimit == '' || detail.ageLimit == 'null' || detail.ageLimit == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>관람 가능 연령</strong><span>'+detail.ageLimit+'</span></li>';
	}

  if ( detail.useTime == null || detail.useTime == '' || detail.useTime == 'null'|| detail.useTime == '<p><br></p>' ) {
  } else {
    infoHtml += '<li><strong>이용시간</strong><span>'+detail.useTime+'</span></li>';
    if (detail.contentType == '28') {
			ShareDesc2 = '이용시간 : ' + detail.useTime;
		} else if (detail.contentType == '38') {
			ShareDesc2 = '영업시간: ' +detail.useTime;
		}
  }

	if ( detail.openTime == null || detail.openTime == '' || detail.openTime == 'null'|| detail.openTime == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>영업시간</strong><span>'+detail.openTime+'</span></li>';
		if (detail.contentType == '39') {
			ShareDesc2 = '영업시간: ' +detail.openTime;
		}
	}

	if ( detail.restDate == null || detail.restDate == '' || detail.restDate == 'null' || detail.restDate == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>휴일</strong><span>'+detail.restDate+'</span></li>';
		if (detail.contentType == '12' || detail.contentType == '14') {
			ShareDesc2 = '휴일 : ' +detail.restDate;
		}
	}

	if ( detail.openPeriod == null || detail.openPeriod == '' || detail.openPeriod == 'null' || detail.openPeriod == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>개장기간</strong><span>'+detail.openPeriod+'</span></li>';
	}

	if ( detail.parking == null || detail.parking == '' || detail.parking == 'null'|| detail.parking == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>주차</strong><span>'+detail.parking+'</span></li>';
	}

	if ( !detail.parkingFee || detail.parkingFee == null || detail.parkingFee == '' || detail.parkingFee == 'null' || detail.parkingFee == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>주차 요금</strong><span>'+detail.parkingFee+'</span></li>';
	}

	if ( detail.useCash == null || detail.useCash == '' || detail.useCash == 'null' || detail.useCash == ''|| detail.useCash == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>이용요금</strong><span>'+detail.useCash+'</span></li>';
	}

	if ( detail.setStatus == null || detail.setStatus == '' || detail.setStatus == 'null' || detail.setStatus == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>지정현황</strong><span>'+detail.setStatus+'</span></li>';
	}

	if ( detail.accomCount == null || detail.accomCount == '' || detail.accomCount == 'null'|| detail.accomCount == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>수용인원</strong><span>'+detail.accomCount+'</span></li>';
	}

	if ( detail.checkInTime == null || detail.checkInTime == '' || detail.checkInTime == 'null'|| detail.checkInTime == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>입실시간</strong><span>'+detail.checkInTime+'</span></li>';
	}

	if ( detail.checkOutTime == null || detail.checkOutTime == '' || detail.checkOutTime == 'null'|| detail.checkOutTime == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>퇴실시간</strong><span>'+detail.checkOutTime+'</span></li>';
	}

	if ( detail.chkCooking == null || detail.chkCooking == '' || detail.chkCooking == 'null' || detail.chkCooking == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>객실내 취사 여부</strong><span>'+detail.chkCooking+'</span></li>';
	}

	if ( detail.foodPlace == null || detail.foodPlace == '' || detail.foodPlace == 'null'|| detail.foodPlace == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>식음료장</strong><span>'+detail.foodPlace+'</span></li>';
	}

	if ( detail.contentType == '32' ) {
	} else {
		if ( detail.contactInfo == null || detail.contactInfo == '' || detail.contactInfo == 'null'|| detail.contactInfo == '<p><br></p>' ) {
		} else {
			infoHtml += '<li><strong>문의및안내</strong><span>'+detail.contactInfo+'</span></li>';
		}
	}

	if ( detail.seat == null || detail.seat == '' || detail.seat == 'null' || detail.seat == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>좌석수</strong><span>'+detail.seat+'</span></li>';
	}

	if ( detail.firstMenu == null || detail.firstMenu == '' || detail.firstMenu == 'null'|| detail.firstMenu == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>대표메뉴</strong><span>'+detail.firstMenu+'</span></li>';
	}

	if ( detail.treatMenu == null || detail.treatMenu == '' || detail.treatMenu == 'null' || detail.treatMenu == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>취급메뉴</strong><span>'+detail.treatMenu+'</span></li>';
	}

	if ( detail.hgAsgnLv == null || detail.hgAsgnLv == '' || detail.hgAsgnLv == 'null'|| detail.hgAsgnLv == '<p><br></p>' ) {
	} else {
		let gradehtml = '<div class="hygieneGrade">';
		if (detail.hgAsgnLv == '매우우수') {
			gradehtml += '<span class="grade1">식약처 음식점 위생등급제 인증업소 매우우수(별3개)</span></div>';
		} else if (detail.hgAsgnLv == '우수') {
			gradehtml += '<span class="grade2">식약처 음식점 위생등급제 인증업소 우수(별2개)</span></div>';
		} else if (detail.hgAsgnLv == '좋음') {
			gradehtml += '<span class="grade3">식약처 음식점 위생등급제 인증업소 좋음(별1개)</span></div>';
		}

		$('.imgregWrap').before(gradehtml);
	}

	if ( detail.roomCount == null || detail.roomCount == '' || detail.roomCount == 'null'|| detail.roomCount == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>객실수</strong><span>'+detail.roomCount+'</span></li>';
	}

	if ( detail.reservation == null || detail.reservation == '' || detail.reservation == 'null' || detail.reservation == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>예약안내</strong><span>'+detail.reservation+'</span></li>';
	}

	if ( detail.reservationUrl == null || detail.reservationUrl == '' || detail.reservationUrl == 'null' || detail.reservationUrl == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>예약안내 홈페이지</strong><span>'+detail.reservationUrl+'</span></li>';
	}

	if ( detail.roomType == null || detail.roomType == '' || detail.roomType == 'null'|| detail.roomType == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>객실유형</strong><span>'+detail.roomType+'</span></li>';
	}

	if ( detail.scale == null || detail.scale == '' || detail.scale == 'null'|| detail.scale == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>규모</strong><span>'+detail.scale+'</span></li>';
	}

	if ( detail.subFacility == null || detail.subFacility == '' || detail.subFacility == 'null'|| detail.subFacility == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>부대시설</strong><span>'+detail.subFacility+'</span></li>';
	}

	if ( detail.playTime == null || detail.playTime == '' || detail.playTime == 'null' || detail.playTime == '<p><br></p>') {
	} else {
		infoHtml += '<li><strong>행사시간</strong><span>'+detail.playTime+'</span></li>';
		if (detail.contentType == '15') {
			ShareDesc2 = '행사시간 : ' +detail.playTime;
		}
	}

	if ( !detail.expGuide || detail.expGuide == null || detail.expGuide == '' || detail.expGuide == 'null' || detail.expGuide == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>체험 프로그램</strong><span>'+detail.expGuide+'</span></li>';
	}

	if ( !detail.expAgeRange || detail.expAgeRange == null || detail.expAgeRange == '' || detail.expAgeRange == 'null' || detail.expAgeRange == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>체험가능 연령</strong><span>'+detail.expAgeRange+'</span></li>';
	}

	if ( !detail.useSeason || detail.useSeason == null || detail.useSeason == '' || detail.useSeason == 'null' || detail.useSeason == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>이용 시기</strong><span>'+detail.useSeason+'</span></li>';
	}

	if ( !detail.discountInfo || detail.discountInfo == null || detail.discountInfo == '' || detail.discountInfo == 'null' || detail.discountInfo == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>할인 정보</strong><span>'+detail.discountInfo+'</span></li>';
	}

	if ( !detail.saleItem || detail.saleItem == null || detail.saleItem == '' || detail.saleItem == 'null' || detail.saleItem == '<p><br></p>' ) {
	} else {
		infoHtml += '<li><strong>판매 품목</strong><span>'+detail.saleItem+'</span></li>';
	}

	if ( detail.barbecue == null || detail.barbecue == '' || detail.barbecue == 'null'|| detail.barbecue == '<p><br></p>' ) {
	} else {
		var bbq = (detail.barbecue == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>바비큐장여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.beauty == null || detail.beauty == '' || detail.beauty == 'null' || detail.beauty == '<p><br></p>') {
	} else {
		var bbq = (detail.beauty == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>뷰티시설여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.bicycle == null || detail.bicycle == '' || detail.bicycle == 'null' || detail.bicycle == '<p><br></p>') {
	} else {
		var bbq = (detail.bicycle == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>자전거 대여 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.compfire == null || detail.compfire == '' || detail.compfire == 'null' || detail.compfire == '<p><br></p>') {
	} else {
		var bbq = (detail.compfire == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>캠프파이어 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.fitness == null || detail.fitness == '' || detail.fitness == 'null' || detail.fitness == '<p><br></p>' ) {
	} else {
		var bbq = (detail.fitness == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>휘트니스 센터 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.karaoke == null || detail.karaoke == '' || detail.karaoke == 'null' || detail.karaoke == '<p><br></p>') {
	} else {
		var bbq = (detail.karaoke == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>노래방 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.publicBath == null || detail.publicBath == '' || detail.publicBath == 'null' || detail.publicBath == '<p><br></p>') {
	} else {
		var bbq = (detail.publicBath == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>공용 샤워실 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.publicPc == null || detail.publicPc == '' || detail.publicPc == 'null' || detail.publicPc == '<p><br></p>') {
	} else {
		var bbq = (detail.publicPc == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>공용 PC실 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.sauna == null || detail.sauna == '' || detail.sauna == 'null' || detail.sauna == '<p><br></p>') {
	} else {
		var bbq = (detail.sauna == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>사우나실 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.seminar == null || detail.seminar == '' || detail.seminar == 'null' || detail.seminar == '<p><br></p>') {
	} else {
		var bbq = (detail.seminar == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>세미나실 여부</strong><span>'+bbq+'</span></li>';
	}

	if ( detail.sports == null || detail.sports == '' || detail.sports == 'null' || detail.sports == '<p><br></p>' ) {
	} else {
		var bbq = (detail.sports == 1) ? "있음" : "없음";
		infoHtml += '<li><strong>스포츠 시설  여부</strong><span>'+bbq+'</span></li>';
	}

	if (sContentType !== 15 && subArticle != null) {
    const showFields = ['입장료', '시설이용료', '체험프로그램', '이용요금']
    const showFieldsByContentType = {
      //  관광지
      12: ['이용가능시설', '화장실', '주차요금'],
      //  문화시설
      14: ['주요시설'],
      //  레포츠
      28: ['주요시설', '보유장비', '코스안내', '부대시설', '강습안내', '대여안내', '주차', '주차요금', '화장실'],
      //  쇼핑
      38: ['입점브랜드']
    }
		$.each(subArticle, function (index, items) {
			if (items.displayTitle !== undefined) {
        const trimDisplayTitle = ctrim(items.displayTitle)
        const isShowFields = showFields.indexOf(trimDisplayTitle) !== -1
        const isShowFieldsByContentType = sContentType in showFieldsByContentType
            && showFieldsByContentType[sContentType].indexOf(trimDisplayTitle) !== -1
				if ( isShowFields || isShowFieldsByContentType) {
					if ( items.contentBody == null || items.contentBody == '' || items.contentBody == 'null' || items.telNo1 == '<p><br></p>') {
					} else {
						infoHtml += `<li><strong>${trimDisplayTitle}</strong><span>${items.contentBody}</span></li>`;
					}
				}
			}
		});
	}

	$('.area_txtView.bottom').find('ul').html(infoHtml);
	// 상세정보 항목 끝

	// 무장애 영역 시작
	let bFreeHtml = '';

	if ( bFree != undefined && bFree != null ) {
		$.each(bFree, function (index, items) {
			if (items.DETAIL_TEXT) {
				let bTitle = items.TITLE;

				if (bTitle == "주차") {
					bTitle = "장애인 주차 안내";
				} else if (bTitle == '영유아가족 기타상세') {
					bTitle = '영유아가족<br>기타상세';
				}

				bFreeHtml += '<li><strong>'+bTitle+'</strong><span>'+items.DETAIL_TEXT+'</span></li>';

				if ( items.TITLE == '화장실') {
					$('#b1').addClass('active');
				} else if ( items.TITLE == '엘리베이터' ) {
					$('#b2').addClass('active');
				} else if ( items.TITLE == '주차' ) {
					$('#b3').addClass('active');
				} else if ( items.TITLE == '출입통로' || items.TITLE == '접근로' ) {
					$('#b4').addClass('active');
				} else if ( items.TITLE == '대중교통' ) {
					$('#b5').addClass('active');
					$('#b6').addClass('active');
				} else if ( items.TITLE == '휠체어' ) {
					$('#b7').addClass('active');
				} else if ( items.TITLE == '점자블록' || items.TITLE == '안내요원' || items.TITLE == '오디오가이드' || items.TITLE == '큰활자홍보물' || items.TITLE == '점자홍보물 및 점자표지판' || items.TITLE == '유도안내설비' ) {
					$('#b8').addClass('active');
				} else if ( items.TITLE == '수화안내' || items.TITLE == '자막 비디오가이드 및 영상자막안내' || items.TITLE == '청각장애 기타상세' ) {
					$('#b9').addClass('active');
				} else if ( items.TITLE == '수유실' ) {
					$('#b10').addClass('active');
				} else if ( items.TITLE == '지체장애 객실' || items.TITLE == '청각장애 객실' || items.TITLE == '객실' ) {
					$('#b11').addClass('active');
				} else if ( items.TITLE == '유모차' ) {
					$('#b12').addClass('active');
				}
			}
		});

		if ( bFree.length == 0 ) {
			$('#bfreeinfoH').hide();
			$('#bfreeinfoB').hide();
		} else {
			$('.area_txtView.bottom').find('ul').append(bFreeHtml);
		}
	} else {
		$('#bfreeinfoH').hide();
		$('#bfreeinfoB').hide();
	}
	// 무장애 영역 끝

	detailHeight();

	// 객실정보 시작
	if ( accommo != undefined && accommo.length > 0) {
		$('#roomTitleImg').show();

		let accommoHtml = '';

		$.each(accommo, function (index, items) {
			if ( items.roomTitle != undefined && items.roomOffSeasonMF1 != undefined ) {
				accommoHtml += '<li>';
				accommoHtml += '	<strong>'+items.roomTitle+'</strong>';
				accommoHtml += '	<div class="slider_wrap swiper-container">';
				accommoHtml += '		<ul class="swiper-wrapper">';

				let roomimgcnt = 0;
				for ( let i=1; i<6;i++) {
					if ( eval("items.roomImg"+i) != undefined  ) {		//&& eval("items.roomImg"+i) != 'null'

						if (eval("items.roomvisiable"+i)  != undefined ) {
							if (eval("items.roomvisiable"+i) == 1) {
								roomimgcnt++;
								accommoHtml += '<li class="swiper-slide">';
								accommoHtml += '	<a href="javascript:;"><img src="'+mainimgurl+eval("items.roomImg"+i)+'" alt="'+items.roomTitle+'"></a>';
								accommoHtml += '</li>';
							}
						}
					}
				}

				if ( roomimgcnt == 0) {
					accommoHtml += '<li class="swiper-slide">';
					accommoHtml += '	<a href="javascript:"><img src="/resources/images/common/no_img_02.png" alt="이미지없음"></a>';
					accommoHtml += '</li>';
				}

				accommoHtml += '</ul>';

				accommoHtml += '<div class="swiper-pagination"></div>';
				accommoHtml += '<button type="button" class="swiper-button-prev">이전</button>';
				accommoHtml += '<button type="button" class="swiper-button-next">다음</button>';
				accommoHtml += '</div>';

				accommoHtml += '<table>';
				accommoHtml += '	<caption>'+items.roomTitle+' 객실에 대한 내용이며, 객실크기, 숙박인원, 요금(비수기주중, 비수기주말, 성수기주중, 성수기주말, 일반 주중, 일반 주말), 부대시설 등으로 분류되어 정보를 제공함</caption>';
				accommoHtml += '	<colgroup>';
				accommoHtml += '		<col style="width:110px">';
				accommoHtml += '		<col>';
				accommoHtml += '	</colgroup>';
				accommoHtml += '	<tbody>';
				accommoHtml += '		<tr>';
				accommoHtml += '			<th>객실크기</th>';
				if (items.roomSize2 == undefined || items.roomSize2 == 'null' || items.roomSize2 == 0) {
						accommoHtml += '        <td>-</td>';
				} else {
						accommoHtml += '        <td>'+items.roomSize2+'m²</td>';
				}
				accommoHtml += '		</tr>';
				accommoHtml += '		<tr>';
				accommoHtml += '			<th>숙박인원</th>';
				if (items.roomBaseCount == undefined || items.roomBaseCount == 'null' || items.roomBaseCount == 0) {
						accommoHtml += '        <td>-</td>';
				} else {
						accommoHtml += '        <td> '+items.roomBaseCount+'명';
						if (items.roomMaxCount != undefined && items.roomMaxCount != 'null' && items.roomMaxCount != 0) {
						accommoHtml += ' (최대 '+items.roomMaxCount+'명)';
						}
						accommoHtml += '</td>';
				}
				accommoHtml += '		</tr>';
				accommoHtml += '		<tr>';
				accommoHtml += '			<th>비수기주중</th>';
				if ( items.roomOffSeasonMF1 == undefined || items.roomOffSeasonMF1 == 'null' || items.roomOffSeasonMF1 == 0 ) {
					accommoHtml += '			<td>-</td>';
				} else {
					accommoHtml += '			<td>'+numberWithCommas(items.roomOffSeasonMF1)+'원</td>';
				}

				accommoHtml += '		</tr>';
				accommoHtml += '		<tr>';
				accommoHtml += '			<th>비수기주말</th>';
				if ( items.roomOffSeasonMF2 == undefined || items.roomOffSeasonMF2 == 'null' || items.roomOffSeasonMF2 == 0 ) {
					accommoHtml += '			<td>-</td>';
				} else {
					accommoHtml += '			<td>'+numberWithCommas(items.roomOffSeasonMF2)+'원</td>';
				}

				accommoHtml += '		</tr>';
				accommoHtml += '		<tr>';
				accommoHtml += '			<th>성수기주중</th>';
				if ( items.roomPeakSeasonMF1 == undefined || items.roomPeakSeasonMF1 == 'null' || items.roomPeakSeasonMF1 == 0 ) {
					accommoHtml += '			<td>-</td>';
				} else {
					accommoHtml += '			<td>'+numberWithCommas(items.roomPeakSeasonMF1)+'원</td>';
				}

				accommoHtml += '		</tr>';
				accommoHtml += '		<tr>';
				accommoHtml += '			<th>성수기주말</th>';

				if ( items.roomPeakSeasonMF2 == undefined || items.roomPeakSeasonMF2 == 'null' || items.roomPeakSeasonMF2 == 0 ) {
					accommoHtml += '			<td>-</td>';
				} else {
					accommoHtml += '			<td>'+numberWithCommas(items.roomPeakSeasonMF2)+'원</td>';
				}

				accommoHtml += '		</tr>';
				accommoHtml += '<tr>';
				accommoHtml += '<th class="va_t">편의시설</th>';
				let budae = '';
				if ( items.roomBathFacility == 'Y' ) {
					budae += '목욕시설';
				}
				if ( items.roomBath == 'Y' ) {
					budae += ',욕조';
				}
				if ( items.roomAirConditioner == 'Y' ) {
					budae += ',에어콘';
				}
				if ( items.roomTv == 'Y' ) {
					budae += ',TV';
				}
				if ( items.roomInternet == 'Y' ) {
					budae += ',인터넷';
				}
				if ( items.roomPc == 'Y' ) {
					budae += ',PC';
				}
				if ( items.roomRefrigerator == 'Y' ) {
					budae += ',냉장고';
				}
				if ( items.roomHomTheater == 'Y' ) {
					budae += ',홈씨어터';
				}
				if ( items.roomSofa == 'Y' ) {
					budae += ',쇼파';
				}
				if ( items.roomTable == 'Y' ) {
					budae += ',테이블';
				}
				if ( items.roomToiletries == 'Y' ) {
					budae += ',세면도구';
				}
				if ( items.roomCook == 'Y' ) {
					budae += ',취사용품';
				}
				if ( items.roomCable == 'Y' ) {
					budae += ',케이블설치';
				}
				if ( items.roomHairdryer == 'Y' ) {
					budae += ',헤어드라이기';
				}

				if ( budae.substring(0,1) == ',' ) {
					budae = budae.substring(1, budae.length);
				}

				accommoHtml += '<td>'+budae+'</td>';
				accommoHtml += '		</tr>';
				accommoHtml += '	</tbody>';
				accommoHtml += '</table>';
				if (items.roomIntro != null) {
					accommoHtml += '<p class="infoTxt">'+items.roomIntro+'</p>';
				}
				accommoHtml += '</li>';
			}
		});

		$('.room_guide_list ul').html(accommoHtml);

		swiperRoomguide();

	} else {
		$('.room_guide_list').hide();
	}
	// 객실정보 끝

	// 팜플렛 시작
	if (data.body.pamphlet != undefined && data.body.pamphlet.length != 0) {
		let phtml ='';
		let pCnt = pImgCnt + uImgCnt;

		$.each(data.body.pamphlet, function (index, items) {
			let pamphletid = "pamphlet" + index;
			if (items.pview == '1') {
				phtml += '<div class="pamphletWide" id="'+pamphletid+'">';
			} else {
				phtml += '<div class="ticketGeneral" id="'+pamphletid+'">';
			}

			phtml += '	<h3';
			if (items.color != null && items.color != undefined && items.color != '') {
				phtml += ' style="color: '+items.color+';"';
			}
			phtml += '>'+items.title+'</h3>';

			phtml += '	<div class="swiper-container">';
			phtml += '	<a href="javascript:openpamphlet(\''+pamphletid+'\',1);" class="img_open">이미지 펼치기</a>';
			phtml += '	<a href="javascript:openpamphlet(\''+pamphletid+'\',2);" class="img_close">이미지 접기</a>';
			phtml += '		<ul class="swiper-wrapper">';
			phtml += '		</ul>';
			phtml += '	<div class="swiper-pagination"></div>';
			phtml += '	<div class="swiper-button-next"></div>';
			phtml += '	<div class="swiper-button-prev"></div>';
			phtml += '</div></div>';
			pCnt += items.imgCnt;
		});

		$('#addContView').html(phtml);

		$.each(data.body.pamphletImg, function (index, items) {
			phtml = '';
			let pamphletid = "#pamphlet"+items.pamidx+ " div ul";
			let imgalt = replaceAll(items.imgalt,'\"','\'');
			phtml += '<li class="swiper-slide"><span><a href="javascript:openPhotoView('+(pImgCnt+uImgCnt+index)+');"><img class="swiper-lazy" src="'+mainimgurl+items.img+'" alt="'+imgalt+'"></a></span></li>';
			$(pamphletid).append(phtml);
		});

		$.each(data.body.pamphlet, function (index, items) {
			let pamphletid = "#pamphlet" + index;
			swiperWide(pamphletid);
			ticketGeneral(pamphletid);
		});
	}
	// 팜플렛 끝

	// 태그 부분 시작
	let rTagName, rTagId
	if ( detail.tagName != null ) {
		rTagName = detail.tagName.split("|");
		rTagId = detail.tagId.split("|");
		let tagHtml = "";

		for (let i in rTagName) {
			tagHtml += '<li><a href=javascript:goTagList("'+sContentType+'","'+rTagName[i]+'","'+rTagId[i]+'")><span>'+'#'+rTagName[i]+'</span></li>';
		}

		$('.tag_cont ul').html(tagHtml);
	}
	sub_TagList();
	// 태그 부분 끝

	// 생생정보 부분 시작
	if (detail.keyword != undefined) {
		searchBlog(detail.keyword);
	}
	// 생생정보 부분 시작

	// 12월31일 기준 이벤트 종료 스티커 적용
	const eventToday = new Date();
	var start_date = new Date(2025, 8, 17, 15, 0, 0);
	var end_date = new Date(2025,11, 1);
	if (eventToday > start_date && eventToday < end_date) {
		eventDetail();
	}
}

function getContentMapList(kind) {
	if ( conLocationy == undefined || conLocationy == 'undefined' || conLocationy == 'null' ) {
		$('.link_mapsearch').hide();
	} else {
		//길찾기
		const title = encodeURI(conTitle.replace(/\//gi,"_").replace(/,/gi,"."));
		let lx = conLocationx;
		let ly = conLocationy;
		const actionUrl = "https://map.kakao.com/link/to/" + title + "," + ly+"," + lx
		$('.link_mapsearch a').attr("href", actionUrl).attr("target", "_blank");
 	}
	$('#staticMap').parents('li').remove();
	getContentAddList(kind);
}

//sns link 가져오기
function getContentAddList(kind) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_ADD_LIST_VIEW',
			cotid : cotId
		},
		success: function(data) {
			goContentAddListView(data, kind);
		},
		complete: function() {
			getContentChargeInfo(null, 1);
		}
	});
}

//sns link 보여주기.
function goContentAddListView(data, kind) {
	const result = data.body.result
	let html = ''
	if (result) {
		$.each(result, function (index, item) {
			const { linkType, linkUrl, displayTitle, backColor, textColor, imgPath } = item
			if ( linkType == '0') {
				html += `<li>`
			} else {
				html += `<li class="full_img>`
			}
			html += `<a href="${linkUrl}" title="${displayTitle}" target="_blank" style="background-color: ${backColor}">`
			if (linkType == '0') {
				html += `
						<em style="color: ${textColor}">${displayTitle}</em>
						<img src="${mainimgurl}${imgPath}" alt="">
					</a>
				`
			} else {
				html += `<img src="${mainimgurl}${imgPath}" alt="${displayTitle}">`
			}
			html += `</li>`
		});
		document.querySelector('.list_banner').innerHTML = html
	}
}

//담당자 가져오기
function getContentChargeInfo(select, kind, rem) {
	if (rem == 'Recom') {
		conAreaCode = select.body.detail.areaCode;
		conSigunguCode = select.body.detail.sigunguCode;

		if (conSigunguCode == '' || conSigunguCode == undefined || conSigunguCode == null) {
			conSigunguCode = 0;
		}
	}

	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_CHARGE_INFO_VIEW',
			contentKind : kind.toString(),
			cotid : cotId,
			otdid : '0a01eb7b-96de-11e8-8165-020027310001'
		},
		success: function(data) {
			goContentChargeInfoView(data,kind);
		},
		complete: function() {
			let isAuto = true
			if (conAreaCode == '' || conAreaCode == undefined || conAreaCode == null) {
				if (select != null) {
					const kind = select.body.detail.cos;
					if ( kind == 1 ) {
						$('.courseList').css('display', 'none');
					}
				} else {
					$('.courseList').css('display', 'none');
				}
				isAuto = false
			} else {
				if (select != null) {
					const kind = select.body.detail.cos;
					if (kind == 1) {
						isAuto = true
					} else {
						isAuto = false
					}
				} else {
					isAuto = true
				}
			}
			getContentCourseInfo(select, isAuto)
		}
	});
}

// 추천컨텐츠담당자 가져오기
function getArticleChargeInfo(select, kind, rem) {
	if (rem == 'Recom') {
		conAreaCode = select.body.detail.areaCode;
		conSigunguCode = select.body.detail.sigunguCode;
		if (conSigunguCode == '' || conSigunguCode == undefined || conSigunguCode == null) {
			conSigunguCode = 0;
		}
	}

	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'ARTICLE_CHARGE_INFO_VIEW',
			cotid : cotId
		},
		success: function(data) {
			goContentChargeInfoView(data, kind);
		},
		complete: function() {
			let isAuto = true
			if (conAreaCode == '' || conAreaCode == undefined || conAreaCode == null) {
				isAuto = false
			} else {
				if (select != null) {
					const kind = select.body.detail.cos;
					if (kind == 1) {
						isAuto = true
					} else {
						isAuto = false
					}
				} else {
					isAuto = true
				}
			}
			getContentCourseInfo(select, isAuto)
		}
	});
}

// 담당자 표시하기
function goContentChargeInfoView(data, kind) {
	const result = data.body.result
	let html = ''
	html += `
		<div class="row">
			<strong>콘텐츠 등록 및 수정 문의</strong>
		</div>
		<div class="row">
			<ul>
	`
	if (result) {
		const resultcnt = result.length;
		$.each(result, function (index, item) {
			const { DEP_NAME, DEP_TEL } = item
			if (sOtdid.indexOf('4e706603-293b-11eb-b8bd-020027310001') != -1) {
				html += `<li><span>${DEP_NAME}</span><span>${DEP_TEL}</span></li>`
			} else if ( kind == 0 && resultcnt >= 2 ) {
				if ( items.kind == 1 ) {
					html += `<li><span>${DEP_NAME}</span><span>${DEP_TEL}</span></li>`
				}
			} else {
				html += `<li><span>${DEP_NAME}</span><span>${DEP_TEL}</span></li>`
			}
		});
		html += `
				</ul>
			</div>
		`
		document.querySelector('.btm_team .inr').innerHTML = html
		btnTeam();
	}
}

//연관코스 가져오기
function getContentCourseInfo(select, isAuto) {
	flow.showRecommendCourse({
		areaCode: conAreaCode,
		sigugunCode: conSigunguCode,
		search: conAreaCode ? '' : 'ALL',
	})
	if (isAuto) {
		return getContentCourseInfoAuto(select)
	}
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_COURSE_INFO_VIEW',
			cotid : cotid
		},
		success: function(data) {

		},
		complete: function() {
			let isAuto = true
			if (conAreaCode == '' || conAreaCode == undefined || conAreaCode == null) {
				isAuto = false
			} else {
				if (select != null) {
					const kind = select.body.detail.rem;
					if ( kind == 1 ) {
						isAuto = true
					} else {
						isAuto = false
					}
				} else {
					isAuto = true
				}
			}
			getContentRecomInfo(select, isAuto)
		}
	});
}

function getContentCourseInfoAuto(select) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_COURSE_INFO_AUTO_VIEW',
			cotid : cotId,
			areacode : conAreaCode.toString(),
			sigungucode : conSigunguCode.toString(),
			LIMITmax : 1
		},
		success: function(data) {

		},
		complete: function() {
			let isAuto = true
			if (select != null) {
				const	kind = select.body.detail.rem;
				if (kind == 1) {
					isAuto = true
				} else {
					isAuto = false
				}
			} else {
				isAuto = true
			}
			getContentRecomInfo(select, isAuto)
		}
	});
}

//연관추천 가져오기
function getContentRecomInfo(select, isAuto) {
	flow.showRecommendArticle({
		cotId: cotId,
		areaCode: conAreaCode,
		sigugunCode: conSigunguCode,
		search: conAreaCode ? '' : 'ALL',
		auto: isAuto
	})
	if (isAuto) {
		return getContentRecomInfoAuto(select)
	}
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_RECOM_INFO_VIEW',
			cotid : cotId
		},
		success: function(data) {

		},
		complete: function() {
			let isAuto = true
			if (conAreaCode == '' || conAreaCode == undefined || conAreaCode == null) {
				isAuto = false
			} else {
				if (select != null) {
					const	kind = select.body.detail.fes;
					if (kind == 1) {
						isAuto = true
					} else {
						isAuto = false
					}
				} else {
					isAuto = true
				}
			}
			getContentFestivalInfo(select, isAuto)
		}
	});
}

function getContentRecomInfoAuto(select) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_RECOM_INFO_AUTO_VIEW',
			cotid : cotId,
			areacode : conAreaCode.toString(),
			sigungucode : conSigunguCode.toString()
		},
		success: function(data) {
			
		},
		complete: function() {
			let isAuto = true
			if (select != null) {
				const	kind = select.body.detail.fes;
				if (kind == 1) {
					isAuto = true
				} else {
					isAuto = false
				}
			} else {
				isAuto = true
			}
			getContentFestivalInfo(select, isAuto)
		}
	});
}

//연관축제 가져오기
function getContentFestivalInfo(select, isAuto) {
	flow.showFestival({
		cotId: cotId,
		areaCode: conAreaCode,
		sigugunCode: conSigunguCode,
		locationxNum: locationx,
		locationyNum: locationy,
		search: conAreaCode ? '' : 'ALL',
		auto: isAuto
	})
	if (isAuto) {
		return getContentFestivalInfoAuto(select)
	}
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_FESTIVAL_INFO_VIEW',
			cotid : cotId
		},
		success: function(data) {
			// goContentFestivalInfoView(data)
		},
		complete: function() {
			let isAuto = true
			if (conAreaCode == '' || conAreaCode == undefined || conAreaCode == null) {
				isAuto = false
			} else {
				if (select != null) {
					const kind = select.body.detail.ms;
					if (kind == 1) {
						isAuto = true
					} else {
						isAuto = false
					}
				} else {
					isAuto = true
				}
			}
			getContentTourInfo(isAuto)
		}
	});
}

function getContentFestivalInfoAuto(select) {
	if ( isNaN(locationx) ) {
		locationx = "0.0";
	}
	if ( isNaN(locationy) ) {
		locationy = "0.0";
	}
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_FESTIVAL_INFO_AUTO_VIEW',
			cotid : cotId,
			areacode : conAreaCode.toString(),
			sigungucode : conSigunguCode.toString(),
			locationx : locationx.toString(),
			locationy : locationy.toString()
		},
		success: function(data) {
			// goContentFestivalInfoView(data);
		},
		complete: function() {
			let isAuto = true
			if (select != null) {
				const	kind = select.body.detail.ms;
				if (kind == 1) {
					isAuto = true
				} else {
					isAuto = false
				}
			}
			getContentTourInfo(isAuto)
		}
	});
}

//연관명소 가져오기
function getContentTourInfo(isAuto) {
	flow.showRecommendSpot({
		cotId: cotId,
		areaCode: conAreaCode,
		sigugunCode: conSigunguCode,
		locationxNum: locationx,
		locationyNum: locationy,
		search: conAreaCode ? '' : 'ALL',
		auto: isAuto
	}).then(() => {
		scnt = 5;
		pcnt = 5;
		getContentFirstCommentInfo()
	})
}

//품질인증 주변숙소 가져오기
function GetAccommodation() {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_ACCOMMODATION_AUTO',
			otdid : '456a84d1-84c4-11e8-8165-020027310001',
			locationx : conLocationx.toString(),
			locationy : conLocationy.toString(),
			cotId : cotId
		},
		success: function(data) {
			if (data.body.result) {
				setAccommodation(data.body.result)
			}
		}
	});
}

//품질인증 주변숙소 표시
function setAccommodation(data) {
	const element = document.querySelector('#AccomDiv')
	let pcHtml, moHtml = ''
	$.each(data, function (index, items) {
		const { cotId, imgPath1, title, intime, outtime } = items
		let parking = '불가능'
		if (items.parking.indexOf('불가') == -1
				&& items.parking != '0'
				&& items.parking.indexOf('없음') == -1
				&& items.parking.indexOf('null') == -1) {
			parking = '가능'
		}
		pcHtml += `
			<li>
				<a href="/detail/ms_detail.do?cotid=${cotId}">
					<span class="img" style="background-image: url('${mainimgurl}${imgPath1}&mode=custom&width=300&height=200');">${title}</span>
					<div class="info">
						<strong>${title}</strong>
						<span>주차 ${parking}</span>
						<span>입/퇴실 시간 : ${intime} / ${outtime}</span>
					</div>
				</a>
			</li>
		`
		moHtml += `
			<li class="swiper-slide">
				<a href="/detail/ms_detail.do?cotid=${cotId}">
					<span class="img" style="background-image: url('${mainimgurl}${imgPath1}&mode=custom&width=300&height=200');">${title}</span>
					<div class="info">
						<strong>${title}</strong>
						<span>주차 ${parking}</span>
						<span>입/퇴실 시간 : ${intime} / ${outtime}</span>
					</div>
				</a>
			</li>
		 `
	});
	document.querySelector('#AccomDiv .pc ul').innerHTML = pcHtml
	document.querySelector('#AccomDiv .mo ul').innerHTML = moHtml
	if (element) {
		element.style.display = 'block'
	}

	var swiper = new Swiper('.living_compare .swiper-container', {
		spaceBetween: 10,
		slidesPerView: 'auto'
	});
}

function tabChange(tab, obj) {
	let height = 180;
	let addHeight = 120;
	if (mobileYn == 'Y') {
		height = 100;
		addHeight = 160;
	}
	if ($('#youtubeGo').length == 1 && tab == 'galleryGo') {
		tab = "youtubeGo";
	}

	if (!$('.detail_tab').hasClass('menuFixed')) {
		height += addHeight;
	}

	if (tab == 'youtubeGo' || tab == 'galleryGo' || tab == 'detailGo' || tab == 'replyGo') {
		$('html, body').animate({
			scrollTop: $('#'+tab).offset().top - height
		}, 500);
	} else {
		let element = $('.recommend_travel h3')
		let titleOffset = $(element).offset();
		let offset = titleOffset.top - 200;
		$("html, body").animate({scrollTop: offset},400);
	}

	if (tab == 'youtubeGo' || tab == 'galleryGo') {
		$('.photo_gallery .swiper-button-next, .photo_gallery .swiper-button-prev').focus();
		$('.detail_tab ul li.on a').attr('title','사진보기 위치로 이동 선택됨')
	} else if (tab == 'detailGo') {
		$('#detailGo .btn_modify').focus();
		$('.detail_tab ul li.on a').attr('title','상세정보 위치로 이동 선택됨')
	} else if (tab == 'replyGo') {
		$('#replyGo #tform #comment').focus();
		$('.detail_tab ul li.on a').attr('title','여행톡 위치로 이동 선택됨')
	} else if (tab == 'relationGo') {
		$('.recommend_travel .list ul li:first-child .img a').focus();
		$('.detail_tab ul li.on a').attr('title','추천여행 위치로 이동 선택됨')
	}
}

// 전역 스코프에 이벤트 핸들러 함수를 담아둘 변수
let popupKeyEventHandler = null;

function openPhotoView(idx) {
	// 혹시 이전에 등록된 이벤트 핸들러가 있다면 제거
	if (popupKeyEventHandler) {
		document.removeEventListener('keydown', popupKeyEventHandler);
		popupKeyEventHandler = null;
	}

	// (1) 팝업 열기/슬라이드 생성 로직
	setActiveThumb(idx);
	if ($.trim($('#galleryTop').html()) == '') {
		$('#galleryTop').html(galleryTopHtml);
	}
	if ($.trim($('#galleryThumbs').html()) == '') {
		$('#galleryThumbs').html(galleryThumbsHtml);
	}
	if ($('#img' + (idx - 1)).attr('src') == '/resources/images/common/nonbg.png') {
		$('#img' + (idx - 1)).attr('src', $('#img' + (idx - 1)).attr('delayedsrc'));
	}
	if ($('#img' + idx).attr('src') == '/resources/images/common/nonbg.png') {
		$('#img' + idx).attr('src', $('#img' + idx).attr('delayedsrc'));
	}
	if ($('#img' + (idx + 1)).attr('src') == '/resources/images/common/nonbg.png') {
		$('#img' + (idx + 1)).attr('src', $('#img' + (idx + 1)).attr('delayedsrc'));
	}
	if (mobileYn == 'Y') {
		$("meta[name=viewport]").attr("content", "width-device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=yes");
	}
	layerPopup.layerShow('detailPop');
	$('body').css('overflow', 'hidden');
	$('#detailPop').removeClass('view');
	$('#detailPop').addClass('active');

	let galleryThumbs = new Swiper('#detailPop .gallery-thumbs', {
		centeredSlides: true,
		slideToClickedSlide: true,
		spaceBetween: 0,
		slidesPerView: "auto",
		observer: true,
		observeParents: true,
		watchSlidesProgress: true,
		watchSlidesVisibility: true,
		on: {
			click: function () {
				galleryThumbs.slideTo(this.clickedIndex);
			}
		}
	});

	let galleryTop = new Swiper('#detailPop .gallery-top', {
		spaceBetween: 0,
		slidesPerView: 'auto',
		observer: true,
		observeParents: true,
		navigation: {
			nextEl: '#detailPop .swiper-button-next',
			prevEl: '#detailPop .swiper-button-prev',
		},
		pagination: {
			el: '#detailPop .swiper-pagination',
			type: 'fraction',
		},
		thumbs: {
			swiper: galleryThumbs
		},
		scrollbar: {
			el: "#detailPop .swiper-scrollbar",
			hide: true,
		},
		on: {
			slideChange: function () {
				var idx = this.realIndex;
				if ($('#img' + (idx - 1)).attr('src') == '/resources/images/common/nonbg.png') {
					$('#img' + (idx - 1)).attr('src', $('#img' + (idx - 1)).attr('delayedsrc'));
				}
				if ($('#img' + idx).attr('src') == '/resources/images/common/nonbg.png') {
					$('#img' + idx).attr('src', $('#img' + idx).attr('delayedsrc'));
				}
				if ($('#img' + (idx + 1)).attr('src') == '/resources/images/common/nonbg.png') {
					$('#img' + (idx + 1)).attr('src', $('#img' + (idx + 1)).attr('delayedsrc'));
				}
				galleryThumbs.slideTo(idx);
				setActiveThumb(idx);
			}
		}
	});

	// 특정 위치로 이동
	galleryTop.slideTo(idx, 0);
	galleryThumbs.slideTo(idx, 0);

	// (2) 새로 등록할 keydown 핸들러 정의
	popupKeyEventHandler = function (ev) {
		// Enter 키
		if (ev.key === 'Enter') {
			let $activeEl = $(document.activeElement);
			if ($activeEl.is('#detailPop .thumbsWrap .gallery-thumbs .swiper-slide a')) {
				let currentIndex = $activeEl.data('index');
				galleryTop.slideTo(currentIndex);
				galleryThumbs.slideTo(currentIndex);
			}
		}

		// Tab 키
		if (ev.key === 'Tab') {
			let $activeEl = $(document.activeElement);
			if ($activeEl.is('#detailPop .thumbsWrap .gallery-thumbs .swiper-slide a')) {
				ev.preventDefault();

				let currentIndex = $activeEl.data('index');
				let $slides = $('#detailPop .thumbsWrap .gallery-thumbs .swiper-slide a');
				let nextIndex = ev.shiftKey ? currentIndex - 1 : currentIndex + 1;

				if (nextIndex < 0) {
					$('#detailPop .layerpop .db_detail .topWrap .swiper-button-next').focus();
					return;
				} else if (nextIndex >= $slides.length) {
					$('#detailPop .layerpop .btn_close3').focus();
					return;
				}

				$slides.eq(nextIndex).focus();
				galleryThumbs.slideTo(nextIndex);
			}
		}

		// Shift+Tab 감지: Tab 키이면서 shiftKey = true
		if (ev.key === 'Tab' && ev.shiftKey) {
			var $activeEl = $(document.activeElement);

			// 현재 포커스가 닫기 버튼(#detailPop .layerpop .btn_close3)인지 확인
			if ($activeEl.is('#detailPop .layerpop .btn_close3')) {
				// 브라우저 기본 Shift+Tab 동작 막기
				ev.preventDefault();

				// galleryThumbs 내부 슬라이드 링크들 가져오기
				let $slides = $('#detailPop .thumbsWrap .gallery-thumbs .swiper-slide a');
				let lastIndex = $slides.length - 1; // 마지막 슬라이드 인덱스

				// 마지막 슬라이드 포커스 & 스와이퍼 이동
				$slides.eq(lastIndex).focus();
				galleryThumbs.slideTo(lastIndex);
			}
		}
	};

	// (3) 새로운 keydown 핸들러 등록
	document.addEventListener('keydown', popupKeyEventHandler);

	// (4) 0이 아닌 다른 index를 가져왔을 때 에러가 첫번째 요소로 잘 슬라이드 되도록 추가
	$(document).on('focusin', '#detailPop .thumbsWrap .gallery-thumbs .swiper-slide a', function() {
		let currentIndex = $(this).data('index');
		galleryThumbs.slideTo(currentIndex);
	});

	$(document).on('focusin', '#detailPop .topWrap .gallery-top .swiper-slide .btn_report', function() {
		let $slide = $(this).closest('.swiper-slide');
		let idx = $slide.index();
		galleryTop.slideTo(idx);
		galleryThumbs.slideTo(idx);
	});
}

$('.gallery-thumbs .swiper-slide a').each(function(index) {
	$(this).attr('tabindex', '0').on('keydown click', function(event) {
		if (event.key === 'Enter' || event.type === 'click') {
			galleryTop.slideTo(index);
			setActiveThumb(index);
		}
	});
});

function setActiveThumb(index) {
	$('.gallery-thumbs .swiper-slide a').removeClass('on');
	$('.gallery-thumbs .swiper-slide').eq(index).find('a').addClass('on');
}

function imgupload() {
	userImgYn = 'Y';
	if ( loginYn == 'N') {
		layerPopup.layerShow('popMemberLogin');
	} else {
		layerPopup.layerShow('userPicReg');
	}
}

$('.map_skip').focusin(function() {
	$(this).find('a').css('display', 'inline-block');
	$(this).find('a').focus();
	$(this).attr('tabindex','');
});

function fileUpload(obj,idx) {
	let check = 0;
	let filename;
	if (window.FileReader) {
		filename = $(obj)[0].files[0].name;
	} else {
		filename = $(obj).val().split('/').pop().split('\\').pop();
	}

	let _fileLen = filename.length;
	let _lastDot = filename.lastIndexOf('.');
	let maxSize  = 10 * 1024 * 1024	//20MB

	// 확장자 명만 추출한 후 소문자로 변경
	var thumbext = filename.substring(_lastDot + 1, _fileLen).toLowerCase();

	if ( !(thumbext == "jpg" || thumbext == "png" || thumbext == "jpeg" ) ) { 	//확장자를 확인합니다.
		alert('등록할수 없는 파일입니다.');
		check ++;
		return;
	}

	if (obj.files[0].size > maxSize) {
		alert("첨부파일 사이즈는 10MB 이내로 등록 가능합니다.");
		check ++;
		return;
	}

	let _URL = window.URL || window.webkitURL;

	let img = new Image();
	img.src = _URL.createObjectURL(obj.files[0]);
	img.onload = function() {
		if (img.width <700) {
			check ++;
			alert("700px 이상의 이미지만 등록 가능합니다.")
			let html = '<span class="fileBtn"><input type="file" id="fileUp02" onchange="fileUpload(this)"/>';
			html += '<label for="fileUp02"  class="btn_file">파일찾기</label></span>'
			$('.file').html(html);
			return;
		}
	}

	let reader = new FileReader();
	let html ='<img class="img" id="fileimgview">';
	$('.file').append(html);

	reader.onload = function (e) {
		$('#fileimgview').attr('src', e.target.result);
	}

	reader.readAsDataURL(obj.files[0]);
	imguploadcheck = 1;
}

$(document).on('keydown', '#fileUp02', function(e) {
	if (e.keyCode == 13) {
		e.preventDefault();
		$(this).trigger("click");
	}
});

function userImgSave() {
	let agreecheck = $("input:checkbox[id='chk']").is(":checked")
	if (agreecheck == false) {
		alert("저작권 약관동의를 확인해주세요.");
		return;
	}

	if (imguploadcheck != 1) {
		alert("이미지를 업로드 해주세요.");
		return;
	}

	if ( appYn == 'Y' && getDevice() == 'Android') {
		filesave3();
		return;
	}

	let formElement = $('#form')[0];
	let data = new FormData(formElement);
	data.append("files", formElement[0].files[0]);

	jQuery.ajax({
		url: mainUploadUrl+'?isUserUpload=true',
		type: 'POST',
		enctype: 'multipart/form-data',
		cache : false,
		contentType: false,
		processData: false,
		data:data,
		success: function (data) {
			filesave2(data);
		}
	});
}

function filesave2(data) {
	let obj = JSON.parse(data);
	filename = obj.body.result[0].fileName;
	filesavename = obj.body.result[0].saveName;
	let dot = filesavename.indexOf(".");
	filesavename = filesavename.substr(0,dot);

	fullPath = obj.body.result[0].fullPath;
	fullPath = fullPath.replace('/data/images','');

	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'USER_IMG_UPLOAD',
			filename : filename,
			filesavename : filesavename,
			fullPath : fullPath,
			cotid : cotId,
			contentType : sContentType,
			areaCode : conAreaCode,
			sigungucode : conSigunguCode,
		},
		success: function(data) {
			if (data.header.process == 'fail') {
				alert('새로고침 후 다시 시도해주세요');
			} else {
				alert("이미지 등록에 성공하였습니다.")

				loginPositiveActionUserReviewApp();

				try {
					spaCallback('contentPhotoAdd');
				} catch (e) {}

				location.reload();
			}
		}
	});
}

function filesave3() {
	if (AppFileName == null || AppsaveName == null || AppfullPath == null) {
		alert("파일을 업로드 해주세요.");
		return;
	}

	filename = AppFileName;
	filesavename = AppsaveName;
	fullPath = AppfullPath.replace('/data/images', '');

	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'USER_IMG_UPLOAD',
			filename : filename,
			filesavename : filesavename,
			fullPath : fullPath,
			cotid : cotId,
			contentType : sContentType
		},
		success: function(data) {
			if (data.header.process == 'fail') {
				alert('새로고침 후 다시 시도해주세요');
			} else {
				alert("이미지 등록에 성공하였습니다.")
				loginPositiveActionUserReviewApp();
				location.reload();
			}
		}
	});
}

function returnPhotoImg(Flag, fileName, saveName, fullPath) {
	switch (img) {
		case 1:
			if ( Flag == true || Flag == "true" ) {
				let dot = saveName.indexOf(".");
				saveName = saveName.substr(0,dot);

				fullPath = fullPath.replace('/data/images','');

				let strHtml = '';
				strHtml += '<img class="img" id="fileimgview">';

				$('.file').append(strHtml);

				let fileName2 = fileName.substring(fileName.length-4,fileName.length)
				$('#fileimgview').attr('src',mainfileurlpath + saveName + fileName2);

				imguploadcheck = 1;

				AppFileName = fileName;
				AppsaveName = saveName;
				AppfullPath = fullPath;
			} else {
				alert('파일저장에 실패하였습니다.');
			}
			break;
		case 2:
			if ( Flag == true || Flag == "true" ) {
				let dot = saveName.indexOf(".");
				saveName = saveName.substr(0,dot);

				fullPath = fullPath.replace('/data/images','');

				let strHtml = '';
				let fileName2 = fileName.substring(fileName.length-4,fileName.length)

				if (p_obj == undefined || p_obj == '') {
					strHtml += '<div class="fileLayer" id="commentfile">';
				} else {
					strHtml += '<li class="file">';
					strHtml += '<div class="fileLayer">';
				}
				strHtml += '	<p>이미지 첨부는 최대 1개까지 가능합니다.</p>';
				strHtml += '	<span class="img">';
				strHtml += '		<img src="'+mainfileurlpath + saveName + fileName2+'" alt="">';
				strHtml += '		<button type="button" onclick="$(this).closest(\'.fileLayer\').remove();">삭제</button>';
				strHtml += '	</span>';
				strHtml += '</div>';

				if (p_obj == undefined || p_obj == '') {
					$('.replyWrap').find('#commentfile').remove();
					$('.replyWrap .write').next().prepend(strHtml);
				} else {
					strHtml += '</li>';
					$('#' + p_obj + ' .replyBox').find('.file').remove();
					$('#' + p_obj + ' .replyBox').find('ul').append(strHtml);
				}

				AppsaveName = saveName;
				AppfullPath = fullPath;

				p_obj = '';
			} else {
				alert('파일저장에 실패하였습니다.');
			}
			break;
		case 3:
			if ( Flag == true || Flag == "true" ) {
				let dot = saveName.indexOf(".");
				saveName = saveName.substr(0,dot);

				fullPath = fullPath.replace('/data/images','');

				let strHtml = '';
				let fileName2 = fileName.substring(fileName.length-4,fileName.length)

				if (p_obj == undefined || p_obj == '') {
					strHtml += '<div class="fileLayer" id="commentfile">';
				} else {
					strHtml += '<li class="file">';
					strHtml += '<div class="fileLayer">';
				}
				strHtml += '	<p>이미지 첨부는 최대 1개까지 가능합니다.</p>';
				strHtml += '	<span class="img">';
				strHtml += '		<img src="'+mainfileurlpath + saveName + fileName2+'" alt="">';
				strHtml += '		<button type="button" onclick="$(this).closest(\'.fileLayer\').remove();">삭제</button>';
				strHtml += '	</span>';
				strHtml += '</div>';

				if (p_obj == undefined || p_obj == '') {
					$('.replyWrap #commentfile').remove();
					$('.replyWrap .write').after(strHtml);
				} else {
					strHtml += '</li>';
					$('#' + p_obj + ' .replyBox').find('.file').remove();
					$('#' + p_obj + ' .replyBox').find('ul').append(strHtml);
				}

				AppsaveName = saveName;
				AppfullPath = fullPath;

				p_obj = '';
			} else {
				alert('파일저장에 실패하였습니다.');
			}
			break;
	}
}


$(document).on("click", ".btn_file", function() {
	if ( appYn == 'Y' && getDevice() == 'Android') {
		img = 1;
		location.href="photoupload:?target=PhotoImg";
	}
});

// 사용자사진 신고
function imgReport(obj) {
	if ( loginYn == 'N') {
		userImgYn = 'Y';
		layerPopup.layerShow('popMemberLogin');
		return;
	}

	let result = confirm('도용된 사진, 음란물, 여행 정보와 관련 없는 사진 등을 신고하실 수 있습니다.  해당 사진을 신고하시겠습니까?');

	let imgPath2 = $(obj).closest('.swiper-slide').find('.wrap img').attr('src');
	let imgPath = imgPath2.split('&');

	if (result) {
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd : 'USER_IMG_NOTIFY',
				imgId : imgPath[1].replace('id=', ''),
				cotId : cotId,
				type : 1
			},
			success: function(data) {
				if (data.header.process == 'success') {
					alert("사진 신고에 성공하였습니다.");
					location.reload();
				} else {
					alert('새로고침 후 다시 시도해주세요');
				}
			}
		});
	}
}

// 사용자사진 삭제
function imgDel(obj) {
	let imgPath2 = $(obj).closest('.swiper-slide').find('.wrap img').attr('src');
	let imgPath = imgPath2.split('&');

	if (confirm('사진을 정말 삭제하시겠습니까?')) {
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd : 'USER_IMG_DELETE',
				imgId : imgPath[1].replace('id=', ''),
				cotId : cotId
			},
			success: function(data) {
				if (data.header.process == 'fail') {
					alert('새로고침 후 다시 시도해주세요');
				} else {
					alert("사진 제거에 성공하였습니다.")
					location.reload();
				}
			}
		});
	}
}

// 약관보기
$('.terms_view').click(function() {
	if (!$(this).hasClass('active')) {
		$(this).addClass('active');
	} else {
		$(this).removeClass('active');
	}
});

function userImgCancel() {
	layerPopup.layerHide('userPicReg');
	let html = '<span class="fileBtn"><input type="file" id="fileUp02" onchange="fileUpload(this)"/>';
	html += '<label for="fileUp02"  class="btn_file">파일찾기</label></span>'
	$('.file').html(html);
	imguploadcheck = 0;

	AppFileName = null;
	AppsaveName = null;
	AppfullPath = null;
}

// 태그 클릭 이벤트
function goTagList(ctype, tagname, rtagid ) {
	let agent = navigator.userAgent.toLowerCase();
	if (agent.indexOf('trident') != -1) {
		tagname = encodeURIComponent(tagname);
	}
	goTagLogSave(rtagid);
	setTimeout(function () {
		if ( ctype == '15' ) {
			location.href = '/list/fes_list.do?choiceTag=' + tagname + '&choiceTagId=' + rtagid;
		} else if ( ctype == '25' ) {
			location.href = '/list/cs_list.do?choiceTag=' + tagname + '&choiceTagId=' + rtagid;
		} else {
			location.href = '/list/all_list.do?choiceTag=' + tagname + '&choiceTagId=' + rtagid;
		}
	}, 200) ;
}

function swiperWide(pamphletid) {
	if ($(pamphletid + ' .swiper-container li').length > 1) {
		$(pamphletid).addClass('js_slider');

		var swiper = new Swiper('.pamphletWide .swiper-container', {
			autoHeight: true, // 0917 추가
			pagination: {
				el: pamphletid+' .swiper-pagination',
				type: 'fraction',
				bulletElement: 'button',
				clickable: true,
				renderBullet: function (index, className) {
					return '<button type="button" class="' + className + '"><span class="blind">' + (index + 1) + '번째 슬라이드 보기</span></button>';
				}
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			lazy: {
				loadPrevNext: true,
				loadOnTransitionStart : true,
			}
		});
	}

	setTimeout(function() {
		$(pamphletid +' .swiper-pagination').addClass('off');
	}, 3000);
	$( pamphletid+ ' .swiper-container').on('mouseover', function() {
		$(pamphletid+' .swiper-pagination').addClass('on');
	});
	$( pamphletid+ ' .swiper-container').on('mouseout', function() {
		$(pamphletid+' .swiper-pagination').removeClass('on');
		$(pamphletid+' .swiper-pagination').addClass('off');
	});
}

function ticketGeneral(pamphletid) {
	if ($(pamphletid+' .swiper-container li').length > 1) {
		$(pamphletid).addClass('js_slider');

		var swiper = new Swiper('.ticketGeneral .swiper-container', {
			autoHeight: true,
			pagination: {
				el: pamphletid+' .swiper-pagination',
				type: 'fraction',
				bulletElement: 'button',
				clickable: true,
				renderBullet: function (index, className) {
					return '<button type="button" class="' + className + '"><span class="blind">' + (index + 1) + '번째 슬라이드 보기</span></button>';
				}
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			}
		});
	}

	setTimeout(function() {
		$(pamphletid+' .swiper-pagination').addClass('off');
	}, 3000);
	$(pamphletid+' .swiper-container').on('mouseover', function() {
		$(pamphletid+' .swiper-pagination').addClass('on');
	});
	$(pamphletid+' .swiper-container').on('mouseout', function() {
		$(pamphletid+' .swiper-pagination').removeClass('on');
		$(pamphletid+' .swiper-pagination').addClass('off');
	});
}

//tab fixed
var jbOffset = $('.detail_tab').offset();
var ScrollPst = 0 ,sdelta = 15;
var galleryTop = 0, detailTop = 0, replyTop = 0, relationTop = 0;

$(window).scroll( function() {
	if (resizecheck == true) {
		ArticleimageResize();
		ArticleimageResize2();
		resizecheck = false;
	}
	if (pageChk == 'rem') {
		return;
	}

	var st = $(this).scrollTop();
	if (jbOffset) {
		if ( $(document).scrollTop() > jbOffset.top ) {
			$('.detail_tab').addClass('menuFixed');
		} else {
			$('.detail_tab').removeClass('menuFixed');
		}
	}

	ScrollPst = st;

	var height = 190;
	galleryTop = $('#galleryGo').offset().top - height;
	detailTop = $('#detailGo').offset().top - height;
	replyTop = $('#replyGo').offset().top - height;
	relationTop = $('#relationGo').offset().top - height;

	if (st < detailTop) {
		if (!$('#photoTab').hasClass('on')) {
			$('.select_tab').removeClass('on');
			$('.select_tab a').removeAttr('title');
			$('#photoTab').addClass('on');
			$('#photoTab a').attr('title','선택됨');
		}
	} else if (detailTop <= st && st < replyTop) {
		if (!$('#detailTab').hasClass('on')) {
			$('.select_tab').removeClass('on');
			$('.select_tab a').removeAttr('title');
			$('#detailTab').addClass('on');
			$('#detailTab a').attr('title','선택됨');
		}
	} else if (replyTop <= st && st < relationTop) {
		if (!$('#talkTab').hasClass('on')) {
			$('.select_tab').removeClass('on');
			$('.select_tab a').removeAttr('title');
			$('#talkTab').addClass('on');
			$('#talkTab a').attr('title','선택됨');
		}
	} else {
		if (!$('#recomTab').hasClass('on')) {
			$('.select_tab').removeClass('on');
			$('.select_tab a').removeAttr('title');
			$('#recomTab').addClass('on');
			$('#recomTab a').attr('title','선택됨');
		}
	}
});

function marqueesetting(data) {
	$.fn.textWidth = function() {
	 	var calc = '<span style="display:none">' + $(this).text() + '</span>';
	 	$('body').append(calc);
	 	var width = $('body').find('span:last').width();
	 	$('body').find('span:last').remove();
		return width;
	};

	$.fn.marquee = function(args) {
		var that = $(this);
		var textWidth = that.textWidth(),
			offset = that.width(),
			width = offset,
			css = {
				'text-indent' : that.css('text-indent'),
				'overflow' : that.css('overflow'),
				'white-space' : that.css('white-space')
			},
			marqueeCss = {
				'text-indent' : width,
				'overflow' : 'hidden',
				'white-space' : 'nowrap'
			},
			args = $.extend(true, { count: -1, speed: 1e1, leftToRight: false }, args),
			i = 0,
			stop = textWidth*-1,
			dfd = $.Deferred();

		function go() {
			if (!that.length) {
				return dfd.reject();
			}
			if (width == stop) {
				i++;
				if (i == args.count) {
					that.css(css);
					return dfd.resolve();
				}
				if (args.leftToRight) {
					width = textWidth*-1;
				} else {
					width = offset;
				}
			}
			that.css('text-indent', width / 2 + 'px');
			if (args.leftToRight) {
				width++;
			} else {
				width--;
			}
			setTimeout(go, args.speed);
		};
		if (args.leftToRight) {
			width = textWidth * -1;
			width++;
			stop = offset;
		} else {
			width--;
		}
		that.css(marqueeCss);
		go();
		return dfd.promise();
	};

	$('.titTypeWrap').marquee({ count: 1, speed: 6}).done(function() {
		$('.dbDetail').addClass('on');
		if (data.body.detail.catchbg =="1") {
			$(".dbDetail h3").css("background","url("+mainimgurl +data.body.detail.catchimg+")repeat-x left bottom");
		}
	});
}

function getSnsFavorites(cotId) {
	//즐겨찾기 검색
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'GET_SNS_FAVORITES',
			cotId : cotId
		},
		success: function(data) {
			snsId = data.header.sessionId;
			if (data.body.result.length != 0) {
				$('.btn_bookmark').attr('class','btn_bookmark on');
				$('.btn_bookmark').attr('title','선택됨');
				$('#map .layer .btn .bookmark').addClass('on');
				$('#mapMo .layer .btn .bookmark').addClass('on');
				contentfavo = true;
			}
		}
	});
}

//즐겨찾기
function setFavoContentDetail(kind) {
	let cotId;
	if (kind == 2) {
		cotId = selectcotId;
	} else {
		cotId = this.cotId;
	}
	setFavoContent(cotId);
}

//즐겨찾기 추가
function setFavoContent(contentid,element) {
	if ( loginYn == 'N') {
		showLogin(2);
	} else {
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd : 'FAVO_CONTENTINFO_SAVE',
				cotid : contentid
			},
			success: function(data) {
				if ( data.header.process == 'success' ) {
					if (contentid == cotId) {
						alert('즐겨찾기에 추가 되었습니다.');
						$('.btn_bookmark').attr('class','btn_bookmark on');
						$('.btn_bookmark').attr('title','선택됨');
						contentfavo = true;
						if (contentid == selectcotId) {
							$('#map .layer .btn .bookmark').addClass('on');
							$('#mapMo .layer .btn .bookmark').addClass('on');
						}
						loginPositiveActionUserReviewApp();
					} else {
						$('#map .layer .btn .bookmark').addClass('on');
						$('#mapMo .layer .btn .bookmark').addClass('on');
						let detail = getContentdata(cotId);
						if (detail) {
							detail.useFavo = 1;
						}
					}
				} else if ( data.header.rsFlag == 0 ) {
					goFavoContentDelete(contentid);
				}
				$('.btn_titview').removeClass('on');
				$('.dimmed2').remove();
			}
		});
	}
}

//즐겨찾기 삭제
function goFavoContentDelete(contentid) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'FAVO_CONTENTINFO_DELETE',
			cotid : contentid
		},
		success: function(data) {
			alert('즐겨찾기가 취소되었습니다.');
			$('.btn_bookmark').removeClass('on');
			$('.btn_bookmark').attr('title','');
			contentfavo = false;
			if (selectcotId) {
				if (contentid == selectcotId) {
					$('#map .layer .btn .bookmark').removeClass('on');
					$('#mapMo .layer .btn .bookmark').removeClass('on');
					let detail = getContentdata(cotId);
					if (detail) {
						detail.useFavo = 0;
					}
				}
			}
		}
	});
}

function MycourseAddContent(kind) {
	let cotId;
	if (kind == 2) {
		cotId = selectcotId;
	} else {
		cotId = this.cotId;
	}

	let detail;
	if (locationdata.viewdata && locationdata.viewdata.length > 0) {
		detail = getContentdata(cotId);
	} else {
		detail = originDetail;
	}
	myCourseList('C', detail.contentType, cotId, '');
}

function GetOTALinkList() {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'GET_OTA_LINK_LIST',
			cotId : cotId
		},
		success: function(data) {
			if (data.header.process == 'success') {
				SetOTALinkList(data);
			}
		}
	});
}

function SetOTALinkList(data) {
	if (data.body.result.length != 0) {
		$('.reserve_list .top').empty();
		$('.reserve_list .btm').empty();
		$('.reserve_quick').css('display','block');
		$('.main_quick').hide();
		$('.reserve_quick button').click(function() {
			$('.reserve_quick').addClass('none');
		});
	}

	$.each(data.body.result, function (index, items) {
		let logoImage = '';
		if (items.linktype < 3) {
			logoImage = 'reserve_logo'+items.linktype+'.gif';
		} else {
			logoImage = 'site_logo'+(items.linktype-2)+'.gif';
		}

		if (items.linktype < 100) {
			$('.reserve_list .top').append('<li><a href="javascript:GoRvLink(\''+items.linkinfo+'\');"><span><img src="../resources/images/sub/'+logoImage+'" alt="" ></span><em>'+items.linkname+' 예약하기</em></a></li>');
		} else if (items.linktype == 101) {
			$('.reserve_list .btm').append('<li class="icon2"><span class="pc">'+items.linkinfo+'</span><span class="mo"><a href="tel:'+items.linkinfo+'">'+items.linkinfo+'</a></span></li>');
		} else {
			$('.reserve_list .btm').append('<li class="icon1"><a href="javascript:GoRvLink(\''+items.linkinfo+'\');">'+items.linkname+'</a></li>');
		}
	});

	if ($('.reserve_list .top li').length == 0) {
		$('.reserve_list .top').remove();

		Rvpopupresize(1);

		$(window).resize(function() {
			Rvpopupresize(1);
		});
	}

	if ($('.reserve_list .btm li').length == 0) {
		$('.reserve_list .btm').remove();
	} else if ($('.reserve_list .btm li').length == 1) {
		Rvpopupresize(2);
		$(window).resize(function() {
			Rvpopupresize(2);
		});
	}
}

function Rvpopupresize(kind) {
	var windowW = $(window).width();

	/* mobile */
	if (windowW < 1023) {
		if (kind == 1) {
			$('.reserve_list .btm').css('padding-top','13px');
		} else {
			$('.reserve_list .btm li').css('margin-left','57px');
		}
	}
	/* pc */
	if (windowW > 1023) {
		if (kind == 1) {
			$('.reserve_list .btm').css('padding-top','30px');
		} else {
			$('.reserve_list .btm li').css('margin-left','100px');
		}
	}
}

function GoRvLink(link) {
	location.href = '/other/link_check.do?checkurl=' + link;
}

function searchBlog(keyword) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data : {
			cmd : 'GET_SEARCH_BLOG',
			keyword : keyword
		},
 		success: function(data) {
 			if (data.header.process == 'success') {
 				SetRealReview(data);
 			}
		}
	});
}

function SetRealReview(data) {
	let strHtml = '';
	$.each(data.body.result.items, function (index, items) {
		if (index < 3) {
			strHtml += '<li>';
			strHtml += '<a href="javascript:openWindow(\''+items.link+'\');" title="새창열림">';
			strHtml += '<strong>'+items.title+'</strong>';
			strHtml += '<p>'+items.description+'</p>';
			strHtml += '</a></li>';
		}
	});

	$('.real_review ul').html(strHtml);
	$('.real_review').css('display','block');
}

function GetInstaTagSearch(title,cotId) {
	if (notContentChk(cotId) == false) {
		return;
	}

	blocklistpush();
	let Instahashtag = title.toString();
	let num = Instahashtag.indexOf('(');
	if (num == -1) {
		num = Instahashtag.indexOf('[');
	}
	if (num != -1) {
		Instahashtag = Instahashtag.substring(0,num);
	}

	$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd : 'GET_INSTA_HASH_TAG_SEARCH',
				limit : 10,
				tag : Instahashtag,
				blocklist : JSON.stringify(blocklist)
			},
			success: function(data) {
				if (data.header.process == 'success') {
					SetInstaTagSearch(data,Instahashtag);
				}
			}
	});
}

function SetInstaTagSearch(data, Instahashtag) {
	let html = ''
	let imgcheck = 0
	$.each(data.body.result, function (index, item) {
		const { permalink, media_url } = item
		if (imgcheck < 10) {
				imgcheck++;
				html += `
					<li>
						<a href="${permalink}">
							<span style="background-image:url('${media_url}');">인스타그램 사진</span>
						</a>
					</li>
				`
		}
	});
	if (imgcheck != 0) {
		document.querySelector('#kqInstaTag').style.display = 'block'
	}

	$('#kqInstaTag strong').text('#' + Instahashtag);
	document.querySelector('#kqInstaTag ul').innerHTML = html
}

function openpamphlet(id,kind) {
	var select = '#' + id + ' .swiper-container';
	if ($(select + ' li').length > 1) {
		if (kind == 1) {
			$(select).addClass('open');
			var height = $(select + ' .swiper-slide-active img').css('height');
			$('#' + id + ' .swiper-wrapper').css('height', height);
		} else {
			$(select).removeClass('open');
			if (matchMedia("screen and (min-width: 1024px)").matches) {
				$('#' + id + ' .swiper-wrapper').css('height', '302px');
			} else {
				$('#' + id + ' .swiper-wrapper').css('height', '147px');
			}
		}
	} else {
		if (kind == 1) {
			$(select).addClass('open');
			var height = $(select + ' .swiper-slide img').css('height');
			$('#' + id + ' .swiper-wrapper').css('height', height);
		} else {
			$(select).removeClass('open');
			if (matchMedia("screen and (min-width: 1024px)").matches) {
				$('#' + id + ' .swiper-wrapper').css('height', '302px');
			} else {
				$('#' + id + ' .swiper-wrapper').css('height', '147px');
			}
		}
	}

	if (kind === 1) {
		// '이미지 펼치기'를 눌렀다면 -> '이미지 접기'에 포커스
		$('#' + id + ' .img_close').focus();
	} else {
		// '이미지 접기'를 눌렀다면 -> '이미지 펼치기'에 포커스
		$('#' + id + ' .img_open').focus();
	}
}

function ios_go_url(Id) {
	let url = "youtube://watch?v=" + Id;
	location.href = url;

	if (getBrowser().indexOf('Opera') != -1) {
		url = "https://www.youtube.com/watch?v=" + Id;
		location.href = url;
		setTimeout( function() {
			window.location.href ="http://itunes.apple.com/kr/app/id544007664?mt=8";
		}, 1000);

	} else {
		setTimeout( function() {
			window.location.href ="http://itunes.apple.com/kr/app/id544007664?mt=8";
		}, 1000);
	}
}

function onYouTubePlayerAPIReady() {
	if (videoId == '') {
		setTimeout(function () {
			onYouTubePlayerAPIReady();
		}, 1000) ;
		return;
	}
	mainPlayer = new YT.Player('youtube', {
		width: '100%',
		videoId: videoId, // 유튜브 비디오 아이디
		playerVars: {
			rel: 0,
			playsinline: 1,
		}
	});

	if ($('.iosLayer').length > 0) {
		$('.iosLayer').css('height', $('#youtube').outerHeight() + 'px');
	}
}

$('.map_skip a').click(function () {
	var mapSkip = $(this).parent('.map_skip');
	if (!mapSkip.hasClass('on')) {
		mapSkip.addClass('on');
		jumpkakaomap();
	} else {
		mapSkip.removeClass('on');
		$('.db_cont_detail .surroundingsMap .wrap_map .btn_map').attr('tabindex', '0');
		$('.db_cont_detail .surroundingsMap .map_open').attr('tabindex', '0');
	}
});

function closeIosLayer() {
	$('.iosLayer').remove();
}

var presentIdx = 0;
$('#detailPop .thumbsWrap .swiper-container a').each(function(i) {
	var prev = $('.topWrap .swiper-button-prev');
	var next = $('.topWrap .swiper-button-next');

	$(this).focus(function() {
		if (presentIdx < i) {
			next.trigger('click');
			presentIdx++;
		} else if (presentIdx > i) {
			prev.trigger('click');
			presentIdx--;
		}
	});
});

function jumpkakaomap() {
	$('#map').find('*').attr('tabindex', '-1');
	$('#map svg').remove();
}

function replaceAll(str, searchStr, replaceStr) {
	return str.split(searchStr).join(replaceStr);
}

function otherDepartmentContentCheck() {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd: 'OTHER_CONTENT_CHECK',
			cotId: sContentId
		},
		success: function (data) {
			if (data.header.process == 'success') {
				if (data.body.otdIds) {
					let contentcheck = false;
					$.each(data.body.otdIds, function (index, items) {
						if (items.otdId == '456a84d1-84c4-11e8-8165-020027310001') {
							contentcheck = true;
						}

						if (items.otdId == '4e706603-293b-11eb-b8bd-020027310001') {
							$('.safely_index_graph').css('display','none');
						}
						if (sOtdid == '') {
							sOtdid += items.otdId;
						} else {
							sOtdid += ','+items.otdId;
						}
					});

					if (contentcheck == false) {
						if ($('#stamp').css('display') == 'block') {
							$('#chattingbanner').css('display', 'none');
						}
					}
				}
			}
		}
	});
}

	function TrssMissionCheck() {
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd: 'GET_MISSION_ATTEMPT_INFO'
			},
			success: function (data) {
				if (data.header.process == 'success') {
					if (data.body.missioninfo?.belong === "T" && data.body.missioninfo.type_cd == 0) {
						setMissionBanner(data);
						$('#comment').attr('placeholder', `"${trssCommentTitle}"의 방문 후기 또는 기대평을 10자 이상 남겨주세요.`);
					}
				}
			}
		});
	}

	function setMissionBanner(data) {
		let title = conTitle;
		$('.travel_talk').addClass('subscribe');
		let b = location.href.indexOf('/detail/ms_detail.do') != -1 || location.href.indexOf('/detail/fes_detail.do') != -1;
		let $replyWrap = $('.travel_talk h3');
		setTimeout(() =>
			$replyWrap.after('<p class="mission_guide"><strong>3건 이상</strong>의 콘텐츠에 댓글을 남기면 이달의 가볼래-터 미션 성공!</p>')
		);

	if ($.cookie('trss_mission_banner') === 'Y') {
		return;
	}

	const item = data.body.missioninfo;
	let html = '';
	if (item) {
		if (item.type_cd == 0) {
			tnmid = item.tnmId;
			html += '<div id="missionPop" class="wrap_layerpop">';
			html += '<div class="layerpop">';
			html += '<div class="box_cont">';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_bg.png" class="pc" alt="가볼래-터 구독자 EVENT 최애 여행지 찾아, 후기 남기고 여행 복권 긁자!">';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_mbg.png" class="mo" alt="가볼래-터 구독자 EVENT 최애 여행지 찾아, 후기 남기고 여행 복권 긁자!">';
			html += '<div class="cont">';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_img1.png" class="pc" alt="">';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_mimg1.png" class="mo" alt="">';
			html += '<span class="date">' + conDateFormat(item.startdate,'yyyy.MM.dd','.') + ' ~ ' + conDateFormat(item.enddate,'yyyy.MM.dd','.') + '</span>';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_img2.png?v=20210723001" class="pc" alt="">';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_mimg2.png" class="mo" alt="">';
			html += '<p class="db_txt">';

			if (title.length > 12) {
				title = title.substring(0, 12) + '..';
			}
			$('.subscription_txt').remove();
			if (b) {
				html += '<strong>“' + quotReplace(title) + '”</strong> 에 대한 방문 상세 후기를 댓글로 남겨주세요!';
			} else {
				html += '<strong>“' + quotReplace(title) + '”</strong> 코스에 포함된 여행지의 방문 상세 후기를 댓글로 남겨주세요!';
			}
			html += '</p>';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_img2_1.png" class="pc" alt="">';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_mimg2_1.png" class="mo" alt="">';
			html += '<div class="form">';
			html += '<input type="text" id="bannersearch">';
			html += '<a href="javascript:;">검색</a>';
			html += '</div>';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_img3.png" usemap="#imgMap1" class="pc" alt="혜택안내-미션 승인이 완료되면 , 다음 달 레터 속에 다양한 선물이 담긴 ★여행 복권★을 넣어드려요!">';
			html += '<map name="imgMap1" class="pc">';
			html += '<area shape="" coords="101,124,444,181" href="javascript:tabChange(\'replyGo\'); layerPopup.layerHide(\'missionPop\');" alt="해당 페이지에 댓글 달기">';
			html += '</map>';
			html += '<img src="../resources/images/travelsubscribe/pop_mission_mimg3.png?v=20210723001" usemap="#imgMap2" class="mo" alt="혜택안내-미션 승인이 완료되면 , 다음 달 레터 속에 다양한 선물이 담긴 ★여행 복권★을 넣어드려요!">';
			html += '<map name="imgMap2" class="mo">';
			html += '<area shape="" coords="94,169,531,234" href="javascript:tabChange(\'replyGo\'); layerPopup.layerHide(\'missionPop\');" alt="해당 페이지에 댓글 달기">';
			html += '</map>';
			html += '</div>';
			html += '<div class="close">';
			html += '<button type="button" onclick="disablemissionbanner(true);">오늘 하루 그만 보기</button>';
			html += '<button type="button" onclick="layerPopup.layerHide(\'missionPop\');">닫기</button>';
			html += '</div>';
			html += '</div>';
			html += '</div>';
			html += '</div>';
			html += '</div>';
			$('#contents').append(html);
			setTimeout(function () {
				let bhtml = '';
				bhtml += ' <div class="subscription_quick" style="display: none;">';
				bhtml += '			<div class="inr">';
				bhtml += '				<a href="javascript:OpenMissionPop();" class="btn_go" style="overflow: initial">';
				bhtml += '					<span onclick="disableMissionbannerLink(event)" style="position:absolute;left:30px;bottom:48px;right:110px;height:41px;"></span>';
				bhtml += '					<span onclick="hideMissionbanner(event)" style="position:absolute;left:189px;bottom:48px;right:43px;height:41px;"></span>';
				bhtml += '                    <span class="blind">가볼래-터 구독자 EVENT 최애 여행지 찾아 댓글쓰고 여행복권 긁자! ' + conDateFormat(item.startdate,'yyyy.MM.dd','.') + ' ~ ' + conDateFormat(item.enddate,'yyyy.MM.dd','.') + '</span>';
				bhtml += '                    <em>' + conDateFormat(item.startdate,'yyyy.MM.dd','.') + ' ~ ' + conDateFormat(item.enddate,'yyyy.MM.dd','.') + '</em>';
				bhtml += '                </a>';
				bhtml += '                <div class="close">';
				bhtml += '				  	  <button type="button" onclick="disablemissionbanner();">오늘 하루 그만 보기</button>';
				bhtml += '					  <button type="button" onclick="$(\'.subscription_quick\').remove();">닫기</button>';
				bhtml += '                </div>';
				bhtml += '			</div>';
				bhtml += '		</div>';
				$('.trss_quick').append(bhtml);
			}, 800);

			$(document).on("click", "#missionPop .form a", function () {
				goSearchList($('#bannersearch').val());
			});
		} else if (item.type_cd == 1) {
			SetFoodBanner(1);
		}
	}
}

const hideMissionbanner = (e) => {
	e.preventDefault();
	$('.subscription_quick').remove();
}

const disableMissionbannerLink = (e) => {
	e.preventDefault();
	disablemissionbanner();
}

function disablemissionbanner(popupcheck) {
	if (popupcheck) {
		layerPopup.layerHide('missionPop');
	}

	$('.subscription_quick').remove();
	$.cookie('trss_mission_banner', 'Y', {expires: 1, path:'/'});
}

function SetFoodBanner(type) {
	let html = '';
	html += '<div class="event_quick several">';
	html += '	<div class="inner">';
	html += '		<div class="wrap">';
	if (type == 1) {
		html += '			<div class="inr restaurant01" style="display : none;">';
	} else {
		html += '			<div class="inr restaurant01" >';
	}
	html += '				<a href="https://korean.visitkorea.or.kr/detail/event_detail.do?cotid=d80c2c04-6e0c-4b9f-be9c-f08be21a120a">event - 우리 동네 맛집 제보 하기</a>';
	html += '				<button type="button" onclick="$(\'.event_quick\').remove();">닫기</button>';
	html += '			</div>';
	if (type == 2) {
		html += '			<div class="inr restaurant02" style="display : none;">';
	} else {
		html += '			<div class="inr restaurant02" style="display : none;">';
	}
	html += '				<a href="https://korean.visitkorea.or.kr/detail/event_detail.do?cotid=d80c2c04-6e0c-4b9f-be9c-f08be21a120a">여행구독 미션 event - 추천 맛집 제보하고 여행복권 긁자!</a>';
	html += '				<button type="button" onclick="$(\'.event_quick\').remove();">닫기</button>';
	html += '			</div>';
	html += '		</div>';
	html += '	</div>';
	html += '</div>';
	$('#footer').append(html);
}

function baloonUp() {
	if (recommonoffcheck) {
		$('.recommend_travel_wrap .titWrap').css('bottom', '0px');
		return;
	}

	$('.recommend_travel_wrap .titWrap').animate({
		'bottom': 10
	}, 1000, null, baloonDown);
}

function baloonDown() {
	if (recommonoffcheck) {
		$('.recommend_travel_wrap .titWrap').css('bottom', '0px');
		return;
	}

	$('.recommend_travel_wrap .titWrap').animate({
		'bottom': 0
	}, 700, null, baloonUp);
}

function Setsafetyprogrss() {
	let doms = '';
	let $m = $('.progress');
	let $data = $m.find('span');
	let data = $m.data('percent');
	let com = Math.round(data / 100 * 360);
	let dur = 2000;

	var getVendorPrefix = function() {
		var body = document.body || document.documentElement,
			style = body.style,
			transition = "Transition",
			vendor = ["Moz", "Webkit", "ms"],
			lastGage,
			i = 0;
		while (i < vendor.length) {
			if (typeof style[vendor[i] + transition] === "string") {
				return vendor[i];
			}
			i++;
		}
		return false;
	};
	const prefix = getVendorPrefix();
	const transform = prefix + 'Transform';

	for (let i = 0; i <= com; i++) {
		doms = '<div class="gage-bar"></div>';
		$m.append(doms);
		$('.gage-bar:last').css(transform, 'rotate(' + i + 'deg)');
	}

	$m.find('div').each(function(index, item) {
		$(item).stop().delay(index * 5).fadeIn(50);
	});

	for (let j = 0; j <= data; j++) {
		(function(index) {
			const time = (360 / 100 * index) * 5;
			setTimeout(function() {
				$data.text( index + '%');
			}, time);
		})(j);
	}

	hideLoding();
}

let isTracedEvent = false
let recommonoffcheck = false;
$(document).on('click', '.recommend_travel .tit', function() {
	let par = $(this).parents('.recommend_travel');
	if (!par.hasClass('on')) {
		par.addClass('on');
		recommonoffcheck = true;
		curationswiper.update();
		$('.recommend_travel .tit span').text('닫기');
		if (!isTracedEvent) {
			___traceDetailCurationSlide(".recommend_travel .swiper-container", null)
			isTracedEvent = true
		}
		$('.recommend_travel_wrap .titWrap').css('bottom','0px');
	} else {
		par.removeClass('on');
		$('.recommend_travel .tit span').text('열기');
		recommonoffcheck = false;
		baloonUp();
	}
});

$(document).on('click', '.congestion .btn button', function() {
	if ($(this).hasClass('on')) {
	} else {
		$('.congestion .btn button').removeClass('on');
		$(this).addClass('on');
	}
});
$(document).on('click', '.recommend_travel #close_travel_wrap', function() {
	$('.recommend_travel').css('display', 'none');

	let html = '';

	if ($('#stamp').css('display') != 'none') {
		html = '<div id="stamp" class="stampQuick scroll">'+stamphtml+'</div>';
	} else {
		html = '<div id="stamp" class="stampQuick scroll" style="display: none;">'+stamphtml+'</div>';
	}

	$('.area_notice .btn_topWrap').before(html);
});

//연관 여행상품 보기 버튼 노출/비노출 &여행홍보관 상세페이지 이동
function tgprDbCheck() {
	$.ajax({
		url : mainurl + '/call',
		dataType : 'json',
		type : "POST",
		data : {
			cmd : 'MOVE_TGPR_DETIAL',
			cotId : cotId
		},
		success : function(data) {
			tgprDetailPage(data)
		}
	});
}

function tgprDetailPage(data) {
	if (data.body.goods && data.body.goods.gdsId) {
		$('.association_btn').css('display', '');
		const link = '/list/travelinfo.do?service=tgpr&gdsId=' + data.body.goods.gdsId;

		if (smallerThanTablet()) {
			$('.association_btn').click((e) => getTgprDetailPop(data.body.goods.gdsId));
		} else {
			$('.association_btn').click((e) => window.open(link));
		}
	}
}

const getTgprDetailPop = (gdsId) => {
    TgprinsertLog(gdsId, 4);

    $('body').css('overflow','hidden');

    $("#detailArea").text('');
    $("#detailProvider").text('');
    $("#detailTitle").text('');
    $("#detail_Info").text('');
    $("#detailPrice").text('');
    $("#reservationDate").text('');
    $("#detailTopImg").css("background-image", "");

    $("#detailInquiry").text('');
    $("#reservationBtn").attr("href", '');

    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        traditional: true,
        data: {
            cmd : 'GET_TRAVEL_100SCENE_DETAIL',
            gdsId : gdsId
        },
        success: function(data) {
            setTgprDetailPop(data);
        }
    });
}

const setTgprDetailPop = (data) => {
    html = '';
    phtml = '';

    if (data.body.result != null) {
        let wishCnt = data.body.result[0].WISH_CNT;
        var ordtmCd = data.body.result[0].ORDTM_CD;
        var startDate = data.body.result[0].PERD_BGNG_YMD;
        var endDate = data.body.result[0].PERD_END_YMD;
				let gdsId = "";
        gdsId = data.body.result[0].GDS_ID;

        $("#detailArea").text(data.body.result[0].REGN_CD_NM);
        $("#detailProvider").text(data.body.result[0].PRVD_ENTRPS_CD_NM);
        $("#detailTitle").text('');
        $("#detail_Info").text('');
        $("#detail_Info").append(data.body.result[0].INFO);
        $("#detailPrice").text(data.body.result[0].PRC_GDN_CN);
        $("#reservationDate").text(ordtmCd === 1 ? "상시" : conDateFormat(startDate,'yyyyMMdd','.') + "~" + conDateFormat(endDate,'yyyyMMdd','.'));
        $("#detailTopImg").css("background-image", "url("+mainimgurl+data.body.result[0].MAIN_IMG+")");

        $("#detailTitle").append('<em id="detailTourFx">[' + data.body.result[0].TOUR_FX_CD_NM + ']</em>' + data.body.result[0].GDS_NM);

        $("#reservationBtn").attr("href", data.body.result[0].RSVT_URL);
        $("#reservationBtn").attr('onclick', 'TgprinsertLog(\''+data.body.result[0].GDS_ID+'\', 7);');

        $("#detailInquiry").text('');
        if (data.body.result[0].INQRY_INFO) {
            $("#detailInquiry").append('상품 문의  :  ' + data.body.result[0].INQRY_INFO);
        }
        $("#detailShareDiv button.good").attr("id", "like"+data.body.result[0].GDS_ID);
        $('#detailShareDiv button.good').attr('onclick', 'setLikeDetail(\''+data.body.result[0].GDS_ID+'\', \''+data.body.result[0].REGN_CD+'\', \''+data.body.result[0].SIGNGU_CD+'\');');

        $("#wishCnt").text('');
        if ( getCookie('tgpr_'+gdsId) == 'Y' && loginYn == "N") {
            $("#wishCnt").text(wishCnt);
        } else {
            $("#wishCnt").text(data.body.result[0].WISH_CNT);
        }

        $("#shareBtn").remove();

        shtml = '';

				let info = data.body.result[0].INFO;
        info = info.replaceAll("\'","");

				let title = data.body.result[0].GDS_NM;
        title = title.replaceAll("\'","");
        shtml += '<button type="button" class="share" id="shareBtn" onclick="tgprShare(\''+title+'\',\''+info+'\',\''+data.body.result[0].MAIN_IMG+'\',\''+gdsId+'\'); shareType=\'detail\'"><span>공유</span></button>';
        $("#popShare a").attr('onclick', 'TgprinsertLog(\''+data.body.result[0].GDS_ID+'\', 6);');
        $("#detailShareDiv").append(shtml);

        if ( getCookie('tgpr_'+gdsId) == 'Y') {
            $("#detailShareDiv .good").addClass("on");
            $("#detailShareDiv .good").attr('title','선택됨');
        } else {
            $("#detailShareDiv .good").removeClass("on");
            $("#detailShareDiv .good").attr('title','');
        }

        if ($(".component_100scene01 #like"+gdsId).hasClass("on") ||
            $(".component_100scene02 #like"+gdsId).hasClass("on") ||
            $(".component_100scene03 #like"+gdsId).hasClass("on") ||
            $("#like"+data.body.result[0].GDS_ID).attr("class") == "good on") {
            $("#detailShareDiv .good").addClass("on");
            $("#detailShareDiv .good").attr('title','선택됨');
        } else {
            $("#detailShareDiv .good").removeClass("on");
            $("#detailShareDiv .good").attr('title','');
        }

        if (data.body.result[0].IMG_ID != null) {
            $.each(data.body.result, function (index, items) {
                html += '<li class="swiper-slide">';

                html += '<a href="javascript:#" onclick="openWindow(\''+items.LK_URL+'\'); TgprinsertLog(\''+data.body.result[0].GDS_ID+'\', 8); return false;" target="_blank">';
                html += '<span class="img" style="background-image: url('+mainimgurl+items.IMG_ID+');"></span>';
                html += '<strong>'+items.TTL+'</strong>';
                html += '</a>';
                html += '</li>';

            });
            if (data.body.result.length > 4) {
                phtml += '<div class="swiper-button-prev">이전</div>';
                phtml += '<div class="swiper-button-next">다음</div>';
                phtml += '<div class="swiper-pagination"></div>';
            }
            $('#principalTravelText').css('display','block');
        } else {
            $('#principalTravelText').css('display','none');
        }

        $("#principalTravelList").empty();
        $("#principalTravelList").html(html);

        $("#detailPage").empty();
        $("#detailPage").html(phtml);

        var ww = $(window).width();
        function swiperAd() {
            /* pc */
            if (ww > 1023) {
                if ($('.principal_travel .swiper-container li').length > 4) {
                    $('.principal_travel').addClass('js_slider');
                    initSwiper();
                }
            }
            if (ww < 1023) {
                if ($('.principal_travel .swiper-container li').length > 3) {
                    $('.principal_travel').addClass('js_slider');
                    initSwiper();
                }
            }
        }swiperAd();

        $(window).resize(function() {
            swiperAd();
        });

        function initSwiper() {
            var swiper = new Swiper('.principal_travel .swiper-container', {
                slidesPerView: 'auto',
                spaceBetween: 0,
                observer: true,
                observeParents: true,
                slideToClickedSlide : true,
                navigation: {
                    nextEl: " .principal_travel .swiper-button-next",
                    prevEl: " .principal_travel .swiper-button-prev",
                },
                pagination: {
                    el: ".principal_travel .swiper-pagination",
                    clickable: true,
                    type: 'bullets',
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<button type="button" class="' + className + '"><span class="blind">' + (index + 1) + '번째 슬라이드 보기</span></button>';
                    }
                },
            });
        }

        layerPopup.layerShow('travel100Detail');
        $('#travel100Detail .dimmed').css('pointer-events','none');
        $("body").prepend("<input type='hidden' id='prvdEntrpsCd' value='" + data.body.result[0].PRVD_ENTRPS_CD + "'>");
    }
}

const closeTgprPop = () => {
    $('body').css('overflow', '');
    layerPopup.layerHide('travel100Detail');
}

const TgprinsertLog = (gdsId, statsDivCd) => {
    $.ajax({
        url: mainurl + '/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'TGPR_INSERT_LOG',
            cotId : 'f259d99d-b599-11ec-99d6-0242ac110005',
            gdsId : gdsId,
            statsDivCd : statsDivCd,
            ga : setGaCookie(getCookie('_ga'))
        }
    });
}

// 지도건너뛰기
$('.surroundingsMap .map_skip a').click(function () {
	var offset = $('#detailinfoview').offset();
	$('html').animate({
		scrollTop: offset.top - 180
	}, 100);
});

// 반려동물
$('.animal_info button').click(function () {
	var par = $(this).parent('.animal_info');
	if (!par.hasClass('on')) {
		par.addClass('on');
		$('.animal_info button').text('반려동물 여행정보 접기');
	} else {
		par.removeClass('on');
		$('.animal_info button').text('반려동물 여행정보 보기');
	}
});

function fetchAnimalInfo(cotId) {
	const removeElements = () => {
		const animalInfo = document.getElementsByClassName('animal_info')
		const animalInfoBox = document.getElementsByClassName('animal_info_box')
		if (animalInfo.length !== 0) {
			animalInfo[0].remove()
		}
		if (animalInfoBox.length !== 0) {
			animalInfoBox[0].remove()
		}
	}
	if (sContentType === 39) {
		removeElements()
		return
	}
	$.ajax({
		url: `${mainurl}/call`,
		method: 'POST',
		data: {
			cmd: 'FETCH_CONTENT_DETAIL_INFO',
			cotId: cotId,
			fieldType: 10
		},
		success: ({ header, body }) => {
			const { process } = header
			if (process !== 'success' || body === undefined || body.details === undefined || body.details.length === 0) {
				removeElements()
				return
			}

			if (cotId == 'b617fb58-27d0-4976-a815-04d7d3a5bcde' || cotId == '09c49506-363e-4de0-9c1a-f891116a835c' || cotId == '27a1e7f5-defb-48ac-9ecc-8dab5b1c9933' || cotId == 'bcebc8d5-b4d4-4cf8-9de6-24a107fa0a37') { // 요청으로 인한 특정 컨텐츠들 비노출 처리
				removeElements()
				return
			}

			const { details } = body
			const animalInfo = document.getElementById('animalInfo')
			const hasInfo = details
				.filter(({ DISPLAY_TITLE }) => !['비치 품목', '구매 품목', '렌탈 품목'].includes(DISPLAY_TITLE))
				.some(({ CONTENT_BODY }) => CONTENT_BODY !== undefined && CONTENT_BODY !== '' && CONTENT_BODY.trim() !== '');

			if (! hasInfo) {
					removeElements();
					return;
			}

			let htmlString = details
				.filter(({ DISPLAY_TITLE }) => !['비치 품목', '구매 품목', '렌탈 품목'].includes(DISPLAY_TITLE))
				.filter(({ CONTENT_BODY }) => CONTENT_BODY !== undefined && CONTENT_BODY !== '' && CONTENT_BODY.trim() !== '')
        .map(({ DISPLAY_TITLE, CONTENT_BODY }) => `
				<li>
					<strong>${DISPLAY_TITLE}</strong>
					<span>
						${CONTENT_BODY}
					</span>
				</li>
			`).join('')
			animalInfo.innerHTML = htmlString

			const increasePaddingAnimalInfo = () => {
				const animalInfo = document.getElementsByClassName('animal_info')
				if (animalInfo.length !== 0) {
					animalInfo[0].style.marginTop = '7px'
				}
			}
			increasePaddingAnimalInfo()
		}
	})
}

/* 사용자 의사표현 */
function getLikeFeedback(cotId) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'GET_LIKE_FEEDBACK',
			cotId : cotId
		},
		success: function(data) {
			snsId = data.header.sessionId;
			if (data.header.process === 'success') {
				if (data.body && data.body.result[0]) {
					condition = data.body.result[0].CONDITION
					if (condition === 0) {
						$("input:radio[name='userExpression']:radio[id='expressionForm01']").prop('checked', true);
						$('.user_expression span.good').addClass('on');
						$('.user_expression span.not').removeClass('on');
					}
					else if (condition === 1) {
						$("input:radio[name='userExpression']:radio[id='expressionForm02']").prop('checked', true);
						$('.user_expression span.not').addClass('on');
						$('.user_expression span.good').removeClass('on');
					}
				}
				else {
					$("input:radio[name='userExpression']").prop('checked', false);
				}
			}
		}
	});
}

function closeExpressionPopup() {
	if (condition === 0) {
		$("input:radio[name='userExpression']:radio[id='expressionForm01']").prop('checked', true);
		$('.user_expression span.good').addClass('on');
		$('.user_expression span.not').removeClass('on');
	} else if (condition === 1) {
		$("input:radio[name='userExpression']:radio[id='expressionForm02']").prop('checked', true);
		$('.user_expression span.not').addClass('on');
		$('.user_expression span.good').removeClass('on');
	} else {
		$("input:radio[name='userExpression']:radio[id='expressionForm01']").prop('checked', false);
		$("input:radio[name='userExpression']:radio[id='expressionForm02']").prop('checked', false);
	}
	$('input[name="expressionpop01"]').prop('checked', false);
	$('#etcExpression').val('');
	layerPopup.layerHide('expressionPop');
	$('.user_expression input[type="radio"]').focus();
}

function clickNotLikeExpression() {
	if ( loginYn == 'N') {
		showLogin(2);
	} else {
		if (condition !== 1) {
			layerPopup.layerShow('expressionPop');
			$('#expressionPop.layerpop').focus();
		} else if (condition === 1) {
			alert('이미 평가한 항목입니다.');
		} else {
			alert('새로고침 후 평가를 선택해주세요.');
			return;
		}
	}
}

function saveNotLikePopup() {
	if (!$('input:radio[name="expressionpop01"]:checked').val()) {
		alert('옵션을 선택해주세요!')
	} else {
		let checkValue = $('input[name="expressionpop01"]:checked').val();
		let text = $("label[for='" + checkValue + "']").text();
		let reason = "";
		if (text === '기타') {
			$('#etcExpression').removeAttr('disabled');
			if ($('#etcExpression').val() === '') {
				alert('기타사항을 입력해주세요.')
				return;
			}
			reason = $('#etcExpression').val();
		} else {
			if ($('#etcExpression').val() !== '') {
				alert("기타를 선택해주세요!")
				return;
			}
		}
		clickUserExpressionLog(1, text, checkValue, reason);
		layerPopup.layerHide('expressionPop');
		$('.user_expression input[type="radio"]').focus();
	}
}

function clickUserExpressionLog(condition, text, checkValue, reason) {
	if ( loginYn == 'N') {
		showLogin(2);
	} else {
		InsertUserExpression(condition, text, checkValue, reason)
	}
}

// 사용자 의사표현 접근성관련 키보드 이벤트 추가
$(document).on('keydown','.user_expression span.good', function (e) {
	if (e.keyCode == 13) {
		clickUserExpressionLog(0);
	}
});
$(document).on('keydown','.user_expression span.not', function (e) {
	if (e.keyCode == 13) {
		clickNotLikeExpression();
	}
});

/* 사용자 의사표현 값 테이블 Insert
condition : 0 - 좋아요, 1 - 별로에요 (숫자로 들어감)
text : 라디오 라벨 텍스트
checkValue : ELK에는 선택2(여행지는 가보고 싶지만 콘텐츠 내용이 부실해요!)일 때 좋아요 , 나머지는 별로에요
reason : textarea 입력 텍스트
*/
function InsertUserExpression(condition, text, checkValue, reason) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd: 'LIKE_FEEDBACK_SAVE',
			cotId: cotId,
			condition: condition,
			text: text,
			reason: reason,
		},
		success: function (data) {
			if (data.header.process === 'success') {
				alert('저장 되었습니다.');
				$('input[name="expressionpop01"]').prop('checked', false);
				$('#etcExpression').val('');

				if (condition === 0) {
					loginPositiveActionUserReviewApp();
				}

				saveUserExpressionLog(condition, checkValue);
			} else if (data.header.likeFlag === 0) {
				alert('이미 선택하셨습니다.');
				return;
			}
			getLikeFeedback(cotId)
		}
	});
}

/* 사용자 의사표현 값 ELK Insert */
function saveUserExpressionLog(condition, checkValue) {
	if (condition === 0) {
		condition = "POSITIVE"
	} else {
		if (checkValue === 'expressionpopForm02') {
			condition = "POSITIVE"
		} else {
			condition = "NEGATIVE"
		}
	}
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd: 'LIKE_FEEDBACK_LOG',
			cotId: cotId,
			condition: condition,
		}
	});
}
/* //사용자 의사표현 */

// ai 콕콕 플로팅
function curationFloat() {
	if (drawer1) {
		drawer1.destroy({animate: true})
	}
	let clickPersonalization = window.localStorage.getItem('click_personalization')
	let prePersonalization = window.localStorage.getItem('pre_personalization')
	let prePersonalizationTitle = window.localStorage.getItem('pre_personalization_title')
	let prePersonalizationParse = JSON.parse(prePersonalization)
	if (!clickPersonalization || !prePersonalization) {
		$('#personalizationTypePc').css('display', 'none')
		$('#personalizationTypeMo').css('display', 'none')
		return
	}
	$('#personalizationTypePc').css('display', '')
	$('#personalizationTypeMo').css('display', '')
	let { type: typeNumber, cotId: clickedCotId } = JSON.parse(clickPersonalization)
  let titleHtml = ``
  let contents = ``
  let title = ``
  if (prePersonalizationTitle) {
    contents = JSON.parse(prePersonalization)
    if (contents.length < 2) {
      clearFloat()
      return
    }
    title = JSON.parse(prePersonalizationTitle).title
    titleHtml = `<span>${title}</span>`;
  } else {
    title = JSON.parse(prePersonalization).title
    contents = JSON.parse(prePersonalization).contents
    if (contents.length < 2) {
      clearFloat()
      return
    }
    let replaceArr = ['<br>', '<br/>']
    if (_device === 'MOBILE') {
      replaceArr.forEach((item, index) => {
        if (title.indexOf(item) !== -1) {
          title = title.replace(replaceArr[index], '')
        }
      })
    }
    titleHtml = `<span>${title}</span>`;
  }
	if (_device === 'PC') {
		titleHtml += `<button type="button">닫기</button>`;
		$('#personalizationTypePc .stit').html(titleHtml);
	} else {
		titleHtml += `<button type="button" onclick="hideDrawer()">닫기</button>`
		$('#personalizationTypeMo .stit').html(titleHtml);
		titleHeight = $('#personalizationTypeMo .stit').outerHeight()
		titleTextHeight = $('#personalizationTypeMo .stit span').outerHeight()
		drawer1 = new CupertinoPane('.cupertino-pane', {
			topperOverflow: true,
			initialBreak: 'top',
			clickBottomOpen: false,
			breaks: {
				top: {
					enabled: true,
					height: titleTextHeight > 20 ? 212 : 193,	// 한줄일 때 16 두줄일 때 32
					bounce: true
				},
				middle: {
					enabled: true,
					height: titleHeight,
					bounce: true
				},
				bottom: {
					enabled: true,
					height: 52,
					bounce: true
				}
			},
			onDragStart: (() => {
				$('body').css('overflow', 'hidden')
			}),
			onDragEnd: (() => {
				setTimeout(() => {
					$('body').css('overflow', 'auto')
				}, 100)
			})
		});
		drawer1.present({animate: true});
	}

	let pcHtml = `<li class="swiper-slide">`;
	let moHtml = ``;
	if (contents.length < 6) {
		$('#personalizationTypePc .btn_wrap').css('display', 'none');
	}
	contents.filter(item => item.cotId !== clickedCotId)
		.forEach(function (item, index) {
			const imgId = item.imgId ? item.imgId :  item.detailDatabase ? item.detailDatabase.firstImage : item.detailArticle.imgId;
      const { cotId, contentType, title } = item
			if (mobileYn === 'N') {
					pcHtml += `<a href="javascript:;" onclick="goDetail('${cotId}','${contentType}', 1, '${prePersonalizationParse}', this);">`;
					pcHtml += `	<span class="img" style="background-image: url(${mainimgurl + imgId});"></span>`;
					pcHtml += `	<strong>${title}</strong>`;
					pcHtml += `</a>`;
					if ((index+1) % 6 === 0) {
						pcHtml += '</li>';
						pcHtml += `<li class="swiper-slide">`;
					}
			}
			moHtml += `<li class="swiper-slide">`;
			moHtml += `	<a href="javascript:;" onclick="goDetail('${cotId}','${contentType}', 1, '${prePersonalizationParse}', this);">`;
			moHtml += `		<span class="img"`;
			moHtml += `					style="background-image: url(${mainimgurl + imgId});"></span>`;
			moHtml += `		<strong>${title}</strong>`;
			moHtml += `	</a>`;
			moHtml += `</li>`;
	});
	pcHtml += '</li>';
	$('#personalizationTypePc .cont ul').html(pcHtml);
	$('#personalizationTypeMo .cont ul').html(moHtml);
	window.localStorage.removeItem('click_personalization')
	window.localStorage.removeItem('pre_personalization_title')
	window.localStorage.removeItem('pre_personalization')
}

async function presentDrawer1() {
	drawer1.present({animate: true});
}
async function hideDrawer() {
	drawer1.hide();
}

var swiper = new Swiper(".recommend_destination .swiper-container", {
	slidesPerView: "auto",
	watchOverflow:true,
	spaceBetween: 10,
	observer: true,
	observeParents: true,
	navigation: {
		nextEl: ".swiper-button-next",
		prevEl: ".swiper-button-prev",
	},
});

$(document).on("click", "#personalizationTypePc .stit button", function() {
  $('.recommend_destination.pc .cont').slideDown();
  let prt= $(this).parents('.recommend_destination.pc');
  if (prt.hasClass('on')) {
    prt.removeClass('on');
    $('.recommend_destination.pc .cont').slideUp();
    $('.recommend_destination.pc .stit button').text('열기');
  } else {
    prt.addClass('on');
    $('.recommend_destination.pc .cont').slideDown();
    $('.recommend_destination.pc .stit button').text('닫기');
  }
});

const isTablet = () => {
  const ua = navigator.userAgent.toLowerCase()
  if (ua.match(/ipad/) || ua.match(/android/) && !ua.match(/mobi|mini|fennec/) || ua.match(/macintosh/) && window.navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}
let _device = (() => {
  if (smallerThanTablet()) {
    deviceviewtype = "MO";
    return "MOBILE"
  }
  if (isTablet()) {
    return "MOBILE"
  }
  if (mobileYn === 'Y') {
    return "MOBILE"
  }
  return "PC"
})()

function clearFloat() {
  $('#personalizationTypePc').css('display', 'none')
  $('#personalizationTypeMo').css('display', 'none')
  window.localStorage.removeItem('click_personalization')
  window.localStorage.removeItem('pre_personalization_title')
  window.localStorage.removeItem('pre_personalization')
}

function checkCalendarScheduleExistence(calId) {
	if (calId == undefined) {
		calId = '';
	}
	const goodBtn = document.querySelector('.btn_good');
	goodBtn.setAttribute('onclick', `festivalAndShowSetLike(\`${calId}\`)`);
}

function festivalAndShowSetLike(calId) {
	if ( $.cookie('content_'+cotId) == 'Y') {
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd : 'CONTENT_LIKE_DELETE',
				cotid : cotId
			},
			success: function(data) {
				alert('좋아요가 취소되었습니다.');
				$("#conLike").text(Number($("#conLike").text())-1);
				$.cookie('content_'+cotId, 'N', {expires: 1, path:'/'});
				$("input:radio[id=estimateForm1]").prop('checked', false);
				$('.btn_good').attr('class','btn_good');
				$('.btn_good').attr('title','');
				contentlike = false;
			}
		});
	} else {
		if ( confirm("대한민국 구석구석 MY 여행캘린더에 일정을 추가 하시겠습니까?") == true) {
			if (loginYn != 'Y') {
				showLogin(2);
				return;
			} else {
				addCalendarSchedule(calId, 'show');
			}
		}
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd : 'CONTENT_LIKE_SAVE',
				cotid : cotId
			},
			success: function(data) {
				alert('좋아요를 누르셨습니다.');
				$("#conLike").text(Number($("#conLike").text())+1);
				$.cookie('content_'+cotId, 'Y', {expires: 1, path:'/'});
				$("input:radio[id=estimateForm1]").prop('checked', true);
				$('.btn_good').attr('class','btn_good on');
				$('.btn_good').attr('title','선택됨');
				contentlike = true;

				loginPositiveActionUserReviewApp();
			}
		});
	}
}
