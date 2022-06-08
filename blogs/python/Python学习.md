---
title: Python学习
date: 2019-01-01
categories:
- Python
tags:
- Python
---

## 基础知识

### 1.转义字符`\`可以转义很多字符。

```python
print("\\\t\\")
\    \
```

如果字符串里面有很多字符都需要转义，就需要加很多`\`，为了简化，Python还允许用`r''`表示`''`内部的字符串默认不转义。

```python
print(r'\\\t\\')
\\\t\\
```

### 2.用`"' '"``和""" """`表示多行内容，也可以用于多行注释，`#`表示单行注释。

### 3.`//`表示整除，python中整数的运算结果永远是整数。

### 4.格式化输出

```python
print("第%d天，这个月工钱%f，今天吃什么呢%s"%(3,3000.1,'?'))'''%d表示整数，%f浮点数，%s字符串，%x十六进制整数'''
第3天，这个月工钱3000.100000，今天吃什么呢?

print("增长率:%d%%"%(7))# 转义%方式为%%
增长率:7%
```

```python
print("今天{},明天{}".format(1,2))
今天1,明天2
```

```python
a=3
print(f'今天第{a}天')
今天第3天
```

### 5.变量可指向函数

```python
def func():
    name=1
    return name
name=func
name2=func()
print(name)
print(name())
print(name2)
<function func at 0x000002024A269D90>#函数也是一类对象可以被指向
1
1
```

### 6.函数的参数

```python
def func(x,y)#位置参数
def func(x,y=0)#默认参数，默认参数必须指向不变的对象
def func(*arg)#可变参数，参数arg收到的是一个元祖类型
def func(**arg)'''关键字参数，可以传入任意个关键字参数，这些关键字参数在函数内部自动组装为一个字典，传入方式func(a=3,b=4)'''
def func(x,y,*,a,b)'''命名关键字参数，*后面的参数被视为命名关键字参数。如果函数定义中已经有了一个可变参数，后面跟着的命名关键字参数就不再需要一个特殊分隔符*了，例如：func(x,y,*arg,a,b)。命名关键字参数必须传入参数名，例如：func(3,4,a=1,b=2)'''
```

### 7.高阶函数

编写高阶函数，就是让函数的参数能够接收别的函数。

```python
def func(a,b,f):
    print(f(x)+f(y))
func(-5,6,abs)
11
```

`map()`函数

`map()`函数接收两个参数，一个是函数，一个是`Iterable`(可迭代对象)，`map()`将传入的函数依次作用到序列的每个元素，并把结果作为新的`Iterator`(迭代器)返回。

```python
#用map将序列中的字符串改为首字母大写
def normalize(name):
    return name.capitalize()
L1 = ['adam', 'LISA', 'barT']
L2 = list(map(normalize, L1))#因为map返回的结果是迭代器，需要转化为列表
print(L2)
['Adam', 'Lisa', 'Bart']
```

`reuduce()`函数

`reduce()`函数接收两个参数，一个是函数，一个是`Iterable`(可迭代对象)，`reduce()`把一个函数作用在一个序列`[x1, x2, x3, ...]`上，这个函数必须接收两个参数，`reduce`把结果继续和序列的下一个元素做累积计算。

```python
#用reduce对序列中的数进行累加
from functools import reduce
def add(x,y):
    return x+y
print(reduce(add,[1,2,3,4]))
```

`filter()`函数

`filter()`函数接收两个参数，一个是函数，一个是`Iterable`(可迭代对象),`filter()`把传入的函数依次作用于每个元素，然后根据返回值是`True`还是`False`决定保留还是丢弃该元素。

```python
#filter过滤序列中的偶数
def is_odd(n):
    return n%2==1
print(list(filter(is_odd,[1,2,3,4,5])))#因为filter返回的结果是迭代器，需要转化为列表
[1, 3, 5]
```

`sorted()`函数
`sorted()`函数也是一个高阶函数，它还可以接收一个`key`函数来实现自定义的排序,key指定的函数将作用于list的每一个元素上，并根据key函数返回的结果进行排序。

