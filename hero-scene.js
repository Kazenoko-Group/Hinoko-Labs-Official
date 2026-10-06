/* Slowly evolving copper light folds. Rendered locally, with no image or runtime dependency. */
(() => {
  'use strict';
  const canvas = document.getElementById('heroScene');
  const hero = document.querySelector('.hero');
  const toggle = document.getElementById('motionToggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let gl;
  try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); } catch (_) { /* Static background remains readable. */ }
  if (!gl) { hero.classList.add('scene-unavailable'); return; }
  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUV;
    void main() { vUV = aPosition * .5 + .5; gl_Position = vec4(aPosition, 0., 1.); }
  `;
  const fragmentSource = `
    precision highp float;
    varying vec2 vUV;
    uniform float uTime;
    uniform float uAspect;
    uniform vec2 uPointer;
    float fold(float d, float width) {
      // A soft illuminated face and a fine, brighter grazing edge.
      return exp(-abs(d) / width) * .52 + exp(-abs(d + .012) / .009) * .16;
    }
    void main() {
      vec2 p = vUV;
      p += uPointer * vec2(.016, .012);
      float t = uTime * .12;
      float x = (p.x - .5) * max(uAspect, .85);
      float y = p.y;
      float flow = sin(x * 2.1 + t) * .045 + sin(x * 4.5 - t * .65) * .025;
      float upper = y - (.88 + .14 * sin(x * 2.7 + .8 + t * .3) + flow);
      float lower = y - (.12 + .16 * sin(x * 2.9 - .5 - t * .4) + flow);
      float side = x - (mix(.35, .69, smoothstep(.6, 1.5, uAspect)) + .18 * sin(y * 4.2 + t * .4) + .31 * (y - .5));
      float light = fold(upper, .065) * .7 + fold(lower, .075) * .62;
      light += fold(side, .09) * .95;
      float ripple = .92 + .08 * sin(y * 8. + x * 5. + t);
      // Preserve negative space behind the typography; light lives at the edges.
      float quiet = smoothstep(.12, .65, length(vec2(x * .8, (y - .52) * 1.3)));
      light *= (.12 + .88 * quiet) * ripple;
      vec3 color = vec3(.031, .028, .024) + light * vec3(.49, .255, .135);
      float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      color += (grain - .5) * .018;
      gl_FragColor = vec4(color, 1.);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Hero shader unavailable'); }
    return shader;
  }
  let program;
  try {
    program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Hero renderer unavailable');
  } catch (_) { hero.classList.add('scene-unavailable'); return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const aspectLocation = gl.getUniformLocation(program, 'uAspect');
  const timeLocation = gl.getUniformLocation(program, 'uTime');
  const pointerLocation = gl.getUniformLocation(program, 'uPointer');
  let frame = 0;
  let time = 0;
  let last = 0;
  let visible = true;
  let lost = false;
  let paused = reduced.matches;
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let aspect = 1;
  function draw() {
    if (lost) return;
    gl.uniform1f(aspectLocation, aspect);
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(pointerLocation, smoothX, smoothY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function animate(now) {
    frame = 0;
    if (paused || !visible || document.hidden || lost) { last = 0; return; }
    if (last && now - last < 1000 / 30) { frame = requestAnimationFrame(animate); return; }
    time += last ? Math.min((now - last) / 1000, 0.08) : 0;
    last = now;
    smoothX += (pointerX - smoothX) * 0.06;
    smoothY += (pointerY - smoothY) * 0.06;
    draw();
    frame = requestAnimationFrame(animate);
  }
  function schedule() {
    if (!paused && visible && !document.hidden && !lost && !frame) frame = requestAnimationFrame(animate);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const density = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * density));
    canvas.height = Math.max(1, Math.round(rect.height * density));
    aspect = rect.width / Math.max(rect.height, 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
    schedule();
  }
  function updateToggle() {
    toggle.textContent = paused ? '動きを再生' : '動きを止める';
    toggle.setAttribute('aria-pressed', String(paused));
    hero.classList.toggle('motion-paused', paused);
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => { paused = !paused; last = 0; updateToggle(); schedule(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; pointerX = pointerY = smoothX = smoothY = 0; updateToggle(); draw(); schedule(); });
  hero.addEventListener('pointermove', event => {
    if (!finePointer.matches || paused) return;
    const rect = hero.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
  });
  hero.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
  document.addEventListener('visibilitychange', schedule);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; last = 0; schedule(); }, { threshold: 0 });
  observer.observe(hero);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; canvas.hidden = true; toggle.hidden = true; hero.classList.add('scene-unavailable'); });
  // A reload restores the scene after rare GPU-context loss; all content remains usable.
  new ResizeObserver(resize).observe(canvas);
  hero.classList.add('scene-ready');
  updateToggle();
  resize();
})();
