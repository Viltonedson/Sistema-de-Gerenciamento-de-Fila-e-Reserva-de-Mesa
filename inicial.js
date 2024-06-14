document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "admin" && password === "admin") {
        window.location.href = "menu.html";
    } else {
        alert("Nome de usuário ou senha incorretos!");
    }
});

