const TRIGGER_URL = "#/portfolio";

function pageChanged() {
  if (document.location.hash !== TRIGGER_URL)
    return;

  // Callback for main container DOM change
  const callback = function(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length != 1)
        continue;

      const node = mutation.addedNodes[0];
      const data = node.dataset;

      if (typeof data === "object" && data.name === "positions" && data.empty === "false") {
        observer.disconnect();
        return initialize(node);
      }
    }
  };

  // Degiro content is loaded dynamically - listen for DOM changes to identify when required element has been loaded
  const observer = new MutationObserver(callback);

  observer.observe(document.getElementById("appContainer"), {
    attributes: false,
    childList: true,
    subtree: true
  });
}

function parseNumber(numberString) {
  return parseFloat(numberString.replaceAll('.', '').replace(',', '.'));
}

function sumElements(nodeList) {
  let result = 0;
  nodeList.forEach(el => {
    result += parseNumber(el.getAttribute("title"));
  });
  return result;
}

function initialize(node) {
  let totalPortfolioValue = sumElements(node.querySelectorAll("tbody tr [data-field='value']"));
  let portfolioChange = sumElements(node.querySelectorAll("tbody tr [data-field='totalPl']"));
  console.log("Total portfolio value: ", totalPortfolioValue, ", portfolio change: ", portfolioChange);
}

window.onpopstate = history.onpushstate = pageChanged;
pageChanged();
