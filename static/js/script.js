// Função para mostrar mensagens de status
function mostrarMensagem(mensagem, tipo = "sucesso") {
    const statusDiv = document.createElement("div");
    statusDiv.className = `status ${tipo}`;
    statusDiv.textContent = mensagem;
    document.body.appendChild(statusDiv);

    setTimeout(() => {
        statusDiv.remove();
    }, 3000);

}

function Limpa_campos() {
    document.getElementById("nome").value = "";
    document.getElementById("pendencias").value = "ok";
    document.getElementById("data_emissao").value = "";
    document.getElementById("observacao").value = "";
}


// Função para cadastrar pessoa
async function cadastrarCooperado() {
    const nome = document.getElementById("nome").value;
    const pendencias = document.getElementById("pendencias").value;
    const data_emissao = document.getElementById("data_emissao").value;
    const observacao = document.getElementById("observacao").value;

    if (!nome || !pendencias || !data_emissao) {
        mostrarMensagem("Por favor, preencha todos os campos obrigatórios.", "erro");
        return;
    }

    const response = await fetch("/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, pendencias, data_emissao, observacao }),
    });

    const data = await response.json();
    alert(data.mensagem, data.sucesso ? "sucesso" : "erro");

    Limpa_campos();
}


// Evento do botão cadastrar
document.getElementById("btn-cadastrar").addEventListener("click", cadastrarCooperado);
