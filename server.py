import json
import requests
import time
import random
from string import ascii_letters, digits
from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
app = Flask(__name__)

##
#   Constants
##

SPLASH_IMG_TAG = "NBA News"

##
#   Data and Searching
##

# Load NBA data from file
data = []
with open('data.json') as f:
    data = json.load(f)

current_id = len(data)

# Returns the alphanumeric version of the input string
def alphanumeric(s):
    return "".join([ch for ch in s if ch in (ascii_letters + digits + ":-")])

# Finds case insensitive property in dict
def find_prop(prop, dict):
    key_map = {}
    for k in dict.keys():
        key_map[k.lower()] = k
    return dict[key_map[prop.lower()]]
    
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

# Returns all data that match the query string, using the 'keyword' property of each object
def get_matches(query):
    matching_data = []
    if query == "":
        return data
    query_strs = [ alphanumeric(q) for q in query.lower().split(" ") ]
    for d in data:
        all_match = True
        for q in query_strs:
            # Property-based search
            if ":" in q and len(q.split(":")) is 2:
                prop = q.split(":")[0]
                val = q.split(":")[1]
                all_match = val in find_prop(prop, d).lower()
                break
            elif q not in d["keywords"]:
                all_match = False
                break
        if all_match:
            matching_data.append(d)
    return matching_data

# Returns the n first items sorted in this order
def get_sorted(key, n, reverse=False):
    temp_data = [ d for d in data ]
    temp_data = sorted(temp_data, key=lambda d: d[key] if key in d else -1, reverse=reverse)
    return temp_data[:n]

# Returns all data that match the query string, using the 'keyword' property of each object
def get_by_id(id):
    for d in data:
        if d["id"] == id:
            return d
    return None

# Requests the given image from the server
def get_image(query):
    r = requests.get("https://api.qwant.com/api/search/images",
        params={
            'count': 20,
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
    except:
        urls = []

    return random.choice(urls) if len(urls) > 0 else None

def update(id, key, value):
    for d in data:
        if d["id"] == id:
            d[key] = value
            d["keywords"] = generate_keywords(d)
            d["lastUpdated"] = int(time.time())
            return d
    return None

def delete_by_id(id):
    del_idx = -1
    for idx, d in enumerate(data):
        if d["id"] == id:
            del_idx = idx
            break
    if del_idx >= 0:
        del data[del_idx]

# '/': splash photo
splash = get_image(SPLASH_IMG_TAG)

##
#   Static Webpage Serving
##

@app.route('/')
def index():
    search_query = request.args.get('search')
    if search_query not in [None, ""]:
        matches = get_matches(search_query)
    else:
        matches = get_sorted("lastUpdated", 10, True)
    return render_template('index.html', data=matches, splash=splash)

@app.route('/create')
def create():
    return render_template('create.html')

@app.route('/view/', defaults={'id': None})
@app.route('/view/<id>')
def view(id=None):
    if id == None:
        return render_template('view.html', player=None)
    id = int(id)
    player = None if id is None else get_by_id(id)
    return render_template('view.html', player=player)

@app.route('/edit/<id>')
def edit(id=None):
    id = int(id)
    player = None if id is None else get_by_id(id)
    return render_template('edit.html', player=player)

##
#   Data Manipulation Endpoints
##

@app.route('/search', methods=['GET', 'POST'])
def search():
    global data
    global current_id

    json_data = request.get_json()
    search = json_data["search"]
    matches = get_matches(search)

    return jsonify(data = matches)

@app.route('/create_player', methods=['GET', 'POST'])
def create_player():
    global data
    global current_id
    current_id += 1

    json_data = request.get_json()

    new_player = {
        "id": current_id,
        "firstName": json_data["firstName"],
        "lastName": json_data["lastName"],
        "team": json_data["team"],
        "school": json_data["school"],
        "country": json_data["country"],
        "pts": json_data["pts"],
        "ast": json_data["ast"],
        "reb": json_data["reb"],
        "games": json_data["games"],
        "description": json_data["description"],
        "position": json_data["position"],
        "image": json_data["image"],
        "lastUpdated": int(time.time())
    }
    new_player["keywords"] = generate_keywords(new_player)
    data.append(new_player)

    return jsonify(player = new_player)
 
@app.route('/update', methods=['GET', 'POST'])
def update_data():
    global data

    json_data = request.get_json()
    id = int(json_data["id"])
    key = json_data["key"]
    value = json_data["value"]

    return jsonify(player = update(id, key, value))
 
@app.route('/delete_game', methods=['GET', 'POST'])
def delete_game():
    global data

    json_data = request.get_json()
    game_id = int(json_data["game_id"]) # game id
    player_id = int(json_data["player_id"]) # player indx
    delete = json_data["delete"] if "delete" in json_data else True # do delete?

    games = None
    for d in data:
        if d["id"] == player_id:
            for i in range(len(d["games"])):
                if d["games"][i]["id"] == game_id:
                    d["games"][i]["mark_as_deleted"] = delete
                    d["lastUpdated"] = int(time.time())
                    games = d["games"]
                    break

    return jsonify(games = games)

@app.route('/delete/<id>')
def delete(id=None):
    global data
    id = int(id)

    if id is None:
        return None

    delete_by_id(id)

    return jsonify(data = data)

##
#   Misc. Endpoints
##

# Searches Qwant for an image and returns a URL
@app.route('/image/<query>')
def img_search(query=None):
    return jsonify(image = get_image(query))

# Returns a list of all players' names for autocomplete
@app.route('/autocomplete_names')
def autocomplete_names():
    return jsonify(names = [ d["firstName"] + " " + d["lastName"] for d in data ])

if __name__ == '__main__':
   app.run(debug = True)