#!/usr/bin/env python3
"""
Script para detener la aplicación Task Manager
"""
import subprocess
import platform
import sys
import argparse
import logging

# Configuración del logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def kill_ports_unix(ports):
    for port in ports:
        try:
            # Encuentra los procesos que escuchan en el puerto y mata los procesos
            result = subprocess.run(f"lsof -ti:{port}", shell=True, capture_output=True, text=True)
            pids = result.stdout.strip().split('\n')
            pids = [pid for pid in pids if pid]
            if pids:
                subprocess.run(f"kill -9 {' '.join(pids)}", shell=True)
                logger.info(f"Processes on port {port} stopped: {', '.join(pids)}")
            else:
                logger.info(f"No processes listening on port {port}.")
        except Exception as e:
            logger.error(f"Error stopping processes on port {port}: {e}")

def kill_ports_windows(ports):
    for port in ports:
        try:
            # Buscar los procesos usando netstat y taskkill
            find_pids_cmd = f'netstat -ano | findstr :{port}'
            result = subprocess.run(find_pids_cmd, shell=True, capture_output=True, text=True)
            lines = result.stdout.strip().split('\n')
            pids = set()
            for line in lines:
                parts = line.strip().split()
                if len(parts) >= 5:
                    pids.add(parts[-1])
            if pids:
                for pid in pids:
                    subprocess.run(f'taskkill /F /PID {pid}', shell=True)
                logger.info(f"Processes on port {port} stopped: {', '.join(pids)}")
            else:
                logger.info(f"No processes listening on port {port}.")
        except Exception as e:
            logger.error(f"Error stopping processes on port {port}: {e}")

def stop_task_manager(backend_port=8080, frontend_port=3000, custom_ports=None):
    """
    Detiene la aplicación Task Manager matando los procesos en los puertos especificados
    """
    ports = []
    
    if custom_ports:
        ports.extend(custom_ports)
        logger.info(f"Using custom ports: {custom_ports}")
    else:
        if backend_port is not None:
            ports.append(backend_port)
        if frontend_port is not None:
            ports.append(frontend_port)
        
        if not ports:
            logger.warning("No ports specified to stop")
            return
            
        logger.info(f"Stopping processes on ports: {ports}")
    
    system = platform.system().lower()
    logger.info(f"Detected operating system: {system}")
    
    if system == "windows":
        kill_ports_windows(ports)
    elif system in ("linux", "darwin"):  # darwin = macOS
        kill_ports_unix(ports)
    else:
        logger.error(f"Unsupported operating system: {system}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Script para detener la aplicación Task Manager')
    parser.add_argument('--backend-port', type=int, default=8080,
                        help='Puerto del backend a detener (default: 8080)')
    parser.add_argument('--frontend-port', type=int, default=3000,
                        help='Puerto del frontend a detener (default: 3000)')
    parser.add_argument('--ports', type=int, nargs='+',
                        help='Lista de puertos personalizados a detener (ej: --ports 8080 3000 9090)')
    parser.add_argument('--stop-backend', action='store_true',
                        help='Detener solo el backend')
    parser.add_argument('--stop-frontend', action='store_true',
                        help='Detener solo el frontend')
    
    args = parser.parse_args()
    
    if args.ports:
        # Usar puertos personalizados
        stop_task_manager(custom_ports=args.ports)
    elif args.stop_backend:
        # Detener solo backend
        logger.info("Stopping backend only")
        stop_task_manager(backend_port=args.backend_port, frontend_port=None)
    elif args.stop_frontend:
        # Detener solo frontend
        logger.info("Stopping frontend only")
        stop_task_manager(backend_port=None, frontend_port=args.frontend_port)
    else:
        # Detener ambos (comportamiento por defecto)
        logger.info("Stopping both backend and frontend")
        stop_task_manager(backend_port=args.backend_port, frontend_port=args.frontend_port)

if __name__ == "__main__":
    main()