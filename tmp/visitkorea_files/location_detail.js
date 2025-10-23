const locationdata = new Object();
let conLocationx = '';
let conLocationy = '';
let mapCenterlocationx = '0';
let mapCenterlocationy = '0';
let mapStat = 'Y';
let geocoder;
let selectedMarker = null;
let map;
let mapMo;
let selectcat = new Array();
let imageSrc, imageSize, imageOption;
let selectMarker;
let selectcotId;
function showPosition(x, y) {


    locationx = x;
    locationy = y;
}

function showPositionNot(x, y) {
    locationx = x;
    locationy = y;
    mapCenterlocationx = x;
    mapCenterlocationy = y;
}

function setLocationMap(data) {

    // 대한민국 위도 및 경도 범위 설정
    var minLat = 32.0, maxLat = 39.0;
    var minLng = 124.0, maxLng = 132.0;

    // 좌표 값이 대한민국의 범위를 벗어나는 경우 surroundingsMap 영역 제거
    if (
        conLocationy < minLat || conLocationy > maxLat ||
        conLocationx < minLng || conLocationx > maxLng
    ) {
        $('.surroundingsMap').remove();
        return;
    }

    locationdata.contentdata = new Object();
    locationdata.viewdata = new Array();

    if (mapStat == 'N' || conLocationy == null || conLocationx == null || conLocationy == 0 || conLocationx == 0 ||
        location.href.indexOf("436398ba-4279-4afc-9300-1d07ed79876e") > -1 ||
        location.href.indexOf("2b35452a-b6b2-47a5-9ba7-296e430f5367") > -1 ||
        location.href.indexOf("c2f43ef5-cdf1-4d9b-a736-003c6e0eeeb0") > -1
    ) {
        $('.surroundingsMap').remove();
        return;
    }


    let container;
    let maplevel;

    container = document.getElementById('map');
    maplevel = 5;


    var options = {
        center: new kakao.maps.LatLng(conLocationy, conLocationx),		//지도 센터 좌표.
        level: maplevel
    };

    map = new kakao.maps.Map(container,options);
    map.setDraggable(false);
    map.setZoomable(false);

    if(mobileYn == 'N'){
        imageSrc = '/resources/images/sub/icon_map_menu06.png';
    } else{
        imageSrc = '/resources/images/sub/icon_map_m_menu06.png';
    }
    imageSize = new kakao.maps.Size(30, 46)
    imageOption = {offset: new kakao.maps.Point(30, 46)};

    var	markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
        markerPosition = new kakao.maps.LatLng(conLocationy, conLocationx); // 마커가 표시될 위치입니다

    // 마커를 생성합니다
    myLocationMarker = new kakao.maps.Marker({
        image: markerImage, // 마커이미지 설정
        position: markerPosition
    });

    myLocationMarker.setMap(map);

    kakao.maps.event.addListener(map, 'center_changed', function() {
        var latlng = map.getCenter();
        mapCenterlocationx = latlng.getLat();
        mapCenterlocationy = latlng.getLng();
    });
}


function mapOpenClose(){
    if(getLocationYn == 'N') {
        getLocation();
        return;
    }

    if(mobileYn == 'Y'){
        setLocationMapMo();
        $('#mapviewPop').css('z-index','109');
    } else {
        $('#map').toggleClass('open');

        map.relayout();
        var moveLatLon = new kakao.maps.LatLng(conLocationy, conLocationx);
        map.panTo(moveLatLon);

        if(!$('#map').hasClass('load')){
            $('#map').addClass('load');

            var gotop = $(".surroundingsMap").offset().top;
            var mapheight = $(".surroundingsMap").height();
            $('.loading svg').css('position','absolute');
            $('.loading svg').css('top',gotop-(mapheight/2)-80);
        }

        if($('#map').hasClass('open')) {
            map.setDraggable(true);
            map.setZoomable(true);
        } else {
            map.setDraggable(false);
            map.setZoomable(false);
        }

        openDetail(cotId);
    }
}

function getLocationList() {
    if(mobileYn == 'N') $('.loading svg').css('position','static');
    showLoding();
    $.ajax({
        url: mainurl+'/call',
        dataType: 'json',
        type: "POST",
        data: {
            cmd : 'MY_LOCATION_CONTENT_LIST',
            locationx : locationx+'',
            locationy : locationy+'',
            radius : 3+''
        },
        success: function(data) {
            if(data.header.process == "success"){
                goLocationListView(data);
            }
        },
        complete: function() {
            // if(mobileYn == 'N') $('.loading svg').css('position','static');
            hideLoding();
        },
        error: function(xhr, textStatus, errorThrown) {
        }
    });
}

