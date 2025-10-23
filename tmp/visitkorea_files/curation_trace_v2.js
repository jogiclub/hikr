const TraceConstants = function() {
  //  큐레이션 메인 페이지 1회 노출 콘텐츠
  let COUNT_PER_ONCE_MAIN
  //  큐레이션 메인 페이지 1회 노출 콘텐츠
  let COUNT_PER_ONCE_CURATION_MAIN
  //  콘텐츠 상세 페이지 큐레이션 1회 노출 콘텐츠
  let COUNT_PER_ONCE_CONTENT_DETAIL
  //  메인 페이지 추적 여부
  let IS_TRACE_MAIN
  //  큐레이션 메인 페이지 추적 여부
  let IS_TRACE_CURATION_MAIN
  //  큐레이션 목록 페이지 추적 여부
  let IS_TRACE_CURATION_LIST
  //  콘텐츠 상세 페이지 추적 여부
  let IS_TRACE_CONTENT_DETAIL
  //  한 슬라이드 화면에 표시되는 슬라이드의 갯수
  let SLIDE_SIZE
  //  슬라이드 전체 갯수 (보이지 않는 영역 포함)
  let SLIDE_FULL_SIZE

  const isMobile = (() => {
    return mobileYn === 'Y'
  })()

  if (isMobile) {
    IS_TRACE_MAIN = true
    IS_TRACE_CURATION_MAIN = true
    IS_TRACE_CONTENT_DETAIL = true
    COUNT_PER_ONCE_MAIN = 4
    COUNT_PER_ONCE_CURATION_MAIN = 10
    COUNT_PER_ONCE_CONTENT_DETAIL = 3
    COUNT_INIT_CURATION_MAIN = 5
    SLIDE_SIZE = 3
    SLIDE_FULL_SIZE = 10
  } else {
    IS_TRACE_MAIN = true
    IS_TRACE_CURATION_MAIN = true
    IS_TRACE_CONTENT_DETAIL = true
    COUNT_PER_ONCE_MAIN = 3
    COUNT_PER_ONCE_CURATION_MAIN = 12
    COUNT_PER_ONCE_CONTENT_DETAIL = 5
    COUNT_INIT_CURATION_MAIN = 12
    SLIDE_SIZE = 5
    SLIDE_FULL_SIZE = 10
  }
  return {
    main: {
      isTrace: IS_TRACE_MAIN,
      countPerOnce: COUNT_PER_ONCE_MAIN,
    },
    curationMain: {
      isTrace: IS_TRACE_CURATION_MAIN,
      initCount: COUNT_INIT_CURATION_MAIN,
      countPerOnce: COUNT_PER_ONCE_CURATION_MAIN
    },
    contentDetail: {
      isTrace: IS_TRACE_CONTENT_DETAIL,
      countPerOnce: COUNT_PER_ONCE_CONTENT_DETAIL,
      slideSize: SLIDE_SIZE,
      slideFullSize: SLIDE_FULL_SIZE
    }
  }
}()

function generateRandomString(length) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}

//  큐레이션 조회 이벤트 고유 ID --> 1 페이지 뷰에 1개
let ___tracedEventId = generateRandomString(12)
//  페이지에서 큐레이션 이벤트 Trace 가 이루어졌는가 ?
let ___isTracedEvent = false;
//  슬라이드에서 이미 노출된 큐레이션 콘텐츠 Index
const __tracedSlideIndex = [];
//  허용된 큐레이션 타입
const curationTypes = [ 'AI', 'HOT', 'MAIN_A', 'MAIN_B' ]

function ___saveEvent(page, curationType) {
  const request = ___createEventRequest({ eventId: ___tracedEventId, page, curationType })
  ___save(request)
}

/**
 * 대구석 메인 페이지 여행콕콕 API 호출 시
 */
function ___traceCurationSiteMain(items, curationType) {
  if (curationTypes.indexOf(curationType) === -1) {
    return
  }
  const page = 'SITE_MAIN'
  const contentListElement = (() => {
    if (mobileYn === 'Y') {
      if (curationType === 'HOT') {
        return $('#tab_cont1 ul').find('li')
      } else {
        return $('#tab_cont2 ul').find('li')
      }
    } else {
      if (curationType === 'HOT') {
        return $('#placelist').find('li')
      } else {
        return $('#ailist').find('li')
      }
    }
  })()
  const contents = ___createContentList(contentListElement)
  if (contents.length === 0) {
    return
  }
  const request = ___createViewRequest({
    eventId: ___tracedEventId,
    page,
    curationType,
    contents
  })
  ___saveEvent(page, curationType)
  ___save(request)
}

/**
 * 큐레이션 메인 페이지에서 타입별 슬라이드 이벤트 발생 시
 */
function ___traceCurationMainHot(items, curationType, isMore, moreCount) {
  const page = 'MAIN'
  if (!isMore) {
    ___tracedEventId = generateRandomString(12)
    ___saveEvent(page, curationType)
  }
  const contents = items.map((item, index) => {
    const { cotId, content: { contentType } } = item
    let order
    if (!isMore) {
      order = index + 1
    } else {
      order = TraceConstants.curationMain.initCount + ((moreCount - 1) * TraceConstants.curationMain.countPerOnce) + index + 1
    }
    return {
      cotId: cotId,
      contentType: contentType,
      index: order
    }
  })
  if (contents.length === 0) {
    return
  }
  const request = ___createViewRequest({
    eventId: ___tracedEventId,
    page,
    curationType,
    moreCount: moreCount,
    contents
  })
  ___save(request)
}

