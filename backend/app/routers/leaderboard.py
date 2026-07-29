from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import supabase
from typing import Optional

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/")
async def get_leaderboard(
    limit: int = 50,
    offset: int = 0,
    sort_by: str = Query("rating", enum=["rating", "wins", "win_rate", "games_played"])
):
    try:
        query = supabase.table("profiles").select(
            "id, username, avatar, rating, rank, wins, losses, draws, games_played, current_streak, last_active"
        )
        
        # In Supabase/PostgREST, we can order by column
        if sort_by != "win_rate":
            query = query.order(sort_by, desc=True)
            
        query = query.range(offset, offset + limit - 1)
        res = query.execute()
        
        players = []
        for p in res.data:
            win_rate = 0
            if p.get("games_played", 0) > 0:
                win_rate = round((p.get("wins", 0) / p.get("games_played", 0)) * 100, 1)
            p["win_rate"] = win_rate
            players.append(p)
            
        if sort_by == "win_rate":
            players.sort(key=lambda x: x["win_rate"], reverse=True)
            
        return {"players": players}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
