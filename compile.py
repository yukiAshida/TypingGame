import os,sys
import glob
from pylib.questionController import translateFile


args = sys.argv

assert len(args)>1, "set filepass for compiling."

if args[1]=="--all":
    question_files = glob.glob("./pylib/resource/q*.txt") 

    for question_file in question_files:

        filepath = question_file.replace("\\","/").split("/")[-1]
        filename = os.path.splitext(filepath)[0]
        translateFile(filename)
else:
    translateFile(args[1])
