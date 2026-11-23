/* NOVA premium interactions: accessible scroll progress and procedural 3D tooth. */
(() => {
  const progress = document.getElementById("nova-scroll-progress-bar");
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  const canvas = document.getElementById("nova-tooth-canvas");
  const stage = document.getElementById("nova-tooth-stage");
  if (!canvas || !stage) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stage.classList.add("motion-reduced");
  }

  import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js")
    .then((THREE) => {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
      renderer.setSize(stage.clientWidth, stage.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, stage.clientWidth / stage.clientHeight, 0.1, 100);
      camera.position.set(0, 0.15, 8.4);

      scene.add(new THREE.HemisphereLight(0xfff8e9, 0x778b7c, 2.1));
      const key = new THREE.DirectionalLight(0xfff1d5, 3.3);
      key.position.set(-4, 5, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(0xc7d9d0, 2.4);
      rim.position.set(4, 1, -4); scene.add(rim);
      const warm = new THREE.PointLight(0xd7b77d, 28, 10);
      warm.position.set(2.8, -2.5, 3); scene.add(warm);

      const tooth = new THREE.Group();
      scene.add(tooth);

      const enamel = new THREE.MeshPhysicalMaterial({
        color: 0xf5efdf, roughness: 0.2, metalness: 0.02,
        clearcoat: 0.85, clearcoatRoughness: 0.16,
        sheen: 0.32, sheenColor: 0xd6c7a7
      });
      const rootMat = new THREE.MeshPhysicalMaterial({
        color: 0xe7dfcd, roughness: 0.28, clearcoat: 0.55
      });
      const crownProfile = [
        new THREE.Vector2(0.02, 1.48), new THREE.Vector2(0.28, 1.5),
        new THREE.Vector2(0.53, 1.39), new THREE.Vector2(0.73, 1.17),
        new THREE.Vector2(0.81, 0.86), new THREE.Vector2(0.78, 0.55),
        new THREE.Vector2(0.66, 0.29), new THREE.Vector2(0.47, 0.1),
        new THREE.Vector2(0.25, 0.03), new THREE.Vector2(0.02, 0.02)
      ];
      const crownGeo = new THREE.LatheGeometry(crownProfile, 72);
      crownGeo.computeVertexNormals();
      const crown = new THREE.Mesh(crownGeo, enamel);
      crown.position.y = 0.15;
      crown.scale.set(1.12, 0.9, 0.94);
      tooth.add(crown);

      function makeRoot(points, radiusStart) {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
        const tubularSegments = 48, radialSegments = 18;
        const frames = curve.computeFrenetFrames(tubularSegments, false);
        const vertices = [], indices = [];
        for (let i = 0; i <= tubularSegments; i++) {
          const t = i / tubularSegments;
          const point = curve.getPointAt(t);
          const radius = Math.max(0.008, radiusStart * Math.pow(1 - t, 0.82));
          for (let j = 0; j <= radialSegments; j++) {
            const angle = j / radialSegments * Math.PI * 2;
            const normal = frames.normals[i].clone().multiplyScalar(Math.cos(angle));
            const binormal = frames.binormals[i].clone().multiplyScalar(Math.sin(angle));
            const vertex = point.clone().addScaledVector(normal, radius).addScaledVector(binormal, radius);
            vertices.push(vertex.x, vertex.y, vertex.z);
          }
        }
        for (let i = 0; i < tubularSegments; i++) {
          for (let j = 0; j < radialSegments; j++) {
            const a = i * (radialSegments + 1) + j;
            const b = a + radialSegments + 1;
            indices.push(a, b, a + 1, b, b + 1, a + 1);
          }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices); geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, rootMat);
        tooth.add(mesh);
        return mesh;
      }
      makeRoot([[0.0,0.36,0],[0.02,0.02,0.02],[0.13,-0.42,0.04],[0.22,-0.92,0.08],[0.24,-1.42,0.12]],0.23,0.01);
      makeRoot([[-0.08,0.34,0.01],[-0.17,0.0,-0.02],[-0.27,-0.43,-0.04],[-0.36,-0.9,-0.06],[-0.39,-1.35,-0.1]],0.22,0.01);
      // A subtle enamel seam makes the crown read as a sculpted, dimensional object.
      const seam = new THREE.Mesh(
        new THREE.TorusGeometry(0.67, 0.012, 8, 96),
        new THREE.MeshStandardMaterial({ color: 0xc6a56b, metalness: 0.62, roughness: 0.35 })
      );
      seam.rotation.x = Math.PI / 2;
      seam.position.y = 0.49;
      tooth.add(seam);

      const gold = new THREE.MeshStandardMaterial({ color: 0xc6a56b, metalness: 0.78, roughness: 0.24 });
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.008, 8, 160), gold);
      orbit.rotation.set(1.16, 0.2, -0.35);
      orbit.position.y = 0.05;
      tooth.add(orbit);

      // Fine, restrained particles add depth without visual noise.
      const particleCount = 100;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const r = 2.2 + Math.random() * 1.3;
        const a = Math.random() * Math.PI * 2;
        positions[i*3] = Math.cos(a) * r;
        positions[i*3+1] = (Math.random() - .5) * 4.8;
        positions[i*3+2] = (Math.random() - .5) * 2.4;
      }
      const particlesGeo = new THREE.BufferGeometry();
      particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({
        color: 0xb89c6c, size: 0.018, transparent: true, opacity: 0.6
      }));
      scene.add(particles);

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      stage.addEventListener("pointermove", (event) => {
        const rect = stage.getBoundingClientRect();
        pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;
        pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 0.28;
      }, { passive: true });
      stage.addEventListener("pointerleave", () => { pointer.tx = 0; pointer.ty = 0; }, { passive: true });

      let raf = 0;
      let inView = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      function render() {
        const elapsed = clock.getElapsedTime();
        pointer.x += (pointer.tx - pointer.x) * 0.035;
        pointer.y += (pointer.ty - pointer.y) * 0.035;
        if (!reduced) {
          tooth.rotation.y = Math.sin(elapsed * 0.32) * 0.18 + pointer.x;
          tooth.rotation.x = Math.sin(elapsed * 0.25) * 0.035 + pointer.y;
          tooth.position.y = Math.sin(elapsed * 0.55) * 0.055;
          orbit.rotation.z = elapsed * 0.08;
          particles.rotation.y = elapsed * 0.012;
        }
        renderer.render(scene, camera);
        if (!reduced && inView && !document.hidden) raf = requestAnimationFrame(render);
      }
      render();
      const visibilityObserver = new IntersectionObserver((entries) => {
        inView = entries.some(entry => entry.isIntersecting);
        if (inView && !document.hidden && !reduced && !raf) raf = requestAnimationFrame(render);
        if (!inView || document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      }, { threshold: 0.05 });
      visibilityObserver.observe(stage);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
        else if (inView && !reduced && !raf) raf = requestAnimationFrame(render);
      });
      stage.classList.add("is-3d-ready");
      document.documentElement.classList.add("nova-3d-ready");

      const resize = () => {
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, stage.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        if (reduced) renderer.render(scene, camera);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(stage);
      window.addEventListener("pagehide", () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
        visibilityObserver.disconnect();
        renderer.dispose();
        crownGeo.dispose();
      }, { once: true });
    })
    .catch(() => {
      // Keep the original photographic hero visible if WebGL or the CDN is unavailable.
      stage.classList.add("is-3d-unavailable");
    });
})();
