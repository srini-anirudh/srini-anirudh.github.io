/* Animated scenes for the "Beyond the lab" cards: a travelling globe and a music player. */
(function () {
  var LAND = [-55,-68,-51,-71,-48,-74,-48,-69,-44,-71,-44,-66,-41,-72,-41,-67,-41,-63,-41,176,-38,-73,-38,-68,-38,-64,-38,-60,-38,142,-38,146,-34,-69,-34,-65,-34,-61,-34,-57,-34,21,-34,116,-34,141,-34,145,-34,149,-31,-69,-31,-65,-31,-61,-31,-57,-31,-53,-31,18,-31,22,-31,26,-31,30,-31,117,-31,121,-31,125,-31,129,-31,133,-31,137,-31,141,-31,145,-31,149,-31,152,-27,-69,-27,-65,-27,-61,-27,-57,-27,-54,-27,-50,-27,19,-27,23,-27,27,-27,31,-27,115,-27,119,-27,123,-27,126,-27,130,-27,134,-27,138,-27,142,-27,146,-27,149,-24,-68,-24,-65,-24,-61,-24,-57,-24,-53,-24,-50,-24,17,-24,21,-24,25,-24,28,-24,32,-24,47,-24,114,-24,118,-24,121,-24,125,-24,129,-24,133,-24,136,-24,140,-24,144,-24,148,-24,151,-21,-67,-21,-64,-21,-60,-21,-57,-21,-53,-21,-49,-21,-46,-21,-42,-21,16,-21,20,-21,23,-21,27,-21,31,-21,34,-21,45,-21,118,-21,121,-21,125,-21,129,-21,132,-21,136,-21,140,-21,143,-21,147,-21,165,-17,-70,-17,-66,-17,-63,-17,-59,-17,-55,-17,-52,-17,-48,-17,-45,-17,-41,-17,12,-17,16,-17,19,-17,23,-17,26,-17,30,-17,34,-17,37,-17,44,-17,48,-17,123,-17,126,-17,130,-17,133,-17,137,-17,144,-14,-75,-14,-71,-14,-68,-14,-64,-14,-61,-14,-57,-14,-54,-14,-50,-14,-47,-14,-43,-14,-40,-14,13,-14,16,-14,20,-14,23,-14,27,-14,30,-14,34,-14,37,-14,41,-14,132,-14,135,-14,142,-10,-76,-10,-73,-10,-69,-10,-66,-10,-62,-10,-59,-10,-56,-10,-52,-10,-49,-10,-45,-10,-42,-10,-38,-10,14,-10,17,-10,20,-10,24,-10,27,-10,31,-10,34,-10,38,-7,-77,-7,-74,-7,-70,-7,-67,-7,-64,-7,-60,-7,-57,-7,-53,-7,-50,-7,-46,-7,-43,-7,-40,-7,-36,-7,15,-7,19,-7,22,-7,26,-7,29,-7,32,-7,36,-7,39,-7,108,-7,111,-7,142,-7,145,-4,-78,-4,-74,-4,-71,-4,-68,-4,-64,-4,-61,-4,-57,-4,-54,-4,-51,-4,-47,-4,-44,-4,-40,-4,11,-4,14,-4,18,-4,21,-4,24,-4,28,-4,31,-4,35,-4,38,-4,103,-4,120,-4,127,-4,133,-4,137,-4,140,-4,144,0,-78,0,-75,0,-71,0,-68,0,-64,0,-61,0,-58,0,-54,0,-51,0,10,0,14,0,17,0,21,0,24,0,27,0,31,0,34,0,38,0,41,0,102,0,112,0,116,3,-74,3,-71,3,-68,3,-64,3,-61,3,-57,3,-54,3,11,3,14,3,18,3,21,3,24,3,28,3,31,3,35,3,38,3,41,3,45,3,99,3,103,3,116,7,-77,7,-74,7,-70,7,-67,7,-64,7,-60,7,-9,7,-5,7,-2,7,1,7,5,7,8,7,12,7,15,7,19,7,22,7,25,7,29,7,32,7,36,7,39,7,42,7,46,7,49,7,80,7,101,7,125,10,-83,10,-73,10,-70,10,-66,10,-63,10,-14,10,-11,10,-7,10,-4,10,0,10,3,10,6,10,10,10,13,10,17,10,20,10,24,10,27,10,31,10,34,10,38,10,41,10,44,10,48,10,79,10,107,13,-89,13,-86,13,-16,13,-12,13,-9,13,-5,13,-2,13,2,13,5,13,9,13,12,13,16,13,19,13,23,13,26,13,30,13,33,13,37,13,40,13,44,13,75,13,79,13,100,13,103,13,107,13,121,17,-98,17,-95,17,-91,17,-13,17,-10,17,-6,17,-2,17,1,17,5,17,8,17,12,17,15,17,19,17,22,17,26,17,30,17,33,17,37,17,44,17,47,17,51,17,76,17,79,17,101,17,104,17,122,20,-104,20,-100,20,-89,20,-75,20,-13,20,-10,20,-6,20,-2,20,1,20,5,20,8,20,12,20,16,20,19,20,23,20,27,20,30,20,34,20,41,20,45,20,48,20,52,20,55,20,74,20,77,20,81,20,84,20,95,20,99,20,103,20,106,24,-106,24,-102,24,-98,24,-13,24,-9,24,-6,24,-2,24,2,24,6,24,9,24,13,24,17,24,20,24,24,24,28,24,31,24,35,24,39,24,43,24,46,24,50,24,54,24,57,24,69,24,72,24,76,24,80,24,83,24,87,24,91,24,95,24,98,24,102,24,106,24,109,24,113,24,117,24,121,27,-107,27,-104,27,-100,27,-81,27,-12,27,-8,27,-4,27,-1,27,3,27,7,27,11,27,15,27,18,27,22,27,26,27,30,27,38,27,41,27,45,27,49,27,60,27,64,27,68,27,72,27,76,27,79,27,83,27,87,27,91,27,95,27,99,27,102,27,106,27,110,27,114,27,118,30,-109,30,-105,30,-101,30,-97,30,-93,30,-89,30,-85,30,-81,30,-7,30,-3,30,1,30,5,30,9,30,13,30,17,30,21,30,25,30,29,30,33,30,37,30,41,30,45,30,49,30,53,30,57,30,60,30,64,30,68,30,72,30,76,30,80,30,84,30,88,30,92,30,96,30,100,30,104,30,108,30,112,30,116,30,120,34,-115,34,-110,34,-106,34,-102,34,-98,34,-94,34,-90,34,-86,34,-82,34,-4,34,0,34,4,34,8,34,37,34,41,34,45,34,49,34,53,34,57,34,61,34,65,34,70,34,74,34,78,34,82,34,86,34,90,34,94,34,98,34,102,34,106,34,110,34,115,34,119,34,131,37,-120,37,-116,37,-112,37,-107,37,-103,37,-99,37,-95,37,-90,37,-86,37,-82,37,-78,37,-5,37,29,37,33,37,38,37,42,37,46,37,55,37,59,37,63,37,68,37,72,37,76,37,80,37,85,37,89,37,93,37,97,37,102,37,106,37,110,37,115,37,119,37,127,37,140,41,-122,41,-117,41,-113,41,-108,41,-104,41,-99,41,-95,41,-90,41,-86,41,-81,41,-77,41,-5,41,-1,41,17,41,22,41,30,41,35,41,39,41,44,41,48,41,53,41,57,41,62,41,66,41,71,41,75,41,80,41,84,41,89,41,93,41,98,41,102,41,107,41,111,41,116,41,120,41,125,41,129,44,-123,44,-119,44,-114,44,-109,44,-104,44,-100,44,-95,44,-90,44,-85,44,-81,44,-76,44,-71,44,0,44,4,44,19,44,23,44,28,44,42,44,47,44,52,44,56,44,61,44,66,44,71,44,75,44,80,44,85,44,89,44,94,44,99,44,104,44,108,44,113,44,118,44,122,44,127,44,132,47,-120,47,-115,47,-110,47,-105,47,-100,47,-95,47,-90,47,-85,47,-80,47,-75,47,-69,47,1,47,6,47,11,47,16,47,21,47,26,47,31,47,36,47,41,47,46,47,51,47,56,47,61,47,66,47,71,47,76,47,81,47,86,47,91,47,96,47,101,47,106,47,111,47,116,47,121,47,126,47,131,47,136,51,-126,51,-121,51,-115,51,-110,51,-105,51,-99,51,-94,51,-89,51,-83,51,-78,51,-72,51,-67,51,-62,51,-56,51,-2,51,3,51,8,51,14,51,19,51,24,51,30,51,35,51,41,51,46,51,51,51,57,51,62,51,67,51,73,51,78,51,84,51,89,51,94,51,100,51,105,51,110,51,116,51,121,51,127,51,132,51,137,51,143,54,-128,54,-122,54,-116,54,-110,54,-104,54,-99,54,-93,54,-87,54,-75,54,-70,54,-64,54,-58,54,18,54,23,54,29,54,35,54,41,54,47,54,52,54,58,54,64,54,70,54,76,54,82,54,87,54,93,54,99,54,105,54,111,54,116,54,122,54,128,54,134,54,140,54,157,58,-129,58,-123,58,-117,58,-110,58,-104,58,-98,58,-72,58,-66,58,-2,58,10,58,29,58,36,58,42,58,48,58,55,58,61,58,67,58,74,58,80,58,87,58,93,58,99,58,106,58,112,58,118,58,125,58,131,58,137,58,163,61,-159,61,-152,61,-145,61,-138,61,-131,61,-124,61,-117,61,-110,61,-103,61,-96,61,-75,61,-47,61,9,61,16,61,23,61,30,61,37,61,44,61,51,61,58,61,65,61,72,61,79,61,86,61,94,61,101,61,108,61,115,61,122,61,129,61,136,61,143,61,150,61,164,61,171,64,-156,64,-149,64,-141,64,-133,64,-125,64,-117,64,-109,64,-101,64,-93,64,-86,64,-78,64,-70,64,-46,64,17,64,25,64,32,64,40,64,48,64,56,64,64,64,72,64,80,64,88,64,95,64,103,64,111,64,119,64,127,64,135,64,143,64,150,64,158,64,166,64,174,68,-171,68,-162,68,-153,68,-144,68,-135,68,-126,68,-117,68,-108,68,-99,68,-90,68,-81,68,-72,68,-63,68,-54,68,-45,68,-36,68,-27,68,-18,68,-9,68,0,68,9,71,-180,71,-117,71,-106,71,-96,71,-85,71,-74,71,-43,71,-32,71,-11,71,-1,71,10,71,20,71,31,71,42,71,52,71,63,71,73,71,84,71,94,71,105,71,115,71,126,71,137,71,147,75,-112,75,-89,75,-55,75,-44,75,-33,75,-21,75,58,75,92,75,103,78,-112,78,-101,78,-78,78,-67,78,-55,78,-44,78,-33,78,-21];
  var CITIES = [
    ["Hyderabad", 17.4, 78.5], ["Singapore", 1.35, 103.8], ["Tokyo", 35.7, 139.7], ["San Francisco", 37.8, -122.4],
    ["New York", 40.7, -74.0], ["London", 51.5, -0.1], ["Dubai", 25.2, 55.3]
  ];
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function css(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function palette() {
    var dark = document.body.classList.contains("dark-mode");
    return {
      dark: dark,
      orange: css("--orange-dark", "#c96a00"),
      blue: dark ? "#6fb4f0" : css("--blue-dark", "#0b5ea8"),
      soft: css("--text-soft", "#6b7378"),
      text: css("--text", "#1b1f23"),
      land: dark ? "rgba(190, 215, 240, " : "rgba(11, 94, 168, "
    };
  }
  function setup(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function vec(lat, lon) {
    var c = Math.cos(lat * RAD);
    return [c * Math.cos(lon * RAD), c * Math.sin(lon * RAD), Math.sin(lat * RAD)];
  }
  function slerp(a, b, t) {
    var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    var om = Math.acos(d), s = Math.sin(om);
    if (s < 1e-4) return a;
    var k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
    return [k1 * a[0] + k2 * b[0], k1 * a[1] + k2 * b[1], k1 * a[2] + k2 * b[2]];
  }

  /* ---------- Globe ---------- */
  function Globe(canvas) {
    var seg = 0, t0 = null, lon0 = 60, lat0 = 22, SEG_MS = 2300, flights = [];
    var pts = [];
    for (var i = 0; i < LAND.length; i += 2) pts.push(vec(LAND[i], LAND[i + 1]));
    var cv = CITIES.map(function (c) { return vec(c[1], c[2]); });
    function project(v, lonC, latC) {
      /* rotate so that (latC, lonC) faces the viewer; returns [x, y, depth] */
      var cl = Math.cos(-lonC * RAD), sl = Math.sin(-lonC * RAD);
      var x1 = v[0] * cl - v[1] * sl, y1 = v[0] * sl + v[1] * cl, z1 = v[2];
      var cp = Math.cos(latC * RAD), sp = Math.sin(latC * RAD);
      return [y1, z1 * cp - x1 * sp, x1 * cp + z1 * sp];
    }
    this.draw = function (now) {
      var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h, P = palette();
      if (t0 === null) t0 = now;
      var el = now - t0;
      seg = Math.floor(el / SEG_MS) % CITIES.length;
      var p = (el % SEG_MS) / SEG_MS, eased = p * p * (3 - 2 * p);
      var A = cv[seg], B = cv[(seg + 1) % cv.length];
      var cur = slerp(A, B, eased);
      var curLon = Math.atan2(cur[1], cur[0]) / RAD, curLat = Math.asin(cur[2]) / RAD;
      /* the camera follows the traveller, gently */
      lon0 += ((((curLon - lon0) % 360) + 540) % 360 - 180) * 0.06;
      lat0 += (curLat * 0.45 + 8 - lat0) * 0.05;
      ctx.clearRect(0, 0, w, h);
      var R = h * 0.58, cx = w * 0.66, cy = h * 0.52;
      /* sphere */
      var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
      g.addColorStop(0, P.dark ? "rgba(70,120,180,0.35)" : "rgba(255,255,255,0.85)");
      g.addColorStop(1, P.dark ? "rgba(20,50,90,0.45)" : "rgba(11,94,168,0.16)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = P.dark ? "rgba(140,190,240,0.35)" : "rgba(11,94,168,0.30)"; ctx.lineWidth = 1; ctx.stroke();
      /* land dots */
      for (var i = 0; i < pts.length; i++) {
        var q = project(pts[i], lon0, lat0);
        if (q[2] <= 0.02) continue;
        ctx.fillStyle = P.land + (0.25 + 0.6 * q[2]).toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(cx + q[0] * R, cy - q[1] * R, 0.6 + 0.7 * q[2], 0, 6.2832); ctx.fill();
      }
      /* finished legs */
      function leg(a, b, upTo, alpha, bright) {
        var N = 40, started = false;
        ctx.beginPath();
        for (var k = 0; k <= N; k++) {
          var tt = (k / N) * upTo, v = slerp(a, b, tt), lift = 1 + 0.16 * Math.sin(Math.PI * tt);
          var q = project([v[0] * lift, v[1] * lift, v[2] * lift], lon0, lat0);
          var front = q[2] > -0.05;
          if (!front) { started = false; continue; }
          var X = cx + q[0] * R, Y = cy - q[1] * R;
          if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
        }
        ctx.strokeStyle = bright ? P.orange : P.blue; ctx.globalAlpha = alpha; ctx.lineWidth = bright ? 1.8 : 1.1; ctx.stroke(); ctx.globalAlpha = 1;
      }
      for (var j = 0; j < seg; j++) leg(cv[j], cv[j + 1], 1, 0.35, false);
      leg(A, B, Math.max(eased, 0.001), 0.95, true);
      /* city pins */
      for (var c = 0; c < cv.length; c++) {
        var qc = project(cv[c], lon0, lat0);
        if (qc[2] <= 0.05) continue;
        var X = cx + qc[0] * R, Y = cy - qc[1] * R;
        var reached = c <= seg || (c === (seg + 1) % cv.length && eased > 0.97);
        ctx.fillStyle = reached ? P.orange : P.soft; ctx.globalAlpha = reached ? 1 : 0.6;
        ctx.beginPath(); ctx.arc(X, Y, reached ? 2.6 : 1.8, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1;
        if (c === seg || c === (seg + 1) % cv.length) {
          var pulse = ((now / 900) + c * 0.3) % 1;
          ctx.strokeStyle = P.orange; ctx.globalAlpha = 1 - pulse; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(X, Y, 3 + pulse * 9, 0, 6.2832); ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      /* the traveller */
      var lift2 = 1 + 0.16 * Math.sin(Math.PI * eased);
      var qh = project([cur[0] * lift2, cur[1] * lift2, cur[2] * lift2], lon0, lat0);
      if (qh[2] > -0.05) {
        var HX = cx + qh[0] * R, HY = cy - qh[1] * R;
        ctx.fillStyle = "#fff"; ctx.strokeStyle = P.orange; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(HX, HY, 3.4, 0, 6.2832); ctx.fill(); ctx.stroke();
      }
      /* label */
      ctx.textBaseline = "middle"; ctx.textAlign = "left";
      ctx.font = "600 11px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.fillStyle = P.soft; ctx.fillText("FROM", 16, h * 0.30);
      ctx.fillStyle = P.text; ctx.font = "700 15px 'Bricolage Grotesque', system-ui, sans-serif";
      ctx.fillText(CITIES[seg][0], 16, h * 0.44);
      ctx.fillStyle = P.soft; ctx.font = "600 11px 'IBM Plex Mono', ui-monospace, monospace"; ctx.fillText("TO", 16, h * 0.62);
      ctx.fillStyle = P.orange; ctx.font = "700 15px 'Bricolage Grotesque', system-ui, sans-serif";
      ctx.fillText(CITIES[(seg + 1) % CITIES.length][0], 16, h * 0.76);
    };
  }

  /* ---------- Music ---------- */
  function Music(canvas) {
    var N = 26, peaks = [], notes = [];
    for (var i = 0; i < N; i++) peaks.push(0);
    for (var n = 0; n < 5; n++) notes.push({ born: -n * 700, x: 0 });
    this.draw = function (now) {
      var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h, P = palette();
      ctx.clearRect(0, 0, w, h);
      var t = now / 1000, beat = (t * 2) % 1, kick = Math.pow(Math.max(0, 1 - beat * 2.2), 2);
      /* vinyl */
      var R = h * 0.40, cx = R + 14, cy = h * 0.52;
      ctx.save(); ctx.translate(cx, cy);
      var sc = 1 + kick * 0.03; ctx.scale(sc, sc);
      ctx.fillStyle = P.dark ? "#0d1117" : "#1c1f26"; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 0.7;
      for (var r = R * 0.38; r < R * 0.96; r += R * 0.09) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke(); }
      ctx.rotate(t * 2.2);
      var sh = ctx.createLinearGradient(-R, -R, R, R);
      sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(255,255,255,0.16)"); sh.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, R * 0.97, 0, 6.2832); ctx.fill();
      ctx.fillStyle = P.orange; ctx.beginPath(); ctx.arc(0, 0, R * 0.30, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(R * 0.14, 0, 1.6, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, 6.2832); ctx.fillStyle = "#1c1f26"; ctx.fill();
      ctx.restore();
      /* tonearm */
      ctx.strokeStyle = P.soft; ctx.lineWidth = 2.4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx + R * 1.12, cy - R * 0.95); ctx.lineTo(cx + R * 0.48, cy - R * 0.1 + Math.sin(t * 2.2) * 0.8); ctx.stroke();
      ctx.fillStyle = P.soft; ctx.beginPath(); ctx.arc(cx + R * 1.12, cy - R * 0.95, 3.4, 0, 6.2832); ctx.fill();
      /* spectrum */
      var x0 = cx + R + 26, x1 = w - 14, bw = (x1 - x0) / N, base = h * 0.82, maxH = h * 0.66;
      for (var i = 0; i < N; i++) {
        var f = i / (N - 1);
        var lo = (1 - f) * kick * 0.75;
        var v = 0.5 + 0.5 * Math.sin(t * (2.4 + f * 5.2) + i * 1.7);
        var v2 = 0.5 + 0.5 * Math.sin(t * (1.3 + f * 3.1) + i * 0.6 + 2);
        var amp = Math.min(1, 0.10 + lo + (0.28 + 0.32 * (1 - f * 0.5)) * v * v2 + 0.12 * v);
        var bh = Math.max(3, amp * maxH);
        peaks[i] = Math.max(bh, peaks[i] - 0.9);
        var gr = ctx.createLinearGradient(0, base, 0, base - maxH);
        gr.addColorStop(0, P.orange); gr.addColorStop(1, P.blue);
        ctx.fillStyle = gr;
        var bx = x0 + i * bw + bw * 0.14, ww = bw * 0.72;
        ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(bx, base - bh, ww, bh, 2) : ctx.rect(bx, base - bh, ww, bh)); ctx.fill();
        ctx.fillStyle = P.text; ctx.globalAlpha = 0.55; ctx.fillRect(bx, base - peaks[i] - 3, ww, 1.6); ctx.globalAlpha = 1;
      }
      /* notes drifting from the record */
      ctx.font = "700 15px 'Bricolage Grotesque', system-ui, sans-serif"; ctx.textAlign = "center";
      for (var k = 0; k < notes.length; k++) {
        var nt = notes[k], age = (now - nt.born) / 3200;
        if (age >= 1 || age < 0) { nt.born = now + k * 120; nt.x = (Math.random() - 0.5) * 20; if (age < 0) continue; age = 0; }
        var nx = cx + R * 0.6 + age * (w * 0.55) + nt.x * 0.2, ny = cy - R * 0.5 - Math.sin(age * 5 + k) * 8 - age * 14;
        ctx.globalAlpha = Math.sin(Math.PI * age) * 0.9; ctx.fillStyle = k % 2 ? P.orange : P.blue;
        ctx.fillText(k % 2 ? "♪" : "♫", nx, ny);
      }
      ctx.globalAlpha = 1;
    };
  }

  /* ---------- run only while visible ---------- */
  function boot() {
    var jobs = [];
    var g = document.querySelector("canvas.art-globe"), m = document.querySelector("canvas.art-music");
    if (g) jobs.push({ el: g, scene: new Globe(g), on: false });
    if (m) jobs.push({ el: m, scene: new Music(m), on: false });
    if (!jobs.length) return;
    var running = false;
    function frame(now) {
      var any = false;
      for (var i = 0; i < jobs.length; i++) if (jobs[i].on) { jobs[i].scene.draw(now); any = true; }
      if (any && !document.hidden) requestAnimationFrame(frame); else running = false;
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
    if (reduce || !("IntersectionObserver" in window)) {
      jobs.forEach(function (j) { j.scene.draw(1500); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { jobs.forEach(function (j) { if (j.el === e.target) j.on = e.isIntersecting; }); });
      kick();
    }, { rootMargin: "80px" });
    jobs.forEach(function (j) { io.observe(j.el); });
    document.addEventListener("visibilitychange", kick);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
