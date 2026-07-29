import jwt
import os
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_user_id_from_token(token: str) -> str:
    secret = os.environ.get("SUPABASE_JWT_SECRET")
    try:
        if secret:
            payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
        else:
            payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("sub", "anonymous")
    except Exception as e:
        print(f"JWT decode error: {e}")
        return "anonymous"

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    token = credentials.credentials
    user_id = get_user_id_from_token(token)
    if user_id == "anonymous":
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id
