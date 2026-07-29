import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not set in environment variables.")
    # Initialize with dummy values so the app doesn't crash on startup if not fully configured yet
    SUPABASE_URL = "https://placeholder.supabase.co"
    SUPABASE_KEY = "placeholder_key"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
