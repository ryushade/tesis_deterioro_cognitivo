from flask import Blueprint, request, jsonify
from app.services.auth_service_psycopg2 import auth_service_psycopg2 as auth_service
from app.services.jwt_service import JWTService

users_psycopg2_bp = Blueprint('users_psycopg2', __name__)


@users_psycopg2_bp.route('/<int:user_id>', methods=['PUT'])
@JWTService.token_required
@JWTService.admin_required
def update_user(user_id: int):
    try:
        data = request.get_json() or {}
        username = data.get('username')
        role_id = data.get('role_id')
        updated, message = auth_service.update_user(user_id, username=username, role_id=role_id)
        if updated:
            return jsonify({
                'success': True,
                'message': message,
                'data': updated
            }), 200
        return jsonify({'success': False, 'message': message}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error updating user: {str(e)}'}), 500


@users_psycopg2_bp.route('/<int:user_id>', methods=['DELETE'])
@JWTService.token_required
@JWTService.admin_required
def delete_user(user_id: int):
    try:
        ok, message = auth_service.delete_user(user_id)
        if ok:
            return jsonify({'success': True, 'message': message}), 200
        return jsonify({'success': False, 'message': message}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error deleting user: {str(e)}'}), 500

