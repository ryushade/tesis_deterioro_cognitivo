import { useEffect, useState } from 'react'
import { apiClient } from './api'

const RESOURCE = '/auth/obtener_paciente'

export interface Paciente {
  id_paciente: number;
  id_usuario: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: string;
  escolaridad: string;
  estado: number;
}   
    