-- ***************************************************************
-- Contexto: Fichas Trabajos de Grado
-- Base de datos: fichas_perfil
-- Ejecutar conectado a la base de datos: fichas_perfil
-- ***************************************************************

-- 1. TABLAS DE REFERENCIA
-- ***************************************************************

CREATE TABLE estado_evaluacion (
    id UUID PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    CONSTRAINT uk_estado_evaluacion_nombre UNIQUE (nombre)
);

CREATE TABLE estado_ficha (
    id UUID PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    CONSTRAINT uk_estado_ficha_nombre UNIQUE (nombre)
);

CREATE TABLE estado_observacion_revision (
    id UUID PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    CONSTRAINT uk_estado_obs_rev_nombre UNIQUE (nombre)
);

CREATE TABLE estado_revision (
    id UUID PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    CONSTRAINT uk_estado_revision_nombre UNIQUE (nombre)
);

CREATE TABLE tipo_item (
    id UUID PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    CONSTRAINT uk_tipo_item_nombre UNIQUE (nombre)
);

-- 2. ROLES (IDENTIDAD POR APLICACIÓN)
-- ***************************************************************

CREATE TABLE estudiante (
    id UUID PRIMARY KEY,
    identificador VARCHAR(30) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL
);

CREATE TABLE asesor_ficha (
    id UUID PRIMARY KEY,
    identificador VARCHAR(30) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL
);

CREATE TABLE representante_comite_curriculum (
    id UUID PRIMARY KEY,
    identificador VARCHAR(30) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL
);

-- 3. ENTIDADES DE NEGOCIO
-- ***************************************************************

CREATE TABLE ficha_perfil (
    id UUID PRIMARY KEY,
    titulo_proyecto VARCHAR(100) NOT NULL,
    asesor_ficha_id UUID NOT NULL,
    CONSTRAINT uk_ficha_titulo UNIQUE (titulo_proyecto),
    CONSTRAINT fk_ficha_asesor FOREIGN KEY (asesor_ficha_id) REFERENCES asesor_ficha(id)
);

CREATE TABLE estudiante_ficha_perfil (
    id UUID PRIMARY KEY,
    ficha_perfil_id UUID NOT NULL,
    estudiante_id UUID NOT NULL,
    CONSTRAINT fk_efp_ficha FOREIGN KEY (ficha_perfil_id) REFERENCES ficha_perfil(id) ON DELETE CASCADE,
    CONSTRAINT fk_efp_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante(id),
    CONSTRAINT uk_estudiante_ficha UNIQUE (ficha_perfil_id, estudiante_id)
);

CREATE TABLE estado_ficha_perfil (
    id UUID PRIMARY KEY,
    ficha_perfil_id UUID NOT NULL,
    estado_ficha_id UUID NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_efp_traz_ficha FOREIGN KEY (ficha_perfil_id) REFERENCES ficha_perfil(id) ON DELETE CASCADE,
    CONSTRAINT fk_efp_traz_estado FOREIGN KEY (estado_ficha_id) REFERENCES estado_ficha(id)
    -- TODO: revisar la combinación única en el modelo de dominio enriquecido, pues considero no es replicable en el MER, para este caso se considera irrelevante.
    -- CONSTRAINT uk_trazabilidad_ficha_estado UNIQUE (ficha_perfil_id, estado_ficha_id, fecha_actualizacion)
);

CREATE TABLE item (
    id UUID PRIMARY KEY,
    tipo_item_id UUID NOT NULL,
    contenido VARCHAR(200) NOT NULL,
    ficha_perfil_id UUID NOT NULL,
    CONSTRAINT fk_item_tipo FOREIGN KEY (tipo_item_id) REFERENCES tipo_item(id),
    CONSTRAINT fk_item_ficha FOREIGN KEY (ficha_perfil_id) REFERENCES ficha_perfil(id) ON DELETE CASCADE
    -- TODO: revisar la combinación única en el modelo de dominio enriquecido, pues considero no es replicable en el MER, para este caso se considera irrelevante.
    -- CONSTRAINT uk_item_ficha_contenido UNIQUE (tipo_item_id, contenido, ficha_perfil_id)
);