```python
#按绝对值大小排序
print(sorted([-1,3,-5,2,7],key=abs))
[-1, 2, 3, -5, 7]
```

`sorted()`函数可以传第三个参数，reverse决定是否倒序排列

```python
print(sorted([2,51,63,12,4],reverse=True))
[63, 51, 12, 4, 2]
```

####  7.1返回函数

高阶函数还可以把函数作为返回值

```python
def f1():
    print("f1()")
    def f2():
        print("f2()")
    return f2
func=f1()
print(func)
func()
f1()
<function f1.<locals>.f2 at 0x00000287DDED9D08>#返回的函数f2并非立刻执行，只有调用f2()才会执行
f2()
```

**返回函数切莫引用任何循环变量**

```python
def ff():
    fs=[]
    for i in range(1,4):
        def f():
            return i*i
        fs.append(f)
    return fs
f1,f2,f3=ff()
print(f1())
print(f2())
print(f3())
9
9
9#返回函数不是立刻执行，当再次调用的时候，循环变量i已经是3了
```

改进方法

```python
def ff():
    def fff(j):'''再创建一个函数，用该函数的参数绑定循环变量当前的值，无论该循环变量后续如何更改，已绑定到函数参数的值不变'''
        def f():
            return j*j
        return f
    return fff
fs=[]
dd=ff()
for i in range(1,4):
    fs.append(dd(i))
f1,f2,f3=fs
print(f1())
print(f2())
print(f3())
1
4
9
```

#### 7.2匿名函数

关键字`lambda`表示匿名函数，冒号前面的`x`表示函数参数。

匿名函数有个限制，就是只能有一个表达式，不用写`return`，返回值就是该表达式的结果。

```python
f=lambda x:x*x
print(f(3))
9
```

同样，也可以把匿名函数作为返回值返回，比如：

```python
def func(x,y):
    return lambda x,y:x+y
```

#### 7.3装饰器

装饰器指的是为被装饰器对象添加额外功能。但装饰器必须遵循两大原则：

1.装饰器本身其实是可以任意可调用的对象

2.被装饰的对象也可以是任意可调用的对象

```python
#使用无参装饰器,计算函数耗时
import time
def dec1(func):
    def wrapper(*arg,**kw):#可以匹配任意个参数的函数
        st=time.time()
        q=func(*arg,**kw)
        et=time.time()
        s=et-st
        print(f"{func.__name__}耗时{s}秒")
        return q
    return wrapper
@dec1#相当于f=dec1(f),此时f()和wrapper()相等，执行完这条，f.__name__由f变为wrapper
def f(x,y,z):
    time.sleep(1)
    s=x*y*z
    return s
x=f(1,2,3)
print(x)
f耗时1.001119613647461秒
6
```

装饰器实质是返回函数的高阶函数

```python
#有参装饰器,表明装饰器名称，计算函数耗时
import time
def log(text):#有参装饰器需要三层闭包
    def dec(func):
        def wrapper(*arg,**kw):
             st=time.time()
        	 q=func(*arg,**kw)
       	 	 et=time.time()
        	 s=et-st
             print(f"{text}执行:{func.__name__}耗时{s}秒")
             return q
        return wrapper
    return dec
@log("dec")#相当于f=log("dec")(f),执行完这条，f.__name__由f变为wrapper
def f(x,y,z):
    time.sleep(1)
    s=x*y*z
    return s
x=f(1,2,3)
print(x)
dec执行:f耗时1.000683307647705秒
6           
```

#### 7.4偏函数

`functools.partial`就是帮助我们创建一个偏函数,简单总结`functools.partial`的作用就是，把一个函数的某些参数给固定住（也就是设置默认值），返回一个新的函数，调用这个新函数会更简单。

```python
#创建偏函数，简化二进制转为十进制
import functools
int2 = functools.partial(int, base=2)
print(int2('100110'))
38
```

### 8.列表生成式

```python
L1 = ['Hello', 'World', 18, 'Apple', None]
L2=[x for x in L1 if isinstance(x, str)]
print(L2)
['Hello', 'World', 'Apple']
```

### 9.生成器

