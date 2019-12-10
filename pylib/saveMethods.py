import json

def saveJson(filepass, result):

    f = open(filepass, "w", encoding="utf-8")
    json.dump(result, f, indent=2, ensure_ascii=False)
    f.close()
