class Cadastro {
    constructor() {
        const salvo = localStorage.getItem("dados");
        const dadosParseados = salvo ? JSON.parse(salvo) : [];
        this.dados = Array.isArray(dadosParseados) ? dadosParseados : [];
        this.idSendoEditado = null;
    }
    salvar() {
        localStorage.setItem("dados", JSON.stringify(this.dados));
    }
    adicionar(valor) {
        this.dados.push(valor);
        this.salvar();
    }
    editar(indice, valor) {
        this.dados[indice] = valor;
        this.salvar();
    }
    remover(indice) {
        this.dados.splice(indice, 1);
        this.salvar();
    }
    limpar() {
        this.dados = [];
        this.salvar();
    }
}

const cadastro = new Cadastro();
const entrada = document.getElementById("entrada");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");
const botaoAdicionar = document.getElementById("adicionar");
const botaoLimpar = document.getElementById("limpar");
const inputBusca = document.getElementById("busca");

function atualizarLista(filtro = "") {
    lista.innerHTML = "";
    cadastro.dados.forEach((item, index) => {
        if (!item.toLowerCase().includes(filtro.toLowerCase())) return;

        const li = document.createElement("li");

        // 1. TEXTO
        const span = document.createElement("span");
        span.innerText = item;
        span.style.color = "white";

        // 2. BOTÃO EDITAR (ENGRENAGEM)
        const btnEditar = document.createElement("button");
        btnEditar.innerHTML = '⚙️';
        btnEditar.classList.add("btn-editar");
        btnEditar.onclick = () => {
            entrada.value = item;
            cadastro.idSendoEditado = index;
            entrada.focus();
        };

        // 3. BOTÃO REMOVER (X)
        const btnRemover = document.createElement("button");
        btnRemover.innerText = "x";
        btnRemover.classList.add("btn-remover");
        btnRemover.onclick = () => {
            cadastro.remover(index);
            atualizarLista(inputBusca.value);
        };

        // 4. DIV PARA AGRUPAR OS BOTÕES (Dando o efeito "fixo" um do lado do outro)
        const divAcoes = document.createElement("div");
        divAcoes.classList.add("acoes-lista");
        divAcoes.appendChild(btnEditar);
        divAcoes.appendChild(btnRemover);

        // 5. MONTAGEM FINAL DO ITEM DA LISTA
        li.appendChild(span);
        li.appendChild(divAcoes);
        lista.appendChild(li);
    });
}

// CORREÇÃO AQUI: Organizei as chaves { } do botão adicionar
botaoAdicionar.addEventListener("click", function (e) {
    e.preventDefault();
    const valor = entrada.value.trim();

    if (!valor) {
        mensagem.innerText = "Digite algo";
        mensagem.className = "erro";
        return;
    }

    if (cadastro.idSendoEditado !== null) {
        cadastro.editar(cadastro.idSendoEditado, valor);
        cadastro.idSendoEditado = null;
        mensagem.innerText = "Editado!";
        mensagem.className = "sucesso";
    } else {
        if (cadastro.dados.includes(valor)) {
            mensagem.innerText = "Nome já existe";
            mensagem.className = "erro";
            return; // Adicionado return para não duplicar se já existir
        }
        cadastro.adicionar(valor);
        mensagem.innerText = "Adicionado";
        mensagem.className = "sucesso";
    }

    entrada.value = "";
    atualizarLista(inputBusca.value);
});

botaoLimpar.addEventListener("click", () => {
    cadastro.limpar();
    atualizarLista();
    mensagem.innerText = "Lista limpa";
    mensagem.className = "sucesso";
});

inputBusca.addEventListener("keyup", () => {
    atualizarLista(inputBusca.value);
});

document.addEventListener("DOMContentLoaded", () => {
    atualizarLista();
});

// ... (resto do seu código acima)

document.addEventListener("DOMContentLoaded", () => {
    atualizarLista();
});

// COLOQUE AQUI:
window.addEventListener('storage', (event) => {
    if (event.key === 'dados') {
        const novosDados = JSON.parse(event.newValue);
        cadastro.dados = novosDados || [];
        atualizarLista(inputBusca.value);
    }
});
