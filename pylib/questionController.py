#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pykakasi import kakasi
import numpy as np
import re
import sys
from pprint import pprint
import jaconv

KANJI_PATTERN = re.compile(r'^[\u4E00-\u9FD0]+$')
SIGN_PATTERN = re.compile(r'、|。')
ARROW_PATTERN = re.compile(r'（|）')

kakasi = kakasi()
kakasi.setMode('J', 'H')
CONVERTER = kakasi.getConverter()

############## コンパイル用 ##########################################################

def isKanji(word):

    return bool(KANJI_PATTERN.fullmatch(word))


def findKanjiWithoutSign(text):

    # 漢字の箇所を取り出す
    kanjiBoolean = [False]+[ isKanji(t) for t in text ]+[False]
    
    # 開始箇所と終了箇所を取得
    n = len(text)+1
    kanjiStart = [ i for i in range(n) if (kanjiBoolean[i]==False and kanjiBoolean[i+1]==True)]
    kanjiEnd = [ i for i in range(n) if (kanjiBoolean[i]==True and kanjiBoolean[i+1]==False)]
    
    #print(kanjiStart,kanjiEnd)



    result = [(s,e) for s,e in zip(kanjiStart,kanjiEnd)]
    
    header = [(0,0)] if (result == [] or result[0][0] > 0) else []
    footer = [(len(text),len(text))] if (len(result) <= 1 or result[-1][1]<len(text)) else []
    
    return header + result + footer


def translateKanjiWithoutSign(text):

    print(text)
    ksi = findKanjiWithoutSign(text)
    print(ksi)
    answer = []


    for i in range(len(ksi)-1):

        s,e = ksi[i]
        ns, _ = ksi[i+1]

        translated = CONVERTER.do(text[s:ns])

        
        kanjiPart = text[s:e]
        hiraganaPart = text[e:ns]

        
        kanjiTranslated = translated[:len(translated)-len(hiraganaPart)]
        hiraganaTranslated = translated[-len(hiraganaPart):]

        answer.append( {"view":[kanjiPart,hiraganaPart],"real":[kanjiTranslated,hiraganaTranslated]} )

    return answer

def splitBySign(text):

    splitedText = re.split(r"、|。",text)

    eachLength = [len(t) for t in splitedText]

    signIndex = [ sum(eachLength[:i+1])+i for i in range(len(splitedText)-1) ]

    return splitedText, signIndex

def translateWithSign(text):

    splitedText, signIndex = splitBySign(text)

    results = []
    for i,st in enumerate(splitedText):

        if st=="":
            continue

        result = translateKanjiWithoutSign(st)
        results += result
        
        if len(signIndex) > i:
            results += [ {"real":[text[signIndex[i]]], "view":[text[signIndex[i]]]} ]

    return results

def compile(text):
    
    # 翻訳
    translatedQuery = translateWithSign(text)
    
    # コンパイルされる出力結果
    # 赤い林檎 => 赤（あか）い林檎（りんご）
    data = ""

    for query in translatedQuery:

        # 翻訳されたクエリを取得
        real = query["real"]
        view = query["view"]

        # 句読点の場合
        if real[0] in ("。","、"):
            data += view[0] + "\n"
        
        # 漢字が無い場合
        elif real[0] == "":
            data += view[1]
        
        # 漢字+送り仮名の場合
        else:
            data += view[0] + "（" + real[0] + "）" + view[1]

    return data


def translateFile(filepass):

    with open("./pylib/resource/" + filepass + ".txt", "rt", encoding="utf-8") as f:

        data = [ s.rstrip("\n") for s in f.readlines()]
        question = "".join(data)

        compiled_text = compile(question)

    for i,s in enumerate(("０","１","２","３","４","５","６","７","８","９")):
        compiled_text = compiled_text.replace(s,str(i))

    with open("./pylib/production/" + filepass + ".txt", "wt", encoding="utf-8") as f:
        
        f.write(compiled_text)



############## 読み込み用 ##########################################################

def findArrow(pattern, text):

    return [ i for i in range(len(text)) if ARROW_PATTERN.fullmatch(text[i])]


def readQuestion(filepass):

    with open("./pylib/production/" + filepass + ".txt", "rt", encoding="utf-8") as f:
        
        data = [ s.rstrip("\n") for s in f.readlines()]
        question = "".join(data)

    arrowIndex = findArrow(ARROW_PATTERN,question)
    production = {"view":[], "real":[]}

    index = 0
    small_tsu = False
    while True:

        q = question[index]

        if isKanji(q):

            l = arrowIndex.pop(0)
            r = arrowIndex.pop(0)

            production["view"].append(question[index:l])
            production["real"].append(question[l+1:r])

            index = r+1

        else:

            if q=="っ" or q=="ッ":
                small_tsu = q
            elif small_tsu:
                comb = small_tsu + q
                production["view"].append(comb)
                production["real"].append( jaconv.kata2hira(comb) )
                small_tsu = False
            else:
                production["view"].append(q)
                production["real"].append( jaconv.kata2hira(q) )
            index += 1
        
        if index == len(question):
            break

    return production


    

if __name__=="__main__":

    args = sys.argv

    assert len(args)>1, "please set filepass"

    if len(args)>2 and args[2]=="compile":
        translateFile(args[1])
    else:
        readQuestion(args[1])

