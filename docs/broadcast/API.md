# API

Base URL: `/api/v1`. All endpoints require a Super Admin bearer token (or the
httpOnly cookie) and are documented in Swagger (`/docs`).

**Authorization:** every controller uses
`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.SUPER_ADMIN)`. A
non–Super Admin receives `403` regardless of the UI.

Responses use the global envelope:

```json
{ "success": true, "statusCode": 200, "path": "...", "timestamp": "...", "data": { } }
```

Paginated responses put `{ data, meta: { total, page, limit, totalPages } }`
inside `data`.

## Templates — `/super-admin/broadcast/templates`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List templates. Query: `page`, `limit`, `status`, `category`, `search` |
| GET | `/:id` | Get one template |
| POST | `/` | Create template |
| PATCH | `/:id` | Update template |
| PATCH | `/:id/status` | Change status (`DRAFT`/`ACTIVE`/`ARCHIVED`) |
| DELETE | `/:id` | Delete template |

Create body:

```json
{
  "name": "Flash Sale Template",
  "description": "Weekly flash sale",
  "language": "bn",
  "category": "MARKETING",
  "body": "হ্যালো {{customer_name}}, {{discount}}% ছাড়!",
  "variables": [{ "key": "customer_name" }, { "key": "discount" }],
  "status": "DRAFT"
}
```

Errors: `400` malformed variables / undeclared variables / validation, `404`
template not found.

## Audience — `/super-admin/broadcast/audience`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/segments` | Segment sizes + consent overview |
| GET | `/customers` | Search customers (`search`, `limit`) |
| POST | `/preview` | Preview recipient count + sample |

Preview body:

```json
{ "audienceType": "ACTIVE_CUSTOMERS", "audienceConfig": { "inactiveDays": 30, "isOptInRequired": true } }
```

## Campaigns — `/super-admin/broadcast/campaigns`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List campaigns. Query: `page`, `limit`, `status`, `audienceType`, `search`, `from`, `to`, `sortBy`, `sortOrder` |
| GET | `/:id` | Campaign detail |
| POST | `/` | Create draft (or scheduled when `scheduledAt` is set) |
| PATCH | `/:id` | Update draft/scheduled campaign |
| POST | `/:id/test` | Send a simulated test message |
| POST | `/:id/send` | Resolve audience and start sending |
| POST | `/:id/cancel` | Cancel a draft/scheduled campaign |
| GET | `/:id/stats` | Delivery counters |
| GET | `/:id/recipients` | Paginated recipient list (`page`, `limit`, `status`, `search`) |

Create body:

```json
{
  "title": "Eid Flash Sale",
  "templateId": "uuid",
  "audienceType": "ALL_CUSTOMERS",
  "audienceConfig": { "isOptInRequired": true, "variables": { "discount": "20" } },
  "scheduledAt": "2026-10-05T10:00:00.000Z"
}
```

Test body:

```json
{ "phone": "+8801700000000", "variables": { "discount": "20" } }
```

Stats response `data`:

```json
{
  "totalRecipients": 120, "pending": 0, "queued": 8, "sending": 2,
  "sent": 90, "delivered": 18, "read": 0, "failed": 2, "simulated": true
}
```

## Common errors

| Status | Meaning |
| --- | --- |
| 400 | Validation failure, invalid state transition, no eligible recipients, past schedule |
| 401 | Missing/invalid token |
| 403 | Not a Super Admin |
| 404 | Campaign / template not found |
| 503 | WhatsApp provider selected but not implemented |

## Notes

- `simulated: true` on campaign/stats responses while the mock provider is
  active. The UI surfaces this; do not present it as real delivery.
- Audit actions: `BROADCAST_CREATED`, `BROADCAST_UPDATED`, `BROADCAST_SCHEDULED`,
  `BROADCAST_STARTED`, `BROADCAST_CANCELLED`, `BROADCAST_COMPLETED`,
  `BROADCAST_FAILED`, `BROADCAST_TEST_SENT`, and
  `BROADCAST_TEMPLATE_CREATED/UPDATED/DELETED`.
