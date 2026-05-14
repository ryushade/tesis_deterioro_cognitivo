--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2026-05-12 23:02:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 231 (class 1259 OID 42043)
-- Name: analisis_audio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analisis_audio (
    id_audio integer NOT NULL,
    id_evaluacion integer NOT NULL,
    seccion_prueba character varying(100) NOT NULL,
    url_archivo character varying(500) NOT NULL,
    duracion_segundos numeric(5,2),
    transcripcion_texto text,
    metricas_acusticas jsonb,
    puntaje_ia integer
);


ALTER TABLE public.analisis_audio OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 42042)
-- Name: analisis_audio_id_audio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analisis_audio_id_audio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analisis_audio_id_audio_seq OWNER TO postgres;

--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 230
-- Name: analisis_audio_id_audio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analisis_audio_id_audio_seq OWNED BY public.analisis_audio.id_audio;


--
-- TOC entry 229 (class 1259 OID 42029)
-- Name: analisis_visual; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analisis_visual (
    id_analisis integer NOT NULL,
    id_evaluacion integer NOT NULL,
    tipo_dibujo character varying(50) NOT NULL,
    url_imagen character varying(500) NOT NULL,
    puntaje_ia integer,
    detalles_ia jsonb,
    clasificacion_ia character varying(50),
    detalles_ia_jsonb jsonb
);


ALTER TABLE public.analisis_visual OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 42028)
-- Name: analisis_visual_id_analisis_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analisis_visual_id_analisis_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analisis_visual_id_analisis_seq OWNER TO postgres;

--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 228
-- Name: analisis_visual_id_analisis_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analisis_visual_id_analisis_seq OWNED BY public.analisis_visual.id_analisis;


--
-- TOC entry 233 (class 1259 OID 50064)
-- Name: asignacion_prueba; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignacion_prueba (
    id_asignacion integer NOT NULL,
    id_paciente integer NOT NULL,
    id_prueba integer NOT NULL,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado_medico character varying(50) DEFAULT 'Pendiente'::character varying
);


ALTER TABLE public.asignacion_prueba OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 50063)
-- Name: asignacion_prueba_id_asignacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asignacion_prueba_id_asignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asignacion_prueba_id_asignacion_seq OWNER TO postgres;

--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 232
-- Name: asignacion_prueba_id_asignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignacion_prueba_id_asignacion_seq OWNED BY public.asignacion_prueba.id_asignacion;


--
-- TOC entry 237 (class 1259 OID 58257)
-- Name: categoria_mmse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria_mmse (
    id_categoria integer NOT NULL,
    id_prueba integer NOT NULL,
    nombre_categoria character varying(100) NOT NULL,
    puntaje_maximo integer NOT NULL,
    estado integer DEFAULT 1
);


ALTER TABLE public.categoria_mmse OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 58256)
-- Name: categoria_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_id_categoria_seq OWNER TO postgres;

--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 236
-- Name: categoria_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_id_categoria_seq OWNED BY public.categoria_mmse.id_categoria;


--
-- TOC entry 235 (class 1259 OID 50101)
-- Name: codigo_acceso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.codigo_acceso (
    id_codigo integer NOT NULL,
    id_asignacion integer NOT NULL,
    codigo_texto character varying(50) NOT NULL,
    fecha_generacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion timestamp without time zone,
    estado_codigo integer NOT NULL
);


ALTER TABLE public.codigo_acceso OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 50100)
-- Name: codigo_acceso_id_codigo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.codigo_acceso_id_codigo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.codigo_acceso_id_codigo_seq OWNER TO postgres;

--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 234
-- Name: codigo_acceso_id_codigo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.codigo_acceso_id_codigo_seq OWNED BY public.codigo_acceso.id_codigo;


--
-- TOC entry 227 (class 1259 OID 41991)
-- Name: evaluacion_cognitiva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluacion_cognitiva (
    id_evaluacion integer NOT NULL,
    id_neuropsicologo integer NOT NULL,
    fecha_evaluacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    puntaje_total integer,
    diagnostico_ia character varying(100),
    observaciones text,
    estado_evaluacion integer DEFAULT 1 NOT NULL,
    id_asignacion integer NOT NULL
);


