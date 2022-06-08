---
title: Java编程思想
date: 2019-03-25
categories:
- Java
tags:
- Java
---

## 0.补充资料

- 编译期：Java虚拟机将Java源代码文件（.java）编译成可执行的字节码文件（.class）的期间
- 运行期：Java虚拟机运行可执行的字节码文件的期间

## 1.一切都是对象

### 1.1用引用操纵对象

在java中一切都视为对象，但操纵对象的标识符实际上是对象的一个引用，引用类似于指向对象的指针。

比如用遥控器**（引用）**操纵电视机**（对象）**，当人们需要改变电视机**（对象）**的状态时，实际操控的是遥控器**（引用）**，再由遥控器**（引用）**来使电视机**（对象）**完成相应的操作。

引用可以脱离对象独立存在，即使没有任何对象与它关联，也可以创建一个引用：`String s`

比如没有电视机**（对象）**，遥控器**（引用）**也可以独立存在

### 1.2必须由你创建所有对象

java中通过`new`操作符来实现创建一个对象：`String s = new String ("ddd");`

通过`new String ("ddd")`创建一个内容为ddd的字符串对象，再将引用s指向该字符串对象

#### 1.2.1存储到什么地方

java程序运行时，会将相应数据存放在五个不同的地方：

- 寄存器：最快的存储区，位于处理器内部，数量有限，由系统根据需求分配，我们无法直接控制
- 栈：位于通用RAM（随机访问存储器）中，速度仅次于寄存器。栈指针向下移动（往低地址方向），则分配新的内存，向上移动（往高地址方向），则释放内存，创建程序时，**Java系统必须知道栈内所有项的确切生命周期**，以便上下移动栈指针。**Java将对象的引用存储于栈中**
- 堆：一种通用的内存池（也位于RAM区），**用于存放Java对象，堆不同于栈：编译器不需要知道存储的数据在堆里存活多长时间。因此需要一个对象时，只需要new一下，就会自动在堆里进行存储分配**
- 常量存储：**常量值通常直接存放在程序代码内部**
- 非RAM存储：数据完全存活于程序之外，可以不受任何程序的控制，比如**流对象**和**持久化对象**。
  - 流对象：对象转化为字节流，通常被发送给另一台机器
  - 持久化对象：对象被存放于磁盘上，在需要时，可恢复成常规的，基于RAM的对象

#### 1.2.2特例：基本类型（无需由你创建的对象）

由于基本类型的对象都是一些小的，简单的数据，通过`new`创建存储在堆中，非常的低效，所以java采取了特殊对待：**不用`new`来创建这些对象，而是创建一个并非是引用的变量，由变量直接存储这些基本类型的对象（数据），并将这个变量置于栈中。**

java每种基本类型所占的存储空间大小都是固定的，不随机器变化而变化（可移植性）

每个数值类型都有正负号，不存在无符号的数值类型（相比c，c++）

`boolean`类型所占存储空间大小无明确指定，仅定义为能够取字面值true或false

基本类型都具有一个包装器类，所以能够在堆中创建一个非基本对象来表示基本类型

```java
char c='x';//c不是引用而是变量，直接存值，存放于栈中，基本对象
Character ch=new Character(c);//ch是引用，对象通过new创建，存放于堆中，非基本对象
```

#### 1.2.3Java中的数组

在Java中数组会被确保初始化

- 当创建一个数组对象时，实际上就是创建了一个引用数组，每个引用都会自动被初始化为一个特定值`null`。
- 一旦Java看到`null`，说明该引用还没有指向某个对象，在使用任何引用前，都必须为其指定一个对象，否则报错。
- 创建存放基本数据类型的数组时，数组中的变量全部置零

### 1.3永远不需要销毁对象

作用域：决定了在其内定义的变量名的可见性和声明周期

在C，C++，Java中，作用域由花括号的位置决定

```java
//作用域里的变量只可用于作用域结束之前
{
	int x=12;
	//只有x是可获得的
	{
	int q=96;
	//x,q都可以获得
	}
	//q脱离了自己的作用域，无法获得，只有x可获得
}
```

#### 1.3.1对象的作用域

Java对象不具备和基本类型一样的生命周期，当用new创建一个Java对象时，它可以存活于作用域之外

```java
{
	String s=new String("ddd");
}
//作用域结束，引用s在作用域终点消失，然而s指向的String对象依然占据着内存空间，当然后续我们也无法访问这个对象，因为该对象的唯一引用已超出了作用域的范围
//Java的垃圾回收机制不会允许无法访问的对象的堆叠导致内存溢出，当对象的唯一引用消失后，Java便会自动释放这些对象的内存空间
```

### 1.4创建新的数据类型：类

`class`关键字用于定义自定义类型

```java
class ATypeName{
	//class body
}
```

#### 1.4.1字段和方法

在java类中可以设置两种类型的元素

- 字段（数据成员）：可以是任何类型的对象，也可以是基本类型中的一种
- 方法（成员函数）

若类的某个成员是基本数据类型，即使没有初始化，Java也会确保它获得一个默认值

（确保初始化的方法不适用于局部变量）

### 1.5方法、参数和返回值

方法的基本形式：

```java
ReturnType method(/*Argument list*/){
	/*method body*/
}
```

方法名和参数列表合起来称为”方法签名“

方法的参数传递实际上传递的也是引用

`return`关键字标明返回值并退出此方法

### 1.6构建一个Java程序

#### 1.6.1名字可见性

为了防止程序中各模块的变量出现同名冲突，Java采用了包机制来避免这一问题，可以用倒转域名来为包命名

`import`关键字可以引入其他包中的类

#### 1.6.2`static`关键字

`static`关键字可以满足以下两个需求

- 只想为某特定域分配单一存储空间，而不需要考虑究竟要创建多少对象，甚至不用创建对象

  ```java
  class StaticTest{
  	static int i=47;//无论为StaticTest类创建多少对象，字段i也只有一份存储空间，对象之间共享字段i
      //可以通过StaticTest.i或new StaticTest().i调用
  	//非static字段对于每个对象都有单独的存储空间
  }
  ```

- 希望某个方法不与包含它的类的任何对象关联在一起

  ```java
  class StaticTest{
  	static void f(){
      }
      //可以通过StaticTest.f()或new StaticTest().f()调用
  }
  ```

### 1.7你的第一个Java程序

```java
//每一个java文件都会自动导入java.lang类
import java.util.Date;//import导入了java.util包下的Date类

//类名必须与java文件名相同
public class test1 {
    //要想创建一个独立运行的程序，则该类必须包含main方法
    //参数args是一个String对象的数组，用来储存命令行参数
    public static void main(String[] args){
        System.out.println(new Date());
        //System类的out属性是一个静态PrintStream对象，因为是静态的，所以无需创建任何东西，可以直接调用PrintStream对象的println方法
        //println方法表示输出到控制台并换行
        //println方法会将收到的参数转换为字符串类型，此处的Date对象在这条语句执行结束，失去了唯一引用，会被java自动回收
    }

}
```

### 1.8编码风格

Java采用”驼峰风格“的代码

- 类名首字母大写，若由多个单词构成，则每个单词的首字母都采用大写
- 字段（成员变量）以及对象引用名称与类名风格一样，只是标识符首字母采用小写

## 2.操作符

### 2.1使用Java操作符

几乎所有操作符都只能操作“基本类型”，例外的操作符是“=”、“==”和“!="，这些操作符能操作所有的对象。除此之外，String类支持“+”和“+=”。

### 2.2赋值

- 基本数据类型的赋值：基本类型存储了实际的数值，而并非指向一个对象的引用，所以对其赋值，是直接将一个地方的内容复制到另一个地方

  例如`a=b`，b的内容就被复制给a，即便修改a，b也不会受影响

- 对象赋值：对于对象的赋值，我们真正操作的是对对象的引用，所以“将一个对象赋值给另一个对象”，实际是将“引用”从一个地方复制到另一个地方

  例如`c=d`，此时c和d都指向了d指向的那个对象

  ```java
  package operator;
  
  class Tank{
      int level;
  }
  public class Assignment {
      public static void main(String[] args){
          Tank t1 = new Tank();
          Tank t2=new Tank();
          t1.level=9;//t1的level域指向一个值为9的对象
          t2.level=47;//t2的level域指向一个值为47的对象
          System.out.println("t1.level:"+t1.level+",t2.level:"+t2.level);
          t1=t2;//t1，t2指向t2引用所指向的对象
        	//t1原先指向的对象因为不再被任何一个引用所指向，所以被垃圾回收器自动清理
          System.out.println("t1.level:"+t1.level+",t2.level:"+t2.level);
          t1.level=27;//t1修改，t2也变化，因为他们指向同一个对象
          System.out.println("t1.level:"+t1.level+",t2.level:"+t2.level);
      }
  }/*output
  t1.level:9,t2.level:47
  t1.level:47,t2.level:47
  t1.level:27,t2.level:27
  */
  ```

#### 2.2.1方法调用中的别名问题

java中对象的赋值实际是复制引用，相当于为一个对象起了一个别名

将对象传递给方法时，也会产生别名问题：

```java
package operator;

class Letter{
    char c;
}
public class PassObject {
    //当java中的方法参数涉及到对象时，实际传递的是该对象的引用
    static void f(Letter y){
        //此处实际改变的是方法之外的对象
        y.c='z';
    }
    public static void main(String[] args){
        Letter x=new Letter();
        x.c='a';
        System.out.println("x.c:"+x.c);
        f(x);
        System.out.println("x.c:"+x.c);
    }
}/*output
x.c:a
x.c:z
*/
```

### 2.3算术操作符

基本算术操作符：加号（+）、减号（-）、除号（/）、乘号（*）以及取模操作符（%，它从整数除法中产生余数）。整数除法会直接去掉结果的小数位，不会四舍五入

#### 2.3.1一元加、减操作符

一元减号用于转变数据的符号，而一元加号只是为了与一元减号相对应，但是它唯一的作用是将较小类型的操作数提升为int（char、byte、short）

### 2.4自动递增和递减

前缀递增（递减）：++a/--a会先执行运算，再生成值

后缀递增（递减）：a++/a--会先生成值，再执行运算

### 2.5关系操作符

关系操作符生成的是一个`boolean`结果，关系操作符包括小于（<）、大于（>）、小于或等于（<=）、大于或等于（>=）、等于（==）和不等于（!=）

#### 2.5.1测试对象的等价性

关系操作符`==`和`!=`适用于所有的基本数据类型，同样也适用于所有对象

- 关系操作符`==`和`!=`比较的是对象的引用

  ```java
  package operator;
  
  public class Equivalence {
      public static void main(String[] args){
          //对象n1和n2内容相同，但引用不同，指向不同的对象
          Integer n1=new Integer(47);
          Integer n2=new Integer(47);
          //==操作符比较的是对象的引用，所以输出false
          System.out.println(n1==n2);
          System.out.println(n1!=n2);
      }
  }/*output
  false
  true
  */
  ```

- 若要比较两个对象的实际内容是否相同，则必须使用所有对象都适用的特殊方法`equals()`，但该方法不适用于基本类型，基本类型直接使用`==`和`!=`即可

  ```java
  package operator;
  
  public class EqualsMethod {
      public static void main(String[] args){
          Integer n1=new Integer(47);
          Integer n2=new Integer(47);
          System.out.println(n1.equals(n2));
      }
  }/*output
  true
  */
  ```

- 对于自定义类，使用`equals()`方法需要在自己的类中覆盖此方法，重写比较的规则，否则`equals()`的默认行为仍是比较引用

  ```java
  package operator;
  class  Value{
      int i;
  }
  public class EqualMethod2 {
      public static void main(String[] args){
          Value v1=new Value();
          Value v2=new Value();
          v1.i=12;
          v2.i=12;
          //自定义类Value未重写equals方法，所以比较的是引用
          System.out.println(v1.equals(v2));
      }
  }/*output
  false
  */
  ```

### 2.6逻辑操作符

逻辑操作符包括与（&&）、或（||）、非（!），能根据参数的逻辑关系，生成一个`boolean`值（true或false）

如果在应该使用String值的地方使用了布尔值，布尔值会自动转换成适当的文本形式

在java中不可以将一个非布尔值当作布尔值在逻辑表达式中使用：

```java
System.out.println(4&&5);//4和5都是int类型非布尔值,会报错
System.out.println((4>5)&&(5<4));//逻辑操作符两边都是布尔值，所以不会报错
```

### 2.7直接常量

直接常量的后缀字符标志了它的类型：

- 大写/小写的L，代表long
- 大写/小写的F，代表float
- 大写/小写的D，代表double
- 以前缀0x/0X，后面跟随0-9或小写/大写的a-f，代表16进制，16进制适用于所有整数类型

一般在程序中使用了直接常量，编译器会准确地知道要生成什么样得类型，但有时却模棱两可，此时需要给编译器提供一些信息

```java
int i=0x2f;//16进制常量赋给整型，默认自动转换为10进制
System.out.println("i:"+Integer.toBinaryString(i));//告诉编译器以二进制形式输出
```

#### 2.7.1指数记数法

e代表“10的幂次”，如`1.39e-43`表示1.39x10^-43

默认的，编译器会将指数作为双精度数（double）处理，所以当使用float类型的变量接收时，则需要在末尾加L，如`float f=1e-43f;`，告诉编译器将double转为float

### 2.8按位操作符

按位操作符用于操作整数基本类型中的单个bit（位）

按位与（&）：若两个输入位都为1，则输出1，否则输出0

按位或（|）：若两个输入位里有一个为1，则输出1，否则输出0

### 2.9移位操作符

移位操作符用于操作整数基本类型中的单个bit（位）

左移位操作符（<<）：按照操作符右侧指定的位数将操作符左边的操作数向左移（低位补0）

”有符号“右移位操作符（>>）：按照操作符右侧指定的位数将操作符左边的操作数向右移，若符号为正，则在高位插0，若符号为负，则在高位插1

“无符号”右移位操作符（>>>）：无论正负，都在高位插0

### 2.10三元操作符

三元操作符的表达式：`boolean-exp ? value0 : value1`，若boolean-exp（布尔表达式）的结果为true，则最终结果为value0的值，否则为value1的值

### 2.11字符串操作符`+`和`+=`

字符串操作符`+`和`+=`用于连接不同的字符串

若表达式以一个字符串起头，那么后续所有操作数都必须是字符串型（编译器会把双引号内的字符序列自动转成字符串）

```java
package operator;

public class StringOperator {
    public static void main(String[] args){
        int x=0,y=1,z=2;
        String s="x,y,z";
        //以字符串s开头，后续使用+连接的操作数都会自动转换为字符串
        System.out.println(s+x+y+z);
        //若+两边的操作数一个为字符串，另一个为其他类型，则会将其他类型转换为字符串，此处其实隐式的调用了Integer.toString
        System.out.println(x+" "+s);
        s+="(summed)=";
        //使用括号改变运算优先级，先计算x+y+z，得到的整型结果再自动转换为字符串
        System.out.println(s+(x+y+z));
    }
}/*output
x,y,z012
0 x,y,z
x,y,z(summed)=3
*/
```

### 2.12类型转换操作符

执行类型转换，就需要将希望得到的数据类型置于括号内，放在要进行转换的值的左边，形式如`(new type)type`

java允许将任何基本数据类型转换成别的基本数据类型，布尔型除外

```java
package operator;

public class Casting {
    public static void main(String[] args){
        int i=200;
        //对变量进行类型转换
        long lng=(long) i;
        //扩展转型，新类型能容纳原类型的所有信息，所以不必显式转型，编译器会自动帮我们完成
        lng=i;
        //对数值进行类型转换
        long lng2=(long)200;
        lng2=200;
        //窄化转型，新类型无法容纳原类型的所有信息，有可能面临信息丢失的风险，编译器会强制我们进行显式的类型转换
        i= (int) lng2;
    }
}
```

#### 2.12.1提升

如果对基本数据类型执行算术运算或按位运算，只要类型比int小（char，byte，short），那么在运算前，这些值都会自动转换成int，最终生成的结果也是int类型，此时如果将结果赋值给较小类型，则需要显式的类型转换。

通常，在表达式中出现的最大的数据类型决定了表达式最终结果的数据类型

## 3.初始化与清理

### 3.1用构造器确保初始化

构造器是一种特殊类型的方法，因为它没有返回值，而且方法名与类名相同

```java
package initialization;

class Rock{
  	//不接受任何参数的构造器，默认构造器/无参构造器
    Rock(){
        System.out.println("Rock");
    }
}

public class SimpleConstructor {
    public static void main(String[] args){
        //new Rock()就会调用相应的构造器来初始化对象
        //尽管new表达式确实返回了新建对象的引用，但是构造器本身并无返回值
        new Rock();
    }
}/*output
Rock
*/
```

### 3.2方法重载

方法重载：方法名相同，但参数类型列表不同（即使参数顺序不同，也能重载）

```java
package initialization;

class Tree{
    int height;
    //构造器也是方法重载的一种体现
    //无参构造器
    Tree(){
        System.out.println("Planting a Seeding");
        height=0;
    }
    //有参构造器
    Tree(int initialHeight){
        height=initialHeight;
        System.out.println("Create a new Tree that height is "+height);
    }
    //普通方法的重载
    void info(){
        System.out.println("The tree is "+height+" tall");
    }
    //方法名相同，参数的顺序不同，也会重载
     void info(String s,int i){
        System.out.println(s+i);
    }
    void info(int i,String s){
        System.out.println(i+s);
    }
}
public class OverLoading {
    public static void main(String[] args){
        //调用不同构造器，实现不同方式的创建同一种对象
        new Tree();
        Tree t=new Tree(20);
        //根据传入的参数不同，调用重载的方法
        t.info();
         t.info("overloading method",1);
        t.info(2,"overloading method");
    }
}/*output
Planting a Seeding
Create a new Tree that height is 20
The tree is 20 tall
overloading method1
2overloading method
*/
```

#### 3.2.1涉及基本类型的重载

基本类型能从一个较小的类型自动提升到一个较大的类型，此过程一旦涉及到重载，可能会造成一些混淆

- 若传入的数据类型小于形参类型，则传入的数据类型就会被提升。char型略有不同，如果无法找到恰好接收char参数的方法，就会把char直接提升至int型
- 若传入的数据类型大于形参类型，就必须通过窄化转型，显式的类型转换，或者会报错

#### 3.2.2以返回值区分重载方法

若以返回值区分重载方法，编译器便无法判断语义，会报错

比如：

```java
int f(){return 1;}
void f(){}
int x=f();//此处可以明显区分重载方法
f();//但是有时我们并不关心方法的返回值而直接调用，此时编译器便不知道调用哪一个方法
```

### 3.3默认构造器

默认构造器，即没有形式参数的构造器，用于创建一个默认对象。若自定义类中没有构造器，则编译器会自动帮你创建一个默认构造器。

```java
package initialization;

class Bird{}
public class DefaultConstructor {
    public static void main(String[] args){
        //new Bird()创建了一个新对象，即便该类中没有明确定义，编译器也会自动帮你创建一个默认构造器
        new Bird();
    }
}
```

若自定义类中已经定义了一个构造器（无论是否有参数），编译器就不会帮你自动创建默认构造器

```java
package initialization;

class Bird2{
    Bird2(int i){};
}
public class NoSythesis {
    public static void main(String[] args){
        new Bird2(1);
        //new Bird2();会报错，无法找到匹配的构造器
    }
}
```

### 3.4`this`关键字

当有同一类型的两个对象，都调用同一个方法，那么此时编译器会偷偷做一些工作来辨别是哪个对象调用了该方法：

即将所操作对象的引用，作为第一个参数传递给该方法。

而`this`关键字就用于表示这个偷偷传入的引用

```java
package initialization;

class Banana{
    void peel(int i){}
}
public class BananaPeel {
    public static void main(String[] args){
        Banana a=new Banana();
        Banana b=new Banana();
        //a和b都调用了peel方法
        //编译器会在内部采用Banana.peel(a,1)和Banana.peel(a,1);的形式
        a.peel(1);
        b.peel(2);
    }
}
```

`this`关键字只能在方法内部使用，若在方法内部调用同一个类的另一个方法，就不必使用`this`，直接调用即可，当前方法中的`this`引用会自动应用于同一类中的其他方法

#### 3.4.1在构造器中调用构造器

`this`关键字表示的是对当前对象的引用。在构造器中，如果为`this`添加了参数列表，就会产生对符合此参数列表的某个构造器的明确调用

```java
package initialization;

public class Flower {
    int petCount=0;
    String s="initial value";
    Flower(int petals){
        petCount=petals;
        System.out.println("petCount="+petCount);
    }
    Flower(String ss){
        s=ss;
        System.out.println("s="+s);
    }
    Flower(String s,int petals){
        //在构造器中调用另一个构造器，必须将构造器的调用置于最起始处，否则会报错
        //不能同时调用两个构造器，只能调用一个
        this(petals);
        //this(s)
        //当形参名与数据成员名称相同时，采用this.s来代表数据成员
        this.s=s;
        System.out.println("s="+this.s);
    }
    public static void main(String[] args){
        new Flower(10);
        new Flower("dddd");
        new Flower("aaa",20);
    }
}/*output
petCount=10
s=dddd
petCount=20
s=aaa
*/
```

#### 3.4.2`static`的含义

`static`（静态）方法就是没有`this`的方法。

- 在`static`方法内部不能调用非静态方法，反过来倒是可以。
- 无需创建任何对象，仅通过类本身就能调用`static`方法

### 3.5清理：终结处理和垃圾回收

关于Java的垃圾回收器：

- 对象可能不被垃圾回收：**Java的垃圾回收具有惰性，遵循能不回收则不回收**，除非程序内存即将耗尽，否则对象占用的空间就不会释放；如果程序执行结束，并且垃圾回收器一直都没有释放你创建的任何对象的存储空间，则随着程序退出，那些资源也会全部交还给操作系统
- 垃圾回收并不等于”析构“：C++的析构函数的调用是明确的，而**Java的垃圾回收是不确定的**
- 垃圾回收只与内存有关：**Java的垃圾回收只负责回收通过`new`分配的内存**，即存储在堆中的对象，无法回收其他资源（文件句柄，数据库连接等）

#### 3.5.1垃圾回收器如何工作

- 垃圾回收器对于提高对象的创建速度有明显的效果：

  在堆上分配对象的代价十分高昂，但Java采用了”堆指针“，每分配一个对象，指针就后移一位。但是堆不像栈，没有出栈的操作，对象一多就容易耗尽内存资源，此时垃圾回收器就介入了，**垃圾回收器会在回收无用对象的内存空间的同时，将堆中存活的对象紧凑排列（避免了回收后所产生的内存碎片）**

- 引用计数（其他系统的垃圾回收机制）：每个对象都含有一个引用计数器，每当有引用连接至对象时，引用计数就加1。当引用离开作用域或被置为`null`时，引用计数减1。垃圾回收器会在含有全部对象的列表上遍历，当发现某个对象的引用计数为0时，就会释放其占用空间。

  引用计数无法解决对象间循环引用的问题：

  ```java
  //对象间的循环引用
  class a{
      B b;
  }
  class b{
      A a;
  }
  A a=new A();
  B b=new B();
  //a对象中引用了b对象，b对象也引用了a对象
  //a对象回收的前提是b对象被回收，b对象同理
  //两个对象的引用计数永远不会为0
  a.b=B,b.a=A;
  a=null,b=null;
  ```

- 追溯引用：对任何存活的对象，一定能最终追溯到其存活在栈或静态存储区中的引用

- 寻找存活对象：首先从栈和静态存储区开始，遍历所有的引用，就能找到所有存活的对象。对于发现的每个引用，必须追踪它所引用的对象，然后是此对象包含的所有引用，如此反复进行，直到根源于栈和静态存储区中的引用所形成的网络全部被返问为止（消除了循环引用的问题）

- 基于追溯引用的思想，Java采用自适应的垃圾回收机制，分为两个工作状态：

  - **停止-复制**：暂停程序的运行，寻找存活对象，按需将堆划分为不同的块，然后将所有存活对象复制到另一块并且是紧凑排列，最后释放旧对象
  - **标记-清扫**：暂停程序的运行，寻找存活对象，为所有存活对象设一个标记，该过程不会回收任何对象，只有全部标记工作完成的时候，清理动作才会开始。清理过程中，没标记的对象将被释放，不会发生任何复制动作。（此时剩下的堆空间都是不连续的）

- 自适应的工作流程：Java虚拟机会进行监视，如果所有对象都很稳定，垃圾回收器的效率降低的话，就切换到**标记-清扫**方式，若是堆空间出现很多碎片，就会切换回**停止-复制**方式

### 3.6成员初始化

Java尽力保证：所有变量在使用前都能得到恰当的初始化。对于方法的局部变量，Java以编译时错误的形式来贯彻这种保证

不初始化，若类的数据成员是基本类型都会拥有一个默认的初始值，若类的数据成员是一个对象的引用，则此引用为`null`

### 3.7构造器初始化

可以用构造器来进行初始化，但无法阻止自动初始化的进行，**自动初始化将在构造器被调用之前发生**

```java
package initialization;

public class Counter {
    int i;//i首先被置0
    Counter(){
        //然后构造器初始化，置为7
        i=7;
    }
}
```

#### 3.7.1初始化顺序

**在类的内部，变量的定义的先后顺序决定了初始化的顺序。即使变量定义散步于方法定义之间，它们仍旧会在任何方法（包括构造器）被调用之前得到初始化**

```java
package initialization;


class Window{
    Window(int marker){
        System.out.println("Window("+marker+")");
    }
}
class House{
    //w1在在构造器之前被初始化
    Window w1=new Window(1);
    //在构造器被调用之前，类内部的数据成员就已经初始化了
    House(){
        System.out.println("House()");
        //w3在构造器中又被初始化一次，w3原先指向的对象被垃圾回收
        w3=new Window(33);
    }
    //w2在在构造器之前被初始化    
    Window w2=new Window(2);
    void f(){
        System.out.println("f()");
    }
    //w3在在构造器之前被初始化    
    Window w3=new Window(3);
}
public class OrderOfInitialization {
    public static void main(String[] args){
        House h=new House();
        h.f();
    }
}/*output
Window(1)
Window(2)
Window(3)
House()
Window(33)
f()
*/
```

#### 3.7.2静态数据的初始化

无论创建多少个对象，静态数据都只占用一份存储区域。`static`关键字不能应用于局部变量，只能作用于数据成员

静态数据的初始化只有在必要时刻才会进行，即当静态数据第一次被访问时，它们才会被初始化，此后静态数据不会再次被初始化。

对象的创建过程总结（假设有个名为Dog的类）：

- 当首次创建类型 为Dog的对象时（即`new Dog()`），或者首次访问Dog类的静态方法/静态域，Java解释器必须查找类路径，以定位Dog.class文件（Java的编译器在编译java类文件时，会将原有的文本文件（.java）翻译成二进制的字节码，并将这些字节码存储在.class文件）

- 然后载入Dog.class（这将创建一个Class对象），有关静态初始化的所有动作都会执行。因此静态初始化只在Class对象首次加载的时候进行一次

- 当用`new Dog()`创建对象的时候，首先在堆上为Dog对象分配足够的存储空间

- （自动初始化）将这块存储空间清零，这就自动的为Dog对象的所有基本类型数据设置成默认值，引用则被设置成null

- 执行所有出现于字段定义处的初始化动作

- 执行构造器

  ```java
  package initialization;
  
  
  
  class Bowl{
      //3.无静态域和数据成员，直接执行构造器初始化
      Bowl(int marker){
          System.out.println("Bowl("+marker+")");
      }
      void f1(int marker){
          System.out.println("f1("+marker+")");
      }
  }
  
  class Table{
      //2.初始化静态的Bowl对象，new Bowl()的同时使得Bowl类也被加载并初始化
      static Bowl bowl1=new Bowl(1);
      //5.无数据成员，执行构造器初始化
      Table(){
          System.out.println("Table");
          bowl2.f1(1);
      }
      void f2(int marker){
          System.out.println("f2("+marker+")");
      }
      //4.初始化静态的Bowl对象，Bowl类已经被加载
      static Bowl bowl2=new Bowl(2);
  }
  
  class Cupboard{
      //9.执行数据成员的初始化，Bowl类已经被加载
      Bowl bowl3=new Bowl(3);
      //7.初始化静态的Bowl对象，Bowl类已经被加载
      static Bowl bowl4=new Bowl(4);
      //10.执行构造器初始化
      Cupboard(){
          System.out.println("Cupboard");
          bowl4.f1(2);
      }
      void f3(int marker){
          System.out.println("f3("+marker+")");
      }
      //8.初始化静态的Bowl对象，Bowl类已经被加载
      static Bowl bowl5=new Bowl(5);
  }
  
  public class StaticInitialization {
      //运行StaticInitialization类中的静态main方法，Java解释器会寻找到StaticInitialization.java文件并将其编译为StaticInitialization.class文件
      //然后载入StaticInitialization.class文件并创建一个Class对象
      //执行静态成员的初始化
      public static void main(String[] args){
          System.out.println("Creating new Cupboard() in main");
          new Cupboard();
          System.out.println("Creating new Cupboard() in main");
          new Cupboard();
          table.f2(1);
          cupboard.f3(1);
      }
      //1.首先初始化静态的Table对象，new Table()分配内存的同时使得Table类也被加载并初始化
      static Table table=new Table();
      //6.始化静态的Cupboard对象，new Cupboard()分配内存的同时使得Cupboard类也被加载并初始化
      static Cupboard cupboard=new Cupboard();
  }/*output
  Bowl(1)
  Bowl(2)
  Table
  f1(1)
  Bowl(4)
  Bowl(5)
  Bowl(3)
  Cupboard
  f1(2)
  Creating new Cupboard() in main
  Bowl(3)
  Cupboard
  f1(2)
  Creating new Cupboard() in main
  Bowl(3)
  Cupboard
  f1(2)
  f2(1)
  f3(1)
  */
  ```

#### 3.7.3显式的静态初始化

在Java中可以采用“静态块”来组织多个静态初始化动作

静态块：`static{静态初始化动作}`

当首次生成这个类的一个对象时，或者首次访问那个类的静态成员/方法时，静态块就会执行，仅执行这一次，后续不再执行

