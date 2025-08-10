# PocketBase Setup and Admin Account Configuration

## Issue Description

The default PocketBase username and password (`admin@stocknear.com` / `admin123`) won't work because **PocketBase requires manual initialization** when running for the first time. The environment variables `POCKETBASE_ADMIN_EMAIL` and `POCKETBASE_ADMIN_PASSWORD` in the docker-compose.yml are set correctly, but they don't automatically create the admin account.

## Root Cause

When PocketBase runs for the first time, it:
1. Creates an empty database
2. Waits for manual admin account creation
3. Shows an installation URL in the logs
4. Does NOT automatically use environment variables to create the admin account

## Solution

### Method 1: Automated Script (Recommended)

Use the provided setup script:

```bash
# Make sure PocketBase is running
docker-compose up pocketbase -d

# Run the setup script
./scripts/setup-pocketbase-admin.sh
```

### Method 2: Manual Setup

1. **Start PocketBase:**
   ```bash
   docker-compose up pocketbase -d
   ```

2. **Create admin account via CLI:**
   ```bash
   docker exec stocknear-frontend-pocketbase-1 /usr/local/bin/pocketbase --dir /pb_data superuser upsert admin@stocknear.com admin123
   ```

3. **Restart PocketBase:**
   ```bash
   docker restart stocknear-frontend-pocketbase-1
   ```

### Method 3: Web Interface Setup

1. Start PocketBase:
   ```bash
   docker-compose up pocketbase -d
   ```

2. Check the logs for the installation URL:
   ```bash
   docker logs stocknear-frontend-pocketbase-1
   ```

3. Open the installation URL in your browser and create the admin account manually

## Verification

After setup, verify the admin account works:

1. **Check if PocketBase is running:**
   ```bash
   curl -f http://localhost:8090/api/health
   ```

2. **Access the admin panel:**
   - URL: http://localhost:8090/_/
   - Email: admin@stocknear.com
   - Password: admin123

3. **Check logs for success:**
   ```bash
   docker logs stocknear-frontend-pocketbase-1
   ```
   - Should NOT show the installation message
   - Should show "Server started at http://0.0.0.0:8090"

## Configuration Details

### Docker Compose Configuration

```yaml
pocketbase:
  image: elestio/pocketbase:latest
  ports:
    - '8090:8090'
  volumes:
    - pocketbase_data:/pb_data
  environment:
    - POCKETBASE_ADMIN_EMAIL=${POCKETBASE_ADMIN_EMAIL:-admin@stocknear.com}
    - POCKETBASE_ADMIN_PASSWORD=${POCKETBASE_ADMIN_PASSWORD:-admin123}
```

### Environment Variables

- `POCKETBASE_ADMIN_EMAIL`: Admin email (default: admin@stocknear.com)
- `POCKETBASE_ADMIN_PASSWORD`: Admin password (default: admin123)

## Troubleshooting

### Common Issues

1. **"Permission denied" error:**
   - Make sure to use `--dir /pb_data` flag
   - The container runs as non-root user

2. **Admin account not recognized:**
   - Restart PocketBase after creating the account
   - Check logs for installation message disappearance

3. **Container not starting:**
   - Check if port 8090 is available
   - Verify Docker is running

4. **Data persistence issues:**
   - Check volume mount: `docker volume ls | grep pocketbase`
   - Data is stored in `pocketbase_data` volume

### Debugging Commands

```bash
# Check container status
docker ps | grep pocketbase

# View logs
docker logs stocknear-frontend-pocketbase-1

# Check volume data
docker exec stocknear-frontend-pocketbase-1 ls -la /pb_data

# Test admin account creation
docker exec stocknear-frontend-pocketbase-1 /usr/local/bin/pocketbase --dir /pb_data superuser upsert admin@stocknear.com admin123
```

## Integration with Application

The SvelteKit application connects to PocketBase via:

```typescript
// src/lib/pocketbase.ts
import PocketBase from "pocketbase";
let pbUrl = import.meta.env.VITE_USEAST_POCKETBASE_URL;
export const pb = new PocketBase(pbUrl);
```

Environment variable: `VITE_USEAST_POCKETBASE_URL=http://pocketbase:8090`

## Security Notes

- Change default credentials in production
- Use environment variables for sensitive data
- Consider using secrets management for passwords
- Regularly backup the `/pb_data` volume

## Next Steps

After successful setup:

1. Access the admin panel at http://localhost:8090/_/
2. Create collections as needed for your application
3. Configure authentication rules
4. Set up user roles and permissions
5. Test user registration and login functionality
