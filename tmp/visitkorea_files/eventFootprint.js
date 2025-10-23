let FootPrintData;
let stampStarCheck
	//발도장 아이콘 띄우기
	function goStampView(data) {
		FootPrintData = data.body;
		if(appYn == 'N'){
			if (navigator.geolocation)
				navigator.geolocation.getCurrentPosition(getStampLocation);
		} else {
			location.href = "location:?getXY=location";
		}
	}

	function getStampLocation(position){
		var x = position.coords.latitude;
		var y = position.coords.longitude;
		setStampLocation(x,y);
	}


	function setStampLocation(x,y) {
		permitLocation = 'N';
		if (x > 0 && x < 10000) {
			locationx = x;
			getLocationYn = 'Y';
			permitLocation = 'Y';
		}
		if (y > 0 && y < 10000) {
			locationy = y;
			getLocationYn = 'Y';
			permitLocation = 'Y'
		}
		setStampBtn();
	}

	function setStampBtn(){
		try{
			const distance = setDist(getDistanceFromLatLonInKm(Number(locationx), Number(locationy), Number(FootPrintData.detail.mapY), Number(FootPrintData.detail.mapX)));
			if (FootPrintData.stampEnabled.enabled != 1
				|| distance >= 0.6) {
				$('#stamp').hide();
				$('#stampOk1').hide();
				return;
			}

			//진행중 이벤트 여부 체크
			if( FootPrintData.fptEvent.length != 0) { // 진행중
				//이벤트 진행중 발도장 여부 체크
				if (FootPrintData.eventStampCnt > 0) {  // 진행중인 이벤트 내 발도장 찍은적있을시
					let cnt = 0;
					$.each(FootPrintData.fptEvent, function (index, items) {
						if(items.ENTRY_CHK == 'Y') {
							cnt += 1;
						}
					});

					if(FootPrintData.fptEvent.length == cnt) { //발도장 이미 참여함, 진행중 이벤트 모두 참여
						setStampBtnType1();
					} else { //발도장 이미 참여함, 진행중 이벤트 모두 참여xx
						setStampBtnType2();
					}
				} else { // 진행중인 이벤트 내 발도장 찍은적없을시
					setStampBtnType3();
				}
			} else { //미진행중
				$('.eventJoinBtn').hide();
				//진행중 이벤트 없음. 하루 1회 발도장 참여 가능
				if (FootPrintData.stampCnt == 0) { //오늘 발도장 참여x
					setStampBtnType4();
				} else { //오늘 발도장 이미 참여
					setStampBtnType5();
				}
			}
		} catch (e){
			alert(e);
		}
	}

	const setStampBtnType1 = () =>{
		$('#stamp').show();
		$('#stampOk1').hide();
		$('#stampOk4').show();
		if ($('#chattingbanner').css('display') == 'block')
			$('#chattingbanner').css('display', 'none');
		$('#stampOk4').attr("onclick",`footprintBtn(1, 1, 'Y',${FootPrintData.fptEvent.length});`);
	}

	const setStampBtnType2 = () =>{
		$('#stamp').show();
		$('#stampOk1').hide();
		$('#stampOk3').show();
		if ($('#chattingbanner').css('display') == 'block')
			$('#chattingbanner').css('display', 'none');
		$('#stampOk3').attr("onclick",`footprintBtn(1, 0, 'Y',${FootPrintData.fptEvent.length});`);
	}
	const setStampBtnType3 = () =>{
		$('#stamp').show();
		$('#stampOk1').hide();
		$('#stampOk2').show();
		if(eventChk == 'N') {
			$('#stampOk2').attr("onclick", "footprintBtn(0, 0, 'N', 0);");
			if ($('#chattingbanner').css('display') == 'block')
				$('#chattingbanner').css('display', 'none');
		} else {
			$('#stampOk2').attr("onclick", "footprintBtn(0, 0, 'Y', "+FootPrintData.fptEvent.length+");");
			if ($('#chattingbanner').css('display') == 'block')
				$('#chattingbanner').css('display', 'none');
		}
	}

	const setStampBtnType4 = () =>{
		$('#stamp').show();
		$('#stampOk1').attr("onclick", "footprintBtn(0, 0, 'N', 0);");
		if ($('#chattingbanner').css('display') == 'block')
			$('#chattingbanner').css('display', 'none');
	}
	const setStampBtnType5 = () =>{
		$('#stamp').addClass('off');
		$('#stamp').show();
		if ($('#chattingbanner').css('display') == 'block')
			$('#chattingbanner').css('display', 'none');
		$('#stampOk1').attr("onclick","footprintBtn(1, 0, 'N', 0);");
	}

	//발도장 찍기 전 로그인 체크
	function stampLoginChk() {
		if (loginYn === 'Y') {
			if(stampStarCheck === 1) {
				layerPopup.layerShow('stampfinishPop2');
				$('.eventJoinBtn').hide();
			} else {
				$('input[name="rating"]').removeAttr('checked')
				layerPopup.layerShow('stampexpressionPop');
			}
		} else {
			showLogin(2);
		}
	}

	function userStampStarCheck() {
		$.ajax({
			url: mainurl + '/call',
			dataType: 'json',
			type: "POST",
			data: {
				cmd: 'FOOTPRINT_USER_STAR_CHECK',
				cotId : cotid,
				snsId : snsId
			},
			success: function (data) {
				stampStarCheck = data.body.check
			},
			error: function (xhr, textStatus, errorThrown) {
			}
		});
	}
	
	//발도장 이벤트 참여 후 뜨는 팝업
	function getFootprintEventChk(ftpChk) {
		$('#fptEventInfoListDiv').empty();
		
		$.ajax({
			url : mainurl + '/call',
			dataType : 'json',
			type : "POST",
			data : {
				cmd : 'GET_MS_DETAIL_FOOTPRINT_EVENT_LIST',
				cotId : cotid,
				orderBy : 'join'
			},
			success : function(data) {

				setFootprintEventPop(data,ftpChk);
				//슬라이드 2개부터 실행
 				function swiperAd(){	 
					if( data.body.result != null && data.body.result != "" && data.body.result != undefined ) {
						if(data.body.result.length > 1){
							$('.stamp_slide').addClass('js_slider');
							var swiper = new Swiper(".stamp_slide .swiper-container", {
								observer: true,
								observeParents: true,
								loop:true,
								navigation: {
									nextEl: ".swiper-button-next",
									prevEl: ".swiper-button-prev",
								},
								pagination: {
									el: ".swiper-pagination",
									type: "fraction",
								},
							});
						}			
					}
				}
				swiperAd(); 
				
				$("#checkAll").click(function() {
					if($("#checkAll").is(":checked")) $("input[name=chk]").prop("checked", true);
					else $("input[name=chk]").prop("checked", false);
				});

				$("input[name=chk]").click(function() {
					var total = $("input[name=chk]").length;
					var checked = $("input[name=chk]:checked").length;

					if(total != checked) $("#checkAll").prop("checked", false);
					else $("#checkAll").prop("checked", true); 
				});
				
			},
			complete : function() {
			},
			error : function(xhr, textStatus, errorThrown) {
			}
		});
	}

	function setFootprintEventPop(data,ftpChk){

		if(data.body.result) {
			//이벤트 선택 팝업
			seteventlistPop01(data);

			if(data.body.result.length == 1) {
				//진행중 이벤트 1개
				if(data.body.result[0].ENTRY_CHK == 'Y') {
					//이벤트 전부참여
					$("#stampOk4").show();

					if(ftpChk == 'Y') {
						//발도장O 이벤트 모두참여O 진행중이벤트 한개
						setFinishPopType1(data,ftpChk);
					} else {
						//발도장처음 이벤트 모두참여O 한개
						setFinishPopType2(data);
					}
				} else {
					$('#stampOk1').hide();
					$('#stampOk3').show();
					$('.paging').css('display','none');
					$('#stampOk3').attr("onclick","layerPopup.layerShow('stampfinishPop9');");
				}
			} else {
				//진행중 이벤트 여러개
				let joinCnt = 0;
				let cnt = data.body.result.length;

				$.each(data.body.result, function (index, items) {
					if(items.ENTRY_CHK == 'Y') {
						joinCnt += 1;
					}
				});
				if(joinCnt == cnt) {
					//이벤트 전부참여
					if(ftpChk == 'Y') {
						//발도장O 이벤트 모두참여O 진행중이벤트 여러개
						setFinishPopType3(data);
					} else {
						setFinishPopType4(data);
					}
				} else {

					if(ftpChk == 'Y') {
						//발도장O 이벤트 모두참여X 진행중이벤트 여러개
						setFinishPopType5(data);
					} else {
						//발도장처음 이벤트 모두참여X 진행중이벤트 여러개
						setFinishPopType6(data);
					}
				}
			}
		} else {
			//진행중인 이벤트 없음
			footprintSave();

			$('#fptTitle').text($('#topTitle').text());
			layerPopup.layerShow('stampexpressionPop');

			$('#stamp').addClass('off');
			$('#stampOk1').attr("onclick",
				"stampLoginChk();");
		}
	}

