async function requireLoggedOut(redirectUrl="/") {
    const response = await fetch("http://localhost:3000/auth/me", {credentials: "include"});
    if (response.ok) {
        window.location.href=redirectUrl;
    }
}

async function requireLogin(redirectUrl="/") {
    const response = await fetch("http://localhost:3000/auth/me", {credentials: "include"});
    if(!response.ok) {
        window.location.href=redirectUrl;
    }
}

async function requireUserTypeUser(redirectUrl="/auth/userLogin") {
    const response = await fetch("http://localhost:3000/auth/me", {credentials: "include"});
    if(!response.ok) {
        window.location.href=redirectUrl;
    }
    const user = await response.json();
    if (user.userType !== "user") {
        window.location.href=redirectUrl;
    }
}

async function requireUserTypeShop(redirectUrl="/auth/buisnessLogin") {
    const response = await fetch("http://localhost:3000/auth/me", {credentials: "include"});
    if(!response.ok) {
        window.location.href=redirectUrl;
    }
    const user = await response.json();
    if (user.userType !== "shop") {
        window.location.href=redirectUrl;
    }
}

async function getUser() {
    const response = await fetch("http://localhost:3000/auth/me", {credentials: "include"});

    if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }
    
    return await response.json();
}