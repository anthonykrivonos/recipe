import requests
import json
import random
import wikipedia
import atexit
from time import sleep
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo, playergamelog

# Store sanitized player data
player_info = []

# Given a player object, generates a keywords string for easier searching
def generate_keywords(player):
    keywords = [
        player["firstName"],
        player["lastName"],
        player["team"],
        player["position"]
    ]
    keywords = ",".join(keywords).lower()
    return keywords

with open('data.json') as f:
    player_info = json.load(f)

for i in range(len(player_info)):
    for j in range(len(player_info[i]["games"])):
        player_info[i]["games"][j]["mark_as_deleted"] = False

with open('data.json', 'w') as fp:
    json.dump(player_info, fp, indent=4)