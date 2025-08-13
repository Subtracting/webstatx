'use strict';

var currentSiteTitle = document.title;
var dateTimeKey = Date.now();
var previousSite = 'none';

let currentSite = window.location.href;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TAB_UPDATED") {
    currentSite = message.url;
    console.log("Tab updated:", currentSite);
  }
});

console.log("Initial site:", currentSite);


function storeNodes(result, currentSite) {
  var nodes = result["nodes"];
  var categories = result["categories"];
  console.log(categories);

  var siteExistsFlag = false;
  var categoryExistsFlag = false;

  var currentIndex = -1;
  var newNodeId = parseInt(Object.keys(nodes).pop()) + 1;

  var currentCategory = currentSite.split("/").slice(0, 3).join("/");
  var newCategoryId = categories.length;

  // check if category exists
  // if it doesn't, add it to categories & give node currentCategoryId
  for (let j = 0; j < categories.length; j++) {
    if (currentCategory == categories[j].name) {
      categoryExistsFlag = true;
      newCategoryId = j;
      break;
    }
  };

  if (categoryExistsFlag == false) {
    categories.push({ name: currentCategory });
  };

  // check if site exists
  // if it doesn't, add it to nodes and increment node size
  for (let i = 0; i < nodes.length; i++) {
    if (currentSite == nodes[i].name) {
      siteExistsFlag = true;
      currentIndex = i;
      break;
    }
  };

  if (siteExistsFlag == false) {
    nodes.push({ id: newNodeId, name: currentSite, symbolSize: 1, category: newCategoryId, title: currentSiteTitle });
  }
  else {
    nodes[currentIndex].symbolSize = nodes[currentIndex].symbolSize + 2
  };

  return [nodes, categories];
}

function storeLinks(result, previousSite, currentSite) {
  var links = result["links"];
  var nodes = result["nodes"];

  var previousId = 0;
  var currentId = 0;

  for (let j = 0; j < nodes.length; j++) {
    if (previousSite == nodes[j].name) {
      previousId = nodes[j].id;
    };
    if (currentSite == nodes[j].name) {
      currentId = nodes[j].id;
    };
  };

  links.push({ source: previousId, target: currentId, previousSite: previousSite, currentSite: currentSite });

  return links;
}

chrome.storage.local.get(function (result) {

  console.log(result);

  if (result["nodes"] === undefined) {
    result = {
      "nodes": [
        {
          id: 0,
          name: '',
          symbolSize: 0,
          category: 0,
          title: 'Start'
        }
      ],
      "links": [
        {
          source: 0,
          target: 0
        }
      ],
      "categories": [
        {
          name: 'Start'
        }
      ]
    }
  };

  previousSite = result["links"].slice(-1)[0].currentSite;

  // store nodes & categories
  var [newNodes, newCategories] = storeNodes(result, currentSite);
  chrome.storage.local.set({ "categories": newCategories }).then(() => { });
  chrome.storage.local.set({ "nodes" : newNodes }).then(() => {

    // store links
    var newLinks = storeLinks(result, previousSite, currentSite);
    chrome.storage.local.set({ "links" : newLinks }).then(() => { });

  });


});

