import os
import sys
import threading
import subprocess
import time
from pathlib import Path
import shutil


def pick_python_executable() -> str:
    """
    Prefer local virtualenv Python if present, otherwise fall back to system 'python'.
    """
    cwd = Path(__file__).parent
    # Windows venv layout
    venv_py_win = cwd / ".venv" / "Scripts" / "python.exe"
    if venv_py_win.exists():
        return str(venv_py_win)
    # POSIX venv layout
    venv_py_posix = cwd / ".venv" / "bin" / "python"
    if venv_py_posix.exists():
        return str(venv_py_posix)
    # Fallback
    return "python"


def stream_output(proc: subprocess.Popen, prefix: str):
    """Continuously forward a child process' stdout/stderr with a prefix."""
    def forward(stream, is_err=False):
        for line in iter(stream.readline, b""):
            try:
                text = line.decode(errors="replace").rstrip()
            except Exception:
                text = str(line).rstrip()
            out = sys.stderr if is_err else sys.stdout
            out.write(f"[{prefix}] {text}\n")
            out.flush()

    t_out = threading.Thread(target=forward, args=(proc.stdout, False), daemon=True)
    t_err = threading.Thread(target=forward, args=(proc.stderr, True), daemon=True)
    t_out.start()
    t_err.start()
    return t_out, t_err


def main():
    repo_root = Path(__file__).parent

    python_exe = pick_python_executable()

    # Commands
    backend_cwd = repo_root / "backend"
    frontend_cwd = repo_root / "frontend"

    if not (backend_cwd / "run.py").exists():
        print("[orchestrator] backend/run.py not found. Aborting.", file=sys.stderr)
        sys.exit(1)

    if not (frontend_cwd / "package.json").exists():
        print("[orchestrator] frontend/package.json not found. Aborting.", file=sys.stderr)
        sys.exit(1)

    env = os.environ.copy()
    # Encourage Flask development config if not set
    env.setdefault("FLASK_ENV", "development")

    # Start backend (Flask on port 5000)
    backend_cmd = [python_exe, "run.py"]
    print(f"[orchestrator] Starting backend: {' '.join(backend_cmd)} (cwd=backend)")
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(backend_cwd),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1,
    )

    # Start frontend (Vite dev server) with Windows-friendly fallbacks
    def pick_frontend_cmd():
        # Prefer npm if available
        npm_exec = shutil.which("npm") or shutil.which("npm.cmd")
        if npm_exec:
            return [npm_exec, "run", "dev"]
        # Fallback to npx vite
        npx_exec = shutil.which("npx") or shutil.which("npx.cmd")
        if npx_exec:
            return [npx_exec, "vite"]
        # Last resort: try vite directly (node_modules/.bin should be on PATH when using npm scripts, but try anyway)
        vite_exec = shutil.which("vite") or shutil.which("vite.cmd")
        if vite_exec:
            return [vite_exec]
        # If none found, raise a clear error
        raise FileNotFoundError("No se encontró npm/npx/vite en PATH. Instala Node.js o abre una terminal con npm disponible.")

    frontend_cmd = pick_frontend_cmd()
    print(f"[orchestrator] Starting frontend: {' '.join(frontend_cmd)} (cwd=frontend)")
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(frontend_cwd),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1,
    )

    # Stream outputs
    bt_out, bt_err = stream_output(backend_proc, "backend")
    ft_out, ft_err = stream_output(frontend_proc, "frontend")

    procs = {
        "backend": backend_proc,
        "frontend": frontend_proc,
    }

    try:
        # Monitor processes; exit if either stops
        while True:
            time.sleep(0.5)
            for name, proc in list(procs.items()):
                ret = proc.poll()
                if ret is not None:
                    print(f"[orchestrator] {name} exited with code {ret}. Shutting down the other process...")
                    # Terminate the other process
                    for other_name, other_proc in procs.items():
                        if other_name != name and other_proc.poll() is None:
                            try:
                                other_proc.terminate()
                            except Exception:
                                pass
                    # Give them a moment to exit
                    time.sleep(1.0)
                    for other_name, other_proc in procs.items():
                        if other_proc.poll() is None:
                            try:
                                other_proc.kill()
                            except Exception:
                                pass
                    sys.exit(ret if ret is not None else 1)
    except KeyboardInterrupt:
        print("\n[orchestrator] Ctrl+C received. Stopping both processes...")
        for proc in procs.values():
            if proc.poll() is None:
                try:
                    proc.terminate()
                except Exception:
                    pass
        time.sleep(1.0)
        for proc in procs.values():
            if proc.poll() is None:
                try:
                    proc.kill()
                except Exception:
                    pass
    finally:
        # Ensure threads can finish
        time.sleep(0.2)


if __name__ == "__main__":
    main()
