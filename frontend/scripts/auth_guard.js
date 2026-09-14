async function requireLoggedOut() {
    const response = await fetch("http://localhost:3000/auth/me", {credentials: "include"});
    if (response.ok) {
        window.location.href="/";
    }
}