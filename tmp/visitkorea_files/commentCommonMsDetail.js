// 202504 댓글 개편

var commentInsertCheck = true;
var firstcomment = 0;
var img = 0;
var p_obj = '';
var stotalCount = 0;
var firstCommentCount = 0;
var spage = 1;
var scnt = 5;
var pcnt = 5;
var moreCnt = 5;
var cmtId = '';
var reportcmtId = '';
var reportimgId = '';
var reportCheck = false;
let beforescrollheight = 0;
let commentlist;
let commentImageMap = {};
let recommentImageMap = {};
let totalUploadImgCnt = 0;
let imgPopupGallerySwiper = '';
let imgPopupThumbnailSwiper = '';
let isPictureOnly = false;
let orderType = 0; // 0:최신순, 1:추천순
let photoUploadId = '';

function CommentDefaultSetting() {
	$("input[name='reportForm1']:radio").change(function () {
		var val = this.value;
		if (val == '기타') {
			$('#reportReason').removeAttr('disabled');
		} else {
			$('#reportReason').attr('disabled','true');
			$('#reportReason').val('');
		}
	});

}

var type = "ALL";

function getContentCommentInfo(type) {
	commentShowLoading();
	//댓글 가져오기
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_COMMENT_INFO_VIEW',
			cotid : cotid,
			page : spage+'',
			cnt : scnt+'',
			morecnt : moreCnt+'',
			cmtId : cmtId,
			type : type,
			isPicture : isPictureOnly,
			orderType : orderType
		},
		success: function(data) {
			goContentCommentInfoView(data);
		},
		complete: function() {
			commentHideLoading();
		}
	});
}

function getContentFirstCommentInfo(type) {
	commentShowLoading();
	//댓글 가져오기
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_FIRST_COMMENT_INFO_VIEW_REWARD',
			cotid : cotid,
			type : type,
			isPicture : isPictureOnly,
			orderType : orderType
		},
		success: function(data) {
			goContentCommentInfoView(data, true);
			getContentPictureList();
			getGptComment();
		},
		complete: function() {
			CommentDefaultSetting();
		}
	});
}

$('#comment').click(function() {
	if ( uid == null || uid == '' || uid == 'null' || uid == undefined ) {
		commentShowLogin(2);
	}
});

$('#comment').on('keydown', function(e) {
	if (e.keyCode == 13) {
		if ( uid == null || uid == '' || uid == 'null' || uid == undefined ) {
			commentShowLogin(2);
		}
	}
})

