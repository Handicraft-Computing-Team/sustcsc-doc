---
title: SUSTCSC
---

<script setup>
// 图片轮播部分保持不变
import ASCImageCarousel from '../../components/ASCImageCarousel.vue'

const ascImages = [
  '/sustcsc-doc/welcome/ASC/ASC24大合照.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24队员赖海斌在压功耗.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24比赛中.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24队员与图灵奖得主Dongarra合照.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24队员邱俊杰与德国友人合照.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24集群搭建.jpg',
  '/sustcsc-doc/welcome/ASC/ASC24颁奖.jpg',
  '/sustcsc-doc/welcome/ASC/ASC十周年蛋糕.jpg',
  '/sustcsc-doc/welcome/ASC/ASC22-23晚宴.jpg',
  '/sustcsc-doc/welcome/ASC/ASC22-23颁奖.jpg',
]

const ascCaptions = [
  'ASC24大合照',
  'ASC24队员赖海斌在压功耗',
  'ASC24比赛中',
  'ASC24队员与图灵奖得主Dongarra合照',
  'ASC24队员邱俊杰与德国友人合照',
  'ASC24集群搭建',
  'ASC24颁奖',
  'ASC十周年蛋糕',
  'ASC22-23晚宴',
  'ASC22-23颁奖'
]

const otherImages = [
    '/sustcsc-doc/welcome/others/2023_华为鲲鹏应用创新大赛.jpg',
    '/sustcsc-doc/welcome/others/2024_SC24_IndySCC_美国-亚特兰大.jpg',
    '/sustcsc-doc/welcome/others/2024_SCA2024_澳大利亚-悉尼.jpg',
    '/sustcsc-doc/welcome/others/2025_SCA2025_新加坡.JPG',
]

const otherCaptions = [
    '2023华为鲲鹏应用创新大赛',
    '2024 SC24 IndySCC24（美国-亚特兰大）',
    '2024 SCA2024（澳大利亚-悉尼）',
    '2025 SCA2025（新加坡）'
]
</script>

<ClientOnly />

# 欢迎来到第二届南科大校内超算比赛！

