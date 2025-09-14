#!/usr/bin/env python3
"""
Script de compilación y despliegue para aplicación Spring Boot + React (separados)
"""

import os
import sys
import subprocess
import shutil
import json
from pathlib import Path
import argparse
import logging

# Configuración del logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BuildTaskManager:
    def __init__(self, project_root, name_jar_file="taskmanager.jar"):
        self.project_root = Path(project_root).resolve()
        self.backend_dir = self.project_root / 'application'
        self.frontend_dir = self.project_root / 'client'
        self.backend_target_dir = self.backend_dir / 'target'
        self.frontend_build_dir = self.frontend_dir / 'build'
        self.scripts_dir = self.project_root / 'scripts'
        self.deploy_dir = self.project_root / 'task-manager'
        self.jar_name = name_jar_file
    
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
            
    def copy_files_after_deploy(self):
        """Copia los archivos compilados al directorio de despliegue."""
        logger.info("Copiando archivos al directorio de despliegue...")
        if not self.deploy_dir.exists():
            self.deploy_dir.mkdir(parents=True)
        
        if not self.deploy_bin_dir.exists():
            self.deploy_bin_dir.mkdir(parents=True)

        shutil.copytree(self.scripts_dir / 'bin_files', self.deploy_bin_dir, dirs_exist_ok=True)
        shutil.copytree(self.scripts_dir / 'config_files', self.deploy_config_dir, dirs_exist_ok=True)

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
        

def main():
    parser = argparse.ArgumentParser(description='Script de compilación y despliegue para Task Manager')
    parser.add_argument('--action', choices=['build', 'deploy', 'full'], default='full',
                       help='Acción a realizar: build (solo compilar), deploy (solo desplegar), full (compilar y desplegar)')
    parser.add_argument('--backend-only', action='store_true',
                       help='Solo compilar el backend')
    parser.add_argument('--frontend-only', action='store_true',
                       help='Solo compilar el frontend')
    parser.add_argument('--name-jar-file', default='taskmanager.jar',
                       help='Nombre del archivo JAR del backend')

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
    elif args.action == 'full':
        build_manager.deploy()

    logger.info("Proceso completado exitosamente.")
        


if __name__ == "__main__":
    main()