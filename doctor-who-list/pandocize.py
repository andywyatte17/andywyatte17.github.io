#!/usr/bin/env python3
'''
Make index.html from how-to-bingewatch-class-who-skipwatch.md using
  pandoc => presentation.

Usage:
  py pandocize.py s5 | slidy | slideous
'''

import sys, os
import subprocess

os.environ["PATH"] = os.environ["PATH"] + os.pathsep + \
                     os.path.join(os.environ["USERPROFILE"], "AppData", "Local", "Pandoc")

subprocess.check_call( \
    [ "pandoc", "-t", sys.argv[1],
      "-s", "how-to-bingewatch-class-who-skipwatch.md",
      "-o", "index.html" ],
    shell=True)
