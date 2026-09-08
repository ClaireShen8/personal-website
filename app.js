/* The tiles render their full write-up inline, so there's nothing to wire up
   beyond the footer year. */

(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
