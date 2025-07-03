<template>
 <h2 class="page-title">🚀 比赛时间线</h2>
  <div class="timeline-container">
    <!-- Navigation Arrows -->
    <button @click="scrollPrev" class="arrow-button left">
      &#10094;
    </button>
    <button @click="scrollNext" class="arrow-button right">
      &#10095;
    </button>

    <!-- Timeline content -->
    <div
      ref="timeline"
      class="timeline"
      @mousedown="onDragStart"
      @mouseup="onDragEnd"
      @mouseleave="onDragEnd"
      @mousemove="onDragMove"
    >
      <div
        v-for="(item, idx) in events"
        :key="idx"
        class="timeline-item"
      >
        <div class="card">
          <div class="card-header">
            <div class="card-date">{{ item.date }}</div>
            <div class="card-title">{{ item.title }}</div>
          </div>
          <div class="card-desc">
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  events: { date: string; title: string; description: string }[];
}>();

const timeline = ref<HTMLElement | null>(null);

// Arrow scroll
function scrollNext() {
  if (timeline.value) timeline.value.scrollBy({ left: 300, behavior: 'smooth' });
}
function scrollPrev() {
  if (timeline.value) timeline.value.scrollBy({ left: -300, behavior: 'smooth' });
}

// Drag to scroll
const isDragging = ref(false);
let startX = 0;
let scrollLeft = 0;

function onDragStart(event: MouseEvent) {
  if (!timeline.value) return;
  isDragging.value = true;
  timeline.value.classList.add('dragging');
  startX = event.pageX - timeline.value.offsetLeft;
  scrollLeft = timeline.value.scrollLeft;
}
function onDragEnd() {
  if (!timeline.value) return;
  isDragging.value = false;
  timeline.value.classList.remove('dragging');
}
function onDragMove(event: MouseEvent) {
  if (!isDragging.value || !timeline.value) return;
  event.preventDefault();
  const x = event.pageX - timeline.value.offsetLeft;
  const walk = (x - startX) * 1.5;
  timeline.value.scrollLeft = scrollLeft - walk;
}
</script>

<style scoped>
.timeline-container {
    position: relative;
    width: 100%;
    padding: 2rem 0;
    background: linear-gradient(120deg, rgba(255, 127, 80, 0.6), rgba(32, 178, 170, 0.6));
    overflow: hidden;
    border-radius: 2rem;
    user-select: none;
}

.arrow-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: background 0.3s, transform 0.3s;
  z-index: 10;
}
.arrow-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-50%) scale(1.1);
}
.arrow-button.left { left: 1rem; }
.arrow-button.right { right: 1rem; }

.timeline {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0 4rem;
  scroll-behavior: smooth;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.timeline::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.timeline.dragging {
  cursor: grabbing;
}

.timeline-item {
  flex: 0 0 auto;
  width: 260px;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
  user-select: none;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 0.75rem;
  user-select: none;
}

.card-date {
  font-size: 0.875rem;
  color: #555;
  user-select: none;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ff7f50;
  user-select: none;
}

.card-desc {
  font-size: 0.9375rem;
  color: #374151;
  margin-top: 0.5rem;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.4s ease, max-height 0.4s ease;
  user-select: none;
}
.card:hover .card-desc {
  opacity: 1;
  max-height: 150px;
}
</style>