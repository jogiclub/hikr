
let safetyChart = null;
let covidChart = null;
let vaccineChart = null;
let safetyactiveindex = 0;
let safetylist = [];
let curationswiper;
let vaccinedata = null;
let coviddata = null;
let Mosize = false;
let maxCovid = 0;
let maxVaccine = 0;
if (hostname.indexOf("localhost") > -1)
  supporturl = 'https://dev.ktovisitkorea.com';
const datasetsVaccine = [] ;
const datasetsCovid = [];


function getCovidDetail(){

  fetchCovidDetail(function(data) {

    vaccinedata = data.vaccine;
    coviddata = data.covid;

    if(coviddata.length < 1 || coviddata.length.length < 1){
      $('.detail_graph_wrap').css('display','none');
      return;
    }

    for (let i = 0; i < data.vaccine.length; i++) {
      datasetsVaccine.push(data.vaccine[i].secondTotal);
      if(maxVaccine < data.vaccine[i].secondTotal){
        maxVaccine = data.vaccine[i].secondTotal;
      }
    }
    for (let i = 0; i < data.covid.length; i++) {
      datasetsCovid.push(data.covid[i].confirmed);
      if(maxCovid < data.covid[i].confirmed){
        maxCovid = data.covid[i].confirmed;
      }
    }

    createVaccineChart(datasetsVaccine)
    createCovidChart(datasetsCovid)

  });
}

function fetchCovidDetail(onSuccess) {

  $('.detail_graph_wrap').css('display','none');
  return;

  $.ajax({
    url: supporturl+'/api/v1/safeCaster/detail/week/'+cotId,
    method: 'GET',
    success: function(response) {
      onSuccess(response.data)
    },
    error: function(xhr, textStatus, errorThrown) {
      $('.detail_graph_wrap').css('display','none');
    }
  })
}

function fetchSafety(type, onSuccess) {
  $('.safely_index_graph').css('display','none');
  return;

  $.ajax({
    url: supporturl+'/api/v1/safeCaster/safety/' + type + '/'+cotId,
    method: 'GET',
    success: function(response) {
      onSuccess(response.data);
    },
    error: function(xhr, textStatus, errorThrown) {
      $('.safely_index_graph').css('display','none');
    }
  })
}

function fetchSafetyRateByCotId(cotId, successCallBack, failCallBack) {
	$.ajax({
		url: supporturl + '/api/v1/safeCaster/safety/week/' + cotId, 
		method: 'GET', 
		success: function(response) {
			var percentage = 0;// 안전여행지수 %.
			var indices = '';// 안전여행지수 class(문자).
			var sHourList = response.data[0].hours;
			
			for (var i = 0; i < sHourList.length; i++) {
				if (sHourList[i].isCurrent) {
					let hContact = sHourList[i].contact;// max.
					
					if (hContact >= 91) {
						percentage = 75 + ((hContact - 90) * 2.5);
					} else if (hContact >= 71) {
						percentage = 50 + ((hContact - 70) * 1.25);
					} else if (hContact >= 51) {
						percentage = 25 + ((hContact - 50) * 1.25);
					} else {
						percentage = hContact * 0.5;
					}
					
					hContact = Number(100 - hContact);
					
					if (hContact >= 50) {
						indices = 'good';
					} else if (hContact >= 30) {
						indices = 'average';
					} else if (hContact >= 10) {
						indices = 'care';
					} else if (hContact >= 0) {
						indices = 'vigilance';
					}
				}
			}
			
			successCallBack(percentage, indices);
		}, 
		error: function(xhr, textStatus, errorThrown) {
			failCallBack();
		}, 
	});
}

function onClickSafetyWeek($this) {

  if($this) {
    if($($this).hasClass('on')){
      return;
    } else{
      safetyactiveindex = 0;
      $('.congestion .btn button').removeClass('on');
      $('.congestion .btn button').removeAttr('title');
      $($this).addClass('on');
      $($this).attr('title','선택됨');
      $('.month_btn .prev').addClass('off');
      $('.month_btn .next').removeClass('off');
      $('.month_btn .prev').css('display','none');
      $('.month_btn .next').css('display','none');
    }
  } else
    return;

  let data = safetylist;
  const datasets = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].max >= 91) {
      datasets.push(75 + ((data[i].max - 90) * 2.5))
    } else if (data[i].max >= 71) {
      datasets.push(50 + ((data[i].max - 70) * 1.25))
    } else if (data[i].max >= 51) {
      datasets.push(25 + ((data[i].max - 50) * 1.25))
    } else {
      datasets.push(data[i].max * 0.5)
    }
  }
  createSafetyWeekChart(datasets);
  getsafetydate(2);
}

