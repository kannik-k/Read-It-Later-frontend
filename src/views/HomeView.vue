<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { getUserId, token } from '../utils/auth';


// Define reactive variables
const books = ref([]);
const errorMessage = ref(null);
const genres = ref([]);
const selectedGenreId = ref(null);

// Pagination variables
const currentPage = ref(0);
const pageSize = ref(10);
const hasNextPage = ref(false);

const lastSearchQuery = ref({
  genreId: null,
  title: null,
  author: null,
});

// Fetch books and genres
const getBooks = async () => {
  try {
    const params = {
      genreId: lastSearchQuery.value.genreId,
      title: lastSearchQuery.value.title,
      author: lastSearchQuery.value.author,
      page: currentPage.value,
      size: pageSize.value,
    };

    const response = await axios.get('/api/public/book', { params });

    books.value = response.data.books && response.data.books.length > 0
        ? response.data.books
        : [];

    hasNextPage.value = response.data.hasNextPage || false;

  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the books';
  }
};


// Chosen search type (default: title)
const searchType = ref('title');

// Search query
const query = ref('');

// Function for performing search
function performSearch() {
  const searchValue = (query.value || '').trim(); // Query entered by user

  if (!searchValue) {
    lastSearchQuery.value.title = null;
    lastSearchQuery.value.author = null;
  } else if (searchType.value === 'title' && searchValue) {
    lastSearchQuery.value.title = searchValue;
    lastSearchQuery.value.author = null;
  } else if (searchType.value === 'author' && searchValue) {
    lastSearchQuery.value.author = searchValue;
    lastSearchQuery.value.title = null;
  }

  lastSearchQuery.value.genreId = selectedGenreId.value;
  currentPage.value = 0;
  getBooks();
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

// Selected genre
const selectedGenre = ref(null);

// Fetch the list of genres from the backend
const getGenres = async () => {
  try {
    const response = await axios.get('/api/public/genre');
    genres.value = [{ genreId: null, genre: "All genres" }, ...response.data.map(genre => ({
      genreId: genre.genreId,
      genre: genre.genre,
    }))];
    selectedGenre.value = genres.value[0];
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the genres';
  }
};

// Function to handle genre selection with sidebar
function filterByGenre(genre) {
  selectedGenre.value = genre;
  selectedGenreId.value = genre.genreId;
  lastSearchQuery.value.genreId = genre.genreId;
  currentPage.value = 0;
  getBooks()
}

async function addToWishList(bookId) {
  try {
    await axios.post(`/api/wish_list`, {userId: getUserId(), bookId: bookId});
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'Failed to add to wishlist.';
  }
}

// Call getBooks and getGenres when the component is mounted
onMounted(() => {
  getBooks();
  getGenres()
});

const router = useRouter();
function redirectToCreateBook() {
  router.push('/create_book');  // Redirect to /create_book
}

function redirectToBookDetails(bookId) {
  router.push(`/book/${bookId}`);
}
</script>

<template>
  <div class="page-layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <h3>Genres</h3>
    <ul>
      <li
          v-for="genre in genres"
          :key="genre"
          :value="genre.genreId"
          :class="{ active: selectedGenre === genre }"
          @click="filterByGenre(genre)"
      >
        {{ genre.genre }}
      </li>
    </ul>
  </aside>

  <!-- Search bar -->
  <main class="main-content">
    <div class="search-container">
      <div>Search by:</div>
      <div class="search-options">
        <label :class="{ active: searchType === 'author' }">
          <input
              type="radio"
              value="author"
              v-model="searchType"
          />
          Author
        </label>
        <label :class="{ active: searchType === 'title' }">
          <input
              type="radio"
              value="title"
              v-model="searchType"
          />
          Title
        </label>
      </div>
      <div class="search-bar">
        <input
            type="text"
            v-model="query"
            placeholder="Enter to search..."
        />
        <button class="search-button" @click="performSearch">SEARCH</button>
      </div>
    </div>

    <!-- Add books function -->
    <div class="books">
      <button v-if="!!token" type="button" class="add-book" @click="redirectToCreateBook">Add book +</button>
      <h2>Books</h2>
      <table v-if="books.length" class="book-table" aria-label="Books">
        <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Genre</th>
          <th v-if="!!token">Wishlist</th>
        </tr>
        </thead>
        <tbody>
        <tr class="book-row"
            v-for="book in books"
            :key="book.bookId"
            @click="redirectToBookDetails(book.bookId)"
            style="cursor: pointer;">
          <td>{{ book.title }}</td>
          <td>{{ book.author }}</td>
          <td>{{ book.genre }}</td>
          <td v-if="!!token" @click.stop="addToWishList(book.bookId)"><button>+</button></td>
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

/* Sidebar */
.sidebar {
  width: 150px;
  background-color: var(--color-pink-lavender);
  padding: 1rem;
  border-right: 1px solid var(--color-pink-lavender-darker);
  top: 0;
  left: 0;
}

.sidebar h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 0.5vw 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.sidebar li:hover {
  background-color: var(--color-ucla-blue);
  color: white;
}

.sidebar li.active {
  background-color: var(--color-pink-lavender-darker);
  color: white;
}

/* Main Content */
.main-content {
  flex: 1; /* Take up available space next to the sidebar */
  align-items: center; /* Center the content horizontally within the main content area */
  padding: 1rem;
  margin: 0 auto; /* Center the content horizontally if there's extra space */
}

.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 2vw;
  border: 1px solid var(--color-pink-lavender-darker);
  border-radius: 8px;
  margin: 0 auto 2vw auto;
}

.search-options {
  display: flex;
  gap: 15px;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-bar input {
  padding: 0.5rem;
  width: 30vw;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-options {
  display: flex;
  gap: 0.5rem;
}

.search-options label {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  background-color: var(--color-cyan-azure);
  color: white;
  transition: all 0.3s ease;
}

.search-options label.active {
  background-color: var(--color-ucla-blue);
  color: white;
  border-color: #0056b3;
}

.search-options input[type="radio"] {
  display: none; /* Peida radio nupud */
}

.search-button {
  width: 100px
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem; /* Space between elements */
  margin-top: 1rem;
}

.page-number {
  display: inline-block;
  margin: 0 10px;
  text-align: center;
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
@media (min-width: 1024px) {
  .search-container {
    width: 80%;
  }
}
</style>
