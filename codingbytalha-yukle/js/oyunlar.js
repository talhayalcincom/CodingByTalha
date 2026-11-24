// Oyun sayfalarındaki oynanabilir mini parçalar. <div class="oyna" data-oyun="usta|hakim-bey|acili-mi-olsun|harput-kisi">
// Her biri kendi oyunundan küçük bir an: kepçeyle kamyon doldur, karar ver, dürüm sar, ateşi söndürme.
(function () {
  function dil() { return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "tr"; }
  function y(tr, en) { return dil() === "en" ? en : tr; }
  function el(etiket, sinif, ic) { var e = document.createElement(etiket); if (sinif) e.className = sinif; if (ic != null) e.innerHTML = ic; return e; }
  function tuvalKur(kutu, oran) {
    var c = el("canvas", "oyna-tuval"); kutu.appendChild(c);
    var x = c.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;
    function boy() { W = kutu.clientWidth; H = Math.round(W * oran); c.width = W * dpr; c.height = H * dpr; c.style.height = H + "px"; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    boy(); window.addEventListener("resize", boy);
    var gorunur = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (l) { gorunur = l[0].isIntersecting; }).observe(c); else gorunur = true;
    return { c: c, x: x, W: function () { return W; }, H: function () { return H; }, gorunur: function () { return gorunur; } };
  }
  function nokta(c, e) { var r = c.getBoundingClientRect(); var t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; }

  // ================================================================ USTA: kepçeyle kamyon doldur
  function usta(kutu) {
    var T = tuvalKur(kutu, 0.52), x = T.x;
    var hud = el("div", "oyna-hud"); kutu.appendChild(hud);
    var hedef = { x: 0, y: 0 }, uc = { x: 0, y: 0 }, kova = [], taneler = [], kamyon = { x: 0, gidiyor: 0, dolu: 0, sayi: 0 }, KAP = 34, ISTEK = 60;
    function zemin() { return T.H() * 0.82; }
    function yigin() { taneler = []; var W = T.W(), H = T.H(), z = zemin(); for (var i = 0; i < 230; i++) { var a = Math.random(), r = Math.sqrt(Math.random()); var px = W * 0.06 + a * W * 0.3; var tepe = z - Math.sin(a * Math.PI) * H * 0.3 * (0.6 + 0.4 * r); taneler.push({ x: px, y: tepe + Math.random() * (z - tepe), vx: 0, vy: 0, s: 0 }); } }
    function govdeX() { return T.W() * 0.46; }
    yigin(); hedef.x = T.W() * 0.3; hedef.y = T.H() * 0.4;
    function hareket(e) { var p = nokta(T.c, e); hedef.x = p.x; hedef.y = p.y; if (e.touches) e.preventDefault(); }
    T.c.addEventListener("pointermove", hareket); T.c.addEventListener("touchmove", hareket, { passive: false });
    T.c.addEventListener("pointerdown", hareket);
    function ik(bx, by, tx, ty, L1, L2) {
      var dx = tx - bx, dy = ty - by, d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1);
      var a = Math.atan2(dy, dx), b = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
      // iki çözümden dirseği yukarıda olanı (gerçek kepçede bom hep yukarı kalkar)
      var e1 = by + Math.sin(a - b) * L1 < by + Math.sin(a + b) * L1 ? a - b : a + b;
      var jx = bx + Math.cos(e1) * L1, jy = by + Math.sin(e1) * L1;
      var e2 = Math.atan2(by + Math.sin(a) * d - jy, bx + Math.cos(a) * d - jx);
      return { jx: jx, jy: jy, ex: jx + Math.cos(e2) * L2, ey: jy + Math.sin(e2) * L2, e2: e2 };
    }
    function ciz(t) {
      requestAnimationFrame(ciz);
      if (!T.gorunur()) return;
      var W = T.W(), H = T.H(), z = zemin(), S = W / 900;
      x.clearRect(0, 0, W, H);
      var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#2a2016"); g.addColorStop(1, "#140f0b"); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = "#3a2b1d"; x.fillRect(0, z, W, H - z);
      // kamyon
      var kx = W * 0.74 + kamyon.x, ky = z - 70 * S;
      if (kamyon.gidiyor) { kamyon.x += 6 * S; if (kamyon.x > W * 0.5) { kamyon.x = -W * 0.6; kamyon.gidiyor = 0; kamyon.dolu = 0; } }
      else if (kamyon.x < 0) kamyon.x = Math.min(0, kamyon.x + 7 * S);
      x.fillStyle = "#f5b32e"; x.fillRect(kx, ky, 150 * S, 46 * S);                      // kasa
      x.fillStyle = "#e9e3d6"; x.fillRect(kx + 152 * S, ky - 12 * S, 52 * S, 58 * S);     // kabin
      x.fillStyle = "#2b3440"; x.fillRect(kx + 168 * S, ky - 4 * S, 28 * S, 18 * S);
      x.fillStyle = "#16120e"; [30, 112, 182].forEach(function (o) { x.beginPath(); x.arc(kx + o * S, z - 10 * S, 14 * S, 0, 7); x.fill(); });
      var dolu = Math.min(1, kamyon.dolu / ISTEK);
      x.fillStyle = "#7a5636"; x.beginPath(); x.ellipse(kx + 75 * S, ky + 2 * S, 70 * S, 26 * S * dolu + 1, 0, Math.PI, 0); x.fill();
      // makine
      var bx = govdeX(), by = z - 78 * S, L1 = 210 * S, L2 = 160 * S;
      uc.x += (hedef.x - uc.x) * 0.16; uc.y += (Math.min(hedef.y, z - 6) - uc.y) * 0.16;
      var k = ik(bx, by, uc.x, uc.y, L1, L2);
      x.fillStyle = "#1c1a17"; x.fillRect(bx - 70 * S, z - 26 * S, 150 * S, 26 * S);        // palet
      x.fillStyle = "#f5b32e"; x.fillRect(bx - 40 * S, by - 10 * S, 120 * S, 58 * S);      // gövde
      x.fillStyle = "#2b3440"; x.fillRect(bx + 32 * S, by - 4 * S, 36 * S, 30 * S);
      x.lineCap = "round"; x.strokeStyle = "#f5b32e"; x.lineWidth = 22 * S; x.beginPath(); x.moveTo(bx, by); x.lineTo(k.jx, k.jy); x.stroke();
      x.lineWidth = 15 * S; x.beginPath(); x.moveTo(k.jx, k.jy); x.lineTo(k.ex, k.ey); x.stroke();
      x.strokeStyle = "#cfd3d6"; x.lineWidth = 5 * S; x.beginPath(); x.moveTo(bx + 20 * S, by + 18 * S); x.lineTo((bx + k.jx) / 2, (by + k.jy) / 2 - 6 * S); x.stroke();
      // kova
      x.save(); x.translate(k.ex, k.ey); x.rotate(k.e2 + Math.PI / 2);
      x.fillStyle = "#2a2622"; x.beginPath(); x.moveTo(-22 * S, 0); x.lineTo(22 * S, 0); x.lineTo(16 * S, 34 * S); x.quadraticCurveTo(0, 44 * S, -18 * S, 30 * S); x.closePath(); x.fill();
      x.restore();
      // kova yükü: yığına değince alır, kamyonun üstünde boşaltır
      var ustunde = k.ex > kx && k.ex < kx + 150 * S && k.ey < ky + 10 * S && !kamyon.gidiyor;
      for (var i = taneler.length - 1; i >= 0; i--) {
        var p = taneler[i];
        if (p.s === 0 && kova.length < KAP && Math.hypot(p.x - k.ex, p.y - (k.ey + 18 * S)) < 26 * S) { p.s = 1; kova.push(p); }
      }
      kova.forEach(function (p, j) { p.x = k.ex + ((j % 6) - 2.5) * 5 * S; p.y = k.ey + 14 * S + Math.floor(j / 6) * 4 * S; });
      if (ustunde && kova.length) { kova.forEach(function (p) { p.s = 2; p.vx = (Math.random() - .5) * 2; p.vy = 0; }); kova = []; }
      taneler.forEach(function (p) {
        if (p.s === 2) {
          p.vy += 0.5 * S; p.x += p.vx; p.y += p.vy;
          var tabanY = (p.x > kx && p.x < kx + 150 * S) ? ky + 6 * S - dolu * 18 * S : z;
          if (p.y > tabanY) { if (p.x > kx && p.x < kx + 150 * S) { p.s = 3; kamyon.dolu++; } else { p.s = 0; p.y = z - 2; p.vy = 0; } }
        }
      });
      taneler = taneler.filter(function (p) { return p.s !== 3; });
      if (kamyon.dolu >= ISTEK && !kamyon.gidiyor) { kamyon.gidiyor = 1; kamyon.sayi++; }
      if (taneler.length < 70) yigin();
      x.fillStyle = "#8a6440";
      taneler.forEach(function (p) { x.beginPath(); x.arc(p.x, p.y, 5 * S, 0, 7); x.fill(); });
      hud.innerHTML = '<span>' + y("Kamyon", "Trucks") + ' <b>' + kamyon.sayi + '</b></span><span>' + y("Kasa", "Load") + ' <b>' + Math.round(dolu * 100) + '%</b></span><span>' + y("Kova", "Bucket") + ' <b>' + kova.length + '/' + KAP + '</b></span>';
    }
    requestAnimationFrame(ciz);
    return ["Fareyle (ya da parmağınla) kepçeyi oynat: yığından al, kamyonun üstüne götür, boşalt.", "Move the bucket with your mouse or finger: scoop from the pile, carry it over the truck, dump."];
  }

  // ================================================================ Hâkim Bey: karar ver
  var DAVALAR = [
    { tr: ["Komşusunun bahçesinden 3 karpuz çaldığı iddia edilen sanık.", "Bahçede sanığın ayakkabı izi bulundu.", "Sanık o gece düğünde olduğunu söylüyor; düğün fotoğraflarında saat 23.40'ta görünüyor.", "Karpuzlar 23.30 ile 00.10 arasında çalınmış."],
      en: ["The defendant is accused of stealing 3 watermelons from a neighbour's garden.", "His shoe print was found in the garden.", "He says he was at a wedding; photos show him there at 23:40.", "The melons were taken between 23:30 and 00:10."], dogru: "beraat",
      ac: ["Fotoğraf, sanığın tam o saatte düğünde olduğunu gösteriyor. Ayak izi gündüz komşuya yardım ettiği günden kalma.", "The photo places him at the wedding at the exact time. The print was from helping the neighbour that afternoon."] },
    { tr: ["Kasadan para alırken kameraya yakalanan kasiyer.", "Kamera kaydı net: sanık kasadan 2.000 ₺ alıyor.", "Sanık 'avans aldım' diyor ama defterde imza yok.", "Patron avans vermediğini söylüyor."],
      en: ["A cashier caught on camera taking money from the till.", "The footage is clear: she takes ₺2,000.", "She says it was an advance, but there's no signature in the ledger.", "The owner says he never gave an advance."], dogru: "mahkumiyet",
      ac: ["Kayıt açık, avans iddiası hiçbir belgeyle desteklenmiyor.", "The footage is clear and the advance claim has no record behind it."] },
    { tr: ["Trafikte kırmızı ışıkta geçtiği iddia edilen sürücü.", "Polis tutanağında plaka bir harf farklı yazılmış.", "Sanığın aracı o saatte otoparkın kamerasında duruyor.", "Tanık 'beyaz bir araba' gördüğünü söylüyor; sanığın arabası siyah."],
      en: ["A driver accused of running a red light.", "The police report has the plate wrong by one letter.", "His car was parked on a garage camera at that time.", "A witness saw 'a white car'; his is black."], dogru: "beraat",
      ac: ["Plaka hatalı, araç otoparkta, renk tutmuyor: yanlış kişi.", "Wrong plate, car in the garage, wrong colour: wrong person."] },
    { tr: ["Kiracısını eşyalarıyla kapı dışarı eden ev sahibi.", "Mahkeme kararı olmadan kilit değiştirilmiş.", "Ev sahibi 'kira 2 aydır yatmadı' diyor.", "Kiracı dekontlarla bir ayını ödediğini gösteriyor."],
      en: ["A landlord who threw his tenant out with her belongings.", "The lock was changed without a court order.", "He says rent was unpaid for 2 months.", "She shows receipts for one of them."], dogru: "mahkumiyet",
      ac: ["Borç olsa bile tahliye ancak mahkeme kararıyla olur; kendi başına kilit değiştirmek suç.", "Even with debt, eviction needs a court order; changing the lock yourself is a crime."] }
  ];
  function hakim(kutu) {
    var i = 0, puan = 0;
    var kart = el("div", "dava"); kutu.appendChild(kart);
    function goster() {
      var d = DAVALAR[i % DAVALAR.length], m = d[dil()];
      kart.innerHTML = '<div class="dava-ust"><span>' + y("Dava", "Case") + ' ' + (2026000 + i * 37 + 141) + '/E</span><span>' + y("Doğru karar", "Correct") + ': <b>' + puan + '</b></span></div>' +
        '<h4>' + m[0] + '</h4><ul><li><i>' + y("Delil", "Evidence") + '</i>' + m[1] + '</li><li><i>' + y("Savunma", "Defence") + '</i>' + m[2] + '</li><li><i>' + y("Tanık", "Witness") + '</i>' + m[3] + '</li></ul>' +
        '<div class="dava-dugme"><button type="button" data-k="beraat">' + y("BERAAT", "ACQUIT") + '</button><button type="button" data-k="mahkumiyet">' + y("MAHKÛMİYET", "CONVICT") + '</button></div><div class="tokmak" aria-hidden="true">⚖</div><p class="dava-sonuc"></p>';
      kart.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          var dogru = b.dataset.k === d.dogru; if (dogru) puan++;
          kart.classList.remove("vur"); void kart.offsetWidth; kart.classList.add("vur");
          kart.querySelectorAll("button").forEach(function (o) { o.disabled = true; o.classList.toggle("secili", o === b); });
          var s = kart.querySelector(".dava-sonuc");
          s.innerHTML = '<b class="' + (dogru ? "iyi" : "kotu") + '">' + (dogru ? y("Yerinde karar.", "Sound ruling.") : y("Yargıtay bozdu.", "Overturned on appeal.")) + '</b> ' + d.ac[dil() === "en" ? 1 : 0] +
            ' <button type="button" class="sonraki-dava">' + y("Sıradaki dava →", "Next case →") + '</button>';
          s.querySelector(".sonraki-dava").addEventListener("click", function () { i++; goster(); });
        });
      });
    }
    goster();
    document.querySelectorAll(".dil").forEach(function (b) { b.addEventListener("click", function () { setTimeout(goster, 0); }); });
    return ["Dosyayı oku, delilleri tart, kararını ver. Hâkim Bey'de böyle beş binden fazla dava var.", "Read the file, weigh the evidence, rule. Hâkim Bey has over five thousand cases like this."];
  }

  // ================================================================ Acılı mı Olsun?: dürüm sar
  var MALZEME = [["lavas", "🫓", "Lavaş", "Wrap"], ["kofte", "🟤", "Çiğköfte", "Çiğ köfte"], ["marul", "🥬", "Marul", "Lettuce"], ["domates", "🍅", "Domates", "Tomato"],
    ["nar", "🍷", "Nar ekşisi", "Pomegranate"], ["aci", "🌶️", "Acı sos", "Hot sauce"], ["limon", "🍋", "Limon", "Lemon"]];
  function acili(kutu) {
    var sip = [], sepet = [], puan = 0, kasa = 0, sure = 0, son = 0;
    var alan = el("div", "durum-alan"); kutu.appendChild(alan);
    function yeniSiparis() {
      sip = ["lavas", "kofte"]; ["marul", "domates", "nar", "aci", "limon"].forEach(function (m) { if (Math.random() < 0.5) sip.push(m); });
      sepet = ["lavas", "kofte"]; sure = 100; ciz();   // lavaş ve köfte hazır gelir, gerisi siparişe göre
    }
    function ad(m) { var r = MALZEME.filter(function (a) { return a[0] === m; })[0]; return dil() === "en" ? r[3] : r[2]; }
    function ciz() {
      var acili = sip.indexOf("aci") >= 0;
      var istek = sip.filter(function (m) { return m !== "lavas" && m !== "kofte"; }).map(ad).join(", ") || y("sade", "plain");
      alan.innerHTML = '<div class="musteri"><span class="yuz">🧔</span><div class="balon">' + (acili ? y("Acılı olsun abi!", "Make it spicy!") : y("Acısız olsun abi.", "No spice, please.")) +
        ' <small>' + y("İçinde", "With") + ': ' + istek + '</small></div></div>' +
        '<div class="sure"><i style="width:' + sure + '%"></i></div>' +
        '<div class="tezgah">' + MALZEME.map(function (m) { return '<button type="button" data-m="' + m[0] + '"' + (sepet.indexOf(m[0]) >= 0 ? ' class="kondu"' : '') + '><span>' + m[1] + '</span>' + (dil() === "en" ? m[3] : m[2]) + '</button>'; }).join("") + '</div>' +
        '<div class="durum-alt"><div class="durum-gorsel">' + sepet.map(function (m) { return '<span class="kat kat-' + m + '"></span>'; }).join("") + '</div>' +
        '<button type="button" class="sar-ver">' + y("SAR VE VER", "WRAP & SERVE") + '</button><span class="kasa">' + y("Kasa", "Till") + ' <b>₺' + kasa + '</b> · ' + y("Mutlu müşteri", "Happy customers") + ' <b>' + puan + '</b></span></div><p class="durum-not"></p>';
      alan.querySelectorAll(".tezgah button").forEach(function (b) {
        b.addEventListener("click", function () { var m = b.dataset.m; var j = sepet.indexOf(m); if (j >= 0) sepet.splice(j, 1); else sepet.push(m); ciz(); });
      });
      alan.querySelector(".sar-ver").addEventListener("click", function () {
        var dogru = sip.length === sepet.length && sip.every(function (m) { return sepet.indexOf(m) >= 0; });
        var not = alan.querySelector(".durum-not");
        if (dogru) { puan++; var bah = Math.round(sure / 10) * 5; kasa += 60 + bah; not.innerHTML = '<b class="iyi">' + y("Eline sağlık usta!", "Perfect!") + '</b> +₺' + (60 + bah); setTimeout(yeniSiparis, 900); }
        else { var eksik = sip.filter(function (m) { return sepet.indexOf(m) < 0; }).map(ad), fazla = sepet.filter(function (m) { return sip.indexOf(m) < 0; }).map(ad);
          not.innerHTML = '<b class="kotu">' + y("Abi bu benim siparişim değil!", "That's not my order!") + '</b> ' + (eksik.length ? y("Eksik: ", "Missing: ") + eksik.join(", ") + ". " : "") + (fazla.length ? y("Fazla: ", "Extra: ") + fazla.join(", ") + "." : ""); }
      });
    }
    setInterval(function () {
      if (!alan.isConnected || alan.getBoundingClientRect().bottom < 0) return;
      sure = Math.max(0, sure - 2); var c = alan.querySelector(".sure i"); if (c) c.style.width = sure + "%";
      if (sure === 0 && Date.now() - son > 1500) { son = Date.now(); var n = alan.querySelector(".durum-not"); if (n) n.innerHTML = '<b class="kotu">' + y("Müşteri bekleyemedi, gitti.", "The customer gave up.") + '</b>'; setTimeout(yeniSiparis, 1200); }
    }, 400);
    yeniSiparis();
    document.querySelectorAll(".dil").forEach(function (b) { b.addEventListener("click", function () { setTimeout(ciz, 0); }); });
    return ["Müşteri ne istedi? Malzemeleri seç, dürümü sar, bahşişi kap. Süre bitmeden yetiş.", "What did they order? Pick the fillings, wrap it, collect the tip before time runs out."];
  }

  // ================================================================ Harput Kışı: ateşi söndürme
  function harput(kutu) {
    var T = tuvalKur(kutu, 0.52), x = T.x;
    var hud = el("div", "oyna-hud"); kutu.appendChild(hud);
    var isi = 70, odun = 0, sn = 0, en = 0, kar = [], kivilcim = [], ruzgar = 0, bitti = false, son = performance.now();
    for (var i = 0; i < 260; i++) kar.push({ x: Math.random(), y: Math.random(), h: 0.3 + Math.random(), r: 0.6 + Math.random() * 1.8 });
    function at() {
      if (bitti) { isi = 70; sn = 0; bitti = false; return; }
      isi = Math.min(100, isi + 14); odun++;
      for (var j = 0; j < 26; j++) kivilcim.push({ x: 0.5 + (Math.random() - .5) * .06, y: 0.78, vx: (Math.random() - .5) * .004, vy: -.006 - Math.random() * .01, o: 1 });
    }
    T.c.addEventListener("pointerdown", at);
    function ciz(now) {
      requestAnimationFrame(ciz);
      var dt = Math.min(0.05, (now - son) / 1000); son = now;
      if (!T.gorunur()) return;
      var W = T.W(), H = T.H();
      ruzgar += ((Math.sin(now / 2300) + Math.sin(now / 900) * .4) * 1.0 - ruzgar) * 0.02;
      if (!bitti) { sn += dt; isi -= dt * (5 + Math.max(0, ruzgar) * 7 + sn * 0.12); if (isi <= 0) { isi = 0; bitti = true; en = Math.max(en, sn); } }
      var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b1422"); g.addColorStop(1, "#1d2a3a"); x.fillStyle = g; x.fillRect(0, 0, W, H);
      // tepeler ve evler
      x.fillStyle = "#c9d8e6"; x.beginPath(); x.moveTo(0, H * .78); for (var k = 0; k <= 20; k++) x.lineTo(W * k / 20, H * (.72 + Math.sin(k * 1.7) * .03)); x.lineTo(W, H); x.lineTo(0, H); x.fill();
      x.fillStyle = "#2a2f3a"; [[.12, .62], [.22, .66], [.78, .63], [.88, .67]].forEach(function (e) { x.fillRect(W * e[0], H * e[1], W * .07, H * .1); x.fillStyle = "#ffb36b"; x.fillRect(W * e[0] + W * .025, H * e[1] + H * .035, W * .015, H * .025); x.fillStyle = "#2a2f3a"; });
      // ateş
      var f = isi / 100, cx = W * .5, cy = H * .8;
      var isik = x.createRadialGradient(cx, cy, 0, cx, cy, W * .35 * (0.3 + f)); isik.addColorStop(0, "rgba(255,150,60," + (0.45 * f) + ")"); isik.addColorStop(1, "rgba(255,120,40,0)");
      x.fillStyle = isik; x.fillRect(0, 0, W, H);
      x.fillStyle = "#3b2414"; x.save(); x.translate(cx, cy); x.rotate(.3); x.fillRect(-W * .05, -4, W * .1, 9); x.rotate(-.6); x.fillRect(-W * .05, -4, W * .1, 9); x.restore();
      for (var a = 0; a < 3; a++) {
        var yuk = H * (.08 + .16 * f) * (1 - a * .25), gen = W * (.025 + .02 * f) * (1 - a * .2);
        x.fillStyle = ["#ff5a1f", "#ffa62b", "#ffe8a3"][a];
        x.beginPath(); x.moveTo(cx - gen, cy);
        x.quadraticCurveTo(cx - gen * .6 + Math.sin(now / 120 + a) * 4, cy - yuk * .6, cx + Math.sin(now / 90 + a) * gen * .5 + ruzgar * 8, cy - yuk);
        x.quadraticCurveTo(cx + gen * .6, cy - yuk * .5, cx + gen, cy); x.fill();
      }
      kivilcim.forEach(function (p) { p.x += p.vx + ruzgar * .002; p.y += p.vy; p.o -= .015; x.fillStyle = "rgba(255,190,90," + Math.max(0, p.o) + ")"; x.fillRect(p.x * W, p.y * H, 2, 2); });
      kivilcim = kivilcim.filter(function (p) { return p.o > 0; });
      // tipi
      x.fillStyle = "rgba(235,244,255,.85)";
      kar.forEach(function (s) { s.y += s.h * .004 * (1 + Math.abs(ruzgar)); s.x += (ruzgar * .006 + .001) * s.h; if (s.y > 1) { s.y = 0; s.x = Math.random(); } if (s.x > 1) s.x -= 1; if (s.x < 0) s.x += 1; x.beginPath(); x.arc(s.x * W, s.y * H, s.r, 0, 7); x.fill(); });
      if (bitti) { x.fillStyle = "rgba(8,14,24,.7)"; x.fillRect(0, 0, W, H); x.fillStyle = "#e9f4ff"; x.font = "700 " + Math.round(W / 22) + "px Unbounded, sans-serif"; x.textAlign = "center"; x.fillText(y("Ateş söndü.", "The fire went out."), W / 2, H * .45); x.font = "500 " + Math.round(W / 50) + "px Manrope, sans-serif"; x.fillText(y("Yeniden dene: dokun", "Tap to try again"), W / 2, H * .55); x.textAlign = "start"; }
      var dk = Math.floor(sn / 60), s2 = Math.floor(sn % 60);
      hud.innerHTML = '<span>' + y("Isı", "Heat") + ' <b>' + Math.round(isi) + '°</b></span><span>' + y("Dayandın", "Survived") + ' <b>' + dk + ':' + (s2 < 10 ? "0" : "") + s2 + '</b></span><span>' + y("En iyi", "Best") + ' <b>' + Math.round(Math.max(en, bitti ? 0 : sn)) + ' sn</b></span><span>' + y("Rüzgâr", "Wind") + ' <b>' + (ruzgar > .4 ? y("TİPİ", "BLIZZARD") : y("hafif", "light")) + '</b></span>';
    }
    requestAnimationFrame(ciz);
    return ["Tipi bastırıyor. Ateşe odun atmak için dokun; ısı sıfıra inerse donarsın.", "A blizzard is coming. Tap to throw wood on the fire; if the heat hits zero, you freeze."];
  }

  var KUR = { "usta": usta, "hakim-bey": hakim, "acili-mi-olsun": acili, "harput-kisi": harput };
  document.querySelectorAll(".oyna[data-oyun]").forEach(function (k) {
    var f = KUR[k.dataset.oyun]; if (!f) return;
    var sahne = k.querySelector(".oyna-sahne");
    var ipucu = f(sahne);
    var ip = k.querySelector(".oyna-ipucu"); if (ip) ip.innerHTML = '<span data-l="tr">' + ipucu[0] + '</span><span data-l="en">' + ipucu[1] + "</span>";
  });
})();