function getSafetyWeek(){
  var windowW = $(window).width();
  $('#safely_index_graph .loading').css('display','');
  /* mobile */
  if(windowW < 1023)
    Mosize = true;

  fetchSafety('week', function(data) {
    safetylist = data;
    if(safetylist.length < 1){
      $('.safely_index_graph').css('display','none');
      return;
    } else if(sOtdid.indexOf('4e706603-293b-11eb-b8bd-020027310001') != -1){
      $('.safely_index_graph').css('display','none');
      return;
    }
    onClickSafetyDay();
  })
}

function onClickSafetyDay($this) {
  // fetchSafety('today', function(data) {
  if( $('#safely_info').attr('data-percent') == '0')
    showLoding();
  if($this){
    if($($this).hasClass('on')){
      return;
    }else{
      $('.congestion .btn button').removeClass('on');
      $('.congestion .btn button').removeAttr('title');
      $($this).addClass('on');
      $($this).attr('title','선택됨');

      $('.month_btn .prev').css('display','');
      $('.month_btn .next').css('display','');
    }
  }

  const datasets = [];
  let data =  safetylist[safetyactiveindex];
  let thishourcnt = 0;
  for (var i = 0; i < data.hours.length; i++) {
    if (data.hours[i].contact >= 91) {
      datasets.push(75 + ((data.hours[i].contact - 90) * 2.5))
    } else if (data.hours[i].contact >= 71) {
      datasets.push(50 + ((data.hours[i].contact - 70) * 1.25))
    } else if (data.hours[i].contact >= 51) {
      datasets.push(25 + ((data.hours[i].contact - 50) * 1.25))
    } else {
      datasets.push(data.hours[i].contact * 0.5)
    }
    if(data.hours[i].isCurrent){
      thishourcnt = data.hours[i].contact;
      percnt = datasets[i];
    }
  }
  createSafetyDayChart(datasets);
  if( $('#safely_info').attr('data-percent') == '0')
    setsafelyInfo(thishourcnt,percnt);
  // })

  getsafetydate(1);
}

/**
 * 코로나 안전지수 당일 시간대별 차트 생성
 */

function createSafetyDayChart(datasets){

  datasets = datasets.reverse();

  const datalist = [];
  for (let i = 0; i < datasets.length; i++) {
    let backgroundColor = '';
    if (datasets[i] >= 75) {
      backgroundColor = 'rgb(253, 86, 103)';
    } else if (datasets[i] >= 50) {
      backgroundColor = 'rgb(255, 198, 0)';
    } else if (datasets[i] >= 25) {
      backgroundColor = 'rgb(30, 195, 178)';
    } else {
      backgroundColor = 'rgb(76, 160, 248)';
    }
    let data = {
      value : datasets[i],
      itemStyle : {
        color : backgroundColor
      }
    }
    datalist.push(data);
  }
  $('#safety_chart').css('display','');
  $('#safety_chart2').css('display','none');
  const ctx = document.getElementById('safety_chart');
  safetyChart= echarts.init(ctx);
  var option;
  option = {
    tooltip: {
      triggerOn: 'none'
    },
    xAxis: {
      type : 'category',
      axisTick: { show: false },
      splitLine: { show: false },
      data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      axisLabel : {
        formatter : function(value,index){
          if (value % 3 === 0) {
            return value + ':00';
          }
        }, fontSize : 11
        , interval : 0
      }, axisPointer: {
        value: new Date().getHours(),
        snap: true,
        lineStyle: {
          color: 'grey',
          width: 1
        },
        label: {
          show: true,
          color : 'white',
          fontFamily : 'monospace',
          fontSize : 12,
          borderRadius : 20,
          formatter: function (params) {
            return '현재';
          },
          backgroundColor: 'rgba(0,0,0,0.5)'
        },
        handle: {
          show: true,
          color: 'red'
        }
      },
    },
    yAxis: {
      min : 0,
      max : 100,
      minInterval : 25,
      offset : 2,
      axisLabel : {
        formatter : function(value,index){
          switch (value) {
            case 100: return '경계';
            case 75: return '주의';
            case 50: return '보통';
            case 25: return '양호';
            default: {}
          }
        }
      }
    },
    dataGroupId: '',
    animationDurationUpdate: 500,
    grid : {
      left : '10%',
      top : '5%',
      bottom : '12%',
      right : '4%'
    },
    series: {
      type: 'bar',
      id: 'sales',
      data: datalist,
      barCategoryGap: "50%",
      itemStyle : {
        borderRadius : 25
      },
      universalTransition: {
        enabled: true,
        divideShape: 'clone'
      }
    }
  };
    if(safetyactiveindex != 0)
      option.xAxis.axisPointer.show = false;
    else
      option.xAxis.axisPointer.show = true;
  option && safetyChart.setOption(option);

  $('#safetype').text('시간별');
  let html = '';
  for (let i = 0; i <datasets.length ; i++) {
    html += '<li>';
    html += '<em>'+i+':00</em>';
    html += '<span>'+safetydataCheck(datasets[i])+'</span>';
    html += '</li>';
  }
  $('.graph_wrap .blind ul').html(html);

  $('#safely_index_graph .loading').css('display','none');
}



