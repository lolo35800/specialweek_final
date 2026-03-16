from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
import random

router = APIRouter(prefix='/quiz', tags=['quiz'])

DATA_DIR = Path(__file__).parent.parent / 'data'


@router.get('/questions')
def get_questions(shuffle: bool = False):
    data = json.loads((DATA_DIR / 'questions.json').read_text(encoding='utf-8'))
    questions = data['questions']
    if shuffle:
        random.shuffle(questions)
    return {'questions': questions}


@router.get('/questions/{question_id}')
def get_question(question_id: int):
    data = json.loads((DATA_DIR / 'questions.json').read_text(encoding='utf-8'))
    question = next((q for q in data['questions'] if q['id'] == question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail='Question not found')
    return question