ALTER TABLE public.evaluacion_cognitiva OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 41990)
-- Name: evaluacion_cognitiva_id_evaluacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evaluacion_cognitiva_id_evaluacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evaluacion_cognitiva_id_evaluacion_seq OWNER TO postgres;

--
-- TOC entry 5010 (class 0 OID 0)
-- Dependencies: 226
-- Name: evaluacion_cognitiva_id_evaluacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evaluacion_cognitiva_id_evaluacion_seq OWNED BY public.evaluacion_cognitiva.id_evaluacion;


--
-- TOC entry 249 (class 1259 OID 66640)
-- Name: evaluacion_mmse_respuesta_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluacion_mmse_respuesta_item (
    id_respuesta integer NOT NULL,
    id_eval_seccion integer NOT NULL,
    id_opcion integer NOT NULL,
    id_item integer NOT NULL,
    respuesta_texto text,
    respuesta_json jsonb,
    correcto boolean,
    puntaje integer DEFAULT 0 NOT NULL,
    omitido boolean DEFAULT false NOT NULL,
    motivo_omision text,
    requiere_revision boolean DEFAULT false NOT NULL,
    archivo_evidencia text,
    observacion text,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_respuesta_item_correcto_puntaje CHECK (((correcto IS NULL) OR ((correcto = true) AND (puntaje = 1)) OR ((correcto = false) AND (puntaje = 0)))),
    CONSTRAINT chk_respuesta_item_omitido CHECK (((omitido = false) OR (puntaje = 0))),
    CONSTRAINT chk_respuesta_item_puntaje CHECK ((puntaje = ANY (ARRAY[0, 1])))
);


ALTER TABLE public.evaluacion_mmse_respuesta_item OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 66639)
-- Name: evaluacion_mmse_respuesta_item_id_respuesta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.evaluacion_mmse_respuesta_item ALTER COLUMN id_respuesta ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.evaluacion_mmse_respuesta_item_id_respuesta_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 247 (class 1259 OID 66608)
-- Name: evaluacion_mmse_seccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluacion_mmse_seccion (
    id_eval_seccion integer NOT NULL,
    id_evaluacion integer NOT NULL,
    id_seccion integer NOT NULL,
    id_opcion_aplicada integer NOT NULL,
    orden_aplicacion integer NOT NULL,
    aplicada boolean DEFAULT true NOT NULL,
    omitida boolean DEFAULT false NOT NULL,
    motivo_omision text,
    intentos_aprendizaje integer,
    aprendio_estimulos boolean,
    observacion text,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_eval_mmse_intentos_aprendizaje CHECK (((intentos_aprendizaje IS NULL) OR (intentos_aprendizaje >= 0))),
    CONSTRAINT chk_eval_mmse_seccion_aplicacion CHECK ((NOT ((aplicada = true) AND (omitida = true))))
);


ALTER TABLE public.evaluacion_mmse_seccion OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 66607)
-- Name: evaluacion_mmse_seccion_id_eval_seccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.evaluacion_mmse_seccion ALTER COLUMN id_eval_seccion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.evaluacion_mmse_seccion_id_eval_seccion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 245 (class 1259 OID 66488)
-- Name: item_mmse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_mmse (
    id_item integer NOT NULL,
    id_opcion integer NOT NULL,
    texto_item text NOT NULL,
    criterio_correccion text,
    respuesta_esperada text,
    tipo_respuesta character varying(50) DEFAULT 'verbal'::character varying NOT NULL,
    orden integer NOT NULL,
    puntaje_maximo integer DEFAULT 1 NOT NULL,
    requiere_revision_manual boolean DEFAULT false NOT NULL,
    estado integer DEFAULT 1 NOT NULL,
    CONSTRAINT chk_item_estado CHECK ((estado = ANY (ARRAY[0, 1]))),
    CONSTRAINT chk_item_puntaje CHECK ((puntaje_maximo = 1)),
    CONSTRAINT chk_item_tipo_respuesta CHECK (((tipo_respuesta)::text = ANY ((ARRAY['verbal'::character varying, 'texto'::character varying, 'numero'::character varying, 'ejecucion'::character varying, 'lectura_accion'::character varying, 'escritura'::character varying, 'dibujo'::character varying, 'observacion'::character varying])::text[])))
);


