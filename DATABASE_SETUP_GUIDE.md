# Database Setup Guide - Neon PostgreSQL & SQLite

## Overview

The tourism backend now supports **dual-database configuration**:
- **Development**: SQLite (file-based, no setup required)
- **Production**: Neon PostgreSQL (cloud-hosted, automatic failover)

---

## 🏗️ Architecture

### Development Environment
```
Local Machine
    ↓
    .env (no DATABASE_URL)
    ↓
settings.py checks DATABASE_URL
    ↓
    DATABASE_URL not set → Use SQLite
    ↓
db.sqlite3 (local file)
```

### Production Environment
```
Render/Other Platform
    ↓
    .env (with DATABASE_URL set)
    ↓
settings.py checks DATABASE_URL
    ↓
    DATABASE_URL set → Use PostgreSQL
    ↓
Neon PostgreSQL (Cloud)
    postgresql://neondb_owner:npg_nMBCU9QWbu2f@ep-fancy-brook-anr1mbpg.c-6.us-east-1.aws.neon.tech/neondb
```

---

## 📋 Configuration Details

### New Dependencies Added

**File**: `requirements.txt`

```
dj-database-url==2.1.0      # Parse DATABASE_URL
psycopg2-binary==2.9.9      # PostgreSQL adapter for Python
```

**Installation**:
```bash
cd backend
pip install -r requirements.txt
```

### Settings.py Changes

**File**: `tourism_backend/settings.py` (Lines 105-125)

```python
# Database
# Use PostgreSQL (Neon) in production, SQLite in development

DATABASE_URL = os.getenv('DATABASE_URL', None)

if DATABASE_URL:
    # Production: PostgreSQL with Neon
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Development: SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

**Key Features**:
- ✅ Automatic detection based on `DATABASE_URL` env variable
- ✅ Connection pooling (600s max age)
- ✅ Health checks enabled
- ✅ Falls back to SQLite if no DATABASE_URL

### .env Configuration

**File**: `.env`

**Development** (current setup):
```
# Leave DATABASE_URL commented for local development
# DATABASE_URL=postgresql://...
```

**Production** (when deploying):
```
DATABASE_URL=postgresql://neondb_owner:npg_nMBCU9QWbu2f@ep-fancy-brook-anr1mbpg.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🚀 Usage Guide

### Development (Local)

1. **Ensure DATABASE_URL is NOT set in .env**:
   ```
   # .env (do NOT uncomment)
   # DATABASE_URL=postgresql://...
   ```

2. **Run migrations**:
   ```bash
   cd backend
   python manage.py migrate
   ```

3. **Create superuser** (first time):
   ```bash
   python manage.py createsuperuser
   ```

4. **Verify SQLite is being used**:
   ```bash
   python manage.py shell
   >>> from django.conf import settings
   >>> settings.DATABASES['default']
   # Should show: 'ENGINE': 'django.db.backends.sqlite3'
   ```

---

### Production (Neon PostgreSQL)

1. **Set DATABASE_URL in production environment**:
   
   **On Render (or your hosting platform)**:
   - Go to Environment Variables
   - Add new variable:
     ```
     Key: DATABASE_URL
     Value: postgresql://neondb_owner:npg_nMBCU9QWbu2f@ep-fancy-brook-anr1mbpg.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require
     ```

2. **Deploy code** (git push or redeploy):
   ```bash
   git push origin main
   # Or manually trigger redeploy on Render
   ```

3. **Run migrations** (after deployment):
   ```bash
   # Option 1: Via Render shell/console
   python manage.py migrate
   
   # Option 2: Via Management Command
   # Add a custom deployment script if needed
   ```

4. **Verify PostgreSQL is being used**:
   ```python
   # Via Django admin or shell
   from django.conf import settings
   settings.DATABASES['default']
   # Should show: 'ENGINE': 'django.db.backends.postgresql'
   ```

---

## 🔄 Migration Strategy

### Initial Migrations (Development)

When you first run migrations in development:
```bash
python manage.py migrate
```

This creates the SQLite database with all tables.

### Migrating to Production

**IMPORTANT**: Before moving to production, you should:

1. **Create initial data** (if needed):
   - Run seeds/fixtures
   - Create superuser account

