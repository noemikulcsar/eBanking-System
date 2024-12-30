import datetime
from flask import Flask, jsonify, request
import mysql.connector
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

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
        # Adăugăm notificarea în tabela 'notificare'
        cursor.execute("""
            INSERT INTO notificare (id_client, mesaj, data_notificare, status)
            VALUES (%s, %s, NOW(), %s)
            """, (1, f'Transfer de {amount} RON către {recipient["id"]} efectuat cu succes!', 'necitit'))

        connection.commit()
        socketio.emit('transaction_notification', {'message': f'Transfer de {amount} RON efectuat cu succes!'})
        return jsonify({'success': True})

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la procesarea transferului'}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/client-by-phone/<phone_number>', methods=['GET'])
def get_client_by_phone(phone_number):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT nume, prenume FROM client WHERE telefon = %s", (phone_number,))
        client = cursor.fetchone()
        cursor.close()
        connection.close()
        if client:
            return jsonify(client)
        else:
            return jsonify({'error': 'Clientul nu a fost găsit'}), 404
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la preluarea datelor clientului'}), 500

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
@app.route('/api/notificare', methods=['POST'])
def add_notificare():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        # Datele primite de la client
        data = request.json
        id_client = data.get('id_client')
        mesaj = data.get('mesaj')
        
        if not id_client or not mesaj:
            return jsonify({'error': 'Lipsesc datele necesare'}), 400
        
        data_notificare = datetime.now()
        cursor.execute("""
            INSERT INTO notificare (id_client, mesaj, data_notificare, status)
            VALUES (%s, %s, %s, %s)
        """, (id_client, mesaj, data_notificare, 'necitit'))
        
        connection.commit()
        return jsonify({'success': True}), 200

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la salvarea notificării'}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/api/subscriptions', methods=['GET'])
def get_subscriptions():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT platforma.nume AS name, platforma.pret AS price, abonament.data_inceput AS start_date
            FROM abonament
            JOIN platforma ON abonament.id_platforma = platforma.id
            WHERE abonament.id_client = %s
        """, (1,))
        
        subscriptions = cursor.fetchall()
        return jsonify(subscriptions)
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': 'A apărut o eroare la preluarea abonamentelor'}), 500
    
    finally:
        cursor.close()
        connection.close()


if __name__ == '__main__':
    #app.run(debug=True)
    socketio.run(app, debug=True)

