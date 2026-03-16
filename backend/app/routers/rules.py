from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(tags=['rules'])

DATA_DIR = Path(__file__).parent.parent / 'data'


@router.get('/rules')
def get_rules():
    data = json.loads((DATA_DIR / 'rules.json').read_text(encoding='utf-8'))
    return data
