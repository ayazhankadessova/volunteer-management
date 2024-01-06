<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrumb from '../components/BreadCrumb.vue'
import { inject } from 'vue'

const userRole = inject('userRole')

const route = useRoute()
const router = useRouter()

const loading = ref(true)

const event = ref({
  eventTitle: '',
  eventOrganizer: '',
  eventDescription: '',
  eventTime: '',
  eventQuota: '',
  eventLocation: '',
  eventImage: '',
  highlight: false,
  createdAt: { $date: '' },
  modifiedAt: { $date: '' },
})

const data = ref([])
const total = ref(0)
const sortField = ref('vote_count')
const sortOrder = ref('desc')
const defaultSortOrder = ref('desc')
const page = ref(1)
const perPage = ref(3)

const loadAsyncData = () => {
  const eventId = route.params.id // get event ID from route params
  const params = [`perPage=${perPage.value}`, `page=${page.value}`].join('&')
  const token = localStorage.getItem('token') // get token from localStorage
  loading.value = true
  fetch(`/api/admin/events/${eventId}/volunteers?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`, // add token to headers
    },
  })
    .then((response) => response.json())
    .then((result) => {
      let currentTotal = result.total

      total.value = currentTotal
      data.value = result.volunteers.map((item) => {
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

// initial render
onMounted(async () => {
  // if there is an id in the route
  if (userRole.value != 'admin' && route.name == 'update-event') {
    alert('You are not an admin.')
    router.push('/event')
    return
  }
  if (route.params.id) {
    getEvent()
    loadAsyncData()
  }
})

const withdrawFromEvent = async function (volunteerId) {
  const eventId = event.value._id // get event ID from event.value._id
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

const submitEvent = async function () {
  var url = '/api/admin/event'
  var method = 'POST'

  if (route.name == 'update-event') {
    url = url + '/edit/' + event.value._id
    method = 'PUT'
  }
  // post the booking to the backend
  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(event.value),
  })

  // "/login?redirect = ${route.thispath}"
  const json = await response.json()
  console.log(json)
  // alert the user
  alert(json.message)
  // redirect to the home page
  router.push('/event')
}

const deleteEvent = async function () {
  // post the event to the backend
  const response = await fetch('/api/admin/event/' + event.value._id, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  // convert the response to json
  const json = await response.json()
  // log the json
  console.log(json)
  // alert the user
  alert(json.message)
  // redirect to the home page
  router.push('/event')
}

// a function to get the event from the backend
const getEvent = async function () {
  // get the event from the backend
  const response = await fetch('/api/event/detail/' + route.params.id)
  // convert the response to json
  const json = await response.json()
  // log the json
  console.log(json)
  // set the booking
  event.value = json.event
  console.log(event)
  loading.value = false
}
</script>

<template>
  <main>
    <div class="container-fluid">
      <div class="row mb-3">
        <div class="col-sm-6">
          <BreadCrumb v-if="!loading" :eventTitle="event.eventTitle" />
        </div>
        <div class="col-sm-6 text-end">
          <button
            type="button"
            class="btn btn-danger"
            v-if="route.name == 'update-event'"
            v-on:click="deleteEvent"
          >
            Delete
          </button>
        </div>
      </div>
      <div class="row mb-3" v-if="route.name == 'view-event'">
        <div class="col-sm-6 mb-3">
          <div class="card h-100 d-flex flex-column">
            <div class="card-body">
              <h5 class="card-title card-title-new">
                {{ event.eventTitle }}
              </h5>
              <h6 class="card-subtitle mb-2 text-muted">
                {{ event.eventOrganizer }}
              </h6>
              <p class="card-text">{{ event.eventDescription }}</p>
              <div class="card">
                <ul class="list-group list-group-flush overflow-auto">
                  <li class="list-group-item">{{ event.eventTime }}</li>
                  <li class="list-group-item">{{ event.eventLocation }}</li>
                  <li class="list-group-item">{{ event.eventQuota }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 mb-3">
          <div class="card h-100 d-flex flex-column">
            <img
              class="card-img-top"
              src="https://picsum.photos/200/100"
              alt="Card image cap"
            />
            <div class="card-body" v-if="userRole != 'admin'">
              <h5 class="card-title">Become a Volunteer!</h5>
              <p class="card-text">
                Your time and talent can make a big difference in people's
                lives!
              </p>
            </div>
            <div class="card-body" v-else-if="userRole == 'admin'">
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
                <o-table-column
                  v-slot="props"
                  field="name"
                  label="Volunteer name"
                >
                  {{ props.row.name }}
                </o-table-column>
                <!-- <o-table-column v-slot="props" field="email" label="Email">
                  {{ props.row.email }}
                </o-table-column> -->
                <o-table-column
                  v-slot="props"
                  field="contact"
                  label="Contact"
                  numeric
                >
                  {{ props.row.contact }}
                </o-table-column>

                <o-table-column v-slot="props" field="edit" label="Action">
                  <router-link
                    :to="`/volunteer/${props.row._id}`"
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
      </div>

      <form @submit.prevent="submitEvent" v-if="route.name != 'view-event'">
        <div class="row mb-1">
          <div class="col-sm-6">
            <div class="row mb-3">
              <div class="col">
                <label for="event_title" class="form-label">Event Title</label>
                <input
                  type="text"
                  class="form-control"
                  id="event_title"
                  placeholder="Enter event title"
                  v-model="event.eventTitle"
                  required
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label for="organizer" class="form-label">Organizer</label>
                <input
                  type="text"
                  class="form-control"
                  id="organizer"
                  v-model="event.eventOrganizer"
                  placeholder="Enter organizer name"
                  required
                />
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <label for="event_desc" class="form-label">Description</label>
            <textarea
              type="text"
              name="eventDescription"
              rows="4"
              class="form-control"
              id="event_descr"
              v-model="event.eventDescription"
              placeholder="Enter event Description"
              required
            ></textarea>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-sm-6">
            <label for="datetime" class="form-label">Date and Time</label>
            <input
              type="datetime-local"
              class="form-control"
              id="datetime"
              placeholder="2024-12-06T13:00"
              v-model="event.eventTime"
              required
            />
          </div>
          <div class="col-sm-6">
            <label for="quota" class="form-label">Quota</label>
            <input
              type="number"
              class="form-control"
              id="quota"
              min="1"
              max="100"
              placeholder="10"
              v-model="event.eventQuota"
              required
            />
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-sm-6">
            <label for="location" class="form-label">Location</label>
            <input
              type="text"
              class="form-control"
              id="location"
              placeholder="Apartment, studio or floor"
              v-model="event.eventLocation"
              required
            />
          </div>
          <div class="col-sm-6">
            <label for="image" class="form-label">Image (Link)</label>
            <input
              type="text"
              class="form-control"
              id="image"
              placeholder="http://image.com/example.png"
              v-model="event.eventImage"
              required
            />
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-sm-6">
            <div class="form-check" style="margin-left: 10px">
              <input
                class="form-check-input"
                type="checkbox"
                id="gridCheck1"
                v-model="event.highlight"
              />
              <label class="form-check-label" for="gridCheck1">Highlight</label>
            </div>
          </div>
          <div class="col-sm-6 text-end">
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<style>
.newClass .pagination-prev,
.newClass .pagination-next {
  display: none !important;
}
.newClass ul.pagination {
  justify-content: flex-start !important;
}
</style>