function createSafetyDayChart2(datasets) {

  datasets = datasets.reverse();

  const ctx = document.getElementById('safety_chart');
  if (safetyChart) {
    safetyChart.destroy();
  }

  const backgroundGradient = ctx.getContext("2d").createLinearGradient(0, 250, 0, 0);
  backgroundGradient.addColorStop(0, "rgba(70, 185, 255, 0.0)");
  backgroundGradient.addColorStop(1, "rgba(70, 185, 255, 0.5)");

  const backgroundColors = [];
  for (let i = 0; i < datasets.length; i++) {
    if (datasets[i] >= 75) {
      backgroundColors.push('rgb(253, 86, 103)')
    } else if (datasets[i] >= 50) {
      backgroundColors.push('rgb(255, 198, 0)')
    } else if (datasets[i] >= 25) {
      backgroundColors.push('rgb(30, 195, 178)')
    } else {
      backgroundColors.push('rgb(76, 160, 248)')
    }
  }
  safetyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      lineAtIndex: new Date().getHours(),
      labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      datasets: [{
        barPercentage: 0.5,
        data: datasets,
        backgroundColor: backgroundColors,
        borderRadius: 20,
        pointBorderWidth: 3,
        borderSkipped: false,
        borderWidth: 0
      }],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
          display: true,
          grid: {
            display: true,
            color: "#e0dbd8",
            lineWidth: 1,
            zeroLineWidth: 10,
            zeroLineColor: "#2C292E",
            drawBorder: false,
          },
          ticks: {
            callback: function(value, index, values) {
              switch (value) {
                case 100: return '경계';
                case 75: return '주의';
                case 50: return '보통';
                case 25: return '양호';
                default: {}
              }
            },
            stepSize: 5,
          },
          min: -3,
          max: 100,
        },
        x: {
          grid: {
            display: false,
            borderWidth: 1,
            borderColor: 'black',
            drawTicks: true,
            tickWidth: 3,
          },
          ticks: {
            font: {
              size: 11,
            },
            callback: function(value, index, values) {
              if (value % 3 === 0) {
                return value + ':00';
              }
            },
          },
        },
      },
      plugins: {
        tooltip: {
          enabled: false
        },
        legend: {
          display: false,
        }
      },
    }
  });
  delete Chart.controllers.bar.prototype.initialize
  delete Chart.controllers.bar.prototype.draw
  createCurrentVerticalLine();
}

