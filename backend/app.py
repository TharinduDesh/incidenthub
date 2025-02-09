from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING
from bson import ObjectId
from datetime import datetime
import bcrypt
import os

# Initialize the Flask application
app = Flask(__name__)
CORS(app , supports_credentials=True, origins="http://localhost:5173")

# MongoDB connection setup
MONGO_URI = "mongodb+srv://tharindudrm:incident123@cluster0.egbrs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client.IncidentManagement  # database name
user_db = client.auth_db  # Separate database for user authentication details
collection = db.incidents  # collection name
user_collection = user_db.users  # Collection for user details

# Create the index
collection.create_index([("short_id", ASCENDING)])

def hash_password(password):
    """Hash a password for storing."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt)


# Route to handle POST requests for reporting an incident
@app.route('/report-incident', methods=['POST'])
def report_incident():
    data = request.json
    if not all(key in data for key in ['email', 'customerName', 'address', 'contactNumber', 'incidentTitle', 'description', 'category', 'date']):
        return jsonify({'error': 'Missing fields'}), 400

    data['status'] = 'Pending'
    data['team'] = 'No team assigned'

    try:
        result = collection.insert_one(data)
        short_id = str(result.inserted_id)[-5:]  # Get the last 5 characters of the ObjectId
        collection.update_one({'_id': result.inserted_id}, {'$set': {'short_id': short_id}})
        return jsonify({'message': 'Incident reported successfully', 'short_id': short_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Add endpoint for updating the team in incident
@app.route('/incidents/<id>/update', methods=['POST'])
def update_incident(id):
    update_data = request.json
    status = update_data.get('status')
    team = update_data.get('team')

    try:
        result = collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": status, "team": team}}
        )
        if result.modified_count:
            return jsonify({'message': 'Incident updated successfully'}), 200
        else:
            return jsonify({'error': 'No changes made or incident not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500



    
# Route to handle GET requests for view incident
@app.route('/incidents', methods=['GET'])
def get_incidents():
    short_id_search = request.args.get('search')
    email = request.args.get('email')
    category = request.args.get('category')
    status = request.args.get('status')
    search = request.args.get('search')
    
    query_params = {}  # Initialize query params as an empty dict

    # Apply filters only if provided
    if email:
        query_params['email'] = email  # Filter incidents by user's email if provided
    if category:
        query_params['category'] = category
    if status:
        query_params['status'] = status
    if search:
        # This 'search' should check both 'incidentTitle' and 'description'
        query_params['$or'] = [
            {'incidentTitle': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'short_id': {'$regex': short_id_search, '$options': 'i'}}
        ]

    try:
        incidents = list(collection.find(query_params))
        # Convert ObjectId to string for JSON serialization
        for incident in incidents:
            incident['_id'] = str(incident['_id'])
        return jsonify(incidents), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Route to handle GET requests for a single incident by ID
@app.route('/incidents/<id>', methods=['GET'])
def get_incident(id):
    try:
        incident = collection.find_one({"_id": ObjectId(id)})
        if incident:
            incident['_id'] = str(incident['_id'])  # Convert ObjectId to string for JSON serialization
            return jsonify(incident), 200
        else:
            return jsonify({'error': 'Incident not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Route to update an incident's status
@app.route('/incidents/<id>/update-status', methods=['POST'])
def update_incident_status(id):
    try:
        status = request.json.get('status')
        if not status:
            return jsonify({'error': 'Status is required'}), 400

        result = collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": status}}
        )

        if result.modified_count:
            return jsonify({'message': 'Status updated successfully'}), 200
        else:
            return jsonify({'error': 'No changes made or incident not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to Retrive the users in the 'users' collection of 'auth_db'
@app.route('/admin/users', methods=['GET'])
def get_all_users():
    """Retrieve all users."""
    try:
        print("Fetching all users...")
        users = list(user_collection.find({}, {'password': 0}))
        for user in users:
            user['_id'] = str(user['_id'])
        print("Users fetched successfully.")
        return jsonify(users), 200
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        return jsonify({'error': str(e)}), 500



# Route to add new user
@app.route('/admin/users', methods=['POST'])
def create_user():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Ensure that the email is unique
        if user_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'Email already exists'}), 409

        # Hash password before storing it
        hashed_password = hash_password(data['password'])
        data['password'] = hashed_password

        # Set default values
        data['isVerified'] = True  # Assuming you want admin-created users to be verified by default
        data['lastLogin'] = datetime.utcnow()  # Set current time as last login (could also be None initially)
        data['createdAt'] = datetime.utcnow()  # Record creation time
        data['updatedAt'] = datetime.utcnow()  # Record update time

        user_collection.insert_one(data)
        return jsonify({'message': 'User created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route to update users in user database
@app.route('/admin/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Assuming the password might also need to be updated
        allowed_updates = {'email', 'name', 'userType', 'password'}
        updates = {key: value for key, value in data.items() if key in allowed_updates and value is not None}

        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400

        result = user_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': updates}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'message': 'User updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route to delete users from user database 
@app.route('/admin/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        result = user_collection.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




# Route to update user profile dashboard
@app.route('/user/<user_id>/profile', methods=['PUT'])
def update_profile(user_id):
    try:
        user = user_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.json
        allowed_updates = {'name', 'email', 'address', 'phone', 'password'}
        updates = {k: v for k, v in data.items() if k in allowed_updates and v}

        # Ensure email uniqueness
        if 'email' in updates and updates['email'] != user['email']:
            if user_collection.find_one({'email': updates['email']}):
                return jsonify({'error': 'Email already in use'}), 409

        # Hash the password if it is being updated
        if 'password' in updates:
            updates['password'] = hash_password(updates['password'])

        if updates:
            updates['updatedAt'] = datetime.utcnow()
            result = user_collection.update_one({'_id': ObjectId(user_id)}, {'$set': updates})
            if result.modified_count:
                return jsonify({'message': 'Profile updated successfully'}), 200
            else:
                return jsonify({'error': 'No changes made'}), 404
        else:
            return jsonify({'error': 'No valid fields to update'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Adding charts

@app.route('/admin/user-dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        # Aggregate incident data by category
        category_counts = list(collection.aggregate([
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]))

        # Aggregate incident data by status
        status_counts = list(collection.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]))

        return jsonify({
            'category_counts': category_counts,
            'status_counts': status_counts
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# Adding summry details

@app.route('/admin/dashboard-stats', methods=['GET'])
def dashboard_stats():
    try:
        total_customers = user_collection.count_documents({'userType': 'User'})
        total_pending = collection.count_documents({'status': 'Pending'})
        total_ongoing = collection.count_documents({'status': 'Ongoing'})
        total_completed = collection.count_documents({'status': 'Completed'})
        total_incidents = total_pending + total_ongoing + total_completed  # Sum of all incidents

        return jsonify({
            'total_customers': total_customers,
            'total_pending': total_pending,
            'total_ongoing': total_ongoing,
            'total_completed': total_completed,
            'total_incidents': total_incidents  
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Running port
