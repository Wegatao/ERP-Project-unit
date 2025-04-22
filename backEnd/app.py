from flask import Flask, request, jsonify
from datetime import datetime
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os  # <-- IMPORTANTE!



app = Flask(__name__)
CORS(app)

# Banco de dados / Onde faço a conexão com o banco de dados.

def conectar_banco():
    try:
        # Conexão com o banco de dados MySQL
        conexao = mysql.connector.connect(
            host= "DB_host",         # Host do MySQL (geralmente algo como "localhost" ou "ip_do_servidor")
            database="DB_banco",      # Nome do banco de dados
            user="DB_user",            # Seu usuário MySQL
            password="DB_password"           # Sua senha MySQL
        )
        if conexao.is_connected():
            print("Conexão bem-sucedida com o banco de dados.")
        return conexao
    except Error as e:
        print(f"Erro ao conectar no MySQL: {e}")
        return None
 

# Criar tabela caso não exista
def criar_tabela():
    conexao = conectar_banco()
    cursor = conexao.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cooperados (
         id INT AUTO_INCREMENT PRIMARY KEY,
         nome VARCHAR(255) NOT NULL,
         pendencias TEXT,
         data_emissao VARCHAR(50),
         observacao TEXT
        )
    """)
    conexao.commit()
    conexao.close()

# Rota principal
#@app.route("/")
#def index():
#    return render_template("index.html")

#@app.route("/Atualizar_cad")
#def paginaC():
#    return render_template("Atualizar_cad.html")

#@app.route("/busca")
#def busca():
#    return render_template("busca.html")

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
    "INSERT INTO cooperados (nome, pendencias, data_emissao, observacao) VALUES (%s, %s, %s, %s)",
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
    cursor = conexao.cursor( dictionary=True )
    cursor.execute("SELECT * FROM cooperados WHERE nome LIKE %s", (f"%{nome}%",))
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
        "UPDATE cooperados SET pendencias = %s, observacao = %s WHERE id = %s",
        (novo_status, nova_observacao, id_cooperado)
    )
    
    conexao.commit()
    conexao.close()

    return jsonify({"sucesso": True, "mensagem": "Status e observação atualizados com sucesso!"})

# Criar tabela ao iniciar
criar_tabela()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Pega porta definida pelo Render
    app.run(host="0.0.0.0", port=port)
