"""
Users API routes using direct database queries (PyMySQL style)
"""
from flask import Blueprint, request, jsonify
from app.services.user_database_service import UserDatabaseService
import math

users_db_bp = Blueprint('users_db', __name__)

@users_db_bp.route('/users-db', methods=['GET'])
def get_users_db():
    """Get all users using direct database queries"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '', type=str)
        
        # Ensure reasonable limits
        limit = min(limit, 100)  # Max 100 items per page
        
        if search:
            result = UserDatabaseService.search_users(search, page, limit)
        else:
            result = UserDatabaseService.get_all_users(page, limit)
        
        # Format users for frontend
        formatted_users = []
        for user in result['users']:
            formatted_users.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'createdAt': user['created_at'].isoformat() if user['created_at'] else None,
                'updatedAt': user['updated_at'].isoformat() if user['updated_at'] else None,
            })
        
        return jsonify({
            'success': True,
            'message': 'Users retrieved successfully',
            'data': formatted_users,
            'total': result['total'],
            'page': result['page'],
            'limit': result['limit'],
            'totalPages': result['total_pages']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving users: {str(e)}',
            'data': None
        }), 500

@users_db_bp.route('/users-db/<int:user_id>', methods=['GET'])
def get_user_db(user_id):
    """Get a specific user by ID using direct database queries"""
    try:
        user = UserDatabaseService.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'data': None
            }), 404
        
        formatted_user = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'createdAt': user['created_at'].isoformat() if user['created_at'] else None,
            'updatedAt': user['updated_at'].isoformat() if user['updated_at'] else None,
        }
        
        return jsonify({
            'success': True,
            'message': 'User retrieved successfully',
            'data': formatted_user
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving user: {str(e)}',
            'data': None
        }), 500

@users_db_bp.route('/users-db', methods=['POST'])
def create_user_db():
    """Create a new user using direct database queries"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided',
                'data': None
            }), 400
        
        # Validate required fields
        if not data.get('name') or not data.get('email'):
            return jsonify({
                'success': False,
                'message': 'Name and email are required',
                'data': None
            }), 400
        
        # Create new user
        user = UserDatabaseService.create_user(data['name'], data['email'])
        
        formatted_user = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'createdAt': user['created_at'].isoformat() if user['created_at'] else None,
            'updatedAt': user['updated_at'].isoformat() if user['updated_at'] else None,
        }
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'data': formatted_user
        }), 201
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve),
            'data': None
        }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creating user: {str(e)}',
            'data': None
        }), 500

@users_db_bp.route('/users-db/<int:user_id>', methods=['PUT'])
def update_user_db(user_id):
    """Update a user using direct database queries"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided',
                'data': None
            }), 400
        
        # Update user
        user = UserDatabaseService.update_user(
            user_id, 
            name=data.get('name'), 
            email=data.get('email')
        )
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'data': None
            }), 404
        
        formatted_user = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'createdAt': user['created_at'].isoformat() if user['created_at'] else None,
            'updatedAt': user['updated_at'].isoformat() if user['updated_at'] else None,
        }
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'data': formatted_user
        }), 200
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve),
            'data': None
        }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating user: {str(e)}',
            'data': None
        }), 500

@users_db_bp.route('/users-db/<int:user_id>', methods=['DELETE'])
def delete_user_db(user_id):
    """Delete a user using direct database queries"""
    try:
        success = UserDatabaseService.delete_user(user_id)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'data': None
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully',
            'data': None
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error deleting user: {str(e)}',
            'data': None
        }), 500
