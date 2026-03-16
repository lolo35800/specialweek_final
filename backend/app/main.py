from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import content, quiz, scores, ai_mock, rules

app = FastAPI(
    title="VériIA API",
    description="Portail de sensibilisation à la désinformation par l'IA — Capgemini × SupDeVinci",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content.router)
app.include_router(quiz.router)
app.include_router(scores.router)
app.include_router(ai_mock.router)
app.include_router(rules.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "app": "VériIA API", "version": "1.0.0"}
