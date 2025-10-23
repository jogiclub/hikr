// console.log('---------- before ----------')
// console.log('_ga : ', getCookie('_gid'));
// console.log('_gid : ', getCookie('_ga'));
// console.log('unid : ', getCookie('unid'));

window.onload = function() {
  this.setTimeout(function() {
    if (window.location.host === 'dev.ktovisitkorea.com') {
      __dev();
    } else if (window.location.host === 'korean.visitkorea.or.kr') {
      __prod();
    }
  }, 1500);
}

//  ***************
//  * development *
//  ***************
function __dev() {
  const ga = getCookie('_ga');
  const gid = getCookie('_gid');
  const keyword = __rsk;
  const searchType = __rskReferral;

  if (keyword !== undefined && keyword !== null && keyword !== '' && keyword !== 'null') {
    __saveUserSearchKeyword(ga, keyword, searchType);
  }
}

//  **************
//  * production *
//  **************
function __prod() {
  const ga = getCookie('_ga');
  const gid = getCookie('_gid');
  const keyword = __rsk;
  const searchType = __rskReferral;

  if (keyword !== undefined && keyword !== null && keyword !== '' && keyword !== 'null') {
    __saveUserSearchKeyword(ga, keyword, searchType);
  }
}

function __saveUserSearchKeyword(ga, keyword, searchType) {
  $.ajax({
    url: mainurl + '/call',
    type: "POST",
    dataType: 'json',
    data: {
      cmd : 'INSERT_USER_SEARCH_KEYWORD',
      ga: ga,
      keyword: keyword,
      searchType: searchType
    }
  });
}
