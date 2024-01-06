<script setup>
// imports
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()

// credentials
const credentials = ref({
  email: '',
  password: '',
})

// methods
const login = async () => {
  try {
    // fetch
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials.value),
    })

    // response
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message)
    }

    // save token to local storage
    localStorage.setItem('token', data.token)
    // Redirect to the '/' page
    window.location.href = '/'
    router.push('/')
  } catch (error) {
    alert(error)
  }
}
</script>

<template>
  <main>
    <form @submit.prevent="login">
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">Email address</label>
        <input
          type="email"
          class="form-control"
          id="exampleInputEmail1"
          v-model="credentials.email"
          aria-describedby="emailHelp"
        />
        <div id="emailHelp" class="form-text">
          We'll never share your email with anyone else.
        </div>
      </div>
      <div class="mb-3">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          id="exampleInputPassword1"
          v-model="credentials.password"
        />
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </main>
</template>
