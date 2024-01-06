<script setup>
import { ref, onMounted, inject, watchEffect } from 'vue'
import BreadCrumb from '../components/BreadCrumb.vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const userRole = inject('userRole')

const data = ref([])
const total = ref(0)
const loading = ref(false)
const sortField = ref('vote_count')
const sortOrder = ref('desc')
const defaultSortOrder = ref('desc')
const page = ref(1)
const perPage = ref(3)

const loadAsyncData = () => {
  const params = [`perPage=${perPage.value}`, `page=${page.value}`].join('&')
  const token = localStorage.getItem('token') // get token from localStorage
  loading.value = true
  fetch(`/api/admin/volunteers?${params}`, {
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

watchEffect(() => {
  if (userRole.value) {
    console.log('Here from Watch Effect')
    onMounted(() => {
      if (userRole.value != 'admin') {
        alert('You are not an admin.')
        router.push('/event')
        return
      }
      loadAsyncData()
    })
  }
})
</script>

<template>
  <main>
    <div class="row mb-3">
      <div class="col-sm-6">
        <BreadCrumb />
      </div>
      <div class="col-sm-6 text-end">
        <button class="btn btn-primary">
          <router-link class="nav-link" to="/become/volunteer">New</router-link>
        </button>
      </div>
    </div>
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
      <o-table-column v-slot="props" field="name" label="Volunteer name">
        {{ props.row.name }}
      </o-table-column>
      <o-table-column v-slot="props" field="email" label="Email">
        {{ props.row.email }}
      </o-table-column>
      <o-table-column v-slot="props" field="contact" label="Contact" numeric>
        {{ props.row.contact }}
      </o-table-column>

      <o-table-column v-slot="props" field="edit" label="Action">
        <router-link
          :to="`/volunteer/${props.row._id}`"
          class="btn btn-secondary"
        >
          Edit
        </router-link>
      </o-table-column>
    </o-table>
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
