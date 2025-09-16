#!/usr/bin/env python3
"""
Script para generar claves RSA private_key.pem y public_key.pem
Basado en la estructura de compile.py del proyecto task-manager
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import argparse
import logging

# Configuración del logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class KeyGenerator:
    def __init__(self, project_root, key_size=2048, output_dir="keys"):
        self.project_root = Path(project_root).resolve()
        self.key_size = key_size
        self.output_dir = self.project_root / output_dir
        self.private_key_path = self.output_dir / "private_key.pem"
        self.public_key_path = self.output_dir / "public_key.pem"

    def check_dependencies(self):
        """Verifica que OpenSSL esté instalado."""
        logger.info("Verificando dependencias...")
        try:
            result = subprocess.run(['openssl', 'version'], 
                                   check=True, 
                                   stdout=subprocess.PIPE, 
                                   stderr=subprocess.PIPE,
                                   text=True)
            logger.info(f"OpenSSL está instalado: {result.stdout.strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("OpenSSL no está instalado o no se encuentra en el PATH.")
            logger.error("Para instalar OpenSSL:")
            logger.error("  - macOS: brew install openssl")
            logger.error("  - Ubuntu/Debian: sudo apt-get install openssl")
            logger.error("  - Windows: Descargar desde https://slproweb.com/products/Win32OpenSSL.html")
            sys.exit(1)

    def create_output_directory(self):
        """Crea el directorio de salida para las claves."""
        logger.info(f"Creando directorio de claves: {self.output_dir}")
        if not self.output_dir.exists():
            self.output_dir.mkdir(parents=True)
            logger.info(f"Directorio creado: {self.output_dir}")
        else:
            logger.info(f"El directorio ya existe: {self.output_dir}")

    def generate_private_key(self):
        """Genera la clave privada RSA."""
        logger.info(f"Generando clave privada RSA de {self.key_size} bits...")
        try:
            cmd = ['openssl', 'genrsa', '-out', str(self.private_key_path), str(self.key_size)]
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info(f"Clave privada generada: {self.private_key_path}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error al generar la clave privada: {e}")
            sys.exit(1)

    def generate_public_key(self):
        """Genera la clave pública desde la clave privada."""
        logger.info("Generando clave pública...")
        try:
            cmd = ['openssl', 'rsa', '-in', str(self.private_key_path), 
                   '-pubout', '-out', str(self.public_key_path)]
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info(f"Clave pública generada: {self.public_key_path}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error al generar la clave pública: {e}")
            sys.exit(1)

    def verify_keys(self):
        """Verifica que las claves generadas sean válidas."""
        logger.info("Verificando claves generadas...")
        try:
            # Verificar clave privada
            cmd_private = ['openssl', 'rsa', '-in', str(self.private_key_path), '-check', '-noout']
            subprocess.run(cmd_private, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info("✓ Clave privada verificada correctamente")

            # Verificar clave pública
            cmd_public = ['openssl', 'rsa', '-pubin', '-in', str(self.public_key_path), '-text', '-noout']
            subprocess.run(cmd_public, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info("✓ Clave pública verificada correctamente")

            # Verificar que las claves coinciden
            cmd_private_hash = ['openssl', 'rsa', '-in', str(self.private_key_path), '-pubout']
            cmd_public_hash = ['openssl', 'rsa', '-pubin', '-in', str(self.public_key_path)]
            
            result_private = subprocess.run(cmd_private_hash, capture_output=True, text=True)
            result_public = subprocess.run(cmd_public_hash, capture_output=True, text=True)
            
            if result_private.stdout == result_public.stdout:
                logger.info("✓ Las claves privada y pública coinciden")
            else:
                logger.warning("⚠️ Las claves privada y pública no coinciden")

        except subprocess.CalledProcessError as e:
            logger.error(f"Error al verificar las claves: {e}")
            sys.exit(1)

    def set_file_permissions(self):
        """Establece permisos seguros para las claves."""
        logger.info("Estableciendo permisos de archivos...")
        try:
            # Clave privada: solo lectura para el propietario (600)
            os.chmod(self.private_key_path, 0o600)
            logger.info(f"Permisos establecidos para clave privada: 600 (rw-------)")
            
            # Clave pública: lectura para todos (644)
            os.chmod(self.public_key_path, 0o644)
            logger.info(f"Permisos establecidos para clave pública: 644 (rw-r--r--)")
        except OSError as e:
            logger.warning(f"No se pudieron establecer los permisos: {e}")

    def show_key_info(self):
        """Muestra información sobre las claves generadas."""
        logger.info("📋 Información de las claves generadas:")
        logger.info(f"   📁 Directorio: {self.output_dir}")
        logger.info(f"   🔐 Clave privada: {self.private_key_path}")
        logger.info(f"   🔑 Clave pública: {self.public_key_path}")
        logger.info(f"   🔢 Tamaño de clave: {self.key_size} bits")
        
        # Mostrar tamaños de archivo
        if self.private_key_path.exists():
            private_size = self.private_key_path.stat().st_size
            logger.info(f"   📏 Tamaño archivo privado: {private_size} bytes")
        
        if self.public_key_path.exists():
            public_size = self.public_key_path.stat().st_size
            logger.info(f"   📏 Tamaño archivo público: {public_size} bytes")

    def backup_existing_keys(self):
        """Crea backup de claves existentes si existen."""
        if self.private_key_path.exists() or self.public_key_path.exists():
            logger.info("Se encontraron claves existentes, creando backup...")
            backup_dir = self.output_dir / "backup"
            backup_dir.mkdir(exist_ok=True)
            
            if self.private_key_path.exists():
                backup_private = backup_dir / f"private_key_backup_{self._get_timestamp()}.pem"
                shutil.copy2(self.private_key_path, backup_private)
                logger.info(f"Backup de clave privada: {backup_private}")
            
            if self.public_key_path.exists():
                backup_public = backup_dir / f"public_key_backup_{self._get_timestamp()}.pem"
                shutil.copy2(self.public_key_path, backup_public)
                logger.info(f"Backup de clave pública: {backup_public}")

    def _get_timestamp(self):
        """Obtiene timestamp para backup."""
        from datetime import datetime
        return datetime.now().strftime("%Y%m%d_%H%M%S")

    def generate_keys(self, backup=True):
        """Proceso completo de generación de claves."""
        logger.info("🔐 Iniciando generación de claves RSA...")
        logger.info("=" * 50)
        
        self.check_dependencies()
        self.create_output_directory()
        
        if backup:
            self.backup_existing_keys()
        
        self.generate_private_key()
        self.generate_public_key()
        self.verify_keys()
        self.set_file_permissions()
        self.show_key_info()
        
        logger.info("=" * 50)
        logger.info("✅ Claves generadas exitosamente!")

    def generate_spring_boot_config(self):
        """Genera configuración para Spring Boot application.properties."""
        config_file = self.output_dir / "spring-boot-keys.properties"
        
        config_content = f"""# Configuración de claves para Spring Boot
