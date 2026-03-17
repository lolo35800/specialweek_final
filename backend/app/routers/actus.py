import urllib.request
import xml.etree.ElementTree as ET
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import time
from datetime import datetime
import re

router = APIRouter(prefix="/actus", tags=["actus"])

class Actu(BaseModel):
    id: str
    date: str
    timestamp: int
    categorie: str
    titre: str
    resume: str
    source: str
    lien: str
    une: Optional[bool] = False

# Simple in-memory cache
_cache = {
    "data": None,
    "timestamp": 0
}
CACHE_TTL = 3600  # 1 hour in seconds

def clean_html(raw_html):
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext

def fetch_rss_actus() -> List[Actu]:
    global _cache
    now = time.time()
    
    if _cache["data"] is not None and (now - _cache["timestamp"]) < CACHE_TTL:
        return _cache["data"]

    url = "https://news.google.com/rss/search?q=intelligence+artificielle+when:7d&hl=fr&gl=FR&ceid=FR:fr"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        actus = []
        
        # Google News RSS format: channel -> item
        items = root.findall('.//item')
        
        for i, item in enumerate(items[:50]): # Take top 50
            title = item.find('title').text if item.find('title') is not None else "Nouvelle Actu IA"
            # Google news title often includes the source at the end " - Source"
            source = "Google News"
            if " - " in title:
                parts = title.rsplit(" - ", 1)
                title = parts[0]
                source = parts[1]
                
            link = item.find('link').text if item.find('link') is not None else "#"
            description = item.find('description').text if item.find('description') is not None else ""
            pub_date_str = item.find('pubDate').text if item.find('pubDate') is not None else ""
            
            # clean description
            resume = clean_html(description)
            if len(resume) > 150:
                resume = resume[:147] + "..."
            elif not resume:
                resume = "Découvrez la dernière actualité sur l'intelligence artificielle."
                
            # Parse date (e.g. Tue, 17 Mar 2026 13:00:00 GMT)
            date_str = pub_date_str
            dt = datetime.fromtimestamp(now) # Fallback
            try:
                dt = datetime.strptime(pub_date_str, "%a, %d %b %Y %H:%M:%S %Z")
                # Format to e.g. "17 mars 2026"
                months = ["janv.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
                date_str = f"{dt.day} {months[dt.month - 1]} {dt.year}"
            except Exception:
                pass
                
            # Determine category based on keywords
            text_for_category = (title + " " + resume).lower()
            categorie = "IA & Tech"
            if any(w in text_for_category for w in ["école", "ecole", "lycée", "lycee", "collège", "college", "élève", "eleve", "professeur", "prof", "éducation"]):
                categorie = "Éducation"
            elif any(w in text_for_category for w in ["élection", "election", "politique", "gouvernement", "loi", "guerre", "ministre", "député", "vote", "candidat"]):
                categorie = "Politique"
            elif any(w in text_for_category for w in ["réseau", "reseau", "tiktok", "instagram", "facebook", "twitter", "x", "social"]):
                categorie = "Réseaux Sociaux"
            elif any(w in text_for_category for w in ["argent", "économie", "entreprise", "startup", "bourse", "nvidia", "microsoft", "google", "openai"]):
                categorie = "Business"
            elif any(w in text_for_category for w in ["arnaque", "cyber", "hacker", "sécurité", "phishing"]):
                categorie = "Cybersécurité"
                
            actus.append(Actu(
                id=f"rss-{i}-{int(now)}",
                date=date_str,
                timestamp=int(dt.timestamp()),
                categorie=categorie,
                titre=title,
                resume=resume,
                source=source,
                lien=link,
                une=False # Will be set after sorting
            ))
            
        # Sort chronologically (most recent first)
        actus.sort(key=lambda x: x.timestamp, reverse=True)
        
        # Mark the top one as 'une' for the home page
        if actus:
            actus[0].une = True
            
        _cache["data"] = actus
        _cache["timestamp"] = now
        return actus
        
    except Exception as e:
        print(f"Error fetching RSS: {e}")
        return []

@router.get("/")
def get_actus():
    return fetch_rss_actus()
