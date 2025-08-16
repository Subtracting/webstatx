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
        selectedMode: 'multiple',
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
        layout: 'force',
        data: graph.nodes,
        links: graph.links,
        categories: graph.categories,
        label: {
          show: true,
          position: 'right',
          formatter: function(d) {
            let t = d.data.title || '';
            return t.length > 15 ? t.slice(0, 15) + '...' : t;
          }
        },
        tooltip : {
          show: true,
          formatter: function(params) {
            return params.data.title || params.name
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
    myChart.dispatchAction({
      type: 'focusNodeAdjacency',
      seriesIndex: 0,
      dataIndex: params.dataIndex
    });
    chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
      chrome.tabs.update(tab.id, {url: params.data.name});
    });
  }
});

myChart.on('legendselectchanged', function (params) {
  let selectedName = params.name;

  let idx = graph.nodes.findIndex(n =>
    n.name === selectedName
  );

  if (idx !== -1) {
    myChart.dispatchAction({
      type: 'focusNodeAdjacency',
      seriesIndex: 0,
      dataIndex: idx
    });
  }
});

