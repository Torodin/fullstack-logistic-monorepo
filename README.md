# FullstackLogisticWrk

## Objetivos
- [ ] API Rest con NestJS y PostgreSQL
    - [ ] Autenticación por roles con JWT
    - [ ] Gestión de envíos
    - [ ] Tracking publico de envíos
    - [ ] Asignación de carga
    - [ ] Swagger*
- [ ] Front angular
    - [ ] Login
    - [ ] Registro
    - [ ] Envíos
        - [ ] Exportar a csv*
    - [ ] Detalle envío
    - [ ] Tracking publico
    - [ ] Asignación de vehículos*
    - [ ] Dashboard supervisor*
- [ ] Docker compose*
- [ ] GitHub actions (lint y test)*

## Modelo de datos

```mermaid
erDiagram
    Estado {
        string Name
    }
    Envio {
        string Codigo_Seguimiento pk
        string Origen
        string Destino
        string Destinatario
        string Telefono
        string Peso
        string Estado
        string Fecha_de_entrega
        string Eventos
    }
    Evento {
        string EventId pk
        string Fecha
        string Usuario
        string Ubicacion
        string Notas
    }
    User {
        string UserId pk
        string Name
        string Email_Address
        string Password
        string Rol
    }
    Rol {
        string Name
    }

    Estado ||--o{ Envio : "is"
    Envio ||--|{ Evento : "change"
    Evento |o--o{ User : "generate"
    Rol ||--o{ User : "is"
```

## Decisiones

- En un primer momento pensé en crear el monorepo con turborepo por costumbre, pero al encontrar algunas dificultades integrando nestjs con angular, cambié a nx como gestor.
- Uso Prisma por familiaridad y por su gran experiencia de desarrollo junto a PostgreSQL.
