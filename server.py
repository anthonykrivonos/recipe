import json
import time
import random
import pandas as pd
from string import ascii_letters, digits
from flask import Flask, render_template, Response, request, jsonify, abort
app = Flask(__name__)

##
#   Constants
##

# Number of ingredients to show during learning and quizzes
CABINET_SIZE = 10

TAGS = [ "breakfast", "lunch", "dinner", "dessert", "drink" ]

##
#   Data Helper Functions
##

# Returns the alphanumeric version of the input string
def alphanumeric(s):
    return "".join([ch for ch in s if ch in (ascii_letters + digits + ":- ")])

# Finds case insensitive property in dict
def find_prop(prop, dict):
    key_map = {}
    for k in dict.keys():
        key_map[k.lower()] = k
    return dict[key_map[prop.lower()]]

# Returns all data that match the query string, using the 'keyword' property of each object
def get_matches(query):
    matching_ids = []
    matching_data = []
    if query == "":
        return data
    query_strs = [ alphanumeric(q) for q in query.lower().split(",") ]
    for d in data:
        for q in query_strs:
            if d["id"] not in matching_ids and (q in d["tags"] or q in d["ingredients"]):
                matching_data.append(d)
                matching_ids.append(d["id"])
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

# Returns a cabinet for the given item: all the item's ingredients + random ingredients
def get_cabinet(item):
    global cabinet
    required_ingredients = item['ingredients']
    total_cabinet = []
    for ingredient in cabinet.copy():
        if ingredient not in required_ingredients:
            total_cabinet.append(ingredient)
    random.shuffle(total_cabinet)
    total_cabinet = total_cabinet[:(CABINET_SIZE - len(required_ingredients))]
    new_cabinet = total_cabinet + required_ingredients
    random.shuffle(new_cabinet)
    return new_cabinet

def update_leaderboard(user_id, score, date):
    global leaderboard
    # Append to leaderboard
    leaderboard = leaderboard.append({
        "user_id": user_id,
        "score": score,
        "date": date
    }, ignore_index = True)
    leaderboard.to_pickle("./leaderboard.pkl")

def get_leaderboard_json():
    global leaderboard
    return leaderboard.sort_values(by=['score'], ascending=False).to_dict('records')

##
#   Data and Searching
##

# Load items from file
data = []
with open('data.json', encoding='utf8') as f:
    data = json.load(f)

# Load cabinet from file
cabinet = []
f = open("cabinet.txt", "r", encoding='utf8')
for ingredient in f:
    cabinet.append(alphanumeric(ingredient))

# Load leaderboard
try:
    leaderboard = pd.read_pickle('./leaderboard.pkl')
except:
    leaderboard = pd.DataFrame(columns = ['user_id', 'score', 'date'])

##
#   Webpage Serving
##

@app.route('/')
def index(id=None):
    return render_template('index.html', count=len(data))

@app.route('/browse')
def browse():
    query = request.args.get('query')
    if query not in [ None, "" ]:
        matches = get_matches(query)
    else:
        matches = data

    return render_template('browse.html', data=matches, tags=TAGS, count=len(data))

@app.route('/learn/<id>')
def learn(id=None):
    if id == None:
        return abort(404)
    id = int(id)
    data = None if id is None else get_by_id(id)
    cabinet = [] if id is None else get_cabinet(data)
    return render_template('learn.html', data=data, cabinet=cabinet, count=len(data))

@app.route('/info/<id>')
def info(id=None):
    if id == None:
        return abort(404)
    id = int(id)
    data = None if id is None else get_by_id(id)
    return render_template('info.html', data=data, count=len(data))

@app.route('/quiz/<ids>')
def quiz(ids):
    if ids is None:
        return abort(500)
    ids = ids.split(",")
    data = [] if ids is None else [ get_by_id(int(id)) for id in ids ]
    if len(data) != 3:
        return abort(404)
    cabinets = [] if ids is None else [ get_cabinet(d) for d in data ]
    return render_template('quiz.html', data=data, cabinets=cabinets, count=len(data))

@app.route('/leaderboard')
def leaderboard_page():
    leaderboard = get_leaderboard_json()

    print(leaderboard)
    return render_template('leaderboard.html', leaderboard=leaderboard)

@app.route('/add_to_leaderboard', methods=['POST'])
def add_to_leaderboard():

    json_data = request.get_json()
    user_id = json_data["user_id"]
    score = int(json_data["score"])
    date = int(json_data["date"])

    if not user_id or not score or not date:
        return abort(500)

    update_leaderboard(user_id, score, date)
    leaderboard = get_leaderboard_json()

    return jsonify(leaderboard=leaderboard)

if __name__ == '__main__':
   app.run(debug = True)