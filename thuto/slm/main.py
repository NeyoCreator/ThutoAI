import json
from difflib import get_close_matches

# 1.Load knowledge base from JSON file 
def load_knowledge_base(file_path:str) -> dict:
    with open(file_path, 'r') as file:
        data: dict = json.load(file)
    return data

# 2. Save data to a JSON file
def save_knowledge_base(file_path: str, data: dict):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)
