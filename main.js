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

function round(number) {
  return Math.round(number * 100) / 100;
}

function parseNumber(numberString) {
  return round(parseFloat(numberString.replaceAll('.', '').replace(',', '.')));
}

function sumElements(nodeList) {
  let result = 0;
  nodeList.forEach(el => {
    result += parseNumber(el.getAttribute("title"));
  });
  return result;
}

function initialize(node) {
  let totalValue = sumElements(node.querySelectorAll("tbody tr [data-field='value']"));
  let changeAbsolute = sumElements(node.querySelectorAll("tbody tr [data-field='totalPl']"));
  const investedAmount = totalValue - changeAbsolute;
  const changeRelative = round(changeAbsolute * 100 / investedAmount);
  renderStatistics({
    totalValue,
    changeAbsolute,
    changeRelative,
    investedAmount
  }, node);
}

function renderStatistics(data, node) {
  // TODO - render nicely
  let el = document.createElement("div");
  el.innerHTML = "Total portfolio value: " + data.totalValue + "€<br>" +
    "Portfolio change: " + data.changeAbsolute + "€, " + data.changeRelative + "%" + "<br>" +
    "Invested amount: " + data.investedAmount + "€";
  node.parentNode.insertBefore(el, node.nextSibling);

}

window.onpopstate = history.onpushstate = pageChanged;
pageChanged();