生成器相比列表生成式节省空间不浪费，在Python中，生成器(generator)的机制是一边循环一边计算。

```python
L1 = ['Hello', 'World', 18, 'Apple', None]
L2=(x for x in L1 if isinstance(x, str))
print(L2)
print(next(L2))#每次调用next(L2)，就计算出g的下一个元素的值，直到计算到最后一个元素，没有更多的元素时
print(next(L2))
<generator object <genexpr> at 0x000001EE234DBB10>#表示L2是一个生成器
Hello
World
Apple
```

```python
def odd():
    print('step 1')
    yield 1#含yield的函数可看作一个生成器，在每次调用next()的时候执行，遇到yield语句返回，再次执行时从上次返回的yield语句处继续执行。
    print('step 2')
    yield 3
    print('step 3')
    yield 5
o=odd()
print(next(o))
print(next(o))
print(next(o))
step 1
1
step 2
3
step 3
5
```

### 10.迭代器

可以被`next()`函数调用并不断返回下一个值的对象称为迭代器：`Iterator`。

生成器都是`Iterator`对象，但`list`、`dict`、`str`虽然是`Iterable`，却不是`Iterator`。

### 11.面向对象

#### 11.1类的初始化方法`__init__`

```python
class Student(object):
    def __init__(self,mark,name):'''在类中定义的函数第一个参数永远是实例变量self，并且调用时，不用传递该参数。self就指向创建的实例本身。'''
        self.mark=mark
        self.name=name    
```

#### 11.2访问限制

让类内部属性不被外部访问，可以把属性的名称前加上两个下划线`__`，在Python中，实例的变量名如果以`__`开头，就变成了一个私有变量（private），只有内部可以访问，外部不能访问

```python
class Student(object):
    def __init__(self,mark,name):
        self.__mark=mark
        self.__name=name
a=Student(10,'zwf')
print(a.__name)
AttributeError: 'Student' object has no attribute '__name'
```

但Python本身没有任何机制阻止你干坏事，你依旧可以访问内部私有变量,**当然傻逼才会这么做**。

```python
class Student(object):
    def __init__(self,mark,name):
        self.__mark=mark
        self.__name=name
a=Student(10,'zwf')
print(a._Student__name)#内部的__name变量已经被Python解释器自动改成了_Student__name
print(a._Student__mark)#内部的__mark变量已经被Python解释器自动改成了_Student__mark
zwf
10
```

Python本身是动态语言，可以自由绑定属性，有时就容易出错

```python
class Student(object):
    def __init__(self,mark,name):
        self.__mark=mark
        self.__name=name
    def get(self):
        print(self.__name)
        print(self.__mark)
a=Student(10,'zwf')
a.__name='wf'   '''表面上看，外部代码“成功”地设置了__name变量，但实际上这个__name变量和class内部的__name变量不是一个变量！内部的__name变量已经被Python解释器自动改成了_Student__name，而外部代码给a新增了一个__name变量。'''
a.__mark=20
print(a.__name)
print(a.__mark)
a.get()
wf
20
zwf
10
```

#### 11.3继承和多态

继承最大的好处是子类获得了父类的全部功能。

```python
class Human(object):#Human类继承object类
    def runing(self):
        print("Human is running ")
class Male(Human):#Male类继承Human类
    pass
a=Male()
a.runing()
Human is running 
```

当子类和父类都存在相同的`run()`方法时，我们说，子类的`run()`覆盖了父类的`run()`，在代码运行的时候，总是会调用子类的`run()`。这样，我们就获得了继承的另一个好处：多态。

```python
class Human(object):
    def running(self):
        print("Human is running ")
class Male(Human):
    def running(self):
        print("Male is running")
a=Male()
a.running()
Male is running
```

深入理解多态：多态的好处就是，当我们需要传入`Human`子类如`Male`时，我们只需要接收`Human`类型就可以了，因为`Human`子类都是`Human`类型。由于`Human`类型有`running()`方法，因此，传入的任意类型，只要是`Animal`类或者子类，就会自动调用实际类型的`running()`方法

