from fastapi import APIRouter, HTTPException, Path, Query, Body
from app.core.database import supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/friends", tags=["Friends"])

class FriendRequest(BaseModel):
    receiver_id: str

class FriendStatusUpdate(BaseModel):
    status: str # 'accepted', 'rejected', 'blocked'

@router.get("/{user_id}")
async def get_friends(user_id: str = Path(...), status: str = Query("active")):
    try:
        # We need to get friends where user_id is either user_id_1 or user_id_2 and status is active
        res = supabase.table("friends").select(
            "*, user1:profiles!friends_user_id_1_fkey(id, username, avatar, rating, last_active), user2:profiles!friends_user_id_2_fkey(id, username, avatar, rating, last_active)"
        ).or_(f"user_id_1.eq.{user_id},user_id_2.eq.{user_id}").eq("status", status).execute()
        
        friends_list = []
        for f in res.data:
            # Flatten to just the friend's profile
            friend_profile = f["user2"] if f["user_id_1"] == user_id else f["user1"]
            if friend_profile:
                friend_profile["friendship_id"] = f["id"]
                friend_profile["friendship_status"] = f["status"]
                friends_list.append(friend_profile)
                
        return {"friends": friends_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/requests/{user_id}")
async def get_friend_requests(user_id: str = Path(...)):
    try:
        res = supabase.table("friend_requests").select(
            "*, sender:profiles!friend_requests_sender_id_fkey(id, username, avatar, rating)"
        ).eq("receiver_id", user_id).eq("status", "pending").execute()
        return {"requests": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/requests/send/{sender_id}")
async def send_request(sender_id: str = Path(...), req: FriendRequest = Body(...)):
    try:
        if sender_id == req.receiver_id:
            raise HTTPException(status_code=400, detail="Cannot send request to yourself")
            
        # Check if already friends
        friend_check = supabase.table("friends").select("*").or_(
            f"and(user_id_1.eq.{sender_id},user_id_2.eq.{req.receiver_id}),and(user_id_1.eq.{req.receiver_id},user_id_2.eq.{sender_id})"
        ).execute()
        
        if friend_check.data:
            raise HTTPException(status_code=400, detail="Already friends or blocked")
            
        res = supabase.table("friend_requests").insert({
            "sender_id": sender_id,
            "receiver_id": req.receiver_id
        }).execute()
        
        return {"status": "success", "request": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/requests/handle/{request_id}")
async def handle_request(request_id: str = Path(...), update: FriendStatusUpdate = Body(...)):
    try:
        # Get request
        req_res = supabase.table("friend_requests").select("*").eq("id", request_id).execute()
        if not req_res.data:
            raise HTTPException(status_code=404, detail="Request not found")
            
        req = req_res.data[0]
        
        # Update request status
        supabase.table("friend_requests").update({"status": update.status}).eq("id", request_id).execute()
        
        if update.status == "accepted":
            # Add to friends
            u1, u2 = sorted([req["sender_id"], req["receiver_id"]])
            new_friend = supabase.table("friends").insert({
                "user_id_1": u1,
                "user_id_2": u2,
                "status": "active"
            }).execute()
            return {"status": "accepted", "friendship": new_friend.data[0]}
            
        return {"status": "rejected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{friendship_id}")
async def remove_friend(friendship_id: str = Path(...)):
    try:
        res = supabase.table("friends").delete().eq("id", friendship_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
