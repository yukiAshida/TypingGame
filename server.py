from flask import Flask,render_template,jsonify,request
from pylib.questionController import readQuestion
from pylib.dayInfomation import getDayInfomation
from pylib.saveMethods import saveJson
import json, os, glob
import numpy as np


# Flaskアプリを立てる
app = Flask(__name__,template_folder='./public',static_folder='./public/js')

# 出題を格納するグローバル変数
Questions = None

# 結果を格納するグローバル変数
Results = {}

DIRECTORY = None
DEBUG_DIRECTORY = None
QUESTION_DIRECTORY = "./pylib/production/"

# 出題の順番
Order = None

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/set_question',methods=["POST"])
def set_question():

    global Questions
    global Order

    # リクエストを受け取る
    req = request.get_json()
    req = dataTypeConvert(req)


    # 出題順をセット
    if req["set_no"]==0:

        # 0 ~ 順番
        if req["settings"]["order"] == 0:
            Order = np.arange(req["settings"]["task"]).tolist()
        # 0 ~ q[設定課題]までランダム
        elif req["settings"]["order"] == 1:
            Order = np.random.permutation(req["settings"]["task"]).tolist()
        # 0 ~ q[あるだけ]までランダム
        elif req["settings"]["order"] == 2:

            question_files = glob.glob(QUESTION_DIRECTORY+"q*.txt") 
            qn = len(question_files)
            Order = np.random.permutation(qn).tolist()
            
    # リクエストされた番号の問題をファイルから読み込む
    question_number = Order[ req["set_no"] ]
    Questions = readQuestion("q" + str(question_number))

    return jsonify(Questions)


@app.route('/save',methods=["POST"])
def save():

    global DIRECTORY
    global DEBUG_DIRECTORY
    
    # データを受け取り
    req = request.get_json()
    req = dataTypeConvert(req)

    # 一番最初の課題の時はディレクトリ名を取得
    if req["set_no"]==0:
        DIRECTORY = "./data/" + getDayInfomation()
        DEBUG_DIRECTORY = DIRECTORY + "/debug"

    # データ保存用のディレクトリを作成（無ければ）
    if not os.path.isdir(DIRECTORY):
        os.mkdir(DIRECTORY)
        os.mkdir(DEBUG_DIRECTORY)

    # 必要な結果をまとめる
    result = bindResult(req)
    
    # デバッグデータを保存
    filepass = DEBUG_DIRECTORY +"/q" + str(req["set_no"]) + ".json"
    saveJson(filepass, result)

    # 最終結果に一時的に保存
    Results["task_"+str(req["set_no"])] = result
    
    # 全課題が終わったら全てのデータを保存
    if req["set_no"]==int(req["settings"]["task"])-1:
        Results["id"] = req["settings"]["id"]
        Results["question_order"] = Order[:req["settings"]["task"]]
        filepass = DIRECTORY + "/result.json"
        saveJson(filepass, Results)

    return jsonify({})

def bindResult(req):

    result = {}
    result["question"] = "".join(req["question"]["view"])
    result["grades"] = req["grades"]

    # 単位時間当たりのタイピング数を追加
    result["grades"]["type/time"] = req["grades"]["typing"]/req["grades"]["time"]

    return result

def dataTypeConvert(req):

    new_req = req.copy()

    convert_set1 = {
        "attention": "int",
        "phase":"int",
        "set_no":"int",
        "Ts":"float"
    }

    for label, tp in convert_set1.items():
        
        if tp=="int":
            new_req[label] = int(new_req[label]) if new_req[label]!=None else None
        elif tp=="float":
            new_req[label] = float(new_req[label]) if new_req[label]!=None else None


    new_req["grades"]["error"] = int(req["grades"]["error"])
    new_req["grades"]["typing"] = int(req["grades"]["typing"])
    new_req["grades"]["time"] = float(req["grades"]["time"])
    new_req["settings"]["id"] = int(req["settings"]["id"])
    new_req["settings"]["timelimit"] = float(req["settings"]["timelimit"]) if req["settings"]["timelimit"]!=None else None  
    new_req["settings"]["task"] = int(req["settings"]["task"])
    new_req["settings"]["order"] = int(req["settings"]["order"])

    convert_set2 = {
        "grades.error": "int",
        "grades.typing": "int",
        "grades.time": "float",
        "settings.id": "int",
        "settings.timelimit": "float",
        "settings.task": "int",
        "settings.order": "int"
    }

    for labels, tp in convert_set2.items():
        
        l1,l2 = labels.split(".")

        if tp=="int":
            new_req[l1][l2] = int(new_req[l1][l2]) if new_req[l1][l2]!=None else None
        elif tp=="float":
            new_req[l1][l2] = float(new_req[l1][l2]) if new_req[l1][l2]!=None else None

    return new_req
    

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=8000)