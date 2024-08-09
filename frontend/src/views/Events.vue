<script setup>
import { ref, onMounted, watch } from 'vue'
import { formatDistanceStrict } from 'date-fns'
import { useRoute, useRouter } from 'vue-router'

import BreadCrumb from '../components/BreadCrumb.vue'
import { inject } from 'vue'

const userRole = inject('userRole')

const router = useRouter()
const events = ref([])
const totalPages = ref(0)
const loading = ref(false)
let page = ref(1)
let perPage = ref(6)

const keyword = ref('')

const route = useRoute() // get the current route

const editEvent = (eventId) => {
  router.push('/event/edit/' + eventId)
}

const joinEvent = async (eventId) => {
  console.log(eventId.toString())
  const response = await fetch(`/api/volunteer/event/join/${eventId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

  const responseData = await response.json()

  if (response.ok) {
    alert(responseData.message) // Display the success message
  } else {
    throw new Error(response.statusText)
  }
}

const getEvents = () => {
  const titleParam = keyword.value || ''
  let params = [`page=${page.value}`, `perPage=${perPage.value}`]
  if (titleParam) {
    params.push(`title=${titleParam}`)
  }
  params = params.join('&')
  loading.value = true
  fetch(`/api/event?${params}`)
    .then((response) => response.json())
    .then((result) => {
      totalPages.value = result.totalPages
      console.log(totalPages.value)
      events.value = result.events
      loading.value = false
    })
    .catch((error) => {
      events.value = []
      totalPages.value = 0
      loading.value = false
      throw error
    })
}
// watch the route query and update the keyword when it changes
watch(
  () => route.query.title,
  (newKeyword) => {
    keyword.value = newKeyword
    getEvents()
  },
  { immediate: true }
)

const onPageChange = (p) => {
  page.value = p
  getEvents()
}

onMounted(() => {
  getEvents()
  // getUserRole()
})
</script>

<template>
  <div class="container-fluid">
    <br />
    <div class="row mb-3">
      <div class="col-sm-6">
        <BreadCrumb />
      </div>
      <div
        class="col-sm-6 text-end"
        v-if="route.name === 'events' && userRole == 'admin'"
      >
        <router-link to="/event/new" class="btn btn-primary">New</router-link>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-4" v-for="event in events" :key="event._id">
        <div class="card">
          <a :href="'/event/detail/' + event._id">
            <img
              :src="event.eventImage"
              class="card-img-top"
              alt="Event Image"
            />
          </a>
          <div class="card-body">
            <h5
              class="card-title card-title-new"
              style="text-overflow: ellipsis"
            >
              {{ event.eventTitle }}
            </h5>
            <p class="card-text card-text-body" style="text-overflow: ellipsis">
              {{ event.eventDescription }}
              <br />
              <br />
            </p>
            <small class="text-muted">
              Last updated
              {{
                formatDistanceStrict(new Date(event.modifiedAt), Date.now(), {
                  addSuffix: true,
                })
              }}
            </small>
            <div class="text-end">
              <button
                v-if="userRole === 'admin'"
                @click="editEvent(event._id)"
                class="btn btn-primary"
              >
                Edit
              </button>
              <button
                v-else-if="userRole === 'volunteer'"
                @click="joinEvent(event._id)"
                class="btn btn-outline-primary"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li
          class="page-item"
          v-for="i in Array.from({ length: totalPages }, (_, i) => i + 1)"
          :key="i"
          :class="{ active: i === page }"
        >
          <a class="page-link" @click="onPageChange(i)">
            {{ i }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>