ALTER TABLE public.item_mmse OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 66487)
-- Name: item_mmse_id_item_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.item_mmse ALTER COLUMN id_item ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.item_mmse_id_item_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 41938)
-- Name: neuropsicologo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.neuropsicologo (
    id_neuropsicologo integer NOT NULL,
    id_usuario integer NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    estado integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.neuropsicologo OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 41937)
-- Name: neuropsicologo_id_neuropsicologo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.neuropsicologo_id_neuropsicologo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.neuropsicologo_id_neuropsicologo_seq OWNER TO postgres;

--
-- TOC entry 5011 (class 0 OID 0)
-- Dependencies: 221
-- Name: neuropsicologo_id_neuropsicologo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.neuropsicologo_id_neuropsicologo_seq OWNED BY public.neuropsicologo.id_neuropsicologo;


--
-- TOC entry 220 (class 1259 OID 41915)
-- Name: nivel_escolaridad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nivel_escolaridad (
    id_escolaridad integer NOT NULL,
    nom_escolaridad character varying(100) NOT NULL,
    estado integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.nivel_escolaridad OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 41914)
-- Name: nivel_escolaridad_id_escolaridad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nivel_escolaridad_id_escolaridad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nivel_escolaridad_id_escolaridad_seq OWNER TO postgres;

--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 219
-- Name: nivel_escolaridad_id_escolaridad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nivel_escolaridad_id_escolaridad_seq OWNED BY public.nivel_escolaridad.id_escolaridad;


--
-- TOC entry 243 (class 1259 OID 66468)
-- Name: opcion_seccion_mmse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opcion_seccion_mmse (
    id_opcion integer NOT NULL,
    id_seccion integer NOT NULL,
    nombre_opcion character varying(150) NOT NULL,
    instrucciones text,
    orden integer DEFAULT 1 NOT NULL,
    es_default boolean DEFAULT true NOT NULL,
    puntaje_maximo integer NOT NULL,
    estado integer DEFAULT 1 NOT NULL,
    CONSTRAINT chk_opcion_estado CHECK ((estado = ANY (ARRAY[0, 1]))),
    CONSTRAINT chk_opcion_puntaje CHECK ((puntaje_maximo > 0))
);


ALTER TABLE public.opcion_seccion_mmse OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 66467)
-- Name: opcion_seccion_mmse_id_opcion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.opcion_seccion_mmse ALTER COLUMN id_opcion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.opcion_seccion_mmse_id_opcion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 41884)
-- Name: paciente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paciente (
    id_paciente integer NOT NULL,
    id_neuropsicologo integer NOT NULL,
    id_escolaridad integer NOT NULL,
    nombres character varying(255) NOT NULL,
    apellidos character varying(255) NOT NULL,
    fecha_nacimiento date NOT NULL,
    estado integer DEFAULT 1 NOT NULL,
    sexo integer NOT NULL
);


ALTER TABLE public.paciente OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 41883)
-- Name: paciente_id_paciente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paciente_id_paciente_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paciente_id_paciente_seq OWNER TO postgres;

--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 217
-- Name: paciente_id_paciente_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paciente_id_paciente_seq OWNED BY public.paciente.id_paciente;


--
-- TOC entry 225 (class 1259 OID 41965)
-- Name: prueba_catalogo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prueba_catalogo (
    id_prueba integer NOT NULL,
    nombre_prueba character varying(100) NOT NULL,
    puntaje_maximo integer NOT NULL,
    descripcion text,
    estado integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.prueba_catalogo OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 41964)
-- Name: prueba_catalogo_id_prueba_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prueba_catalogo_id_prueba_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prueba_catalogo_id_prueba_seq OWNER TO postgres;

