# Modelo de Dominio Enriquecido: Fichas Trabajos de Grado

## Descripción General

Este documento describe el modelo de dominio enriquecido del contexto **Fichas Trabajos de Grado** del sistema Arquisoft. El modelo enriquecido incluye reglas de negocio, validaciones, tipos de datos específicos y restricciones para cada atributo de los objetos de dominio.

## Referencia al Modelo Anémico

📄 **Modelo Anémico:** [06_delimitar_contextos_fichas_trabajos_de_grado.md](../../../anemico/documentacion/06_delimitar_contextos_fichas_trabajos_de_grado.md)

---

## Índice de Objetos de Dominio

| # | Objeto de Dominio | Descripción |
|---|-------------------|-------------|
| 1 | [AsesorFicha](#1-asesorficha) | Corresponde a cada uno de los asesores que pueden ser asignados a una ficha de perfil de un proyecto de grado |
| 2 | [Estado Evaluacion](#2-estadoevaluacion) | Corresponde a los estados de una evaluación de ficha perfil |
| 3 | [Estado Ficha](#3-estadoficha) | Corresponde a los estado que tiene un estado ficha de perfil |
| 4 | [Estado Ficha Pérfil](#4-estadofichaperfil) | Corresponde a la trazabilidad de los cambios de estados por los que pasa una ficha de perfil |
| 5 | [Estado Observacion Revision](#5-estadoobservacionrevision) | Corresponde a cada uno de las categorías a las que puede pertenecer una observación. |
| 6 | [Estado Revision](#6-estadorevision) | Corresponde a cada uno de los estados que puede tener la revisión de un item |
| 7 | [Estudiante](#7-estudiante) | Corresponde a cada uno de los estudiantes que diligencia una ficha de perfil |
| 8 | [Estudiante Ficha Perfil](#8-estudiantefichaperfil) | Corresponde a los estudiantes que conformarán un equipo para generar la ficha perfil |
| 9 | [Evaluación Ficha Perfil](#9-evaluacionfichaperfil) | Corresponde a las evaluaciones generadas por un representante comite curriculum, el cual contiene toda la información y calificación de una ficha de pérfil. |
| 10 | [Estado Evaluacion Ficha](#10-estadoevaluacionficha) | Corresponde a la trazabilidad de los cambios de estados por los que pasa una evaluación de ficha |
| 11 | [Ficha Perfil](#11-fichaperfil) | Corresponde a la información generada por el estudiante de un proyecto de grado con sus correspondientes objetivos para desarrollar un futuro proyecto de grado. |
| 12 | [Item](#12-item) | Corresponde a las relaciones que se encuentran los objetos de tipo item y contenido, en este podemos encontrar partes iteradas de información de una ficha de perfil. |
| 13 | [Observacion Evaluacion](#13-observacionevaluacion) | Corresponde a la observaciones que se le asigna a las evaluaciones de una ficha de perfil, esta contendra información que se debe considerar |
| 14 | [Observacion Item](#14-observacionitem) | Corresponde a la observación que se genera en un item evaluado por parte de un asesor de ficha de pérfil |
| 15 | [RepresentanteComiteCurriculum](#15-representantecomitecurriculum) | Corresponde a cada uno de los representantes del comité de currículum que pueden evaluar una ficha de perfil |
| 16 | [Revision Item](#16-revisionitem) | Corresponde a cada una de las revisiones que hace un asesor a un item de la ficha de perfil |
| 17 | [Tipo Item](#17-tipoitem) | Corresponde al tipo de item asociado a un item, el cual evalua por parte del asesor ficha la ficha de perfil |

---

## 1. AsesorFicha

### Descripción

Corresponde a cada uno de los asesores que pueden ser asignados a una ficha de perfil de un proyecto de grado

### Atributos

- `Id`
- `Identificador`
- `Nombre`
- `Email`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los asesores ficha existentes. Este identificador corresponde al identificador del usuario que está representando un asesor ficha

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Identificador`

> Corresponde al identificador de un usuario existente.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 4 |
| **Longitud máxima** | 30 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Nombre`

> Corresponde al nombre de cada uno de los usuarios existentes.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 2 |
| **Longitud máxima** | 50 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Email`

> Corresponde al email de cada uno de los usuarios existentes.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 6 |
| **Longitud máxima** | 50 |
| **Formato** | Debe cumplir el estándar de correos electrónicos, ejemplo: usuario@dominio.com |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

---

## 2. Estado Evaluacion

### Descripción

Corresponde a los estados de una evaluación de ficha perfil

### Atributos

- `Id`
- `Nombre`
- `Descripción`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Estado Evaluacion existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Nombre`

> Corresponde al nombre del estado evaluacion, para especificar de manera clara los estados en los que se puede encontrar un estado evaluacion.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 20 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Descripción`

> Corresponde a la descripción del estado evaluacion, el cual hace una breve explicación de las caracteristicas del estado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Nombre de estado evaluacion único

**Descripción:** Combinación única que indica que el nombre del estado evaluacion nunca se va a repetir.

**Atributos involucrados:** `Nombre`

---

## 3. Estado Ficha

### Descripción

Corresponde a los estado que tiene un estado ficha de perfil

### Atributos

- `Id`
- `Nombre`
- `Descripción`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Estado ficha existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Nombre`

> Corresponde al nombre del estado ficha, para especificar de manera clara los estado en los que se puede encontrar un estado ficha.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 20 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Descripción`

> Corresponde a la descripción del estado ficha, el cual hace una breve explicación de las caracteristicas del estado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Nombre de estado ficha único

**Descripción:** Combinación única que indica que el nombre del estado ficha nunca se va a repetir.

**Atributos involucrados:** `Nombre`

---

## 4. Estado Ficha Pérfil

### Descripción

Corresponde a la trazabilidad de los cambios de estados por los que pasa una ficha de perfil

### Atributos

- `Id`
- `FichaPerfil`
- `EstadoFicha`
- `FechaActualización`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Estado Ficha Perfil existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `FichaPerfil`

> Corresponde a la información generada por el estudiante de un proyecto de grado con sus correspondientes objetivos para desarrollar un futuro proyecto de grado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | FichaPerfil |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `EstadoFicha`

> Corresponde a los estado que tiene un estado ficha de perfil

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | EstadoFicha |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `FechaActualización`

> Corresponde a la fecha y hora en la cual se actualizó un estado de una ficha de pérfil.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Fecha/Tiempo |
| **Valor por defecto** | Fecha y hora actual del sistema |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Estado Ficha Perfil por ficha pérfil, estado ficha y fecha actualización único

**Descripción:** Combinación única que indica que la combinación del FichaPerfil, el EstadoFicha y la FechaActualización no debe aparecer más de una vez en una Estado Ficha Perfil.

**Atributos involucrados:** `FichaPerfil`, `EstadoFicha`, `FechaActualización`

---

## 5. Estado Observacion Revision

### Descripción

Corresponde a cada uno de las categorías a las que puede pertenecer una observación.

### Atributos

- `Id`
- `Nombre`
- `Descripción`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Estado Observación Revisión existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Nombre`

> Corresponde al nombre del Estado Observación Revisión, para especificar de manera clara los estado en los que se puede encontrar un Estado Observación Revisión.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 20 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Descripción`

> Corresponde a la descripción del Estado Observación Revisión, el cual hace una breve explicación de las caracteristicas del estado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Nombre de Estado observación Revisión único

**Descripción:** Combinación única que indica que el nombre del estado ficha nunca se va a repetir.

**Atributos involucrados:** `Nombre`

---

## 6. Estado Revision

### Descripción

Corresponde a cada uno de los estados que puede tener la revisión de un item

### Atributos

- `Id`
- `Nombre`
- `Descripción`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Estado Revision existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Nombre`

> Corresponde al nombre del Estado Revision, para especificar de manera clara los estado en los que se puede encontrar un Estado Revision.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 20 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Descripción`

> Corresponde a la descripción del Estado Revision, el cual hace una breve explicación de las caracteristicas del estado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Nombre de Estado Revision único

**Descripción:** Combinación única que indica que el nombre del Estado Revision nunca se va a repetir.

**Atributos involucrados:** `Nombre`

---

## 7. Estudiante

### Descripción

Corresponde a cada uno de los estudiantes que diligencia una ficha de perfil

### Atributos

- `Id`
- `Identificador`
- `Nombre`
- `Email`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los estudiantes existentes. Este identificador corresponde al identificador del usuario que está representando un estudiante

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Identificador`

> Corresponde al identificador de un usuario existente.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 4 |
| **Longitud máxima** | 30 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Nombre`

> Corresponde al nombre de cada uno de los usuarios existentes.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 2 |
| **Longitud máxima** | 50 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Email`

> Corresponde al email de cada uno de los usuarios existentes.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 6 |
| **Longitud máxima** | 50 |
| **Formato** | Debe cumplir el estándar de correos electrónicos, ejemplo: usuario@dominio.com |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

---

## 8. Estudiante Ficha Perfil

### Descripción

Corresponde a los estudiantes que conformarán un equipo para generar la ficha perfil

### Atributos

- `Id`
- `FichaPerfil`
- `Estudiante`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Estudiante Ficha existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `FichaPerfil`

> Corresponde a la información generada por el estudiante de un proyecto de grado con sus correspondientes objetivos para desarrollar un futuro proyecto de grado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | FichaPerfil |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `Estudiante`

> Corresponde a cada uno de los estudiantes que diligencia una ficha de perfil

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Estudiante |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

### Combinaciones Únicas (Restricciones)

#### Nombre de Estado Ficha único

**Descripción:** Combinación única que indica que el nombre del Estado Ficha nunca se va a repetir.

**Atributos involucrados:** `FichaPerfil`, `Estudiante`

---

## 9. Evaluación Ficha Perfil

### Descripción

Corresponde a las evaluaciones generadas por un representante comite curriculum, el cual contiene toda la información y calificación de una ficha de pérfil.

### Atributos

- `Id`
- `RepresentanteComiteCurriculum`
- `FichaPerfil`
- `FechaCreacion`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Evaluación Ficha Pérfil existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `RepresentanteComiteCurriculum`

> Corresponde a cada uno de los representantes del comité de currículum que pueden evaluar una ficha de perfil

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | RepresentanteComiteCurriculum |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `FichaPerfil`

> Corresponde a la información generada por el estudiante de un proyecto de grado con sus correspondientes objetivos para desarrollar un futuro proyecto de grado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | FichaPerfil |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `FechaCreacion`

> Corresponde al valor de la fecha y hora en la que se genero la evaluación de parte del representante comite curriculum

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Fecha/Tiempo |
| **Valor por defecto** | Fecha y hora actual del sistema |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

### Combinaciones Únicas (Restricciones)

#### Evaluacion Ficha Perfil por Representante Comite Curricullum, Ficha Perfil y Fecha Creación único

**Descripción:** Combinación única que indica que la combinación del Representante Comite Curricullum, la Ficha Perfil y la Fecha Creacion no debe aparecer más de una vez en una Evaluacion Ficha Perfil.

**Atributos involucrados:** `RepresentanteComiteCurriculum`, `FichaPerfil`, `FechaCreacion`

---

## 10. Estado Evaluacion Ficha

### Descripción

Corresponde a la trazabilidad de los cambios de estados por los que pasa una evaluación de ficha

### Atributos

- `Id`
- `EvaluaciónFichaPerfil`
- `EstadoEvaluacion`
- `FechaActualización`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Estado Evaluación Ficha Pérfil existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `EvaluaciónFichaPerfil`

> Corresponde a cada uno de los representantes del comité de currículum que pueden evaluar una ficha de perfil

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | EvaluacionFichaPerfil |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `EstadoEvaluacion`

> Corresponde a un valor decimal, el cual hace referencia a la calificación que tiene una ficha de perfil, desde la perspectiva de un representante comite curriculum

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | EstadoEvaluacion |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `FechaActualización`

> Corresponde al valor de la fecha y hora en la que se genero la evaluación de parte del representante comite curriculum

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Fecha/Tiempo |
| **Valor por defecto** | Fecha y hora actual del sistema |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Estado Evaluación Ficha Pérfil por Evaluación Ficha Pérfil, Estado Evaluación y Fecha Actualización único

**Descripción:** Combinación única que indica que la combinación de la Evaluación Ficha Pérfil, el Estado Evaluación y la Fecha Actualización no debe aparecer más de una vez en una Estado Evaluación Ficha Pérfil.

**Atributos involucrados:** `EvaluaciónFichaPerfil`, `EstadoEvaluacion`, `FechaActualización`

---

## 11. Ficha Perfil

### Descripción

Corresponde a la información generada por el estudiante de un proyecto de grado con sus correspondientes objetivos para desarrollar un futuro proyecto de grado.

### Atributos

- `Id`
- `Titulo Proyecto`
- `AsesorFicha`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Ficha Pérfil existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Titulo Proyecto`

> Corresponde al nombre que tendrá el proyecto y además el nombre que tendrá dentro de la ficha de pérfil antes de pasar al desarrollo.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 100 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `AsesorFicha`

> Corresponde a cada uno de los asesores que pueden ser asignados a una ficha de perfil de un proyecto de grado

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | AsesorFicha |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

### Combinaciones Únicas (Restricciones)

#### Nombre de Ficha Pérfil único

**Descripción:** Combinación única que indica que el Titulo Proyecto nunca se va a repetir.

**Atributos involucrados:** `Titulo Proyecto`

---

## 12. Item

### Descripción

Corresponde a las relaciones que se encuentran los objetos de tipo item y contenido, en este podemos encontrar partes iteradas de información de una ficha de perfil.

### Atributos

- `Id`
- `TipoItem`
- `Contenido`
- `FichaPerfil`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los item existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `TipoItem`

> Corresponde al tipo de item asociado a un item, el cual evalua por parte del asesor ficha la ficha de perfil

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | TipoItem |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `Contenido`

> Corresponde a la información del item, como lo es el caso de un objetivo general, este atributo contenido contiene la información del objetivo general, dado el caso anterior.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | SI |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `FichaPerfil`

> Corresponde a la información generada por el estudiante de un proyecto de grado con sus correspondientes objetivos para desarrollar un futuro proyecto de grado.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | FichaPerfil |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

### Combinaciones Únicas (Restricciones)

#### Item por Ficha Pérfil, Tipo Item, Contenido único

**Descripción:** Combinación única que indica que la combinación del Tipo Item, el Contenido y la Ficha Pérfil no debe aparecer más de una vez en un Item.

**Atributos involucrados:** `TipoItem`, `Contenido`, `FichaPerfil`

---

## 13. Observacion Evaluacion

### Descripción

Corresponde a la observaciones que se le asigna a las evaluaciones de una ficha de perfil, esta contendra información que se debe considerar

### Atributos

- `Id`
- `EvaluaciónFichaPérfil`
- `Observación`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de la Observación Evaluación existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `EvaluaciónFichaPérfil`

> Corresponde a las evaluaciones generadas por un representante comite curriculum, el cual contiene toda la información y calificación de una ficha de pérfil.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | EvaluacionFichaPerfil |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `Observación`

> Corresponde a la observación cualitativa de la Observación Evaluación.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Observación Evaluación por Evaluación Ficha Pérfil, Observación único

**Descripción:** Combinación única que indica que la combinación de Evaluación Ficha Pérfil y Observación no debe aparecer más de una vez en una Observación Evaluación.

**Atributos involucrados:** `EvaluaciónFichaPérfil`, `Observación`

---

## 14. Observacion Item

### Descripción

Corresponde a la observación que se genera en un item evaluado por parte de un asesor de ficha de pérfil

### Atributos

- `Id`
- `RevisionItem`
- `Observación`
- `EstadoObservaciónRevisión`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de la Observación Item existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `RevisionItem`

> Corresponde a cada una de las revisiones que hace un asesor a un item de la ficha de perfil

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | RevisionItem |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `Observación`

> Corresponde al mensaje que genera el asesor ficha, que contiene información con respecto al item que se debe evaluar.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `EstadoObservaciónRevisión`

> Corresponde a cada uno de las categorías a las que puede pertenecer una observación.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | EstadoObservacionRevision |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

### Combinaciones Únicas (Restricciones)

#### Observación Item por Evaluación Revision Item, Observación único

**Descripción:** Combinación única que indica que la combinación de Revision Item y Observación no debe aparecer más de una vez en una Observación Item.

**Atributos involucrados:** `RevisionItem`, `Observación`

---

## 15. RepresentanteComiteCurriculum

### Descripción

Corresponde a cada uno de los representantes del comité de currículum que pueden evaluar una ficha de perfil

### Atributos

- `Id`
- `Identificador`
- `Nombre`
- `Email`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los representante comite curriculum existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Identificador`

> Corresponde a cada uno de los usuarios que participan en algún proceso perteneciente al proyecto de grado y/o plataforma arquisoft

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 4 |
| **Longitud máxima** | 30 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Nombre`

> Corresponde al nombre de cada uno de los usuarios existentes.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 2 |
| **Longitud máxima** | 50 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Email`

> Corresponde al correo electronico de cada uno de los usuarios existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 6 |
| **Longitud máxima** | 50 |
| **Formato** | Debe cumplir el estándar de correos electrónicos, ejemplo: usuario@dominio.com |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

---

## 16. Revision Item

### Descripción

Corresponde a cada una de las revisiones que hace un asesor a un item de la ficha de perfil

### Atributos

- `Id`
- `Item`
- `EstadoRevision`
- `FechaCreacion`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de las Revisión Item existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Item`

> Corresponde a las relaciones que se encuentran los objetos de tipo item y contenido, en este podemos encontrar partes iteradas de información de una ficha de perfil.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Item |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `EstadoRevision`

> Corresponde a cada uno de los estados que puede tener la revisión de un item

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | EstadoRevision |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |

#### Atributo: `FechaCreacion`

> Corresponde a la fecha y hora en la que se genero una revision item.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Fecha/Tiempo |
| **Valor por defecto** | Fecha y hora actual del sistema |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Revision Item por Item, FechaCreación único

**Descripción:** Combinación única que indica que la combinación de Usuario no debe aparecer más de una vez en un Representante Comite Curriculum.

**Atributos involucrados:** `Item`, `FechaCreacion`

---

## 17. Tipo Item

### Descripción

Corresponde al tipo de item asociado a un item, el cual evalua por parte del asesor ficha la ficha de perfil

### Atributos

- `Id`
- `Nombre`
- `Descripción`

### Especificación de Atributos

#### Atributo: `Id`

> Corresponde al identificador único de cada uno de los Tipo Item existentes

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Identificador único universal |
| **¿Autogenerado?** | SI |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | SI |

#### Atributo: `Nombre`

> Corresponde al nombre del Tipo Item, para especificar de manera clara los tipo en los que se puede encontrar un estado Tipo Item.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Alfanumérico |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 20 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

#### Atributo: `Descripción`

> Corresponde a la descripción del Tipo Item, el cual hace una breve explicación de las caracteristicas del Tipo.

| Característica | Valor |
|----------------|-------|
| **Tipo de dato** | Texto |
| **Longitud mínima** | 1 |
| **Longitud máxima** | 200 |
| **¿Autogenerado?** | NO |
| **¿Calculado?** | NO |
| **¿Obligatorio?** | SI |
| **¿Modificable?** | NO |
| **¿Sensible?** | NO |
| **¿Identifica al registro?** | NO |
| **Limpiar espacios** | Inicio: SI / Fin: SI |

### Combinaciones Únicas (Restricciones)

#### Nombre Tipo Item único

**Descripción:** Combinación única que indica que el nombre del Tipo Item nunca se va a repetir.

**Atributos involucrados:** `Nombre`

---


## Referencias

- **Archivo Excel origen:** `Ficha Perfil - Modelo Enriquecido.xlsx`
- **Modelo de dominio anémico:** [06_delimitar_contextos_fichas_trabajos_de_grado.md](../../../anemico/documentacion/06_delimitar_contextos_fichas_trabajos_de_grado.md)
- **Contexto:** Fichas Trabajos de Grado

---

*Documento generado a partir del modelo de dominio enriquecido en formato Excel.*
