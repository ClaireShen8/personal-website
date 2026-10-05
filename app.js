/* Hover-to-play on tiles with an embedded YouTube video: the player starts
   (muted, which browsers require for unprompted playback) when the pointer
   enters the tile and pauses when it leaves. Commands go through the embed's
   postMessage API, so no YouTube script needs loading. */

(function () {
  "use strict";

  function command(iframe, func) {
    if (!iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: func, args: [] }),
      "*"
    );
  }

  var tiles = document.querySelectorAll("[data-hover-video]");

  Array.prototype.forEach.call(tiles, function (tile) {
    var iframe = tile.querySelector("iframe");
    if (!iframe) return;

    var hovered = false;
    var loaded = false;

    // A command sent before the player loads is dropped, so replay the
    // current hover state once it is ready.
    iframe.addEventListener("load", function () {
      loaded = true;
      if (hovered) command(iframe, "playVideo");
    });

    tile.addEventListener("mouseenter", function () {
      hovered = true;
      if (loaded) command(iframe, "playVideo");
    });

    tile.addEventListener("mouseleave", function () {
      hovered = false;
      if (loaded) command(iframe, "pauseVideo");
    });
  });
})();
