<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Define the book object and other reactive variables
const book = ref({ title: '', author: '', genreId: '' });
const genres = ref([]); // Array to hold genres
const errorMessage = ref('');
const successMessage = ref('');

// Fetch the list of genres from the backend
onMounted(async () => {
  try {
    const response = await axios.get('/api/genre/get'); // Fetch genres from your API
    genres.value = response.data; // Assuming response contains an array of genres
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to load genres.';
  }
});

// Define the submit function
async function submitForm() {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    // Send the book data, including the genre ID
    const response = await axios.post('/api/book/post', book.value);
    console.log("Response from server:", response.data);

    // Handle successful submission
    successMessage.value = 'Book added successfully!';
    // Reset the form
    book.value = { title: '', author: '', genreId: '' };
  } catch (error) {
    // Handle errors
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message || 'An error occurred';
    } else {
      errorMessage.value = 'Network error, please try again later.';
    }
  }
}
</script>

<template>
  <div class="create-book">
    <h2>Add Book</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" v-model="book.title" required>
      </div>

      <div>
        <label for="author">Author</label>
        <input type="text" id="author" v-model="book.author" required>
      </div>

      <div>
        <label for="genreId">Genre</label>
        <!-- Dropdown to select genre by name -->
        <select id="genreId" v-model="book.genreId" required>
          <option disabled value="">Please select a genre</option>
          <option v-for="genre in genres" :key="genre.id" :value="genre.id">
            {{genre.genre}}
          </option>
        </select>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <button type="submit">Add Book</button>
    </form>
  </div>
</template>

<style scoped>
.create-book {
  max-width: 80%;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 4px;
}

.create-book h2 {
  text-align: center;
}

.create-book div {
  margin-bottom: 1rem;
}

.create-book label {
  display: block;
  margin-bottom: 0.5rem;
}

.create-book input,
.create-book select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.create-book button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-cyan-azure);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-book button:hover {
  background-color: var(--color-ucla-blue);
}

.error-message {
  font-size: 14px;
  color: #cc0202;
}

.success-message {
  font-size: 13px;
  color: green;
}
@media (min-width: 1024px) {
  .create-book {
    width: 50%;
  }
}
</style>
