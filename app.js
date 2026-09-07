/* Tile -> modal. Each tile carries its own .detail block in the markup;
   clicking the tile clones that block into the dialog. */

(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var modal = document.getElementById("modal");
  if (!modal || typeof modal.showModal !== "function") return; // no <dialog>: details stay inline

  var tagEl   = document.getElementById("modal-tag");
  var titleEl = document.getElementById("modal-title");
  var orgEl   = document.getElementById("modal-org");
  var bodyEl  = document.getElementById("modal-body");
  var opener  = null;

  function textOf(tile, sel) {
    var el = tile.querySelector(sel);
    return el ? el.textContent.trim() : "";
  }

  function open(tile) {
    var detail = tile.querySelector(".detail");
    if (!detail) return;

    opener = tile;

    var bits = [textOf(tile, ".tile-tag"), textOf(tile, ".tile-state")].filter(Boolean);
    tagEl.textContent   = bits.join(" \u00b7 ");
    titleEl.textContent = textOf(tile, ".tile-title");

    var org = tile.querySelector(".tile-org");
    orgEl.textContent = org ? org.textContent.trim() : "";
    orgEl.style.display = org ? "" : "none";
    orgEl.classList.toggle("todo", !!(org && org.classList.contains("todo")));

    var clone = detail.cloneNode(true);
    clone.removeAttribute("hidden");
    bodyEl.replaceChildren(clone);

    modal.showModal();
    modal.querySelector(".modal-in").scrollTop = 0;
  }

  document.querySelectorAll(".tile").forEach(function (tile) {
    tile.addEventListener("click", function () { open(tile); });

    tile.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        open(tile);
      }
    });
  });

  modal.querySelector(".modal-x").addEventListener("click", function () {
    modal.close();
  });

  // Click the backdrop (outside the dialog box) to close.
  modal.addEventListener("click", function (e) {
    var r = modal.getBoundingClientRect();
    var inside =
      e.clientX >= r.left && e.clientX <= r.right &&
      e.clientY >= r.top  && e.clientY <= r.bottom;
    if (!inside) modal.close();
  });

  modal.addEventListener("close", function () {
    bodyEl.replaceChildren();
    if (opener) { opener.focus(); opener = null; }
  });
})();