```java
package initialization;


class Demo{
    static int i;
    static{
        System.out.println("Static Bock Initialization");
    }
}

public class Spoon {
    public static void main(String[] args){
        int i=Demo.i;//触发静态初始化，静态块被调用
    }
}/*output
Static Bock Initialization
*/
```

#### 3.7.4非静态实例初始化

在Java中同样可以采用“实例块”来组织多个非静态实例初始动作

实例块：`{实例初始化动作}`

实例块中的初始化动作发生在构造器之前

```java
package initialization;

class Demo2{
    int i;
    {
        i=47;
        System.out.println("Initialization");
    }
}

public class Mug {
    public static void main(String[] args){
        new Demo2();
    }
}/*output
Initialization
*/
```

### 3.8数组初始化

数组只是相同类型的、用一个标识符名称封装到一起的一个对象序列或基本类型序列。在Java中是不允许指定数组的大小

数组的定义：`int[] a1`或`int a1[]`

数组的定义仅仅只是获得了一个对数组的引用，而并没有为数组对象本身分配任何空间，要想数组拥有相应的空间，必须进行数组的初始化（数组初始化后，数组对象所拥有的空间就固定了，数组的长度也就固定了）

数组初始化方式：

- `int[] a1={1,2,3,4,5}`（这种只能在定义处初始化，长度为5）
- `int[] a; a=new int[n]`（可以定义后初始化，并且长度可以由变量指定）
- `int[] a=new int[]{1,2,3}`

数组之间的赋值，真正做的只是复制了一个引用

```java
int[] a1={1,2,3};
int[] a2;
//a2和a1都指向了相同的数组对象，a2和a1都是相同数组对象的别名
//a2修改也会导致a1数组变化
a2=a1
```

#### 3.8.1可变参数列表

可变参数列表使得方法变得更加灵活，能够接收任意个参数

Java可变参数列表的语法：`public method(类型名... 参数名){}`

当使用可变参数列表，若接收到的是元素列表，编译器会将元素列表转换成一个数组（可以使用`foreach`遍历可变参数列表），若接收到的是一个数组，则不做任何动作

```java
package initialization;

public class NewVarArgs {
    //采用Object类型作可变参数列表更灵活，java中所有类都继承自Object
    static void printArray(Object... args){
        for(Object obj:args){
            System.out.print(obj+" ");
        }
        System.out.println();
    }
    public static void main(String[] args){
        printArray(new Counter(),new Bird());
        printArray(11,37f,36d);
        printArray("one","two");
        //传递数组就不做转换
        printArray((Object) new int[]{1,2,3,4});
        //不传参行
        printArray();
    }
}/*output
initialization.Counter@27bc2616 initialization.Bird@3941a79c 
11 37.0 36.0 
one two 
[I@30dae81 
*/
```

可变参数列表会使得方法重载更加复杂

```java
package initialization;

public class OverloadVarArgs {
    static void f(int... args){
        System.out.println("f(int... args)");
    }
    static void f(long... args){
        System.out.println("f(long... args)");
    }
    public static void main(String[] args){
        //当有传参时，还能正常的调用对应的重载方法
        f(0);
        f(0L);
        //无传参时，则会自动调用第一个f()方法
        f();
    }
}
```

### 3.9枚举类型

枚举类型能为我们定义一组常量集，Java采用`enum`关键字来定义枚举类型，枚举类型的实例是常量，命名中字母应该全大写

```java
package initialization;

public enum Week {
    //枚举类型的实例就是常量
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

package initialization;

public class EnumUse {
    public static void main(String... args){
        //创建一个枚举类型的引用，并将枚举的一个实例赋值给它
        Week week=Week.Monday;
        System.out.println(week);
        //Week.values()包含了枚举类的所有实例
        for (Week w :Week.values()) {
            //枚举类实例的ordinal方法返回实例在枚举类中的声明顺序
            System.out.println(w+" ,ordinal "+w.ordinal());
        }
    }
}/*output
MONDAY
MONDAY ,ordinal 0
TUESDAY ,ordinal 1
WEDNESDAY ,ordinal 2
THURSDAY ,ordinal 3
FRIDAY ,ordinal 4
SATURDAY ,ordinal 5
SUNDAY ,ordinal 6
*/
```

## 4.访问权限控制

Java提供了访问权限修饰词：`public`、`protected`、包访问权限（没有关键词）、`private`

访问权限修饰词按权限从大到小依次为：`public`、`protected`、包访问权限（没有关键词）、`private`

### 4.1包：库单元

包是组织类的一种形式，包内包含有一组类，包名就相当于这组类的名字空间，包的使用保证了类的唯一性。

例如`java.util.ArrayList`，类`ArrayList`就被组织在`java.util`包名的名字空间下

关键字`package`用于声明当前类所在的包

例如`package access`，表示当前类附属于access包。**当使用package语句时，它必须是当前类文件中除注释以外的第一句程序代码**（包名的命名全部采用小写）

不存在于任何包下的类实际也已经位于包中：即未命名包/默认包

`import`关键字可以将其他包或包中的类导入当前类

每一个Java源代码文件，通常被称为编译单元（或转译单元）。编译单元都必须有一个后缀名.java，而在编译单元内有且只能有一个public类，该类的名称必须与编译单元的文件名称完全相同（public主类用于为包外其他类提供访问）

#### 4.1.1代码组织

当编译一个.java文件时，在.java文件中的每个类都会有一个输出文件，该输出文件的名称与.java文件名称相同，只是后缀名变为.class。

Java可运行程序是一组可以打包并压缩为一个Java文档文件（JAR)的.class文件，Java解释器负责这些.class文件的查找、装载和解释

#### 4.1.2创建独一无二的包名

package的名称最好是由创建者的Internet域名的反顺序组成，这样是独一无二的

当Java程序运行并且需要加载.class文件时，Java解释器的运行过程如下：

首先，找出环境变量CLASSPATH。CLASSPATH包含一个或多个目录，用作查找.class文件的根目录。从根目录开始，解释器获取包的名称并将每个句点替换成反斜杠，以从CLASSPATH根中产生一个路径名称（比如`package foo.bar.baz`就变成了foo\bar\baz或foo/bar/baz）。得到的路径会与CLASSPATH中的各个不同的项相连接，解释器就在这些目录中查找与你所要创建的类名称相关的.class文件

### 4.2Java访问权限修饰词

`public`、`protected`和`private`这几个Java访问权限修饰词在使用时，是置于类中每个成员（方法或者域）的定义之前

#### 4.2.1包访问权限

包访问权限即默认访问权限，没有任何关键词，表示当前包中的所有其他类对那个成员都有访问权限，但对于包之外的所有类，这个成员是`private`的，无法访问

#### 4.2.2public：接口访问权限

`public`声明的成员人人可用

#### 4.2.3private：你无法访问

`private`声明的成员，仅包含该成员的类本身可用访问，其他一律无法访问

任何可以用于辅助该类的方法，都可以被指定为`private`

```java
package access;

class Sundae{
    //构造器被设为private
    private Sundae(){}
    //辅助方法，用于生成实例
    static Sundae makeASundae(){
        return new Sundae();
    }
}

public class IceCream {
    public static void main(String[] args){
        //无法访问Sundae的构造器
        //Sundae x=new Sundae();
        Sundae x=Sundae.makeASundae();
    }
}
```

#### 4.2.4protected：继承访问权限

`protected`声明的成员，会被所有继承了该类的派生类访问（即使派生类与基类不在同一个包下），同时`protected`还提供了包访问权限，一个包中的其他类也能访问到该成员

### 4.3类的访问权限

Java的访问权限修饰词也可以用于确定类的访问权限。

但有些额外限制：

- 每个编译单元都只能有一个`public`类，作为公共接口。该接口可以包含众多支持包访问权限的类。
- `public`类名称必须与编译单元的文件名相匹配
- 编译单元内有可能完全不带`public`类（都是包访问权限），这种情况下，可以随意对文件命名

注意：类既不可以是`private`，也不可以是`protected`（内部类除外）

若你不希望其他任何人对该类拥有访问权限，可以将所有的构造器指定为`private`，这样就无法创建该类对象，但是该类的`static`成员内部可以创建

```java
package access;

//Soup类也是是一种单例模式
class Soup{
    //Soup的构造器设为private，在其他类中都无法构造它的对象
    private Soup(){
    }
    //创建一个私有的静态Soup对象
    private static Soup soup=new Soup();
    //newInstance()相当于生成Soup对象的一个接口
    public static Soup newInstance(){
        //返回私有的静态Soup对象，无论调用几次该方法，生成的对象永远都是相同的
        return soup;
    }
}

public class Singleton {
    public static void main(String[] args){
        Soup s1=Soup.newInstance();
        Soup s2=Soup.newInstance();
        System.out.println(s1+"  "+s2);
    }
}/*output
access.Soup@7cd84586  access.Soup@7cd84586
*/
```

## 5.复用类

Java复用代码有两种方式：

- 组合：在新类中产生现有类的对象
- 继承：按照现有类的类型来创建新类，基于现有类的形式上添加新代码
- 代理：继承和组合的中庸之道

### 5.1组合语法

组合的使用：将对象引用置于新类中即可

```java
package reusing;

class Part{
    void create(){
        System.out.println("Create a part");
    }
}
//Composition类需要Part类的方法来实现某些功能，此时就可以采用组合
public class Composition {
    //将Part对象引用置于类中
    private Part part;
    Composition(){
        part=new Part();
    }
    void compose(){
        //复用Part类的方法代码
        part.create();
    }
    public static void main(String [] args){
        Composition composition=new Composition();
        composition.compose();
    }
}/*output
Create a part
*/
```

编译器并不是简单的为每一个引用都创建默认对象，若真这样做会增大开销。所以，如果想初始化这些引用，可以在下列位置进行：

- 定义对象的地方
- 类的构造器中
- 正要使用这些对象之前
- 使用实例初始化

### 5.2继承语法

当我们创建一个类时，除非明确指出要从其他类继承，否则就是在隐式的继承Object类

继承的语法采用关键字`extend`实现，意为派生类从基类扩展而来，派生类会自动得到基类中所有域和方法

同一个包下，派生类能访问基类的所有非`private`成员（域和方法）

非同一个包下，派生类只能访问基类的所有非`private`和包访问权限成员

关键字`super`在派生类中表示基类的对象，可以通过`super`调用基类的方法

```java
package reusing;

class Cleanser{
    private String s="Cleanser";
    public void append(String a){
        s+=a;
    }
    public void dilute(){
        append(" dilute() ");
    }
    public void apply(){
        append(" apply() ");
    }
    public void scrub(){
        append(" scrub() ");
    }
    public String toString(){
        return s;
    }
    public static void main(String... args){
        Cleanser x=new Cleanser();
        x.dilute();x.apply();x.scrub();
        System.out.println(x);
    }
}
//Detergent类继承了Cleanser类，因为在同一个包下，所以Detergent获得了Cleanser类所有非private成员
//继承复用了基类的代码
public class Detergent extends Cleanser {
    //派生类能覆盖重写基类的方法
    @Override
    public void scrub() {
        append(" Detergent.scrub() ");
        //调用基类的scrub()方法
        super.scrub();
    }
    //还可以添加基类中没有的方法
    public void foam(){
        append(" foam() ");
    }
    public static void main(String... args){
        Detergent x=new Detergent();
        x.dilute();
        x.apply();
        x.scrub();
        x.foam();
        System.out.println(x);
        System.out.println("Testing base class:");
        Cleanser.main(args);

    }
}/*output
Cleanser dilute()  apply()  Detergent.scrub()  scrub()  foam() 
Testing base class:
Cleanser dilute()  apply()  scrub() 
*/
```

#### 5.2.1初始化基类

当创建一个派生类的对象时，该对象会隐含一个基类的子对象，这个子对象与我们用基类直接创造的对象是一样的，只是这个子对象被包装子在派生类内部

当派生类的构造器被调用前，会先调用基类的构造器，若基类也是继承而来的，同理一层层向上

```java
package reusing;

class Art{
    Art(){
        System.out.println("Art Constructor");
    }
}
class Drawing extends Art{
    //Drawing类继承了Art类，所以在调用该构造器前会先调用Art类的构造器
    Drawing(){
        System.out.println("Drawing Constructor");
    }
}

public class Cartoon extends Drawing {
    //Cartoon类继承了Drawing类，所以在调用该构造器前会先调用Drawing类的构造器
    public Cartoon(){
        System.out.println("Cartoon Constructor");
    }
    public static void main(String[] args){
        Cartoon x=new Cartoon();
    }
}/*output
Art Constructor
Drawing Constructor
Cartoon Constructor
*/
```

若基类是带参数的构造器而不是默认构造器，那么必须在派生类中通过`super`关键字显式地进行调用，否则会报错

```java
package reusing;

class Game{
    Game(int i){
        System.out.println("Game constructor");
    }
}

public class Chess extends Game {
    Chess() {
        //super加参数列表，显式地调用基类的带参构造器
        super(1);
        System.out.println("Chess constructor");
    }
    public static void main(String [] args){
        Chess c=new Chess();
    }
}/*output
Game constructor
Chess constructor
*/
```

### 5.3代理

代理就像是继承和组合的糅合，因为我们将一个成域对象置于所要构造的类中（组合），但同时我们在新类中暴露了该成员对象的所有方法（继承）

```java
package reusing;

class Controls{
    void up(int velocity){

    }
    void down(int velocity){

    }
    void left(int velocity){

    }
    void right(int velocity){

    }
}

public class SpaceShip {
    //组合语法
    private Controls c=new Controls();
    //以下所有方法都传递给底层的Controls对象的相应方法处理
    //类似于继承
    public void up(int velocity){
        c.up(velocity);
    }
    public void down(int velocity){
        c.down(velocity);
    }
    public void left(int velocity){
        c.left(velocity);
    }
    public void right(int velocity){
        c.right(velocity);
    }
}
```

### 5.4结合使用组合和继承

#### 5.4.1确保正确清理

Java的垃圾回收器的调用是不确定的，而且只负责回收`new`分配的内存，如果想要清理某些资源（文件句柄，数据库连接，绘图痕迹等），则需要将清理动作放在`finally`子句中

```java
package reusing;

class Shape{
    Shape(int i){
        System.out.println("Shape Construstor");
    }
    //基类的dipose方法负责基类的清理工作，之后继承的所有派生类都会覆盖重写此方法，用于负责派生类的清理工作
    void dispose(){
        System.out.println("Shape dispose");
    }
}
class Circle extends Shape{
    Circle(int i){
        super(i); 
        System.out.println("Drawing Circle");
    }

    @Override
    void dispose() {
        System.out.println("Erasing Circle");
        super.dispose();
    }
}
class Triangle extends Shape{
    Triangle(int i){
        super(i);
        System.out.println("Drawing Triangle");
    }

    @Override
    void dispose() {
        System.out.println("Erasing Triangle");
        super.dispose();
    }
}
class Line extends Shape{
    private int start,end;
    Line(int start,int end){
        super(start);
        this.start=start;
        this.end=end;
        System.out.println("Drawing Line: "+start+","+end);
    }

    @Override
    void dispose() {
        System.out.println("Erasing Line: "+start+","+end);
        super.dispose();
    }
}


//CADSystem类结合使用了组合和继承
//继承了Shape类
public class CADSystem extends Shape{
    //组合了Circle，Triangle，Line类
    private Circle c;
    private Triangle t;
    private Line[] lines=new Line[3];
    CADSystem(int i) {
        //初始化的顺序是，基类，Line类，Circle类，Triangle类
        super(i+1);
        for (int j=0;j<3;j++){
            lines[j]=new Line(j,j*j);
        }
        c=new Circle(1);
        t=new Triangle(1);
        System.out.println("Combined Constructor");
    }

    @Override
    public void dispose() {
        //清理的顺序应该和初始化的顺序相反
        System.out.println("CADSystem.dispose()");
        //清理的顺序是，Triangle类，Circle类，Line类，基类
        t.dispose();
        c.dispose();
        //清理Line类的数组，也必须按反着索引顺序清理
        for (int j=2;j>=0;j--){
            lines[j].dispose();
        }
        super.dispose();
    }
    public static void main(String... args){
        CADSystem x=new CADSystem(47);
        //try和finally必须一同使用，try块内的代码可能会抛出错误
        try {
            //可能会抛出错误的代码
        }
        //无论try块如何退出，finally中的代码总会执行
        finally {
            x.dispose();
        }
    }
}/*output
Shape Construstor
Shape Construstor
Drawing Line: 0,0
Shape Construstor
Drawing Line: 1,1
Shape Construstor
Drawing Line: 2,4
Shape Construstor
Drawing Circle
Shape Construstor
Drawing Triangle
Combined Constructor
CADSystem.dispose()
Erasing Triangle
Shape dispose
Erasing Circle
Shape dispose
Erasing Line: 2,4
Shape dispose
Erasing Line: 1,1
Shape dispose
Erasing Line: 0,0
Shape dispose
Shape dispose
*/
```

#### 5.4.2名称屏蔽

如果Java的基类拥有某个已经被多次重载的方法名称，那么在派生类中重新定义该方法名称并不会屏蔽其在基类中的任何版本。因此，无论是在该层或者它的基类中对方法进行定义，重载机制都可以正常工作：

```java
package reusing;

class Homer{
    char doh(char c){
        System.out.println("doh(char)");
        return 'd';
    }
    float doh(float f){
        System.out.println("doh(float)");
        return 1.0f;
    }
}

class Milhouse{}

class Bart extends Homer{
    //Bart类继承了Homer类，并且添加了新的重载方法
    //原本的char、float的doh()方法依旧可以使用
    void doh(Milhouse m){
        System.out.println("doh(Milhouse)");
    }
}

public class Hide {
    public static void main(String... args){
        Bart b=new Bart();
        b.doh(1);
        b.doh('x');
        b.doh(new Milhouse());
    }
}/*output
doh(float)
doh(char)
doh(Milhouse)
*/
```

### 5.5在组合与继承之间选择

- 组合：通常用于想在新类中使用现有类的功能而非它的接口。即，在新类中嵌入某个对象，让其实现所需要的功能，让新类用户看到的只是为新类所定义的接口，而非嵌入对象的接口（嵌入对象要声明为`private`）。**组合技术可以用“has-a”（有一个）来表达**
- 继承：为某个通用类开发一个特殊版本。**继承技术可以用“is-a”来表达**

### 5.6向上转型

“为新的类提供方法”并非是继承技术最重要的方面，其最重要的方面在于表达了**“新类是现有类的一种类型”**

```java
package reusing;

class Instrument{
    public void play(){}
    //tune方法接收的是Instrument类型的引用
    static void tune(Instrument i){
        i.play();
    }
}
//Wind类继承了Instrument类的同时，也变成了Instrument类的一种类型
public class Wind extends Instrument {
    public static void main(String... args){
        Wind flute=new Wind();
        //由于Wind类也是Instrument类的一种，所以可以传递给tune方法
        //此时Wind类型的引用被向上转型为Instrument类型的引用
        Instrument.tune(flute);
    }
}
```

#### 5.6.1为什么称为向上转型

在类继承图中，基类是位于最顶端，然后逐渐向下。所以，由派生类转型为基类，在类继承图上是向上移动的，所以是——向上转型

向上转型总是安全的：因为基类是派生类的子集，所以向上转型是将一个较专用类型向通用类型转换

向上转型会导致原有类接口中的方法丢失（即基类中不存在的方法）

### 5.7`final`关键字

`final`关键字通常指的是“这是无法改变的”。

`final`关键字可以用于：数据、方法和类

#### 5.7.1`final`数据

`final`数据指的是：

- 永不改变的编译期常量（在编译期编译器就可以确定的值）
  - 编译期常量可以代入任何可能用到的计算式，这样可以减少运行时负担
  - 在Java中，这类常量必须是基本数据类型，以关键字`final`修饰，并且必须在该常量定义时就得对其赋值
- 运行时被初始化的值，而你不希望它被改变
  - 讲一个对象引用声明为`final`时，表示该引用恒定不变，一旦引用被初始化指向一个对象，就无法再更改该引用指向其他对象。但是，引用指向的对象本身是可以被修改的

**一个被`static`和`final`修饰的域只占据一段不能改变的存储空间**

```java
package reusing;

import java.util.Arrays;
import java.util.Random;

class Value{
    int i;
    public Value(int i){
        this.i=i;
    }
}

public class FinalData {
    private static Random rand=new Random(47);
    private String id;
    public FinalData(String id){
        this.id=id;
    }
    //以下为编译期常量，定义时就赋值，且为基本数据类型
    private final int valueOne=9;
    private static final int VALUE_TWO=99;
    public static final int VALUE_THREE=39;
    //以下为非编译期常量
    //尽管i4和INT_5都被final修饰，但他们并非编译期常量，因为他们是在运行期调用方法随机生成的
    //非静态的final数值
    //重新创建一个对象后，i4值会变化，但是在对象中是不可变的
    private final int i4=rand.nextInt(20);
     //静态的final数值
    // INT_5在类装载时就被初始化，之后无论创建多少个对象，都不会改变INT_5的值
    static final int INT_5=rand.nextInt(20);
    private final Value v2=new Value(22);
    private static final Value VAL_3=new Value(33);
    private final int[] a={1,2,3,4,5,6};
    //变量
    private Value v1=new Value(11);
    @Override
    public String toString() {
        return id+":"+"i4="+i4+",INT_5="+INT_5;
    }
     public static void main(String...args){
        FinalData fd1=new FinalData("fd1");
        //fd1.valueOne++,会报错，编译期常量定义后即不可以更改
        fd1.v2.i++;//v2引用不能指向其他对象，但v2指向的对象自身可以改变
        fd1.v1=new Value(9);
        for (int i=0;i<fd1.a.length;i++){
            fd1.a[i]++;
        }
        //被final声明的引用初始化后不可以指向其他对象
        //fd1.v2=new Value(0);报错
        //fd1.VAL_3=new Value(1);报错
        //fd1.a=new int[3];报错
        System.out.println(fd1);
        System.out.println("Creating new FinalData");
        FinalData fd2=new FinalData("fd2");
        System.out.println(fd1);
        System.out.println(fd2);
    }
}/*output
fd1:i4=15,INT_5=18
Creating new FinalData
fd1:i4=15,INT_5=18
fd2:i4=13,INT_5=18
*/
```

- 空白`final`

  Java允许生成”空白`final`“，即声明为`final`但又未给定初值的域。空白`final`需要有构造器来为其初始化，而且只能在构造器中初始化

  空白`final`更加灵活，能根据对象不同而被赋予不同的值，却又保持恒定不变的特性

  ```java
  package reusing;
  
  class Poppet{
      private int i;
      Poppet(int ii){
          i=ii;
      }
  }
  
  public class BlankFinal {
      private final int i=0;
      private final int j;//空白final
      private final Poppet p;//空白final引用
      //空白final必须在构造器中初始化
      public BlankFinal(){
          j=1;
          p=new Poppet(1);
      }
      public BlankFinal(int x){
          j=x;
          p=new Poppet(x);
      }
      public static void main(String... args){
          new BlankFinal();
          new BlankFinal(47);
      }
  }
  ```

- `final`参数

  Java允许在参数列表中以声明的方式将参数指明为`final`，即你无法在方法内部更改参数引用所指向的对象
  
  ```java
  package reusing;
  
  class Gizmo{
      public void spin(){}
  }
  
  public class FinalArguments {
      void with(final Gizmo g){
          //final参数是对象的引用时，引用不可指向其他对象
          //g=new Gizmo();报错
      }
      void without(Gizmo g){
          g=new Gizmo();
          g.spin();
      }
      void f(final int i){
          //final参数是基本类型数据时，数值不可更改
          //i++;
      }
      int g(final int i){
          //final参数不可以修改，但可读
          return i+1;
      }
      public static void main(String...args){
          FinalArguments bf=new FinalArguments();
          bf.without(null);
          bf.with(null);
      }
  }
  ```

#### 5.7.2`final`方法

使用`final`方法的原因：锁定方法，以防止任何继承类修改它的含义

- `final`和 `private`关键字

  类中所有的`private`方法都隐式地指定为是`final`。因为无法取用`private`方法，所以自然就无法覆盖重写它（为`private`方法添加`final`修饰词是无意义的）

  覆盖重写只有在某方法是基类的接口的一部分时才会出现（即我们无法覆盖重写基类的`private`方法），即使在派生类中添加一个与基类某个`private`方法名称和参数列表相同的方法，那也只不过是生成了一个新的方法

#### 5.7.3`final`类

`final`类表明了该类无法被继承，即该类不会拥有任何子类

由于`final`类禁止继承，所以`final`类中的所有方法都隐式的指定为`final`

```java
package reusing;

final class Dinosaur{}
//final类无法被继承
//class further extends Dinosaur{}
public class Jurassic {}
```

### 5.8初始化及类的加载

类的代码在初次使用时才加载，即加载发生于创建类的第一个对象之时，访问static域或方法时，也会发生类加载

#### 5.8.1继承与初始化

通过Beetle类来了解包括继承在内的初始化过程：

1. 在Beetle上运行Java，第一件事就是访问静态的Beetle.main方法，触发了类加载，于是加载器开始启动并找出Beetle.class。在此过程中，编译器发现Beetle类还有一个基类（由关键词extends得知），于是将基类也加载，若基类也是继承而来，那么基类的基类都会被加载，以此类推
2. 根基类执行静态初始化动作，而后是下一个派生类，以此类推
3. 至此，所有类都被加载完毕。当调用`new Beetle()`来创建一个对象时，从根基类开始，类中所有的基本类型的数据成员被设为默认值，对象引用的数据成员被设为`null`（自动初始化），然后执行字段定义处的初始化（实例初始化），调用根基类的构造器，而后依次向下，最后是当前类的自动初始化，实例初始化，和构造器调用

```java
package reusing;

class Insect{
    private int i=9;
    protected int j;
    Insect(){
        System.out.println("i="+i+",j="+j);
        j=39;
    }
    private static int x1=printInit("static Insect.x1 initialized");
    static int printInit(String s){
        System.out.println(s);
        return 47;
    }
}
public class Beetle extends Insect {
    private int k=printInit("Beetle.k initialized");
    public Beetle(){
        System.out.println("k="+k);
        System.out.println("j="+j);
    }
    private static int x2=printInit("static Beetle.x2 initialized");
    public static void main(String...args){
        System.out.println("Beetle constructor");
        Beetle b=new Beetle();
    }
}/*output
static Insect.x1 initialized
static Beetle.x2 initialized
Beetle constructor
i=9,j=0
Beetle.k initialized
k=47
j=39
*/
```

## 6.多态

多态消除了类型之间的耦合关系，不仅能改善代码的组织结构和可读性，还能创建可扩展的程序。

多态方法调用允许一种类型表现出与其他相似类型之间的区别，只要它们都是从同一基类导出而来

### 6.1再论向上转型

对象既可以作为它本身的类型使用，也可以作为它的基本类型使用——向上转型

```java
package polymorphism;

enum Note{
    MIDDLE_C,CSHARP,B_FLAT
}

class Instrument{
    public void play(Note n){
        System.out.println("Instrument.play()");
    }
}

class  Wind extends Instrument{
    @Override
    public void play(Note n) {
        System.out.println("Wind.play()"+n);
    }
}

class Brass extends Instrument{
    @Override
    public void play(Note n) {
        System.out.println("Brass.play()"+n);
    }
}

public class Music {
    //tune()方法接收的是一个Instrument引用
    //Instrunment的派生类向上转型后也会传递进来
    public static void tune(Instrument i){
        i.play(Note.MIDDLE_C);
    }
    public static void main(String... args){
        Wind flute=new Wind();
        Brass frenchHorn=new Brass();
        tune(flute);//向上转型
        tune(frenchHorn);//向上转型
    }
}/*output
Wind.play()MIDDLE_C
Brass.play()MIDDLE_C
*/
```

### 6.2转机

```java
public static void tune(Instrument i){
        i.play(Note.MIDDLE_C);
}
```

上述例子中的`tune()`方法接收的是一个`Instrument`引用，那么编译器是如何得知这个`Instrument`引用指向的是`Wind`对象还是`Brass`对象，并正确调用他们`play()`方法呢？这就涉及到“绑定”了

#### 6.2.1方法调用绑定

绑定：将一个方法调用同一个方法主体关联起来

绑定分为两种：

- 前期绑定：在程序执行前进行绑定。在Java中`static`方法和`final`方法（`private`方法也属于`final`方法）采用前期绑定
- 后期绑定：在运行时根据对象的类型进行绑定。后期绑定也叫动态绑定或运行时绑定。在Java中除了`static`方法和`final`方法（`private`方法也属于`final`方法）外，其他所有方法都采用动态绑定。

在后期绑定中，Java一定具有某种机制，能在运行时判断对象的类型，从而调用恰当的方法。所以，编译器其实并不知道对象的类型，而是方法调用机制找到正确的方法体，并调用。不管怎样，后期绑定机制的实现都必须在对象中安置某种“类型信息”

后期绑定的过程：

- Java虚拟机提取对象的实际类型的方法表
- 虚拟机搜索匹配的方法签名
- 调用该方法

#### 6.2.2产生正确的行为

Java中所有能实现多态的方法都是依托动态绑定机制和方法的覆盖重写

通过多态，我们总能获得一个通用的基类引用，并且能正确调用该引用指向的实际类型的方法

```java
package polymorphism;

class Circle extends Shape{
    @Override
    public void draw() {
        System.out.println("Drawing a circle");
    }

    @Override
    public void erase() {
        System.out.println("Erasing a circle");
    }
}

class Square extends Shape{
    @Override
    public void draw() {
        System.out.println("Drawing a square");
    }

    @Override
    public void erase() {
        System.out.println("Erasing a square");
    }
}

public class Shape {
    //在派生类重写这两个方法，产生两种不同的形态（多态）
    public void draw(){}
    public void erase(){}
    public static void main(String...args){
        //向上转型
        Shape c=new Circle();
        //向上转型
        Shape s=new Square();
        //虽然是基类引用调用了draw和erase方法，但是由于后期绑定（多态），还是正确调用了派生类中的方法
        c.draw();
        c.erase();
        s.draw();
        s.erase();
    }
}/*output
Drawing a circle
Erasing a circle
Drawing a square
Erasing a square
*/
```

#### 6.2.3缺陷：“覆盖”私有方法

通过多态，我们可以覆盖重写基类中的方法，但无法覆盖基类的`private`方法，其也不能被重载，即使在派生类中添加一个与基类某个`private`方法名称和参数列表相同的方法，那也只不过是生成了一个新的方法

