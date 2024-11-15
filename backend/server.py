from flask import Flask, jsonify, request
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

db_config = {
    'host': 'localhost',
    'user': 'root',  
    'password': 'root',  
    'database': 'utpay'  
}

# Cache pentru sold si economii
cache_balance = {}

def get_balance_from_db(client_id):
    if client_id in cache_balance:
        return cache_balance[client_id]
    
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        query = "SELECT sold, economii FROM cont WHERE id_client = %s"
        cursor.execute(query, (client_id,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if result:
            cache_balance[client_id] = result
            return result
        else:
            return None
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

@app.route('/api/balance', methods=['GET'])
def get_balance():
    client_id = 1  # Poți modifica această valoare sau să o obții din sesiune
    balance_data = get_balance_from_db(client_id)
    if balance_data:
        return jsonify({'balance': balance_data['sold'], 'savings': balance_data['economii']})
    else:
        return jsonify({'error': 'Soldul nu a fost găsit pentru acest client'}), 404

def get_client_data(client_id):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT c.id AS client_id, c.nume, c.prenume, c.cnp, c.telefon, c.email, 
                   t.iban, t.sold, t.economii, t.numar_card, t.cvv, t.data_expirare
            FROM client c
            JOIN cont t ON c.id = t.id_client
            WHERE c.id = %s
        """
        cursor.execute(query, (client_id,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if result:
            return result
        else:
            return None
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
@app.route('/api/personal-data', methods=['GET'])
def get_personal_data():
    client_id = 1  # Poți modifica această valoare sau să o obții din sesiune
    client_data = get_client_data(client_id)
    
    if client_data:
        return jsonify(client_data)
    else:
        return jsonify({'error': 'Datele clientului nu au fost găsite'}), 404
    
@app.route('/api/transaction-history', methods=['GET'])
def transaction_history():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT t.suma, t.data, t.id_expeditor, t.id_destinatar, t.id_magazin,
                   c1.nume AS from_nume, c1.prenume AS from_prenume, 
                   c2.nume AS to_nume, c2.prenume AS to_prenume, 
                   m.nume AS magazin_nume, m.adresa AS magazin_adresa
            FROM tranzactie t
            LEFT JOIN client c1 ON t.id_expeditor = c1.id
            LEFT JOIN client c2 ON t.id_destinatar = c2.id
            LEFT JOIN magazin m ON t.id_magazin = m.id
            WHERE t.id_expeditor = 1 OR t.id_destinatar = 1
            ORDER BY t.data DESC
        """)

        transactions = cursor.fetchall()
        for transaction in transactions:
            # Modificăm suma pentru clientul cu id=1
            if transaction['id_expeditor'] == 1:
                transaction['suma'] = -transaction['suma']  # Clientul 1 scade suma
            elif transaction['id_destinatar'] == 1:
                transaction['suma'] = '+' + str(transaction['suma'])  # Clientul 1 primește suma
        return jsonify(transactions)

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la preluarea istoricului tranzacțiilor'}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True)