--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 224
-- Name: prueba_catalogo_id_prueba_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prueba_catalogo_id_prueba_seq OWNED BY public.prueba_catalogo.id_prueba;


--
-- TOC entry 239 (class 1259 OID 58270)
-- Name: resultado_categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resultado_categoria (
    id_resultado integer NOT NULL,
    id_evaluacion integer NOT NULL,
    id_categoria integer NOT NULL,
    puntaje_obtenido integer NOT NULL
);


ALTER TABLE public.resultado_categoria OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 58269)
-- Name: resultado_categoria_id_resultado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resultado_categoria_id_resultado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resultado_categoria_id_resultado_seq OWNER TO postgres;

--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 238
-- Name: resultado_categoria_id_resultado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resultado_categoria_id_resultado_seq OWNED BY public.resultado_categoria.id_resultado;


--
-- TOC entry 216 (class 1259 OID 33684)
-- Name: rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol (
    id_rol integer NOT NULL,
    nom_rol character varying(255),
    estado_rol integer NOT NULL
);


ALTER TABLE public.rol OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 66448)
-- Name: seccion_mmse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seccion_mmse (
    id_seccion integer NOT NULL,
    id_categoria integer NOT NULL,
    nombre_seccion character varying(150) NOT NULL,
    descripcion text,
    instrucciones_aplicacion text,
    orden integer NOT NULL,
    puntaje_maximo integer NOT NULL,
    permite_opciones boolean DEFAULT false NOT NULL,
    requiere_material boolean DEFAULT false NOT NULL,
    estado integer DEFAULT 1 NOT NULL,
    CONSTRAINT chk_seccion_estado CHECK ((estado = ANY (ARRAY[0, 1]))),
    CONSTRAINT chk_seccion_puntaje CHECK ((puntaje_maximo > 0))
);


ALTER TABLE public.seccion_mmse OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 66447)
-- Name: seccion_mmse_id_seccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.seccion_mmse ALTER COLUMN id_seccion ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.seccion_mmse_id_seccion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 215 (class 1259 OID 33679)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    id_rol integer NOT NULL,
    usua character varying(20),
    contra character varying(255),
    estado_usuario integer NOT NULL
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 41952)
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 223
-- Name: usuario_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_usuario_seq OWNED BY public.usuario.id_usuario;


--
-- TOC entry 4731 (class 2604 OID 42046)
-- Name: analisis_audio id_audio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_audio ALTER COLUMN id_audio SET DEFAULT nextval('public.analisis_audio_id_audio_seq'::regclass);


--
-- TOC entry 4730 (class 2604 OID 42032)
-- Name: analisis_visual id_analisis; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_visual ALTER COLUMN id_analisis SET DEFAULT nextval('public.analisis_visual_id_analisis_seq'::regclass);


--
-- TOC entry 4732 (class 2604 OID 50067)
-- Name: asignacion_prueba id_asignacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_prueba ALTER COLUMN id_asignacion SET DEFAULT nextval('public.asignacion_prueba_id_asignacion_seq'::regclass);


--
-- TOC entry 4737 (class 2604 OID 58260)
-- Name: categoria_mmse id_categoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria_mmse ALTER COLUMN id_categoria SET DEFAULT nextval('public.categoria_id_categoria_seq'::regclass);


--
-- TOC entry 4735 (class 2604 OID 50104)
-- Name: codigo_acceso id_codigo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_acceso ALTER COLUMN id_codigo SET DEFAULT nextval('public.codigo_acceso_id_codigo_seq'::regclass);


--
-- TOC entry 4727 (class 2604 OID 41994)
-- Name: evaluacion_cognitiva id_evaluacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_cognitiva ALTER COLUMN id_evaluacion SET DEFAULT nextval('public.evaluacion_cognitiva_id_evaluacion_seq'::regclass);


--
-- TOC entry 4723 (class 2604 OID 41941)
-- Name: neuropsicologo id_neuropsicologo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neuropsicologo ALTER COLUMN id_neuropsicologo SET DEFAULT nextval('public.neuropsicologo_id_neuropsicologo_seq'::regclass);


