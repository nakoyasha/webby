function closeWarning() {
  const warning = document.getElementById("wip-feature");

  warning.remove();
}

function toggleDiv(divId, buttonId) {
  const div = document.getElementById(divId);
  const button = document.getElementById(buttonId);
  const isVisible = div.style.display == "flex";

  if (isVisible != true) {
    div.style.display = "flex";
    button.innerText = "Hide";
  } else {
    div.style.display = "none";
    button.innerText = "Show";
  }
}

function toggleStrings(buttonId) {
  toggleDiv("strings-diff", buttonId);
}

function toggleExperiments(buttonId) {
  toggleDiv("experiments-diff", buttonId);
}
