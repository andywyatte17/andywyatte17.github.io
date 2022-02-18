#!/usr/bin/env python3
'''
Make index.html from how-to-bingewatch-class-who-skipwatch.md using
  pandoc => presentation.

Usage:
  py pandocize.py s5 | slidy | dzslides | revealjs
'''

import sys, os
import subprocess

os.environ["PATH"] = os.environ["PATH"] + os.pathsep + \
                     os.path.join(os.environ["USERPROFILE"], "AppData", "Local", "Pandoc")

# "--self-contained"

subprocess.check_call( \
    [ "pandoc", "-t", sys.argv[1],
      "--slide-level", "2",
      "-s", "how-to-bingewatch-class-who-skipwatch.md",
      "-o", "index-{}.html".format(sys.argv[1]) ],
    shell=True)

R"""<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="7; url='{redirect}'" />
  </head>
  <body>
    <p>Please follow <a href="{redirect}">this link</a>.</p>
  </body>
</html>"""
