'use strict';

import * as echarts from 'echarts';
import './popup.css';

var chartDom = document.getElementById('graph');
var myChart = echarts.init(chartDom, 'dark');
var option;

myChart.showLoading();

chrome.storage.local.get(function (graph) {

  myChart.hideLoading();
  option = {
    title: {
      text: 'Search History',
      subtext: '',
      top: 'top',
      left: 'right'
    },
    tooltip: {show: false},
    legend: [
      {
        selectedMode: "multiple",
        type: "scroll",
        data: graph.categories.map(function (a) {
          return a.name;
        }),
        orient: "vertical",
        left: "left",
        backgroundColor: 'rgba(26, 27, 30, 0.5)'
      }
    ],
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'circular',
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        label: {
          show: true,
          position: 'right',
          formatter: function(d) {
            return d.data.title;
          }
        },
        labelLayout: {
          hideOverlap: true
        },
        lineStyle: {
          curveness:  0.1,
          color: 'source',
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        },
        roam: true,
        force: {
          repulsion: 100
        }
      }
    ]
  };
  myChart.setOption(option);
});

option && myChart.setOption(option);


myChart.on('click', function (params) {
  if (params.seriesType === 'graph') {
    chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
      chrome.tabs.update(tab.id, {url: params.data.name});
    });
  }
})
