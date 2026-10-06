/* Hover-to-play on tiles with an embedded YouTube video. The player starts
   (muted, which browsers require for unprompted playback) when the pointer
   enters the tile and pauses when it leaves. YouTube's own controls are off;
   the page draws a scrub bar along the bottom of the video, shown only while
   the pointer is over the video itself. */

(function () {
  "use strict";

  var tiles = document.querySelectorAll("[data-hover-video]");
  if (!tiles.length) return;

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(seconds || 0));
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function setup(tile) {
    var iframe = tile.querySelector("iframe");
    var figure = iframe && iframe.closest("figure");
    var seek = tile.querySelector("[data-vc-seek]");
    var fill = tile.querySelector("[data-vc-fill]");
    if (!figure || !seek || !fill) return;

    var player = null;
    var ready = false;
    var hovered = false;
    var dragging = false;

    // CSS :hover covers most browsers, but hover over a cross-origin iframe
    // isn't always reported to the page, so track it here as well.
    figure.addEventListener("mouseenter", function () {
      figure.classList.add("is-hover");
    });
    figure.addEventListener("mouseleave", function () {
      if (!dragging) figure.classList.remove("is-hover");
    });

    function duration() {
      return ready ? player.getDuration() || 0 : 0;
    }

    function render(current) {
      var total = duration();
      if (current == null) current = ready ? player.getCurrentTime() : 0;
      fill.style.width = total ? (current / total) * 100 + "%" : "0";
      seek.setAttribute("aria-valuemax", String(Math.floor(total)));
      seek.setAttribute("aria-valuenow", String(Math.floor(current)));
      seek.setAttribute("aria-valuetext", formatTime(current) + " of " + formatTime(total));
    }

    player = new YT.Player(iframe, {
      events: {
        onReady: function () {
          ready = true;
          player.mute();
          if (hovered) player.playVideo();
          render();
        }
      }
    });

    tile.addEventListener("mouseenter", function () {
      hovered = true;
      if (ready) player.playVideo();
    });

    tile.addEventListener("mouseleave", function () {
      hovered = false;
      if (ready) player.pauseVideo();
    });

    // Scrubbing: seek continuously while dragging, then a final precise seek.
    function seekTo(event, final) {
      var total = duration();
      if (!total) return;
      var rect = seek.getBoundingClientRect();
      var fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      player.seekTo(fraction * total, final);
      render(fraction * total);
    }

    seek.addEventListener("pointerdown", function (event) {
      if (!ready) return;
      dragging = true;
      seek.classList.add("is-dragging");
      seek.setPointerCapture(event.pointerId);
      seekTo(event, false);
    });

    seek.addEventListener("pointermove", function (event) {
      if (dragging) seekTo(event, false);
    });

    function endDrag(event) {
      if (!dragging) return;
      dragging = false;
      seek.classList.remove("is-dragging");
      seekTo(event, true);
      if (!figure.matches(":hover")) figure.classList.remove("is-hover");
    }
    seek.addEventListener("pointerup", endDrag);
    seek.addEventListener("pointercancel", endDrag);

    seek.addEventListener("keydown", function (event) {
      if (!ready) return;
      var step = { ArrowLeft: -5, ArrowRight: 5 }[event.key];
      if (!step) return;
      event.preventDefault();
      var target = Math.min(duration(), Math.max(0, player.getCurrentTime() + step));
      player.seekTo(target, true);
      render(target);
    });

    setInterval(function () {
      if (ready && !dragging) render();
    }, 250);
  }

  // Load YouTube's player API once, then wire up every hover-video tile.
  var previous = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (previous) previous();
    Array.prototype.forEach.call(tiles, setup);
  };

  var script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
})();
