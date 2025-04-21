document.getElementById("form-buscar").addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("buscar-nome").value;

    // Verifica se o nome foi preenchido
    if (nome.trim() === "") {
        alert("Por favor, insira o nome do cooperado.");
        return;
    }

    // Fazendo a requisição POST para buscar os cooperados
    fetch("/buscar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome: nome })
    })
    .then(response => response.json())
    .then(data => {
        const cooperados = data.cooperados;
        const tabela = document.getElementById("tabela-cooperados").getElementsByTagName("tbody")[0];
         
        // Limpa a tabela antes de adicionar os novos dados
        tabela.innerHTML = "";
       
        // Preenche a tabela com os dados retornados
        cooperados.forEach(cooperado => {
            const row = tabela.insertRow();
           // pendencias ; observacao ; data_emissao ; 
            row.insertCell(0).textContent = cooperado.nome;
            row.insertCell(1).textContent = cooperado.observacao;

            const dataFormatada = formatarData(cooperado.data_emissao);
            row.insertCell(2).textContent = dataFormatada;
            row.insertCell(3).textContent = cooperado.pendencias;
            
            // Cria a célula de ações (editar, excluir, etc)
            const acaoCell = row.insertCell(4);
            const editarBtn = document.createElement("div");
            editarBtn.textContent = "";
            editarBtn.classList.add("editar-btn");

            // Altera a cor do botão com base no status das pendências
            if (cooperado.pendencias === "ok") {
                editarBtn.style.backgroundColor = "#0f9236";
            } else {
                editarBtn.style.backgroundColor = "red";
            }

            acaoCell.appendChild(editarBtn);
        });
    })
    .catch(error => {
        console.error("Erro ao buscar cooperados:", error);
    });



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

