import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use service role key to bypass RLS

supabase: Client = create_client(url, key)

try:
    print("Checking if 'profiles' bucket exists...")
    buckets = supabase.storage.list_buckets()
    bucket_exists = any(b.name == 'profiles' for b in buckets)
    
    if not bucket_exists:
        print("Creating 'profiles' bucket...")
        supabase.storage.create_bucket("profiles", {"public": True})
        print("Bucket 'profiles' created successfully!")
    else:
        print("Bucket 'profiles' already exists.")
except Exception as e:
    print(f"Error: {e}")
