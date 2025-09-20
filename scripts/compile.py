#!/usr/bin/env python3
"""
Script de compilación y despliegue para aplicación Task Manager
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import argparse
import logging
import requests
import tarfile
import zipfile
import platform

# Configuración del logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BuildTaskManager:
    def __init__(self, project_root, name_jar_file="taskmanager.jar", name_final_file="TaskManager"):
        self.project_root = Path(project_root).resolve()
        self.backend_dir = self.project_root / 'application'
        self.frontend_dir = self.project_root / 'client'
        self.backend_target_dir = self.backend_dir / 'target'
        self.frontend_build_dir = self.frontend_dir / 'build'
        self.scripts_dir = self.project_root / 'scripts'
        self.deploy_dir = self.project_root / 'task-manager'
        self.jar_name = name_jar_file
        self.name_final_file = name_final_file
        
        # Configuración de Caddy
        self.caddy_version = "v2.7.6"  # Puedes actualizar esta versión
        self.caddy_url_base = "https://github.com/caddyserver/caddy/releases/download"

    def get_caddy_download_info(self):
        """Determina la URL de descarga y el nombre del archivo según la plataforma."""
        system = platform.system().lower()
        machine = platform.machine().lower()
        
        # Mapeo de arquitecturas
        arch_map = {
            'x86_64': 'amd64',
            'amd64': 'amd64',
            'i386': '386',
            'i686': '386',
            'arm64': 'arm64',
            'aarch64': 'arm64',
            'armv7l': 'armv7',
            'armv6l': 'armv6'
        }
        
        arch = arch_map.get(machine, 'amd64')
        
        if system == 'windows':
            os_name = 'windows'
            extension = 'zip'
            executable = 'caddy.exe'
        elif system == 'darwin':
            os_name = 'mac'
            extension = 'tar.gz'
            executable = 'caddy'
        elif system == 'linux':
            os_name = 'linux'
            extension = 'tar.gz'
            executable = 'caddy'
        else:
            # Fallback a Linux
            os_name = 'linux'
            extension = 'tar.gz'
            executable = 'caddy'
            logger.warning(f"Sistema operativo no reconocido: {system}. Usando Linux como fallback.")
        
        filename = f"caddy_{self.caddy_version.lstrip('v')}_{os_name}_{arch}.{extension}"
        url = f"{self.caddy_url_base}/{self.caddy_version}/{filename}"
        
        return url, filename, executable, extension

    def download_caddy(self):
        """Descarga Caddy desde GitHub releases."""
        logger.info(f"Descargando Caddy {self.caddy_version}...")
        
        url, filename, executable, extension = self.get_caddy_download_info()
        
        # Crear directorio temporal para la descarga
        temp_dir = self.deploy_dir / 'tmp'
        temp_dir.mkdir(exist_ok=True)
        
        try:
            # Descargar el archivo
            logger.info(f"Descargando desde: {url}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            file_path = temp_dir / filename
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Archivo descargado: {file_path}")
            
            # Extraer el archivo
            if extension == 'zip':
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(temp_dir)
            elif extension == 'tar.gz':
                with tarfile.open(file_path, 'r:gz') as tar_ref:
                    tar_ref.extractall(temp_dir)
            
            # Verificar que el ejecutable existe
            caddy_executable = temp_dir / executable
            if not caddy_executable.exists():
                raise FileNotFoundError(f"No se encontró el ejecutable de Caddy: {caddy_executable}")
            
            # Hacer el archivo ejecutable en sistemas Unix
            if os.name != 'nt':
                os.chmod(caddy_executable, 0o755)
            
            logger.info("Caddy descargado y extraído exitosamente.")
            return caddy_executable
            
        except requests.RequestException as e:
            logger.error(f"Error al descargar Caddy: {e}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Error al procesar Caddy: {e}")
            sys.exit(1)

    def cleanup_caddy_temp(self):
        """Limpia los archivos temporales de Caddy."""
        temp_dir = self.deploy_dir / 'temp'
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
            logger.info("Archivos temporales de Caddy eliminados.")


    def check_dependencies(self):
        """Verifica que las dependencias necesarias estén instaladas."""
        logger.info("Verificando dependencias...")
        try:
            subprocess.run(['mvn', '-v'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info("Maven está instalado.")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("Maven no está instalado o no se encuentra en el PATH.")
            sys.exit(1)
        
        try:
            subprocess.run(['npm', '-v'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info("Node.js y npm están instalados.")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("Node.js y npm no están instalados o no se encuentran en el PATH.")
            sys.exit(1)

    def build_backend(self):
        """Compila el backend con Maven."""
        logger.info("Compilando el backend...")
        try:
            subprocess.run(['mvn', 'clean', 'package', '-DskipTests'], cwd=self.backend_dir, check=True)
            logger.info("Backend compilado exitosamente.")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error al compilar el backend: {e}")
            sys.exit(1)

    def build_frontend(self):
        """Compila el frontend con npm."""
        logger.info("Compilando el frontend...")
        try:
            subprocess.run(['npm', 'install'], cwd=self.frontend_dir, check=True)
            subprocess.run(['npm', 'run', 'build'], cwd=self.frontend_dir, check=True)
            logger.info("Frontend compilado exitosamente.")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error al compilar el frontend: {e}")
            sys.exit(1)
    
    def copy_templates(self):
        """Copia los archivos de plantilla a sus ubicaciones correspondientes."""
        logger.info("Copiando archivos de plantilla...")
        mappings = [
            {
                'source': self.scripts_dir / 'config_templates' / 'application-properties.template',
                'destination': self.deploy_dir / 'config' / 'application.properties'
            },
            # {
            #     'source': self.scripts_dir / 'config_files' / 'env.template', 
            #     'destination': self.deploy_dir / '.env'
            # }
        ]
        
        for mapping in mappings:
            source = mapping['source']
            destination = mapping['destination']
            
            try:
                if source.exists():
                    # Crear directorio de destino si no existe
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Copiar archivo
                    shutil.copy2(source, destination)
                    logger.info(f"✓ Copiado: {source} → {destination}")
                else:
                    logger.warning(f"✗ No encontrado: {source}")
            except Exception as e:
                logger.error(f"✗ Error al copiar {source} a {destination}: {e}")
    
    def compress_folder_deploy(self):
        if not self.deploy_dir.exists():
            raise FileNotFoundError(f"El directorio de despliegue {self.deploy_dir} no existe.")
        if not self.deploy_dir.is_dir():
            raise NotADirectoryError(f"{self.deploy_dir} no es un directorio válido.")

        shutil.make_archive(self.project_root / self.name_final_file, 'zip', root_dir=self.deploy_dir) #En un futuro necesario parametrizar el nombre del archivo final
        logger.info(f"Directorio {self.deploy_dir} comprimido en {self.project_root / f'{self.name_final_file}.zip'}")

    def copy_files_after_deploy(self):
        """Copia los archivos compilados al directorio de despliegue."""
        logger.info("Copiando archivos al directorio de despliegue...")
        if not self.deploy_dir.exists():
            self.deploy_dir.mkdir(parents=True)
        
        if not self.deploy_bin_dir.exists():
            self.deploy_bin_dir.mkdir(parents=True)

        shutil.copytree(self.scripts_dir / 'bin_files', self.deploy_bin_dir, dirs_exist_ok=True)
        shutil.copytree(self.scripts_dir / 'config_files', self.deploy_config_dir, dirs_exist_ok=True)
        self.copy_templates()

    def deploy(self):
        """Genera el directorio de despliegue y copia los archivos necesarios."""
        logger.info("Desplegando la aplicación...")
        if self.deploy_dir.exists():
            shutil.rmtree(self.deploy_dir)
        self.deploy_dir.mkdir(parents=True)
        (self.deploy_dir / 'bin').mkdir(parents=True)
        self.deploy_bin_dir = self.deploy_dir / 'bin'
        (self.deploy_dir / 'lib').mkdir(parents=True)
        self.deploy_lib_dir = self.deploy_dir / 'lib'
        (self.deploy_dir / 'config').mkdir(parents=True)
        self.deploy_config_dir = self.deploy_dir / 'config'
        (self.deploy_dir / 'metadata').mkdir(parents=True)
        self.deploy_metadata_dir = self.deploy_dir / 'metadata'

        self.check_dependencies()
        self.build_backend()
        self.build_frontend()
        
        # Descargar e integrar Caddy
        logger.info("Integrando Caddy...")
        caddy_executable = self.download_caddy()

        # Copiar Caddy al directorio lib
        caddy_dest = self.deploy_lib_dir / caddy_executable.name
        shutil.copy2(caddy_executable, caddy_dest)
        logger.info(f"Caddy copiado a: {caddy_dest}")

        # Copiar el JAR del backend
        jar_path = self.backend_target_dir / self.jar_name
        if not jar_path.exists():
            logger.error(f"No se encontró el archivo JAR: {jar_path}")
            sys.exit(1)            
        (self.deploy_lib_dir / 'backend').mkdir(parents=True)
        shutil.copy(jar_path, self.deploy_lib_dir / 'backend' / self.jar_name)


        # Copiar los archivos del frontend
        if not self.frontend_build_dir.exists():
            logger.error(f"No se encontró el directorio de build del frontend: {self.frontend_build_dir}")
            sys.exit(1)
        shutil.copytree(self.frontend_build_dir, self.deploy_lib_dir / 'frontend')
        
        # Copiar archivos de configuración
        logger.info("Copiando ficheros necesarios para la instalacion...")
        self.copy_files_after_deploy()
        
        logger.info(f"Despliegue completado en: {self.deploy_dir}")
        
        self.compress_folder_deploy()

        logger.info(f"Archivo comprimido creado en: {self.project_root / f'{self.name_final_file}.zip'}")


def main():
    parser = argparse.ArgumentParser(description='Script de compilación y despliegue para Task Manager')
    parser.add_argument('--action', choices=['build', 'deploy'], default='full',
                       help='Acción a realizar: build (solo compilar), deploy (solo desplegar), full (compilar y desplegar)')
    parser.add_argument('--backend-only', action='store_true',
                       help='Solo compilar el backend')
    parser.add_argument('--frontend-only', action='store_true',
                       help='Solo compilar el frontend')
    parser.add_argument('--name-jar-file', default='taskmanager.jar',
                       help='Nombre del archivo JAR del backend')
    parser.add_argument('--name-final-file', default='TaskManager',
                       help='Nombre del archivo final comprimido sin extensión')
    parser.add_argument('--plattform', choices=['windows', 'linux'], default='linux',
                       help='Plataforma objetivo para los scripts de despliegue (default: linux)')
    parser.add_argument('--architecture', default='arm64',
                       help='Arquitectura objetivo para los scripts de despliegue (default: arm64)')
    parser.add_argument('--version', default='1.0.0',
                       help='Versión de la aplicación (default: 1.0.0)')
    parser.add_argument('--caddy-version', default='v2.7.6',
                       help='Versión de Caddy a descargar (default: v2.7.6)')
    

    args = parser.parse_args()

    # Obtener el directorio del script actual
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    build_manager = BuildTaskManager(script_dir, name_jar_file=args.name_jar_file)

    if args.action == 'build':
        build_manager.check_dependencies()
        if args.backend_only:
            build_manager.build_backend()
        elif args.frontend_only:
            build_manager.build_frontend()
        else:
            build_manager.build_backend()
            build_manager.build_frontend()
    elif args.action == 'deploy':
        build_manager.deploy()

    logger.info("Proceso completado exitosamente.")
        


if __name__ == "__main__":
    main()