import os
import sys
import platform
import requests
import zipfile
import tarfile
import subprocess
from pathlib import Path

class NginxDownloader:
    def __init__(self, install_path="./nginx"):
        self.install_path = Path(install_path)
        self.system = platform.system().lower()
        self.arch = platform.machine().lower()
        
    def get_download_url(self):
        """Determina la URL de descarga según el SO"""
        # Para macOS, usamos Homebrew o compilamos desde fuente
        if self.system == 'darwin':  # macOS
            return self._get_macos_nginx()
        elif self.system == 'windows':
            return 'http://nginx.org/download/nginx-1.24.0.zip'
        elif self.system == 'linux':
            return 'http://nginx.org/download/nginx-1.24.0.tar.gz'
        else:
            raise OSError(f"Sistema operativo no soportado: {self.system}")
    
    def _get_macos_nginx(self):
        """Maneja la descarga específica para macOS"""
        # Opción 1: Intentar usar Homebrew si está disponible
        if self._has_homebrew():
            return "homebrew"
        
        # Opción 2: Descargar binario precompilado
        arch_suffix = "arm64" if self.arch in ['arm64', 'aarch64'] else "x86_64"
        
        # URLs de binarios precompilados para macOS
        urls = {
            'arm64': 'https://github.com/nginxinc/nginx-binaries/releases/download/1.24.0/nginx-1.24.0-macos-arm64.tar.gz',
            'x86_64': 'https://github.com/nginxinc/nginx-binaries/releases/download/1.24.0/nginx-1.24.0-macos-x86_64.tar.gz'
        }
        
        return urls.get(arch_suffix, urls['x86_64'])
    
    def _has_homebrew(self):
        """Verifica si Homebrew está instalado"""
        try:
            subprocess.run(['brew', '--version'], 
                         capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def _install_via_homebrew(self):
        """Instala Nginx usando Homebrew"""
        print("📦 Instalando Nginx via Homebrew...")
        try:
            # Instalar nginx
            subprocess.run(['brew', 'install', 'nginx'], check=True)
            
            # Encontrar la instalación de Homebrew
            result = subprocess.run(['brew', '--prefix', 'nginx'], 
                                  capture_output=True, text=True, check=True)
            brew_nginx_path = Path(result.stdout.strip())
            
            # Crear symlinks a nuestro directorio
            self.install_path.mkdir(parents=True, exist_ok=True)
            
            # Copiar binario
            nginx_bin = brew_nginx_path / "bin" / "nginx"
            if nginx_bin.exists():
                import shutil
                shutil.copy2(nginx_bin, self.install_path / "nginx")
                os.chmod(self.install_path / "nginx", 0o755)
            
            print("✅ Nginx instalado via Homebrew")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando via Homebrew: {e}")
            return False
    
    def download_file(self, url, filename):
        """Descarga un archivo con barra de progreso"""
        print(f"Descargando Nginx desde: {url}")
        
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        block_size = 8192
        downloaded = 0
        
        with open(filename, 'wb') as file:
            for chunk in response.iter_content(chunk_size=block_size):
                if chunk:
                    file.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f"\rProgreso: {percent:.1f}%", end='')
        
        print("\n✅ Descarga completada")
        return filename
    
    def extract_nginx(self, archive_path):
        """Extrae Nginx según el tipo de archivo"""
        print("Extrayendo Nginx...")
        
        if archive_path.suffix == '.zip':
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(self.install_path.parent)
        
        elif archive_path.suffix == '.gz':
            with tarfile.open(archive_path, 'r:gz') as tar_ref:
                tar_ref.extractall(self.install_path.parent)
        
        # Buscar y renombrar directorio extraído
        extracted_dirs = [d for d in self.install_path.parent.iterdir() 
                         if d.is_dir() and 'nginx' in d.name.lower() and d != self.install_path]
        if extracted_dirs:
            extracted_dirs[0].rename(self.install_path)
        
        # En macOS, hacer ejecutable el binario
        if self.system == 'darwin':
            nginx_binary = self.install_path / "nginx"
            if nginx_binary.exists():
                os.chmod(nginx_binary, 0o755)
        
        print("✅ Extracción completada")
    
    def setup_config(self):
        """Crea configuración básica de Nginx"""
        config_dir = self.install_path / "conf"
        config_dir.mkdir(exist_ok=True)
        
        # Configuración específica para macOS
        worker_processes = "auto" if self.system == 'darwin' else "1"
        
        nginx_conf = f"""
worker_processes {worker_processes};

events {{
    worker_connections 1024;
    use kqueue;  # Optimización para macOS
}}

http {{
    include       mime.types;
    default_type  application/octet-stream;
    
    # Optimizaciones para macOS
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    
    server {{
        listen 8080;
        server_name localhost;
        
        # Servir frontend estático
        location / {{
            root ../frontend/dist;
            try_files $uri $uri/ /index.html;
            
            # Headers para desarrollo
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }}
        
        # Proxy para API del backend
        location /api/ {{
            proxy_pass http://localhost:8081/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }}
    }}
}}
"""
        
        with open(config_dir / "nginx.conf", 'w') as f:
            f.write(nginx_conf.strip())
        
        # Crear archivo mime.types básico
        mime_types = """
types {
    text/html                             html htm shtml;
    text/css                              css;
    application/javascript                js;
    application/json                      json;
    image/gif                             gif;
    image/jpeg                            jpeg jpg;
    image/png                             png;
    image/svg+xml                         svg;
    application/pdf                       pdf;
}
"""
        with open(config_dir / "mime.types", 'w') as f:
            f.write(mime_types.strip())
        
        print("✅ Configuración creada")
    
    def create_startup_script_macos(self):
        """Crea script de inicio específico para macOS"""
        start_script = f"""#!/bin/bash
# Script de inicio para macOS

echo "🚀 Iniciando aplicación en macOS..."

# Obtener el directorio del script
DIR="$( cd "$( dirname "${{BASH_SOURCE[0]}}" )" &> /dev/null && pwd )"
cd "$DIR"

# Función para cleanup
cleanup() {{
    echo "🛑 Deteniendo servicios..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ -f nginx/logs/nginx.pid ]; then
        ./nginx/nginx -s quit
    fi
    exit 0
}}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Verificar Java
if ! command -v java &> /dev/null; then
    echo "❌ Java no encontrado. Por favor instala Java."
    exit 1
fi

# Crear directorio de logs si no existe
mkdir -p nginx/logs

# Iniciar backend Java
echo "🔧 Iniciando backend Java..."
java -jar backend/mi-app.jar --server.port=8081 &
BACKEND_PID=$!

# Esperar que el backend inicie
echo "⏳ Esperando que el backend inicie..."
sleep 5

# Verificar que el backend esté corriendo
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Error: El backend no pudo iniciar"
    exit 1
fi

# Iniciar Nginx
echo "🌐 Iniciando servidor web..."
cd nginx
./nginx -p $(pwd) -c conf/nginx.conf
cd ..

if [ $? -eq 0 ]; then
    echo "✅ Aplicación iniciada correctamente!"
    echo "🌍 Accede a: http://localhost:8080"
    echo "🛑 Presiona Ctrl+C para detener"
    
    # Esperar indefinidamente
    wait $BACKEND_PID
else
    echo "❌ Error: No se pudo iniciar el servidor web"
    kill $BACKEND_PID
    exit 1
fi
"""
        
        script_path = self.install_path.parent / "start_macos.sh"
        with open(script_path, 'w') as f:
            f.write(start_script)
        
        os.chmod(script_path, 0o755)
        print(f"✅ Script de inicio creado: {script_path}")
    
    def install(self):
        """Proceso completo de instalación"""
        try:
            print(f"🍎 Detectado: {self.system} ({self.arch})")
            
            # Crear directorio de instalación
            self.install_path.mkdir(parents=True, exist_ok=True)
            
            # Verificar si ya existe
            nginx_binary = "nginx"
            if (self.install_path / nginx_binary).exists():
                print("⚠️  Nginx ya está instalado")
                return True
            
            # Para macOS, intentar Homebrew primero
            if self.system == 'darwin':
                if self._has_homebrew():
                    if self._install_via_homebrew():
                        self.setup_config()
                        self.create_startup_script_macos()
                        return True
                    else:
                        print("⚠️  Homebrew falló, intentando descarga manual...")
            
            # Descarga manual para todos los sistemas
            url = self.get_download_url()
            if url == "homebrew":
                print("❌ No se pudo instalar via Homebrew y no hay URL alternativa")
                return False
            
            # Determinar extensión del archivo
            if self.system == 'windows':
                filename = "nginx_download.zip"
            else:
                filename = "nginx_download.tar.gz"
            
            archive_path = Path(filename)
            
            self.download_file(url, archive_path)
            self.extract_nginx(archive_path)
            self.setup_config()
            
            # Crear script específico para macOS
            if self.system == 'darwin':
                self.create_startup_script_macos()
            
            # Limpiar archivo descargado
            archive_path.unlink()
            
            print("🎉 Nginx instalado correctamente!")
            return True
            
        except Exception as e:
            print(f"❌ Error durante la instalación: {e}")
            return False

def main():
    print("🔧 Instalador de Nginx multiplataforma")
    downloader = NginxDownloader()
    success = downloader.install()
    
    if success:
        print(f"\n✅ Nginx instalado en: {downloader.install_path.absolute()}")
        
        system = platform.system().lower()
        if system == 'darwin':
            print("🍎 Para iniciar en macOS:")
            print("  ./start_macos.sh")
        elif system == 'windows':
            print("🪟 Para iniciar en Windows:")
            print("  start.bat")
        else:
            print("🐧 Para iniciar en Linux:")
            print("  ./start.sh")

if __name__ == "__main__":
    main()