<script setup>
import { ref } from 'vue'

const id = ref('')
const no = ref('')
const result = ref(null)
const loading = ref(false)
const error = ref(null)

// Simple XOR cipher function for decryption
function xor_cipher(data, key) {
  let result = ''
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

const queryCluster = async () => {
  if (!no.value || !id.value) {
    error.value = '请填写学号和序号'
    return
  }

  loading.value = true
  error.value = null
  result.value = null

  try {
    const key = String(no.value).trim() + String(id.value).trim()
    const filename = String(no.value).trim()

    const res = await fetch(`../../password/${filename}`)

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('未找到对应的用户信息')
      }
      throw new Error(`查询失败: ${res.status} ${res.statusText}`)
    }

    const base64EncryptedData = await res.text()

    // Decode from Base64, then decrypt with XOR
    const encryptedData = atob(base64EncryptedData)
    const decryptedText = xor_cipher(encryptedData, key)

    const user = JSON.parse(decryptedText)

    if (user && user.username && user.password) {
      result.value = { username: user.username, password: user.password }
    } else {
      throw new Error('解密后的数据格式不正确')
    }
  } catch (e) {
    error.value = e.message || '查询过程中发生错误'
    result.value = null
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="query-container">
    <form @submit.prevent="queryCluster">
      <label>
        序号（NO）:
        <input v-model="no" type="text" required placeholder="请输入队伍序号" />
      </label>
      <label>
        学号（ID）:
        <input v-model="id" type="text" required placeholder="请输入队长学号" />
      </label>
      <button type="submit">查询</button>
    </form>

    <div v-if="loading" class="loading">查询中...</div>
    <div v-if="error" class="error">❌ {{ error }}</div>

    <div v-if="result" class="result-container">
      <h3>查询结果</h3>
      <p><strong>用户名:</strong> {{ result.username }}</p>
      <p><strong>密码:</strong> {{ result.password }}</p>
    </div>
  </div>
</template>

<style scoped>
.query-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.query-container:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background-color: var(--vp-c-white);
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  width: 100%;
}

button:hover {
  background-color: var(--vp-c-brand-soft);
}

.error,
.loading {
  margin-top: 1.5rem;
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
}

.error {
  color: var(--vp-c-danger-1);
  background-color: var(--vp-c-danger-soft);
}

.loading {
  color: var(--vp-c-text-2);
}

.result-container {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-2);
  border-radius: 8px;
}

.result-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--vp-c-brand-1);
  border-bottom: 1px solid var(--vp-c-brand-2);
  padding-bottom: 0.5rem;
}

.result-container p {
  margin: 0.5rem 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.result-container p strong {
  color: var(--vp-c-text-2);
  margin-right: 0.5rem;
}
</style>
