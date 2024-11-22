<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { getUserId, logOut, token } from '../utils/auth';
import router from "@/router/index.js";

// Reactive variables for user data and error messages
const user = ref({ userId: '', username: '', email: '' });
const userForDisplay = ref({ username: '', email: '' });
const oldPassword = ref(null);
const newPassword = ref(null);
const confirmNewPassword = ref(null);
const editingField = ref(null);
const userGenres = ref([]); // Genres linked to the user
const allGenres = ref([]); // All genres from the genres table
const selectedGenreId = ref(null); // For adding a genre
const errorMessage = ref(null);

// Fetch user data
async function fetchUserInfo() {
  try {
    const response = await axios.get(`/api/user/${getUserId()}`);
    user.value = response.data;
    userForDisplay.value = {
      username: user.value.username,
      email: user.value.email,
    };
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to fetch user information.';
  }
}

// Fetch user data, user preferences, and available genres
async function fetchData() {
  try {
    // Fetch genres linked to the user
    const userGenresResponse = await axios.get(`/api/user_preferences/${getUserId()}`);
    userGenres.value = userGenresResponse.data;

    // Fetch all available genres
    const genresResponse = await axios.get('/api/public/genre');
    allGenres.value = genresResponse.data;
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to fetch data.';
  }
}

// Add a new genre preference for the user
async function addGenre() {
  if (!selectedGenreId.value) {
    errorMessage.value = 'Please select a genre.';
    return;
  }

  try {
    const userId = getUserId();
    await axios.post(`/api/user_preferences`, {userId: userId, genreId: selectedGenreId.value });

    // Refresh user genres
    const userGenresResponse = await axios.get(`/api/user_preferences/${userId}`);
    userGenres.value = userGenresResponse.data;

    selectedGenreId.value = null; // Reset selection
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to add genre.';
  }
}

// Remove a genre preference
async function removeGenre(genreId) {
  if (!confirm('Are you sure you want to remove this genre?')) return;

  try {
    const userId = getUserId();
    await axios.delete(`/api/user_preferences/${userId}/${genreId}`);

    // Refresh user genres
    const userGenresResponse = await axios.get(`/api/user_preferences/${userId}`);
    userGenres.value = userGenresResponse.data;
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to remove genre.';
  }
}

// Update specific fields
async function updateField(field) {
  errorMessage.value = '';
  const payload = {};
  let endpoint;

  if (field === 'password') {
    payload.oldPassword = oldPassword.value;
    payload.newPassword = newPassword.value;
    payload.confirmNewPassword = confirmNewPassword.value;
    endpoint = `/api/user/${user.value.userId}/password`;
  } else {
    payload[field] = userForDisplay.value[field];
    endpoint = `/api/user/${user.value.userId}/${field}`;
  }

  try {
    await axios.put(endpoint, payload);
    if (field !== 'password') {
      user.value[field] = userForDisplay.value[field];
    }
    editingField.value = null;
    oldPassword.value = null;
    newPassword.value = null;
    confirmNewPassword.value = null;
  } catch (error) {
    errorMessage.value = error.response?.data.message || `Failed to update ${field}.`;
  }
}

// Start editing a specific field
function startEdit(field) {
  editingField.value = field;
}

// Cancel edit
function cancelEdit() {
  editingField.value = null;
  oldPassword.value = null;
  newPassword.value = null;
  confirmNewPassword.value = null;

  userForDisplay.value = {
    username: user.value.username,
    email: user.value.email,
  };
}

// Delete account
async function deleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    try {
      await axios.delete(`/api/user/${user.value.userId}`);
      alert('Account deleted successfully.');
      await logOut()
    } catch (error) {
      errorMessage.value = error.response?.data.message || 'Failed to delete account. Please try again.';
    }
  }
}

function redirectToCreateAccount() {
    router.push(`/create_account`);

}

function redirectToLogIn() {
    router.push(`/login`);

}

// Fetch user information on component mount
onMounted(() => {
  fetchUserInfo();
  fetchData()
});

</script>



<template>
  <div>
    <div class="user-profile" v-if="!!token">
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
              v-model="userForDisplay[field]"
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
          <label for="oldPassword">Old password</label>
          <input
              id="oldPassword"
              v-model="oldPassword"
              type="password"
              placeholder="Enter current password"
          />

          <label for="newPassword">New password</label>
          <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              placeholder="Enter new password"
          />

          <label for="confirmNewPassword">Confirm new password</label>
          <input
              id="confirmNewPassword"
              v-model="confirmNewPassword"
              type="password"
              placeholder="Confirm new password"
          />

          <div class="buttons">
            <button @click="updateField('password')">Save</button>
            <button @click="cancelEdit">Cancel</button>
          </div>
        </div>
      </div>
        <!-- Display User Genres -->
        <div class="genres">
          <h3>Preferred Genres</h3>
          <ul>
            <li v-for="genre in userGenres" :key="genre.genreId">
              {{ genre.genreId }}
              <button @click="removeGenre(genre.genreId)">Remove</button>
            </li>
          </ul>

          <!-- Add Genre -->
          <div class="add-genre">
            <select v-model="selectedGenreId">
              <option disabled value="">Select a genre</option>
              <option v-for="genre in allGenres" :key="genre.genreId" :value="genre.genreId">
                {{ genre.genre }}
              </option>
            </select>
            <button @click="addGenre">Add Genre</button>
          </div>
        </div>


      <div class="log-out">
        <button class="log-out-button" @click="logOut">Log out</button>
      </div>

      <div class="delete-account">
        <button class="delete-button" @click="deleteAccount">Delete account</button>
      </div>
    </div>

    <div v-else class="no-login">
      <p>To view your profile:</p>
      <button class="unauthenticated" @click="redirectToCreateAccount">Create Account</button>
      <p>or</p>
      <button class="unauthenticated" @click="redirectToLogIn">Log In</button>
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.genres {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.genres h3 {
  margin-bottom: 1rem;
}

.genres ul {
  list-style: none;
  padding: 0;
}

.genres li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.add-genre {
  display: flex;
  margin-top: 1rem;
}

.add-genre select {
  flex-grow: 1;
  margin-right: 1rem;
  padding: 0.5rem;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 4px;
}

.buttons {
  display: flex;
  flex-direction: row;
}

.delete-account {
  margin-top: 2rem;
  text-align: center;
}

.delete-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #d9363e;
}
.no-login {
  max-width: max-content;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  align-items: center;
  text-align: center;
}

.unauthenticated {
  width: 20rem;
}
</style>