document.addEventListener("DOMContentLoaded", () => {
    const formBuscar = document.getElementById("form-buscar");
    const tabelaCooperados = document.getElementById("tabela-cooperados").querySelector("tbody");

    // Função para buscar cooperados pelo nome
    formBuscar.addEventListener("submit", (event) => {
        event.preventDefault();
        const nome = document.getElementById("buscar-nome").value;

        if (!nome) {
            alert("Por favor, insira um nome para buscar.");
            return;
        }

        fetch(`/buscar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome })
        })
            .then(response => response.json())
            .then(data => {
                tabelaCooperados.innerHTML = "";

                if (data.cooperados.length === 0) {
                    // Alteração: Dinamicamente define o colspan para alinhar com a tabela
                    tabelaCooperados.innerHTML = `<tr><td colspan="${tabelaCooperados.parentElement.querySelectorAll('th').length}">Nenhum cooperado encontrado.</td></tr>`;
                } else {
                    data.cooperados.forEach(cooperado => {
                        const row = document.createElement("tr");
                        const dataFormatada = formatarData(cooperado.data_emissao);

                        row.innerHTML = `
                            <td>${cooperado.nome}</td>
                            <td>${cooperado.observacao}</td>
                            <td>${dataFormatada}</td>
                            <td>${cooperado.pendencias}</td>
                            <td>
                                <button class="btn-atualizar" data-id="${cooperado.id}">Atualizar</button>
                            </td>
                        `;
                        tabelaCooperados.appendChild(row);
                    });

                    adicionarEventosAtualizar();
                }
            })
            .catch(error => console.error("Erro ao buscar cooperados:", error));
    });

    // Adicionar eventos aos botões de atualizar
    function adicionarEventosAtualizar() {
        const botoesAtualizar = document.querySelectorAll(".btn-atualizar");

        botoesAtualizar.forEach(botao => {
            botao.addEventListener("click", () => {
                const id = botao.getAttribute("data-id");
                const novoStatus = prompt("Digite o novo status (ok/pendente):");
                const novaObservacao = prompt("Digite a nova observação (ou deixe em branco):", ""); // Alteração: Solicita observação

                if (!novoStatus || (novoStatus !== "ok" && novoStatus !== "pendente")) {
                    alert("Status inválido! Use 'ok' ou 'pendente'.");
                    return;
                }

                fetch(`/atualizar`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, pendencias: novoStatus, observacao: novaObservacao })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.sucesso) {
                            alert(data.mensagem);
                            formBuscar.dispatchEvent(new Event("submit")); // Atualizar a tabela
                        } else {
                            alert(data.mensagem);
                        }
                    })
                    .catch(error => console.error("Erro ao atualizar o status:", error));
            });
        });
    }
});



function formatarData(dataEmissao) {
    // Verifica se a data está no formato esperado (YYYY-MM-DD)
    if (!dataEmissao) return "Data inválida";

    if (dataEmissao.includes("/")) {

         // Divide a string em partes: [YYYY, MM, DD]
         const partes =  dataEmissao.split("/");
         if (partes.length !== 3) return "Data inválida";
         const dia = partes[0];
         const mes = partes[1];
         const ano = partes[2];
         // Retorna a data no formato DD/MM/YYYY
         return `${dia}/${mes}/${ano}`;


    } else if (dataEmissao.includes("-")) {

         const partes =  dataEmissao.split("-");
         if (partes.length !== 3) return "Data inválida";
         const ano = partes[0];
         const mes = partes[1];
         const dia = partes[2];
         // Retorna a data no formato DD/MM/YYYY
         return `${dia}/${mes}/${ano}`;


    } else {

        return "O formato da data é inválido";
    }


   


}

// Exemplo de uso
const dataOriginal = "2024-12-23"; // Exemplo do formato bruto
const dataFormatada = formatarData(dataOriginal);
console.log(dataFormatada); // "23/12/2024"

