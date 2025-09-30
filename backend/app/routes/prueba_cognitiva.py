"""
Rutas para gestión de pruebas cognitivas (catálogo)
"""
from flask import Blueprint, request, jsonify
import logging

from app.services.prueba_cognitiva_service import PruebaCognitivaService

logger = logging.getLogger(__name__)

prueba_cognitiva_bp = Blueprint('pruebas_cognitivas', __name__)
service = PruebaCognitivaService()


@prueba_cognitiva_bp.route('', methods=['GET'])
def list_pruebas():
  try:
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = (request.args.get('search') or '').strip() or None
    modo_aplicacion = (request.args.get('modo_aplicacion') or '').strip() or None
    activo_param = request.args.get('activo')

    activo = None
    if activo_param is not None and activo_param != "":
      val = activo_param.lower()
      if val in ('true', '1', 't', 'yes', 'Activo'):
        activo = True
      elif val in ('false', '0', 'f', 'Inactivo'):
        activo = False
      else:
        return jsonify({'success': False, 'message': 'Parametro activo inválido'}), 400

    # Bounds
    if page < 1:
      page = 1
    if limit < 1 or limit > 100:
      limit = 10

    result = service.get_all(page=page, limit=limit, search=search, modo_aplicacion=modo_aplicacion, activo=activo)
    return jsonify(result), 200 if result.get('success') else 400
  except ValueError:
    return jsonify({'success': False, 'message': 'Parámetros inválidos'}), 400
  except Exception as e:
    logger.error(f"Error en list_pruebas: {e}")
    return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@prueba_cognitiva_bp.route('/<int:id_prueba>', methods=['GET'])
def get_prueba(id_prueba: int):
  try:
    result = service.get_by_id(id_prueba)
    return jsonify(result), 200 if result.get('success') else 404
  except Exception as e:
    logger.error(f"Error en get_prueba: {e}")
    return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@prueba_cognitiva_bp.route('', methods=['POST'])
def create_prueba():
  try:
    data = request.get_json() or {}
    if not data:
      return jsonify({'success': False, 'message': 'No se proporcionaron datos'}), 400
    result = service.create(data)
    return jsonify(result), 201 if result.get('success') else 400
  except Exception as e:
    logger.error(f"Error en create_prueba: {e}")
    return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@prueba_cognitiva_bp.route('/<int:id_prueba>', methods=['PUT'])
def update_prueba(id_prueba: int):
  try:
    data = request.get_json() or {}
    if not data:
      return jsonify({'success': False, 'message': 'No se proporcionaron datos'}), 400
    result = service.update(id_prueba, data)
    return jsonify(result), 200 if result.get('success') else 400
  except Exception as e:
    logger.error(f"Error en update_prueba: {e}")
    return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@prueba_cognitiva_bp.route('/<int:id_prueba>', methods=['DELETE'])
def delete_prueba(id_prueba: int):
  try:
    result = service.delete(id_prueba)
    return jsonify(result), 200 if result.get('success') else 400
  except Exception as e:
    logger.error(f"Error en delete_prueba: {e}")
    return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@prueba_cognitiva_bp.route('/<int:id_prueba>/restore', methods=['POST'])
def restore_prueba(id_prueba: int):
  try:
    result = service.restore(id_prueba)
    return jsonify(result), 200 if result.get('success') else 400
  except Exception as e:
    logger.error(f"Error en restore_prueba: {e}")
    return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500
