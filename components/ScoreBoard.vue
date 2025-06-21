<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'

const basic_scores = ref([])
const advanced_scores = ref([])

onMounted(async () => {
  const basic_res = await fetch('scores/basic_scores.csv')
  const basic_text = await basic_res.text()
  const advanced_res = await fetch('scores/advanced_scores.csv')
  const advanced_text = await advanced_res.text()

  const basic_parsed = Papa.parse(basic_text, { header: true, skipEmptyLines: true })
  const advanced_parsed = Papa.parse(advanced_text, { header: true, skipEmptyLines: true })

  basic_scores.value = basic_parsed.data.map(row => ({
    team_id: row.team_id,
    team: row.team,
    C_CPP: Number(row.C_CPP) || 0,
    Rust: Number(row.Rust) || 0,
    CloverLeaf: Number(row.CloverLeaf) || 0,
    basicTotal:
      (Number(row.C_CPP) || 0) +
      (Number(row.Rust) || 0) +
      (Number(row.CloverLeaf) || 0),
  }))
  advanced_scores.value = advanced_parsed.data.map(row => ({
    team_id: row.team_id,
    team: row.team,
    HGEMM: Number(row.HGEMM) || 0,
    DiT: Number(row.DiT) || 0,
    WRF: Number(row.WRF) || 0,
    advTotal:
      (Number(row.HGEMM) || 0) +
      (Number(row.DiT) || 0) +
      (Number(row.WRF) || 0),
  }))
})
</script>

<template>
  <h2 style="text-align:center;margin-top:2em;">🏅 实时排行榜</h2>
  <div class="scoreboard-flex">
    <!-- 基础赛道 -->
    <div class="scoreboard-card basic">
      <h3>基础赛道</h3>
      <table class="scoreboard-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>队伍</th>
            <th>C/CPP</th>
            <th>Rust</th>
            <th>CloverLeaf</th>
            <th>小计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in [...basic_scores].sort((a,b)=>b.basicTotal-a.basicTotal)" :key="row.team_id">
            <td>{{ idx + 1 }}</td>
            <td>{{ row.team }}</td>
            <td>{{ row.C_CPP }}</td>
            <td>{{ row.Rust }}</td>
            <td>{{ row.CloverLeaf }}</td>
            <td class="scoreboard-total">{{ row.basicTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 进阶赛道 -->
    <div class="scoreboard-card advanced">
      <h3>进阶赛道</h3>
      <table class="scoreboard-table">
        <thead>
          <tr>
            <th>排名</th>
            <th>队伍</th>
            <th>HGEMM</th>
            <th>DiT</th>
            <th>WRF</th>
            <th>小计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in [...advanced_scores].sort((a,b)=>b.advTotal-a.advTotal)" :key="row.team_id">
            <td>{{ idx + 1 }}</td>
            <td>{{ row.team }}</td>
            <td>{{ row.HGEMM }}</td>
            <td>{{ row.DiT }}</td>
            <td>{{ row.WRF }}</td>
            <td class="scoreboard-total">{{ row.advTotal }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.scoreboard-flex {
  display: flex;
  gap: 2em;
  flex-wrap: wrap;
  justify-content: center;
}

.scoreboard-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5em 1em 1.2em;
  min-width: 340px;
  max-width: 800px;
  margin-bottom: 2em;
  transition: transform 0.2s ease;
}
.scoreboard-card:hover {
  transform: translateY(-3px);
}

.scoreboard-card h3 {
  text-align: center;
  margin-bottom: 1em;
  font-size: 1.3em;
  letter-spacing: 1px;
}

.scoreboard-card.basic h3 {
  color: #2BB7B3;
}
.scoreboard-card.advanced h3 {
  color: #ED6C00;
}

.scoreboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.05em;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.scoreboard-table thead tr {
  background: linear-gradient(90deg, #2BB7B3 60%, #7DE5DF 100%);
  color: #fff;
}
.scoreboard-card.advanced .scoreboard-table thead tr {
  background: linear-gradient(90deg, #ED6C00 60%, #FFA94D 100%);
}

.scoreboard-table th,
.scoreboard-table td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.scoreboard-table tbody tr:nth-child(even) {
  background: #f9f9f9;
}
.scoreboard-card.advanced .scoreboard-table tbody tr:nth-child(even) {
  background: #fff7f3;
}

.scoreboard-table tbody tr:hover {
  background-color: #f0fdfa;
}
.scoreboard-card.advanced .scoreboard-table tbody tr:hover {
  background-color: #fff0e5;
}

.scoreboard-total {
  font-weight: 700;
  color: #2BB7B3;
  font-size: 1.1em;
}
.scoreboard-card.advanced .scoreboard-total {
  color: #ED6C00;
}

/* Style for dark style */
.dark .scoreboard-card {
    background: #1e1e1e;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.dark .scoreboard-table {
  background: #1e1e1e;
  color: #e0e0e0;
}

.dark .scoreboard-table thead tr {
  background: linear-gradient(90deg, #2BB7B3 60%, #1DA7A1 100%);
  color: #fff;
}

.dark .scoreboard-card.advanced .scoreboard-table thead tr {
  background: linear-gradient(90deg, #ED6C00 60%, #cc5700 100%);
}

.dark .scoreboard-table tbody tr:nth-child(even) {
  background: #2a2a2a;
}

.dark .scoreboard-card.advanced .scoreboard-table tbody tr:nth-child(even) {
  background: #2f2118;
}

.dark .scoreboard-table tbody tr:hover {
  background-color: #2d3f3f;
}

.dark .scoreboard-card.advanced .scoreboard-table tbody tr:hover {
  background-color: #3e2b1e;
}

.dark .scoreboard-total {
  color: #2BB7B3;
}

.dark .scoreboard-card.advanced .scoreboard-total {
  color: #ED6C00;
}

</style>