```python
class Human(object):
    def running(self):
        print("Human is running ")
class Male(Human):
    def running(self):
        print("Male is running")
def run(human):
    human.running()
run(Human())
run(Male())
Human is running 
Male is running
```

其实对于Python这样的动态语言来说，则不一定需要传入`Human`类型。我们只需要保证传入的对象有一个`running()`方法就可以了

#### 11.4实例属性和类属性

由于Python是动态语言，根据类创建的实例可以任意绑定属性。

```python
class Student(object):
    def __init__(self,name):
        self.name=name
a=Student('zwf')
a.mark=100#仅仅给实例a绑定了属性mark
b=Student('cxp')
print(hasattr(a,'mark'))
print(hasattr(b,'mark'))#实例b没有属性mark
True
False
```

`如果Student`类本身需要绑定一个属性，可以直接在class中定义属性，这种属性是类属性，归`Student`类所有，当我们定义了一个类属性后，这个属性虽然归类所有，但类的所有实例都可以访问到

```python
class Student(object):
    mark=100
a=Student()
print(Student.mark)#类可以访问类属性
print(a.mark)#实例也可以访问类属性
a.mark=10#给a绑定属性，优先级比类属性高，屏蔽了类属性
print(a.mark)
del a.mark#如果删除实例属性
print(a.mark)#再次调用，由于实例的mark属性没有找到，类的mark属性就显示出来了
100
100
10
100
```

#### 11.5使用`__slots__`

Python为类或实例绑定方法

```python
#为实例绑定方法
import types
class A():
    pass
def set(self,age):
    self.age=age
a=A()
a.set=types.MethodType(set,a)#给实例绑定一个方法
a.set(12)
print(a.age)
print(hasattr(b,'set'))#仅仅绑定a这个实例，其他实例无set方法
12
False
```

```python
#为所有实例绑定方法，即为类绑定方法
class A():
    pass
def set(self,age):
    self.age=age
A.set=set#为类绑定方法
a=A()
b=A()
print(hasattr(A,'set'))
print(hasattr(a,'set'))
print(hasattr(b,'set'))
True
True
True
```

为了限制实例属性，如只允许对Student实例添加`name`和`age`属性。此时使用`__slots__`

```python
class Student():
    __slots__=('name','age')#只会限制实例属性，无法限制类属性
a=Student()
a.name='zwf'
a.age=12
a.mark=14
AttributeError: 'Student' object has no attribute 'mark'
```

使用`__slots__`要注意，`__slots__`定义的属性仅对当前类实例起作用，对继承的子类是不起作用的 。

```python
class Student():
    __slots__=('name','age')
class sss(Student):
    pass
a=sss()
a.mark=12
print(hasattr(a,'mark'))
True
```

除非在子类中也定义`__slots__`，这样，子类实例允许定义的属性就是自身的`__slots__`加上父类的`__slots__`。

```python
class Student():
    __slots__=('name','age')
class sss(Student):
    __slots__ = ('gender')
a=sss()
a.mark=12
AttributeError: 'sss' object has no attribute 'mark'        
```

`__slots__`只会限制实例属性，无法限制类属性

```python
class Student():
    __slots__=('name','age')
Student.mark=111
a=Student()
print(hasattr(a,'mark'))
True
```

#### 11.6@property

Python内置的`@property`装饰器就是负责把一个方法变成属性调用，`@property`最大的好处就是让调用变得合理化，符合正常逻辑，代码变得简短

```python
class Student(object):
    @property
    def age(self):
        return self._age
    @age.setter#@property本身又创建了另一个装饰器@age.setter，负责把一个setter方法变成属性赋值
    def set_age(self,age):
        if not isinstance(age,int):
            raise ValueError('age must be an integer!')
        if age<=0 or age>30:
            raise ValueError('age must between 1 ~ 30!')
        self._age=age
a=Student()
a.set_age=20
print(a.age)
```

#### 11.7多重继承

通过多重继承一个子类可以获得多个父类的所有功能

```python
class Mammal(object):
    def say(self):
        print('我是哺乳动物')
class Runnable(object):
    def run(self):
        print('我会跑')
class Dog(Mammal,Runnable):
    pass
dog = Dog()
dog.say()
dog.run()
我是哺乳动物
我会跑
```

