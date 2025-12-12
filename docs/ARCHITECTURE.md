# Architecture Documentation

## System Overview

SinBullying is a full-stack web application for managing bullying reports in educational institutions.

## Tech Stack

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling
- **React Router**: Client-side routing
- **React Hook Form + Zod**: Form validation
- **i18next**: Internationalization

### Backend (Serverless)
- **Vercel Functions**: API endpoints
- **Vercel Postgres**: Database (PostgreSQL)
- **Vercel Blob**: File storage
- **Resend**: Email notifications

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  React App + PWA + Service Worker                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Vercel Edge Network                        │
│  - Static Assets (CDN)                                  │
│  - API Routes (Serverless Functions)                    │
└─────────┬───────────────────────┬─────────────┬─────────┘
          │                       │             │
          │                       │             │
  ┌───────▼────────┐    ┌────────▼──────┐  ┌──▼─────────┐
  │ Vercel Postgres│    │  Vercel Blob  │  │   Resend   │
  │   (Database)   │    │  (File Store) │  │  (Email)   │
  └────────────────┘    └───────────────┘  └────────────┘
```

## Database Schema

### Tables

#### `casos` (Cases)
```sql
CREATE TABLE casos (
  id SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  gravedad VARCHAR(20) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) DEFAULT 'pendiente',
  anonimo BOOLEAN DEFAULT false,
  email_reportante VARCHAR(255),
  nombre_reportante VARCHAR(255),
  tecnico_asignado VARCHAR(255),
  notas_tecnico TEXT,
  archivos_urls TEXT[]
);
```

#### `audit_logs` (Audit Trail)
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB
);
```

## API Endpoints

### Public Endpoints
- `POST /api/casos` - Create new report
- `GET /api/setup` - Initialize database (one-time)

### Authenticated Endpoints
- `GET /api/casos` - List all cases (admin/technician)
- `GET /api/casos/:id` - Get case details
- `PUT /api/casos/:id` - Update case
- `DELETE /api/casos/:id` - Delete case (admin only)
- `POST /api/casos/:id/assign` - Assign technician

### File Handling
- `POST /api/upload` - Upload evidence files
- `GET /api/files/:id` - Retrieve file (authenticated)

## Security

### Authentication & Authorization
- Email-based authentication (magic links)
- Role-based access control (Student, Technician, Admin)
- Email pattern matching for admin detection

### Data Protection
- HTTPS enforced
- Security headers (CSP, HSTS, etc.)
- Rate limiting on API endpoints
- Input sanitization
- File upload validation
- Audit logging

### Privacy
- Anonymous reporting option
- GDPR compliance considerations
- Data retention policies (to be implemented)
- Secure file storage with access controls

## Performance Optimizations

### Frontend
- Code splitting and lazy loading
- Image compression
- PWA with offline support
- Optimized bundle size

### Backend
- Edge computing (Vercel)
- Database connection pooling
- File CDN delivery
- Efficient queries with indexes

## Deployment

### Continuous Integration
- GitHub Actions for CI/CD
- Automated testing (unit + E2E)
- Code quality checks (linting, formatting)
- Security scanning

### Environments
- **Production**: `main` branch → Vercel production
- **Staging**: `develop` branch → Vercel preview
- **Local**: Development environment

## Monitoring & Observability

### Logs
- Application logs via Vercel
- Audit logs in database
- Error tracking (to be implemented: Sentry)

### Metrics
- Vercel Analytics
- Custom metrics dashboard (to be implemented)

### Alerts
- Email notifications for new reports
- System error alerts (to be implemented)

## Future Enhancements

1. **Real-time features**: WebSocket/SSE for live updates
2. **Advanced analytics**: ML-based pattern detection
3. **Mobile apps**: Native iOS/Android apps
4. **Integration APIs**: Connect with school management systems
5. **Advanced reporting**: PDF generation, export features
6. **Enhanced privacy**: End-to-end encryption
