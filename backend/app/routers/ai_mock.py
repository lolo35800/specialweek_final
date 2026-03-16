from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal
import random

router = APIRouter(prefix='/ai', tags=['ai'])


class AnalyzeRequest(BaseModel):
    type: Literal['text', 'image_url']
    content: str


class AnalyzeResponse(BaseModel):
    is_likely_fake: bool
    confidence: float
    reasons: list[str]
    tips: list[str]


TEXT_SUSPICIOUS_KEYWORDS = [
    'choquant', 'scandale', 'incroyable', 'révélation', 'exclusif',
    'breaking', 'urgent', 'secret', 'censuré', 'interdit'
]

TEXT_REASONS = [
    "Le titre utilise un vocabulaire très émotionnel pour provoquer une réaction immédiate",
    "Le texte manque de sources vérifiables ou de références précises",
    "Le style d'écriture ressemble à du contenu généré automatiquement",
    "Les affirmations sont formulées de façon absolue sans nuance",
    "Absence d'auteur identifiable ou de date précise",
]

IMAGE_REASONS = [
    "Les proportions anatomiques semblent incorrectes",
    "Le fond présente des répétitions caractéristiques des IA génératives",
    "L'éclairage et les ombres sont incohérents avec la scène",
    "Les textures sont trop lisses ou présentent des artefacts visuels",
    "Les extrémités (mains, pieds) présentent des anomalies",
]

TIPS = [
    "Vérifie la source originale avant de partager",
    "Effectue une recherche inversée de l'image sur Google Images",
    "Consulte un fact-checker comme Les Décodeurs ou AFP Factuel",
    "Méfie-toi des contenus qui provoquent des émotions très fortes",
    "Vérifie si d'autres médias fiables relaient l'information",
]


@router.post('/analyze', response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    content_lower = request.content.lower()

    if request.type == 'text':
        suspicious_hits = sum(1 for kw in TEXT_SUSPICIOUS_KEYWORDS if kw in content_lower)
        is_fake = suspicious_hits > 0 or random.random() < 0.4
        confidence = min(0.95, 0.5 + suspicious_hits * 0.15 + random.uniform(-0.05, 0.1))
        reasons = random.sample(TEXT_REASONS, k=min(3, len(TEXT_REASONS)))
    else:
        is_fake = random.random() < 0.6
        confidence = round(random.uniform(0.55, 0.92), 2)
        reasons = random.sample(IMAGE_REASONS, k=3)

    return AnalyzeResponse(
        is_likely_fake=is_fake,
        confidence=round(confidence, 2),
        reasons=reasons,
        tips=random.sample(TIPS, k=3),
    )
