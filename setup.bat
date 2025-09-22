@echo off
REM Simple Setup Script for Meme Generator

echo 🚀 Setting up Meme Generator...

REM Create .env file from template
if exist env-template (
    copy env-template .env
    echo ✅ .env file created successfully!
) else (
    echo ❌ env-template file not found!
    exit /b 1
)

echo.
echo 📋 Environment Configuration:
echo    Database Password: DevPassword123!
echo    Backend URL: http://localhost:5000 (dev) / http://localhost:3000 (prod)
echo    Frontend URL: http://localhost:3000 (dev) / http://localhost (prod)
echo    JWT Secret: your_super_secret_jwt_key_12345
echo.
echo 🔧 Next steps:
echo    Development: dev.bat
echo    Production: deploy.bat
echo.
echo 🎉 Setup complete!
