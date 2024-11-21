<script setup>
import { RouterLink } from 'vue-router'
import {reactive, ref} from 'vue';
import axios from "axios";
import router from "@/router/index.js";

// Define the user object
const user = reactive({
  username: '',
  password: '',
});
const errorMessage = ref('');

// Define the submit function
async function submitForm() {
  errorMessage.value = '';

  try {
    const response = await axios.post('/api/public/user/login', user);
    console.log("Submitted user data:", user);
    console.log("Response from server:", response.data);

    const token = response.data.token;
    localStorage.setItem('user-token', token);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    await router.push('/')
    location.reload();

  } catch (error) {
    if (error.response?.data) {
      // Access the error message from the backend response
      errorMessage.value = error.response.data.message || 'An error occurred';
    } else {
      // Handle other errors, like network issues
      errorMessage.value = 'Network error, please try again later.';
    }
  }

  // Reset form after submission if needed
  user.username = '';
  user.password = '';
}
</script>

<template>
<div class="login-form">
  <h2>Log in</h2>
  <form @submit.prevent="submitForm">
    <div>
      <label for="username">Username</label>
      <input type="text" id="username" v-model="user.username" required>
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" v-model="user.password" required>
    </div>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <button type="submit">Log in</button>
  </form>
  <p>Don't have an account?<router-link to="/create_account">Create account</router-link></p>
</div>
</template>

<style scoped>
.login-form {
  max-width: 80%;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 4px;
}

.login-form h2 {
  text-align: center;
}

.login-form div {
  margin-bottom: 1rem;
}

.login-form label {
  display: block;
  margin-bottom: 0.5rem;
}

.login-form input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-form button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-cyan-azure);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-form button:hover {
  background-color: var(--color-ucla-blue);
}

router-link {
  color: var(--color-air-superiority-blue);
}
@media (min-width: 1024px) {
  .login-form {
    width: 50%;
  }
}
</style>