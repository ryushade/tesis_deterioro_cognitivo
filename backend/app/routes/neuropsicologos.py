"""
Rutas para gestion de neuropsicologos (psycopg2)
"""
from flask import Blueprint, request, jsonify
import logging
from app.services.neuropsicologos_service import NeuropsicologosService

logger = logging.getLogger(__name__)

neuropsicologos_bp = Blueprint('neuropsicologos', __name__)
service = NeuropsicologosService()


@neuropsicologos_bp.route('', methods=['GET'])
def get_neuropsicologos():
    """Obtener lista de neuropsicologos con paginacion y busqueda."""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))
        search = (request.args.get('search', '') or '').strip() or None
        include_inactive = request.args.get('include_inactive', 'true').lower() == 'true'

        # role_id opcional para filtrar por ID de rol (según tu esquema)
        role_id = request.args.get('role_id')
        role_id = int(role_id) if role_id is not None and str(role_id).isdigit() else None

        result = service.get_all(page=page, limit=limit, search=search, include_inactive=include_inactive, role_id=role_id)
        status = 200 if result.get('success') else 400
        return jsonify(result), status
    except ValueError:
        return jsonify({'success': False, 'message': 'Parametros invalidos'}), 400
    except Exception as e:
        logger.error(f'Error en get_neuropsicologos: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500
