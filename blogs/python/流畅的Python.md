---
title: 流畅的Python
date: 2019-02-03
categories:
- Python
tags:
- Python
---

## 1. **Python**数据模型

数据模型其实是对 Python 框架的描述，它规范了这门语言自身构建模块 的接口，这些模块包括但不限于序列、迭代器、函数、类和上下文管理器。

### 1.1一摞**Python**风格的纸牌

```python
#通过纸牌类介绍一些特殊方法
from collections import namedtuple
Card=namedtuple('Card',['rank','suit'])#nametuple构建一个简单类，用于构建只有极少属性和方法的对象，此对象内容不可更改，是tuple的子类
class Deck:
    ranks=[str(n) for n in range(2,11)]+list('JKQA')
    suits='黑桃 红桃 方块 梅花'.split()
    def __init__(self):
        self._cards=[Card(rank,suit) for rank in self.ranks for suit in self.suits]
    def __getitem__(self,item):#实现特殊方法__getitem__()，此类可迭代，可用索引取数据，可切片
        return self._cards[item]
    def __len__(self):#实现特殊方法__len__(),此类可以是len()的调用对象
        return len(self._cards)
#对扑克进行升序排序，给一摞扑克牌排序。按照2最小，A最大；黑桃最大，红桃次之，方块再次，梅花最小。按照这个规则给扑克牌排序，梅花2大小是0，黑桃A是51
suit_values=dict(黑桃=3,红桃=2,方块=1,梅花=0)
def spades_high(cards):#构造排序参照的函数
    rank_values=Deck.ranks.index(cards.rank)
    return  rank_values * len(suit_values) + suit_values[cards.suit]
if __name__ == '__main__':
    deck=Deck()
    deck[0]
    deck[1:3]
    for i in sorted(deck,key=spades_high):#对扑克进行排序
        print(i)
    len(deck)   
```

### 1.2如何使用特殊方法

特殊方法的存在是为了被 Python 解释器调用的，你自己并不需要调用它们。也就是说没有 `my_object.__len__()` 这种写法， 而应该使用 `len(my_object)`。在执行 `len(my_object)` 的时候，如果`my_object` 是一个自定义类的对象，那么 Python 会自己去调用其中由 你实现的 `__len__` 方法。 

#### 1.2.1模拟数值类型

```python
#实现一个Vector向量类，利用特殊方法实现加乘等运算
from math import hypot
class Vector:
    def __init__(self,x=0,y=0):
        self.x=x
        self.y=y
    def __repr__(self):#实现特殊方法__repr__()可以对对象用字符串进行自我描述
        return f'Vector({self.x,self.y})'
    def __add__(self,other):#实现特殊方法__add__()可以进行+运算
        x=self.x+other.x
        y=self.y+other.y
        return Vector(x,y)
    def __mul__(self,other):#实现特殊方法__mul__()可以进行*运算
      	return Vector(self.x*other,self.y*other)
    def __abs__(self):#实现特殊方法__abs__()可以abs()的调用对象
        return hypot(self.x,self.y)
if __name__=='__main__':
    v=Vector(3,4)
    v1=Vector(4,5)
    v3=v1+v
    v4=v*3
    print(abs(v))
```

#### 1.2.2字符串表示形式

Python 有一个内置的函数叫 `repr`，它能把一个对象用字符串的形式表达出来以便辨认，这就是“字符串表示形式”。如果没有实现 `__repr__`，当我们在控制台里打印一个向量的实例时，得到的字符串可能会是 `<Vector object at 0x10e100070>`

#### 1.2.3算术运算符

通过 `__add__` 和 `__mul__`为向量类带来了 + 和 * 这两个算 术运算符。值得注意的是，**这两个方法的返回值都是新创建的向量对象，被操作的两个向量（self 或 other）还是原封不动，代码里只是读取了它们的值而已。中缀运算符的基本原则就是不改变操作对象，而 是产出一个新的值。**

#### 1.2.4自定义的布尔值

默认情况下，我们自己定义的类的实例总被认为是真的，除非这个类对 `__bool__` 或者 `__len__` 函数有自己的实现。`bool(x)` 的背后是调用 `x.__bool__()` 的结果；如果不存在 `__bool__` 方法，那么 `bool(x)` 会尝试调用 `x.__len__()`。若返回 0，则 `bool` 会返回 False；否则返回 True。 

## 2.序列构成的数组

### 2.1内置序列类型概览

容器序列:`list`、`tuple` 和 `collections.deque` 这些序列能存放不同类型的 数据。 

扁平序列:`str`、`bytes`、`bytearray`、`memoryview` 和 `array.array`，这类 序列只能容纳一种类型。 

可变序列:`list`、`bytearray`、`array.array`、`collections.deque` 和 `memoryview`。 

不可变序列:`tuple`、`str` 和 `bytes`。 

### 2.2列表推导和生成表达式

列表推导是构建列表（list）的快捷方式，而生成器表达式则可以用来创建其他任何类型的序列。

#### 2.2.1列表推导和可读性

普通代码

```python
#把一个字符串变成 Unicode 码位的列表
symbols = '$¢£¥€¤'
codes=[]
for x in symbols:
    codes.append(ord(x))
print(codes)
[36, 162, 163, 165, 8364, 164]
```

列表推导(通常的原则是，只用列表推导来创建新的列表，并且尽量保持简短。)

```python
#把一个字符串变成 Unicode 码位的列表
symbols = '$¢£¥€¤'
codes=[ord(x) for x in symbols]#列表推导，代码变得更加简洁
print(codes)
[36, 162, 163, 165, 8364, 164]
```

#### **2.2.2** 列表推导同**filter**和**map**的比较

用列表推导创建的表单 

```python
symbols = '$¢£¥€¤'
codes = [ord(x) for x in symbols if ord(x) > 127]
print(codes)
[162, 163, 165, 8364, 164]
```

 用map/filter 组合创建的表单

```python
symbols = '$¢£¥€¤'
codes=list(filter(lambda c:c>127,map(ord,symbols)))
print(codes)
[162, 163, 165, 8364, 164]
```

#### 2.2.3笛卡儿积

```python
colors=['black','white']
sizes=['S','M','L']
tshirts=[(color,size) for color in colors for size in sizes]
#列表推导中的for嵌套和以下for语句执行顺序相同
# for color in colors:
#     for size in sizes:
#         ...
print(tshirts)
tshirts = [(color, size) for size in sizes for color in colors]#交换顺序，嵌套关系改变
print(tshirts)
[('black', 'S'), ('black', 'M'), ('black', 'L'), ('white', 'S'), ('white', 'M'), ('white', 'L')]
[('black', 'S'), ('white', 'S'), ('black', 'M'), ('white', 'M'), ('black', 'L'), ('white', 'L')]
```

#### 2.2.4生成器表达式

生成器表达式背后遵守了迭代器协议，可以逐个地产出元素这种方式显然能够节省内存，它可以生成列表以外的序列类型。 

生成器表达式的语法跟列表推导差不多，只不过把方括号换成圆括号而已。

```python
symbols = '$¢£¥€¤'
print(tuple(ord(x) for x in symbols))#如果生成器表达式是一个函数调用过程中的唯一参数，就不需要额外的括号
(36, 162, 163, 165, 8364, 164)
```

```python
symbols = '$¢£¥€¤'
a=array.array('I',(ord(x) for x in symbols))#有两个参数，生成器表达式需要括号
print(a)
array('I', [36, 162, 163, 165, 8364, 164])
```

与列表推导不同，生成器表达式只会在每次for循环运行时生成一个组合，节省了许多内存

### 2.3元祖不仅仅是不可变的列表

####  2.3.1元祖和记录

元祖除了用作不可变的列表，它还可以用于没有字段名的记录。如果把元组当作一些字段的集合，那么数量和位置信息就变得非常重要了。如果在任何的表达式里我们在元组内对元素排序，这些元素所携带的信息就会丢失，因为这些信息是跟它们的位置有关的。 

```python
strong_id=[('美国',1),('中国',2),('日本',3)]
for x in sorted(strong_id):
    print('%s:%s'%x)#%格式运算符可以匹配到对应元组元素上
for _,x in strong_id:#for循环提取元组元素，即元组拆包，不需要的数据可以用'_'占位符
    print(x)
中国:2
日本:3
美国:1
美国
中国
日本 
```

#### 2.3.2元祖拆包

元组拆包可以应用到任何可迭代对象上，唯一的硬性要求是，被可迭代对象中的元素数量必须要跟接受这些元素的元组的空档数一致。除非我们用 * 来表示忽略多余的元素。最好辨认的元组拆包形式就是平行赋值，也就是说把一个可迭代对象里的元素，一并赋值到由对应的变量组成的元组中。

```python
Point=(3,4)
x,y=Point#对应的赋值给x,y
print(x)
3
```

用*运算符把一个可迭代对象拆开作为函数的参数:

```python
divmod(20,8)#传入两个参数
t=(20,8)
print(divmod(*t))#只传了一个t，*将元组t拆成20，8
```

用*****来处理剩下的元素 :

```python
a,b,*c=range(5)
print(a,b,c)
0 1 [2, 3, 4]
```

在平行赋值中，* 前缀只能用在一个变量名前面，但是这个变量可以出现在赋值表达式的任意位置：

```python
a,*b,c=range(5)
print(a,b,c)
0 [1, 2, 3] 4
```

#### 2.3.3嵌套元组拆包

```python
a=(1,2,3,(4,5,6))
b,c,d,(f,g,h)=a
print(b,c,d,f,g,h)
1 2 3 4 5 6
```

#### 2.3.4具名元组

`namedtuple`函数可以让元组给记录中的字段命名。它可以用来构建一个带字段名的元组和一个有名字的类

```python
from collections import namedtuple
City=namedtuple('City','name country population coordinates')
#namedtuple需要两个参数，第一个是类名，第二个是类的属性名，后者可以是数个字符串组成的可迭代对象如：['a','b']，或者是一串空格符相隔的字符串
city=City('北京','中国','14亿',(128,35))
#存放在对应字段里的数据要以一串参数的形式传入到构造函数中(注意，元组的构造函数却只接受单一的可迭代对象)。
print(city)
print(city.name,city[0])#可以通过属性名或者位置获取信息
City(name='北京', country='中国', population='14亿', coordinates=(128, 35))
北京 北京
```

除了从普通元组那里继承来的属性之外，具名元组还有一些自己专有的属性。

```python
city._fileds#_fields属性是一个包含这个类所有属性名称的元组。
data=['华盛顿','美国','5亿',(55,44)]
city1=City._make(data)#_make()接受一个可迭代对象来生成这个类的实例和City(*data)一样
print(city1._asdict())#_asdict() 把具名元组以collections.OrderedDict的形式返回
OrderedDict([('name', '华盛顿'), ('country', '美国'), ('population', '5亿'), ('coordinates', (55, 44))])
```

### 2.4切片

#### 2.4.1对对象进行切片

```python
a=[1,2,3,4,5,6,7,8]
a[1::3]#从索引1到最后，以3为间隔取值
#a:b:c这种用法只能作为索引或者下标用在[]中返回一个切片对象:slice(a,b,c)
#对seq[a:b:c],python会调用__getitem__(slice(a,b,c))
```

#### 2.4.2多维切片和省略

`[]` 运算符里还可以使用以逗号分开的多个索引或者是切片，外部库`NumPy` 里就用到了这个特性，二维的 `numpy.ndarray 就`可以用 `a[i,j]` 这种形式来获取（第i行第j列），抑或是用 `a[m:n, k:l]`（第m-n行第k-l列） 的方式来得到二维切片。要正确处理`[]`这种运算符，对象的特殊方法`__getitem__()`和`__setitem__()`以元组的形式接受参数(i,j)。比如获得`a[i,j]`的值，Python会调用`a.__getitem__((i,j))`

