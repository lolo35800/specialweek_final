from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter(prefix='/content', tags=['content'])

DATA_DIR = Path(__file__).parent.parent / 'data'


@router.get('/lessons')
def get_lessons():
    data = json.loads((DATA_DIR / 'lessons.json').read_text(encoding='utf-8'))
    return data


@router.get('/lessons/{lesson_id}')
def get_lesson(lesson_id: str):
    data = json.loads((DATA_DIR / 'lessons.json').read_text(encoding='utf-8'))
    lesson = next((l for l in data['lessons'] if l['id'] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail='Lesson not found')
    return lesson


@router.get('/gallery')
def get_gallery():
    data = json.loads((DATA_DIR / 'gallery.json').read_text(encoding='utf-8'))
    return data
