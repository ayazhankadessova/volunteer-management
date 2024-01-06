<script setup>
import { ref, onMounted, inject, watchEffect } from 'vue'
import { formatDistanceStrict } from 'date-fns'
import { useRoute, useRouter } from 'vue-router'
import DonutChart from '../components/DonutChart.vue'

const router = useRouter()
const userRole = inject('userRole')
const events = ref([])
const totalPages = ref(0)
const loading = ref(false)
let page = ref(1)
let perPage = ref(3)
// const highlightedEvents = ref([])

const volunteer = ref({
  name: '',
  email: '',
  password: '',
  contact: '',
  age_group: '',
  about_me: '',
  terms_condition: false,
})
const submitVolunteer = async () => {
  const response = await fetch('/api/volunteer/edit', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(volunteer.value),
  })

  const json = await response.json()
  if (!response.ok) {
    alert(json.message)
  }

  console.log(json)
  // alert the user
  alert(json.message)
  location.reload()
}

const getMyInfo = async () => {
  try {
    const response = await fetch('/api/volunteer/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    const json = await response.json()
    if (!response.ok) {
      throw new Error(json.message)
    }
    volunteer.value = json.volunteer
    volunteer.value.password = ''
    // return data.volunteer
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}

const getMyEvents = () => {
  let params = [`page=${page.value}`, `perPage=${perPage.value}`]

  params = params.join('&')
  loading.value = true
  fetch(`/api/volunteer/event?${params}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
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
const onPageChange = (p) => {
  page.value = p
  getMyEvents()
}

watchEffect(() => {
  if (userRole.value) {
    onMounted(() => {
      if (userRole.value != 'volunteer') {
        alert('You are not a volunteer.')
        router.push('/event')
        return
      }
      getMyEvents()
      // getUserRole()
      getMyInfo()
    })
  }
})
</script>

<template>
  <main>
    <div class="row mb-3 d-flex align-items-stretch">
      <div class="col-sm-7 mb-sm-0 mb-3">
        <form @submit.prevent="submitVolunteer">
          <div class="mb-3">
            <label for="exampleInputName" class="form-label">Name</label>
            <input
              class="form-control"
              id="exampleInputName"
              name="name"
              type="text"
              v-model="volunteer.name"
              required
            />
          </div>
          <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="exampleInputEmail1"
              v-model="volunteer.email"
              aria-describedby="emailHelp"
              required
            />
            <div id="emailHelp" class="form-text">
              We'll never share your email with anyone else.
            </div>
          </div>
          <div class="mb-3">
            <label for="exampleInputPassword1" class="form-label"
              >Reset Password</label
            >
            <input
              type="password"
              class="form-control"
              id="exampleInputPassword1"
              v-model="volunteer.password"
              required
            />
          </div>

          <div class="mb-3">
            <label for="exampleInputContact" class="form-label">Contact</label>
            <input
              type="tel"
              class="form-control"
              id="exampleInputContact"
              v-model="volunteer.contact"
              required
            />
          </div>
          <div class="mb-3">
            <label for="exampleInputAgeGroup" class="form-label"
              >Age Group</label
            >
            <select
              class="form-select"
              id="exampleInputAgeGroup"
              v-model="volunteer.age_group"
              required
            >
              <option value="" selected>Open this select menu</option>
              <option value="20-25">20-25</option>
              <option value="26-30">26-30</option>
              <option value="30-40">30-40</option>
              <option value="40+">40+</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="exampleInputAboutMe" class="form-label"
              >About Me and Remark</label
            >
            <textarea
              class="form-control"
              id="exampleInputAboutMe"
              v-model="volunteer.about_me"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="mb-3 form-check">
            <input
              type="checkbox"
              class="form-check-input"
              id="exampleCheck1"
              v-model="volunteer.terms_condition"
              required
            />
            <label class="form-check-label" for="exampleCheck1"
              >Agree to Terms and Conditions*</label
            >
          </div>

          <button
            type="submit"
            :disabled="!volunteer.terms_condition"
            class="btn btn-primary"
          >
            Save
          </button>
        </form>
      </div>
      <div class="col-sm-4">
        <p>Event Organizers</p>
        <DonutChart />
      </div>
    </div>

    <!-- Recent events cards -->
    <div class="row mb-3 d-flex align-items-stretch" id="cardContainer">
      <div class="col-md-5" v-for="event in events" :key="event._id">
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
  </main>
</template>
