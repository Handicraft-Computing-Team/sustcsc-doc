---
title: DiT 图像生成挑战
---

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

onMounted(() => {
  /* ---------- 1. 创建覆盖层和提示文字 ---------- */
  const overlay = Object.assign(document.createElement('div'), {
    style: `
      position:fixed;inset:0;z-index:9999;
      pointer-events:auto;
      background:transparent;
      opacity:0;
      transition:opacity 1.2s ease;
    `
  })
  document.body.appendChild(overlay)
  requestAnimationFrame(() => { overlay.style.opacity = 1 })

  // "DiT" LOGO 文本
  const logo = Object.assign(document.createElement('div'), {
    innerHTML: '2025<span style="color:#0ff;"> SUSTCSC</span>',
    style: `
      position:absolute;top:40%;left:50%;
      transform:translate(-50%,-50%);
      font-family: 'Segoe UI',Helvetica,Arial,sans-serif;
      font-size:24px;
      color: #fff;
      text-shadow:
        0 0 8px rgba(0,255,255,0.8),
        0 0 16px rgba(0,255,255,0.6),
        0 0 24px rgba(255,255,255,0.4);
      pointer-events:none;
      z-index:10000;
    `
  })
  overlay.appendChild(logo)

  // 点击提示
  const prompt = Object.assign(document.createElement('div'), {
    innerText: '点击任意处继续',
    style: `
      position:absolute;top:60%;left:50%;
      transform:translate(-50%,-50%);
      font-size:24px;
      color:#0ff;
      text-shadow:0 0 6px rgba(0,255,255,0.7);
      pointer-events:none;
      z-index:10000;
    `
  })
  overlay.appendChild(prompt)

  /* ---------- 2. Three.js 场景 ---------- */
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 6)

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(devicePixelRatio)
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor(0x000000, 0)
  overlay.appendChild(renderer.domElement)

  /* ---------- 3. 后期效果：Bloom ---------- */
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.5, 0.4, 0.1)
  bloomPass.threshold = 0
  bloomPass.strength = 1.2
  bloomPass.radius = 0.6
  composer.addPass(bloomPass)

  /* ---------- 4. 创建噪声纹理和目标图像 ---------- */
  const createNoiseTexture = (size) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
    ctx.putImageData(imageData, 0, 0)
    return new THREE.CanvasTexture(canvas)
  }

  const noiseTexture = createNoiseTexture(256)
  const textureLoader = new THREE.TextureLoader()
  const targetTexture = textureLoader.load('/sustcsc-doc/images/sustech.png')

  /* ---------- 5. 创建混合材质 ---------- */
  const planeGeometry = new THREE.PlaneGeometry(4, 4)
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      noiseTexture: { value: noiseTexture },
      targetTexture: { value: targetTexture },
      mixFactor: { value: 0.0 },
      time: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D noiseTexture;
      uniform sampler2D targetTexture;
      uniform float mixFactor;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        vec4 noise = texture2D(noiseTexture, vUv);
        vec4 target = texture2D(targetTexture, vUv);
        
        // 创建白色背景
        vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
        
        // 添加一些动态效果
        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        float finalMix = mixFactor * (1.0 + pulse * 0.1);
        
        // 先从白色过渡到噪声，再从噪声过渡到目标图像
        vec4 intermediate = mix(white, noise, finalMix * 0.5);
        gl_FragColor = mix(intermediate, target, finalMix);
      }
    `,
    transparent: true
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  scene.add(plane)

  /* ---------- 6. 创建粒子系统 ---------- */
  const PARTICLE_COUNT = 1000
  const particleGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const colors = new Float32Array(PARTICLE_COUNT * 3)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 5
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5

    colors[i * 3] = Math.random()
    colors[i * 3 + 1] = Math.random()
    colors[i * 3 + 2] = Math.random()
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)

  /* ---------- 7. 动画循环 ---------- */
  let frameId, elapsed = 0
  const animate = (dt = 0) => {
    frameId = requestAnimationFrame(animate)
    elapsed += dt * 0.001

    // 更新混合因子
    const mixFactor = Math.min(1.0, Math.max(0.0, (elapsed - 5.0) * 0.5))
    planeMaterial.uniforms.mixFactor.value = mixFactor
    planeMaterial.uniforms.time.value = elapsed

    // 更新噪声纹理
    const ctx = noiseTexture.image.getContext('2d')
    const imageData = ctx.getImageData(0, 0, 256, 256)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.sin(elapsed * 2 + i * 0.01) * 127 + 128
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
    }
    ctx.putImageData(imageData, 0, 0)
    noiseTexture.needsUpdate = true

    // 更新粒子位置
    const positions = particles.geometry.attributes.position.array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(elapsed + i) * 0.01
      positions[i + 1] += Math.cos(elapsed + i) * 0.01
      positions[i + 2] += Math.sin(elapsed * 0.5 + i) * 0.01
    }
    particles.geometry.attributes.position.needsUpdate = true

    // 旋转平面，使用平滑的减速曲线
    const rotationSpeed = Math.max(0, 0.2 * Math.pow(1 - mixFactor, 2))
    plane.rotation.z += rotationSpeed * (dt * 0.001)

    composer.render(dt)
  }
  animate()

  /* ---------- 8. 点击或超时结束动画 ---------- */
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

  // 8 秒后自动结束并淡出
  setTimeout(triggerFadeOut, 8000)

  // 监听点击立即结束
  window.addEventListener('click', triggerFadeOut)

  /* ---------- 9. 响应式重置 ---------- */
  function onResize() {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
    bloomPass.setSize(innerWidth, innerHeight)
  }
  window.addEventListener('resize', onResize)
})
</script>

<ClientOnly />

# DiT 图像生成挑战

> 作者：[Jaredan Xiao](https://github.com/Jaredanwolfgang)

<button id="read-btn" style="
  position:fixed;bottom:2rem;right:2rem;z-index:10001;
  padding:.6rem 1rem;border:0;border-radius:.4rem;
  background:#00c0ff;color:#fff;font-weight:bold;cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,.3);
">
  🔊 朗读
</button>

<!-- <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=536622945&auto=1&height=66"></iframe> -->

[[toc]]

## 序幕

在数字的海洋中，一幅画作正在孕育。从混沌的噪声中，像素如同星辰般闪烁，逐渐汇聚成清晰的图案。这是一个关于创造的故事，一个关于 DiT 如何将文字转化为图像的故事。

让我们开始这段奇妙的旅程，探索 DiT 图像生成的奥秘。