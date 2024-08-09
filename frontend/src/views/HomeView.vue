<script setup>
import { ref, onMounted, inject } from 'vue'
import { formatDistanceStrict } from 'date-fns'
import { useRouter } from 'vue-router'
const router = useRouter()

const userRole = inject('userRole')
const highlightedEvents = ref([])
const recentEvents = ref([])

const getEvents = async () => {
  try {
    const response = await fetch('/api')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const json = await response.json()
    highlightedEvents.value = json.highlightedEvents
    recentEvents.value = json.recentEvents
  } catch (error) {
    console.error('Fetch failed:', error)
  }
}

// const userRole = ref('')

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

onMounted(() => {
  // location.reload()
  getEvents()
})
</script>

<template>
  <main>
    <div class="container-fluid">
      <!-- Highlighted events carousel -->
      <div
        id="carouselExampleIndicators"
        class="carousel slide"
        data-bs-ride="carousel"
      >
        <div class="carousel-indicators">
          <button
            v-for="(event, index) in highlightedEvents"
            :key="event._id"
            type="button"
            data-bs-target="#carouselExampleIndicators"
            :data-bs-slide-to="index"
            :class="{ active: index === 0 }"
          ></button>
        </div>
        <div class="carousel-inner">
          <div
            v-for="(event, index) in highlightedEvents"
            :key="event._id"
            class="carousel-item"
            :class="{ active: index === 0 }"
          >
            <router-link :to="'/event/detail/' + event._id">
              <img
                :src="event.eventImage"
                class="card-img-carousel img-fluid"
                alt="Event Image"
                style="width: 100%; height: 20vw; object-fit: cover"
              />
            </router-link>
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#carouselExampleIndicators"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>

      <br />

      <ul class="nav nav-tabs">
        <li class="nav-item">
          <router-link class="nav-link active" aria-current="page" to="#"
            >Recent</router-link
          >
        </li>
      </ul>

      <!-- Recent events cards -->
      <div class="row mb-3 d-flex align-items-stretch" id="cardContainer">
        <div class="col-md-4" v-for="event in recentEvents" :key="event._id">
          <div class="card">
            <router-link :to="'/event/detail/' + event._id">
              <img
                :src="event.eventImage"
                class="card-img-top img-fluid"
                alt="Event Image"
              />
            </router-link>
            <div class="card-body">
              <h5 class="card-title card-title-new">{{ event.eventTitle }}</h5>
              <p class="card-text card-text-body">
                {{ event.eventDescription }}
                <br /><br />
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
                  v-if="userRole === 'volunteer'"
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
    </div>
  </main>
</template>
