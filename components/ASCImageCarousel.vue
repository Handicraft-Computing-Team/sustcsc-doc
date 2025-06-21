<template>
  <div class="asc-carousel">
    <img :src="images[current]" :alt="'ASC照片 ' + (current + 1)" class="main-image" />
    <div class="caption">{{ captions[current] || '' }}</div>
    <button @click="prev" class="asc-btn left">‹</button>
    <button @click="next" class="asc-btn right">›</button>
    <div class="asc-indicator">{{ current + 1 }} / {{ images.length }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 新增 captions props
const props = defineProps({
  images: { type: Array, required: true },
  captions: { type: Array, default: () => [] },
  autoplay: { type: Boolean, default: true },
  interval: { type: Number, default: 5000 }
})

const current = ref(0)

function prev() {
  current.value = (current.value - 1 + props.images.length) % props.images.length
}
function next() {
  current.value = (current.value + 1) % props.images.length
}

let timer = null
onMounted(() => {
  if (props.autoplay) {
    timer = setInterval(next, props.interval)
  }
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.asc-carousel {
  position: relative;
  max-width: 600px;
  margin: 24px auto;
}
.main-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  transition: opacity 0.5s ease-in-out;
}
.caption {
  margin-top: 8px;
  text-align: center;
  font-size: 1rem;
  color: #333;
  font-weight: bold;
}
.asc-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  z-index: 2;
}
.asc-btn.left {
  left: 0;
}
.asc-btn.right {
  right: 0;
}
.asc-indicator {
  position: absolute;
  bottom: 8px;
  right: 16px;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.9rem;
}
</style>
