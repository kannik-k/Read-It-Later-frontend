<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const bookId = route.params.id; // Võtab marsruudi ID parameetri

const book = ref(null);
const reviews = ref([]);
const bookLoading = ref(true);
const reviewsLoading = ref(true);
const errorMessage = ref(null);

const fetchBookDetails = async () => {
  bookLoading.value = true;
  try {
    const response = await axios.get(`/api/public/book/searchById/${bookId}`);
    book.value = response.data;
  } catch (error) {
    errorMessage.value = error.response?.data || 'An error occurred while fetching the book details';
  } finally {
    bookLoading.value = false;
  }
};

const getReviews = async () => {
  reviewsLoading.value = true;
  try {
    const response = await axios.get(`/api/public/review/${bookId}`);
    reviews.value = response.data.map(review => ({
      bookId: review.bookId,
      review: review.review,
    }));
  } catch (error) {
    errorMessage.value = error.response?.data || 'An error occurred while fetching the reviews';
  } finally {
    reviewsLoading.value = false;
  }
};

function redirectToCreateReview() {
  if (book.value?.bookId) {
    router.push(`/book/${book.value.bookId}/add`);
  } else {
    console.error('Book ID is not available for redirecting.');
  }
}

function goBackHome() {
  router.push('/'); // Viib kasutaja home lehele
}

onMounted(() => {
  fetchBookDetails();
  getReviews();
});
</script>

<template>
  <div class="book-details">
    <!-- Back Button -->
    <button class="back-button" @click="goBackHome">Back</button>
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
      <button class="review" @click="redirectToCreateReview">
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
  </div>
</template>

<style scoped>
.book-details {
  padding-left: 5%;
  padding-right: 5%;
  position: relative; /* Tagab, et "Back" nuppu saab paigutada suhtelises positsioonis */
  align-items: center;
}
.book-data {
  margin-top: 1rem;
  margin-bottom: 1rem;
}


/* Back Button */
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
  max-width: 100%; /* Võimaldab arvustustel kasutada maksimaalset ruumi */
  word-wrap: break-word; /* Murrab pikad sõnad */
  overflow-wrap: break-word; /* Toetab pikemate sõnade murdmist */
  white-space: normal; /* Tekstimurdmine lubatud */
  margin: 0.5rem 0;
}
</style>