#### 6.2.4缺陷：域与静态方法

在类中并非所有事物都可以多态地发生，只有普通的方法调用可以是多态的。域与静态方法是无法多态地发生

```java
package polymorphism;

class Super{
    public int field=0;
    public int getField(){
        return field;
    }
    static void staticMethod(){
        System.out.println("super.staticMethod()");
    }
}

class Sub extends Super{
    public int field=1;
    @Override
    public int getField() {
        return field;
    }

    static void staticMethod(){
        System.out.println("sub.staticMethod");
    }
}

public class FieldAccess {
    public static void main(String... args){
        //向上转型
        Super s=new Sub();
        //由于域是不可以多态的，所以s.field表示的就是基类的field域
        //要想获得派生类的域，就必须将派生类的域放到方法中返回，因为方法可以派生
        //比如s.getField()就正确获得派生类的field域
        System.out.println("s.field="+s.field+",s.getField()="+s.getField());
        //静态方法是与类相关联，而非单个对象，所以不具有多态性
        //所以此处调用的是父类的静态方法
        s.staticMethod();
    }
}/*output
s.field=0,s.getField()=1
super.staticMethod()
*/
```

### 6.3构造器和多态

#### 6.3.1构造器内部的多态方法和的行为

如果在一个构造器内部调用正在构造对象的某个动态绑定方法，就有可能会用到那个方法被覆盖后的定义，会产生难以预料的后果

```java
package polymorphism;

class Glyph{
    void draw(){
        System.out.println("Glyph.draw()");
    }
    Glyph(){
        System.out.println("Glyph() before draw()");
        draw();
        System.out.println("Glyph() after draw()");
    }
}
class RoundGlyph extends Glyph{
    private int radius=1;
    //在派生类构造器调用前首先调用基类构造器
    //而基类构造器中调用了draw()方法
    //派生类重写覆盖了draw()方法,由于draw()方法是动态绑定的，这些动作都发生在派生类的构造器中
    //所以基类构造器调用了派生类的draw()方法，而此时派生类的初始化还没开始，但所有成员已经自动初始化了
    //所以输出的radius为0
    RoundGlyph(int r){
        System.out.println("RoundGlyph.RoundGlyph(),radius="+radius);
    }
    void draw(){
        System.out.println("RoundGlyph.RoundGlyph(),radius="+radius);
    }
}

public class PolyConstructors {
    public static void main(String...args){
        new RoundGlyph(5);
    }
}/*output
Glyph() before draw()
RoundGlyph.RoundGlyph(),radius=0
Glyph() after draw()
RoundGlyph.RoundGlyph(),radius=1
*/
```

### 6.4协变返回类型

协变返回类型：在派生类中被覆盖的方法可以返回基类方法的返回类型的某种派生类型

```java
package polymorphism;

class Grain{
    @Override
    public String toString() {
        return "Grain";
    }
}
class Wheat extends Grain{
    @Override
    public String toString() {
        return "Wheat";
    }
}
class Mill{
    //返回的是Grain类型
    Grain process(){
        return new Grain();
    }
}
//WheatMill类继承了Mill类
class WheatMill extends Mill{
    //重写基类的process方法，但返回类型是基类方法的返回类型的派生类型
     @Override
    Wheat process() {
        //协变返回类型
        return new Wheat();
    }
}

public class CovariantReturn {
    public static void main(String... args){
        Mill m=new Mill();
        Grain g=m.process();
        System.out.println(g);
        m=new WheatMill();
        g=m.process();
        System.out.println(g);
    }
}/*output
Grain
Wheat
*/
```

### 6.5用继承进行设计

使用继承设计新类，会强制我们的程序设计进入继承的层次结构中，往往更加麻烦；更好的方式是首先选择“组合”，尤其是不确定使用那种方式设计新类，组合相比继承更加灵活，因为它可以动态选择类型（因此也就选择了行为）；相反，继承在编译时就需要知道确切类型

组合可以在运行期间选择不同的对象绑定，而继承无法在运行期间决定继承不同的对象

**“用继承表达行为间的差异，并用字段表达状态上的变化”**

```java
package polymorphism;

class Actor{
    public void act(){}
}
class HappyActor extends Actor{
    @Override
    public void act() {
        System.out.println("HappyActor");
    }
}
class SadActor extends Actor{
    @Override
    public void act() {
        System.out.println("SadActor");
    }
}
//Stage类的设计采用了设计模式中的状态模式
class Stage{
    //组合技术，引入了Actor对象的引用
    //Actor对象的引用首先被初始化为HappyActor对象
    private Actor actor=new HappyActor();
    public void change(){
        //运行期间，组合技术非常的有灵活性，可以选择不同的对象绑定
        //在change方法被调用后，又与另一个对象SadActor对象绑定，从而产生不同的行为
        actor=new SadActor();
    }
    public void performPlay(){
        actor.act();
    }
}

public class Transmogrify {
    public static void main(String... args){
        Stage stage=new Stage();
        //此时还是HappyActor对象的行为
        stage.performPlay();
        //change方法调用后，就切换为SadActor对象
        stage.change();
        //此时对象的行为改变，变为SadActor对象的行为
        stage.performPlay();
    }
}/*output
HappyActor
SadActor
*/
```

#### 6.5.1向下转型与运行时类型识别

向下转型，即将基类转型为派生类。相较于向上转型，向下转型是不安全的，需要显式地强制类型转换，因为基类接口小于派生类的接口。例如，我们无法知道一个“几何形状”它确实就是一个“圆”，它可以是一个三角形、正方形等其他类型

在Java中，所有转型都会得到检查，所以能保证向下转型的安全性。在运行期，Java的RTTI（运行时类型识别）机制，会确保转换后的类型是我们希望的那种类型，如果不是，就会抛出一个`ClassCastException`（类转换异常）

```java
package polymorphism;

class Useful{
    public void f(){}
    public void g(){}
}
class MoreUseful extends Useful{
    @Override
    public void f() {}
    @Override
    public void g() {}
    public void u(){}
}

public class RTTI {
    public static void main(String...args){
        //基类数组引用
        Useful[] x={
                new Useful(),
            	//派生类对象向上转型
                new MoreUseful()
        };
        x[0].f();
        x[1].g();
        //向上转型后，接口变窄了，不再具有基类没有的方法
        //要调用方法u，必须向下转型
        //x[1].u();报错
        //向下转型，RTTI会对该转型进行检查，因为在向上转型之前该类型就是MoreUseful，所以不会抛出错误
        ((MoreUseful)x[1]).u();
        //RTTI会对该转型进行检查，x[0]本就是基类类型，所以会抛出错误
        //((MoreUseful)x[0]).u();
    }
}
```

## 7.接口

接口和内部类为我们提供了一种将接口与实现分离的更加结构化的方法

### 7.1抽象类和抽象方法

- 抽象方法，是一种仅有声明而没有方法体的方法，用关键词`abstract`修饰

  语法：`abstract void f();`

- 抽象类，即包含一个或多个抽象方法的类，该类必须被关键词`abstract`修饰；

  我们无法为抽象类创建对象，因为抽象类的抽象方法是不完整的

  如果一个类继承了某个抽象类，并且要为该类创建对象，那么就必须为基类中所有的抽象方法提供方法定义，否则该类便也是抽象类，编译器会强制我们用`abstract`关键词来限定这个类

  我们也可以创建一个不包含任何抽象方法的抽象类，只需要用关键词`abstract`来限定该类即可（目的为阻止产生该类的任何对象）

```java
package interfaces;


enum Note{
    MIDDLE_C,CSHARP,B_FLAT
}
//抽象基类
abstract class Instrument{
    private int i;
    //抽象方法，仅提供声明，不提供方法体
    public abstract void play(Note n);
    public String what(){
        return "Instrument";
    }
    //抽象方法
    public abstract void adjust();
}

class Wind extends  Instrument{
	//派生类重写并实现了基类中的抽象方法，就不再是抽象类
    @Override
    public void play(Note n) {
        System.out.println("Wind.play()"+n);
    }

    public String what(){
        return "Wind";
    }

    @Override
    public void adjust() {}
}

class Brass extends Wind{
    @Override
    public void play(Note n){
        System.out.println("Brass.play()"+n);
    }

    @Override
    public void adjust() {
        System.out.println("Brass.adjust()");
    }
}

public class Music {
    static void tune(Instrument i){
        i.play(Note.MIDDLE_C);
    }
    static void tuneAll(Instrument[] e){
        for (Instrument i:e) {
            tune(i);
        }
    }
    public static void main(String...args){
        //向上转型
        Instrument[] orchestra={
                new Wind(),
                new Brass()
        };
        tuneAll(orchestra);

    }
}/*output
Wind.play()MIDDLE_C
Brass.play()MIDDLE_C
*/
```

### 7.2接口

关键字`interface`修饰的类被称作接口，与`abstract`关键词修饰的抽象类（既可以含有抽象方法，也可以含有普通方法实现）相比，接口是一个完全抽象类，即接口内部的所有方法仅提供方法声明，不提供任何具体实现（实质上，所有方法都必须是抽象方法，只是接口内部的方法不需要用`abstract`关键词修饰）

接口还允许那些实现了接口的类被向上转型，来实现类似多重继承的特性

创建一个接口，需要用`interface`关键词代替`class`关键词，像类一样，可以咋`interface`关键字前添加`public`（仅限于该接口在与其同名的文件中被定义）。不添加public，则它只具有包访问权限。

接口也可以包含域，只是这些域隐式地是`static`和`final`的

接口中的声明的方法必须是`public`，即使不显式地声明为`public`，它们也是`public`的

要让一个类遵循某个特定接口（或者一组接口），需要使用`implements`关键词，实现了接口的类会被强制实现接口所有的方法并且这些方法都必须是`public`

```java
package interfaces;

interface Instrument2{
    //接口中的域，隐式的声明为static和final，所以VALUE是编译器常量
    int VALUE=5;
    //接口中的方法仅提供声明，不提供具体实现
    void play(Note n);
    void adjust();
}
//实现接口的类，需要为接口中的方法提供方法体
class Wind2 implements Instrument2{

    //实现的接口方法也必须是public声明
    @Override
    public void play(Note n) {
        System.out.println(this+".play()"+n);
    }

    @Override
    public String toString() {
        return "Wind";
    }

    @Override
    public void adjust() {
        System.out.println(this+".adjust()");
    }
}

public class Music2 {
    //tune方法接收的是一个接口类型的引用
    static void tune(Instrument2 i){
        i.play(Note.MIDDLE_C);
        i.adjust();
    }
    public static void main(String... args){
        //接口允许实现了该接口的类向上转型
        tune(new Wind2());
    }
}/*output
Wind.play()MIDDLE_C
Wind.adjust()
*/
```

### 7.3完全解耦

若一个方法接收的参数是一个类，那么该方法就只能应用于该类及其子类，无法应用于不在此继承结构中的某个类；但如果该方法接收是一个接口，那么这个方法可以应用于所有实现了该接口的类，这在很大程度上将方法和类解耦合

```java
package interfaces;

class Processor{
    Object process(Object input){
        return input;
    }
}
interface InterfaceProcessor{
    Object process(Object input);
}
class Upcase extends Processor{
    //协变返回类型
    @Override
    String  process(Object input){
        return ((String)input).toUpperCase();
    }

}
//Downcase类没继承Processor类，但他与Processor类具有相同的接口元素
//Downcase类实现了InterfaceProcessor接口
class Downcase implements InterfaceProcessor{
    //协变返回类型
    //实现的接口方法也必须是public声明
    public String process(Object input){
        return ((String)input).toLowerCase();
    }
}

public class Decouple {
    //该process方法参数接收是一个类，该方法会与Processor类耦合过紧，仅能应用于Processor类及其子类。该方法无法应用于Downcase类，因为Downcase类没有继承Processor类
    static void process(Processor p,Object s){
        System.out.println(p.process(s));
    }
	//该process方法参数接收是一个接口，该方法能应用于所有实现了InterfaceProcessor接口的类
    static void process(InterfaceProcessor ip,Object s){
        System.out.println(ip.process(s));
    }
    public static void main(String... args){
        process(new Upcase(),"upcase");
        process(new Downcase(),"DOWNCASE");
    }
}/*output
UPCASE
downcase
*/
```

### 7.4Java中的多重继承

在Java中不允许多重继承，一个类仅允许通过`extends`关键字继承一个类；

接口不仅仅只是一种更纯粹形式的抽象类，接口还能可以使Java实现多重继承的变种：在Java中，一个类允许实现多个接口，所有的接口名都置于`implements`关键字后，用逗号将它们一 一隔开，并且该类能被向上转型为这些接口中的任意一个

```java
package interfaces;


interface CanFight{
    void fight();
}
interface CanSwim{
    void swim();
}
interface CanFly{
    void fly();
}
class ActionCharacter{
    public void fight(){}
}
//一个类既有继承，又有接口的实现，应先写继承再写实现的接口
class Hero extends ActionCharacter implements CanFight,CanSwim,CanFly{

    @Override
    public void swim() {}

    @Override
    public void fly() {}
}

public class Adventure {
    public static void t(CanFight x){
        x.fight();
    }
    public static void u(CanSwim x){
        x.swim();
    }
    public static void v(CanFly x){
        x.fly();
    }
    public static void w(ActionCharacter x){
        x.fight();
    }
    public static void main(String...args){
        Hero h=new Hero();
        //Hero对象被依次向上转型为每一个接口，传入以下方法中
        t(h);
        u(h);
        v(h);
        w(h);
    }
}
```

### 7.5通过继承来扩展接口

接口也可以被继承，通过继承，可以很容易地在接口中添加新的方法声明，还可以在新接口中组合数个接口

```java
package interfaces;

interface Monster{
    void menace();
}
//DangerousMonster接口继承了Monster接口的同时也获得了Monster接口的方法声明，并添加了新的方法声明
interface DangerousMonster extends Monster{
    void destroy();
}
interface Lethal{
    void kill();
}
class DragonZilla implements DangerousMonster{

    @Override
    public void menace() {}

    @Override
    public void destroy() {}
}
//由于接口只有方法声明，没有具体实现，所以接口允许多重继承
//Vampire接口同时获得了DangerousMonster和Lethal接口的方法声明
interface Vampire extends DangerousMonster,Lethal{
    void drinkBlood();
}
class VeryBadVampire implements Vampire{

    @Override
    public void menace() {}

    @Override
    public void destroy() {}

    @Override
    public void kill() {}

    @Override
    public void drinkBlood() {}
}

public class HorrorShow {
    static void u(Monster b){
        b.menace();
    }
    static void v(DangerousMonster d){
        d.menace();
        d.destroy();
    }
    static void w(Lethal l){
        l.kill();
    }
    public static void main(String... args){
        DangerousMonster barney=new DragonZilla();
        //继承后的接口也可以向上转型为基接口
        //DangerousMonster->Monster
        u(barney);
        v(barney);
        Vampire vlad=new VeryBadVampire();
        u(vlad);
        v(vlad);
        w(vlad);
    }
}
```

#### 7.5.1组合接口时的冲突

在实现多重继承时，可能会存在两个方法名称和参数列表相同，但返回类型不同，此时就会报错

```java
package interfaces;

interface I1{
    void f();
}
interface I2{
    int f(int i);
}
interface I3{
    int f();
}
class C{
    public int f(){
        return 1;
    }
}
class C2 implements I1,I2{
	//C2实现了I1,I2接口，实现了void f()方法和int f(int i)方法
    //这两个方法重载了
    @Override
    public void f() {

    }
    @Override
    public int f(int i) {
        return 1;
    }
}
class C3 extends C implements  I2{
    //C3继承了C，拥有了int f()方法，实现了I2接口，实现了int f(int i)方法
    //这两个方法重载了
    @Override
    public int f(int i) {
        return 1;
    }
}
class C4 extends C implements I3{
    //C4继承了C，拥有了int f()方法，自动实现了I3接口中的方法
    //即使不覆盖重写方法f，也不会报错
    public int f(){
        return 1;
    }
}
//类C5和接口I4获得的方法仅返回类型不同，方法名称和参数列表都相同，无法区分重载，所以会报错
//class C5 extends C implements I1{}
//interface I4 extends I1,I3{}
```

### 7.6适配接口

接口最吸引人的原因之一就是允许同一个接口具有多个不同的具体实现。

一种常见用法就是策略设计模式：设计一个方法，该方法参数将接收一个指定的接口，可以用任何对象来调用该方法，只要该对象所在的类实现了指定接口；方法会根据传入的对象不同，产生不同的行为

Java中的Scanner类的构造器接收的就是一个Readable接口，该接口是单独为Scanner创建的，以使得Scanner不必将其参数限制为某个特定类如果你想让Scanner作用于一个新类，只需要新类实现Readable接口

```java
package interfaces;

import java.io.IOException;
import java.nio.CharBuffer;
import java.util.Random;
import java.util.Scanner;

class RandomDoubles{
    private static Random rand=new Random(47);
    public double next(){
        return rand.nextDouble();
    }
}
//采用伪多重继承机制，使得AdaptedRandomDoubles变成一个既是RandomDoubles又是Readable的新类
public class AdaptedRandomDoubles extends RandomDoubles implements Readable {
    private int count;
    public AdaptedRandomDoubles(int count) {
        this.count = count;
    }
    //实现Readable接口需要实现其read方法
    @Override
    public int read(CharBuffer charBuffer) throws IOException {
        if(count--==0)
            return -1;
        String result= next() +" ";
        charBuffer.append(result);
        return result.length();
    }
    public static void main(String... args){
        //Scanner类的构造器就是一个适配器模式，只要让方法接收接口类型，任何类都可以对该方法进行适配
        Scanner s=new Scanner(new AdaptedRandomDoubles(7));
        while (s.hasNextDouble())
            System.out.print(s.nextDouble()+" ");
    }
}/*output
0.7271157860730044 0.5309454508634242 0.16020656493302599 0.18847866977771732 0.5166020801268457 0.2678662084200585 0.2613610344283964 
*/
```

### 7.7接口中的域

接口中的域都自动是`static`和`final`的，所以接口就成为了一种便捷的用来创建常量组的工具

#### 7.7.1初始化接口中的域

接口中定义的域不能是“空final”，但是可以被非常量表达式初始化

```java
package interfaces;

import java.util.Random;

public interface RandVals {
    Random RAND=new Random(47);
    int RANDOM_INT=RAND.nextInt(10);
}
```

接口中的域是`static`的，所以在接口第一次被加载时初始化，这发生在任何域首次访问时，但是这些域并不是接口的一部分，它们的值被存储在该接口的静态存储区域内

### 7.8嵌套接口

接口可以嵌套在类或其他接口中，当实现某个接口时，并不需要实现嵌套在其内部的任何借口

### 7.9接口与工厂

接口是实现多重继承的途径，而生成实现某个接口的对象的典型方式就是工厂设计模式，与直接调用构造器不同，我们在工厂对象上调用的是创建方法，而该工厂对象将生成接口的某个实现的对象。通过个工厂设计模式，我们的代码将完全与接口的实现分离

```java
package interfaces;

interface Service{
    void method1();
    void method2();
}
//产生实现Service接口的对象的工厂接口
interface ServiceFacory{
    Service getService();
}
class Implementation1 implements Service{
    Implementation1(){}
    @Override
    public void method1() {
        System.out.println("Implementation1 method1");
    }

    @Override
    public void method2() {
        System.out.println("Implementation1 method2");
    }
}
//实现了工厂接口
class Implementation1Factory implements ServiceFacory{
    //方法getService用于生成一个Service对象
    @Override
    public Service getService() {
        return new Implementation1();
    }
}

public class Factories {
    public static void serviceConsumer(ServiceFacory fact){
        //此处直接调用工厂的方法生成实现Service接口的对象
        //将创建实现Service接口的对象的代码和当前代码分离了
        //若不通过工厂创建，则在此处需要指定将要创建的Service的确切类型
        Service s=fact.getService();
        s.method1();
        s.method2();
    }
    public static void main(String...args){
        serviceConsumer(new Implementation1Factory());
    }
}/*output
Implementation1 method1
Implementation1 method2
*/
```

## 8.内部类

内部类，即可以将一个类的定义放在另一个类的定义内部。内部类能与外围类通信

### 8.1创建内部类

```java
package innerclasses;

public class Parccel1 {
    //内部类Contents
    class Contents {
        private int i = 11;
        public int value() {
            return i;
        }
    }
    //内部类Destination
    class Destination{
        private String label;
        Destination(String whereTo){
                label=whereTo;
        }
        String readLabel(){
            return label;
        }
    }
    //to方法用于返回内部类Destination对象
    public Destination to(String s){
        return new Destination(s);
    }
    //contents方法用于返回内部类Contents对象
    public Contents contents(){
        return new Contents();
    }
    public void ship(String dest){
        //在外部类的非静态方法中创建内部类的对象，与创建普通类的对象无差
        Contents c=contents();
        Destination d=to(dest);
        System.out.println(d.readLabel());
    }
    public static void main(String... args){
        Parccel1 p=new Parccel1();
        p.ship("Tasmania");
        Parccel1 q=new Parccel1();
        //在外部类的静态方法及外部创建内部类的对象，必须使用OuterClassName.InnerClassName的形式
        Parccel1.Contents c=q.contents();
        Parccel1.Destination d=q.to("Borneo");
    }
}/*output
Tasmania
*/
```

### 8.2链接到外部类

当生成一个内部类的对象时，此对象与制造它的外围对象之间就有了一种联系，所以内部类对象能访问外围对象的所有成员。此外，内部类还拥有其外围类的所有元素的访问权

```java
package innerclasses;

interface Selector{
    boolean end();
    Object current();
    void next();
}
//采用了迭代器的设计模式
public class Sequence {
    //外围类的私有成员items是一个Object类型的数组
    private Object[] items;
    private int next=0;
    public Sequence(int size){
        items=new Object[size];
    }
    public void add(Object x){
        if(next<items.length){
            items[next++]=x;
        }
    }
    //私有内部类SequenceSelector实现了Selector接口
    private class SequenceSelector implements Selector{
        private int i=0;
        //内部类能访问外围类的所有方法和字段
        //该私有内部类的方法都用到了外围类的私有成员：Object类型的数组
        @Override
        public boolean end() {
            return i==items.length;
        }

        @Override
        public Object current() {
            return items[i];
        }

        @Override
        public void next() {
            if(i<items.length){
                i++;
            }
        }
    }
    public Selector selector(){
        return new SequenceSelector();
    }
    public static void main(String ... args){
        Sequence sequence=new Sequence(10);
        for(int i=0;i<10;i++){
            sequence.add(Integer.toString(i));
        }
        Selector selector=sequence.selector();
        while (!selector.end()){
            System.out.print(selector.current()+" ");
            selector.next();
        }
    }
}/*output
0 1 2 3 4 5 6 7 8 9 
*/
```

内部类自动会拥有对其外围类所有成员（域和方法）的访问权：当某个外围类的对象创建了一个内部类对象时，此内部类对象必定会秘密捕获一个指向那个外围类对象的引用。在内部类访问外围类的成员时，就是用那个引用来选择外围类的成员

### 8.3使用`.this`与`.new`

- 如果你需要在内部类中生成对外围类对象的引用，可以使用：`外围类的名字.this`这种形式，这样产生的引用自动具有正确类型，因为其在编译期就被知晓并受到检查

  ```java
  package innerclasses;
  
  public class DotThis {
      void f(){
          System.out.println("DotThis.f()");
      }
      public class Inner{
          public DotThis outer(){
              //外围类名字.this表示当前外围类对象的引用
              //DotThis.this表示当前DotThis对象的引用
              return DotThis.this;
          }
      }
      public Inner inner(){
          return new Inner();
      }
      public static void main(String...args){
          DotThis dt=new DotThis();
          DotThis.Inner dti=dt.inner();
          dti.outer().f();
      }
  }/*output
  DotThis.f()
  */
  ```

- 如果你需要让外围类对象去创建其某个内部类对象，可以使用：`外围类对象的引用.new 内部类构造器`的形式

  ```java
  package innerclasses;
  
  public class DotNew {
      public class Inner{}
      public static void main(String... args){
          DotNew dn=new DotNew();
          //只能用外部类对象的引用去创建内部类对象
          //dn.new Inner()创建了一个DotNew的内部类Inner对象
          DotNew.Inner dni=dn.new Inner();
      }
  }
  ```

- 在拥有外部类对象之前是不可能创建内部类对象的，这是因为内部类对象会暗暗地连接到到创建它的外部类地对象。但是，如果你创建的是嵌套类（静态内部类），就不需要外部类对象的引用

### 8.4内部类与向上转型

当一个`private`内部类向上转型为其基类，尤其是转型为一个接口的时候，该内部类接口的实现或基类的继承是完全不可见，但我们能在外围类中创建`public`方法获得`private`内部类向上转型后的基类或接口的引用。`private`内部类能很好的帮我们隐藏实现细节

```java
package innerclasses;

//Contents接口
interface Contents{
    int value();
}

class Parcel2{
    //私有内部类实现了Contents接口，该内部类对外界完全不可见，隐藏了实现细节
    private class PContents implements Contents{
        private int i=11;

        @Override
        public int value() {
            return i;
        }
    }
    //外围类构建一个公共接口，提供私有内部类向上转型后的接口或基类引用
    public Contents contents(){
        return new PContents();
    }
}

public class TestParcel {
    public static void main(String... args){
        Parcel2 p=new Parcel2();
        Contents c=p.contents();
        //内部类为private，类名是不能访问的，无法通过以下方式创建
        //Parcel2.PContents pc=p.new PContents();报错
        System.out.println(c.value());
    }
}/*output
11
*/
```

### 8.5在方法和作用域内的内部类

我们可以在一个方法里面或者在任意的作用域内定义内部类，这么做有两个原因：

1、该内部类用于实现某类型的接口，于是可以创建并返回其接口的引用

2、解决一个复杂问题，需要创建一个类来辅助，同时又不希望这个类是公共可用的

- 在方法的作用域内创建一个内部类（局部内部类）

  方法作用域内的内部类是属于方法的一部分，而不是类的一部分。在方法作用域之外是不能访问该内部类的，即使方法调用结束后，该内部类依旧有效（与别的类一起编译过了）。所以局部内部类能很好的隐藏实现细节

  ```java
  package innerclasses;
  
  //Contents接口
  interface Contents{
      int value();
  }
  
  public class Parcel3 {
      public Contents contents(){
          //该局部内部类在方法之外完全不可见
          class PContents implements Contents{
              int i=11;
              @Override
              public int value() {
                  return i;
              }
          }
          //该方法返回一个局部内部类对象向上转型后的接口引用
          return new PContents();
      }
      public static void main(String... args){
          Parcel3 p=new Parcel3();
          Contents c=p.contents();
      }
  }
  ```

- 在其他作用域内创建一个内部类

  ```java
  package innerclasses;
  
  public class Parcel4 {
      private void internalTracking(boolean b){
          if(b){
              //在if作用域内创建一个内部类，并不是说明该类的创建是有条件的，它其实与其他类一起编译过了
              class TrackingSlip{
                  private String id;
                  TrackingSlip(String s){
                      id=s;
                  }
                  String getSlip(){
                      return id;
                  }
              }
              TrackingSlip ts=new TrackingSlip("slip");
              String s=ts.getSlip();
          }
          //在if作用域之外，该内部类是不可用的
          //TrackingSlip ts=new TrackingSlip("x");
      }
      public void track(){
          internalTracking(true);
      }
      public static void main(String...args){
          Parcel4 p=new Parcel4();
          p.track();
      }
  }
  ```

### 8.6匿名内部类

匿名内部类，即没有名字的内部类。匿名内部类将内部类对象的创建与类的定义结合在一起

语法：`new Contents(){类的定义}`表示创建一个继承或实现Contents的匿名类对象，通过`new`表达式返回的引用被自动向上转型为对Contents的引用

```java
package innerclasses;

//Contents接口
interface Contents{
    int value();
}

public class Parcel5 {
    public Contents contents(){
        //匿名内部类
        //将内部类对象的创建与定义结合在一起，此匿名内部类实现了Contents接口
        //返回的引用会自动向上转型为Contents接口引用
        return new Contents() {
            private int i=11;
            @Override
            public int value() {
                return i;
            }
        };
    }
    public static void main(String... args){
        Parcel5 p=new Parcel5();
        Contents c=p.contents();
    }
}
```

匿名内部类语法是下述例子的简化形式：

```java
package innerclasses;

public class Parcel5b {
    //上述匿名内部类就是内部类+方法contents的简化形式
    class MyContents implements Contents{
        int i=11;
        @Override
        public int value() {
            return 0;
        }
    }
    public Contents contents(){
        return new MyContents();
    }
}
```

创建一个匿名构造类的对象，其基类是带参构造器，只需要简单的将参数传递进去，比如`new Wrapping(x){类的定义}`

```java
package innerclasses;

class Wrapping{
    private int i;
    Wrapping(int x){
        i=x;
    }
    public int value(){
        return i;
    }
}

public class Parcel6 {
    public Wrapping wrapping(int x){
        //该匿名内部类继承了Wrapping类，参数x直接放入括号中就会传递给基类构造器
        //返回的引用会自动向上转型为Wrapping基类引用
        return new Wrapping(x){
            public int value(){
                return super.value()*47;
            }
        };
    }
}
```

在匿名内部类中定义字段时，还可以对其执行初始化操作。如果在匿名内部类中使用外部传来的参数，那么该参数必须被限定为`final`；若该参数只是传递给匿名类的基类构造器，则不需要被限定为`final`，因为它并不会在匿名内部类中被直接使用

```java
package innerclasses;

interface Destination{
    String readLabel();
}

public class Parcle7 {
    public Destination destination(final String dest){
        return new Destination() {
            //参数dest在匿名内部类中使用，需要设定为final
            //匿名内部类的成员label在定义处被初始化
            private String label=dest;
            @Override
            public String readLabel() {
                return label;
            }
        };
    }
    public static void main(String[] args){
        Parcle7 p=new Parcle7();
        Destination d=p.destination("Tasmania");
    }
}
```

如果想在匿名内部类中做一些类似构造器的行为，就必须通过实例块来进行实例初始化，因为匿名内部类不可能有命名构造器（因为没有名字）

缺陷：实例块是不能像构造器那样重载，你只能拥有一个这样的构造器

