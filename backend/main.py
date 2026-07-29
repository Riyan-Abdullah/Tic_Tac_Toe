from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Optional
from pydantic import BaseModel
import jwt
import os

from app.core.ws_manager import manager

from app.routers import room, leaderboard, stats, history, profile, achievements, friends, chat, notifications, tournaments, admin, settings

app = FastAPI(title="TicTac Arena API", version="0.1.0")

# Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(room.router)
app.include_router(leaderboard.router)
app.include_router(stats.router)
app.include_router(history.router)
app.include_router(profile.router)
app.include_router(achievements.router)
app.include_router(friends.router)
app.include_router(chat.router)
app.include_router(notifications.router)
app.include_router(tournaments.router)
app.include_router(admin.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "TicTac Arena Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from app.core.auth import get_user_id_from_token

@app.websocket("/ws/game/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, token: str = Query(None)):
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user_id = get_user_id_from_token(token)
    
    connected = await manager.connect(room_code, user_id, websocket)
    if not connected:
        return
        
    try:
        while True:
            data = await websocket.receive_json()
            # Handle heartbeats
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                continue
                
            # Handle game actions
            await manager.handle_action(room_code, user_id, data)
            
    except WebSocketDisconnect:
        should_broadcast = manager.disconnect(room_code, user_id)
        if should_broadcast:
            # Notify remaining player that opponent disconnected
            await manager.broadcast(room_code, {"type": "opponent_disconnected", "user_id": user_id})

@app.websocket("/ws/global")
async def global_websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user_id = get_user_id_from_token(token)
    await manager.connect_global(user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                continue
                
            # Here we could handle incoming direct messages via WS, 
            # but usually we handle via REST and then push via WS.
            # E.g. typing indicators:
            if data.get("type") == "typing":
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_global_message(receiver_id, {
                        "type": "typing",
                        "sender_id": user_id
                    })
    except WebSocketDisconnect:
        manager.disconnect_global(user_id)
