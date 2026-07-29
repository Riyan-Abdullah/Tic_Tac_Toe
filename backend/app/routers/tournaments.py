from fastapi import APIRouter, HTTPException, Path, Body
from app.core.database import supabase
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

class TournamentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    max_players: int = 16
    creator_id: str

@router.get("/")
async def get_tournaments():
    try:
        res = supabase.table("tournaments").select("*").order("created_at", desc=True).execute()
        return {"tournaments": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_tournament(req: TournamentCreate = Body(...)):
    try:
        res = supabase.table("tournaments").insert({
            "name": req.name,
            "description": req.description,
            "max_players": req.max_players,
            "creator_id": req.creator_id,
            "status": "upcoming"
        }).execute()
        
        # Auto-join creator
        tournament = res.data[0]
        supabase.table("tournament_players").insert({
            "tournament_id": tournament["id"],
            "user_id": req.creator_id
        }).execute()
        
        return {"status": "success", "tournament": tournament}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{tournament_id}")
async def get_tournament(tournament_id: str = Path(...)):
    try:
        res = supabase.table("tournaments").select("*").eq("id", tournament_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Tournament not found")
            
        tournament = res.data[0]
        
        # Get players
        players_res = supabase.table("tournament_players").select("user:profiles!tournament_players_user_id_fkey(*)").eq("tournament_id", tournament_id).execute()
        tournament["players"] = [p["user"] for p in players_res.data]
        
        # Get matches
        matches_res = supabase.table("tournament_matches").select(
            "*, player1:profiles!tournament_matches_player1_id_fkey(username), player2:profiles!tournament_matches_player2_id_fkey(username)"
        ).eq("tournament_id", tournament_id).order("round_number").execute()
        tournament["matches"] = matches_res.data
        
        return tournament
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{tournament_id}/join/{user_id}")
async def join_tournament(tournament_id: str = Path(...), user_id: str = Path(...)):
    try:
        # Check if full
        tourn = supabase.table("tournaments").select("max_players").eq("id", tournament_id).execute()
        if not tourn.data:
            raise HTTPException(status_code=404, detail="Tournament not found")
            
        max_p = tourn.data[0]["max_players"]
        
        players = supabase.table("tournament_players").select("user_id", count="exact").eq("tournament_id", tournament_id).execute()
        if players.count >= max_p:
            raise HTTPException(status_code=400, detail="Tournament is full")
            
        res = supabase.table("tournament_players").insert({
            "tournament_id": tournament_id,
            "user_id": user_id
        }).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
