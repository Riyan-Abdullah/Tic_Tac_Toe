from fastapi import APIRouter, HTTPException, Path as FastAPIPath, Body, File, UploadFile
from app.core.database import supabase
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from pathlib import Path

router = APIRouter(prefix="/profile", tags=["Profile"])

UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "frontend" / "public" / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        ext = file.filename.split(".")[-1] if "." in file.filename else "png"
        filename = f"{uuid.uuid4().hex}.{ext}"
        
        file_path = UPLOAD_DIR / filename
        
        # Read and save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            
        return {"url": f"/uploads/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    avatar: Optional[str] = None
    banner: Optional[str] = None

@router.get("/{username}")
async def get_profile(username: str = FastAPIPath(..., title="Username")):
    try:
        res = supabase.table("profiles").select("*").eq("username", username).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        profile = res.data[0]
        
        # Get recent matches
        matches_res = supabase.table("match_history").select("*").or_(f"player_x.eq.{profile['id']},player_o.eq.{profile['id']}").order("created_at", desc=True).limit(5).execute()
        profile["recent_matches"] = matches_res.data
        
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update/{user_id}")
async def update_profile(
    user_id: str = FastAPIPath(...),
    update_data: ProfileUpdate = Body(...)
):
    try:
        data = {}
        if update_data.bio is not None:
            data["bio"] = update_data.bio
        if update_data.avatar is not None:
            data["avatar"] = update_data.avatar
        if update_data.banner is not None:
            data["banner"] = update_data.banner
            
        if not data:
            return {"status": "no changes"}
            
        res = supabase.table("profiles").update(data).eq("id", user_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=400, detail="Update failed")
            
        return {"status": "success", "profile": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
