// Lite variant: stripped of UI sliders/debug, minimal API
(() => {
  const { Engine, Render, Runner, Composite, Bodies, Body, Events, Sleeping } = Matter;

  const GAME = { W: 720, H: 560, BALL_R: 48, BASKET_W: 112, POST_W: 8, POST_H: 24, POST_Y: 180, RIM_THICK: 8, WALL_THICK: 40 };
  const BALL_TEXTURE = { path: "img/ball.png", retinaFactor: 2 }; // image is 2x the displayed diameter
  const SETTINGS = { throwForce: 30, restitution: 0.6, gravity: 2.2, hoopMoves: false, hoopSpeed: 0.6, rimY: 240 };
  const ONE_WAY = true;
  const ASCENT_VEL = -0.05;
  const CLEAR_PAD = 1;
  const HIT_PAD = 10;
  const MIN_SWIPE = 10;

  const DOM = {
    canvas: document.getElementById("gameCanvas"),
    score: document.getElementById("score"),
    wrap: document.getElementById("wrap"),
    ballHit: document.getElementById("ballHit"),
    intro: document.getElementById("introScreen"),
    outro: document.getElementById("outroScreen"),
    // startBtn removed; intro screen itself is clickable
    restartBtn: document.getElementById("restartBtn"),
    finalScore: document.getElementById("finalScore"),
    timer: document.getElementById("timerDisplay"),
  };

  // Allow inline data-config override
  try {
    const raw = DOM.wrap?.getAttribute("data-config");
    if (raw) Object.assign(SETTINGS, JSON.parse(raw));
  } catch {}

  const state = { engine: null, render: null, runner: null, ball: null, score: 0, ballPassed: false, running: false, timeLeft: 10, timerId: null, walls: [], physicsVisible: false };

  function createEngine() {
    const engine = Engine.create();
    engine.gravity.y = SETTINGS.gravity;
    const render = Render.create({ engine, canvas: DOM.canvas, options: { width: GAME.W, height: GAME.H, background: "transparent", wireframes: false, pixelRatio: "auto" } });
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
    return { engine, render, runner };
  }

  function addWalls(world) {
    const t = GAME.WALL_THICK;
    const half = t / 2;
    const hidden = { isStatic: true, render: { visible: false } };
    const top = Bodies.rectangle(GAME.W / 2, -half, GAME.W, t, hidden);
    const bottom = Bodies.rectangle(GAME.W / 2, GAME.H + half, GAME.W, t, hidden);
    const left = Bodies.rectangle(-half, GAME.H / 2, t, GAME.H, hidden);
    const right = Bodies.rectangle(GAME.W + half, GAME.H / 2, t, GAME.H, hidden);
    state.walls = [top, bottom, left, right];
    Composite.add(world, state.walls);
  }

  const Hoop = (() => {
    let lp, rp, rim;
    let leftEdge = GAME.W / 2 - GAME.BASKET_W / 2;
    function geom() {
      return { lp: { x: leftEdge - GAME.POST_W / 2, y: GAME.POST_Y }, rp: { x: leftEdge + GAME.BASKET_W + GAME.POST_W / 2, y: GAME.POST_Y }, rim: { x: leftEdge + GAME.BASKET_W / 2, y: SETTINGS.rimY } };
    }
    function init(world, ballR) {
      const g = geom();
      // Make structural bodies invisible (visual hoop handled by sprite)
      const hidden = { render: { visible: false } };
      lp = Bodies.rectangle(g.lp.x, g.lp.y, GAME.POST_W, GAME.POST_H, { isStatic: true, ...hidden });
      rp = Bodies.rectangle(g.rp.x, g.rp.y, GAME.POST_W, GAME.POST_H, { isStatic: true, ...hidden });
      // Rim width halved (previously GAME.BASKET_W / 2 + ballR) and hidden
      rim = Bodies.rectangle(g.rim.x, g.rim.y, (GAME.BASKET_W / 2 + ballR) * 0.5, GAME.RIM_THICK, { isStatic: true, isSensor: true, ...hidden });
      Composite.add(world, [lp, rp, rim]);
    }
    function update() {
      if (!SETTINGS.hoopMoves) return;
      const dt = state.engine.timing.lastDelta || 16.7;
      leftEdge += (SETTINGS.hoopSpeed * dt) / 16.7;
      if (leftEdge < 0) {
        leftEdge = 0;
        SETTINGS.hoopSpeed *= -1;
      }
      if (leftEdge + GAME.BASKET_W > GAME.W) {
        leftEdge = GAME.W - GAME.BASKET_W;
        SETTINGS.hoopSpeed *= -1;
      }
      const g = geom();
      Body.setPosition(lp, g.lp);
      Body.setPosition(rp, g.rp);
      Body.setPosition(rim, g.rim);
    }
    function setRimY(y) {
      SETTINGS.rimY = y;
      Body.setPosition(rim, geom().rim);
    }
    return { init, update, setRimY, getPosts: () => ({ lp, rp }), getRim: () => rim };
  })();

  function createBall(r) {
    if (state.ball) Composite.remove(state.engine.world, state.ball);
    const scale = 1 / BALL_TEXTURE.retinaFactor; // since source image is 2x the intended display size
    state.ball = Bodies.circle(GAME.W / 2, GAME.H - r - 6, r, {
      restitution: SETTINGS.restitution,
      friction: 0.2,
      frictionAir: 0.01,
      render: {
        sprite: { texture: BALL_TEXTURE.path, xScale: scale, yScale: scale },
        fillStyle: "transparent",
        lineWidth: 0,
      },
    });
    state.ballPassed = false;
    Composite.add(state.engine.world, state.ball);
    updateOverlay(true);
  }
  function resetBall() {
    if (!state.ball) return;
    const r = state.ball.circleRadius;
    Body.setPosition(state.ball, { x: GAME.W / 2, y: GAME.H - r - 6 });
    Body.setVelocity(state.ball, { x: 0, y: 0 });
    Body.setAngularVelocity(state.ball, 0);
    Sleeping.set(state.ball, false);
    state.ballPassed = false;
    updateOverlay(true);
  }

  function score() {
    state.score += 2; // +2 per basket
    if (DOM.score) DOM.score.textContent = "Skoor: " + state.score;
  }

  function updateTimerDisplay() {
    if (DOM.timer) DOM.timer.textContent = state.timeLeft.toFixed(1);
  }
  function tickTimer() {
    state.timeLeft -= 0.1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endGame();
    }
    updateTimerDisplay();
  }
  function startTimer() {
    stopTimer();
    state.timeLeft = 15;
    updateTimerDisplay();
    state.timerId = setInterval(tickTimer, 100);
  }
  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }
  function startGame() {
    state.running = true;
    state.score = 0;
    if (DOM.score) DOM.score.textContent = "Skoor: 0";
    resetBall();
    startTimer();
    hideIntro();
    hideOutro();
  }
  function endGame() {
    if (!state.running) return;
    state.running = false;
    stopTimer();
    showOutro();
    if (DOM.finalScore) DOM.finalScore.textContent = "Skoor: " + state.score;
  }
  function hideIntro() {
    DOM.intro?.classList.add("hidden");
  }
  function showIntro() {
    DOM.intro?.classList.remove("hidden");
  }
  function hideOutro() {
    DOM.outro?.classList.add("hidden");
  }
  function showOutro() {
    DOM.outro?.classList.remove("hidden");
  }

  function addEvents() {
    Events.on(state.engine, "collisionStart", (evt) => {
      for (const p of evt.pairs) {
        const a = p.bodyA,
          b = p.bodyB;
        const labelRim = Hoop.getRim();
        if (a === labelRim && b === state.ball) handleRim();
        else if (b === labelRim && a === state.ball) handleRim();
      }
    });
    Events.on(state.engine, "afterUpdate", () => {
      resetPassFlag();
      updateOverlay();
      // optional: could pause physics when not running; for now scoring just locked by running flag
    });
    Events.on(state.engine, "beforeUpdate", () => {
      Hoop.update();
      directionalPosts();
    });
  }

  function handleRim() {
    if (!state.ball) return;
    if (!state.running) return; // only count during active game
    if (state.ball.velocity.y > 0 && !state.ballPassed) {
      score();
      state.ballPassed = true;
    }
  }
  function resetPassFlag() {
    if (!state.ball) return;
    if (state.ball.position.y - state.ball.circleRadius > SETTINGS.rimY + 2) state.ballPassed = false;
  }

  function directionalPosts() {
    if (!ONE_WAY || !state.ball) return;
    const { lp, rp } = Hoop.getPosts();
    if (!lp || !rp) return;
    const vy = state.ball.velocity.y;
    const ascending = vy < ASCENT_VEL;
    if (ascending) {
      if (!lp.isSensor) lp.isSensor = true;
      if (!rp.isSensor) rp.isSensor = true;
    } else {
      [lp, rp].forEach((post) => {
        if (!post.isSensor) return;
        const pMinX = post.position.x - GAME.POST_W / 2 - CLEAR_PAD;
        const pMaxX = post.position.x + GAME.POST_W / 2 + CLEAR_PAD;
        const pMinY = post.position.y - GAME.POST_H / 2 - CLEAR_PAD;
        const pMaxY = post.position.y + GAME.POST_H / 2 + CLEAR_PAD;
        const r = state.ball.circleRadius,
          bx = state.ball.position.x,
          by = state.ball.position.y;
        const overlap = bx + r > pMinX && bx - r < pMaxX && by + r > pMinY && by - r < pMaxY;
        if (!overlap) post.isSensor = false;
      });
    }
  }

  // Hoop sprite now manually positioned via CSS only (no dynamic sync)

  function updateOverlay(force = false) {
    if (!DOM.ballHit || !state.ball) return;
    const r = state.ball.circleRadius + HIT_PAD;
    const x = state.ball.position.x - r;
    const y = state.ball.position.y - r;
    // Clamp overlay within game bounds to avoid causing page scrollbars when ball near edges
    const size = r * 2;
    const maxX = GAME.W - size;
    const maxY = GAME.H - size;
    const cx = Math.min(Math.max(0, x), maxX);
    const cy = Math.min(Math.max(0, y), maxY);
    if (force || DOM.ballHit._x !== cx || DOM.ballHit._y !== cy || DOM.ballHit._r !== r) {
      Object.assign(DOM.ballHit.style, { left: cx + "px", top: cy + "px", width: size + "px", height: size + "px" });
      DOM.ballHit._x = cx;
      DOM.ballHit._y = cy;
      DOM.ballHit._r = r;
    }
  }

  const Input = (() => {
    let pid = null,
      start = null;
    function toLocal(e) {
      const rect = DOM.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function down(e) {
      if (pid !== null) return;
      pid = e.pointerId;
      start = toLocal(e);
      if (e.cancelable) e.preventDefault();
      if (state.ball) Sleeping.set(state.ball, false);
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
      DOM.ballHit.addEventListener("pointermove", move, { passive: false });
    }
    function move(e) {
      if (e.pointerId !== pid) return;
      if (e.cancelable) e.preventDefault();
    }
    function up(e) {
      if (e.pointerId !== pid) return;
      finish(e);
    }
    function cancel(e) {
      if (e.pointerId === pid) cleanup();
    }
    function finish(e) {
      if (!start) {
        cleanup();
        return;
      }
      const end = toLocal(e);
      const dx = end.x - start.x,
        dy = end.y - start.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= MIN_SWIPE * MIN_SWIPE && state.ball) {
        const len = Math.sqrt(d2) || 1;
        Body.setVelocity(state.ball, { x: (dx / len) * SETTINGS.throwForce, y: (dy / len) * SETTINGS.throwForce });
        Sleeping.set(state.ball, false);
      }
      cleanup();
    }
    function cleanup() {
      DOM.ballHit.removeEventListener("pointermove", move);
      pid = null;
      start = null;
    }
    function bind() {
      if (!DOM.ballHit) return;
      DOM.ballHit.addEventListener("pointerdown", down, { passive: false });
      DOM.ballHit.addEventListener("pointerup", up, { passive: true });
      DOM.ballHit.addEventListener("pointercancel", cancel, { passive: true });
      DOM.ballHit.addEventListener("lostpointercapture", (e) => {
        if (e.pointerId === pid) cleanup();
      });
    }
    return { bind };
  })();

  function wireUI() {
    DOM.intro?.addEventListener("click", () => startGame());
    DOM.restartBtn?.addEventListener("click", () => {
      startGame();
    });
  }

  // Toggle visibility of physics bodies (walls, hoop posts, rim) for debugging
  function setPhysicsVisible(on) {
    state.physicsVisible = !!on;
    const color = "#ff0077";
    state.walls.forEach((w) => {
      w.render.visible = state.physicsVisible;
      if (state.physicsVisible) {
        w.render.fillStyle = "rgba(255,0,120,0.25)";
        w.render.strokeStyle = color;
        w.render.lineWidth = 1;
      }
    });
    const { lp, rp } = Hoop.getPosts();
    const rim = Hoop.getRim();
    [lp, rp, rim].forEach((b) => {
      if (!b) return;
      b.render.visible = state.physicsVisible;
      if (state.physicsVisible) {
        b.render.fillStyle = "rgba(0,160,255,0.25)";
        b.render.strokeStyle = "#0090ff";
        b.render.lineWidth = 1;
      }
    });
  }
  function togglePhysicsVisible() {
    setPhysicsVisible(!state.physicsVisible);
  }

  /* Data saatmine */
  function initSubmission() {
    const submitBtn = document.getElementById("submitEntry");
    const nameInput = document.getElementById("playerName");
    const emailInput = document.getElementById("playerEmail");
    const overlay = document.getElementById("submissionOverlay");
    const spinner = document.getElementById("loadingSpinner");
    const successEl = document.getElementById("successMessage");
    const errorEl = document.getElementById("errorMessage");
    if (!submitBtn || !emailInput) return;
    const scriptURL = "https://s.ohtuleht.ee/customer/insert";
    let sending = false;
    submitBtn.addEventListener("click", () => {
      if (sending) return; // prevent double clicks
      const nameVal = (nameInput?.value || "").trim();
      const emailVal = (emailInput.value || "").trim();
      // Basic email validation
      const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal);
      if (!emailOK) {
        emailInput.classList.add("input-error");
        emailInput.focus();
        return;
      } else {
        emailInput.classList.remove("input-error");
      }
      // Build payload similar to old banner (only name/email collected here)
      let result = {
        Name: nameVal,
        Email: emailVal,
        Agrees: [1, 53],
        CampaignId: 64,
        Status: 1,
      };
      try {
        const json = JSON.stringify(result);
        const request = new XMLHttpRequest();
        sending = true;
        // UI state: show overlay + spinner, hide messages
        if (overlay) {
          overlay.classList.remove("hidden");
        }
        if (spinner) {
          spinner.classList.remove("hidden");
        }
        if (successEl) {
          successEl.classList.add("hidden");
        }
        if (errorEl) {
          errorEl.classList.add("hidden");
        }
        submitBtn.disabled = true;
        request.open("POST", scriptURL, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onload = function () {
          sending = false;
          let success = request.status >= 200 && request.status < 400;
          const raw = request.responseText || "";
          const lower = raw.toLowerCase();
          // Heuristic: backend may return Estonian error text even with 200 status
          if (lower.includes("ebaonnestus") || lower.includes("ebaõnnestus") || lower.includes("error")) {
            success = false;
          }
          // Try parse JSON if possible and look for explicit failure flag
          try {
            if (raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
              const parsed = JSON.parse(raw);
              if (parsed && (parsed.success === false || parsed.error || parsed.Status === 0)) success = false;
            }
          } catch {}
          if (spinner) spinner.classList.add("hidden");
          if (success) {
            console.log("Success!", raw);
            if (successEl) successEl.classList.remove("hidden");
          } else {
            console.log("Error!", raw);
            if (errorEl) errorEl.classList.remove("hidden");
          }
          submitBtn.disabled = false;
        };
        request.onerror = function () {
          sending = false;
          console.log("Network Error");
          if (spinner) spinner.classList.add("hidden");
          if (errorEl) errorEl.classList.remove("hidden");
          submitBtn.disabled = false;
        };
        request.send(json);
      } catch (e) {
        console.log("Serialize error", e);
      }
    });
  }

  function init() {
    const { engine, render, runner } = createEngine();
    state.engine = engine;
    state.render = render;
    state.runner = runner;
    addWalls(engine.world);
    Hoop.init(engine.world, GAME.BALL_R);
    createBall(GAME.BALL_R);
    addEvents();
    Input.bind();
    wireUI();
    initSubmission();
    // Show intro on load
    showIntro();
    window.basketLite = {
      resetBall,
      settings: SETTINGS,
      recreateBall: () => createBall(GAME.BALL_R),
      setRimY: (y) => {
        if (typeof y === "number") {
          Hoop.setRimY(y);
        }
      },
      setPhysicsVisible,
      togglePhysicsVisible,
    };
  }
  init();
})();