```java
package innerclasses;

abstract class Base{
    public Base(int i){
        System.out.println("Base constructor,i="+i);
    }
    public abstract void f();
}

public class AnonymousConstructor {
    public static Base getBase(int i){
        //参数是传递给基类的构造器，不是在匿名类中使用，所以不用限定为final
        return new Base(i) {
            //使用实例块，来达到在匿名类中创建一个构造器的效果
            {
                System.out.println("Inside instance initializer");
            }
            @Override
            public void f() {
                System.out.println("In anonymous f()");
            }
        };
    }
    public static void main(String... args){
        Base base=getBase(47);
        base.f();
    }
}/*output
Base constructor,i=47
Inside instance initializer
In anonymous f()
*/
```

匿名内部类与普通类相比，匿名内部类只能继承一个类或者实现一个接口，不可以二者兼备

#### 8.6.1再访工厂方法

在工厂模式中，我们没有必要为每一个类创建一个具名的工厂类，这就可以通过匿名内部类进行改进。此外，一个类通常只需要一个单一的工厂对象，该工厂对象应该设为`static`

```java
package innerclasses;

interface Service{
    void method1();
    void method2();
}

interface ServiceFactory{
    Service getService();
}

class Implementation implements Service{
    //将构造器设为private，即外部无法创建其对象
    private Implementation(){}
    @Override
    public void method1() {
        System.out.println("Implementation method1");
    }

    @Override
    public void method2() {
        System.out.println("Implementation method2");
    }
	//创建一个匿名内部类的工厂对象，并且是单一的，把它设为static
    public static ServiceFactory factory=new ServiceFactory() {
        //调用工厂对象的getService方法，即可在外部创建一个Service对象
        @Override
        public Service getService() {
            return new Implementation();
        }
    };
}

public class Factories {
    public static void serviceConsumer(ServiceFactory factory){
        Service s=factory.getService();
        s.method1();
        s.method2();
    }
    public static void main(String...args){
        serviceConsumer(Implementation.factory);
    }
}/*output
Implementation method1
Implementation method2
*/
```

### 8.7嵌套类

如果不需要内部类对象与其外围类对象之间有联系，可以将内部类声明为`static`，这通常称为嵌套类

嵌套类与内部类的区别：

- 普通内部类的对象隐式地保存了一个外围类对象的引用，所以在创建普通内部类对象前，需要先创建外围类对象；而创建嵌套类对象，并不需要外围类对象
- 普通内部类能访问外围类的所有域和方法；嵌套类只能访问外围类的静态域和静态方法
- 普通内部类不能有`static`域和方法，也不能包含嵌套类；但是嵌套类可以包含`static`域和方法，也能包含嵌套类

```java
package innerclasses;

public class Parcel8 {
    //实例成员（域和方法）
    private int i=0;
    private void method(){}
    //静态成员（域和方法）
    private static int staticI=0;
    private static void staticMethod(){}
    //嵌套类
    private static class ParcelContents implements Contents{
        //只能访问外围类的静态成员，staticI域和staticMethod方法
        private int i=staticI;
        @Override
        public int value() {
            staticMethod();
            return i;
        }
    }
    //返回嵌套类对象的引用，嵌套类对象的创建不需要依托外围类对象的创建，所以该方法设为static
    public static Contents contents(){
        return new ParcelContents();
    }
    public static void main(String...args){
        //无需创建任何外围对象，就可以创建嵌套类对象
        Contents c=contents();
    }
}
```

#### 8.7.1接口内部的类

接口中也可以创建类，放到接口中的任何类都自动是`public`和`static`的，所以接口中的类都是嵌套类。

将嵌套类置于接口的命名空间内，这并不违反接口的规则，甚至我们可以在嵌套类中实现外围接口。这样做的用处在于：你想要创建某些公共代码，使得它们可以被接口的所有不同实现所共用

```java
package innerclasses;

public interface ClassInInterface {
    void howdy();
    //嵌套类Test实现了外围类的接口
    class Test implements ClassInInterface{
        @Override
        public void howdy() {
            System.out.println("Howday!");
        }
        public static void main(String...args){
            new Test().howdy();
        }
    }
}/*output
Howday!
*/
```

#### 8.7.2从多层嵌套的内部类中访问外部类的成员

一个内部类无论被嵌套多少层，它都能透明的访问所有包裹它的外围类的所有成员

```java
package innerclasses;

class MNA{
    private void f(){}
    class A{
        private void g(){}
        //嵌套在最内层的内部类B，能访问包裹它的所有外围类的所有成员
        public class B{
            void h(){
                g();
                f();
            }
        }
    }
}

public class MultiNestingAccess {
    public static void main(String...args){
        MNA mna=new MNA();
        MNA.A mnaa=mna.new A();
        //创建最内层的内部类B的对象，必须将包裹它的所有外围类对象都创建，才能创建它
        MNA.A.B mnaab=mnaa.new B();
        mnaab.h();
    }
}
```

### 8.8为什么需要内部类

关于Java的多重继承，接口解决了部分问题，而内部类则有效地实现了多重继承

如果一个类必须要继承两个抽象的类或具体的类，那就必须用到内部类才能实现多重继承

```java
package innerclasses;

class D{}
abstract class E{}
//使用内部类实现多重继承
//类Z先继承类D
class Z extends D{
    //在创造一个方法，返回继承E类的匿名内部类对象向上转型后的E类引用
    E makeE(){
        return new E(){};
    }
}

public class MultiImplementation {
    static void takesD(D d){}
    static void takesE(E e){}
    public static void main(String... args){
        Z z=new Z();
        takesD(z);
        takesE(z.makeE());
    }
}
```

使用内部类还可以获得其他一些特性：

- 内部类可以有多个实例，每个实例都有自己的状态信息，并与其外围类对象的信息相互独立
- 在单个外围类中，可以让多个内部类以不同的方式实现同一接口，或继承同一个类
- 内部类对象的创建并不会随着外围类对象的创建而创建，只有在我们需要它的时候，手动创建它
- 内部类就是一个独立的实体

#### 8.8.1闭包与回调

闭包是一个可调用对象，它记录了一些信息，这些信息来自于创建它的作用域。由此可以知道，内部类是面向对象的闭包，因为它不仅包含外围类对象（创建内部类的作用域）的信息，还自动拥有一个指向外围类对象的引用，在此作用域内，内部类有权操作所有的成员，包括`private`成员

所谓回调，就是允许客户类通过内部类引用来调用其外部类的方法，这是一种非常灵活的功能。

```java
package innerclasses;

interface Incrementable{
    void increment();
}

class Callee1 implements Incrementable{
    private int i=0;

    @Override
    public void increment() {
        i++;
        System.out.println(i);
    }
}
class MyIncrement{
    public void increment(){
        System.out.println("Other operation");
    }
    static void f(MyIncrement mi){
        mi.increment();
    }
}
//当Callee2继承了MyIncrement类，就自动拥有了increment方法，并且此方法与Incrementable接口中的increment方法毫不相关
//如果此时Callee2还要实现Incrementable接口，那么就不得不覆盖通过继承得到的increment方法
//采用内部类，可以使得Callee2拥有两种不同的increment方法
class Callee2 extends MyIncrement{
    private int i=0;
    @Override
    public void increment() {
        super.increment();
        i++;
        System.out.println(i);
    }
    //闭包
    private class Closure implements Incrementable{
        @Override
        public void increment() {
            //当外部获得此内部类对象的引用时，调用该方法，就可以回调至Callee2的increment方法
            //内部类中调用外部类的方法
            Callee2.this.increment();
        }
    }
    //返回内部类对象向上转型的接口引用
    Incrementable getCallbackReference(){
        return new Closure();
    }
}
class Caller{
    private Incrementable callbackReference;
    //Caller对象构造器接收一个Incrementable引用，之后某个时刻可以用此引用回调至Callee2类
    Caller(Incrementable cbh){
        callbackReference=cbh;
    }
    void go(){
        //这里触发回调
        callbackReference.increment();
    }
}
public class Callbacks {
    public static void main(String...args){
        Callee1 c1=new Callee1();
        Callee2 c2=new Callee2();
        MyIncrement.f(c2);
        Caller caller1=new Caller(c1);
        Caller caller2=new Caller(c2.getCallbackReference());
        caller1.go();
        caller1.go();
        caller2.go();
        caller2.go();
    }
}/*output
Other operation
1
1
2
Other operation
2
Other operation
3
*/
```

### 8.9内部类的继承

内部类的构造器必须连接到指向其外围类对象的引用才能构造一个内部类对象，可是当内部类作为基类被其他类所继承时，那个派生类就不存在已初始化的的外围类对象的引用供基类内部类的构造器所连接，此时派生类就不能使用默认构造器否则会报错

解决办法：派生类构造器必须是带参构造器，并且参数是基类内部类的外围对象的引用，同时构造器中使用语法`外围类对象的引用.super()`，基类内部类的构造器才能正确初始化，与外围类对象的引用连接

```java
package innerclasses;

class WithInner{
    class Inner{}
}
//InheritInner类继承了WithInner类的内部类Inner类
//当要创建一个InheritInner对象时，就会先调用基类内部类Inner的构造器
public class InheritInner extends WithInner.Inner  {
    //默认构造器会报错
    //InheritInner(){}
    //不能只是传递一个外围类对象的引用
    InheritInner(WithInner wi){
        //还必须在构造器内采用如下语法
        wi.super();
    }
    public static void main(String...args){
        WithInner wi=new WithInner();
        InheritInner ii=new InheritInner(wi);
    }
}
```

### 8.10内部类可以被覆盖吗

当外围类作为基类被其他类继承时，并在派生类中重新定义此内部类时，是无法做到覆盖基类外围类的内部类。基类外围类的内部类与派生类中的内部类是两个独立的实体，存在于各自的命名空间

```java
package innerclasses;

class Egg{
    private Yolk y;
    protected class Yolk{
        public Yolk(){
            System.out.println("Egg.Yolk()");
        }
    }
    public Egg(){
        System.out.println("New Egg()");
        y=new Yolk();
    }
}
public class BigEgg extends Egg {
    public class Yolk{
        public Yolk(){
            System.out.println("BigEgg.Yolk()");
        }
    }
    public static void main(String...args){
        //创建BigEgg对象时，先调用基类Egg的构造器，由于java采用运行时动态绑定，如果内部类真的能被覆盖，那么y=new Yolk()调用的应该是BigEgg中的内部类构造器
        //然而两个内部类是独立的实体，无法覆盖，所以调用的还是基类的内部类
        new BigEgg();
    }
}/*output
New Egg()
Egg.Yolk()
*/
```

### 8.11局部内部类

局部内部类不能有访问说明符，因为它不是外围类的一部分，但是它可以访问当前作用域内的变量，以及此外围类的所有成员

与匿名内部类相比，它们具有相同的行为和能力，但是当我们需要一个已命名的构造器或者需要重载构造器，就只能使用局部内部类

### 8.12内部类标识符

Java中每个类都会产生一个.class文件，内部类也不例外，只是它们的类文件名称必须是：外围类的名字，加上$，再加上内部类的名字；如果内部类是匿名的，编译器会简单地产生一个数字作为其标识符

## 9.持有对象

为了解决数组保存对象后尺寸固定的限制，Java提供了一套容器类来解决这个问题，其中基本的类型是`List`、`Set`、`Queue`和`Map`。这些对象类型也称集合类。Java的容器类能自动调整自己的尺寸，可以放置任意数量的对象到容器中

### 9.1泛型和类型安全的容器

JavaSE5之前的容器有一个主要问题：编译器允许你向容器中插入不正确的类型。以下我们使用容器`ArrayList`（可以看作是能自动扩充自身尺寸的数组）举例：

```java
package holding;

import java.util.ArrayList;

class Apple{
    private int id=0;
    public int id(){
        return id;
    }
}
class Orange{}

public class ApplesAndOrangesWithoutGenerics {
    public static void main(String...args){
        ArrayList apples=new ArrayList();
        for(int i=0;i<3;i++){
            //可以往容器中添加Apple对象
            apples.add(new Apple());
        }
        //即使是和Apple对象不同，也能添加成功
        apples.add(new Orange());
        for(int i=0;i<apples.size();i++){
            //但是当从容器中取出的对象要调用方法id必须强制转型为Apple类型
            //此时Orange对象转型为Apple对象失败就会报错
            ((Apple)apples.get(i)).id();
        }
    }
}
```

当你往容器中添加不同类型的对象，只要不取出该类型并调用某一确切类型的方法时，无论是在编译期还是运行期，都不会报错

原因：因为Java容器类先将传入的对象转型为Object类型再保存，只要不涉及强制类型转换，那么从容器中取出的都是Object类型的引用

为了解决这一问题，就必须使用Java泛型来限定容器保存的类型，比如`ArrayList<Apple>`，声明`ArrayList`保存的都是Apple类型，`<>`中的时类型参数（可以有多个）。通过使用泛型，就可以在编译期防止将错误类型的对象放置到容器中，并且从容器中取出元素时就会自动转型（Object转型为某一确切类型），因为容器已经被限定了类型

### 9.2基本概念

Java容器类类库的用途是保存对象，并将其划分为两个不同的概念：

- `Collection`。一个独立元素的序列，这些元素都服从一条或多条规则。`List`必须按照插入顺序保存元素，`Set`不能有重复元素，`Queue`按照排队规则来确定对象的产生顺序（`Collection`每个“槽”只能保存一个元素）
- `Map`。一组成对的“键值对”对象，允许你使用键来查找值（`Map`每个槽能保存两个元素）

通常，都是创建一个具体容器类的对象然后向上转型，使用该容器类实现的接口引用指向该对象，因为这样能拥有一个更通用的容器引用，比如`         List<Apple> apples=new ArrayList<>();`

但是当要使用到具体容器类的额外方法而接口中没有，就不能这样做

### 9.3添加一组元素

`java.util`包中的Arrays类和`Collections`类中有很多实用方法，可以在`Collection`中添加一组元素：

`Arrays.asList()`方法：接受一个数组或是用逗号分隔的元素列表（使用可变参数），并将其转换为一个`List`对象

`Collections.addAll()`方法：接受一个`Collection`对象，以及一个数组或是一个用逗号分割的列表，将元素添加到`Collection`中

### 9.4`List`

`List`接口在`Collection`的基础上添加了大量方法，使得可以在`List`的中间插入和移除元素

有两种类型的`List`：

- 基本的`ArrayList`，它善于随机访问元素，但是在`List`中间插入和移除元素时较慢
- `LinkedList`，它通过代价较低的在`List`中间进行的插入和删除操作，提供了优化的顺序访问。`LinkedList`的随机访问方面相对比较慢

### 9.5迭代器

迭代器（一种设计模式）是一个对象，它的工作是遍历并选择序列中的对象，而客户端程序员不必知道或关心该序列底层的结构

迭代器能复用到不同类型的容器

Java的迭代器类`Iterator`只能单向移动，这个`Iterator`只能用来：

- 使用方法`iterator()`要求容器返回一个`Iterator`对象
- 使用`next()`获得序列中的下一个元素
- 使用`hasNext()`检查序列中是否还有元素
- 使用`remove()`将迭代器新近返回的元素删除

```java
package holding;

import java.util.*;

public class SimpleIteration {
    public static void main(String...args){
        List<Integer> integers=new ArrayList<>(Arrays.asList(1,2,3,4));
        //iterator()方法返回该容器的迭代器对象的引用
        Iterator<Integer> iterator=integers.iterator();
        while (iterator.hasNext()){
            System.out.println(iterator.next());
        }
        Iterator<Integer> iterator1=integers.iterator();
        for(int i=0;i<2;i++){
            iterator1.next();
            iterator1.remove();
        }
        System.out.println(integers);
    }
}/*output
1
2
3
4
[3, 4]
*/
```

#### 9.5.1`ListIterator`

`ListIterator`是`Iterator`的子类，功能更强大，但只能用于各种`List`类的访问。`Iterator`只能向前移动，而`ListIterator`能双向移动，它还可以产生相对于迭代器在列表中指向的当前位置的前一个和后一个元素的引用，并且可以使用`set()`方法替换它访问过的最后一个元素。你可以通过调用`listIterator()`方法产生一个指向`List`开始处的`ListIterator`，并且还可以通过调用`listIterator(n)`方法创建一个一开始就指向列表索引为n的元素处的`ListIterator`

```java
package holding;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.ListIterator;

public class ListIteration {
    public static void main(String...args){
        List<Integer> integers=new ArrayList<>(Arrays.asList(1,2,3,4));
        ListIterator<Integer> it=integers.listIterator();
        while (it.hasNext()){
            System.out.println("index:"+it.nextIndex()+",value:"+it.next());
            System.out.println("preIndex"+it.previousIndex());
        }
        while (it.hasPrevious()){
            System.out.println(it.previous());
        }
        it=integers.listIterator(2);
        while (it.hasNext()){
            System.out.println(it.next());
        }
    }
}/*output
index:0,value:1
preIndex0
index:1,value:2
preIndex1
index:2,value:3
preIndex2
index:3,value:4
preIndex3
4
3
2
1
3
4
*/
```

### 9.6`Foreach`与迭代器

`foreach`语法能应用于任何实现了`Iterable`（可迭代的）的接口的类，Java中的Collection对象都实现了该接口；`foreach`语法也能应用于数组，但是数组并没有实现`Iterable`的接口

`Iterable`接口包含一个能够产生`Iterator`（迭代器）对象的引用的`iterator()`方法

```java
package holding;

import java.util.Iterator;
// IterableClass实现了Iterable接口，可以用foreach迭代
public class IterableClass implements Iterable<String> {
    protected String[] words=("hello world").split("");
    //实现了iterator方法，返回一个迭代器对象的引用
    @Override
    public Iterator<String> iterator() {
        //匿名内部类
        //实现了Iterator接口的匿名内部类需要实现了hasNext和next方法
        return new Iterator<String>() {
            private int index=0;
            @Override
            public boolean hasNext() {
                return index<words.length;
            }

            @Override
            public String next() {
                return words[index++];
            }
        };
    }
    public static void main(String...args){
        for (String s:new IterableClass()) {
            System.out.println(s+" ");
        }
    }
}/*output
h
e
l
l
o

w
o
r
l
d
*/
```

## 10.通过异常处理错误

### 10.1概念

Java的异常处理机制能够把“描述在正常执行过程中做什么事”的代码和“出了问题怎么办”的代码相分离

### 10.2基本异常

当一个程序抛出异常，有几件事会随之发生：首先，Java会在堆上创建异常对象。然后，当前的执行路径被终止，并且从当前环境中弹出对异常对象的引用。此时，异常处理机制接管程序，并从异常处理程序（`catch`块）开始执行代码

#### 10.2.1异常参数

与使用Java中的其他对象一样，我们总是使用new在堆上创建异常对象，所有的标准异常类都有两个构造器：默认构造器和一个接收字符串作为参数的构造器

例如：`throw new NullPointerException("t=null")`，关键字`throw`会抛出该异常对象的引用，并从当前作用域退出，并跳至异常处理程序处开始执行代码，异常对象的引用也会被传入异常处理程序

此外关键字`throw`还能抛出任意类型的`Throwable`对象的引用，`Throwable`类是所有异常类型的根类

### 10.3捕获异常

#### 10.3.1`try`块

`try`块里编写各种可能抛出异常的代码

#### 10.3.2异常处理程序

抛出的异常会在异常处理程序中得到处理，而且针对每个要捕获的异常，都必须有想应的处理程序。异常处理程序紧跟在`try`块后，以关键字`catch`表示

```java
try{
	//可能抛出异常的代码
}catch(Type1 id1){
   	//处理捕获的异常Type1
}
catch(Type2 id2){
   	//处理捕获的异常Type2    
}
//...
```

每个`catch`块都会接收一个且只接收一个异常类型的参数。

`catch`块必须紧跟在`try`块后。当异常被抛出时，异常处理机制将负责搜寻参数与异常类型相匹配的第一个`catch`块，然后程序就进入`catch`块中执行，此时认为该异常得到了处理。一旦`catch`块执行结束，则异常处理机制的查找过程也就结束了（因为该异常已经被处理，不会再进入其他`catch`块中）

### 10.4创建自定义异常

可以通过继承Java中已有的异常类，来定义一个自定义的异常类

```java
package exceptions;
//继承了java的Exception类，Exception类也继承自Throwable类，它是编程活动相关的基类
class MyException extends Exception {
    //异常类中也可以自定义字段
   	private int x;
    //默认构造器
    public MyException(){};
    //带参构造器
    public MyException(String msg){
        //调用基类的构造器处理
        super(msg);
    }
    //初始化该字段
   	public MyException(String msg,int x){
        super(msg);
        this.x=x;
    }
	//覆盖重写基类的getMessage()方法
    //该方法类似于普通对象的toString()方法
    @Override
    public String getMessage() {
        return "Detail Message:"+x+" "+super.getMessage();
    }
    
    public static void main(String...args){}
}

public class FullConstructors {
    //throws关键字用于声明该方法会抛出什么类型的异常
    public static void f() throws MyException {
        System.out.println("Throwing MyException from f()");
        //抛出异常
        throw new MyException();
    }
    public static void g() throws MyException{
        System.out.println("Throwing MyException from g()");
        throw new MyException("Originated inf g()");
    }
    public static void main(String...args){
        try{
            f();
        //捕获MyException类型的异常
        }catch (MyException e){
            //因为继承了java内置的异常类，所以可以使用Throwable类声明的printStackTrace方法
            //该方法会打印从“方法调用处直到异常抛出处”的方法调用序列
            //这些信息会输出到System.out对象中，然后打印到控制台
            e.printStackTrace(System.out);
            //当打印异常对象时，就会调用异常对象的getMessage()方法
          	System.out.println(e);            
        }
        try {
            g();
        }catch (MyException e){
            e.printStackTrace(System.out);
        }
    }
}/*output
Throwing MyException from f()
exceptions.MyException: Detail Message:0 null
	at exceptions.FullConstructors.f(FullConstructors.java:25)
	at exceptions.FullConstructors.main(FullConstructors.java:33)
exceptions.MyException: Detail Message:0 null
Throwing MyException from g()
exceptions.MyException: Detail Message:0 Originated inf g()
	at exceptions.FullConstructors.g(FullConstructors.java:29)
	at exceptions.FullConstructors.main(FullConstructors.java:39)
*/
```

#### 10.4.1异常与记录日志

可以使用`java.util.logging`工具将输出记录到日志中

```java
package exceptions;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.logging.Logger;

class LoggingException extends Exception{
    //静态的Logger.getLogger()方法创建了一个String参数（通常与错误相关的包名与类名）相关联的Logger对象
    //该Logger对象会将输出发送到System.err
    private static Logger logger=Logger.getLogger("LoggingException");
    public LoggingException(){
        StringWriter trace=new StringWriter();
        //调用重载的printStackTrace()方法，接收一个PrintWriter对象
        printStackTrace(new PrintWriter(trace));
        //调用Logger对象的severe()方法，将日志记录写入Logger对象
        logger.severe(trace.toString());
    }
}

public class LoggingExceptions {
    public static void main(String...args){
        try{
            throw new LoggingException();
        }catch (LoggingException e){
            System.err.println("Caught "+e);
        }
        try{
            throw new LoggingException();
        }catch (LoggingException e){
            System.err.println("Caught "+e);
        }
    }
}/*output
3月 06, 2021 1:56:57 下午 exceptions.LoggingException <init>
严重: exceptions.LoggingException
   at exceptions.LoggingExceptions.main(LoggingExceptions.java:19)

Caught exceptions.LoggingException
3月 06, 2021 1:56:57 下午 exceptions.LoggingException <init>
严重: exceptions.LoggingException
   at exceptions.LoggingExceptions.main(LoggingExceptions.java:24)

Caught exceptions.LoggingException
*/
```

### 10.5异常说明

异常说明：用于告知程序员某个方法可能会抛出的异常类型

异常说明，它属于方法声明的一部分，紧跟在形式参数列表之后。当某个方法明确抛出了异常，Java就会强制该方法使用异常说明。

异常说明使用关键字`throws`，后面接一个所有潜在异常类型的列表，比如：`void f() throws TooBig,TooSmall,DivZero{}`。即使没有异常说明，也不意味着方法不会抛出异常，Java中从`RuntimeException`继承的类，不需要作异常说明

### 10.6捕获所有异常

可以只写一个异常处理程序来捕获所有类型的异常：`catch(Exception e){}`，`Exception`类是同编程活动相关的基类；但是如果有很多个异常处理程序，就应该把`catch(Exception e){}`这种放在最末尾，以防它抢在其他处理程序之前先把异常捕获

#### 10.6.1栈轨迹

`printStackTrace()`方法所提供的信息可以通过`getStackTrace()`方法来直接访问，该方法将返回一个由栈轨迹中的元素所构成的数组，其中每个元素都表示栈中的一帧，元素0是栈顶元素，并且是调用序列中的最后一个方法调用

```java
package exceptions;

public class WhoCalled {
    static void f(){
        try {
            throw new Exception();
        }catch (Exception e){
            //打印栈轨迹中的元素
            for (StackTraceElement ste:e.getStackTrace()){
                //只打印调用的方法名
                System.out.println(ste.getMethodName());
            }
        }
    }
    static void g(){
        f();
    }
    static void h(){
        g();
    }
    public static void main(String...args){
        f();
        System.out.println("-----------------------------");
        g();
        System.out.println("-----------------------------");
        h();
    }
}/*output
f
main
-----------------------------
f
g
main
-----------------------------
f
g
h
main
*/
```

#### 10.6.2重新抛出异常

在`catch`块中重新抛出异常，这样同一个`try`块的后续`catch`块都被忽略，异常对象的引用被抛给更上一级的环境，在此环境中也可以使用`catch`块捕获并处理异常

当异常对象重新抛出：

`printStackTrace()`方法显示的将是原来异常抛出点的调用栈信息，而非重新抛出点的信息

而`fillInStackTrace()`方法会返回一个`Throwable`对象，该对象是通过把当前调用栈信息填入原来那个异常对象而建立的

```java
package exceptions;

public class Rethrowing {
    public static void f() throws Exception{
        System.out.println("originating the exception in f()");
        throw new Exception("throw from f()");
    }
    public static void g() throws Exception{
        try{
            f();
        }catch (Exception e){
            System.out.println("Inside g(),e.printStackTrace()");
            e.printStackTrace(System.out);
            throw e;
        }
    }
    public static void h() throws Exception{
        try{
            f();
        }catch (Exception e){
            System.out.println("Inside h(),e.printStackTrace()");
            e.printStackTrace(System.out);
            //将当前调用栈信息填入原有的异常对象中，然后返回一个 Throwable对象
            //它可以记录异常重新抛出点的位置
            throw (Exception)e.fillInStackTrace();
        }
    }
    public static void main(String...args){
        try{
            g();
        }catch (Exception e){
            System.out.println("main: printStackTrace()");
            e.printStackTrace(System.out);
        }
        try{
            h();
        }catch (Exception e){
            System.out.println("main:printStackTrace()");
            e.printStackTrace(System.out);
        }

    }
}/*output
originating the exception in f()
Inside g(),e.printStackTrace()
java.lang.Exception: throw from f()
   at exceptions.Rethrowing.f(Rethrowing.java:6)
   at exceptions.Rethrowing.g(Rethrowing.java:10)
   at exceptions.Rethrowing.main(Rethrowing.java:28)
main: printStackTrace()
java.lang.Exception: throw from f()
   at exceptions.Rethrowing.f(Rethrowing.java:6)
   at exceptions.Rethrowing.g(Rethrowing.java:10)
   at exceptions.Rethrowing.main(Rethrowing.java:28)
originating the exception in f()
Inside h(),e.printStackTrace()
java.lang.Exception: throw from f()
   at exceptions.Rethrowing.f(Rethrowing.java:6)
   at exceptions.Rethrowing.h(Rethrowing.java:19)
   at exceptions.Rethrowing.main(Rethrowing.java:34)
main:printStackTrace()
java.lang.Exception: throw from f()
   at exceptions.Rethrowing.h(Rethrowing.java:23)
   at exceptions.Rethrowing.main(Rethrowing.java:34)
*/
```

#### 10.6.3异常链

异常链：在捕获一个异常后抛出另一个异常，并把原始异常的信息保存下来

所有的`Throwable`的子类在构造器中都有一个可以接受一个`Throwable`对象的参数cause，这个cause就用来表示原始异常，这样通过把原始异常传递给新的异常，使得即使在当前位置创建并抛出了新的异常，也能通过这个异常链追踪的到异常最初发生的位置

在`Throwable`子类中，只有三种基本的异常类提供了带cause参数的构造器，它们是`Error`（用于虚拟机报告系统错误）、`Exception`以及`RuntimeException`。如果要把其他类型的异常链接起来，应该使用`initCause()`方法而不是构造器

### 10.7Java标准异常

`Throwable`这个Java类被用来表示任何可以作为异常被抛出的类，`Throwable`对象可以分为两种类型：

- `Error`类：表示编译时和系统错误
- `Exception`类：可以被抛出的基本类型，在Java类库、用户方法以及运行时故障中都可能抛出`Exception`型异常

#### 10.7.1特例：`RuntimeException`

`RuntimeException`即运行时异常类，这一个类型及其子类型的异常会自动被Java虚拟机抛出，所以不必在异常说明中列出，并且如果不捕获该类异常，那么在程序退出前编译器会调用该异常的`printStackTrace()`方法

### 10.8使用`finally`进行清理

`finally`块：无论`try`块中的异常是否抛出，块中的代码都会得到执行

```java
package exceptions;

class ThreeException extends Exception{}

public class FinallyWorks {
    static int count=0;
    public static void main(String...args){
        while (true){
            try {
                if(count++==0){
                    throw new ThreeException();
                }
                System.out.println("No Exception");
            }catch (ThreeException e){
                System.out.println("ThreeException");
            }finally {
                System.out.println("In Finally Block");
                if(count==2){
                    break;
                }
            }
        }
    }
}/*output
ThreeException
In Finally Block
No Exception
In Finally Block
*/
```

#### 10.8.1在`return`中使用`finally`

因为`finally`块总是会执行，所以在一个方法中，无论从何处返回，总会在最终返回前执行`finally`块

