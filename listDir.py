
import os
import json
LOG_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), "flightLogs$

def listLogsDir():
    d = {}

    for f in os.listdir(LOG_DIR):
        if ".zip" in f:
            d[f] = ""

    # crawling through directory and subdirectories  
    for root, directories, files in os.walk(LOG_DIR):
        for dirID in directories:
            d[dirID] = os.listdir(os.path.join(root,dirID))

    d=json.dumps(d)
    return d

if __name__ == '__main__':
    logListFile = listLogsDir()
    print(logListFile)