#### 11.8定制类

pass

#### 11.9枚举类

枚举类`Enum`可以把一组相关常量定义在一个class中，且class不可变，而且成员可以直接比较。枚举类型定义一个class类型，然后，每个常量都是class的一个唯一实例。成员值允许相同，第二个成员的名称被视作第一个成员的别名，成员不允许重复

```python
from enum import Enum

Month = Enum('Month', ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'))
for name, member in Month.__members__.items():
    print(name, '=>', member, ',', member.value)#value属性则是自动赋给成员的int常量，默认从1开始计数。
Jan => Month.Jan , 1
Feb => Month.Feb , 2
Mar => Month.Mar , 3
Apr => Month.Apr , 4
May => Month.May , 5
Jun => Month.Jun , 6
Jul => Month.Jul , 7
Aug => Month.Aug , 8
Sep => Month.Sep , 9
Oct => Month.Oct , 10
Nov => Month.Nov , 11
Dec => Month.Dec , 12
```

自定义枚举类

```python
from enum import Enum
class Weekday(Enum):
    Sun = 0 # Sun的value被设定为0
    Mon = 1
    Tue = 2
    Wed = 3
    Thu = 4
    Fri = 5
    Sat = 6
```

### 12.IO编程

#### 12.1文件读写

使用python的`with`语句

```python
with open('aaa.text','r') as f:#'r'读模式，若文件不存在会报错
    print(f.read())
```

调用`read()`会一次性读取文件的全部内容，如果文件很大，内存就爆了，所以，要保险起见，可以反复调用`read(size)`方法，每次最多读取size个字节的内容。另外，调用`readline()`可以每次读取一行内容，调用`readlines()`一次读取所有内容并按行返回`list`。因此，要根据需要决定怎么调用。

读取二进制文件

```python
with open('aaa.text','rb') as f:
    print(f.read())
```

读取非`UTF-8`编码的文本文件

```python
with open('aaa.text','r',encoding='gbk') as f:
    print(f.read())
```

遇到有些编码不规范的文件，你可能会遇到`UnicodeDecodeError`，因为在文本文件中可能夹杂了一些非法编码的字符。遇到这种情况，`open()`函数还接收一个`errors`参数，表示如果遇到编码错误后如何处理。最简单的方式是直接忽略：

```python
with open('aaa.text','r',encoding='gbk',errors='ignore') as f:
    print(f.read())
```

写文件

```python
with open('aaa.text','w') as f:#与'r'模式不同的是，若文件不存在，会自动创建文件
    f.write('123')
```

与读文件类似，写二进制文件模式是`'wb'`,要写入特定编码的文本文件，请给`open()`函数传入`encoding`参数，将字符串自动转换成指定编码。

以`'w'`模式写入文件时，如果文件已存在，会直接覆盖（相当于删掉后新写入一个文件）。

```python
with open('aaa.text','w') as f:
    f.write('123')
with open('aaa.text', 'w') as f:
    f.write('456')#新写入的'456'将原本的'123'覆盖了
with open('aaa.text','r') as f:
    print(f.read())
456
```

若要追加到文件末尾，则用'`a`'模式

```python
with open('aaa.text','w') as f:
    f.write('123')
with open('aaa.text', 'a') as f:
    f.write('456')
with open('aaa.text','r') as f:
    print(f.read())
123456
```

#### 12.2`StringIO`和`BytesIO`

数据读写不一定要是文件，也可以在内存中读写。`StringIO`顾名思义就是在内存中读写`str`。

要把`str`写入`StringIO`，我们需要先创建一个`StringIO`，然后，像文件一样写入即可：

```python
from io import StringIO
f=StringIO()
f.write("zwf")
a=f.getvalue()#getvalue()方法用于获得写入后的str。
print(a)
zwf
```

`StringIO`操作的只能是`str`，如果要操作二进制数据，就需要使用`BytesIO`。

`BytesIO`实现了在内存中读写bytes，我们创建一个`BytesIO`，然后写入一些bytes：

