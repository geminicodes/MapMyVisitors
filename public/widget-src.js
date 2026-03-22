(function () {
  'use strict';

  // MapMyVisitors embeddable widget source.
  // Requirements: no globals, never break host page, async-only, CSP-safe.

  // Build-time injected by esbuild (scripts/build-widget.ts). This must never ship with `process` references.
  // After build, this becomes a plain string constant like: "https://mapmyvisitors.com".
  // eslint-disable-next-line no-undef
  var API_BASE = process.env.API_BASE_URL || 'https://mapmyvisitors.com';
  var CONTAINER_ID = 'mapmyvisitors-widget';
  var POLL_INTERVAL_MS = 10000;
  var STREAM_RECONNECT_MS = 8000;
  var MAX_DOTS_DESKTOP = 50;
  var MAX_DOTS_MOBILE = 30;
  var RECENT_WINDOW_MS = 5 * 60 * 1000;

  var GLOBE_CDN = 'https://unpkg.com/globe.gl@2.27.2';
  var EARTH_TEXTURE = 'https://unpkg.com/three-globe@2.27.5/example/img/earth-blue-marble.jpg';
  var BUMP_TEXTURE = 'https://unpkg.com/three-globe@2.27.5/example/img/earth-topology.png';
  var BG_TEXTURE = 'https://unpkg.com/three-globe@2.27.5/example/img/night-sky.png';

  // Internal state (kept inside IIFE)
  var state = {
    widgetId: null,
    container: null,
    globe: null,
    pollTimer: null,
    stream: null,
    streamReconnectTimer: null,
    destroyed: false,
    inFlight: null,
    lastVisitorsHash: null,
    watermarkEl: null,
    statusEl: null,
    resizeHandler: null,
    visibilityHandler: null,
    unloadHandler: null,
    intersectionObserver: null,
    initialized: false,
  };

  // Wrap everything to ensure we never break host page.
  try {
    var scriptInfo = findScriptAndWidgetId();
    if (!scriptInfo || !scriptInfo.widgetId) {
      // Error already logged.
      return;
    }

    state.widgetId = scriptInfo.widgetId;

    // Allow API base override only when script is hosted on same origin (dev/staging).
    // This avoids surprising cross-origin behavior while still making local testing possible.
    try {
      if (scriptInfo.scriptSrc) {
        var srcUrl = new URL(scriptInfo.scriptSrc, window.location.href);
        if (srcUrl && srcUrl.origin && srcUrl.origin === window.location.origin) {
          API_BASE = srcUrl.origin;
        }
      }
    } catch (_) {
      // Ignore URL parsing errors.
    }

    // Fire-and-forget tracking.
    trackPageview(state.widgetId);

    // Setup container and defer heavy work until visible.
    state.container = setupContainer();
    if (!state.container) {
      console.error('[MapMyVisitors] Failed to setup container');
      return;
    }

    addStatusOverlay(state.container, 'Loading globe…');

    initWhenVisible(state.container, function () {
      initWidget(state.widgetId);
    });

    attachLifecycleHandlers();
  } catch (err) {
    console.error('[MapMyVisitors] Widget error:', err);
    // Nothing else to do; fail silently.
  }

  function findScriptAndWidgetId() {
    try {
      var scriptTag = null;

      // Prefer currentScript for correctness.
      if (document.currentScript && document.currentScript.tagName === 'SCRIPT') {
        scriptTag = document.currentScript;
      }

      // Fallback: find the last script that looks like our widget.
      if (!scriptTag) {
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
          var s = scripts[i];
          var src = s && s.getAttribute ? s.getAttribute('src') : null;
          if (!src) continue;
          // Match widget.js (prod) OR widget-src.js (dev).
          if (src.indexOf('widget.js') !== -1 || src.indexOf('widget-src.js') !== -1) {
            scriptTag = s;
            break;
          }
        }
      }

      if (!scriptTag) {
        console.error('[MapMyVisitors] Script tag not found');
        return null;
      }

      var scriptSrc = scriptTag.getAttribute('src') || '';
      var widgetId = null;

      // Primary: parse ?id=... from src.
      var qIndex = scriptSrc.indexOf('?');
      if (qIndex !== -1) {
        var query = scriptSrc.slice(qIndex + 1);
        try {
          var params = new URLSearchParams(query);
          widgetId = params.get('id');
        } catch (_) {
          // Ignore; fallback below.
        }
      }

      // Secondary: allow data attribute override.
      if (!widgetId && scriptTag.getAttribute) {
        widgetId = scriptTag.getAttribute('data-mapmyvisitors-id');
      }

      // Validate widget ID (12 chars: alnum + _ -)
      if (!widgetId || !/^[A-Za-z0-9_-]{12}$/.test(widgetId)) {
        console.error('[MapMyVisitors] Invalid widget ID');
        return null;
      }

      return { scriptTag: scriptTag, scriptSrc: scriptSrc, widgetId: widgetId };
    } catch (err) {
      console.error('[MapMyVisitors] Failed to resolve widget ID');
      return null;
    }
  }

  function trackPageview(widgetId) {
    var payload = {
      widgetId: widgetId,
      pageUrl: window.location.href,
      referrer: document.referrer || null,
    };

    // Prefer sendBeacon when available (best-effort, non-blocking).
    var url = API_BASE + '/api/track';
    try {
      if (navigator && typeof navigator.sendBeacon === 'function') {
        var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
        return;
      }
    } catch (_) {
      // Fall back to fetch.
    }

    safeFetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // keepalive increases odds of delivery on unload.
      keepalive: true,
    })
      .then(function () {
        // Ignore response; fire-and-forget.
      })
      .catch(function (err) {
        console.warn('[MapMyVisitors] Track failed:', err && err.message ? err.message : err);
        // Retry once after 2s.
        setTimeout(function () {
          safeFetchJson(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
          }).catch(function () {
            // Silent fail.
          });
        }, 2000);
      });
  }

  function setupContainer() {
    try {
      var container = document.getElementById(CONTAINER_ID);
      if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.style.cssText = [
          'width: 100%;',
          'max-width: 600px;',
          'height: 600px;',
          'position: relative;',
          'margin: 20px auto;',
          'border-radius: 16px;',
          'overflow: hidden;',
          'background: radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.18), rgba(0,0,0,0.0) 55%), #0b1220;',
          'box-shadow: 0 18px 50px rgba(0,0,0,0.25);',
        ].join(' ');

        // Append safely.
        var parent = document.body || document.documentElement;
        if (!parent) return null;
        parent.appendChild(container);
      }

      // Create an inner mount element so we never touch outside container.
      var mount = container.querySelector('[data-mmv-mount]');
      if (!mount) {
        mount = document.createElement('div');
        mount.setAttribute('data-mmv-mount', '1');
        mount.style.cssText = [
          'position:absolute;',
          'inset:0;',
        ].join(' ');
        container.appendChild(mount);
      }

      // Responsive sizing for very small screens.
      applyResponsiveSizing(container);

      return container;
    } catch (err) {
      console.error('[MapMyVisitors] Container setup failed:', err);
      return null;
    }
  }

  function applyResponsiveSizing(container) {
    try {
      var w = Math.max(0, Math.min(window.innerWidth || 0, container.clientWidth || 0));
      if (!w) return;

      // If viewport is small, reduce height.
      if (w < 420) {
        container.style.height = '420px';
        container.style.maxWidth = '100%';
        container.style.margin = '12px auto';
        container.style.borderRadius = '14px';
      } else if (w < 520) {
        container.style.height = '520px';
        container.style.maxWidth = '100%';
        container.style.margin = '16px auto';
        container.style.borderRadius = '16px';
      } else {
        // default values already set
      }
    } catch (_) {
      // Ignore.
    }
  }

  function addStatusOverlay(container, text) {
    try {
      var existing = container.querySelector('[data-mmv-status]');
      if (existing) {
        existing.textContent = text;
        state.statusEl = existing;
        return;
      }

      var el = document.createElement('div');
      el.setAttribute('data-mmv-status', '1');
      el.style.cssText = [
        'position:absolute;',
        'left:12px;',
        'top:12px;',
        'padding:8px 10px;',
        'font-size:12px;',
        'font-family:-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;',
        'color:rgba(255,255,255,0.92);',
        'background:rgba(0,0,0,0.35);',
        'border:1px solid rgba(255,255,255,0.10);',
        'border-radius:10px;',
        'backdrop-filter: blur(6px);',
        'z-index:50;',
        'pointer-events:none;',
      ].join(' ');
      el.textContent = text;
      container.appendChild(el);
      state.statusEl = el;
    } catch (_) {
      // Ignore.
    }
  }

  function clearStatusOverlay() {
    try {
      if (state.statusEl && state.statusEl.parentNode) {
        state.statusEl.parentNode.removeChild(state.statusEl);
      }
    } catch (_) {
      // Ignore.
    } finally {
      state.statusEl = null;
    }
  }

  function showError(container, message) {
    try {
      clearStatusOverlay();
      var el = container.querySelector('[data-mmv-error]');
      if (!el) {
        el = document.createElement('div');
        el.setAttribute('data-mmv-error', '1');
        el.style.cssText = [
          'position:absolute;',
          'inset:0;',
          'display:flex;',
          'align-items:center;',
          'justify-content:center;',
          'padding:24px;',
          'text-align:center;',
          'font-size:13px;',
          'line-height:1.4;',
          'font-family:-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;',
          'color:rgba(255,255,255,0.9);',
          'background:rgba(11,18,32,0.96);',
          'z-index:60;',
        ].join(' ');
        container.appendChild(el);
      }
      el.textContent = message;
    } catch (_) {
      // Ignore.
    }
  }

  function initWhenVisible(container, callback) {
    try {
      // If IntersectionObserver is available, initialize only when visible.
      if ('IntersectionObserver' in window) {
        state.intersectionObserver = new IntersectionObserver(
          function (entries) {
            try {
              for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry && entry.isIntersecting) {
                  if (state.intersectionObserver) {
                    state.intersectionObserver.disconnect();
                    state.intersectionObserver = null;
                  }
                  callback();
                  return;
                }
              }
            } catch (_) {
              callback();
            }
          },
          { root: null, threshold: 0.1 }
        );
        state.intersectionObserver.observe(container);
        return;
      }
    } catch (_) {
      // Ignore.
    }

    // Fallback: init on next tick.
    setTimeout(function () {
      callback();
    }, 0);
  }

  function initWidget(widgetId) {
    if (state.destroyed || state.initialized) return;
    state.initialized = true;

    try {
      if (!supportsWebGL()) {
        showError(state.container, "Your browser doesn't support 3D (WebGL required).");
        return;
      }

      addStatusOverlay(state.container, 'Loading 3D…');
      loadGlobeLibrary(function () {
        try {
          createGlobe();
          fetchAndRender(widgetId, true);
          startRealtime(widgetId);
        } catch (err) {
          console.error('[MapMyVisitors] Init failed:', err);
          showError(state.container, 'Failed to initialize widget.');
        }
      });
    } catch (err) {
      console.error('[MapMyVisitors] initWidget error:', err);
      showError(state.container, 'Widget error.');
    }
  }

  function supportsWebGL() {
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (_) {
      return false;
    }
  }

  function loadGlobeLibrary(callback) {
    try {
      if (window.Globe) {
        callback();
        return;
      }

      // Avoid loading multiple times.
      var existing = document.querySelector('script[data-mmv-globe]');
      if (existing) {
        existing.addEventListener('load', function () {
          callback();
        });
        existing.addEventListener('error', function () {
          console.error('[MapMyVisitors] Failed to load globe.gl');
          showError(state.container, 'Failed to load 3D library.');
        });
        return;
      }

      var script = document.createElement('script');
      script.setAttribute('data-mmv-globe', '1');
      script.async = true;
      script.src = GLOBE_CDN;
      script.onload = function () {
        callback();
      };
      script.onerror = function () {
        console.error('[MapMyVisitors] Failed to load globe.gl');
        showError(state.container, 'Failed to load 3D library.');
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('[MapMyVisitors] loadGlobeLibrary error:', err);
      showError(state.container, 'Failed to load 3D library.');
    }
  }

  function createGlobe() {
    if (state.destroyed) return;
    if (!state.container) return;

    var mount = state.container.querySelector('[data-mmv-mount]');
    if (!mount) {
      showError(state.container, 'Widget mount not found.');
      return;
    }

    // Clear any prior contents inside mount.
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }

    try {
      // Globe() returns a function that takes the DOM element.
      var globe = window.Globe()(mount)
        .globeImageUrl(EARTH_TEXTURE)
        .bumpImageUrl(BUMP_TEXTURE)
        .backgroundImageUrl(BG_TEXTURE)
        .atmosphereColor('#3b82f6')
        .atmosphereAltitude(0.25)
        .showAtmosphere(true)
        .pointLat('lat')
        .pointLng('lng')
        .pointRadius(function (d) {
          return d && d._recent ? 0.4 : 0.2;
        })
        .pointAltitude(function (d) {
          return d && d._recent ? 0.02 : 0.01;
        })
        .pointColor(function (d) {
          return d && d._recent ? '#3b82f6' : '#6b7280';
        })
        .pointsMerge(true)
        .pointsTransitionDuration(600)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor(function () {
          return function (t) {
            var a = Math.max(0, 1 - t);
            return 'rgba(59,130,246,' + (0.65 * a).toFixed(3) + ')';
          };
        })
        .ringMaxRadius(2.0)
        .ringPropagationSpeed(1.2)
        .ringRepeatPeriod(1800)
        .onPointHover(function () {
          // No-op; using built-in tooltip.
        })
        .pointLabel(function (d) {
          try {
            var city = d && d.city ? String(d.city) : '';
            var country = d && d.country ? String(d.country) : '';
            var label = [city, country].filter(function (x) {
              return x && x.trim().length > 0;
            });
            if (!label.length) return '';

            // Escape any untrusted strings.
            return '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;padding:4px 6px">' +
              escapeHtml(label.join(', ')) +
              '</div>';
          } catch (_) {
            return '';
          }
        });

      // Rotate slowly.
      try {
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.5;
        globe.controls().enableDamping = true;
        globe.controls().dampingFactor = 0.08;
      } catch (_) {
        // Ignore.
      }

      // Reduce load on mobile.
      try {
        var isTouch = isTouchDevice();
        if (isTouch) {
          globe.renderer().setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        } else {
          globe.renderer().setPixelRatio(Math.min(2.5, window.devicePixelRatio || 1));
        }
      } catch (_) {
        // Ignore.
      }

      state.globe = globe;
      clearStatusOverlay();

      // Resize handler.
      scheduleResize();
    } catch (err) {
      console.error('[MapMyVisitors] createGlobe failed:', err);
      showError(state.container, 'Failed to render globe.');
    }
  }

  function scheduleResize() {
    // Debounced resize to avoid jank.
    var timer = null;

    state.resizeHandler = function () {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function () {
        timer = null;
        try {
          if (!state.container) return;
          applyResponsiveSizing(state.container);
          // Globe.gl handles resize automatically via canvas sizing in many cases,
          // but forcing a render tick is harmless.
          if (state.globe && state.globe.renderer) {
            try {
              state.globe.renderer().render(state.globe.scene(), state.globe.camera());
            } catch (_) {
              // Ignore.
            }
          }
        } catch (_) {
          // Ignore.
        }
      }, 200);
    };

    try {
      window.addEventListener('resize', state.resizeHandler, { passive: true });
    } catch (_) {
      // Ignore.
    }
  }

  function getDotLimit() {
    return isTouchDevice() ? MAX_DOTS_MOBILE : MAX_DOTS_DESKTOP;
  }

  function handleVisitorsPayload(data) {
    if (state.destroyed) return;

    clearStatusOverlay();

    // Watermark logic: show watermark unless paid===true.
    var paid = data && typeof data.paid === 'boolean' ? data.paid : null;
    var showWatermark = null;

    if (data && typeof data.showWatermark === 'boolean') {
      showWatermark = data.showWatermark;
    } else if (paid === true) {
      showWatermark = false;
    } else {
      // Fail-closed: if unknown, show watermark.
      showWatermark = true;
    }

    addWatermark(state.container, showWatermark);

    var visitors = data && data.visitors && Array.isArray(data.visitors) ? data.visitors : [];
    var normalized = normalizeVisitors(visitors);

    // Avoid re-render churn if identical.
    var hash = hashVisitors(normalized);
    if (hash && hash === state.lastVisitorsHash) {
      return;
    }
    state.lastVisitorsHash = hash;
    updateGlobe(normalized);
  }

  function fetchAndRender(widgetId, initial) {
    if (state.destroyed) return;

    // Cancel any in-flight fetch.
    abortInFlight();

    var limit = getDotLimit();
    var url = API_BASE + '/api/visitors/' + encodeURIComponent(widgetId) + '?limit=' + encodeURIComponent(String(limit));

    if (initial) {
      addStatusOverlay(state.container, 'Loading visitors…');
    }

    var controller = null;
    try {
      controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    } catch (_) {
      controller = null;
    }
    state.inFlight = controller;

    safeFetchJson(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller ? controller.signal : undefined,
      // Avoid caching across navigations.
      cache: 'no-store',
      credentials: 'omit',
    })
      .then(function (data) {
        if (state.destroyed) return;
        handleVisitorsPayload(data);
      })
      .catch(function (err) {
        if (state.destroyed) return;
        // Ignore abort.
        if (err && err.name === 'AbortError') return;

        console.warn('[MapMyVisitors] Fetch visitors failed:', err && err.message ? err.message : err);
        if (initial) {
          addStatusOverlay(state.container, 'Loading… (retrying)');
        }
      });
  }

  function normalizeVisitors(visitors) {
    var now = Date.now();
    var out = [];

    for (var i = 0; i < visitors.length; i++) {
      var v = visitors[i];
      if (!v || typeof v !== 'object') continue;

      var lat = pickNumber(v, ['lat', 'latitude']);
      var lng = pickNumber(v, ['lng', 'lon', 'longitude']);
      if (lat === null || lng === null) continue;

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

      var ts = pickTimestamp(v, ['timestamp', 'ts', 'created_at', 'seen_at']);
      var recent = ts !== null ? now - ts < RECENT_WINDOW_MS : false;

      out.push({
        lat: lat,
        lng: lng,
        city: pickString(v, ['city', 'region', 'location']),
        country: pickString(v, ['country', 'country_name']),
        ts: ts,
        _recent: recent,
      });

      // Hard cap to keep render cheap.
      if (out.length >= (isTouchDevice() ? MAX_DOTS_MOBILE : MAX_DOTS_DESKTOP)) {
        break;
      }
    }

    return out;
  }

  function pickNumber(obj, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!obj.hasOwnProperty(k)) continue;
      var val = obj[k];
      if (typeof val === 'number' && isFinite(val)) return val;
      if (typeof val === 'string') {
        var n = parseFloat(val);
        if (!isNaN(n) && isFinite(n)) return n;
      }
    }
    return null;
  }

  function pickString(obj, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!obj.hasOwnProperty(k)) continue;
      var val = obj[k];
      if (typeof val === 'string' && val.trim().length > 0) return val.trim();
    }
    return '';
  }

  function pickTimestamp(obj, keys) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!obj.hasOwnProperty(k)) continue;
      var val = obj[k];
      if (typeof val === 'number' && isFinite(val)) {
        // Heuristic: seconds vs ms
        if (val > 0 && val < 2000000000) return val * 1000;
        return val;
      }
      if (typeof val === 'string' && val.trim().length > 0) {
        var t = Date.parse(val);
        if (!isNaN(t)) return t;
        var n = parseFloat(val);
        if (!isNaN(n) && isFinite(n)) {
          if (n > 0 && n < 2000000000) return n * 1000;
          return n;
        }
      }
    }
    return null;
  }

  function updateGlobe(points) {
    try {
      if (!state.globe) return;

      // Points
      state.globe.pointsData(points);

      // Rings for recent points (pulsing)
      var rings = [];
      for (var i = 0; i < points.length; i++) {
        if (points[i] && points[i]._recent) {
          rings.push(points[i]);
        }
      }
      state.globe.ringsData(rings);

      clearStatusOverlay();
    } catch (err) {
      console.warn('[MapMyVisitors] Render failed:', err && err.message ? err.message : err);
    }
  }

  function startRealtime(widgetId) {
    if (state.destroyed) return;

    if (typeof window !== 'undefined' && typeof window.EventSource === 'function') {
      startStreaming(widgetId);
      return;
    }

    startPolling(widgetId);
  }

  function scheduleStreamReconnect(widgetId) {
    if (state.destroyed) return;
    if (state.streamReconnectTimer) return;

    state.streamReconnectTimer = setTimeout(function () {
      state.streamReconnectTimer = null;
      startStreaming(widgetId);
    }, STREAM_RECONNECT_MS);
  }

  function stopStreaming() {
    if (state.stream) {
      try {
        state.stream.close();
      } catch (_) {
        // Ignore.
      }
      state.stream = null;
    }

    if (state.streamReconnectTimer) {
      try {
        clearTimeout(state.streamReconnectTimer);
      } catch (_) {
        // Ignore.
      }
      state.streamReconnectTimer = null;
    }
  }

  function startStreaming(widgetId) {
    if (state.destroyed) return;

    stopStreaming();

    var limit = getDotLimit();
    var streamUrl = API_BASE + '/api/visitors/' + encodeURIComponent(widgetId) + '/stream?limit=' + encodeURIComponent(String(limit));
    var stream = null;

    try {
      stream = new window.EventSource(streamUrl);
    } catch (err) {
      console.warn('[MapMyVisitors] Failed to open stream:', err && err.message ? err.message : err);
      startPolling(widgetId);
      scheduleStreamReconnect(widgetId);
      return;
    }

    state.stream = stream;

    stream.onopen = function () {
      // Prefer stream updates when available; keep polling as fallback only.
      stopPolling();
    };

    stream.onmessage = function (evt) {
      if (state.destroyed) return;
      if (!evt || !evt.data) return;

      try {
        var data = JSON.parse(evt.data);
        handleVisitorsPayload(data);
      } catch (_) {
        // Ignore malformed messages.
      }
    };

    stream.onerror = function () {
      if (state.destroyed) return;
      stopStreaming();
      // Fall back quickly so data keeps flowing.
      startPolling(widgetId);
      scheduleStreamReconnect(widgetId);
    };
  }

  function startPolling(widgetId) {
    if (state.destroyed) return;

    stopPolling();

    state.pollTimer = setInterval(function () {
      try {
        fetchAndRender(widgetId, false);
      } catch (_) {
        // Ignore.
      }
    }, POLL_INTERVAL_MS);

    // Also refresh on tab focus.
    state.visibilityHandler = function () {
      try {
        if (document.visibilityState === 'visible') {
          fetchAndRender(widgetId, false);
        }
      } catch (_) {
        // Ignore.
      }
    };

    try {
      document.addEventListener('visibilitychange', state.visibilityHandler, { passive: true });
    } catch (_) {
      // Ignore.
    }
  }

  function stopPolling() {
    if (state.pollTimer) {
      try {
        clearInterval(state.pollTimer);
      } catch (_) {
        // Ignore.
      }
      state.pollTimer = null;
    }

    if (state.visibilityHandler) {
      try {
        document.removeEventListener('visibilitychange', state.visibilityHandler);
      } catch (_) {
        // Ignore.
      }
      state.visibilityHandler = null;
    }
  }

  function addWatermark(container, show) {
    try {
      if (!show) {
        if (state.watermarkEl && state.watermarkEl.parentNode) {
          state.watermarkEl.parentNode.removeChild(state.watermarkEl);
        }
        state.watermarkEl = null;
        return;
      }

      if (state.watermarkEl && state.watermarkEl.parentNode) {
        return;
      }

      var badge = document.createElement('div');
      badge.setAttribute('data-mmv-watermark', '1');
      badge.style.cssText = [
        'position:absolute;',
        'bottom:10px;',
        'right:10px;',
        'font-size:11px;',
        'font-family:-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;',
        'color:rgba(255,255,255,0.65);',
        'z-index:100;',
        'background:rgba(0,0,0,0.25);',
        'border:1px solid rgba(255,255,255,0.10);',
        'padding:6px 8px;',
        'border-radius:999px;',
        'backdrop-filter: blur(6px);',
      ].join(' ');

      // Constant HTML (safe). No untrusted content.
      badge.innerHTML = 'Powered by <a href="https://mapmyvisitors.com" target="_blank" rel="noopener noreferrer" style="color:#3b82f6;text-decoration:none">MapMyVisitors</a>';
      container.appendChild(badge);
      state.watermarkEl = badge;
    } catch (_) {
      // Ignore.
    }
  }

  function attachLifecycleHandlers() {
    state.unloadHandler = function () {
      destroy();
    };

    try {
      window.addEventListener('beforeunload', state.unloadHandler, { passive: true });
    } catch (_) {
      // Ignore.
    }

    // Also clean up on pagehide (bfcache / mobile safari)
    try {
      window.addEventListener(
        'pagehide',
        function () {
          destroy();
        },
        { passive: true }
      );
    } catch (_) {
      // Ignore.
    }
  }

  function abortInFlight() {
    if (state.inFlight && typeof state.inFlight.abort === 'function') {
      try {
        state.inFlight.abort();
      } catch (_) {
        // Ignore.
      }
    }
    state.inFlight = null;
  }

  function destroy() {
    if (state.destroyed) return;
    state.destroyed = true;

    try {
      stopPolling();
      stopStreaming();
      abortInFlight();

      if (state.intersectionObserver) {
        try {
          state.intersectionObserver.disconnect();
        } catch (_) {
          // Ignore.
        }
        state.intersectionObserver = null;
      }

      if (state.resizeHandler) {
        try {
          window.removeEventListener('resize', state.resizeHandler);
        } catch (_) {
          // Ignore.
        }
        state.resizeHandler = null;
      }

      if (state.unloadHandler) {
        try {
          window.removeEventListener('beforeunload', state.unloadHandler);
        } catch (_) {
          // Ignore.
        }
        state.unloadHandler = null;
      }

      // Best-effort dispose (globe.gl uses three.js under the hood; not all versions expose dispose).
      if (state.globe) {
        try {
          var r = state.globe.renderer && state.globe.renderer();
          if (r && r.dispose) r.dispose();
        } catch (_) {
          // Ignore.
        }
      }

      state.globe = null;
      state.container = null;
      state.widgetId = null;
    } catch (_) {
      // Ignore.
    }
  }

  function isTouchDevice() {
    try {
      return (
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window || (navigator && navigator.maxTouchPoints && navigator.maxTouchPoints > 0)))
      );
    } catch (_) {
      return false;
    }
  }

  function safeFetchJson(url, options) {
    // Wrapper that never throws synchronously and enforces JSON parsing.
    return new Promise(function (resolve, reject) {
      try {
        if (!window.fetch) {
          reject(new Error('fetch_not_supported'));
          return;
        }

        window
          .fetch(url, options)
          .then(function (res) {
            // Treat non-2xx as errors but still attempt to read body.
            return res
              .text()
              .then(function (text) {
                if (!res.ok) {
                  reject(new Error('http_' + String(res.status)));
                  return;
                }

                if (!text) {
                  resolve({});
                  return;
                }

                try {
                  resolve(JSON.parse(text));
                } catch (_) {
                  reject(new Error('json_parse_error'));
                }
              })
              .catch(function () {
                reject(new Error('read_error'));
              });
          })
          .catch(function (err) {
            reject(err || new Error('fetch_error'));
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  function escapeHtml(input) {
    var s = String(input);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function hashVisitors(points) {
    try {
      // Fast, stable hash: round coords and include recency.
      var parts = [];
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (!p) continue;
        var la = Math.round(p.lat * 1000) / 1000;
        var lo = Math.round(p.lng * 1000) / 1000;
        parts.push(String(la) + ',' + String(lo) + ',' + (p._recent ? '1' : '0'));
      }
      return parts.join('|');
    } catch (_) {
      return null;
    }
  }
})();