//댓글 표시하기
function goContentCommentInfoView(data,first) {
	let strHtml = '';

	uid = data.header.id;

	stotalCount = data.body.totalCount;
	$('#commentCount').html(stotalCount);

	var countindex = 0;

	if (first) {
		if (data.body.result != undefined ) {
			firstCommentCount = data.body.result.length;
		}
	}
	hideMoreBtn();
	if ( data.body.result != undefined ) {
		var firstcomment2;
		commentlist = commentlist ? commentlist.concat(commentlist,data.body.result) : data.body.result;

		if (data.body.trssResult != null) {
			if (data.body.trssResult[0].trssCnt > 0) {
				$('.done_txt').remove();
				var date = new Date(data.body.trssResult[0].missionday.substring(0,4)+'-'+data.body.trssResult[0].missionday.substring(4,6));
				var notice = '<p class="done_txt">배경의 댓글은 현재 가볼래-터 '+(date.getMonth()+1)+'월호 미션을 완료한 댓글입니다.</p>';
				$('.review_filter').after(notice);
			}
		}

		$.each(data.body.result, function (index, items) {
			if (index == 0 && spage != 1) {
				firstcomment2 = items.cmtId;
			}

			if (firstcomment == 0) {
				if (cmtId != '') {
					cmtId += ','+items.cmtId;
				} else {
					cmtId += items.cmtId;
				}
			}
			strHtml = '';
			if (items.missionyn && items.missionyn > 0 && !items.isDelete && items.ptctYn === 'Y') {
				var date = new Date(items.missionday.substring(0,4)+'-'+items.missionday.substring(4,6));

				strHtml += '<li id="'+items.cmtId+'" class="mission_done">';
			} else {
				strHtml += '<li id="'+items.cmtId+'">';
			}
			switch (items.isDelete) {
				case 1: strHtml += `<p class="comment_report">`;
					strHtml += `	<span class="icon_alert_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32.svg" class="icon_svg_inject" alt=""></span>`;
					strHtml += `	삭제된 댓글입니다.`;
					strHtml += `</p>`;
					break;
				case 2: strHtml += `<p class="comment_report">`;
					strHtml += `	<span class="icon_alert_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32.svg" class="icon_svg_inject" alt=""></span>`;
					strHtml += `	관리자에 의해 삭제된 댓글입니다.`;
					strHtml += `</p>`;
					break;
				case 3: strHtml += `<p class="comment_report">`;
					strHtml += `	<span class="icon_alert_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32.svg" class="icon_svg_inject" alt=""></span>`;
					strHtml += `	신고 접수되어 관리자가 검토중인 댓글입니다.`;
					strHtml += `</p>`;
					break;
				default:
					strHtml += '<div class="author"><span class="profile">';

					if (items.snsType == '99') {	// admin
						strHtml += '<img src="../resources/images/sub/profile_50x50.gif" />';
					} else {
						let profileImg = '';

						if (items.profileChk == 'Y') {
							profileImg = mainimgurl + items.profileImgId;
						} else if ($.trim(items.url) != '') {
							// 카카오톡 이미지 http로 불러오는 문제 해결
							profileImg = items.url.replace('http://', 'https://');
							profileImg = profileImg.replace('th-p.talk.kakao.co.kr', 'k.kakaocdn.net');
						} else {
							profileImg = '../resources/images/common/icon_header_profile2.png';
						}

						strHtml += `<img src="${profileImg}" onerror="this.src='../resources/images/common/icon_header_profile2.png'" />`;
					}

					if (items.snsType == '4') {
						strHtml += '    <span class="sns"><img src="../resources/images/sub/ico_naver.png" alt="네이버"></span>';
					} else if (items.snsType == '0') {
						strHtml += '    <span class="sns"><img src="../resources/images/sub/ico_facebook.png" alt="페이스북"></span>';
					} else if (items.snsType == '1') {
						strHtml += '    <span class="sns"><img src="../resources/images/sub/ico_twitter.png" alt="트위터"></span>';
					} else if (items.snsType == '5') {
						strHtml += '    <span class="sns"><img src="../resources/images/sub/ico_kakao.png" alt="카카오"></span>';
					} else if (items.snsType == '6') {
						strHtml += '    <span class="sns"><img src="../resources/images/sub/ico_plus.png" alt="구글"></span>';
					} else if (items.snsType == '2') {
						strHtml += '    <span class="sns"><img src="../resources/images/sub/ico_insta2.png" alt="인스타그램"></span>';
					} else if (items.snsType == '7') {
						strHtml += '    <span class="sns"><img src="../resources/images/sub/ico_apple.png" alt="애플"></span>';
					}

					strHtml += '</span>';

					if (items.snsType == '99') {	// admin
						strHtml += '	<strong>대한민국 구석구석</strong>';
					} else {
						strHtml += '	<strong>' + items.screenName + '</strong>';
					}

					strHtml += '		<span class="date">' + conDateFormat(items.createDate, "yyyyMMdd", ".") + '</span>';
					if (items.footprintYn > 0) {
						/*방문자후기*/
						strHtml += '		<em class="visitor"><span class="icon_stamp_sm" aria-hidden="true"><img src="../resources/images/common/icon/svg/stamp24.svg" class="icon_svg_inject" alt=""></span>방문자 후기</em>';
						/*방문자후기*/
					}
					strHtml += '</div>'; // 프로필 닫기

					if (items.imgId != null) {
						strHtml += '	<div class="img">';
						strHtml += '		<button type="button" onclick="moveImgPopup(\'' + items.imgId + '\')"><img src="' + mainimgurl + items.imgId + '&mode=custom&width=160&height=160" /></button>';
						if (items.imgId2) {
							strHtml += '			<button type="button" onclick="moveImgPopup(\'' + items.imgId2 + '\')"><img src="' + mainimgurl + items.imgId2 + '&mode=custom&width=160&height=160" /></button>';
						}
						if (items.imgId3) {
							strHtml += '			<button type="button" onclick="moveImgPopup(\'' + items.imgId3 + '\')"><img src="' + mainimgurl + items.imgId3 + '&mode=custom&width=160&height=160" /></button>';
						}
						strHtml += '	</div>';
					}

					if (items.comment.length > 220) {
						strHtml += `<p class="review_text" id="${items.cmtId}_more_close">`;
						strHtml += `${items.comment.substring(0, 220)}...`;
						strHtml += `	<button class="more" onclick="commentMore('${items.cmtId}', true)">`;
						strHtml += '		<em>더보기</em>';
						strHtml += '		<span class="icon_chevron_dw_sm" aria-hidden="true"><img src="../resources/images/common/icon/svg/chevron_dw24.svg" class="icon_svg_inject" alt=""></span>';
						strHtml += '	</button>';
						strHtml += '</p>';
						strHtml += `<p class="review_text" id="${items.cmtId}_more_open" style="display: none">`;
						strHtml += `${items.comment}`;
						strHtml += `	<button class="more close" onclick="commentMore('${items.cmtId}', false)">`;
						strHtml += '		<em>닫기</em>';
						strHtml += '		<span class="icon_chevron_dw_sm" aria-hidden="true"><img src="../resources/images/common/icon/svg/chevron_dw24.svg" class="icon_svg_inject" alt=""></span>';
						strHtml += '	</button>';
						strHtml += '</p>';
					} else {
						strHtml += `<p class="review_text">${items.comment}</p>`;
					}

					strHtml += `<div class="action_btn">`;
					strHtml += `<button id="${items.cmtId}_like" class="icon_md_heart" type="button" aria-label="좋아요" data-cnt="${items.likecnt}">`;

					if (items.islike && items.islike > 0) {
						strHtml += `<span aria-hidden="true" class="icon_heart_md on"><img src="../resources/images/common/icon/svg/heart24.svg" class="icon_svg_inject" alt=""></span>`;
					} else {
						strHtml += `<span aria-hidden="true" class="icon_heart_md"><img src="../resources/images/common/icon/svg/heart24.svg" class="icon_svg_inject" alt=""></span>`;
					}

					strHtml += items.likecnt >= 100 ? '99+' : items.likecnt;
					strHtml += '</button>';
					strHtml += `<button id="${items.cmtId}_recomment" class="icon_md_chat" type="button" aria-label="답글"">`;
					strHtml += '	<span aria-hidden="true" class="icon_chat_md"><img src="../resources/images/common/icon/svg/chat24.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += '	0';
					strHtml += '</button>';
					if (uid == items.snsId) {
						strHtml += `<button class="btn_txt" type="button" onclick="delComment('${items.cmtId}')">삭제</button>`;
					} else {
						strHtml += `<button class="btn_txt" type="button" onclick="OpenReportPopup('${items.cmtId}')">신고</button>`;
					}
					strHtml += `</div>`;
					strHtml += `<div id="${items.cmtId}_replyArea" class="comment_reply" style="display: none;"><ul></ul></div>`;
					strHtml += `</div>`;
			}

			$('#commentArea').append(strHtml);

			$('#' + items.cmtId + '_like').on('click', function () {
				if ( loginYn == 'N') {
					showLogin(2);
					return;
				}

				if ($($(this).children('span')[0]).hasClass('on')) {
					CommentLike(items.cmtId, $(this), 1);
				} else {
					CommentLike(items.cmtId, $(this), 0);
				}
			});

			$('#' + items.cmtId + '_recomment').on('click', function () {
				let cnt = $(this).data('cnt') ? $(this).data('cnt') : 0;

				if ($('#' +items.cmtId + '_replyArea').is(':visible')) {
					$('#' + items.cmtId + '_replyArea').hide();
				} else {
					$('#' + items.cmtId + '_replyArea').show();
				}
			});
		});


		$.each(data.body.result, function (index, items) {
			// 삭제 처리된 댓글에 답글을 추가 못하게 수정
			switch (items.isDelete) {
				case 1: case 2: case 3:
					break;
				default:
					strHtml = '';
					strHtml += '<li class="inputcomment">';
					strHtml += `	<form name="${items.cmtId}_form" id="${items.cmtId}_form" class="replyForm" >`;
					strHtml += '	<div class="reg_talk">';
					strHtml += '		<div class="thumbnail">';
					strHtml += '			<div class="area_form">';
					strHtml += '				<textarea id="comment' + items.cmtId + '" name="" aria-label="댓글 입력" placeholder="여행의 즐거움을 함께 나누어 주세요.\n여러분의 생생한 후기를 기다립니다." onkeydown="commentresize(this);"></textarea>';
					strHtml += '			</div>';
					strHtml += `			<div id="cmtImgArea${items.cmtId}" class="img" style="display: none;"></div>`;
					strHtml += '		</div>';
					strHtml += '	</div>';
					strHtml += '	<div class="btn_wrap">';
					strHtml += '		<div class="tooltip">';
					strHtml += '			<button type="button" class="icon_lg_help" aria-label="도움말" onclick="layerPopup.layerShow(\'' + items.cmtId + '_tooltip\');">';
					strHtml += '				<span class="icon_help_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/help18.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += '			</button>';
					strHtml += '			<span>유의사항</span>';
					strHtml += '			<div id="' + items.cmtId + '_tooltip" class="wrap_layerpop ui_tooltip">';
					strHtml += '				<div class="layerpop">';
					strHtml += '					<div class="cont">';
					strHtml += '						불건전한 댓글의 경우 별도의 통보 없이 삭제될 수 있습니다. 댓글/답글 등록 시 사용자의';
					strHtml += '						닉네임, 이미지 (<a href="https://pass.knto.or.kr/" target="_blank" title="새창">투어원패스</a> 및 <a href="/mypage/mypage_main.do" target="_blank" title="새창">대한민국 구석구석';
					strHtml += '						마이페이지</a> 명칭 사용)가 함께 표시됩니다.';
					strHtml += '					</div>';
					strHtml += '					<button type="button" onclick="layerPopup.layerHide(\'' + items.cmtId + '_tooltip\');" aria-label="닫기" class="close">';
					strHtml += '						<span class="icon_close2_xs" aria-hidden="true"><img src="../resources/images/common/icon/svg/close24_02.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += '					</button>';
					strHtml += '				</div>';
					strHtml += '			</div>';
					strHtml += '		</div>';
					strHtml += '		<div class="btn">';
					strHtml += '			<input type="file" id="' + items.cmtId + '_fileUpload" onchange="fileChange(this, false, \'' + items.cmtId + '\')"/>';
					strHtml += '			<label for="' + items.cmtId + '_fileUpload" onclick="fileFocus(event, \'' + items.cmtId + '\')">';
					strHtml += '				<span class="icon_camera_md" aria-hidden="true"><img src="../resources/images/common/icon/svg/camera24.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += '				사진';
					strHtml += '			</label>';
					strHtml += '			<button type="button" class="btn_reg ContentComment" data-id="' + items.cmtId + '">등록</button>';
					strHtml += '		</div>';
					strHtml += '	</div>';
					strHtml += '	</form>';
					strHtml += '</li>';

					$(`#${items.cmtId}_replyArea > ul`).append(strHtml);

					$('#comment' + items.cmtId).on('keydown', function(e) {
						if (e.keyCode == 13) {
							if ( uid == null || uid == '' || uid == 'null' || uid == undefined ) {
								commentShowLogin(2);
							}
						}
					});

					$('#comment' + items.cmtId).on('click', function() {
						if ( uid == null || uid == '' || uid == 'null' || uid == undefined ) {
							commentShowLogin(2);
						}
					});
			}
		});

		$('.recomments').remove();
		$.each(data.body.recomment, function (index, items) {
			if (items.snsId === snsId) {
				let doc = $(`#${items.parentCmtId}_recomment`);
				doc.html('<span aria-hidden="true" class="icon_chat_md"><img src="../resources/images/common/icon/svg/chat_fill.svg" class="icon_svg_inject" alt=""></span>0');
				doc.data('in', true);
			}

			strHtml = '';
			strHtml += '<li class="recomments" id="' + items.cmtId + "_" + index + '" >';
			switch (items.isDelete) {
				case 1:
					strHtml += '<p class="comment_report">';
					strHtml += '	<span class="icon_alert_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += '	삭제된 답글입니다.';
					strHtml += '</p>';
					break;
				case 2:
					strHtml += '<p class="comment_report">';
					strHtml += '	<span class="icon_alert_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += '	관리자에 의해 삭제된 답글입니다.';
					strHtml += '</p>';
					break;
				case 3:
					strHtml += '<p class="comment_report">';
					strHtml += '	<span class="icon_alert_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += '	신고 접수되어 관리자가 검토중인 답글입니다.';
					strHtml += '</p>';
					break;
				default:
					strHtml += '<div class="author">';
					strHtml += '	<span class="profile">';

					if (items.snsType == '99') {	// admin
						strHtml += '		<img src="../resources/images/sub/profile_50x50.gif" />';
					} else {
						var profileImg = '';

						if (items.profileChk == 'Y') {
							profileImg = mainimgurl + items.profileImgId;
						} else if ($.trim(items.url) != '') {
							// 카카오톡 이미지 http로 불러오는 문제 해결
							profileImg = items.url.replace('http://', 'https://');
							profileImg = profileImg.replace('th-p.talk.kakao.co.kr', 'k.kakaocdn.net');
						} else {
							profileImg = '../resources/images/common/icon_header_profile2.png';
						}

						strHtml += `<img src="${profileImg}" onerror="this.src='../resources/images/common/icon_header_profile2.png'" />`;
					}

					if (items.snsType == '4') {
						strHtml += '    	<span class="sns"><img src="../resources/images/sub/ico_naver.png" alt="네이버"></span>';
					} else if (items.snsType == '0') {
						strHtml += '    	<span class="sns"><img src="../resources/images/sub/ico_facebook.png" alt="페이스북"></span>';
					} else if (items.snsType == '1') {
						strHtml += '    	<span class="sns"><img src="../resources/images/sub/ico_twitter.png" alt="트위터"></span>';
					} else if (items.snsType == '5') {
						strHtml += '    	<span class="sns"><img src="../resources/images/sub/ico_kakao.png" alt="카카오"></span>';
					} else if (items.snsType == '6') {
						strHtml += '    	<span class="sns"><img src="../resources/images/sub/ico_plus.png" alt="구글"></span>';
					} else if (items.snsType == '2') {
						strHtml += '    	<span class="sns"><img src="../resources/images/sub/ico_insta2.png" alt="인스타그램"></span>';
					} else if (items.snsType == '7') {
						strHtml += '    	<span class="sns"><img src="../resources/images/sub/ico_apple.png" alt="애플"></span>';
					}

					strHtml += '	</span>';
					if (items.snsType == '99') {	// admin
						strHtml += '	<strong>대한민국 구석구석</strong>';
					} else {
						strHtml += '	<strong>' + items.screenName + '</strong>';
					}
					strHtml += '	<span class="date">' + conDateFormat(items.createDate, "yyyyMMdd", ".") + '</span>';
					strHtml += '</div>';

					if (items.imgId != null) {
						strHtml += '<div class="img">';
						strHtml += '	<button type="button" onclick="moveImgPopup(\'' + items.imgId + '\')"><img src="' + mainimgurl + items.imgId + '&mode=custom&width=160&height=160" /></button>';
						if (items.imgId2) {
							strHtml += '	<button type="button" onclick="moveImgPopup(\'' + items.imgId2 + '\')"><img src="' + mainimgurl + items.imgId2 + '&mode=custom&width=160&height=160" /></button>';
						}
						if (items.imgId3) {
							strHtml += '	<button type="button" onclick="moveImgPopup(\'' + items.imgId3 + '\')"><img src="' + mainimgurl + items.imgId3 + '&mode=custom&width=160&height=160" /></button>';
						}
						strHtml += '</div>';
					}

					if (items.comment.length > 220) {
						strHtml += `<p class="review_text" id="${items.cmtId}_more_close">`;
						strHtml += `${items.comment.substring(0, 220)}...`;
						strHtml += `	<button class="more" onclick="commentMore('${items.cmtId}', true)">`;
						strHtml += '		<em>더보기</em>';
						strHtml += '		<span class="icon_chevron_dw_sm" aria-hidden="true"><img src="../resources/images/common/icon/svg/chevron_dw24.svg" class="icon_svg_inject" alt=""></span>';
						strHtml += '	</button>';
						strHtml += '</p>';
						strHtml += `<p class="review_text" id="${items.cmtId}_more_open" style="display: none">`;
						strHtml += `${items.comment}`;
						strHtml += `	<button class="more close" onclick="commentMore('${items.cmtId}', false)">`;
						strHtml += '		<em>닫기</em>';
						strHtml += '		<span class="icon_chevron_dw_sm" aria-hidden="true"><img src="../resources/images/common/icon/svg/chevron_dw24.svg" class="icon_svg_inject" alt=""></span>';
						strHtml += '	</button>';
						strHtml += '</p>';
					} else {
						strHtml += `<p class="review_text">${items.comment}</p>`;
					}
					strHtml += '<div class="action_btn">';
					if (items.isDelete < 1) {
						strHtml += `	<button id="${items.cmtId}_like" class="icon_md_heart" type="button" aria-label="좋아요" data-cnt="${items.likecnt}">`;
						if (items.islike && items.islike > 0) {
							strHtml += '		<span aria-hidden="true" class="icon_heart_md on"><img src="../resources/images/common/icon/svg/heart24.svg" class="icon_svg_inject" alt=""></span>';
						} else {
							strHtml += '		<span aria-hidden="true" class="icon_heart_md"><img src="../resources/images/common/icon/svg/heart24.svg" class="icon_svg_inject" alt=""></span>';
						}
						strHtml += items.likecnt >= 100 ? '99+' : items.likecnt;
						strHtml += '	</button>';
					}

					if (uid == items.snsId) {
						strHtml += `	<button class="btn_txt" type="button" onclick="delComment('${items.cmtId}')">삭제</button>`;
					} else {
						strHtml += `	<button class="btn_txt" type="button" onclick="OpenReportPopup('${items.cmtId}')">신고</button>`;
					}

					strHtml += '</div>';
					strHtml += '</li>';
			}

			if ($('#' + items.parentCmtId + ' ul .inputcomment').length) {
				$('#' + items.parentCmtId + ' ul .inputcomment').before(strHtml);
			} else {
				$('#' + items.parentCmtId + ' ul').html(strHtml);
			}

			$('#' + items.cmtId + '_like').on('click', function () {
				if (loginYn == 'N') {
					showLogin(2);
					return;
				}

				if ($($(this).children('span')[0]).hasClass('on')) {
					CommentLike(items.cmtId, $(this), 1);
				} else {
					CommentLike(items.cmtId, $(this), 0);
				}
			});
		});

		$.each(data.body.recommentCnt, function (index, items) {
			cnt = items.cnt;
			if (cnt > 0) {
				let strHtml = '';
				if ($('#' + items.parentCmtId + '_recomment').data('in')) {
					strHtml = `<span aria-hidden="true" class="icon_chat_md"><img src="../resources/images/common/icon/svg/chat_fill.svg" class="icon_svg_inject" alt=""></span>`;
				} else {
					strHtml = `<span aria-hidden="true" class="icon_chat_md"><img src="../resources/images/common/icon/svg/chat24.svg" class="icon_svg_inject" alt=""></span>`;
				}
				strHtml += cnt;
				$('#' + items.parentCmtId + '_recomment').html(strHtml);
				$('#' + items.parentCmtId + '_recomment').data('cnt', cnt);
			}
		});

		if (uid == null || uid == '' || uid == 'null' || uid == undefined) {
			$('.comment').attr('placeholder', '로그인 후 소중한 답글을 남겨주세요.');
		}

		$('.comment').click(function () {
			if (uid == null || uid == '' || uid == 'null' || uid == undefined) {
				commentShowLogin(2);
			}
		});

		$('.fileRegbtn').click(function () {
			if (uid == null || uid == '' || uid == 'null' || uid == undefined) {
				commentShowLogin(2);
			}
		});

		$('.list_reply').show();
		$('.review_list .no_data').hide();
		$('.replyBox').hide();

	} else {
		if (data.body.totalCount < 1) {
			let strHtml = '<span class="icon_alert1_xlg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32_01.svg" class="icon_svg_inject" alt=""></span>';
			if (isPictureOnly) {
				strHtml += '<p>등록된 사진 후기가 없습니다.</p>';
			} else {
				strHtml += '<p>등록된 댓글이 없습니다.</p>';
			}

			$('.review_list .no_data').show();
			$('.review_list .no_data').html(strHtml);
			$('#commentMore').hide();
		} else {
			$('.review_list .no_data').hide();
			$('#commentMore').show();
		}
	}

	if (loginYn == "Y") {
		$(".replyWrap").addClass('login');
		if ($('#comment').attr('placeholder').indexOf('방문 후기') == -1) {
			$('#comment').attr('placeholder', '여행의 즐거움을 함께 나누어 주세요.\n여러분의 생생한 후기를 기다립니다.');
		}
	} else {
		$('#comment').attr('readonly', true);
		$('.comment').attr('readonly', true);
		$('#fileUp').attr('disabled', true);
		$('.fileUp').attr('disabled', true);
	}
}

