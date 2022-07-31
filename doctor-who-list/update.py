#/usr/bin/env python3

'''
Update the how-to-bingewatch-class-who-skipwatch.md script and then
run pandoc to create all of the index-...html files.

Usage:
    python3 update.py
'''

import io
import json
import sys
from pprint import pprint
import Levenshtein # py -3 -m pip install --user "python-Levenshtein"

MD = "how-to-bingewatch-class-who-skipwatch.md"
JS = json.load(open("doctor-who-classic-list.json", "r"))

def check_in_andys_list(line, andysWatches):
    for aw in andysWatches:
        found = line.find(aw)
        if found >=0:
            return True
    return False

def ClosestMatch(episode, JS):
    ix = episode.find("(")
    if ix>=0: episode = episode[0:ix]
    total = [(x["Title"], x) for x in JS]
    total = [(Levenshtein.distance(episode, x), y) for x, y in total]
    total = sorted(total, key=lambda x: x[0])
    x = total[0][1]
    #if total[0][0] > 1: print(episode, total[0])
    return "Story {}; {} episodes - {}".format(x["Story"], x["Episodes"], x["Title"])

def main():
    from update import ANDYS_WATCHES    

    with open(MD + ".base", "rb") as f:
        #lines = f.read().decode('cp1252', errors='backslashreplace').splitlines()
        lines = f.read().decode('utf-8').splitlines()

    def EndLast(last_info, fw):
        if last_info==None:
            return None
        print(last_info, file=fw)
        print('', file=fw)
        return None

    last_info = None

    with io.open(MD, "w", encoding='utf-8', newline='\n') as fw:
        season = "???"
        for line in lines:
            if line.startswith("# Season"):
                last_info = EndLast(last_info, fw)
                season = "<sub>" + line[2:].strip() + "</sub>"
                print(line, file=fw)
                print(line.replace("# ", "\n## Summary - "), file=fw)
                continue
            # ...
            if line.startswith("## "):
                last_info = EndLast(last_info, fw)
                line_stripped = line[3:]
                line_stripped = line_stripped \
                    .replace(" - Maybe", "") \
                    .replace(" - Watch", "") \
                    .replace(" - Essential", "") \
                    .replace(" - Skip", "")
                if check_in_andys_list(line, ANDYS_WATCHES):
                    line += " - AW"
                last_info = ClosestMatch(line_stripped, JS)
                print(line, file=fw)
                print('', file=fw)
                print(season, file=fw)
                continue
            # ...
            print(line, file=fw)
        # ...
        last_info = EndLast(last_info, fw)

if __name__=='__main__':
    main()
    import pandocize
    pandocize.main(sys.argv[0:1] + ["all"])

ANDYS_WATCHES = (
    "The War Games",
)