```java
package exceptions;

public class MultipleReturn {
    public static void f(int i){
       try{
           if(i==1){
               return;
           }
           if(i==2){
               return;
           }
           return;
        //无论何处返回，finally始终会执行   
       }finally {
           System.out.println("In Finally Block");
       }
    }
    public static void main(String...args){
        f(1);
        f(2);
        f(3);
    }
}/*output
In Finally Block
In Finally Block
In Finally Block
*/
```

### 10.9异常的限制

- 对于构造器，子类的构造器可以抛出任何异常，而不必理会基类构造器所抛出的异常，但是子类构造器的异常说明必须包含基类构造器的异常说明

- 如果子类不仅继承了基类，并且还实现了一个接口，而如果覆写基类的方法与这个接口中的方法一样时，该方法不能改变在基类的异常接口，也不能改变接口的异常接口，因此一般设置不抛出异常


- 对于一般的方法，必须要遵循接口或者基类方法的异常说明，即只能减少接口或者基类方法的异常说明，而不能增加或更改异常说明(这与构造器刚好相反)。另外，方法的异常说明也遵循协变返回类型的原则，即子类方法抛出异常的类型可以是基类方法抛出的异常类型的子类。


### 10.10构造器

如果在构造一个对象时，其构造器内抛出了异常，那么对象就不会被成功创建，然而此时如果在`finally`块中清理这些未成功创建的对象时，就会报错。为避免这一问题的发生，应该使用嵌套`try-catch`块来保证对象的安全创建

```java
package exceptions;

class InputFile {
    InputFile(String fname) throws Exception {
        if(!fname.equals("InputFile")){
            throw new Exception();
        }
    }
    public void read() throws Exception {
        throw new Exception();
    }
    public void dispose(){
        System.out.println(this);
    }
}

public class Cleanup {
    public static void main(String...args){
        try {
            //在对象创建的时候套一个try-catch，来捕获对象创建时可能发生的异常
            InputFile inputFile=new InputFile("abc");
            try{
                //如果能成功执行内层try-catch块，说明对象被成功创建，构造器并没有抛出异常
                inputFile.read();
            }catch (Exception e){
                System.out.println("Caught Exception in main");
            }
            finally {
                //最后在执行该对象的清理工作，就准确无误
                inputFile.dispose();
            }
        }catch (Exception e){
            //如果对象创建过程出错，程序会跳至此处执行
            System.out.println("InputFile constructor failed");
        }
        try {
            InputFile inputFile1=new InputFile("InputFile");
            try{
                inputFile1.read();
            }catch (Exception e){
                System.out.println("Caught Exception in main");
            }
            finally {
                inputFile1.dispose();
            }
        }catch (Exception e){
            System.out.println("InputFile constructor failed");
        }
    }
}/*output
InputFile constructor failed
Caught Exception in main
exceptions.InputFile@16b98e56
*/
```

### 10.11异常匹配

抛出异常的时候，异常处理系统会按照代码的书写顺序找出最近的处理程序。找到匹配的处理程序之后，它就认为异常将得到处理，然后就不再继续查找。查找的时候并不要求抛出的异常同处理程序所声明的异常完全匹配，派生类的对象也可以匹配其基类的处理程序

```JAVA
package exceptions;

class Annoyance extends Exception{}
class Sneeze extends Annoyance{}

public class Human {
    public static void main(String...args){
        try{
            throw new Sneeze();
        }catch (Sneeze s) {
            System.out.println("Caught Sneeze");
        }catch (Annoyance a){
            //此处不会执行，因为Sneeze异常已经被匹配的第一个catch块所捕获
            System.out.println("Caught Annoyance");
        }
        try{
            throw new Sneeze();
        }catch (Annoyance a){
            //Annoyance异常的子类异常也可以被捕获
            System.out.println("Caught Annoyance");
        }
    }
}
```

## 11.类型信息

运行时类型信息使得你可以在程序运行时发现和使用类型信息

Java主要通过两种方式在运行时识别对象和类的信息：

- “传统的”RTTI（运行时类型识别），它假定我们在编译时已经知道了所有的类型
- 反射机制：它允许我们在运行时发现和使用类的信息

### 11.1为什么需要RTTI

假设有一个最通用的类型是基类Shape，而派生出的具体类有Circle、Square和Triangle，如下图

![image-20210315165648356](/static/img/image-20210315165648356.png)

为什么需要RTTI：

- 对于`List<Shape>`这种容器，它实际上是将容器中所有的元素都当做Object类型持有，当从容器中取出元素时，会自动将元素转型回Shape。类型转换，就是RTTI的最基本的使用形式，因为在Java中，所有的类型转换都是在运行时进行正确检查。这也是RTTI名字的含义：在运行时，识别一个对象的类型
  - 在编译时，将由容器和Java的泛型系统来强制确保该容器保存的都是Shape
  - 在运行时，由类型转换操作来确保取出的都是Shape
- 多态机制，Shape对象实际执行什么样的代码，是由引用所指向的具体对象Circle、Square或者Triangle而决定的。而判断一个Shape引用实际指向的确切类型，是靠RTTI去查询

### 11.2Class对象

类是程序的一部分，每个类都有一个Class对象。Java使用Class对象来执行其RTTI，即使你正在执行的是类似转型这样的操作

Java的Class对象的产生与类加载子系统有关。类加载器子系统实际上可以包含一条类加载器链，但是只有一个原生类加载器。原生类加载器加载的是所谓的可信类，包括Java API类，它们通常是从本地盘加载的

Java 源程序（.java 文件）在经过 Java 编译器编译之后就被转换成 Java 字节代码（.class 文件）。Java程序在它开始运行之前并非被完全加载，其各个部分实在必需时才加载：当类第一次被使用时，类加载器会根据类名查找字节代码（.class文件)，读取并转换成`java.lang.Class`类的一个对象。每个这样的Class对象用来表示一个 Java 类。 
一旦某个类的Class对象被载入内存，它就被用来创建这个类的所有对象

```java
package typeinfo;

class Candy{
    static {
        System.out.println("Loading Candy");
    }
}
class Gum{
    static {
        System.out.println("Loading Gum");
    }
}
class Cookie{
    static {
        System.out.println("Loading Cookie");
    }
}

public class SweetShop {
    public static void main(String...args){
        System.out.println("inside main");
        new Candy();
        System.out.println("After creating Candy");
        try{
            //Class.forName()是Class类的一个静态方法
            //根据传入的参数，要求JVM查找类名与该参数相匹配的类的class文件，并将其转换成Class对象加载到内存中
            //该方法的返回值为该类对应的Class对象的引用
            //传入的参数必须是全限定名（包名.类名的形式）
            Class.forName("typeinfo.Gum");
        } catch (ClassNotFoundException e) {
            //Class.forName()如果找不到要加载的类，就会抛出ClassNotFoundException异常
            e.printStackTrace();
        }
        System.out.println("After Class.forName(\"Gum\")");
        new Cookie();
        System.out.println("After creating Cookie");
    }
}/*out
inside main
Loading Candy
After creating Candy
Loading Gum
After Class.forName("Gum")
Loading Cookie
After creating Cookie
*/
```

当你未持有某个类型的对象而需要获得其Class对象的引用时，可以使用`Class.forName()`。但是，如果你已经持有了一个实际类型的对象，可以通过该对象调用`getClass()`方法来获得对应的`Class`对象的引用

`Class`对象包含了很多有用的方法：

```java
package typeinfo;

interface HasBatteries{}
interface Waterproof{}
interface Shoots{}

class Toy{
    Toy(){}
    Toy(int i){}
}
class FancyToy extends Toy implements HasBatteries,Waterproof,Shoots{
    FancyToy(){
        super(1);
    }
}

public class ToyTest {
    static void printInfo(Class cc){
        //getName()返回该Class对象对应的类型的全限定名（包名.类名的形式）
        //isInterface()判断该Class对象对应的类型是否为一个接口
        System.out.println("Class name"+cc.getName()+" is interface?["+cc.isInterface()+"]");
        //getSimpleName()返回该Class对象对应的类型的名字（不包含包名）
        System.out.println("Simple name:"+cc.getSimpleName());
        //同getName()
        System.out.println("Canonical name:"+cc.getCanonicalName());
    }
    public static void main(String...args){
        Class c=null;
        try{
            c=Class.forName("typeinfo.FancyToy");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        printInfo(c);
        //getInterfaces()返回的是一个Class对象数组，该方法获取该Class对象对应的类型实现的所有接口
        for (Class face:c.getInterfaces()) {
            printInfo(face);
        }
        //getSuperclass()返回的是一个Class对象，该方法用于获取该Class对象对应的类型的基类
        Class up=c.getSuperclass();
        Object obj=null;
        try{
            //newInstance()返回一个Object类型的引用，该方法用于创建一个该Class对象对应的类型的实例
            //调用此方法的Class对象对应的类型必须要有默认构造器
            obj=up.newInstance();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
        printInfo(obj.getClass());
    }
}/*output
Class nametypeinfo.FancyToy is interface?[false]
Simple name:FancyToy
Canonical name:typeinfo.FancyToy
Class nametypeinfo.HasBatteries is interface?[true]
Simple name:HasBatteries
Canonical name:typeinfo.HasBatteries
Class nametypeinfo.Waterproof is interface?[true]
Simple name:Waterproof
Canonical name:typeinfo.Waterproof
Class nametypeinfo.Shoots is interface?[true]
Simple name:Shoots
Canonical name:typeinfo.Shoots
Class nametypeinfo.Toy is interface?[false]
Simple name:Toy
Canonical name:typeinfo.Toy
*/
```

#### 11.2.1类字面常量

Java还提供了另一种方法来生成对`Class`对象的引用，即类字面常量

语法：`类名.class`，比如`FancyToy.class`就可以生成`FancyToy`类对应的`Class`对象的引用

类字面常量根除了对`forName()`方法的调用，它在编译时就会受到检查，因此不需要将其置于`try`块语句中

Java为了使用类而做的准备工作有：

- 加载，由类加载器执行。该步骤将查找字节码，并从这些字节码中创建一个`Class`对象
- 链接。在链接阶段将验证类中的字节码，为静态域分配存储空间（自动初始化），并且如果必需的话，将解析这个类创建的对其他类的所有引用
- 初始化。如果该类具有超类，则对其初始化，执行静态初始化器和静态初始化块

与`Class.forName()`相比，使用类字面常量来创建对`Class`对象的引用，初始化的步骤会被延迟到对静态方法、构造器或者非常数静态域进行首次引用时才执行，而`Class.forName()`则是立即执行初始化

```java
package typeinfo;

import java.util.Random;

class Initable{
    //staticFinal是静态常数域，编译期常量，即不需要初始化类就可以被读取
    static final int staticFinal=47;
    //staticFinal2是非常数静态域，非编译期常量
    static final int staticFinal2=ClassInitialization.rand.nextInt(1000);
    static {
        System.out.println("Initializing Initable");
    }
}
class Initable2{
    //静态域
    static int staticNonFinal=147;
    static {
        System.out.println("Initializing Initable2");
    }
}
class Initable3{
    //静态域
    static int staticNonFinal=74;
    static {
        System.out.println("Initializing Initable3");
    }
}
public class ClassInitialization {
    public static Random rand=new Random(47);
    public static void main(String...args) throws Exception{
        //使用类字面常量，并不会触发类初始化
        Class initable=Initable.class;
        System.out.println("After creating Initable ref");
        //访问Initable类的编译期常量也不会触发类初始化
        System.out.println(Initable.staticFinal);
        //首次访问Initable的非常数静态域会触发初始化
        System.out.println(Initable.staticFinal2);
        //首次访问Initable2类的静态域会触发初始化
        System.out.println(Initable2.staticNonFinal);
        //使用Class.forName()方法就会立即触发初始化
        Class initable3=Class.forName("typeinfo.Initable3");
        System.out.println("After creating Initable3 ref");
        System.out.println(Initable3.staticNonFinal);
    }
}/*output
After creating Initable ref
47
Initializing Initable
258
Initializing Initable2
147
Initializing Initable3
After creating Initable3 ref
74
*/
```

#### 11.2.2泛化的Class引用

Java SE5允许对Class引用所指向的Class对象的类型进行限定（通过泛型语法）

```java
Class intClass = int.class;
//通过泛型语法，可让编译器强制执行额外的类型检查
Class<Integer> genericIntClass = int.class;
intClass=double.class;//不使用泛型语法的Class对象的引用可以被重新赋值指向任何其他的Class对象
//genericIntClass=double.class//报错，编译器会对使用了泛型语法的Class对象的引用进行检查，禁止其指向其他类型的Class对象
//使用了通配符?（表示任何事物）
Class<?> intClass = int.class;
```

向Class引用添加泛型语法的原因仅仅是为了提供编译期类型检查

#### 11.2.3新的转型语法

Java SE5还添加了用于Class引用的转型语法，即`cast()`方法：

```java
package typeinfo;

class Building{}
class House extends Building{}

public class ClassCasts {
    public static void main(String...args){
        Building b=new House();
        Class<House> houseType=House.class;
        //Class对象的cast()方法，会将传入的对象转型为该Class对象对应的类型
        House h=houseType.cast(b);
        //普通的转型语法
        h=(House)b;
    }
}
```

### 11.3类型转换前先检查

RTTI有三种表现形式：

- 传统的类型转换，如`Shape s=(Shape)c`，由RTTI确保类型转换的正确性，如果执行了一个错误的类型转换，就会抛出一个`ClassCastException`异常

- 代表对象的类型的`Class`对象。通过查询`Class`对象可以获取运行时所需的信息

- `instanceof`关键字，它返回一个布尔值，告诉我们对象是不是某个特定类型的实例。比如：

  ```java
  if(x instanceof Dog){
      ((Dog)x).bark();
  }
  ```

#### 11.3.1动态的instanceof

`Class`对象提供了`isInstance()`方法，相比于`instanceof`，它能够动态地测试对象。比如：

```java
//使用instanceof，被测试对象在左边
if(a instanceof B){

}
//使用isInstance(),被测试对象在右边
if(B.Class.isInstance(a)){

}
```

### 11.4`instanceof`与`Class`的等价性

在查询类型信息时，以`instanceof`的形式（即以`instanceof`形式或`isInstance()`的形式）与直接比较Class对象有很重的差别：

```java
package typeinfo;

class Base{}
class Derived extends Base{}

public class FamilyVsExactType {
    static void test(Object x){
        System.out.println("Testing x of type "+x.getClass());
        System.out.println("x instanceof Base "+(x instanceof Base));
        System.out.println("x instanceof Derived "+(x instanceof Derived));
        System.out.println("Base.isInstance(x) "+(Base.class.isInstance(x)));
        System.out.println("Derived.isInstance(x) "+Derived.class.isInstance(x));
        System.out.println("x.getClass()==Base.class "+(x.getClass()==Base.class));
        System.out.println("x.getClass()==Derived.class "+(x.getClass()==Derived.class));
        System.out.println("x.getClass().equals(Base.class) "+(x.getClass().equals(Base.class)));
        System.out.println("x.getClass().equals(Derived.class) "+x.getClass().equals(Derived.class));
    }
    public static void main(String...args){
        test(new Base());
        test(new Derived());
    }
}/*output
Testing x of type class typeinfo.Base
x instanceof Base true
x instanceof Derived false
Base.isInstance(x) true
Derived.isInstance(x) false
x.getClass()==Base.class true
x.getClass()==Derived.class false
x.getClass().equals(Base.class) true
x.getClass().equals(Derived.class) false
Testing x of type class typeinfo.Derived
x instanceof Base true
x instanceof Derived true
Base.isInstance(x) true
Derived.isInstance(x) true
x.getClass()==Base.class false
x.getClass()==Derived.class true
x.getClass().equals(Base.class) false
x.getClass().equals(Derived.class) true
*/
```

`instanceof`和`IsInstance()`保持了**类型的概念**，指的是“你是这个类吗，或者你是这个类的派生类吗”
`==`和`equals()`则是比较的实际的`Class`对象，没有考虑继承（要么是这个确切的类型，要么不是）

### 11.6反射：运行时的类型信息

如果不知道某个对象的确切类型，RTTI可以告诉你，但是有一个限制：这个类型在编译时必须已知，即该类在classPath路径下，这样编译器才能在编译时通过classPath找到该类并加载其`Class`对象

假如你在程序运行过程中，从磁盘上或者从网络上读取接收了一串代表一个类的字节，既然这个类在编译器为你的程序生成代码之后很久才会出现，那么你怎样使用这样的类呢？

解决办法：采用Java的反射机制。`Class`类和`java.lang.reflect`类库一起对反射的概念进行了支持，该类库包含了`Field`、`Method`以及`Constructor`类（每个类都实现了`Member`接口）。这些类型的对象是由JVM在运行时创建的，用来表示未知类里对应的成员

RTTI和反射的区别：

- 类在编译前就已知，也就是该类在classPath路径下。这就是RTTI。比如：

  ```java
  //以下两种形式都是RTTI，因为类在classPath路径下，编译器可以找到
  Class c=类名.class
  Class c=Class.forName(String className)
  ```

- 类在编译前未知，在程序运行时才知道。这就是反射。比如：

  ```java
  //args[0]是一串代表一个类的字节，程序运行前，编译器是不知道该类的
  Class c=Class.forName(String args[0])
  ```

总结：

- 反射：.class文件在编译时不可获得，所以在运行时打开和检查未知类，从而使.class文件变为已知
- RTTI：.class文件是在编译时打开和检查

#### 11.6.1类方法提取器

通过反射机制，可以动态提取一个类的所有方法（包括继承而来的方法）

```java
package typeinfo;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.regex.Pattern;

class Test{
    public static void main(String...args){
        ShowMethods.main("typeinfo.ShowMethods");
    }
}

public class ShowMethods {
    private static String usage="usage:\n"+
            "ShowMethods qualified.class.name\n"+
            "To show all methods in class or:\n"+
            "ShowMethods qualified.class.name word\n"+
            "To search for methods involving 'word'";
    private static Pattern p=Pattern.compile("\\w+\\.");
    public static void main(String...args){
        if(args.length<1){
            System.out.println(usage);
            System.exit(0);
        }
        int lines=0;
        try{
            //Class.forName()方法接收一串代表一个类的字符串
            //所以Class.forName()方法生成的结果在编译时是不可知的
            Class<?> c=Class.forName(args[0]);
            //getMethods()方法返回Method对象的数组
            Method[] methods=c.getMethods();
            //getConstructors()方法返回Constructor对象的数组
            Constructor[] ctors=c.getConstructors();
            if(args.length==1){
                for(Method method:methods){
                    System.out.println(p.matcher(method.toString()).replaceAll(""));
                }
                for(Constructor ctor:ctors){
                    System.out.println(p.matcher(ctor.toString()).replaceAll(""));
                }
                lines=methods.length+ctors.length;
            }
            else {
                for(Method method:methods){
                    if(method.toString().contains(args[1])){
                        System.out.println(p.matcher(method.toString()).replaceAll(""));
                        lines++;
                    }
                }
                for(Constructor ctor:ctors){
                    if(ctor.toString().contains(args[1])){
                        System.out.println(p.matcher(ctor.toString()).replaceAll(""));
                        lines++;
                    }
                }
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}/*output
public static void main(String[])
public final native void wait(long) throws InterruptedException
public final void wait(long,int) throws InterruptedException
public final void wait() throws InterruptedException
public boolean equals(Object)
public String toString()
public native int hashCode()
public final native Class getClass()
public final native void notify()
public final native void notifyAll()
public ShowMethods()
*/
```

### 11.7动态代理

代理是基本的设计模式之一，代理对象可以帮助被代理对象做一些额外操作，使得被代理对象能过更加关注自身业务逻辑

代理类要和被代理类实现同一接口，代理类通过持有被代理类的对象，对被代理类中的方法进行调用，并插入新的操作

静态代理

```java
package typeinfo;


interface Interface{
    void doSomething();
    void somethingElse(String arg);
}
//被代理类
class RealObject implements Interface{
    @Override
    public void doSomething() {
        System.out.println("doSomething");
    }

    @Override
    public void somethingElse(String arg) {
        System.out.println("somethingElse"+arg);
    }
}
//代理类
class SimpleProxy implements Interface{
    //持有被代理类的对象
    private Interface proxied;
    SimpleProxy(Interface proxied){
        this.proxied=proxied;
    }
    @Override
    public void doSomething() {
        //插入额外操作
        System.out.println("SimpleProy doSomething");
        //调用被代理类对象的方法
        proxied.doSomething();
    }

    @Override
    public void somethingElse(String arg) {
        System.out.println("SimpleProy somethingElse"+arg);
        proxied.somethingElse(arg);
    }
}

public class SimpleProxyDemo {
    public static void consumer(Interface iface){
        iface.doSomething();
        iface.somethingElse("bonobo");
    }
    public static void main(String...args){
        consumer(new RealObject());
        consumer(new SimpleProxy(new RealObject()));
    }
}/*output
doSomething
somethingElsebonobo
SimpleProy doSomething
doSomething
SimpleProy somethingElsebonobo
somethingElsebonobo
*/
```

Java的动态代理比静态代理思想更进一步，因为它是通过反射机制动态地创建代理类对象，在动态代理类对象上做的所有方法调用都会被重定向至单一的调用处理器上

```java
package typeinfo;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

//DynamicProxyHandler类实现了InvocationHandler接口，是有一个调用处理器
//动态生成的代理对象调用的所有方法都会进入该处理器
public class DynamicProxyHandler implements InvocationHandler {
    //用于保存被代理类的对象
    private Object proxied;
    public DynamicProxyHandler(Object proxied){
        this.proxied=proxied;
    }
    //动态生成的代理对象调用的所有方法都会在此处被拦截，进入invoke()方法内部
    //参数o是动态生成的代理对象，参数method是当前所调用的方法对应的Method对象，参数objects是当前所调用的方法的参数列表
    @Override
    public Object invoke(Object o, Method method, Object[] objects) throws Throwable {
        //插入额外操作
        System.out.println("****proxy:"+o.getClass()+",method:"+method+"args:"+objects);
        if(objects!=null){
            for(Object obj :objects){
                System.out.println(" "+obj);
            }
        }
        //method.invoke()方法，用于调用被代理类对象的实际方法，返回实际方法执行后的返回值
        return method.invoke(proxied,objects);
    }
}
class SimpleDynamicProxy{
    public static void consumer(Interface iface){
        iface.doSomething();
        iface.somethingElse("bonobo");
    }
    public static void main(String...args){
        RealObject real=new RealObject();
        consumer(real);
        //Proxy.newProxyInstance()是一个静态方法
        //该方法参数会表明动态生成的代理类对象所使用的类加载器、要实现的接口以及方法的调用处理器
        //它会通过传入的参数，使用反射动态地生成一个代理类对象
        Interface proxy=(Interface) Proxy.newProxyInstance(Interface.class.getClassLoader(),new Class[]{Interface.class},new DynamicProxyHandler(real));
        consumer(proxy);
    }
}/*output
doSomething
somethingElsebonobo
****proxy:class typeinfo.$Proxy0,method:public abstract void typeinfo.Interface.doSomething()args:null
doSomething
****proxy:class typeinfo.$Proxy0,method:public abstract void typeinfo.Interface.somethingElse(java.lang.String)args:[Ljava.lang.Object;@5ce65a89
 bonobo
somethingElsebonobo
*/
```

动态代理与反射：当使用` Object proxy = Proxy.newProxyInstance(定义代理对象的类加载器,要代理的目标对象的归属接口数组,回调接口InvocationHandler);`时，JDK的动态代理会动态的创建一个`$Proxy0`的类，这个类继承了Proxy并且实现了要代理的目标对象的接口，但是在JDK中是找不到这个类的，因为它是动态生成的。所以说Java的动态代理是通过反射实现的

## 13.泛型

泛型实现了“参数化类型”的概念，使代码可以应用于多种类型

### 13.1简单泛型

在JavaSE5之前，并没有引入泛型的概念，如果想要一个类可以储存任何类型的对象，我们可以让该类直接持有`Object`类型的对象的引用：

```java
package generics;

class Automobile{}

public class Holder2 {
    //持有Object类型的对象的引用，用来接受不同的类型
    private Object a;
    public Holder2(Object a){
        this.a=a;
    }

    public void setA(Object a) {
        this.a = a;
    }

    public Object getA() {
        return a;
    }

    public static void main(String...args){
       Holder2 h=new Holder2(new Automobile());
        //返回的是Object类型的引用，所以要强制类型转换
       Automobile a= (Automobile) h.getA();
        //持有Object类型的引用，可以让Holder2对象储存不同类型的对象
       h.setA("Not an Automobile");
       String s=(String)h.getA();
       h.setA(1);
       Integer x=(Integer)h.getA();
    }
}
```

泛型类：在定义类的时候，在类名后使用`<>`将类型参数括住。然后在使用这个类的时候，再用实际类型替换此类型参数。例如：

```java
package generics;

class Automobile{}
//Holder为泛型类，能适用于各种类型的代码，T为类型参数
public class Holder<T> {
    private T a;
    public Holder(T a){
        this.a=a;
    }

    public void setA(T a) {
        this.a = a;
    }

    public T getA() {
        return a;
    }
    public static void main(String...args){
        //创建泛型类的对象时，要声明用于替换类型参数的实际类型，并置于<>中
        //使用泛型语法声明过的对象，就只能明确储存一种类型的对象
        //如果要储存其他类型的对象，就必须重新创建一个
        Holder<Automobile> h=new Holder<>(new Automobile());
        //使用泛型语法，不需要强制类型转换
        Automobile a=h.getA();
        //h只能储存Automobile对象，不能存储其他类型
        //h.setA(1);//报错
        //h.setA("Not an Automobile");//报错
    }
}
```

同持有`Object`类型的对象的引用相比，使用泛型语法会让该类持有的对象更加明确，同时在取出对象时也不需要类型转换

### 13.2泛型接口

泛型也可以应用于接口，语法与泛型类一样，并且在实现接口的时候需要声明泛型接口的实际类型

生成器，这是一种专门负责创建对象的类。实际上，生成器也是工厂方法设计模式的一种应用，但是使用生成器创建新对象时，不需要任何参数，而工厂方法一般需要参数。创建一个生成器接口就需要用到泛型

```java
package generics;

import java.util.Iterator;
import java.util.Random;
//生成器接口，泛型接口的语法与泛型类一样
//实现生成器接口需要实现next方法，用于生成对象
interface Generator<T>{
    T next();
}

class Coffee{
    private static long counter=0;
    private final long id=counter++;

    @Override
    public String toString() {
        return getClass().getSimpleName()+" "+id;
    }
}
class Latte extends Coffee{}
class Mocha extends Coffee{}
class Cappuccino extends Coffee{}
//实现Iterable接口需要实现iterator方法，该方法返回一个迭代器
public class CoffeeGenerator implements Generator<Coffee>,Iterable<Coffee> {
    private Class[] types={Coffee.class,Mocha.class,Latte.class,Cappuccino.class};
    private static Random rand=new Random(47);
    public CoffeeGenerator(){}
    private int size=0;
    public CoffeeGenerator(int size){
        this.size=size;
    }
    @Override
    public Coffee next() {
        try {
            return (Coffee)types[rand.nextInt(types.length)].newInstance();
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @Override
    public Iterator<Coffee> iterator() {
        //使用匿名内部类创建一个迭代器对象
        return new Iterator<Coffee>() {
            int count=size;
            @Override
            public boolean hasNext() {
                return count>0;
            }

            @Override
            public Coffee next() {
                try{
                    count--;
                    return(Coffee) types[count].newInstance();
                }catch (Exception e){
                    throw new RuntimeException(e);
                }
            }
        };
    }
    public static void main(String...args){
        CoffeeGenerator gen=new CoffeeGenerator();
        for(int i=0;i<5;i++){
            System.out.println(gen.next());
        }
        for (Coffee c:new CoffeeGenerator(4)){
            System.out.println(c);
        }
    }
}/*output
Latte 0
Mocha 1
Latte 2
Coffee 3
Coffee 4
Cappuccino 5
Latte 6
Mocha 7
Coffee 8
*/
```

### 13.3泛型方法

泛型同样可以应用于方法，包含泛型方法的类可以是泛型类，也可以不是泛型类。，所以是否拥有泛型方法，与其所在的类是否泛型并无关系，**泛型方法可以独立类而产生变化**。另外，`static`方法是无法访问泛型类的类型参数，如果`static`方法需要使用泛型能力，就必须使其称为泛型方法

泛型方法：只需将泛型参数列表置于方法声明的返回类型之前,并用`<>`括起来。例如：

```java
package generics;

public class GenericMethods {
    //T是参数类型，该类型参数只能用于该方法
    public <T> void f(T x){
        System.out.println(x.getClass().getName());
    }
    public static void main(String...args){
        GenericMethods gm=new GenericMethods();
        //使用泛型方法，并不需要指明参数类型
        gm.f("");
        gm.f(1);
        gm.f(1.0);
        gm.f(1.0F);
        gm.f(gm);
    }
}/*output
java.lang.String
java.lang.Integer
java.lang.Double
java.lang.Float
generics.GenericMethods
*/
```

使用泛型类时，必须在创建对象的时候指定类型参数的值，与之相比，使用泛型方法并不需要指明参数类型，因为编译器会为我们找出具体的类型

#### 13.3.1可变参数与泛型方法

泛型方法与可变参数列表能很好地共存

```java
package generics;

import java.util.ArrayList;
import java.util.List;

public class GenericVarargs {
    //泛型方法与可变长参数共同应用
    public static <T> List<T> makeList(T...args){
        List<T> result=new ArrayList<>();
        for(T item:args){
            result.add(item);
        }
        return result;
    }
    public static void main(String...args){
        List<String> ls=makeList("A");
        System.out.println(ls);
        ls=makeList("A","B","C");
        System.out.println(ls);
    }
}/*output
[A]
[A, B, C]
*/
```

### 13.4擦除地神秘之处

在还没有引入泛型之前，Java在需要使用泛型（模板代码）的地方都是通过持有`Object`类型的对象的引用，将传入的对象向上转型及将取出的对象强制转换来完成的，这其中最大的问题就在于类型安全，比如我们能向容器中加入不正确的类型，当取出对象并且强制转换时就会报错。因此，Java引入了泛型来避免这一问题

Java泛型实现了前后兼容，即在引入泛型之前的模板代码现在依然能够正常使用，也能被应用于泛型，比如：