function createCurrentVerticalLine() {
  var originalLineDraw = Chart.controllers.bar.prototype.draw;
  var originalLineInitialize = Chart.controllers.bar.prototype.initialize;

  Object.assign(Chart.controllers.bar.prototype, {
    initialize: function () {
      originalLineInitialize.apply(this, arguments);
    },
    draw: function() {
      originalLineDraw.apply(this, arguments);

      var ctx = this.chart.ctx;

      if (safetyactiveindex !== 0) {
        return;
      }
      var index = this.chart.config.data.lineAtIndex;
      if (index != null) {
        var xaxis = this.chart.scales['x'];
        var yaxis = this.chart.scales['y'];

        // ctx.save();
        ctx.beginPath();
        ctx.moveTo(xaxis.getPixelForValue(index, undefined), yaxis.top);
        ctx.strokeStyle = 'grey';
        ctx.lineWidth = '1';
        ctx.setLineDash([2, 2]);
        // ctx.fillStyle = "rgba(155,155,155,0.25)";
        ctx.lineTo(xaxis.getPixelForValue(index, undefined), yaxis.bottom);
        ctx.stroke();
        ctx.lineWidth = '1';
        ctx.restore();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.roundRect(xaxis.getPixelForValue(index, undefined) - 16, yaxis.bottom + 5, 32, 20, 10);
        ctx.fill();
        ctx.font = '12px mono';
        ctx.textAlign = "center";
        ctx.fillStyle = 'white';
        ctx.fillText('현재', xaxis.getPixelForValue(index, undefined), yaxis.bottom + 20);
        ctx.closePath()
      }
    }
  });
}

/**
 * 코로나 안전지수 요일별 차트 생성
 */

function createSafetyWeekChart(datasets) {

  const datalist = [];

  for (let i = 0; i < datasets.length; i++) {
    let backgroundColor = '';
    if (datasets[i] >= 75) {
      backgroundColor = 'rgb(253, 86, 103)';
    } else if (datasets[i] >= 50) {
      backgroundColor = 'rgb(255, 198, 0)';
    } else if (datasets[i] >= 25) {
      backgroundColor = 'rgb(30, 195, 178)';
    } else {
      backgroundColor = 'rgb(76, 160, 248)';
    }
    let data = {
      value : datasets[i],
      itemStyle : {
        color : backgroundColor
      }
    }
    datalist.push(data);
  }

  $('#safety_chart2').css('display','');
  $('#safety_chart').css('display','none');
  const ctx = document.getElementById('safety_chart2');
  safetyChart= echarts.init(ctx);
  var option;
  option = {
    tooltip: {
      triggerOn: 'none'
    },
    xAxis: {
      type : 'category',
      // axisTick: { show: false },
      // splitLine: { show: false },
      data: getFuture7DayLabels(datasets.length),
      axisPointer: {
        value: 0,
        snap: true,
        lineStyle: {
          color: 'grey',
          width: 1
        },
        label: {
          show: true,
          color : 'white',
          fontFamily : 'monospace',
          borderRadius : 20,
          formatter: function (params) {
            return '현재';
          },
          backgroundColor: 'rgba(0,0,0,0.5)'
        },
        handle: {
          show: true,
          color: 'red'
        }
      },
    },
    yAxis: {
      min : 0,
      max : 100,
      minInterval : 25,
      offset : 2,
      axisLabel : {
        formatter : function(value,index){
          switch (value) {
            case 100: return '경계';
            case 75: return '주의';
            case 50: return '보통';
            case 25: return '양호';
            default: {}
          }
        }
      }
    },
    dataGroupId: '',
    animationDurationUpdate: 500,
    grid : {
      left : '10%',
      top : '5%',
      bottom : '12%',
      right : '4%'
    },
    series: {
      type: 'bar',
      data: datalist,
      barCategoryGap: "50%",
      itemStyle : {
        borderRadius : 25
      },
      universalTransition: {
        enabled: true,
        divideShape: 'clone'
      }
    }
  };
  option && safetyChart.setOption(option);

  $('#safetype').text('일간별');
  let html = '';
  let days = getFuture7DayLabels(datasets.length);
  for (let i = 0; i <datasets.length ; i++) {
    html += '<li>';
    html += '<em>'+days[i]+'</em>';
    html += '<span>'+safetydataCheck(datasets[i])+'</span>';
    html += '</li>';
  }
  $('.graph_wrap .blind ul').html(html);
}

