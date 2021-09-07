// --- CONSTANTS ---
const TRIGGER_URL = "#/portfolio";
const COLOURS = {
  red: "#cc4c3b",
  green: "#008753"
};
const LABELS = {
  title: "Portfolio statistics",
  nameHeading: "Name",
  valueHeading: "Value",
  totalValue: "Total value",
  changeAbsolute: "Absolute change",
  changeRelative: "Relative change",
  investedAmount: "Invested amount",
};
const ELEMENT_ID = "degiro-statistics-extension-table";
const DATA_LOAD_TIMEOUT = 250;
let LANGUAGE;



// --- MAIN FUNCTIONS ---
function pageChanged() {
  if (document.location.hash !== TRIGGER_URL || document.getElementById(ELEMENT_ID))
    return;

  let listenerTimeout = null;
  let statistics = {
    totalValue: 0,
    changeAbsolute: 0,
  };
  let templateTableNode = null;

  // Callback for main container DOM change
  const callback = function(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length != 1)
        continue;

      const node = mutation.addedNodes[0];
      const data = node.dataset;
      const totalValueSelector = "tbody tr [data-field='value']";
      const changeAbsoluteSelector = "tbody tr [data-field='totalPl']";

      // Is product position -> save data
      if (typeof data !== "object" || data.name !== "positions" || data.empty !== "false")
        continue;

      clearTimeout(listenerTimeout);

      if (node.querySelector(totalValueSelector) && node.querySelector(changeAbsoluteSelector)) {
        // Data table
        statistics.totalValue += _.sumElements(node.querySelectorAll(totalValueSelector));
        statistics.changeAbsolute += _.sumElements(node.querySelectorAll(changeAbsoluteSelector));
      } else {
        // Template teble
        templateTableNode = node;
      }

      listenerTimeout = setTimeout(function() {
        // All products loaded -> stop listening and render data
        observer.disconnect();
        initialize(statistics, templateTableNode);
      }, DATA_LOAD_TIMEOUT);
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

function initialize(data, node) {
  LANGUAGE = document.documentElement.lang;
  const {
    totalValue,
    changeAbsolute
  } = data;

  const investedAmount = totalValue - changeAbsolute;
  const changeRelative = _.round(changeAbsolute * 100 / investedAmount);
  renderStatistics([{
    label: LABELS.totalValue,
    value: totalValue,
    unit: "€",
    coloured: false,
  }, {
    label: LABELS.changeAbsolute,
    value: changeAbsolute,
    unit: "€",
    coloured: true,
  }, {
    label: LABELS.changeRelative,
    value: changeRelative,
    unit: "%",
    coloured: true,
  }, {
    label: LABELS.investedAmount,
    value: investedAmount,
    unit: "€",
    coloured: false,
  }], node);
}

function renderStatistics(data, node) {
  const el = node.cloneNode(true);
  el.id = ELEMENT_ID;
  _.removeNodeList(el.querySelectorAll("td:nth-child(n+3), th:nth-child(n+3), header>button"));

  // Element heading
  el.querySelector("header>h2").innerText = LABELS.title;

  // Table header
  el.querySelector("th:first-child").innerText = LABELS.nameHeading;
  el.querySelector("th:last-child").innerText = LABELS.valueHeading;

  // Table content
  const tbody = el.querySelector("tbody");
  const row = el.querySelector("tbody tr:first-child");
  _.removeNodeList(el.querySelectorAll("tbody tr"));

  for (let statistic of data) {
    const newRow = row.cloneNode(true);

    // Label
    newRow.querySelector("td:first-child").innerText = statistic.label;

    // Value
    const valueCell = newRow.querySelector("td:last-child");
    const valueIsPositive = statistic.value >= 0;
    valueCell.innerText = _.formatNumber(Math.abs(statistic.value), statistic.unit);
    if (statistic.coloured) {
      valueCell.innerText = (valueIsPositive ? "+" : "-") + " " + valueCell.innerText;
      valueCell.style.color = valueIsPositive ? COLOURS.green : COLOURS.red;
    }

    tbody.append(newRow);
  }

  node.parentNode.prepend(el);

}



// --- HELPERS ---
class _ {
  static round(number) {
    return Math.round(number * 100) / 100;
  }

  static parseNumber(numberString) {
    return _.round(parseFloat(numberString.replaceAll('.', '').replace(',', '.')));
  }

  static formatNumber(number, unit) {
    const numberString = number.toLocaleString(LANGUAGE);

    if (unit === "%")
      return numberString + unit;
    return unit + " " + numberString;
  }

  // Return sum of title attributes of elements of given node list
  static sumElements(nodeList) {
    let result = 0;
    nodeList.forEach(el => {
      result += _.parseNumber(el.getAttribute("title"));
    });
    return result;
  }

  // Delete given node list from DOM
  static removeNodeList(nodeList) {
    nodeList.forEach(e => e.parentNode.removeChild(e));
  }
}



// --- INITIALIZATION ---
window.onpopstate = history.onpushstate = pageChanged;
pageChanged();