//방문자후기 탭 click event
function footprintReview(type) {
	firstCommentCount = 0;
	spage = 1;
	scnt = 5;
	pcnt = 5;
	moreCnt = 5;
	stotalCount = 0;
	cmtId = '';
	firstcomment = 0;

	$('.list_reply ul').empty();
	$('.reply_tab button').removeClass();
	$('.reply_tab button').attr('title', '');

	getContentFirstCommentInfo('ALL');
}

//댓글 더보기 클릭시
$(document).on("click", "#commentMore", function () {
	if (firstcomment != 0) {
		spage++;
	} else {
		firstcomment = 1
	}

	hideMoreBtn();
	getContentCommentInfo();
});

function hideMoreBtn() {
	if (firstcomment == 0) {
		if (firstCommentCount > 0 && stotalCount > 2) {
			$('#commentMore').show();
		} else if (firstCommentCount < 2 && stotalCount > 1) {
			$('#commentMore').show();
		} else if (firstCommentCount == 0 && stotalCount > 0) {
			$('#commentMore').show();
		} else if (stotalCount == 2) {
			$('#commentMore').hide();
		} else if (stotalCount < 2) {
			$('#commentMore').hide();
		}
	} else if (firstcomment == 1) {
		if (stotalCount > 2) {
			$('#commentMore').show();
		} else {
			$('#commentMore').hide();
		}
		firstcomment = 2;
		spage = 1;
		scnt = pcnt;
	} else {
		if (scnt != moreCnt) {
			if (spage == 2 && stotalCount > (scnt + (moreCnt))) {
				$('#commentMore').show();
			} else if (stotalCount > (scnt + (moreCnt * (spage - 1)))) {
				$('#commentMore').show();
			} else {
				$('#commentMore').hide();
			}
		} else {
			if (stotalCount > (2 + (scnt * spage))) {
				$('#commentMore').show();
			} else {
				$('#commentMore').hide();
			}
		}
	}
}