function goLocationListView(data) {

    locationdata.contentdata.list = data.body.result;

    locationdata.viewdata = new Array();
    $.each(locationdata.contentdata.list, function (index, items) {
        if(items.cotId != cotId){
            items.type = typecheck(items.contentType,items.cat3);

            let markercontent = '';

            if(  items.type == 'tour' ) {
                markercontent = '<div onclick="openDetail(\''+items.cotId+'\',this,1);" class="marker_1" id="'+items.cotId+'">주변여행지</div>';
            } else if(  items.type == 'food' ) {
                markercontent = '<div onclick="openDetail(\''+items.cotId+'\',this,1);" class="marker_2" id="'+items.cotId+'">음식점</div>';
            } else if(  items.type == 'cafe' ) {
                markercontent = '<div onclick="openDetail(\''+items.cotId+'\',this,1);" class="marker_3" id="'+items.cotId+'">카페</div>';
            } else if(  items.type == 'hotel' ) {
                markercontent = '<div onclick="openDetail(\''+items.cotId+'\',this,1);" class="marker_4" id="'+items.cotId+'">숙소</div>';
            } else if(  items.type == 'parking' ) {
                markercontent = '<div onclick="openDetail(\''+items.cotId+'\',this,1);" class="marker_5" id="'+items.cotId+'">주차장</div>';
            }

            let customOverlay = new kakao.maps.CustomOverlay({
                position: new kakao.maps.LatLng(items.mapY, items.mapX),
                content: markercontent
            });

            items.marker = customOverlay;

            for (let i = 0; i < selectcat.length; i++) {
                if(items.type == selectcat[i]){
                    locationdata.viewdata.push(items);
                    if(mobileYn == 'N')
                        items.marker.setMap(map);
                    else
                        items.marker.setMap(mapMo);

                }
            }
        }
    });

}

function setLocationMapMo() {

    layerPopup.layerShow('mapviewPop');
    $('#mapviewPop .layerpop').css('margin-top', '0px');
    $('#mapviewPop .layerpop').css('top', '0px');

    if (mapStat == 'N' || conLocationy == null || conLocationx == null) {
        $('.surroundingsMap').remove();
        return;
    }

    var container = document.getElementById('mapMo');

    var options = {
        center: new kakao.maps.LatLng(conLocationy, conLocationx),		//지도 센터 좌표.
        level: 4
    };

    mapMo = new kakao.maps.Map(container,options);

    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    var	markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
        markerPosition = new kakao.maps.LatLng(conLocationy, conLocationx); // 마커가 표시될 위치입니다

    // 마커를 생성합니다
    var mymarker = new kakao.maps.Marker({
		image: markerImage, // 마커이미지 설정
        position: markerPosition
    });

    kakao.maps.event.addListener(mapMo, 'center_changed', function() {
        var latlng = mapMo.getCenter();
        mapCenterlocationx = latlng.getLat();
        mapCenterlocationy = latlng.getLng();
    });

    mymarker.setMap(mapMo);

    openDetail(this.cotid);
}

