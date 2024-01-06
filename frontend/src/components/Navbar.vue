<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Navbar</a>
      <button
        class="navbar-toggler"
        type="button"
        @click="isCollapsed = !isCollapsed"
        :aria-expanded="!isCollapsed"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        class="collapse navbar-collapse"
        :class="{ show: !isCollapsed }"
        id="navbarSupportedContent"
      >
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link active" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/event">Events</router-link>
          </li>
          <li
            class="nav-item"
            v-if="userRole != 'admin' && userRole != 'volunteer'"
          >
            <router-link
              class="nav-link active"
              v-if="userRole.value !== 'admin' && userRole !== 'volunteer'"
              to="/become/volunteer"
              >Become Volunteer</router-link
            >
          </li>
          <li class="nav-item" v-if="userRole == 'admin'">
            <router-link class="nav-link active" to="/volunteers"
              >Volunteers</router-link
            >
          </li>
          <li class="nav-item" v-if="userRole == 'volunteer'">
            <router-link class="nav-link active" to="/myevents"
              >My Events</router-link
            >
          </li>
        </ul>
        <form class="d-flex" @submit.prevent="searchEvents">
          <input
            class="form-control me-2"
            type="search"
            placeholder="Search"
            aria-label="Search"
            v-model="searchQuery"
          />
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
        <button
          v-if="userRole === 'admin' || userRole === 'volunteer'"
          @click="logout"
          class="btn btn-outline-primary"
        >
          Logout
        </button>
        <router-link v-else to="/login" class="btn btn-primary">
          Login
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
// import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { nextTick, ref, inject } from 'vue'

const userRole = inject('userRole')
console.log('From Navbar' + userRole.value)

let isCollapsed = ref(true)
let searchQuery = ref('')

const router = useRouter()

const logout = function () {
  router.push('/login').then(() => {
    localStorage.removeItem('token')
    nextTick(() => location.reload())
  })
}

const searchEvents = () => {
  router.push({ name: 'event-search', query: { title: searchQuery.value } })
}
</script>