function delComment(cmtid) {
	if (confirm("댓글을 삭제하시겠습니까 ?") == true) {
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd: 'CONTENT_COMMENTINFO_DELTETE',
				cotid: cotid,
				cmtid: cmtid
			},
			success: function (data) {
				try {
					spaCallback("sapContentCommentAddDelete");
				} catch (e) {}
				$('.pop_subMenu').removeClass('on');
				$('.dimmed2').remove();

				spage = 1;
				scnt = pcnt;
				firstcomment = 0;
				cmtId = '';
				$('.review_list ul li').remove();
				getContentFirstCommentInfo();
			}
		});
	}
}

/* 사용자 의사표현 */
function getLikeFeedback(cotId) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd: 'GET_LIKE_FEEDBACK',
			cotId: cotId
		},
		success: function (data) {
			snsId = data.header.sessionId;
			if (data.header.process === 'success') {
				if (data.body && data.body.result[0]) {
					condition = data.body.result[0].CONDITION
					if (condition === 0) {
						$("input:radio[name='userExpression']:radio[id='expressionForm01']").prop('checked', true);
						$('.user_expression span.good').addClass('on');
						$('.user_expression span.not').removeClass('on');
					} else if (condition === 1) {
						$("input:radio[name='userExpression']:radio[id='expressionForm02']").prop('checked', true);
						$('.user_expression span.not').addClass('on');
						$('.user_expression span.good').removeClass('on');
					}
				} else {
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
	if (loginYn == 'N') {
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
	if (loginYn == 'N') {
		showLogin(2);
	} else {
		InsertUserExpression(condition, text, checkValue, reason)
	}
}

/* 사용자 의사표현 값 테이블 / ELK Insert
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
				saveUserExpressionLog(condition, checkValue);
			} else if (data.header.likeFlag === 0) {
				alert('이미 선택하셨습니다.');
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
		},
		success: function (data) {
		}
	});
}

function writeComment() {
	if (loginYn == 'N') {
		showLogin(2);
	} else {
		if (sloginType == '10') {
			layerPopup.layerShow('cosConfirm4');
			return;
		} else {
			saveContentComment();

			// CDP 데이터 전송 로직.
			try {
				getCDPInterface().pushBySpecificFunction({
					eventKey: 'EV1715299981220',
					eventValue: 'traveltalk_place',
				}, 'pushGroobeeTaxonomyCustomEvent');
			} catch (e) {
				console.log('CDP 데이터 전송 중 오류가 발생했습니다.\n', e);
			}
			// CDP 데이터 전송 로직, END.

			// 사진 공모전 이벤트 DB 컨텐츠, CDP 데이터 전송 로직.
			try {
				let photoContestEventContents = [
					'a7c33d48-a351-4ffe-aa68-1d020c523b55'
					, '4cdebd66-c483-4b95-898b-0bef67220bfc'
					, '3e375cc0-c11e-45de-9651-e77d6b40891e'
					, 'cb007a7c-ee6e-4f23-adfe-34f3adf1d19c'
					, '48af3cd8-a93a-4a6b-a0bf-2490fed5a82a'
					, '72e3f699-f78a-47b0-977a-b0b66cc0b107'
					, '11c0ad01-6cb2-4855-abed-ff10fc20fd0e'
					, '81364e4e-da85-4e91-b8df-ff396262308f'
					, 'd5976597-4164-4dc0-96a8-700f555ec3a0'
					, '035f613f-39ee-4004-85f9-813619817849'
				];

				photoContestEventContents.forEach(eventCotId => {
					if (location.href.includes(eventCotId)) {
						getCDPInterface().pushBySpecificFunction({
							eventKey: 'EV1715299981220',
							eventValue: 'traveltalk_event',
						}, 'pushGroobeeTaxonomyCustomEvent');

						return;
					}
				});

			} catch (e) {
				console.log('CDP 데이터 전송 중 오류가 발생했습니다.\n', e);
			}
			// 사진 공모전 이벤트 DB 컨텐츠, CDP 데이터 전송 로직, END.
		}
	}
}

function saveCommentSentiment(comment, condition, ratings) {
	commentInsertCheck = false;
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd: 'CONTENT_COMMENT_SAVE_REWARD',
			cotid: cotid,
			comment: comment,
			condition: condition,
			ratings: ratings,
			fileuploadlist: Object.values(commentImageMap).toString()
		},
		success: function (data) {
			if (data.header.process != 'fail') {
				commentInsertCheck = true;
				if (data.header.tnmid) {
					const progressNum = String(data?.body?.mission_progressNum ?? "");
					const progressVal = data?.body?.mission_progress;

					if (progressNum) {
						const eventKey = EVENT_KEY_MAP[progressNum] || EVENT_KEY_MAP.success;
						pushCDP(eventKey, progressVal);

						if (progressVal && progressVal.indexOf('success') > -1) {
							feedback.sendUserActionEvent('TrssMissionComplete');
						}
					}

					try {
						spaCallback('sapContentCommentAdd');
					} catch (e) {}
					if (confirm('가볼래-터 댓글 달기 미션에 참여하셨습니다!\r\n' +
						'기준을 충족하는 3개 이상의 댓글 또는 기대평 작성 시 미션이 완료됩니다.\r\n' +
						'\r\n' +
						'미션 완료 혜택과 미션 세부 기준을\r\n' +
						'가볼래-터 홈에서 확인해 보시겠습니까?')) location.href = '/mypage/trss_main.do'
				} else {
					alert('댓글이 등록되었습니다.');
					try {
						spaCallback('contentPhotoAdd');
					} catch (e) {}
				}
				spage = 1;
				scnt = pcnt;
				firstcomment = 0;
				cmtId = '';
				$('.review_list ul li').remove();
				$('#cmtImgArea').empty();
				$('#cmtImgArea').hide();
				getContentFirstCommentInfo();
				$('#comment').val('');
				commentImageMap = {};
			} else if (data.header.ment == 'snsId is Problem') {
				commentInsertCheck = true;
				alert('콘텐츠 내용과 관계 없는 댓글을 등록하여 \n 댓글 등록이 거부되었습니다.');
			}
		},
		complete: function () {
			$('#tform').closest('.form').find('.fileLayer').remove();
		},
		error: function (xhr, textStatus, errorThrown) {
			commentInsertCheck = true;
		}
	});
}

//댓글 저장
function saveContentComment() {
	if (commentInsertCheck == false) {
		return;
	}

	var comment = $('#comment').val();

	if (comment !== '' || Object.keys(commentImageMap).length !== 0) {
		// 댓글 긍정/ 부정 여부 받아오기
		let predictUrl = "https://uapi.uniess.co.kr/predict";
		let condition = "";
		let ratings = 0.0;

		$.ajax({
			url: predictUrl,
			dataType: 'json',
			type: "GET",
			data: {
				comment: chkword(comment),
			},
			success: function (data) {
				if (data.condition === "긍정") {
					condition = "POSITIVE";
				} else if (data.condition === "부정") {
					condition = "NEGATIVE";
				}
				ratings = data.ratings;

				saveCommentSentiment(comment, condition, ratings)
			}
		});
	} else {
		alert('댓글을 입력해주세요.');
		return;
	}
}

// 답글 등록
$(document).on("click", ".replyForm .ContentComment", function () {
	if (loginYn == 'N') {
		showLogin(2);
	} else {
		if (sloginType == '10') {
			layerPopup.layerShow('cosConfirm4');
			return;
		} else {
			var commentNode = $(this);
			saveContentReComment(commentNode);
		}
	}
});

// 답글 저장
function saveContentReComment(commentNode) {
	if (commentInsertCheck == false) {
		return;
	}

	var parentCmtId = commentNode.data('id');
	var comment = $('#' + parentCmtId + '_form textarea').val();

	if (comment || (recommentImageMap[parentCmtId] && Object.keys(recommentImageMap[parentCmtId]).length !== 0)) {
		commentInsertCheck = false;

		// 답글 긍정/ 부정 여부 받아오기
		let predictUrl = "https://uapi.uniess.co.kr/predict";
		let condition = "";
		let ratings = 0.0;
		$.ajax({
			url: predictUrl,
			dataType: 'json',
			type: "GET",
			data: {
				comment: chkword(comment),
			},
			success: function (data) {
				if (data.condition === "긍정") {
					condition = "POSITIVE";
				} else if (data.condition === "부정") {
					condition = "NEGATIVE";
				}
				ratings = data.ratings;
				saveReCommentSentiment(comment, condition, ratings, parentCmtId)
			}
		});
	} else {
		alert('답글을 입력해주세요.');
		return;
	}
}

function saveReCommentSentiment(comment, condition, ratings, parentCmtId) {
	const parentcmt = commentlist.find(comment => comment.cmtId === parentCmtId);

	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd: 'CONTENT_RECOMMENT_SAVE_REWARD',
			cotid: cotid,
			parentCmtId: parentCmtId,
			comment: chkword(comment),
			fileuploadlist: recommentImageMap[parentCmtId] ? Object.values(recommentImageMap[parentCmtId]).toString() : '',
			condition: condition,
			ratings: ratings,
			parentsnsId: parentcmt ? parentcmt.snsId : '' // 댓글작성자 데이터수집
		},
		success: function (data) {
			commentInsertCheck = true;
			alert('답글이 등록되었습니다.');
			spage = 1;
			scnt = pcnt;
			firstcomment = 0;
			cmtId = '';
			recommentImageMap[parentCmtId] = {};
			$('.review_list ul li').remove();
			getContentFirstCommentInfo();

			$('#' + parentCmtId + ' .comment').val('');
			setTimeout(function () {
				$('#' + parentCmtId + ' .replyBox').show();
			}, 100);
		},
		error: function (xhr, textStatus, errorThrown) {
			commentInsertCheck = true;
		}
	});
}

function fileFocus(e, cmtId) {
	if ( loginYn == 'N') {
		showLogin(2);
		e.preventDefault();
		return false;
	}

	if ( appYn == 'Y' && getDevice() == 'Android' && loginYn == 'Y') {
		if ((!cmtId && Object.keys(commentImageMap).length >= 3) || (cmtId && recommentImageMap[cmtId] && Object.keys(recommentImageMap[cmtId]).length >= 3)) {
			alert('사진은 최대 3개까지 첨부할 수 있습니다.');
			return;
		}

		if (cmtId) {
			photoUploadId = cmtId;
		} else {
			photoUploadId = '';
		}

		location.href = "photoupload:?target=PhotoImg&callback=returnCommentImage";
		return false;
	}

	return true;
}

function fileChange(obj, isComment, cmtId) {
	var filename;
	if (window.FileReader) {
		filename = $(obj)[0].files[0].name;
	} else {
		filename = $(obj).val().split('/').pop().split('\\').pop();
	}

	var _fileLen = filename.length;
	var _lastDot = filename.lastIndexOf('.');

	// 확장자 체크
	var ext = filename.substring(_lastDot + 1, _fileLen).toLowerCase();
	if ($.inArray(ext, ['gif', 'jpg', 'jpeg', 'png']) == -1) {
		alert('gif, jpg, jpeg, png 파일만 업로드 해주세요.');
		return;
	}

	// 용량 체크
	var fileSize = obj.files[0].size;
	var maxSize = 1024 * 1024 * 10;	// 10MB
	if (fileSize > maxSize) {
		alert('최대 10MB까지 업로드 가능합니다.')
		return;
	}

	if ((isComment && Object.keys(commentImageMap).length >= 3) || (!isComment && recommentImageMap[cmtId] && Object.keys(recommentImageMap[cmtId]).length >= 3)) {
		alert('사진은 최대 3개까지 첨부할 수 있습니다.');
		return;
	}

	let formData = new FormData();
	formData.append('file', obj.files[0]);

	$.ajax({
		url: mainUploadUrl,
		type: 'POST',
		enctype: 'multipart/form-data',
		cache: false,
		contentType: false,
		processData: false,
		data: formData,
		success: function (data) {
			var objParse = JSON.parse(data);
			let savename = objParse.body.result[0].saveName;
			var dot = savename.indexOf(".");
			savename = savename.substr(0, dot);

			let fullPath = objParse.body.result[0].fullPath;
			fullPath = fullPath.replace('/data/images', '');

			var fileuploadList = savename + '|' + fullPath;

			if (isComment) {
				commentImageMap[totalUploadImgCnt] = fileuploadList;
			} else {
				if (!recommentImageMap[cmtId]) {
					recommentImageMap[cmtId] = {};
				}

				recommentImageMap[cmtId][totalUploadImgCnt] = fileuploadList;
			}

			let reader = new FileReader();
			reader.onload = function (e) {
				let strHTML = ``;
				strHTML += `<span>`;
				strHTML += `	<img src="${e.target.result}" alt="여행 이미지"/>`;
				strHTML += `	<button type="button" aria-label="삭제" onclick="imageFileDelete(${isComment}, ${totalUploadImgCnt}, '${cmtId?cmtId:""}',this)">`;
				strHTML += `		<span class="icon_close1_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/close24_01.svg" class="icon_svg_inject" alt=""></span>`;
				strHTML += `	</button>`;
				strHTML += `</span>`;

				var target = '#cmtImgArea' + (isComment ? '' : cmtId);
				$(target).show();
				$(target).append(strHTML);
				$(target).parent().removeClass('type1');
				totalUploadImgCnt++;
			};
			reader.readAsDataURL(obj.files[0]);
		},
		error: function (xhr, textStatus, errorThrown) {
			alert('이미지 업로드 실패');
		},
	});
}

function CommentLike(cmtId, select, kind) {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd: 'SNS_COMMENT_LIKE_SAVE',
			cmtId: cmtId,
			kind: kind
		},
		success: function (data) {
			if (data.header.process == 'success') {
				let cnt = Number(select.data('cnt'));
				let strHtml = '';
				if (kind == 0) {
					cnt++;
					strHtml += '<span aria-hidden="true" class="icon_heart_md on"><img src="../resources/images/common/icon/svg/heart24.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += cnt;
					alert('댓글에 좋아요를 누르셨습니다.');
				} else {
					cnt--;
					strHtml += '<span aria-hidden="true" class="icon_heart_md"><img src="../resources/images/common/icon/svg/heart24.svg" class="icon_svg_inject" alt=""></span>';
					strHtml += cnt;
					alert('댓글에 좋아요가 취소되었습니다.');
				}
				select.html(strHtml);
				select.data('cnt', cnt);
			}
		}
	});
}

function OpenReportPopup(cmtId) {
	if (loginYn == 'Y') {
		if (cmtId) {
			reportcmtId = cmtId;
			layerPopup.layerShow('reportPop1');
		} else {
			alert("오류가 발생하였습니다. 새로고침 후 다시 시도해주세요.")
		}
	} else {
		showLogin(2);
	}
}

function ReportCommentImage() {
	let choice = $('input:radio[name="reportForm1"]:checked').val();

	if (!choice) {
		alert('신고 사유를 선택해 주세요.');
		return;
	}

	if (choice == '기타') {
		if ($('#reportReason').val().length > 0) {
			choice = '기타(' + $('#reportReason').val() + ')';
		} else {
			alert('기타 사유를 입력해 주세요.');
			return;
		}
	}

	if (reportCheck == false) {
		reportCheck = true;

		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd: 'USER_COMMENT_NOTIFY',
				cmtId: reportcmtId,
				info: choice,
				type: 2
			},
			success: function (data) {
				reportCheck = false;
				if (data.header.process == 'success') {
					alert("신고가 접수되었습니다.");
					location.reload();
				} else {
					alert('새로고침 후 다시 시도해주세요');
				}
			}
		});
	}
}

function commentresize(obj) {
	if ($(obj).outerHeight() < 80) {
		$(obj).outerHeight(80);
		$($(obj).parent()).outerHeight(80);
	} else if ($(obj).outerHeight() >= 80) {
		$(obj)[0].style.height = 'auto';
		$(obj).outerHeight($(obj).prop('scrollHeight'));
		$($(obj).parent())[0].style.height = 'auto';
		$($(obj).parent()).outerHeight($(obj).prop('scrollHeight'));
		if ($(obj).outerHeight() < 80) {
			$(obj).outerHeight(80);
			$($(obj).parent()).outerHeight(80);
		}
	}
}

function getContentPictureList() {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_COMMENT_PICTURES',
			cotid : cotid
		},
		success: function(data) {
			drawPictureImage(data.body);
		},
		complete: function() {
			CommentDefaultSetting();
		}
	});
}

function drawPictureImage(data) {
	if (data.count === 0) {
		var strPictureAreaHtml = '';
		strPictureAreaHtml += `<span class="icon_alert1_xlg" aria-hidden="true"><img src="../resources/images/common/icon/svg/alert32_01.svg" class="icon_svg_inject" alt=""></span>`;
		strPictureAreaHtml += `<p>등록된 사진 후기가 없습니다.</p>`;

		$('#pictureBtn').hide();
		$('#pictureArea')[0].className = '';
		$('#pictureArea').addClass('no_data');
		$('#pictureArea').html(strPictureAreaHtml);
		$('#pictureArea').show();
		return;
	}

	$('#pictureBtn').show();
	$('#pictureArea')[0].className = '';
	$('#pictureArea').addClass('swiper-container');
	$('#pictureArea').html('<div class="swiper-wrapper" id="pictureBtnArea"></div>');
	$('#galleryArea').html('');
	$('#thumbsArea').html('');

	$.each(data.imgList, function (index, items) {
		let strBtnHtml = '';
		var limit = data.imgList.length > 9 ? 9 : data.imgList.length;

		// 사진 후기
		if (index < limit) {
			strBtnHtml += `<div class="swiper-slide" onclick="moveImgPopup('${items.imgId}')">`;
			strBtnHtml += '		<img src="' + mainimgurl + items.imgId + '&mode=custom&width=127&height=127" />';
			strBtnHtml += `</div>`;
		} else if (index === limit) {
			strBtnHtml += `<div class="swiper-slide last" onclick="moveImgPopup('${items.imgId}')">`;
			strBtnHtml += '		<img src="' + mainimgurl + items.imgId + '&mode=custom&width=127&height=127" />';
			strBtnHtml += `		<span>${data.count >= 100 ? '99+' : data.count}</span>`;
			strBtnHtml += `</div>`;
		}
		$('#pictureBtnArea').append(strBtnHtml);
	});

	$.each(data.allImgList, function (index, items) {
		let profileImg = '';
		var snsImg = '';

		if (items.snsType == '99') {	// admin
			profileImg = '../resources/images/sub/profile_50x50.gif';
		} else {
			if (items.profileChk == 'Y') {
				profileImg = mainimgurl + items.profileImgId;
			} else if ($.trim(items.url) != '') {
				// 카카오톡 이미지 http로 불러오는 문제 해결
				profileImg = items.url.replace('http://', 'https://');
				profileImg = profileImg.replace('th-p.talk.kakao.co.kr', 'k.kakaocdn.net');
			} else {
				profileImg = '../resources/images/common/icon_header_profile2.png';
			}
		}

		if (items.snsType == '4') {
			snsImg = '<img src="../resources/images/sub/ico_naver.png" alt="네이버">';
		} else if (items.snsType == '0') {
			snsImg = '<img src="../resources/images/sub/ico_facebook.png" alt="페이스북">';
		} else if (items.snsType == '1') {
			snsImg = '<img src="../resources/images/sub/ico_twitter.png" alt="트위터">';
		} else if (items.snsType == '5') {
			snsImg = '<img src="../resources/images/sub/ico_kakao.png" alt="카카오">';
		} else if (items.snsType == '6') {
			snsImg = '<img src="../resources/images/sub/ico_plus.png" alt="구글">';
		} else if (items.snsType == '2') {
			snsImg = '<img src="../resources/images/sub/ico_insta2.png" alt="인스타그램">';
		} else if (items.snsType == '7') {
			snsImg = '<img src="../resources/images/sub/ico_apple.png" alt="애플">';
		}

		// 사진 모아보기 갤러리
		let strGalleryHtml = ``;
		strGalleryHtml += `<div class="swiper-slide" data-id="${items.imgId}">`;
		strGalleryHtml += `		<div class="wrap">`;
		strGalleryHtml += `			<img src="${mainimgurl + items.imgId}" />`;
		strGalleryHtml += `		</div>`;
		strGalleryHtml += `		<div class="tit_wrap">`;
		strGalleryHtml += `			<div class="profile">`;
		strGalleryHtml += `				<div class="photo">`;
		strGalleryHtml += `					<img src="${profileImg}" alt="구석이 님의 프로필 사진" onerror="this.src='../resources/images/common/icon_header_profile2.png'"/>`;
		strGalleryHtml += `				</div>`;
		strGalleryHtml += `				<span class="ico">${snsImg}</span>`;
		strGalleryHtml += `			</div>`;
		strGalleryHtml += `			<em>${items.screenName}</em>`;
		strGalleryHtml += `		</div>`;
		strGalleryHtml += `</div>`;
		$('#galleryArea').append(strGalleryHtml);

		// 사진 모아보기 썸네일
		let strThumbnailHtml = ``;
		strThumbnailHtml += `<div class="swiper-slide ${index === 0? 'on' : ''}">`;
		strThumbnailHtml += `	<a href="javascript:;" style="background-image:url(${mainimgurl + items.imgId});">text</a>`;
		strThumbnailHtml += `</div>`;
		$('#thumbsArea').append(strThumbnailHtml);
	});

	var pictureSwiper = new Swiper($('#pictureArea'), {
		spaceBetween: 8,
		slidesPerView: "auto",
		watchOverflow: true,
	})

	/* 여행톡 이미지 뷰어 슬라이드 */
	imgPopupGallerySwiper = new Swiper('#imgViewPop .gallery-top', {
		spaceBetween: 0,
		observer: true,
		observeParents: true,
		navigation: {
			nextEl: '#imgViewPop .swiper-button-next',
			prevEl: '#imgViewPop .swiper-button-prev',
		},
		pagination: {
			el: '#imgViewPop .swiper-pagination',
			type: 'fraction',
		},
		scrollbar: {
			el: "#imgViewPop .swiper-scrollbar",
			hide: false,
		},
		breakpoints: {
			1024: {
				spaceBetween: 10,
			}
		},
		on: {
			slideChangeTransitionEnd: function () { // slideChange 이벤트
				var activeIndex = this.activeIndex; // 현재 활성 슬라이드 인덱스
				setActiveThumbPopup(activeIndex); // 활성 슬라이드와 연동하여 클래스 업데이트
			},
		},

	});

	imgPopupThumbnailSwiper = new Swiper('#imgViewPop .gallery-thumbs', {
		spaceBetween: 0,
		slidesPerView: 'auto',
		slidesOffsetAfter:0,
		observer: true,
		observeParents: true,
		touchRatio: 0.5,
		threshold: 10,
		watchSlidesProgress: true,
		slideToClickedSlide: true,
		keyboard: {
			enabled: true,
			onlyInViewport: false,
		},
	});

	imgPopupGallerySwiper.controller.control = imgPopupThumbnailSwiper;
	imgPopupThumbnailSwiper.controller.control = imgPopupGallerySwiper;

	$('#imgViewPop .gallery-thumbs .swiper-slide a').each(function (index) {
		$(this).attr('tabindex', '0');

		$(this).on('keydown', function (event) {
			if (event.key === 'Enter') {
				imgPopupGallerySwiper.slideTo(index);
				setActiveThumbPopup(index);
			}
		});

		$(this).on('click', function () {
			imgPopupGallerySwiper.slideTo(index);
			setActiveThumbPopup(index);
		});
	});
}

function setActiveThumbPopup(index) {
	$('#imgViewPop .gallery-thumbs .swiper-slide a').removeClass('on');
	$('#imgViewPop .gallery-thumbs .swiper-slide').eq(index).find('a').addClass('on');
}

function moveImgPopup(imgId) {
	const index = $(`#galleryArea .swiper-slide`).index(
		$(`#galleryArea .swiper-slide[data-id="${imgId}"]`)
	);

	imgPopupGallerySwiper.slideTo(index);
	layerPopup.layerShow('imgViewPop');
	setActiveThumbPopup(index);

	setTimeout(() => {
		imgPopupGallerySwiper.slideTo(index, 300);
		imgPopupGallerySwiper.update();
	}, 100);
}

function changeOnlyPicture() {
	isPictureOnly = $('#onlyCommentPicture').is(':checked');
	reloadCommend();
}

function reloadCommend() {
	spage = 1;
	scnt = pcnt;
	firstcomment = 0;
	cmtId = '';
	$('.review_list ul li').remove();
	getContentFirstCommentInfo();
}

function changeOrderType(orderParam, d) {
	orderType = orderParam;
	$('.review_filter button').removeClass('on');
	$(d).addClass('on');
	reloadCommend();
}

function commentMore(cmtId, isOpen) {
	if (isOpen) {
		$(`#${cmtId}_more_open`).show();
		$(`#${cmtId}_more_close`).hide();
	}
	else {
		$(`#${cmtId}_more_open`).hide();
		$(`#${cmtId}_more_close`).show();
	}
}

function imageFileDelete(isComment, imgIndex, parentCmtId, doc) {
	$(doc).parent().remove();

	if (isComment) {
		delete commentImageMap[imgIndex];
		if ($('#cmtImgArea span').length === 0) {
			$('#cmtImgArea').hide();
		}
	}
	else {
		delete recommentImageMap[parentCmtId][imgIndex];
		if ($('#cmtImgArea' + parentCmtId + ' span').length === 0) {
			$('#cmtImgArea' + parentCmtId).hide();
		}
	}
}

function textareaLimit(dom) {
	dom.addEventListener('input', function() {
		const maxLength = this.getAttribute('maxlength');
		if (this.value.length > maxLength) {
			this.value = this.value.slice(0, maxLength);
		}
	});
}

function getGptComment() {
	$.ajax({
		url: mainurl + '/call',
		dataType: 'json',
		type: "POST",
		data: {
			cmd : 'CONTENT_COMMENT_GPT',
			cotid : cotid
		},
		success: function(data) {
			drawGptComment(data);
		},
		complete: function() {
			commentHideLoading();
		}
	});
}

function drawGptComment(data) {
	if (data.body.result.gptComment) {
		$('#ai_area').show();
		$('#ai_blur').hide();
		$('#ai_title').html(data.body.result.gptComment.title.replaceAll('<br>', ''));
		$('#ai_content').html(data.body.result.gptComment.summary);
	} else {
		$('#ai_area').hide();
		$('#ai_blur').show();
	}
}

function returnCommentImage(flag, fileName, saveName, fullPath) {
	if ( flag == true || flag == "true" ) {
		var dot = saveName.indexOf(".");
		saveName = saveName.substr(0,dot);
		fullPath = fullPath.replace('/data/images','');

		var fileuploadList = saveName + '|' + fullPath;

		if (!photoUploadId) {
			commentImageMap[totalUploadImgCnt] = fileuploadList;
		} else {
			if (!recommentImageMap[photoUploadId]) {
				recommentImageMap[photoUploadId] = {};
			}

			recommentImageMap[photoUploadId][totalUploadImgCnt] = fileuploadList;
		}

		let strHTML = '';
		var fileName2 = fileName.substring(fileName.length-4,fileName.length);

		strHTML += `<span>`;
		strHTML += `	<img src="${mainfileurlpath + saveName + fileName2}" alt="여행 이미지"/>`;
		strHTML += `	<button type="button" aria-label="삭제" onclick="imageFileDelete(${(!!photoUploadId)}, ${totalUploadImgCnt}, '${photoUploadId}',this)">`;
		strHTML += `		<span class="icon_close1_lg" aria-hidden="true"><img src="../resources/images/common/icon/svg/close24_01.svg" class="icon_svg_inject" alt=""></span>`;
		strHTML += `	</button>`;
		strHTML += `</span>`;

		var target = '#cmtImgArea' + photoUploadId;
		$(target).show();
		$(target).append(strHTML);
		$(target).parent().removeClass('type1');
		totalUploadImgCnt++;
	}
	else {
		alert('파일저장에 실패하였습니다.');
	}
}