--
-- TOC entry 4721 (class 2604 OID 41918)
-- Name: nivel_escolaridad id_escolaridad; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nivel_escolaridad ALTER COLUMN id_escolaridad SET DEFAULT nextval('public.nivel_escolaridad_id_escolaridad_seq'::regclass);


--
-- TOC entry 4719 (class 2604 OID 41887)
-- Name: paciente id_paciente; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente ALTER COLUMN id_paciente SET DEFAULT nextval('public.paciente_id_paciente_seq'::regclass);


--
-- TOC entry 4725 (class 2604 OID 41968)
-- Name: prueba_catalogo id_prueba; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_catalogo ALTER COLUMN id_prueba SET DEFAULT nextval('public.prueba_catalogo_id_prueba_seq'::regclass);


--
-- TOC entry 4739 (class 2604 OID 58273)
-- Name: resultado_categoria id_resultado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultado_categoria ALTER COLUMN id_resultado SET DEFAULT nextval('public.resultado_categoria_id_resultado_seq'::regclass);


--
-- TOC entry 4718 (class 2604 OID 41953)
-- Name: usuario id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuario_id_usuario_seq'::regclass);


--
-- TOC entry 4788 (class 2606 OID 42050)
-- Name: analisis_audio analisis_audio_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_audio
    ADD CONSTRAINT analisis_audio_pk PRIMARY KEY (id_audio);


--
-- TOC entry 4786 (class 2606 OID 42036)
-- Name: analisis_visual analisis_visual_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_visual
    ADD CONSTRAINT analisis_visual_pk PRIMARY KEY (id_analisis);


--
-- TOC entry 4790 (class 2606 OID 50071)
-- Name: asignacion_prueba asignacion_prueba_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_prueba
    ADD CONSTRAINT asignacion_prueba_pkey PRIMARY KEY (id_asignacion);


--
-- TOC entry 4798 (class 2606 OID 58263)
-- Name: categoria_mmse categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria_mmse
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 4792 (class 2606 OID 50111)
-- Name: codigo_acceso codigo_acceso_codigo_texto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_acceso
    ADD CONSTRAINT codigo_acceso_codigo_texto_key UNIQUE (codigo_texto);


--
-- TOC entry 4794 (class 2606 OID 50109)
-- Name: codigo_acceso codigo_acceso_id_asignacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_acceso
    ADD CONSTRAINT codigo_acceso_id_asignacion_key UNIQUE (id_asignacion);


--
-- TOC entry 4796 (class 2606 OID 50107)
-- Name: codigo_acceso codigo_acceso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_acceso
    ADD CONSTRAINT codigo_acceso_pkey PRIMARY KEY (id_codigo);


--
-- TOC entry 4829 (class 2606 OID 66653)
-- Name: evaluacion_mmse_respuesta_item evaluacion_mmse_respuesta_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_respuesta_item
    ADD CONSTRAINT evaluacion_mmse_respuesta_item_pkey PRIMARY KEY (id_respuesta);


--
-- TOC entry 4820 (class 2606 OID 66619)
-- Name: evaluacion_mmse_seccion evaluacion_mmse_seccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_seccion
    ADD CONSTRAINT evaluacion_mmse_seccion_pkey PRIMARY KEY (id_eval_seccion);


--
-- TOC entry 4784 (class 2606 OID 42000)
-- Name: evaluacion_cognitiva evaluacion_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_cognitiva
    ADD CONSTRAINT evaluacion_pk PRIMARY KEY (id_evaluacion);


--
-- TOC entry 4814 (class 2606 OID 66501)
-- Name: item_mmse item_mmse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_mmse
    ADD CONSTRAINT item_mmse_pkey PRIMARY KEY (id_item);


--
-- TOC entry 4778 (class 2606 OID 41946)
-- Name: neuropsicologo neuropsicologo_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neuropsicologo
    ADD CONSTRAINT neuropsicologo_id_usuario_key UNIQUE (id_usuario);


--
-- TOC entry 4780 (class 2606 OID 41944)
-- Name: neuropsicologo neuropsicologo_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neuropsicologo
    ADD CONSTRAINT neuropsicologo_pk PRIMARY KEY (id_neuropsicologo);


