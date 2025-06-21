# 超算比赛介绍手册

## 一、💻 什么是超算比赛？  

超算比赛是以高性能计算（HPC）为核心的大学生竞赛，参赛队伍需要在 **限定的功耗约束下**，**搭建并优化一个小型超级计算集群**，完成一系列具有挑战性的计算任务。这类比赛结合了硬件架构、系统部署、软件调优、并行计算、人工智能、可视化、科研复现等多方面技能，目标是**考验学生的综合能力**。  

### 1.1 核心内容有什么？
- **系统搭建与优化**：服务器配置、网络架构、功耗控制、容错机制  
- **软件调优与编译**：科学应用适配、高效并行、数学库优化、容器化部署  
- **科研复现能力**：论文级任务运行、实验可重复性、数据一致性  
- **软技能要求**：团队协作、技术报告撰写、答辩演讲、现场问题应对  


### 1.2 比赛都要干什么？

比赛通常分为如下几个阶段，每一环都需要细致准备与实战应对：

| 阶段 | 工作内容 | 重点技能 |
| ----- | ------ | -------- |
| 系统设计 | 服务器选型、GPU/加速卡搭配、功耗预算配置 | 架构理解、预算控制 |
| 应用准备 | 编译与适配竞赛指定程序，如HPL、HPCG、AI模型等 | 并行计算、调库能力 |
| 性能调优 | CPU亲和性设置、GPU通信优化、并行参数调整 | 性能分析、热数据路径优化 |
| 功耗控制 | BIOS调节、能效比优化、动态调频调速 | 电源管理、风扇/频率控制 |
| 现场展示 | 技术答辩、英文汇报、应用结果展示 | 技术沟通、表达力 |

### 📘 阅读推荐：  
[超算竞赛入门导引（PDF）](/welcome/超算竞赛导引.pdf)

---

## 二、 🏆 我们的参赛历程

南科大超算队自参加了各类国际学生超算赛事，积累了丰富的比赛经验和一系列奖项。以下是部分代表性成果：

### 2.1 ASC Student Supercomputer Challenge

ASC（亚洲学生超级计算机竞赛）是世界规模最大的学生超算赛事之一。其特点是规模大、题目新、挑战性强，常见应用涵盖气象模拟、生物信息学、人工智能等前沿领域。

#### 2.1.1 我们的战绩
| 年份 | 成绩 | 特别奖项 |
| ---- | ---- | -------- |
| ASC-19 | 一等奖（第7名） | 最具人气团队、应用创新奖（ShengBTE） |
| ASC-21 | 一等奖（第5名） | -- |
| ASC-22 23 | 一等奖 | Super Team 奖 |
| ASC-24 | 一等奖 | Super Team 奖 |

#### 2.1.2 ASC 比赛深度剖析

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


#### 2.1.3 ASC 精彩瞬间

<script setup>
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

<ASCImageCarousel 
  :images="ascImages" 
  :captions="ascCaptions"
  :autoplay="true" 
  :interval="3500" 
/>




### 2.2 其他赛事经历

| 年度 | 赛事 | 奖项 | 简要说明 |
| ---- | ---- | ---- | -------- |
| 2019 | APAC HPC-AI | 季军 | 亚太高性能计算与AI挑战赛 |
| 2020 | SC20 VSCC | miniVite 亚军 / HPL 季军 | 美国超算大会虚拟赛 |
| 2021 | APAC HPC-AI | 冠军 + AI特别奖 | 提交最佳AI推理模型 |
| 2021 | SC21 SCC | 季军 + Linpack最高分 | 世界最老牌超算竞赛 |
| 2022 | ISC22 SCC | 季军 | 德国国际超级计算大会 |
| 2022 | IndySCC | 亚军 + Hero HPL | 美国独立赛，主打远程实操 |
| 2023 | Kunpeng Innovation | 一等奖 | 华为鲲鹏生态高性能竞赛 |
| 2024 | APAC HPC-AI | 季军 | 任务涵盖AI部署与分布式系统 |

<ASCImageCarousel 
  :images="otherImages" 
  :captions="otherCaptions"
  :autoplay="true" 
  :interval="3500" 
/>
 

---

## 三、📢 加入我们！

欢迎对以下方向有兴趣的同学加入：

- 对操作系统、Linux、容器、并行程序感兴趣  
- 熟悉 GPU、FPGA、AI 框架的软硬件结合者  
- 喜欢调试、性能分析和解决技术难题  
- 愿意团队协作并能适应高压赛场环境  


 
📱 技术交流QQ群：**897073438**




> **We build. We compute. We optimize. We win.**

**作者：[wojiao-yc](https://wojiao-yc.github.io/)**