import json,threading,http.server,functools
from pathlib import Path
from playwright.sync_api import sync_playwright
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory='preview')
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
root=f'http://127.0.0.1:{server.server_port}/'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for width in [390,1440]:
   page.set_viewport_size({'width':width,'height':900})
   for file in Path('preview').glob('*.html'):
    assert page.goto(root+file.name).status==200
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,file)
    for href in page.locator('a[href]').evaluate_all('els => els.map(e => e.getAttribute("href"))'):
     if not href.startswith(('http','#')):assert page.request.get(root+href.split('?')[0].split('#')[0]).status==200,href
  page.goto(root+'airport-comparison-v7.html?area=myeongdong&terminal=t2')
  assert 'Myeongdong' in page.locator('#summary').inner_text()
  assert page.locator('#terminal').input_value()=='T2'
  page.locator('#terminal').select_option('T1');assert 'terminal=T1' in page.url
  page.reload();assert page.locator('#terminal').input_value()=='T1'
  page.locator('#terminal').select_option('T2');page.go_back();assert page.locator('#terminal').input_value()=='T1'
  page.go_forward();assert page.locator('#terminal').input_value()=='T2'
  page.locator('#placeSearch').fill('Hongdae');page.locator('#placeSearch').press('ArrowDown');page.keyboard.press('Enter')
  assert 'Hong' in page.locator('#summary').inner_text()
  assert page.locator('#placeSearch').get_attribute('aria-expanded')=='false'
  assert page.locator('#results .result').count()==4
  assert '₩' not in page.locator('#results').inner_text()
  assert 'incheon-airport-to-hongdae.html' in page.locator('#results').inner_html()
  assert 'travelers' not in page.url and 'luggage' not in page.url
  page.locator('#reset').click();assert page.locator('#placeSearch').input_value()=='Seoul Station'
  page.goto(root+'airport-comparison-v7.html#place=999&terminal=BAD');assert page.locator('#terminal').input_value()=='T1'
  count=page.evaluate('window.KOREA_PLACES.length')
  for i in range(count):
   for terminal in ['T1','T2']:
    page.evaluate('(s)=>{location.hash=new URLSearchParams(s).toString()}',{'place':str(i),'terminal':terminal})
    page.wait_for_function('(s)=>selected.id===s.id && document.querySelector("#terminal").value===s.t',arg={'id':i,'t':terminal})
    assert page.locator('#results .result').count()==4
    assert '₩' not in page.locator('#results').inner_text()
  assert not errors,errors
  page.goto(root);page.locator('#searchInput').fill('shopping');page.locator('#searchForm button').click();assert page.locator('#featured .tile:visible').count()==1
  page.screenshot(path='preview/home.png')
  page.goto(root+'airport-comparison-v7.html?area=myeongdong&terminal=t1');page.screenshot(path='preview/calculator.png')
  b.close()
 for record in json.loads(Path('preview/data/transport.json').read_text())['routes']:
  assert record['verified_at'] is None and record['fare_amount'] is None
 print(f'PASS: 13 pages at 390/1440px, internal links, history/reload, inbound query, keyboard selection, {count} places × 2 terminals, suppressed fares, data verification status and guide connections.')
finally:server.shutdown()