function createSafetyWeekChart2(datasets) {
  const ctx = document.getElementById('safety_chart');
  if (safetyChart) {
    safetyChart.destroy();
  }

  const backgroundGradient = ctx.getContext("2d").createLinearGradient(0, 250, 0, 0);
  backgroundGradient.addColorStop(0, "rgba(70, 185, 255, 0.0)");
  backgroundGradient.addColorStop(1, "rgba(70, 185, 255, 0.5)");

  const backgroundColors = [];
  for (let i = 0; i < datasets.length; i++) {
    if (datasets[i] >= 91) {
      backgroundColors.push('rgb(253, 86, 103)')
    } else if (datasets[i] >= 71) {
      backgroundColors.push('rgb(255, 198, 0)')
    } else if (datasets[i] >= 51) {
      backgroundColors.push('rgb(30, 195, 178)')
    } else {
      backgroundColors.push('rgb(76, 160, 248)')
    }
  }

  safetyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: getFuture7DayLabels(datasets.length),
      lineAtIndex: 0,
      datasets: [{
        barPercentage: 0.5,
        data: datasets,
        backgroundColor: backgroundColors,
        borderRadius: 10,
        pointBorderWidth: 3,
        borderSkipped: false,
        borderWidth: 0
      }],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: {
          display: true,
          grid: {
            display: true,
            color: "#e0dbd8",
            lineWidth: 1,
            zeroLineWidth: 10,
            zeroLineColor: "#2C292E",
            drawTicks: false,
            drawBorder: false,
          },
          ticks: {
            callback: function(value, index, values) {
              switch (value) {
                case 100: return '경계';
                case 75: return '주의';
                case 50: return '보통';
                case 25: return '양호';
                default: {}
              }
            },
            stepSize: 5,
          },
          min: -3,
          max: 100,
        },
        x: {
          grid: {
            display: false,
            borderWidth: 1,
            drawTicks: true,
            tickWidth: 3,
            borderColor: 'black'
          }
        },
      },
      plugins: {
        tooltip: {
          enabled: false,
        },
        legend: {
          display: false,
        }
      },
    }
  });
}

/**
 * 코로나 백신 접종 누적자 수 차트 생성
 */
function createVaccineChart() {

  $('#vaccine_chart').empty();
  const ctx = document.getElementById('vaccine_chart');
  let grid = new Object();

  $('#vaccine_chart').height($('#vaccine_chart').parent().height());
  $('#vaccine_chart').width($('#vaccine_chart').parent().width());
  vaccineChart = echarts.init(ctx);

  grid.left = checkleftGrid(maxVaccine);
  if(Mosize){
    grid.top = "5%";
    grid.bottom = "12%";
    grid.right = "4%";
  } else{
    grid.left = "18%";
    grid.top = "5%";
    grid.bottom = "12%";
    grid.right = "4%";
  }
  let option;
  option = {
    tooltip: {
      trigger: 'item' ,
      formatter: function (params) {

        return ((params.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + '명';
        // return (params.value) + '명';
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: getPast7DateLabels(vaccinedata),
      axisTick: {
        show: false
      }, axisLabel : {
        padding : 5
      }
    },
    yAxis: {
      type: 'value',
      scale : true,
      min : function(){
        let num = Math.min.apply(null,datasetsVaccine);
        let num2 = Number(num.toString().substring(0,3));
        for (let i = 0; i <num.toString().length-3 ; i++) {
          num2 = num2 * 10;
        }
        return num2;
      },
      nameTextStyle : {
        fontSize : 12,
      }, axisLabel : {
        padding : 5,
      },
    },
    grid : grid,
    series: [
      {
        data:datasetsVaccine,
        type: 'line',
        symbolSize: 7,
        smooth: true,
        symbol: 'circle',
        itemStyle: {
          color: 'rgba(70, 185, 255, 1)',
          borderColor : 'rgba(70, 185, 255, 1)',
          borderWidth: 1
        }, lineStyle : {
          color: 'rgba(70, 185, 255, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            {
              offset: 0,
              color: 'rgba(70, 185, 255, 0.0)'
            },
            {
              offset: 1,
              color: 'rgba(70, 185, 255, 0.5)'
            }
          ])
        },
      }
    ]
  };

  option && vaccineChart.setOption(option);

  let html = '';
  for (let i = 0; i < vaccinedata.length; i++) {
    html+= '<li>';
    html+= '<em>'+vaccinedata[i].date+'</em>';
    html+= '<span>'+((vaccinedata[i].secondTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))+'명</span>';
    html+= '</li>';
  }
  $('.inoculator .graph .blind ul').html(html);
}