```python
from io import BytesIO
f=BytesIO()
f.write('中文'，encode('utf-8'))#写入的是字符串，需要进行编码转换成bytes
print(f.getvalue())
b'\xe4\xb8\xad\xe6\x96\x87'
```

#### 12.3操作文件和目录

操作文件和目录的函数一部分放在`os`模块中，一部分放在`os.path`模块中

```python
import os
path1=os.path.abspath('.')#获取当前目录下的绝对路径
path2=os.path.join(path1,'02')'''拼接新目录名，在调用os.makedirs()之前都是字符串操作，并没真正创建新目录'''
os.makedirs(path2)#创建新目录,调用os.rmdir(path2)可删去该目录
```

把两个路径合成一个时，不要直接拼字符串，而要通过`os.path.join()`函数，这样可以正确处理不同操作系统的路径分隔符。拆分路径时，也不要直接去拆字符串，而要通过`os.path.split()`函数，这样可以把一个路径拆分为两部分，后一部分总是最后级别的目录或文件名

```python
import os
path1=os.path.abspath('.')
path2=os.path.join(path1,'02')
print(os.path.split(path2))
('D:\\PycharmProjects\\python-100天\\01', '02')
```

对文件进行操作：

```python
import os
os.rename('aaa.py','aaa.text')#重命名当前目录下的一个文件
os.remove('aaa.text')#删除当前目录下的一个文件
```

#### 12.4序列化

变量从内存中变成可存储或传输的过程称之为序列化，Python提供了`pickle`模块来实现序列化。

```python
import pickle
a=dict(name='zwf',age=20)
f=pickle.dumps(a)#pickle.dumps()将任意对象序列化成一个bytes
print(f)
b'\x80\x03}q\x00(X\x04\x00\x00\x00nameq\x01X\x03\x00\x00\x00zwfq\x02X\x03\x00\x00\x00ageq\x03K\x14u.'
```

```python
import pickle
with open('aaa.text','wb') as f:
    a=dict(name='zwf',age=20)
    pickle.dump(a,f)#pickle.dump()将对象序列化后写入文件
```

反序列化

```python
import pickle
with open('aaa.text','rb') as f:
    a=pickle.load(f)'''pickle.load()从一个文件对象中直接反序列化出对象,同理，loads()需要先将内容转化为bytes读入内存，再调用其进行反序列化'''
    print(a)
```

`JSON`格式，不同的编程语言之间传递对象，对象序列化的标准格式之一。Python内置的`json`模块提供了非常完善的Python对象到`JSON`格式的转换。

```python
import json
a=dict(name='zwf',age=20)
f=json.dumps(a)
print(f)
print(type(f))
{"name": "zwf", "age": 20}
<class 'str'>'''dumps()将python对象序列化为json，返回一个字符串，类似，dump()方法可以直接把JSON写入一个文件对象。'''
```

`JSON`格式反序列化

```python
import json
json_str='{"name": "zwf", "age": 20}'
print(json.loads(json_str))'''loads()将json反序列化为python对象,类似，load()从文件对象中读取字符串并反序列化'''
print(type(json.loads(json_str)))
{'name': 'zwf', 'age': 20}
<class 'dict'>
```

自定义类序列化为`JSON`

```python
import json
class Student():
    def __init__(self,name,age):
        self.name=name
        self.age=age
def cs(a):
    return{
        'name':a.name,
        'age':a.age
    }
x=Student('zwf',20)
print(json.dumps(x,default=cs))'''可选参数default就是把任意一个对象变成一个可序列为JSON的对象,函数cs()将Student的实例转化为字典传入'''
{"name": "zwf", "age": 20}
```

也可以用匿名函数，更简洁

```python
import json
class Student():
    def __init__(self,name,age):
        self.name=name
        self.age=age
x=Student('zwf',20)
print(json.dumps(x,default=lambda a:a.__dict__))'''通常class的实例都有一个__dict__属性，它就是一个dict，用来存储实例变量。'''
{"name": "zwf", "age": 20}
```

`JSON`反序列化为自定义类