```java
//不使用泛型的容器类，也能正常使用，只是取出对象时需要强制类型转换
List rawlist=new ArrayList();
//泛型也能应用于容器
List<String> list=new ArrayList<>();
```

所以为了实现前后兼容，**Java泛型对于JVM来说必须是透明的（擦除），有泛型和没有泛型的代码，通过编译器编译后生成的字节码是完全相同的**

**Java泛型采用擦除机制来实现的，与未引入泛型的模板代码的实现相比，仅仅只是在原本的基础上加了编译时类型检查，在编译成字节码文件后，Java会将代码中声明的具体类型都擦除并使用Object类型来代替，并在需要强制类型转换的地方添加强制类型转换的语法**

比如：

```java
//泛型语法的Demo1
public class Demo1<T>{
    T obj;
    public Demo(T obj1,T obj2){}
    public T get(){}
}
//擦除后的原始类型
//类型参数T是个无界泛型参数，所以用Object替换
public class Demo1{
    Object obj;
    public Demo(Object obj1,Object obj2){}
    public Object get(){}
}
```

Java泛型擦除的体现：

```java
package generics;

import java.util.ArrayList;

public class ErasedTypeEquivalence {
    public static void main(String...args){
        //因为泛型擦除机制，所以c1和c2在运行期都是同一个类型ArrayList，它们的泛型在编译后都被擦除
        Class c1=new ArrayList<String>().getClass();
        Class c2=new ArrayList<Integer>().getClass();
        System.out.println(c1+", "+c2);
    }
}/*output
class java.util.ArrayList, class java.util.ArrayList
*/
```

由于擦除机制，在运行期泛型最终都会被擦除为Object类型，所以泛型元素只能调用Object类型的方法，否则会出错：

```java
package generics;

class HasF{
    public void f(){
        System.out.println("HasF.f()");
    }
}

class Manipulator<T>{
    private T obj;
    public Manipulator(T x){
        obj=x;
    }
    public void manipulate(){
        //由于擦除机制，所以在运行期obj是一个Object类型的引用，只能调用Object类的方法
        //obj.f();//报错
    }
}

public class Manipulation {
    public static void main(String...args){
        HasF hasF=new HasF();
        Manipulator<HasF> manipulator=new Manipulator<>(hasF);
        manipulator.manipulate();
    }
}
```

#### 13.4.1擦除的问题

擦除和前后兼容性意味着，使用泛型并不是强制的：

```java
package generics;

class GenericBase<T>{
    private T element;

    public void setElement(T element) {
        this.element = element;
    }

    public T getElement() {
        return element;
    }
}
//继承的基类如果带着类型参数，那么子类声明时也要带着类型参数
class Derived1<T> extends GenericBase<T>{}
//继承的基类如果没有类型参数，那么子类声明也不必有
class Derived2 extends GenericBase{}
//继承的基类声明了具体类型，那么子类随意
class Derived2 extends GenericBase<Integer>{}
//class Derived3 extends GenericBase<T>{}//报错
public class ErasureAndInheritance {
    public static void main(String...args){
        Derived2 d2=new Derived2();
        Object obj=d2.getElement();
        //派生类Derived2没有使用泛型语法，所以在对其设置元素时，会产生警告
        //因为没有泛型就没有编译期检查，所以元素可能会设置为错误的类型
        d2.setElement(obj);
    }
}
```

### 13.5擦除的补偿

由于擦除机制，Java泛型具有一定的局限性：

- 运行时类型查询只适用于原始类型

  虚拟机中的对象总有一个特定的非泛型类型。因此，所有的类型查询（`instanceof`）只适用于原始类型。另外，泛型类型的强制类型转换也会得到编译器的一个警告

  ```java
  //Pair<String>和Pair<T>在运行时类型已经被擦除为Pair类型，以下两行仅仅只是测试对象a是否是一个Pair类型
  //对象a是一个具体的实例，而Pair类型在运行时是一个不具体的类
  if(a instanceof Pair<String>)//报错
  if(a instanceof Pair<T>)//报错
  //强制转换会在运行时查询类型，由于泛型被擦除，所以以下代码只是将Pair类型转换为Pair类型
  Pair<String> p=(Pair<String>)a;//报错
  ```

- 不能创建参数化类型的数组

  ```java
  Pair<String>[] table=new Pair<String>[10]//报错
  //如果能创建参数化类型的数组，那么泛型擦除后，数组中实际存储的是Pair类型的对象，而不是String类型
  table[0]="Hello";//报错
  //并且由于擦除机制，会使得参数化类型数组可以存储任意的其他类型，所以不能创建参数化类型数组
  table[0]=new Pair<Employee>();//报错
  ```

- 不能实例化类型变量

  不能使用像`new T(...)`，`new T[...]`或者`T.class`这样的语句

  ```java
  public Pair()<T>{
      //泛型擦除后，T会改为Object，那么这样就是调用new Object()肯定是不合理的
  	T first=new T();//报错
  }
  ```

解决办法：

- 使用动态的`isInstance()`方法进行运行时类型查询

  ```java
  package generics;
  
  import java.util.ArrayList;
  import java.util.List;
  
  class Building{}
  class House extends Building{}
  
  public class ClassTypeCapture<T> {
      private Class<T> kind;
      //显式的传入类型的Class对象
      public ClassTypeCapture(Class<T> kind){
          this.kind=kind;
      }
      public boolean f(Object arg){
          //通过反射获得类型信息，并判断对象arg是否为该类型的实例
          return kind.isInstance(arg);
      }
  }
  ```

- 使用容器类`ArrayList`来代替泛型数组，不仅能获得数组的行为，同时也能获得由泛型提供的编译期的类型安全检查。`ArrayList`内部使用的也是数组（`Object`类型）

  ```java
  package generics;
  
  import java.util.ArrayList;
  import java.util.List;
  
  public class ListOfGenerics<T> {
      private List<T> array=new ArrayList<>();
  }
  
  ```

- 使用`newInstance()`方法创建类型实例

  ```java
  package generics;
  
  class ClassAsFactory<T> {
      T x;
      //通过传入类型的Class对象
      public ClassAsFactory(Class<T> kind){
          try{
              //调用Class对象的newInstance方法创建类实例
              //基本类型对应的包装器类型的实例不能通过此方法创建，因为它们没有默认构造器，只能使用工厂类来创建
              x=kind.newInstance();
          }catch (Exception e){
              throw new RuntimeException(e);
          }
      }
  }
  class Employee{}
  public class InstantiateGenericType{
      public static void main(String...args){
          ClassAsFactory<Employee> fe=new ClassAsFactory<>(Employee.class);
      }
  }
  ```

### 13.6边界

Java的泛型边界使得我们可以在用于泛型的参数类型上设置限制条件，来强制规定泛型可以应用的类型，其潜在的重要效果是我们可以按照设置的边界类型来调用方法

因为擦除了类型信息，所以无界泛型参数可以调用的只能是`Object`类型自带的方法，比如：`class Demo<T>`中的T就是一个无界泛型参数，类中的T类型的域，擦除后会替换为`Object`类型，只能调用`Object`类型的方法

Java泛型重用了`extends`关键字来限制泛型边界，用于将泛型参数限制为某个类型的子集，这样该参数就可以调用这个类型的方法：

```java
package generics;
import java.awt.Color;

interface HasColor{
    Color getColor();
}
//java泛型只会擦除到第一个边界
//擦除后变为class Colored implements HasColor
//类中所有的T都用HasColor替换，所以可以调用HasColor中的方法
class Colored<T extends HasColor>{
    T item;
    Colored(T item){
        this.item=item;
    }
    T getItem(){
        return item;
    }
    Color color(){
        return item.getColor();
    }
}
class Dimension{
    public int x,y,z;
}
//设置多边界，只能先类后接口
//class ColoredDimension<T extends HasColor & Dimension>
//擦除后变为class ColoredDimension extends Dimension
//类中所有的T用Dimension替换，所以可以调用Dimension中的方法
//调用到HasColor中的方法时，编译期会自动添加强制类型转换的语法
class ColoredDimension<T extends Dimension & HasColor>{
    T item;
    ColoredDimension(T item){
        this.item=item;
    }
    T getItem(){
        return item;
    }
    Color color(){
        //擦除后变为return ((HasColor)this.item).getColor();
        return item.getColor();
    }
    int getX(){
        return item.x;
    }
    int getY(){
        return item.y;
    }
    int getZ(){
        return item.z;
    }
}
interface Weight{
    int weight();
}
//同上
class Solid<T extends Dimension & HasColor & Weight>{
    T item;
    Solid(T item){
        this.item=item;
    }
    T getItem(){
        return item;
    }
    Color color(){
        return item.getColor();
    }
    int getX(){
        return item.x;
    }
    int getY(){
        return item.y;
    }
    int getZ(){
        return item.z;
    }
    int weight(){
        return item.weight();
    }
}
class Bounded extends Dimension implements HasColor,Weight{

    @Override
    public Color getColor() {
        return null;
    }

    @Override
    public int weight() {
        return 0;
    }
}

public class BasicBounds {
    public static void main(String...args){
        //Solid的构造器只能接受一个继承了Dimension类同时实现了HasColor和Weight接口的对象
        Solid<Bounded> solid=new Solid<>(new Bounded());
        solid.color();
        solid.getY();
        solid.weight();
    }
}
```

Java泛型擦除只会擦除到第一个边界，也就是即使是多边界的泛型，在擦除后也只会用第一个边界去替换类型参数，并在调用其他边界的方法处自动插入强制类型转换的代码。以`ColoredDimension`类为例：

编译前

```java
class ColoredDimension<T extends Dimension & HasColor>{
    T item;
    ColoredDimension(T item){
        this.item=item;
    }
    T getItem(){
        return item;
    }
    Color color(){
        return item.getColor();
    }
    int getX(){
        return item.x;
    }
    int getY(){
        return item.y;
    }
    int getZ(){
        return item.z;
    }
}
```

编译后

```java
class ColoredDimension extends Dimension {
    Dimension item;

    ColoredDimension(Dimension item) {
        this.item = item;
    }

    Dimension getItem() {
        return this.item;
    }

    Color color() {
        return ((HasColor)this.item).getColor();
    }

    int getX() {
        return this.item.x;
    }

    int getY() {
        return this.item.y;
    }

    int getZ() {
        return this.item.z;
    }
}
```

### 13.7通配符

- 协变：子类能向父类转换 `Animal a1=new Cat();`
- 逆变: 父类能向子类转换 `Cat a2=(Cat)a1;`
- 不变: 两者均不能转变

在Java中，数组是协变的，这会导致错误的类型被插入数组中并且在编译期是无法检测出来，只有在运行期才会暴露，这样无法保证类型安全：

```java
public static void error(){
    //数组是协变的，所以Integer[]可以转换为Object[]
   Object[] nums=new Integer[3];
   nums[0]=3.2;
   nums[1]="string"; //运行时报错，nums运行时类型是Integer[]
   nums[2]='2';
 }
```

Java引入泛型的主要原因之一就是为了在编译期保证类型安全，所以泛型不能被设计为协变的，泛型是不变的：

```java
package generics;

import java.util.ArrayList;
import java.util.List;

class Fruit{}
class Apple extends Fruit{}
public class NonCovariantGenerics {
    //泛型是不变的，所以List<Fruit>和List<Apple>是没有任何关系的，即使Fruit是Apple的父类
    //List<Fruit>是Fruit类型的容器，可以持有Fruit及其子类型			//List<Apple>是Apple类型的容器，可以持有Apple及其子类型
    //两者是不同类型的容器
    //List<Fruit> fruitList= new ArrayList<Apple>();//报错
}
```

如果想让泛型也具有协变性，就要让通配符`?`与`extends`结合使用：

```java
package generics;

import java.util.ArrayList;
import java.util.List;

class Fruit{}
class Apple extends Fruit{}
public class GenericsAndCovariance {
    public static void main(String...args){
        //通配符?表示一个通用类型，<? extends Fruit>所表示的就是继承Fruit类的任意类型
        //List<? extends Fruit>所声明的引用可以指向任何继承了Fruit的类所创建的对象
        List<? extends Fruit> fruits=new ArrayList<Apple>();
        //让泛型容器具有协变性后，我们就失去了向泛型容器中添加对象的能力，但是可以添加null
        fruits.add(null);
        //不允许添加对象，是为了保证运行时类型安全
        //fruits.add(new Apple());
        //fruits.add(new Object());
        //但是从容器中取出对象是安全,因为该容器中的对象至少具有Fruit类型
        Fruit f=fruits.get(0);
    }
}
```

#### 13.7.1逆变

如果想让泛型具有逆变性，就要让通配符`?`与`super`结合使用：

```java
package generics;

import java.util.List;

class Fruit{}
class Apple extends Fruit{}
public class SuperTypeWildcards {
    //<? super Apple>表示Apple的某个父类
    //List<? super Apple>表示的是Apple的某个父类型的容器
    static void writeTo(List<? super Apple> apples){
        //向该容器中添加Apple类型的对象是安全的，因为Apple的某个父类型的容器也能持有Apple类型的对象
        apples.add(new Apple());
        //不能添加除Apple类型的对象，否则类型不安全
        //apples.add(new Fruit());//报错
    }
}
```

#### 13.7.2无界通配符

无界通配符`?`，告诉编译器，我这里需要使用泛型，但是一时我还没有决定类型参数是什么，暂时是全配

比如`Pair<?>`，它与原始的`Pair`类型不同：当使用原始类型创建的对象时，编译器会放弃编译期检查，可以将任何类型的对象传递给`set()`方法；而在使用无界通配符限定的对象时，编译器会知道此处使用了泛型，从而限制对`set()`方法的调用：

```java
static void rawArgs(Holder holder,Object arg){
    	//原始类型没有任何限制，因为编译器不对此作编译期检查
        holder.setA(arg);
        Object obj=holder.getA();
}
static void unboundedArg(Holder<?> holder,Object arg){
  		//编译器知道此处使用了泛型，限制我们对setA方法的调用，从而防止不同对象传入该方法
		//holder.setA(arg);
        Object obj=holder.getA();
}

```

#### 13.7.3捕获转换

有一种情况特别需要使用通配符`?`而不是原始类型：如果向一个使用通配符的方法传递原始类型，那么对编译器来说，可能会推断出实际的类型参数，使得这个方法可以回转并调用另一个使用这个确切类型的方法：

```java
package generics;

public class CaptureConversion {
    static <T> void f1(Holder<T> holder){
        T t=holder.getA();
        System.out.println(t.getClass().getSimpleName());
    }
    static void f2(Holder<?> holder){
        //f1方法中的参数T捕获通配符，编译器会推断出实际的类型参数，使得f1可以被调用
        f1(holder);
    }
    public static void main(String...args){
        Holder raw=new Holder<Integer>(1);
        f2(raw);
        Holder rawBasic=new Holder(new Object());
        f2(rawBasic);
        //Holder<Double>允许被向上转型为Holder<?>
        //因为Holder<?>是一个通用的类型
        Holder<?> wildcarded=new Holder<Double>(1.0);
        f2(wildcarded);
    }
}/*output
Integer
Object
Double
*/
```

### 13.8问题

#### 13.8.1任何基本类型都不能作为类型参数

如果用基本类型实例化类型参数，比如`Pair<double>`，那么在类型擦除后，`Pair`类中所有泛型域都变为`Object`类型，而`Object`类型不能存储`double`值，因此只能用基本类型对应的包装器类型来实例化类型参数，比如`Pair<Double>`

#### 13.8.2实现参数化接口

一个类不能实现同一个泛型接口的两种变体，由于擦除的原因，这两个变体会成为相同的接口

```java
interface Payable<T>{}
class Employee1 implements Payable<Employee>{}
//Payable<Employee>和Payable<Hourly>在擦除后都是Payable，Hourly重复实现了两个相同的接口
class Hourly extends Employee1 implements Payable<Hourly>{}
```

#### 13.8.3转型和警告

使用带有泛型类型参数的转型或`instanceof`不会有任何效果：

```java
package generics;

public class FixedSizeStack<T> {
    private Object[] storage;
    public T pop(){
        //实际上pop()方法并没有执行任何转型，因为擦除后T被替换为Object类型，所以只是将Object转型为Object
        //该转型会被警告
        return (T) storage[0];
    }
}
```

有时，在使用泛型必须要进行转型的时候，这就会由编译器产生警告，而这个警告是不恰当的：

```java
package generics;


import java.io.FileInputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.util.List;

public class NeedCasting {
    public void f(String...args) throws IOException, ClassNotFoundException {
        ObjectInputStream in=new ObjectInputStream(new FileInputStream(args[0]));
        //readeObject()方法无法知道它正在读取的是什么，所以只能返回Object类型，并由用户强制类型转换
        //但编译器依旧会对此产生警告
        List<Integer> shapes=(List<Integer>)in.readObject();
    }
}
```

解决办法：采用`Class`对象的转型方法

```java
//使用泛型类对应的Class对象的cast方法进行转型可以消除警告
//只是不能转型为实际类型，即List<Integer>
List shapes=List.class.cast(in.readObject());
        //List<Integer> shapes=List<Integer>.class.cast(in.readObject();//报错
```

#### 13.8.4重载

```java
package generics;

import java.util.List;
//无法编译，会报错
public class UseList<W,T> {
    //由于擦除原因，重载方法f将产生相同的方法签名，即void f(List<Object> v){}
    //编译器无法区分
    void f(List<T> v){}
    void f(List<W> v){}
}
```

### 13.9自限定的类型

自限定类型的标准用法：`class SelfBounded<T extends SelfBounded<T>`，它可以强制将当前正在定义的类当作参数传递给基类，也可以将基类其他的派生类当作参数传递给基类

```java
package generics;

class SelfBounded<T extends SelfBounded<T>>{
    T element;
    SelfBounded<T> set(T arg){
        element=arg;
        return this;
    }
    T get(){
        return element;
    }
}
//将当前正在定义的类A传递给基类的类型参数
class A extends SelfBounded<A>{}
//SelfBounded的另一个派生类A也能传递
class B extends SelfBounded<A>{}
class C extends SelfBounded<C>{
    C setAndGet(C arg){
        set(arg);
        return get();
    }
}
class D{}
//D没有继承SelfBounded类
//class E extends SelfBounded<D>{}//报错
class F extends SelfBounded {}
public class SelfBounding {
    public static void main(String...args){
        A a=new A();
        a.set(new A());
        a=a.get();
        C c=new C();
        c=c.setAndGet(new C());
    }
}
```

#### 13.9.1参数协变

自限定类型的价值在于它们可以产生协变参数类型，即方法参数类型会随子类而变化

```java
package generics;

interface SelfBoundSetter<T extends SelfBoundSetter<T>>{
    void set(T arg);
}
//Setter继承了SelfBoundSetter，并以自身为参数传入，这样就会覆盖基类中的方法参数
//变为void set(Setter arg)
interface Setter extends SelfBoundSetter<Setter>{}
public class SelfBoundingAndCovariantArguments {
    void testA(Setter s1,Setter s2,SelfBoundSetter sbs1){
        //派生类对象的set方法只能接受派生类型，不能接受基类型作为参数
        s1.set(s2);
        //s1.set(sbs1);
    }
}
```

### 13.10动态类型安全

由于泛型的前后兼容，所以我们依旧可以像JavaSE5之前的代码传递泛型容器，但是旧代码很可能会破坏容器，为此JavaSE5的`java.util.Collections`中提供了一组便利工具，可以解决在这种情况下的类型检查问题：静态方法`checkedCollection()`、`checkedList()`、`checkedMap()`、`checkedSet()`、`checkedSortedMap()`和`checkedSortedSet()`。这些方法都会将你希望动态检查的容器当作第一个参数接受，并将你希望强制要求的类型所对应的`Class`对象 作为第二个参数接受

受检查的容器在你试图插入类型不正确的对象时抛出`ClassCastException`，这与原始类型的容器形成了对比，对于后者来说，当你将对象从容器中取出时，才会通知你出现了问题

```java
package generics;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
class Cat{}
class Dog{}
public class CheckedList {
    //用一个原始类型的List引用来接受传递进来的泛型List
    static void oldStyleMethod(List probablyDogs){
        //原始类型的List引用可以插入任意对象而不受检查
        probablyDogs.add(new Cat());
    }
    public static void main(String...args){
        List<Dog> dogs1=new ArrayList<>();
        //dogs1传入oldStyleMethod()方法不会报错
        oldStyleMethod(dogs1);
        //Collections.checkedList()创建的对象dogs2会被动态检查
        //dogs2对象已经被限定为只能添加Dog类型的对象
        List<Dog> dogs2=Collections.checkedList(new ArrayList<Dog>(),Dog.class);
        try{
            //dog2传入oldStyleMethod()方法会报错，因为添加了Cat对象
            oldStyleMethod(dogs2);
        }catch (Exception e){
            System.out.println(e);
        }
    }
}/*output
java.lang.ClassCastException: Attempt to insert class generics.Cat element into collection with element type class generics.Dog

```

### 13.11异常

由于擦除的原因，我们既不能抛出也不能捕获泛型类对象，甚至泛型类继承`Throwable`都是不合法的，但是在异常说明`throws`语句中使用类型参数是允许的：

```java
public static <T extends Throwable> void doWork(T t) throws T{
    try{
         //dowork
     }catch (Exception e){
        throw (T) e;
   	}
    //catch(T e)是不合法的
}
```

## 14.集合源码探究

### 14.1HashMap源码探究

- JDK 7版本源码

  - 类属性

    ```java
    //HashMap内部数组的初始容量为1 << 4,即1*2^4=16，并且内部数组的容量必须为2的n次幂（用于在计算hash值代替取模运算，效率更高）
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
    
    //HashMap内部数组的最大容量1 << 30，即1*2^30
    static final int MAXIMUM_CAPACITY = 1 << 30;
    
    //HashMap初始的负载因子0.75
    static final float DEFAULT_LOAD_FACTOR = 0.75f;
    
    //HashMap的内部数组，用于存储一个个Entry链表
    transient Entry<K,V>[] table = (Entry<K,V>[]) EMPTY_TABLE;
    
    //HashMap内部数组已使用容量
    transient int size;
    
    //阈值，用于判断内部数组是否需要扩容（threshold=loadFactor*capacity）
    int threshold;
    
    //负载因子
    final float loadFactor;
    
    //修改次数，用于实现Fail-Fast快速失败机制
    transient int modCount;
    ```

  - 相关辅助方法

    ```java
    //当用户指定的初始容量不是2^n次幂，则会使用该方法获取大于指定初始容量的最小的2^n次幂
    private static int roundUpToPowerOf2(int number) {
        // assert number >= 0 : "number must be non-negative";
        return number >= MAXIMUM_CAPACITY
                ? MAXIMUM_CAPACITY
                : (number > 1) ? Integer.highestOneBit((number - 1) << 1) : 1;
    }
    
    //初始化内部数组
    private void inflateTable(int toSize) {
        //寻找大于指定初始容量的最小的2^n次幂
        int capacity = roundUpToPowerOf2(toSize);
    	//计算内部数组的阈值，即已使用容量size的最大值
        threshold = (int) Math.min(capacity * loadFactor, MAXIMUM_CAPACITY + 1);
        //初始化内部数组
        table = new Entry[capacity];
        initHashSeedAsNeeded(capacity);
    }
    
    //计算传入对象的hash值，该方法能有效降低发生哈希冲突的概率
    final int hash(Object k) {
        int h = hashSeed;
        if (0 != h && k instanceof String) {
            return sun.misc.Hashing.stringHash32((String) k);
        }
    	//通过右移和异或操作来计算hash值
        h ^= k.hashCode();
        h ^= (h >>> 20) ^ (h >>> 12);
        return h ^ (h >>> 7) ^ (h >>> 4);
    }
    
    //通过对象的hash值与内部数组容量-1进行逻辑与运算来定位到该对象在数组中的下标
    static int indexFor(int h, int length) {
        // assert Integer.bitCount(length) == 1 : "length must be a non-zero power of 2";
        return h & (length-1);
    }
    
    ```
    
  - 构造方法
  
    ```java
    //创建HashMap对象时，可以指定初始的容量和负载因子
    public HashMap(int initialCapacity, float loadFactor) {
        //初始容量小于0会抛异常
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " +
                                               initialCapacity);
        //初始容量最大也只能到达MAXIMUM_CAPACITY，即2^30
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        //如果负载因子小于等于0或超出范围，也会抛异常
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " +
                                               loadFactor);
    	//初始化类属性
        this.loadFactor = loadFactor;
        threshold = initialCapacity;
        init();
    }
    
    //创建HashMap对象时，可以指定初始的容量
    public HashMap(int initialCapacity) {
        //初始容量指定，负载因子默认为0.75
        this(initialCapacity, DEFAULT_LOAD_FACTOR);
    }
    
    //默认构造方法
    public HashMap() {
        //初始容量使用默认值16，负载因子使用默认值0.75
        this(DEFAULT_INITIAL_CAPACITY, DEFAULT_LOAD_FACTOR);
    }
    
    //创建HashMap对象时，可以传入一个Map对象来初始化
    public HashMap(Map<? extends K, ? extends V> m) {
        //初始容量可通过计算公式expectSize/loadFactor+1得，并与默认初始化容量中取最大值
        //负载因子使用默认值0.75
        this(Math.max((int) (m.size() / DEFAULT_LOAD_FACTOR) + 1,
                      DEFAULT_INITIAL_CAPACITY), DEFAULT_LOAD_FACTOR);
        //初始化内部数组
        inflateTable(threshold);
        //将Map中的元素逐个添加到内部数组中
        putAllForCreate(m);
    }
    ```
    
  - 嵌套类`Entry`
  
    ```java
    //内部数组的元素类型，链表结构
    static class Entry<K,V> implements Map.Entry<K,V> {
        //键
        final K key;
        //值
        V value;
        //指向下一个Entry节点的指针
        Entry<K,V> next;
        //hash值，用于计算当前Entry节点在数组中的下标
        int hash;
    
       	//创建一个Entry节点
        Entry(int h, K k, V v, Entry<K,V> n) {
            value = v;
            //采用头插法，将新建的Entry节点的next指针指向传入的节点
            next = n;
            key = k;
            hash = h;
        }
    	//取键
        public final K getKey() {
            return key;
        }
    	//取值
        public final V getValue() {
            return value;
        }
    	//设值，并返回旧值
        public final V setValue(V newValue) {
            V oldValue = value;
            value = newValue;
            return oldValue;
        }
    	//重写equals方法
        public final boolean equals(Object o) {
            //如果传入节点是非Entry类型，返回false
            if (!(o instanceof Map.Entry))
                return false;
            Map.Entry e = (Map.Entry)o;
            Object k1 = getKey();
            Object k2 = e.getKey();
            //如果传入节点的键和当前节点的键地址相等，或者当前节点的键不为null并且当前节点的键和传入的节点的键相等
            if (k1 == k2 || (k1 != null && k1.equals(k2))) {
                Object v1 = getValue();
                Object v2 = e.getValue();
                //则再判断当前节点的值和传入节点的值地址是否相等，或者当前节点的值不为null并且当前节点值和传入节点的值相等
                if (v1 == v2 || (v1 != null && v1.equals(v2)))
                    //是，则返回true
                    return true;
            }
            //否则，返回false
            return false;
        }
    	//重写hashCode方法
        public final int hashCode() {
            //将key和value的hash值进行逻辑或运算
            return Objects.hashCode(getKey()) ^ Objects.hashCode(getValue());
        }
    
        public final String toString() {
            return getKey() + "=" + getValue();
        }
    
    }
    ```
    
  - `put`方法
  
    ```java
    public V put(K key, V value) {
        //如果当前内部数组还未初始化，则将数组初始化
        if (table == EMPTY_TABLE) {
            inflateTable(threshold);
        }
        //如果传入的key为null
        if (key == null)
            //则调用putForNullKey方法为空键设置值
            return putForNullKey(value);
        //通过hash方法计算出传入的key的hash值
        int hash = hash(key);
        //通过该hash值定位到该键对应的Entry节点在数组中的下标
        int i = indexFor(hash, table.length);
        //根据得到的下标，遍历数组中该下标对应的Entry链表
        for (Entry<K,V> e = table[i]; e != null; e = e.next) {
            Object k;
            //如果该链表中已经存在该key对应的Entry节点
            if (e.hash == hash && ((k = e.key) == key || key.equals(k))) {
                //则对该Entry节点进行更新
                V oldValue = e.value;
                e.value = value;
                e.recordAccess(this);
                //并返回旧值
                return oldValue;
            }
        }
    	//更新修改次数
        modCount++;
        //如果链表中不存在该key对应的Entry节点，则采用头插法，创建一个新的Entry节点，并插入到相应的链表头
        addEntry(hash, key, value, i);
        //返回null
        return null;
    }
    
    //为空键设值
    private V putForNullKey(V value) {
        //空键默认的hash值为0，所以其计算得出的数组下标也为0
        //在数组下标为0对应的链表中遍历
        for (Entry<K,V> e = table[0]; e != null; e = e.next) {
            //如果空键已存在，则更新值并返回
            if (e.key == null) {
                V oldValue = e.value;
                e.value = value;
                e.recordAccess(this);
                return oldValue;
            }
        }
        //更新修改次数
        modCount++;
        //如果数组下标为0对应的链表中不存在空键，则采用头插法，创建一个新的Entry节点，并插入到该链表头
        addEntry(0, null, value, 0);
        //返回null
        return null;
    }
    
    //添加一个Entry节点
    void addEntry(int hash, K key, V value, int bucketIndex) {
        //如果当前已使用容量超过阈值并且内部数组当前下标值对应元素不为null
        if ((size >= threshold) && (null != table[bucketIndex])) {
            //将内部数组容量扩容为当前容量的两倍
            resize(2 * table.length); 
            //如果传入的键是null，则hash值为0，获取通过hash方法计算键的hash值
            hash = (null != key) ? hash(key) : 0;
            //调用indexFor方法，根据键的hash值计算出该键对应的Entry节点在数组中的下标
            bucketIndex = indexFor(hash, table.length);
        }
    	//根据传入的键值对构造一个Entry节点，并存放至内部数组中相应位置
        createEntry(hash, key, value, bucketIndex);
    }
    
    void createEntry(int hash, K key, V value, int bucketIndex) {
        //根据下标，获取到数组中对应的链表
        Entry<K,V> e = table[bucketIndex];
        //采用头插法，创建一个新的Entry节点，并插入到该链表头
        table[bucketIndex] = new Entry<>(hash, key, value, e);
        //更新已使用的容量
        size++;
    }
    ```
  
  - `get`方法
  
    ```java
    public V get(Object key) {
        //如果传入的是空键
        if (key == null)
            //则调用getForNullKey方法获取空键对应的值
            return getForNullKey();
        //根据传入的key，从数组中获取对应Entry节点
        Entry<K,V> entry = getEntry(key);
    	//如果获取的Entry节点为空，则返回null，否则，返回该节点对应的value值
        return null == entry ? null : entry.getValue();
    }
    
    //获取空键的值
    private V getForNullKey() {
        //如果已使用容量为0
        if (size == 0) {
            //则返回null
            return null;
        }
        //遍历数组下标为0的链表
        for (Entry<K,V> e = table[0]; e != null; e = e.next) {
            //如果当前的遍历到的Entry节点的key为null
            if (e.key == null)
                //则直接返回其对应的value值
                return e.value;
        }
        //返回null
        return null;
    }
    
    //根据key获取对应的Entry节点
    final Entry<K,V> getEntry(Object key) {
        //如果已使用容量为0
        if (size == 0) {
            //则返回null
            return null;
        }
    	//计算传入的key对应的hash值
        int hash = (key == null) ? 0 : hash(key);
        //根据key的hash获取数组中对应的下标，然后遍历该下标对应的链表
        for (Entry<K,V> e = table[indexFor(hash, table.length)];
             e != null;
             e = e.next) {
            Object k;
            //如果该链表中存在该key对应的Entry节点
            if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k))))
                //则返回其对应的value值
                return e;
        }
        //返回null
        return null;
    }
    ```
    
  - `remove`方法
  
    ```java
    public V remove(Object key) {
        //removeEntryForKey方法来删除传入key对应的Entry节点
        Entry<K,V> e = removeEntryForKey(key);
        //并返回删除节点的value值
        return (e == null ? null : e.value);
    }
    
    //删除key对应的Entry节点
    final Entry<K,V> removeEntryForKey(Object key) {
        //如果已使用容量为0
        if (size == 0) {
            //则直接返回null
            return null;
        }
        //计算传入key的hash值
        int hash = (key == null) ? 0 : hash(key);
        //根据hash值获取该key对应Entry节点在数组中的下标
        int i = indexFor(hash, table.length);
        //获取到该下标对应链表的头结点
        Entry<K,V> prev = table[i];
        Entry<K,V> e = prev;
    	//遍历链表
        while (e != null) {
            Entry<K,V> next = e.next;
            Object k;
            //如果当前遍历的key和传入的key相等
            if (e.hash == hash &&
                ((k = e.key) == key || (key != null && key.equals(k)))) {
                //更新修改次数
                modCount++;
                //更新已使用容量
                size--;
                //如果当前要删除的节点正好是链表的头结点
                if (prev == e)
                    //则直接将链表头指针指向头节点的下一个节点
                    table[i] = next;
                else
                    //否则，将删除节点从链表中断开
                    prev.next = next;
                e.recordRemoval(this);
                //返回删除节点
                return e;
            }
            prev = e;
            e = next;
        }
    
        return e;
    }
    ```
  
  - 扩容机制
  
    ```java
    void resize(int newCapacity) {
        Entry[] oldTable = table;
        int oldCapacity = oldTable.length;
        //如果旧容量已经是最大容量
        if (oldCapacity == MAXIMUM_CAPACITY) {
            //则将阈值更新至整数最大值，并直接返回，不再扩容
            threshold = Integer.MAX_VALUE;
            return;
        }
    	//否则，根据传入的容量执行扩容操作
        //根据传入的容量，新建一个Entry节点数组
        Entry[] newTable = new Entry[newCapacity];
        //将原内部数组中的每一个元素根据新容量重新计算hash值，并复制到新数组中
        transfer(newTable, initHashSeedAsNeeded(newCapacity));
        //将table属性指向扩容后的新数组
        table = newTable;
        //根据新容量计算并更新阈值
        threshold = (int)Math.min(newCapacity * loadFactor, MAXIMUM_CAPACITY + 1);
    }
    
    //将原数组中的每一个Entry节点复制到新数组中
    void transfer(Entry[] newTable, boolean rehash) {
        int newCapacity = newTable.length;
        //遍历原数组的每个元素
        for (Entry<K,V> e : table) {
            //遍历元素对应链表的每一个Entry节点
            while(null != e) {
                Entry<K,V> next = e.next;
                //重新计算每个Entry节点的hash值
                if (rehash) {
                    e.hash = null == e.key ? 0 : hash(e.key);
                }
                //根据新的hash值重新计算其在新数组中的下标
                int i = indexFor(e.hash, newCapacity);
                //采用头插法，插入元素
                e.next = newTable[i];
                newTable[i] = e;
                e = next;
            }
        }
    }
    ```
  
  - `Fast-Fail`机制
  
    `Fast-Fail`机制只适用于线程不安全的集合类，它不允许线程不安全的集合类在遍历自身的同时对自身作出修改，该机制都会在集合类对应的迭代器中实现
  
    ```java
    private abstract class HashIterator<E> implements Iterator<E> {
        Entry<K,V> next;        // next entry to return
        //用于实现快速失败机制
        int expectedModCount;   // For fast-fail
        int index;              // current slot
        Entry<K,V> current;     // current entry
    
        HashIterator() {
            //新建HashMap迭代器时，就会将当前HashMap的modCount属性赋值给expectedModCount
            expectedModCount = modCount;
            //如果当前已使用容量大于0
            if (size > 0) { // advance to first entry
                Entry[] t = table;
                //将next指向数组中第一个不为空的Entry链表和对应的数组索引
                while (index < t.length && (next = t[index++]) == null)
                    ;
            }
        }
    	
        //判断是否还有下一个元素
        public final boolean hasNext() {
            return next != null;
        }
    	
        //获取下一个Entry节点
        final Entry<K,V> nextEntry() {
            //如果在遍历的时候HashMap被修改了，则直接抛出异常
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
            //获取next指针
            Entry<K,V> e = next;
            if (e == null)
                throw new NoSuchElementException();
    		//更新next指针和index索引
            //如果当前链表已经没有元素了，则寻找数组中下一个不为空的Entry链表
            if ((next = e.next) == null) {
                Entry[] t = table;
                while (index < t.length && (next = t[index++]) == null)
                    ;
            }
            current = e;
            return e;
        }
    	//删除节点
        public void remove() {
            //如果当前节点为空，则抛出异常
            if (current == null)
                throw new IllegalStateException();
            //如果删除时HashMap被修改，则抛出异常
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
            Object k = current.key;
            //更新current指针
            current = null;
            //删除节点
            HashMap.this.removeEntryForKey(k);
            //更新内部的expectedModCount值
            expectedModCount = modCount;
        }
    }
    ```
  
