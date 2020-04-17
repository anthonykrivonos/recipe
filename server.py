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

# Number of ingredients to show during learning and quizzes
CABINET_SIZE = 10

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

##
#   Data and Searching
##

# Load items from file
data = []
with open('data.json') as f:
    data = json.load(f)

# Load cabinet from file
cabinet = []
f = open("cabinet.txt", "r")
for ingredient in f:
    cabinet.append(alphanumeric(ingredient))

##
#   Webpage Serving
##

@app.route('/learn/<id>')
def view(id=None):
    if id == None:
        return render_template('learn.html', data=None)
    id = int(id)
    data = None if id is None else get_by_id(id)
    cabinet = [] if id is None else get_cabinet(data)
    return render_template('learn.html', data=data, cabinet=cabinet)

if __name__ == '__main__':
   app.run(debug = True)