Python内置序列都是一维，只支持单一索引。

省略（ellipsis）的正确书写方法是三个英语句号`...`，省略在Python 解析器眼里是一个符号，而实际上它是 Ellipsis 对象的别名，而 Ellipsis 对象又是 ellipsis 类的单一实例。

```python
print(type(...))
<class 'ellipsis'>
```

在`NumPy` 中，`...` 用作多维数组切片的快捷方式。如果 x 是四维数组，那么 `x[i, ...]` 就是 `x[i, :, :, :]` 的缩写。

#### 2.4.4给切片赋值

```python
l=[1,2,3,4,5,6]
l[1:5]=[100]
#l[1:5]=100 会报错
#如果复制对象是切片，等号右侧必须是可迭代对象，即便只有单独一个值，也要把它转换成可迭代的序列。
print(l)
l[1:5]=[10,20,30,40,50,60,70]
print(l)
[1, 100, 6]
[1, 10, 20, 30, 40, 50, 60, 70]
#给切片赋值，赋值的序列长度不一定要与切片范围相等
#切片赋值，会将切片范围全变为等号右侧的序列中的所有值
```

### 2.5使用`+`和`*`

`+`拼接两个同类型的序列

`*`把一个序列复制几份并拼接

```python
print('abd'*5)
abdabdabdabdabd
```

**`*`用于序列时的易错点**

```python
l=[[1,2,3]]*3
print(id(l[0]),id(l[1]))#序列l中的元素是对列表[1,2,3]的引用，三个引用全都指向同一个列表[1,2,3]
l[0][0]=100#改动其中一个引用中的值，其余两个值跟着变化
print(l)
2091866219144 2091866219144
[[100, 2, 3], [100, 2, 3], [100, 2, 3]]
#该错误实质
#l=[]
#x=[1,2,3]
#for i in range(3):
#	l.append(x)三次都append同一个对象
```

**正确做法**

```python
#令序列l中的元素指向不同的引用
l=[[1,2,3]for i in range(3)]
print(id(l[0]),id(l[1]))
1828702806728 1828706838984
#实质
#l=[]
#for i in range(3):
#	x=[1,2,3]#每次都新建一个序列
#	l.append(x)#每次都append不同的序列
```

### 2.6序列的增量赋值

运算符`+=`背后的特殊方法是`__iadd()__`（用于就地加法），与`+`运算符背后的特殊方法`__add__()`不同，`__iadd()__`不会产生新对象，直接改动调用该方法的对象。但是如果一个类 没有实现这个方法的话，Python 会退一步调用 `__add__()` 。

```python
a+=b#直接改动对象a，不产生新对象
#如果没有实现__iadd__(),调用__add__() 
a+=b#实质是a=a+b,a+b产生新对象赋值给a
```

运算符`*=`背后的特殊方法是`__imul__`

```python
l=[1,2,3]
print(id(l))
l*=2#未产生新对象，l的id值没变
print(id(l))
l=l*2#产生新对象并赋给l，l的id值改变
print(id(l))
1583375868552
1583375868552
1583375868616
```

对于不可变序列进行重复拼接，如`*=`，`+=`操作时，总是会产生新对象（`str`除外）

```python
t=(1,2,3,4)
print(id(t))
t*=2
print(id(t))
1735881072952
1735877242216#元组t的id值改变
```

### **2.7** **list.sort**方法和内置函数**sorted** 

`list.sort()`就地排序列表，返回值是None。Python 的一个惯例：如果一个函数或者方法对对象进行的是就地改动，那它就应该返回 None，好让调用者知道传入的参数发生了变动，并未产生新对象。

```python
l=[2,43,521,23,5,1]
print(id(l))
list.sort(l)#就地排列序列l
print(l,'\n',id(l))
1717549294216
[1, 2, 5, 23, 43, 521] 
1717549294216
```

与 `list.sort()` 相反的是内置函数 `sorted()`，它会新建一个列表作为返回值。

```python
l=[2,43,521,23,5,1]
print(id(l))
print(l)
l=sorted(l)#返回新列表，l的id值改变
print(id(l))
2201150513800
[2, 43, 521, 23, 5, 1]
2201154429576
```

`list.sort()`和 `list.sort()` 都有两个可选参数

`reverse`:默认为False，如果设置为True,列表降序排列

`key`:接受一个只有**一个参数**的函数，这个函数将会作用在序列里每一个元素，如`key=len`，序列将基于每个元素的长度进行排序。该参数的默认值是恒等函数（identity function），也就是默认用元素自己的值来排序。

### 2.8用bisect来管理已排序的序列

`bisect` 模块包含两个主要函数，`bisect` 和 `insort`，两个函数都利用二分查找算法来在有序序列中查找或插入元素。 

#### 2.8.1用**`bisect`**来搜索 

`bisect(hystack,needle)`在`hystack`中搜索`needle`的位置，该位置满足插入`needle`后，`hystack`依然能保持升序的排列（`hystack`必须是一个有序序列）该函数返回值为`needle`的位置

```python
import bisect
l=[23, 25, 56, 60, 245]#有序
index=bisect.bisect_left(l,152)#bisect_left返回的插入位置是原序列中跟被插入元素相等的元素的位置
l.insert(index,152)#调用insert()插入needle
index1=bisect.bisect_right(l,152)#bisect_right返回的插入位置是原序列中跟被插入元素相等的元素的后一位
print(index,'\t',index1)
print(l)
4 	 5
[23, 25, 56, 60, 152, 245]
```

`bisect`有两个可选参数，`lo`和`hi`，`lo`默认值为0，`hi`默认值为序列长度

#### 2.8.2用**`bisect.insort`**插入新元素 

相比先用`bisect`搜索插入位置在调用`insert`函数插入序列，`bisect.insort`一步到位，效率更高。

```python
import bisect
l=[23, 25, 56, 60, 245]
bisect.insort(l,152)#把152插入序列l中，并保持升序
print(l)
```

`insort` 跟 `bisect` 一样，有 `lo` 和 `hi` 两个可选参数用来控制查找的范围。它也有个变体叫 `insort_left`，这个变体在背后用的是`bisect_left`。 

### 2.9当列表不是首选时

若要存放大量的浮点型数据，数组比列表更优。若要频繁的对序列做先进先出操作，双端队列更优。

#### 2.9.1数组

如果我们需要一个只包含数字的列表，那么 array.array 比 list 更高效。数组支持所有跟可变序列有关的操作，包括 `.pop`、`.insert` 和`.extend`。另外，数组还提供从文件读取和存入文件的更快的方法，如`.frombytes` 和 `.tofile`。 

Python创建数组需要一个类型码，用来表示在底层的C语言要存放怎样的数据类型。比如 b 类型码代表的是有符号的字符（signed char），因此 array('b') 创建出的数组就只能存放一个字节大小的整数，范围从 -128 到 127。

```python
from array import array
from random import random
floats=array('d',(random() for i in range(10**7)))#利用生成器表达式建立一个有1000万数据的双精度浮点数组
with open ('floats.bin','wb') as f:
    floats.tofile(f)#把数组写入二进制文件
floats2=array('d')#建立一个双精度浮点空数组
with open ('floats.bin','rb') as f:
    floats2.fromfile(f,10**7)#将二进制文件数据读入数组
print(floats[-1]==floats2[-1])#检查两个数组内容是否一样
```

`array.tofile`和`array.fromfile`从二进制文件中读或存数据比从文本文件中要快，且节约空间，

#### 2.9.2**`NumPy`**和**`SciPy`** 

```python
import numpy
a=numpy.arange(12)#新建一个0-11个整数的numpy.ndarray
print(a,'\t',type(a),a.shape)#a.shape==(12,)表示是一维的有十二个元素的数组
a.shape=3,4#将数组变成二维，3行4列
print(a)
print(a[2],'\t',a[1:3,1:3])#a[2]输出索引为2的行，a[1:3,1:3]多维切片，输出索引为1-2的行和列
print(a.transpose())#转置数组
[ 0  1  2  3  4  5  6  7  8  9 10 11] 	 <class 'numpy.ndarray'> (12,)
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]
[ 8  9 10 11] 	 [[ 5  6]
 [ 9 10]]
[[ 0  4  8]
 [ 1  5  9]
 [ 2  6 10]
 [ 3  7 11]]
```

#### 2.9.3双向队列和其他形式的队列

`collections.deque` 类（双向队列）是一个线程安全、可以快速从两端添加或者删除元素的数据类型。而且如果想要有一种数据类型来存放“最近用到的几个元素”，`deque` 也是一个很好的选择。这是因为在新建一个双向队列的时候，你可以指定这个队列的大小，如果这个队列满员了，还可以从反向端删除过期的元素，然后在尾端添加新的元素。

```python
from collections import deque
dq=deque(range(10),maxlen=10)#maxlen设置双向队列的最大长度，一旦设定，无法修改
print(dq)
dq.rotate(3)#rotate(n),n>0,队列最右边的n个移到队列左边
print(dq)
dq.rotate(-3)#rotate(n),n<0,队列最左边的n个移到队列右边
print(dq)
dq.appendleft(11)#往左添加元素
print(dq)
dq.extend([22,33,44])#默认往右扩展元素，当超过最大长度，左端超出部分会被删除（接收参数必须是可迭代对象）
print(dq)
dq.extendleft([55,66,77])#依次往左扩展元素，当超过最大长度，右端超出部分会被删除（接收参数必须是可迭代对象）
print(dq)
deque([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], maxlen=10)
deque([7, 8, 9, 0, 1, 2, 3, 4, 5, 6], maxlen=10)
deque([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], maxlen=10)
deque([11, 0, 1, 2, 3, 4, 5, 6, 7, 8], maxlen=10)
deque([2, 3, 4, 5, 6, 7, 8, 22, 33, 44], maxlen=10)
deque([77, 66, 55, 2, 3, 4, 5, 6, 7, 8], maxlen=10)
```

## 3.字典和集合

### 3.1泛映射类型

`collections.abc` 模块中有 `Mapping` 和 `MutableMapping` 这两个抽象基类，它们的作用是为 `dict` 和其他类似的类型定义形式接口，这两个抽象基类主要是作为形式化的文档，定义了构建一个映射类型最基本的接口，可以通过`isinstance`判断某个数据是否广义的映射类型

```python
from collections import abc
my_dict={}
print(isinstance(my_dict,abc.Mapping))#这里isinstance用于判断是否为映射类型，不一定是dict
```

非抽象映射类型一般不会直接继承这些抽象基类，它们会直接对`dict` 或是 `collections.User.Dict` 进行扩展。标准库里所有映射类型都是利用`dict`来实现，所有他们都有一个共同的限制，**这些映射类型的键必须要是可散列类型**（值任意）

所谓可散列类型，就是实现了`__hash__()`方法且在这个对象的生命周期中，其散列值必须不变，还要实现`__eq__()`方法可以与其他键作比较（如果两个可散列对象相等，那么他们的散列值一定相等）

原子不可变数据类型（`str`,`bytes`,数值类型）都是可散列类型，`frozenset`也是可散列的，`frozenset`只能容纳可散列类型，只包含可散列类型元素的元组也是可散列的。

