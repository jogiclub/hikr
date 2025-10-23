class DetailApi {
  static GET_USERNAME = '/detail/user/username.do'
  static GET_RECOMMEND_ARTICLE_LIST = '/detail/recommend-article/list.do'
  static GET_FESTIVAL_LIST = '/detail/festival/list.do'
  static GET_RECOMMEND_SPOT_LIST = '/detail/recommend-spot/list.do'
  static GET_RECOMMEND_COURSE_LIST = '/detail/recommend-course/list.do'
  static GET_RECOMMEND_TOUR_GOODS_LIST = '/detail/tour-goods/list.do'

  constructor() {

  }

  async fetchUsername(){
    return $.ajax(DetailApi.GET_USERNAME, {
      cache: false
    })
  }

  async fetchRecommendArticleList(data){
    const currentUrl = window.location.href
    let result
    if (currentUrl.includes('rem')) {
      result = await this.getDbContentByGroobee()
    }
    if (currentUrl.includes('ms')) {
      result = await this.getMsContentByGroobee()
    }
    if (result && result.goodsList && result.goodsList.length > 0) {
      const goodsList = result.goodsList
      const algorithmCd = result.algorithmCd
      const campaignKey = result.campaignKey
      return {
        type: 'groobee',
        data: goodsList,
        algorithmCd: algorithmCd,
        campaignKey: campaignKey
      }
    } else {
      return $.ajax(DetailApi.GET_RECOMMEND_ARTICLE_LIST, {
        cache: false,
        data: data
      })
    }
  }

  async getDbContentByGroobee() {
    let key
    let result = {}
    if (mobileYn == 'Y') {
      if (!serviceMobileKeyOfDb) {
        return result
      }
      key = serviceMobileKeyOfDb
    } else {
      if (!servicePcKeyOfDb) {
        return result
      }
      key = servicePcKeyOfDb
    }
    if (groobee && groobee.getGroobeeRecommendAsync) {
      await groobee.getGroobeeRecommendAsync(key)
          .then(data => {
            result = data
            this.groobeeDisplayInsert(data)
          })
    }
    return result
  }

  async getMsContentByGroobee() {
    let key, keyByRlsg
    let result = {}
    if (mobileYn == 'Y') {
      if (!serviceMobileKey || !serviceMobileKeyByRlsg) {
        return result
      }
      key = serviceMobileKey
      keyByRlsg = serviceMobileKeyByRlsg
    } else {
      if (!servicePcKey || !servicePcKeyByRlsg) {
        return result
      }
      key = servicePcKey
      keyByRlsg = servicePcKeyByRlsg
    }
    if (groobee && groobee.getGroobeeRecommendAsync) {
      await groobee.getGroobeeRecommendAsync(key)
          .then(data => {
            result = data
            this.groobeeDisplayInsert(data)
          })
      if (result.goodsList.length == 0) {
        await groobee.getGroobeeRecommendAsync(keyByRlsg)
            .then(data => {
              result = data
              this.groobeeDisplayInsert(data)
            })
      }
      return result
    }
  }

  async groobeeDisplayInsert(data) {
    const { goodsList, algorithmCd, campaignKey } = data
    if (!goodsList || goodsList.length === 0) {
      return
    }
    let goods = []
    for (let i = 0; i < goodsList.length; i++) {
      const newObj = { goodsCd: goodsList[i].goodsCd }
      goods.push(newObj)
    }
    let groobeeObj = {
      algorithmCd: algorithmCd,
      campaignKey: campaignKey,
      campaignTypeCd: 'RE', // 고정값
      goods: goods
    }
    groobee.send('DI', groobeeObj)
  }

  async clickGroobeeProduct(data) {
    const { campaignKey, algorithmCd, goodsCd } = data
    let groobeeObj = {
      algorithmCd: algorithmCd,
      campaignKey: campaignKey,
      campaignTypeCd: 'RE', // 고정값
      goods: [
        {goodsCd: goodsCd}
      ]
    }
    groobee.send('CL', groobeeObj)
  }

  async fetchFestivalList(data) {
    return $.ajax(DetailApi.GET_FESTIVAL_LIST, {
      cache: false,
      data: data
    })
  }

  async fetchRecommendSpotList(data) {
    return $.ajax(DetailApi.GET_RECOMMEND_SPOT_LIST, {
      cache: false,
      data: data
    })
  }

  async fetchRecommendCourseList(data) {
    return $.ajax(DetailApi.GET_RECOMMEND_COURSE_LIST, {
      cache: false,
      data: data
    })
  }

  withDefaultHeaders(headers) {
    return {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      ...headers
    }
  }

  async fetchRelationSpotList(data) {
    const params = {
      device: smallerThanTablet() ? 'MOBILE' : 'PC',
    }
    return await this.getCurationDetail(params, data)
  }

  async getCurationDetail(params, data) {
    const { cotId, snsId } = data
    const url = new URL(`${mainurl}/api/v1/curation/detail/${cotId}`)
    // const url = new URL(`https://dev.ktovisitkorea.com/api/v1/curation/detail/${cotId}`)
    let resultList = []
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) {
        url.searchParams.append(key, value)
      }
    })
    await fetch(url, {
      headers: this.withDefaultHeaders({ "X-SNS-ID": snsId }),
    })
    .then(response => response.json())
    .then(responseData => {
      const dataList = responseData.data
      if (dataList != null) {
        for (let i = 0; i < dataList.length; i++) {
          const { detailDatabase } = dataList[i]
          if (detailDatabase?.areaCode) {
            resultList.push(dataList[i])
          }
        }
      }
      resultList = resultList.slice(0, 4)
    })
    return resultList
  }

  async fetchRecommendTourGoodsList(data) {
    return $.ajax(DetailApi.GET_RECOMMEND_TOUR_GOODS_LIST, {
      cache: false,
      data: data
    })
  }
}