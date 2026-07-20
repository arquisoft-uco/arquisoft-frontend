# Ficha Perfil - Event Storming

## Índice
- [AsesorFicha](#asesorficha)
- [Estado Evaluacion](#estado-evaluacion)
- [Estado Ficha](#estado-ficha)
- [Estado Ficha Pérfil](#estado-ficha-perfil)
- [Estado Observacion Revision](#estado-observacion-revision)
- [Estado Revision](#estado-revision)
- [Estudiante](#estudiante)
- [Estudiante Ficha Perfil](#estudiante-ficha-perfil)
- [Evaluación Ficha Perfil](#evaluacion-ficha-perfil)
- [Estado Evaluacion Ficha](#estado-evaluacion-ficha)
- [Ficha Perfil](#ficha-perfil)
- [Item](#item)
- [Observacion Evaluacion](#observacion-evaluacion)
- [Observacion Item](#observacion-item)
- [RepresentanteComiteCurriculum](#representantecomitecurriculum)
- [Revision Item](#revision-item)
- [Tipo Item](#tipo-item)

---

<a id="asesorficha"></a>
## AsesorFicha

Objeto de dominio: AsesorFicha

### Acciones
- [Consultar información de un asesor ficha](#asesorficha-accion-consultar-informacion-de-un-asesor-ficha)

<a id="asesorficha-accion-consultar-informacion-de-un-asesor-ficha"></a>
#### Consultar información de un asesor ficha

- Actores:
  - Asesor Ficha
  - RepresentanteComiteCurricullum
  - Estudiante

- Descripción:
  - Permite aplicar criterios de busqueda para consultar la información de un Asesor Ficha

- Información externa / Read model:
  - No se encontraron read models o información externa.

- Políticas:
  - AsesorFicha-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Asesor Ficha Consultado](#asesorficha-evento-asesor-ficha-consultado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Asesor Ficha Consultado](#asesorficha-evento-asesor-ficha-consultado)

<a id="asesorficha-evento-asesor-ficha-consultado"></a>
#### Asesor Ficha Consultado

- Producido por:
  - [Consultar información de un asesor ficha](#asesorficha-accion-consultar-informacion-de-un-asesor-ficha)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="estado-evaluacion"></a>
## Estado Evaluacion

Objeto de dominio: Estado Evaluacion

### Acciones
- No se encontraron acciones.

### Eventos
- No se encontraron eventos.

---

<a id="estado-ficha"></a>
## Estado Ficha

Objeto de dominio: Estado Ficha

### Acciones
- [Consultar todos los estados ficha](#estado-ficha-accion-consultar-todos-los-estados-ficha)

<a id="estado-ficha-accion-consultar-todos-los-estados-ficha"></a>
#### Consultar todos los estados ficha

- Actores:
  - Estudiante
  - RepresentanteComiteCurriculum
  - Asesor Ficha

- Descripción:
  - Permite conocer los estados ficha que pueden ser asignados a un estado ficha perfil.

- Información externa / Read model:
  - No se encontraron read models o información externa.

- Políticas:
  - No se encontraron políticas.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Todos los estados ficha consultados](#estado-ficha-evento-todos-los-estados-ficha-consultados)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Todos los estados ficha consultados](#estado-ficha-evento-todos-los-estados-ficha-consultados)

<a id="estado-ficha-evento-todos-los-estados-ficha-consultados"></a>
#### Todos los estados ficha consultados

- Producido por:
  - [Consultar todos los estados ficha](#estado-ficha-accion-consultar-todos-los-estados-ficha)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="estado-ficha-perfil"></a>
## Estado Ficha Pérfil

Objeto de dominio: Estado Ficha Pérfil

### Acciones
- [Agregar Estado Ficha Perfil](#estado-ficha-perfil-accion-agregar-estado-ficha-perfil)
- [Agregar Estado Ficha Perfil de aprobación](#estado-ficha-perfil-accion-agregar-estado-ficha-perfil-de-aprobacion)
- [Consultar información de un Estado Ficha Perfil](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil)
- [Consultar informacion de un Estado Ficha Perfil el cual evalua](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil-el-cual-evalua)
- [Consultar informacion de los Estado Ficha Perfil los cuales asesora](#estado-ficha-perfil-accion-consultar-informacion-de-los-estado-ficha-perfil-los-cuales-asesora)

<a id="estado-ficha-perfil-accion-agregar-estado-ficha-perfil"></a>
#### Agregar Estado Ficha Perfil

- Actores:
  - Estudiante
  - Asesor Ficha

- Descripción:
  - Permite que los nuevos Estado Ficha Perfil sean visibles para los usuarios y que se pueda contener la información relevante para una ficha pérfil

- Información externa / Read model:
  - Información Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estado Ficha Perfil
  - Información Estado Ficha: Corresponde al Estado Ficha que se le va a asignar al Estado Ficha Perfil

- Políticas:
  - EstadoFichaPerfil-POL-01: Asegurar que el estado ficha este "En Construccion" al generar el primer cambio
  - EstadoFichaPerfil-POL-02: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - EstadoFichaPerfil-POL-04: Una Ficha Perfil no puede tener el mismo Estado Ficha Perfil asignado más de una vez.
  - EstadoFichaPerfil-POL-05: Solo los representantes del comité de currículum pueden asignar los estados "Aprobada", "Aprobada con observaciones" y "No aprobada".
  - EstadoFichaPerfil-POL-06: Una vez que el estado de la ficha es "Aprobada" o "No Aprobada", no se puede cambiar a ningún otro estado.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Nuevo Estado Ficha Perfil Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-agregado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Consultar información de un Estado Ficha Perfil](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil)
  - [Agregar Estado Ficha Perfil de aprobación](#estado-ficha-perfil-accion-agregar-estado-ficha-perfil-de-aprobacion)
  - [Consultar informacion de un Estado Ficha Perfil el cual evalua](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil-el-cual-evalua)
  - [Consultar informacion de los Estado Ficha Perfil los cuales asesora](#estado-ficha-perfil-accion-consultar-informacion-de-los-estado-ficha-perfil-los-cuales-asesora)

<a id="estado-ficha-perfil-accion-agregar-estado-ficha-perfil-de-aprobacion"></a>
#### Agregar Estado Ficha Perfil de aprobación

- Actores:
  - RepresentanteComiteCurriculum

- Descripción:
  - Permite que los nuevos cambios en la Ficha Perfil se vean reflejados en Estado Ficha Perfil y que se pueda contener la información relevante para una ficha pérfil.

- Información externa / Read model:
  - Información Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estado Ficha Perfil
  - Información Estado Ficha: Corresponde al Estado Ficha que se le va a asignar al Estado Ficha Perfil

- Políticas:
  - EstadoFichaPerfil-POL-02: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - EstadoFichaPerfil-POL-04: Una ficha de perfil no puede tener el mismo estado asignado más de una vez.
  - EstadoFichaPerfil-POL-06: Una vez que el estado de la ficha es "Aprobada" o "No Aprobada", no se puede cambiar a ningún otro estado.
  - EstadoFichaPerfil-POL-07: Asegurar que el estado ficha este "Disponible Para Evaluación" al iniciar un Estado Ficha Perfil de aprobación
  - EstadoFichaPerfil-POL-08: Solo los estudiantes y los asesores de ficha pueden asignar los estados "En construccion" y "Disponible para revisar".

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Nuevo Estado Ficha Perfil con aprobacion Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-con-aprobacion-agregado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Nuevo Estado Ficha Perfil Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-agregado)

- Comandos posteriores:
  - [Consultar información de un Estado Ficha Perfil](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil)
  - [Agregar Estado Ficha Perfil](#estado-ficha-perfil-accion-agregar-estado-ficha-perfil)
  - [Consultar informacion de un Estado Ficha Perfil el cual evalua](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil-el-cual-evalua)
  - [Consultar informacion de los Estado Ficha Perfil los cuales asesora](#estado-ficha-perfil-accion-consultar-informacion-de-los-estado-ficha-perfil-los-cuales-asesora)

<a id="estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil"></a>
#### Consultar información de un Estado Ficha Perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite aplicar criterios de busqueda para consultar información de un Estado Ficha Perfil el cual pertenece a la Ficha Perfil la cual esta desarrollando el estudiante

- Información externa / Read model:
  - Información Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estado Ficha Perfil
  - Información Estado Ficha: Corresponde al Estado Ficha que se le va a asignar al Estado Ficha Perfil

- Políticas:
  - EstadoFichaPerfil-POL-02: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Estado Ficha Perfil Consultado](#estado-ficha-perfil-evento-estado-ficha-perfil-consultado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Nuevo Estado Ficha Perfil Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-agregado)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil-el-cual-evalua"></a>
#### Consultar informacion de un Estado Ficha Perfil el cual evalua

- Actores:
  - RepresentanteComiteCurriculum

- Descripción:
  - Permite aplicar criterios de busqueda para consultar información de un Estado Ficha Perfil el cual esta observando y evaluando.

- Información externa / Read model:
  - Información Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estado Ficha Perfil
  - Información Estado Ficha: Corresponde al Estado Ficha que se le va a asignar al Estado Ficha Perfil

- Políticas:
  - EstadoFichaPerfil-POL-02: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Estado Ficha Perfil a Evaluar consultado](#estado-ficha-perfil-evento-estado-ficha-perfil-a-evaluar-consultado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Nuevo Estado Ficha Perfil Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-agregado)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="estado-ficha-perfil-accion-consultar-informacion-de-los-estado-ficha-perfil-los-cuales-asesora"></a>
#### Consultar informacion de los Estado Ficha Perfil los cuales asesora

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite aplicar criterios de busqueda para consultar información de los Estado Ficha Perfil de diferentes Fichas Perfil los cuales asesora el Asesor Ficha

- Información externa / Read model:
  - Información Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estado Ficha Perfil
  - Información Estado Ficha: Corresponde al Estado Ficha que se le va a asignar al Estado Ficha Perfil

- Políticas:
  - EstadoFichaPerfil-POL-02: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Estado Ficha Perfil que Asesora Consultado](#estado-ficha-perfil-evento-estado-ficha-perfil-que-asesora-consultado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Nuevo Estado Ficha Perfil Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-agregado)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Nuevo Estado Ficha Perfil Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-agregado)
- [Nuevo Estado Ficha Perfil con aprobacion Agregado](#estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-con-aprobacion-agregado)
- [Estado Ficha Perfil Consultado](#estado-ficha-perfil-evento-estado-ficha-perfil-consultado)
- [Estado Ficha Perfil a Evaluar consultado](#estado-ficha-perfil-evento-estado-ficha-perfil-a-evaluar-consultado)
- [Estado Ficha Perfil que Asesora Consultado](#estado-ficha-perfil-evento-estado-ficha-perfil-que-asesora-consultado)

<a id="estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-agregado"></a>
#### Nuevo Estado Ficha Perfil Agregado

- Producido por:
  - [Agregar Estado Ficha Perfil](#estado-ficha-perfil-accion-agregar-estado-ficha-perfil)

- Referenciado como previo en:
  - [Agregar Estado Ficha Perfil de aprobación](#estado-ficha-perfil-accion-agregar-estado-ficha-perfil-de-aprobacion)
  - [Consultar información de un Estado Ficha Perfil](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil)
  - [Consultar informacion de un Estado Ficha Perfil el cual evalua](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil-el-cual-evalua)
  - [Consultar informacion de los Estado Ficha Perfil los cuales asesora](#estado-ficha-perfil-accion-consultar-informacion-de-los-estado-ficha-perfil-los-cuales-asesora)

<a id="estado-ficha-perfil-evento-nuevo-estado-ficha-perfil-con-aprobacion-agregado"></a>
#### Nuevo Estado Ficha Perfil con aprobacion Agregado

- Producido por:
  - [Agregar Estado Ficha Perfil de aprobación](#estado-ficha-perfil-accion-agregar-estado-ficha-perfil-de-aprobacion)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="estado-ficha-perfil-evento-estado-ficha-perfil-consultado"></a>
#### Estado Ficha Perfil Consultado

- Producido por:
  - [Consultar información de un Estado Ficha Perfil](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="estado-ficha-perfil-evento-estado-ficha-perfil-a-evaluar-consultado"></a>
#### Estado Ficha Perfil a Evaluar consultado

- Producido por:
  - [Consultar informacion de un Estado Ficha Perfil el cual evalua](#estado-ficha-perfil-accion-consultar-informacion-de-un-estado-ficha-perfil-el-cual-evalua)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="estado-ficha-perfil-evento-estado-ficha-perfil-que-asesora-consultado"></a>
#### Estado Ficha Perfil que Asesora Consultado

- Producido por:
  - [Consultar informacion de los Estado Ficha Perfil los cuales asesora](#estado-ficha-perfil-accion-consultar-informacion-de-los-estado-ficha-perfil-los-cuales-asesora)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="estado-observacion-revision"></a>
## Estado Observacion Revision

Objeto de dominio: Estado Observacion Revision

### Acciones
- No se encontraron acciones.

### Eventos
- No se encontraron eventos.

---

<a id="estado-revision"></a>
## Estado Revision

Objeto de dominio: Estado Revision

### Acciones
- No se encontraron acciones.

### Eventos
- No se encontraron eventos.

---

<a id="estudiante"></a>
## Estudiante

Objeto de dominio: Estudiante

### Acciones
- [Consultar información de un estudiante](#estudiante-accion-consultar-informacion-de-un-estudiante)

<a id="estudiante-accion-consultar-informacion-de-un-estudiante"></a>
#### Consultar información de un estudiante

- Actores:
  - Asesor Ficha
  - RepresentanteComiteCurricullum
  - Estudiante

- Descripción:
  - Permite aplicar criteros de busqueda para consultar la información de un estudiante

- Información externa / Read model:
  - No se encontraron read models o información externa.

- Políticas:
  - Estudiante-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Estudiante consultado](#estudiante-evento-estudiante-consultado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Estudiante consultado](#estudiante-evento-estudiante-consultado)

<a id="estudiante-evento-estudiante-consultado"></a>
#### Estudiante consultado

- Producido por:
  - [Consultar información de un estudiante](#estudiante-accion-consultar-informacion-de-un-estudiante)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="estudiante-ficha-perfil"></a>
## Estudiante Ficha Perfil

Objeto de dominio: Estudiante Ficha Perfil

### Acciones
- [Asignar información de un estudiante en una ficha de perfil](#estudiante-ficha-perfil-accion-asignar-informacion-de-un-estudiante-en-una-ficha-de-perfil)
- [Remover información de un estudiante de una ficha perfil](#estudiante-ficha-perfil-accion-remover-informacion-de-un-estudiante-de-una-ficha-perfil)
- [Consultar información de los estudiantes vínculados a una ficha perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-estudiantes-vinculados-a-una-ficha-perfil)
- [Consultar información de los compañeros Estudiantes vinculados a la ficha de perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-companeros-estudiantes-vinculados-a-la-ficha-de-perfil)

<a id="estudiante-ficha-perfil-accion-asignar-informacion-de-un-estudiante-en-una-ficha-de-perfil"></a>
#### Asignar información de un estudiante en una ficha de perfil

- Actores:
  - Coordinador

- Descripción:
  - Permite vincular los estudiantes responsables de desarrollar una ficha de perfil

- Información externa / Read model:
  - Informacion Estudiante: Corresponde al Estudiante que se le va a asignar a la Ficha Perfil
  - Informacion Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al estudiante

- Políticas:
  - EstudianteFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - EstudianteFichaPerfil-POL-2: Asegurar que no exista multiples Estudiante Ficha Perfil con la misma ficha y el mismo estudiante
  - EstudianteFichaPerfil-POL-3: Asegurar que no se vinculen más de tres estudiantes a la misma Ficha Perfil

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Estudiante asignado a Ficha Perfil](#estudiante-ficha-perfil-evento-estudiante-asignado-a-ficha-perfil)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Remover información de un estudiante de una ficha perfil](#estudiante-ficha-perfil-accion-remover-informacion-de-un-estudiante-de-una-ficha-perfil)
  - [Consultar información de los estudiantes vínculados a una ficha perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-estudiantes-vinculados-a-una-ficha-perfil)
  - [Consultar información de los compañeros Estudiantes vinculados a la ficha de perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-companeros-estudiantes-vinculados-a-la-ficha-de-perfil)

<a id="estudiante-ficha-perfil-accion-remover-informacion-de-un-estudiante-de-una-ficha-perfil"></a>
#### Remover información de un estudiante de una ficha perfil

- Actores:
  - Coordinador

- Descripción:
  - Permite remover los estudiantes responsables de desarrollar una ficha de perfil

- Información externa / Read model:
  - Informacion Estudiante: Corresponde al Estudiante que se le va a asignar a la Ficha Perfil
  - Informacion Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estudiante

- Políticas:
  - EstudianteFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - EstudianteFichaPerfil-POL-4: Asegurar que el estudiante vinculado a la Ficha Perfil exista por el identificador

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Estudiante Removido de Ficha Perfil](#estudiante-ficha-perfil-evento-estudiante-removido-de-ficha-perfil)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Estudiante asignado a Ficha Perfil](#estudiante-ficha-perfil-evento-estudiante-asignado-a-ficha-perfil)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="estudiante-ficha-perfil-accion-consultar-informacion-de-los-estudiantes-vinculados-a-una-ficha-perfil"></a>
#### Consultar información de los estudiantes vínculados a una ficha perfil

- Actores:
  - Coordinador

- Descripción:
  - Permite aplicar criterios de busqueda para conocer los estudiantes vinculados a una ficha de perfil de una Ficha Perfil en especifíco

- Información externa / Read model:
  - Informacion Estudiante: Corresponde al Estudiante que se le va a asignar a la Ficha Perfil
  - Informacion Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estudiante

- Políticas:
  - EstudianteFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Estudiante de una Ficha Perfil Consultados](#estudiante-ficha-perfil-evento-estudiante-de-una-ficha-perfil-consultados)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Estudiante asignado a Ficha Perfil](#estudiante-ficha-perfil-evento-estudiante-asignado-a-ficha-perfil)

- Comandos posteriores:
  - [Remover información de un estudiante de una ficha perfil](#estudiante-ficha-perfil-accion-remover-informacion-de-un-estudiante-de-una-ficha-perfil)

<a id="estudiante-ficha-perfil-accion-consultar-informacion-de-los-companeros-estudiantes-vinculados-a-la-ficha-de-perfil"></a>
#### Consultar información de los compañeros Estudiantes vinculados a la ficha de perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite aplicar criterios de busqueda para conocer los estudiantes vinculados a una ficha de perfil especifico, la Ficha de Perfil a la que pertenece el estudiante.

- Información externa / Read model:
  - Informacion Estudiante: Corresponde al Estudiante que se le va a asignar a la Ficha Perfil
  - Informacion Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estudiante

- Políticas:
  - EstudianteFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Compañeros de una Ficha Perfil Consultados](#estudiante-ficha-perfil-evento-companeros-de-una-ficha-perfil-consultados)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Estudiante asignado a Ficha Perfil](#estudiante-ficha-perfil-evento-estudiante-asignado-a-ficha-perfil)

- Comandos posteriores:
  - [Remover información de un estudiante de una ficha perfil](#estudiante-ficha-perfil-accion-remover-informacion-de-un-estudiante-de-una-ficha-perfil)

### Eventos
- [Estudiante asignado a Ficha Perfil](#estudiante-ficha-perfil-evento-estudiante-asignado-a-ficha-perfil)
- [Estudiante Removido de Ficha Perfil](#estudiante-ficha-perfil-evento-estudiante-removido-de-ficha-perfil)
- [Estudiante de una Ficha Perfil Consultados](#estudiante-ficha-perfil-evento-estudiante-de-una-ficha-perfil-consultados)
- [Compañeros de una Ficha Perfil Consultados](#estudiante-ficha-perfil-evento-companeros-de-una-ficha-perfil-consultados)

<a id="estudiante-ficha-perfil-evento-estudiante-asignado-a-ficha-perfil"></a>
#### Estudiante asignado a Ficha Perfil

- Producido por:
  - [Asignar información de un estudiante en una ficha de perfil](#estudiante-ficha-perfil-accion-asignar-informacion-de-un-estudiante-en-una-ficha-de-perfil)

- Referenciado como previo en:
  - [Remover información de un estudiante de una ficha perfil](#estudiante-ficha-perfil-accion-remover-informacion-de-un-estudiante-de-una-ficha-perfil)
  - [Consultar información de los estudiantes vínculados a una ficha perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-estudiantes-vinculados-a-una-ficha-perfil)
  - [Consultar información de los compañeros Estudiantes vinculados a la ficha de perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-companeros-estudiantes-vinculados-a-la-ficha-de-perfil)

<a id="estudiante-ficha-perfil-evento-estudiante-removido-de-ficha-perfil"></a>
#### Estudiante Removido de Ficha Perfil

- Producido por:
  - [Remover información de un estudiante de una ficha perfil](#estudiante-ficha-perfil-accion-remover-informacion-de-un-estudiante-de-una-ficha-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="estudiante-ficha-perfil-evento-estudiante-de-una-ficha-perfil-consultados"></a>
#### Estudiante de una Ficha Perfil Consultados

- Producido por:
  - [Consultar información de los estudiantes vínculados a una ficha perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-estudiantes-vinculados-a-una-ficha-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="estudiante-ficha-perfil-evento-companeros-de-una-ficha-perfil-consultados"></a>
#### Compañeros de una Ficha Perfil Consultados

- Producido por:
  - [Consultar información de los compañeros Estudiantes vinculados a la ficha de perfil](#estudiante-ficha-perfil-accion-consultar-informacion-de-los-companeros-estudiantes-vinculados-a-la-ficha-de-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="evaluacion-ficha-perfil"></a>
## Evaluación Ficha Perfil

Objeto de dominio: Evaluación Ficha Perfil

### Acciones
- [Registrar nueva evaluación de ficha de perfil](#evaluacion-ficha-perfil-accion-registrar-nueva-evaluacion-de-ficha-de-perfil)
- [Consultar información de evaluación de ficha de perfil generada](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-ficha-de-perfil-generada)
- [Consultar información de evaluación de la Ficha Perfil que pertenece](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-la-ficha-perfil-que-pertenece)
- [Consultar información de evaluacion de las fichas de perfil las cuales asesora](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-las-fichas-de-perfil-las-cuales-asesora)

<a id="evaluacion-ficha-perfil-accion-registrar-nueva-evaluacion-de-ficha-de-perfil"></a>
#### Registrar nueva evaluación de ficha de perfil

- Actores:
  - RepresentanteComiteCurriculum

- Descripción:
  - Permite registrar una nueva evaluacion ficha perfil de un desarrollo de una ficha de perfil

- Información externa / Read model:
  - Información Representante Comite Curriculum: Corresponde al Usuario que va a registrar le evaluacion Ficha Perfil
  - Información Ficha Perfil: Corresponde a la Ficha Perfil que se le va a asignar al Estudiante

- Políticas:
  - EvaluacionFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - EvaluacionFichaPerfil-POL-02: Asegurar que no exista la misma Evaluacion Ficha Perfil para diferentes Ficha Perfil y/o mismo Representante Comite Curriculum

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Evaluacion Ficha Perfil Registrado](#evaluacion-ficha-perfil-evento-evaluacion-ficha-perfil-registrado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Consultar información de evaluación de ficha de perfil generada](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-ficha-de-perfil-generada)
  - [Consultar información de evaluación de la Ficha Perfil que pertenece](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-la-ficha-perfil-que-pertenece)
  - [Consultar información de evaluacion de las fichas de perfil las cuales asesora](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-las-fichas-de-perfil-las-cuales-asesora)

<a id="evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-ficha-de-perfil-generada"></a>
#### Consultar información de evaluación de ficha de perfil generada

- Actores:
  - RepresentanteComiteCurriculum

- Descripción:
  - Permite aplicar criterios de busqueda para las evaluaciones ficha perfil generadas por el mismo representante comite curriculum

- Información externa / Read model:
  - Informacion Representante Comite Curriculum: Corresponde al Usuario que se le asigno a la evaluacion Ficha Perfil
  - Informacion Ficha Perfil: Corresponde a la Ficha Perfil que se le asigno y que se esta evaluando a la Evaluacion Ficha Perfil

- Políticas:
  - EvaluacionFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Evaluacion Ficha Perfil Consultada](#evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Evaluacion Ficha Perfil Registrado](#evaluacion-ficha-perfil-evento-evaluacion-ficha-perfil-registrado)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-la-ficha-perfil-que-pertenece"></a>
#### Consultar información de evaluación de la Ficha Perfil que pertenece

- Actores:
  - Estudiante

- Descripción:
  - Permite aplicar busqueda para las evaluaciones ficha perfil a la que pertenece

- Información externa / Read model:
  - Informacion Representante Comite Curriculum: Corresponde al Usuario que se le asigno a la evaluacion Ficha Perfil
  - Informacion Ficha Perfil: Corresponde a la Ficha Perfil que se le asigno y que se esta evaluando a la Evaluacion Ficha Perfil

- Políticas:
  - EvaluacionFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Evaluacion Ficha Perfil que Pertenece Consultada](#evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-que-pertenece-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Evaluacion Ficha Perfil Registrado](#evaluacion-ficha-perfil-evento-evaluacion-ficha-perfil-registrado)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-las-fichas-de-perfil-las-cuales-asesora"></a>
#### Consultar información de evaluacion de las fichas de perfil las cuales asesora

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite aplicar criterios de busqueda para las evaluaciones ficha perfil de las cuales esta asesorando el Asesor Ficha

- Información externa / Read model:
  - Informacion Representante Comite Curriculum: Corresponde al Usuario que se le asigno a la evaluacion Ficha Perfil
  - Informacion Ficha Perfil: Corresponde a la Ficha Perfil que se le asigno y que se esta evaluando a la Evaluacion Ficha Perfil

- Políticas:
  - EvaluacionFichaPerfil-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Evaluacion Ficha Perfil Consultada Por Asesor Ficha](#evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-consultada-por-asesor-ficha)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Evaluacion Ficha Perfil Registrado](#evaluacion-ficha-perfil-evento-evaluacion-ficha-perfil-registrado)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Evaluacion Ficha Perfil Registrado](#evaluacion-ficha-perfil-evento-evaluacion-ficha-perfil-registrado)
- [Información Evaluacion Ficha Perfil Consultada](#evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-consultada)
- [Información Evaluacion Ficha Perfil que Pertenece Consultada](#evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-que-pertenece-consultada)
- [Información Evaluacion Ficha Perfil Consultada Por Asesor Ficha](#evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-consultada-por-asesor-ficha)

<a id="evaluacion-ficha-perfil-evento-evaluacion-ficha-perfil-registrado"></a>
#### Evaluacion Ficha Perfil Registrado

- Producido por:
  - [Registrar nueva evaluación de ficha de perfil](#evaluacion-ficha-perfil-accion-registrar-nueva-evaluacion-de-ficha-de-perfil)

- Referenciado como previo en:
  - [Consultar información de evaluación de ficha de perfil generada](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-ficha-de-perfil-generada)
  - [Consultar información de evaluación de la Ficha Perfil que pertenece](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-la-ficha-perfil-que-pertenece)
  - [Consultar información de evaluacion de las fichas de perfil las cuales asesora](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-las-fichas-de-perfil-las-cuales-asesora)

<a id="evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-consultada"></a>
#### Información Evaluacion Ficha Perfil Consultada

- Producido por:
  - [Consultar información de evaluación de ficha de perfil generada](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-ficha-de-perfil-generada)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-que-pertenece-consultada"></a>
#### Información Evaluacion Ficha Perfil que Pertenece Consultada

- Producido por:
  - [Consultar información de evaluación de la Ficha Perfil que pertenece](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-la-ficha-perfil-que-pertenece)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="evaluacion-ficha-perfil-evento-informacion-evaluacion-ficha-perfil-consultada-por-asesor-ficha"></a>
#### Información Evaluacion Ficha Perfil Consultada Por Asesor Ficha

- Producido por:
  - [Consultar información de evaluacion de las fichas de perfil las cuales asesora](#evaluacion-ficha-perfil-accion-consultar-informacion-de-evaluacion-de-las-fichas-de-perfil-las-cuales-asesora)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="estado-evaluacion-ficha"></a>
## Estado Evaluacion Ficha

Objeto de dominio: Estado Evaluacion Ficha

### Acciones
- [Agregar información de un nuevo Estado Evaluacion Ficha](#estado-evaluacion-ficha-accion-agregar-informacion-de-un-nuevo-estado-evaluacion-ficha)

<a id="estado-evaluacion-ficha-accion-agregar-informacion-de-un-nuevo-estado-evaluacion-ficha"></a>
#### Agregar información de un nuevo Estado Evaluacion Ficha

- Actores:
  - RepresentanteComiteCurriculum

- Descripción:
  - Permite agregar nuevos Estado Evaluacion Ficha para que sean visibles para los usuarios y que se pueda contener la información relevante para una Evaluacion Ficha Perfil

- Información externa / Read model:
  - Información Estado Evaluacion: Corresponde al Estado evaluacion que se le va a asignar a la Evaluacion Ficha Perfil
  - Información Evaluación Ficha Perfil: Corresponde a la Evaluación Ficha Perfil que se le va a asignar un Estado Evaluación

- Políticas:
  - EstadoEvaluacionFicha-POL-01: Asegurar que el primer estado evaluacion sea En Evaluación al iniciar un Estado Ficha Perfil
  - EstadoEvaluacionFicha-POL-02: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - EstadoEvaluacionFicha-POL-04: Una Evaluación Ficha Perfil no puede tener el mismo estado asignado más de una vez.
  - EstadoEvaluacionFicha-POL-05: Una vez que el estado de la ficha es "Aprobada" o "No Aprobada" o "Descartada", no se puede cambiar a ningún otro estado.
  - EstadoEvaluacionFicha-POL-06: Asegurar que el estado inicial sea "En envaluación" para contuniar con los otros estados.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Nuevo Estado Evaluacion Ficha Agregado](#estado-evaluacion-ficha-evento-nuevo-estado-evaluacion-ficha-agregado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - #REF!

### Eventos
- [Nuevo Estado Evaluacion Ficha Agregado](#estado-evaluacion-ficha-evento-nuevo-estado-evaluacion-ficha-agregado)

<a id="estado-evaluacion-ficha-evento-nuevo-estado-evaluacion-ficha-agregado"></a>
#### Nuevo Estado Evaluacion Ficha Agregado

- Producido por:
  - [Agregar información de un nuevo Estado Evaluacion Ficha](#estado-evaluacion-ficha-accion-agregar-informacion-de-un-nuevo-estado-evaluacion-ficha)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="ficha-perfil"></a>
## Ficha Perfil

Objeto de dominio: Ficha Perfil

### Acciones
- [Registrar Nueva información Ficha Perfil](#ficha-perfil-accion-registrar-nueva-informacion-ficha-perfil)
- [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)
- [Cambiar Asesor Ficha para Ficha Perfil](#ficha-perfil-accion-cambiar-asesor-ficha-para-ficha-perfil)
- [Modificar Ficha Perfil](#ficha-perfil-accion-modificar-ficha-perfil)
- [Consultar información de una Ficha Perfil al que Pertenece](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-al-que-pertenece)
- [Consultar información de las Ficha Perfil los cuales asesora](#ficha-perfil-accion-consultar-informacion-de-las-ficha-perfil-los-cuales-asesora)

<a id="ficha-perfil-accion-registrar-nueva-informacion-ficha-perfil"></a>
#### Registrar Nueva información Ficha Perfil

- Actores:
  - Coordinador
  - Asesor Ficha

- Descripción:
  - Permite Registrar información de una nueva ficha de perfil para ser visualizada y desarrollada por los usuarios

- Información externa / Read model:
  - Información Asesor Ficha: Corresponde al Asesor Ficha que se le va a asignar a la ficha perfil
  - Información Estado Ficha Perfil: Corresponde al Estado Ficha Perfil que se le va a asignar a la Ficha Perfil Nueva

- Políticas:
  - FichaPerfil-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - FichaPerfil-POL-02: Asegurar que el nombre de una Ficha Perfil no estén repetidos
  - FichaPerfil-POL-03: Asegurar que exista un asesor ficha perfil para una ficha de perfil a crear

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Nueva Ficha Perfil Asignada](#ficha-perfil-evento-nueva-ficha-perfil-asignada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)
  - [Cambiar Asesor Ficha para Ficha Perfil](#ficha-perfil-accion-cambiar-asesor-ficha-para-ficha-perfil)
  - [Modificar Ficha Perfil](#ficha-perfil-accion-modificar-ficha-perfil)
  - [Consultar información de las Ficha Perfil los cuales asesora](#ficha-perfil-accion-consultar-informacion-de-las-ficha-perfil-los-cuales-asesora)
  - [Consultar información de una Ficha Perfil al que Pertenece](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-al-que-pertenece)

<a id="ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador"></a>
#### Consultar información de una Ficha Perfil que genero el Coordinador

- Actores:
  - Coordinador

- Descripción:
  - Permite aplicar criterios de busqueda para la información de las fichas de perfil en general

- Información externa / Read model:
  - Información Asesor Ficha: Corresponde al Asesor Ficha que se le asigno a la ficha perfil
  - Información Item: Corresponde a los items que conforman a la ficha perfil

- Políticas:
  - FichaPerfil-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información de Ficha Perfil Generada por Coordinador Consultada](#ficha-perfil-evento-informacion-de-ficha-perfil-generada-por-coordinador-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Nueva Ficha Perfil Asignada](#ficha-perfil-evento-nueva-ficha-perfil-asignada)
  - [Asesor Ficha Cambiado](#ficha-perfil-evento-asesor-ficha-cambiado)
  - [Ficha Perfil Modificada](#ficha-perfil-evento-ficha-perfil-modificada)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="ficha-perfil-accion-cambiar-asesor-ficha-para-ficha-perfil"></a>
#### Cambiar Asesor Ficha para Ficha Perfil

- Actores:
  - Coordinador

- Descripción:
  - Permite cambiar el Asesor Ficha de una Ficha Perfil en específico, debido a alguna circunstancia que haya impedido la participación del anterior Asesor Ficha

- Información externa / Read model:
  - Información Asesor Ficha: Corresponde al Asesor Ficha que se le va a asignar a la ficha perfil

- Políticas:
  - FichaPerfil-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - FichaPerfil-POL-05: Asegurar que el Asesor nuevo no sea el mismo que tenía anteriormente.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Asesor Ficha Cambiado](#ficha-perfil-evento-asesor-ficha-cambiado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Nueva Ficha Perfil Asignada](#ficha-perfil-evento-nueva-ficha-perfil-asignada)
  - [Ficha Perfil Modificada](#ficha-perfil-evento-ficha-perfil-modificada)

- Comandos posteriores:
  - [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)
  - [Consultar información de una Ficha Perfil al que Pertenece](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-al-que-pertenece)
  - [Consultar información de las Ficha Perfil los cuales asesora](#ficha-perfil-accion-consultar-informacion-de-las-ficha-perfil-los-cuales-asesora)
  - [Modificar Ficha Perfil](#ficha-perfil-accion-modificar-ficha-perfil)

<a id="ficha-perfil-accion-modificar-ficha-perfil"></a>
#### Modificar Ficha Perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite modificar el Titulo de ficha de perfil

- Información externa / Read model:
  - No se encontraron read models o información externa.

- Políticas:
  - FichaPerfil-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Ficha Perfil Modificada](#ficha-perfil-evento-ficha-perfil-modificada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - Registrar Nueva información Ficha Perfil
  - Cambiar Asesor Ficha para Ficha Perfil

- Comandos posteriores:
  - [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)
  - [Consultar información de una Ficha Perfil al que Pertenece](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-al-que-pertenece)
  - [Cambiar Asesor Ficha para Ficha Perfil](#ficha-perfil-accion-cambiar-asesor-ficha-para-ficha-perfil)
  - [Consultar información de las Ficha Perfil los cuales asesora](#ficha-perfil-accion-consultar-informacion-de-las-ficha-perfil-los-cuales-asesora)

<a id="ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-al-que-pertenece"></a>
#### Consultar información de una Ficha Perfil al que Pertenece

- Actores:
  - Estudiante

- Descripción:
  - Permite consultar informacion de una ficha perfil en el cual pertenece el estudiante y esta asignado.

- Información externa / Read model:
  - Información Asesor Ficha: Corresponde al Asesor Ficha que se le asigno a la ficha perfil
  - Información Item: Corresponde a los items que conforman a la ficha perfil

- Políticas:
  - FichaPerfil-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información de Ficha Perfil del Estudiante Consultada](#ficha-perfil-evento-informacion-de-ficha-perfil-del-estudiante-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - Registrar Nueva información Ficha Perfil
  - Cambiar Asesor Ficha para Ficha Perfil

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="ficha-perfil-accion-consultar-informacion-de-las-ficha-perfil-los-cuales-asesora"></a>
#### Consultar información de las Ficha Perfil los cuales asesora

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite aplicar criterios de busqueda para la información de las Fichas de Perfil que asesora el Asesor Ficha

- Información externa / Read model:
  - Información Asesor Ficha: Corresponde al Asesor Ficha que se le asigno a la ficha perfil
  - Información Item: Corresponde a los items que conforman a la ficha perfil

- Políticas:
  - FichaPerfil-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información de Ficha Perfil Consultada Por Asesor Ficha](#ficha-perfil-evento-informacion-de-ficha-perfil-consultada-por-asesor-ficha)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - Registrar Nueva información Ficha Perfil
  - Cambiar Asesor Ficha para Ficha Perfil

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Nueva Ficha Perfil Asignada](#ficha-perfil-evento-nueva-ficha-perfil-asignada)
- [Información de Ficha Perfil Generada por Coordinador Consultada](#ficha-perfil-evento-informacion-de-ficha-perfil-generada-por-coordinador-consultada)
- [Asesor Ficha Cambiado](#ficha-perfil-evento-asesor-ficha-cambiado)
- [Ficha Perfil Modificada](#ficha-perfil-evento-ficha-perfil-modificada)
- [Información de Ficha Perfil del Estudiante Consultada](#ficha-perfil-evento-informacion-de-ficha-perfil-del-estudiante-consultada)
- [Información de Ficha Perfil Consultada Por Asesor Ficha](#ficha-perfil-evento-informacion-de-ficha-perfil-consultada-por-asesor-ficha)

<a id="ficha-perfil-evento-nueva-ficha-perfil-asignada"></a>
#### Nueva Ficha Perfil Asignada

- Producido por:
  - [Registrar Nueva información Ficha Perfil](#ficha-perfil-accion-registrar-nueva-informacion-ficha-perfil)

- Referenciado como previo en:
  - [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)
  - [Cambiar Asesor Ficha para Ficha Perfil](#ficha-perfil-accion-cambiar-asesor-ficha-para-ficha-perfil)

<a id="ficha-perfil-evento-informacion-de-ficha-perfil-generada-por-coordinador-consultada"></a>
#### Información de Ficha Perfil Generada por Coordinador Consultada

- Producido por:
  - [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="ficha-perfil-evento-asesor-ficha-cambiado"></a>
#### Asesor Ficha Cambiado

- Producido por:
  - [Cambiar Asesor Ficha para Ficha Perfil](#ficha-perfil-accion-cambiar-asesor-ficha-para-ficha-perfil)

- Referenciado como previo en:
  - [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)

<a id="ficha-perfil-evento-ficha-perfil-modificada"></a>
#### Ficha Perfil Modificada

- Producido por:
  - [Modificar Ficha Perfil](#ficha-perfil-accion-modificar-ficha-perfil)

- Referenciado como previo en:
  - [Consultar información de una Ficha Perfil que genero el Coordinador](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-que-genero-el-coordinador)
  - [Cambiar Asesor Ficha para Ficha Perfil](#ficha-perfil-accion-cambiar-asesor-ficha-para-ficha-perfil)

<a id="ficha-perfil-evento-informacion-de-ficha-perfil-del-estudiante-consultada"></a>
#### Información de Ficha Perfil del Estudiante Consultada

- Producido por:
  - [Consultar información de una Ficha Perfil al que Pertenece](#ficha-perfil-accion-consultar-informacion-de-una-ficha-perfil-al-que-pertenece)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="ficha-perfil-evento-informacion-de-ficha-perfil-consultada-por-asesor-ficha"></a>
#### Información de Ficha Perfil Consultada Por Asesor Ficha

- Producido por:
  - [Consultar información de las Ficha Perfil los cuales asesora](#ficha-perfil-accion-consultar-informacion-de-las-ficha-perfil-los-cuales-asesora)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="item"></a>
## Item

Objeto de dominio: Item

### Acciones
- [Agregar Item a ficha perfil](#item-accion-agregar-item-a-ficha-perfil)
- [Consultar información de los items de su Ficha Perfil](#item-accion-consultar-informacion-de-los-items-de-su-ficha-perfil)
- [Modificar información de un Item](#item-accion-modificar-informacion-de-un-item)
- [Remover información de un Item](#item-accion-remover-informacion-de-un-item)
- [Consultar información de los items de una Ficha Perfil a Asesorar](#item-accion-consultar-informacion-de-los-items-de-una-ficha-perfil-a-asesorar)
- [Consultar informacion de los items de la Ficha Perfil a aprobar.](#item-accion-consultar-informacion-de-los-items-de-la-ficha-perfil-a-aprobar)

<a id="item-accion-agregar-item-a-ficha-perfil"></a>
#### Agregar Item a ficha perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite agregar información importante para una ficha de pérfil, para ser visualizada por los usuarios y evaluada

- Información externa / Read model:
  - Información Ficha Pérfil: Corresponde a la ficha perfil que se le va a asignar a el item
  - Información Tipo Item: Corresponde al Tipo Item que se le va a asignar al Item

- Políticas:
  - Item-POL-1: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - Item-POL-02: No se puede repetir el Tipo Item en una misma de perfil
  - Item-POL-03: Asegurar que exista una ficha de perfil para un item de una ficha de perfil

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Item Agregado a la ficha perfil](#item-evento-item-agregado-a-la-ficha-perfil)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Consultar información de los items de su Ficha Perfil](#item-accion-consultar-informacion-de-los-items-de-su-ficha-perfil)
  - [Remover información de un Item](#item-accion-remover-informacion-de-un-item)
  - [Consultar información de los items de una Ficha Perfil a Asesorar](#item-accion-consultar-informacion-de-los-items-de-una-ficha-perfil-a-asesorar)
  - [Consultar informacion de los items de la Ficha Perfil a aprobar.](#item-accion-consultar-informacion-de-los-items-de-la-ficha-perfil-a-aprobar)
  - [Modificar información de un Item](#item-accion-modificar-informacion-de-un-item)

<a id="item-accion-consultar-informacion-de-los-items-de-su-ficha-perfil"></a>
#### Consultar información de los items de su Ficha Perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite la busqueda de la información de un item de una Ficha Perfil al cual pertenece el estudiante, para validar su existencia.

- Información externa / Read model:
  - Información Ficha Pérfil: Corresponde a la ficha perfil que se le va a asignar a el item
  - Información Tipo Item: Corresponde al Tipo Item que se le va a asignar al Item
  - Información Revision Item: Corresponde a la revision desarrollada por el asesor ficha y que trae información relevante

- Políticas:
  - Item-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - Item-POL-06: Asegurar que si no existe una Revision Item o nueva información en Revisión Item simplemente se consulte informacion del Item

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Item del Estudiante Consultada](#item-evento-informacion-item-del-estudiante-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Item Agregado a la ficha perfil](#item-evento-item-agregado-a-la-ficha-perfil)
  - [Información Item Modificada](#item-evento-informacion-item-modificada)

- Comandos posteriores:
  - [Modificar información de un Item](#item-accion-modificar-informacion-de-un-item)
  - [Remover información de un Item](#item-accion-remover-informacion-de-un-item)

<a id="item-accion-modificar-informacion-de-un-item"></a>
#### Modificar información de un Item

- Actores:
  - Estudiante

- Descripción:
  - Permite Modificar información de un item ficha de perfil existente para ser visualizada y desarrollada por los estudiantes

- Información externa / Read model:
  - Información Ficha Pérfil: Corresponde a la ficha perfil que se le va a asignar a el item
  - Información Tipo Item: Corresponde al Tipo Item que se le va a asignar al Item

- Políticas:
  - Item-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - Item-POL-04: Solo se puede modificar el contenido del objeto item

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Item Modificada](#item-evento-informacion-item-modificada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Item Agregado a la ficha perfil](#item-evento-item-agregado-a-la-ficha-perfil)
  - Consultar información de los items de su Ficha Perfil

- Comandos posteriores:
  - [Remover información de un Item](#item-accion-remover-informacion-de-un-item)
  - [Consultar información de los items de su Ficha Perfil](#item-accion-consultar-informacion-de-los-items-de-su-ficha-perfil)
  - [Consultar informacion de los items de la Ficha Perfil a aprobar.](#item-accion-consultar-informacion-de-los-items-de-la-ficha-perfil-a-aprobar)
  - [Consultar información de los items de una Ficha Perfil a Asesorar](#item-accion-consultar-informacion-de-los-items-de-una-ficha-perfil-a-asesorar)

<a id="item-accion-remover-informacion-de-un-item"></a>
#### Remover información de un Item

- Actores:
  - Estudiante

- Descripción:
  - Permite Remover información de un item ficha de perfil existente.

- Información externa / Read model:
  - Información Ficha Pérfil: Corresponde a la ficha perfil que se le va a asignar a el item
  - Información Tipo Item: Corresponde al Tipo Item que se le va a asignar al Item

- Políticas:
  - Item-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - Item-POL-05: Asegurar que no se pueda remover un item luego de una Revision Item generada por Asesor Ficha

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Item Removida](#item-evento-informacion-item-removida)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - Agregar Item a ficha perfil
  - Consultar información de los items de su Ficha Perfil
  - Consultar información de los items de una Ficha Perfil a Asesorar
  - Consultar informacion de los items de la Ficha Perfil a aprobar.
  - Modificar información de un Item

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="item-accion-consultar-informacion-de-los-items-de-una-ficha-perfil-a-asesorar"></a>
#### Consultar información de los items de una Ficha Perfil a Asesorar

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite aplicar criterios de busqueda para la información de los items de una Ficha Perfil, para las Fichas de Perfil las cuales asesora.

- Información externa / Read model:
  - Información Ficha Pérfil: Corresponde a la ficha perfil que se le va a asignar a el item
  - Información Tipo Item: Corresponde al Tipo Item que se le va a asignar al Item
  - Información Revision Item: Corresponde a la revision desarrollada por el asesor ficha y que trae información relevante

- Políticas:
  - Item-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - Item-POL-06: Asegurar que si no existe una Revision Item o nueva información en Revisión Item simplemente se consulte informacion del Item

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Items del Asesor Ficha Consultada](#item-evento-informacion-items-del-asesor-ficha-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Item Agregado a la ficha perfil](#item-evento-item-agregado-a-la-ficha-perfil)
  - [Información Item Modificada](#item-evento-informacion-item-modificada)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="item-accion-consultar-informacion-de-los-items-de-la-ficha-perfil-a-aprobar"></a>
#### Consultar informacion de los items de la Ficha Perfil a aprobar.

- Actores:
  - Representante Comite Curriculum

- Descripción:
  - Permite aplicar criterios de busqueda para la información de los items de una Ficha Perfil, para las Fichas de Perfil las cuales asesora.

- Información externa / Read model:
  - Información Ficha Pérfil: Corresponde a la ficha perfil que se le va a asignar a el item
  - Información Tipo Item: Corresponde al Tipo Item que se le va a asignar al Item
  - Información Revision Item: Corresponde a la revision desarrollada por el asesor ficha y que trae información relevante

- Políticas:
  - Item-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - Item-POL-06: Asegurar que si no existe una Revision Item o nueva información en Revisión Item simplemente se consulte informacion del Item

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Información Items que se aprueban Consultada](#item-evento-informacion-items-que-se-aprueban-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Item Agregado a la ficha perfil](#item-evento-item-agregado-a-la-ficha-perfil)
  - [Información Item Modificada](#item-evento-informacion-item-modificada)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Item Agregado a la ficha perfil](#item-evento-item-agregado-a-la-ficha-perfil)
- [Información Item del Estudiante Consultada](#item-evento-informacion-item-del-estudiante-consultada)
- [Información Item Modificada](#item-evento-informacion-item-modificada)
- [Información Item Removida](#item-evento-informacion-item-removida)
- [Información Items del Asesor Ficha Consultada](#item-evento-informacion-items-del-asesor-ficha-consultada)
- [Información Items que se aprueban Consultada](#item-evento-informacion-items-que-se-aprueban-consultada)

<a id="item-evento-item-agregado-a-la-ficha-perfil"></a>
#### Item Agregado a la ficha perfil

- Producido por:
  - [Agregar Item a ficha perfil](#item-accion-agregar-item-a-ficha-perfil)

- Referenciado como previo en:
  - [Consultar información de los items de su Ficha Perfil](#item-accion-consultar-informacion-de-los-items-de-su-ficha-perfil)
  - [Modificar información de un Item](#item-accion-modificar-informacion-de-un-item)
  - [Consultar información de los items de una Ficha Perfil a Asesorar](#item-accion-consultar-informacion-de-los-items-de-una-ficha-perfil-a-asesorar)
  - [Consultar informacion de los items de la Ficha Perfil a aprobar.](#item-accion-consultar-informacion-de-los-items-de-la-ficha-perfil-a-aprobar)

<a id="item-evento-informacion-item-del-estudiante-consultada"></a>
#### Información Item del Estudiante Consultada

- Producido por:
  - [Consultar información de los items de su Ficha Perfil](#item-accion-consultar-informacion-de-los-items-de-su-ficha-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="item-evento-informacion-item-modificada"></a>
#### Información Item Modificada

- Producido por:
  - [Modificar información de un Item](#item-accion-modificar-informacion-de-un-item)

- Referenciado como previo en:
  - [Consultar información de los items de su Ficha Perfil](#item-accion-consultar-informacion-de-los-items-de-su-ficha-perfil)
  - [Consultar información de los items de una Ficha Perfil a Asesorar](#item-accion-consultar-informacion-de-los-items-de-una-ficha-perfil-a-asesorar)
  - [Consultar informacion de los items de la Ficha Perfil a aprobar.](#item-accion-consultar-informacion-de-los-items-de-la-ficha-perfil-a-aprobar)

<a id="item-evento-informacion-item-removida"></a>
#### Información Item Removida

- Producido por:
  - [Remover información de un Item](#item-accion-remover-informacion-de-un-item)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="item-evento-informacion-items-del-asesor-ficha-consultada"></a>
#### Información Items del Asesor Ficha Consultada

- Producido por:
  - [Consultar información de los items de una Ficha Perfil a Asesorar](#item-accion-consultar-informacion-de-los-items-de-una-ficha-perfil-a-asesorar)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="item-evento-informacion-items-que-se-aprueban-consultada"></a>
#### Información Items que se aprueban Consultada

- Producido por:
  - [Consultar informacion de los items de la Ficha Perfil a aprobar.](#item-accion-consultar-informacion-de-los-items-de-la-ficha-perfil-a-aprobar)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="observacion-evaluacion"></a>
## Observacion Evaluacion

Objeto de dominio: Observacion Evaluacion

### Acciones
- [Agregar Observacion Evaluacion](#observacion-evaluacion-accion-agregar-observacion-evaluacion)
- [Consultar Observacion Evaluacion Elaboradas](#observacion-evaluacion-accion-consultar-observacion-evaluacion-elaboradas)
- [Modificar Observacion Evaluacion](#observacion-evaluacion-accion-modificar-observacion-evaluacion)
- [Remover Observacion Evaluacion](#observacion-evaluacion-accion-remover-observacion-evaluacion)
- [Consultar Observacion Evaluacion de su Ficha Perfil](#observacion-evaluacion-accion-consultar-observacion-evaluacion-de-su-ficha-perfil)

<a id="observacion-evaluacion-accion-agregar-observacion-evaluacion"></a>
#### Agregar Observacion Evaluacion

- Actores:
  - Representante Comite Curricullum

- Descripción:
  - Permite agregar información importante para una Observacion Evaluacion, para ser visualizada por los estudiantes y representante comite curricullum

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que se le va a asignar a observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - ObservacionEvaluacion-POL-02: Asegurar que exista la evaluacion ficha perfil para agregar una nueva Observacion Evaluacion

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion Agregada](#observacion-evaluacion-evento-observacion-evaluacion-agregada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Consultar Observacion Evaluacion Elaboradas](#observacion-evaluacion-accion-consultar-observacion-evaluacion-elaboradas)
  - [Modificar Observacion Evaluacion](#observacion-evaluacion-accion-modificar-observacion-evaluacion)
  - [Consultar Observacion Evaluacion de su Ficha Perfil](#observacion-evaluacion-accion-consultar-observacion-evaluacion-de-su-ficha-perfil)
  - [Remover Observacion Evaluacion](#observacion-evaluacion-accion-remover-observacion-evaluacion)

<a id="observacion-evaluacion-accion-consultar-observacion-evaluacion-elaboradas"></a>
#### Consultar Observacion Evaluacion Elaboradas

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite aplicar criterios de busqueda para la información de una Observacion Evaluacion que ha elaborado un Asesor Ficha para validar su existencia

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que se le va a asignar a observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion Elaborada por Asesor Ficha Consultada](#observacion-evaluacion-evento-observacion-evaluacion-elaborada-por-asesor-ficha-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Observacion Evaluacion Agregada](#observacion-evaluacion-evento-observacion-evaluacion-agregada)
  - [Observacion Evaluacion Modificada](#observacion-evaluacion-evento-observacion-evaluacion-modificada)

- Comandos posteriores:
  - [Modificar Observacion Evaluacion](#observacion-evaluacion-accion-modificar-observacion-evaluacion)
  - [Remover Observacion Evaluacion](#observacion-evaluacion-accion-remover-observacion-evaluacion)

<a id="observacion-evaluacion-accion-modificar-observacion-evaluacion"></a>
#### Modificar Observacion Evaluacion

- Actores:
  - Representante Comite Curricullum

- Descripción:
  - Permite Modificar información de una Observacion Evaluacion para ser visualizada por los usuarios

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que se le va a asignar a observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - ObservacionEvaluacion-POL-03: Solo se permite modificar el contenido de una Observacion Evaluacion

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion Modificada](#observacion-evaluacion-evento-observacion-evaluacion-modificada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Observacion Evaluacion Agregada](#observacion-evaluacion-evento-observacion-evaluacion-agregada)
  - [Observacion Evaluacion Elaborada por Asesor Ficha Consultada](#observacion-evaluacion-evento-observacion-evaluacion-elaborada-por-asesor-ficha-consultada)

- Comandos posteriores:
  - [Remover Observacion Evaluacion](#observacion-evaluacion-accion-remover-observacion-evaluacion)
  - [Consultar Observacion Evaluacion Elaboradas](#observacion-evaluacion-accion-consultar-observacion-evaluacion-elaboradas)
  - [Consultar Observacion Evaluacion de su Ficha Perfil](#observacion-evaluacion-accion-consultar-observacion-evaluacion-de-su-ficha-perfil)

<a id="observacion-evaluacion-accion-remover-observacion-evaluacion"></a>
#### Remover Observacion Evaluacion

- Actores:
  - Representante Comite Curricullum

- Descripción:
  - Permite a el representante comite curricullum remover las observaciones de Observacion Evaluacion que haya realizado

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que se le va a asignar a observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion Removida](#observacion-evaluacion-evento-observacion-evaluacion-removida)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - Agregar Observacion Evaluacion
  - Modificar Observacion Evaluacion

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="observacion-evaluacion-accion-consultar-observacion-evaluacion-de-su-ficha-perfil"></a>
#### Consultar Observacion Evaluacion de su Ficha Perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite aplicar criterios de busqueda para la información de una Observacion Evaluacion para validar su existencia

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que se le va a asignar a observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion de su Ficha Perfil Consultada](#observacion-evaluacion-evento-observacion-evaluacion-de-su-ficha-perfil-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - Agregar Observacion Evaluacion
  - Modificar Observacion Evaluacion

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Observacion Evaluacion Agregada](#observacion-evaluacion-evento-observacion-evaluacion-agregada)
- [Observacion Evaluacion Elaborada por Asesor Ficha Consultada](#observacion-evaluacion-evento-observacion-evaluacion-elaborada-por-asesor-ficha-consultada)
- [Observacion Evaluacion Modificada](#observacion-evaluacion-evento-observacion-evaluacion-modificada)
- [Observacion Evaluacion Removida](#observacion-evaluacion-evento-observacion-evaluacion-removida)
- [Observacion Evaluacion de su Ficha Perfil Consultada](#observacion-evaluacion-evento-observacion-evaluacion-de-su-ficha-perfil-consultada)

<a id="observacion-evaluacion-evento-observacion-evaluacion-agregada"></a>
#### Observacion Evaluacion Agregada

- Producido por:
  - [Agregar Observacion Evaluacion](#observacion-evaluacion-accion-agregar-observacion-evaluacion)

- Referenciado como previo en:
  - [Consultar Observacion Evaluacion Elaboradas](#observacion-evaluacion-accion-consultar-observacion-evaluacion-elaboradas)
  - [Modificar Observacion Evaluacion](#observacion-evaluacion-accion-modificar-observacion-evaluacion)

<a id="observacion-evaluacion-evento-observacion-evaluacion-elaborada-por-asesor-ficha-consultada"></a>
#### Observacion Evaluacion Elaborada por Asesor Ficha Consultada

- Producido por:
  - [Consultar Observacion Evaluacion Elaboradas](#observacion-evaluacion-accion-consultar-observacion-evaluacion-elaboradas)

- Referenciado como previo en:
  - [Modificar Observacion Evaluacion](#observacion-evaluacion-accion-modificar-observacion-evaluacion)

<a id="observacion-evaluacion-evento-observacion-evaluacion-modificada"></a>
#### Observacion Evaluacion Modificada

- Producido por:
  - [Modificar Observacion Evaluacion](#observacion-evaluacion-accion-modificar-observacion-evaluacion)

- Referenciado como previo en:
  - [Consultar Observacion Evaluacion Elaboradas](#observacion-evaluacion-accion-consultar-observacion-evaluacion-elaboradas)

<a id="observacion-evaluacion-evento-observacion-evaluacion-removida"></a>
#### Observacion Evaluacion Removida

- Producido por:
  - [Remover Observacion Evaluacion](#observacion-evaluacion-accion-remover-observacion-evaluacion)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="observacion-evaluacion-evento-observacion-evaluacion-de-su-ficha-perfil-consultada"></a>
#### Observacion Evaluacion de su Ficha Perfil Consultada

- Producido por:
  - [Consultar Observacion Evaluacion de su Ficha Perfil](#observacion-evaluacion-accion-consultar-observacion-evaluacion-de-su-ficha-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="observacion-item"></a>
## Observacion Item

Objeto de dominio: Observacion Item

### Acciones
- [Agregar Observacion Item](#observacion-item-accion-agregar-observacion-item)
- [Consultar Observacion Item Elaboradas](#observacion-item-accion-consultar-observacion-item-elaboradas)
- [Modificar Observacion Evaluacion](#observacion-item-accion-modificar-observacion-evaluacion)
- [Remover Observacion Evaluacion](#observacion-item-accion-remover-observacion-evaluacion)
- [Consultar Observacion Item de su Ficha Perfil](#observacion-item-accion-consultar-observacion-item-de-su-ficha-perfil)

<a id="observacion-item-accion-agregar-observacion-item"></a>
#### Agregar Observacion Item

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite agregar información importante para una Observacion Evaluacion, para ser visualizada por los estudiantes y representante comite curricullum

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que se le va a asignar a observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - ObservacionEvaluacion-POL-02: Asegurar que exista la evaluacion ficha perfil para agregar una nueva Observacion Evaluacion

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion Agregada](#observacion-item-evento-observacion-evaluacion-agregada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Consultar Observacion Item Elaboradas](#observacion-item-accion-consultar-observacion-item-elaboradas)
  - [Modificar Observacion Evaluacion](#observacion-item-accion-modificar-observacion-evaluacion)
  - [Consultar Observacion Item de su Ficha Perfil](#observacion-item-accion-consultar-observacion-item-de-su-ficha-perfil)
  - [Remover Observacion Evaluacion](#observacion-item-accion-remover-observacion-evaluacion)

<a id="observacion-item-accion-consultar-observacion-item-elaboradas"></a>
#### Consultar Observacion Item Elaboradas

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite aplicar criterios de busqueda para la información de una Observacion Item que ha elaborado un Asesor Ficha para validar su existencia

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que tiene observacion evaluacion para aplicar filtros de busqueda

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Item Elaborada por Asesor Ficha Consultada](#observacion-item-evento-observacion-item-elaborada-por-asesor-ficha-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Observacion Evaluacion Agregada](#observacion-item-evento-observacion-evaluacion-agregada)
  - [Observacion Evaluacion Modificada](#observacion-item-evento-observacion-evaluacion-modificada)

- Comandos posteriores:
  - [Modificar Observacion Evaluacion](#observacion-item-accion-modificar-observacion-evaluacion)
  - [Remover Observacion Evaluacion](#observacion-item-accion-remover-observacion-evaluacion)

<a id="observacion-item-accion-modificar-observacion-evaluacion"></a>
#### Modificar Observacion Evaluacion

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite Modificar información de una Observacion Evaluacion para ser visualizada por los usuarios

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que tiene asignado una observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - ObservacionEvaluacion-POL-03: Solo se permite modificar el contenido de una Observacion Evaluacion

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion Modificada](#observacion-item-evento-observacion-evaluacion-modificada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Observacion Evaluacion Agregada](#observacion-item-evento-observacion-evaluacion-agregada)
  - [Observacion Item Elaborada por Asesor Ficha Consultada](#observacion-item-evento-observacion-item-elaborada-por-asesor-ficha-consultada)
  - Consultar Observacion Item de su Ficha Perfil

- Comandos posteriores:
  - [Remover Observacion Evaluacion](#observacion-item-accion-remover-observacion-evaluacion)
  - [Consultar Observacion Item Elaboradas](#observacion-item-accion-consultar-observacion-item-elaboradas)
  - [Consultar Observacion Item de su Ficha Perfil](#observacion-item-accion-consultar-observacion-item-de-su-ficha-perfil)

<a id="observacion-item-accion-remover-observacion-evaluacion"></a>
#### Remover Observacion Evaluacion

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite a el representante comite curricullum remover las observaciones de Observacion Evaluacion que haya realizado

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que fue asignada a observacion evaluacion

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Evaluacion Removida](#observacion-item-evento-observacion-evaluacion-removida)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - Agregar Observacion Item
  - Modificar Observacion Evaluacion
  - Consultar Observacion Item Elaboradas

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="observacion-item-accion-consultar-observacion-item-de-su-ficha-perfil"></a>
#### Consultar Observacion Item de su Ficha Perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite aplicar criterios de busqueda para la información de una Observacion Item para validar su existencia

- Información externa / Read model:
  - Información Evaluacion Ficha Perfil: Corresponde a la evaluacion ficha perfil que tiene observacion evaluacion para aplicar filtros de busqueda

- Políticas:
  - ObservacionEvaluacion-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Observacion Item de su Ficha Perfil Consultada](#observacion-item-evento-observacion-item-de-su-ficha-perfil-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Observacion Evaluacion Agregada](#observacion-item-evento-observacion-evaluacion-agregada)
  - [Observacion Evaluacion Modificada](#observacion-item-evento-observacion-evaluacion-modificada)

- Comandos posteriores:
  - [Modificar Observacion Evaluacion](#observacion-item-accion-modificar-observacion-evaluacion)
  - [Remover Observacion Evaluacion](#observacion-item-accion-remover-observacion-evaluacion)

### Eventos
- [Observacion Evaluacion Agregada](#observacion-item-evento-observacion-evaluacion-agregada)
- [Observacion Item Elaborada por Asesor Ficha Consultada](#observacion-item-evento-observacion-item-elaborada-por-asesor-ficha-consultada)
- [Observacion Evaluacion Modificada](#observacion-item-evento-observacion-evaluacion-modificada)
- [Observacion Evaluacion Removida](#observacion-item-evento-observacion-evaluacion-removida)
- [Observacion Item de su Ficha Perfil Consultada](#observacion-item-evento-observacion-item-de-su-ficha-perfil-consultada)

<a id="observacion-item-evento-observacion-evaluacion-agregada"></a>
#### Observacion Evaluacion Agregada

- Producido por:
  - [Agregar Observacion Item](#observacion-item-accion-agregar-observacion-item)

- Referenciado como previo en:
  - [Consultar Observacion Item Elaboradas](#observacion-item-accion-consultar-observacion-item-elaboradas)
  - [Modificar Observacion Evaluacion](#observacion-item-accion-modificar-observacion-evaluacion)
  - [Consultar Observacion Item de su Ficha Perfil](#observacion-item-accion-consultar-observacion-item-de-su-ficha-perfil)

<a id="observacion-item-evento-observacion-item-elaborada-por-asesor-ficha-consultada"></a>
#### Observacion Item Elaborada por Asesor Ficha Consultada

- Producido por:
  - [Consultar Observacion Item Elaboradas](#observacion-item-accion-consultar-observacion-item-elaboradas)

- Referenciado como previo en:
  - [Modificar Observacion Evaluacion](#observacion-item-accion-modificar-observacion-evaluacion)

<a id="observacion-item-evento-observacion-evaluacion-modificada"></a>
#### Observacion Evaluacion Modificada

- Producido por:
  - [Modificar Observacion Evaluacion](#observacion-item-accion-modificar-observacion-evaluacion)

- Referenciado como previo en:
  - [Consultar Observacion Item Elaboradas](#observacion-item-accion-consultar-observacion-item-elaboradas)
  - [Consultar Observacion Item de su Ficha Perfil](#observacion-item-accion-consultar-observacion-item-de-su-ficha-perfil)

<a id="observacion-item-evento-observacion-evaluacion-removida"></a>
#### Observacion Evaluacion Removida

- Producido por:
  - [Remover Observacion Evaluacion](#observacion-item-accion-remover-observacion-evaluacion)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

<a id="observacion-item-evento-observacion-item-de-su-ficha-perfil-consultada"></a>
#### Observacion Item de su Ficha Perfil Consultada

- Producido por:
  - [Consultar Observacion Item de su Ficha Perfil](#observacion-item-accion-consultar-observacion-item-de-su-ficha-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="representantecomitecurriculum"></a>
## RepresentanteComiteCurriculum

Objeto de dominio: RepresentanteComiteCurriculum

### Acciones
- [Consultar información Representante Comite Curriculum](#representantecomitecurriculum-accion-consultar-informacion-representante-comite-curriculum)

<a id="representantecomitecurriculum-accion-consultar-informacion-representante-comite-curriculum"></a>
#### Consultar información Representante Comite Curriculum

- Actores:
  - Asesor Ficha
  - Estudiante
  - Representante Comite Curriculum

- Descripción:
  - Permite aplicar criterios de búsqueda para consultar la información de un Representante Comite Curriculum

- Información externa / Read model:
  - No se encontraron read models o información externa.

- Políticas:
  - RepresentanteComiteCurricullum-POL-01: Asegurar que los datos que fueron enviados como filtro para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Representante Comite Curricullum consultado](#representantecomitecurriculum-evento-representante-comite-curricullum-consultado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Representante Comite Curricullum consultado](#representantecomitecurriculum-evento-representante-comite-curricullum-consultado)

<a id="representantecomitecurriculum-evento-representante-comite-curricullum-consultado"></a>
#### Representante Comite Curricullum consultado

- Producido por:
  - [Consultar información Representante Comite Curriculum](#representantecomitecurriculum-accion-consultar-informacion-representante-comite-curriculum)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="revision-item"></a>
## Revision Item

Objeto de dominio: Revision Item

### Acciones
- [Agregar Revision Item](#revision-item-accion-agregar-revision-item)
- [Consultar Revision Item Elaboradas](#revision-item-accion-consultar-revision-item-elaboradas)
- [Modificar Revision Item](#revision-item-accion-modificar-revision-item)
- [Remover Revision Item](#revision-item-accion-remover-revision-item)
- [Consultar Revision Item de su Ficha Perfil](#revision-item-accion-consultar-revision-item-de-su-ficha-perfil)

<a id="revision-item-accion-agregar-revision-item"></a>
#### Agregar Revision Item

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite agregar información importante para una Revision de un item, para ser visualizada y cuestionada por los estudiantes

- Información externa / Read model:
  - Información Item: Corresponde a el item que se le va a asignar a una revision item
  - Información Estado Revisión: Corresponde a el Estado Item que se le va a asignar a una revision item

- Políticas:
  - RevisionItem-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - RevisionItem-POL-02: Asegurar que no exista otra Revision Item para el mismo item

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Revision Item Agregado](#revision-item-evento-revision-item-agregado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - [Consultar Revision Item Elaboradas](#revision-item-accion-consultar-revision-item-elaboradas)
  - [Modificar Revision Item](#revision-item-accion-modificar-revision-item)
  - [Consultar Revision Item de su Ficha Perfil](#revision-item-accion-consultar-revision-item-de-su-ficha-perfil)
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)

<a id="revision-item-accion-consultar-revision-item-elaboradas"></a>
#### Consultar Revision Item Elaboradas

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite aplicar criterios de busqueda para la información de una Revision Item que ha elaborado un Asesor Ficha para validar su existencia

- Información externa / Read model:
  - Información Item: Corresponde a el Item que tiene Revision Item para aplicar filtros de busqueda
  - Información Estado Revisión: Corresponde a el Estado Revision que tiene Revision Item para aplicar filtros de busqueda

- Políticas:
  - RevisionItem-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Revision Item Elaborada por Asesor Ficha Consultada](#revision-item-evento-revision-item-elaborada-por-asesor-ficha-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Revision Item Agregado](#revision-item-evento-revision-item-agregado)
  - [Revision Item Modificado](#revision-item-evento-revision-item-modificado)

- Comandos posteriores:
  - [Modificar Revision Item](#revision-item-accion-modificar-revision-item)
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)

<a id="revision-item-accion-modificar-revision-item"></a>
#### Modificar Revision Item

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite Modificar información de una Revision Item para ser visualizada por los usuarios

- Información externa / Read model:
  - Información Item: Corresponde al item que se le asigno a Revision Item
  - Información Estado Revisión: Corresponde al Estado Revision que se le va a asignar o modificar a Revision Item

- Políticas:
  - RevisionItem-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - RevisionItem-POL-02: Asegurar que no exista otra Revision Item para el mismo item

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Revision Item Modificado](#revision-item-evento-revision-item-modificado)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Revision Item Agregado](#revision-item-evento-revision-item-agregado)
  - Consultar Revision Item Elaboradas
  - Consultar Revision Item de su Ficha Perfil

- Comandos posteriores:
  - [Consultar Revision Item Elaboradas](#revision-item-accion-consultar-revision-item-elaboradas)
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)
  - [Consultar Revision Item de su Ficha Perfil](#revision-item-accion-consultar-revision-item-de-su-ficha-perfil)

<a id="revision-item-accion-remover-revision-item"></a>
#### Remover Revision Item

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite a el Asesor Ficha remover las Revisiones Item que haya realizado

- Información externa / Read model:
  - Información Item: Corresponde al item que fue asignado a Revision Item
  - Información Estado Revisión: Corresponde al estado revision que fue asignado a Revision Item
  - Información Observacion Item: Corresponde a las observaciones item que fueron asignados a Revision Item

- Políticas:
  - RevisionItem-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.
  - RevisionItem-POL-03: Asegurar que las observaciones item pertenecientes a Revision Item sean removidos junto a Revision Item

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Revision Item Removido](#revision-item-evento-revision-item-removido)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Revision Item Agregado](#revision-item-evento-revision-item-agregado)
  - [Revision Item Removido](#revision-item-evento-revision-item-removido)
  - Consultar Revision Item de su Ficha Perfil
  - [Revision Item Elaborada por Asesor Ficha Consultada](#revision-item-evento-revision-item-elaborada-por-asesor-ficha-consultada)

- Comandos posteriores:
  - No se encontraron comandos posteriores.

<a id="revision-item-accion-consultar-revision-item-de-su-ficha-perfil"></a>
#### Consultar Revision Item de su Ficha Perfil

- Actores:
  - Estudiante

- Descripción:
  - Permite aplicar criterios de busqueda para la información de una Revision Item para validar su existencia

- Información externa / Read model:
  - Información Item: Corresponde a el Item que tiene Revision Item para aplicar filtros de busqueda
  - Información Estado Revisión: Corresponde a el Estado Revision que tiene Revision Item para aplicar filtros de busqueda

- Políticas:
  - RevisionItem-POL-01: Asegurar que los datos requeridos para llevar a cabo la acción sean válidos a nivel de tipo de dato, longitud, obligatoriedad, formato y rango.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Revision Item de su Ficha Perfil Consultada](#revision-item-evento-revision-item-de-su-ficha-perfil-consultada)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - [Revision Item Agregado](#revision-item-evento-revision-item-agregado)
  - [Revision Item Modificado](#revision-item-evento-revision-item-modificado)

- Comandos posteriores:
  - [Modificar Revision Item](#revision-item-accion-modificar-revision-item)
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)

### Eventos
- [Revision Item Agregado](#revision-item-evento-revision-item-agregado)
- [Revision Item Elaborada por Asesor Ficha Consultada](#revision-item-evento-revision-item-elaborada-por-asesor-ficha-consultada)
- [Revision Item Modificado](#revision-item-evento-revision-item-modificado)
- [Revision Item Removido](#revision-item-evento-revision-item-removido)
- [Revision Item de su Ficha Perfil Consultada](#revision-item-evento-revision-item-de-su-ficha-perfil-consultada)

<a id="revision-item-evento-revision-item-agregado"></a>
#### Revision Item Agregado

- Producido por:
  - [Agregar Revision Item](#revision-item-accion-agregar-revision-item)

- Referenciado como previo en:
  - [Consultar Revision Item Elaboradas](#revision-item-accion-consultar-revision-item-elaboradas)
  - [Modificar Revision Item](#revision-item-accion-modificar-revision-item)
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)
  - [Consultar Revision Item de su Ficha Perfil](#revision-item-accion-consultar-revision-item-de-su-ficha-perfil)

<a id="revision-item-evento-revision-item-elaborada-por-asesor-ficha-consultada"></a>
#### Revision Item Elaborada por Asesor Ficha Consultada

- Producido por:
  - [Consultar Revision Item Elaboradas](#revision-item-accion-consultar-revision-item-elaboradas)

- Referenciado como previo en:
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)

<a id="revision-item-evento-revision-item-modificado"></a>
#### Revision Item Modificado

- Producido por:
  - [Modificar Revision Item](#revision-item-accion-modificar-revision-item)

- Referenciado como previo en:
  - [Consultar Revision Item Elaboradas](#revision-item-accion-consultar-revision-item-elaboradas)
  - [Consultar Revision Item de su Ficha Perfil](#revision-item-accion-consultar-revision-item-de-su-ficha-perfil)

<a id="revision-item-evento-revision-item-removido"></a>
#### Revision Item Removido

- Producido por:
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)

- Referenciado como previo en:
  - [Remover Revision Item](#revision-item-accion-remover-revision-item)

<a id="revision-item-evento-revision-item-de-su-ficha-perfil-consultada"></a>
#### Revision Item de su Ficha Perfil Consultada

- Producido por:
  - [Consultar Revision Item de su Ficha Perfil](#revision-item-accion-consultar-revision-item-de-su-ficha-perfil)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---

<a id="tipo-item"></a>
## Tipo Item

Objeto de dominio: Tipo Item

### Acciones
- [Consultar todos los tipo item disponibles](#tipo-item-accion-consultar-todos-los-tipo-item-disponibles)

<a id="tipo-item-accion-consultar-todos-los-tipo-item-disponibles"></a>
#### Consultar todos los tipo item disponibles

- Actores:
  - Asesor Ficha

- Descripción:
  - Permite conocer los Tipos que pueden ser asignados a un item, perteneciente a una ficha de perfil.

- Información externa / Read model:
  - No se encontraron read models o información externa.

- Políticas:
  - No se encontraron políticas.

- Sistemas externos:
  - No se encontraron sistemas externos.

- Evento(s):
  - [Todos los tipo item consultados](#tipo-item-evento-todos-los-tipo-item-consultados)

- Aspectos por solucionar:
  - No se encontraron aspectos por solucionar.

- Eventos previos:
  - No se encontraron eventos previos.

- Comandos posteriores:
  - No se encontraron comandos posteriores.

### Eventos
- [Todos los tipo item consultados](#tipo-item-evento-todos-los-tipo-item-consultados)

<a id="tipo-item-evento-todos-los-tipo-item-consultados"></a>
#### Todos los tipo item consultados

- Producido por:
  - [Consultar todos los tipo item disponibles](#tipo-item-accion-consultar-todos-los-tipo-item-disponibles)

- Referenciado como previo en:
  - No se encontraron acciones que lo referencien como previo.

---
