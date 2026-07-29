import json
import asyncio
from typing import Dict, List, Any
from fastapi import WebSocket

from app.core.database import supabase

# Game Logic Utilities for Server-Side Validation
WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], # Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], # Cols
    [0, 4, 8], [2, 4, 6]             # Diagonals
]

def check_winner(board: List[str | None]):
    for combo in WINNING_COMBINATIONS:
        a, b, c = combo
        if board[a] and board[a] == board[b] and board[a] == board[c]:
            return board[a], combo
    if all(cell is not None for cell in board):
        return 'Draw', None
    return None, None

class GameRoom:
    def __init__(self, room_code: str):
        self.room_code = room_code
        self.players: Dict[str, WebSocket] = {} # user_id -> ws
        self.player_symbols: Dict[str, str] = {} # user_id -> 'X' or 'O'
        self.spectators: Dict[str, WebSocket] = {} # user_id -> ws
        
        # Game State
        self.board: List[str | None] = [None] * 9
        self.x_is_next: bool = True
        self.winner: str | None = None
        self.winning_line: List[int] | None = None
        self.restart_votes: set = set()
        
    def add_player(self, user_id: str, ws: WebSocket):
        if len(self.players) < 2 and user_id not in self.players:
            self.players[user_id] = ws
            if len(self.player_symbols) == 0:
                self.player_symbols[user_id] = 'X'
            elif len(self.player_symbols) == 1 and user_id not in self.player_symbols:
                self.player_symbols[user_id] = 'O'
        else:
            # Add as spectator
            self.spectators[user_id] = ws
            
    def remove_player(self, user_id: str):
        if user_id in self.players:
            del self.players[user_id]
        if user_id in self.spectators:
            del self.spectators[user_id]
            
    def reset_game(self):
        self.board = [None] * 9
        self.x_is_next = True
        self.winner = None
        self.winning_line = None
        self.restart_votes.clear()
        
    def get_state(self):
        return {
            "board": self.board,
            "xIsNext": self.x_is_next,
            "winner": self.winner,
            "winningLine": self.winning_line,
            "players": {uid: sym for uid, sym in self.player_symbols.items()},
            "restartVotes": list(self.restart_votes)
        }

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, GameRoom] = {} # room_code -> GameRoom
        self.disconnect_timers: Dict[str, asyncio.Task] = {} # room_code_userid -> Task
        self.global_connections: Dict[str, WebSocket] = {} # user_id -> WebSocket for notifications and chat

    async def connect_global(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.global_connections[user_id] = websocket
        
    def disconnect_global(self, user_id: str):
        if user_id in self.global_connections:
            del self.global_connections[user_id]
            
    async def send_global_message(self, user_id: str, message: dict):
        if user_id in self.global_connections:
            try:
                await self.global_connections[user_id].send_json(message)
            except Exception:
                self.disconnect_global(user_id)

    async def connect(self, room_code: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        
        if room_code not in self.active_connections:
            self.active_connections[room_code] = GameRoom(room_code)
            
        room = self.active_connections[room_code]
        
        # Limit to 2 players max for active gameplay
        if len(room.players) >= 2 and user_id not in room.players:
            await websocket.send_json({"type": "error", "message": "Room is full"})
            await websocket.close()
            return False
            
        room.add_player(user_id, websocket)
        
        # Cancel disconnect timer if reconnecting
        timer_key = f"{room_code}_{user_id}"
        if timer_key in self.disconnect_timers:
            self.disconnect_timers[timer_key].cancel()
            del self.disconnect_timers[timer_key]
            
        destroy_key = f"{room_code}_destroy"
        if destroy_key in self.disconnect_timers:
            self.disconnect_timers[destroy_key].cancel()
            del self.disconnect_timers[destroy_key]
        
        await self.broadcast_state(room_code)
        
        # If two players are connected, broadcast that the match has started/resumed
        if len(room.players) == 2:
            await self.broadcast(room_code, {"type": "match_started"})
            
        return True

    def disconnect(self, room_code: str, user_id: str):
        if room_code in self.active_connections:
            room = self.active_connections[room_code]
            room.remove_player(user_id)
            
            if len(room.players) == 0:
                # Both left, start a 5-second timer before destroying the room
                # to allow for route transitions (unmount -> mount)
                timer_key = f"{room_code}_destroy"
                
                async def destroy_room():
                    await asyncio.sleep(5)
                    if room_code in self.active_connections:
                        r = self.active_connections[room_code]
                        if len(r.players) == 0:
                            del self.active_connections[room_code]
                            try:
                                supabase.table("rooms").delete().eq("room_code", room_code).execute()
                            except:
                                pass
                
                self.disconnect_timers[timer_key] = asyncio.create_task(destroy_room())
                return False
            else:
                # One player left, start timer for forfeit
                timer_key = f"{room_code}_{user_id}"
                self.disconnect_timers[timer_key] = asyncio.create_task(self.handle_timeout(room_code, user_id))
                return True
        return False
        
    async def handle_timeout(self, room_code: str, user_id: str):
        await asyncio.sleep(30) # 30 seconds to reconnect
        if room_code in self.active_connections:
            room = self.active_connections[room_code]
            if user_id not in room.players:
                # Player didn't reconnect
                symbol = room.player_symbols.get(user_id)
                winner = 'O' if symbol == 'X' else 'X'
                room.winner = winner
                # Notify remaining player
                await self.broadcast_state(room_code)
                await self.broadcast(room_code, {"type": "forfeit", "message": "Opponent forfeited."})
                await self.record_match(room_code, room)

    async def handle_action(self, room_code: str, user_id: str, action: dict):
        if room_code not in self.active_connections:
            return
            
        room = self.active_connections[room_code]
        action_type = action.get("type")
        
        if action_type == "move":
            index = action.get("index")
            if room.winner or index is None or index < 0 or index > 8 or room.board[index] is not None:
                return # Invalid move
                
            # Both players must be present to move
            if len(room.players) < 2:
                return
                
            symbol = room.player_symbols.get(user_id)
            if not symbol:
                return
                
            is_turn = (room.x_is_next and symbol == 'X') or (not room.x_is_next and symbol == 'O')
            if not is_turn:
                return # Not player's turn
                
            # Apply move
            room.board[index] = symbol
            room.x_is_next = not room.x_is_next
            
            # Check winner
            winner, line = check_winner(room.board)
            if winner:
                room.winner = winner
                room.winning_line = line
                await self.record_match(room_code, room)
                
            await self.broadcast_state(room_code)
            
        elif action_type == "restart_vote":
            room.restart_votes.add(user_id)
            await self.broadcast_state(room_code)
            
            # If both players voted to restart
            if len(room.restart_votes) >= 2:
                room.reset_game()
                await self.broadcast(room_code, {"type": "game_restarted"})
                await self.broadcast_state(room_code)
                
        elif action_type == "leave":
            self.disconnect(room_code, user_id)
            await self.broadcast(room_code, {"type": "opponent_disconnected"})

    async def record_match(self, room_code: str, room: GameRoom):
        try:
            player_x_id = None
            player_o_id = None
            for uid, sym in room.player_symbols.items():
                if sym == 'X':
                    player_x_id = uid
                else:
                    player_o_id = uid
                    
            if not player_x_id or not player_o_id:
                return # Can't record match if both players aren't known
                
            winner_id = None
            result = "draw"
            
            if room.winner != 'Draw':
                # find user_id for symbol
                for uid, sym in room.player_symbols.items():
                    if sym == room.winner:
                        winner_id = uid
                        result = "win_x" if sym == 'X' else "win_o"
                        break
            
            moves = sum(1 for cell in room.board if cell is not None)
            
            # 1. Insert into match_history
            supabase.table("match_history").insert({
                "player_x": player_x_id,
                "player_o": player_o_id,
                "winner_id": winner_id,
                "result": result,
                "game_mode": "online",
                "moves": moves,
                "room_code": room_code
            }).execute()
            
            # 2. Update profiles for both players
            def get_new_rank(rating):
                if rating < 1000: return 'Beginner'
                if rating < 1200: return 'Bronze'
                if rating < 1400: return 'Silver'
                if rating < 1600: return 'Gold'
                if rating < 1800: return 'Platinum'
                if rating < 2000: return 'Diamond'
                if rating < 2200: return 'Master'
                if rating < 2400: return 'Grandmaster'
                return 'Legend'
                
            async def update_profile(uid, is_winner, is_draw):
                try:
                    prof_res = supabase.table("profiles").select("*").eq("id", uid).execute()
                    if prof_res.data:
                        prof = prof_res.data[0]
                        rating = prof.get('rating', 1000)
                        wins = prof.get('wins', 0)
                        losses = prof.get('losses', 0)
                        draws = prof.get('draws', 0)
                        games_played = prof.get('games_played', 0) + 1
                        current_streak = prof.get('current_streak', 0)
                        best_streak = prof.get('best_streak', 0)
                        
                        if is_draw:
                            draws += 1
                            current_streak = 0
                            rating_change = 0 # Simple logic
                        elif is_winner:
                            wins += 1
                            current_streak += 1
                            if current_streak > best_streak:
                                best_streak = current_streak
                            rating_change = 30
                        else:
                            losses += 1
                            current_streak = 0
                            rating_change = -25
                            
                        new_rating = max(0, rating + rating_change)
                        new_rank = get_new_rank(new_rating)
                        
                        supabase.table("profiles").update({
                            "rating": new_rating,
                            "rank": new_rank,
                            "wins": wins,
                            "losses": losses,
                            "draws": draws,
                            "games_played": games_played,
                            "current_streak": current_streak,
                            "best_streak": best_streak,
                        }).eq("id", uid).execute()
                except Exception as ex:
                    print(f"Failed to update profile for {uid}: {ex}")
                    
            await asyncio.gather(
                update_profile(player_x_id, winner_id == player_x_id, winner_id is None),
                update_profile(player_o_id, winner_id == player_o_id, winner_id is None)
            )

        except Exception as e:
            print(f"Error recording match: {e}")

    async def broadcast_state(self, room_code: str):
        if room_code in self.active_connections:
            room = self.active_connections[room_code]
            state = room.get_state()
            await self.broadcast(room_code, {"type": "sync_state", "state": state})

    async def broadcast(self, room_code: str, message: dict):
        if room_code in self.active_connections:
            room = self.active_connections[room_code]
            dead_connections = []
            
            # Broadcast to players
            for user_id, ws in room.players.items():
                try:
                    await ws.send_json(message)
                except Exception:
                    dead_connections.append(user_id)
                    
            # Broadcast to spectators
            for user_id, ws in room.spectators.items():
                try:
                    await ws.send_json(message)
                except Exception:
                    dead_connections.append(user_id)
            
            for uid in dead_connections:
                should_broadcast = self.disconnect(room_code, uid)
                if should_broadcast:
                    await self.broadcast(room_code, {"type": "opponent_disconnected", "user_id": uid})

manager = ConnectionManager()
