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
    
@app.route('/api/transfer', methods=['POST'])
def transfer():
    data = request.get_json()
    phone_number = data.get('phoneNumber')
    amount = data.get('amount')

    if not phone_number or not amount:
        return jsonify({'error': 'Phone number or amount is missing'}), 400

    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT id FROM client WHERE telefon = %s", (phone_number,))
        recipient = cursor.fetchone()

        if not recipient:
            return jsonify({'error': 'Clientul cu acest număr de telefon nu a fost găsit'}), 404

        cursor.execute("SELECT sold FROM cont WHERE id_client = 1")
        sender_account = cursor.fetchone()

        if not sender_account or sender_account['sold'] < amount:
            return jsonify({'error': 'Fonduri insuficiente pentru transfer'}), 400

        # Actualizăm soldurile
        cursor.execute("UPDATE cont SET sold = sold + %s WHERE id_client = %s", (amount, recipient['id']))
        cursor.execute("UPDATE cont SET sold = sold - %s WHERE id_client = 1", (amount,))

        # Adăugăm tranzacția în tabela 'tranzactie'
        cursor.execute("""
            INSERT INTO tranzactie (id_expeditor, id_destinatar, suma, data, tip_destinatar, detalii)
            VALUES (%s, %s, %s, NOW(), 'client', NULL)
        """, (1, recipient['id'], amount))

        connection.commit()
        return jsonify({'success': True})

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la procesarea transferului'}), 500
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True)
