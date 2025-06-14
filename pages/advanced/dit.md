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
  const SEGMENTS = 20000
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
    camera.position.x = Math.sin(elapsed * 0.7)
    camera.position.y = Math.cos(elapsed * 0.5)
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

::: info
🕷️ In every other universe Gwen Stacy falls for Spider-Man and in every other universe it doesn't end well. 
:::

![Spider-Man into the Spider-Verse](/dit/spiderman.png)

## 序章：第617号宇宙

Gwen Stacy站在巨大的屏幕前，屏幕里面有数不清的小屏幕，每一个屏幕里都闪烁的不同的画面。看似每一个画面的色调、内容都不相同，但是似乎都发生在一个钟楼形态的建筑附近。「不——」在其中的一个画面中，一个女生从钟楼楼顶坠下，这是一个三维现实宇宙，她似乎是在某种攻击下丧失了平衡，开始坠落。发出声音的是画面中的男生，他从塔楼顶端开始不要命地向下俯冲，同时，他的右手手腕处似乎吐出一些白色细细的线。「嘭——」就在细线似乎连接其下坠女生的那一刻，女生的头同时和地面碰撞，产生了剧烈的声响。其他的画面里，紧接着都开始播放着相似的片段，都有关下坠，都有关蛛丝，都有关那个女生和那个男生，但似乎结局，每次都会以其中的一个人，抱着另一个人痛哭作为结局。

Gwen Stacy摁下了桌面的一个按键，屏幕切回了正常的工作界面，上面密布着各种检测的数据、指标，似乎还有一些进度条在计算着什么。「是时候下班了不是吗？」一个男生的声音从背后传来，那个男生正在脱下身上的有着蜘蛛丝网纹路的衣服，「今天还是没有什么进展吗？」

「还是太慢了」，Gwen Stacy摇摇头，「按这个速度下去，我们永远找不到那组参数的。」

那个男生最后把脸上的面罩脱下来，露出帅气的面庞。「别着急，我们还剩多少时间？」

「不多了」，Gwen Stacy摇摇头，「还是没有办法摆脱这个结局吗？Peter，我...我真的尽力了」

这里是第617宇宙，最开始的画面来自于第120703宇宙，仔细回想，画面里面的男生和女生和此时站在屏幕前的男生和女生都有几分相似。那画面里面，讲述的是在无数平行宇宙中已经发生了的Peter Parker和Gwen Stacy的故事。在每一个平行宇宙里，Peter Parker和Gwen Stacy都相爱了，但是在每一个平行宇宙中，他们都面临以一方的死亡告别彼此的结局。

在617宇宙中，Gwen Stacy成为了科学家，在大概两年前，她收到了来自另外一个平行宇宙的信号，告知她们这一悬挂在她与Peter之间的达摩克利斯之剑，并将其他已经经过这一时间节点的宇宙的画面同步传输给了617宇宙中的Gwen Stacy。那个信使是来自754号宇宙的Peter：「我没能拯救我的Gwen，但我想我们的进展是最大的，在所有的宇宙里面，你们离这个时间节点的距离观测来看是最远的，同时在这个宇宙里，你是智慧超凡的科学家，我相信你们有能力完成这一使命，帮我去找到那组参数和那个模型核，拜托了。」

![Screen](/dit/screen.png)

## 有关Diffusion扩散模型

Diffusion是一种常用的生成手段，在617宇宙科技飞速发展的背景下，只要有足够多的信息，甚至可以预测不同平行宇宙的发展状态，前提只需要找到一组参数和一个模型核，通过反向过程，便可以基于给定模型核和坐标信息，逐渐生成某一事件的结果。模型核和不同的平行宇宙息息相关，只要找到了对应的对应的模型核，就可以定位到哪个平行宇宙中最可能摆脱这一看似既定的命运，还原那个宇宙中前一个关键节点的结果，或许就可以让所有平行宇宙中的Gwen和Peter摆脱告别的结局。

