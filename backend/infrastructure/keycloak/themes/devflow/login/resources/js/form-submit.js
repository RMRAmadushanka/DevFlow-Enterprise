/**
 * Real-world submit feedback: disable the form and show a spinner on the
 * primary button. No full-page overlay.
 */
(function () {
  function setButtonLoading(button, label) {
    if (!button || button.getAttribute("data-df-loading") === "true") return;
    button.setAttribute("data-df-loading", "true");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");

    if (button.tagName === "INPUT") {
      button.setAttribute("data-df-original-value", button.value || "");
      button.value = label;
      return;
    }

    button.setAttribute("data-df-original-html", button.innerHTML);
    button.innerHTML =
      '<span class="df-btn-spinner" aria-hidden="true"></span><span>' +
      label +
      "</span>";
  }

  function messageForForm(form) {
    var id = form && form.id ? form.id : "";
    if (id.indexOf("register") !== -1) return "Creating account…";
    if (id.indexOf("reset") !== -1 || id.indexOf("update-password") !== -1) {
      return "Saving…";
    }
    return "Signing in…";
  }

  function onSubmit(event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.getAttribute("data-df-skip-overlay") === "true") return;

    var submitter = event.submitter;
    if (submitter && submitter.name === "tryAnotherWay") return;

    var label = messageForForm(form);
    var buttons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
    var primary = submitter;

    if (!primary || (primary.type !== "submit" && primary.getAttribute("type") !== "submit")) {
      primary = form.querySelector('input[type="submit"], button[type="submit"]');
    }

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }

    if (primary) setButtonLoading(primary, label);

    form.setAttribute("aria-busy", "true");
    document.body.classList.add("df-is-submitting");
  }

  document.addEventListener("submit", onSubmit, true);
})();
