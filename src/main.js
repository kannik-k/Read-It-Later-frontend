import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { getTokenExpirationTime } from './utils/auth';

const app = createApp(App)

/**
 * Check if user token has expired -> log out and return to home page if true.
 * This runs before every http request.
 */
axios.interceptors.request.use( function (config) {
    const token_expiration = getTokenExpirationTime() // milli-seconds
    if (token_expiration) {
        const currentTime = Date.now()
        if (token_expiration < currentTime) {
            handleExpiredToken()
            console.log("token expiration: " + token_expiration)
            console.log("current time: " + currentTime)
            console.log("token expired")
            return Promise.reject(new Error('Token expired'));
        }
    }
    return config; // Allows the http request to proceed
}, function (error) {
    return Promise.reject(error);
});

function handleExpiredToken() {
    localStorage.removeItem('user-token');
    router.push('/'); // Navigate to the home page
    location.reload()
}


const token = localStorage.getItem('user-token');
if (token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}

app.provide('axios', axios)

app.use(router)

app.mount('#app')