```python
s1='zwf'
b1=b'zwf1'
i=24
print(hash(s1),'\t',hash(b1),'\t',hash(i))#str,bytes,数值类型全部可hash
f=frozenset([1,2,3])
print(hash(f))#frozset可hash
x1=(1,2,(1,23))#该元组只包含可散列类型
print(hash(x1))
x2=(1,2,[1,23])#包含列表不可散列
# print(hash(x2))会报错
-4696435562073253474 	 -3996458412943816530 	 24
-272375401224217160
-43666807656270293
```

一般来讲用户自定义的类型的对象都是可散列的，散列值就是它们的 `id()` 函数的返回值，所以所有这些对象在比较的时候都是不相等的。如果一个对象实现了 `__eq__` 方法，并且在方法中用到了这个对象的内部状态的话，那么只有当所有这些内部状态都是不可变的情况下，这个对象才是可散列的。 

### 3.2字典推导

构造字典的多种方式

```
d=dict(a=1,b=2)
d1={'a':1,'b':2}
d2=dict([('a',1),('b',2)])
d3=dict(zip(['a','b'],[1,2]))
d4=dict({'a':1,'b':2})
print(d==d1==d2==d3==d4)
True
```

字典推导

```python
l=[('a',1),('b',2)]
d={key:value for key,value in l}
print(d)
{'a': 1, 'b': 2}
```

### 3.3用`setdefault`处理找不到的键

当字典`d[k]`(背后方法是`d.__getitem()__`)找不到键k时，Python会抛出异常，可以用`d.get(k,default)`替代`d[k]`，给找不到的键k一个默认返回值。若要更新某个键的值时用`d.setdefault(k,default)`更好。

```python
#get和__getitem__更新键值对
#查询每个单词出现的位置
import re
index={}
WORD_RE = re.compile(r'\w+')
with open('word.text','r') as fp:
    for line_no, line in enumerate(fp, 1):
        for match in WORD_RE.finditer(line):#返回符合正则条件的迭代器
            word = match.group()
            column_no = match.start() + 1
            location = (line_no, column_no)#返回单词的行和列
            occurrence=index.get(word,[])#get方法查询是否存在键word，不在则返回空列表，存在则返回对于值
            occurrence.append(location)
            index[word]=occurrence#更新键值对，键word不存在则自动创建
for word in sorted(index, key=str.upper):
    print(word,':',index[word])
```

上述示例至少需要查询字典两次，若键不存在则要查询三次，效率低

```python
#用setdefault改进
#occurrence=index.get(word,[])
#occurrence.append(location)
#index[word]=occurrence
#可替换为
index.setdefault(word,[]).append(location)#一步到位，只要查询一次
#若键word不存在，setdefault就将键word和[]放入字典，并返回[]，再向空列表插入值
#若键word存在，setdefault就返回相应值
```

### 3.4映射的弹性键查询

为了方便起见，有时候查询的某个键即使不在映射里，我们也希望在查询这个键的时候返回一个默认值。其一是使用`defauldict`的类型，其二是创建一个自定义的`dict`的子类，并实现`__missing__`方法

#### 3.4.1`defaultdict`

在实例化一个 `defaultdict` 的时候，需要给构造方法提供一个可调用对象，这个可调用对象会在 `__getitem__` 碰到找不到的键的时候被调用，让 `__getitem__` 返回某种默认值。 

```python
from collections import defaultdict
dd=defaultdict(list)#提供可调用对象list
dd['a'].append(12)#当键'a'不存在时，调用list()生成一个新列表，将键'a'和新列表放入字典并返回新列表的引用
print(dd)
defaultdict(<class 'list'>, {'a': [12]})
```

这个用来生成默认值的可调用对象存放在`defaultdict`实例的`defaul_factory`属性里。

```python
from collections import defaultdict
dd=defaultdict(list)
print(dd.default_factory)
<class 'list'>
```

如果在创建 `defaultdict` 的时候没有指定 `default_factory`，查询不存在的键会触发 `KeyError`。

**`defaultdict` 里的 `default_factory` 只会在`__getitem__` 里被调用，在其他的方法里完全不会发挥作用。** 比如，`dd` 是个 `defaultdict`，k 是个找不到的键， `dd[k]` 这个表达式会调用 `default_factory` 创造某个默认值，而 `dd.get(k)` 则会返回 `None`。 

所有这一切背后都是特殊方法`__missing__`在起作用，它会在`defaultdict`找不到键的时候调用`default_factory` 

#### 3.4.2特殊方法`__missing__`

所有映射类型在找不到键时都会牵扯到`__missing__`方法。虽然基类`dict`并没有定义这个方法，但是它知道有`__missing__`方法的存在，当一个类继承了`dict`并实现了`__missing__`方法，在这个继承类`__getitem__`找不到键时，会自动调用`__missing__`方法，而不是抛出异常（`__missing__`方法只在`__getitem__`中起作用）

```python
#用非字符串键查找字符串键
class StrDict(dict):
    def __missing__(self, key):
        if isinstance(key,str):#若找不到的键是字符串则报错
            raise KeyError
        return self[str(key)]#若找不到的键不是字符串则转化为字符串继续找
    def get(self,key,default=None):
        try:
            return self[str(key)]#get将寻找的任务委托给__getitem__
        except KeyError:
            return default#若__getitem__失败则返回default
    def __contains__(self, item):
        return item in self.keys() or str(item) in self.keys()
#使用k in d.keys()而不是k in d 是为了避免无限递归
sd=StrDict([('1',2),('2',3)])
print(sd[2])
3
```

### 3.5字典的变种

pass

### 3.6子类化`UserDict`

就创造自定义映射类型，以`UserDict`为基类比以`dict`为基类要方便。

`UserDict`并不是`dict`的子类，但是却有一个`data`属性是`dict`的实例，这个属性是`UserDict`最终存储数据的地方，这样我们就能更好的重写一些方法

```python
#继承UserDict优化3.4.2的代码，UserDict的get方法与3.4.2一样所以不必重写
from collections import UserDict
class StrDict(UserDict):
    def __missing__(self, key):
        if isinstance(key,str):
            raise KeyError
        return self[str(key)]
    def __contains__(self, item):
        return str(item) in self.data#__contains__代码变得更简洁，因为默认的我们将所有存储的键都转化为字符串
    def __setitem__(self, key, value):
        self.data[str(key)]=value#因为data属性，所以可以重写__setitem__方法将所以键转化字符串，避免递归
#若是继承dict
#def __setitem(self,key,value):
#	self[str(key)]=value 会无限递归调用__setitem__
sd=StrDict([(1,0),(2,1)])
sd[3]=2
print(sd,sd[3])
{'1': 0, '2': 1, '3': 2} 2
```

`UserDict`继承的是`MutableMapping`,所以 `StrKeyDict` 里剩下的那些映射类型的方法都是从 `UserDict`、`MutableMapping` 和`Mapping` 这些超类继承而来的。特别是最后的 `Mapping` 类，它虽然是 一个抽象基类（ABC），但它却提供了好几个实用的方法。

`MutableMapping.update` 

这个方法不但可以为我们所直接利用，它还用在 `__init__` 里，让构造方法可以利用传入的各种参数（其他映射类型、元素是 `(key,value)` 对的可迭代对象和键值参数）来新建实例。因为这个方法在背后是用 `self[key] = value` 来添加新值的，所以它其实是在使用我们的 `__setitem__` 方法。

`Mapping.get` 

原理相同

```python
def get(self,key,default=None):
	try:
		return self[str(key)]
    except KeyError:
        return default
```

### 3.7不可变的映射类型

标准库里的所有的映射类型都是可变的，但有时候不能让用户错误的修改某个映射，这就要靠`types`模块中的一个封装类`MappingProxyTypes`，如果给这个类一个映射，他会返回一个只读的映射视图，但它是动态的，尽管不不可以对映射视图进行修改，但对原映射的修改会反馈到映射视图上

```python
from types import MappingProxyType
d={'a':1,'b':2,'c':3}
dproxy=MappingProxyType(d)#返回一个不可改变的动态映射视图
print(dproxy)
#dproxy['d']=4会报错，不可修改
d['d']=4#原映射的修改会改变映射视图
print(dproxy)
{'a': 1, 'b': 2, 'c': 3}
{'a': 1, 'b': 2, 'c': 3, 'd': 4}
```

### 3.8集合论

集合是集许多唯一对象的聚集，所以集合可以去重。集合中的元素必须是可散列的，`set`类型本身是不可散列的，但是`frozenset`可以，所以可以建立一个包含不同`frozenset`的`set`

```python
l=[1,2,2,2,3]
print(set(l))
#set([[1,2],[3,4]])报错，list不可散列
[1,3]
```

集合间的操作

```python
a|b#集合a，b的并集
#a.union(b)只要求a是集合，b可以是任意可迭代对象
a&b#集合a，b的交集
#a.intersection(b)只要求a是集合，b可以是任意可迭代对象
a-b#集合a，b的差集
#a.difference(b)只要求a是集合，b可以是任意可迭代对象
```

#### 3.8.1集合推导

```python
a={i for i in [1,2,3,3,4,4]}
print(a)
{1, 2, 3, 4}
```

### 3.9`dict`和`set`的背后

pass

## 4.文体和字节序列

pass

## 5.一等函数

在Python中函数是一等对象。在运行时创建，能够赋值给变量或者数据结构中的其他元素，能作为参数传给函数，能作为函数返回结果的是一等对象。整数，字符串，字典等都是一等对象。

### 5.1把函数视作对象

```python
def f(x):
    '''return x'''
    return x
print(f.__doc__)#函数对象的一个属性，返回函数中的注释
print(type(f))#f是function类的一个实例
a=f#函数对象f赋值给a
for i in map(f,range(1,3)):#函数对象f作为参数传给map
    print(i)
print(a(3))#a(3)可调用与f(3)相等
return x
<class 'function'>
1
2
3
```

### 5.2高阶函数

接受函数为参数或者将函数作为返回值的函数都是高阶函数。函数式编程的特点之一就是使用高阶函数

内置函数`sorted`

```python
#单词倒叙后排序
l=['apple','banana','potato']
def reverse(l):
    return l[::-1]
print(sorted(l,key=reverse))#sorted是高阶函数，参数key接收一个单参数函数，用作排序的参考
['banana', 'apple', 'potato']
```

函数`map`,`filter`（可以用生成器表达式代替，更易读方便）

```python
l=['apple','banana','potato']
def reverse(l):
    return l[::-1]
print(list(map(reverse,filter(lambda x:'o' not in x,l))))
#map是高阶函数，将一个可迭代对象的每个元素作用于函数中，一个参数接收函数，另一个参数接收一个可迭代对象，返回值是一个生成器
#filter是高阶函数，用于过滤一个序列，一个参数接收函数用作过滤条件，另一个参数接收一个可迭代对象，返回值是一个生成器
['elppa', 'ananab']
```

函数`reduce`

```python
#reduce是高阶函数，将某个操作连续作用在序列的每个元素上，最后归约成一个值，一个参数接收函数，另一个参数接收可迭代对象
from functools import reduce
def mul(a,b):
    return a*b
def add(a,b):
    return a+b
print(reduce(mul,range(1,11)))#reduce用于阶乘
print(reduce(add,range(1,11)))#reduce用于累加
```

all 和 any 也是内置的归约函数。

`all(iterable)`如果 `iterable` 的每个元素都是真值，返回 True；`all([])` 返回True。

 `any(iterable)` 只要 `iterable` 中有元素是真值，就返回True；`any([])` 返回False。 

### 5.3匿名函数

`lambda`关键字在Python表达式中创建匿名函数

```python
#单词倒叙后排序
l=['apple','banana','potato']
print(sorted(l,key=lambda x:x[::-1]))
#用匿名函数省去大部分书写reverse函数的代码，匿名函数lambda大多数用作参数传给高阶函数
#书写形式 lambda 参数:返回值
['banana', 'apple', 'potato']
```

