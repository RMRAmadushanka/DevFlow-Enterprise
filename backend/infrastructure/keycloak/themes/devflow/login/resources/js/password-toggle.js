/**
 * Password visibility toggle only. Does not authenticate, store, or log values.
 */
(function () {
  "use strict";

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) {
      return;
    }
    var button = target.closest("[data-password-toggle]");
    if (!button) {
      return;
    }
    event.preventDefault();
    var fieldId = button.getAttribute("data-password-toggle");
    if (!fieldId) {
      return;
    }
    var input = document.getElementById(fieldId);
    if (!input) {
      return;
    }
    var show = input.getAttribute("type") === "password";
    input.setAttribute("type", show ? "text" : "password");
    button.setAttribute("aria-pressed", show ? "true" : "false");
    button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
})();