在得知了这一理论的可行性后，617宇宙的Gwen Stacy和Peter Parker开始不眠不休地尝试。每一个夜晚，他们都守在中央控制舱中，通过全息屏幕模拟数以万计的宇宙路径。他们尝试将从其他宇宙收集到的事件序列转化为数据点，反向推理可能的初始状态。现在的问题是，Diffusion的每一次推理过程都非常耗时，利用上分布式系统进行分布式推理，或许可以加快他们接近答案的时间。

扩散模型（Diffusion Models），特别是DDPM，是一类近年来在图像生成任务中表现非常优秀的生成模型，其核心思想是通过“正向加噪”和“反向去噪”的方式逐步构建出复杂的样本分布。

### 基本原理

**1. 正向过程（Forward Process）**

将真实数据 $x_0$ 逐渐添加高斯噪声，直到变成近似纯噪声的分布 $x_T$：

$$
q(x_t|x_{t-1}) = \mathcal{N}(x_t; \sqrt{1 - \beta_t}x_{t-1}, \beta_t I)
$$

这里的 $\beta_t$ 是一个很小的正数，代表每一步加入的噪声比例。

**2. 反向过程（Reverse Process）**

训练一个神经网络 $\epsilon_\theta(x_t, t)$ 来预测每一步的噪声，从而逐步去噪，恢复出原始数据 $x_0$：

$$
p_\theta(x_{t-1}|x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \Sigma_\theta(x_t, t))
$$

实际训练中，目标是最小化预测噪声与真实噪声之间的误差：

$$
L_{\text{simple}} = \mathbb{E}_{x_0, \epsilon, t} \left[ \left\| \epsilon - \epsilon_\theta(x_t, t) \right\|^2 \right]
$$

**3. 采样过程（Sampling）**

从一个高斯噪声样本 $x_T \sim \mathcal{N}(0, I)$ 开始，利用训练好的网络反复去噪：

$$
x_{T} \rightarrow x_{T-1} \rightarrow \cdots \rightarrow x_0
$$

