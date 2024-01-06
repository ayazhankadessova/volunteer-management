<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb d-inline-flex p-2 bg-light">
      <li class="breadcrumb-item"><a href="/">Home</a></li>
      <li v-if="level2Titles[route.name]" class="breadcrumb-item">
        <a :href="level2Titles[route.name].url">{{
          level2Titles[route.name].title
        }}</a>
      </li>
      <li
        v-if="levelEndingTiles.filter((o) => o.name == route.name).length > 0"
        class="breadcrumb-item"
      >
        <span>{{
          levelEndingTiles.filter((o) => o.name == route.name)[0].title
        }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
const userRole = inject('userRole')
const route = useRoute()
const props = defineProps({
  eventTitle: {
    type: String,
    required: false,
  },
})

let level2Titles = ref({
  'create-event': { title: 'Events', url: '/event' },
  'update-event': { title: 'Events', url: '/event' },
  'view-event': { title: 'Events', url: '/event' },
  'update-volunteer': { title: 'Volunteers', url: '/volunteer' },
  // 'view-event': 'Events'
})

let levelEndingTiles = ref([
  { name: 'events', title: 'Events' },
  { name: 'update-event', title: 'Edit Event' },
  ,
  {
    name: 'create-event',
    title: 'New event',
  },
  ,
  // { name: 'update-event', title: 'Edit Event' },
  { name: 'become-volunteer', title: 'Become Volunteer' },
  { name: 'view-volunteers', title: 'Volunteers' },
  { name: 'update-volunteer', title: 'Edit' },
  { name: 'event-search', title: 'Search' },
])

onMounted(() => {
  // if (levelEndingTiles.value[route.name]) {
  //   levelEndingTiles.value[route.name] = { title: props.eventTitle }
  // }
  // if userRole.value is 'admin', change 'become-volunteer' title to 'Create Volunteer'
  if (userRole.value === 'admin') {
    let volunteerTile = levelEndingTiles.value.find(
      (title) => title && title.name === 'become-volunteer'
    )
    if (volunteerTile) {
      volunteerTile.title = 'Create Volunteer'
    }
  }
  console.log(route.name, props.eventTitle, levelEndingTiles.value.length)
  if (props.eventTitle) {
    levelEndingTiles.value.push({
      name: route.name,
      title: props.eventTitle,
    })
  }
  console.log(levelEndingTiles.value.length)
})
</script>

<style scoped>
.breadcrumb {
  border-radius: 10px;
  /* margin-left: 15px; */
}
</style>
