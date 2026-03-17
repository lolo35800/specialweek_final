#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "=============================================="
echo " Démarrage de VériIA"
echo "=============================================="

# ── Backend (FastAPI) ──────────────────────────────
echo ""
echo "[ Backend ] Vérification..."
cd "$ROOT/backend"

if [ ! -d "venv" ]; then
  echo "[ Backend ] Création du virtualenv..."
  python3 -m venv venv
fi

if ! venv/bin/pip show fastapi &>/dev/null; then
  echo "[ Backend ] Installation des dépendances..."
  venv/bin/pip install -r requirements.txt --quiet
fi

echo "[ Backend ] Démarrage sur http://localhost:8000"
venv/bin/python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# ── Frontend (Vite) ────────────────────────────────
echo ""
echo "[ Frontend ] Vérification..."
cd "$ROOT/application"

if [ ! -d "node_modules" ]; then
  echo "[ Frontend ] Installation des dépendances npm..."
  npm install
fi

echo "[ Frontend ] Démarrage sur http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

# ── Résumé ─────────────────────────────────────────
echo ""
echo "=============================================="
echo " Les deux serveurs tournent :"
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:5173"
echo " Ctrl+C pour tout arrêter."
echo "=============================================="

# Arrêter les deux processus proprement au Ctrl+C
trap "echo ''; echo 'Arrêt...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
