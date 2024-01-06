<script setup>
import { ref, onMounted, provide } from 'vue'

import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Navbar from './components/Navbar.vue'

let userRole = ref('')

const getUserRole = async () => {
  const token = localStorage.getItem('token') // replace this with how you store your token
  if (!token) {
    console.log('No token found')
    return
  }
  const response = await fetch('/api/getRoles', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  console.log(response) // log the entire response object

  if (response.ok) {
    const json = await response.json()
    userRole.value = json.role
    console.log(userRole.value)
  } else {
    console.log('Error:', response.status, response.statusText)
  }
}

onMounted(() => {
  getUserRole()
  // getEvents()
})
provide('userRole', userRole)
</script>

<template>
  <!-- <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->
  <Navbar />
  <div class="container"><RouterView /></div>
</template>

<style scoped></style>