# Generado automáticamente por generate_keys.py

# Rutas de las claves JWT
jwt.private-key=file:{self.private_key_path}
jwt.public-key=file:{self.public_key_path}

# Alternativa usando classpath (copiar las claves a src/main/resources/keys/)
# jwt.private-key=classpath:keys/private_key.pem
# jwt.public-key=classpath:keys/public_key.pem

# Configuración adicional JWT
jwt.expiration-time=86400000
jwt.issuer=task-manager-app
"""
        
        with open(config_file, 'w') as f:
            f.write(config_content)
        
        logger.info(f"📄 Configuración Spring Boot generada: {config_file}")


def main():
    parser = argparse.ArgumentParser(description='Generador de claves RSA para Task Manager')
    parser.add_argument('--key-size', type=int, choices=[1024, 2048, 4096], default=2048,
                       help='Tamaño de la clave RSA (bits)')
    parser.add_argument('--output-dir', default='keys',
                       help='Directorio donde guardar las claves')
    parser.add_argument('--no-backup', action='store_true',
                       help='No crear backup de claves existentes')
    parser.add_argument('--spring-config', action='store_true',
                       help='Generar configuración para Spring Boot')
    parser.add_argument('--algorithm', choices=['rsa', 'ed25519'], default='rsa',
                       help='Algoritmo de clave a usar')

    args = parser.parse_args()

    # Obtener el directorio del script actual (similar a compile.py)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Si estamos en el directorio scripts, subir un nivel
    if Path(script_dir).name == 'scripts':
        project_root = os.path.dirname(script_dir)
    else:
        project_root = script_dir

    key_generator = KeyGenerator(
        project_root=project_root,
        key_size=args.key_size,
        output_dir=args.output_dir
    )

    try:
        key_generator.generate_keys(backup=not args.no_backup)
        
        if args.spring_config:
            key_generator.generate_spring_boot_config()
        
        logger.info("🎯 Proceso completado exitosamente!")
        
    except KeyboardInterrupt:
        logger.info("\n🛑 Proceso interrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Error inesperado: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()