### 5.4可调用对象

除了用户定义的函数 ，调用运算符`()`也可以应用到其他对象。若要判断一个对象是否可调用，可以使用内置函数`callable()`

```python
print([callable(obj) for obj in (abs,str,13)])#判断对象是否可调用
[True,True,False]
```

Python的7种可调用对象

用户定义的函数：使用`def`，`lambda`创建的函数

内置函数：使用`CPython`实现的`len`，`time.strftime`等

内置方法：使`CPython`实现的`dict.get`方法等

方法：类定义体中定义的方法

类：调用类时，类会运行`__new__`方法创建一个实例，再运行`__init__`方法初始化实例，最后将实例返回给调用方，因为Python中没有`new`运算符，所以调用类就和调用函数一样

类的实例：如果类定义了`__call__`方法，类的实例就可以作为函数调用

生成器函数：使用`yield`关键字的函数或方法。调用生成器函数，返回的是生成器对象

### 5.5用户定义的可调用类型

```python
#从一个随机序列中打出一个元素
import random
class Bingo:
    def __init__(self,items):
        self._items=list(items)#初始化实例，保证接收的参数一定是列表
        random.shuffle(self._items)#由于接收的一定是列表，所以shuffle可以正常运行，打乱序列
    def pick(self):
        try:
            return self._items.pop()#返回序列中最后一个元素，若没有元素，则报错
        except IndexError:
            raise LookupError('No element')
    def __call__(self):
        return self.pick()#实现__call__,使得self.pick()的快捷方式变为self()
bingo=Bingo(range(11))
print(bingo())#实例作为函数调用，运行的pick方法
```

### 5.6从定位参数到仅限关键字参数

调用函数时，使用`*`和`**`展开可迭代对象，映射到单个参数

```python
#组合一个html的标签
def HtmlTag(name,*content,cls=None,**attr):#*content是可变参数，cls=None是默认参数，**attr是关键字参数
    if cls:
        attr['class']=cls
    if attr:
        attr_str=''.join(f'{key}={value} 'for key,value in sorted(attr.items()))
    else:
        attr_str=''
    if content:
       return ''.join(f'<{name} {attr_str}>{c}</{name}>'for c in content)
    else:
        return f'<{name} {attr_str}/>'
tag=HtmlTag('p','hello',cls='tag',id='t1')
#p被参数name捕获，hello被可变参数*content捕获存入一个元祖，tag被cls捕获，t1被关键字参数捕获
tag1=HtmlTag(name='p')
#定位参数name也可以以关键字参数的形式传入
d={'name':'img','src':'www.potato.com','cls':'tag','id':'t1'}
tag2=HtmlTag(**d)
#传入一个字典，字典前的**可以将字典中的所有元素作为单个参数传入，字典中的同名键会被绑定到对应的具名参数，其余的被attr捕获
print(tag)
print(tag1)
print(tag2)
<p class=tag id=t1 >hello</p>
<p />
<img class=tag id=t1 src=www.potato.com />
```

仅限关键字参数

```python
def f(a,*,b):#*后面的是仅限关键字参数，只能以关键字的形式指定传入
    pass
f(3,b=2)#f(3,2)报错
def f1(a,*arg,b):#若在可变参数后还有定位参数，则该定位参数为仅限关键字参数
    pass
f(3,2,b=1)#f(3,2,1)会报错
```

### 5.8获取关于参数的信息

函数对象有个`__defaults__`属性，他的值是一个元组，里面存着定位参数和关键字参数的默认值，仅限关键字参数的默认值存在`__kwdefaults__`，参数名称在`__code__`中，它的值是要给code对象的引用，自身也有很多属性。

```python
#在字符串最后一个空格处截断
def clip(text,maxlen=80):#设置一个最大长度
    end=None
    space_before=text.rfind(' ',0,maxlen)#rfind从右往左寻找第一次出现符合条件的位置并返回
    if space_before:
        end=space_before
    else:
        space_after=text.rfind(' ',maxlen)
        if space_after>=0:
            end = space_after
    if end is None:
        end=len(text)
    return text[:end].rstrip()#rstrip删除字符串末尾指定字符
print(clip.__defaults__,'\n',clip.__code__,'\n',clip.__code__.co_varnames,'\n',clip.__code__.co_argcount)
#__default__返回text和maxlen的默认值，__code__返回一个code对象的引用，__code__.co_varnames以元组形式返回函数参数及函数体中出现的所有局部变量名，__code__.co_argcount返回函数参数个数
(80,) 
<code object clip at 0x000002419D0D4780, file"C:/Users/Admin/PycharmProjects/untitled1/dd.py", line 1> 
('text', 'maxlen', 'end', 'space_before', 'space_after') 
 2
```

使用`inspect`模块更友好的获取参数信息

```python
#获取clip函数的签名
from dd import clip
from inspect import signature
sig=signature(clip)
print(type(sig))#signature()返回一个Signature对象
print(sig)#返回参数信息
for name,param in sig.parameters.items():
#Signature对象有一个parameters属性，是一个有序映射，把参数名和Parameters对象对应起来
    print(param.kind, ':', name, '=', param.default)#Parameter对象有default，kind，name属性
<class 'inspect.Signature'>
(text, maxlen=80)
POSITIONAL_OR_KEYWORD : text = <class 'inspect._empty'>#inspect._empty值表示没有默认值,None是有效默认值
POSITIONAL_OR_KEYWORD : maxlen = 80
```

kind 属性有5 个值，保存在`_ParameterKind`中

```python
from inspect import _ParameterKind
for i in _ParameterKind:
    print(i)
POSITIONAL_ONLY#定位参数
POSITIONAL_OR_KEYWORD#定位或关键字参数
VAR_POSITIONAL#定位参数元组
KEYWORD_ONLY#仅限关键字参数
VAR_KEYWORD#关键字参数元组
```

 `inspect.Signature` 对象有个 bind 方法，它可以把任意个参数绑定到签名中的形参上，所用的规则与实参到形参的匹配方式一样。框架和`IDE`可以使用这个方法在真正调用函数前验证参数

```python
from inspect import signature
sig=signature(clip)
d={'text':'hello world','maxlen':20}
bound_args=sig.bind(**d)#将字典参数传给bind，绑定标签上对应的参数名
print(bound_args)
for k,v in bound_args.arguments.items():#bound_args.arguments是一个OrderedDict对象
    print(f'{k}={v}')
<BoundArguments (text='hello world', maxlen=20)>
text=hello world
maxlen=20
```

### 5.9函数注解

注解用于为函数声明中的参数和返回值添加元数据（元数据是用于描述数据属性信息的数据）

```python
def clip(text:str,maxlen:int>0=80)->str:#与原clip函数唯一不同的点在于第一行
#函数声明中的各个参数可以在:之后添加注解表达式，如果是参数有默认值，注解则放在参数名和等号之间，如果想注解返回值，则在)和函数声明末尾的:之间添加一个->和一个表达式。（表达式可以是任何类型）
    end=None
    space_before=text.rfind(' ',0,maxlen)
    if space_before:
        end=space_before
    else:
        space_after=text.rfind(' ',maxlen)
        if space_after>=0:
            end = space_after
    if end is None:
        end=len(text)
    return text[:end].rstrip()
```

注解不会做任何处理，它只是储存在`__annotations__`（一个字典中）

```python
print(clip.__annotations__)
{'text': <class 'str'>, 'maxlen': 'int>0', 'return': <class 'str'>}
```

`inspect.signature()` 函数可以提取函数注解

```python
sig=signature(clip)
print(sig.return_annotation)#返回返回值的注解
for param in sig.parameters.values():#sig.parameters.values()返回一个个Parameters对象的元组
    notes=repr(param.annotation).ljust(13)#Parameters的annotation属性获取参数的注解
    print(notes,':',param.name,'=',param.default)#Parameters的name属性获取参数名，default属性获取定位参数和关键字参数的默认值
```

### 5.10支持函数式编程的包

#### 5.10.1`operator`模块

在函数式编程中，经常需要把算术运算符当作函数使用。例如，不使用递归计算阶乘。求和可以使用 sum 函数，但是求积则没有这样的函数。`operator` 模块为多个算术运算符提供了对应的函数，从而避免编写`lambda a, b: a*b` 这种平凡的匿名函数。使用算术运算符函数，可以 计算阶乘

```python
#利用mul计算阶乘
from operator import mul
from functools import reduce
print(reduce(mul,range(1,11)))#避免编写reduce(lambda a,b:a*b,range(1,11))
3628800
```

`operator` 模块中还有一类函数，能替代从序列中取出元素或读取对象属性的 `lambda` 表达式：因此，`itemgetter` 和 `attrgetter` 其实会自行构建函数。 

`itemgetter`常用于根据元组的某个字段给元组列表排序。`itemgetter(1)` 的作用与 `lambda fields:fields[1]`相同，`itemgetter` 使用 [] 运算符，因此它不仅支持序列，还支持映射和任何实现 `__getitem__` 方法的类。 

```python
from operator import itemgetter
l=[('中国','北京','14亿'),('日本','东京','7亿'),('美国','纽约','8亿')]
for i in sorted(l,key=itemgetter(1)):#根据国家首都名进行排序
    print(i)
('日本', '东京', '7亿')
('中国', '北京', '14亿')
('美国', '纽约', '8亿')
```

如果把多个参数传给 `itemgetter`，它构建的函数会返回提取的值构成的元组

```python
fields=itemgetter(0,1)
for x in l:
    print(fields(x))
('中国', '北京')
('日本', '东京')
('美国', '纽约')
```

`attrgetter` 与 `itemgetter` 作用类似，它创建的函数根据名称提取对象的属性。如果把多个属性名传给`attrgetter`，它也会返回提取的值构成的元组。此外，如果参数名中包含 .（点号），`attrgetter` 会深入嵌套对象，获取指定的属性。

```python
from collections import namedtuple
from operator import attrgetter
metro_data=metro_data = [('Tokyo', 'JP', 36.933, (35.689722, 139.691667)), ('Delhi NCR', 'IN', 21.935, (28.613889, 77.208889)), ('Mexico City', 'MX', 20.142, (19.433333, -99.133333)),('New York-Newark', 'US', 20.104, (40.808611, -74.020386)), ('Sao Paulo', 'BR', 19.649, (-23.547778, -46.635833))]
LatLong = namedtuple('LatLong', 'lat long')
Metropolis = namedtuple('Metropolis', 'name cc pop coord')
metro_areas = [Metropolis(name, cc, pop, LatLong(lat, long)) for name, cc, pop, (lat, long) in metro_data]
fields=attrgetter('name','coord.lat','coord.long')#获得name，coord.lat，coord.long的属性值
for x in metro_areas:
    print(fields(x))
('Tokyo', 35.689722, 139.691667)
('Delhi NCR', 28.613889, 77.208889)
('Mexico City', 19.433333, -99.133333)
('New York-Newark', 40.808611, -74.020386)
('Sao Paulo', -23.547778, -46.635833)
```

`methodcaller`的作用与 `attrgetter` 和 `itemgetter` 类似，它会自行创建函数。`methodcaller` 创建的函数会在对象上调用参数指定的方法

```python
from operator import methodcaller
s='hello world'
up_method=methodcaller('upper')
print(up_method(s))#在对象s上调用upper方法
HELLO WORLD
```

#### **5.10.2** 使用`functools.partial`冻结参数 

`functools.partial` 这个高阶函数用于部分应用一个函数。部分应用是指，基于一个函数创建一个新的可调用对象，把原函数的某些参数固定。使用这个函数可以把接受一个或多个参数的函数改编成需要回调的API，这样参数更少。

