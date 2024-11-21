import {jwtDecode} from "jwt-decode";

export function getUserId() {
    const token = localStorage.getItem("user-token")
    const decodedToken = jwtDecode(token)
    return decodedToken.userId;
}
