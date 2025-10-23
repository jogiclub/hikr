//CSS Insert
var style = document.createElement("link");
style.setAttribute("rel", "stylesheet");
style.setAttribute("type", "text/css");
style.setAttribute("href", "https://1330chat.visitkorea.or.kr/ttalk/css/ttalk-import.css");
document.getElementsByTagName("head")[0].appendChild(style);

var div = document.createElement("div");
div.setAttribute("id", "ttalk-frame");
document.getElementsByTagName("body")[0].appendChild(div);

//TTalk Frame Insert
function insertAfter(referenceNode, newNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	//alert("insertAfter");//■
}

var form = document.createElement("form");
form.setAttribute("name", "iform");
form.setAttribute("id", "iform");
form.setAttribute("method", "post");
form.setAttribute("target", "ttalkFrame");
form.setAttribute("action", "https://1330chat.visitkorea.or.kr:3000/chat/open");

for(var key in window.ttalk_option)
{
	if(key == "uuid" || key == "extra") {
		//alert("uuid");//■
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", window.ttalk_option[key]);
		form.appendChild(hiddenField);
	}
}

//TTalk Button Insert
setTimeout(function() {
	//alert("setTimeout");//■
	insertBtn();
//	form.submit();
//	document.iform.submit();
}, 500);

function insertBtn(){
	if(window.ttalk_option["button"] == 'undefined' || window.ttalk_option["button"] == null || window.ttalk_option["button"] == '') {
		document.getElementById("ttalk-frame").innerHTML = '<img id="ttalk_icon" name="ttalk_icon" src="https://1330chat.visitkorea.or.kr/ttalk/img/ttalk.png" onclick="openTtalk();"><span class="ttalk-tooltip">웹챗으로 상담하시려면 버튼을 클릭하세요.</span>';
	} else {
		$("#ttalkContainer").css("bottom","30px");
	}
	//alert("insertBtn");//■
}

function openTtalk(){
	//alert("openTtalk");
		// 모바일 /pc 구분하여 띄워줌.
	  var filter = "win16|win32|win64|mac|macintel"; 
      if ( navigator.platform ) 
      { 
        if ( filter.indexOf( navigator.platform.toLowerCase() ) < 0 ) 
        { //mobile 
          window.open('', "ttalkFrame", "width=800, height=700, toolbar=no, menubar=no, scrollbars=no, resizable=yes, fullscreen=yes " );

          div.appendChild(form);
          document.iform.submit();
        } 
        else 
		{ 	//pc 
        	if (!document.getElementById('ttalkContainer')) {
        		
        		var ttalk = document.createElement("div");
        		ttalk.setAttribute("id", "ttalkContainer");
        		ttalk.innerHTML = '<iframe name="ttalkFrame" id="ttalkFrame"></iframe>';
        		var ttalkFrameObj = document.getElementById("ttalk-frame");
        		insertAfter(ttalkFrameObj, ttalk);
        		
        		ttalk.appendChild(form);
        		document.iform.submit();
        		
        		document.getElementById("ttalkContainer").classList.add("is-active");
        		
        		if(window.ttalk_option["button"] == 'undefined' || window.ttalk_option["button"] == null || window.ttalk_option["button"] == '') {
        			
        			$("#ttalk_icon").attr("src","https://1330chat.visitkorea.or.kr/ttalk/img/ttalk_quick_link_close.png");
        			
        		} else {
        			//$("#ttalkContainer").css("bottom","30px");
        		}
        		
        	}
        	else {
        		var ttalkFrameObj = document.getElementById("ttalkContainer");
        		$('#ttalkContainer').remove();
        		
        		if(window.ttalk_option["button"] == 'undefined' || window.ttalk_option["button"] == null || window.ttalk_option["button"] == '') {
        			$("#ttalk_icon").attr("src","https://1330chat.visitkorea.or.kr/ttalk/img/ttalk_quick_link_icon6.png");
        		} else {
        			$("#ttalkContainer").css("bottom","30px");
        		}
        		
        	}
        }
    } 
}

window.addEventListener('message', function(e) {
	if(e.data == 'close')  {
        
		var ttalkFrameObj = document.getElementById("ttalkContainer");
		$('#ttalkContainer').remove();
		$("#ttalk_icon").attr("src","https://1330chat.visitkorea.or.kr/ttalk/img/ttalk_quick_link_icon6.png");
	}
})