最终得到一个看似从未存在，却极具现实感的样本。如果你对Diffusion模型的数学感兴趣，你可以参考[这篇文章](https://zhouyifan.net/2023/07/07/20230330-diffusion-model/)。

### Scalable Diffusion Models with Transformers <Badge type="tip"><a href="https://github.com/facebookresearch/DiT" style="text-decoration: none; color: black;">Github Repo</a></Badge> <Badge type="danger"><a href="https://arxiv.org/abs/2212.09748" style="text-decoration: none; color: inherit;">Paper</a></Badge> 

在DiT以前，Diffusion模型主要使用UNet结构作为主干网络，在图像生成任务上取得了很大的进展，使用UNet作为主干网络的特点在于其包含一个下采样路径和一个对应的上采样路径，这种结构使得UNet在处理图像的时候可以更好地捕捉上下文信息、更有效地传递特征，并且改善梯度传递的速度。

![Unet网络](unet.png)

![DiT](dit.png)

## 有关分布式推理

## 快速上手

### 集群使用

### 环境配置

## 题目说明

### 规则

### 提交指南

## 说明与致谢

### 参考资料

1. [扩散模型U-Net可视化理解](https://blog.csdn.net/weixin_43325228/article/details/135223972)
2. [Diffusion模型为何倾向于钟爱U-net结构？](https://blog.csdn.net/KdpdCode/article/details/133155913)
3. [扩散模型(Diffusion Model)详解：直观理解、数学原理、PyTorch 实现](https://zhouyifan.net/2023/07/07/20230330-diffusion-model/)

<!-- 在奥斯本企业的量子计算实验室里，Gwen Stacy站在全息投影前，无数个平行宇宙的结局如同星河流转。她的白大褂口袋里，实验室门禁卡和蜘蛛侠面罩安静地躺在一起，就像两个注定相遇的灵魂。

「 Peter，你看，」她的手指在空中划过，留下一道道发光的轨迹。全息投影中，无数个宇宙的结局如同量子叠加态般交织在一起，却都指向同一个悲剧性的终局。「 我们就像被困在一个巨大的概率场中，每次观测，每次选择，都会坍缩到相同的结局。」

Peter Parker站在她身后，看着那些不断重演的悲剧。布鲁克林大桥上的坠落，钟楼顶端的诀别，每一个宇宙都在重复着相同的旋律。他的蜘蛛感应微微颤动，仿佛在诉说着某种可能性。

「 但同时，」Gwen的声音突然变得明亮，「 就像量子涨落，在看似确定的世界里，总会有那么一丝不确定性。就像你的蜘蛛网，能够感知到最微小的震动。这些微小的波动，或许就是改变命运的关键。」

她调出实验室的量子计算模型，无数个参数在空气中闪烁。「 这些参数就像不同宇宙的'命运权重'，它们决定了每个宇宙的走向。但如果我们能够找到正确的组合，就像找到那个能够打破悲剧循环的'激活函数'...」

Peter若有所思：「 就像我的蜘蛛感应，能够预知危险并做出反应。你是说，我们可以找到那个最优的路径？」

「 没错，」Gwen的眼中闪烁着希望的光芒，「 就像图像生成中的扩散过程。每个宇宙的悲剧就像是一张被噪声污染的图片，而我们要做的，就是一步步去除这些'噪声'，找到那个最纯净的、充满希望的结局。」

她开始调整模型参数，就像在调音一般。「 看，当我们改变这些'命运权重'时，宇宙的走向就会发生微妙的变化。就像扩散模型中的 $\beta$ 参数，它决定了噪声的强度，也决定了我们能够多大程度地改变命运。」

Peter看着全息投影中不断变化的场景，突然说道：「 就像我的蜘蛛网，能够捕捉到最微小的震动。这些参数之间的关联，就像网上的节点，互相影响，互相传递信息。」

「 对！」Gwen兴奋地点头，「 这就是注意力机制的精髓。每个宇宙都不是孤立的，它们之间存在着某种神秘的联系。通过这种联系，我们可以找到那个能够打破悲剧循环的关键点。」

随着参数的调整，全息投影中的场景开始发生奇妙的变化。布鲁克林大桥上的坠落变成了浪漫的相拥，钟楼顶端的诀别化作了甜蜜的约会。每一个悲剧的结局都在被重新书写，就像扩散模型中的去噪过程，一步步还原出最纯净的图案。

「 看，」Gwen的声音因激动而微微发颤，「 当我们找到正确的参数组合时，就像找到了那个能够重构出happy ending的'潜在空间'。不是通过暴力，而是通过理解，通过爱，通过科学。」

最终，当新的宇宙在第617.5维度诞生时，两个身影站在钟楼顶端。这一次，坠落的不是Gwen，而是被神经网络预测轨迹精准接住的无人机群。它们在夜空中划出绚丽的轨迹，就像一个个被去除的噪声点，最终呈现出最纯净的图案。

「 看来，」Peter轻轻将Gwen搂入怀中，看着夜空中绚丽的轨迹，「 我们终于打破了那个该死的概率分布。」 -->

<!-- 教程主要内容：
1. 故事
2. 介绍Diffusion模型（DDPM和DDIM的数学原理简介）
3. 介绍并行方案和模式
4. 环境配置 + Profile模型主要使用策略

报告主要内容：
1. 单卡Baseline结果 10%
2. 单卡Profile结果 并分析性能瓶颈 15%
3. 单卡优化结果（更换更快的矩阵计算库、重叠通信流等方式）25%
4. 多卡方案设计（阅读Ultra-Scale PlayBook了解有什么并行策略，分析在DiT模型中最适合使用的模型并行策略有什么）20%
5. 多卡优化结果（使用数据并行/模型并行/序列并行等方式对DiT推理过程进行优化）30% -->