2. **Test migrations on staging** (if available):
   ```bash
   # Test with a staging PostgreSQL database first
   ```

3. **Backup current SQLite database** (optional):
   ```bash
   cp backend/db.sqlite3 backend/db.sqlite3.backup
   ```

4. **Deploy with DATABASE_URL set**:
   - Set environment variable on Render
   - The same migrations will run on PostgreSQL

5. **Verify data**:
   - Check admin panel
   - Verify API endpoints return data
   - Monitor logs for errors

---

## 🛠️ Troubleshooting

### Issue: "psycopg2 not found" error

**Solution**:
```bash
pip install psycopg2-binary==2.9.9
# OR if using macOS with M1/M2:
pip install psycopg2-binary
```

### Issue: "dj_database_url not found"

**Solution**:
```bash
pip install dj-database-url==2.1.0
```

### Issue: Connection refused to Neon database

**Causes**:
- DATABASE_URL is incorrect
- Neon cluster is paused (auto-pauses after inactivity)
- Network firewall blocking connection

**Solutions**:
- Verify DATABASE_URL in environment variables
- Check Neon dashboard - unpause cluster if needed
- Test connection directly:
  ```bash
  psql "postgresql://neondb_owner:npg_nMBCU9QWbu2f@ep-fancy-brook-anr1mbpg.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
  ```

### Issue: SSL certificate verification failed

**Solution**: 
The DATABASE_URL includes `?sslmode=require` which requires SSL. If needed, you can change to:
```
?sslmode=prefer
```

But `?sslmode=require` is more secure (recommended).

### Issue: Database migrations not running in production

**Solution**:
Add a post-deploy script to your hosting platform:

**Render** (`render.yaml` or build command):
```yaml
postDeploy: python manage.py migrate
```

Or manually via Render shell:
```bash
python manage.py migrate
```

---

## 📊 Database Comparison

| Feature | SQLite (Dev) | PostgreSQL/Neon (Prod) |
|---------|--------------|------------------------|
| **Storage** | Local file | Cloud-hosted |
| **Concurrency** | Limited | High |
| **Scalability** | Single machine | Unlimited |
| **Backup** | Manual | Automatic |
| **Cost** | Free | Free tier available |
| **Setup** | None | Neon account |
| **Performance** | Good for dev | Optimized |

---

## ✅ Verification Checklist

### Development Setup
- [ ] `pip install -r requirements.txt` completed
- [ ] `.env` file has no `DATABASE_URL` (or it's commented)
- [ ] `python manage.py migrate` runs successfully
- [ ] `db.sqlite3` exists in `backend/` folder
- [ ] Django admin works (`/admin`)
- [ ] API endpoints work (`/api/...`)

### Production Setup
- [ ] `DATABASE_URL` environment variable set on Render
- [ ] Value is correct Neon connection string
- [ ] Code deployed to production
- [ ] Post-deploy script runs migrations automatically
- [ ] Django admin accessible
- [ ] API endpoints returning data
- [ ] No database errors in logs

---

## 🔐 Security Notes

1. **Never commit DATABASE_URL** to git:
   - Keep it only in `.env` (not committed)
   - Or in platform environment variables

2. **Use SSL mode** (already configured):
   - `?sslmode=require` ensures encrypted connection

3. **Neon credentials**:
   - Keep credentials private
   - Don't share DATABASE_URL publicly
   - Rotate credentials if compromised

4. **Backups**:
   - Neon provides automatic backups
   - Configure retention policy in Neon dashboard
   - Test restore procedures

---

## 📚 Reference Links

- [dj-database-url documentation](https://github.com/jazzband/dj-database-url)
- [psycopg2 documentation](https://www.psycopg.org/)
- [Neon PostgreSQL documentation](https://neon.tech/docs)
- [Django Database Documentation](https://docs.djangoproject.com/en/6.0/ref/settings/#databases)

---

## 🎯 Next Steps

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Verify local development works**:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

3. **When ready for production**:
   - Add `DATABASE_URL` to Render environment variables
   - Push code
   - Monitor logs for any issues

---

**Last Updated**: April 21, 2026  
**Database Engine**: PostgreSQL 15+ (Neon)  
**Driver**: psycopg2-binary 2.9.9
