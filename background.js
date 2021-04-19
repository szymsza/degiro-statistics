chrome.action.onClicked.addListener((tab) => {
  let url = chrome.runtime.getURL("index.html");
  chrome.tabs.create({
    url
  });
});
