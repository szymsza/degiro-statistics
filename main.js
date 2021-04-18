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

function initialize(node) {
  console.log("Inialize statistics with following node: ", node);
}

window.onpopstate = history.onpushstate = pageChanged;
pageChanged();
