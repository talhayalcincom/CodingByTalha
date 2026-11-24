// codingbytalha — dil, açılış, yumuşak kaydırma, sayfa geçişi, imleç, süzülen resim, mıknatıs, kaydırma animasyonları.
// GSAP + ScrollTrigger + Lenis (vendor/) varsa kullanılır; yoksa ya da hareket istenmiyorsa sayfa düz ve eksiksiz görünür.
(function () {
  var kok = document.documentElement;
  var az = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fareli = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var G = window.gsap, ST = window.ScrollTrigger;

  // ---------------------------------------------------------------- dil
  var dil = null;
  try { dil = localStorage.getItem("dil"); } catch (e) {}
  if (!dil) dil = (navigator.language || "tr").toLowerCase().indexOf("tr") === 0 ? "tr" : "en";
  function dilKur(d) {
    dil = d; kok.setAttribute("data-lang", d); kok.setAttribute("lang", d);
    document.querySelectorAll(".dil").forEach(function (b) { b.textContent = d === "tr" ? "EN" : "TR"; });
    try { localStorage.setItem("dil", d); } catch (e) {}
    if (ST) ST.refresh();
  }
  dilKur(dil);
  document.addEventListener("click", function (e) { if (e.target.closest(".dil")) dilKur(dil === "tr" ? "en" : "tr"); });

  // yıl
  document.querySelectorAll(".yil").forEach(function (s) { s.textContent = new Date().getFullYear(); });

  // ---------------------------------------------------------------- resim büyütme
  var bu = document.createElement("div");
  bu.className = "buyutec";
  bu.innerHTML = '<img alt=""><button type="button">ESC ✕</button>';
  document.body.appendChild(bu);
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".galeri button");
    if (b) { bu.querySelector("img").src = b.querySelector("img").src; bu.classList.add("acik"); return; }
    if (e.target.closest(".buyutec")) bu.classList.remove("acik");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") bu.classList.remove("acik"); });

  var yuk = document.querySelector(".yukleyici");
  if (az || !G) {
    kok.classList.add("hazir");
    if (yuk) yuk.remove();
    return;
  }
  G.registerPlugin(ST);

  // ---------------------------------------------------------------- yumuşak kaydırma
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) { var h = document.querySelector(a.getAttribute("href")); if (h) { e.preventDefault(); lenis.scrollTo(h, { offset: -60 }); } });
    });
  }

  // ---------------------------------------------------------------- sayfa geçişi: terminal (tıklayınca komut yazılır, sayfa açılır)
  var term = document.createElement("div");
  term.className = "term-gecis"; term.setAttribute("aria-hidden", "true");
  term.innerHTML = '<div class="tg-pencere"><div class="tg-ust"><i></i><i></i><i></i><span>zsh — ~/codingbytalha</span></div><pre class="tg-govde"></pre></div>';
  document.body.appendChild(term);
  var tgGovde = term.querySelector(".tg-govde");
  var OYUN_KOMUT = { "usta": ["godot --run usta", "#f5b32e"], "hakim-bey": ["npx expo start hakim-bey", "#8f7cff"], "acili-mi-olsun": ["xcodebuild -scheme AciliMiOlsun", "#ff4d3d"], "harput-kisi": ["godot --run harput-kisi", "#7cc8f2"] };
  function komutBul(url) {
    var yol = url.pathname.replace(/\/index\.html$/, "/").replace(/^.*?\/(?=[^/]*\/?[^/]*$)/, "");
    var p = url.pathname.split("/").filter(Boolean), dosya = p[p.length - 1] || "index.html", klasor = p.length > 1 ? p[p.length - 2] : "";
    if (dosya === "gizlilik.html") return ["cat " + klasor + "/gizlilik.md", OYUN_KOMUT[klasor] ? OYUN_KOMUT[klasor][1] : "#ece6da", klasor + "/gizlilik"];
    if (OYUN_KOMUT[klasor] && dosya === "index.html") return [OYUN_KOMUT[klasor][0], OYUN_KOMUT[klasor][1], klasor];
    if (dosya === "destek.html") return ["open destek.md", "#7cc8f2", "destek"];
    if (dosya === "hesap-sil.html") return ["usta hesap --sil --yardim", "#ff4d3d", "hesap-sil"];
    if (dosya === "sartlar.html") return ["cat sartlar.md", "#ece6da", "sartlar"];
    var bolum = (url.hash || "").replace("#", "");
    return ["cd ~/codingbytalha" + (bolum ? " && ls " + bolum + "/" : ""), "#f5b32e", bolum || "ana sayfa"];
  }
  function satir(html) { tgGovde.innerHTML += html + "\n"; }
  function yazKomut(metin, sonra) {
    var i = 0, onEk = tgGovde.innerHTML;
    (function adim() {
      tgGovde.innerHTML = onEk + '<span class="tg-istem">talha@codingbytalha</span> <span class="tg-yol">~</span> $ ' + metin.slice(0, i) + '<span class="tg-imlec"></span>';
      if (i++ < metin.length) setTimeout(adim, 16 + Math.random() * 18); else setTimeout(sonra, 120);
    })();
  }
  function cikis(c, ad) {
    var dolu = 0, cub = document.createElement("span"); cub.className = "tg-cubuk"; cub.style.setProperty("--k", c);
    tgGovde.innerHTML = tgGovde.innerHTML.replace('<span class="tg-imlec"></span>', "") + "\n";
    satir('<span class="tg-soluk">› ' + (dil === "en" ? "loading" : "yükleniyor") + " " + ad + "…</span>");
    tgGovde.appendChild(cub);
    return new Promise(function (r) { (function dol() { dolu = Math.min(100, dolu + 9 + Math.random() * 14); cub.textContent = "[" + "█".repeat(Math.round(dolu / 5)) + "░".repeat(20 - Math.round(dolu / 5)) + "] " + Math.round(dolu) + "%"; if (dolu < 100) setTimeout(dol, 40); else setTimeout(r, 90); })(); });
  }
  var gelis = null;
  try { gelis = JSON.parse(sessionStorage.getItem("gecis") || "null"); sessionStorage.removeItem("gecis"); } catch (e) {}
  if (gelis) {
    term.classList.add("acik"); term.style.setProperty("--k", gelis.renk);
    tgGovde.innerHTML = '<span class="tg-ok">✓</span> ' + gelis.ad + " " + (dil === "en" ? "is open" : "açıldı") + "\n";
    G.to(term, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.75, ease: "expo.inOut", delay: 0.25, onComplete: function () { term.classList.remove("acik"); G.set(term, { clearProps: "clipPath" }); } });
  }
  var gidiyor = false;
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || gidiyor) return;
    var h = a.getAttribute("href");
    if (!h || h.charAt(0) === "#" || /^(https?:|mailto:|tel:)/.test(h)) return;
    var url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) return;      // aynı sayfada bölüme kaydırma
    e.preventDefault(); gidiyor = true;
    var k = komutBul(url);
    term.style.setProperty("--k", k[1]); tgGovde.innerHTML = "";
    term.classList.add("acik");
    G.fromTo(term, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "expo.out" });
    setTimeout(function () {
      yazKomut(k[0], function () {
        cikis(k[1], k[2]).then(function () {
          try { sessionStorage.setItem("gecis", JSON.stringify({ ad: k[2], renk: k[1] })); } catch (er) {}
          location.href = a.href;
        });
      });
    }, 180);
  });
  window.addEventListener("pageshow", function (e) { if (e.persisted) { gidiyor = false; term.classList.remove("acik"); } });

  // ---------------------------------------------------------------- başlıkları harflere böl (em içindeki eğik yazı bütün kalır)
  document.querySelectorAll(".harfli .satir > span").forEach(function (sp) {
    Array.prototype.slice.call(sp.childNodes).forEach(function (d) {
      if (d.nodeType !== 3) return;
      var parca = document.createDocumentFragment();
      d.textContent.split(/(\s+)/).forEach(function (kel) {   // kelime bölünmez, harfler kelimenin içinde
        if (!kel) return;
        if (!kel.trim()) { parca.appendChild(document.createTextNode(" ")); return; }
        var k = document.createElement("span"); k.style.whiteSpace = "nowrap"; k.style.display = "inline-block";
        kel.split("").forEach(function (ch) { var h = document.createElement("span"); h.className = "h"; h.textContent = ch; k.appendChild(h); });
        parca.appendChild(k);
      });
      sp.replaceChild(parca, d);
    });
  });
  // fareyle üstüne gelinen harf zıplar
  if (fareli) document.querySelectorAll(".harfli .h").forEach(function (h) {
    h.addEventListener("pointerenter", function () {
      if (G.isTweening(h)) return;
      G.fromTo(h, { yPercent: 0, rotate: 0 }, { yPercent: -16, rotate: (Math.random() - .5) * 16, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 });
    });
  });

  // ---------------------------------------------------------------- açılış
  function girisAnimasyonu() {
    kok.classList.add("hazir");
    G.from(".harfli .h", { yPercent: 120, rotate: 10, duration: 1.2, ease: "expo.out", stagger: 0.028 });
    G.from(".harfli em", { yPercent: 60, opacity: 0, duration: 1.2, ease: "expo.out", delay: 0.35 });
    G.from(".kahraman .tanim > *, .meta-serit > div, .oy-ust, .oy-manset, .oy-meta > div", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.05, delay: 0.35 });
  }
  // güvenlik: sekme arka plandaysa (animasyon karesi gelmez) ya da bir şey takılırsa perde en geç 4 sn'de kalkar
  if (yuk) setTimeout(function () {
    if (!yuk || !yuk.parentNode) return;
    yuk.remove(); kok.classList.add("hazir");
    G.set(".harfli .h, .harfli em, .kahraman .tanim > *, .meta-serit > div", { clearProps: "all" });
  }, 4000);
  if (yuk && document.hidden) { yuk.remove(); yuk = null; }
  if (yuk) {
    var sayac = yuk.querySelector(".sayac b"), cubuk = yuk.querySelector(".cubuk i"), o = { v: 0 };
    // açılışta terminal kayıtları: oyunlar tek tek "derlenir"
    var log = yuk.querySelector(".yuk-log"), KAYIT = [[2, "$ ./codingbytalha --start"], [18, "› usta            <span class=\"ok\">✓</span>"], [38, "› hakim-bey       <span class=\"ok\">✓</span>"], [58, "› acili-mi-olsun  <span class=\"ok\">✓</span>"], [78, "› harput-kisi     <span class=\"ok\">✓</span>"], [96, "<span class=\"ok\">ready.</span>"]], ks = 0;
    function logYaz(v) { if (!log) return; while (ks < KAYIT.length && v >= KAYIT[ks][0]) { log.innerHTML += (ks ? "\n" : "") + KAYIT[ks][1]; ks++; } }
    var yuklendi = false;            // yazı tipleri gelince (en çok ~2,5 sn beklenir; resimler beklenmez)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { yuklendi = true; }); else yuklendi = true;
    G.to(o, {
      v: 100, duration: 1.6, ease: "power2.inOut",
      onUpdate: function () { sayac.textContent = String(Math.round(o.v)).padStart(3, "0"); cubuk.style.width = o.v + "%"; logYaz(o.v); },
      onComplete: function bitir() {
        if (!yuklendi && performance.now() < 2500) { setTimeout(bitir, 100); return; }
        G.to(yuk, { yPercent: -100, duration: 1.05, ease: "expo.inOut", onComplete: function () { yuk.remove(); } });
        G.delayedCall(0.45, girisAnimasyonu);
      }
    });
  } else {
    girisAnimasyonu();
  }

  // ---------------------------------------------------------------- imleç
  if (fareli) {
    kok.classList.add("imlecli");
    var nok = document.createElement("div"), hal = document.createElement("div");
    nok.className = "imlec"; hal.className = "imlec-halka"; hal.innerHTML = "<span></span>";
    document.body.appendChild(nok); document.body.appendChild(hal);
    var mx = innerWidth / 2, my = innerHeight / 2, hx = mx, hy = my;
    window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; G.set(nok, { x: mx, y: my }); }, { passive: true });
    G.ticker.add(function () { hx += (mx - hx) * 0.18; hy += (my - hy) * 0.18; G.set(hal, { x: hx, y: hy }); });
    document.addEventListener("pointerover", function (e) {
      var is = e.target.closest("[data-imlec]");
      var link = e.target.closest("a, button");
      hal.classList.toggle("buyuk", !!is);
      hal.classList.toggle("link", !is && !!link);
      if (is) hal.querySelector("span").textContent = is.getAttribute("data-imlec-" + dil) || is.getAttribute("data-imlec");
    });
  }

  // ---------------------------------------------------------------- işler: süzülen oyun kartı (perdeyle değişir, hızla eğilir)
  var suzen = document.querySelector(".suzen");
  if (suzen && fareli) {
    var sx = innerWidth / 2, sy = innerHeight / 2, rx = sx, ry = sy, onX = sx, kartlar = suzen.querySelectorAll(".sk"), aktif = -1;
    window.addEventListener("pointermove", function (e) { sx = e.clientX; sy = e.clientY; }, { passive: true });
    G.ticker.add(function () {
      rx += (sx - rx) * 0.11; ry += (sy - ry) * 0.11;
      var hiz = sx - onX; onX += (sx - onX) * 0.2;
      G.set(suzen, { x: rx + 40, y: ry - 220, rotateZ: G.utils.clamp(-10, 10, (sx - rx) * 0.05), rotateY: G.utils.clamp(-18, 18, hiz * 0.08), transformPerspective: 900 });
    });
    function goster(i) {
      if (i === aktif) return;
      var eski = aktif; aktif = i;
      kartlar.forEach(function (k, j) {
        G.killTweensOf(k);
        if (j === i) {
          G.set(k, { zIndex: 2 });
          G.fromTo(k, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "expo.out" });
          G.fromTo(k.querySelector(".sk-resim img"), { scale: 1.35, yPercent: 8 }, { scale: 1.12, yPercent: 0, duration: 0.9, ease: "expo.out" });
          G.fromTo(k.querySelectorAll(".sk-alt > *"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: "power3.out", delay: 0.12 });
        } else if (j === eski) {
          G.set(k, { zIndex: 1 });
          G.to(k, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.55, ease: "expo.inOut" });
        } else G.set(k, { zIndex: 0, clipPath: "inset(100% 0% 0% 0%)" });
      });
    }
    document.querySelectorAll(".is").forEach(function (is, i) {
      is.addEventListener("pointerenter", function () { goster(i); G.to(suzen, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }); });
      is.addEventListener("pointerleave", function (e) {
        if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".is")) return;
        G.to(suzen, { opacity: 0, scale: 0.85, duration: 0.35, ease: "power3.out", onComplete: function () { aktif = -1; } });
      });
    });
    window.addEventListener("scroll", function () {
      var ust = document.elementFromPoint(sx, sy);
      if (!ust || !ust.closest(".is")) G.to(suzen, { opacity: 0, scale: 0.85, duration: 0.25, overwrite: "auto", onComplete: function () { aktif = -1; } });
    }, { passive: true });
  }

  // ---------------------------------------------------------------- mıknatıs düğme
  document.querySelectorAll(".miknatis").forEach(function (m) {
    if (!fareli) return;
    m.addEventListener("pointermove", function (e) {
      var r = m.getBoundingClientRect();
      G.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.6, ease: "power3.out" });
    });
    m.addEventListener("pointerleave", function () { G.to(m, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, .35)" }); });
  });

  // ---------------------------------------------------------------- kaydırma: yanan manifesto
  document.querySelectorAll(".manifesto").forEach(function (m) {
    var kelimeler = [];
    m.querySelectorAll("[data-l]").forEach(function (blok) {
      var parcalar = [];
      blok.childNodes.forEach(function (d) {
        if (d.nodeType === 3) {
          d.textContent.split(/(\s+)/).forEach(function (s) { if (s.trim()) { var sp = document.createElement("span"); sp.className = "k"; sp.textContent = s; parcalar.push(sp); } else if (s) parcalar.push(document.createTextNode(s)); });
        } else { d.classList.add("k"); parcalar.push(d); }
      });
      blok.textContent = "";
      parcalar.forEach(function (p) { blok.appendChild(p); });
    });
    ST.create({
      trigger: m, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: function (s) {
        var hepsi = m.querySelectorAll("[data-l]:not([style*='none']) .k");
        var gorunen = Array.prototype.filter.call(m.querySelectorAll(".k"), function (k) { return k.offsetParent !== null; });
        var sinir = Math.round(s.progress * gorunen.length);
        gorunen.forEach(function (k, i) { k.classList.toggle("yandi", i < sinir); });
      }
    });
  });

  // ---------------------------------------------------------------- sayılar
  document.querySelectorAll("[data-say]").forEach(function (b) {
    var hedef = parseFloat(b.getAttribute("data-say")), o2 = { v: 0 };
    ST.create({ trigger: b, start: "top 88%", once: true, onEnter: function () {
      G.to(o2, { v: hedef, duration: 2, ease: "power3.out", onUpdate: function () { b.textContent = Math.round(o2.v); } });
    } });
  });

  // ---------------------------------------------------------------- genel görünmeler
  G.utils.toArray("[data-gor]").forEach(function (el) {
    G.from(el, { y: 50, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  G.utils.toArray(".is, .ozellik-liste .o, .disiplin > div, .terminal li").forEach(function (el) {
    G.from(el, { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 94%" } });
  });
  G.utils.toArray(".bolum-bas h2, .iletisim h2, .sonraki h2").forEach(function (el) {
    G.from(el, { yPercent: 30, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  // oyun sayfası: büyük görsel kaydırınca yavaşça kayar
  G.utils.toArray(".oy-gorsel img").forEach(function (img) {
    G.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });
  G.utils.toArray(".video-cerceve").forEach(function (v) {
    G.fromTo(v, { scale: 0.88, borderRadius: 24 }, { scale: 1, borderRadius: 8, ease: "none", scrollTrigger: { trigger: v, start: "top bottom", end: "center center", scrub: true } });
  });
  // kahraman kaydırınca kararır
  var kh = document.querySelector(".kahraman");
  if (kh) G.to("#arazi", { opacity: 0.15, ease: "none", scrollTrigger: { trigger: kh, start: "top top", end: "bottom top", scrub: true } });
  // ---------------------------------------------------------------- arka plan ışıkları: bölümün renklerine döner
  function isik(a, b, c) { kok.style.setProperty("--isik1", a); kok.style.setProperty("--isik2", b); kok.style.setProperty("--isik3", c || a); }
  var oyunSayfasi = !!document.querySelector(".oy-kahraman");
  if (!oyunSayfasi) {
    [[".kahraman", "var(--r1)", "var(--r2)", "var(--r4)"], ["#isler", "var(--r2)", "var(--r3)", "var(--r1)"], ["#gunluk", "var(--r4)", "var(--r2)", "var(--r4)"],
     [".disiplin", "var(--r3)", "var(--r1)", "var(--r2)"], [".iletisim", "var(--r3)", "var(--r1)", "var(--r2)"]].forEach(function (b) {
      var el = document.querySelector(b[0]);
      if (el) ST.create({ trigger: el, start: "top 60%", end: "bottom 40%", onEnter: function () { isik(b[1], b[2], b[3]); }, onEnterBack: function () { isik(b[1], b[2], b[3]); } });
    });
  }

  // ---------------------------------------------------------------- oyun listesi: oyunun rengi bölüme yayılır
  var isler = document.getElementById("isler");
  document.querySelectorAll(".is").forEach(function (is) {
    is.addEventListener("pointerenter", function () { isler.style.setProperty("--boya", is.dataset.renk); isler.classList.add("boyali"); isik(is.dataset.renk, is.dataset.renk, "var(--r2)"); });
    is.addEventListener("pointerleave", function () { isler.classList.remove("boyali"); });
  });

  // ---------------------------------------------------------------- vitrin: kaydırınca yana kayan paneller
  var vitrin = document.querySelector(".vitrin"), yol = document.querySelector(".vitrin-yol");
  if (vitrin && yol && window.matchMedia("(min-width: 861px)").matches) {
    var paneller = yol.querySelectorAll(".panel");
    var mesafe = function () { return Math.max(0, yol.scrollWidth - innerWidth); };
    var kay = G.to(yol, { x: function () { return -mesafe(); }, ease: "none",
      scrollTrigger: { trigger: vitrin, start: "top top", end: function () { return "+=" + mesafe(); }, pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: function (st) { var i = Math.round(st.progress * (paneller.length - 1)); var p = paneller[i]; if (p) isik(p.dataset.renk, p.dataset.renk2, p.dataset.renk); } } });
    paneller.forEach(function (p) {
      var img = p.querySelector(".gorsel img"), h3 = p.querySelector("h3");
      G.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: p, containerAnimation: kay, start: "left right", end: "right left", scrub: true } });
      G.from(h3, { yPercent: 60, opacity: 0, ease: "power3.out", scrollTrigger: { trigger: p, containerAnimation: kay, start: "left 75%", end: "left 35%", scrub: true } });
      G.from(p.querySelector(".gorsel"), { rotate: 12, scale: .8, ease: "power3.out", scrollTrigger: { trigger: p, containerAnimation: kay, start: "left 95%", end: "left 30%", scrub: true } });
    });
  } else if (vitrin) {
    G.utils.toArray(".panel").forEach(function (p) {
      G.from(p, { y: 60, scale: .94, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: p, start: "top 90%" } });
    });
  }

  // ---------------------------------------------------------------- resim perdesi: kaydırınca alttan açılır
  G.utils.toArray(".kucuk-resim, .galeri button, .oy-gorsel").forEach(function (el, i) {
    G.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 92%" } });
  });

  // ---------------------------------------------------------------- karışık harflerden çözülen yazılar
  var HARF = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ0123456789#$%&*<>/";
  function karistir(el) {
    if (el.dataset.k) return; el.dataset.k = "1";
    var son = el.textContent, uz = son.length, o3 = { p: 0 };
    G.to(o3, { p: 1, duration: Math.min(1.6, 0.4 + uz * 0.012), ease: "none", onUpdate: function () {
      var n = Math.floor(o3.p * uz), s2 = son.slice(0, n);
      for (var i = n; i < uz; i++) s2 += son[i] === " " ? " " : HARF[Math.floor(Math.random() * HARF.length)];
      el.textContent = s2;
    }, onComplete: function () { el.textContent = son; } });
  }
  G.utils.toArray(".bolum-bas .mono, .meta-serit .mono, .oy-meta .mono, .terminal .msg span[data-l], .panel .no").forEach(function (el) {
    if (el.children.length) {   // içinde iki dilli parçalar varsa yalnız yaprak parçaları karıştır
      el.querySelectorAll("[data-l]").forEach(function (c) { ST.create({ trigger: el, start: "top 92%", once: true, onEnter: function () { if (c.offsetParent) karistir(c); } }); });
      return;
    }
    ST.create({ trigger: el, start: "top 92%", once: true, onEnter: function () { karistir(el); } });
  });

  window.addEventListener("load", function () { ST.refresh(); });
})();
