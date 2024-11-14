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
</div>
</template>

<style scoped>

</style>