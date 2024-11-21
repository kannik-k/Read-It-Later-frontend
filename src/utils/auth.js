import {jwtDecode} from "jwt-decode";

const token = localStorage.getItem("user-token")

export function getUserId() {
    if (token) {
        const decodedToken = jwtDecode(token)
        return decodedToken.userId;
    }
    return null;
}

export function getTokenExpirationTime() {
    if (token) {
        const decodedToken = jwtDecode(token)
        return decodedToken.exp * 1000;  // Multiply with 1000 to make number comparable with current time
    }
    return null;
}