function seteventlistPop01(data){
	let html = '';
	$.each(data.body.result, function (index, items) {
		let startDate = items.START_DATE.substr(0,10);
		let endDate = items.END_DATE.substr(0,10);

		if(items.ENTRY_CHK == 'Y') {
			html += '<div class="check off">';
		} else {
			html += '<div class="check">';
		}

		html += '<span class="form">';
		if(items.ENTRY_CHK == 'Y') {
			html += `<input type="checkbox" id="${items.EVT_ID}" disabled>`;
		} else {
			html += `<input type="checkbox" id="${items.EVT_ID}" name="chk">`;
		}
		html += `<label for="${items.EVT_ID}">이벤트 선택</label>`;
		html += '</span>';
		if(items.ENTRY_CHK == 'Y') {
			html += `<strong class="sstit"><a href="${mainurl}/detail/event_detail.do?cotid=${items.EVENT_COT_ID}" disabled>${items.EVENT_TITLE}</a></strong>`;
		} else {
			html += `<strong class="sstit"><a href="${mainurl}/detail/event_detail.do?cotid=${items.EVENT_COT_ID}">${items.EVENT_TITLE}</a></strong>`;
		}
		html += '<ul>';
		html += `<li id="eventDate${index}">`;
		html += '<em>이벤트 기간</em>';
		html += `<p>${conDateFormat(startDate,"yyyy-MM-dd",".")}~${conDateFormat(endDate,"yyyy-MM-dd",".")}</p>`;
		html += '</li>';
		html += `<li id="eventContents${index}">`;
		html += '<em>이벤트 내용</em>';
		html += `<p>${items.CONTENTS}</p>`;
		html += '</li>';
		html += `<li id="eventInfo${index}">`;
		html += '<em>이벤트 혜택</em>';
		html += `<p>${items.GOODS_INFO}</p>`;
		html += '</li>';
		html += '</ul>';
		html += '</div>';
	});
	html += '<div class="all_check">';
	html += '<input type="checkbox" id="checkAll">';
	html += '<label for="checkAll">전체 선택하기</label>';
	html += '</div>';

	html += '<div class="btn type1">';
	html += `<a href="javascript:onlyStamp('${data.body.result[0].TITLE}',${data.body.result.length});">발도장만 남길게요</a>`;
	html += '<a href="javascript:getInfoPop();">발도장 남기고 <br>이벤트 참여하기</a>';
	html += '</div>';

	$('#fptEventInfoListDiv').html(html);
}

const setFinishPopType1 = (data,ftpChk) =>{
	layerPopup.layerShow('stampfinishPop10');
	$('#stampfinishPop10_paging').css('display','none');

	let html = '';

	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	html += '<li class="swiper-slide">';
	html += `<span class="ev_tit">${data.body.result[0].EVENT_TITLE}</span>`;
	html += '<span class="arrival">';
	html += '“이벤트에 참여 완료 하셨습니다.”';
	html += '</span>';
	html += '</li>';
	html += '</ul>';
	html += '<div class="paging" id="stampfinishPop10_paging" style="display:none;">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';

	$('#stampfinishPop10_many').html(html);

	$("#stampOk4").show();
	$('#stampOk4').attr("onclick","layerPopup.layerShow('stampfinishPop10');");

	if(prizeType[0] == "이미당첨"){
		if(prizeTitle[0] != "") {
			$('.arrival').text(`“${prizeTitle[0]}에 당첨되었습니다.”`);
		}
	}
}

