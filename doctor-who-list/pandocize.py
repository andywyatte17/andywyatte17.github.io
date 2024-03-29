#!/usr/bin/env python3
'''
Make index.html from how-to-bingewatch-class-who-skipwatch.md using
  pandoc => presentation.

Usage:
  py pandocize.py s5 | slidy | slideous | dzslides | revealjs | all
'''

import sys, os
import subprocess

def main(argv = sys.argv):
    os.environ["PATH"] = os.environ["PATH"] + os.pathsep + \
                        os.path.join(os.environ["USERPROFILE"], "AppData", "Local", "Pandoc")

    # "--self-contained"

    args = [x for x in argv[1:]]
    if "all" in args:
        args = ["s5", "slidy", "slideous", "dzslides", "revealjs"]

    for arg in args:
        target = "index-{}.html".format(arg)
        print("Processing - {} to {}".format(arg, target))
        subprocess.check_call( \
            [ "pandoc", "-t", arg,
              "--slide-level", "2",
              "-s", "how-to-bingewatch-class-who-skipwatch.md",
              "-o", target ],
            shell=True)

if __name__ == '__main__':
    main()
