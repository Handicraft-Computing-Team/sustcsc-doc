<script setup>
import { ref, computed, onMounted } from 'vue'
import Papa from 'papaparse'

const basic_scores = ref([])
const advanced_scores = ref([])
const selectedTab = ref('basic')          // 👉 当前显示的赛道

// 读取 CSV
onMounted(async () => {
  const [basic_text, advanced_text] = await Promise.all([
    fetch('scores/basic_scores.csv').then(r => r.text()),
    fetch('scores/advanced_scores.csv').then(r => r.text()),
  ])

  basic_scores.value = Papa.parse(basic_text, { header: true, skipEmptyLines: true }).data.map(r => ({
    team_id: r.team_id,
    team:     r.team,
    C_CPP:    +r.C_CPP      || 0,
    Rust:     +r.Rust       || 0,
    CloverLeaf: +r.CloverLeaf || 0,
    total: +r.Total || 0,
  }))

  advanced_scores.value = Papa.parse(advanced_text, { header: true, skipEmptyLines: true }).data.map(r => ({
    team_id: r.team_id,
    team:     r.team,
    HGEMM:    +r.HGEMM || 0,
    DiT:      +r.DiT   || 0,
    WRF:      +r.WRF   || 0,
    total: +r.Total || 0,
  }))
})

// 排序后列表
const sortedBasic = computed(() =>
  [...basic_scores.value].sort((a, b) => b.total - a.total),
)
const sortedAdv = computed(() =>
  [...advanced_scores.value].sort((a, b) => b.total - a.total),
)
</script>

<template>
  <h2 class="page-title">🏅 实时排行榜</h2>

  <!-- 切换控件 -->
  <div class="segmented">
    <button
      :class="{ active: selectedTab === 'basic' }"
      @click="selectedTab = 'basic'"
    >
      基础赛道
    </button>
    <button
      :class="{ active: selectedTab === 'advanced' }"
      @click="selectedTab = 'advanced'"
    >
      进阶赛道
    </button>
    <!-- 滑块 -->
    <span
      class="glider"
      :style="{ transform: selectedTab === 'basic' ? 'translateX(0)' : 'translateX(100%)' }"
    />
  </div>

  <!-- 单张榜单，带动画 -->
  <transition name="slide-fade" mode="out-in">
    <!-- 基础榜单 -->
    <div
      v-if="selectedTab === 'basic'"
      key="basic"
      class="scoreboard-card basic glassy"
    >
      <h3>基础赛道</h3>
      <table class="scoreboard-table">
        <thead>
          <tr>
            <th>排名</th><th>队伍</th><th>C/CPP</th><th>Rust</th><th>CloverLeaf</th><th>最终总分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in sortedBasic" :key="row.team_id">
            <td>{{ i + 1 }}</td>
            <td>{{ row.team }}</td>
            <td>{{ row.C_CPP }}</td>
            <td>{{ row.Rust }}</td>
            <td>{{ row.CloverLeaf }}</td>
            <td class="total">{{ row.total.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 进阶榜单 -->
    <div
      v-else
      key="adv"
      class="scoreboard-card advanced glassy"
    >
      <h3>进阶赛道</h3>
      <table class="scoreboard-table">
        <thead>
          <tr>
            <th>排名</th><th>队伍</th><th>HGEMM</th><th>DiT</th><th>WRF</th><th>最终总分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in sortedAdv" :key="row.team_id">
            <td>{{ i + 1 }}</td>
            <td>{{ row.team }}</td>
            <td>{{ row.HGEMM }}</td>
            <td>{{ row.DiT }}</td>
            <td>{{ row.WRF }}</td>
            <td class="total">{{ row.total.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </transition>
</template>

<style>
/* ---------------- 基础色板 ---------------- */
:root {
  --basic-color:   #2BB7B3;
  --adv-color:     #ED6C00;
}

/* ---------------- 页面标题 ---------------- */
.page-title {
  text-align: center;
  margin: 2rem 0 1.5rem;
  font-size: 1.9rem;
  letter-spacing: 1px;
}

/* ---------------- Segmented Control ---------------- */
.segmented {
  position: relative;
  width: 320px;
  margin: 0 auto 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 100px;
  background: #eee;
  overflow: hidden;
  box-shadow: inset 0 0 6px rgba(0,0,0,0.12);
}
.segmented button {
  position: relative;     /* 新增 */
  z-index: 2;             /* 新增：确保文字永远在滑块之上 */
  padding: 0.7rem 0;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  transition: color 0.25s;
}
.segmented button.active { color: #000; }
.dark .segmented { background: #333; }
.dark .segmented button { color: #aaa; }
.dark .segment button.active { color: #fff; }

/* 滑块 */
.glider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 4px);
  height: calc(100% - 4px);
  background: linear-gradient(135deg, var(--basic-color), var(--adv-color));
  border-radius: 100px;
  transition: transform 0.35s ease;
  z-index: 1;
}

/* ---------------- 卡片 & 表格 ---------------- */
.scoreboard-card {
  display: flex; 
  flex-direction: column;
  align-items: center;
  max-width: 860px;
  margin: 0 auto 3rem;
  padding: 2rem 1.2rem 1.8rem;
  border-radius: 24px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: transform 0.25s ease;
}
.scoreboard-card:hover { transform: translateY(-6px); }

.glassy {
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 12px 30px rgba(0,0,0,0.09);
}
.dark .glassy {
  background: rgba(30, 30, 30, 0.55);
  box-shadow: 0 12px 26px rgba(0,0,0,0.55);
}

.scoreboard-card h3 {
  text-align: center;
  margin-bottom: 1.2rem;
  font-size: 1.4rem;
  letter-spacing: 1px;
}
.basic h3    { color: var(--basic-color); }
.advanced h3 { color: var(--adv-color); }

.scoreboard-table {
  width: auto !important;
  border-collapse: collapse;
  font-size: 1.05rem;
  margin: 0 auto;
}
.scoreboard-table thead tr {
  color: #fff;
  background: var(--basic-color);
}
.advanced .scoreboard-table thead tr {
  background: var(--adv-color);
}

.scoreboard-table th,
.scoreboard-table td {
  padding: 12px 10px;
  text-align: center;
}
.scoreboard-table tbody tr:nth-child(odd) { background: rgba(0,0,0,0.03); }
.advanced .scoreboard-table tbody tr:nth-child(odd) { background: rgba(255,125,0,0.06); }
.dark .scoreboard-table tbody tr:nth-child(odd) { background: rgba(255,255,255,0.05); }

.total {
  font-weight: 700;
  color: var(--basic-color);
}
.advanced .total { color: var(--adv-color); }

/* ---------------- 动画 ---------------- */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all .45s cubic-bezier(.45, .23, .21, 1.02);
}
.slide-fade-enter-from {
  opacity: 0; transform: translateY(30px);
}
.slide-fade-leave-to {
  opacity: 0; transform: translateY(-30px);
}

@media (max-width: 640px) {
  .scoreboard-table { width: 100% !important; }
  .scoreboard-card  { align-items: stretch; }  /* 小屏铺满 */
}
</style>