- JDK 8版本源码探究

  - 新增属性

    ```java
    //链表转化红黑树的阈值，即当数组中某条链表的长度大于等于8时并且数组容量大于等于64时，链表才会转化成红黑树
    static final int TREEIFY_THRESHOLD = 8;
    
    //红黑树转化为链表的阈值，即当数组中某个红黑树的节点个数小于等于6时
    static final int UNTREEIFY_THRESHOLD = 6;
    
    //链表转化为红黑树的先决条件，必须满足数组容量大于等于64（减少hash冲突的概率）
    static final int MIN_TREEIFY_CAPACITY = 64;
    ```

  - `hash`方法

    ```java
    static final int hash(Object key) {
        int h;
        //计算传入key的hash值
        //如果key为null，则hash值为0
        //否则，通过将key的hashCode右移16位并与自身进行异或操作来计算hash值
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }
    ```

  - `put`方法

    ```java
    public V put(K key, V value) {
        //内部由putVal方法实现
        return putVal(hash(key), key, value, false, true);
    }
    
    
    //向HashMap中添加键值对
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        //JDK 1.8中采用延迟初始化的机制，即将内部数组的初始化延迟到第一次调用put方法的时候
        if ((tab = table) == null || (n = tab.length) == 0)
            //调用resize扩容方法来初始化内部数组
            n = (tab = resize()).length;
        //通过传入key的hash值计算出key对应的节点在数组中的下标
        //如果该下标对应的元素为null，则直接插入该节点
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        //否则遍历该下标对应的元素
        else {
            Node<K,V> e; K k;
            //如果当前传入key等于元素头结点的key，则记录该头结点
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            //如果当前遍历的元素是红黑树
            else if (p instanceof TreeNode)
                //则使用putTreeVal方法插入键值对
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            
            //如果当前遍历的元素是链表
            else {
                //遍历链表，并记录链表的节点个数
                for (int binCount = 0; ; ++binCount) {
                    //JDK 1.8链表采用尾插法插入节点
                    //如果当前节点p是最后一个节点
                    if ((e = p.next) == null) {
                        //则将尾节点p的next指针指向新建节点
                        p.next = newNode(hash, key, value, null);
                        //如果当前节点个数大于等于8
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            //则调用treeifyBin方法，执行红黑树转化的相关逻辑
                            treeifyBin(tab, hash);
                        break;
                    }
                    //如果key对应节点已经存在于链表中，则记录该节点并退出循环
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            //如果e不为null，说明key对应的节点已经存在于数组中
            if (e != null) { // existing mapping for key
                //更新key对应的节点，并返回旧值
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        //更新修改次数
        ++modCount;
        //更新已使用容量，并判断是否需要扩容
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
    ```

  - `get`方法

    ```java
    public V get(Object key) {
        Node<K,V> e;
        //内部由getNode方法实现
        return (e = getNode(hash(key), key)) == null ? null : e.value;
    }
    
    //根据key从HashMap中得到对应value
    final Node<K,V> getNode(int hash, Object key) {
        Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
        //当内部数组不为空且有元素并且根据key的hash值计算得到的数组下标的元素不为空时
        if ((tab = table) != null && (n = tab.length) > 0 &&
            (first = tab[(n - 1) & hash]) != null) {
            //首先确认该元素的头节点的key与传入的key是否相等
            if (first.hash == hash && // always check first node
                ((k = first.key) == key || (key != null && key.equals(k))))
                //如果相等，则直接返回头结点
                return first;
            //否则，遍历该元素
            if ((e = first.next) != null) {
                //如果该元素是红黑树
                if (first instanceof TreeNode)
                    //则调用getTreeNode方法来获取相应节点并返回
                    return ((TreeNode<K,V>)first).getTreeNode(hash, key);
                //如果该元素是链表，则遍历链表
                do {
                   	//如果链表中存在该key对应的节点，则直接返回
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        return e;
                } while ((e = e.next) != null);
            }
        }
        return null;
    }
    ```

  - `remove`方法

    ```java
    public V remove(Object key) {
        Node<K,V> e;
        //内部由removeNode方法实现
        return (e = removeNode(hash(key), key, null, false, true)) == null ?
            null : e.value;
    }
    
    
    //根据key从HashMap中删除节点
    final Node<K,V> removeNode(int hash, Object key, Object value,
                               boolean matchValue, boolean movable) {
        Node<K,V>[] tab; Node<K,V> p; int n, index;
        //当内部数组不为空且有元素并且根据key的hash值计算得到的数组下标的元素不为空时
        if ((tab = table) != null && (n = tab.length) > 0 &&
            (p = tab[index = (n - 1) & hash]) != null) {
            Node<K,V> node = null, e; K k; V v;
            //如果该元素的头结点就是要删除的节点，则先用node进行记录
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                node = p;
            //否则遍历该元素
            else if ((e = p.next) != null) {
                //如果该元素是红黑树
                if (p instanceof TreeNode)
                    //则调用getTreeNode方法获取要删除的节点
                    node = ((TreeNode<K,V>)p).getTreeNode(hash, key);
                //否则，如果该元素是链表
                else {
                    //遍历链表
                    do {
                        //如果链表中存在要删除的节点，则用node记录该节点
                        if (e.hash == hash &&
                            ((k = e.key) == key ||
                             (key != null && key.equals(k)))) {
                            node = e;
                            break;
                        }
                        p = e;
                    } while ((e = e.next) != null);
                }
            }
            //删除之前记录的节点
            if (node != null && (!matchValue || (v = node.value) == value ||
                                 (value != null && value.equals(v)))) {
                //如果记录的节点是红黑树的节点，则调用removeTreeNode方法进行删除
                if (node instanceof TreeNode)
                    ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
                //否则，如果记录的节点是头结点，则直接删除
                else if (node == p)
                    tab[index] = node.next;
                //否则，删除记录的节点
                else
                    p.next = node.next;
                //更新修改次数
                ++modCount;
                //减小已使用容量
                --size;
                afterNodeRemoval(node);
                //返回删除的节点
                return node;
            }
        }
        return null;
    }
    ```

  - 扩容机制

    ```java
    final Node<K,V>[] resize() {
        //记录一下原数组
        Node<K,V>[] oldTab = table;
        //记录一下原数组的容量
        int oldCap = (oldTab == null) ? 0 : oldTab.length;
        //记录一下原数组的阈值
        int oldThr = threshold;
        int newCap, newThr = 0;
        //如果原数组容量大于0
        if (oldCap > 0) {
            //如果原数组容量大于等于最大容量
            if (oldCap >= MAXIMUM_CAPACITY) {
                //将阈值设为整数最大值
                threshold = Integer.MAX_VALUE;
                //不再进行扩容，直接返回原数组
                return oldTab;
            }
            //否则，将新数组容量设为原数组的2倍
            else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                     oldCap >= DEFAULT_INITIAL_CAPACITY)
                //将新阈值设为原阈值的2倍
                newThr = oldThr << 1; // double threshold
        }
        //否则，如果原数组容量等于0，原阈值大于0，说明该HashMap是通过传入初始容量初始化的
        else if (oldThr > 0) // initial capacity was placed in threshold
            //将新数组容量设为原阈值
            newCap = oldThr;
        //否则，如果原数组容量为0，原阈值为0，说明该HashMap是通过默认构造方法初始化的
        else {         
            //将新数组容量设置为默认容量
            newCap = DEFAULT_INITIAL_CAPACITY;
            //新数组阈值设置为默认阈值
            newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
        }
        //如果新阈值为0
        if (newThr == 0) {
            //则根据扩容后的容量进行计算并更新
            float ft = (float)newCap * loadFactor;
            newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                      (int)ft : Integer.MAX_VALUE);
        }
        //更新threshold属性
        threshold = newThr;
        //根据新容量创建一个新数组
        @SuppressWarnings({"rawtypes","unchecked"})
        Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        table = newTab;
        //遍历原数组，将原数组的元素逐个转移至新数组
        if (oldTab != null) {
            for (int j = 0; j < oldCap; ++j) {
                Node<K,V> e;
                if ((e = oldTab[j]) != null) {
                    oldTab[j] = null;
                    //若原数组中的元素只有一个节点
                    if (e.next == null)
                        //则根据新容量重新计算hash值和下标，并赋值到新数组中
                        newTab[e.hash & (newCap - 1)] = e;
                    //否则，如果元素是红黑树节点
                    else if (e instanceof TreeNode)
                        //则调用split方法进行转移
                        ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                    //否则，如果元素是链表
                    else { 
                        //将该链表按高低位拆分成两条链表
                        //loHead和loTail分别存储低位头节点和低位尾节点
                        Node<K,V> loHead = null, loTail = null;
                        //hiHead和hiTail分别存储高位头结点和高位尾节点
                        Node<K,V> hiHead = null, hiTail = null;
                        //指向链表下一个元素的指针
                        Node<K,V> next;
                        do {
                            next = e.next;
                            //如果当前节点的hash值与原数组容量逻辑与为0
                            if ((e.hash & oldCap) == 0) {
                                //如果低位尾节点为null，说明还没开始遍历该链表
                                if (loTail == null)
                                    //则将当前节点赋值给低位尾节点
                                    loHead = e;
                                //否则，说明已经开始遍历
                                else
                                    //使用尾插法，将低位尾节点的next指针指向当前节点
                                    loTail.next = e;
                                //更新低位尾节点
                                loTail = e;
                            }
                            //否则，如果当前节点的hash值与原数组容量逻辑与不为0
                            else {
                                //如果高位尾节点为null，说明还没开始遍历该链表
                                if (hiTail == null)
                                    //则将当前节点赋值给高位尾节点
                                    hiHead = e;
                                //否则，说明已经开始遍历
                                else
                                    //使用尾插法，将高位尾节点的next指针指向当前节点
                                    hiTail.next = e;
                                //更新高位尾节点
                                hiTail = e;
                            }
                        } while ((e = next) != null);
                        //当前链表遍历结束
                        //如果低位尾节点不为null，说明低位链表保存的节点在扩容重哈希后计算得到的新索引与原索引一样
                        if (loTail != null) {
                            //将低位尾节点的next指针指向null
                            loTail.next = null;
                            //将低位链表赋值到新数组中对应下标位置
                            newTab[j] = loHead;
                        }
                        //如果高位尾节点不为null，说明高位链表保存的节点在扩容重哈希后计算得到的新索引等于原索引向后偏移一个原数组容量的长度
                        if (hiTail != null) {
                            //将高位尾节点的next指针指向null
                            hiTail.next = null;
                            //将高位链表赋值到新数组中对应下标位置
                            newTab[j + oldCap] = hiHead;
                        }
                    }
                }
            }
        }
        return newTab;
    }
    ```

  - 树形化机制

    ```java
    //实现链表转化为红黑树相关逻辑
    final void treeifyBin(Node<K,V>[] tab, int hash) {
        int n, index; Node<K,V> e;
        //如果当前数组为null或者数组容量小于能够树形化的最小容量64
        if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
            //则不执行转化红黑树的操作，而是先扩容
            resize();
        //否则，即数组不为null且数组容量达到64
        else if ((e = tab[index = (n - 1) & hash]) != null) {
            //执行链表转化红黑树的操作
            TreeNode<K,V> hd = null, tl = null;
            do {
                TreeNode<K,V> p = replacementTreeNode(e, null);
                if (tl == null)
                    hd = p;
                else {
                    p.prev = tl;
                    tl.next = p;
                }
                tl = p;
            } while ((e = e.next) != null);
            if ((tab[index] = hd) != null)
                hd.treeify(tab);
        }
    }
    ```

### 14.2ArrayList源码探究

- 类属性

  ```java
  //初始化容量
  private static final int DEFAULT_CAPACITY = 10;
  
  //内部维护一个Object类型的数组，用于保存元素
  transient Object[] elementData; // non-private to simplify nested class access
  
  //用于标识基于有参构造方法而创建出来的空数组
  private static final Object[] EMPTY_ELEMENTDATA = {};
  
  //用于标识基于默认构造方法而创建出来的空数组
  private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};
  
  //记录元素个数
  private int size;
  ```

- 构造方法

  ```java
  //可以通过传入一个初始容量来构造一个ArrayList
  public ArrayList(int initialCapacity) {
      //如果指定的初始容量大于0
      if (initialCapacity > 0) {
          //则用该容量初始化elementData数组
          this.elementData = new Object[initialCapacity];
      //否则，如果指定的初始容量为0    
      } else if (initialCapacity == 0) {
          //则将EMPTY_ELEMENTDATA空数组赋值给elementData
          this.elementData = EMPTY_ELEMENTDATA;
      } else {
          //否则，如果指定的初始容量小于0，抛异常
          throw new IllegalArgumentException("Illegal Capacity: "+
                                             initialCapacity);
      }
  }
  
  //默认构造方法
  public ArrayList() {
      //直接将DEFAULTCAPACITY_EMPTY_ELEMENTDATA空数组赋值给elementData
      this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
  }
  
  //可以通过传入的Collection集合来构造一个ArrayList
  public ArrayList(Collection<? extends E> c) {
      //将集合转化为数组赋值给elementData
      elementData = c.toArray();
      //如果数组长度不为0
      if ((size = elementData.length) != 0) {
          //如果集合转化为的数组不是Object类型，则将其转化为Object类型
          if (elementData.getClass() != Object[].class)
              elementData = Arrays.copyOf(elementData, size, Object[].class);
      //否则，如果数组长度为0，即集合为空
      } else {
          //则将EMPTY_ELEMENTDATA空数组赋值给elementData
          this.elementData = EMPTY_ELEMENTDATA;
      }
  }
  ```

- `add`方法

  ```java
  public boolean add(E e) {
      //继承自abstractList的属性，用于实现fast-fail机制
      //更新修改次数
      modCount++;
      //内部由add方法实现，默认插入数组尾部
      add(e, elementData, size);
      return true;
  }
  //向数组中指定索引处添加元素
  public void add(int index, E element) {
      //判断索引是否越界
      rangeCheckForAdd(index);
      //更新修改次数
      modCount++;
      final int s;
      Object[] elementData;
      //如果数组中的元素个数等于数组长度
      if ((s = size) == (elementData = this.elementData).length)
          //则先将数组扩容
          elementData = grow();
      //将数组中的元素从插入位置开始全部向后移一位
      System.arraycopy(elementData, index,
                       elementData, index + 1,
                       s - index);
      //在插入位置，插入元素
      elementData[index] = element;
      //更新数组元素个数
      size = s + 1;
  }
  ```

- `get`方法

  ```java
  public E get(int index) {
      //检查索引是否越界
      Objects.checkIndex(index, size);
      //内部由elementData方法实现
      return elementData(index);
  }
  
  //获取对应索引处的元素
  E elementData(int index) {
      //直接用数组访问并返回
      return (E) elementData[index];
  }
  ```

- `set`方法

  ```java
  public E set(int index, E element) {
      //检查索引是否越界
      Objects.checkIndex(index, size);
      //记录索引位置处的旧值
      E oldValue = elementData(index);
      //更新该索引对应的元素
      elementData[index] = element;
      //返回旧值
      return oldValue;
  }
  ```

- `remove`方法

  ```java
  //按索引删除
  public E remove(int index) {
      //检查索引是否越界
      Objects.checkIndex(index, size);
      final Object[] es = elementData;
      //记录该索引位置对应的旧值
      @SuppressWarnings("unchecked") E oldValue = (E) es[index];
      //调用fastRemove方法删除该索引处的元素
      fastRemove(es, index);
  	//返回旧值
      return oldValue;
  }
  
  //按元素删除
  public boolean remove(Object o) {
      final Object[] es = elementData;
      final int size = this.size;
      int i = 0;
      //循环，寻找到元素对应的索引
      found: {
          if (o == null) {
              for (; i < size; i++)
                  if (es[i] == null)
                      break found;
          } else {
              for (; i < size; i++)
                  if (o.equals(es[i]))
                      break found;
          }
          return false;
      }
      //调用fastRemove方法删除该索引处的元素
      fastRemove(es, i);
      return true;
  }
  
  //删除指定索引处的元素
  private void fastRemove(Object[] es, int i) {
      //更新修改次数
      modCount++;
      final int newSize;
      //从数组中要删除索引的后一个位置全部向前移一位，覆盖要删除索引处的元素
      if ((newSize = size - 1) > i)
          System.arraycopy(es, i + 1, es, i, newSize - i);
      //将最后一个元素置为null，方便gc
      es[size = newSize] = null;
  }
  ```

- 扩容机制

  ```java
  private Object[] grow() {
      //内部由grow方法实现，由于是扩容，所以此时size+1等于elementData.length+1
      return grow(size + 1);
  }
  
  private Object[] grow(int minCapacity) {
      //记录数组的旧容量
      int oldCapacity = elementData.length;
      //如果旧容量大于0或者数组不是DEFAULTCAPACITY_EMPTY_ELEMENTDATA（通过有参构造方法构建的ArrayList）
      if (oldCapacity > 0 || elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
          //int newCapacity=Math.max(minCapacity - oldCapacity, oldCapacity >> 1) + oldCapacity
          //由于minCapacity - oldCapacity恒为1，所以扩容后数组容量等于旧容量*0.5与1取最大值+旧容量
          /**
           * 如果oldCapacity为0，说明elementData为EMPTY_ELEMENTDATA,那么扩容后，数组容量由0 -》 1
           * 如果oldCapacity不为0，说明oldCapacity >> 1必定大于等于1，则扩容后，新容量为旧容量的1.5倍
           */
         int newCapacity = ArraysSupport.newLength(oldCapacity,
                  minCapacity - oldCapacity, /* minimum growth */
                  oldCapacity >> 1           /* preferred growth */);
          return elementData = Arrays.copyOf(elementData, newCapacity);
      } else {
          //否则，如果旧容量等于0并且数组是DEFAULTCAPACITY_EMPTY_ELEMENTDATA（通过默认构造方法构建的ArrayList）
          //扩容后数组容量等于默认容量和旧容量+1取最大值
          //由于旧容量为0，默认容量为10，则扩容后，数组容量由0 —》 10
          return elementData = new Object[Math.max(DEFAULT_CAPACITY, minCapacity)];
      }
  }
  ```

## 15.Java I/O系统

