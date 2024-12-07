<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { token } from '../utils/auth';


const route = useRoute();
const router = useRouter();

const bookId = route.params.id;

const book = ref(null);
const reviews = ref([]);
const bookLoading = ref(true);
const reviewsLoading = ref(true);
const errorMessage = ref(null);

// Pagination variables
const currentPage = ref(0);
const pageSize = ref(10);
const hasNextPage = ref(false);


const fetchBookDetails = async () => {
  bookLoading.value = true;
  try {
    const response = await axios.get(`/api/public/book/search_by_id/${bookId}`);
    book.value = response.data;
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the book details';
  } finally {
    bookLoading.value = false;
  }
};

const getReviews = async () => {
  reviewsLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    };

    const response = await axios.get(`/api/public/review/${bookId}`, { params });
    reviews.value = response.data.reviews.map(review => ({
      bookId: review.bookId,
      review: review.review,
    }));

    hasNextPage.value = response.data.hasNextPage || false;
    console.log(hasNextPage.value)
  } catch (error) {
    errorMessage.value = error.response?.data.message || 'An error occurred while fetching the reviews';
  } finally {
    reviewsLoading.value = false;
  }
};

watch([pageSize], () => {
  currentPage.value = 0; // Reset to first page
  getReviews();
});

function redirectToCreateReview() {
  if (book.value?.bookId) {
    router.push(`/book/${book.value.bookId}/add`);
  } else {
    console.error('Book ID is not available for redirecting.');
  }
}

function goToNextPage() {
  if (hasNextPage.value) {
    currentPage.value++;
    getReviews();
  }
}

function goToPreviousPage() {
  if (currentPage.value > 0) {
    currentPage.value--;
    getReviews();
  }
}

function goBack() {
  router.back();
}

onMounted(() => {
  fetchBookDetails();
  getReviews();
});
</script>

<template>
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

  <div class="book-details">

    <button class="back-button" @click="goBack">Back</button>
    <div class="book-data">
    <h1>Book Details</h1>
    <div v-if="bookLoading">
      <p>Loading book details...</p>
    </div>
    <div v-else-if="book">
      <p><strong>Title:</strong> {{ book.title }}</p>
      <p><strong>Author:</strong> {{ book.author }}</p>
      <p><strong>Genre:</strong> {{ book.genre }}</p>
    </div>
    <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <div class="reviews">
      <h1>Reviews</h1>
      <button v-if="!!token" class="review" @click="redirectToCreateReview">
        Add review
      </button>
      <div v-if="reviewsLoading">
        <p>Loading reviews...</p>
      </div>
      <div v-else-if="reviews.length > 0">
        <p
            v-for="review in reviews"
            :key="review.bookId"
            class="review-text"
        >
          {{ review.review }}
        </p>
      </div>
      <p v-else>No reviews yet.</p>
    </div>
    <!-- Pagination -->
    <div class="pagination">
      <button :disabled="currentPage === 0" @click="goToPreviousPage">Previous</button>
      <span class="page-number">Page {{ currentPage + 1 }}</span>
      <button :disabled="!hasNextPage" @click="goToNextPage">Next</button>
    </div>
  </div>
</template>

<style scoped>
.book-details {
  padding-left: 5%;
  padding-right: 5%;
  position: relative;
  align-items: center;
}
.book-data {
  margin-top: 1rem;
  margin-bottom: 1rem;
}



.back-button {
  top: 1rem;
  right: 1rem;
  background-color: var(--color-pink-lavender-darker);
  border: 1px solid var(--color-pink-lavender-darker);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  width: 10rem;
}

.back-button:hover {
  background-color: hsla(278, 100%, 34%, 0.2);

}

.review {
  margin: 1rem 0;
  width: 10rem;
}

.reviews p {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-pink-lavender-darker);
  margin-bottom: 0.5rem;
}

.review-text {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  margin: 0.5rem 0;
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