--
-- TOC entry 4776 (class 2606 OID 41921)
-- Name: nivel_escolaridad nivel_escolaridad_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nivel_escolaridad
    ADD CONSTRAINT nivel_escolaridad_pk PRIMARY KEY (id_escolaridad);


--
-- TOC entry 4808 (class 2606 OID 66479)
-- Name: opcion_seccion_mmse opcion_seccion_mmse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opcion_seccion_mmse
    ADD CONSTRAINT opcion_seccion_mmse_pkey PRIMARY KEY (id_opcion);


--
-- TOC entry 4774 (class 2606 OID 41892)
-- Name: paciente paciente_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente
    ADD CONSTRAINT paciente_pk PRIMARY KEY (id_paciente);


--
-- TOC entry 4782 (class 2606 OID 41973)
-- Name: prueba_catalogo prueba_catalogo_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prueba_catalogo
    ADD CONSTRAINT prueba_catalogo_pk PRIMARY KEY (id_prueba);


--
-- TOC entry 4800 (class 2606 OID 58275)
-- Name: resultado_categoria resultado_categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultado_categoria
    ADD CONSTRAINT resultado_categoria_pkey PRIMARY KEY (id_resultado);


--
-- TOC entry 4772 (class 2606 OID 33688)
-- Name: rol rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol
    ADD CONSTRAINT rol_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 4804 (class 2606 OID 66459)
-- Name: seccion_mmse seccion_mmse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seccion_mmse
    ADD CONSTRAINT seccion_mmse_pkey PRIMARY KEY (id_seccion);


--
-- TOC entry 4825 (class 2606 OID 66621)
-- Name: evaluacion_mmse_seccion uq_eval_mmse_seccion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_seccion
    ADD CONSTRAINT uq_eval_mmse_seccion UNIQUE (id_evaluacion, id_seccion);


--
-- TOC entry 4827 (class 2606 OID 66623)
-- Name: evaluacion_mmse_seccion uq_eval_mmse_seccion_opcion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_seccion
    ADD CONSTRAINT uq_eval_mmse_seccion_opcion UNIQUE (id_eval_seccion, id_opcion_aplicada);


--
-- TOC entry 4816 (class 2606 OID 66539)
-- Name: item_mmse uq_item_mmse_iditem_idopcion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_mmse
    ADD CONSTRAINT uq_item_mmse_iditem_idopcion UNIQUE (id_item, id_opcion);


--
-- TOC entry 4818 (class 2606 OID 66503)
-- Name: item_mmse uq_item_opcion_orden; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_mmse
    ADD CONSTRAINT uq_item_opcion_orden UNIQUE (id_opcion, orden);


--
-- TOC entry 4810 (class 2606 OID 66537)
-- Name: opcion_seccion_mmse uq_opcion_seccion_idopcion_idseccion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opcion_seccion_mmse
    ADD CONSTRAINT uq_opcion_seccion_idopcion_idseccion UNIQUE (id_opcion, id_seccion);


--
-- TOC entry 4812 (class 2606 OID 66481)
-- Name: opcion_seccion_mmse uq_opcion_seccion_orden; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opcion_seccion_mmse
    ADD CONSTRAINT uq_opcion_seccion_orden UNIQUE (id_seccion, orden);


--
-- TOC entry 4834 (class 2606 OID 66655)
-- Name: evaluacion_mmse_respuesta_item uq_respuesta_item_por_eval_seccion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_respuesta_item
    ADD CONSTRAINT uq_respuesta_item_por_eval_seccion UNIQUE (id_eval_seccion, id_item);


--
-- TOC entry 4802 (class 2606 OID 66541)
-- Name: resultado_categoria uq_resultado_categoria_eval_categoria; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultado_categoria
    ADD CONSTRAINT uq_resultado_categoria_eval_categoria UNIQUE (id_evaluacion, id_categoria);


