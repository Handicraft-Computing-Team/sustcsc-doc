---
title: DiT 图像生成挑战
---

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'

onMounted(() => {
  // --- DOM 创建逻辑（保持不变） ---
  const overlay = Object.assign(document.createElement('div'), {
    style: `position:fixed;inset:0;z-index:9999;pointer-events:auto;background:transparent;opacity:0;transition:opacity 1.2s ease;`
  })
  document.body.appendChild(overlay)
  requestAnimationFrame(() => { overlay.style.opacity = 1 })

  const logo = Object.assign(document.createElement('div'), {
    innerHTML: '2025 SUSTCSC <span style="color:#ffd700;"> DiT </span>',
    style: `position:absolute;
    top:40%;
    left:50%;
    transform:translate(-50%,-50%);
    font-family:'Courier New',monospace;
    font-size:24px;
    color:#fff;
    text-shadow: 0 0 8px rgba(255,215,0,0.8),
                 0 0 16px rgba(255,215,0,0.6),
                 0 0 24px rgba(255,255,200,0.4);
    pointer-events:none;
    z-index:10000;`
  })
  overlay.appendChild(logo)

  const prompt = Object.assign(document.createElement('div'), {
    innerText: '点击任意处继续',
    style: `position:absolute;
    top:60%;
    left:50%;
    transform:translate(-50%,-50%);
    font-size:24px;
    color: #ffd700;
    text-shadow: 0 0 6px rgba(255,215,0,0.7);
    pointer-events:none;z-index:10000;`
  })
  overlay.appendChild(prompt)

  // --- Three.js 初始化 ---
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
  camera.position.z = 0

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor(0x000000, 1)
  overlay.appendChild(renderer.domElement)

  // --- 粒子隧道 ---
  const SEGMENTS = 10000
  const TUNNEL_RADIUS = 15.0
  const TUNNEL_LENGTH = 500

  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(SEGMENTS * 3)
  const colors = new Float32Array(SEGMENTS * 3)
  const sizes = new Float32Array(SEGMENTS)

  for (let i = 0; i < SEGMENTS; i++) {
    const t = i / SEGMENTS * TUNNEL_LENGTH
    const angle = t * 10 + Math.sin(t * 0.8) * 0.7
    const r = TUNNEL_RADIUS + Math.sin(t * 2.5) * 0.5 + Math.cos(t * 1.8) * 0.3

    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = Math.sin(angle) * r
    positions[i * 3 + 2] = -t

    colors[i * 3] = 0.5 + 0.5 * Math.sin(t * 0.2 + 0.0)
    colors[i * 3 + 1] = 0.5 + 0.5 * Math.sin(t * 0.2 + 2.0)
    colors[i * 3 + 2] = 0.5 + 0.5 * Math.sin(t * 0.2 + 4.0)

    sizes[i] = 0.2 + 0.15 * Math.sin(t * 5)
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      // Optional: A soft circular texture for points
      // pointTexture: { value: new THREE.TextureLoader().load('/path/to/sparkle.png') }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      // uniform sampler2D pointTexture; // Uncomment if using texture
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
        float r = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (r > 0.5) discard;
        gl_FragColor = gl_FragColor * (1.0 - smoothstep(0.3, 0.5, r));
        // If you have a texture, uncomment the line below and comment the above two lines
        // gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // Fog effect for enhanced depth
  scene.fog = new THREE.FogExp2(0x000000, 0.01) // Slightly less dense fog for a softer fade

  // --- Animation loop ---
  let frameId, elapsed = 0
  const animate = (time) => {
    frameId = requestAnimationFrame(animate)
    elapsed = time * 0.001

    // 让粒子系统整体围绕z轴旋转
    points.rotation.z = elapsed * 0.5

    // 摄像机始终在隧道中心，沿z轴前进
    const tunnelProgress = (elapsed * 6) % TUNNEL_LENGTH
    camera.position.set(0, 0, tunnelProgress)
    camera.lookAt(0, 0, tunnelProgress - 10)

    // 可以加一点轻微的上下/左右漂移增强动感
    camera.position.x = Math.sin(elapsed * 0.7) * 0.2
    camera.position.y = Math.cos(elapsed * 0.5) * 0.2
    camera.position.z = - (elapsed * 6) % TUNNEL_LENGTH

    renderer.render(scene, camera)
  }
  animate(0)

  // --- End logic ---
  function triggerFadeOut() {
    overlay.style.opacity = 0
    setTimeout(finalCleanup, 1200)
  }
  function finalCleanup() {
    cancelAnimationFrame(frameId)
    renderer.dispose()
    overlay.remove()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('click', triggerFadeOut)
  }

  setTimeout(triggerFadeOut, 8000)
  window.addEventListener('click', triggerFadeOut)

  // --- Viewport responsiveness ---
  function onResize() {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
  }
  window.addEventListener('resize', onResize)
})
</script>


<ClientOnly />

# DiT 图像生成挑战

> 作者：[Jaredan Xiao](https://github.com/Jaredanwolfgang)


[[toc]]

## 序幕

在数字的海洋中，一幅画作正在孕育。从混沌的噪声中，像素如同星辰般闪烁，逐渐汇聚成清晰的图案。这是一个关于创造的故事，一个关于 DiT 如何将文字转化为图像的故事。

让我们开始这段奇妙的旅程，探索 DiT 图像生成的奥秘。