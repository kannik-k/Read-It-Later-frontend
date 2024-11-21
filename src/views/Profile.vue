<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Reactive variables for user data and error messages
const user = ref({ userId: '', username: '', email: '' }); // Full user data from API
const userForDisplay = ref({ username: '', email: '' }); // Displayed fields
const userToSend = ref({ username: '', email: '', password: '' }); // Payload for API
const password = ref(null); // Separate for password updates
const editingField = ref(null); // Tracks the field being edited
const errorMessage = ref(null);

// Fetch user data (including ID but excluding sensitive data like password)
async function fetchUserInfo() {
  try {
    const response = await axios.get('/api/user/info'); // Replace with your API endpoint
    user.value = response.data; // Populate user data
    // Update fields for display
    userForDisplay.value = {
      username: user.value.username,
      email: user.value.email,
    };
  } catch (error) {
    errorMessage.value = 'Failed to fetch user information.';
  }
}

// Update specific fields (uses userId for identification)
async function updateField(field) {
  errorMessage.value = '';
  try {
    const payload = { [field]: userToSend.value[field] }; // Create payload for the specific field
    await axios.put(`/api/user/${user.value.userId}/${field}`, payload); // Replace with your API endpoint
    editingField.value = null; // Exit editing mode
    // Update userForDisplay with the new value
    userForDisplay.value[field] = userToSend.value[field];
  } catch (error) {
    errorMessage.value = 'Failed to update user information.';
  }
}

// Update password (userId is required for backend logic)
async function updatePassword() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await axios.put(`/api/user/${user.value.userId}/password`, { password: password.value }); // Replace with your API endpoint
    editingField.value = null; // Exit editing mode
    password.value = null; // Clear password input
  } catch (error) {
    errorMessage.value = 'Failed to update password.';
  }
}

// Enter edit mode and copy the value to userToSend
function startEdit(field) {
  editingField.value = field;
  userToSend.value[field] = userForDisplay.value[field]; // Copy value for editing
}

// Exit editing mode
function cancelEdit() {
  editingField.value = null;
  password.value = null; // Reset password input if editing password
}

// Fetch user information on component mount
onMounted(fetchUserInfo);
</script>

<template>
  <div class="user-profile">
    <h2>User Profile</h2>

    <!-- Success and Error Messages -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- Editable User Fields -->
    <div v-for="(value, field) in userForDisplay" :key="field" class="field">
      <div v-if="editingField !== field">
        <strong>{{ field.charAt(0).toUpperCase() + field.slice(1) }}:</strong> {{ value }}
        <button @click="startEdit(field)">Edit</button>
      </div>
      <div v-else>
        <label :for="field">{{ field.charAt(0).toUpperCase() + field.slice(1) }}</label>
        <input
            :id="field"
            v-model="userToSend[field]"
            type="text"
        />
        <div class="buttons">
        <button @click="updateField(field)">Save</button>
        <button @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Password Field -->
    <div class="field">
      <div v-if="editingField !== 'password'">
        <strong>Password:</strong> ••••••
        <button @click="editingField = 'password'">Change</button>
      </div>
      <div v-else>
        <label for="password">New Password</label>
        <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter new password"
        />
        <div class="buttons">
        <button @click="updateField(field)">Save</button>
        <button @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  max-width: 80%;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.user-profile h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.field {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field input {
  flex-grow: 1;
  margin-left: 1rem;
  margin-bottom: 2vw;
  padding: 0.5rem;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 4px;
}
.buttons {
  display: flex;
  flex-direction: row;
}

</style>