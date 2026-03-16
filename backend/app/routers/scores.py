from fastapi import APIRouter
from pathlib import Path
from app.models.score import Score, SubmitScorePayload
import json

router = APIRouter(prefix='/scores', tags=['scores'])

DATA_DIR = Path(__file__).parent.parent / 'data'
SCORES_FILE = DATA_DIR / 'scores.json'


def _read_scores() -> list[dict]:
    return json.loads(SCORES_FILE.read_text(encoding='utf-8'))['scores']


def _write_scores(scores: list[dict]) -> None:
    SCORES_FILE.write_text(json.dumps({'scores': scores}, indent=2, ensure_ascii=False), encoding='utf-8')


@router.post('', status_code=201)
def submit_score(payload: SubmitScorePayload) -> Score:
    score = Score.from_payload(payload)
    scores = _read_scores()
    scores.append(score.model_dump())
    _write_scores(scores)
    return score


@router.get('')
def get_leaderboard(limit: int = 10):
    scores = _read_scores()
    sorted_scores = sorted(scores, key=lambda s: s['score'], reverse=True)
    return {'scores': sorted_scores[:limit]}


@router.get('/{username}')
def get_user_scores(username: str):
    scores = _read_scores()
    user_scores = [s for s in scores if s['username'].lower() == username.lower()]
    return {'scores': sorted(user_scores, key=lambda s: s['timestamp'], reverse=True)}
