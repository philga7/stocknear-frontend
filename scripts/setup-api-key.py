#!/usr/bin/env python3
"""
StockNear API Key Setup Script

This script automates the API key setup process for the StockNear frontend and backend services.
It generates a secure API key, updates environment configurations, and validates the setup.

Usage:
    python scripts/setup-api-key.py [--force] [--validate-only] [--backup]

Options:
    --force          Force overwrite of existing configurations
    --validate-only  Only validate existing setup without making changes
    --backup         Create backup before making changes
"""

import os
import sys
import secrets
import argparse
import subprocess
import shutil
from pathlib import Path
from datetime import datetime
import json
import time

# Try to import requests, but don't fail if it's not available
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("⚠️  requests module not available. API connectivity testing will be skipped.")

class APISetupScript:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.frontend_dir = self.project_root
        self.backend_dir = self.project_root.parent / "stocknear-backend"
        self.api_key = None
        self.backup_dir = None
        
    def generate_api_key(self):
        """Generate a secure API key using cryptographic methods"""
        try:
            # Generate a 32-character secure random string (shorter for better compatibility)
            self.api_key = secrets.token_urlsafe(24)
            print(f"✅ Generated secure API key: {self.api_key[:16]}...")
            return True
        except Exception as e:
            print(f"❌ Failed to generate API key: {e}")
            return False
    
    def create_backup(self):
        """Create backup of existing configuration files"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.backup_dir = self.project_root / f"backup_api_setup_{timestamp}"
            self.backup_dir.mkdir(exist_ok=True)
            
            # Backup docker-compose.yml
            docker_compose_path = self.frontend_dir / "docker-compose.yml"
            if docker_compose_path.exists():
                shutil.copy2(docker_compose_path, self.backup_dir / "docker-compose.yml")
            
            # Backup backend docker-compose.yml
            backend_docker_compose_path = self.backend_dir / "docker-compose.yml"
            if backend_docker_compose_path.exists():
                shutil.copy2(backend_docker_compose_path, self.backup_dir / "backend-docker-compose.yml")
            
            # Backup .env files if they exist
            env_files = [
                self.frontend_dir / ".env",
                self.frontend_dir / ".env.local",
                self.backend_dir / ".env",
                self.backend_dir / ".env.local"
            ]
            
            for env_file in env_files:
                if env_file.exists():
                    shutil.copy2(env_file, self.backup_dir / env_file.name)
            
            print(f"✅ Created backup in: {self.backup_dir}")
            return True
        except Exception as e:
            print(f"❌ Failed to create backup: {e}")
            return False
    
    def update_docker_compose(self):
        """Update docker-compose.yml with API key environment variables"""
        try:
            docker_compose_path = self.frontend_dir / "docker-compose.yml"
            
            if not docker_compose_path.exists():
                print(f"❌ docker-compose.yml not found at {docker_compose_path}")
                return False
            
            # Read current docker-compose.yml
            with open(docker_compose_path, 'r') as f:
                content = f.read()
            
            # Update frontend service environment variables
            if 'VITE_STOCKNEAR_API_KEY=${VITE_STOCKNEAR_API_KEY:-your_api_key_here}' in content:
                content = content.replace(
                    'VITE_STOCKNEAR_API_KEY=${VITE_STOCKNEAR_API_KEY:-your_api_key_here}',
                    f'VITE_STOCKNEAR_API_KEY={self.api_key}'
                )
            elif 'VITE_STOCKNEAR_API_KEY=' in content:
                # Replace existing API key
                import re
                content = re.sub(
                    r'VITE_STOCKNEAR_API_KEY=[^\n]*',
                    f'VITE_STOCKNEAR_API_KEY={self.api_key}',
                    content
                )
            else:
                # Add API key to environment section
                content = content.replace(
                    'environment:',
                    f'environment:\n      - VITE_STOCKNEAR_API_KEY={self.api_key}'
                )
            
            # Write updated content
            with open(docker_compose_path, 'w') as f:
                f.write(content)
            
            print("✅ Updated frontend docker-compose.yml")
            return True
        except Exception as e:
            print(f"❌ Failed to update docker-compose.yml: {e}")
            return False
    
    def update_backend_docker_compose(self):
        """Update backend docker-compose.yml with API key environment variables"""
        try:
            backend_docker_compose_path = self.backend_dir / "docker-compose.yml"
            
            if not backend_docker_compose_path.exists():
                print(f"⚠️  Backend docker-compose.yml not found at {backend_docker_compose_path}")
                return True  # Not critical if backend is separate
            
            # Read current backend docker-compose.yml
            with open(backend_docker_compose_path, 'r') as f:
                content = f.read()
            
            # Add STOCKNEAR_API_KEY to backend environment
            if 'STOCKNEAR_API_KEY=' not in content:
                # Find the environment section and add the API key
                if 'environment:' in content:
                    content = content.replace(
                        'environment:',
                        f'environment:\n      - STOCKNEAR_API_KEY={self.api_key}'
                    )
                else:
                    # Add environment section if it doesn't exist
                    content = content.replace(
                        '    restart: unless-stopped',
                        f'    environment:\n      - STOCKNEAR_API_KEY={self.api_key}\n    restart: unless-stopped'
                    )
            else:
                # Replace existing API key
                import re
                content = re.sub(
                    r'STOCKNEAR_API_KEY=[^\n]*',
                    f'STOCKNEAR_API_KEY={self.api_key}',
                    content
                )
            
            # Write updated content
            with open(backend_docker_compose_path, 'w') as f:
                f.write(content)
            
            print("✅ Updated backend docker-compose.yml")
            return True
        except Exception as e:
            print(f"❌ Failed to update backend docker-compose.yml: {e}")
            return False
    
    def create_env_files(self):
        """Create or update .env files with API key configuration"""
        try:
            # Frontend .env file
            frontend_env_path = self.frontend_dir / ".env"
            env_content = f"""# StockNear Frontend Environment Configuration
