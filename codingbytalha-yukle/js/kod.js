// Kod yazdırma: satırları renklendirip harf harf yazar. Ana sayfadaki dizüstü ekranı (giris.js) ve sayfa arasındaki kod
// pencereleri (.kod-blok) bunu kullanır. Kod pencereleri görününce bir kez yazılır.
(function () {
  var ANAHTAR = /^(func|var|const|let|if|else|elif|while|for|in|return|and|or|not|class|extends|function|true|false|null|new|static)$/;
  function kacir(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function parcala(satir) {
    var p = [], re = /(#.*$|\/\/.*$)|("[^"]*"?|'[^']*'?|`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_çğıöşüÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ]*)|(\s+)|(.)/g, m;
    satir = satir.replace(/\t/g, "    ");
    while ((m = re.exec(satir))) {
      if (m[1]) p.push(["tk-y", m[1]]); else if (m[2]) p.push(["tk-s", m[2]]); else if (m[3]) p.push(["tk-n", m[3]]);
      else if (m[4]) { var sonra = satir.charAt(re.lastIndex); p.push([ANAHTAR.test(m[4]) ? "tk-k" : (sonra === "(" ? "tk-f" : (/^[A-Z]/.test(m[4]) ? "tk-t" : "")), m[4]]); }
      else p.push(["", m[5] || m[6]]);
    }
    return p;
  }
  function ciz(parcalar, n) { var o = "", k = 0; for (var i = 0; i < parcalar.length && k < n; i++) { var t = parcalar[i][1].slice(0, n - k); k += t.length; o += parcalar[i][0] ? '<span class="' + parcalar[i][0] + '">' + kacir(t) + "</span>" : kacir(t); } return o; }
  function bekle(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // pre içine satırları yazar. o: { hiz, pencere (görünen en çok satır), no (satır numarası öğesi), ilkNo, devam (önceki satırlar), dur() }
  async function yaz(pre, satirlar, o) {
    o = o || {};
    var bitti = o.devam || [], ilk = o.ilkNo || 1, pen = o.pencere || 999, hiz = o.hiz || 1;
    for (var i = 0; i < satirlar.length; i++) {
      var p = parcala(satirlar[i]), uz = p.reduce(function (a, b) { return a + b[1].length; }, 0);
      for (var n = 0; n <= uz; n += hiz) {
        if (o.dur) while (o.dur()) await bekle(250);
        var gor = bitti.slice(-(pen - 1));
        pre.innerHTML = gor.join("\n") + (gor.length ? "\n" : "") + ciz(p, n) + '<span class="imlec"></span>';
        if (o.no) { var bas = ilk + bitti.length - gor.length; o.no.textContent = Array.from({ length: gor.length + 1 }, function (_, k) { return bas + k; }).join("\n"); }
        await bekle(14 + Math.random() * 26);
      }
      bitti.push(ciz(p, 1e9));
      await bekle(satirlar[i].trim() ? 50 : 20);
    }
    return bitti;
  }
  window.Kod = { parcala: parcala, ciz: ciz, yaz: yaz };

  // sayfa arasındaki kod pencereleri: görününce yazılır
  var az = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".kod-blok").forEach(function (b) {
    var pre = b.querySelector("pre"), no = b.querySelector(".kb-no"), satirlar = JSON.parse(b.dataset.satirlar || "[]");
    if (az || !("IntersectionObserver" in window)) { pre.innerHTML = satirlar.map(function (s) { return ciz(parcala(s), 1e9); }).join("\n"); no.textContent = satirlar.map(function (_, i) { return i + 1; }).join("\n"); return; }
    var io = new IntersectionObserver(function (l) { if (l[0].isIntersecting) { io.disconnect(); b.classList.add("yaziliyor"); yaz(pre, satirlar, { no: no, hiz: 1 }).then(function () { b.classList.remove("yaziliyor"); b.classList.add("bitti"); }); } }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(b);
  });
})();