/**
 * 큐레이션 메인 페이지에서 타입별 슬라이드 이벤트 발생 시
 */
function ___traceCurationMainAi(items, curationType, moreCount) {
  const page = 'MAIN'
  if (moreCount === 0) {
    ___tracedEventId = generateRandomString(12)
    ___saveEvent(page, curationType)
  }

  if (!items) {
    return
  }
  const contents = items.map((item, index) => {
    const { cotId, contentType } = item
    return {
      cotId: cotId,
      contentType: contentType,
      index: index + 1
    }
  })
  if (contents.length === 0) {
    return
  }
  const request = ___createViewRequest({
    eventId: ___tracedEventId,
    page,
    curationType,
    moreCount: moreCount,
    contents
  })
  ___save(request)
}

function ___traceDetailCurationSlide(selector, activeIndex) {
  const page = 'DETAIL'
  const curationType = 'DETAIL_A'
  if (!___isTracedEvent) {
    ___isTracedEvent = true;
    ___saveEvent(page, curationType)
  }
  const wrapperSelector = selector + ' .swiper-wrapper'
  const slideSize = TraceConstants.contentDetail.slideSize
  const slideFullSize = TraceConstants.contentDetail.slideFullSize
  //  페이지 랜딩시 최초 호출에는 null 임
  if (activeIndex == null) {
    activeIndex = 2
  }
  const indices = []
  const rangeStart = function() {
    let start = activeIndex - Math.floor(slideSize / 2);
    return start < 0 ? start + 10 : start
  }()
  for (let i = 0; i < slideSize; i++) {
    let index = rangeStart + i;
    let realIndex
    if (index >= slideFullSize) {
      realIndex = rangeStart + i - slideFullSize
    } else {
      realIndex = rangeStart + i
    }
    if (__tracedSlideIndex.indexOf(realIndex) === -1) {
      indices.push(realIndex)
      __tracedSlideIndex.push(realIndex)
    }
  }
  if (indices.length === 0) {
    return
  }
  const contents = []
  for (let i in indices) {
    const index = indices[i]
    const slide = $(wrapperSelector).children()[index]
    contents.push({
      cotId: slide.dataset.cotId,
      contentType: slide.dataset.contentType,
      index: index + 1
    })
  }
  const request = ___createViewRequest({
    eventId: ___tracedEventId,
    page,
    curationType,
    moreCount: undefined,
    contents
  })
  ___save(request)
}

function ___traceCurationConsume(element) {
  const { page, curationType, cotId, contentType, contentOrder, section } = element.dataset
  const request = ___createConsumeRequest({
    eventId: ___tracedEventId,
    page: page !== undefined ? page : section,
    curationType,
    contents: [{
      cotId: cotId,
      contentType: contentType,
      index: contentOrder
    }]
  })
  ___save(request)
  return true
}

function ___save(request) {
  if (!isProduction) {
    // return
  }
  const date = new Date()
  const indices = `trace-v2-curation_${date.getFullYear()}.${date.getMonth() + 1}`
  fetch(`${mainurl}/api/v1/elasticsearch/create?indices=${indices}`, {
  // fetch(`http://localhost:7777/api/v1/elasticsearch/create?indices=${indices}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    }
  ).catch(ignored => {})
}

const ___createContentList = contentListElements => {
  const array = []
  for (let i = 0; i < contentListElements.length; i++) {
    array.push(contentListElements[i])
  }
  return array.map(({ dataset: { cotId, contentType, contentOrder } }) => ({
    cotId: cotId,
    contentType: contentType,
    index: contentOrder
  }))
}

const ___mapAsContentList = contents => {
  return contents.map(({ cotId, contentType }, index) => ({
    cotId: cotId,
    contentType: contentType,
    index: index + 1
  }))
}

const ___createEventRequest = ({ eventId, page, curationType }) => {
  return [{
    traceType: 'EVENT',
    eventId: eventId,
    ga: getCookie('_ga'),
    login: loginYn === 'Y',
    device: mobileYn === 'Y' ? 'MOBILE' : 'PC',
    page: page,
    curationType: curationType
  }]
}

const ___createConsumeRequest = ({ eventId, page, curationType, contents }) => {
  return contents.map(({ cotId, contentType, index }) => {
    return {
      traceType: 'CONSUME',
      eventId: eventId,
      ga: getCookie('_ga'),
      login: loginYn === 'Y',
      device: mobileYn === 'Y' ? 'MOBILE' : 'PC',
      page: page,
      curationType: curationType,
      cotId: cotId,
      content_type: contentType,
      order: index,
    }
  })
}

const ___createViewRequest = ({ eventId, page, curationType, moreCount, contents }) => {
  return contents.map(({ cotId, contentType, index}) => {
    return {
      traceType: 'VIEW',
      eventId: eventId,
      ga: getCookie('_ga'),
      login: loginYn === 'Y',
      device: mobileYn === 'Y' ? 'MOBILE' : 'PC',
      page: page,
      curationType: curationType,
      moreCount: moreCount,
      cotId: cotId,
      content_type: contentType,
      order: index,
    }
  })
}
