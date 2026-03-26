/**
 * 1. FUNÇÕES AUXILIARES (PONTO DE PARTIDA)
 */
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

// Sincronização Google -> LocalStorage (Roda antes de carregar o HTML)
const cookieToken = getCookie('auth_token');
if (cookieToken) {
    localStorage.setItem("token", cookieToken);
    // Limpa o cookie para não entrar em loop de login
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * 2. LÓGICA DE INTERFACE E EVENTOS
 */
document.addEventListener("DOMContentLoaded", () => {
    // Seletores de Elementos (IDs Exatos do seu HTML)
    const telaLogin = document.getElementById("login");
    const telaPrincipal = document.getElementById("telaPrincipal");
    const btnLogin = document.getElementById("btnLogin");
    const btnRegistrar = document.getElementById("btnRegistrar");
    const btnLogout = document.getElementById("btnLogout"); // Logout do Menu
    const btnSair = document.getElementById("btnSair");     // Logout da Tela
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");
    const erroLogin = document.getElementById("erro");
    const menuIcon = document.getElementById('menuIcon');
    const menuDropdown = document.getElementById('menuDropdown');

    // Função que decide qual "camada" mostrar
    const verificarAcesso = () => {
        const token = localStorage.getItem("token");
        if (token) {
            if (telaLogin) telaLogin.style.display = "none";
            if (telaPrincipal) telaPrincipal.style.display = "block";
            atualizarLista();
        } else {
            if (telaLogin) telaLogin.style.display = "block";
            if (telaPrincipal) telaPrincipal.style.display = "none";
        }
    };

    // Executa a checagem assim que abre a página
    verificarAcesso();

    // --- LOGIN MANUAL ---
    if (btnLogin) {
        btnLogin.addEventListener("click", async () => {
            const email = usuarioInput.value;
            const password = senhaInput.value;
            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (!response.ok) { erroLogin.innerText = data.error || "Erro"; return; }

                localStorage.setItem("token", data.token);
                verificarAcesso(); // Avança para a próxima camada
            } catch (err) { erroLogin.innerText = "Erro ao conectar"; }
        });
    }

    // --- REGISTRO ---
    if (btnRegistrar) {
        btnRegistrar.addEventListener("click", async () => {
            const email = document.getElementById("registroEmail").value;
            const password = document.getElementById("registroSenha").value;
            if (!email || !password) { alert("Preencha email e senha"); return; }
            try {
                const res = await fetch("/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                if (res.ok) { alert("Usuário registrado! Agora faça login."); }
                else { const data = await res.json(); alert(data.error || "Erro ao registrar"); }
            } catch (err) { console.error(err); alert("Erro de conexão"); }
        });
    }

    // --- LOGOUT (Lógica Unificada) ---
    const realizarLogout = () => {
        localStorage.removeItem("token");
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.reload();
    };

    if (btnLogout) btnLogout.onclick = realizarLogout;
    if (btnSair) btnSair.onclick = realizarLogout;

    // --- MENU DROPDOWN ---
    if (menuIcon) {
        menuIcon.addEventListener('click', () => menuDropdown.classList.toggle('show'));
    }

    window.onclick = (event) => {
        if (menuDropdown && !event.target.matches('.menu-icon') && !event.target.parentElement.matches('.menu-icon')) {
            menuDropdown.classList.remove('show');
        }
    };
});

/**
 * 3. GERENCIAMENTO DE CLIENTES (MANTIDO)
 */
const entrada = document.getElementById("nome");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");
const botaoAdicionar = document.getElementById("adicionar");
const botaoLimpar = document.getElementById("limpar");
const inputBusca = document.getElementById("busca");

async function atualizarLista(filtro = "") {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("/clientes", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) return;
        const clientes = await response.json();

        lista.innerHTML = "";
        clientes.forEach((cliente) => {
            if (!cliente.nome.toLowerCase().includes(filtro.toLowerCase())) return;

            const li = document.createElement("li");
            li.innerHTML = `
                <span style="color: white;">${cliente.nome}</span>
                <div class="acoes-lista">
                    <button class="btn-editar">⚙️</button>
                    <button class="btn-remover">X</button>
                </div>
            `;

            // Lógica da Engrenagem (Editar)
            li.querySelector('.btn-editar').onclick = () => {
                entrada.value = cliente.nome;
                entrada.dataset.editId = cliente.id;
                entrada.focus();
                mensagem.innerText = "Editando...";
            };

            // Lógica do X (Remover)
            li.querySelector('.btn-remover').onclick = async () => {
                if (confirm("Excluir?")) {
                    await fetch(`/clientes/${cliente.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": "Bearer " + token }
                    });
                    atualizarLista(inputBusca.value);
                }
            };

            lista.appendChild(li);
        });
    } catch (err) { console.error(err); }
}

// Adicionar / Editar Cliente
if (botaoAdicionar) {
    botaoAdicionar.addEventListener("click", async (e) => {
        e.preventDefault();
        const nome = entrada.value.trim();
        const token = localStorage.getItem("token");
        if (!nome) { mensagem.innerText = "Digite algo"; return; }

        const editId = entrada.dataset.editId;
        const method = editId ? "PUT" : "POST";
        const url = editId ? `/clientes/${editId}` : "/clientes";

        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
                body: JSON.stringify({ nome })
            });
            delete entrada.dataset.editId;
            entrada.value = "";
            mensagem.innerText = editId ? "Editado!" : "Adicionado!";
            atualizarLista(inputBusca.value);
        } catch (err) { console.error(err); }
    });
}

// Limpar Lista
if (botaoLimpar) {
    botaoLimpar.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!confirm("Limpar toda a lista?")) return;
        try {
            const res = await fetch("/clientes", { headers: { "Authorization": "Bearer " + token }});
            const clis = await res.json();
            for (const c of clis) {
                await fetch(`/clientes/${c.id}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token }});
            }
            atualizarLista();
        } catch (err) { console.error(err); }
    });
}

if (inputBusca) inputBusca.addEventListener("keyup", () => atualizarLista(inputBusca.value));

/**
 * 4. EFEITOS VISUAIS (PURPURINA E CURSOR - MANTIDOS)
 */
const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    if (cursor) {
        window.requestAnimationFrame(() => {
            cursor.style.left = e.pageX + 'px';
            cursor.style.top = e.pageY + 'px';
        });
    }

    const purpurina = document.createElement('div');
    purpurina.className = 'purpurina';
    purpurina.style.left = e.pageX + 'px';
    purpurina.style.top = e.pageY + 'px';

    const tamanho = Math.random() * 8 + 2 + 'px';
    purpurina.style.width = tamanho;
    purpurina.style.height = tamanho;

    document.body.appendChild(purpurina);
    setTimeout(() => purpurina.remove(), 1000);
});

document.addEventListener('mousedown', () => { if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(0.7)'; });
document.addEventListener('mouseup', () => { if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1)'; });

/**
 * 5. OLHO DA SENHA (MANTIDO)
 */
function toggleSenha() {
    const senha = document.getElementById("registroSenha");
    const botao = document.getElementById("verSenha");
    if (!senha) return;

    if (senha.type === "password") {
        senha.type = "text";
        botao.classList.add("olho-ativo");
    } else {
        senha.type = "password";
        botao.classList.remove("olho-ativo");
    }
}