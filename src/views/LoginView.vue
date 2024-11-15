<script setup>
import { reactive } from 'vue';

// Define the user object
const user = reactive({
  name: '',
  password: '',
});

// Define the submit function
function submitForm() {

  // Handle form submission logic here
  // For example, you could log the user object or make an API call
  console.log("Submitted user data:", user);

  // Reset form after submission if needed
  user.name = '';
  user.password = '';
}
</script>

<template>
<div class="login-form">
  <h2>Log in</h2>
  <form @submit.prevent="submitForm">
    <div>
      <label for="username">Username</label>
      <input type="text" id="username" v-model="user.name" required>
    </div>
    <div>
      <label for="password">Password</label>
      <input type="text" id="password" v-model="user.password" required>
    </div>
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