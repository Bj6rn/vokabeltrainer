#!/usr/bin/python3
#-*- coding: utf-8 -*-
from time import sleep
import datetime
from flask import Flask, render_template, request, jsonify
import csv, operator, pandas, json
import os, sys, fnmatch, random

app = Flask(__name__)

scriptdir = os.path.abspath(os.path.dirname(sys.argv[0]))
vocabularylist = os.path.join(scriptdir, "static/irregular_verbs.csv")

def date():
    date = datetime.datetime.now()

    return date.strftime("%d.%m.%Y")

def day_solved():
    last_day = get_evaluation_data()
    today = date()
    if last_day['date'] == today:
        return True
    else:
        return False

def shuffle_vocabularylist():
    data = pandas.read_csv(vocabularylist)
    mixed = data.sample(frac=1)
    mixed.to_csv(vocabularylist, index=False)
    print("list of vocabulary got mixed")

def get_vocabulary():
    try:
        data = csv.reader(open(vocabularylist), delimiter=',')
        data = sorted(data, key=operator.itemgetter(4))
        
        return data[:10]
    except:
        print("Error getting vocabulary")

def get_evaluation_data():
    try:
        with open(os.path.join(scriptdir, "static/evaluation.json"), 'r') as f:
            data = json.load(f)
        
        return data[-1]
    except:
        print("Error getting data")

def log_day(voc, score, award, user_solution):
    voc_data = pandas.read_csv(vocabularylist)
    for item in voc:
        voc_data.loc[voc_data["german"]==item["german"], "used"] = int(item["used"]) +1

    voc_data.to_csv(vocabularylist, index=False)

    day_eval = {
        "date": date(),
        "completed": True,
        "score": score,
        "award": award,
        "vocabulary": voc,
        "user_solution": user_solution
    }
    with open(os.path.join(scriptdir, "static/evaluation.json"), 'r') as f:
        eval_data = json.load(f)
    
    eval_data.append(day_eval)
        
    with open(os.path.join(scriptdir, "static/evaluation.json"), 'w') as f:
        json.dump(eval_data, f, indent=4)

def get_random_award():
    award_list = []
    path = os.path.join(scriptdir, "static/awards/")
    directory_list = os.listdir(path)
    pattern = "*.png"
    for file in directory_list:
        if fnmatch.fnmatch(file, pattern):
            award_list.append(file)

    return "static/awards/" +random.choice(award_list)


@app.route('/vokabeltrainer', methods=['GET','POST'])
def vocabulary_trainer():
    if request.method == 'POST': # POST request
        data = request.get_json()
        if "quiz_success" in data:
            log_day(data["voc"], data["score"], data["award"], data["user_solution"])
        elif "get_voc" in data:
            return jsonify(get_vocabulary())
        elif "get_award" in data:
            return jsonify({"award":get_random_award()})
        return 'OK', 200
    else: # GET request
        pass

    if day_solved() == True:
        data = get_evaluation_data()
        templateData = {
            'title':"Result",
            'completed': True,
            'date': data['date'],
            'score': data['score'],
            'award': data['award'],
            'vocabulary': data['vocabulary'],
            'user_solution': data['user_solution']
        }
    else:
        templateData = {
            'title':"Quiz",
            'completed': False,
            'date':date(),
            'vocabulary':""
        }
    return render_template('index.html', **templateData)

if __name__ == "__main__":
    app.run(port=2609, host='0.0.0.0', debug=False)