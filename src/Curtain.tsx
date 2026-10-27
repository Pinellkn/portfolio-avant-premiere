import { useEffect, useRef } from "react";

const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime, uOpen, uEdge, uHover;
uniform vec2 uMouse;
uniform sampler2D uTex;

float edgeAt(float y) {
  float open = mix(-0.05, uEdge, uOpen);
  float curve = (0.05 * sin(3.14159 * y) - 0.04 * y + 0.02 * sin(y * 5.0 + uTime * 0.5)) * uOpen;
  return open - curve;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;
  float asp = uRes.x / uRes.y;
  float e = edgeAt(uv.y);
  float aa = 1.5 / uRes.x;
  float cover = smoothstep(e - aa, e + aa, uv.x);
  if (cover <= 0.001) { gl_FragColor = vec4(0.0); return; }

  float m = clamp((uv.x - e) / (1.0 - e + 0.0001), 0.0, 1.0);
  float g = uOpen;
  float mm = pow(m, mix(1.0, 0.75, g));
  float n = mix(6.0, 18.0, g);

  vec2 dm = vec2((uv.x - uMouse.x) * asp, uv.y - uMouse.y);
  float dist = length(dm);
  float rip = uHover * exp(-dist * dist * 9.0);

  float ph = mm * n * 6.28318;
  ph += 1.0 * sin(uv.y * 2.4 + mm * 4.0 + uTime * 0.4);
  ph += 0.55 * sin(uv.y * 6.0 - uTime * 0.7 + mm * 9.0);
  ph += rip * 2.2 * sin(dist * 18.0 - uTime * 3.0);
  float amp = 0.6 + 0.4 * sin(uv.y * 3.0 + mm * 5.0 + uTime * 0.2) + rip * 0.5;

  float h = sin(ph) * amp + 0.35 * sin(2.0 * ph + uv.y * 3.0);
  float dh = cos(ph) * amp + 0.7 * cos(2.0 * ph + uv.y * 3.0);
  float light = clamp(0.55 + 0.44 * dh + 0.25 * h, 0.0, 1.2);
  light = pow(light, 1.4);

  vec2 tuv = vec2((mm * (1.0 - e) * uRes.x + dh * 6.0) / 1024.0 * 1.3,
                  (uv.y * uRes.y + h * 10.0) / 512.0 * 1.3);
  float t = texture2D(uTex, tuv).r;

  vec3 base = vec3(0.07, 0.055, 0.05);
  vec3 ink = vec3(0.86, 0.82, 0.74);
  vec3 col = mix(base, ink, t) * (0.2 + 0.95 * light);
  col *= 0.75 + 0.25 * smoothstep(0.0, 0.15, m);
  col += vec3(0.05, 0.0, 0.0) * (1.0 - light);
  gl_FragColor = vec4(col * cover, cover);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

// Texture de « tissu » : des mots répétés (PINEL / LOKONON), tuilable.
function uploadTexture(gl: WebGLRenderingContext, tex: WebGLTexture) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const x = c.getContext("2d")!;
  x.fillStyle = "#000";
  x.fillRect(0, 0, 1024, 512);
  x.fillStyle = "#fff";
  x.font = '400 14px "JetBrains Mono", monospace';
  x.textAlign = "center";
  x.textBaseline = "middle";
  for (let r = 0; r < 32; r++) {
    const word = r % 2 ? "LOKONON" : "PINEL";
    const off = r % 2 ? 64 : 0;
    for (let k = -1; k <= 8; k++) x.fillText(word, k * 128 + 64 + off, r * 16 + 8);
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

export default function Curtain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const gl = c.getContext("webgl", { alpha: true, premultipliedAlpha: true });
    if (!gl) {
      c.style.display = "none";
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture()!;
    uploadTexture(gl, tex);
    document.fonts?.load('14px "JetBrains Mono"').then(() => uploadTexture(gl, tex)).catch(() => {});

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("uRes"), uTime = U("uTime"), uOpen = U("uOpen"), uEdge = U("uEdge"), uHover = U("uHover"), uMouse = U("uMouse");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    let mx = 0.7, my = 0.5, tmx = 0.7, tmy = 0.5, hv = 0, hvT = 0, vis = true, raf = 0;
    const t0 = performance.now();

    const move = (cx: number, cy: number) => {
      const r = c.getBoundingClientRect();
      const nx = (cx - r.left) / r.width, ny = (cy - r.top) / r.height;
      tmx = nx;
      tmy = ny;
      hvT = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1 ? 1 : 0;
    };
    const onMouse = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY);
    const onLeave = () => (hvT = 0);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(c);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const t = (now - t0) / 1000;
      const k = reduce ? 1 : clamp((t - 0.9) / 3.2);
      const open = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      hv += (hvT - hv) * 0.05;

      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.floor(c.clientWidth * dpr), h = Math.floor(c.clientHeight * dpr);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, reduce ? 0 : t);
      gl.uniform1f(uOpen, open);
      gl.uniform1f(uEdge, window.innerWidth < 800 ? 0.7 : 0.5);
      gl.uniform1f(uHover, reduce ? 0 : hv);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="curtain-cv" aria-hidden="true" />;
}
