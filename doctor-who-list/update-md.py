#/usr/bin/env python3
import io
MD = "how-to-bingewatch-class-who-skipwatch.md"
with open(MD + ".base", "rb") as f:
    lines = f.read().decode('utf-8').splitlines()
with io.open(MD, "w", encoding='utf-8', newline='\n') as fw:
    season = "???"
    for line in lines:
        if line.startswith("# Season"):
            season = "<sub>" + line[2:].strip() + "</sub>"
        if line.startswith("## "):
            print(line, file=fw)
            print('', file=fw)
            print(season, file=fw)
            continue
        print(line, file=fw)