--
-- TOC entry 4806 (class 2606 OID 66461)
-- Name: seccion_mmse uq_seccion_categoria_orden; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seccion_mmse
    ADD CONSTRAINT uq_seccion_categoria_orden UNIQUE (id_categoria, orden);


--
-- TOC entry 4770 (class 2606 OID 33683)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 4821 (class 1259 OID 66666)
-- Name: idx_eval_mmse_seccion_evaluacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eval_mmse_seccion_evaluacion ON public.evaluacion_mmse_seccion USING btree (id_evaluacion);


--
-- TOC entry 4822 (class 1259 OID 66668)
-- Name: idx_eval_mmse_seccion_opcion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eval_mmse_seccion_opcion ON public.evaluacion_mmse_seccion USING btree (id_opcion_aplicada);


--
-- TOC entry 4823 (class 1259 OID 66667)
-- Name: idx_eval_mmse_seccion_seccion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eval_mmse_seccion_seccion ON public.evaluacion_mmse_seccion USING btree (id_seccion);


--
-- TOC entry 4830 (class 1259 OID 66669)
-- Name: idx_resp_mmse_eval_seccion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resp_mmse_eval_seccion ON public.evaluacion_mmse_respuesta_item USING btree (id_eval_seccion);


--
-- TOC entry 4831 (class 1259 OID 66670)
-- Name: idx_resp_mmse_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resp_mmse_item ON public.evaluacion_mmse_respuesta_item USING btree (id_item);


--
-- TOC entry 4832 (class 1259 OID 66671)
-- Name: idx_resp_mmse_opcion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_resp_mmse_opcion ON public.evaluacion_mmse_respuesta_item USING btree (id_opcion);


--
-- TOC entry 4843 (class 2606 OID 50072)
-- Name: asignacion_prueba fk_asignacion_paciente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_prueba
    ADD CONSTRAINT fk_asignacion_paciente FOREIGN KEY (id_paciente) REFERENCES public.paciente(id_paciente) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4844 (class 2606 OID 50077)
-- Name: asignacion_prueba fk_asignacion_prueba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_prueba
    ADD CONSTRAINT fk_asignacion_prueba FOREIGN KEY (id_prueba) REFERENCES public.prueba_catalogo(id_prueba) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4842 (class 2606 OID 42051)
-- Name: analisis_audio fk_audio_evaluacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_audio
    ADD CONSTRAINT fk_audio_evaluacion FOREIGN KEY (id_evaluacion) REFERENCES public.evaluacion_cognitiva(id_evaluacion) ON DELETE CASCADE;


--
-- TOC entry 4846 (class 2606 OID 58264)
-- Name: categoria_mmse fk_categoria_prueba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria_mmse
    ADD CONSTRAINT fk_categoria_prueba FOREIGN KEY (id_prueba) REFERENCES public.prueba_catalogo(id_prueba) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4845 (class 2606 OID 50112)
