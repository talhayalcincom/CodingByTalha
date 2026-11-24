// Ana sayfa girişi: arkada bir dizüstü açılır; ekranında oyunların gerçek kodu yazılır, "çalıştır" denince oyun ekranda açılır
// (dört oyun sırayla). Önde "codingbytalha" harfleri havalimanı tabelası gibi dönen harflerden çözülerek oturur, oyun renkleri
// harflerin içinden akar; fareye yakın harfler kalkar. Arkada oyun renklerinde ışık bulutları. Harfler kaydırınca kaybolmaz.
(function () {
  var giris = document.getElementById("giris");
  if (!giris) return;
  var G = window.gsap, ST = window.ScrollTrigger;
  var az = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fareli = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function dil() { return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "tr"; }
  var gorunur = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (l) { gorunur = l[0].isIntersecting; }).observe(giris);

  // ---------------------------------------------------------------- harfler: her harf kendi genişliğinde (dönerken kaymasın)
  var harfler = [];
  giris.querySelectorAll(".md-kelime").forEach(function (k) {
    var metin = k.textContent; k.textContent = "";
    metin.split("").forEach(function (ch) { var h = document.createElement("span"); h.className = "mh"; h.textContent = ch; h.dataset.son = ch; k.appendChild(h); harfler.push(h); });
  });
  var by = giris.querySelector(".md-by"), baslik = giris.querySelector(".marka-dev");
  function olc() { harfler.forEach(function (h) { h.style.width = ""; var t = h.textContent; h.textContent = h.dataset.son; h.style.width = h.getBoundingClientRect().width + "px"; h.textContent = t; }); hizala(); }
  function hizala() { var b0 = baslik.getBoundingClientRect().left; harfler.forEach(function (h) { h.style.setProperty("--ox", (h.getBoundingClientRect().left - b0) + "px"); }); }
  olc(); window.addEventListener("resize", olc); if (document.fonts && document.fonts.ready) document.fonts.ready.then(olc);
  var akis = 0;
  (function ak() { requestAnimationFrame(ak); if (az || !gorunur) return; akis = (akis + 0.9) % (window.innerWidth * 0.7); baslik.style.setProperty("--akis", akis + "px"); })();

  // ---------------------------------------------------------------- ışık bulutları
  var c = document.getElementById("bulut"), x = c.getContext("2d");
  var RENK = ["#f5b32e", "#8f7cff", "#ff4d3d", "#7cc8f2", "#ff6a1a"];
  var bulutlar = RENK.map(function (r) { return { r: r, x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .0009, vy: (Math.random() - .5) * .0009, s: .35 + Math.random() * .25 }; });
  var fx = .5, fy = .5, W = 0, H = 0;
  function boy() { W = c.width = Math.max(320, Math.round(giris.clientWidth / 4)); H = c.height = Math.max(240, Math.round(giris.clientHeight / 4)); }
  boy(); window.addEventListener("resize", boy);
  window.addEventListener("pointermove", function (e) { var r = giris.getBoundingClientRect(); fx = (e.clientX - r.left) / r.width; fy = (e.clientY - r.top) / r.height; }, { passive: true });
  (function bulutCiz(t) {
    requestAnimationFrame(bulutCiz);
    if (!gorunur) return;
    x.fillStyle = "#0c0d12"; x.fillRect(0, 0, W, H); x.globalCompositeOperation = "screen";
    bulutlar.forEach(function (b, i) {
      if (!az) { b.x += b.vx + Math.sin(t / 3000 + i) * .0004; b.y += b.vy + Math.cos(t / 3700 + i) * .0004; }
      if (b.x < -.1 || b.x > 1.1) b.vx *= -1; if (b.y < -.1 || b.y > 1.1) b.vy *= -1;
      var px = (b.x * .8 + fx * .2) * W, py = (b.y * .8 + fy * .2) * H, rr = b.s * Math.max(W, H);
      var g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, b.r + "99"); g.addColorStop(.5, b.r + "2a"); g.addColorStop(1, b.r + "00");
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    });
    x.globalCompositeOperation = "source-over";
  })(0);

  // ---------------------------------------------------------------- dizüstü ekranı: oyunların gerçek kodu durmadan yazılır
  var DOSYALAR = window.KOD_DOSYALAR || [];
  var sekmeler = giris.querySelector(".ed-sekmeler"), kodEl = giris.querySelector(".ed-kod"), noEl = giris.querySelector(".ed-no");
  var komutEl = giris.querySelector(".ed-komut"), lp = giris.querySelector(".laptop");
  var oyunEkran = giris.querySelector(".oyun-ekran"); if (oyunEkran) oyunEkran.remove();
  var cub = giris.querySelector(".ed-cubuk"); if (cub) cub.remove();
  sekmeler.innerHTML = DOSYALAR.map(function (k) { return '<span class="ed-sekme" style="--k:' + k.renk + '">' + k.dosya + "</span>"; }).join("");
  var siradaki = 0;
  async function dongu() {
    if (!window.Kod || !DOSYALAR.length) return;
    while (true) {
      var k = DOSYALAR[siradaki];
      lp.style.setProperty("--ekran", k.renk); lp.style.setProperty("--k", k.renk);
      sekmeler.querySelectorAll(".ed-sekme").forEach(function (s, i) { s.classList.toggle("su", i === siradaki); });
      komutEl.innerHTML = '<span class="tg-soluk">~/' + k.oyun + "/</span>" + k.dosya + ' <span class="tg-soluk">· ' + k.satirlar.length + " satır · UTF-8</span>";
      await window.Kod.yaz(kodEl, k.satirlar, { no: noEl, pencere: 15, hiz: 2, dur: function () { return !gorunur; } });
      await new Promise(function (r) { setTimeout(r, 700); });
      siradaki = (siradaki + 1) % DOSYALAR.length;
    }
  }

  // ---------------------------------------------------------------- dönen cümle: Talha Yalçın ___
  var yolD = giris.querySelector(".donen-yol"), fiiller = giris.querySelectorAll(".donen-fiil"), sira = 0;
  setInterval(function () {
    if (!gorunur || !G) return;
    sira = (sira + 1) % fiiller.length;
    G.to(yolD, { yPercent: -100 * sira / fiiller.length, duration: .8, ease: "expo.inOut" });
    G.fromTo(fiiller[sira], { rotateX: -70, opacity: .2 }, { rotateX: 0, opacity: 1, duration: .8, ease: "expo.out" });
  }, 2400);

  if (!G || az) { dongu(); return; }

  // ---------------------------------------------------------------- açılış: kapak kalkar, harfler tabela gibi çözülür
  var KARISIK = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ0123456789#&*";
  function tabela(h, gecikme) {
    var son = h.dataset.son, bitis = performance.now() + gecikme;
    return new Promise(function (r) {
      (function dön() {
        if (performance.now() < bitis) { h.textContent = KARISIK.charAt(Math.random() * KARISIK.length | 0).toLowerCase(); setTimeout(dön, 55); return; }
        h.textContent = son;
        G.fromTo(h, { rotateX: -95, y: -10 }, { rotateX: 0, y: 0, duration: .55, ease: "back.out(2.2)", onComplete: r });
      })();
    });
  }
  var basladi = false;
  function gel() {
    if (basladi) return; basladi = true;
    G.set(harfler, { opacity: 1 });
    G.fromTo(".lp-kapak", { rotateX: -88 }, { rotateX: 0, duration: 1.6, ease: "expo.out" });
    G.fromTo(".laptop", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" });
    G.fromTo(".lp-ekran", { filter: "brightness(0)" }, { filter: "brightness(1)", duration: .8, delay: .9, ease: "power2.out", onComplete: dongu });
    harfler.forEach(function (h, i) { tabela(h, 350 + i * 70 + Math.random() * 120); });
    G.from(by, { scale: 0, rotate: -40, duration: 1, ease: "elastic.out(1, .45)", delay: 1.2 });
    G.from(".giris-ust, .donen, .giris-alt > *", { y: 30, opacity: 0, duration: .9, ease: "power3.out", stagger: .08, delay: .6 });
  }
  var masa = window.innerWidth >= 861;
  G.set(lp, masa ? { yPercent: -46, rotateY: -18, rotateX: 7, transformPerspective: 1800 } : { rotateX: 8, transformPerspective: 1400 });
  G.set(".lp-kapak", { transformPerspective: 1800 });
  G.set(harfler, { opacity: 0 });
  if (document.querySelector(".yukleyici")) {
    var bek = setInterval(function () { if (!document.querySelector(".yukleyici") || document.documentElement.classList.contains("hazir")) { clearInterval(bek); gel(); } }, 80);
    setTimeout(function () { clearInterval(bek); gel(); }, 5000);
  } else gel();

  // ---------------------------------------------------------------- fareye yakın harfler kalkar
  if (fareli) {
    var mx = -9999, my = -9999;
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    G.ticker.add(function () {
      if (!basladi || !gorunur) return;
      harfler.forEach(function (h) {
        var r = h.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var d = Math.hypot(mx - cx, my - cy), etki = Math.max(0, 1 - d / 260);
        G.to(h, { y: -etki * 30, scale: 1 + etki * .1, rotate: (mx - cx) * etki * -.035, duration: .5, ease: "power3.out", overwrite: "auto" });
      });
    });
    // dizüstü fareye doğru hafifçe döner
    G.ticker.add(function () {
      if (!gorunur || window.innerWidth < 861) return;
      var rx = 7 - (fy - .5) * 6, ry = -18 + (fx - .5) * 10;
      G.to(lp, { rotateX: rx, rotateY: ry, duration: 1.2, ease: "power2.out", overwrite: "auto" });
    });
  }

  // ---------------------------------------------------------------- kaydırınca: harfler yerinde kalır; dizüstü geriye yaslanır
  if (ST) G.to(lp, { y: -160, scale: .92, opacity: .55, ease: "none", scrollTrigger: { trigger: giris, start: "top top", end: "bottom top", scrub: .6 } });
})();
