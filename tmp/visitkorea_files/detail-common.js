class DetailCommon {
  constructor({ detailFlow }) {
    this.detailFlow = DetailFlow
  }

  addClickLocalCourseTooltipEvent() {
    const button = document.querySelector('*[data-ui-local-course-tooltip]')
    if (!button) {
      return
    }
    button.addEventListener('click', () => {
      disableScroll()
    })
  }

  addClickLocalCourseTooltipCloseEvent() {
    const button = document.querySelector('*[data-ui-local-course-tooltip-close]')
    if (!button) {
      return
    }
    button.addEventListener('click', () => {
      enableScroll()
    })
  }

  addClickGroobeeGoodsLinkEvent(listener) {
    const buttonElementList = Array.from(document.querySelectorAll('*[data-ui-groobee-goods-link]'))
    buttonElementList.forEach(button => {
      button.addEventListener('click', () => {
        listener && listener(button)
      })
    })
  }

}