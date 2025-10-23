class DetailFlow {
  constructor() {
    this.detailCommon = new DetailCommon({ detailFlow: this })
    this.detailApi = new DetailApi()
    this.detailUITemplate = new DetailUiTemplate({ detailFlow: this })
  }

  async start() {

  }

  renderAreaName(data) {
    const { areaCode, sigugunCode } = data
    if (!areaCode) {
      return
    }
    const elementList = Array.from(document.querySelectorAll('*[data-ui-area-name]'))
    elementList.forEach(item => item.innerText = `${getAreaName(areaCode)} ${getSigunguName(areaCode, sigugunCode)}`)
  }

  async showRecommendArticle(parameters) {
    const { areaCode, sigugunCode } = parameters
    let username
    let isGroobee = false
    await this.detailApi.fetchUsername()
        .then(result => username = result.data)
    await this.detailApi.fetchRecommendArticleList(parameters)
        .then(result => {
          if (result.type == 'groobee') {
            isGroobee = true
          }
          this.renderRecommendArticleListItems(result)
          this.renderUsername({ username, areaCode, sigugunCode, isGroobee })
        })
    this.detailCommon.addClickGroobeeGoodsLinkEvent(({ dataset }) => {
      this.detailApi.clickGroobeeProduct(dataset)
    })
  }

  renderUsername(data) {
    let { username, areaCode, sigugunCode, isGroobee } = data
    const element = document.querySelector('*[data-ui-user-name]')
    if (!element) {
      return
    }
    if (isGroobee && username) {
      username = username.length >= 10 ? username.slice(0, 10) + '...' : username
      return element.innerHTML = `<em>${username}</em>님을 위한 추천 여행 기사`
    }
    if (!isGroobee && areaCode) {
      return element.innerHTML = `<em>${getAreaName(areaCode)} ${getSigunguName(areaCode, sigugunCode)}</em> 추천 여행 기사`
    }
    if (isGroobee && !username || !isGroobee && !areaCode) {
      return element.innerHTML = `추천 여행 기사`
    }
  }

  renderRecommendArticleListItems(data) {
    const element = document.querySelector('*[data-ui-recommend-article-list]')
    if (!element) {
      return
    }
    if (!data || !data.data) {
      element.innerHTML = ''
    } else {
      if (Object.keys(data).length === 0) {
        element.innerHTML = ''
      }
      if (data.type == 'groobee') {
        const { algorithmCd, campaignKey } = data
        const resultList = (data.data ?? [])
            .filter(item => item.dNm)
            .slice(0, 4);
        element.querySelector('.swiper-wrapper').innerHTML = resultList.map(item => this.detailUITemplate.recommendGroobeeGoodsListItem(item, algorithmCd, campaignKey)).join('')
      } else {
        element.querySelector('.swiper-wrapper').innerHTML = data.data.map(item => this.detailUITemplate.recommendArticleListItem(item)).join('')
      }
    }
    this.detailUITemplate.initSwiper()
  }

  async showFestival(parameters) {
    this.detailApi.fetchFestivalList(parameters)
        .then(resultList => this.renderFestivalListItems(resultList))
  }

  renderFestivalListItems({ data }) {
    const element = document.querySelector('*[data-ui-festival-list]')
    if (!element) {
      return
    }
    if (!data) {
      element.innerHTML = ''
    } else {
      element.querySelector('.swiper-wrapper').innerHTML = data.map((item) => this.detailUITemplate.festivalListItem(item)).join('')
    }
    this.detailUITemplate.initSwiper()
  }

  async showRecommendSpot(parameters) {
    this.detailApi.fetchRecommendSpotList(parameters)
        .then(resultList => this.renderRecommendSpotListItems(resultList))
  }

  renderRecommendSpotListItems({ data }) {
    const element = document.querySelector('*[data-ui-recommend-spot-list]')
    if (!element) {
      return
    }
    if (!data) {
      element.innerHTML = ''
    } else {
      element.querySelector('.swiper-wrapper').innerHTML = data.map(item => this.detailUITemplate.recommendSpotListItem(item)).join('')
    }
    this.detailUITemplate.initSwiper()
  }

  async showRecommendCourse(parameters) {
    this.detailApi.fetchRecommendCourseList(parameters)
        .then(resultList => this.renderRecommendCourseListItems(resultList))
  }

  renderRecommendCourseListItems({ data }) {
    const element = document.querySelector('*[data-ui-recommend-course-list]')
    if (!element) {
      return
    }
    if (!data) {
      element.innerHTML = ''
    } else {
      if (data.length > 1) {
        element.insertAdjacentHTML('beforeend', this.detailUITemplate.recommendCourseListItems(data))
      } else {
        element.insertAdjacentHTML('beforeend', data.map(item => this.detailUITemplate.recommendCourseListOneItem(item)).join(''))
      }
    }
    this.detailUITemplate.initRecommendCourseSwiper()
    this.detailCommon.addClickLocalCourseTooltipEvent()
    this.detailCommon.addClickLocalCourseTooltipCloseEvent()
  }

  async showRelationSpot(parameters, title) {
    this.renderSpotName(title)
    this.detailApi.fetchRelationSpotList(parameters)
        .then(resultList => this.renderRelationSpotListItems(resultList))
  }

  renderSpotName(data) {
    const element = document.querySelector('*[data-ui-spot-name]')
    if (!element) {
      return
    }
    if (data) {
      data = data.length >= 10 ? data.slice(0, 10) + '...' : data
      element.innerHTML = `<em>‘${data}’</em>${this.getProperParticle(data)} 유사한 추천 여행지`
    }
  }

  getProperParticle(voca) {
    const charCode = voca.charCodeAt(voca.length - 1);
    const consonantCode = (charCode - 44032) % 28;
    if (consonantCode === 0) {
      return `와`;
    } else {
      return `과`;
    }
  }

  renderRelationSpotListItems(data) {
    const element = document.querySelector('*[data-ui-relation-spot-list]')
    if (!element) {
      return
    }
    if (!data) {
      element.innerHTML = ''
    } else {
      if (data.length > 0) {
        element.querySelector('.swiper-wrapper').innerHTML = data.map(item => this.detailUITemplate.relationSpotListItem(item)).join('')
      } else {
        element.innerHTML = ''
      }
    }
    this.detailUITemplate.initSwiper()
  }

  async showRecommendTourGoods(parameters) {
    this.detailApi.fetchRecommendTourGoodsList(parameters)
        .then(resultList => this.renderRecommendTourGoodsListItems(resultList))
  }

  renderRecommendTourGoodsListItems({ data }) {
    const element = document.querySelector('*[data-ui-tour-goods-list]')
    if (!element) {
      return
    }
    if (!data) {
      element.innerHTML = ''
    } else {
      if (data.length > 1) {
        element.insertAdjacentHTML('beforeend', this.detailUITemplate.tourGoodsListItems(data))
      } else {
        element.insertAdjacentHTML('beforeend', data.map(item => this.detailUITemplate.tourGoodsListOneItem(item)).join(''))
      }
    }
    this.detailUITemplate.initSwiper()
    this.detailUITemplate.initRecommendCourseSwiper()
  }

}