from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Banco de dados
def conectar_banco():
    conexao = sqlite3.connect("cadastros.db")
    conexao.row_factory = sqlite3.Row
    return conexao

# Criar tabela caso não exista
def criar_tabela():
    conexao = conectar_banco()
    cursor = conexao.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cooperados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            pendencias TEXT,
            data_emissao TEXT,
            observacao TEXT
        )
    """)
    conexao.commit()
    conexao.close()

# Rota principal
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/Atualizar_cad")
def paginaC():
    return render_template("Atualizar_cad.html")

@app.route("/busca")
def busca():
    return render_template("busca.html")

# Rota para cadastrar pessoa
@app.route("/cadastrar", methods=["POST"])
def cadastrar():
    dados = request.get_json()
    nome = dados.get("nome")
    pendencias = dados.get("pendencias")
    data_emissao = dados.get("data_emissao")
    observacao = dados.get("observacao", "")

    if data_emissao:
       try:
        data_emissao = datetime.strptime(data_emissao, '%Y-%m-%d').strftime('%d/%m/%Y')
       except ValueError:
        return jsonify({"sucesso": False, "mensagem": "Formato de data inválido. Use o formato 'YYYY-MM-DD'."})
    
    if not nome or not pendencias or not data_emissao:
        return jsonify({"sucesso": False, "mensagem": "Todos os campos obrigatórios devem ser preenchidos."})

    conexao = conectar_banco()
    cursor = conexao.cursor()
    cursor.execute(
        "INSERT INTO cooperados (nome, pendencias, data_emissao, observacao) VALUES (?, ?, ?, ?)",
        (nome, pendencias, data_emissao, observacao)
    )
    conexao.commit()
    conexao.close()

    return jsonify({"sucesso": True, "mensagem": f"Cooperado {nome} cadastrado com sucesso!"})

@app.route("/buscar", methods=["POST"])
def buscar():
    dados = request.get_json()
    nome = dados.get("nome", "")

    conexao = conectar_banco()
    cursor = conexao.cursor()
    cursor.execute("SELECT * FROM cooperados WHERE nome LIKE ?", (f"%{nome}%",))
    resultado = cursor.fetchall()
    conexao.close()

    cooperados = [
        {
            "id": row["id"],
            "nome": row["nome"],
            "pendencias": row["pendencias"],
            "data_emissao": row["data_emissao"],
            "observacao": row["observacao"]
        }
        for row in resultado
    ]
    return jsonify({"cooperados": cooperados})


@app.route("/atualizar", methods=["PUT"])
def atualizar():
    dados = request.get_json()
    id_cooperado = dados.get("id")
    novo_status = dados.get("pendencias")
    nova_observacao = dados.get("observacao", "")  # Alteração: Valor padrão para observação

    if not id_cooperado or not novo_status:
        return jsonify({"sucesso": False, "mensagem": "ID e status são obrigatórios."})

    conexao = conectar_banco()
    cursor = conexao.cursor()
    cursor.execute(
        "UPDATE cooperados SET pendencias = ?, observacao = ? WHERE id = ?",
        (novo_status, nova_observacao, id_cooperado)
    )
    conexao.commit()
    conexao.close()

    return jsonify({"sucesso": True, "mensagem": "Status e observação atualizados com sucesso!"})

# Criar tabela ao iniciar
criar_tabela()

if __name__ == "__main__":
    app.run(debug=True)