const setFinishPopType2 = (data) =>{
	layerPopup.layerShow('stampfinishPop3');
	$('.stampfinishPop3_paging').css('display','none');

	let html = '';

	html += `<strong class="ellipsis"><span>${data.body.result[0].TITLE}</span></strong>`;
	html += '<strong>발도장 남기기 완료!</strong>';
	html += '<div class="stamp_slide">';
	html += '<div class="swiper-container">';
	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	html += '<li class="swiper-slide">';
	html += `<span class="ev_tit">${data.body.result[0].EVENT_TITLE}</span>`;
	const needCnt = data.body.result[0].CERTI_QNT;
	const ftpCnt = data.body.result[0].THIS_FOOTPRINT_CNT;


	if(data.body.result[0].ELECT_TYPE == 0) {
		//추후선정
		if(data.body.result[0].CERTI_STAT == 1) {
			if((needCnt - ftpCnt) > 0) {
				html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
				html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
			} else {
				//미션 완료
				html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
				if(data.body.result[0].ANNOUNCE_DATE) {
					html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(data.body.result[0].ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
				}
			}
		} else {
			html += '<strong><em>발도장 '+ftpCnt+'개 인증 완료!</em></strong>';
			if(data.body.result[0].ANNOUNCE_DATE) {
				html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(data.body.result[0].ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
			}
		}
	} else {
		//즉시당첨
		html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
		//debugger;
		if(prizeId) {
			if(prizeType[0] == "당첨"){
				html += `<span class="arrival">축하드립니다.<br/><em>“${data.body.result[0].GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
			}else if(prizeType[0] == "경품소진"){
				html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
			}else if(prizeType[0] == "이미당첨"){
				if(prizeTitle[0] != "") {
					html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[0]}”</em>에 당첨되셨습니다.</span>`;
				} else {
					html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
				}
			}
		} else {
			if((needCnt - ftpCnt) > 0)
				html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
		}
	}

	html += '</li>';
	html += '</ul>';
	html += '<div class="paging" style="display:none;">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '<p class="notice">';
	html += '※ 발도장은 각 여행지별 1일 1회 남길 수 있습니다.<br/>';
	html += '단, 이벤트 참여 시에는 한 여행지당 이벤트 기간 내<br/>';
	html += '1회만 발도장을 남길 수 있습니다.';
	html += '</p>';

	$('#stampfinishPop3_many').html(html);
	$("#stampOk4").show();
	$('#stampOk4').attr("onclick","layerPopup.layerShow('stampfinishPop10');");

	html = '';

	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	html += '<li class="swiper-slide">';
	html += `<span class="ev_tit">${data.body.result[0].EVENT_TITLE}</span>`;
	html += '<span class="arrival">';
	html += '“이벤트에 참여 완료 하셨습니다.”';
	html += '</span>';
	html += '</li>';
	html += '</ul>';
	html += '<div class="paging" id="stampfinishPop10_paging" style="display:none;">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';

	$('#stampfinishPop10_many').html(html);

	if(prizeType[0] == "이미당첨"){
		if(prizeTitle[0] != "") {
			$('.arrival').text(`“${prizeTitle[0]}에 당첨되었습니다.”`);
		}
	}
}

const setFinishPopType3 = (data) =>{
	layerPopup.layerShow('stampfinishPop10');
	$('#stampfinishPop10_paging').css('display','block');

	let html = '';

	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	$.each(data.body.result, function (index, items) {
		html += '<li class="swiper-slide">';
		html += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
		const needCnt = items.CERTI_QNT;
		const ftpCnt = items.THIS_FOOTPRINT_CNT;

		if(items.ELECT_TYPE == 0) {
			//추후선정
			if(items.CERTI_STAT == 1) {
				if((needCnt - ftpCnt) > 0) {
					html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
					html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
				} else {
					//미션 완료
					html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
					if(items.ANNOUNCE_DATE) {
						html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
					}
				}
			} else {
				html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
				if(items.ANNOUNCE_DATE) {
					html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
				}
			}
		} else {
			//즉시당첨
			let prizeIndex;
			for(var z=0; z<prizeId.length; z++){
				if(items.EVT_ID == prizeId[z]){
					prizeIndex = z;
				}
			}
			html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
			if(items.CERTI_STAT == 1) {
				if((needCnt - ftpCnt) <= 0) {
					if(items.EVT_ID == prizeId[prizeIndex]){
						if(prizeType[prizeIndex] == "당첨"){
							html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
						}else if(prizeType[prizeIndex] == "경품소진"){
							html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
						}else if(prizeType[prizeIndex] == "이미당첨"){
							if(prizeTitle[prizeIndex] != "") {
								html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
							} else {
								html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
							}
						}
					} else {
						if(items.GIFT_TITLE) {
							html += `<span class="arrival"><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
						} else {
							html += '<span class="arrival">';
							html += '“이벤트에 참여 완료 하셨습니다.”';
							html += '</span>';
						}
					}
				} else {
					if((needCnt - ftpCnt) > 0)
						html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
				}
			} else {
				if(items.EVT_ID == prizeId[prizeIndex]){
					if(prizeType[prizeIndex] == "당첨"){
						html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
					}else if(prizeType[prizeIndex] == "경품소진"){
						html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
					}else if(prizeType[prizeIndex] == "이미당첨"){
						if(prizeTitle[prizeIndex] != "") {
							html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
						} else {
							html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
						}
					}
				} else {
					html += `<span class="arrival"><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
				}
			}
		}
		html += '</li>';
	});
	html += '</ul>';
	html += '<div class="paging" id="stampfinishPop10_paging">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';

	$('#stampfinishPop10_many').html(html);

	$("#stampOk4").show();
	$('#stampOk4').attr("onclick","layerPopup.layerShow('stampfinishPop10');");
}

const setFinishPopType4 = (data) =>{
	//발도장처음 이벤트 모두참여O 진행중이벤트 여러개
	layerPopup.layerShow('stampfinishPop3');
	$('.stampfinishPop3_paging').css('display','block');

	let html = '';

	html += `<strong class="ellipsis"><span>${data.body.result[0].TITLE}</span></strong>`;
	html += '<strong>발도장 남기기 완료!</strong>';
	html += '<div class="stamp_slide">';
	html += '<div class="swiper-container">';
	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	$.each(data.body.result, function (index, items) {
		html += '<li class="swiper-slide">';
		html += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
		const needCnt = items.CERTI_QNT;
		const ftpCnt = items.THIS_FOOTPRINT_CNT;

		if(items.ELECT_TYPE == 0) {
			//추후선정
			if(items.CERTI_STAT == 1) {
				if((needCnt - ftpCnt) > 0) {
					html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
					html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
				} else {
					//미션 완료
					html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
					if(items.ANNOUNCE_DATE) {
						html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
					}
				}
			} else {
				html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
				if(items.ANNOUNCE_DATE) {
					html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
				}
			}
		} else {
			//즉시당첨
			let prizeIndex;
			for(var z=0; z<prizeId.length; z++){
				if(items.EVT_ID == prizeId[z]){
					prizeIndex = z;
				}
			}
			html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
			if(items.CERTI_STAT == 1) {
				if((needCnt - ftpCnt) <= 0) {
					if(items.EVT_ID == prizeId[prizeIndex]){
						if(prizeType[prizeIndex] == "당첨"){
							html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
						}else if(prizeType[prizeIndex] == "경품소진"){
							html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
						}else if(prizeType[prizeIndex] == "이미당첨"){
							if(prizeTitle[prizeIndex] != "") {
								html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
							} else {
								html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
							}
						}
					} else {
						if(items.GIFT_TITLE) {
							html += `<span class="arrival"><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
						} else {
							html += '<span class="arrival">';
							html += '“이벤트에 참여 완료 하셨습니다.”';
							html += '</span>';
						}
					}
				} else {
					if((needCnt - ftpCnt) > 0)
						html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
				}
			} else {
				if(items.EVT_ID == prizeId[prizeIndex]){
					if(prizeType[prizeIndex] == "당첨"){
						html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
					}else if(prizeType[prizeIndex] == "경품소진"){
						html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
					}else if(prizeType[prizeIndex] == "이미당첨"){
						if(prizeTitle[prizeIndex] != "") {
							html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
						} else {
							html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
						}
					}
				} else {
					html += `<span class="arrival"><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
				}
			}
		}
		html += '</li>';
	});
	html += '</ul>';
	html += '<div class="paging">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '<p class="notice">';
	html += '※ 발도장은 각 여행지별 1일 1회 남길 수 있습니다.<br/>';
	html += '단, 이벤트 참여 시에는 한 여행지당 이벤트 기간 내<br/>';
	html += '1회만 발도장을 남길 수 있습니다.';
	html += '</p>';

	$('#stampfinishPop3_many').html(html);

	$("#stampOk4").show();
	$('#stampOk4').attr("onclick","layerPopup.layerShow('stampfinishPop10');");

	html = '';

	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	$.each(data.body.result, function (index, items) {
		html += '<li class="swiper-slide">';
		html += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
		html += '<span class="arrival">';
		if(items.GIFT_TITLE) {
			html += `“${items.GIFT_TITLE}에 당첨되었습니다.”`;
		} else {
			html += '“이벤트에 참여 완료 하셨습니다.”';
		}

		html += '</span>';
		html += '</li>';
	});
	html += '</ul>';
	html += '<div class="paging" id="stampfinishPop10_paging">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';

	$('#stampfinishPop10_many').html(html);


}

const setFinishPopType5 = (data) =>{
	layerPopup.layerShow('stampfinishPop9');
	$('.stampfinishPop9_paging').css('display','block');

	var html = '';

	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';

	$.each(data.body.result, function (index, items) {
		html += '<li class="swiper-slide">';
		html += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
		const needCnt = items.CERTI_QNT;
		const ftpCnt = items.THIS_FOOTPRINT_CNT;

		if(items.ELECT_TYPE == 0) {
			//추후선정
			if(items.ENTRY_CHK == 'Y'){
				if(items.CERTI_STAT == 1) {
					if((needCnt - ftpCnt) > 0) {
						html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
						html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
					} else {
						//미션 완료
						html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
						if(items.ANNOUNCE_DATE) {
							html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
						}
					}
				} else {
					html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
					if(items.ANNOUNCE_DATE) {
						html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
					}
				}
			} else {
				html += '<span class="arrival">';
				html += '“이벤트에 아직 참여하지 않으셨네요.<br/>';
				html += '오늘 남긴 발도장으로 이벤트 응모가 가능합니다.<br/> ';
				html += '이벤트에 참여해 볼까요?”';
				html += '</span>';
			}
		} else {
			//즉시당첨
			//순서가 맞지 않아요!! 라는 alert이 발생 시 아래 Index-1을 prizeInde로 대체

			if(items.ENTRY_CHK == 'Y'){
				let prizeIndex;
				for(var z=0; z<prizeId.length; z++){
					if(items.EVT_ID == prizeId[z]){
						prizeIndex = z;
					}
				}
				html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;


				if(items.CERTI_STAT == 1) {
					if((needCnt - ftpCnt) <= 0) {
						if(items.EVT_ID == prizeId[prizeIndex]){
							if(prizeType[prizeIndex] == "당첨"){
								html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
							}else if(prizeType[prizeIndex] == "경품소진"){
								html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
							}else if(prizeType[prizeIndex] == "이미당첨"){
								if(prizeTitle[prizeIndex] != "") {
									html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
								} else {
									html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
								}
							}
						} else {
							//html += '<span class="ev_tit">'+items.EVENT_TITLE+'</span>';
							if(items.GIFT_TITLE) {
								html += `<span class="arrival"><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
							} else {
								html += '<span class="arrival">';
								html += '“이벤트에 참여 완료 하셨습니다.”';
								html += '</span>';
							}
						}
					} else {
						if((needCnt - ftpCnt) > 0)
							html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
					}
				} else {
					if(items.EVT_ID == prizeId[prizeIndex]){
						if(prizeType[prizeIndex] == "당첨"){
							html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
						}else if(prizeType[prizeIndex] == "경품소진"){
							html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
						}else if(prizeType[prizeIndex] == "이미당첨"){
							if(prizeTitle[prizeIndex] != "") {
								html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
							} else {
								html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
							}
						}
					} else {
						html += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
						html += '<span class="arrival">';
						html += '“이벤트에 참여 완료 하셨습니다.”';
						html += '</span>';
					}
				}
				/*} else {
                    html += '<span class="arrival">';
                    html += '“이벤트에 참여 완료 하셨습니다.”';
                    html += '</span>';
                }*/

			} else {
				html += '<span class="arrival">';
				html += '“이벤트에 아직 참여하지 않으셨네요.<br/>';
				html += '오늘 남긴 발도장으로 이벤트 응모가 가능합니다.<br/> ';
				html += '이벤트에 참여해 볼까요?”';
				html += '</span>';
			}
		}

		html += '</li>';

		// ehtml += '<li class="swiper-slide">';
		// ehtml += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
		// if(items.ENTRY_CHK == 'Y') {
		// 	ehtml += '<span class="arrival">';
		// 	ehtml += '“이벤트에 참여 완료 하셨습니다.”';
		// 	ehtml += '</span>';
		// 	ehtml += '</li>';
		// } else {
		// 	ehtml += '<span class="arrival">';
		// 	ehtml += '“이벤트에 아직 참여하지 않으셨네요.<br/>';
		// 	ehtml += '오늘 남긴 발도장으로 이벤트 응모가 가능합니다.<br/> ';
		// 	ehtml += '이벤트에 참여해 볼까요?”';
		// 	ehtml += '</span>';
		// 	ehtml += '</li>';
		// }
	});
	html += '</ul>';
	html += '<div class="paging" id="stampfinishPop9_paging">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';

	$("#stampfinishPop9_btn").attr("href","javascript:layerPopup.layerHide('stampfinishPop9');layerPopup.layerShow('eventlistPop01'); setPopCss();");

	$('#stampfinishPop9_many').html(html);

	$("#stampOk3").show();
	$('#stampOk3').attr("onclick","layerPopup.layerShow('stampfinishPop9');");
}

const setFinishPopType6 = (data) =>{
	layerPopup.layerShow('stampfinishPop3');
	$('.stampfinishPop3_paging').css('display','block');

	var html = '';
	var ehtml = '';

	html += `<strong class="ellipsis"><span>${data.body.result[0].TITLE}</span></strong>`;
	html += '<strong>발도장 남기기 완료!</strong>';
	html += '<div class="stamp_slide">';
	html += '<div class="swiper-container">';
	html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	ehtml += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
	$.each(data.body.result, function (index, items) {
		html += '<li class="swiper-slide">';
		html += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
		const needCnt = items.CERTI_QNT;
		const ftpCnt = items.THIS_FOOTPRINT_CNT;

		if(items.ELECT_TYPE == 0) {
			//추후선정
			if(items.ENTRY_CHK == 'Y'){
				if(items.CERTI_STAT == 1) {
					if((needCnt - ftpCnt) > 0) {
						html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
						html += `<p class="txt1">미션 완료까지 <em>${(needCnt - ftpCnt)}개 발도장</em>이 더 필요해요!</p>`;
					} else {
						//미션 완료
						html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
						if(items.ANNOUNCE_DATE) {
							html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
						}
					}
				} else {
					html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;
					if(items.ANNOUNCE_DATE) {
						html += `<span class="prizewinner">당첨자 발표일 : ${conDateFormat(items.ANNOUNCE_DATE,"yyyy.MM.dd",".")}</span>`;
					}
				}
			} else {
				html += '<span class="arrival">';
				html += '“이벤트에 아직 참여하지 않으셨네요.<br/>';
				html += '오늘 남긴 발도장으로 이벤트 응모가 가능합니다.<br/> ';
				html += '이벤트에 참여해 볼까요?”';
				html += '</span>';
			}
		} else {
			//즉시당첨
			//순서가 맞지 않아요!! 라는 alert이 발생 시 아래 Index-1을 prizeInde로 대체

			if(items.ENTRY_CHK == 'Y'){
				let prizeIndex;
				for(var z=0; z<prizeId.length; z++){
					if(items.EVT_ID == prizeId[z]){
						prizeIndex = z;
					}
				}
				html += `<strong><em>발도장 ${ftpCnt}개 인증 완료!</em></strong>`;

				if(items.CERTI_STAT == 1) {
					if((needCnt - ftpCnt) <= 0) {
						if(items.EVT_ID == prizeId[prizeIndex]){
							if(prizeType[prizeIndex] == "당첨"){
								html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
							}else if(prizeType[prizeIndex] == "경품소진"){
								html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
							}else if(prizeType[prizeIndex] == "이미당첨"){
								if(prizeTitle[prizeIndex] != "") {
									html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
								} else {
									html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
								}
							}
						} else {
							html += '<span class="ev_tit">'+items.EVENT_TITLE+'</span>';
							html += '<span class="arrival">';
							html += '“이벤트에 참여 완료 하셨습니다.”';
							html += '</span>';
						}
					} else {
						if((needCnt - ftpCnt) > 0)
							html += '<p class="txt1">미션 완료까지 <em>'+(needCnt - ftpCnt)+'개 발도장</em>이 더 필요해요!</p>';
					}
				} else {
					if(items.EVT_ID == prizeId[prizeIndex]){
						if(prizeType[prizeIndex] == "당첨"){
							html += `<span class="arrival">축하드립니다.<br/><em>“${items.GIFT_TITLE}”</em>에 당첨되셨습니다.</span>`;
						}else if(prizeType[prizeIndex] == "경품소진"){
							html += '<span class="arrival">“아쉽지만 선착순 종료되었습니다!<br/>다음 이벤트를 기대해 주세요”</span>';
						}else if(prizeType[prizeIndex] == "이미당첨"){
							if(prizeTitle[prizeIndex] != "") {
								html += `<span class="arrival">축하드립니다.<br/><em>“${prizeTitle[prizeIndex]}”</em>에 당첨되셨습니다.</span>`;
							} else {
								html += '<span class="arrival">“이미 당첨된 이벤트 입니다”</span>';
							}
						}
					}  else {
						html += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
						html += '<span class="arrival">';
						html += '“이벤트에 참여 완료 하셨습니다.”';
						html += '</span>';
					}
				}

			} else {
				html += '<span class="arrival">';
				html += '“이벤트에 아직 참여하지 않으셨네요.<br/>';
				html += '오늘 남긴 발도장으로 이벤트 응모가 가능합니다.<br/> ';
				html += '이벤트에 참여해 볼까요?”';
				html += '</span>';
			}
		}

		html += '</li>';

		ehtml += '<li class="swiper-slide">';
		ehtml += `<span class="ev_tit">${items.EVENT_TITLE}</span>`;
		if(items.ENTRY_CHK == 'Y') {
			ehtml += '<span class="arrival">';
			if(prizeId != null && prizeId != "" && prizeId != undefined) {
				//	if(items.EVT_ID == prizeId[z]){
				//if(prizeType[prizeIndex] == "이미당첨"){
				//if(prizeTitle[prizeIndex] != "") {
				if((needCnt - ftpCnt) <= 0) {
					if(items.GIFT_TITLE) {
						ehtml += `“${items.GIFT_TITLE}에 당첨되었습니다.”`;
					} else {
						ehtml += '“이벤트에 참여 완료 하셨습니다.”';
					}
				} else {
					ehtml += '“이벤트에 참여 완료 하셨습니다.”';
				}
				//}
				/*} else {
                    ehtml += '“이벤트에 참여 완료 하셨습니다.”';
                }*/
				/*} else {
                    ehtml += '“이벤트에 참여 완료 하셨습니다.”';
                }*/
			} else {
				ehtml += '“이벤트에 참여 완료 하셨습니다.”';
			}
			ehtml += '</span>';
			ehtml += '</li>';
		} else {
			ehtml += '<span class="arrival">';
			ehtml += '“이벤트에 아직 참여하지 않으셨네요.<br/>';
			ehtml += '오늘 남긴 발도장으로 이벤트 응모가 가능합니다.<br/> ';
			ehtml += '이벤트에 참여해 볼까요?”';
			ehtml += '</span>';
			ehtml += '</li>';
		}
	});
	html += '</ul>';
	html += '<div class="paging">';
	html += '<div class="inr">';
	html += '<div class="swiper-button-next">다음</div>';
	html += '<div class="swiper-button-prev">이전</div>';
	html += '<div class="swiper-pagination"></div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '<p class="notice">';
	html += '※ 발도장은 각 여행지별 1일 1회 남길 수 있습니다.<br/>';
	html += '단, 이벤트 참여 시에는 한 여행지당 이벤트 기간 내<br/>';
	html += '1회만 발도장을 남길 수 있습니다.';
	html += '</p>';

	ehtml += '</ul>';
	ehtml += '<div class="paging" id="stampfinishPop9_paging">';
	ehtml += '<div class="inr">';
	ehtml += '<div class="swiper-button-next">다음</div>';
	ehtml += '<div class="swiper-button-prev">이전</div>';
	ehtml += '<div class="swiper-pagination"></div>';
	ehtml += '</div>';
	ehtml += '</div>';

	$('#stampfinishPop3_many').html(html);
	$('#stampfinishPop9_many').html(ehtml);

	$("#stampOk3").show();
	$('#stampOk3').attr("onclick","layerPopup.layerShow('stampfinishPop9');");

	$('.stampfinishPop9_paging').css('display','block');

	$("#stampfinishPop9_btn").attr("href","javascript:layerPopup.layerHide('stampfinishPop9');layerPopup.layerShow('eventlistPop01'); setPopCss();");

}
	//발도장 플로팅아이콘 클릭 이벤트
	function footprintBtn(fptJoin, evtJoin, evtChk, evtCnt) {
		if (loginYn == 'Y') {
		
			if(appYn == 'Y') {
				location.href = "app://checkMockLocationApp";
			}
			
			let device = appYn == 'Y' ? 'APP' : mobileYn == 'Y' ? 'MOBILE' : 'PC';
			
			/*
				fptJoin : 발도장 참여 여부 0:미참여 1:참여
				evtJoin : 이벤트 모두 참여 여부 0:모두참여x 1:모두참여o
				evtChk : 진행중인 이벤트 여부 'Y':진행중이벤트O 'N':진행중이벤트X
				evtCnt : 진행중인 이벤트 개수
			*/
			
			if(fptJoin == 0 && evtJoin == 0 && evtChk == 'Y') {
				//발도장X 이벤트참여X 진행중이벤트O
				
				if(evtCnt == 1) {
					//진행중 이벤트 1개
					setFootprintPop(1, 'one');
				} else {
					//진행중 이벤트 여러개
					setFootprintPop(1, 'many');
				}
				
			} else if(fptJoin == 0 && evtJoin == 0 && evtChk == 'N') {
				//발도장X 이벤트참여X 진행중이벤트X
				setFootprintPop(0, null);
				
			} else if(fptJoin == 1 && evtJoin == 1 && evtChk == 'Y') {
				//발도장O 이벤트 모두참여O 진행중이벤트O
				
				if(evtCnt == 1) {
					//진행중 이벤트 1개
					setFootprintPop(2, 'one');
				} else {
					//진행중 이벤트 여러개
					setFootprintPop(2, 'many');
				}
				
			} else if(fptJoin == 1 && evtJoin == 0 && evtChk == 'Y') {
				//발도장O 이벤트참여X 진행중이벤트O
				
				if(evtCnt == 1) {
					//진행중 이벤트 1개
					setFootprintPop(3, 'one');
				} else {
					//진행중 이벤트 여러개
					setFootprintPop(3, 'many');
					
				}
				
			} else if(fptJoin == 1 && evtJoin == 0 && evtChk == 'N') {
				//발도장O 이벤트참여X 진행중이벤트X
				stampLoginChk();
			}
		} else {
			showLogin(2);
		}
	}
	
	
	function fptIconChange(title) {
		$('#fptTitle').text(title);
		
		$('#stampOk1').hide();
		$('#stampOk3').show(); 
		$('#stampOk3').attr("onclick","stampLoginChk();");
	}
	
	var yn;
	var type;
	var cnt;
	
	//발도장 플로팅아이콘 팝업 셋팅
	function setFootprintPop(type,cnt) {
		let device = appYn == 'Y' ? 'APP' : mobileYn == 'Y' ? 'MOBILE' : 'PC';
	//$('#fptEventInfoListDiv').empty();
		/*
			type 1 : 발도장X 이벤트참여X 진행중이벤트O
			type 2 : 발도장O 이벤트 모두참여O 진행중이벤트O
			type 3 : 발도장O 이벤트참여X 진행중이벤트O
		*/
		
		$.ajax({
			url : mainurl + '/call',
			dataType : 'json',
			type : "POST",
			data : {
				cmd : 'GET_MS_DETAIL_FOOTPRINT_EVENT_LIST',
				cotId : cotid
			},
			success : function(data) {
				if( data.body.result != null && data.body.result != "" && data.body.result != undefined ) {
					var html = '';
					
					$.each(data.body.result, function (index, items) {
						var startDate = items.START_DATE;
	            		var endDate = items.END_DATE;
	            		startDate = startDate.substr(0,10);
	            		endDate = endDate.substr(0,10);
	            		
						if(items.ENTRY_CHK == 'Y') {
							html += '<div class="check off">';
						} else {
							html += '<div class="check">';
						}
						html += '<span class="form">';
						if(items.ENTRY_CHK == 'Y') {
							html += '<input type="checkbox" id="'+items.EVT_ID+'" disabled>';
						} else {
							html += '<input type="checkbox" id="'+items.EVT_ID+'" name="chk">';
						}
						html += '<label for="'+items.EVT_ID+'">이벤트 선택</label>';
						html += '</span>';
						if(items.ENTRY_CHK == 'Y') {
							html += '<strong class="sstit"><a href="'+mainurl+'/detail/event_detail.do?cotid='+items.EVENT_COT_ID+'" disabled>'+items.EVENT_TITLE+'</a></strong>';
						} else {
							html += '<strong class="sstit"><a href="'+mainurl+'/detail/event_detail.do?cotid='+items.EVENT_COT_ID+'">'+items.EVENT_TITLE+'</a></strong>';
						}
						html += '<ul>';
						html += '<li id="eventDate'+index+'">';
						html += '<em>이벤트 기간</em>';
						html += '<p>'+conDateFormat(startDate,"yyyy-MM-dd",".")+' ~ '+conDateFormat(endDate,"yyyy-MM-dd",".")+'</p>';
						html += '</li>';
						html += '<li id="eventContents'+index+'">';
						html += '<em>이벤트 내용</em>';
						html += '<p>'+items.CONTENTS+'</p>';
						html += '</li>';
						html += '<li id="eventInfo'+index+'">';
						html += '<em>이벤트 혜택</em>';
						html += '<p>'+items.GOODS_INFO+'</p>';
						html += '</li>';
						html += '</ul>';
						html += '</div>';
					});
					html += '<div class="all_check">';
					html += '<input type="checkbox" id="checkAll">';
					html += '<label for="checkAll">전체 선택하기</label>';
					html += '</div>';
					
					html += '<div class="btn type1">';
					html += '<a href="javascript:onlyStamp(\''+data.body.result[0].TITLE+'\','+data.body.result.length+');">발도장만 남길게요</a>';
					html += '<a href="javascript:getInfoPop();">발도장 남기고 <br>이벤트 참여하기</a>';
					html += '</div>';

					$('#fptEventInfoListDiv').html(html);
					
					
					if(type == 1 && cnt == "one") {
						//발도장X 이벤트참여X 진행중이벤트 1개
						getInfoPop2(data.body.result[0].EVT_ID);
					} else if(type == 1 && cnt == "many") {
						//발도장X 이벤트참여X 진행중이벤트 여러개
						layerPopup.layerShow('eventlistPop01');
						setPopCss();
						
					} else if(type == 2 && cnt == "one") {
						//발도장O 이벤트 모두참여O 진행중이벤트 1개
						layerPopup.layerShow('stampfinishPop10');
						$('.paging').css('display','none');
						
						$('.ev_tit').text(data.body.result[0].EVENT_TITLE);
						
						if(data.body.result[0].GIFT_TITLE != null) {
							var html = '“'+data.body.result[0].GIFT_TITLE+'에 당첨되었습니다.”';
							
							$('.arrival').text(html);
						}

					} else if(type == 2 && cnt == "many") {
						//발도장O 이벤트 모두참여O 진행중이벤트 여러개
						layerPopup.layerShow('stampfinishPop10');
						$('#stampfinishPop10_paging').css('display','block');
						
						var html = '';
						
						html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
						
						$.each(data.body.result, function (index, items) {
							html += '<li class="swiper-slide">';
							html += '<span class="ev_tit">'+items.EVENT_TITLE+'</span>';
							if(items.GIFT_TITLE != null) {
								html += '<span class="arrival">';
								html += '“'+items.GIFT_TITLE+'에 당첨되었습니다.”';
								html += '</span>';
							} else {
								html += '<span class="arrival">';
								html += '“이벤트에 참여 완료 하셨습니다.”';
								html += '</span>';
							}
							html += '</li>';
						});
						html += '</ul>';
						html += '<div class="paging" id="stampfinishPop10_paging">';
						html += '<div class="inr">';
						html += '<div class="swiper-button-next">다음</div>';
						html += '<div class="swiper-button-prev">이전</div>';
						html += '<div class="swiper-pagination"></div>';
						html += '</div>';
						html += '</div>';

						$('#stampfinishPop10_many').html(html);
						
					} else if(type == 3 && cnt == "one") {
						//발도장O 이벤트참여X 진행중이벤트 1개
						layerPopup.layerShow('stampfinishPop9');
						$('#stampfinishPop9_paging').css('display','none');
						$("#stampfinishPop9_btn").attr("href","javascript:location.href='app://checkMockLocationApp';layerPopup.layerHide('stampfinishPop9');getInfoPop2('"+data.body.result[0].EVT_ID+"');");
						$('.ev_tit').text(data.body.result[0].EVENT_TITLE);
					} else if(type == 3 && cnt == "many") {
						//발도장O 이벤트참여X 진행중이벤트 여러개
						
						layerPopup.layerShow('stampfinishPop9');
						$('.stampfinishPop9_paging').css('display','block');
						
						var html = '';
						
						html += '<ul class="swiper-wrapper"><!-- 이벤트 2개부터 슬라이드 -->';
						
						$.each(data.body.result, function (index, items) {
							html += '<li class="swiper-slide">';
							html += '<span class="ev_tit">'+items.EVENT_TITLE+'</span>';
							if(items.ENTRY_CHK == 'Y') {
								if(items.GIFT_TITLE != null) {
									html += '<span class="arrival">';
									html += '“'+items.GIFT_TITLE+'에 당첨되었습니다.”';
									html += '</span>';
								} else {
									html += '<span class="arrival">';
									html += '“이벤트에 참여 완료 하셨습니다.”';
									html += '</span>';
								}
								html += '</li>';
							} else {
								html += '<span class="arrival">';
								html += '“이벤트에 아직 참여하지 않으셨네요.<br/>';
								html += '오늘 남긴 발도장으로 이벤트 응모가 가능합니다.<br/> ';
								html += '이벤트에 참여해 볼까요?”';
								html += '</span>';
								html += '</li>';
							}
						});
						html += '</ul>';
						html += '<div class="paging" id="stampfinishPop9_paging">';
						html += '<div class="inr">';
						html += '<div class="swiper-button-next">다음</div>';
						html += '<div class="swiper-button-prev">이전</div>';
						html += '<div class="swiper-pagination"></div>';
						html += '</div>';
						html += '</div>';

						$("#stampfinishPop9_btn").attr("href","javascript:layerPopup.layerHide('stampfinishPop9');layerPopup.layerShow('eventlistPop01'); setPopCss();");
						
						$('#stampfinishPop9_many').html(html);
						
					} else if(type == 0) {
						//이벤트 있지만 발도장만 체크
						var title = data.body.result[0].TITLE;
						var length = data.body.result.length ? data.body.result.length  : 0;
						if(eventChk == 'N') {
				    		$('#fptTitle').text(title);
				    		layerPopup.layerShow('stampexpressionPop');

				    		footprintSave();
				    		
				    		$('#stamp').addClass('off');
				    		
				    		$('#stamp').show();
							$('#stampOk1').hide();
							$('#stampOk3').show();
							
							if ($('#chattingbanner').css('display') == 'block')
								$('#chattingbanner').css('display', 'none');

							if (device == 'APP') {
								$('#stampOk3').attr("onclick","footprintBtn(1, 0, 'Y', "+length+");");
							} 
							/*else {
								$('#stampOk3').attr("onclick","layerPopup.layerShow('stampfinishPop2');");
								$('.eventJoinBtn').hide();
							}*/
				    	} else {
							$('#fptTitle').text(title);
							// layerPopup.layerShow('stampfinishPop1');
							layerPopup.layerShow('stampexpressionPop');

							footprintSave();
							
							$('#stamp').addClass('off');
							$('#stampOk2').hide();
							$('#stampOk3').show();
							
							$('#stampOk3').attr("onclick",
									"stampLoginChk();");
				    	}
		    	
					}
					
				} else {
					//발도장 찍기(이벤트x)
					$('#fptTitle').text($('#topTitle').text());
					layerPopup.layerShow('stampexpressionPop');

					footprintSave();
					
					$('#stamp').addClass('off');
					$('#stampOk1').attr("onclick","footprintBtn(1, 0, 'N', 0);");
				} 
				
				//슬라이드 2개부터 실행
 				function swiperAd(){	
 					if( data.body.result != null && data.body.result != "" && data.body.result != undefined ) {
						if(data.body.result.length > 1){
							$('.stamp_slide').addClass('js_slider');
							var swiper = new Swiper(".stamp_slide .swiper-container", {
								observer: true,
								observeParents: true,
								loop:true,
								navigation: {
									nextEl: ".swiper-button-next",
									prevEl: ".swiper-button-prev",
								},
								pagination: {
									el: ".swiper-pagination",
									type: "fraction",
								},
							});
						}	
					}		
				}
				swiperAd(); 
				
				$("#checkAll").click(function() {
					if($("#checkAll").is(":checked")) $("input[name=chk]").prop("checked", true);
					else $("input[name=chk]").prop("checked", false);
				});

				$("input[name=chk]").click(function() {
					var total = $("input[name=chk]").length;
					var checked = $("input[name=chk]:checked").length;

					if(total != checked) $("#checkAll").prop("checked", false);
					else $("#checkAll").prop("checked", true); 
				});
				
			},
			complete : function() {
			},
			error : function(xhr, textStatus, errorThrown) {
			}
		});
	}
	
	
	var eventArray;
	
	var isName = 0;
	var isTel = 0;
	var isGender = 0;
	var isAge = 0;
	var isAddr = 0;
	var isJob = 0;
	var isEmail = 0;
	var isRegion = 0;
	var isEtc = 0;
	var terms = 0;
	var terms2 = 0;
	
	function getInfoPop() {
		/*if(appYn != 'Y') {
			alert('해당 페이지는 대한민국 구석구석 앱에서만 접근 가능합니다!');
			location.href = "/forward/"+cotid+"/"+bigCat+"/"+midCat+"/"+bigArea;
			return;
		}*/
		
		/*이벤트 개인정보 입력 팝업 띄우기*/
		
		
		isName = 0;
		isTel = 0;
		isGender = 0;
		isAge = 0;
		isAddr = 0;
		isJob = 0;
		isEmail = 0;
		isRegion = 0;
		isEtc = 0;
		terms = 0;
		terms2 = 0;

		infoClear();
		eventArray = new Array();
        	
        for(var i=0; i < $("input[name='chk']:checked").length; i++) {
			eventArray.push($("input[name='chk']:checked")[i].id);
        };
        
        
        if(eventArray.length == 0) {
        	alert("참여하실 이벤트를 선택해주세요.");
        	return;
        }
        $.ajax({
			url : mainurl + '/call',
			dataType : 'json',
			type : "POST",
			data : {
				cmd : 'GET_FOOTPRINT_SUB_INFO',
				eventArray : eventArray.toString(),
				cotId : cotId
			},
			success : function(data) {
				$(".infoList").remove();
				
				var infoChk = null;
				$.each(data.body.result, function (index, items) {
					
					if(items.ALL_ENTRY_CHK == null) {
						if(items.IS_NAME == 1) {
							$('#isName').show();
							isName = items.IS_NAME;
						}
						if(items.IS_TEL == 1) {
							$('#isTel').show();
							$('#phoneInfo').show();
							isTel = items.IS_TEL;
						}
						if(items.IS_GENDER == 1) {
							$('#genAge').show();
							$('#isGender').show();
							isGender = items.IS_GENDER;
						}
						if(items.IS_AGE == 1) {
							$('#genAge').show();
							$('#isAge').show();
							isAge = items.IS_AGE;
						}
						if(items.IS_ADDR == 1) {
							$('#isAddr').show();
							isAddr = items.IS_ADDR;
						}
						if(items.IS_JOB == 1) {
							$('#isJob').show();
							isJob = items.IS_JOB;
						}
						if(items.IS_EMAIL == 1) {
							$('#isEmail').show();
							isEmail = items.IS_EMAIL;
						}
						if(items.IS_REGION == 1) {
							$('#isRegion').show();
							isRegion = items.IS_REGION;
						}
						if(items.IS_ETC == 1) {
							$('#isEtc').show();
							isEtc = items.IS_ETC;
						}
						if(items.PRIVACY1_AGREE_YN == 1) {
							$('.sstit.termsarea').show();
							$('.enentClause.termsarea').show();
							$('#terms').html(items.TERMS);
							terms = items.PRIVACY1_AGREE_YN;
						}
						if(items.PRIVACY2_AGREE_YN == 1) {
							$('.sstit.termsarea2').show();
							$('.enentClause.termsarea2').show();
							$('#terms2').html(items.PRIVACY2_AGREE_CONT);
							terms2 = items.PRIVACY2_AGREE_YN;
						}
						
						infoChk = 'Y';
						var html = '<input type="hidden" class="infoList" id="info'+items.EVT_ID+'" name="'+items.IS_NAME+','+items.IS_TEL+','+items.IS_GENDER+','+items.IS_AGE+','+items.IS_ADDR+','+items.IS_JOB+','+items.IS_EMAIL+','+items.IS_REGION+','+items.IS_ETC+','+items.ETC_NM+'" />';
						$('#rouletPop').append(html);
					} else {
						
						var html = '<input type="hidden" class="infoList" id="info'+items.EVT_ID+'" name="" />';
						$('#rouletPop').append(html);
					}
					
				});
			        layerPopup.layerHide('eventlistPop01');
			        
			        if(infoChk == null) {
						
						enterInfo2();
			        } else {
			       		 layerPopup.layerShow('rouletPop');
			        }
			},
			complete : function() {
			},
			error : function(xhr, textStatus, errorThrown) {
			}
		});
        
	}
	
	function getInfoPop2(evtId) {
		/*if(appYn != 'Y') {
			alert('해당 페이지는 대한민국 구석구석 앱에서만 접근 가능합니다!');
			location.href = "/forward/"+cotid+"/"+bigCat+"/"+midCat+"/"+bigArea;
			return;
		}*/
		/*이벤트 개인정보 입력 팝업 띄우기*/
		isName = 0;
		isTel = 0;
		isGender = 0;
		isAge = 0;
		isAddr = 0;
		isJob = 0;
		isEmail = 0;
		isRegion = 0;
		isEtc = 0;
		terms = 0;
		terms2 = 0;
		
		infoClear();
		
		eventArray = new Array();
        eventArray.push(evtId);
        
        if(eventArray.length == 0) {
        	alert("참여하실 이벤트를 선택해주세요.");
        	return;
        }
        
        $.ajax({
			url : mainurl + '/call',
			dataType : 'json',
			type : "POST",
			data : {
				cmd : 'GET_FOOTPRINT_SUB_INFO',
				eventArray : eventArray.toString(),
				cotId : cotId
			},
			success : function(data) {
				$(".infoList").remove();
				
				var infoChk = null;
				$.each(data.body.result, function (index, items) {
					if(items.ALL_ENTRY_CHK == null) {
					
						if(items.IS_NAME == 1) {
							$('#isName').show();
							isName = items.IS_NAME;
						}
						if(items.IS_TEL == 1) {
							$('#isTel').show();
							$('#phoneInfo').show();
							isTel = items.IS_TEL;
						}
						if(items.IS_GENDER == 1) {
							$('#genAge').show();
							$('#isGender').show();
							isGender = items.IS_GENDER;
						}
						if(items.IS_AGE == 1) {
							$('#genAge').show();
							$('#isAge').show();
							isAge = items.IS_AGE;
						}
						if(items.IS_ADDR == 1) {
							$('#isAddr').show();
							isAddr = items.IS_ADDR;
						}
						if(items.IS_JOB == 1) {
							$('#isJob').show();
							isJob = items.IS_JOB;
						}
						if(items.IS_EMAIL == 1) {
							$('#isEmail').show();
							isEmail = items.IS_EMAIL;
						}
						if(items.IS_REGION == 1) {
							$('#isRegion').show();
							isRegion = items.IS_REGION;
						}
						if(items.IS_ETC == 1) {
							$('#isEtc').show();
							isEtc = items.IS_ETC;
						}
						if(items.PRIVACY1_AGREE_YN == 1) {
							$('.sstit.termsarea').show();
							$('.enentClause.termsarea').show();
							$('#terms').html(items.TERMS);
							terms = items.PRIVACY1_AGREE_YN;
						}
						if(items.PRIVACY2_AGREE_YN == 1) {
							$('.sstit.termsarea2').show();
							$('.enentClause.termsarea2').show();
							$('#terms2').html(items.PRIVACY2_AGREE_CONT);
							terms2 = items.PRIVACY2_AGREE_YN;
						}
						
						infoChk = 'Y';
						var html = '<input type="hidden" class="infoList" id="info'+items.EVT_ID+'" name="'+items.IS_NAME+','+items.IS_TEL+','+items.IS_GENDER+','+items.IS_AGE+','+items.IS_ADDR+','+items.IS_JOB+','+items.IS_EMAIL+','+items.IS_REGION+','+items.IS_ETC+','+items.ETC_NM+'" />';
						$('#rouletPop').append(html);
					} else {
						
						var html = '<input type="hidden" class="infoList" id="info'+items.EVT_ID+'" name="" />';
						$('#rouletPop').append(html);
					}
					
				});
			        
		        if(infoChk == null) {
					enterInfo2();
		        } else {
		       		 layerPopup.layerShow('rouletPop');
		        }
			},
			complete : function() {
			},
			error : function(xhr, textStatus, errorThrown) {
			}
		});
        
	}
	
	function infoClear() {
		$('#joinName').val(null);
		$("#telNum01 option:eq(0)").prop("selected", true);
		$('#telNum02').val(null);
		$('#telNum03').val(null);
		$("#joinGender option:eq(0)").prop("selected", true);
		$("#joinAge option:eq(0)").prop("selected", true);
		$('#adrsForm').val(null);
		$('#jobForm').val(null);
		$('#mailForm').val(null);
		$("#areaForm option:eq(0)").prop("selected", true);
		$('#etcForm').val(null);
		$('#terms').val(null);
		$("#joinAssent02").attr("checked", true);
		$('#terms2').val(null);
		$("#joinAssent04").attr("checked", true);
		
		$('#isName').hide();
		$('#isTel').hide();
		$('#phoneInfo').hide();
		$('#genAge').hide();
		$('#isAddr').hide();
		$('#isJob').hide();
		$('#isEmail').hide();
		$('#isRegion').hide();
		$('#isEtc').hide();
		$('.sstit').hide();
		$('.enentClause').hide();
	}

	function setAreaNameByConAreaCode(paramAreaCode) {
		const areaNameArray = ['footprint_seoul', 'footprint_incheon', 'footprint_daejeon', 'footprint_daegu',
				'footprint_gyoungju', 'footprint_busan', 'footprint_ulsan', 'footprint_sajong', 'footprint_gyeonggi',
				'footprint_gangwon', 'footprint_chungbuk', 'footprint_chungnam', 'footprint_gyeongbuk', 'footprint_gyeongnam',
				'footprint_jeonbuk', 'footprint_jeonnam', 'footprint_jeju'],
			zoneIdArray = [1, 2, 3, 4, 5, 6, 7, 8, 31, 32, 33, 34, 35, 36, 37, 38, 39];

		for (var i = 0; i < areaNameArray.length; i++) {
			if (zoneIdArray[i] === paramAreaCode) {
				return areaNameArray[i];
			}
		}
		return "footprint";
	}
	
	function footprintSave() {
		/*
			yn - 이벤트참여여부 Y:참여 / N:비참여
			type - 1:발도장x 이벤트참여x / 2:발도장o 이벤트 모두참여o / 3:발도장o 이벤트참여x
			cnt - 진행중이벤트 개수 one:진행중이벤트 1개 / many:진행중이벤트 여러개
		*/
		if (loginYn == 'Y') {
			let device = appYn == 'Y' ? 'APP' : mobileYn == 'Y' ? 'MOBILE' : 'PC';
			$.ajax({
				url : mainurl + '/call',
				dataType : 'json',
				type : "POST",
				data : {
					cmd : 'ADD_STAMP',
					cotId : cotid,
					stampId : stampId,
					device : device,
					areaCode : conAreaCode,
					sigunguCode : conSigunguCode
				},
				success : function(data) {
                    // CDP 데이터 전송 로직.
                    try {
                        getCDPInterface().pushBySpecificFunction({
                            name: '발도장 남기기 완료',
							code: setAreaNameByConAreaCode(conAreaCode),
                        }, 'pushGroobeeDefaultPUTypeData');
                        
                    } catch(e) {
                        console.log('CDP 데이터 전송 중 오류가 발생했습니다.\n', e);
                    }
                    // CDP 데이터 전송 로직, END.
                    
					// layerPopup.layerShow('stampfinishPop1');
					layerPopup.layerShow('stampexpressionPop');
				},
				complete : function() {
				},
				error : function(xhr, textStatus, errorThrown) {
				}
			});
		} else {
			showLogin(2);
		}
	}
	
	// 회원 정보 입력
	function enterInfo(){
		var name = $('#joinName');
		var tel = document.getElementsByName('tel');
		var telNum = tel[0].value + tel[1].value + tel[2].value;
		var gender = $('#joinGender');
		var age = $('#joinAge');
		var addr = $('#adrsForm');
		var job = $('#jobForm');
		var email = $('#mailForm');
		var region = $('#areaForm');
		var etc = $('#etcForm');
		var agree = document.getElementById('joinAssent01');
		var agree2 = document.getElementById('joinAssent03');
		// 정규식 체크
		var regExpStr = /^[a-zA-Z가-힣\ ]{2,7}$/;
		var regExpNum = /^[0-9]*$/;
		
		// 이름 체크
		if (isName != 0) {
			if (name.val() == null || name.val() == '') {
				alert('이름을 입력해주세요.');
				name.focus();
				return;
			}

			if (!regExpStr.test(name.val())) {
				alert('올바른 이름을 입력해주세요.');
				name.focus()
				return;
			}
		}

		//	전화번호 체크
		if (isTel != 0) {
			for(var i = 1; i<tel.length; i++) {
				if($('#telNum02').val() == '' || $('#telNum03').val() == '' ){
					alert("연락처를 입력해주세요");
					return;
				}

				if (!regExpNum.test(tel[i].value)) {
					alert('연락처는 숫자만 입력가능합니다.');
					tel[i].focus();
					return;
				}
			}
		}

		// 성별 체크
		if (isGender != 0) {
			if (gender.val() == 0) {
				alert('성별을 선택해주세요.');
				gender.focus();
				return;
			}
		} 

		// 나이대 체크
		if (isAge != 0) {
			if (age.val() == 0) {
				alert('나이대를 선택해주세요.');
				age.focus();
				return;
			}
		}

		// 주소 체크
		if (isAddr != 0) {
			if (addr.val() == null || addr.val() == '') {
				alert('주소를 입력해주세요.');
				addr.focus();
				return;
			}
		}

		// 직업 체크
		if (isJob != 0) {
			if (job.val() == null || job.val() == '') {
				alert('직업을 입력해주세요.');
				job.focus();
				return;
			}
		}

		// 이메일 체크
		if (isEmail != 0) {
			if (email.val() == null || email.val() == '') {
				alert('이메일을 입력해주세요.');
				email.focus();
				return;
			}
		}

		// 지역 체크
		if (isRegion != 0) {
			if (region.val() == '') {
				alert('지역을 선택해주세요.');
				region.focus();
				return;
			}
		}

		// 개인정보 수집활용 동의 체크
		if(terms != 0) {
			if ($('input:radio[class=joinAssent01]').is(':checked') != true) {
				alert('개인정보 수집 및 이용에 동의를 하셔야 합니다.');
				agree.focus();
				return;
			}
		}

		if(terms2 != 0) {
			if ($('input:radio[class=joinAssent03]').is(':checked') != true) {
				alert('개인정보 제 3자 제공에 동의하셔야 이벤트 참여가 가능합니다.');
				agree2.focus();
				return;
			}
		}

		var evtIdArray = new Array();
		var infoArray = new Array();
		
		for(var i=0; i < $('.infoList').size(); i++) {
			var evtId = $('.infoList')[i].id;
			evtId = evtId.replaceAll("info","");
			
			evtIdArray.push(evtId);
			infoArray.push($('.infoList')[i].name); 
        };
        
		userJson = new Object();

		userJson.name = $.trim(name.val());
		userJson.job = $.trim(job.val());
		userJson.tel = telNum;
		userJson.email = $.trim(email.val());
		userJson.gender = gender.val();
		userJson.age = age.val();
		userJson.region = region.val();
		userJson.etc = $.trim(etc.val());
		userJson.addr = addr.val();
		userJson.evtIdArray = evtIdArray;
		userJson.infoArray = infoArray;
		
        saveUserInfo(userJson);

	}
	
	function enterInfo2(){
		var name = $('#joinName');
		var tel = document.getElementsByName('tel');
		var telNum = tel[0].value + tel[1].value + tel[2].value;
		var gender = $('#joinGender');
		var age = $('#joinAge');
		var addr = $('#adrsForm');
		var job = $('#jobForm');
		var email = $('#mailForm');
		var region = $('#areaForm');
		var etc = $('#etcForm');
		var agree = document.getElementById('joinAssent01');
		var agree2 = document.getElementById('joinAssent03');
		// 정규식 체크
		var regExpStr = /^[a-zA-Z가-힣\ ]{2,7}$/;
		var regExpNum = /^[0-9]*$/;
		
		var evtIdArray = new Array();
		var infoArray = new Array();
		
		for(var i=0; i < $('.infoList').size(); i++) {
			var evtId = $('.infoList')[i].id;
			evtId = evtId.replaceAll("info","");
			
			evtIdArray.push(evtId);
			infoArray.push($('.infoList')[i].name); 
        };

		userJson = new Object();

		userJson.name = $.trim(name.val());
		userJson.job = $.trim(job.val());
		userJson.tel = telNum;
		userJson.email = $.trim(email.val());
		userJson.gender = gender.val();
		userJson.age = age.val();
		userJson.region = region.val();
		userJson.etc = $.trim(etc.val());
		userJson.addr = addr.val();
		userJson.evtIdArray = evtIdArray;
		userJson.infoArray = infoArray;
		
        saveUserInfo(userJson);

	}
	
	let prizeType = [];
	let prizeTitle = [];
	let prizeId = [];
	/*발도장 이벤트 참여*/
	function saveUserInfo(userJson){
		
		$.ajax({
			url : mainurl+'/call',
			dataType : 'json',
			type : 'POST',
			data : {
				cmd : 'SAVE_FOOTPRINT_EVENT',
				cotId : cotid,
				name : userJson.name,
				job : userJson.job,
				tel : userJson.tel,
				email : userJson.email,
				gender : userJson.gender,
				age : userJson.age,
				region : userJson.region,
				etc : userJson.etc,
				addr : userJson.addr,
				evtIdArray : userJson.evtIdArray.toString(),
				infoArray : userJson.infoArray.toString()
//				addrDetail : null,
//				zipCode : null
			},
			success : function(data) {

				prizeType = [];
				prizeTitle = [];
				prizeId = [];
				if( data.body.prizeList != null && data.body.prizeList != "" && data.body.prizeList != undefined ) {
					for(let i=0; i<data.body.prizeList.length; i++){
						prizeType.push(data.body.prizeList[i].prizeType);
						prizeTitle.push(data.body.prizeList[i].prizeTitle);
						prizeId.push(data.body.prizeList[i].prizeId);
					}
				}
				
				if (data.header.process == 'success'){

					// if(data.body.footprintCount <= 0) {
						//발도장 저장
						if (loginYn == 'Y') {
							let device = appYn == 'Y' ? 'APP' : mobileYn == 'Y' ? 'MOBILE' : 'PC';
							$.ajax({
								url : mainurl + '/call',
								dataType : 'json',
								type : "POST",
								data : {
									cmd : 'ADD_STAMP',
									cotId : cotid,
									stampId : stampId,
									device : device,
									areaCode : conAreaCode,
									sigunguCode : conSigunguCode
								},
								success : function(data) {
									getFootprintEventChk('N');
								},
								complete : function() {
								},
								error : function(xhr, textStatus, errorThrown) {
								}
							});
						} else {
							showLogin(2);
						}
						
					// } else {
						//발도장 이미 참여
						// getFootprintEventChk('Y');
					// }
					if($('#rouletPop').css('display') != 'none') {
						layerPopup.layerHide('rouletPop');
					}
				} else if (data.header.process == 'fail'){
					//에러 멘트
					alert(data.header.ment);
					location.reload();
				}
			},
			complete : function(data) {
			},
			error : function(xhr, textStatus, errorThrown){
			}
		});
	}
	
	//발도장만 남기기. 이벤트 참여 X
	function onlyStamp(title,length) {
		let device = appYn == 'Y' ? 'APP' : mobileYn == 'Y' ? 'MOBILE' : 'PC';
		footprintSave();
		layerPopup.layerHide('eventlistPop01');
		fptIconChange(title);
		
		$('#stamp').show();
		$('#stampOk1').hide();
		$('#stampOk3').show();
		
		if ($('#chattingbanner').css('display') == 'block')
			$('#chattingbanner').css('display', 'none');

		if (device == 'APP') {
			$('#stampOk3').attr("onclick","footprintBtn(1, 0, 'Y', "+length+");");
		} 
		/*else {
			$('#stampOk3').attr("onclick","layerPopup.layerShow('stampfinishPop2');");
			$('.eventJoinBtn').hide();
		}*/
	}
	
	 function goEventDetail(cotid) {
  		var linkurl = mainurl+'/detail/event_detail.do?cotid='+cotid;
  		
  		if(linkurl != undefined && linkurl != '' && linkurl != 'undefined') {
			if( appYn == 'Y') {
				if (linkurl.indexOf('korean.visitkorea.or.kr') != -1) {
					location.href = linkurl;
				} else {
					location.href = "opentab://"+linkurl;
				}
			} else {
				if (linkurl.indexOf('korean.visitkorea.or.kr') != -1) {
					location.href = linkurl;
				} else {
					window.open(linkurl);
				}
			}
		}
  		
  	}
  	
  	function AndroidCss2(){
		if(getDevice() == 'Android'){
		var css = '<style> @media screen and (max-width: 1023px){ #rouletPop .layerpop { left : 0 !important; top : 0 !important; margin-left : 2px !important; margin-top :15px !important;}}</style>';
			$('head').append(css);
		}
	}
	
	function setPopCss() {
        	$('#fptEventInfoListDiv ul').each(function(index, item){
	            		 if(mobileYn == 'Y') {
	            			 if($('#eventDate'+index).height() >= 45) {
		            			   $('#eventDate'+index).addClass('type1');
		            		   }
		            		   if($('#eventContents'+index).height() >= 45) {
		            			   $('#eventContents'+index).addClass('type1');
		            		   }
		            		   if($('#eventInfo'+index).height() >= 45) {
		            			   $('#eventInfo'+index).addClass('type1');
		            		   }
	            		 } else {
	            			 if($('#eventDate'+index).height() >= 66) {
		            			   $('#eventDate'+index).addClass('type1');
		            		   }
		            		   if($('#eventContents'+index).height() >= 66) {
		            			   $('#eventContents'+index).addClass('type1');
		            		   }
		            		   if($('#eventInfo'+index).height() >= 66) {
		            			   $('#eventInfo'+index).addClass('type1');
		            		   }
	            		 }
	            	});
	}

	function saveUserStampStars(){
		let starScore = 0
		let condition = ''
		starflag = $('input:radio[name="rating"]:checked');
		starScore = $('input:radio[name="rating"]:checked').val()
		if(starflag.is(":checked")) {
			if(starScore > 3)
				condition = "POSITIVE";
			else if(starScore < 3)
				condition = "NEGATIVE";
			else
				condition = "MIDDLE"

			if (loginYn === 'N') {
				showLogin(2);
			} else {
				$.ajax({
					url: mainurl + '/call',
					dataType: 'json',
					type: "POST",
					data: {
						cmd: 'USER_STAMP_STARS',
						cotId: cotid,
						score: starScore,
						condition: condition,
						snsId: snsId
					},
					success: function (data) {
						alert('평가에 참여해주셔서 감사합니다.')
						layerPopup.layerHide('stampexpressionPop')
						window.location.reload()
					},
					complete: function () {
					},
					error: function (xhr, textStatus, errorThrown) {
					}
				});
			}
		}else
			alert('별점을 선택해주세요!')
	}
	
