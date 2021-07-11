#!/usr/bin/env python3
'''
python convert index.html to index.md and then convert to pdf

NB: Must be run from bash for pandoc step:
  sudo apt-get install -y pandoc texlive-latex-base texlive-latex-extra texlive-latex-base
'''

import re
import os

with open("index.html", "rb") as f:
  with open("index.md", "w") as fo:
    stuff = f.read().decode("utf-8")
    stuff = stuff.replace("\r\n", "\n")
    is_in = False
    for line in stuff.split("\n"):
      if "</textarea" in line:
        is_in = False
        continue
      if "<textarea" in line:
        is_in = True
        continue
      if "---" in line:
        fo.write("<hr>\n")
        continue
      if is_in:
        if not "class:" in line:
          fo.write(line + "\n")

os.system("pandoc -f markdown index.md --output=index.pdf")