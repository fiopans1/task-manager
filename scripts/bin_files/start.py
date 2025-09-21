#!/usr/bin/env python3
"""
Scrip para incio de la aplicación Task Manager
"""
import os
import time
import sys
import subprocess
import shutil
import json
from pathlib import Path
import argparse
import logging
import requests
# Configuración del logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class StartBackendTaskManager:
    def __init__(self, project_root, name_jar_file="taskmanager.jar", backend_port=8080):
        self.project_root = Path(project_root).resolve()
        self.backend_jar_dir = self.project_root / 'lib' / 'backend' / name_jar_file
        self.backend_config_dir = self.project_root / 'config' / 'application.properties'
        self.backend_port = backend_port
    
    def start_task_manager_back(self):

        environment_variables = {
            'DEPLOY_ROOT': self.project_root,
        }
        for key, value in environment_variables.items():
            os.environ[key] = str(value)
        cmd = [
            'java',
            '-jar', str(self.backend_jar_dir),
            f'--spring.config.location=file:{self.backend_config_dir}',
            '--spring.profiles.active=prod',
            f'--server.port={self.backend_port}',
        ]
        logger.info(f"Starting backend on port {self.backend_port}")
        return subprocess.Popen(cmd)
    

class StartFrontendTaskManager:
    def __init__(self, project_root, frontend_port=3000):
        self.project_root = Path(project_root).resolve()
        self.frontend_dir = self.project_root / 'lib' / 'frontend'
        self.caddy_executable = self.project_root / 'lib'
        self.frontend_port = frontend_port

    def start_task_manager_front(self):
        """Iniciar en modo producción"""
        logger.info(f"Starting frontend on port {self.frontend_port}")
        cmd = [
            './caddy',
            'run', '--config', '../config/Caddyfile', '--adapter', 'caddyfile'
        ]
        return subprocess.Popen(cmd, cwd=self.caddy_executable)

class StartTaskManager:
    def __init__(self, project_root, name_jar_file="taskmanager.jar", backend_port=8080, frontend_port=3000):
        self.project_root = Path(project_root).resolve()
        self.backend_jar_dir = self.project_root / 'lib' / 'backend' / name_jar_file
        self.backend_config_dir = self.project_root / 'config' / 'application.properties'
        self.backend_port = backend_port
        self.frontend_port = frontend_port
        self.backend_starter = StartBackendTaskManager(project_root, name_jar_file, backend_port)
        self.frontend_starter = StartFrontendTaskManager(self.project_root, frontend_port)

    def start_backend(self):
        self.backend_starter.start_task_manager_back()

    def start_frontend(self):
        self.frontend_starter.start_task_manager_front()
    
    def wait_for_backend_up(self):
        backend_ready = False
        while not backend_ready:
            try:
                r = requests.get(f"http://localhost:{self.backend_port}/health")
                if r.status_code == 200:
                    backend_ready = True
                    logger.info("✅ Backend listo")
            except Exception:
                pass
            time.sleep(2)  # espera 2 segundos antes de volver a intentar

    def wait_for_frontend_up(self):
        frontend_ready = False
        while not frontend_ready:
            try:
                r = requests.get(f"http://localhost:{self.frontend_port}/health")
                if r.status_code == 200:
                    frontend_ready = True
                    logger.info("✅ Frontend listo")
            except Exception:
                pass
            time.sleep(2)  # espera 2 segundos antes de volver a intentar
    
    def startAll(self):
        self.start_backend()
        self.wait_for_backend_up()
        self.start_frontend()
        self.wait_for_frontend_up()

def main():
    parser = argparse.ArgumentParser(description='Script para iniciar la aplicación Task Manager')
    parser.add_argument('--start-backend', action='store_true',
                        help='Iniciar solo el backend')
    parser.add_argument('--start-frontend', action='store_true',
                        help='Iniciar solo el frontend')
    parser.add_argument('--start-all', action='store_true',
                        help='Iniciar tanto el backend como el frontend')
    parser.add_argument('--name-jar-file', default='taskmanager.jar',
                        help='Nombre del archivo JAR del backend')
    parser.add_argument('--project-root', 
                        help='Ruta del directorio raíz del proyecto (por defecto: directorio actual)')
    parser.add_argument('--backend-port', type=int, default=8080,
                        help='Puerto para el backend (default: 8080)')
    parser.add_argument('--frontend-port', type=int, default=3000,
                        help='Puerto para el frontend (default: 3000)')
    args = parser.parse_args()
    
    # Determinar el directorio raíz del proyecto
    if args.project_root:
        script_dir = args.project_root
        logger.info(f"Using specified project root: {script_dir}")
    else:
        # Usar el directorio actual como raíz del proyecto
        script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        logger.info(f"Using current directory as project root: {script_dir}")
    
    starter = StartTaskManager(
        script_dir, 
        args.name_jar_file, 
        args.backend_port, 
        args.frontend_port
    )
    
    logger.info(f"Configuration:")
    logger.info(f"  - Backend port: {args.backend_port}")
    logger.info(f"  - Frontend port: {args.frontend_port}")
    logger.info(f"  - JAR file: {args.name_jar_file}")  
    
    if args.start_backend:
        starter.start_backend()
        starter.wait_for_backend_up()
    elif args.start_frontend:
        starter.start_frontend()
        starter.wait_for_frontend_up()
    elif args.start_all:
        starter.startAll()


if __name__ == "__main__":
    main()