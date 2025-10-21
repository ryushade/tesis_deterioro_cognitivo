from flask import Blueprint, jsonify
from app.services.database_service import DatabaseService
from app.services.pacientes_service import PacientesService
from app.services.evaluaciones_service import EvaluacionesService
from app.services.neuropsicologos_service import NeuropsicologosService
from app.services.user_database_service import UserDatabaseService
from datetime import datetime, timedelta
from collections import defaultdict

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Obtener métricas del dashboard"""
    try:
        # Inicializar servicios
        db_service = DatabaseService()
        pacientes_service = PacientesService()
        evaluaciones_service = EvaluacionesService()
        neuropsicologos_service = NeuropsicologosService()
        user_service = UserDatabaseService()
        
        # Obtener estadísticas básicas
        usuarios_activos = user_service.get_total_active_users()
        pacientes_registrados = pacientes_service.get_total_pacientes()
        evaluaciones_realizadas = evaluaciones_service.get_total_evaluaciones()
        neuropsicologos_activos = neuropsicologos_service.get_total_neuropsicologos()
        
        # Obtener datos para gráficos
        evaluaciones_por_mes = evaluaciones_service.get_evaluaciones_por_mes()
        pacientes_por_edad = pacientes_service.get_pacientes_por_edad()
        evaluaciones_por_tipo = evaluaciones_service.get_evaluaciones_por_tipo()
        
        metrics = {
            'usuarios_activos': usuarios_activos,
            'pacientes_registrados': pacientes_registrados,
            'evaluaciones_realizadas': evaluaciones_realizadas,
            'neuropsicologos_activos': neuropsicologos_activos,
            'evaluaciones_por_mes': evaluaciones_por_mes,
            'pacientes_por_edad': pacientes_por_edad,
            'evaluaciones_por_tipo': evaluaciones_por_tipo
        }
        
        return jsonify({
            'success': True,
            'data': metrics,
            'message': 'Métricas obtenidas exitosamente'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {
                'usuarios_activos': 0,
                'pacientes_registrados': 0,
                'evaluaciones_realizadas': 0,
                'neuropsicologos_activos': 0,
                'evaluaciones_por_mes': [],
                'pacientes_por_edad': [],
                'evaluaciones_por_tipo': []
            },
            'message': f'Error al obtener métricas: {str(e)}'
        }), 500
