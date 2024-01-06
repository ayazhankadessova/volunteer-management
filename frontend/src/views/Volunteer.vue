<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrumb from '../components/BreadCrumb.vue'
import { inject } from 'vue'
const route = useRoute()
const router = useRouter()

const userRole = inject('userRole')

// console.log('role' + userRole)

const data = ref([])
const total = ref(0)
const loading = ref(false)
const sortField = ref('vote_count')
const sortOrder = ref('desc')
const defaultSortOrder = ref('desc')
const page = ref(1)
const perPage = ref(3)

const loadAsyncData = () => {
  const volunteerId = route.params.id // replace with the actual volunteer ID
  const params = [`perPage=${perPage.value}`, `page=${page.value}`].join('&')
  const token = localStorage.getItem('token') // get token from localStorage
  loading.value = true
  fetch(`/api/admin/volunteer/events/${volunteerId}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`, // add token to headers
    },
  })
    .then((response) => response.json())
    .then((result) => {
      let currentTotal = result.events.length
      total.value = currentTotal
      data.value = result.events.map((item) => {
        return item
      })
      loading.value = false
    })
    .catch((error) => {
      data.value = []
      total.value = 0
      loading.value = false
      throw error
    })
}

/*
 * Handle page-change event
 */
const onPageChange = (p) => {
  page.value = p
  loadAsyncData()
}

/*
 * Handle sort event
 */
const onSort = (field, order) => {
  sortField.value = field
  sortOrder.value = order
  loadAsyncData()
}

const volunteer = ref({
  name: '',
  email: '',
  password: '',
  contact: '',
  age_group: '',
  about_me: '',
  terms_condition: false,
})

const withdrawFromEvent = async function (eventId) {
  const volunteerId = route.params.id // get volunteer ID from route params
  const token = localStorage.getItem('token') // get token from localStorage

  try {
    const response = await fetch(
      `/api/admin/volunteer/events/${eventId}/withdraw/${volunteerId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // add token to headers
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to withdraw from event')
    }

    const result = await response.json()
    // console.log(result.message)
    alert(result.message)
    // refresh the data
    loadAsyncData()
  } catch (error) {
    alert(error)
  }
}

// a function to get the volunteer from the backend
const getVolunteer = async function () {
  const token = localStorage.getItem('token') // get token from localStorage

  // get the event from the backend
  const response = await fetch('/api/admin/volunteer/' + route.params.id, {
    headers: {
      Authorization: `Bearer ${token}`, // add token to headers
    },
  })

  // convert the response to json
  const json = await response.json()

  // log the json
  console.log(json)

  // set the booking
  volunteer.value = json.volunteer
  volunteer.value.password = ''

  console.log(volunteer.value)
  // console.log(volunteer)
}

watchEffect(() => {
  if (userRole.value) {
    onMounted(async () => {
      if (route.name == 'update-volunteer' && userRole.value != 'admin') {
        alert('You are not an admin.')
        router.push('/event')
        return
      }
      // if there is an id in the route
      if (route.params.id) {
        // console.log('hey')
        getVolunteer()
        loadAsyncData()
      }
    })
  }
})

const submitVolunteer = async function () {
  var url, method, headers
  // console.log(userRole)
  if (userRole.value === 'admin') {
    url =
      route.name == 'update-volunteer'
        ? '/api/admin/edit/volunteer/' + volunteer.value._id
        : '/api/admin/newVolunteer'
    method = route.name == 'update-volunteer' ? 'PUT' : 'POST'
    const token = localStorage.getItem('token') // get token from localStorage
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // add token to headers
    }
  } else if (route.name === 'become-volunteer') {
    url = '/api/become/volunteer/'
    method = 'POST'
    headers = {
      'Content-Type': 'application/json',
    }
  }

  // post the booking to the backend
  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: JSON.stringify(volunteer.value),
  })
  const json = await response.json()
  console.log(json)
  // alert the user
  alert(json.message)
  // redirect the user
  if (userRole.value === 'admin') {
    router.push('/volunteers')
  } else {
    router.push('/')
  }
}

const deleteVolunteer = async function () {
  const token = localStorage.getItem('token') // get token from localStorage

  // post the event to the backend
  const response = await fetch('/api/admin/volunteer/' + volunteer.value._id, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`, // add token to headers
    },
  })

  // convert the response to json
  const json = await response.json()

  // log the json
  console.log(json)

  // alert the user
  alert(json.message)

  // redirect the user
  router.push('/volunteers')
}
</script>

<template>
  <main>
    <div class="container">
      <div class="row mb-3">
        <div class="col-sm-6">
          <BreadCrumb />
        </div>
        <div class="col-sm-6 text-end" v-if="route.name === 'update-volunteer'">
          <button @click="deleteVolunteer" class="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-sm-6 mb-sm-0 mb-3">
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
              <label
                for="exampleInputPassword1"
                class="form-label"
                v-if="route.name != 'update-volunteer'"
                >Password</label
              >
              <label
                for="exampleInputPassword1"
                class="form-label"
                v-if="route.name == 'update-volunteer'"
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
              <label for="exampleInputContact" class="form-label"
                >Contact</label
              >
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

            <!-- disable register button only terms & conditions are accepted -->
            <button
              type="submit"
              class="btn btn-primary"
              v-if="
                route.name === 'become-volunteer' &&
                userRole != 'admin' &&
                userRole != 'volunteer'
              "
              :disabled="!volunteer.terms_condition"
            >
              Register
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              v-else-if="userRole == 'admin'"
            >
              Save
            </button>
          </form>
        </div>

        <div class="col-sm-6 mb-3" v-if="route.name === 'become-volunteer'">
          <div class="card">
            <img
              class="card-img-top"
              src="https://picsum.photos/200/100"
              alt="Card image cap"
            />
            <div class="card-body">
              <h5 class="card-title">Become a Volunteer!</h5>
              <p class="card-text">
                Your time and talent can make a big difference in people's
                lives!
              </p>
            </div>
          </div>
        </div>
        <div class="col-sm-6 mb-3" v-if="route.name === 'update-volunteer'">
          <o-table
            :data="data"
            :loading="loading"
            paginated
            backend-pagination
            :total="total"
            :per-page="perPage"
            aria-next-label="Next page"
            aria-previous-label="Previous page"
            aria-page-label="Page"
            aria-current-label="Current page"
            backend-sorting
            :default-sort-direction="defaultSortOrder"
            :default-sort="[sortField, sortOrder]"
            @page-change="onPageChange"
            @sort="onSort"
            paginationWrapperClass="newClass"
          >
            <o-table-column v-slot="props" field="name" label="Event Title">
              {{ props.row.eventTitle }}
            </o-table-column>

            <o-table-column v-slot="props" field="edit" label="Action">
              <router-link
                :to="`/event/edit/${props.row._id}`"
                class="btn btn-secondary"
              >
                Edit
              </router-link>
              <button
                class="btn btn-danger"
                @click="withdrawFromEvent(props.row._id)"
              >
                X
              </button>
            </o-table-column>
          </o-table>
        </div>
      </div>
    </div>
  </main>
</template>
