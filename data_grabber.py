import requests
import json
import random
import wikipedia
import atexit
from time import sleep
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo, playergamelog

# Get raw player data
player_info_raw = players.get_active_players()

# Store sanitized player data
player_info = []

with open('data.json') as f:
    player_info = json.load(f)

# Searches Qwant for an image and returns a url
def img_search(query):
    r = requests.get("https://api.qwant.com/api/search/images",
        params={
            'count': 1,
            'q': query,
            't': 'images',
            'safesearch': 1,
            'locale': 'en_US',
            'uiv': 1
        },
        headers={
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0',
        }
    )
    try:
        response = r.json().get('data').get('result').get('items')
        urls = [r.get('media') for r in response]
        print("Got picture of " + query)
    except:
        print("Could not get picture of " + query)
        return None
    return urls[0] if len(urls) > 0 else None

def save_data():
    # Save to data file
    with open('data.json', 'w') as fp:
        json.dump(player_info, fp, indent=4)

atexit.register(save_data)

FROM_DATE = "01/01/2020"
TO_DATE = "02/26/2020"

# Count id
id = 0

for player in player_info_raw:
    try:
        # Create game data
        sleep(0.5)
        game_log = playergamelog.PlayerGameLog(player_id=player['id'], timeout=300, date_from_nullable=FROM_DATE, date_to_nullable=TO_DATE).get_normalized_dict()["PlayerGameLog"]
        if len(game_log) == 0:
            continue
        games = []
        for idx, game in enumerate(game_log):
            games.append({
                "id": idx,
                "matchup": game["MATCHUP"],
                "result": game["WL"],
                "pts": game["PTS"],
                "ast": game["AST"],
                "reb": game["REB"]
            })

        # Get player's info
        sleep(0.5)
        info = commonplayerinfo.CommonPlayerInfo(player_id=player['id'], timeout=300).get_normalized_dict()
        common_player_info = info["CommonPlayerInfo"][0]
        player_stats = info["PlayerHeadlineStats"][0]

        full_name = player_stats["PLAYER_NAME"]

        # Get player's image
        image = img_search(full_name.lower())
        if image is None:
            continue
        
        # Create description
        description = wikipedia.summary(full_name + " NBA player")
        if description is None or description is "":
            continue

        keywords = [
            common_player_info["FIRST_NAME"],
            common_player_info["LAST_NAME"],
            common_player_info["TEAM_NAME"],
            common_player_info["SCHOOL"],
            common_player_info["COUNTRY"]
        ]
        keywords += description.replace(".", "").replace("!", "").replace("?", "").replace(":", "").replace(",", "").split(" ")
        keywords = ",".join(keywords).lower()

        player = {
            "id": id,
            "firstName": common_player_info["FIRST_NAME"],
            "lastName": common_player_info["LAST_NAME"],
            "team": common_player_info["TEAM_NAME"],
            "school": common_player_info["SCHOOL"],
            "country": common_player_info["COUNTRY"],
            "pts": player_stats["PTS"],
            "ast": player_stats["AST"],
            "reb": player_stats["REB"],
            "position": common_player_info["POSITION"],
            "games": games,
            "description": description,
            "image": image,
            "keywords": keywords
        }
        player_info.append(player)
        id += 1
        save_data()
        print("Loaded " + full_name)
    except:
        print("Load error, continuing")