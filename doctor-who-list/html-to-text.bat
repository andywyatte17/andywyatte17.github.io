@rem py -3 -m pip install --user html2text

curl http://longish95.blogspot.com/2020/06/how-to-bingewatch-classic-who-skipwatch.html ^
     -o how-to-bingewatch-class-who-skipwatch.html

py -3 -m html2text how-to-bingewatch-class-who-skipwatch.html cp1252 ^
       > how-to-bingewatch-class-who-skipwatch.txt