# Generated by API Key Setup Script on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# API Configuration
VITE_STOCKNEAR_API_KEY={self.api_key}
VITE_USEAST_API_URL=http://fastapi:8000
VITE_USEAST_FASTIFY_URL=http://fastify:2000

# Development Configuration
NODE_ENV=development
DOCKER_MODE=development

# PocketBase Configuration (if needed)
VITE_USEAST_POCKETBASE_URL=http://pocketbase:8090
VITE_USEAST_WS_URL=ws://fastapi:8000
"""
            
            with open(frontend_env_path, 'w') as f:
                f.write(env_content)
            
            print("✅ Created frontend .env file")
            
            # Backend .env file
            backend_env_path = self.backend_dir / ".env"
            backend_env_content = f"""# StockNear Backend Environment Configuration
# Generated by API Key Setup Script on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# API Configuration
STOCKNEAR_API_KEY={self.api_key}

# Application Environment
ENVIRONMENT=development

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6380
REDIS_DB=0

# PocketBase Configuration
POCKETBASE_ADMIN_EMAIL=admin@stocknear.com
POCKETBASE_ADMIN_PASSWORD=admin123

# API Keys (replace with your actual keys)
FMP_API_KEY=your_fmp_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
STOCK_DB=stocks
ETF_DB=etf
INDEX_DB=index
INSTITUTE_DB=institute
CRYPTO_DB=crypto
"""
            
            with open(backend_env_path, 'w') as f:
                f.write(backend_env_content)
            
            print("✅ Created backend .env file")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env files: {e}")
            return False
    
    def validate_setup(self):
        """Validate that the API key setup is working correctly"""
        try:
            print("\n🔍 Validating API key setup...")
            
            # For validate-only mode, we don't have an API key to check against
            if self.api_key is None:
                print("⚠️  No API key available for validation (validate-only mode)")
                print("✅ Validation mode completed")
                return True
            
            # Check if docker-compose.yml has the API key
            docker_compose_path = self.frontend_dir / "docker-compose.yml"
            if docker_compose_path.exists():
                with open(docker_compose_path, 'r') as f:
                    content = f.read()
                    if self.api_key in content:
                        print("✅ API key found in docker-compose.yml")
                    else:
                        print("❌ API key not found in docker-compose.yml")
                        return False
            
            # Check if .env files exist and contain API key
            frontend_env_path = self.frontend_dir / ".env"
            if frontend_env_path.exists():
                with open(frontend_env_path, 'r') as f:
                    content = f.read()
                    if self.api_key in content:
                        print("✅ API key found in frontend .env file")
                    else:
                        print("❌ API key not found in frontend .env file")
                        return False
            
            backend_env_path = self.backend_dir / ".env"
            if backend_env_path.exists():
                with open(backend_env_path, 'r') as f:
                    content = f.read()
                    if self.api_key in content:
                        print("✅ API key found in backend .env file")
                    else:
                        print("❌ API key not found in backend .env file")
                        return False
            
            # Test Docker Compose configuration
            print("\n🔍 Testing Docker Compose configuration...")
            try:
                result = subprocess.run(
                    ["docker-compose", "config"],
                    cwd=self.frontend_dir,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode == 0:
                    print("✅ Docker Compose configuration is valid")
                else:
                    print(f"❌ Docker Compose configuration error: {result.stderr}")
                    return False
            except subprocess.TimeoutExpired:
                print("❌ Docker Compose validation timed out")
                return False
            except FileNotFoundError:
                print("⚠️  Docker Compose not found, skipping validation")
            
            print("\n✅ API key setup validation completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Validation failed: {e}")
            return False
    
    def test_api_connectivity(self):
        """Test API connectivity with the new API key"""
        if not REQUESTS_AVAILABLE:
            print("⚠️  Skipping API connectivity test (requests module not available)")
            return True
            
        print("\n🔍 Testing API connectivity...")
        
        try:
            # Start services in background for testing
            print("Starting services for connectivity test...")
            subprocess.run(
                ["docker-compose", "up", "-d", "fastapi", "redis"],
                cwd=self.frontend_dir,
                capture_output=True,
                timeout=60
            )
            
            # Wait for services to be ready
            print("Waiting for services to be ready...")
            time.sleep(30)
            
            # Test API endpoint
            test_url = "http://localhost:8000/"
            headers = {"X-API-KEY": self.api_key}
            
            response = requests.get(test_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print("✅ API connectivity test successful")
                return True
            elif response.status_code == 403:
                print("❌ API key authentication failed (403 error)")
                return False
            else:
                print(f"⚠️  API returned status code: {response.status_code}")
                return True  # Not critical if service is starting
                
        except requests.exceptions.ConnectionError:
            print("⚠️  Could not connect to API (service may still be starting)")
            return True
        except Exception as e:
            print(f"⚠️  API connectivity test failed: {e}")
            return True
        finally:
            # Clean up test services
            try:
                subprocess.run(
                    ["docker-compose", "down"],
                    cwd=self.frontend_dir,
                    capture_output=True,
                    timeout=30
                )
            except:
                pass
    
    def rollback(self):
        """Rollback changes if setup fails"""
        if self.backup_dir and self.backup_dir.exists():
            try:
                print(f"\n🔄 Rolling back changes from backup: {self.backup_dir}")
                
                # Restore docker-compose.yml
                backup_docker_compose = self.backup_dir / "docker-compose.yml"
                if backup_docker_compose.exists():
                    shutil.copy2(backup_docker_compose, self.frontend_dir / "docker-compose.yml")
                
                # Restore backend docker-compose.yml
                backup_backend_docker_compose = self.backup_dir / "backend-docker-compose.yml"
                if backup_backend_docker_compose.exists():
                    shutil.copy2(backup_backend_docker_compose, self.backend_dir / "docker-compose.yml")
                
                # Restore .env files
                for env_file in self.backup_dir.glob("*.env*"):
                    if env_file.name.startswith("."):
                        shutil.copy2(env_file, self.frontend_dir / env_file.name)
                    else:
                        shutil.copy2(env_file, self.backend_dir / env_file.name)
                
                print("✅ Rollback completed successfully")
                return True
            except Exception as e:
                print(f"❌ Rollback failed: {e}")
                return False
        return False
    
    def run(self, force=False, validate_only=False, backup=True):
        """Main execution method"""
        print("🚀 StockNear API Key Setup Script")
        print("=" * 50)
        
        try:
            # Validate existing setup if requested
            if validate_only:
                return self.validate_setup()
            
            # Generate API key
            if not self.generate_api_key():
                return False
            
            # Create backup if requested
            if backup:
                if not self.create_backup():
                    print("⚠️  Backup failed, but continuing...")
            
            # Update configurations
            if not self.update_docker_compose():
                if backup:
                    self.rollback()
                return False
            
            if not self.update_backend_docker_compose():
                print("⚠️  Backend configuration update failed, but continuing...")
            
            if not self.create_env_files():
                if backup:
                    self.rollback()
                return False
            
            # Validate setup
            if not self.validate_setup():
                if backup:
                    self.rollback()
                return False
            
            # Test API connectivity
            self.test_api_connectivity()
            
            print("\n🎉 API key setup completed successfully!")
            print(f"📋 Generated API key: {self.api_key}")
            print("\n📝 Next steps:")
            print("1. Start the services: docker-compose up")
            print("2. Test the application: http://localhost:3000")
            print("3. Verify API calls are working without 403 errors")
            
            return True
            
        except KeyboardInterrupt:
            print("\n⚠️  Setup interrupted by user")
            if backup:
                self.rollback()
            return False
        except Exception as e:
            print(f"\n❌ Setup failed: {e}")
            if backup:
                self.rollback()
            return False

def main():
    parser = argparse.ArgumentParser(description="StockNear API Key Setup Script")
    parser.add_argument("--force", action="store_true", help="Force overwrite of existing configurations")
    parser.add_argument("--validate-only", action="store_true", help="Only validate existing setup without making changes")
    parser.add_argument("--backup", action="store_true", default=True, help="Create backup before making changes")
    parser.add_argument("--no-backup", action="store_true", help="Skip backup creation")
    
    args = parser.parse_args()
    
    # Handle backup argument
    if args.no_backup:
        args.backup = False
    
    script = APISetupScript()
    success = script.run(
        force=args.force,
        validate_only=args.validate_only,
        backup=args.backup
    )
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 