function openDetail(cotId,marker) {
    let detail;
    selectcotId = cotId;

    if(cotId != this.cotId){
        detail = getContentdata(cotId);

        if (selectMarker != null) {
            $(selectMarker).removeClass('on');
            if(mobileYn == 'N'){
                $(selectMarker).parent().css('margin-top', -18 + "px");
                $(selectMarker).parent().css('margin-left', -18 + "px");
            } else{
                $(selectMarker).parent().css('margin-top', -10 + "px");
                $(selectMarker).parent().css('margin-left', -10 + "px");
            }
        }
        if (marker)
            selectMarker = marker;
        else {
            selectMarker = detail.marker;
            map.panTo(new kakao.maps.LatLng(detail.mapY, detail.mapX))
        }
        marKerOn(detail.cotId);
    } else{
        detail = originDetail;
    }

    var mapLayer = $('.wrap_map').find('.layer');

    var title = '';
    var id = '';
    if( detail.cosCotId != undefined &&  detail.cosCotId != '' ) {
        title = detail.cosTitle;
        id = detail.cosCotId;
    } else {
        title = detail.title;
        id = detail.cotId;
    }

    var href = '/detail/detail_view.do?cotid='+id;
    if(id == cotId) href = 'javascript:;';

    var imgPath = '';
    if( detail.imgPath == undefined || detail.imgPath == null || detail.imgPath == 'null' ) {
        imgPath = '/resources/images/common/no_img_01.png';
    } else {
        imgPath = mainimgurl+detail.imgPath+imgmodeThumb;
    }

    mapLayer.find('a').attr('href', href);
    mapLayer.find('strong a').html(title);
    mapLayer.find('img').attr('src', imgPath);
    mapLayer.find('img').attr('alt', title);

    if( permitLocation == 'Y' ) {
        mapLayer.find('.km').show();
        mapLayer.find('.km').html('<p>내 위치에서 ' + setDist(getDistanceFromLatLonInKm(Number(locationx), Number(locationy), Number(detail.mapY), Number(detail.mapX))) + 'km</p>');
    }else mapLayer.find('.km').hide();
    mapLayer.find('.area').html(detail.addr1);

    //즐겨찾기
    if(cotId == this.cotId && contentfavo == true)
        mapLayer.find('.btn .bookmark').addClass('on');
    else if(detail.useFavo != undefined && detail.useFavo > 0)
        mapLayer.find('.btn .bookmark').addClass('on');

    // 좋아요
    if(cotId == this.cotId && contentlike == true)
        mapLayer.find('.btn .good').addClass('on');
    else if(detail.useLike != undefined && detail.useLike > 0)
        mapLayer.find('.btn .good').addClass('on');

    // 길찾기
    var title = encodeURI(conTitle.replace(/\//gi,"_").replace(/,/gi,"."));
    var lx = conLocationx;
    var ly = conLocationy;

    if(mobileYn == 'Y') {
        neviTitle = title;
        neviX = detail.mapX;
        neviY = detail.mapY;
        mapLayer.find('.roadbutton').attr('onclick', "showNevi();");
    } else {
        mapLayer.find('.roadbutton').attr('onclick', "window.open('https://map.kakao.com/link/to/"+title+","+detail.mapY+","+detail.mapX+"');").attr("target","_blank");
    }
    mapLayer.show();
    if(focusjoin != null){
        setTimeout(function() {
            $('#map .layer').focus();
        },10);
    }
}

function typecheck(type,cat){

    if(cat == 'A05020900')
        return 'cafe';
    else if(type == '39')
        return 'food';
    else if(type == '12' || type == '14' || type == '28')
        return 'tour';
    else if (type == '32')
        return 'hotel';
    else if (type == '60000')
        return 'parking';
}

$(document).on("click",".surroundingsMap .map_menu ul li button",function(){
    if($($(this).parent()).hasClass('on'))
        $($(this).parent()).removeClass('on');
    else
        $($(this).parent()).addClass('on');

    let cat = ['tour','food','cafe','hotel','parking'];
    selectcat.length = 0;
    if(mobileYn == 'N'){
        $('.surroundingsMap .map_menu ul li').each(function(index){
            if($(this).hasClass('on')){
                selectcat.push(cat[index]);
            }
        });
    } else{
        $('#mapviewPop .surroundingsMap .map_menu ul li').each(function(index){
            if($(this).hasClass('on')){
                selectcat.push(cat[index]);
            }
        });
    }
    rebuildmakerList();
});

function rebuildmakerList(){

    removeAllmarker();

    if(locationdata.contentdata.list){
        let datalist = getContentTypeData();
        let html = '';
        for (let i = 0; i < datalist.length; i++) {
            if(mobileYn == 'N')
                datalist[i].marker.setMap(map);
            else
                datalist[i].marker.setMap(mapMo);
        }
    } else{
        locationx = conLocationy;
        locationy = conLocationx
        getLocationList();
    }
}

function removeAllmarker(){

    if( locationdata.contentdata.list){
        for (let i = 0; i < locationdata.contentdata.list.length; i++) {
            if(locationdata.contentdata.list[i].marker){
                locationdata.contentdata.list[i].marker.setMap(null);
            }
        }
    }
}

function getContentTypeData(){

    locationdata.viewdata = new Array();

    for (let i = 0; i < locationdata.contentdata.list.length; i++) {
        for (let j = 0; j < selectcat.length; j++) {
            if(locationdata.contentdata.list[i].type == selectcat[j]){
                locationdata.viewdata.push(locationdata.contentdata.list[i]);
            }
        }
    }
    return locationdata.viewdata;
}

// 내위치
function myLocation() {
    if (navigator.geolocation) {
        if(getBrowser() == 'Firefox'){
            navigator.geolocation.getCurrentPosition(setDetailPosition,showDetailError);
        } else{
            navigator.geolocation.getCurrentPosition(setDetailPosition, showDetailError, showDetailOptions);
        }
    }
}

var myLocationMarker;
function setDetailPosition(position) {
    conLocationx = position.coords.longitude;
    conLocationy = position.coords.latitude;

    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다

    var	markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
        markerPosition = new kakao.maps.LatLng(conLocationy, conLocationx); // 마커가 표시될 위치입니다

    // 마커를 생성합니다
    myLocationMarker = new kakao.maps.Marker({
        image: markerImage, // 마커이미지 설정
        position: markerPosition
    });

    map.panTo(markerPosition);

    if(mobileYn == 'Y')	myLocationMarker.setMap(mapMo);
    else myLocationMarker.setMap(map);

    resetMarkers();
}

function showDetailError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
//			alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
//			alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
//			alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
//			alert("An unknown error occurred.");
            break;
    }
}


