#!/usr/bin/env python3
import subprocess
import platform
import sys

def kill_ports_unix(ports):
    for port in ports:
        try:
            # Encuentra los procesos que escuchan en el puerto y máta los procesos
            result = subprocess.run(f"lsof -ti:{port}", shell=True, capture_output=True, text=True)
            pids = result.stdout.strip().split('\n')
            pids = [pid for pid in pids if pid]
            if pids:
                subprocess.run(f"kill -9 {' '.join(pids)}", shell=True)
                print(f"Procesos en el puerto {port} detenidos: {', '.join(pids)}")
            else:
                print(f"No hay procesos escuchando en el puerto {port}.")
        except Exception as e:
            print(f"Error al detener procesos en el puerto {port}: {e}")

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
                print(f"Procesos en el puerto {port} detenidos: {', '.join(pids)}")
            else:
                print(f"No hay procesos escuchando en el puerto {port}.")
        except Exception as e:
            print(f"Error al detener procesos en el puerto {port}: {e}")

if __name__ == "__main__":
    ports = [8080, 3000]
    system = platform.system().lower()
    if system == "windows":
        kill_ports_windows(ports)
    elif system in ("linux", "darwin"):  # darwin = macOS
        kill_ports_unix(ports)
    else:
        print("Sistema operativo no soportado:", system)
        sys.exit(1)