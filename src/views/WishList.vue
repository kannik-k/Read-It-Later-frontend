<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';


// Define reactive variables
const books = ref([]);
const errorMessage = ref(null);

// Fetch books
const getBooks = async () => {
  try {
    const response = await axios.get(`/api/wish_list`);

    books.value = response.data && response.data.length > 0
        ? response.data
        : [];
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the books';
  }
};

async function removeFromWishList(bookId) {
  try {
    await axios.delete(`/api/wish_list/${bookId}`);
    await getBooks();
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to delete from wishlist.';
  }
}

onMounted(async () => {
  await getBooks();
});

const router = useRouter();

function redirectToBookDetails(bookId) {
  router.push(`/book/${bookId}`);
}
</script>

<template>
  <div class="page-layout">
    <main class="main-content">
      <div class="books">
        <h2>Wishlist</h2>
        <table v-if="books.length" class="wishlist-table" aria-label="Wishlist">
          <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr
              class="book-row"
              v-for="book in books"
              :key="book.bookId"
              style="cursor: pointer;"
          >
            <td @click="redirectToBookDetails(book.bookId)">{{ book.title }}</td>
            <td @click="redirectToBookDetails(book.bookId)">{{ book.author }}</td>
            <td @click="redirectToBookDetails(book.bookId)">{{ book.genre }}</td>
            <td @click.stop="removeFromWishList(book.bookId)">
              <button>Remove</button>
            </td>
          </tr>
          </tbody>
        </table>
        <p v-else class="no-books-message">There are no books yet</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
    </main>
  </div>
</template>


<style scoped>
.page-layout {
  display: flex;
  align-items: flex-start; /* Align content to the top */
}

/* Main Content */
.main-content {
  flex: 1;
  align-items: center; /* Center the content horizontally within the main content area */
  padding: 1rem;
  margin: 0 auto; /* Center the content horizontally if there's extra space */
}

.books {
  max-width: 80%;
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

.book-row{
  transition: background-color 0.3s ease;
}

.book-row:hover {
  background-color: var(--color-pink-lavender-darker);
}
</style>