```python
from functools import partial
from operator import mul
p=partial(mul,3)#用mul创建一个p函数，把第一个定位参数设置为3
print(p(7))
21
```

## 6.使用一等函数实现设计模式

### **6.1** 案例分析：重构**“**策略**”**模式 

如果合理利用作为一等对象的函数，某些设计模式可以简化

#### 6.1.1经典的“策略”模式

上下文（环境）:接收信息，根据策略给出结果<-------策略:通过接收上下文给出的信息提供不同的策略<-------具体策略

电商领域有个功能明显可以使用“策略”模式，即根据客户的属性或订单中的商品计算折扣。 

```python
'''假如一个网店制定了下述折扣规则。
有 1000 或以上积分的顾客，每个订单享 5% 折扣。 
同一订单中，单个商品的数量达到 20 个或以上，享 10% 折扣。 
订单中的不同商品达到 10 个或以上，享 7% 折扣。 
简单起见，我们假定一个订单一次只能享用一个折扣。'''
from abc import abstractmethod,ABC
from collections import namedtuple
Customer=namedtuple('Customer','name fidelity')
class Lineitem:
    def __init__(self,product, quantity, price):
        self.product=product
        self.quantity=quantity
        self.price=price
    def total(self):
        return self.price*self.quantity
class Order:#上下文(环境)把一些计算委托给实现不同算法的可互换组件，它提供服务。这个Order就是上下文，它会根据不同的算法计算促销折扣。
    def __init__(self,customer,cart,promotion=None):
        self.customer=customer
        self.cart=list(cart)
        self.promotion=promotion
    def total(self):
        if not hasattr(self,'__total'):
            self.__total=sum((item.total() for item in self.cart))
        return self.__total
    def due(self):
        if self.promotion==None:
            discount=0
        else:
            discount=self.promotion.discount(self)
        return self.total()-discount
    def __repr__(self):
        return f'<Order total:{self.total()} due:{self.due()}>'
class Promotion(ABC):#策略实现不同算法的组件共同的接口。这个Promotion抽象基类扮演这个角色。
    @abstractmethod#使用 @abstractmethod 装饰器，定义抽象方法discount，从而明确表明所用的模式。
    def discount(self,order):
        pass
class FidelityPromo(Promotion):
    #具体策略一： """为积分为1000或以上的顾客提供5%折扣"""
    def discount(self,order):
        return order.total() * .05 if order.customer.fidelity >= 1000 else 0
class BulkItemPromo(Promotion):
    #具体策略二： """单个商品为20个或以上时提供10%折扣"""
    def discount(self,order):
        discount=0
        for item in order.cart:
            if item.quantity >= 20:
                discount += item.total() * .1
        return discount
class LargeOrderPromo(Promotion): 
    #具体策略三： """订单中的不同商品达到10个或以上时提供7%折扣"""
    def discount(self, order):
        distinct_items = {item.product for item in order.cart}
        if len(distinct_items) >= 10:
            return order.total() * .07
        return 0
```

#### 6.1.2使用函数实现**“**策略**”**模式

6.1.1每个具体策略都是一个类，而且都只定义了一个方法， 即 `discount`。此外，策略实例没有状态（没有实例属性）。你可能会说，它们看起来像是普通的函数——的确如此。

具体策略一般没有内部状态，只是处理上下文中的数据。此时，一定要使用普通的函数，别去编写只有一 个方法的类，再去实现另一个类声明的单函数接口。函数比用户定义的类的实例轻量，Python编译模块时只会创建一次。普通的函数也是可共享的对象，可以同时在多个上下文（Order实例）中使用。 

```python
#使用函数重构策略代码更简洁
...
class Order:
	...	
    def due(self):
        if self.promotion==None:
            discount=0
        else:
            discount=self.promotion(self)#由于具体策略是函数，调用直接self.promotion(self)即可
        return self.total()-discount
#不使用抽象基类，每一个具体策略都是一个函数
def Fidelity_Promo(order):
    return order.total() * .05 if order.customer.fidelity >= 1000 else 0
def BulkItem_Promo(order):
        discount=0
        for item in order.cart:
            if item.quantity >= 20:
                discount += item.total() * .1
        return discount
def LargeOrder_Promo(order):
        distinct_items = {item.product for item in order.cart}
        if len(distinct_items) >= 10:
            return order.total() * .07
        return 0
```

#### 6.1.3选择最佳策略：简单的方式 

```python
#建立一个可以自动选择最佳策略的函数
promo_list=[FidelityPromo,BulkItemPromo,LargeOrderPromo]#将所有具体策略函数对象放入一个列表
def best_promo(order):
    return max(promo(order) for promo in promo_list)#遍历列表返回折扣最大值的策略
```

#### 6.1.4找出模块中的全部策略

在6.1.3中选择最佳策略上还存在缺陷：若想添加新的促销策略，要定义相应的函数，还要记得把它添加到promos 列表中；否则，当新促销函数显式地作为参数传给 Order时，它是可用的，但是 best_promo 不会考虑它。

在 Python 中，模块也是一等对象，而且标准库提供了几个处理模块的函数。

`globals()`：返回一个字典，表示当前的全局符号表。这个符号表始终针对当前模块（对函数或方法来说，是指定义它们的模块，而不是调用它们的模块）。

```python
promo_list=[globals()[name] for name in globals() if name.endswith('_Promo') and name != 'best_promo']#每个具体策略的函数名都是以 _promo 结尾，所以迭代 globals()返回字典中的各个具体策略的函数名,同时排除最佳策略防止无限递归
def best_promo(order):
    return max(promo(order) for promo in promo_list)
```

收集所有可用促销的另一种方法是，在一个单独的模块（如`dddd`）中保存所有策略函数，把 best_promo 排除在外。 通过`inspect`模块自动审查模块`dddd`

```python
import inspect,dddd#存放具体策略的模块
promo_list=[func for name,func in inspect.getmembers(dddd,inspect.isfunction)]
#inspect.getmembers()有两个参数，第一个参数是用于获取对象，第二个参数是可选的判断条件（一个布尔值函数）
#name是函数名字符串，func是函数对象的地址
def best_promo(order):
    return max(promo(order) for promo in promo_list)
```

## 7.函数装饰器和闭包

函数装饰器用于在源码中“标记”函数，以某种方式增强函数的行为

### 7.1装饰器基础知识 

装饰器是可调用的对象，其参数是另一个函数（被装饰的函数）。 装饰器可能会处理被装饰的函数，然后把它返回，或者将其替换成另一个函数或可调用对象。 

```python
@decorate
def target():
    pass
#以上等同于target=decorate(target)
```

```python
#装饰器通常会将被修饰的函数替换为另一个函数
def decorate(func):
    def inner():
        print('inner is running')
    return inner
@decorate
def target():
    print('target is running')
target()#target被替换成inner
print(target.__name__)#target的名字变成inner
inner is running
inner
```

### **7.2 Python**何时执行装饰器 

装饰器的一个关键特性是，它们在被装饰的函数定义之后立即运行

```python
dec=[]
def decorate(func):
    print(f'decorate is running {func}')
    dec.append(func)
    return func
@decorate
def target1():
    print('target1 is running')
@decorate
def target2():
    print('target2 is running')
print(dec)
#装饰器在被装饰函数定义时就运行，即使不调用函数，函数也已经被装饰
decorate is running <function target1 at 0x000001500ECE91F8>
decorate is running <function target2 at 0x000001500ECE9438>
[<function target1 at 0x000001500ECE91F8>, <function target2 at 0x000001500ECE9438>]
```

装饰器在真实代码中的常用方式：

1.装饰器通常在一个模块中定义，然后应用到其他模块中的函数上

2.大 多数装饰器会在内部定义一个与被装饰函数不同的函数，然后将其返回

### **7.3** 使用装饰器改进**“**策略**”**模式

```python
#使用装饰器改善6.1.4中的“策略”模式
prom_list=[]
def promotion(func):#装饰器promotion的作用是将被装饰函数放入一个列表中
    prom_list.append(func)
    return func
@promotion
#只要用@promotion这种方式就可以将所有具体策略函数装入一个列表中
def Fidelity_Promo(order):
    ...
@promotion
def BulkItem_Promo(order):
    ...
@promotion
def LargeOrder_Promo(order): 
    ...
print(prom_list)
[<function Fidelity_Promo at 0x00000186714F94C8>, <function BulkItem_Promo at 0x00000186714F9558>, <function LargeOrder_Promo at 0x00000186714F95E8>]
```

### 7.4变量作用域规则

函数内定义的是局部变量，若在函数内有和全局变量同名的局部变量，默认操作的是函数内的局部变量

```python
b=9
def f():
	print(b)#若找不到局部变量b则会去找全局变量b
    #b=6使b变成局部变量，会使print(b)报错
```

使用`global`会把变量当作全局变量处理

```python
b=9
def f():
    global b#b是全局变量
    print(b)
    b=6#全局变量b被赋值为6
f()
print(b)
9
6
```

### 7.5闭包

闭包指延伸了作用域的函数，其中包含函数定义体中引用、但是不在定义体中定义的非全局变量。**关键是它能访问定义体之外定义的非全局变量。**

假如有个名为 avg 的函数，它的作用是计算不断增加的系列值的均值，相较于建立一个类来说，也可以创建一个高阶函数，通过闭包进行处理

```python
def make_average():
    series=[]#series是make_average()的局部变量
    def average(new_value):
        series.append(new_value)#series在average中是自由变量(指未在本地作用域中绑定的变量)
        return sum(series)/len(series)
    return average
avg=make_average()
print(avg(10))
print(avg(20))
print(avg(30))
10.0
15.0
20.0
#理论上，series是make_averag函数的局部变量，可是，调用 avg(10) 时，make_average函数已经返回了，而它的本地作用域也一去不复返了。但是在闭包中，series是自由变量
```

自由变量`series`的绑定在返回的`avg.__closure__`属性中，`avg.__closure__`中各个元素对应`avg.__code__.co_freevars`中的一个名称，`avg.__closure__`中每个元素都是一个`cell`对象，自由变量的值保存在`cell`对象的属性`cell.content`中

```python
print(avg.__closure__)#储存自由变量的引用
print(avg.__code__.co_freevars)#储存自由变量名
print(avg.__closure__[0].cell_contents)#储存自由变量的值
(<cell at 0x0000029D16D57198: list object at 0x0000029D16CA5248>,)
('series',)
[10, 20, 30]
```

### 7.6`nonlocal`声明

`nonlocal`将一个变量标记为自由变量

使用`nonlocal`完善make_average函数

```python
def make_average():
    count=0
    total=0
    def average(new_value):
        # count+=1
        # total+=new_value
        # 会报错，这里count和total是不可变类型，是average的局部变量，未赋值
        nonlocal count,total#count和total被标记为自由变量
        count+=1
        total+=new_value
        return total/count
    return average
avg=make_average()
print(avg(10))
print(avg(20))
print(avg(30))
10.0
15.0
20.0
```

### 7.7实现一个简单的装饰器

```python
import time
def clock(func):
    def wrapper(*arg):#可变参数保证可以接收任意个定位参数
        st=time.time()#记录初试时间
        result=func(*arg)#运行被装饰函数并保存结果
        ed=time.time()#记录结束时间
        t=ed-st#被装饰函数运行总时间
        name=func.__name__#被装饰函数名
        args=','.join(str(ag) for ag in arg)
        print(f'[{t}]{name}({args})--->{result}')
        return result
    return wrapper
@clock
#相当于
#def isdec(n):
#    ...
#isdec=clock(isdec)此时isdec函数名已经变为wrapper
def isdec(n):
    return n if n<2 else n*isdec(n-1)
```

