#/usr/bin/env python3

import io

MD = "how-to-bingewatch-class-who-skipwatch.md"

def check_in_andys_list(line, andysWatches):
    for aw in andysWatches:
        found = line.find(aw)
        if found >=0:
            return True
    return False

def main():
    from update_md import ANDYS_WATCHES    
    with open(MD + ".base", "rb") as f:
        lines = f.read().decode('utf-8').splitlines()
    with io.open(MD, "w", encoding='utf-8', newline='\n') as fw:
        season = "???"
        for line in lines:
            if line.startswith("# Season"):
                season = "<sub>" + line[2:].strip() + "</sub>"
            if line.startswith("## "):
                if check_in_andys_list(line, ANDYS_WATCHES):
                    line += " - AW"
                print(line, file=fw)
                print('', file=fw)
                print(season, file=fw)
                continue
            print(line, file=fw)

if __name__=='__main__':
    main()

ANDYS_WATCHES = (
    "The War Games",
)