function checkleftGrid(maxcnt){
  if(Mosize) {
    if (maxcnt >= 10000000)
      return "24%";
    else if (maxcnt >= 1000000)
      return "21%";
    else if (maxcnt >= 100000)
      return "19%";
    else if (maxcnt >= 10000)
      return "16%";
    else if (maxcnt >= 1000)
      return "14%";
    else
      return "12%";
  } else{
    if (maxcnt >= 10000000)
      return "19%";
    else if (maxcnt >= 1000000)
      return "17%";
    else if (maxcnt >= 100000)
      return "15%";
    else if (maxcnt >= 10000)
      return "13%";
    else if (maxcnt >= 1000)
      return "11%";
    else
      return "9%";
  }
}
function createCovidChart() {

  $('#covid_chart').empty();
  $('#covid_chart').height($('#covid_chart').parent().height());
  $('#covid_chart').width($('#covid_chart').parent().width());
  const ctx = document.getElementById('covid_chart');
  let grid = new Object();

  grid.left = checkleftGrid(maxCovid);
  if(Mosize){
    grid.top = "5%";
    grid.bottom = "12%";
    grid.right = "4%";
  } else{
    grid.top = "5%";
    grid.bottom = "12%";
    grid.right = "4%";
  }




  covidChart = echarts.init(ctx);
  let option;
  option = {
    tooltip: {
      trigger: 'item' ,
      formatter: function (params) {
        return ((params.value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")) + '명';
        // return (params.value) + '명';
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: getPast7DateLabels(coviddata),
      axisTick: {
        show: false
      }, axisLabel : {
        padding : 5
      }
    },
    yAxis: {
      type: 'value',
      scale : true,
      min : function(){
        let num = Math.min.apply(null,datasetsCovid);
        let num2 = Number(num.toString().substring(0,2));
        for (let i = 0; i <num.toString().length-2 ; i++) {
          num2 = num2 * 10;
        }
        return num2;
      },
      nameTextStyle : {
        fontSize : 12,
      }, axisLabel : {
        padding : 5
      }
    },
    grid : grid,
    series: [
      {
        data:datasetsCovid,
        type: 'line',
        symbolSize: 7,
        smooth: true,
        symbol: 'circle',
        itemStyle: {
          color: 'rgba(255, 99, 132, 1)',
          borderColor : 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            {
              offset: 0,
              color: 'rgba(250, 155, 159, 0)'
            },
            {
              offset: 1,
              color: 'rgba(250, 155, 159, 1)'
            }
          ])
        },
      }
    ]
  };


  option && covidChart.setOption(option);

  let html = '';
  for (let i = 0; i < coviddata.length; i++) {
    html+= '<li>';
    html+= '<em>'+coviddata[i].date+'</em>';
    html+= '<span>'+coviddata[i].confirmed+'명</span>';
    html+= '</li>';
  }
  $('.coronic .graph .blind ul').html(html);
}

const getFuture7DayLabels = function(length) {
  const days = []
  for (let i = 0; i < length; i++) {
    let date = new Date();
    date.setDate(date.getDate() + i)
    days.push(getDayOfNumber(date.getDay()))
  }
  return days;
}

const getDayOfNumber = function(number) {
  return ['일', '월', '화', '수', '목', '금', '토'][number];
}

const getPast7DateLabels = function(data) {
  const dates = []
  for (let i = 0; i < data.length; i++) {
    let date = new Date(data[i].date);
    dates.push((date.getMonth() + 1) + '.' + date.getDate())
  }
  return dates;
}

/**
 * 차트 툴팁 관련 처리
 */
const getOrCreateTooltip = function(chart) {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'black';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .5s ease';
    tooltipEl.style.boxSizing = 'content-box';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

/**
 * 차트 툴팁 관련 처리
 */
// const externalTooltipHandler = function(context) {
//   // Tooltip Element
//   const {chart, tooltip} = context;
//   const tooltipEl = getOrCreateTooltip(chart);
//
//   // Set Text
//   if (tooltip.body) {
//     const bodyLines = tooltip.body.map(b => b.lines);
//
//     const tableBody = document.createElement('tbody');
//     bodyLines.forEach((body, i) => {
//       const tr = document.createElement('tr');
//       tr.style.backgroundColor = 'inherit';
//       tr.style.borderWidth = 0;
//
//       const td = document.createElement('td');
//       td.style.borderWidth = 0;
//       td.style.fontWeight = 'bold';
//       td.style.width = '100%';
//       td.style.textAlign = 'center';
//
//       const text = document.createTextNode(body + '명');
//
//       td.appendChild(text);
//       tr.appendChild(td);
//       tableBody.appendChild(tr);
//     });
//
//     const tableRoot = tooltipEl.querySelector('table');
//     while (tableRoot.firstChild) {
//       tableRoot.firstChild.remove();
//     }
//     tableRoot.appendChild(tableBody);
//   }

//   const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;
//
//   tooltipEl.style.opacity = 1;
//   tooltipEl.style.left = positionX + tooltip.caretX + 'px';
//   tooltipEl.style.top = -50 + positionY + tooltip.caretY + 'px';
//   tooltipEl.style.font = tooltip.options.bodyFont.string;
//   tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
//
//   if(tooltipEl.textContent.length> 7)
//     tooltipEl.style.width = 100+'px';
//   else
//     tooltipEl.style.width = 50+'px';
// };

/**
 * 캔버스 Rounded Square 생성 사용자 정의 함수
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

function getsafetydate(type){
  let date = new Date();
  if(type == 1) {
    date.setDate(date.getDate() + safetyactiveindex)
    $('#safety_day').text(date.getMonth() + 1 + '월 ' + date.getDate() + '일 (' + getDayOfNumber(date.getDay()) + ')');
  }else{
    let tit = date.getMonth()+1+'월 '+date.getDate()+'일 ('+getDayOfNumber(date.getDay())+') ~ ';
    date.setDate(date.getDate() + 6)
    tit += date.getMonth()+1+'월 '+date.getDate()+'일 ('+getDayOfNumber(date.getDay())+')';
    $('#safety_day').text(tit);
  }
}

function setsafelyInfo(max,per){
  max = Number(100-max);
  let html = '<span></span>';
  let grade = '양호';
  html += '<em>';
  if(max >= 50){
    html += '<img src="../resources/images/sub/hojong1.gif" alt="양호">';
    html += '</em>';
    $('#safely_info').addClass('good');
  } else if(max >= 30){
    html += '<img src="../resources/images/sub/hojong2.gif" alt="보통">';
    html += '</em>';
    grade = '보통';
    $('#safely_info').addClass('average');
  }  else if(max >= 10){
    html += '<img src="../resources/images/sub/hojong3.gif" alt="주의">';
    grade = '주의';
    $('#safely_info').addClass('care');
  }  else if(max >= 0){
    html += '<img src="../resources/images/sub/hojong4.gif" alt="경계">';
    grade = '경계';
    $('#safely_info').addClass('vigilance');
  }
  html += '</em>';
  html += '<strong>'+grade+'</strong>';
  $('#safely_info').html(html);
  $('#safely_info').attr('data-percent',per);
  Setsafetyprogrss();
  $('#nowdata').text('현재 : '+grade)
}


$('.detail_graph_wrap .btn_open').click(function(){
  if(!$('#vaccine_chart').hasClass('on')){
    getCovidDetail();
    $('#vaccine_chart').addClass('on');
  }
});

$('.congestion .month_btn .next').click(function (e){

  let index = 6;
  if(safetylist.length < 5)
    index = safetylist.length;

  if(safetyactiveindex == index)
    return;
  else if (safetyactiveindex == index-1)
    $(this).addClass('off');

  $('.congestion .month_btn .prev').removeClass('off');
  safetyactiveindex++;
  onClickSafetyDay();
  getsafetydate(1);
});

$('.congestion .month_btn .prev').click(function (e){
  if(safetyactiveindex == 0)
    return;
  else if (safetyactiveindex == 1)
    $(this).addClass('off');
  safetyactiveindex--;
  onClickSafetyDay();
  getsafetydate(1);
  $('.congestion .month_btn .next').removeClass('off');
});

function safetydataCheck(value){

  if (value >= 75) {
    return '경계';
  } else if (value >= 50) {
    return '주의';
  } else if (value >= 25) {
    return '보통';
  } else {
    return '양호';
  }
}