```python
import json
class Student():
    def __init__(self,name,age):
        self.name=name
        self.age=age
def rs(a):
    return Student(a['name'],a['age'])
json_str = '{"age": 20,  "name": "zwf"}'
a=json.loads(json_str,object_hook=rs)'''如果要把JSON反序列化为一个Student对象实例，loads()方法首先转换出一个dict对象，然后，我们传入的object_hook函数负责把dict转换为Student实例'''
print(a)
<__main__.Student object at 0x000002127FAB7D30>
```

## 进阶知识

### 1.进程和线程

#### 1.1多进程

```python
import os
from multiprocessing import Process
def child_run(name):
    print(f'Child Process{os.getpid()} run {name}')
if __name__=='__main__':
    print(f"Parent process{os.getpid()} is running")
    p=Process(target=child_run,args=('test',))'''Process()创建一个子进程，target接收子进程执行的函数对象，args接收函数参数(传入的是元祖，末尾必须加逗号)'''
    print('Child process will start')
    p.start()
    p.join()#join()等待子进程结束，再往下执行，避免多个线程同步执行
    print('Child process end')
Parent process17132 is running
Child process will start
Child Process6680 run test
Child process end
```

#### 1.2进程池

```python
import os,time,random
from multiprocessing import Pool
def run(num):
    print(f'我是第{num}个子进程，我的进程号是{os.getpid()}')
    s=time.time()
    time.sleep(random.random()*3)
    e=time.time()
    sum=e-s
    print(f'第{num}个子进程，花费了{sum}')
if __name__=='__main__':
    print(f'我是主进程，我的进程号是{os.getpid()}')
    p=Pool(4)#创建含四个进程的进程池
    for i in range(1,6):
        p.apply_async(func=run,args=(i,))
    print('等待所有子进程结束')
    p.close()#在调用join()前必须调用close(),调用close()之后就不能继续添加新的Process了。
    p.join()#等待所有子进程结束，再往下执行
    print('所有子进程结束')
我是主进程，我的进程号是14276
等待所有子进程结束
我是第1个子进程，我的进程号是9308
我是第2个子进程，我的进程号是13264
我是第3个子进程，我的进程号是16664
我是第4个子进程，我的进程号是12968
第2个子进程，花费了0.026069164276123047#先执行完一个子进程，为第五个做准备
我是第5个子进程，我的进程号是13264#因为进程池只有四个，调用第五个进程时，需要将先等待一个子进程运行结束
第5个子进程，花费了1.9450960159301758
第3个子进程，花费了2.0914082527160645
第4个子进程，花费了2.201195240020752
第1个子进程，花费了2.665450096130371
所有子进程结束    
```

#### 1.3进程间的通信

```python
import os,time,random
from multiprocessing import Process,Queue
def write(q):
    print(f'进程{os.getpid()}开始写入数据...')
    for val in ['a','b','c','d']:
        print(f'进程{os.getpid()}写入数据{val}')
        q.put(val)#Queue的put()方法，将数据存入队列
        time.sleep(random.random()*3)
    print(f'进程{os.getpid()}写入结束')
def read(q):
    print(f'进程{os.getpid()}开始读取数据...')
    while True:
        val=q.get(True)#Queue的get()方法，若传入True,表明若队列为空则该进程阻塞，直到不为空为止
        print(f'进程{os.getpid()}读取数据{val}')
    print(f'进程{os.getpid()}读取结束')
if __name__=='__main__':
    q=Queue()
    qw=Process(target=write,args=(q,))
    qr=Process(target=read,args=(q,))
    qw.start()
    qr.start()
    qw.join()
    qr.terminate()#qr进程是死循环，只能用terminate()方法强行中止
进程216开始写入数据...
进程216写入数据a
进程12628开始读取数据...
进程12628读取数据a
进程216写入数据b
进程12628读取数据b
进程216写入数据c
进程12628读取数据c
进程216写入数据d
进程12628读取数据d
进程216写入结束
```

#### 1.4多线程

