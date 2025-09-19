@echo off

echo 🚀 Configurando App Móvil CDT...

cd mobile

echo 📦 Instalando dependencias...
npm install

echo 🔧 Configurando Expo...
npx expo install

echo 📱 Verificando configuración...
npx expo doctor

echo ✅ ¡App móvil lista!
echo.
echo Para ejecutar:
echo   cd mobile
echo   npx expo start
echo.
echo Para probar en dispositivo:
echo   - Instala Expo Go en tu teléfono
echo   - Escanea el código QR

pause
