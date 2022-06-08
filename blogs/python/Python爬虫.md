---
title: Python爬虫
date: 2019-03-04
categories:
- Python
tags:
- 爬虫
---

## 1.urllib库

### 1.1`urlopen`函数

```python
from urllib import request
resp=request.urlopen('https://www.baidu.com/')#默认发起get请求
print(resp)
#urlopen函数返回一个http.client.HTTPResponse对象，该对象是一个类文件句柄，有read(bytes)#指定bytes字节读取,readline(),readlines(),getcode()#返回状态码等方法
print(resp.read())
#调用read()方法返回一个字节类型

#urlopen(url,data，timeout)#如果设置了data的值，请求变为post。timeout设置超时时间
```

### 1.2`urlretrieve`函数

```python
from urllib import request
resp=request.urlretrieve('https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2417977629,1656396846&fm=11&gp=0.jpg','baidu.jpg')

#urlretrieve(url,filename)#将该url内容下载到本地，filename指定下载路径的文件名
```

### 1.3参数的编码和解码

`urlencode`函数用于编码中文和特殊字符

```python
#假设爬取的网址为 http://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8&word=王者荣耀
#用浏览器发送请求时，如果url包含了中文或特殊字符，浏览器会自动给我们编码。但是用代码发送就要进行手动编码
from urllib import request,parse
kw={'word':'王者荣耀'}#或[('word','王者荣耀')]
kwd=parse.urlencode(kw)#parse.urlencode()接收一个字典，或由只有两个元素的元组构成的列表
url='http://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8'+'&'+kwd
resp=request.urlopen(url)#若请求未编码的url会报错
print(kwd)#parse.urlencode会将传入的参数进行编码转化为key=value的形式
word=%E7%8E%8B%E8%80%85%E8%8D%A3%E8%80%80
```

parse_qs函数用于将经过编码后的url进行解码。

```python
from urllib import parse
kwd='word=%E7%8E%8B%E8%80%85%E8%8D%A3%E8%80%80'
kw=parse.parse_qs(kwd)#parse.parse_qs()接收一个编码过的key=value的形式的参数，进行自动解码，转化为一个字典
print(kw)
{'word': ['王者荣耀']}#不同的是，原来字典的值变成一个列表
```

###  1.4.`urlparse`和`urlsplit`函数用法

```python
from urllib import parse
url='https://www.baidu.com/s?ie=utf-8&wd=%E7%8E%8B%E8%80%85%E8%8D%A3%E8%80%80#1'
result=parse.urlparse(url)
result1=parse.urlsplit(url)
#urlparse比urlsplit多了一个params属性
#两个函数返回值是一个具名元组，可以通过 result.属性名 进行调用
print(result)
print(result1)
ParseResult(scheme='https', netloc='www.baidu.com', path='/s', params='', query='ie=utf-8&wd=%E7%8E%8B%E8%80%85%E8%8D%A3%E8%80%80', fragment='1')#fragment锚点,#号后的字符串，用于前端定位
SplitResult(scheme='https', netloc='www.baidu.com', path='/s', query='ie=utf-8&wd=%E7%8E%8B%E8%80%85%E8%8D%A3%E8%80%80', fragment='1')
```

###  1.5`request.Request`类

使用`urlopen`函数无法为请求添加附加信息，容易被识别为爬虫。`request.Request`类用于伪造请求头

`request.Request`接收的参数有：

- headers(请求头)，是一个字典或由只有两个元素的元组构成的列表，包含键：User-Agent(浏览器型号)，Referer(从哪个页面转来)，Cookie(缓存信息用于验证身份)等
- method（请求方法）：默认为GET，若要向服务器发送信息，则要改为POST
- data（向服务器发送的信息）：传入的data必须是'key=value'的字节形式

```python
##用Request类爬取拉钩网##
from urllib import request,parse
url='https://www.lagou.com/jobs/companyAjax.json?needAddtionalResult=false'
headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36','Referer': 'https://www.lagou.com/jobs/list_ios?city=%E5%85%A8%E5%9B%BD&cl=false&fromSearch=true&labelWords=&suginput=?&labelWords=hot'}
data={'first': 'true','pn': '1','kd': 'ios'}#传入的data为字典应用parse.urlencode()进行转化，再调用encode方法编码为字节的形式
req=request.Request(url=url,method='POST',data=parse.urlencode(data).encode('utf-8'),headers=headers)
print(request.urlopen(req).read().decode('utf-8'))#通过urlopen发送伪造的请求
```

### 1.6ProxyHandler处理器(设置代理)

设置代理IP:

- 先向`request.ProxyHandler`类传入一个包含代理IP的字典（字典的键是'http'或'https',值为ip地址）参数来初始化一个设置代理的处理器
- 再向`request.build_opener`方法传入这个设置代理的处理器来初始化一个发送对象
- 使用这个设置了代理IP的发送对象发送请求

```python
from urllib import request

handler=request.ProxyHandler({'http':'58.212.67.180:9999'})
opener=request.build_opener(handler)
print(opener.open('http://www.httpbin.org/ip').read())
```

### 1.7使用cookie模拟登陆

`http.cookiejar`模块

- `cookiejar.CookieJar`：管理HTTP cookie值、存储HTTP请求生成的cookie、向传出的HTTP请求添加cookie的对象。整个cookie都存储在内存中，对CookieJar实例进行垃圾回收后cookie也将丢失。
- `cookiejar.FileCookieJar (filename,delayload=None,policy=None)`：从CookieJar派生而来，用来创建FileCookieJar实例，检索cookie信息并将cookie存储到文件中。filename是存储cookie的文件名。delayload为True时支持延迟访问访问文件，即只有在需要时才读取文件或在文件中存储数据。

同HTTPCookieProcessor使用模拟登录

- 先创建一个CookieJar/FileCookieJar实例
- 再将这个cookiejar实例传入request.HTTPCookieProcessor，初始化一个设置了cookiejar的处理器
- 再向`request.build_opener`方法传入这个设置cookiejar的处理器来初始化一个发送对象
- 使用这个设置了代理cookiejar的发送对象发送请求

## 2.requests库

### 2.1`get`函数

- 简单的发送GET请求

  ```python
  import requests
  response=requests.get('https://www.baidu.com/')
  response.content#返回字节类型的数据，可通过decode自行解码
  response.text#返回Unicode类型的数据，requests库自己解码
  ```

- 添加请求头和查询参数

  ```python
  import requests
  kw ={'wd':'中国'}
  headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'}
  #params接收一个字典或者字符串的查询参数，字典类会自动转化为url编码，无需urlencode()
  response=requests.get('https://www.baidu.com/',params=kw,headers=headers)2.2发送POST请求
  ```

- 设置代理

  ```python
  import requests
  url='http://www.httpbin.org/ip'
  proxy={'http':'117.95.214.135:9999'}
  response=requests.get(url=url,proxies=proxy)#直接通过proxies关键字参数传入由字典构成的代理IP
  ```

- 处理不信任的SSL证书

  ```python
  import requests
  url=...
  response=requests.get(url=url,verify=False)#直接将verify关键字设为False
  ```

### 2.2`post`函数

发送POST请求

```python
import requests
url='https://www.lagou.com/jobs/companyAjax.json?needAddtionalResult=false'
headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'}
data={'first': 'true','pn': '1','kd': 'ios'}
response=requests.post(url=url,headers=headers,data=data)#发送给POST请求直接调用requests.post方法，发送的data字典会自动转化为url编码，无需urlencode()和编码成字节类型
```

### 2.3`requests.Session`类

`requests.Session`类用于在多个请求间共享cookie

```python
import requests
...#请求的url等信息
session=requests.Session()#创建一个Session实例
session.post(url,data=data,headers=headers)#使用Session实例向网页发送登录的信息，并保存cookie
session.get(url,headers)#再用Session实例直接访问，无需发送登录信息
```

## 3.xpath语法与lxml库

### 3.1xpath语法

