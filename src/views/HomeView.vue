<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Define reactive variables
const books = ref([]);
const errorMessage = ref(null);

// Fetch books and genres
const getBooks = async () => {
  try {
    const response = await axios.get('/api/book/get');
    books.value = response.data.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genreId: book.genre,
    }));
  } catch (error) {
    errorMessage.value = error.response?.data || 'An error occurred while fetching the books';
  }
};



// Call getBooks and getGenres when the component is mounted
onMounted(() => {
  getBooks();
});

const router = useRouter();
function redirectToCreateBook() {
  router.push('/create_book');  // Redirect to /create_book
}
</script>

<template>
  <div class="books">
    <button type="button" class="add-book" @click="redirectToCreateBook">Add book +</button>
    <h2>Books</h2>
    <table v-if="books.length">
      <thead>
      <tr>
        <th>Title</th>
        <th>Author</th>
        <th>Genre</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="book in books" :key="book.id">
        <td>{{ book.title }}</td>
        <td>{{ book.author }}</td>
        <td>{{ book.genre }}</td>
      </tr>
      </tbody>
    </table>
    <p v-else>There are no books yet</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.books {
  max-width: 300px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 4px;
}

.books h2 {
  text-align: center;
}

.books div {
  margin-bottom: 1rem;
}

.books label {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
