# StockNear API Key Setup Script

This script automates the API key setup process for the StockNear frontend and backend services to resolve HTTP 403 authentication errors.

## Overview

The script performs the following tasks:
- Generates a secure API key using cryptographic methods
- Updates Docker Compose configurations for both frontend and backend
- Creates/updates environment files (.env)
- Validates the setup and tests API connectivity
- Provides rollback functionality if setup fails

## Prerequisites

- Python 3.7+
- Docker and Docker Compose
- Access to both frontend and backend directories

## Usage

### Basic Setup
```bash
python scripts/setup-api-key.py
```

### Options

- `--force`: Force overwrite of existing configurations
- `--validate-only`: Only validate existing setup without making changes
- `--backup`: Create backup before making changes (default: true)
- `--no-backup`: Skip backup creation

### Examples

```bash
# Basic setup with backup
python scripts/setup-api-key.py

# Force overwrite existing configurations
python scripts/setup-api-key.py --force

# Only validate current setup
python scripts/setup-api-key.py --validate-only

# Setup without backup
python scripts/setup-api-key.py --no-backup
```

## What the Script Does

### 1. API Key Generation
- Generates a 64-character secure random string using Python's `secrets` module
- Ensures cryptographic security for API authentication

### 2. Configuration Updates
- **Frontend docker-compose.yml**: Updates `VITE_STOCKNEAR_API_KEY` environment variable
- **Backend docker-compose.yml**: Adds `STOCKNEAR_API_KEY` environment variable
- **Frontend .env**: Creates comprehensive environment configuration
- **Backend .env**: Creates backend-specific environment configuration

### 3. Validation
- Verifies API key is present in all configuration files
- Tests Docker Compose configuration validity
- Performs API connectivity test with the new key

### 4. Backup and Rollback
- Creates timestamped backup of existing configurations
- Provides automatic rollback if setup fails
- Preserves original configurations for safety

## File Structure

After running the script, you'll have:

```
stocknear-frontend/
├── docker-compose.yml          # Updated with API key
├── .env                        # Created with API configuration
└── backup_api_setup_YYYYMMDD_HHMMSS/
    ├── docker-compose.yml      # Original backup
    └── .env                    # Original backup (if existed)

../stocknear-backend/
├── docker-compose.yml          # Updated with API key
└── .env                        # Created with API configuration
```

## Environment Variables

### Frontend (.env)
```bash
VITE_STOCKNEAR_API_KEY=your_generated_api_key
VITE_USEAST_API_URL=http://fastapi:8000
VITE_USEAST_FASTIFY_URL=http://fastify:2000
NODE_ENV=development
DOCKER_MODE=development
VITE_USEAST_POCKETBASE_URL=http://pocketbase:8090
VITE_USEAST_WS_URL=ws://fastapi:8000
```

### Backend (.env)
```bash
STOCKNEAR_API_KEY=your_generated_api_key
ENVIRONMENT=development
REDIS_HOST=redis
REDIS_PORT=6380
REDIS_DB=0
POCKETBASE_ADMIN_EMAIL=admin@stocknear.com
POCKETBASE_ADMIN_PASSWORD=admin123
FMP_API_KEY=your_fmp_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
STOCK_DB=stocks
ETF_DB=etf
INDEX_DB=index
INSTITUTE_DB=institute
CRYPTO_DB=crypto
```

## Troubleshooting

### Common Issues

1. **Docker Compose not found**
   - Ensure Docker and Docker Compose are installed
   - The script will skip validation if not available

2. **Permission denied**
   - Make sure the script is executable: `chmod +x scripts/setup-api-key.py`
   - Ensure you have write permissions to the project directories

3. **Backup creation fails**
   - The script will continue without backup if creation fails
   - Check disk space and directory permissions

4. **API connectivity test fails**
   - This is not critical for setup completion
   - Services may need time to start up
   - Check Docker service status

### Rollback

If setup fails, the script automatically attempts to rollback changes:

```bash
# Manual rollback (if needed)
python scripts/setup-api-key.py --validate-only
```

## Security Notes

- The generated API key is cryptographically secure
- Backups are created with timestamped directories
- Original configurations are preserved
- API key is stored in environment files (not in version control)

## Next Steps

After successful setup:

1. Start the services:
   ```bash
   docker-compose up
   ```

2. Test the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

3. Verify API calls work without 403 errors

4. Check application logs for any remaining issues

## Support

If you encounter issues:

1. Check the script output for specific error messages
2. Verify Docker and Docker Compose are working
3. Ensure all required directories exist
4. Check file permissions in project directories

The script provides detailed logging to help identify and resolve issues. 