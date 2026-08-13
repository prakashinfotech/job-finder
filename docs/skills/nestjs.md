# NestJS Skills — Booking.com Clone
_Read before writing any NestJS module. These rules override NestJS defaults._

---

## 1. Module Structure

Every domain module follows this exact layout:

```
backend/src/<domain>/
├── <domain>.module.ts
├── <domain>.controller.ts
├── <domain>.service.ts
├── <domain>.entity.ts        (if the module owns a DB table)
├── dto/
│   ├── create-<domain>.dto.ts
│   └── <domain>-query.dto.ts  (if the module has filtered GET endpoints)
└── guards/                    (if the module owns a guard)
    └── <guard>.guard.ts
```

Rules:
- File names: **kebab-case** always (`hotel.entity.ts`, not `HotelEntity.ts`)
- One class per file, one public method per service method
- Barrel exports (`index.ts`) are **not** used in backend — import directly

---

## 2. Entity Patterns

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Exclude } from 'class-transformer'

@Entity('table_name')
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  @Exclude()           // Sensitive fields — NEVER expose in responses
  sensitiveField: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

- `passwordHash` is always `@Exclude()` — the `ClassSerializerInterceptor` in `main.ts` enforces this
- Use `@PrimaryGeneratedColumn('uuid')` for all auto-generated PKs
- Use `@PrimaryColumn()` for entities whose PK comes from external data (e.g. hotel slugs)
- `synchronize: false` — never add `synchronize: true` to TypeORM config; use migrations instead

---

## 3. DTO Conventions

```typescript
import { IsEmail, IsString, IsOptional, IsNumber, Min, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryHotelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destination?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number
}
```

Rules:
- All DTO fields that are optional: `@IsOptional()` + `?` on the type
- No `any` — use specific class-validator decorators
- `ValidationPipe({ whitelist: true, transform: true })` strips undeclared fields and coerces types
- Query DTOs use `@Type(() => Number)` from `class-transformer` for numeric query params

---

## 4. Controller Patterns

```typescript
import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { Request } from 'express'

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(@Query() query: QueryHotelDto) {
    return this.hotelsService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id)
  }
}
```

Rules:
- Every controller class has `@ApiTags('domain')`
- Protected endpoints add `@ApiBearerAuth()` and `@UseGuards(JwtAuthGuard)`
- No business logic in controllers — delegate entirely to the service
- `@HttpCode(HttpStatus.OK)` on POST endpoints that return 200 (not 201)

---

## 5. Service Patterns

```typescript
@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepo: Repository<Hotel>,
  ) {}

  async findAll(query: QueryHotelDto): Promise<Hotel[]> {
    const qb = this.hotelRepo.createQueryBuilder('hotel')

    if (query.destination) {
      qb.andWhere('LOWER(hotel.city) LIKE :dest', { dest: `%${query.destination.toLowerCase()}%` })
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('hotel.pricePerNight >= :min', { min: query.minPrice })
    }
    // Only add WHERE clauses for defined values — never andWhere() on undefined

    return qb.getMany()
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepo.findOne({ where: { id } })
    if (!hotel) throw new NotFoundException(`Hotel ${id} not found`)
    return hotel
  }
}
```

Rules:
- One public method per service responsibility (`findAll`, `findOne`, `create`, `cancel`)
- **Never** add `andWhere()` for values that are `undefined` — check first
- Use `NotFoundException` from `@nestjs/common` (not raw DB errors)
- Use `ConflictException` for duplicate email on register (not raw `23505` DB error)
- Use `UnauthorizedException('Invalid credentials')` for login failures — same message for both bad email and bad password

---

## 6. Authentication Architecture

### Token strategy
| Token | Expiry | Transport | Storage |
|-------|--------|-----------|---------|
| Access | 15 min | Response body `{ accessToken }` | Zustand memory only |
| Refresh | 7 days | `Set-Cookie: refreshToken` (httpOnly) | Browser cookie only |

### Guards
```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Apply with `@UseGuards(JwtAuthGuard)` — never inline guard logic in controllers.

### JWT Strategy validation
```typescript
async validate(payload: JwtPayload): Promise<User> {
  const user = await this.usersService.findById(payload.sub)
  if (!user) throw new UnauthorizedException()
  return user   // Attached to req.user — never expose passwordHash
}
```

---

## 7. Exception Filter

The global `HttpExceptionFilter` must return this exact shape for all errors:
```json
{
  "statusCode": 404,
  "message": "Hotel abc not found",
  "path": "/hotels/abc",
  "timestamp": "2026-04-25T12:00:00.000Z"
}
```

Registered in `main.ts` via `app.useGlobalFilters(new HttpExceptionFilter())`.

---

## 8. Global Setup (main.ts checklist)

```typescript
app.use(compression())
app.use(cookieParser())
app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true })
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
app.useGlobalFilters(new HttpExceptionFilter())
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
// Swagger mounted at /api/docs
```

Order matters: compression → cookieParser → CORS → pipes → filters → interceptors.

---

## 9. Environment Variables (Joi schema)

All variables validated at startup in `config/config.ts`. Schema must cover:
- `NODE_ENV`, `PORT`, `DATABASE_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_EXPIRY` (default `'15m'`), `JWT_REFRESH_EXPIRY` (default `'7d'`)
- `FRONTEND_URL` (default `'http://localhost:5173'`)

Throw on startup if any required variable is missing — do not have silent fallbacks for secrets.

---

## 10. Seed Script

`backend/src/database/seeds/hotels.seed.ts` runs as a standalone ts-node script, **not** as a NestJS module:

```typescript
import { DataSource } from 'typeorm'
// Reproduce all 12 hotels from src/data/mock-hotels.ts exactly
// Same id values, names, images, cities — used for local dev and AWS seed task
```

Run via: `npm run seed` (uses ts-node, not NestJS CLI).