这是装饰器的典型行为：把被装饰的函数替换成新函数，二者接受相同 的参数，而且（通常）返回被装饰的函数本该返回的值，同时还会做些额外操作。

### 7.8标准库中的装饰器

#### **7.8.1** 使用`functools.lru_cache`做备忘 

若用自己编写的装饰器`@clock`，则会出现以下情况

```python
import time
@clock
def isdec(n):
    return n if n<2 else isdec(n-2)+isdec(n-1)
print(isdec(3))
#由结果看isdec(1),isdec(2)等被多次计算，浪费了很多时间
[0.0]isdec(1)--->1
[0.0]isdec(0)--->0
[0.0]isdec(1)--->1
[0.0]isdec(2)--->1
[0.0]isdec(3)--->2
2
```

使用`functools.lru_cache`装饰器

```python
import time,functools
@functools.lru_cache()#使用functools.lru_cache装饰器需要加括号，因为lru_cache可以接收配置参数
@clock#叠加装饰器
#相当于
#def isdec(n):
#	...
#isdec=functools.lrucache(clock(isdec))
def isdec(n):
    return n if n<2 else isdec(n-2)+isdec(n-1)
print(isdec(3))
#没有重复计算的结果
[0.0]isdec(1)--->1
[0.0]isdec(0)--->0
[0.0]isdec(2)--->1
[0.000995635986328125]isdec(3)--->2
2
```

`lru_cache` 可以使用两个可选的参数来配置

```python
functools.lru_cache(maxsize=128,type=False)
#maxsize大小表示缓存多少个计算结果，缓存满了，旧的结果会被扔掉，maxsize一般设为2的幂
#type若设为True，会把不同参数类型得到的结果分开保存
#lru_cache使用字典存储结果，而且键根据调用时传入的定位参数和关键字参数创建，所以被 lru_cache 装饰的函数，它的所有参数都必须是可散列的。
```

#### 7.8.2单分派泛函数

`@singledispatch` 装饰的普通函数会变成泛函数： 根据第一个参数的类型，以不同方式执行相同操作的一组函数。（类似于`java`的函数重载）

```python
from functools import singledispatch
from collections import abc
import numbers
@singledispatch
#使用@singledsipatch标记处理obj类型的基函数Basic_def,使其变为泛函数
def Basic_def(obj):
    pass
#各个专门函数使用 @<<Base_function>>.register(<<type>>)进行标记
@Basic_def.register(numbers.Integral)
#各个专门函数不需要名字可用_代替
def _(n):
    print(f'接收的参数类型为int--->{n}')
@Basic_def.register(str)
def _(text):
    print(f'接收的参数类型为str--->{text}')
@Basic_def.register(abc.MutableSequence)
@Basic_def.register(tuple)
def _(seq):
    print(f'接收的参数类型为序列--->{seq}')
Basic_def(3)
Basic_def('abc')
Basic_def((1,2,3))
Basic_def([1,2,3])
接收的参数类型为int--->3
接收的参数类型为str--->abc
接收的参数类型为序列--->(1, 2, 3)
接收的参数类型为序列--->[1, 2, 3]
```

### 7.9叠放装饰器

```python
@d1
@d2
def f():
	pass
#相当于
#def f():
#	pass
#f=d1(d2(f))
```

### 7.10参数化装饰器

```python
#通过参数active判断是否将被装饰函数注册到一个集合
registery=set()
def register(active=True):#装饰器工厂，返回一个装饰器
    def decorate(func):#装饰器，返回修饰后的新函数
        print('running register(active=%s)->decorate(%s)' % (active, func))#导入模块时就运行这句
        def wrapper(*arg):#返回保存原函数的值
            arg_str=','.join(str(args) for args in arg)
            result=func(*arg)
            if active:
                registery.add(f'def {func.__name__}({arg_str})--->{result}')
            else:
                registery.discard(f'def {func.__name__}({arg_str})--->{result}')
            return result
        return wrapper
    return decorate
@register()#不管有无参数，参数化装饰器都要像函数那样调用，即@register()返回真正的装饰器
def f1(a,b,c):
    return a+b+c
@register()
def f2(a,b):
    return a+b
f1(1,2,3),f2(4,5)
print(registery)
running register(active=True)->decorate(<function f1 at 0x000002AD0F229798>)
running register(active=True)->decorate(<function f2 at 0x000002AD0F2298B8>)
{'def f1(1,2,3)--->6', 'def f2(4,5)--->9'}
```

## 8.对象引用、可变性和垃圾回收

### 8.1变量不是盒子

Python变量类似于Java的引用式变量，应该把他们比作是对象的便利贴或标注

```python
a=[1,2,3]
b=a#b和a有相同的列表引用
b.append(4)
#若把变量a,b比作盒子，分别将列表[1,2,3]装入，则此时b在装入4则a应该无变化，然而并非如此
#应该把a,b比作是列表对象[1,2,3]的便利贴或标注，则列表增值，a,b同时变化
print(a,b)
```

### 8.2标识相等和别名

```python
a=[1,2,3]
b=a#b是a的别名，b变a也变，两者id相同
c=[1,2,3]#c是新变量，仅仅是内容与a,b相同，但是id不同
print(a is b)# is比较两变量的id值
print(id(a),id(b))
print(a is not c and a==c)#==比较两变量的内容
True
2627799241288 2627799241288
True
```

### 8.3默认做浅复制

```python
l1=[1,[1,2],3]
l2=list(l1)#或者l2=l1[:]，都是做的浅复制，l1和l2中的第一个元素都是同一个列表的引用
l2[1].append(3)#l1[1]也变
print(l1,l2)
print(l1 is l2)#两者为不同对象，id值不同
[1, [1, 2, 3], 3] [1, [1, 2, 3], 3]
False
```

使用copy模块提供的`deepcopy`和`copy`函数为任意对象做深复制和浅复制

```python
import copy
l1=[1,[1,2],3]
l2=copy.deepcopy(l1)#对l1进行深复制，l1和l2中的第一个元素是不同列表的引用
l3=copy.copy(l1)#对l1进行浅复制，l1和l3中的第一个元素都是同一个列表的引用
l2[1].append(3)#仅l2[1]变
l3[1].append(4)#l1[1]，l3[1]都变
print(l1,l2,l3)
[1, [1, 2, 4], 3] [1, [1, 2, 3], 3] [1, [1, 2, 4], 3]
```

### 8.4函数的参数作为引用时

Python 唯一支持的参数传递模式是共享传参，即函数的各个形式参数获得实参中各个引用的副本。也就是 

说，函数内部的形参是实参的别名。 若传入的参数是一个可变对象则会出问题

```python
def f(a,b):
	a+=b	#就地修改，不产生新对象
	return a
a=[1,2,3]
b=[4,5]
c=f(a,b)#由于传入可变对象a，所以形参a的改变会影响到实参列表a
print(a,b,c)
[1, 2, 3, 4, 5] [4, 5] [1, 2, 3, 4, 5]
```

#### 8.4.1不要使用可变类型做参数的默认值

```python
#list=[]
#def busdrop(team=list):
#	...
#相当于
def busdrop(team=[]):
    #这个空列表相当于全局变量
    #形参默认值是一个空列表的引用
    if team==[]:
        t=team
        t.append(1)#team变化，所以原函数默认值的空列表也变化，即变为team=[1]
    else:
        t=[2,3]
    print(t)
busdrop()
busdrop()
[1]
[2, 3]
```

#### **8.4.2** 防御可变参数 

如果定义的函数接收可变参数，应该谨慎考虑调用方是否期望修改传入的参数。 

```python
team=['a','b','c']
def busdrop(name,team=None):
    t=team#t是team的引用，t的变化也会影响到team
    if t==None:
        t=[]
    t.remove(name)
busdrop('a',team)#公交车队伍里的人下车，队伍里的名字也直接被删除了，这是不符合常理的
print(team)
['b', 'c']
```

改进方法

```python
team=['a','b','c']
def busdrop(name,team=None):
    t=team
    if t==None:
        t=[]
     else:
     	t=list(team)#创建一个team的副本，t变化不影响team
    t.remove(name)
busdrop('a',team)
print(team)
[a,b,c]
```

### **8.5** `del`和垃圾回收 

**`del` 语句删除名称，而不是对象**。`del` 命令可能会导致对象被当作垃圾回收，但是仅当删除的变量保存的是对象的最后一个引用，或者无法得到对象时。 重新绑定也可能会导致对象的引用数量归零，导致对象被销毁。

```python
#使用 weakref.finalize 注册一个回调函数，在销毁对象时调用。
#监控对象生命结束时的情形
import weakref
s1={1,2,3}
s2=s1#s2是s1的别名
def bye():#回调函数bye，在对象{1，2，3}被销毁后调用
    print('Gone')
ender=weakref.finalize(s1,bye)#给s1引用的对象注册回调函数bye
print(ender.alive)#默认值为True
del s1#删除对象{1，2，3}的引用
print(ender.alive)
s2=1#对象{1，2，3}的最后一个引用s2被改变，对象{1，2，3}被回收，回调函数bye被调用
print(ender.alive)
True
True
Gone
False
```

### 8.6弱引用

正是因为有引用，对象才会在内存中存在。当对象的引用数量归零后， 垃圾回收程序会把对象销毁。但是，有时需要引用对象，而不让对象存在的时间超过所需时间。这经常用在缓存中。

弱引用不会增加对象的引用数量。引用的目标对象称为所指对象。因此我们说，弱引用不会妨碍所指对象被当作垃圾回收。 

```python
#Python 控制台会自动把 _ 变量绑定到结果不为 None 的表达式结果上
# weakref.ref 实例获取所指对象。如果对象存在，调用弱引用可以获取对象；否则返回None。
>>> import weakref
>>> a_set={0,1}
>>> wref=weakref.ref(a_set)
>>> wref
<weakref at 0x7f4885eab098; to 'set' at 0x7f4885e94128>#弱引用对象
>>> wref()#弱引用对象实例返回所指对象{0，1}
{0, 1}#_变量被绑定到对象{0，1}上
>>> a_set={2,3,4}#a_set不在指向对象{0，1}，指向新对象{2，3，4}
>>> wref()#还有变量_绑定在对象{0，1}上，没有被python垃圾回收机制回收
{0, 1}
>>> wref() is None
False#变量_被绑定到对象False，对象{0，1}被回收
>>> wref() is None
True
```

#### **8.6.1** `WeakValueDictionary`简介 

`WeakValueDictionary` 类实现的是一种可变映射，里面的值是对象的弱引用。被引用的对象在程序中的其他地方被当作垃圾回收后，对应的键会自动从 `WeakValueDictionary` 中删除。因此，`WeakValueDictionary` 经常用于缓存。

```python
import weakref
class Cheese:
    def __init__(self,kind):
        self.kind=kind
stock=weakref.WeakValueDictionary()#stock 是 WeakValueDictionary 实例。
catalog=[Cheese('Red Leicester'), Cheese('Tilsit'), Cheese('Brie'), Cheese('Parmesan')]
for cheese in catalog:
    stock[cheese.kind]=cheese#stock把Cheese实例的kind属性映射到 catalog中Cheese实例的弱引用上
print(sorted(stock.keys()))
del catalog
#还存有'Parmesan'键，因为for循环中cheese是全局变量，绑定到了最后一个元素Cheese('Parmesan')，所以Cheese('Parmesan')没有被垃圾回收
print(sorted(stock.keys()))
del cheese#只有显式删除全局变量cheese，Cheese('Parmesan')才会被回收
['Brie', 'Parmesan', 'Red Leicester', 'Tilsit']
['Parmesan']
```

