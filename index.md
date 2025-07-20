---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "SUSTech"
  text: "SuperComputing Competition"
  image:
    src: /images/sustech.png
    alt: SUSTech SC
  actions:
    - theme: brand
      text: 欢迎来到SUSTCSC
      link: /pages/intro/welcome
    - theme: alt
      text: 基础赛道
      link: /pages/intro/basic
    - theme: alt
      text: 进阶赛道
      link: /pages/intro/advanced

features:
  - title: ☘️ 亮点 1：真·超算白嫖
    details: 科学与工程计算中心全天候开放资源，跑到爽。
  - title: 🚀 亮点 2：赛题够硬核
    details: C/C++并行编程，Rust编程，编译优化，通用矩阵乘法，AI生图，数值天气预报......
  - title: 🎓 亮点 3：官方培训带飞
    details: 6 天速成并行编程 + 性能调优，比赛期间随时答疑，零基础也能起飞。  
  - title: 🏆 亮点 4：奖项多到手软
    details: 基础 & 进阶双赛道冠军、单项性能奖、成功参与奖……来就有机会抱奖回家。

---

<ScoreBoard />
<Timeline :events="events" />
<script setup>
import ScoreBoard from './components/ScoreBoard.vue'
import Timeline from './components/Timeline.vue'

const events = [
  {
    date: '2025-06-25',
    title: '📝 报名截止',
    description: '参赛报名最后一天，请务必在此日期前完成注册并提交队伍信息。',
  },
  {
    date: '2025-06-28',
    title: '🎓 培训营开始',
    description: '官方培训营正式启动，6 天速成并行编程与性能调优，由超算队资深成员全程带飞。',
  },
  {
    date: '2025-07-04',
    title: '🏁 培训营结束',
    description: '培训营圆满收官，学员将整理所学知识，为正式比赛做好准备。',
  },
  {
    date: '2025-07-07 00:00',
    title: '🚀 比赛正式开始',
    description: '比赛正式开始，参赛队伍可开始提交解决方案。',
  },
  {
    date: '2025-08-01 23:59',
    title: '⏰ 比赛结束',
    description: '最终提交截止时间，参赛队伍须在此之前完成所有结果的上传。',
  },
  {
    date: '2025-08-15 18:00',
    title: '📢 成绩公布',
    description: '比赛成绩将在赛后统一公示，请关注官方通知以获取具体发布时间。',
  },
  {
    date: 'TBD',
    title: '🏆 颁奖典礼',
    description: '颁奖典礼将在成绩公布后举行，届时将为获奖队伍颁发各类奖项。',
  },
];

</script>

