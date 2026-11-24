// USTA sayfası: oyundaki DK210 ekskavatörünün gerçek 3B modeli (model/dk210.glb). Görününce yüklenir; sürükleyerek döndürülür,
// kendi kendine yavaşça döner, üst gövde sağa sola salınır. three.js r128 + GLTFLoader (vendor/).
(function () {
  var kutu = document.querySelector(".model3b");
  if (!kutu || !window.THREE || !THREE.GLTFLoader) return;
  var tuval = kutu.querySelector("canvas"), yazi = kutu.querySelector(".model-durum");
  var basladi = false;
  function basla() {
    if (basladi) return; basladi = true;
    var r = new THREE.WebGLRenderer({ canvas: tuval, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    var sahne = new THREE.Scene();
    var kam = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    sahne.add(new THREE.HemisphereLight(0xfff1d6, 0x241a12, 0.9));
    var gun = new THREE.DirectionalLight(0xffe2b0, 2.2); gun.position.set(8, 12, 6); gun.castShadow = true;
    gun.shadow.mapSize.set(2048, 2048); gun.shadow.camera.left = -8; gun.shadow.camera.right = 8; gun.shadow.camera.top = 8; gun.shadow.camera.bottom = -8;
    sahne.add(gun);
    var arka = new THREE.DirectionalLight(0x8f7cff, 1.1); arka.position.set(-8, 5, -8); sahne.add(arka);
    var zemin = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.45 }));
    zemin.rotation.x = -Math.PI / 2; zemin.receiveShadow = true; sahne.add(zemin);
    var halka = new THREE.Mesh(new THREE.RingGeometry(6.2, 6.26, 128), new THREE.MeshBasicMaterial({ color: 0xf5b32e, transparent: true, opacity: 0.5 }));
    halka.rotation.x = -Math.PI / 2; halka.position.y = 0.01; sahne.add(halka);
    var kok = new THREE.Group(); sahne.add(kok);
    var ust = null, aci = 0.6, hedefAci = 0.6, surukle = null, otoDon = true;
    function boy() { var w = tuval.clientWidth, h = tuval.clientHeight; r.setSize(w, h, false); kam.aspect = w / h; kam.updateProjectionMatrix(); }
    window.addEventListener("resize", boy); boy();
    new THREE.GLTFLoader().load(tuval.dataset.model, function (g) {
      var m = g.scene;
      m.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } if (o.name === "upper") ust = o; });
      var kutuB = new THREE.Box3().setFromObject(m), boyut = kutuB.getSize(new THREE.Vector3()), merkez = kutuB.getCenter(new THREE.Vector3());
      var olcek = 9 / Math.max(boyut.x, boyut.z);
      m.scale.setScalar(olcek);
      m.position.set(-merkez.x * olcek, -kutuB.min.y * olcek, -merkez.z * olcek);
      kok.add(m);
      yazi.textContent = ""; kutu.classList.add("yuklendi");
    }, function (e) { if (e.total) yazi.textContent = Math.round(e.loaded / e.total * 100) + "%"; },
    function () { yazi.textContent = "—"; });
    tuval.addEventListener("pointerdown", function (e) { surukle = { x: e.clientX, a: hedefAci }; otoDon = false; tuval.setPointerCapture(e.pointerId); });
    tuval.addEventListener("pointermove", function (e) { if (surukle) hedefAci = surukle.a + (e.clientX - surukle.x) * 0.01; });
    tuval.addEventListener("pointerup", function () { surukle = null; setTimeout(function () { otoDon = true; }, 2500); });
    var gorunur = true;
    new IntersectionObserver(function (l) { gorunur = l[0].isIntersecting; }).observe(tuval);
    var t0 = performance.now();
    (function kare(now) {
      requestAnimationFrame(kare);
      if (!gorunur) return;
      var t = (now - t0) / 1000;
      if (otoDon) hedefAci += 0.0035;
      aci += (hedefAci - aci) * 0.08;
      kok.rotation.y = aci;
      if (ust) ust.rotation.y = Math.sin(t * 0.6) * 0.45;
      var R = tuval.clientWidth < tuval.clientHeight ? 26 : 20;
      kam.position.set(Math.sin(0.5) * R, 6.8 + Math.sin(t * 0.3) * 0.3, Math.cos(0.5) * R);
      kam.lookAt(0, 2.9, 0);
      halka.material.opacity = 0.35 + Math.sin(t * 2) * 0.15;
      r.render(sahne, kam);
    })(t0);
  }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (l, o) { if (l[0].isIntersecting) { basla(); o.disconnect(); } }, { rootMargin: "300px" }).observe(kutu);
  else basla();
})();
