"""
Users DB routes placeholder using direct DB service (psycopg2).
This minimal blueprint prevents import errors if not used by frontend.
"""
from flask import Blueprint, jsonify

users_db_bp = Blueprint('users_db', __name__)


@users_db_bp.route('/users-db', methods=['GET'])
def get_users_db():
    return jsonify({
        'success': True,
        'message': 'Users endpoint placeholder',
        'data': [],
        'total': 0,
        'page': 1,
        'limit': 10,
        'totalPages': 0
    }), 200

