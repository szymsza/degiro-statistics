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
  renderStatistics([{
    label: "Total portfolio value",
    value: totalValue,
    unit: "€"
  }, {
    label: "Absolute portfolio change",
    value: changeAbsolute,
    unit: "€"
  }, {
    label: "Relative portfolio change",
    value: changeRelative,
    unit: "%"
  }, {
    label: "Invested amount",
    value: investedAmount,
    unit: "€"
  }], node);
}

function removeNodeList(nodeList) {
  nodeList.forEach(e => e.parentNode.removeChild(e));
}

function renderStatistics(data, node) {
  let el = node.cloneNode(true);
  removeNodeList(el.querySelectorAll("td:nth-child(n+3), th:nth-child(n+3)"));

  // Element heading
  el.querySelector("[data-name='productType']").innerText = "Portfolio statistics";

  // Table header
  el.querySelector("th:first-child>div").innerText = "Name";
  el.querySelector("th:last-child>div").innerText = "Value";

  // Table content
  let tbody = el.querySelector("tbody");
  let row = el.querySelector("tbody tr:first-child");
  removeNodeList(el.querySelectorAll("tbody tr"));

  for (let statistic of data) {
    let newRow = row.cloneNode(true);
    newRow.querySelector("td:first-child>*").innerText = statistic.label;
    newRow.querySelector("td:last-child>*").innerText = statistic.value + statistic.unit;
    tbody.append(newRow);
  }

  node.parentNode.insertBefore(el, node.nextSibling);

}

window.onpopstate = history.onpushstate = pageChanged;
pageChanged();
