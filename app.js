/* ==========================================================================
   OUR STORY • INTERACTIVE JAVASCRIPT ENGINE
   - Passcode Gate Protection (PIN: 2431)
   - Background Song: "Heartbeat in Your Name" (MP4, strictly at 50% volume)
   - Three.js 3D Floating Hearts & Ambient Dust
   - Tap/Click Floating Heart Gestures
   - 3D Tilt Card Physics & Adaptive Photo Lightbox
   - Live Journey Momentum Counter
   ========================================================================== */

(function () {
  'use strict';

  const SECRET_PIN = '2431';
  let currentPin = '';

  // DOM Elements
  const lockScreen = document.getElementById('lock-screen');
  const mainContent = document.getElementById('main-content');
  const pinDots = document.querySelectorAll('.pin-dot');
  const pinDisplay = document.getElementById('pin-display');
  const lockMsg = document.getElementById('lock-msg');
  const keypad = document.getElementById('keypad');
  const hintBtn = document.getElementById('hint-btn');
  const hintText = document.getElementById('hint-text');
  const lockBtn = document.getElementById('lock-btn');
  const reLockBtn = document.getElementById('re-lock-btn');
  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const musicText = document.getElementById('music-text');
  const bgMusic = document.getElementById('bg-music');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  /* ==========================================================================
     1. PASSCODE GATE LOGIC
     ========================================================================== */
  function updatePinDisplay() {
    pinDots.forEach((dot, index) => {
      if (index < currentPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function handleKeyInput(val) {
    if (val === 'clear') {
      currentPin = '';
      lockMsg.textContent = '';
      updatePinDisplay();
      return;
    }

    if (val === 'backspace') {
      currentPin = currentPin.slice(0, -1);
      lockMsg.textContent = '';
      updatePinDisplay();
      return;
    }

    if (currentPin.length < 4 && /^[0-9]$/.test(val)) {
      currentPin += val;
      updatePinDisplay();

      if (currentPin.length === 4) {
        verifyPin();
      }
    }
  }

  function verifyPin() {
    if (currentPin === SECRET_PIN) {
      lockMsg.style.color = '#34d399';
      lockMsg.textContent = 'Welcome, Sushma... ♥';

      setTimeout(() => {
        unlockWebsite();
      }, 500);
    } else {
      pinDisplay.classList.add('shake');
      lockMsg.style.color = '#fb7185';
      lockMsg.textContent = 'A different memory. Try again.';

      setTimeout(() => {
        pinDisplay.classList.remove('shake');
        currentPin = '';
        updatePinDisplay();
      }, 750);
    }
  }

  function unlockWebsite() {
    lockScreen.classList.add('unlocked');
    mainContent.classList.remove('hidden-content');
    sessionStorage.setItem('our_story_unlocked', 'true');
    initThreeBackground();
    startJourneyCounter();
    initTiltCards();

    // Start background song: Heartbeat in Your Name at 50% volume
    startBackgroundMusic();
  }

  function lockWebsite() {
    sessionStorage.removeItem('our_story_unlocked');
    currentPin = '';
    updatePinDisplay();
    lockMsg.textContent = '';
    mainContent.classList.add('hidden-content');
    lockScreen.classList.remove('unlocked');
    pauseBackgroundMusic();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Keypad Click Event
  keypad.addEventListener('click', (e) => {
    const btn = e.target.closest('.key-btn');
    if (!btn) return;
    const key = btn.getAttribute('data-key');
    handleKeyInput(key);
  });

  // Physical Keyboard Support
  window.addEventListener('keydown', (e) => {
    if (!lockScreen.classList.contains('unlocked')) {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyInput(e.key);
      } else if (e.key === 'Backspace') {
        handleKeyInput('backspace');
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleKeyInput('clear');
      }
    } else {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    }
  });

  // Hint Toggle
  hintBtn.addEventListener('click', () => {
    hintText.classList.toggle('hidden');
  });

  // Lock buttons
  if (lockBtn) lockBtn.addEventListener('click', lockWebsite);
  if (reLockBtn) reLockBtn.addEventListener('click', lockWebsite);

  // Always start securely at the lock screen
  sessionStorage.removeItem('our_story_unlocked');

  /* ==========================================================================
     2. BACKGROUND MUSIC: "Heartbeat in Your Name" (50% Volume)
     ========================================================================== */
  function startBackgroundMusic() {
    if (!bgMusic) return;
    try {
      bgMusic.volume = 0.5; // strictly 50% volume as requested
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            musicToggle.classList.add('playing');
            musicIcon.textContent = '⏸';
            musicText.textContent = 'Heartbeat in Your Name';
          })
          .catch((err) => {
            console.log('Autoplay was prevented by browser policy; user can tap toggle button', err);
            musicToggle.classList.remove('playing');
            musicIcon.textContent = '▶️';
            musicText.textContent = 'Play Song';
          });
      }
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  function pauseBackgroundMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    musicToggle.classList.remove('playing');
    musicIcon.textContent = '🎵';
    musicText.textContent = 'Play Song';
  }

  function toggleBackgroundMusic() {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      startBackgroundMusic();
    } else {
      pauseBackgroundMusic();
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', toggleBackgroundMusic);
  }

  /* ==========================================================================
     3. INTERACTIVE TAP / CLICK FLOATING HEART BURSTS
     ========================================================================== */
  const HEART_CHARS = ['♥', '💖', '✨', '🌸', '💕'];

  function triggerHeartBurst(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart-burst';
      heart.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];

      const angle = (Math.random() * Math.PI * 2);
      const distance = 40 + Math.random() * 90;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance + 50; // drift upward
      const rot = (Math.random() - 0.5) * 80;
      const size = 0.9 + Math.random() * 1.2;

      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.fontSize = `${size}rem`;
      heart.style.setProperty('--dx', `${dx}px`);
      heart.style.setProperty('--dy', `${dy}px`);
      heart.style.setProperty('--rot', `${rot}deg`);

      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1200);
    }
  }

  window.addEventListener('pointerdown', (e) => {
    // Absolutely NO animation while on the lock page
    if (lockScreen && !lockScreen.classList.contains('unlocked')) return;
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
    triggerHeartBurst(e.clientX, e.clientY, 7);
  });

  /* ==========================================================================
     4. THREE.JS 3D BACKGROUND (FLOATING HEARTS & AMBIENT STARDUST)
     ========================================================================== */
  let threeInitialized = false;

  function initThreeBackground() {
    if (threeInitialized || typeof THREE === 'undefined') return;
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    threeInitialized = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffb6c1, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(15, 30, 20);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xf43f5e, 1.2, 60);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    // Heart 2D Shape to Extrude
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.35, y, x - 0.35, y + 0.35, x - 0.35, y + 0.35);
    shape.bezierCurveTo(x - 0.35, y + 0.6, x - 0.1, y + 0.85, x + 0.25, y + 1.05);
    shape.bezierCurveTo(x + 0.6, y + 0.85, x + 0.85, y + 0.6, x + 0.85, y + 0.35);
    shape.bezierCurveTo(x + 0.85, y + 0.35, x + 0.85, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };

    const heartGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    heartGeometry.center();

    // Heart Color Materials
    const heartColors = [0xf43f5e, 0xfb7185, 0xfda4af, 0xfde047, 0xff70a6];
    const materials = heartColors.map(c => new THREE.MeshPhongMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.2,
      specular: 0xffffff,
      shininess: 40,
      transparent: true,
      opacity: 0.75
    }));

    // Spawn 3D Floating Hearts
    const hearts = [];
    const heartCount = window.innerWidth < 768 ? 20 : 38;

    for (let i = 0; i < heartCount; i++) {
      const mat = materials[Math.floor(Math.random() * materials.length)];
      const mesh = new THREE.Mesh(heartGeometry, mat);

      const scale = 0.5 + Math.random() * 1.3;
      mesh.scale.set(scale, scale, scale);

      mesh.position.set(
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 25
      );

      mesh.rotation.x = Math.PI; // Heart orientation
      mesh.rotation.z = (Math.random() - 0.5) * 0.8;

      mesh.userData = {
        speedY: 0.02 + Math.random() * 0.035,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.02
      };

      scene.add(mesh);
      hearts.push(mesh);
    }

    // Stardust Sparkles Particles
    const starCount = 120;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 60;
      starPos[i + 1] = (Math.random() - 0.5) * 60;
      starPos[i + 2] = (Math.random() - 0.5) * 35;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffe4e6,
      size: 0.35,
      transparent: true,
      opacity: 0.6
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Mouse / Cursor Tracking for Parallax
    let targetX = 0;
    let targetY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 4;
      targetY = (e.clientY / window.innerHeight - 0.5) * 4;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 3;
        targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 3;
      }
    }, { passive: true });

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Soft camera sway
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      // Animate Hearts
      hearts.forEach(h => {
        h.position.y += h.userData.speedY;
        h.userData.wobble += h.userData.wobbleSpeed;
        h.position.x += Math.sin(h.userData.wobble) * 0.015;

        h.rotation.y += h.userData.rotSpeedY;
        h.rotation.x += h.userData.rotSpeedX;

        // Reset if drifted too high
        if (h.position.y > 25) {
          h.position.y = -22;
          h.position.x = (Math.random() - 0.5) * 45;
        }
      });

      // Subtle star spin
      starField.rotation.y += 0.0006;

      renderer.render(scene, camera);
    }

    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ==========================================================================
     5. 3D TILT EFFECT ON CARDS
     ========================================================================== */
  function initTiltCards() {
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  /* ==========================================================================
     6. LIVE TIME COUNTER
     ========================================================================== */
  function startJourneyCounter() {
    const startDate = new Date('2022-11-10T10:00:00');

    const daysEl = document.getElementById('count-days');
    const hoursEl = document.getElementById('count-hours');
    const minsEl = document.getElementById('count-mins');
    const secsEl = document.getElementById('count-secs');

    function update() {
      const now = new Date();
      let diff = Math.max(0, now - startDate);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);

      const mins = Math.floor(diff / (1000 * 60));
      diff -= mins * (1000 * 60);

      const secs = Math.floor(diff / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ==========================================================================
     7. PHOTO LIGHTBOX
     ========================================================================== */
  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 8);
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }

  // Bind zoom buttons
  document.querySelectorAll('.zoom-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fullSrc = btn.getAttribute('data-full');
      const caption = btn.getAttribute('data-caption');
      openLightbox(fullSrc, caption);
    });
  });

  // Clicking image opens lightbox too
  document.querySelectorAll('.card-media img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const fullSrc = img.getAttribute('src');
      const caption = img.getAttribute('alt');
      openLightbox(fullSrc, caption);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  const backdrop = document.querySelector('.lightbox-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

})();
