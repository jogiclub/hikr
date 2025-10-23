class DetailUiTemplate {
  constructor({ detailFlow }) {
    this.detailFlow = detailFlow
  }

  recommendGroobeeGoodsListItem(item, algorithmCd, campaignKey) {
    const { dNm, goodsCd, goodsImg, goodsNm } = item
    let actionUrl = `/detail/rem_detail.do?cotid=${goodsCd}`
    return `
      <div class="swiper-slide">
        <a href="${actionUrl}" data-algorithm-cd="${algorithmCd}" data-campaign-key="${campaignKey}" data-goods-cd="${goodsCd}" data-ui-groobee-goods-link>
          <span class="img"><img src="${goodsImg}" alt=""></span>
          <strong>${goodsNm}</strong>
          <em>${dNm}</em>
        </a>
      </div>
    `
  }

  recommendArticleListItem(item) {
    const { areaCode, sigugunCode, cotId, imgId, title } = item
    const areaName = getAreaName(areaCode)
    const sigunguName = getSigunguName(areaCode, sigugunCode)
    let actionUrl = `/detail/rem_detail.do?cotid=${cotId}`
    return `
      <div class="swiper-slide">
        <a href="${actionUrl}">
          <span class="img"><img src="${mainimgurl}${imgId}" alt=""></span>
          <strong>${title}</strong>
          <em>${areaName} ${sigunguName}</em>
        </a>
      </div>
    `
  }

  festivalListItem(item) {
    const { areaCode, cotId, firstImage, sigugunCode, title, eventStartDate, eventEndDate } = item
    const areaName = getAreaName(areaCode)
    const sigunguName = getSigunguName(areaCode, sigugunCode)
    const actionUrl = `/detail/fes_detail.do?cotid=${cotId}&big_area=${areaCode}`
    return `
      <div class="swiper-slide">
        <a href="${actionUrl}">
          <span class="img"><img src="${mainimgurl}${firstImage}" alt=""></span>
          <strong>${title}</strong>
          <em>${areaName} ${sigunguName}</em>
          <span class="date">${eventStartDate} ~ ${eventEndDate}</span>
        </a>
      </div>
    `
  }

  recommendSpotListItem(item) {
    const { cotId, cat1, cat2, areaCode, sigugunCode, firstImage, title } = item
    const areaName = getAreaName(areaCode)
    const sigunguName = getSigunguName(areaCode, sigugunCode)
    let actionUrl = `/detail/ms_detail.do?cotid=${cotId}
                                                &big_category=${cat1}
                                                &mid_category=${cat2}
                                                &big_area=${areaCode}`
    return `
      <div class="swiper-slide">
        <a href="${actionUrl}">
          <span class="img"><img src="${mainimgurl}${firstImage}" alt=""></span>
          <strong>${title}</strong>
          <em>${areaName} ${sigunguName}</em>
        </a>
      </div>
    `
  }

  recommendCourseListItems(data) {
    return `
      <div class="list">
        <div class="swiper-container">
          <div class="swiper-wrapper">
            ${data.map(item => this.courseListItem(item)).join('')}
          </div>
          <div class="custom_pagination_progressbar">
            <div class="pagination-progressbar"></div>
            <div class="pagination-fraction"></div>
          </div>
        </div>
      </div>
      <div class="banner">
        <div class="swiper-container">
          <div class="swiper-wrapper">
            <div class="swiper-slide">
              <a href="/list/travelcourse.do?service=abc&detailType=area" class="ai">
                <span>국내 여행 계획 중인가요?</span>
                <strong>
                  AI콕콕 플래너로 <br class="pc">나만의 <br class="mo">여행코스를 생성해 보세요!
                </strong>
                <span aria-hidden="true" class="icon_chevron_rt_sm"><img src="../resources/images/common/icon/svg/chevron_rt24.svg" class="icon_svg_inject" alt=""></span>
              </a>
            </div>
            <div class="swiper-slide">
              <a href="https://korean.visitkorea.or.kr/list/user_cos.do" class="user">
                <span>사용자가 직접 만든 여행코스!</span>
                <strong>
                  여기서만 볼 수 있는 <br class="pc">나만의 <br class="mo">여행 루트를 구경해 볼까요?
                </strong>
                <span aria-hidden="true" class="icon_chevron_rt_sm"><img src="../resources/images/common/icon/svg/chevron_rt24.svg" class="icon_svg_inject" alt=""></span>
              </a>
            </div>
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </div>
    `
  }

  courseListItem(item) {
    const { cotId, title, imgId, period, type } = item
    let actionUrl
    if (type == 'ai') {
      actionUrl = `${mainurl}/curation/cr_abc_detail.do?cotId=${cotId}`
    } else {
      actionUrl = `${mainurl}/detail/cs_detail_user.do?crsid=${cotId}`
    }
    return `
      <div class="swiper-slide">
        <a href="${actionUrl}">
          <span class="img">
            <img src="${mainimgurl}${imgId}" alt="">
            <span class="${type}_icon">${type == 'ai' ? 'ai콕콕 플래너' : '사용자'} 추천 코스</span>
          </span>
          <em>${period}</em>
          <strong>${title}</strong>
        </a>
      </div>
    `
  }

  recommendCourseListOneItem(item) {
    const { cotId, title, imgId, period, type } = item
    let actionUrl
    if (type == 'ai') {
      actionUrl = `${mainurl}/curation/cr_abc_detail.do?cotId=${cotId}`
    } else {
      actionUrl = `${mainurl}/detail/cs_detail_user.do?crsid=${cotId}`
    }
    return `
      <div class="one_item">
        <div class="list">                    
          <a href="${actionUrl}">
            <span class="img">
              <img src="${mainimgurl}${imgId}" alt="">
              <span class="${type}_icon">${type == 'ai' ? 'ai콕콕 플래너' : '사용자'} 추천 코스</span>
            </span>                                
            <em>${period}</em>
            <strong>${title}</strong>
          </a>
        </div>
        <div class="banner">
          <div class="swiper-container">
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <a href="/list/travelcourse.do?service=abc&detailType=area" class="ai">
                  <span>국내 여행 계획 중인가요?</span>
                  <strong>
                    AI콕콕 플래너로 <br class="pc">나만의 <br class="mo">여행코스를 <br class="pc">생성해 보세요!
                  </strong>
                  <span class="btn">
                    <em>바로가기</em>
                    <span class="icon_chevron_rt_sm"><img src="../resources/images/common/icon/svg/chevron_rt24.svg" aria-hidden="true" class="icon_svg_inject" alt=""></span>
                  </span>
                </a>
              </div>
              <div class="swiper-slide">
                <a href="https://korean.visitkorea.or.kr/list/user_cos.do" class="user">
                  <span>사용자가 직접 만든 여행코스!</span>
                  <strong>
                    여기서만 볼 수 있는 <br class="pc">나만의 <br class="mo">여행 루트를 <br class="pc">구경해 볼까요?
                  </strong>
                  <span class="btn">
                    <em>바로가기</em>
                    <span class="icon_chevron_rt_sm"><img src="../resources/images/common/icon/svg/chevron_rt24.svg" aria-hidden="true" class="icon_svg_inject" alt=""></span>
                  </span>
                </a>
              </div>
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </div>
    </div>
    `
  }

  relationSpotListItem(item) {
    const { cotId, title, detailDatabase } = item
    const { areaCode, sigunguCode, firstImage } = detailDatabase
    const areaName = getAreaName(areaCode)
    const sigunguName = getSigunguName(areaCode, sigunguCode)
    const actionUrl = `/detail/ms_detail.do?cotid=${cotId}`
    return `
      <div class="swiper-slide">
        <a href="${actionUrl}">
          <span class="img"><img src="${mainimgurl}${firstImage}" alt=""></span>
          <strong>${title}</strong>
          <em>${areaName} ${sigunguName}</em>
          </a>
      </div>
    `
  }

  tourGoodsListOneItem(item) {
    const { gdsId, gdsNm, tourFxCdNm, imgId } = item
    const actionUrl = `/list/travelinfo.do?service=tgpr&gdsId=${gdsId}`
    return `
      <div class="cont_wrap">
        <a href="${actionUrl}" class="pdt">
          <span class="img">
              <img src="${mainimgurl}${imgId}" alt="">
          </span>                                
          <em>${tourFxCdNm}</em>
          <strong>${gdsNm}</strong>
        </a>
        <a href="/list/travelinfo.do?service=tgpr" class="banner">
          <p>대한민국 구석구석으로 떠나세요!</p>
          <strong>여행상품 홍보관</strong>                                    
          <span>
            바로가기
            <span aria-hidden="true" class="icon_chevron_rt_sm"><img src="../resources/images/common/icon/svg/chevron_rt24.svg" class="icon_svg_inject" alt=""></span>
          </span>
        </a>
      </div>
    `
  }

  tourGoodsListItems(data) {
    return `
      <div class="swiper-container rec">
        <div class="swiper-wrapper">
          ${data.map(item => this.tourGoodsListItem(item)).join('')}
          <div class="swiper-slide">
            <a href="/list/travelinfo.do?service=tgpr" class="banner cnt${data.length}">
              <p>대한민국 구석구석으로 떠나세요!</p>
              <strong>여행상품 홍보관</strong>    
              <span>
                바로가기
                <span aria-hidden="true" class="icon_chevron_rt_sm"><img src="../resources/images/common/icon/svg/chevron_rt24.svg" class="icon_svg_inject" alt=""></span>
              </span>
            </a>
          </div>
        </div>
        <div class="custom_pagination_progressbar">
          <div class="pagination-progressbar"></div>
          <div class="pagination-fraction"></div>                            
        </div>
      </div>
    `
  }

  tourGoodsListItem(item) {
    const { gdsId, gdsNm, tourFxCdNm, imgId } = item
    const actionUrl = `/list/travelinfo.do?service=tgpr&gdsId=${gdsId}`
    return `
      <div class="swiper-slide">
        <a href="${actionUrl}">
          <span class="img">
            <img src="${mainimgurl}${imgId}" alt="">
          </span>                                
          <em>${tourFxCdNm}</em>
          <strong>${gdsNm}</strong>
        </a>
      </div>
    `
  }

  initSwiper() {
    $(function () {
      $('.recommendation_group .swiper-container.rec').each(function (index) {
        const $this = $(this);
        const fractionEl = $this.find('.pagination-fraction')[0];
        const progressbarEl = $this.find('.pagination-progressbar')[0];
        const slideCount = $this.find('.swiper-slide').length;

        const winWidth = $(window).width();

        // 768~1023px 사이에서만 조건 처리
        if (winWidth >= 768 && winWidth <= 1023 && slideCount < 6) {
          // swiper 미사용: 슬라이드 강제 초기화 (css 조정 필요할 수 있음)
          $this.addClass('no_swiper');
          setEqualStrongHeights($this);
          return;
        }

        const swiper1 = new Swiper(this, {
          slidesPerView: 'auto',
          spaceBetween: 20,
          watchOverflow: true,
          observer: true,
          observeParents: true,
          breakpoints: {
            1023: {
              spaceBetween: 10,
              pagination: {
                el: fractionEl,
                type: 'fraction',
              },
            },
          }
        });
        const swiper2 = new Swiper(this, {
          slidesPerView: 'auto',
          spaceBetween: 20,
          watchOverflow: true,
          observer: true,
          observeParents: true,
          breakpoints: {
            1023: {
              spaceBetween: 10,
              pagination: {
                el: progressbarEl,
                type: 'progressbar',
              },
            },
          },
          on: {
            init: function () {
              setEqualStrongHeights(this.el);
            },
            imagesReady: function () {
              setEqualStrongHeights(this.el);
            },
            resize: function () {
              setEqualStrongHeights(this.el);
            }
          }
        });
        swiper1.controller.control = swiper2
        swiper2.controller.control = swiper1
      });

      function setEqualStrongHeights(containerSelector) {
        const $container = $(containerSelector);
        const $strongs = $container.find('.swiper-slide a > strong');

        $strongs.css('height', 'auto');
        let maxHeight = 0;
        $strongs.each(function () {
          const h = $(this).outerHeight();
          if (h > maxHeight) {
            maxHeight = h;
          }
        });
        $strongs.height(maxHeight);
      }
    });
  }

  initRecommendCourseSwiper() {
    let swiperContainer2 = document.querySelector('.local_course .list .swiper-container');
    if (!swiperContainer2) {
      return
    }
    let slidesCount2 = swiperContainer2.querySelectorAll('.swiper-slide').length;
    let winWidth = window.innerWidth;

    // 조건: 768~1023px이고 슬라이드가 4개 미만이면 스와이프 미적용
    if (winWidth >= 768 && winWidth <= 1023 && slidesCount2 < 4) {
      swiperContainer2.classList.add('lock'); // swiper 비활성화 시 필요한 스타일링
    } else {
      const swiper1 = new Swiper(".local_course .list .swiper-container", {
        spaceBetween: 20,
        slidesPerView: "auto",
        watchOverflow: true,
        observer: true,
        observeParents: true,
        pagination: {
          el: ".local_course .list .pagination-fraction",
          type: "fraction",
        },
        on: {
          init: function () {
            if (this.isLocked === true) {
              swiperContainer2.classList.add('lock');
            }
          }
        },
        breakpoints: {
          1023: {
            spaceBetween: 10
            // loop 조건은 위에서 이미 처리됨
          },
        }
      });
      const swiper2 = new Swiper(".local_course .list .swiper-container", {
        spaceBetween: 20,
        slidesPerView: "auto",
        watchOverflow: true,
        observer: true,
        observeParents: true,
        pagination: {
          el: ".local_course .list .pagination-progressbar",
          type: "progressbar",
        },
        on: {
          init: function () {
            if (this.isLocked === true) {
              swiperContainer2.classList.add('lock');
            }
          }
        },
        breakpoints: {
          1023: {
            spaceBetween: 10
            // loop 조건은 위에서 이미 처리됨
          },
        }
      });
      swiper1.controller.control = swiper2
      swiper2.controller.control = swiper1
    }

    let swiper = new Swiper(".local_course .banner .swiper-container", {
      slidesPerView: "auto",
      watchOverflow : true,
      pagination: {
        el: ".swiper-pagination",
        type: 'bullets',
        observer: true,
        observeParents: true,
        clickable: true,
        renderBullet: function (index, className) {
          return '<button type="button" class="' + className + '"><span class="blind">' + (index + 1) + '번째 슬라이드 보기</span></button>';
        }
      },
    });
  }

}