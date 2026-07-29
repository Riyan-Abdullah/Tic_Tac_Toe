from fastapi import APIRouter, HTTPException, Path, Query, Body
from app.core.database import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.get("/history")
async def get_chat_history(
    user_id: str = Query(...),
    other_user_id: Optional[str] = Query(None),
    room_id: Optional[str] = Query(None),
    limit: int = 50
):
    try:
        query = supabase.table("messages").select(
            "*, sender:profiles!messages_sender_id_fkey(username, avatar)"
        )
        
        if room_id:
            query = query.eq("room_id", room_id).eq("type", "game")
        elif other_user_id:
            query = query.or_(
                f"and(sender_id.eq.{user_id},receiver_id.eq.{other_user_id}),and(sender_id.eq.{other_user_id},receiver_id.eq.{user_id})"
            ).eq("type", "direct")
        else:
            raise HTTPException(status_code=400, detail="Must provide other_user_id or room_id")
            
        res = query.order("created_at", desc=False).limit(limit).execute()
        
        return {"messages": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatMessage(BaseModel):
    receiver_id: Optional[str] = None
    room_id: Optional[str] = None
    content: str
    type: str = "direct"

@router.post("/send")
async def send_message(
    user_id: str = Query(...),
    message: ChatMessage = Body(...)
):
    try:
        from app.core.ws_manager import manager
        
        # Save to DB
        res = supabase.table("messages").insert({
            "sender_id": user_id,
            "receiver_id": message.receiver_id,
            "room_id": message.room_id,
            "content": message.content,
            "type": message.type
        }).execute()
        
        new_msg = res.data[0]
        
        # Push to receiver via WS
        if message.type == "direct" and message.receiver_id:
            # We want to fetch sender profile to send complete msg payload
            prof = supabase.table("profiles").select("username, avatar").eq("id", user_id).execute()
            if prof.data:
                new_msg["sender"] = prof.data[0]
                
            await manager.send_global_message(message.receiver_id, {
                "type": "new_message",
                "message": new_msg
            })
            
        elif message.type == "game" and message.room_id:
            prof = supabase.table("profiles").select("username, avatar").eq("id", user_id).execute()
            if prof.data:
                new_msg["sender"] = prof.data[0]
                
            await manager.broadcast(message.room_id, {
                "type": "new_message",
                "message": new_msg
            })
            
        return {"status": "success", "message": new_msg}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