- Java I/O中常用的类：

  ![img](https://img-blog.csdn.net/20160421004103005?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

  在`java.io`包中最重要的就是5个类和一个接口：`File`类、`OutputStream`类、`InputStream`类、`Writer`类、`Reader`类和`Serializable`接口

- Java I/O的体系结构图：

  ![image-20210315235352690](/static/img/image-20210315235352690.png)

  1. `File`（文件特征与管理）：用于文件或者目录的描述信息，例如生成新目录，修改文件名，删除文件，判断文件所在路径等。
  2. `InputStream`（二进制格式操作）：抽象类，基于字节的输入操作，是所有输入流的父类。定义了所有输入流都具有的共同特征。
  3. `OutputStream`（二进制格式操作）：抽象类。基于字节的输出操作。是所有输出流的父类。定义了所有输出流都具有的共同特征。
  4. `Reader`（文件格式操作）：抽象类，基于字符的输入操作。
  5. `Writer`（文件格式操作）：抽象类，基于字符的输出操作。
  6. `RandomAccessFile`（随机文件操作）：一个独立的类，直接继承至Object.它的功能丰富，可以从文件的任意位置进行存取（输入输出）操作。

- Java流类的类结构图：

   ![img](https://img-blog.csdn.net/20160421004327228?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

### 15.1`File`类

`File`类可以代表一个特定文件，也可以代表一个目录下的一组文件名称。`File`类是`Object`的直接子类，同时它继承了`Comparable`接口可以进行数组的排序，它不属于I/O流中的一部分。以下是`File`类的常用方法：

![img](https://img-blog.csdn.net/20160421005754700?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

`File`类的构造方法：

- `File (String pathname)`：根据给定的`pathname`路径名来创建一个`File`对象
- `File (String parent,String child)`：根据 `parent` 路径名字符串和 `child` 路径名字符串创建一个 `File` 对象
- `File (File parent,String child)`：根据 一个`File`对象的路径名字符串和 `child` 路径名字符串创建一个 `File` 对象

### 15.2输入和输出

流：代表任何有能力产出数据的数据源对象或者是有能力接受数据的接收端对象

Java类库中的I/O类分为输入和输出两部分，输入和输出抽象地称为流，任何继承了`InputStream`或`Reader`（输入流）的派生类都含有`read()`方法，任何继承了`OutputStream`或`Writer`（输出流）的派生类都含有`write()`方法

Java的I/O模型采用装饰器的设计模式，可以通过叠加多个对象，来定制一个流对象

装饰器模式：为一个对象增加一些新的功能，而且是动态的，要求装饰对象和被装饰对象实现同一个接口，装饰对象持有被装饰对象的实例

![img](http://dl.iteye.com/upload/attachment/0083/1195/e1b8b6a3-0150-31ae-8f77-7c3d888b6f80.jpg)

```java
interface Sourceable{
    void method();
}
//被装饰类
class Source implements Sourceable{
    @Override
    public void method(){
        System.out.println("the original method");
    }
}
//装饰类，与被装饰类实现同一接口
class Decorator implements Sourceable{
    //持有被装饰类的对象
    Sourceable s;
    Decorator(Sourceable s){
        this.s=s;
    }
    //增强被装饰类的一些方法
    @Override
    public void method() {
        System.out.println("before decorator");
        s.method();
        System.out.println("after decorator");
    }
}
public class DecoratorTest {
    public static void main(String...args){
        Sourceable sourceable=new Decorator(new Source());
        sourceable.method();
    }
}/*output
before decorator
the original method
after decorator
*/
```

#### 15.2.1`InputStream`类型

`InputStream`类型的作用是用来表示那些从不同数据源产生输入的类，这些数据源包括：

- 字节数组（`ByteArrayInputStream`）
- `String`对象（`StringBufferInputStream`）
- 文件（`FileInputStream`）
- “管道”，工作方式与实际管道相似，即从一端输入，从另一个端输出（`PipedInputStream`）
- 一个由其他种类的流组成的序列，以便我们可以将它们收集合并到一个流内（`SequenceInputStream`）
- 其他数据源，如Internet连接等

每一种数据源都有相应的`InputStream`子类。另外，`FilterInputStream`也是`InputStream`子类，它为装饰器类提供基类，其中，装饰类可以把属性或有用的接口与输入流连接在一起

![image-20210313160624138](/static/img/image-20210313160624138.png)

#### 15.2.2`OutputStream`类型

`OutputStream`类型的类决定了输出所要去往的目标：字节数组、文件或管道。另外，`FilterOutputStream`也是`OutputStream`子类，它为装饰器类提供基类，其中，装饰类可以把属性或有用的接口与输入流连接在一起

![image-20210313163216354](/static/img/image-20210313163216354.png)

### 15.3添加属性和有用的接口

Java I/O类库需要多种不同功能的组合，这正是使用装饰器模式的理念所在。`FilterInputStream`和`FilterOutputStream`是用来提供装饰器类接口以控制特定输入流（`InputStream`）和输出流（`OutputStream`）。`FilterInputStream`和`FilterOutputStream`都继承自`InputStream`和`OutputStream`

#### 15.3.1通过`FilterInputStream`从`InputStream`读取数据

`FilterInputStream`子类：

![image-20210313164323527](/static/img/image-20210313164323527.png)

#### 15.3.2通过`FilterOutputStream`向`OutputStream`写入

`FilterOutputStream`子类：

![image-20210313164424739](/static/img/image-20210313164424739.png)

### 15.4`Reader`和`Writer`

引入`Reader`和`Writer`的原因：`InputStream`和`OutputStream`是面向字节的流，并不能很好的处理Unicode字符（用于字符国际化），所以Java引入了`Reader`和`Writer`——面向字符的流

字节流和字符流的区别：字节流没有缓冲区，直接进行输入输出，而字符流具有缓冲区，只有在调用`close()`方法关闭缓冲区时，信息才会输入输出。也可以手动调用`flush()`方法将缓冲区的数据输入出输出

```java
package io;

import java.io.*;

public class ByteStreamAndCharStream {
    public static void byteStream(File f,String str) throws IOException {
        OutputStream out=new FileOutputStream(f);
        out.write(str.getBytes());
        //即使不关闭字节输出流，文件中也已经写入数据了，因为字节流是直接操作文件，不依靠缓冲区
       //out.close();
    }
    public static void CharStream(File f,String str) throws IOException {
        Writer out=new FileWriter(f);
        out.write(str);
        //必须关闭字符输出流，否则缓冲区中的数据不会输出到文件里
        out.close();
        //out.flush();//也可以自己手动刷新缓冲区
    }
    public static void main(String...args) throws IOException {
        File f=new File("C:\\Users\\Admin\\IdeaProjects\\untitled\\com.imooc\\mindview\\src\\io\\test");
        String str="Hello World";
        byteStream(f,str);
    }

}
```

字节流与字符流的转换：可以通过`InputStreamReader`和`OutputStreamWriter`将`InputStream`和`OutputStream`转换为`Reader`和`Writer`

#### 15.4.1数据的来源和去处

字节流和字符流的继承层次结构对比：

![image-20210314142906691](/static/img/image-20210314142906691.png)

#### 15.4.2更改流的行为

字节流和字符流的装饰器类的继承层次结构对比：

![image-20210314144454132](/static/img/image-20210314144454132.png)

### 15.5I/O流的典型使用方式

#### 15.5.1缓冲输入文件

如果想要读取一个文件的字符，并且为了提高速度，需要对那个文件进行缓冲，那么就可以把`FileReader`对象的引用传入装饰器类`BufferedReader`的构造器中，构建一个具有缓冲的面向字符输入流

```java
package io;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class BufferedInputFile {
    public static String read(String filename) throws IOException{
        BufferedReader in=new BufferedReader(new FileReader(filename));
        String s;
        StringBuilder sb=new StringBuilder();
        //当readLine()方法返回null时，说明达到文件末尾
        while ((s = in.readLine())!= null) {
            sb.append(s+"\n");
        }
        in.close();
        return sb.toString();
    }
    public static void main(String...args) throws IOException {
        System.out.println(read("./test.txt"));
    }
}
```

#### 15.5.2从内存输入

```java
package io;

import java.io.IOException;
import java.io.StringReader;

public class MemoryInput {
    public static void main(String...args) throws IOException {
        //接收一串字符串来构建一个StringReader对象
        StringReader in=new StringReader(BufferedInputFile.read("./test.txt"));
        int c;
        //StringReader对象的read()方法是以int的形式返回下一个字符
        //到文件末尾就返回-1
        while ((c=in.read())!=-1){
            //需要把int型转换为char型才能正确输出
            System.out.println((char)c);
        }
    }
}
```

#### 15.5.3格式化的内存输入

要读取格式化数据，可以向装饰器类`DataInputStream`构造器中传入一个`InputStream`对象，来构建一个可以读取格式化数据的字节流

```java
package io;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;

public class FormattedMemoryInput {
    public static void main(String...args){
        try{
            DataInputStream in=new DataInputStream(new ByteArrayInputStream(BufferedInputFile.read("./test.txt").getBytes()));
            while (true){
                //readByte()方法会一次一个字节的读取字符，这样任何字节的值都是合法的结果
                //所以readByte()方法的返回值是不能用来检测输入是否结束
                System.out.print((char)in.readByte());
            }
        } catch (IOException e) {
            System.err.println("End of stream");
        }
    }
}
```

可以使用`available()`方法来查看还有多少可供存取的字符，以此来判断是否输入结束：

```java
package io;

import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.IOException;

public class TestEOF {
    public static void main(String...args) throws IOException {
        DataInputStream in=new DataInputStream(new FileInputStream("./test.txt"));
        while (in.available()!=0){
            System.out.print((char)in.readByte());
        }
    }
}
```

#### 15.5.4基本的文件输出

`FileWriter`对象可以向文件写入数据。我们可以通过`BufferedWriter`将其包装起来用以缓冲输出（提高速度），也可以通过`PrintWriter`将其包装起来，为其提供格式化机制

```java
package io;

import java.io.*;

public class BasicFileOutput {
    static String file="./test.txt";
    public static void main(String...args) throws IOException {
        //可以叠加多个类来定制多功能的流对象
        BufferedReader in=new BufferedReader(new StringReader(BufferedInputFile.read(file)));
        //out对象可以向文件缓冲输出格式化数据
        PrintWriter out=new PrintWriter(new BufferedWriter(new FileWriter(file)));
        int lineCount=1;
        String s;
        while ((s = in.readLine()) != null) {
            out.println(lineCount++ +":"+s);
        }
         //输出完毕要记得关闭输出流，使缓冲区的数据输出到文件中
         out.close();
         System.out.println(BufferedInputFile.read(file));
    }
}
```

文件文件的快捷方式：Java SE5在`PrintWriter`中添加了一个辅助构造器，使得你不必在每次创建文本文件并想其中写入时，都去执行所有的装饰工作：

```java
package io;

import java.io.*;

public class FileOutputShortcut {
    static String file="./test.txt";
    public static void main(String...args) throws IOException {
        BufferedReader in=new BufferedReader(new StringReader(BufferedInputFile.read(file)));
        //不需要再传入多个对象，该构造器内部已经做了缓冲功能
        PrintWriter out=new PrintWriter(file);
        int lineCount=1;
        String s;
        while ((s = in.readLine()) != null) {
            out.println(lineCount++ +":"+s);
        }
        out.close();
        System.out.println(BufferedInputFile.read(file));
    }
}
```

#### 15.5.5存储和恢复数据

如果要输出可供另一个流恢复的数据，就需要使用`DataOutputStream`写入数据，并用`DataInputStream`恢复数据，即使是再不同的平台读和写都不会有问题

```java
package io;

import java.io.*;

public class StoringAndRecoveringData {
    public static void main(String...args)throws IOException{
        DataOutputStream out=new DataOutputStream(new BufferedOutputStream(new FileOutputStream("./test.txt")));
        //调用DataOutputStream对象的方法写入格式化数据
        out.writeDouble(3.14159);
        out.writeUTF("That was pi");
        out.writeDouble(1.41413);
        out.writeUTF("Square root of 2");
        out.close();
        DataInputStream in=new DataInputStream(new BufferedInputStream(new FileInputStream("./test.txt")));
        //调用DataInputStream对象的方法读出格式化数据
        System.out.println(in.readDouble());
        System.out.println(in.readUTF());
        System.out.println(in.readDouble());
        System.out.println(in.readUTF());
    }
}/*output
3.14159
That was pi
1.41413
Square root of 2
*/
```

#### 15.5.6读写随机访问文件

`RandomAccessFile`类并不属于流式类的一部分，它类似于组合使用了`DataInputStream`和`DataOutputStream`（因为它们实现了相同的接口`DataInput`和`DataOutput`）。`RandomAccessFile`只支持“只读”和“读写”，不支持“只写”，其也拥有读取基本类型和UTF-8字符串的各种具体方法。

```java
package io;

import java.io.IOException;
import java.io.RandomAccessFile;

public class UsingRandomAccessFile {
    static String file = "./test";

    static void display() throws IOException {
        //RandomAccessFile类的构造器有两个参数，一个参数接收文件对象，另一个参数表明要对文件作何种操作
        //只读文件
        RandomAccessFile rf = new RandomAccessFile(file, "r");
        for (int i = 0; i < 7; i++) {
            System.out.println("Value " + i + " : " + rf.readDouble());
        }
        System.out.println(rf.readUTF());
        rf.close();
    }

    public static void main(String... args) throws IOException {
        //读写文件
        RandomAccessFile rf = new RandomAccessFile(file, "rw");
        for (int i = 0; i < 7; i++) {
            rf.writeDouble(i * 1.414);
        }
        rf.writeUTF("The end of the file");
        rf.close();
        display();
        rf = new RandomAccessFile(file, "rw");
        //seek()方法用于查找指定位置，double是8字节长，5*8表示查找第5个double值
        rf.seek(5 * 8);
        //seek()方法会改变指针位置，当前指向第5个double值的位置，所以写入数据也是从该位置写入
        rf.writeDouble(47.0001);
        rf.close();
        display();
    }
}/*output
Value 0 : 0.0
Value 1 : 1.414
Value 2 : 2.828
Value 3 : 4.242
Value 4 : 5.656
Value 5 : 7.069999999999999
Value 6 : 8.484
The end of the file
Value 0 : 0.0
Value 1 : 1.414
Value 2 : 2.828
Value 3 : 4.242
Value 4 : 5.656
Value 5 : 47.0001
Value 6 : 8.484
The end of the file
*/
```

#### 15.5.7管道流

管道流用于多线程之间的通信

### 15.6标准I/O

标准I/O，程序所使用的单一信息流。程序的所有输入都可以来自于标准输入，它的所有输出也都可以发送到标准输出，以及所有的错误信息都可以发送到标准错误

### 15.6.1从标准输入中读取

按照标准I/O模型，Java提供了`System.in`、`System.out`和`System.err`。`System.out`和`System.err`都已经事先被包装成`PrintStream`对象，但是`System.in`却是一个没有被包装过的未经加工的`InputStream`，因此，在使用前我们必须对其包装

```java
package io;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Echo {
    public static void main(String...args) throws IOException {
        //将System.in包装成BufferedReader对象，因为System.in是一个InputStream对象，所以需要使用 InputStreamReader类来将InputStream对象转换为Reader对象
        BufferedReader stdin=new BufferedReader(new InputStreamReader(System.in));
        String s;
        while((s= stdin.readLine())!=null&&s.length()!=0){
            System.out.println(s);
        }

    }
}
```

#### 15.6.2将`System.out`转换成`PrintWriter`

`System.out`是一个`PrintStream`，`PrintStream`是`OutpuStream`的子类，而`PrintWriter`有一个可以接收一个`OutpuStream`作为参数的构造器。因此，可以通过该构造器将`System.out`转换成`PrintWriter`

```java
package io;

import java.io.PrintWriter;

public class ChangeSystemOut {
    public static void main(String...args){
        //第二个参数为true，会刷新缓冲区，如果为false，可能看不到输出
        PrintWriter out=new PrintWriter(System.out,true);
        out.println("Hello,World");
    }
}/*output
Hello,World
*/
```

#### 15.6.3标准I/O重定向

当输入输出和错误信息太多导致控制台显示不方便时，Java的`System`类提供了一些静态方法，以允许我们对标准输入、输出和错误I/O流进行重定向：`setIn(InputStream)`、`setOut(PrintStream)`、`setErr(PrintStream)`

```java
package io;

import java.io.*;

public class Redirecting {
    public static void main(String...args) throws IOException {
        PrintStream console =System.out;
        BufferedInputStream in=new BufferedInputStream(new FileInputStream("./test1.txt"));
        PrintStream out=new PrintStream(new BufferedOutputStream(new FileOutputStream("./test.txt")));
        //标准输入从test1文件中读取
        System.setIn(in);
        //标准输出向test文件中写入
        System.setOut(out);
        //标准错误向test文件中写入
        System.setErr(out);
        BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
        String s;
        while ((s=br.readLine())!=null){
            System.out.println(s);
        }
        out.close();
        System.setOut(console);
    }
}
```

### 15.7新I/O

JDK 1.4的`java.nio.*`包中引入了新的Java I/O类库，其目的在于提高速度。NIO速度的提高在于NIO是面向缓冲区的，使用了通道和缓冲器。我们可以把它想象成一个煤矿，通常是一个包含煤层（数据）的矿藏，而缓冲器则是派送到矿藏的卡车。卡车满载煤炭而归，我们从卡车上获得煤炭。也就是我们没有和通道直接交互，我们只是和缓冲器交互，并把缓冲器派送到通道。通道要么从缓冲器获得数据，要么向缓冲器发送数据。

唯一直接与通道交互的缓冲器是`ByteBuffer`--也就是说，可以存储未加工字节的缓冲器。通过告知分配多少存储空间来创建一个`ByteBuffer`对象，并且还有一个方法选择集，用于以原始的字节形式或基本数据类型输出和读取数据。但是，没办法输出或读取对象，即使是字符串对象也不行

旧I/O类库中有三个类被修改了，用以产生`FileChannel`。这三个被修改的类是`FileInputStream`、`FileOutputStream`以及用于既读又写的`RandomAccessFile`。注意这些是字节操纵流，与底层的NIO性质一致。`Reader`和`Writer`这种字符模式类不能用于产生通道，但是java.nio.channels.Channels类提供了实用方法，用以在通道中产生`Reader`和`Writer`

```java
package io;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

public class GetChannel {
    //为ByteBuffer分配的存储空间
    private static final int BSIZE=1024;
    public static void main(String...args) throws Exception{
        //getChannel()方法将会产生一个通道
        FileChannel fc=new FileOutputStream("data.txt").getChannel();
        //ByteBuffer.wrap()方法会将传入的字节数组包装到ByteBuffer中
        fc.write(ByteBuffer.wrap("Some text".getBytes()));
        fc.close();
        fc=new RandomAccessFile("data.txt","rw").getChannel();
        //移动到文件末尾
        fc.position(fc.size());
        fc.write(ByteBuffer.wrap("Some more".getBytes()));
        fc.close();
        fc=new FileInputStream("data.txt").getChannel();
        //手动为ByteBuffer对象分配存储空间
        ByteBuffer buff=ByteBuffer.allocate(BSIZE);
        fc.read(buff);
        //一旦调用read()方法，即准备向ByteBuffer中存储字节，就必须调用ByteBuffer对象的flip()方法
        buff.flip();
        while (buff.hasRemaining()){
            System.out.print((char)buff.get());
        }
    }
}/*output
Some textSome more
*/
```

### 15.8压缩

Java I/O类库中的类支持读写压缩格式的数据流，这些类是属于`InputStream`和`OutputStream`继承层次结构的一部分，因为压缩类库是按字节方式而不是字符方式处理的

![image-20210315150737514](/static/img/image-20210315150737514.png)

#### 15.8.1用GZIP进行简单压缩

```java
package io;

import java.io.*;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;


public class GZIPcompress {
    public static void main(String...args) throws Exception{
        BufferedReader in=new BufferedReader(new FileReader("test"));
        //通过包装多个对象定制一个字节输出流对象，该对象能将数据压缩成GZIP格式缓冲地输出到文件中
        BufferedOutputStream out=new BufferedOutputStream(new GZIPOutputStream(new FileOutputStream("test.gz")));
        System.out.println("Writing file");
        int c;
        while ((c=in.read())!=-1){
            out.write(c);
        }
        in.close();
        out.close();
        System.out.println("Reading file");
        //通过包装多个对象定制一个字符输入流对象，该对象能解压缩GZIP文件的数据并缓冲地读入内存
        //GZIPInputStream是字节输入流，需要传入InputStreamReader构造器中转换成字符输入流
        BufferedReader in2=new BufferedReader(new InputStreamReader(new GZIPInputStream(new FileInputStream("test.gz"))));
        String s;
        while ((s=in2.readLine())!=null){
            System.out.println(s);
        }
    }
}
```

#### 15.8.2使用Zip进行多文件保存

```java
package io;

import java.io.*;
import java.util.Enumeration;
import java.util.zip.*;

class test{
    public static void main(String ...args) throws Exception {
        ZipCompress.main("test","test1","X.file");
    }
}

public class ZipCompress {
    public static void main(String...args) throws Exception{
        FileOutputStream f=new FileOutputStream("test.zip");
        //CheckedOutputStream使用Alder32为FileOutputStream对象计算校验和
        CheckedOutputStream csum=new CheckedOutputStream(f,new Adler32());
        //传入CheckedOutputStream创建一个能压缩Zip格式的输出流对象
        ZipOutputStream zos=new ZipOutputStream(csum);
        BufferedOutputStream out=new BufferedOutputStream(zos);
        //为zip文件设置注释
        zos.setComment("A test of Java Zipping");
        for(String arg:args){
            System.out.println("Writing file "+arg);
            BufferedReader in=new BufferedReader(new FileReader(arg));
            //对于每一个要加入Zip压缩档案的文件，都必须调用putNextEntry()方法，并向其传递一个ZipEntry对象
            //ZipEntry对象接收一个字符串，创建一个名称与该字符串相同的文件，该对象会包含文件的详细信息
            zos.putNextEntry(new ZipEntry(arg));
            int c;
            while ((c=in.read())!=-1
                //将每一个文件的内如写入压缩档案中的文件里   
                out.write(c);
            }
            in.close();
            //手动刷新缓冲区       
            out.flush();
        }
        out.close();
        System.out.println("Checksum: "+csum.getChecksum().getValue());
        System.out.println("Reading file");
        FileInputStream fi=new FileInputStream("test.zip");
        //CheckedInputStream使用Alder32为FileInputStream对象计算校验和
        CheckedInputStream csumi=new CheckedInputStream(fi,new Adler32());
        //传入CheckedInputStream创建一个能解压Zip格式的输入流对象
        ZipInputStream in2=new ZipInputStream(csumi);
        BufferedInputStream bis=new BufferedInputStream(in2);
        ZipEntry ze;
        //getNextEntry()返回下一个ZipEntry对象，即解压压缩档案中的下一个文件           
        while ((ze= in2.getNextEntry())!=null){
            System.out.println("Reading file "+ze);
            int x;
            while ((x=bis.read())!=-1){
                //读取每个压缩档案中的每个文件的内容
                System.out.println(x);
            }
        }
        bis.close();
        //ZipFile可以更加便捷的获取压缩档案中的多个文件
        ZipFile zf=new ZipFile("test.zip");
        //entries()方法返回一个枚举类型，包含了压缩档案中的所有文件
        Enumeration e=zf.entries();
        while (e.hasMoreElements()){
            ZipEntry ze2=(ZipEntry)e.nextElement();
            System.out.println("File: "+ze2);
        }
    }
}
```

### 15.9对象序列化

Java的对象序列化将那些实现了`Serializable`接口的对象转换成一个字节序列，并能够在以后将这个字节序列完全恢复为原来的对象。`Serializable`接口仅仅是一个标记接口，不包含任何方法，它会使对象的序列化处理变得非常简单

对象序列化步骤：

- 首先创建某些`OutputStream`对象，将其封装在一个`ObjectOutputStream`对象内
- 然后调用`writeObject()`方法即可将对象序列化，并发送给`OutputStream`

反序列化步骤：

- 首先创建某些`InputStream`对象，将其封装在一个`ObjectInputStream`对象内
- 然后调用`readObject()`方法即可反序列化，最后获得的是一个`Object`类型的引用

```java
package io;

import java.io.*;
import java.util.Random;

class Data implements Serializable{
    private int n;
    public Data(int n){
        this.n=n;
    }
    @Override
    public String toString() {
        return Integer.toString(n);
    }
}
public class Worm implements Serializable{
    private static Random random=new Random(47);
    private Data[] d={
            new Data(random.nextInt(10)),
            new Data(random.nextInt(10)),
            new Data(random.nextInt(10))
    };
    private Worm next;
    private char c;
    public Worm(int i,char x){
        System.out.println("Worm constructor: "+i);
        c=x;
        if (--i>0){
            next=new Worm(i,(char)(x+1));
        }
    }
    public Worm(){
        System.out.println("Default constructor");
    }

    @Override
    public String toString() {
        StringBuilder result=new StringBuilder(":");
        result.append(c);
        result.append("(");
        for(Data dat:d){
            result.append(dat);
        }
        result.append(")");
        if(next!=null){
            result.append(next);
        }
        return result.toString();
    }
    public static void main(String...args) throws IOException, ClassNotFoundException {
        Worm w=new Worm(6,'a');
        System.out.println("w="+w);
        //将对象序列化输出到文件中
        ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream("./test"));
        out.writeObject("Worm storage\n");
        out.writeObject(w);
        out.close();
        ObjectInputStream in=new ObjectInputStream(new FileInputStream("./test"));
        //反序列化得到的对象是Object类型，要向下转型必须强制类型转换
        String s=(String)in.readObject();
        Worm w2=(Worm)in.readObject();
        System.out.println(s+"w2 = "+w2);
        //将对象序列化输出到内存中的字节数组缓冲区中
        ByteArrayOutputStream bout=new ByteArrayOutputStream();
        ObjectOutputStream out2=new ObjectOutputStream(bout);
        out2.writeObject("Worm storage\n");
        out2.writeObject(w);
        out2.flush();
        ObjectInputStream in2=new ObjectInputStream(new ByteArrayInputStream(bout.toByteArray()));
        s=(String)in2.readObject();
        Worm w3=(Worm)in2.readObject();
        System.out.println(s+"w3 = "+w3);
    }
}/*output
Worm constructor: 6
Worm constructor: 5
Worm constructor: 4
Worm constructor: 3
Worm constructor: 2
Worm constructor: 1
w=:a(853):b(119):c(802):d(788):e(199):f(881)
Worm storage
w2 = :a(853):b(119):c(802):d(788):e(199):f(881)
Worm storage
w3 = :a(853):b(119):c(802):d(788):e(199):f(881)
*/
```

#### 15.9.1寻找类

当Java打开文件和读取文件中的字节序列并反序列化为对象的时候，Java虚拟机会去寻找该对象所在类的字节码文件（.class)，如果找不到就无法反序列化，并抛出`ClassNotFoundException`异常

#### 15.9.2序列化的控制

如果你不希望将对象的某一部分序列化，或者一个对象被还原后，其子对象需要重新创建，从而不必将该子对象序列化，那么可以通过实现`Externalizable`接口，代替实现`Serializable`接口

`Externalizable`接口继承了`Externalizable`接口，同时增添了两个新方法：`writeExternal()`和`readExternal`。这两个方法会在序列化和反序列化过程中被自动调用

```java
package io;

import java.io.*;

class Blip1 implements Externalizable{
    //Blip1的构造器是public的
    public Blip1(){
        System.out.println("Blip1 Constructor");
    }

    @Override
    public void writeExternal(ObjectOutput objectOutput) throws IOException {
        System.out.println("Blip1.writeExternal");
    }

    @Override
    public void readExternal(ObjectInput objectInput) throws IOException, ClassNotFoundException {
        System.out.println("Blip1.readExternal");
    }
}
class Blip2 implements Externalizable{
    //Blip2的构造器是包访问权限
    Blip2(){
        System.out.println("Blip2 Constructor");
    }

    @Override
    public void writeExternal(ObjectOutput objectOutput) throws IOException {
        System.out.println("Blip2.writeExternal");
    }

    @Override
    public void readExternal(ObjectInput objectInput) throws IOException, ClassNotFoundException {
        System.out.println("Blip2.readExternal");
    }
}

public class Blips {
    public static void main(String...args) throws IOException, ClassNotFoundException {
        System.out.println("Constructing objects:");
        Blip1 b1=new Blip1();
        Blip2 b2=new Blip2();
        ObjectOutputStream o=new ObjectOutputStream(new FileOutputStream("test.txt"));
        System.out.println("Saving objects:");
        o.writeObject(b1);
        o.writeObject(b2);
        o.close();
        ObjectInputStream in=new ObjectInputStream(new FileInputStream("test.txt"));
        System.out.println("Recovering b1:");
        //反序列化恢复一个Externalizable对象时，会先调用该对象的默认构造器（包括在字段定义处的初始化），然后再调用readExternal()方法
        b1=(Blip1)in.readObject();
        //反序列化恢复一个Externalizable对象，其所在类的默认构造器必须是public，否则抛出异常
        //b2=(Blip2)in.readObject();
    }
}/*output
Constructing objects:
Blip1 Constructor
Blip2 Constructor
Saving objects:
Blip1.writeExternal
Blip2.writeExternal
Recovering b1:
Blip1 Constructor
Blip1.readExternal
*/
```

`Externalizable`对象是不会自动序列化和反序列化的，我们必须在`writeExternal()`方法中显式的将字段序列化，并在`readExternal`中反序列化赋给原来的字段：

```java
package io;

import java.io.*;

public class Blip3 implements Externalizable {
    private int i;
    private String s;
    public Blip3(){
        //默认构造器中不对字段进行任何初始化
        System.out.println("Blip3 Constructor");
    }
    public Blip3(String x,int a){
        //只有带参构造器才对字段进行初始化
        System.out.println("Blip3(String x,int a)");
        s=x;
        i=a;
    }

    @Override
    public String toString() {
        return s+i;
    }

    @Override
    public void writeExternal(ObjectOutput objectOutput) throws IOException {
        System.out.println("Blip3.writeExternal");
        //将字段序列化，写入输出流中
        objectOutput.writeObject(s);
        objectOutput.writeInt(i);
    }
    @Override
    public void readExternal(ObjectInput objectInput) throws IOException, ClassNotFoundException {
       	//我们必须在readExternal()方法中恢复数据，并赋值给相应的字段
        //因为Externalizable对象反序列化后只调用默认构造器，然后再调用该方法
        //如果不在此方法中将字段的值恢复为原来的数据，那么之前存储的数据就会丢失
        System.out.println("Blip3.readExternal");
        s=(String)objectInput.readObject();
        i=objectInput.readInt();
    }
    public static void main(String...args) throws IOException, ClassNotFoundException {
        System.out.println("Constructor objects:");
        Blip3 b3=new Blip3("A String ",47);
        System.out.println(b3);
        ObjectOutputStream o=new ObjectOutputStream(new FileOutputStream("test"));
        System.out.println("Saving objects:");
        o.writeObject(b3);
        o.close();
        ObjectInputStream in=new ObjectInputStream(new FileInputStream("test"));
        System.out.println("Recovering b3:");
        b3=(Blip3)in.readObject();
        System.out.println(b3);
    }
}/*output
Constructor objects:
Blip3(String x,int a)
A String 47
Saving objects:
Blip3.writeExternal
Recovering b3:
Blip3 Constructor
Blip3.readExternal
A String 47
*/
```

**`transient`（瞬时）关键字**

除了将类实现为`Externalizable`，对所需部分进行显式的序列化外，对`Serializable`对象的字段使用`transient`关键字关闭字段的初始化，也能达到这种效果

```java
package io;

import java.io.*;
import java.util.Date;
import java.util.concurrent.TimeUnit;

public class Logon implements Serializable {
    private Date date=new Date();
    private String username;
    //字段password被限定为transient，所以对象被序列化的时候，不会序列化password字段
    private transient String password;
    public Logon(String name,String pwd){
        username=name;
        password=pwd;
    }

    @Override
    public String toString() {
        return "Logon{" +
                "date=" + date +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
    public static void main(String...args) throws Exception{
        Logon a=new Logon("Hulk","myLittlePony");
        System.out.println("logon a=" +a);
        ObjectOutputStream o=new ObjectOutputStream(new FileOutputStream("test"));
        o.writeObject(a);
        o.close();
        TimeUnit.SECONDS.sleep(1);
        ObjectInputStream in=new ObjectInputStream(new FileInputStream("test"));
        System.out.println("Recovering object at "+new Date());
        //反序列化恢复对象的时候，password字段就为null
        a=(Logon)in.readObject();
        System.out.println("logon a= "+a);
    }
}/*output
logon a=Logon{date=Mon Mar 15 14:14:04 CST 2021, username='Hulk', password='myLittlePony'}
Recovering object at Mon Mar 15 14:14:05 CST 2021
logon a= Logon{date=Mon Mar 15 14:14:04 CST 2021, username='Hulk', password='null'}
*/
```

因为`Externalizable`对象在默认情况下不保存它们的任何字段，所以`transient`关键字只能和`Serialzaible`对象一起使用

**Externalizable的替代方法**

可以实现`Serializable`接口，并添加`writeObject()`和 `readObject()`方法，这样一旦对象序列化或者被反序列化还原，就会自动调用这两个方法，而不再是使用默认的序列化机制

这种方式的`writeObject()`和 `readObject()`方法的特征签名必须是如下形式：

```java
private void writeObject(ObjectOutputStream stream) throws IOException;
private void readObject(ObjectInputStream stream) throws IOException;
```

在调用`ObjectOutputStream.writeObject()`时，会检查所传递的`Serializable`对象，看看是否实现了它自己的`writeObject()`。如果是，就跳过正常的序列化过程并调用它的`writeObject()`（通过反射机制，调用了该私有方法）。`readObject()`的情形与此相同。另外，在你的`writeObject()`内部，可以调用`defaultWriteObject()`来选择执行默认的`writeObject()`，`readObject()`同理

```java
package io;

import java.io.*;

public class SerialCtl implements Serializable {
    private String a;
    private transient String b;
    public SerialCtl(String a,String b){
        this.a="Not Transient:"+a;
        this.b="Transient:"+b;
    }

    @Override
    public String toString() {
        return "SerialCtl{" +
                "a='" + a + '\'' +
                ", b='" + b + '\'' +
                '}';
    }
    private void writeObject(ObjectOutputStream stream) throws IOException{
        //采用默认的序列化机制处理非transient字段
        stream.defaultWriteObject();
        //写入transient字段
        stream.writeObject(b);
    }
    private void readObject(ObjectInputStream stream) throws IOException,ClassNotFoundException{
        //使用默认的反序列化机制处理非transient字段
        stream.defaultReadObject();
        //读出transient字段
        b=(String)stream.readObject();
    }
    public static void main(String...args) throws Exception{
        SerialCtl sc=new SerialCtl("Test1","Test2");
        System.out.println("Before:\n"+sc);
        ByteArrayOutputStream buf=new ByteArrayOutputStream();
        ObjectOutputStream o=new ObjectOutputStream(buf);
        o.writeObject(sc);
        ObjectInputStream in=new ObjectInputStream(new ByteArrayInputStream(buf.toByteArray()));
        SerialCtl sc2=(SerialCtl)in.readObject();
        System.out.println("After:\n"+sc2);
    }
}/*output
Before:
SerialCtl{a='Not Transient:Test1', b='Transient:Test2'}
After:
SerialCtl{a='Not Transient:Test1', b='Transient:Test2'}
*/
```

#### 15.9.3使用“持久性”

通过序列化和反序列，我们可以实现对一个对象的深度复制