```python
import time,threading
def run():
    print(f'线程{threading.current_thread().name}启动...')#threading.current_thread().name返回当前线程的名字
    time.sleep(3)
    print(f'线程{threading.current_thread().name}结束')
if __name__ == '__main__':
    print(f'我是主线程{threading.current_thread().name}')
    t=threading.Thread(target=run,name='t1')#threading.Thread()创建一个新线程，可以传入线程需要执行的函数的函数对象和线程名字
    t.start()
    t.join()
    print(f'主线程{threading.current_thread().name}结束')
我是主线程MainThread
线程t1启动...
线程t1结束
主线程MainThread结束
```

#### 1.6线程锁

对于同一个变量，在多进程中，各有一份拷贝，互不影响。但对于多线程，同一个变量可以被所有线程共享，所以在多线程下修改全局变量需要用锁，确保一个线程在修改时，其余线程无法修改。

```python
#lock=threading.lock()创建一个锁
#在需要修改全局变量的地方获得锁，lock.acquire()
#修改完成后，需要释放锁，lock.release()
#锁只有一个，无论多少线程，同一时刻最多只有一个线程持有该锁
```

#### 1.7 `ThreadLocal`

有时候使用局部变量不太方便，因此 Python 还提供了`ThreadLocal` 变量，它本身是一个全局变量，但是每个线程却可以利用它来保存属于自己的私有数据，这些私有数据对其他线程也是不可见的。

```python
#使用ThreadLocal可以避免使用局部变量传参的问题
import threading
TL=threading.local()#创建一个线程本地变量
def show():
    print(f'{threading.current_thread().name}==>{TL.num}')
def process_thread(name):
    TL.num=0
    for i in range(1000):
       TL.num+=1#使用ThreadLocal，类似于创建一个全局字典，以当前线程为key，所求局部变量为value
    show()
if __name__ == '__main__':
    t=[]
    for i in range(10):
        t.append(threading.Thread(target=process_thread,args=(i,)))
        t[i].start()
        t[i].join()
```

#### 1.8分布式进程

pass

### 2.正则表达式

Python提供`re`模块，包含所有正则表达式的功能。

`\d`:匹配数字，`\w`:匹配字母或数字，`.`匹配任意字符，`*`:匹配任意个字符（包括0个），`+`:匹配至少1个字符

`？`:匹配1个或0个字符,`\s`:匹配一个空格（也包括Tab等空白符）,`A|B`:匹配A或者匹配B

```python
import re
t='010'
t1='12345'
m=re.match('\d{3}',t)#{n}表示匹配n个\d
m1=re.match('\d{3,8}',t1)#{n,m}表示匹配n-m个\d
print(m)
print(m1)
<re.Match object; span=(0, 3), match='010'>
<re.Match object; span=(0, 5), match='12345'>
```

要做更精确地匹配，可以用`[]`表示范围:

`[a-z0-9A-Z\_]`:匹配一个字母，数字，下划线

`[a-z0-9A-Z\_]+`:匹配多个字母，数字，下划线

`[a-zA-Z\_][a-zA-Z0-9\_]*`:以字母下划线开头，其后任意个字母数字下划线

`[a-zA-Z\_][a-zA-Z0-9\_]{0，19}`:限制匹配字符的长度

`^`表示行的开头，`^\d`表示必须以数字开头。

`$`表示行的结束，`\d$`表示必须以数字结束。

```python
import re
t='ab'
m=re.match('^ab$',t)#只能匹配ab，^ab$表示以a开头b结尾
print(m)
<re.Match object; span=(0, 2), match='ab'>
```

普通字符串的切分

```python
x='a b   c'
print(x.split(' '))
['a', 'b', '', '', 'c']#无法识别连续的空格
```

正则表达式的切分字符串

```python
import re
x='a b   c'
s=re.split('\s+',x)
print(s)
['a', 'b', 'c']
```

分组匹配

```python
import re
s='2974185325@qq.com'
m=re.match('([a-zA-Z0-9]+)@([a-zA-Z0-9]+)\.com',s)#(...)@(...)括号分组
print(m.group(0))#group(0)永远是原始字符串，group(1)、group(2)……表示第1、2、……个子串。
print(m.group(1))
print(m.group(2))
print(m.groups())#groups()输出所有分组子串的元祖
2974185325@qq.com
2974185325
qq
('2974185325', 'qq')
```