-- 4. REVISIONES Y EVALUACIONES
-- ***************************************************************

CREATE TABLE revision_item (
    id UUID PRIMARY KEY,
    item_id UUID NOT NULL,
    estado_revision_id UUID NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_rev_item FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_estado FOREIGN KEY (estado_revision_id) REFERENCES estado_revision(id)
    -- TODO: revisar la combinación única en el modelo de dominio enriquecido, pues considero no es replicable en el MER, para este caso se considera irrelevante.
    -- CONSTRAINT uk_revision_item_fecha UNIQUE (item_id, fecha_creacion)
);

CREATE TABLE observacion_item (
    id UUID PRIMARY KEY,
    revision_item_id UUID NOT NULL,
    observacion VARCHAR(200) NOT NULL,
    estado_observacion_revision_id UUID NOT NULL,
    CONSTRAINT fk_obs_item_rev FOREIGN KEY (revision_item_id) REFERENCES revision_item(id) ON DELETE CASCADE,
    CONSTRAINT fk_obs_item_estado FOREIGN KEY (estado_observacion_revision_id) REFERENCES estado_observacion_revision(id)
    -- TODO: revisar la combinación única en el modelo de dominio enriquecido, pues considero no es replicable en el MER, para este caso se considera irrelevante.
    -- CONSTRAINT uk_obs_item_rev_msg UNIQUE (revision_item_id, observacion)
);

CREATE TABLE evaluacion_ficha_perfil (
    id UUID PRIMARY KEY,
    representante_comite_id UUID NOT NULL,
    ficha_perfil_id UUID NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_eval_rep FOREIGN KEY (representante_comite_id) REFERENCES representante_comite_curriculum(id),
    CONSTRAINT fk_eval_ficha FOREIGN KEY (ficha_perfil_id) REFERENCES ficha_perfil(id) ON DELETE CASCADE
    -- TODO: revisar la combinación única en el modelo de dominio enriquecido, pues considero no es replicable en el MER, para este caso se considera irrelevante.
    -- CONSTRAINT uk_eval_rep_ficha_fecha UNIQUE (representante_comite_id, ficha_perfil_id, fecha_creacion)
);

CREATE TABLE estado_evaluacion_ficha (
    id UUID PRIMARY KEY,
    evaluacion_ficha_perfil_id UUID NOT NULL,
    estado_evaluacion_id UUID NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_eef_evaluacion FOREIGN KEY (evaluacion_ficha_perfil_id) REFERENCES evaluacion_ficha_perfil(id) ON DELETE CASCADE,
    CONSTRAINT fk_eef_estado FOREIGN KEY (estado_evaluacion_id) REFERENCES estado_evaluacion(id)
    -- TODO: revisar la combinación única en el modelo de dominio enriquecido, pues considero no es replicable en el MER, para este caso se considera irrelevante.
    -- CONSTRAINT uk_eef_trazabilidad UNIQUE (evaluacion_ficha_perfil_id, estado_evaluacion_id, fecha_actualizacion)
);

CREATE TABLE observacion_evaluacion (
    id UUID PRIMARY KEY,
    evaluacion_ficha_perfil_id UUID NOT NULL,
    observacion VARCHAR(200) NOT NULL,
    CONSTRAINT fk_obs_eval_base FOREIGN KEY (evaluacion_ficha_perfil_id) REFERENCES evaluacion_ficha_perfil(id) ON DELETE CASCADE
    -- TODO: revisar la combinación única en el modelo de dominio enriquecido, pues considero no es replicable en el MER, para este caso se considera irrelevante.
    -- CONSTRAINT uk_obs_eval_msg UNIQUE (evaluacion_ficha_perfil_id, observacion)
);

-- ÍNDICES
CREATE INDEX idx_ficha_perfil_asesor ON ficha_perfil(asesor_ficha_id);
CREATE INDEX idx_item_ficha_ref ON item(ficha_perfil_id);