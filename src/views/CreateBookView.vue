<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// Define the book object and other reactive variables
const book = ref({ title: '', author: '', genreId: '' });
const addToWishlistChecked = ref(false); // Track whether the wishlist checkbox is selected
const genres = ref([]);
const errorMessage = ref('');

// Fetch the list of genres from the backend
onMounted(async () => {
  try {
    const response = await axios.get('/api/public/genre');
    genres.value = response.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to load genres.';
  }
});

// Define the submit function
async function submitForm() {
  errorMessage.value = '';
  try {
    const response = await axios.post('/api/book', book.value);
    console.log('Response from server:', response.data);

    if (addToWishlistChecked.value) {
      await addToWishList(response.data.bookId);
    }

    book.value = { title: '', author: '', genreId: '' };
    addToWishlistChecked.value = false;

    await router.push('/');
  } catch (error) {
    if (error.response?.data) {
      errorMessage.value = error.response?.data.message || 'An error occurred';
    } else {
      errorMessage.value = 'Network error, please try again later.';
    }
  }
}

async function addToWishList(bookId) {
  try {
    await axios.post('/api/wish_list', { bookId: bookId });
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to add to wishlist.';
  }
}

function goBack() {
  router.back();
}
</script>


<template>
  <div class="create-book">
    <h2>Add Book</h2>
    <form @submit.prevent="submitForm">
      <div>
        <label for="title">Title</label>
        <input type="text" id="title" v-model="book.title" required />
      </div>

      <div>
        <label for="author">Author</label>
        <input type="text" id="author" v-model="book.author" required />
      </div>

      <div>
        <label for="genreId">Genre</label>
        <!-- Dropdown to select genre by name -->
        <select id="genreId" v-model="book.genreId" required>
          <option disabled value="">Please select a genre</option>
          <option v-for="genre in genres" :key="genre.genreId" :value="genre.genreId">
            {{ genre.genre }}
          </option>
        </select>
      </div>

      <!-- Checkbox for "Add to Wishlist" -->
      <div class="checkbox-container">
        <label for="wishlistCheckbox">Add this book to my wishlist</label>

        <input
            type="checkbox"
            id="wishlistCheckbox"
            v-model="addToWishlistChecked"
        />
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button type="submit">Add Book</button>
      <button class="back-button" @click="goBack">Back</button>
    </form>
  </div>
</template>


<style scoped>
.back-button {
  margin-top: 1rem;
  background-color: var(--color-pink-lavender-darker);
  border: 1px solid var(--color-pink-lavender-darker);
}

.back-button:hover {
  background-color: hsla(278, 100%, 34%, 0.2);
}

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

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-container label {
  display: flex;
}

.checkbox-container input#wishlistCheckbox {
  display: flex;
  width: 2rem;
}

@media (min-width: 1024px) {
  .create-book {
    width: 50%;
  }
}
</style>
