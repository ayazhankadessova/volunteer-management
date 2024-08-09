<script setup>
// import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const options = ref({})
// const series = ref([44, 55, 41, 17, 15])

const series = ref([])

onMounted(async () => {
  let response = await fetch('/api/volunteer/stats/eventOrganizer', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  let json = await response.json()
  options.value = { labels: json.map((item) => item._id) }
  series.value = json.map((item) => item.total)
})
</script>

<template>
  <div>
    <apexchart type="donut" :options="options" :series="series" />
  </div>
</template>
