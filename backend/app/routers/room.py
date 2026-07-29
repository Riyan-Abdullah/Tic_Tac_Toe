from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import random
import string
from app.core.database import supabase
from app.core.auth import get_current_user

router = APIRouter(prefix="/room", tags=["Room"])

def generate_room_code(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

class CreateRoomResponse(BaseModel):
    room_code: str
    room_id: str

class JoinRoomRequest(BaseModel):
    room_code: str

class JoinRoomResponse(BaseModel):
    success: bool
    message: str

@router.post("/create", response_model=CreateRoomResponse)
async def create_room(user_id: str = Depends(get_current_user)):
    # Generate unique code
    max_attempts = 5
    for _ in range(max_attempts):
        code = generate_room_code()
        # Check if exists
        try:
            res = supabase.table("rooms").select("id").eq("room_code", code).execute()
            if not res.data:
                # Insert room
                insert_res = supabase.table("rooms").insert({
                    "room_code": code,
                    "player_x": user_id,
                    "status": "waiting"
                }).execute()
                
                if insert_res.data:
                    return CreateRoomResponse(
                        room_code=code, 
                        room_id=str(insert_res.data[0]["id"])
                    )
        except Exception as e:
            print(f"Error checking/creating room: {e}")
            raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")
            
    raise HTTPException(status_code=500, detail="Could not generate unique room code")

@router.post("/join", response_model=JoinRoomResponse)
async def join_room(req: JoinRoomRequest, user_id: str = Depends(get_current_user)):
    code = req.room_code.upper()
    try:
        res = supabase.table("rooms").select("*").eq("room_code", code).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Room not found")
            
        room = res.data[0]
        
        # Check if full
        if room["status"] != "waiting" and room["player_o"] and room["player_x"]:
            # If user is already in the room, it's fine
            if room["player_x"] != user_id and room["player_o"] != user_id:
                raise HTTPException(status_code=400, detail="Room is full")
                
        # If user is joining as O
        if room["player_x"] != user_id and not room["player_o"]:
            update_res = supabase.table("rooms").update({
                "player_o": user_id,
                "status": "playing"
            }).eq("id", room["id"]).execute()
            
            if not update_res.data:
                raise HTTPException(status_code=500, detail="Failed to join room")
                
        return JoinRoomResponse(success=True, message="Successfully joined room")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error joining room: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
