from fastapi import APIRouter, HTTPException, Path
from app.core.database import supabase

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/{user_id}")
async def get_stats(user_id: str = Path(..., title="The UUID of the user")):
    try:
        # Get basic profile stats
        prof_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not prof_res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        profile = prof_res.data[0]
        
        # We can aggregate match_history for more advanced stats like average duration, favorite mode
        match_res = supabase.table("match_history").select("*").or_(f"player_x.eq.{user_id},player_o.eq.{user_id}").execute()
        
        matches = match_res.data
        
        total_duration = 0
        total_moves = 0
        fastest_victory = None
        longest_match = 0
        modes_count = {}
        diff_count = {}
        
        for m in matches:
            dur = m.get("duration_seconds")
            moves = m.get("moves")
            if dur:
                total_duration += dur
                if dur > longest_match:
                    longest_match = dur
                if m.get("winner_id") == user_id:
                    if fastest_victory is None or dur < fastest_victory:
                        fastest_victory = dur
                        
            if moves:
                total_moves += moves
                
            mode = m.get("game_mode")
            if mode:
                modes_count[mode] = modes_count.get(mode, 0) + 1
                
            diff = m.get("difficulty")
            if diff:
                diff_count[diff] = diff_count.get(diff, 0) + 1

        games = profile.get("games_played", 0)
        avg_duration = round(total_duration / games) if games > 0 else 0
        avg_moves = round(total_moves / games) if games > 0 else 0
        
        favorite_mode = max(modes_count, key=modes_count.get) if modes_count else "online"
        favorite_difficulty = max(diff_count, key=diff_count.get) if diff_count else "N/A"
        
        win_rate = 0
        if games > 0:
            win_rate = round((profile.get("wins", 0) / games) * 100, 1)
        
        return {
            "overview": {
                "games_played": games,
                "wins": profile.get("wins", 0),
                "losses": profile.get("losses", 0),
                "draws": profile.get("draws", 0),
                "win_rate": win_rate,
                "rating": profile.get("rating", 1000),
                "rank": profile.get("rank", "Beginner"),
                "current_streak": profile.get("current_streak", 0),
                "best_streak": profile.get("best_streak", 0),
            },
            "advanced": {
                "average_duration": avg_duration,
                "average_moves": avg_moves,
                "fastest_victory": fastest_victory,
                "longest_match": longest_match,
                "favorite_mode": favorite_mode,
                "favorite_difficulty": favorite_difficulty
            },
            "recent_matches": matches[-10:] # Return the last 10 for quick charts/history
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