`weakref` 模块还提供了 `WeakSet` 类，按照文档的说明，这个类的作用很简单：“保存元素弱引用的集合类。元素没有强引用时，集合会把它删除。”

#### **8.6.2** 弱引用的局限 

不是每个 Python 对象都可以作为弱引用的目标（或称所指对象）。基本的 `list` 和 `dict` 实例不能作为所指对象，但是它们的子类可以。`set` 实例可以作为所指对象，但是，`int` 和 `tuple` 实例不能作为弱引用的目标，甚至它 们的子类也不行。 

## 9. 符合**Python**风格的对象 

### 9.1向量类

```python
class Vector(object):
    def __init__(self,x,y):  #属性前两个下划线表示私有属性
        self.__x=x  #并非绝对私有，仅仅只是名称被改写，v._Vector__x依然可以访问到
        self.__y=y
        
    #同时实现两种方法，则print调用__str__，交互模式下直接显示变量调用__repr__
    def __repr__(self):#只实现此方法，则print和交互模式下都调用此方法
        return 'Vector(%s,%s)'%(self.x,self.y)
    def __str__(self):
        return '(%s,%s)'%(self.x,self.y)
    
    #@property装饰器可以将方法当做属性调用，提供私有属性的只读接口，如v.x()--->v.x
    @property
    def x(self):
        return self.__x
    @property
    def y(self):
        return self.__y
    
    #让Vector实例变为可迭代对象
    def __iter__(self):
        return (i for i in (self.x,self.y))

v=Vector(3,4)
for i in v:
    print(i)
print(v)
print(v.x,'\t',v.y)
3
4
(3,4)
3 	 4
```

### 9.2`classmethod`和`staticmethod`

```python
class Vector(object):
    @classmethod#标记类方法
    def clsmd(*args):#类方法的第一个参数是类本身，如def clsmd(cls,...)，可用于提供备选的构造方法(返回类实例)
        return args
    @staticmethod#标记静态方法
    def stcmd(*args):
        return args
print(Vector.clsmd('exp'))
print(Vector.stcmd('exp'))
(<class '__main__.Vector'>, 'exp')
('exp',)
```

### 9.3使用`__slots__`类属性节省空间

`__slots__`主要用于节省内存空间，而不是限制属性

```python
class Vector(object):
#__slots__限制类属性，将限制的类属性名的字符串以元组的形式赋值给__slots__,子类不继承父类的__slots__，需要重新赋值
    __slots__ = ('__x','__y')
    def __init__(self,x,y):
        self.__x=x
        self.__y=y
v=Vector(3,4)
v.z=3#会报错，无法为该类绑定新的属性
```

### 9.4覆盖类属性

类属性可用于为实例属性提供默认值

```python
class Vector(object):
    code='d'#类属性，整个共有
    def switch(self):
        print(self.code)
v=Vector()
v.switch()
v.code='a'#添加的是实例属性，类属性不变，若想修改类属性，则应该Vector.code='a'
v.switch()
print(Vector.code)
d
a
d
```

## 10.序列的修改、散列和切片

### 10.1协议和鸭子类型

协议:在面向对象编程中，协议是非正式的接口

基本序列协议:`__len__`，`__getitem__`

Python中构建功能完善的序列类型，无需通过继承实现，只需实现符合序列协议的方法

```python
class Vector(object):                                        
    def __init__(self,components):#序列类型构造方法最好接收一个可迭代对象                       
        self.components=list(components)                     
    def __getitem__(self, item):#若只支持迭代，只需实现此方法，无需实现__len__ 
        return self.components[item]                         
    def __len__(self):                                       
        return len(self.components)                          
v=Vector([1,2,3,4])                                          
print(v[0],'\t',len(v))          
1 	 4
```

### 10.2可切片的序列

#### 10.2.1切片原理

```python
class Vector(object):                          
    def __getitem__(self, index):               
        return index                            
v=Vector() 
#v[1:3],v[1:3:2]返回的是一个切片对象，v[1:3,2:4]返回一个元组，包含多个切片对象
print(v[0],'\t',v[1:3],'\t',v[1:3:2],'\t',v[1:3,2:4])
0 	 slice(1, 3, None) 	 slice(1, 3, 2) 	 (slice(1, 3, None), slice(2, 4, None))
```

`slice`是内置类型，`slice`的`indices`方法能精确的算出传入切片的起点，终点，步长

```python
#indices接收一个参数:序列的长度，超出长度的索引会被截掉
print(slice(None, 10, 2).indices(5))#结果为(0,5,2)
print(slice(-3, None, None).indices(5))#结果为(2,5,1)
```

#### 10.2.2能处理切片`__getitem__`方法 

自定义序列类型的`__getitem__`处理切片必须返回一个新实例

```python
class Vector(object):
    def __init__(self,components):
        self.components=list(components)
    def __getitem__(self, index):
        cls=type(self)#获取类本身
        if isinstance(index,slice):#若是切片类型，返回新实例
            return cls(self.components[index])
        else:#否则返回索引对应值
            return self.components[index]
    def __len__(self):
        return len(self.components)     
    def __str__(self):
        return f'Vector({list(i for i in self.components)})'
1 	 Vector([2, 3])
```

### 10.3动态存取属性

实现`__getattr__`方法自定义调用属性

实现`__setattr__`方法自定义设置属性

## 11.从协议到抽象基类

### 11.1 Python文化中的接口和协议 

Python中没有`interface`关键字，但除了抽象基类，每个类都有接口:每个类实现或继承的公开属性和方法及特殊方法

### 11.2 Python喜欢序列

只实现序列协议的`__getitem__`方法，就可以进行`in`，迭代，访问元素

```python
class Vector(object):
    def __init__(self,components):
        self.components=list(components)
    def __getitem__(self, index):
        print(index)
        return self.components[index]
#没有实现__contains__和__iter__，只实现__getitem__的类实例也是可迭代对象，python会调用__getitem__，传入0开始的索引尝试迭代和in运算
v=Vector([1,2,3,4])
2 in v
for i in v:
    pass
0
1
0
1
2
3
4
```

## 12.继承的优缺点

### 12.1子类化内置类型很麻烦

基本上内置类型不会调用子类覆盖的方法

```python
#__init__和__update__会忽略子类覆盖的__setitem__方法
class Vector(dict):
    def __setitem__(self, key, value):
        super().__setitem__(key,[value]*2)
v=Vector(one=1)
v['two']=2
print(v)
v.update(one=3)
print(v)
{'one': 1, 'two': [2, 2]}
{'one': 3, 'two': [2, 2]}
```

```python
class Vector(dict):
    def __getitem__(self, item):
        return 42#无论什么键都返回一个值
ad=Vector(one=1)
print(ad['one'])
d={}
d.update(ad)#dict类型调用update方法忽略了其子类的__getitem__方法
print(d)
42
{'one': 1}
```

一般子类化`collections.UserDict`可以解决这些问题

### 12.2多重继承和方法解析顺序

菱形问题:多重继承中由不相关的祖先类实现同名方法而引发的冲突

多重继承的菱形问题图解

![image-20200118171642717](/static/img/image-20200118171642717.png)

方法解析顺序由D-->B-->C-->A

```python
class A(object):
    def ping(self):
        print('ping:',self)
class B(A):
    def pong(self):
        print('pong:',self)
class C(A):
    def pong(self):
        print('PONG:',self)
class D(B,C):
    def ping(self):
        super().ping()#super()方法将ping()方法委托给父类，super()遵循方法解析顺序
        print('post-ping:',self)
    def pingpong(self):
        self.ping()#调用一次自身的ping方法
        super().ping()#在调用父类的ping方法
        self.pong()#调用B中的pong方法
        super().pong()#调用B中的pong方法
        C.pong(self)#调用C中的pong方法，类调用实例方法必须将实例作为显示参数传入
d=D()
d.pong()#d.pong()默认调用的是B中的pong方法,若改写为class D(C,B)则默认调用C中的pong方法
C.pong(d)#父类中的方法可以直接调用，类调用实例方法必须将实例作为显示参数传入
print(D.__mro__)#每个类都有一个mro属性，存放方法解析的顺序
d.ping()#先是由A.ping()输出，再打印
pong: <__main__.D object at 0x0000026649345708>
PONG: <__main__.D object at 0x0000026649345708>
[<class '__main__.D'>, <class '__main__.B'>, <class '__main__.C'>, <class '__main__.A'>, <class 'object'>]
ping: <__main__.D object at 0x000001BA93245748>
post-ping: <__main__.D object at 0x000001BA93245748>
```

## 13.可迭代的对象、迭代器和生成器

### 13.1序列可迭代的原因：`iter`函数

内置`iter`函数有以下作用

- 检查对象是否实现`__iter__`方法，如果有，则调用它返回一个迭代器
- 如果对象没有实现`__iter__`方法，但是实现了`__getitem__`方法，Python会创建一个迭代器，尝试按顺序（从索引0开始）获取元素
- 如果都无，则报错

### 13.2可迭代的对象与迭代器的对比

可迭代的对象:实现了能返回一个迭代器的`__iter__`方法或者实现了`__getitem__`方法

迭代器:实现了无参数的`__next__`方法（返回序列中下一个元素，如果没有元素就抛出`StopIteration`异常）和`__iter__`方法（迭代器中`__iter__`方法返回迭代器本身，迭代器本身也可迭代）

关系:Python从可迭代对象中获取迭代器

```python
#类似for循环的内部原理
s='ABC'
it=iter(s)#从可迭代对象中获取迭代器
while True:
    try:
        print(next(it))#不断调用迭代器的next()方法，取出元素
    except StopIteration:#直到抛出终止异常
        del it
        break
A
B
C
```

### 13.3典型的迭代器

```python
class Sentence(object):
    def __init__(self):
        self.words='ABCDEFG'
    def __iter__(self):#Sentence是可迭代对象
        return SentenceIterator(self.words)#调用iter方法返回一个SentenceIterator实例
class SentenceIterator(object):
    def __init__(self,words):
        self.words=words
        self.index=0
    def __next__(self):
        try:#调用next()方法，尝试从索引0开始取元素
            word= self.words[self.index]
        except IndexError:#直到索引超出范围，抛出异常
            raise StopIteration#则抛出终止异常
        self.index += 1#序列索引+1
        return word#返回取出的元素
    def __iter__(self):#为实现标准迭代器而实现这个方法
        return self
s=Sentence()
it=iter(s)
while True:
    try:
        print(next(it))
    except StopIteration:
        del it
        break
```

### 13.4生成器函数

迭代器也是生成器对象

```python
class Sentence(object):
    def __init__(self):
        self.words='ABCDEFG'
    def __iter__(self):#__iter__包含了yield关键字，实质是一个生成器函数，每调用一次__iter__都能返回一个生成器
        for w in self.words:
            yield w
s=Sentence()
it=iter(s)
print(it)#此处it是生成器也是迭代器
while True:
    try:
        print(next(it))#调用next()会产出yield生成的值
    except StopIteration:#无元素产出时，生成器也会抛出StopIteration异常
        del it
        break
```

生成器执行过程

```python
def gen():
    print('start...')
    yield 'A'
    print('continue...')
    yield 'B'
    print('end...')
    yield 'C'
g=gen()
print(next(g))#第一次调用产出A并暂停在此处
print(next(g))#第二次调用产出B并暂停在此处
print(next(g))#第三次调用产出C并暂停在此处
print(next(g))#第四次调用抛出StopIteration异常
```

