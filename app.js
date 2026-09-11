/* Footer year, plus the expand/collapse behaviour on the NREIP sub-project
   cards: collapsed shows a summary with a "Click to see more" pill, expanded
   swaps in the scrollable write-up and a "See less" pill. */

(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  function setOpen(sub, open) {
    var collapsed = sub.querySelector("[data-sub-collapsed]");
    var expanded = sub.querySelector("[data-sub-expanded]");
    var more = sub.querySelector("[data-sub-more]");
    if (!collapsed || !expanded) return;

    collapsed.hidden = open;
    expanded.hidden = !open;
    sub.classList.toggle("is-open", open);
    if (more) more.setAttribute("aria-expanded", open ? "true" : "false");

    if (open) {
      var scroller = expanded.querySelector(".scroller");
      if (scroller) scroller.scrollTop = 0;
    }
  }

  var subs = document.querySelectorAll("[data-sub]");

  Array.prototype.forEach.call(subs, function (sub) {
    var more = sub.querySelector("[data-sub-more]");
    var less = sub.querySelector("[data-sub-less]");

    if (more) {
      more.addEventListener("click", function () {
        setOpen(sub, true);
        var lessBtn = sub.querySelector("[data-sub-less]");
        if (lessBtn) lessBtn.focus();
      });
    }

    if (less) {
      less.addEventListener("click", function () {
        setOpen(sub, false);
        var moreBtn = sub.querySelector("[data-sub-more]");
        if (moreBtn) moreBtn.focus();
      });
    }
  });
})();
