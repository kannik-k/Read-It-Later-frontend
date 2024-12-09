<script setup>
import {onMounted, ref, watch} from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';


// Define reactive variables
const books = ref([]);
const errorMessage = ref(null);

// Pagination variables
const currentPage = ref(0);
const pageSize = ref(10);
const hasNextPage = ref(false);

// Fetch books
const getBooks = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }

    const response = await axios.get(`/api/wish_list`, { params });

    books.value = response.data.books && response.data.books.length > 0
        ? response.data.books
        : [];

    hasNextPage.value = response.data.hasNextPage || false;
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the books';
  }
};

watch([pageSize], () => {
  currentPage.value = 0; // Reset to first page
  getBooks();
});

async function removeFromWishList(bookId) {
  try {
    await axios.delete(`/api/wish_list/${bookId}`);
    await getBooks();
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to delete from wishlist.';
  }
}

function goToNextPage() {
  if (hasNextPage.value) {
    currentPage.value++;
    getBooks();
  }
}

function goToPreviousPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    getBooks();
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
      <!-- Dropdown Menus -->
      <div class="dropdown-menus">

        <!-- Page Size Dropdown -->
        <label for="pageSize">Books per page:</label>
        <select id="pageSize" v-model="pageSize">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
      </div>
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
      <!-- Pagination -->
      <div class="pagination">
        <button :disabled="currentPage === 0" @click="goToPreviousPage">Previous</button>
        <span class="page-number">Page {{ currentPage + 1 }}</span>
        <button :disabled="!hasNextPage" @click="goToNextPage">Next</button>
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

/* Dropdown Menus */
.dropdown-menus {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}

.dropdown-menus label {
  font-weight: bold;
}

.dropdown-menus select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

/* Pagination */
.pagination {
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem; /* Space between elements */
  margin: 1rem auto;
}

.page-number {
  display: inline-block;
  margin: 0 10px;
  text-align: center;
}

</style>
