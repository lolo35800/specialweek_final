from pydantic import BaseModel
from typing import Literal
from datetime import datetime
import uuid


Module = Literal['quiz', 'fake_or_real', 'spot_zone']


class SubmitScorePayload(BaseModel):
    username: str
    score: int
    total: int
    module: Module


class Score(BaseModel):
    id: str
    username: str
    score: int
    total: int
    module: Module
    timestamp: str

    @classmethod
    def from_payload(cls, payload: SubmitScorePayload) -> 'Score':
        return cls(
            id=str(uuid.uuid4()),
            username=payload.username,
            score=payload.score,
            total=payload.total,
            module=payload.module,
            timestamp=datetime.utcnow().isoformat(),
        )
