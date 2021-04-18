function pageChanged() {
  if (document.location.hash !== "#/portfolio")
    return;

  console.log("Correct page loaded");
}

window.onpopstate = history.onpushstate = pageChanged;
pageChanged();
