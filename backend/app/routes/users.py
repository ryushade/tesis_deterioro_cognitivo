from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User, user_schema, users_schema
import math

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
def get_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Ensure reasonable limits
        limit = min(limit, 100)  # Max 100 items per page
        
        # Get paginated users
        users_query = User.query.order_by(User.created_at.desc())
        total = users_query.count()
        users = users_query.offset((page - 1) * limit).limit(limit).all()
        
        # Calculate pagination info
        total_pages = math.ceil(total / limit)
        
        return jsonify({
            'success': True,
            'message': 'Users retrieved successfully',
            'data': [user.to_dict() for user in users],
            'total': total,
            'page': page,
            'limit': limit,
            'totalPages': total_pages
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving users: {str(e)}',
            'data': None
        }), 500

@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({
            'success': True,
            'message': 'User retrieved successfully',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'User not found: {str(e)}',
            'data': None
        }), 404

@users_bp.route('/users', methods=['POST'])
def create_user():
    """Create a new user"""
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
        user = User(
            name=data['name'],
            email=data['email']
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'data': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        if 'duplicate key' in str(e) or 'unique constraint' in str(e):
            return jsonify({
                'success': False,
                'message': 'Email already exists',
                'data': None
            }), 400
        
        return jsonify({
            'success': False,
            'message': f'Error creating user: {str(e)}',
            'data': None
        }), 500

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update a user"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided',
                'data': None
            }), 400
        
        # Update fields if provided
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        if 'duplicate key' in str(e) or 'unique constraint' in str(e):
            return jsonify({
                'success': False,
                'message': 'Email already exists',
                'data': None
            }), 400
        
        return jsonify({
            'success': False,
            'message': f'Error updating user: {str(e)}',
            'data': None
        }), 500

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        user = User.query.get_or_404(user_id)
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully',
            'data': None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error deleting user: {str(e)}',
            'data': None
        }), 500
