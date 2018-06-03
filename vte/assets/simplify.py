from bs4 import BeautifulSoup
f = 'London_Underground_Overground_DLR_Crossrail_map.svg'
soup = BeautifulSoup(open(f).read(), 'html.parser')

x = soup.find('g', {'id': 'stname'})
for u in x.find_all('use'):
  u.decompose()

for an_id in ['stname_TfLrail', 'stname_Tramlink', 'stname_Docklands_Light_Railway' \
           ,'stname_Watford_DC_Line', 'stname_West_London_Line' \
           ,'stname_North_London_Line', 'stname_Gospel_Oak_to_Barking_Line' \
           ,'stname_East_London_Line', 'stname_Seven_Sisters_Line' \
           ,'stname_Chingford_Line', 'stname_Romford_to_Upminster_Line' \
           ,'stname_Crossrail', 'stname_Greenford_Branch_Line' \
           ,'Seven_Sisters_Line_stations'
           ]:
  for u in x.find_all(id=an_id):
    u.decompose()

for a_class in ['fog', 'fgreenford', 'fpiccadilly', 'fnorthern' \
               ,'fcrossrail', 'ftflrail', 'fjubilee', 'fcircle' \
               ,'fdlr', 'fvictoria', 'fcentral', 'fdistrict' \
               ,'fmetropolitan', 'fbakerloo', 'fhnc', 'fwnc' \
               , 'ftl'
               ]:
  for u in x.find_all(class_=a_class):
    u.decompose()

#for u in x.find_all():
#  print(u.text.lstrip())

for remove in ['Quay', 'passengers are', 'Valley', 'Hackney', 'scheduled to']:
  for u in x.find_all("text"):
    if remove in u.text:
      u.decompose()

#for u in soup.findAll(True):
#  if hasattr(u, 'attrs'):
#    if 'class' in u.attrs:
#      del u.attrs['class']

OTHER_STYLES = '''
/* #stname_Bakerloo_line { fill:brown } */
#stname_interchanges {
  fill: rebeccapurple;
}
#stname_Bakerloo_line  {
   fill: #963;
}
#stname_Central_line  {
   fill: #c33;
}
#stname_Jubilee_line  {
   fill: #889;
}
/*
#stname_Hammersmith-city_line  {
   fill: #c99;
}
*/
#stname_District_line_and_Hammersmith_And_City_line  {
   fill: #063;
}
#stname_Metropolitan_line  {
   fill: #a06;
}
#stname_Piccadilly_line  {
   fill: #048;
}
#stname_Circle_line  {
   fill: #fc0;
    color: #333;
}
#stname_Victoria_line  {
   fill: #09c;
}
'''

BEGIN = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2500" height="1320" viewBox="-40.5 -120.5 2500 1320">
<style type="text/css">
text {font-family:Arimo,Liberation Sans,HammersmithOne,Helvetica,Arial,sans-serif}''' \
  + OTHER_STYLES + \
'''</style>
'''
print(BEGIN+'{}\n</svg>'.format(x.prettify()))
