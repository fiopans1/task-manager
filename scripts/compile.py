#!/usr/bin/env python3
"""
Compilation and deployment script for Task Manager application
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

# Logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BuildTaskManager:
    def __init__(self, project_root, name_jar_file="taskmanager.jar", name_final_file="TaskManager", 
                 caddy_version="v2.7.6", specify_specifications=False, target_platform=None, target_architecture=None):
        self.project_root = Path(project_root).resolve()
        self.backend_dir = self.project_root / 'application'
        self.frontend_dir = self.project_root / 'client'
        self.backend_target_dir = self.backend_dir / 'target'
        self.frontend_build_dir = self.frontend_dir / 'build'
        self.scripts_dir = self.project_root / 'scripts'
        self.deploy_dir = self.project_root / 'task-manager'
        self.jar_name = name_jar_file
        self.name_final_file = name_final_file
        
        # Caddy configuration
        self.caddy_version = caddy_version
        self.caddy_url_base = "https://github.com/caddyserver/caddy/releases/download"
        
        # Specification parameters
        self.specify_specifications = specify_specifications
        self.target_platform = target_platform
        self.target_architecture = target_architecture

    def get_caddy_download_info(self):
        """Determines the download URL and filename according to the platform."""
        
        if self.specify_specifications:
            # Use specified platform and architecture
            system = self.target_platform.lower() if self.target_platform else 'linux'
            specified_arch = self.target_architecture.lower() if self.target_architecture else 'amd64'
            
            # Map specified architecture to Caddy naming convention
            arch_map = {
                'x86_64': 'amd64',
                'amd64': 'amd64',
                'i386': '386',
                'i686': '386',
                'arm64': 'arm64',
                'aarch64': 'arm64',
                'armv7l': 'armv7',
                'armv6l': 'armv6',
                'armv7': 'armv7',
                'armv6': 'armv6'
            }
            arch = arch_map.get(specified_arch, specified_arch)
            
            logger.info(f"Using specified platform: {system}, architecture: {arch}")
        else:
            # Auto-detect platform and architecture
            system = platform.system().lower()
            machine = platform.machine().lower()
            
            # Architecture mapping
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
            logger.info(f"Auto-detected platform: {system}, architecture: {arch}")
        
        if system == 'windows':
            os_name = 'windows'
            extension = 'zip'
            executable = 'caddy.exe'
        elif system == 'darwin' or system == 'mac':
            os_name = 'mac'
            extension = 'tar.gz'
            executable = 'caddy'
        elif system == 'linux':
            os_name = 'linux'
            extension = 'tar.gz'
            executable = 'caddy'
        else:
            # Fallback to Linux
            os_name = 'linux'
            extension = 'tar.gz'
            executable = 'caddy'
            logger.warning(f"Unrecognized operating system: {system}. Using Linux as fallback.")
        
        filename = f"caddy_{self.caddy_version.lstrip('v')}_{os_name}_{arch}.{extension}"
        url = f"{self.caddy_url_base}/{self.caddy_version}/{filename}"
        
        return url, filename, executable, extension

    def download_caddy(self):
        """Downloads Caddy from GitHub releases."""
        logger.info(f"Downloading Caddy {self.caddy_version}...")
        
        url, filename, executable, extension = self.get_caddy_download_info()
        
        # Create temporary directory for download
        temp_dir = self.deploy_dir / 'tmp'
        temp_dir.mkdir(exist_ok=True)
        
        try:
            # Download the file
            logger.info(f"Downloading from: {url}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            file_path = temp_dir / filename
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"File downloaded: {file_path}")
            
            # Extract the file
            if extension == 'zip':
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(temp_dir)
            elif extension == 'tar.gz':
                with tarfile.open(file_path, 'r:gz') as tar_ref:
                    tar_ref.extractall(temp_dir)
            
            # Verify that the executable exists
            caddy_executable = temp_dir / executable
            if not caddy_executable.exists():
                raise FileNotFoundError(f"Caddy executable not found: {caddy_executable}")
            
            # Make the file executable on Unix systems
            if os.name != 'nt':
                os.chmod(caddy_executable, 0o755)
            
            logger.info("Caddy downloaded and extracted successfully.")
            return caddy_executable
            
        except requests.RequestException as e:
            logger.error(f"Error downloading Caddy: {e}")
            sys.exit(1)
        except Exception as e:
            logger.error(f"Error processing Caddy: {e}")
            sys.exit(1)

    def cleanup_caddy_temp(self):
        """Cleans up Caddy temporary files."""
        temp_dir = self.deploy_dir / 'tmp'
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
            logger.info("Caddy temporary files deleted.")


    def check_dependencies(self):
        """Verifies that necessary dependencies are installed."""
        logger.info("Checking dependencies...")
        try:
            subprocess.run(['mvn', '-v'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info("Maven is installed.")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("Maven is not installed or not found in PATH.")
            sys.exit(1)
        
        try:
            subprocess.run(['npm', '-v'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info("Node.js and npm are installed.")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("Node.js and npm are not installed or not found in PATH.")
            sys.exit(1)

    def build_backend(self):
        """Compiles the backend with Maven."""
        logger.info("Compiling backend...")
        try:
            subprocess.run(['mvn', 'clean', 'package', '-DskipTests'], cwd=self.backend_dir, check=True)
            logger.info("Backend compiled successfully.")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error compiling backend: {e}")
            sys.exit(1)

    def build_frontend(self):
        """Compiles the frontend with npm."""
        logger.info("Compiling frontend...")
        try:
            # Copy config template to public directory before building
            config_template = self.scripts_dir / 'config_templates' / 'config.template.js'
            config_dest = self.frontend_dir / 'public' / 'config.js'

            if config_template.exists():
                shutil.copy2(config_template, config_dest)
                logger.info(f"✓ Copied config template to: {config_dest}")
            else:
                logger.warning(f"✗ Config template not found: {config_template}")
            subprocess.run(['npm', 'install'], cwd=self.frontend_dir, check=True)
            subprocess.run(['npm', 'run', 'build'], cwd=self.frontend_dir, check=True)
            logger.info("Frontend compiled successfully.")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error compiling frontend: {e}")
            sys.exit(1)
    
    def copy_templates(self):
        """Copies template files to their corresponding locations."""
        logger.info("Copying template files...")
        mappings = [
            {
                'source': self.scripts_dir / 'config_templates' / 'application-properties.template',
                'destination': self.deploy_dir / 'config' / 'application.properties'
            },
            {
                'source': self.scripts_dir / 'config_templates' / 'Caddyfile.template',
                'destination': self.deploy_dir / 'config' / 'Caddyfile'
            },
        ]
        
        for mapping in mappings:
            source = mapping['source']
            destination = mapping['destination']
            
            try:
                if source.exists():
                    # Create destination directory if it doesn't exist
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    
                    # Copy file
                    shutil.copy2(source, destination)
                    logger.info(f"✓ Copied: {source} → {destination}")
                else:
                    logger.warning(f"✗ Not found: {source}")
            except Exception as e:
                logger.error(f"✗ Error copying {source} to {destination}: {e}")
    
    def compress_folder_deploy(self):
        if not self.deploy_dir.exists():
            raise FileNotFoundError(f"Deployment directory {self.deploy_dir} does not exist.")
        if not self.deploy_dir.is_dir():
            raise NotADirectoryError(f"{self.deploy_dir} is not a valid directory.")

        shutil.make_archive(self.project_root / self.name_final_file, 'zip', root_dir=self.deploy_dir) # In the future, the final file name needs to be parameterized
        logger.info(f"Directory {self.deploy_dir} compressed to {self.project_root / f'{self.name_final_file}.zip'}")

    def copy_files_after_deploy(self):
        """Copies compiled files to deployment directory."""
        logger.info("Copying files to deployment directory...")
        if not self.deploy_dir.exists():
            self.deploy_dir.mkdir(parents=True)
        
        if not self.deploy_bin_dir.exists():
            self.deploy_bin_dir.mkdir(parents=True)

        shutil.copytree(self.scripts_dir / 'bin_files', self.deploy_bin_dir, dirs_exist_ok=True)
        shutil.copytree(self.scripts_dir / 'config_files', self.deploy_config_dir, dirs_exist_ok=True)
        self.copy_templates()

    def deploy(self):
        """Generates deployment directory and copies necessary files."""
        logger.info("Deploying application...")
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
        
        # Download and integrate Caddy
        logger.info("Integrating Caddy...")
        caddy_executable = self.download_caddy()

        # Copy Caddy to lib directory
        caddy_dest = self.deploy_lib_dir / caddy_executable.name
        shutil.copy2(caddy_executable, caddy_dest)
        logger.info(f"Caddy copied to: {caddy_dest}")

        # Copy backend JAR
        jar_path = self.backend_target_dir / self.jar_name
        if not jar_path.exists():
            logger.error(f"JAR file not found: {jar_path}")
            sys.exit(1)            
        (self.deploy_lib_dir / 'backend').mkdir(parents=True)
        shutil.copy(jar_path, self.deploy_lib_dir / 'backend' / self.jar_name)


        # Copy frontend files
        if not self.frontend_build_dir.exists():
            logger.error(f"Frontend build directory not found: {self.frontend_build_dir}")
            sys.exit(1)
        shutil.copytree(self.frontend_build_dir, self.deploy_lib_dir / 'frontend')
        
        # Copy configuration files
        logger.info("Copying necessary files for installation...")
        self.copy_files_after_deploy()
        
        logger.info(f"Deployment completed at: {self.deploy_dir}")
        
        self.compress_folder_deploy()

        logger.info(f"Compressed file created at: {self.project_root / f'{self.name_final_file}.zip'}")


def main():
    parser = argparse.ArgumentParser(description='Compilation and deployment script for Task Manager')
    parser.add_argument('--action', choices=['build', 'deploy'], default='full',
                       help='Action to perform: build (compile only), deploy (deploy only), full (compile and deploy)')
    parser.add_argument('--backend-only', action='store_true',
                       help='Compile backend only')
    parser.add_argument('--frontend-only', action='store_true',
                       help='Compile frontend only')
    parser.add_argument('--name-jar-file', default='taskmanager.jar',
                       help='Backend JAR file name')
    parser.add_argument('--name-final-file', default='TaskManager',
                       help='Final compressed file name without extension')
    parser.add_argument('--platform', choices=['windows', 'linux', 'mac', 'darwin'], default='linux',
                       help='Target platform for Caddy download (default: linux)')
    parser.add_argument('--architecture', default='arm64',
                       help='Target architecture for Caddy download (default: arm64)')
    parser.add_argument('--specify-specifications', action='store_true',
                       help='Use specified platform and architecture instead of auto-detection')
    parser.add_argument('--version', default='1.0.0',
                       help='Application version (default: 1.0.0)')
    parser.add_argument('--caddy-version', default='v2.7.6',
                       help='Caddy version to download (default: v2.7.6)')
    

    args = parser.parse_args()

    # Get current script directory
    script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    build_manager = BuildTaskManager(
        script_dir, 
        name_jar_file=args.name_jar_file,
        name_final_file=args.name_final_file,
        caddy_version=args.caddy_version,
        specify_specifications=args.specify_specifications,
        target_platform=args.platform,
        target_architecture=args.architecture
    )

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

    logger.info("Process completed successfully.")
        


if __name__ == "__main__":
    main()