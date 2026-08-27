/* Rumah Manusia — behavior layer.
 *
 * Deliberately holds no content: every state of every section is already in
 * index.html, and this file only toggles `hidden`, swaps a few icon paths, and
 * drives the motion. Labels and counts are read back out of the DOM, so adding
 * a program, month, quote or trainer stays an HTML-only edit.
 */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The canvas source restarted an animation by alternating two identical
     keyframe names across a re-render. Nothing re-renders here, so restart it
     by hand instead — see CLAUDE.md. */
  function replay(el, anim) {
    if (reduced || !el) return;
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = anim;
  }

  var EASE = "cubic-bezier(.2,.7,.2,1)";
  var CLOSE_PATH = "M18 6 6 18M6 6l12 12";
  var SUN_PATH = "M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4" +
    "M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z";
  var PAUSE_PATH = "M6 4h4v16H6zM14 4h4v16h-4z";

  /* ── theme ─────────────────────────────────────────────────────────────
     The <head> script already resolved and applied the theme before first
     paint; this only keeps the button in sync and handles the toggle. */
  var themeBtn = $("#rm-theme");
  if (themeBtn) {
    var themePath = $("svg path", themeBtn);
    var moonPath = themePath.getAttribute("d");

    var paintTheme = function (theme) {
      var label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
      themePath.setAttribute("d", theme === "dark" ? SUN_PATH : moonPath);
    };

    paintTheme(document.documentElement.getAttribute("data-theme") || "light");

    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark"
        ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("rm-theme", next); } catch (e) {}
      paintTheme(next);
    });
  }

  /* ── stat counters ─────────────────────────────────────────────────────── */
  function runCounters() {
    var els = $$(".rm-stat-v");
    if (!els.length) return;

    var paint = function (progress) {
      els.forEach(function (el) {
        var from = Number(el.dataset.from);
        var to = Number(el.dataset.to);
        el.textContent = Math.round(from + (to - from) * progress) + el.dataset.suffix;
      });
    };

    if (reduced) { paint(1); return; }

    var start = performance.now();
    var step = function (now) {
      var p = Math.min(1, (now - start) / 1400);
      paint(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ── loader → hero entrance ────────────────────────────────────────────── */
  var loader = $(".rm-loader");
  var heroLit = false;
  var loadFallback;

  function lightHero() {
    if (heroLit) return;
    heroLit = true;
    clearTimeout(loadFallback);

    var hero = $(".rm-hero");
    if (hero) hero.classList.add("rm-lit");
    var panel = $(".rm-panel");
    if (panel) panel.classList.add("rm-lit");

    setTimeout(runCounters, 700);
  }

  function dismissLoader() {
    if (loader) loader.dataset.done = "true";
    setTimeout(lightHero, 260);
  }

  /* A stalled image must not leave the loader covering the page forever. */
  loadFallback = setTimeout(dismissLoader, 2600);

  if (document.readyState === "complete") setTimeout(dismissLoader, 380);
  else window.addEventListener("load", function () {
    setTimeout(dismissLoader, 380);
  }, { once: true });

  /* ── scroll reveal ─────────────────────────────────────────────────────
     Sections start at opacity 0, so a failure here hides content. Anything
     already near the viewport is revealed immediately, and a late sweep plus
     the no-IntersectionObserver fallback both open everything. */
  var rises = $$(".rm-rise");
  var nearViewport = function (el) {
    return el.getBoundingClientRect().top < window.innerHeight * 0.75;
  };

  if (!("IntersectionObserver" in window)) {
    rises.forEach(function (el) { el.classList.add("rm-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("rm-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -25% 0px", threshold: 0 });

    rises.forEach(function (el) {
      if (nearViewport(el)) el.classList.add("rm-in");
      else io.observe(el);
    });

    setTimeout(function () {
      rises.forEach(function (el) {
        if (nearViewport(el)) el.classList.add("rm-in");
      });
    }, 600);
  }

  /* ── sticky header + scroll progress ───────────────────────────────────── */
  var head = $(".rm-head");
  var progress = $(".rm-progress");
  var progressBar = progress && $("span", progress);

  var scrollMax = function () {
    return document.documentElement.scrollHeight - window.innerHeight;
  };

  function onScroll() {
    if (head) head.classList.toggle("rm-stuck", window.scrollY > 24);
    if (!progressBar) return;
    var max = scrollMax();
    var pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    progressBar.style.width = pct + "%";
    progress.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (progress) {
    progress.addEventListener("click", function (event) {
      var rect = progress.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      window.scrollTo({ top: scrollMax() * ratio, behavior: "smooth" });
    });

    progress.addEventListener("keydown", function (event) {
      var page = window.innerHeight * 0.9;
      var target = null;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        target = Math.min(scrollMax(), window.scrollY + page);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        target = Math.max(0, window.scrollY - page);
      } else if (event.key === "Home") {
        target = 0;
      } else if (event.key === "End") {
        target = scrollMax();
      }

      if (target === null) return;
      event.preventDefault();
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  }

  /* ── WhatsApp panel ────────────────────────────────────────────────────── */
  var fab = $(".rm-fab");
  var fabBtn = $("#rm-fabbtn");

  if (fab && fabBtn) {
    var fabSvg = $("svg", fabBtn);
    var fabPath = $("path", fabSvg);
    var waPath = fabPath.getAttribute("d");

    var setFab = function (open) {
      fab.dataset.open = open ? "true" : "false";
      fabBtn.setAttribute("aria-expanded", open ? "true" : "false");
      fabBtn.setAttribute("aria-label", open ? "Close chat" : "Chat on WhatsApp");
      fabPath.setAttribute("d", open ? CLOSE_PATH : waPath);
      fabSvg.setAttribute("fill", open ? "none" : "#ffffff");
      fabSvg.setAttribute("stroke", open ? "#ffffff" : "none");
    };

    fabBtn.addEventListener("click", function () {
      setFab(fab.dataset.open !== "true");
    });

    var waHref = $(".rm-fabcard a[href^='https://wa.me/']");
    var waBase = waHref ? waHref.getAttribute("href") : null;

    $$(".rm-quick").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (waBase) {
          window.open(waBase + "?text=" + encodeURIComponent(btn.dataset.ask),
            "_blank", "noopener");
        }
        setFab(false);
      });
    });
  }

  /* ── mobile menu ───────────────────────────────────────────────────────── */
  var nav = $("#rm-nav");
  var burger = $("#rm-burger");

  if (nav && burger) {
    var burgerPath = $("svg path", burger);
    var openPath = burgerPath.getAttribute("d");

    var setMenu = function (open) {
      nav.dataset.open = open ? "true" : "false";
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burgerPath.setAttribute("d", open ? CLOSE_PATH : openPath);
    };

    burger.addEventListener("click", function () {
      setMenu(nav.dataset.open !== "true");
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
  }

  function closeOverlays() {
    if (fab && fab.dataset.open === "true") fabBtn.click();
    if (nav && nav.dataset.open === "true") burger.click();
  }

  document.addEventListener("pointerdown", function (event) {
    if (fab && fab.dataset.open === "true" && !fab.contains(event.target)) fabBtn.click();
    if (nav && nav.dataset.open === "true" && head && !head.contains(event.target)) burger.click();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeOverlays();
  });

  /* ── program catalogue ─────────────────────────────────────────────────── */
  var programs = { track: 0, showAll: false, query: "" };
  var progCount = $("#rm-prog-count");
  var progEmpty = $("#rm-prog-empty");
  var progToggle = $("#rm-prog-toggle");
  var progSearch = $("#rm-search");
  var COLLAPSED_ROWS = Number(progToggle && progToggle.dataset.collapsed) || 15;

  function renderPrograms() {
    var panel = document.getElementById("rm-track-" + programs.track);
    if (!panel) return;

    var rows = $$(".rm-prog", panel);
    var query = programs.query.trim().toLowerCase();
    var matched = rows.filter(function (row) {
      return !query || row.dataset.name.indexOf(query) !== -1;
    });

    var collapsed = !programs.showAll && !query && matched.length > COLLAPSED_ROWS;
    var visible = collapsed ? matched.slice(0, COLLAPSED_ROWS) : matched;

    rows.forEach(function (row) { row.hidden = true; });
    visible.forEach(function (row) { row.hidden = false; });

    progCount.textContent = visible.length + " of " + rows.length + " programs";
    progEmpty.textContent = matched.length ? "" : (progEmpty.dataset.note || "");
    progToggle.hidden = !(collapsed || programs.showAll);
    progToggle.textContent = collapsed
      ? "Show all " + rows.length + " programs"
      : "Show fewer";
  }

  if (progSearch) {
    progSearch.addEventListener("input", function () {
      programs.query = progSearch.value;
      renderPrograms();
    });
  }

  if (progToggle) {
    progToggle.addEventListener("click", function () {
      programs.showAll = !programs.showAll;
      renderPrograms();
    });
  }

  renderPrograms();

  /* ── tab groups (approach, formats, program tracks) ────────────────────── */
  $$('[role="tablist"][data-tabs]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);

    var select = function (index, focus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;

        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (!panel) return;
        panel.hidden = !active;
        if (active) replay(panel, "rm-t-a 420ms " + EASE);
      });

      if (focus) tabs[index].focus();
      if (list.dataset.tabs === "track") {
        programs.track = index;
        programs.showAll = false;
        renderPrograms();
      }
    };

    tabs.forEach(function (tab, i) {
      tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
      tab.addEventListener("click", function () { select(i); });

      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });
  });

  /* ── schedule ──────────────────────────────────────────────────────────
     Month names come from the pill buttons and topic counts from each list's
     child count, so the 14 months live only in index.html. */
  var monthLists = $$(".rm-month-topics");
  var monthPills = $$(".rm-month-pill");
  var tlNodes = $$(".rm-tl-node");
  var barNodes = $$(".rm-bar-node");
  var monthHead = $("#rm-month-head");
  var monthLabel = $("#rm-month-label");
  var monthCount = $("#rm-month-count");
  var playBtn = $("#rm-play");
  var month = 0;
  var timer = null;

  var ACCENT = "var(--color-accent)";
  var IDLE = "var(--color-neutral-300)";

  function setMonth(index) {
    if (!monthLists.length) return;
    month = (index + monthLists.length) % monthLists.length;

    tlNodes.forEach(function (node, i) {
      var active = i === month;
      var circle = $("circle", node);
      var text = $("text", node);
      circle.setAttribute("r", active ? "9" : "5");
      circle.setAttribute("fill", active ? ACCENT : IDLE);
      text.setAttribute("font-weight", active ? "600" : "400");
    });

    barNodes.forEach(function (node, i) {
      $$("rect", node)[1].setAttribute("fill", i === month ? ACCENT : IDLE);
    });

    monthPills.forEach(function (pill, i) {
      pill.setAttribute("aria-selected", i === month ? "true" : "false");
    });

    monthLists.forEach(function (list, i) { list.hidden = i !== month; });

    var active = monthLists[month];
    if (monthPills[month]) monthLabel.textContent = monthPills[month].textContent;
    monthCount.textContent = active.children.length + " topics";

    replay(monthHead, "rm-in-a 420ms " + EASE);
    replay(active, "rm-in-a 420ms " + EASE);

    /* Re-arm the per-topic stagger; the list elements persist, so the
       animation has to be taken away and given back. */
    active.classList.remove("rm-play");
    void active.offsetHeight;
    if (!reduced) active.classList.add("rm-play");
  }

  function pickMonth(index) {
    stopPlay();
    setMonth(index);
  }

  tlNodes.concat(barNodes).forEach(function (node) {
    var index = Number(node.dataset.month);
    node.addEventListener("click", function () { pickMonth(index); });
    node.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      pickMonth(index);
    });
  });

  monthPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pickMonth(Number(pill.dataset.month));
    });
  });

  var playPath = playBtn ? $("svg path", playBtn).getAttribute("d") : "";

  function paintPlay(playing) {
    if (!playBtn) return;
    playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    $("span", playBtn).textContent = playing ? "Pause" : "Play through the year";
    $("svg path", playBtn).setAttribute("d", playing ? PAUSE_PATH : playPath);
  }

  function stopPlay() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    paintPlay(false);
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      if (timer) { stopPlay(); return; }
      var every = Number(playBtn.dataset.interval) || 2200;
      timer = setInterval(function () { setMonth(month + 1); }, every);
      paintPlay(true);
    });
  }

  /* Arm the opening stagger without disturbing the rendered month. */
  if (!reduced && monthLists[0]) monthLists[0].classList.add("rm-play");

  /* ── testimony carousel ────────────────────────────────────────────────── */
  var quotes = $$(".rm-quote");
  var quoteCounter = $("#rm-quote-counter");
  var quote = 0;

  function setQuote(index, direction) {
    if (!quotes.length) return;
    quotes[quote].hidden = true;
    quote = (index + quotes.length) % quotes.length;

    var active = quotes[quote];
    active.hidden = false;
    quoteCounter.textContent = (quote + 1) + " / " + quotes.length;
    replay(active, "rm-q-" + (direction < 0 ? "b1" : "a1") + " 460ms " + EASE);
  }

  var prevQuote = $("#rm-quote-prev");
  var nextQuote = $("#rm-quote-next");
  if (prevQuote) prevQuote.addEventListener("click", function () { setQuote(quote - 1, -1); });
  if (nextQuote) nextQuote.addEventListener("click", function () { setQuote(quote + 1, 1); });

  /* ── enquiry form ──────────────────────────────────────────────────────
     Hands off to the visitor's mail client, which is fragile — see the
     "Known gaps" note in CLAUDE.md about moving this server-side. */
  var form = $("#rm-form");
  var formNote = $("#rm-form-note");

  if (form) {
    var field = function (name) { return form.elements[name].value.trim(); };

    form.addEventListener("input", function () { formNote.textContent = ""; });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!field("name") || !field("email")) {
        formNote.textContent = "Please add your name and email.";
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field("email"))) {
        formNote.textContent = "That email address looks incomplete.";
        return;
      }

      var subject = "Program request" + (field("topic") ? ": " + field("topic") : "");
      var body = [
        "Name: " + field("name"),
        "Organization: " + (field("org") || "—"),
        "Email: " + field("email"),
        "Program of interest: " + (field("topic") || "—"),
        "",
        "Sent from " + location.host
      ].join("\n");

      var to = formNote.dataset.email;
      window.location.href = "mailto:" + to + "?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      formNote.textContent = "Opening your email app with the request to " + to +
        " — press send there.";
    });
  }
})();