-- Name: codigo_acceso fk_codigo_asignacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.codigo_acceso
    ADD CONSTRAINT fk_codigo_asignacion FOREIGN KEY (id_asignacion) REFERENCES public.asignacion_prueba(id_asignacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4852 (class 2606 OID 66624)
-- Name: evaluacion_mmse_seccion fk_eval_mmse_seccion_evaluacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_seccion
    ADD CONSTRAINT fk_eval_mmse_seccion_evaluacion FOREIGN KEY (id_evaluacion) REFERENCES public.evaluacion_cognitiva(id_evaluacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4853 (class 2606 OID 66634)
-- Name: evaluacion_mmse_seccion fk_eval_mmse_seccion_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_seccion
    ADD CONSTRAINT fk_eval_mmse_seccion_opcion FOREIGN KEY (id_opcion_aplicada, id_seccion) REFERENCES public.opcion_seccion_mmse(id_opcion, id_seccion) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4854 (class 2606 OID 66629)
-- Name: evaluacion_mmse_seccion fk_eval_mmse_seccion_seccion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_seccion
    ADD CONSTRAINT fk_eval_mmse_seccion_seccion FOREIGN KEY (id_seccion) REFERENCES public.seccion_mmse(id_seccion) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4839 (class 2606 OID 50117)
-- Name: evaluacion_cognitiva fk_evaluacion_asignacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_cognitiva
    ADD CONSTRAINT fk_evaluacion_asignacion FOREIGN KEY (id_asignacion) REFERENCES public.asignacion_prueba(id_asignacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4840 (class 2606 OID 42006)
-- Name: evaluacion_cognitiva fk_evaluacion_neuropsicologo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_cognitiva
    ADD CONSTRAINT fk_evaluacion_neuropsicologo FOREIGN KEY (id_neuropsicologo) REFERENCES public.neuropsicologo(id_neuropsicologo);


--
-- TOC entry 4851 (class 2606 OID 66504)
-- Name: item_mmse fk_item_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_mmse
    ADD CONSTRAINT fk_item_opcion FOREIGN KEY (id_opcion) REFERENCES public.opcion_seccion_mmse(id_opcion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4838 (class 2606 OID 41947)
-- Name: neuropsicologo fk_neuropsico_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neuropsicologo
    ADD CONSTRAINT fk_neuropsico_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- TOC entry 4850 (class 2606 OID 66482)
-- Name: opcion_seccion_mmse fk_opcion_seccion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opcion_seccion_mmse
    ADD CONSTRAINT fk_opcion_seccion FOREIGN KEY (id_seccion) REFERENCES public.seccion_mmse(id_seccion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4855 (class 2606 OID 66656)
-- Name: evaluacion_mmse_respuesta_item fk_resp_eval_seccion_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_respuesta_item
    ADD CONSTRAINT fk_resp_eval_seccion_opcion FOREIGN KEY (id_eval_seccion, id_opcion) REFERENCES public.evaluacion_mmse_seccion(id_eval_seccion, id_opcion_aplicada) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4856 (class 2606 OID 66661)
-- Name: evaluacion_mmse_respuesta_item fk_resp_item_opcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluacion_mmse_respuesta_item
    ADD CONSTRAINT fk_resp_item_opcion FOREIGN KEY (id_item, id_opcion) REFERENCES public.item_mmse(id_item, id_opcion) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4847 (class 2606 OID 58281)
-- Name: resultado_categoria fk_resultado_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultado_categoria
    ADD CONSTRAINT fk_resultado_categoria FOREIGN KEY (id_categoria) REFERENCES public.categoria_mmse(id_categoria) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4848 (class 2606 OID 58276)
-- Name: resultado_categoria fk_resultado_evaluacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resultado_categoria
    ADD CONSTRAINT fk_resultado_evaluacion FOREIGN KEY (id_evaluacion) REFERENCES public.evaluacion_cognitiva(id_evaluacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4849 (class 2606 OID 66462)
-- Name: seccion_mmse fk_seccion_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seccion_mmse
    ADD CONSTRAINT fk_seccion_categoria FOREIGN KEY (id_categoria) REFERENCES public.categoria_mmse(id_categoria) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4835 (class 2606 OID 33689)
-- Name: usuario fk_usu_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT fk_usu_rol FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol);


--
-- TOC entry 4841 (class 2606 OID 42037)
-- Name: analisis_visual fk_visual_evaluacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analisis_visual
    ADD CONSTRAINT fk_visual_evaluacion FOREIGN KEY (id_evaluacion) REFERENCES public.evaluacion_cognitiva(id_evaluacion) ON DELETE CASCADE;


--
-- TOC entry 4836 (class 2606 OID 41954)
-- Name: paciente paciente_escolaridad_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente
    ADD CONSTRAINT paciente_escolaridad_fk FOREIGN KEY (id_escolaridad) REFERENCES public.nivel_escolaridad(id_escolaridad);


--
-- TOC entry 4837 (class 2606 OID 41959)
-- Name: paciente paciente_neuropsicologo_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente
    ADD CONSTRAINT paciente_neuropsicologo_fk FOREIGN KEY (id_neuropsicologo) REFERENCES public.neuropsicologo(id_neuropsicologo) ON DELETE CASCADE;


-- Completed on 2026-05-12 23:02:29

--
-- PostgreSQL database dump complete
--