> 作者：[wojiao-yc](https://wojiao-yc.github.io/)
> 
> 📱 技术交流QQ群：**897073438**

## 关于 SUSTCSC

SUSTCSC（Southern University of Science and Technology Supercomputing Challenge，南方科技大学超算挑战赛）是南科大面向全校学生举办的高性能计算与人工智能主题赛事。大赛聚焦于并行编程、系统优化、AI推理、科学计算等前沿领域，旨在为同学们搭建一个**学习、实践与交流的高水平平台**。

本赛事不仅是一次技术能力的比拼，更是南科大超算队每年最重要的**招新窗口**。我们希望通过真实的赛题、丰富的实战训练和开放的技术氛围，吸引更多对高性能计算、AI、系统优化等方向感兴趣的同学加入团队，共同成长、共同进步。

### 比赛宗旨

- **招新选拔**：通过比赛发掘并培养有潜力的同学，壮大南科大超算队，为后续参加国际国内各类超算赛事储备人才。
- **学习交流**：为全校同学提供一个深入了解高性能计算、并行编程、AI优化等领域的机会，促进跨学科技术交流与合作。
- **能力提升**：通过真实赛题和团队协作，提升参赛者在系统搭建、性能调优、算法实现、科研复现等多方面的综合能力。

### 参赛对象

无论你是计算机、数学、物理、电子、自动化，还是其他专业，只要对高性能计算、AI、系统优化等方向感兴趣，都欢迎报名参赛！零基础同学也可通过官方培训快速入门。

## 关于超算比赛

超算比赛是以高性能计算（HPC）为核心的大学生竞赛，参赛队伍需要在 **限定的功耗约束下**，**搭建并优化一个小型超级计算集群**，完成一系列具有挑战性的计算任务。这类比赛结合了硬件架构、系统部署、软件调优、并行计算、人工智能、可视化、科研复现等多方面技能，目标是**考验学生的综合能力**。  

### 核心内容有什么？
- **系统搭建与优化**：服务器配置、网络架构、功耗控制、容错机制  
- **软件调优与编译**：科学应用适配、高效并行、数学库优化、容器化部署  
- **科研复现能力**：论文级任务运行、实验可重复性、数据一致性  
- **软技能要求**：团队协作、技术报告撰写、答辩演讲、现场问题应对  


### 比赛都要干什么？

比赛通常分为如下几个阶段，每一环都需要细致准备与实战应对：

| 阶段 | 工作内容 | 重点技能 |
| ----- | ------ | -------- |
| 系统设计 | 服务器选型、GPU/加速卡搭配、功耗预算配置 | 架构理解、预算控制 |
| 应用准备 | 编译与适配竞赛指定程序，如HPL、HPCG、AI模型等 | 并行计算、调库能力 |
| 性能调优 | CPU亲和性设置、GPU通信优化、并行参数调整 | 性能分析、热数据路径优化 |
| 功耗控制 | BIOS调节、能效比优化、动态调频调速 | 电源管理、风扇/频率控制 |
| 现场展示 | 技术答辩、英文汇报、应用结果展示 | 技术沟通、表达力 |

### 📘 阅读推荐
[超算竞赛入门导引（PDF）](/welcome/超算竞赛导引.pdf)

---

## 🏆 我们的参赛历程

南科大超算队自参加了各类国际学生超算赛事，积累了丰富的比赛经验和一系列奖项。以下是部分代表性成果：

### ASC Student Supercomputer Challenge

ASC（亚洲学生超级计算机竞赛）是世界规模最大的学生超算赛事之一。其特点是规模大、题目新、挑战性强，常见应用涵盖气象模拟、生物信息学、人工智能等前沿领域。

#### 我们的战绩
| 年份 | 成绩 | 特别奖项 |
| ---- | ---- | -------- |
| ASC-19 | 一等奖（第7名） | 最具人气团队、应用创新奖（ShengBTE） |
| ASC-21 | 一等奖（第5名） | -- |
| ASC-22 23 | 一等奖 | Super Team 奖 |
| ASC-24 | 一等奖 | Super Team 奖 |

#### ASC 比赛深度剖析

**ASC 的几大亮点：**
1. **任务复杂**：从量子化学到生物信息，题目具有高科研门槛。
2. **算力自由**：使用自带服务器，允许高度个性化的硬件设计。
3. **国际氛围**：来自全球 300+ 所高校的报名，入围难度大。
4. **Super Team 合作**：鼓励跨队跨国协作完成"极限"题目。

**往届典型题目示例**：
- 量子力学模拟：Quantum ESPRESSO / VASP
- AI大模型：Transformer推理优化 / Tensor Parallel / deepseek
- 气象模拟：WRF（天气研究与预报）
- 高性能基准：HPL、HPCG

#### ASC 精彩瞬间

<ASCImageCarousel 
  :images="ascImages" 
  :captions="ascCaptions"
  :autoplay="true" 
  :interval="3500" 
/>

### 其他赛事经历

| 年度/届次 | 赛事名称 | 奖项/荣誉 | 备注 |
|-----------|----------|-----------|------|
| 2020-2024 | APAC HPC-AI | 冠军 1次、亚军 2次、季军 2次、AI特别奖 1次 | 高性能计算与AI国际赛事 |
| 2021 | SC21 国际超算竞赛 | 季军、最高性能奖 | 世界最老牌超算竞赛 |
| 2022 | IndySCC 国际超算竞赛 | 亚军、HPL挑战赛亚军 | 美国独立赛，主打远程实操 |
| 2022 | ISC22 国际超算竞赛 | 季军 | 德国国际超级计算大会 |
| 2023 | 先导杯计算应用大奖赛 | 华南赛区一等奖 | 计算应用创新赛事 |
| 2023 | 鲲鹏应用创新大赛 | 广东省金奖 | 华为主办高性能竞赛 |
| 2024 | 全国大学生计算机系统能力大赛（先导杯） | 全国三等奖 | 智能计算创新设计赛 |
| 2024 | 昇思MindSpore模型开发挑战赛 | 第一阶段金奖、第二阶段铜奖 | AI模型开发赛事 |
| 2024 | 鲲鹏应用创新大赛 | 广东省铜奖、最具潜力奖 | 华为主办高性能竞赛 |
| 2025 | 第九届华为ICT大赛挑战赛 | 全国三等奖 | 华为ICT创新赛事 |

<ASCImageCarousel 
  :images="otherImages" 
  :captions="otherCaptions"
  :autoplay="true" 
  :interval="3500" 
/>

## 📢 加入我们！

在体验了SUSTCSC的比赛后，如果你仍然对以下方面和内容感兴趣，欢迎跟我们一起，让机器燃烧起来🔥
- 对操作系统、Linux、容器、并行程序感兴趣  
- 熟悉 GPU、FPGA、AI 框架的软硬件结合者  
- 喜欢调试、性能分析和解决技术难题  
- 愿意团队协作并能适应高压赛场环境  

> **We build. We compute. We optimize. We win.**

