from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1440,'height':1100}); errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 root='http://127.0.0.1:8080/'
 page.goto(root)
 page.locator('#searchInput').fill('shopping');page.locator('#searchForm button').click()
 assert page.locator('#featured .tile:visible').count()==1
 page.goto(root+'airport-comparison-v7.html')
 page.locator('#placeSearch').fill('Myeongdong');page.locator('#matches button').first.click()
 page.locator('#terminal').select_option('T2')
 assert 'Myeongdong' in page.locator('#summary').inner_text()
 assert page.locator('#results .result').count()==4
 assert '₩' not in page.locator('#results').inner_text()
 page.locator('#reset').click();assert page.locator('#terminal').input_value()=='T1'
 for width in [390,1440]:
  page.set_viewport_size({'width':width,'height':844})
  for name in ['index.html','airport-comparison-v7.html','airport-transfer.html','t-money.html','shopping.html','about.html','contact.html','privacy-policy.html','affiliate-disclosure.html','editorial-policy.html']:
   assert page.goto(root+name).status==200
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,name)
 page.goto(root)
 for href in page.locator('a[href]').evaluate_all("els => els.map(e => e.getAttribute('href'))"):
  if not href.startswith(('http','#')): assert page.request.get(root+href.split('#')[0]).status==200,href
 assert page.locator('.faq details').count()==3
 assert not errors,errors
 print('PASS: guide search, destination selection, terminal update, four results, suppressed fares, reset, ten pages at mobile/desktop widths, no JavaScript errors.')
 b.close()