var showDetailOptions = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 2000
};

// 지도 마커 초기화
function resetMarkers() {

    removeAllmarker();

    getLocationList();

    openDetail(cotId);
}

function moveFocus(select){
    if(event.keyCode == 13){
        var index = $(select).index();

        if(index == 0){
            if(selectedMarker != null)
                selectedMarker.setImage(selectedMarker.normalImage);
            focusjoin = select;
            // setMapLayer(originDetail);
        } else{
            index = index-1;

            if(selectedMarker != null)
                selectedMarker.setImage(selectedMarker.normalImage);

            var selectVal = $('#map .type_choice .on').find('span').text().replace('선택됨','');
            var item;

            switch (selectVal) {
                case '전체' :
                    selectedMarker = sourroundingsMarkerArray[index];
                    item = dataobject['all'][index];
                    break;
                case '관광지' :
                    selectedMarker = tourMarkers[index];
                    item = dataobject['tour'][index];
                    break;
                case '문화시설' :
                    selectedMarker = munMarkers[index];
                    item = dataobject['mun'][index];
                    break;
                case '레포츠' :
                    selectedMarker = lepokMarkers[index];
                    item = dataobject['lepok'][index];
                    break;
                case '쇼핑' :
                    selectedMarker = shopMarkers[index];
                    item = dataobject['shop'][index];
                    break;
                case '숙박' :
                    selectedMarker = hotelMarkers[index];
                    item = dataobject['hotel'][index];
                    break;
                case '음식' :
                    selectedMarker = foodMarkers[index];
                    item = dataobject['food'][index];
                    break;
                case '코스' :
                    selectedMarker = cosMarkers[index];
                    item = dataobject['cos'][index];
                    break;

            }
            selectedMarker.setImage(selectedMarker.clickImage);
            focusjoin = select;
            // setMapLayer(item);
        }
    }
}

function createMarkerImage(markerSize, offset, imageSrc) {
    var markerImage = new kakao.maps.MarkerImage(imageSrc, markerSize, offset);

    return markerImage;
}

function getContentdata(cotId){
    let content;
    for (let i = 0; i < locationdata.viewdata.length; i++) {
        if(cotId == locationdata.viewdata[i].cotId){
            content = locationdata.viewdata[i];
        }
    }

    if(content)
        return content;
    else
        return null;
}

function marKerOn(cotId){
    selectMarker = $('#' + cotId);
    if($(selectMarker).length > 0) {
        $(selectMarker).addClass('on');
        if(mobileYn == 'N') {
            $(selectMarker).parent().css('margin-top', -18 - ($(selectMarker).height() / 2) + "px");
            $(selectMarker).parent().css('margin-left', 0 - ($(selectMarker).width() / 2) + "px");
        } else{
            $(selectMarker).parent().css('margin-top', -9 - ($(selectMarker).height() / 2) + "px");
            $(selectMarker).parent().css('margin-left', -3 - ($(selectMarker).width() / 2) + "px");
        }
    } else{
        setTimeout(function () {
            marKerOn(cotId);
        }, 300) ;
    }
}

$(document).on("click",".surroundingsMap .map_menu .view",function(){
    $('.surroundingsMap .layer').css('display','block');
    $('.surroundingsMap .map_menu .view').css('display','none');
});

$(document).on("click",".surroundingsMap .layer .close",function(){
    $('.surroundingsMap .layer').css('display','none');
    $('.surroundingsMap .map_menu .view').css('display','block');
});

// 지도 새로고침
function changeCenter() {
    locationx = mapCenterlocationx;
    locationy = mapCenterlocationy;

    resetMarkers();
}
