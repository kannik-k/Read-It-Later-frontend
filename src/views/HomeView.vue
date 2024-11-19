<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Define reactive variables
const books = ref([]);
const errorMessage = ref(null);
const genres = ref([]);
const selectedGenreId = ref(null);

const lastSearchQuery = ref({
  genreId: null,
  title: null,
  author: null,
});

// Fetch books and genres
const getBooks = async () => {
  try {
    const response = await axios.get('/api/book');
    books.value = response.data.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,  //siin peab olema genre mitte genreId
    }));
  } catch (error) {
    errorMessage.value = error.response?.data || 'An error occurred while fetching the books';
  }
};

// Valitud otsingutüüp (vaikimisi title)
const searchType = ref('title');

// Otsingu sisend
const query = ref('');

// Otsingu teostamise funktsioon
function performSearch() {
  const searchValue = (query.value || '').trim(); // Kasutaja sisestatud otsing

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

  axios
      .get('/api/book', { params: lastSearchQuery.value })
      .then(response => {
        books.value = response.data.length > 0 ? response.data : [];
      })
      .catch(error => {
        errorMessage.value =
            'An error occurred during the search: ' + (error.response?.data || error.message);
      });
}


// Selected genre
const selectedGenre = ref(null);

// Fetch the list of genres from the backend
const getGenres = async () => {
  try {
    const response = await axios.get('/api/genre');
    genres.value = [{ genreId: null, genre: "All genres" }, ...response.data.map(genre => ({
      genreId: genre.genreId,
      genre: genre.genre,
    }))];
    selectedGenre.value = genres.value[0];
  } catch (error) {
    errorMessage.value = error.response?.data || 'An error occurred while fetching the genres';
  }
};

// Function to handle genre selection with sidebar
function filterByGenre(genre) {
  selectedGenre.value = genre;
  selectedGenreId.value = genre.genreId;
  lastSearchQuery.value.genreId = genre.genreId;
  performSearch()
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
      <button type="button" class="add-book" @click="redirectToCreateBook">Add book +</button>
      <h2>Books</h2>
      <table v-if="books.length" class="book-table" aria-label="Books">
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
@media (min-width: 1024px) {
  .search-container {
    width: 80%;
  }
}
</style>