- /nodename：如果是在最前面，则代表从根节点选取nodename，否则表示选择某节点下的某节点
- //nodename：从全局节点中找到所有的nodename节点
- //nodename[@attr=value]：（@表示选取某个节点的属性）从全局节点中选取属性名为attr，值为value的所有的nodename节点
- /node/nodename[1]：选取node节点下的第一个nodename节点
- /node/nodename[last()]：选取node节点下的最后一个nodename节点
- /node/nodename[position()<3]：选取node节点下的前两个nodename节点
- //node[contains(@attr1,value)]：（用于模糊匹配，若一个节点属性包含两个值可用此方法）选取所有属性名为attr1，值包含value的所有的node节点
- /node/*：选取node节点下所有子节点
- //node[@*]：选取所有带属性的节点
- //node1|//node2：（用于选取多路径）选取所有node1节点和node2节点
- //node[@attr=value and @attr2=value2]：选取所有属性名为attr，值为value，属性名为attr2，值为value2的所有node节点
- //node[@attr=value or @attr2=value2]：选取所有属性名为attr，值为value，或属性名为attr2，值为value2的所有node节点

### 3.2 lxml库

同requests库结合使用

```python
from lxml import etree
import requests

resp=requests.get('https://www.baidu.com/')
html=etree.HTML(resp.text)#etree.HTML接收一个Unicode字符串参数，返回一个<Element>对象
etree.tostring(html)#etree.tostring可用将<Element html>对象转化为字节类型
tr=html.xpath(...)#使用<Element>对象的xpath方法可以提取所需数据，返回一个列表，元素都为<Element>对象
td=tr[0].xpath('.//a')#通过xpath获取的变量还可以继续调用xpath方法，若要获取某标签下的某标签，则需在开头加个.号
```

## 4.BeautifulSoup4库

### 4.1基本使用

同requests库结合使用

```python
from bs4 import BeautifulSoup
import requests
resp=requests.get('https://www.baidu.com/')
soup=BeautifulSoup(resp.text,'lxml')#BeautifulSoup类接收一个Unicode字符串参数和一个html解析器的参数(默认为'html.parser',还有'lxml','xml','html5lib')，返回一个BeautifulSoup对象
print(soup.prettify())#soup.prettify()以美观的方式输出网页的文档
```

### 4.2提取数据

`find`和`findAll`方法

```python
from bs4 import BeautifulSoup
import requests
resp=requests.get('https://www.baidu.com/')
soup=BeautifulSoup(resp.text,'lxml')
soup.findAll('node',attrs={'attr':value},limit=2)#选取所有属性名为attr，值为value的node节点，最多两个，返回值为一个列表(attrs关键字用于接收选取节点的属性，limit关键字用于接收选取节点的个数)
soup.find('node')#选取第一个node节点并返回
for a in soup.findAll('a'):#列表中的每个元素都是Tag类型
    a['attr']#或者a.attrs['attr']用于获取Tag对象属性名为attr的属性值
    a.string#获取a标签的文本（无法获得多行文本）
    a.strings#获取a标签及其子标签的文本,返回一个生成器
    a.get_text#获取a标签及其子标签的文本，返回一个字符串
    a.contents#获取a标签下的直接子元素，也包括文本字符串，返回列表
    a.children#同上，但返回迭代器
```

`select`方法,使用css选择器语法筛选

- 通过标签名查找：soup.select('node')#选取所有标签名为node的标签
- 通过类名查找：soup.select('.value')#选取所有类名为value的标签
- 通过id查找：soup.select('#value')#选取所有id名为value的标签
- 查找子孙元素：soup.select('.value node')#选取类名为value的标签下的所有标签名为node的子孙元素
- 查找直接子元素：soup.select('.value > node')#选取类名为value的标签下的所有标签名为node的直接子元素
- 根据属性名查找：soup.select('node[attr=value]')#选取属性名为attr，值为value的node标签

## 5.正则表达式

### 5.1语法

- `.` ：匹配任意字符，但无法匹配换行符
- `\d`：匹配数字
- `\D`：匹配非数字
- `\s`：匹配空白字符（\n，\r，\t，空格）
- `\w`：匹配字母数字下划线
- `\W`：匹配除字母数字下划线
- `[]`：匹配[]中出现的字符（`[]`中的`^`字符表示取反操作）
- `*`：匹配零个或任意多个满足条件的字符
- `+`：匹配至少一个满足条件的字符
- `^`：以...开始
- `&`：以...结尾
- `?`：匹配一个或者零个字符
- `{m}`：匹配m个满足条件的字符
- `{m,n}`：匹配m-n个满足条件的字符
- `|`：匹配多个字符串或者表达式

### 5.2贪婪模式和非贪婪模式

正则表达式默认采用贪婪模式，匹配最大满足的条件

```python
##非贪婪模式##匹配最小满足的条件
import re
text='1234'
re.match('\d+?',text)#在表达式后加个?号即为非贪婪模式，匹配+号的最小满足条件，即为匹配一个满足条件的字符
```

### 5.3转义字符和原生字符串

正则表达式和Python中的转义字符都是\

当要匹配字符'\\'等转义字符时，使用原生字符串会更简单（在字符串前加个r，不转义任何字符）

```python
import re
text=r'\n'
#在正则表达式中，会先使用Python中的转义字符，再使用正则表达式的转义字符
re.match(r'\\n',text)#正则表达式为'\\n',正则表达式将反斜杠转义
##不使用原生字符串
text=r'\n'
re.match('\\\\n',text)#Python使用两个反斜杠将字符串转义为'\\n',正则表达式再将反斜杠转义
```

### 5.5re模块常用函数

- match函数：从头开始匹配 ，一旦遇到不满足条件的字符就终止
- search函数：在字符串中寻找第一个满足条件的子串
- group函数：返回整个满足条件的字符串（与group(0)等价，大于0的索引表示各个子组）
- groups函数：以元组的形式返回满足各个()内条件的所有子组
- findall函数：提取所有满足条件的子串，返回一个列表，当存在分组时，findall函数只提取分组内的字符串（finditer函数作用相同，但返回一个迭代器）
- sub函数：将匹配到的字符串替换为所给字符串
- split函数：将匹配到的字符串作为分割符，分割字符串
- compile函数：对于多次使用的正则表达式，可以使用此函数进行预编译，提高效率

`re.DOTALL`： `.` 可以匹配所有字符（用于匹配换行符）

## 6.数据存储

### 6.1Json文件处理

- Json值：

1. 对象（python中的字典）：用大括号表示

2. 数组（python中的列表）：用中括号表示

3. 整型，浮点型，布尔型，null

4. 字符串类型（字符串必须要用双引号，不能用单引号）

   （json本质是一个字符串，多个数据要用逗号相隔）

- Python对象与json的转化

  1. json模块的dumps方法：可以将python对象转化为json字符串，保存在内存中；若存在中文字符，ensure_ascii关键字应赋值为False
  2. json模块的dump方法：可以将python对象转化为json字符串，并保存在文件中；若存在中文字符，ensure_ascii关键字应赋值为False
  3. json模块的loads方法：可以将json字符串转化为python对象
  4. json模块的load方法：可以将文件中的json字符串转化为python对象

  ```python
  ##列表，字典转Json##
  import json
  python_obj=[{'a':1},{'b':2},{'c':3}]
  json_str=json.dumps(python_obj)#返回字符串类型，并且符合json格式，对象中的字符串键都用双引号包裹
  print(json_str)
  with open('a.json','w') as f:
      json.dump(python_obj,f)#转化的json字符串保存在文件f中
  [{"a": 1}, {"b": 2}, {"c": 3}]
  ##Json转列表，字典##
  import json
  json_str='[{"a": 1}, {"b": 2}, {"c": 3}]'
  python_obj=json.loads(json_str)#返回列表类型
  print(type(python_obj))
  with open('a.json','r') as f:
      python_obj=json.load(f)#将文件中的json字符串转化为python对象
  <class 'list'>
  ```

### 6.2CSV文件处理

- CSV泛指具有以下特征的任何文件：
  1. 纯文本，使用某个字符集，比如ASCII、Unicode、EBCDIC或GB2312
  2. 由记录组成（典型的是每行一条记录）
  3. 每条记录被分隔符分隔为字段（典型分隔符有逗号、分号或制表符；有时分隔符可以包括可选的空格）
  4. 每条记录都有同样的字段序列

- 写入CSV文件

  ```python
  import csv
  header=['name','number','mark']#表头字段名
  values=[('张三',1,0),('李四',2,1),('王五',3,2)]
  values2=[{'name':'张三','number':1,'mark':0},{'name':'李四','number':2,'mark':1},{'name':'王五','number':3,'mark':1}]
  
  ###使用csv.writer写入###
  with open('a.csv','w',newline='') as f:#newline关键字默认每写入一行数据空一行，所以将newline设为''字符
      writer=csv.writer(f)#csv.writer接收一个文件句柄来初始化一个csv.writer实例
      writer.writerow(header)#writerow方法用于写入一行，这里写入表头
      writer.writerows(values)#writerows方法用于写入多行，接收一个由元组构成的列表，每个元组代表一条记录
  
      ###使用csv.Dictwriter写入###
      with open('a.csv','w',newline='') as f:
          writer=csv.DictWriter(f,header)#csv.Dictwriter接收一个文件句柄和表头来初始化一个csv.Dictwriter实例
          writer.writeheader()#必须显示调用writeheader方法才能将表头写入文件
          writer.writerows(values2)#writerows用于写入多行，接收一个由字典构成的列表，每个字典代表一条记录
  ```
  
- 读取CSV文件

  ```python
  import csv
  
  ###使用csv.reader读取文件###
  with open('a.csv','r') as f:
      reader=csv.reader(f)#csv.reader接收一个文件句柄，返回一个迭代器
      next(reader)#用于过滤表头
      for record in reader:#迭代器中每个元素代表一行，返回一个列表
          name=record[0]#通过索引的方式获取每个字段名的记录
          number=record[1]
          mark=record[2]
          print(f'name:{name},number:{number},mark:{mark}')
  
          ###使用csv.Dictreader读取文件###
          with open('a.csv', 'r') as f:
              reader = csv.DictReader(f)#csv.DictReader接收一个文件句柄，返回一个不包含表头数据的迭代器
              for record in reader:#迭代器中每个元素代表一行，返回一个字典，键对应表头字段名
                  name=record['name']#通过键值对的方式获取每个字段名的记录
                  number=record['number']
                  mark=record['mark']
                  print(f'name:{name},number:{number},mark:{mark}')
  ```


### 6.3代码操作MySQL数据库

在Python中使用`pymysql`模块操作MySQL数据库

- 连接数据库

  ```python
  import pymysql
  
  conn=pymysql.connect(host='localhost',user='root',password='apotato666',database='abc',port=3306)#使用pymysql.connect连接MySQL数据库,connect方法需要host(数据库服务器ip地址),user(登录数据库的用户名),password(登录数据库的密码),database(数据库名),port(端口号)等参数
  ```

- 插入数据

  ```python
  import pymysql
  
  conn=pymysql.connect(host='localhost',user='root',password='apotato666',database='abc',port=3306)
  cursor=conn.cursor()#建立当前连接的一个游标,操作数据库
  
  ###插入固定值###
  sql='''
  insert into users(id,value) values (1,2)
  '''
  #insert into语句用于插入数据,insert into后跟插入的表名,表名后的括号跟字段名,values后括号跟相应字段的记录
  
  ###插入变量###
  sql2='''
  insert into users(id,value) values (%s,%s)
  '''
  #无论id和value是整型还是字符串等,都是用%s
  
  id=2
  value=3
  cursor.execute(sql)#调用游标的execute方法,执行sql语句
  cursor.execute(sql2,(id,value))#插入变量时,还要传入插入的变量,以元组形式传入
  conn.commit()#调用当前连接的commit方法将修改操作保存到数据库中
  conn.close()#关闭连接
  ```

- 查找数据

  ```python
  import pymysql
  
  conn=pymysql.connect(host='localhost',user='root',password='apotato666',database='abc',port=3306)
  cursor=conn.cursor()
  
  ###精确查找###
  def demo1():
      sql = '''
      select value from users where id=1
      '''
      #select语句用于挑选数据,select后跟所需记录的字段名,from后跟表名,where用于精确筛选,where后跟筛选条件
      cursor.execute(sql)
      result = cursor.fetchone()#fetchone方法,挑选一条数据,若结果是多条,可通过迭代结果集,不断调用fetchone方法挑选出数据
      print(result)
  
  ###取出全部数据###
  def demo2():
      sql2 = '''
      select * from users
      '''
      #*代表匹配任意字段名,即挑选出该表中的所有记录
      cursor.execute(sql2)
      results=cursor.fetchall()#fetchall方法,挑选出全部的结果,返回一个列表
      for result in results:
          print(result)
  demo1()
  demo2()
  conn.close()
  ```

- 删除数据

  ```python
  import pymysql
  
  conn=pymysql.connect(host='localhost',user='root',password='apotato666',database='abc',port=3306)
  cursor=conn.cursor()
  sql='''
  delete from users where id=1
  '''
  #delete语句用于删除数据,from后跟表名,where用于精确筛选,where后跟筛选条件
  cursor.execute(sql)
  conn.commit()
  conn.close()
  ```

- 更新数据

  ```python
  import pymysql
  
  conn=pymysql.connect(host='localhost',user='root',password='apotato666',database='abc',port=3306)
  cursor=conn.cursor()
  sql='''
  update users set value=5 where id=2
  '''
  #update语句用于更新数据,update后跟表名,set设值,set后跟更新的记录,where用于精确筛选,where后跟筛选条件
  cursor.execute(sql)
  conn.commit()
  conn.close()
  ```

## 7.多线程

### 7.1线程锁

多线程是抢占式任务模式，多个线程共享全局变量，所以必须加锁，否则造成内存泄漏

```python
import threading

num=0#全局变量num
lock=threading.Lock()#创建一个全局变量锁
def add():
    global num
    for i in range(100000):
        lock.acquire()#在操作全局变量时，加锁
        num+=1
        lock.release()#操作结束后，解锁

def add2():
    global num
    for i in range(100000):
        lock.acquire()
        num+=1
        lock.release()

if __name__=='__main__':
    t1=threading.Thread(target=add)#threading.Thread类初始化一个线程，target关键字参数接收目标函数，args关键字参数接收一个可迭代对象
    t2=threading.Thread(target=add2)
    t1.start()#start方法启动线程
    t2.start()
    t1.join()#join方法让主线程阻塞，等待子线程执行完毕后再执行
    t2.join()
    print(num)
```

### 7.2`threading.Condition`类

`threading.Condition`类在无必要时可以挂起线程，等待其他线程通知，再恢复运行

该类实例的方法：

- `acquire()`：线程锁

- `release()`：释放锁
- `wait(timeout)`：线程挂起，直到收到一个notify通知或者超时（可选的，浮点数，单位是秒s）才会被唤醒继续运行。`wait()`方法必须在已获得线程锁的前提下才能调用，否则会触发RuntimeError。
- `notify(n=1)`：通知其他线程，那些挂起的线程接到这个通知之后会开始运行，默认是通知一个正等待该condition的线程,最多则唤醒n个等待的线程。notify()必须在已获得线程锁的前提下才能调用，否则会触发RuntimeError。`notify()`不会主动释放Lock。
- `notifyAll()`： 如果wait状态线程比较多，notifyAll的作用就是通知所有线程

```python
import threading,time

num=0
con=threading.Condition()

def producer():
    global num
    con.acquire()#获取线程锁
    while num>=10000000000:
        num+=1
    print(f'已生产完毕{num}个')
    con.notifyAll()#当生产一定量时，通知其他等待的线程，此方法必须在获取了线程锁的情况下才能正常执行
    con.release()#释放锁
def consumer():
    global num
    con.acquire()#获取线程锁
    con.wait()#将线程挂起，等待其他线程通知，此方法必须在获取了线程锁的情况下才能正常执行
    while num:
        num-=1
    print(f'消耗完毕')
    con.release()#释放锁


if __name__=='__main__':
    for i in range(5):
        threading.Thread(target=consumer).start()
        threading.Thread(target=producer).start()
```

### 7.3`Queue`线程安全队列

`Queue`线程安全队列，队列中的元素先进先出（FIFO），用于多线程的通信

`Queue`实例常用方法：

- `get(block=True)`：从队列中取出最先放入的元素，若队列中无元素，则默认在此处阻塞该线程
- `put(block=True)`：将元素放入队列中，若队列已满，则默认在此处阻塞该线程
- `qszie()`：获取该队列的元素个数
- `empty()`：判断该队列是否为空
- `full()`：判断该队列是否已满

## 8.Ajax数据爬取

### 8.1什么是Ajax

Ajax即异步的JavaScript和XML，它是利用 JavaScript在保证页面不被刷新、页面链接不改变的情况下与服务器交换数据并更新部分网页的技术

### 8.2Ajax基本原理

发送 Ajax请求到网页更新的这个过程分为以下三步：

1. 发送请求
2. 解析内容
3. 渲染网页

我们知道 JavaScript可以实现页面的各种交互功能，Ajax 也不例外，它也是由 JavaScript实现的，

实际上执行了如下代码：

```javascript
var xmlhttp; 
if (window.XMLHttpRequest) { 
// code for IE7+ , Firefox, Chrome, Opera, Safari 
xmlhttp=new XMLHttpRequest(); 
} 
else {
// code for IE6, IES 
xmlhttp=new ActiveXObject(”Microsoft.XMLHTTP”);
}//此段代码用于新建一个XMLHttpRequest对象
//调用XMLHttpRequest对象的onreadystatechange属性设置监听，
xmlhttp.onreadystatechange=function() { 
if (xmlhttp.ready5tate==4 && xmlhttp.status==200) { 
document.getElementById("myDiv").innerHTML=xmlhttp.responseText;//通过Javascript将解析的内容渲染至网页中
	}
}//当服务器返回响应时，function(){}里的代码将会执行，用于解析内容
xmlhttp.open("POST”,"/ajax/”, true); 
xmlhttp.send();//open和send方法用于向服务器发送请求
```

### 8.3Ajax分析方法

通过谷歌浏览器的开发者工具，选择类型为xhr请求返回的响应即可

## 9.selenium自动化爬取网页

selenium需同浏览器和相应的浏览器驱动一起才能实现自动化的需求，由于是模拟浏览器，所以它也能爬取动态渲染的网页

### 9.1打开网页

```python
from selenium import webdriver

driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'#使用的是谷歌浏览器，所以需要谷歌浏览器驱动的安装路径
driver=webdriver.Chrome(executable_path=driver_path)#使用webdriver.Chrome类初始化一个操纵谷歌浏览器的驱动
driver.get('http://www.baidu.com/')#使用创建的驱动的get方法打开网页
```

### 9.2关闭网页

```python
from selenium import webdriver

driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
driver=webdriver.Chrome(executable_path=driver_path)
driver.get('http://www.baidu.com/')
driver.close()#关闭当前页面
driver.quit()#关闭整个浏览器
```

### 9.3定位元素

```python
from selenium import webdriver
driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
driver=webdriver.Chrome(executable_path=driver_path)
driver.get('http://www.baidu.com/')

###通过标签的id获取###
driver.find_element_by_id(id)#获取第一个满足条件的元素
driver.find_elements_by_id(id)#获取所有满足条件的元素，返回一个列表

###通过标签的name获取###
driver.find_element_by_name(name)
driver.find_elements_by_name(name)

###通过标签的类名获取###
driver.find_element_by_class_name(name)
driver.find_elements_by_class_name(name)

###通过xpath语法获取###
driver.find_element_by_xpath(xpath)
driver.find_elements_by_xpath(xpath)

###通过css选择器获取###
driver.find_element_by_css_selector(css)
driver.find_elements_by_css_selector(css)
```

### 9.4操作表单元素

- 操作输入框

  ```python
  from selenium import webdriver
  
  driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
  driver=webdriver.Chrome(executable_path=driver_path)
  driver.get('http://www.baidu.com/')
  input=driver.find_element_by_id('kw')#首先定位获取输入框元素的引用
  input.send_keys('Python')#send_keys方法向输入框填充值
  input.clear()#clear方法清空输入框的值
  ```

- 操作复选框

  ```python
  from selenium import webdriver
  
  driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
  driver=webdriver.Chrome(executable_path=driver_path)
  driver.get('https://www.douban.com/')
  iframe=driver.find_element_by_xpath('//div[@class="login"]/iframe')#获取子框架的引用
  driver.switch_to.frame(iframe)#传入子框架的引用，switch_to.frame会进入子框架内
  checkbox=driver.find_element_by_name('remember')#在子框架内获取复选框的引用
  checkbox.click()#click方法会单击复选框
  ```

- 操作下拉框

  ```python
  from selenium import webdriver
  from selenium.webdriver.support.select import Select
  
  driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
  driver=webdriver.Chrome(executable_path=driver_path)
  driver.get('xxx')
  elem=driver.find_element_by_xpath('xxx')#获取下拉框元素索引
  select=Select(elem)#传入下拉框索引初始化一个Select类实例
  select.select_by_index(index)#Select类实例的select_by_index方法通过传入索引的方式点击下拉框中相对应的值
  select.select_by_value(value)#select_by_value方法通过传入值的方式点击下拉框中相对应的值
  select.select_by_visible_text(text)#select_by_visible_text方法通过传入可见文本的方式点击下拉框中相对应的值
  ```

### 9.5selenium行为链

当一个操作可以分为很多步，可以使用selenium的行为链类来完成

```python
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains

driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
driver=webdriver.Chrome(executable_path=driver_path)
driver.get('https://www.baidu.com/')
input=driver.find_element_by_id('kw')
find=driver.find_element_by_id('su')
actions=ActionChains(driver)#ActionChains需要传入一个webdriver实例来初始化一个行为链
actions.move_to_element(input)#move_to_element方法让鼠标移动至相应元素
actions.send_keys_to_element(input,'Python')#send_keys_to_element向指定元素填充值
actions.click(find)#click方法点击指定元素
actions.perform()#perform方法将上述代码按顺序执行
```

### 9.6selenium操作cookie

```python
from selenium import webdriver

driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
driver=webdriver.Chrome(executable_path=driver_path)
driver.get('https://www.baidu.com/')

###获取当前网页的cookie###
driver.get_cookies()#获取所有的cookie，返回一个列表
driver.get_cookie(name)#获取键name所对应的cookie

###删除当前网页的cookie###
driver.delete_all_cookies()#删除所有的cookie
driver.delete_cookie(name)#删除键name对应的cookie
```

### 9.7隐式等待和显式等待

- 隐式等待

  隐式等待，在获取不可用元素之前，浏览器会根据给出的时间等待

  ```python
  from selenium import webdriver
  
  driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
  driver=webdriver.Chrome(executable_path=driver_path)
  driver.get('https://www.baidu.com/')
  driver.implicitly_wait(10)#implicitly_wait方法等待十秒，让未加载的元素加载完成
  driver.find_element_by_class_name('qrcode-img')
  ```

- 显式等待

  显示等待，就是明确的要等到某个元素的出现或者是某个元素的可点击等条件，等不到，就一直等，除非在规定的时间之内都没找到，那么就抛出一个异常

  ```python
  from selenium import webdriver
  from selenium.webdriver.common.by import By
  from selenium.webdriver.support.wait import WebDriverWait
  from selenium.webdriver.support import expected_conditions as EC
  
  driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
  driver=webdriver.Chrome(executable_path=driver_path)
  driver.get('https://www.baidu.com/')
  #显示等待使用的是WebDriverWait对象，接收一个webdriver对象和超时时间，until方法用于表明等待结束的判断条件，接收一个期望条件
  elem=WebDriverWait(driver,10).until(
      EC.presence_of_element_located((By.CLASS_NAME,'qrcode-img'))
      #expected_conditions.presence_of_element_located用于定位期望的元素，接收一个元组，包含定位方式和语法
  )
  ```

### 9.8切换页面

```python
from selenium import webdriver

driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
driver=webdriver.Chrome(executable_path=driver_path)
driver.get('https://www.baidu.com/')
driver.execute_script("window.open('https://www.douban.com/')")#execute_script方法会执行传入的JavaScript代码，这里是打开新页面
driver.switch_to.window(driver.window_handles[1])#浏览器的所有页面都是window_handles列表的元素，按照打开的先后顺序存入，switch_to.window方法会将driver操控权跳转至相应页面
driver.close()
driver.switch_to.window(driver.window_handles[0])
driver.close()
```

##### 9.9selenium使用代理ip

```python
from selenium import webdriver

driver_path='C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe'
options=webdriver.ChromeOptions()#创建一个webdriver.ChromeOptions对象
options.add_argument('--proxy-server=http://175.44.109.194:9999')#add_argument为该对象添加参数，此处是添加代理，格式为'--proxy-server=代理ip'
driver=webdriver.Chrome(executable_path=driver_path,options=options)#创建webdriver对象时将webdriver.ChromeOptions对象传给options关键词参数
driver.get('http://www.httpbin.org/ip')
```

## 10.tesseract识别验证码

使用开源的tesseract识别验证码

```python
from pytesseract import pytesseract
from PIL import Image

#将tesseract的安装路径赋值给pytesseract.tesseract_cmd
pytesseract.tesseract_cmd=r'D:\tesseract\tesseract.exe'
image=Image.open('timg.jpg')#使用Image.open打开要识别的图片
string=pytesseract.image_to_string(image)#pytesseract.image_to_string用于将图片中的文字转化为python中的字符串
print(string)
```

## 11.Scrapy框架

### 11.1Scrapy框架结构

![img](/static/img/20180502174530976)

框架组件：

- Engine：处理整个系统的数据流处理，触发事务，是整个框架的核心
- Item：定义了爬取结果的数据结构，爬取的数据都会被赋值成该Item对象
- Scheduler：接受Engine发送过来的请求并将其加入队列中，在Engine再次请求的时候，把请求提供给Engine
- Downloader：下载网页内容，并将网页内容返回给Spiders
- Spiders：其内定义了爬取的逻辑和网页的解析规则，它主要负责解析响应并生成提取结果和新的请求
- Item Pipeline：负责处理由Spiders从网页中抽取的项目，它的主要任务是清洗、验证和存储数据
- Downloader Middlewares：位于Engine和Downloader之间的钩子框架，主要处理Engine与Downloader之间的请求及响应
- Spider Middlewares：位于Engine和Spiders之间的钩子框架，主要处理Spiders输入的响应和输出的结果及新的请求

数据流：

1. Engine首先打开一个网站，找到处理该网站的Spider，并向该Spider请求第一个要爬取的URL
2. Engine从Spider中获取到第一个要爬取的URL，并通过Scheduler以Request的形式调度
3. Engine向Scheduler请求下一个要爬取的URL
4. Scheduler返回下一个要爬取的URL给Engine，Engine将URL通过Downloader Middleware转给Downloader下载
5. 一旦页面下载完毕，Downloader生成该页面的Response，并将其通过Downloader Middleware送给Engine
6. Engine从Downloader中接收到Response，并将其通过Spider Midderware发送Spider处理
7. Spider处理Response，并返回爬取到的Item及新的Request给Engine
8. Engine将Spider返回的Item给Item Pipeline，将新的Request给Scheduler
9. 重复2-8步，直到Scheduler中没有更多的Request，Engine关闭该网站，爬取结束

### 11.2Scrapy入门

- 创建项目

  创建scrapy项目须在命令行执行以下代码：

  `scrapy startproject 项目名称`（如`scrapy startproject Bili`）

  会自动生成相应项目

  ![image-20200201225847948](/static/img/image-20200201225847948.png)

  项目结构如下：

  - scrapy.cfg：Scrapy项目的配置文件，其内定义了项目的配置文件路径、部署相关信息等内容

  - spiders：存放编写的所有爬虫文件
  - items.py：定义Item的数据结构，所有Item的定义都可以放这里
  - middlewares.py：定义了Spider Middlewares和Downloader Middlewares的实现
  - pipelines.py：定义Item Pipeline实现，所有的Item Pipeline实现都可以放这里
  - settings.py：定义项目的全局配置

- 创建Spider

  Spider是自己定义的类， Scrapy 用它来从网页里抓取内容，并解析抓取的结果 不过这个类必须继承 Scrapy 提供的Spider类scrapy.Spider ，还要定义 Spider 的名称和起始请求，以及怎样处理爬取的结果的方法

  创建Spider须进入相应的scrapy项目中，在命令行中执行以下代码：

  `scrapy genspider spider名称 爬取的网站域名`（如`scrapy genspider B_spider bilibili.com` )

  会自动生成spider名称的一个py文件，包含的属性和方法：

  - `name`：每个项目唯一的名字，用来区分不同的Spider
  - `allowed_domains`：允许访问的域名，若初始或后续请求的链接不在该域名下，则会被过滤掉
  - `start_urls`：包含了Spider启动时要爬取的URL列表，初始请求是由它来定义的
  - `parse(self,response)`：默认情况下，别调用时start_urls中的链接构成请求完成下载执行后，返回的响应会作为唯一参数传递给这个函数，它负责解析，提取数据或生成新的请求（重写start_requests方法，可以让初始请求传递给自定义的解析方法）
  - （补充方法）`start_requests(self)`： 此方法用于生成初始请求，它必须返回一个可迭代对象，此方法会默认使用start urls里面的 URL 来构造Request ，而且Request是GET请求方式，如果我们想在启动时以 POST方式访问某个站点，可以直接重写这个方法，发送 POST 请求时使用 FormRequest即可

  ```python
  ###B_spider.py###
  
  # -*- coding: utf-8 -*-
  import scrapy
  
  class BSpiderSpider(scrapy.Spider):
      name = 'B_spider'
      allowed_domains = ['api.bilibili.com']
      start_urls = ['https://api.bilibili.com/']
  
      def parse(self, response):
          pass
  ```

- 创建Item

  Item是保存爬取数据的容器，它的使用方法和字典类似，不过相比字典，Item多了额外的保护机制，可以避免拼写错误或定义字段错误

  创建Item需要继承scrapy.Item类，并且定义类型为scrapy.Field的字段

  ```python
  # -*- coding: utf-8 -*-
  
  # Define here the models for your scraped items
  #
  # See documentation in:
  # https://docs.scrapy.org/en/latest/topics/items.html
  
  import scrapy
  
  class BiliItem(scrapy.Item):
      uid = scrapy.Field()#通过scrapy.Field类来定义爬取数据的字段
  ```

- 解析Response

  ```python
  def parse(self,response):#默认parse方法的参数response由start_urls中的链接爬取后返回的结果
      #返回的response具有xpath方法和css方法解析数据，返回一个SelectorList对象，一个列表，所有元素都是Selector对象
      #SelectorList和Selector对象都可以调用xpath，css方法解析
      selector=response.xpath('xxx')
      selector=response.css('xxx')
      #Selector对象具有extract和extract_first方法，用于提取其中爬取到的内容
      data_list=selector.extract()#也等同于selector.getall(),返回SelectorList中所有元素的内容，组成一个列表
      data=selector.extract_first()#也等同于selector.get()，返回SelectorList中第一个元素的内容，可以给extract_first方法的default参数传值，当列表为空时，返回这个default，避免索引越界
      response.text#response是TextResponse对象，text属性以字符串的形式返回
  ```

- 使用Item及后续Request

  ```python
  import scrapy
  from Bili.items import BiliItem#需要将定义好Item数据结构的类导入
  
  class BSpiderSpider(scrapy.Spider):
      name = 'B_spider'
      allowed_domains = ['api.bilibili.com']
      start_urls = ['https://api.bilibili.com/']
  
      def parse(self, response):
          uid=response.xpath('xxx').get()
          item=BiliItem()#声明的时候需要实例化
          item['uid']=uid#类似字典，使用该类中用scrapy.Field()定义好的字段名为键进行赋值
          #也可以通过以字段名为关键字参数传值进行实例化
          #item=BiliItem(uid=uid)
          yield item#返回时应使用yield关键字，item会通过Engine传给Item Pipeline
          yield scrapy.Request(url='xxx',callback=self.parse)
          #scrapy.Request方法，url关键字参数表示后续爬取的链接，callback关键字参数表示回调函数，会将url链接中爬取到的结果返回给该函数进行解析，Request通过Enginge传给Scheduler
  ```

- 使用Item Pipeline

  Item Pipeline的常用操作：

  - 清理 HTML 数据

  - 验证爬取数据，检查爬取字段

  - 查重井丢弃重复内容

  - 将爬取结果保存到数据库

  实现Item Pipeline只需要在pipelines.py中定义一个实现了`process_item(spider,item)`的类，启用Item Pipeline时，会自动调用该类中`process_item`方法

  ```python
  ###pipelines.py###
  def process_item(self,spider,item):#参数spider是Spider实例，Spider每次生成的Item都会作为参数传递给item
  	'''
  	to do
  	'''
      return item#必须返回item，供其它实现了process_item方法的类使用，否则会抛出错误
  ```

- 运行爬虫

  - 运行前，需在setting.py中修改一些设置

    ```python
  ###setting.py###
    ROBOTSTXT_OBEY = False#不遵循robots.text协议，否则无法爬取
  DEFAULT_REQUEST_HEADERS = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en',
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
  }#为请求增加请求头，降低爬虫辨识度
    ```
  
  - 命令行中运行
  
    进入spiders所在的目录下，在命令行中运行以下代码：
  
    `scrapy crawl spider名称`（如`scrapy crawl B_spider`）
  
  - Pycharm下运行爬虫
  
    须在spiders所在的目录下新建一个py文件，并执行以下代码
  
    ```python
    from scrapy.cmdline import execute#需要导入execute方法
    execute("scrapy crawl B_spider".split())#接收一个列表，需要将在命令行中执行的代码用空格分隔作为列表中的元素
    ```

### 11.3Selector用法

Selector 是基于lxml来构建的，支持XPath选择器、css 选择器以及正则表达式，功能全面，解析速度和准确度非常高

- 直接使用

  Selector可以作为解析工具单独拿出来使用

  ```python
  from scrapy import Selector
  from urllib import request
  resp=request.urlopen('http://www.baidu.com/')
  selector=Selector(text=resp.read().decode('utf-8'))#Selector实例化时，text关键字参数需要接收一段html代码
  selector.xpath('xxx')#返回一个SelectorList对象,可以通过extract和extract_first方法获取内容
  selector.css('xxx')
  selector.re('xxx')
  ```

- Scrapy shell

  用于在爬取数据前进行调试解析逻辑。

  在命令行运行以下代码，即可进入scrapy shell模式

  `scrapy shell 爬取的网址链接`（如`scrapy shell 'http://www.baidu.com/'`)

  返回如`request`、`response`等变量（同项目中返回的request和response相同），可以通过`response`的xpath、css方法进行测试逻辑

- selector属性

  response有一个selector属性，可以通过`response.selector.xpath('xxx')`（css同）方法解析数据，本质上是通过实例化一个Selector对象，将response传给text关键字参数（与`response.xpath()`、`response.css()`同，只是这两个更快捷）

### 11.4Spider的用法

- Spider事务
  - 定义爬取网站的动作
  - 分析爬取下来的网页

-  Spider爬取循环过程
  - 以初始的 URL 初始化 Request ，并设置回调函数 当该 Request 成功请求并返回时， Response生成井作为参数传给该回调函数
  - 在回调函数内分析返回的网页内容，返回结果有两种形式 ，一种是解析到的有效结果返回字典或 Item 对象，它们可以经过处理后（或直接）保存，另一种是解析得到下一个（如下一 页）链接，可以利用此链接构造 Request并设置新的回调函数，返回 Request 等待后续调度
  - 如果返回的是字典或Item对象，我们可通过 Feed Exports 等组件将返回结果存入到文件，如果设置了Pipeline的话，我们可以使用 Pipeline 处理 （如过滤、修正等）并保存
  - 如果返回的是Request，那么Request 执行成功得到 Response之后， Response会被传递给Request 中定义的回调函数，在回调函数中我们可以再次使用选择器来分析新得到的网页内容，并根据分析的数据生成 Item

### 11.5Downloader Middleware的用法

- Downloader Middleware作用

  - 在Scheduler调度出队列的Request发送给Doanloader下载之前，也就是我们可以在Request执行下载之前对其进行修改
  - 在下载后生成Response发送给Spider之前，也就是我们可以在生成Reposne被Spider解析之前对其进行修改

- Downloader Middleware优先级

  - 开启Dwonloader Middleware需要在setting.py中设置	

    ```python
    ###setting.py###
    DOWNLOADER_MIDDLEWARES = {
       'B_user.middlewares.BUserDownloaderMiddleware': 543,#数字越小，代表优先级越高，越先调用
    }
    ```

  - 优先级越高的Dwonloader Middleware越靠近Engine，越低的越靠近Downloader

- 每一个Downloader Middleware都定义了一个或多个方法的类，核心方法如下：

  - `process_request(self, request, spider)`：参数request是Request对象，即被处理的Request，参数spider是Spider对象，即此Request对应的Spider。（定义一个仅实现此方法的类就可以实现一个Downloader Middleware）

    根据返回类型不同，分为不同情况：

    - 若返回值为None，Scrapy继续处理该Request，接着执行其他Downloader Middleware，直到Downloader把Request执行完后得到Response结束。这个过程其实就是修改Request的过程，不同的Downloader Middleware按照设置的优先级顺序依次对Request进行修改，最后送至Downloader执行
    - 若返回值为Response对象，更低优先级的Downloader Middleware的process_request和process_exception方法就不会被继续调用，每个Downloader Middleware的process_response方法转而被依次调用，调用完毕之后，直接将Response对象发送给Spider来处理
    - 若返回值为Request对象，更低优先级的Downloader Middleware的process_request方法会停止执行，这个Request会被重新放回调度队列，这是一个全新的Request，等待被调用，如果被Scheduler调度了，那么所有的Downloader Middlerware的process_request方法会重新按顺序执行
    - 如果IgnoreRequest异常抛出，则所有的Downloader Middleware的process_exception方法依次执行，如果没有一个方法处理这个异常，那么Request的errorback方法就会回调，如果该异常还没有被处理，那么它便会被忽略

  - `process_response(self, request, response, spider)`：参数response是Response对象，即此被处理的Response，参数request是Request对象，即此Response对应的Request，参数spider是Spider对象，即此Response对应的Spider

    根据返回类型不同，分为不同情况：

    - 若返回值为Request对象，更低优先级的Downloader Middleware的process_response方法不会被继续调用，该Request对象会重新回到调度队列等待被调度，这是一个全新的Request对象，然后，该Request会被process_request方法按顺次处理
    - 若返回值为Response对象，更低优先级的Downloader Middleware的process_response方法会被继续调用，继续处理该Response对象
    - 如果IgnoreRequest异常抛出，则Request的errorback方法会回调，如果该异常还没有被处理，那么它便会被忽略

  - `process_exception(self, request, exception, spider)`：参数exception是Exception对象，即抛出的异常，参数request是Request对象，即产生异常的Request，参数spider是Spider对象，即Request 对应的Spider

    根据返回类型不同，分为不同情况：

    - 当返回为None时，更低优先级的Downloader Middleware的process_exception方法会被继续顺次调用，直到所有的方法都被调度完毕

    - 当返回为Response对象时，更低优先级的Downloader Middleware的process_exception方法不再被继续调用，每个Downloader Middleware的process _response方法转而被依次调用

    - 当返回为Request对象时，更低优先级的Downloader Middleware的process_exception方法也不

      再被继续调用，该Request对象会重新放到调度队列里面等待被调度，它相当于一个全新的

      Request，然后，该 Request又会被process_request方法按顺次处理

- 设置随机请求头中间件

  通过Downloader Middleware对Request设置随机请求头

  ```python
  ###middlewares.py###
  from random import choice
  #定义一个实现了process_request方法的随机请求头下载器中间件
  class UserAgentDownloaderMiddleware(object):
      UserAgents = [
          'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; Acoo Browser 1.98.744; .NET CLR 3.5.30729)',
          'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; Acoo Browser; .NET CLR 1.1.4322; .NET CLR 2.0.50727)',
          'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; Acoo Browser; GTB5; Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1) ; InfoPath.1; .NET CLR 3.5.30729; .NET CLR 3.0.30618)']#User-Agent列表
      def process_request(self, request, spider):
          useragent=choice(self.UserAgents)#从列表中随机获取请求头
          request.headers['User-Agent']=useragent#request.headers属性是一个字典，包含了请求的headers，将其中User-Agent键的值设为随机的请求头
  ```

- 设置IP代理池中间件

  ```python
  ###middlewares.py###
  from random import choice
  class IPProxyDownloaderMiddleware(object):
      IPPool=['http://223.199.28.237:9999','http://175.44.109.194:9999','http://114.99.25.98:18118']#IP池
  
      def process_request(self, request, spider):
          if 'proxy' not in request.meta:#如果request中没有设置代理IP
              random_IP = choice(self.IPPool)#那么从IP池中随机选取一个
              request.meta['proxy']=random_IP#为request设置代理IP
  
      def process_response(self, request, response, spider):
          if response.status!=200:#如果返回页面状态码不为200，说明该IP被禁止
              for proxy in self.IPPool:
                  if request.meta['proxy']==proxy:
                      self.IPPool.remove(proxy)#从IP池中删除此IP
              request.meta['proxy']=None#将request的该代理IP删去
              return request#返回这个request，再顺次执行process_request方法
          return response#如果页面状态码正常，则返回页面内容
  ```

### 11.6Spider Middleware的用法

- Spider Middleware作用

  - 在Downloader生成的Response发送给Spider之前，对Response进行处理
  - 在Spider生成的Request发送给Scheduler之前，对Request进行处理
  - 在Spider生成的Item发送给Item Pipeline之前，对Item进行处理

- Spider Middleware优先级

  - 开启Spider Middleware需要在setting.py中设置

    ```python
    ###setting.py###
    SPIDER_MIDDLEWARES = {
       'B_user.middlewares.BUserSpiderMiddleware': 543,#数字越小，代表优先级越高，越先调用
    }
    ```

  - 优先级越高的Spider Middleware越靠近Engine，越低的越靠近Spider

- 每一个Spider Middleware都定义了一个或多个方法的类，核心方法如下（仅需实现其中一个方法，即可定义一个Spider Middleware）：

  - `process_spider_input(response,spider)`：（当Response被Spider Middleware 处理时·，process_spider_input方法被调用）参数response是Response对象，即被处理的Response，参数spider是Spider对象，即此Response对应的Spider

    根据返回类型不同，分为不同情况：

    - 若返回值为None, Scrapy将会继续处理该Response，调用所有其他的Spider Middleware，直到Spider处理该Response
    - 若它抛出一个异常，Scrapy 将不会调用任何其他Spider Middleware的process_spider_input方法，而调用Request的errback方法，errback的输出将会被重新输入到中间件中，使用process_spider_output方法来处理，当其抛出异常时则调用 process_spider_exception来处理

  - `process_spider_output(response,result,spider)`：（当Spider处理Response返回结果时，process spider_ output方法被调用）参数response是Response对象，即生成该输出的Response，参数result是包含 Request或Item对象的可迭代对象，即 Spider 返回的结果

    - process_spider_output方法必须返回包含Request或Item对象的可迭代对象

  - `process_spider_exception(response,exception,spider)`：（当Spider或Spider Middleware的process_spider_input方法抛出异常时，process_spider_exception方法被调用）参数response是Response对象，即异常被抛出时被处理的Response，参数exception是Exception对象，即抛出的异常，参数spider是Spider对象，即抛出该异常的Spider

    根据返回类型不同，分为不同情况：

    - 若返回值为None，Scrapy将继续处理该异常，调用其他Spider Middleware中的process_spider_exception方法，直到所有Spider Middleware都被调用
    - 若返回值为一个可迭代对象，则其他Spider Middleware的process_spider_output方法被调用，其他的process_spider_exception 不会被调用

  - `process_start_requests(start_requests,spider)`：参数start_requests是包含Request的可迭代对象， 即初始的请求Start Requests，参数spider是Spider对象，即Start Requests所属的Spider
    
    - process_start_requests方法必须返回另一个包含 Request 对象的可迭代对象

### 11.7Item Pipeline用法

- Item Pipeline作用

  - 清洗HTML数据
  - 验证爬取数据，检查爬取字段
  - 查重并丢弃重复内容
  - 将爬取结果保存到数据库

- Item Pipeline优先级

  - 开启Item Pipeline需要在setting.py中设置

    ```python
    ###setting.py###
    ITEM_PIPELINES = {
       'B_user.pipelines.BUserPipeline': 300,#数字越小，代表优先级越高，越先调用
    }
    ```

- Item Pipeline核心方法

  - `process_item(item,spider)` ：自定义Item Pipeline必须实现的方法。参数item是Item对象，即被处理的Item，参数spider是Spider对象，即生成该Item的Spider

    根据返回类型不同，分为不同情况：

    - 若返回值为Item对象，那么此Item会被更低优先级的Item Pipeline的process_item方法处理，直到所有的方法被调用完毕
    - 若它抛出的是Drop Item异常，那么此 Item会被丢弃，不再进行处理

  - `open_spider(self,spider)`：在Spider开启的时候被自动调用的。在这里我们可以做一些初始化操作，如开启数据库连等。 其中，参数 spider就是被开启的Spider对象

  - `close_spider(spider)` ：在Spider关闭的时候自动调用的。在这里我们可以做一些收尾操作，如关闭数据库连接等。其中，参数spider就是被关闭的Spider对象

  - `from_crawler(cls,crawler) `：这是一个类方法，用＠classmethod 标识，是一种依赖注入的方式。它的参数是crawler，通过crawler对象，我们可以拿到Scrapy的所有核心组件，如全局配置的每个信息，然后创建一个Pipeline实例。参数cls就是Class ，最后返回一个Class 实例

- Images Pipeline

  ```python
  from scrapy.pipelines.images import ImagesPipeline
  from scrapy.exceptions import DropItem
  from scrapy import Request
  import re
  class ArticlespiderPipeline(ImagesPipeline):
      def file_path(self, request, response=None, info=None):
          url=request.url
          file_name=re.sub('\D','',url)
          return file_name
      def item_completed(self, results, item, info):
          image_path=[x['path'] for ok,x in results if ok]
          if not image_path:
              raise DropItem
          return item
      def get_media_requests(self, item, info):
          yield Request(item['url'])
  ```


## 12.App爬取

### 12.1Charles+mitmdump抓取App

- Charles原理

  手机和PC端在同一个局域网下，并且手机端要设置了Charles的代理地址，这样手机访问互联网的数据包都会流经Charles，再由Charles转发给服务器，服务器返回的数据包也会经由Charles发回手机，这样就可以从Charles中获取所由的请求和响应，同时还能对请求进行修改重发（修改重发功能多用于测试参数是否必要）

- mitmdump的使用

  - mitmdump原理同Charles类似

  - 在命令行中执行`mitmdump -w outfile`即可将截获的数据写入outfile文件中

  - 在命令行中执行`mitmdump -s script.py`，指定script.py脚本处理截获的数据

    - 脚本处理request和response

      ```python
      ###script.py###
      
      ###处理request###
      def request(flow):#定义request方法会对发送数据的请求进行处理，参数flow是HTTPFlow对象
          flow.request.headers['User-Agent']='MitmProxy'#HTTPFlow对象的request属性即为当前请求对象，此处请求的请求头被修改为MitmProxy
          flow.request.url='http://www.baidu.com/'#修改请求的url，此时无论你访问那个网址，返回得内容都为百度页面
      #flow.request还有cookies,host,Method,Scheme等属性
          
      ###处理response###
      def response(flow):#定义response方法会对返回的响应进行处理，参数flow是HTTPFlow对象
          text=flow.response.text#HTTPFlow对象的response属性即为当前响应对象，该响应对象得text属性返回网页得源代码
      #flow.response还有status,code,headers,cookies等属性
      ```

  - 日志功能

    ```python
    ###script.py###
    from mitmproxy import ctx
    
    def request(flow):
        info=ctx.log.info
        info('...')#ctx.log.info接收一个字符串作为参数，该方法在命令行中输出的内容为白色
        warn=ctx.log.warn
        warn('...')#ctx.log.warn接收一个字符串作为参数，该方法在命令行中输出的内容为黄色
        error=ctx.log.error
        error('...')#ctx.log.error接收一个字符串作为参数，该方法在命令行中输出的内容为红色
    ```

  - 爬取b站番剧热榜

    - Charles用于寻找相应接口链接及分析网页，mitmdump对接python脚本用于过滤请求，定义解析数据的逻辑及保存数据

    - 代码

      ```python
      import json
      def response(flow):
          url='https://api.bilibili.com/pgc/season/rank/list'#通过Charles分析出的接口链接
          if flow.request.url.startswith(url):#该条件用于过滤无关的请求
              response=flow.response.text#获取响应内容
              data=json.loads(response)
              hot_list=data['data']['list']
              with open(r'C:\Users\Admin\PycharmProjects\untitled1\python学习\bili_hot.json','w',encoding='utf-8') as f:#保存数据
                  for hot in hot_list:
                      hot_data=dict(desc=hot['desc'],rank=hot['rank'],title=hot['title'])
                      json.dump(hot_data,f,ensure_ascii=False)
                      f.write('\n')
      ```


### 12.2Appium的使用

- Appium相关操作

  Appium相当于一个服务器，我们可以向Appium发送一些操作指令，Appium就会根据不同的指令对移动设备进行驱动，完成不同的动作。Appium实际上继承了 Selenium, Appium也是利用 WebDriver来实现 App的自动化测试

  - 启动App

    首先需要开启Appium服务，默认监听4723端口，我们可以使用Python代码通过Appium-Python-Client包对Appium服务发送指令，启动App

    启动App需要相应配置参数

    - platformName：平台名称，安卓手机则为Android，苹果为iOS
    - deviceName：设备名称，此处为手机具体类型（如OPPO_R17）
    - appPackage：需要启动的App对应的程序包名
    - appActivity：入口Activity名

    手机通过USB与电脑连接，打开需要启动的app界面，并在命令行中执行以下代码

    `adb devices -l`：获取手机类型

    `adb shell`：进入shell模式，再执行`dumpsys activity | grep mFocusedActivity `，即可获得对应appPackage和appActivity

    代码实现

    ```python
    from appium import webdriver
    
    PLATFORM='Android'
    DEVICE_NAME='HUAWEI_MLA_AL10'
    APP_PACKAGE='com.tencent.mm'
    APP_ACTIVITY='.ui.LauncherUI'
    DRIVER_SERVER ='http://localhost:4723/wd/hub'#指定Appium服务的IP
    
    class POST(object):
        def __init__(self):
            self.desired_caps={
                'platformName':PLATFORM,
                'deviceName':DEVICE_NAME,
                'appPackage':APP_PACKAGE,
                'appActivity':APP_ACTIVITY
            }#需要启动的app的相应配置，是一个字典
            self.driver=webdriver.Remote(DRIVER_SERVER,self.desired_caps)
            #webdriver.Remote类接收Appium服务的IP和相应的配置信息作为参数，初始化一个webdriver对象
    ```

  - xpath定位元素

    由于继承自Selenium，所以也具备相应定位元素的方法

    - 如果元素**text**是唯一的，可以通过text文本定位

      `driver.find_element_by_xpath("//*[@text='value']")`

    - 如果元素**id**是唯一的，也可以id属性定位

      `driver.find_element_by_xpath("//*[@resource-id='value']")`

    - 联合**resource-id**属性和**text**文本属性来下定位

      `driver.find_element_by_xpth("//*[@resource-id='value'][@text='value']")`

    - **class**属性唯一的话，同样可以通过class属性定位，有两种方法

      -  //class属性 

        `driver.find_element_by_xpath("//android.widget.EditText")`

      -  //*[@class=’class属性’] 

        `driver.find_element_by_xpath("//*[@class='android.widget.EditText']")`

    - 通过**content-desc**属性定位

      `driver.find_element_by_xpath("//*[@content-desc='value']")`

    - **contains**模糊定位

      `driver.find_element_by_xpath('//*[contains(@attr, "value")]')`

    - **组合定位**

      如果一个元素有2个属性，通过xpath也可以同时匹配2个属性,text, resource-id,class ,index,content-desc这些属性都能任意组合定位

      ```python
      # id和class属性
      id_class = '//android.widget.EditText[@resource-id="com.taobao.taobao:id/home_searchedit"]'
      driver.find_element_by_xpath(id_class)
      
      # text和index属性  
      desc_class = '//*[@text="注册/登录" and @index="1"]'
      driver.find_element_by_xpath(desc_class)
      
      # class和text属性  
      class_text = '//android.widget.EditText[@text="请输入手机号码"]'
      driver.find_element_by_xpath(class_text)
      
      # id和desc 
      id_desc = '//*[contains(@resource-id, "aliuser_menu_item_help") and @content-desc="帮助"]'
      driver.find_element_by_xpath(id_desc)
      ```

  - 模拟操作

    - 点击

      `tap(self,positions,duration=None)`：可以模拟多指点击屏幕，和设置按时长短，参数positions是由点击位置组成的列表，参数duration表示点击持续时间

      若是普通的按钮点击，由相应按钮直接调用`click()`方法即可

    - 屏幕拖动

      `scroll(self,origin_el,destination_el)`：可以实现从元素origin_el滚动到元素destination_el，参数origin_el为被操作的元素，参数destination_el为目标元素

      `swipe(self,start_x,start_y,end_x,end_y)`：可以实现从A点滑动到B点，参数start_x为开始位置的横坐标，参数start_y为开始位置的纵坐标，参数end_x为目标位置的横坐标,参数end_y为目标位置的纵坐标

      `flick(self,start_x,start_y,end_x,end_y)`：实现从A点快速滑动到B点，参数同上

    - 拖曳

      `drag_and_drop(self,origin_el,destination_el)`：实现将元素origin_el拖曳至元素 destination_el，参数origin_el为被操作的元素，参数destination_el为目标元素

    - 文本输入

      `set_text(text)`：由相应元素调用，设置其text属性的值，参数text为相应值

      `send_keys(keys)`：由相应元素调用，设置其text属性的值，参数keys为相应值