### 13.5生成器表达式

生成器表达式相比列表推导式，它是惰性的产出元素，而列表推导式是迫切的产出元素，生成器表达式节省内存

```python
def gen():
    print('start...')
    yield 'A'
    print('continue...')
    yield 'B'
    print('end...')
    yield 'C'
l=[x for x in gen()]#列表推导式迫切的产出元素，会打印内容
g=(x for x in gen())#生成器表达式只有调用next()才会一次次产出
```

### 13.6`yield from`

`yield from`用于处理嵌套生成器，相当于外层生成器和内层生成器之间的通道

```python
def gen():
    for w in ['ABC','EFG']:#['ABC','EFG']相当于外层,'ABC','EFG'相当于内层
        yield from w#此处yield from代替了内层for循环for i in w
```

### 13.7深入分析`iter`方法

`iter`方法除了接收一个可迭代对象的参数外，还可以传入第二个参数作为哨符值，当调用`next()`方法返回这个哨符值时，会自动触发`StopIteration`异常，不产出哨符值并停止迭代

```python
def d6():
    return randint(1,6)
d=iter(d6,1)#当产出1时停止
for i in d:
    print(i)
4
2
3
3
5
3
5
```

## 14.上下文管理器和else块

### 14.1 if语句之外的else块

```python
#仅当for循环执行完毕时(即for循环没被break中止)，执行else块
for ...:
	...
else:
	...
#while同上
#try块中未抛出异常时才执行else块
try ...:
    ...
except:
    ...
else:
    ...
```

### 14.2上下文管理器和with块

上下文管理器对象的存在是为了管理`with`语句

上下文管理器协议：`__enter__`，`__exit__`

`with`语句在开始运行是调用上下文管理器的`__enter__`方法，在结束时调用上下文管理器的`__exit__`方法

```python
class context():#类context的实例是一个上下文管理器
    def __enter__(self):
        print('context start...')
        return self#返回自身，有时返回的不一定是上下文管理器实例
    def __exit__(self, exc_type, exc_val, exc_tb):#三个参数依次表示异常类，异常实例，trackback对象，用于处理异常
        print('context close...')
    #若__exit_方法return None或True之外的值，with块中都会向上抛出，若返回True则表示异常已处理,不抛出
with context() as c:#with开始运行调用上下文管理器实例的__enter__方法，并通过as将返回值赋值给一个变量
    print(c)
#with结束,调用上下文管理器实例的__exit__方法
```

### 14.3使用`@contextmanager`

使用`@contextmanager`装饰器，无需定义一个完整类，只需定义有一个`yield`的生成器函数

`@contextmanager`装饰器会将这个生成器函数包装成一个上下文管理器

原理：

- `with`开始时（相当于实现了`__enter__`）---->调用生成器函数，保存生成器对象，并调用`next()`方法执行到`yield`处，将生成的值通过`as`赋给变量
- `with`终止时（相当于实现了`__exit__`）---->检查是否有异常，若有则调用生成器的`throw`方法在yield出抛出异常---->否则调用`next()`方法继续执行`yield`之后的代码

```python
from contextlib import contextmanager#@contextmanager在contextlib模块中
@contextmanager
def context():
    print('context start...')
    yield context#yield生成的值作为上下文管理器的返回值，yield之前的代码在with开始时(__enter__)执行，yield之后的代码在with结束时(__exit__)执行
    print('context close...')
with context() as c:
    print(c)
```

## 15.协程

### 15.1用作协程的生成器的基本行为

```python
def coroutine():
    print('corotine start...')
    x=yield 1#若协程不产出值，只接受值，可以写成x=yield
    print('corotine receive x %s'%x)

my_coro=coroutine()
result=next(my_coro)#或my_coro.send(None)，此处为预激协程，让其在yield处暂停
my_coro.send(2)#调用send方法协程会恢复到上一次暂停的yield处，并将send的值作为等式右边赋值给等式左边，协程继续运行到下一个yield处
corotine start...
corotine receive x %s
Traceback (most recent call last):
    ...
```

### 15.2使用协程计算移动平均值

```python
def average():
    total=0
    count=0
    average=None
    while True:#使用无限循环让协程不断产出和接收值
        term=yield average#在此处产出平均值并暂停，控制权交予至函数外
        total+=term
        count+=1
        average=total//count
av=average()
next(av)
av.send(10)#发送增值，协程恢复到无限循环中，控制权交予至协程
av.send(20)
result=av.send(30)
print(result)
20
```

### 15.3预激协程的装饰器

添加一个装饰器，让协程不用手动激活

```python
def alive(func):
    def wrapper(*args,**kwargs):
        coro=func(*args,**kwargs)
        next(coro)#装饰器中预激
        return coro#返回激活的协程
    return wrapper
```

### 15.4终止协程与异常处理

协程中没有处理异常的操作，任何未处理的异常都会向上冒泡并终止协程，然后传给调用方

生成器对象有两个方法可以显示的把异常发送给协程：

- `throw(exc_type[, exc_value[, traceback]]) `：在生成器`yield`暂停处抛出指定异常，如果生成器处理了该异常，则调用方不报错，生成器继续执行到下一个`yield`暂停处，并将此处`yield`产出的值作为调用`throw`方法的返回值
- `close`：在生成器`yield`处抛出`GeneratorExit`异常，若生成器没有处理这个异常或抛出了`StopIteration`异常，调用方不报错。若收到`GeneratorExit`异常，此时生成器一定不能再产出值，否则会抛出`RuntimeError`异常传给调用方

```python
def corotine():
    print('corotine start...')
    while True:
        try:
            x=yield 
        except ZeroDivisionError:
            print('ZeroDivisionError handled')
        else:
            print('receive x: %s'%x)
coro=corotine()
next(coro)
coro.send(1)
coro.send(2)
coro.throw(ZeroDivisionError)#异常被处理不报错，此时throw方法返回值为当前yield产出值
coro.close()#不报错
```

### 15.5让协程返回值

协程return返回值保存在`StopIteration`异常对象的`value`属性中

```python
def average():
    total=0
    count=0
    average=None
    while True:
        term=yield#不产出值
        if term is None:#若接收的是None,退出无限循环
            break
        total+=term
        count+=1
        average=total//count
    return average#最后返回平均值

av=average()
next(av)
av.send(10)
av.send(20)
av.send(30)
try:
    av.send(None)#发送None,使协程结束，抛出StopIteration异常
except StopIteration as e:
    result=e.value#协程return返回的值保存在异常对象的value属性中
    print(result)
20
```

### 15.6使用 yield from

`yield from`在协程中的功能：在最外层调用方和最内层子生成器间建立双向通道，二者可以直接产出和发送值

- 委派生成器：包含`yield from <iterable>`的生成器函数
- 子生成器：`<iterable>`
- 调用方：调用委派生成器的一方

```python
def Delegate_generator(recv):
    while True:#不断生成子生成器的实例，每一个子生成器实例对应一个完整的for循环
        info=yield from Child_generator()#等待子生成器执行完毕，yield from会自动捕获StopIteration异常，并将return返回值赋给等式左边
        recv.append(info)
def Child_generator():
   while True:
       x=yield #控制权交予调用方
       if x is None:
           break
       print('Child_generator receive:%s'%x)
   return 1
def Caller():
    recv=[]
    coro=Delegate_generator(recv)
    next(coro)#预激委派生成器
    for i in range(1,10):
        coro.send(i)#委派生成器调用send方法发送的值，最终会到达子生成器，控制权交予子生成器，委派生成器暂停在yield from处，等待子生成器返回结果
    coro.send(None)#结束子生成器，控制权回到委派生成器，并将子生成器返回值赋给变量
    print(f'Caller receive {recv}')
Caller()
```

### 15.7 yield from的意义

- 子生成器产出的值都直接传给委派生成器的调用方
- 使用`send()`方法传给委派生成器的值都直接传给子生成器，如果值是`None`，则调用子生成器的`__next__`方法，否则调用子生成器的`send()`方法，如果调用的方法抛出`StopIteration`异常，委派生成器恢复运行，任何异常都会向上传给委派生成器
- 生成器退出时，生成的`return`表达式会触发`StopIteration`异常
- `yield from`表达式的值是子生成器退出时传给`StopIteration`异常的第一个参数

委派生成器中的异常与终止

- 传入委派生成器的异常，除了 `GeneratorExit` 之外都传给子生成 器的 `throw()` 方法。如果调用 `throw()` 方法时抛出 `StopIteration` 异常，委派生成器恢复运行。`StopIteration` 之 外的异常会向上冒泡，传给委派生成器。
-  如果把 `GeneratorExit` 异常传入委派生成器，或者在委派生成器上调用 `close()` 方法，那么在子生成器上调用 `close()` 方法，如果它有的话。如果调用 `close()` 方法导致异常抛出，那么异常会向上冒泡，传给委派生成器；否则，委派生成器抛出 `GeneratorExit` 异常。

```python
RESULT = yield from EXPR
##伪代码扩展##（只处理StopIteration异常）
#_i为子生成器，_y为子生成器产出值，_r为子生成器结束后return的值,_s为调用方发送的值
_i=iter(EXPR)
try:
    _y=next(_i)#预激子生成器，将产出的值保存在_y中
except StopIteration as e:#如果触发StopIteration异常
    _r=e.value#获取异常的value属性（保存着子生成器的返回值）保存在_r中
else:
    while 1:#运行这个循环，委派生成器阻塞，只作为调用方和子生成器间的通道
        _s=yield _y#产出子生成器产出的值，等待调用方调用send()方法
        try:
            _y=_i.send(_s)#子生成器调用send()方法将调用发送来的值发送给子生成器，并将子生成器产出的值赋给_y
         except StopIteration as e:#如果触发StopIteration异常
            _r=e.value#获取异常的value属性（保存着子生成器的返回值）保存在_r中
           	break#终止循环，委派生成器恢复运行
RESULT=_r#将子生成器的返回值赋给RESULT
```

## 16.使用`asyncio`包处理并发

### 16.1`asyncio`

`asyncio`包处理并发，将控制权交予事件循环来驱动协程，一旦程序遇到阻塞IO操作，事件循环就调度至其他协程运行，等待IO操作结束后，事件循环再调度回去，实现并发

```python
import asyncio
#执行顺序：事件1-->遇到耗时操作-->事件2-->遇到耗时操作-->事件1-->事件2
@asyncio.coroutine#将生成器函数标记为协程类型
def IO_handler():##事件1
    print('IO start...')
    yield from asyncio.sleep(3)#使用asyncio.sleep(3)来模拟耗时操作，使用time.sleep会阻塞事件循环
    print('IO close...')
@asyncio.coroutine
def IO_handler2():##事件2
    print('IO2 start...')
    yield from asyncio.sleep(1)
    print('IO2 close...')
if __name__=='__main__':
    loop=asyncio.get_event_loop()#获取事件循环引用
    tasks=[IO_handler(),IO_handler2()]#创建一个协程列表
    loop.run_until_complete(asyncio.wait(tasks))#loop.run_until_complete接收一个协程参数，用于驱动协程，asyncio.wait()接收保存多个协程的可迭代对象作为参数，返回一个协程
    loop.close()#关闭事件循环
```

### 16.2`async`/`await`

Python 3.5 版本变化

`@asyncio.coroutine`替换为`async`并写在函数定义左边

`yield from`替换为`await`

其余不变

```python
###旧版本###
@asyncio.coroutine
def IO_handler():
    yield from asyncio.sleep(3)
###新版本###
async def IO_handler():
    print('IO start...')
    await asyncio.sleep(3)
    print('IO close...')
```

