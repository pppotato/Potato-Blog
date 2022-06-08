---
title: 深入理解Java虚拟机
date: 2019-04-01
categories:
- Java
tags:
- 虚拟机
---

## 1.Java内存区域与内存溢出异常

### 1.1运行时数据区域

Java虚拟机在执行Java程序的过程中会把它所管理的内存划分为若干个不同的数据区域。Java虚拟机所管理的内存包括以下几个**运行时数据区域**：

- **所有线程共享的数据区**
  - **堆**
    - Java堆是虚拟机所管理的内存中最大的一块，被所有线程共享的区域，在虚拟机启动时创建
    - Java堆存在的唯一目的就是存放对象实例，它也是垃圾收集器管理的内存区域
    - 从分配内存的角度看，所有线程共享的Java堆中可以划分出多个线程私有的分配缓冲区（TLAB）
    - Java堆可以处于物理上不连续的内存空间中，但对于大对象（如数组对象），多数虚拟机实现出于实现简单、存储高效的考虑，很可能会要求连续的内存空间
    - Java堆既可以被实现为固定大小的，也可以是扩展的（通过参数-Xmx和-Xms设定）。如果在Java堆中没有内存完成实例分配，并且堆也无法再扩展时，Java虚拟机将会抛出`OutOfMemoryError`异常
  - **方法区**
    - 方法区是各个线程共享的内存区域，用于存储已被虚拟机加载的类型信息、常量、静态变量、即时编译器编译后的代码缓存等数据
    - 方法区除了和Java堆一样不需要连续的内存和可以选择固定大小或者可扩展外，甚至还可以选择不实现垃圾收集。垃圾收集行为在该区域的内存回收目标主要是针对常量池的回收和对类型的卸载
    - 如果方法区无法满足新的内存分配需求时，将抛出`OutOfMemoryError`异常
    - **运行时常量池**
      - 运行时常量池是方法区的一部分。Class文件中的常量池表，用于存放编译期生成的各种字面量与符号引用，这部分内容将在类加载后存放到方法区的运行时常量池中（一般来说，除了保存Class文件中描述的符号引用外，还会把由符号引用翻译出来的直接引用也存储在运行时常量池中）
      - 运行时常量池相对于Class文件常量池，其具备动态性，Java语言并不要求常量一定只有编译期才能产生，即并非预置入Class文件中常量池的内容才能进入方法区，运行期间也可以将新的常量放入池中（比如`String`类的`intern()`方法）
      - 当常量池无法再申请到内存时会抛出`OutOfMemoryError`异常 
- **线程隔离的数据区**
  - **虚拟机栈**
    - Java虚拟机栈是线程私有的，其生命周期与线程相同
    - 虚拟机栈描述的是Java方法执行的线程内存模型：每个方法被执行的时候，Java虚拟机都会同步创建一个栈帧用于存储局部变量表、操作数栈、动态连接、方法出口等信息。每一个方法被调用直至执行完毕的过程，就对应着一个栈帧在虚拟机栈中从入栈到出栈的过程
      - 局部变量表存放了编译期可知的各种Java虚拟机基本数据类型（boolean、byte、char、short、int、float、long、double）、对象引用（reference类型，它并不等同于对象本身，可能是一个指向对象起始地址的引用指针，也可能是指向一个代表对象的句柄或者其他与此对象相关的位置）和returnAddress类型（指向了一条字节码指令的地址——方法退出后，该方法被调用处的地址）
      - 局部变量表中存储这些数据类型的存储空间以局部变量槽来表示，64位长度的long和double类型的数据会占用两个变量槽，其余数据类型占用一个
      - 局部变量表所需的内存空间在编译期间完成分配，当进入一个方法时，这个方法需要在栈帧中分配多大的局部变量空间是完全确定的，在方法运行期间不会改变局部变量表的大小（大小即局部变量槽的数量）
    - 如果线程请求的栈深度大于虚拟机所允许的深度，将抛出`StackOverflowError`异常；如果Java虚拟机栈容量可以动态扩展，当栈扩展时无法申请到足够的内存会抛出`OutOfMemoryError`异常
  - **本地方法栈**
    - 与虚拟机栈作用非常相似，虚拟机栈为虚拟机执行Java方法（即字节码）服务，而本地方法栈则是为虚拟机使用到的本地（Native）方法服务
  - **程序计数器**
    - 是一块较小的内存空间，它可以看作是当前线程执行的字节码的行号指示器。在Java虚拟机的概念模型里，字节码解释器工作时就是通过改变这个计数器的值来选取下一条需要执行的字节码指令
    - Java虚拟机的多线程是通过线程轮流切换、分配处理器执行时间的方式来实现，在任何一个确定时刻，一个处理器都只会执行一条线程中的指令。所以，程序计数器被设计为**“线程私有”**的内存区域，这样每条线程都拥有独立的程序计数器，在线程切换后都能够恢复到正确的执行位置
    - 如果线程正在执行的是一个Java方法，那么计数器记录的是正在执行的虚拟机字节码指令的地址；如果正在执行的是一个本地（Native）方法，那么这个计数器值则为空
    - 程序计数器所代表的内存区域不会出现`OutOfMemory`异常

![image-20210321205304447](/static/img/image-20210321205304447.png)

#### 1.1.1直接内存

- 直接内存并不是虚拟机运行时数据区的一部分，也不是《Java虚拟机规范》中定义的内存区域。本机中的机器内存不属于堆内存的部分就是堆外内存，而堆外内存也即直接内存
- 在JDK 1.4中新加入了NIO类，引入了一种基于通道与缓冲区 （Buffer）的I/O方式，它可以使用Native函数库直接分配堆外内存（直接内存），然后通过一个存储在Java堆里面的`DirectByteBuffer`对象作为这块内存的引用进行操作
- 本机直接内存的分配不会受到Java堆大小的限制，但是受本机总内存大小以及处理器寻址空间的限制，一般服务器管理员配置虚拟机参数时，会根据实际内存去设置-Xmx等参数信息，但经常忽略掉直接内存，使得各个内存区域总和大于物理内存限制（包括物理的和操作系统级的限制），从而导致动态扩展时出现`OutOfMemoryError`异常

### 1.2HotSpot虚拟机对象探秘

#### 1.2.1对象的创建

在虚拟机中，普通Java对象（不包含数组和Class对象）的创建过程：

- 当Java虚拟机遇到一条字节码new指令，首先会去检查这个指令的参数是否能在常量池中定位到一个类的符号引用，并检查该符号引用代表的类是否已被加载、解析和初始化过。如果没有，则必须先执行相应的类加载过程

- 为新生对象分配内存。对象所需内存的大小在类加载完成后便可完全确定，所以为对象分配内存实际上是把一块确定大小的内存块从Java堆中划分出来

  - 假如Java堆中内存是绝对规整的（即所有使用过的内存都被放在一边，空闲的内存都被放在另一边）：在空闲内存与使用过的内存中间放置一个指针作为分界点的指示器，那么为对象分配内存只需要将指针向空闲空间方向移动一段与对象大小相等的距离。该分配方式也叫”指针碰撞“
  - 假如Java堆中内存是不规整的（即已被使用的内存与空闲的内存相互交错）：虚拟机会维护一个列表，记录上哪些内存块是可用，在分配的时候就从列表中找到一块足够大的空间划分给对象，并更新列表上的记录。该分配方式也叫“空闲列表”

  并发情况下为对象分配内存，可能会出现正在给对象A分配内存，指针还没来得及修改，对象B又同时使用了原来的指针来分配内存的问题。这个问题有两种可选方案：

  - 对分配内存空间的动作进行同步处理——实际上虚拟机是采用CAS配上失败重试的方式保证更新操作的原子性
  - 把内存分配的动作按照线程划分在不同的空间之中进行，即每个线程在Java堆中预先分配一小块内存——本地线程分配缓冲（TLAB），这一块内存是线程私有的，哪个线程要分配内存，就在哪个线程的本地缓冲区中分配，只有本地缓冲区用完了，分配新的缓存区时才需要同步锁定。虚拟机是否使用TLAB，可以通过-XX：+/-UseTLAB参数来设定。

- 虚拟机必须将为对象分配到的内存空间（不包括对象头）都初始化为零值，如果使用了TLAB，这项工作也可以提前至TLAB分配时顺便进行。这步操作保证了对象的实例字段可以不赋初值就直接使用

- 虚拟机对对象头进行设置。对象是哪个类的实例、如何才能找到类的元数据信息、对象的哈希码（实际上对象的哈希码会延后到真正调用Object::hashCode()方法时才计算）、对象的GC分代年龄等信息会被存放在对象的对象头中。根据虚拟机当前运行状态的不同，如是否启用偏向锁等，对象头会有不同的设置方式

- 执行构造函数，即Class文件中的`<init>()`方法。Java编译器会在遇到new关键字的地方同时生成两条字节码指令——new指令和invokespecial指令，new指令之后会接着执行invokespecial指令，即执行`<init>()`方法

#### 1.2.2对象的内存布局

在HotSpot虚拟机里，对象在堆内存中的存储布局可分为三个部分：

- **对象头**

  对象头包括两类信息：

  - 第一类是用于存储对象自身的运行时数据，如哈希码、GC分代年龄、锁状态标志、线程持有的锁、偏向线程ID、偏向时间戳等。这部分数据被称为Mark Word
  - 第二类是类型指针，即对象指向它的类型元数据（保存在方法区中）的指针，虚拟机通过这个指针来确定该对象是哪个类的实例。并不是所有的虚拟机实现都必须在对象数据上保留类型指针，即查找对象的元数据信息并不一定要经过对象本身。另外，如果对象是一个Java数组，那在对象头中还必须有一块用于记录数组长度的数据（对于普通对象，虚拟机通过其元数据信息即可确定大小；而数组对象，必须要知道其长度，才能确定其大小）

- **实例数据**

  实例数据是对象真正存储的有效信息，即程序代码中所定义的各种类型的字段内容，无论是从父类继承下来的，还是在子类中定义的字段都必须记录下来。这部分的存储顺序会受虚拟机分配策略参数（-XX：FieldsAllocationStyle参数）和字段在Java源码中定义顺序的影响。HotSpot虚拟机默认的分配顺序为longs/doubles、ints、shorts/chars、bytes/booleans、oops，即相同宽度的字段总是被分配到一起存放，在满足这个前提条件的情况下，在父类中定义的变量会出现在子类之前。如果HotSpot虚拟机的+XX：CompactFields参数值为true（默认就为true），那子类之中较窄的变量也允许插入父类变量的空隙之中，以节省出一点点空间

- **对齐填充**

  对齐填充起占位符的作用。由于HotSpot虚拟机的自动内存管理系统要求对象起始地址必须是8字节的整数倍，即任何对象的大小都必须是8字节的整数倍。对象头部分已经被精心设计成正好是8字节的倍数，所以，如果对象的实例数据部分没有对齐的话，就需要通过对齐填充来补全

#### 1.2.3对象的访问定位

创建对象是为了后续使用该对象，Java程序会通过栈上的reference数据来操作堆上的具体对象，主流的访问方式两种：

- **句柄访问**

  Java堆中将可能会划分出一块内存来作为句柄池，reference中存储的就是对象的句柄地址，而句柄中包含了对象实例数据和类型数据各自具体的地址信息

  ![image-20210321210151856](/static/img/image-20210321210151856.png)

  优势：在对象被移动（比如垃圾收集时移动对象）时只会改变句柄中的实例数据指针，而reference本身不需要被修改

- **直接指针**

  reference中存储的直接就是对象地址，Java堆中对象的内存布局必须考虑如何放置访问类型数据的相关信息

  ![image-20210321210903170](/static/img/image-20210321210903170.png)

  优势：速度快，相比句柄访问节省了一次指针定位的时间开销

HotSpot虚拟机主要使用直接指针进行对象访问

### 1.3实战：OutOfMemoryError异常

#### 1.3.1Java堆溢出

Java堆用于存储对象实例，我们只要不断创建对象，并保证GC Roots到对象之间有可达路径来避免垃圾回收机制清除这些对象，那么随着对象数量的增加，总容量触及最大堆的容量限制后就会产生内存溢出异常

```java
/**
 * VM Args:-Xms20m -Xmx20m -XX:+HeapDumpOnOutOfMemoryError
 * VM Args执行程序时设定的虚拟机启动参数
 * -Xms20m设置最小堆内存20M，-Xmx20m设置最大堆内存20M，两者相同避免堆自动扩展
 * -XX:+HeapDumpOnOutOfMemoryError可以让虚拟机 在出现内存溢出异常的时候Dump出当前的内存堆转储快照
 */
package site.potatoblog.oom;

import java.util.ArrayList;
import java.util.List;

public class HeapOOM {
    static class OOMObject{}
    public static void main(String...args){
        List<OOMObject> list=new ArrayList<>();
        while (true){
            //将新建的OOMObject对象加入容器中，使得GC Roots到对象之间有可达路径，避免了垃圾回收机制清除这些对象
            list.add(new OOMObject());
        }
    }
}/*output
java.lang.OutOfMemoryError: Java heap space
Dumping heap to java_pid21348.hprof ...
Heap dump file created [29961488 bytes in 0.116 secs]
*/
```

Java堆内存区域异常的解决办法：

- 如果是内存泄漏，可通过内存映像分析工具查看泄露对象到GC Roots的引用链，找到泄漏对象是通过怎样的引用路径、与哪些GC Roots相关联，才导致垃圾收集器无法回收它们，根据泄漏对象的类型信息以及它到GC Roots引用链的信息，一般可以比较准确地定位到这些对象创建的位置，进而找出产生内存泄漏的代码的具体位置
- 如果是内存溢出，说明内存中的对象都是必须存活的，那就应当检查虚拟机的堆参数（-Xmx与-Xms）设置，与机器的内存对比，看看是否还有向上调整的空间。再从代码上检查是否存在某些对象生命周期过长、持有状态时间过长、存储结构设计不合理等情况，尽量减少程序运行期的内存消耗

#### 1.3.2虚拟机栈和本地方法栈溢出

HotSpot虚拟机中并不区分虚拟机栈和本地方法栈，所以-Xoss参数（设置本地方法栈大小）虽然存在，但实际没有任何效果，栈容量只能由-Xss参数来设定。关于虚拟机栈和本地方法栈，在《Java虚拟机规范》中描述了两种异常： 

- 如果线程请求的栈深度大于虚拟机所允许的最大深度，将抛出`StackOverflowError`异常
- 如果虚拟机的栈内存允许动态扩展，当扩展栈容量无法申请到足够的内存时，将抛出`OutOfMemoryError`异常
  - HotSpot虚拟机是不支持栈内存动态扩展，所以除非在创建线程申请内存时就因无法获得足够内存而出现`OutOfMemoryError`异常（这样的内存溢出与栈空间是否足够并无任何关系，主要取决于操作系统本身的内存使用状态是否能为每个线程的栈分配足够内存），否则在线程运行时是不会因为扩展而导致内存溢出，只会因为栈容量无法容纳新的栈帧而导致`StackOverflowError`异常

对第一种异常`StackOverflowError`实验：

- 使用-Xss参数减少栈内存容量

  ```java
  /**
   * VM Args:-Xss180k
   */
  package site.potatoblog.oom;
  
  public class JavaVMStackSOF {
      private int stackLength=1;
      public void stackLeak(){
          stackLength++;
          stackLeak();
      }
      public static void main(String...args) throws Throwable{
          JavaVMStackSOF sof=new JavaVMStackSOF();
          try{
              sof.stackLeak();
          }catch (Throwable e){
              System.out.println("stack length:"+sof.stackLength);
              throw e;
          }
      }
  }/*output
  stack length:19429
  Exception in thread "main" java.lang.StackOverflowError
  	at site.potatoblog.oom.JavaVMStackSOF.stackLeak(JavaVMStackSOF.java:7)
  	...
  */
  ```

  结果：抛出`StackOverflowError`异常，异常出现时输出的栈深度相应缩小（栈内存容量减少了，可以分配给的栈帧数量也就少了，所以栈深度缩小）

- 定义大量局部变量，增大此方法帧中局部变量表的长度

  ```java
  package site.potatoblog.oom;
  
  public class JavaVMStackSOF2 {
      private static int stackLength = 0;
      public static void test() {
          long unused1, unused2, unused3, unused4, unused5, unused6, unused7, unused8, unused9, unused10, unused11, unused12, unused13, unused14, unused15, unused16, unused17, unused18, unused19, unused20, unused21, unused22, unused23, unused24, unused25, unused26, unused27, unused28, unused29, unused30, unused31, unused32, unused33, unused34, unused35, unused36, unused37, unused38, unused39, unused40, unused41, unused42, unused43, unused44, unused45, unused46, unused47, unused48, unused49, unused50, unused51, unused52, unused53, unused54, unused55, unused56, unused57, unused58, unused59, unused60, unused61, unused62, unused63, unused64, unused65, unused66, unused67, unused68, unused69, unused70, unused71, unused72, unused73, unused74, unused75, unused76, unused77, unused78, unused79, unused80, unused81, unused82, unused83, unused84, unused85, unused86, unused87, unused88, unused89, unused90, unused91, unused92, unused93, unused94, unused95, unused96, unused97, unused98, unused99, unused100;
          stackLength++;
          test();
          unused1 = unused2 = unused3 = unused4 = unused5 = unused6 = unused7 = unused8 = unused9 = unused10 = unused11 = unused12 = unused13 = unused14 = unused15 = unused16 = unused17 = unused18 = unused19 = unused20 = unused21 = unused22 = unused23 = unused24 = unused25 =
                  unused26 = unused27 = unused28 = unused29 = unused30 = unused31 = unused32 = unused33 = unused34 = unused35 = unused36 = unused37 = unused38 = unused39 = unused40 = unused41 = unused42 = unused43 = unused44 = unused45 = unused46 = unused47 = unused48 = unused49 = unused50 = unused51 = unused52 = unused53 = unused54 = unused55 = unused56 = unused57 = unused58 = unused59 = unused60 = unused61 = unused62 = unused63 = unused64 = unused65 = unused66 = unused67 = unused68 = unused69 = unused70 = unused71 = unused72 = unused73 = unused74 = unused75 = unused76 = unused77 = unused78 = unused79 = unused80 = unused81 = unused82 = unused83 = unused84 = unused85 = unused86 = unused87 = unused88 = unused89 = unused90 = unused91 = unused92 = unused93 = unused94 = unused95 = unused96 = unused97 = unused98 = unused99 = unused100 = 0;
      }
      public static void main(String...args){
          try {
              test();
          }catch (Error e){
              System.out.println("stack length:"+stackLength);
              throw e;
          }
      }
  }/*output
  stack length:4890
  Exception in thread "main" java.lang.StackOverflowError
  	at site.potatoblog.oom.JavaVMStackSOF2.test(JavaVMStackSOF2.java:8)
  	...
  */
  ```

  结果：抛出`StackOverflowError`异常，异常出现时输出的栈深度相应缩小（栈帧太大，栈内存可以分配给的栈帧数量也就少了，所以栈深度缩小）

#### 1.3.3方法区和运行时常量池溢出

运行时常量池是方法区的一部分，HotSpot虚拟机在JDK 7之前，都是用永久代来实现方法区，但是从JDK 7开始逐步去除永久代，并在JDK 8中完全使用元空间来实现方法区

`String::intern()`：是一个本地方法，如果字符串常量池中已经包含一个等于此`String`对象的字符串，则返回代表池中这个字符串的`String`对象的引用；否则，会将此`String`对象包含的字符串添加到常量池中，并且返回此`String`对象的引用

方法区不同实现对于`String::intern()`方法的影响：

```java
package site.potatoblog.oom;

public class RuntimeConstantPoolOOM {
    public static void main(String...args){
        String str1=new StringBuilder("计算机").append("软件").toString();
        System.out.println(str1.intern()==str1);
        String str2=new StringBuilder("ja").append("va").toString();
        System.out.println(str2.intern()==str2);
        String str3=new StringBuilder("ja").append("va").toString();
        //JDK7中，因为java字符串已经在常量池里，所以str3.intern()返回的是java字符串首次出现时的引用，即str2
        System.out.println(str3.intern()==str3);
    }
}/*output--JDK6
false
false
false
*/
/*output--JDK7
true
true
false
*/
```

- 永久代实现

  JDK 6及之前都是采用永久代来实现方法区，常量池都是分配在永久代中。`intern()`方法将首次遇到的字符串实例复制到永久代的字符串常量池中存储，返回的也是永久代里这个字符串实例的引用，而由`StringBuilder`创建的字符串对象实例在Java堆上，两者必不可能是同一个引用，所以`false`

- 元空间实现

  JDK7之后开始逐步去除永久代，原本存放在永久代中的字符串常量池被移至Java堆中。`intern()`方法不需要再拷贝字符串实例到永久代，只需要在常量池里记录一下首次出的实例引用，所以`intern()`返回的引用和`StringBuilder`创建的那个字符串实例就是同一个

不同JDK版本对于运行时常量池溢出异常的影响：

```java
/**
 * VM Args:-XX:PermSize=6M -XX:MaxPermSize=6M --JDK 6
 * VM Args:-Xms6m -Xmx6m --JDK 7
 */
package site.potatoblog.oom;

import java.util.HashSet;
import java.util.Set;

public class RuntimeConstantPoolOOM {
    public static void main(String...args){
        //使用Set保持着常量池引用，避免Full GC回收常量池行为
        Set<String> set=new HashSet<>();
        short i=0;
        while (true){
            set.add(String.valueOf(i++).intern());
        }
    }
}/*output --JDK6
Exception in thread "main" java.lang.OutOfMemoryError: PermGen space at java.lang.String.intern(Native Method) at org.fenixsoft.oom.RuntimeConstantPoolOOM.main(RuntimeConstantPoolOOM.java: 18)
*/
/*output --JDK 7
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at java.base/java.lang.Integer.toString(Integer.java:440)
	at java.base/java.lang.String.valueOf(String.java:3058)
	at site.potatoblog.oom.RuntimeConstantPoolOOM.main(RuntimeConstantPoolOOM.java:15)
*/
```

- JDK6及以前，字符串常量池存放在永久代中，所以设置虚拟机参数-XX:PermSize=6M -XX:MaxPermSize=6M可以将永久代的内存大小限定为6M，最终通过不断向字符串常量池中添加新引用，导致内存溢出
- JDK7及以后，即使使用如JDK 6中-XX：MaxPermSize参数（设置永久代内存大小）或者在JDK 8及以上版本使用-XX：MaxMeta-spaceSize参数（设置元空间内存大小）将方法区容量限制在6M，也都不会重现内存溢出，因为字符串常量池被转移存放在Java堆中，应该使用-Xmx参数限制最大堆内存为6M，，最终通过不断向字符串常量池中添加新引用，导致内存溢出

方法区溢出异常：方法区主要用于存放类型的相关信息，如类名、访问修饰符、常量池、字段描述、方法描述等。要让该区域产生溢出异常，就需要在运行时产生大量的类去填满方法区，直到溢出为止

```java
/**
 * VM Args:-XX:PermSize=10M -XX:MaxPermSize=10M --JDK7
 */
package site.potatoblog.oom;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

interface OOMInterface{}

public class JavaMethodAreaOOM {
    public static void main(String...args){
        while (true){
            OOMInterface oi=new OOMObject();
            //采用动态代理在运行时生成类
            OOMInterface proxy= (OOMInterface) Proxy.newProxyInstance(oi.getClass().getClassLoader(), oi.getClass().getInterfaces(), new InvocationHandler() {
                @Override
                public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                    return null;
                }
            });
        }
    }
    static class OOMObject implements OOMInterface{}
}/*output
Caused by: java.lang.OutOfMemoryError: PermGen space at java.lang.ClassLoader.defineClass1(Native Method) at java.lang.ClassLoader.defineClassCond(ClassLoader.java:632) at java.lang.ClassLoader.defineClass(ClassLoader.java:616) ... 8 more
*/
```

方法区溢出也是一种常见的内存溢出异常，一个类如果要被垃圾收集器回收，要达成的条件是比较苛刻的。在经常运行时生成大量动态类的应用场景里，就应该特别关注这些类的回收状况。这类场景包括CGLib字节码增强和动态语言外，常见的还有：大量JSP或动态产生JSP 文件的应用（JSP第一次运行时需要编译为Java类）、基于OSGi的应用（即使是同一个类文件，被不同的加载器加载也会视为不同的类）等

JDK 8以后，元空间代替了永久代实现方法区，正常的动态创建新类型的测试用例已经很难再迫使虚拟机产生方法区的溢出异常，但是HotSpot还是提供了一些参数作为元空间的防御措施，主要包括： 

- -XX：MaxMetaspaceSize：设置元空间最大值，默认是-1，即不限制，或者说只受限于本地内存大小。

- -XX：MetaspaceSize：指定元空间的初始空间大小，以字节为单位，达到该值就会触发垃圾收集进行类型卸载，同时收集器会对该值进行调整：如果释放了大量的空间，就适当降低该值；如果释放了很少的空间，那么在不超过-XX：MaxMetaspaceSize（如果设置了的话）的情况下，适当提高该值。

- -XX：MinMetaspaceFreeRatio：作用是在垃圾收集之后控制最小的元空间剩余容量的百分比，可减少因为元空间不足导致的垃圾收集的频率。类似的还有-XX：Max-MetaspaceFreeRatio，用于控制最大的元空间剩余容量的百分比。 

#### 1.3.4本机直接内存溢出

直接内存的容量大小可通过-XX:MaxDirectMemorySize参数来指定，如果不指定则默认与堆内存最大值一致

```java
/**
 * VM Args:-Xmx20M -XX:MaxDirectMemorySize=10M
 */
package site.potatoblog.oom;

import sun.misc.Unsafe;

import java.lang.reflect.Field;

public class DirectMemoryOOM {
    private static final int _1MB=1024*1024;
    public static void main(String...args) throws IllegalAccessException {
        Field unsafeField= Unsafe.class.getDeclaredFields()[0];
        unsafeField.setAccessible(true);
        Unsafe unsafe=(Unsafe)unsafeField.get(null);
        while (true){
            unsafe.allocateMemory(_1MB);
        }
    }
}/*output
Exception in thread "main" java.lang.OutOfMemoryError
   at java.base/jdk.internal.misc.Unsafe.allocateMemory(Unsafe.java:616)
   at jdk.unsupported/sun.misc.Unsafe.allocateMemory(Unsafe.java:462)
   at site.potatoblog.oom.DirectMemoryOOM.main(DirectMemoryOOM.java:17)
*/
```

由直接内存导致的内存溢出，一个明显的特征是在Heap Dump文件中不会看见有什么明显的异常情况，如果在发现内存溢出之后产生的Dump文件很小，而程序中又直接或间接使用了DirectMemory（比如使用NIO类），那就需要考虑检查直接内存方面的原因

## 2.垃圾收集器与内存分配策略

- 程序计数器、虚拟机栈、本地方法栈这3块区域随线程而生，随线程而灭，栈中的栈帧随着方法的进入和退出而执行着出栈和入栈操作。每一个栈帧中分配多少内存基本上是在类结构确定下来时就已知的，因此这几块区域的内存分配和回收都具备确定性，当方法结束或线程结束时，内存自然就随着回收了
- Java堆和方法区这两块区域有着显著的不确定性：一个接口的多个实现类需要的内存可能会不一样，一个方法所执行的不同条件分支所需要的内存也可能不一样，只有处于运行期间，我们才 能知道程序究竟会创建哪些对象，创建多少个对象，这部分内存的分配和回收是动态的。垃圾收集器所关注的正是这部分内存该如何管理

### 2.1对象已死？

堆中存放着几乎所有的对象实例，垃圾收集器在对堆进行回收前，第一件事就是要确定这些对象之中哪些还“存活”着，哪些已经“死去”（即不可能再被任何途径使用的对象）

#### 2.1.1引用计数算法

引用计数算法：在对象中添加一个引用计数器，每当有一个地方引用它时，计数器值就加一；当引用失效时，计数器值就减一；任何时刻计数器为零的对象就是不可能再被使用

Java虚拟机并没有使用引用计数算法来管理内存，因为引用计数算法很难解决对象之间的相互循环引用

```java
/**
 * VM Args:-Xlog:gc+heap=trace
 * 虚拟机参数-Xlog:gc+heap=trace，用于输出垃圾回收前后堆中的信息
 */
package site.potatoblog.gc;

public class ReferenceCountingGC {
    public Object instance=null;
    private static final int _1MB=1024*1024;
    //设置该成员属性的唯一意义是为了让该类的对象能够多占点内存，以便在GC日志中看清楚是否有回收过
    private byte[] bigSize=new byte[_1MB];
    public static void main(String...args){
        ReferenceCountingGC objA=new ReferenceCountingGC();
        ReferenceCountingGC objB=new ReferenceCountingGC();
        //objA.instance引用的对象和objB.instance引用的对象之间相互循环引用
        objA.instance=objB;
        objB.instance=objA;
        //让引用objA和引用objB指向null，这样原先指向的对象就无法被访问，应该被回收
        //但是因为循环引用，所以原先指向的对象引用计数永远都不为0，所以引用计数算法无法回收他们
        //但是虚拟机不是采用引用计数算法，它可以回收这两个对象
        objA=null;
        objB=null;
        //强制触发垃圾回收
        System.gc();
    }
}/*output
[0.153s][debug][gc,heap] GC(0) Heap before GC invocations=0 (full 0): garbage-first heap   total 131072K, used 6144K [0x0000000081800000, 0x0000000100000000)
[0.157s][debug][gc,heap] GC(0) Heap after GC invocations=1 (full 1): garbage-first heap   total 10240K, used 960K [0x0000000081800000, 0x0000000100000000)
*/
//回收前使用了6144K内存空间，回收后使用了960K内存空间，说明两个对象被回收了
```

#### 2.1.2可达性分析算法

Java的内存管理子系统是通过可达性分析算法来判定对象是否存活

基本思路：通过一系列称为“GC Roots“的根对象作为起始节点集，从这些节点开始，根据引用关系向下搜索，搜索过程所走过的路径称为”引用链“，如果某个对象到GC Roots间没有任何的引用链相连，那么说明从GC Roots到这个对象不可达，即该对象是不可能再被使用的

![](/static/img/image-20210322194321228.png)

在Java技术体系里，固定可作为GC Roots的对象包括：

- 在虚拟机栈（栈帧中的局部变量表）中引用的对象，比如各个线程被调用的方法堆栈中使用到的参数、局部变量、临时变量等
- 在方法区中类静态属性引用的对象，比如Java类的引用类型静态变量
- 在方法区中常量引用的对象，比如字符串常量池里的引用
- 在本地方法栈中JNI（即本地（Native）方法）引用的对象
- Java虚拟机内部的引用，比如基本数据类型对象的Class对象，一些常驻的异常对象（比如`NullPointException`、`OutOfMemoryError`）等，还有系统类加载器
- 所有被同步锁（`synchroinized`关键字）持有的对象
- 反映Java虚拟机内部情况的JMXBean、JVMTI中注册的回调、本地代码缓存等

#### 2.1.3再谈引用

JDK 1.2后，Java对引用的概念进行了扩充，将引用分为4种：

- **强引用**

  指程序代码中普遍存在的引用赋值，即类似`Object obj=new Object()`这种引用关系。垃圾收集器永远不会回收被强引用关联的对象

- **软引用**

  用来描述一些还有用，但非必须的对象。被软引用关联的对象，在系统将要发生内存溢出异常前，会把这些对象列进回收范围之中进行第二次回收，如果这次回收还没有足够的内存，才会抛出内存溢出异常。JDK 1.2后提供`SoftReference`类来实现软引用

- **弱引用**

  用来描述那些非必须对象，其强度比软引用更弱一点，被弱引用关联的对象只能生存到下一次垃圾收集发生为止。当垃圾收集器开始工作，无论当前内存是否足够，都会回收掉只被弱引用关联的对象。JDK 1.2后提供了`WeakReference`类来实现弱引用

- **虚引用**

  最弱的一种引用关系。一个对象是否有虚引用的存在，完全不会对其生存时间构成影响，也无法通过虚引用来取得一个对象实例。为一个对象设置虚引用关联的唯一目的只是为了能在这个对象被收集器回收时收到一个系统通知。JDK 1.2后提供了`PhantomReference`类来实现虚引用

#### 2.1.4生存还是死亡？

在可达性分析算法中被判定为不可达的对象，未必就是真正的死亡，一个对象真正的死亡至少要经历两次标记过程：

- 如果对象在进行可达性分析后发现没有与GC Roots相连的引用链，那么它将会被第一次标记，随后判断该对象是否有必要执行`finalize()`方法。假如对象没有覆盖`finalize()`方法，或`finalize()`方法已经被虚拟机调用过（`finalize()`方法只会在对象首次被回收时调用，且仅调用这一次），那么虚拟机将视这两种情况为“没有必要执行”
- 被判定为确有必要执行`finalize()`方法的对象会被放置在一个F-Queue的队列中，并在稍后由一条由虚拟机自动建立的、低调度优先级的Finalizer线程去执行它们的`finalize()`方法，随后收集器将对F-Queue中的对象进行第二次标记，如果对象在`finalize()`方法中重新与引用链上任何一个对象建立关联，那么在第二次标记时它将被移出“即将回收”的集合；如果对象这时候还没有逃脱，那基本上它就真的要被回收了

```java
package site.potatoblog.gc;

public class FinalizeEscapeGC {
    public static FinalizeEscapeGC SAVE_HOOK=null;
    public void isAlive(){
        System.out.println("yes,i am still alive");
    }

    //该方法在该类某个对象首次被回收时调用，之后若该对象再次被回收则不调用
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("finalize method executed");
        //使用this关键字，将对象自身赋值给某引用，使对象重新与引用链上的某对象关联，这样二次标记就不会将其列入回收集合
        FinalizeEscapeGC.SAVE_HOOK=this;
    }
    public static void main(String...args) throws InterruptedException {
        SAVE_HOOK=new FinalizeEscapeGC();
        //SAVE_HOOK引用指向null，原先指向的对象不可达
        SAVE_HOOK=null;
        //强制触发垃圾回收
        System.gc();
        //Finalizer线程优先级低，此处让当前线程休眠，等待Finalizer线程执行
        Thread.sleep(500);
        if(SAVE_HOOK!=null){
            SAVE_HOOK.isAlive();
        }else {
            System.out.println("no,i am dead");
        }
        SAVE_HOOK=null;
        //再次回收该对象时，就不会再调用该对象的finalize()方法
        System.gc();
        Thread.sleep(500);
        if(SAVE_HOOK!=null){
            SAVE_HOOK.isAlive();
        }else {
            System.out.println("no,i am dead");
        }
    }
}/*output
finalize method executed
yes,i am still alive
no,i am dead
*/
```

#### 2.1.5回收方法区

方法区的垃圾收集主要回收两部分内容：

- **废弃的常量**

  假如在常量池中存在字符串 "abc"，如果当前没有任何 String 对象引用该字符串常量的话，就说明常量 "abc" 就是废弃常量，如果这时发生内存回收的话而且有必要的话，"abc" 就会被系统清理出常量池了。常量池中其他类（接口）、方法、字段的符号引用也与此类似

- **不再使用的类型**

  判断一个类是不再使用的类型需要同时满足三个条件：

  - 该类所有的实例都已经被回收，即Java堆中不存在该类及其任何派生子类的实例
  - 加载该类的类加载器已经被回收（该条件一般出现在可替换类加载器的场景，比如OSGI、JSP的重加载等）
  - 该类对于的Class对象没有在任何地方被引用，无法在任何地方通过反射返问该类的方法

  Java虚拟机被允许对满足以上三个条件的无用类进行回收，这里说的仅仅是”被允许“，而不是和对象一样，没有引用了就必然会回收。类型是否回收，是可以通过虚拟机参数来控制

  在大量使用反射、动态代理、CGLib等字节码框架，动态生成JSP以及OSGi这类频繁自定义类加载器的场景中，通常都需要Java虚拟机具备类型卸载的能力，以保证不会对方法区造成过大的内存压力

### 2.2垃圾收集算法

从判定对象消亡的角度出发，垃圾收集算法可以划分为”引用计数式垃圾收集“和”追踪式垃圾收集“两大类，主流虚拟机采用”追踪式垃圾收集“

#### 2.2.1分代收集理论

- 弱分代假说：绝大多数对象都是朝生夕灭的
- 强分代假说：熬过越多次垃圾收集过程的对象就越难以消亡
  - 设计原则：上述两个假说是常用垃圾收集器的设计原则，即收集器应该将Java堆划分出不同的区域，然后将回收对象依据其年龄（即对象熬过垃圾收集过程的次数）分配到不同的区域存储。朝生夕灭的对象放在一起，这样每次回收只需要保留少量存活而不需要去去标记那些大量将要被回收的对象；难以消亡的对象放在一起，虚拟机会以较低频率来回收这个区域
  - 具体应用：上述两个假说具体应用到现在的商用虚拟机里，设计者一般至少会把Java堆划分为新生代（Young Generation）和老年代（Old Generation）两个区域
    - 新生代：每次垃圾回收时，新生代中都会有大批对象死去
    - 老年代：老年代中存放难以消亡的对象。每次垃圾回收后新生代中存活的少量对象，将会逐步晋升到老年代中存放
- 跨代引用假说：跨代引用相对于同代引用来说仅占极少数
  - 出现原因：假如要进行一次只局限于新生代区域内的收集（Minor GC），但新生代中的对象是完全有可能被老年代所引用的，为了找出该区域中的存活对象，不得不在固定的GC Roots之外，再额外遍历整个老年代中所有对象来确保可达性分析结果的正确性
  - 假说解释：跨代引用，即新生代对象引用老年代对象或老年代对象引用新生代对象。如果某个老年代对象引用新生代对象，由于老年代对象难以消亡，该引用会使得新生代对象在收集时同样得以存活，进而在年龄增长后晋升到老年代中，此时跨代引用也随即被消除
  - 解决办法：依据这条假说，我们就不应再为了少量的跨代引用去扫描整个老年代只需要在新生代上建立一个全局的数据结构（记忆集），这个结构把老年代划分成若干小块，标识出老年代的哪一块内存会存在跨代引用。此后当发生Minor GC时，只有包含了跨代引用的小块内存需要加入GC Roots进行扫描

Java垃圾收集分为两大类：

- 部分收集：指目标不是完整收集整个Java堆的垃圾收集，其中又分为：
  - 新生代收集（Minor GC/Young GC）：指目标只是新生代的垃圾收集。 
  - 老年代收集（Major GC/Old GC）：指目标只是老年代的垃圾收集。目前只有CMS收集器会有单独收集老年代的行为。需要注意的是 Major GC 在有的语境中也用于指代整堆收集
  - 混合收集（Mixed GC）：指目标是收集整个新生代以及部分老年代的垃圾收集。目前只有G1收集器会有这种行为。 
- 整堆收集（Full GC）：收集整个Java堆和方法区的垃圾收集

#### 2.2.2标记-清除算法

标记-清除算法是最早出现也是最基础的垃圾收集算法，后续的收集算法大多都是以此为基础改进而得到的

- 流程

  该算法分为“标记”和“清除”两个阶段：首先标记出所有要回收的对象，在标记完成后统一回收掉所有被标记对象，也可以反过来，标记存活对象，统一回收所有未被标记的对象 （标记过程就是对象是否死亡的判定过程）

- 问题

  该算法主要缺点有两个：

  - 执行效率不稳定

    如果堆中包含大量对象，并且大部分是需要被回收的，就会产生大量标记和清除的动作，导致标记和清除两个过程的执行效率都随对象数量增长而降低

  - 内存空间碎片化

    标记、清除之后会产生大量不连续的内存碎片，这会使得在分配大对象时无法找到足够的连续内存空间而不得不提前触发另一次垃圾收集动作

  ![image-20210323190308921](/static/img/image-20210323190308921.png)

#### 2.2.3标记-复制算法

为了解决标记-清除算法面对大量可回收对象时执行效率低的问题，标记-复制算法应运而生。

- 流程

  该算法将可用内存按容量划分为大小相等的两块，每次只使用其中的一块。当这一块内存用完了，就将还存活着的对象复制到另一块上面，然后再把已使用过的内存空间一次清理掉

- 优点

  - 不会产生内存碎片

    该算法是针对整个半区回收，不存在产生内存碎片的情况，分配内存时，只需移动堆顶指针，按顺序分配即可

- 问题

  - 空间浪费大

- 应用

  现在商用Java虚拟机大多都优先采用该收集算法去回收新生代，因为新生代中大量对象都是可回收的，这样该算法只需要复制占少数的存活对象，并且放弃了原先按照1：1比例来划分新生代的内存空间，而是将新生代分为一块较大的**Eden空间**和两块较小的**Survivor空间**，每次分配内存只使用Eden和其中一块Survivor。发生垃圾收集时，将Eden和Survivor中仍存活的对象复制到另一块Survivor空间上，然后直接清理掉Eden和已用过的那块Survivor。这样划分的新生代，其可用内存空间可占总容量的90%，假如某次垃圾回收中存活的对象超过总容量的10%，那么未用过的那块Survivor空间将无法容纳这些对象，此时便会依赖其他内存区域（实际上大多就是老年代）进行分配担保

![image-20210323191021304](/static/img/image-20210323191021304.png)

#### 2.2.4标记-整理算法

标记-复制算法在对象存活率较高时就要进行较多的复制操作，效率会降低，尤其不适用于老年代回收。因此，标记-整理算法应运而生

- 流程

  该算法标记过程与标记-清除算法一样，但后续不是直接对可回收对象进行清理，而是让所有存活对象都向内存空间一端移动，然后直接清理掉边界外的内存

- 问题

  - 必须暂停程序的运行

    该算法适用于老年代收集，对于老年代这种每次回收都有大量对象存活的区域，移动存活对象并更新所有引用这些对象的地方将会是一种极为负重的操作，所以必须暂停用户程序才能进行

![image-20210323195545872](/static/img/image-20210323195545872.png)

### 2.3经典垃圾收集器

如果说收集算法是内存回收的方法论，那垃圾收集器就是内存回收的实践者

#### 2.3.1Serial收集器

Serial收集器是一个**单线程工作**的收集器，它的 **“单线程”** 的意义不仅仅意味着它只会使用一条垃圾收集线程去完成垃圾收集工作，更重要的是它在进行垃圾收集工作的时候必须暂停其他所有的工作线程，直到它收集结束

Serial收集器对于**新生代采用标记-复制算法，老年代采用标记-整理算法。*

![image-20210323204245365](/static/img/image-20210323204245365.png)

- 优点：Serial收集器由于是单线程工作，没有线程交互的开销，专心做垃圾收集，可以获得最高的单线程收集效率
- 缺点：会强制将用户正常工作的线程暂停直至收集工作结束

#### 2.3.2ParNew收集器

ParNew收集器实质上是Serial收集器的多线程并行版本，除了同时使用多条线程进行垃圾收集之外，其余行为（控制参数、收集算法、回收策略、**暂停用户程序**等等）和 Serial 收集器完全一样

ParNew收集器对于**新生代采用标记-复制算法，老年代采用标记-整理算法**

![image-20210323205609472](/static/img/image-20210323205609472.png)

它是许多运行在 服务端模式下的虚拟机的首要选择，除了 Serial 收集器外，只有它能与 CMS 收集器（真正意义上的并发收集器）配合工作

**并行和并发概念补充：**

- **并行** ：指多条垃圾收集线程并行工作，但此时用户线程仍然处于等待状态。
- **并发**：指用户线程与垃圾收集线程同时执行（但不一定是并行，可能会交替执行）

#### 2.3.3Parallel Scavenge收集器

Parallel Scavenge 收集器也是使用标记-复制算法的多线程收集器，它看上去几乎和 ParNew 都一样。 **那么它有什么特别之处呢？**

```java
-XX:+UseParallelGC

    使用 Parallel 收集器+ 老年代串行

-XX:+UseParallelOldGC

    使用 Parallel 收集器+ 老年代并行
```

Parallel Scavenge 收集器关注点是吞吐量，而CMS等收集器关注点是尽可能地缩短垃圾收集时用户线程地停顿时间。所谓吞吐量就是处理器用于运行用户代码的时间与处理器总消耗时间的比值

Parallel Scavenge 收集器提供了两个参数用于精确控制吞吐量：

- `-XX：MaxGCPauseMillis`：用于控制最大垃圾收集停顿时间。该参数允许的值是一个大于0的毫秒数，收集器将尽力保证内存回收花费的时间不超过用户设定值
- `-XX：GCTimeRatio`：用于直接设置吞吐量大小。该参数的值应当是一个大于0小于100的整数，也就是垃圾收集时间占总时间的比率，相当于吞吐量的倒数。比如把此参数设置为19，那允许的最大垃圾收集时间就占总时间的5%（即1/(1+19)）

Parallel Scavenge收集器还有一个参数`-XX：+UseAdaptiveSizePolicy`，当这个参数被激活之后，就不需要人工指定新生代的大小（`-Xmn`）、Eden与Survivor区的比例（`-XX：SurvivorRatio`）、晋升老年代对象大小（-`XX：PretenureSizeThreshold`）等细节参数 ，Parallel Scavenge收集器会配合自适应的调节策略，把内存管理的调优任务交给虚拟机去完成

Parallel Scavenge 收集器对于**新生代采用标记-复制算法，老年代采用标记-整理算法。**

![image-20210323205609472](/static/img/image-20210323205609472.png)

#### 2.3.4Serial Old收集器

Serial Old收集器是Serial 收集器的老年代版本，它同样是一个单线程收集器。这个收集器的主要意义也是供客户端模式下的HotSpot虚拟机使用。如果在服务端模式下，它也可能有两种用途：一种用途是在 JDK 5 以及以前的版本中与 Parallel Scavenge 收集器搭配使用，另一种用途是作为 CMS 收集器的后备方案。

#### 2.3.5Parallel Old收集器

Parallel Old收集器是Parallel Scavenge 收集器的老年代版本。使用多线程和“标记-整理”算法。在注重吞吐量以及 CPU 资源的场合，都可以优先考虑 Parallel Scavenge 收集器和 Parallel Old 收集器搭配使用

#### 2.3.6CMS收集器

CMS收集器是一种以获取最短回收停顿时间为目标的收集器，它是基于**标记-清除算法**实现的

- 流程：

  - **初始标记**

    暂停所有的其他线程，标记以下GC Roots能直接关联到的对象，速度很快

  - **并发标记**

    从GC Roots的直接关联对象开始遍历整个对象图的过程，该过程耗时较长但是不需要暂停其他线程，可以并发运行

  - **重新标记**

    暂停所有的其他线程，修正并发标记期间，因用户程序继续运作而导致标记产生变动的那一部分对象的标记记录，该过程比初始标记耗时稍长，但远比并发标记耗时短

  - **并发清除**

    清理删除掉标记阶段判断的已经死亡的对象，由于不需要移动存活对象，所以该阶段也可以与用户线程并发运行

- 缺点：

  - 对CPU资源敏感

  - 无法处理浮动垃圾

    由于CMS收集器是与用户线程并发运行，所以在标记阶段结束后，随着程序的运行自然还是会有新的垃圾对象不断产生，这一部分垃圾就是浮动垃圾，只能等到下一次垃圾收集时再清理。由于在垃圾收集阶段用户线程还需要持续运行，CMS收集器必须预留足够的内存空间供用户线程分配对象，此时就不能等到老年代几乎被填满了再进行收集（比如程序要分配一个大对象，此时新生代无法存放，就会移入老年代，所以老年代的内存要足够）。假如CMS运行期间预留的内存无法满足程序分配对象的需要，就会触发Concurrent Mode Failure导致另一次的Full GC的产生，此时虚拟机将不得不启动后备预案：冻结用户线程的执行，临时启用Serial Old收集器来重新进行老年代的垃圾收集

  - 会产生大量内存碎片

#### 2.3.7Garbage First收集器

Garbage First（简称G1）收集器是一款面向服务器的垃圾收集器,主要针对配备多颗处理器及大容量内存的机器. 以极高概率满足 GC 停顿时间要求的同时,还具备高吞吐量性能特征

- 收集范围

  G1收集器的垃圾收集范围同原先的其他收集器相比，不再是整个新生代（Minor GC）或整个老年代（Major GC），要不就是整个Java堆（Full GC），而是**基于哪块内存中存放的垃圾数量最多，回收收益最大，来进行收集，是一种混合收集（Mixed GC）模式**

- 堆内存布局

  G1收集器也是遵循分代收集理论设计的，只不过它不再坚持固定大小以及固定数量的分代区域划分，它是基于Region的堆内存布局：**G1把连续的Java堆划分为多个大小相等的独立区域（Region）**，每一个Region都可以根据需要，扮演新生代的Eden空间、Survivor空间，或者老年代空间；Region中还有一类特殊的Humongous区域，专门用来存储大对象，G1的大多数行为都把其当作老年代的一部分来看待。G1认为只要大小超过了Region容量一半的对象即为大对象，而对于大小超过了整个Region容量的超级大对象会被存储在N个连续的Humongous区域

- G1相关参数

  - `XX：G1HeapRegionSize`：设置每个Region的大小，取值范围为1MB~32MB，且应为2的N次幂
  - `-XX：MaxGCPauseMillis`：设置允许的收集停顿时间，默认为200毫秒

- 处理思路

  因为G1的堆内存布局，所以G1的新生代和老年代不再是固定的，它们都是一系列Region（不一定连续）的动态集合，而且G1收集器单次回收的最小单元是Region，即每次回收到的内存空间都是Region大小的整数倍，这样避免了对Java堆中进行全区域的垃圾收集。**G1收集器会去跟踪各个Region里面的垃圾堆积的价值大小，价值即回收所获得的空间大小以及回收所需时间的经验值，然后在后台维护一个优先级列表，每次根据用户设定允许的收集停顿时间，优先处理回收价值收益最大的那些Region**

- 一些实现细节

  - 如何解决跨Region引用

    每个Region都会维护一个双向卡表，记录了该Region指向了哪些Region，以及都有哪些Region指向了该Region

  - 如何保证并发标记阶段收集线程与用户线程互不干扰地运行

    - 解决用户线程改变对象引用关系时导致标记结果出现错误

      采用原始快照（SATB）算法实现

    - 解决对用户线程新创建对象的内存分配

      由于并发进行，那么在回收过程中程序肯定会持续有新对象的创建，G1为每个Region设计了两个名为TAMS的指针，把Region中的一部分空间划分出来用于并发回收过程中的新对象分配，并发回收时新分配的对象地址都必须要在这两个指针位置以上

- 具体流程

  - **初始标记**

    标记一下GC Roots能直接关联到的对象，并且修改TAMS指针的值，以便让下一阶段用户线程并发运行时，能正确地在可用的Region中分配新对象。该阶段需要停顿线程，但耗时很短

  - **并发标记**

    从GC Roots开始对堆中对象进行可达性分析，递归扫描整个堆对象图，找出要回收的对象，该阶段耗时较长，与用户线程并发执行。当对象图扫描完成后，还要重新处理SATB记录下的在并发时有引用变动的对象

  - **最终标记**

    对用户线程做另一个短暂的暂停，用于处理并发阶段结束后仍遗留下来的最后那少量的SATB记录

  - **筛选回收**

    负责更新Region的统计数据，对各个Region的回收价值和成本进行排序，根据用户所期望的停顿时间来制定回收计划，可以自由选择任意多个Region构成回收集，然后把决定回收的那一部分Region的存活对象复制到空的Region中，再清理掉整个旧Region的全部空间。该阶段涉及存活对象的移动，是必须暂停用户线程的，由多条收集器线程并行完成

  ![image-20210324152338367](/static/img/image-20210324152338367.png)

- 优点

  - **并行与并发**

    G1 能充分利用 CPU、多核环境下的硬件优势，使用多个 CPU（CPU 或者 CPU 核心）来缩短 Stop-The-World 停顿时间。部分其他收集器原本需要停顿 Java 线程执行的 GC 动作，G1 收集器仍然可以通过并发的方式让 java 程序继续执行。

  - **分代收集**

    虽然 G1 可以不需要其他收集器配合就能独立管理整个 GC 堆，但是还是保留了分代的概念。

  - **空间整合**

    与 CMS 的“标记-清理”算法不同，G1 从整体来看是基于“标记-整理”算法实现的收集器；从局部（两个Region）上来看是基于“标记-复制”算法实现的，不会产生内存碎片

  - **可预测的停顿**：这是 G1 相对于 CMS 的另一个大优势，降低停顿时间是 G1 和 CMS 共同的关注点，但 G1 除了追求低停顿外，还能建立可预测的停顿时间模型，能让使用者明确指定在一个长度为 M 毫秒的时间片段内。

### 2.4虚拟机及垃圾收集器日志

在JDK 9后，HotSpot虚拟机提供了统一的日志处理框架，将所有功能的日志都收归到了”-Xlog“参数上

- 语法

  `-Xlog[:[selector][:[output][:[decorators][:output-options]]]]`

  参数selector是选择器，由标签（Tag）和日志级别（Level）组成

  - 标签表示虚拟机中某个功能模块的名字（比如垃圾收集器的标签名称为”gc“），用于告诉日志框架用户希望得到虚拟机哪些功能的日志输出。HotSpot日志支持的全部功能模块标签名包括：add，age，alloc，annotation，aot，arguments，attach，barrier，biasedlocking，blocks，bot，breakpoint，bytecode

  - 日志级别从低到高，共有Trace，Debug，Info，Warning，Error，Off六种级别，日志级别决定了输出信息的详细程度，默认级别为Info。另外，还可以使用修饰器（Decorator）来要求每行日志输出都附加额外的内容，支持附加在日志行上的信息包括：

    - time：当前日期和时间
    - uptime：虚拟机启动到现在经过的时间，以秒为单位
    - timemillis：当前时间的毫秒数，相当于System.currentTimeMillis()的输出
    - uptimemillis：虚拟机启动到现在经过的毫秒数
    - timenanos：当前时间的纳秒数，相当于System.nanoTime()的输出
    - uptimenanos：虚拟机启动到现在经过的纳秒数
    - pid：进程ID
    - tid：线程ID
    - level：日志级别。·tags：日志输出的标签集

    如果不指定，默认值是uptime、level、tags这三个，此时日志输出类似于该形式：`[3.080s][info][gc,cpu] GC(5) User=0.03s Sys=0.00s Real=0.01s `

- JDK 9前后垃圾收集日志参数

  - 查看GC基本信息，JDK 9前使用`-XX:+PrintGC`，JDK 9 后用`-Xlog:gc`

  - 查看GC详细信息，在JDK 9之前使用`-XX：+PrintGCDetails`，在JDK 9之后使用`-X-log：gc`*，用通配符*将GC标签下所有细分过程都打印出来

  - 查看GC前后的堆、方法区可用容量变化，在JDK 9之前使用`-XX：+PrintHeapAtGC`，JDK 9之后使用`-Xlog：gc+heap=debug`

  - 查看GC过程中用户线程并发时间以及停顿的时间，在JDK 9之前使用`-XX：+Print-` 

    `GCApplicationConcurrentTime`以及`-XX：+PrintGCApplicationStoppedTime`，JDK 9之后使用`-Xlog：safepoint`

  - 查看收集器Ergonomics机制（自动设置堆空间各分代区域大小、收集目标等内容，从Parallel收集器开始支持）自动调节的相关信息。在JDK 9之前使用`-XX：+PrintAdaptive-SizePolicy`，JDK 9之后使用`-Xlog：gc+ergo*=trace`

  - 查看熬过收集后剩余对象的年龄分布信息，在JDK 9前使用`-XX：+PrintTenuring-Distribution`，JDK 9之后使用`-Xlog：gc+age=trace`

### 2.5实战：内存分配与回收策略

Java技术体系的自动内存管理，最根本的目标是自动化地解决两个问题：

- 自动给对象分配内存

  对象的内存分配，从概念上讲，应该都是在堆上分配（而实际上也有可能经过即时编译后被拆散为标量类型并间接地在栈上分配）。在经典分代的设计下，新生对象通常会分配在新生代中，少数情况下（例如对象大小超过一定阈值）也可能会直接分配在老年代

- 自动回收分配给对象的内存

  垃圾收集器体系及运作原理

Java 堆是垃圾收集器管理的主要区域，因此也被称作**GC 堆（Garbage Collected Heap）**从垃圾回收的角度，由于现在收集器基本都采用分代垃圾收集算法，所以 Java 堆还可以细分为：

- 新生代

  - Eden 空间
  - From Survivor空间
  - To Survivor 空间

  三个区域的默认容量占比：Eden：From Survivor：To Survivor为8：1：1 

- 老年代

![image-20210324175608267](/static/img/image-20210324175608267.png)

#### 2.5.1对象优先在Eden分配

大多数情况下，对象在新生代Eden区中分配。当Eden区没有足够空间进行分配时，虚拟机将发起一次Minor GC

```java
/**
 * VM Args:-verbose:gc -Xms20M -Xmx20M -Xmn10M -Xlog:gc* -XX:SurvivorRatio=8
 * 参数-Xms20M -Xmx20M限制了堆大小为20M且不可扩展，参数-Xmn10M表示分配给新生代内存为10M，所以老年代也为10M
 * 参数-Xlog:gc*表示在垃圾收集行为发生时输出日志
 * 参数-XX:SurvivorRatio=8表示新生代的Eden：Survivor比值为8，即Eden：From Survivor：To Survivor为8：1：1 ，Eden为8M，From Survivor和To Survivor为1M
 */
package site.potatoblog.gc;

public class testAllocation {
    private static final int _1MB=1024*1024;
    public static void main(String...args){
        byte[]allocation1,allocation2,allocation3,allocation4;
        allocation1=new byte[2*_1MB];
        allocation2=new byte[2*_1MB];
        allocation3=new byte[2*_1MB];
        //allocation1、2、3引用的对象都优先分配到了Eden区，此时Eden区已使用6M，剩余2M
        //此时allocation4引用的对象无法为4M，Eden区无法容纳，触发一次Minor GC
        //allocation1、2、3引用的对象都为存活对象，它们在垃圾收集期间会被转移到Survivor区，而Survivor区为1M，无法容纳这些存活对象，只能通过内存的分配担保机制，将这三个对象放入老年代中
        //垃圾收集结束后，Eden区占用4M，即allocation4引用的对象，老年代占用6M，即allocation1、2、3引用的对象
        allocation4=new byte[4*_1MB];
    }
}
```

#### 2.5.2大对象直接进入老年代

大对象就是指需要大量连续内存空间的Java对象，最典型的大对象比如很长的字符串，或者元素数量很庞大的数组。HotSpot虚拟机提供了`-XX:PretenureSizeThreshold`参数，指定大于该设置值的对象直接在老年代分配，这样做可以避免在Eden区以及两个Survivor区之间来回复制，产生大量的内存复制操作

```java
/**
 * VM Args: -XX:PretenureSizeThreshold=3145728 -verbose:gc -Xms20M -Xmx20M -Xmn10M -Xlog:gc* -XX:SurvivorRatio=8
 * 参数-XX:PretenureSizeThreshold的值不能写成3M，只能写出3M对应的具体数字3145728
 */
package site.potatoblog.gc;

public class testPretenureSizeThreshold {
    private final static int _1MB=1024*1024;
    public static void main(String...args){
        byte[] allocation;
        //该对象会超过3M的阈值，从而进入老年代中
        allocation=new byte[4*_1MB];
    }
}
```

#### 2.5.3长期存活的对象将进入老年代

虚拟机会给每个对象定义一个对象年龄计数器，并存储在对象头中。对象通常在Eden区里诞生，如果经过第一次Minor GC后仍然存活，并且能被Survivor区容纳的话，该对象会被移动到Survivor区里，并且对象年龄会加1。对象在Survivor区中每熬过一次Minor GC，年龄就增加1岁，当它的年龄增加到一定程度（默认为15岁），就会被晋升到老年代中。对象晋升老年代的年龄阈值，可以通过参数`-XX:MaxTenuringThreshold`来设置

```java
/**
 * -XX:MaxTenuringThreshold=1 -verbose:gc -Xms20M -Xmx20M -Xmn10M -Xlog:gc* -XX:SurvivorRatio=8
 */
package site.potatoblog.gc;

public class testTenuringThreshold {
    private static final int _1MB=1024*1024;
    public static void main(String...args){
        byte[] allocation1,allocation2,allocation3;
        allocation1=new byte[_1MB/4];
        allocation2=new byte[4*_1MB];
        //allocation1和allocation2引用的对象占据了Eden区4.25M，此时8M的Eden区无法分配给allocation3引用的对象4M，触发了第一次Minor GC
        //1M的Survivor区能存放0.25M的allocation1引用的对象，而4M的allocation2引用的对象因为无法被容纳而放入了老年区，此时它们年龄都增加1
        //垃圾回收后Eden区占4M，即allocation3引用的对象，Survivor区占0.25M，即allocation1引用的对象，老年区占4M，即allocation2引用的对象
        allocation3=new byte[4*_1MB];
        //allocation3引用指向null，其原先指向的对象将在下一次垃圾回收时被回收
        allocation3=null;
        //再次申请一个4M的数组空间，此时Eden区刚好满了为8M，触发第二次Minor GC,回收之前allocation3引用的对象，并且由于MaxTenuringThreshold的设置为1，所以allocation1和allocation2都会被放入老年代
        //此时Eden区占4M，Survivor区占0M，老年代占4.25M
        allocation3=new byte[4*_1MB];
    }
}
```

#### 2.5.4动态对象年龄判定

为了能更好地适应不同程序的内部状况，HotSpot虚拟机并不是永远要求对象的年龄必须达到`-XX：MaxTenuringThreshold`设定的值才能晋升老年代，如果在Survivor区中相同年龄所有对象大小的总和大于Survivor区的一半，年龄大于或等于该年龄的该对象就可以直接进入老年代

```java
/**
 * -XX:MaxTenuringThreshold=15 -verbose:gc -Xms20M -Xmx20M -Xmn10M -Xlog:gc* -XX:SurvivorRatio=8
 */
package site.potatoblog.gc;

public class testTenuringThreshold2 {
    private static final int _1MB=1024*1024;
    public static void main(String...args){
        byte[]allocation1,allocation2,allocation3,allocation4;
        allocation1=new byte[_1MB/4];
        allocation2=new byte[_1MB/4];
        allocation3=new byte[4*_1MB];
        //allocatin1、2、3占据了Eden区4.5M，此时8M的Eden区无法分配给allocation4引用的对象4M，触发了第一次Minor GC
        //1M的Survivor区能存放0.5M的allocation1、2引用的对象，而4M的allocation3引用的对象因为无法被容纳而放入了老年区，此时它们年龄都增加1
        //垃圾回收后Eden区占4M，即allocation4引用的对象，Survivor区占0.5M，即allocation1、2引用的对象，老年区占4M，即allocation3引用的对象
        allocation4=new byte[4*_1MB];
        //allocation4引用指向null，其原先指向的对象将在下一次垃圾回收时被回收
        allocation4=null;
        //再次申请一个4M的数组空间，此时Eden区刚好满了为8M，触发第二次Minor GC,回收之前allocation4引用的对象，由于Survivor区的都为1岁的allocation1和allocation2占用总和达到了该区容量的一半，会直接晋升老年代
        //此时Eden区占4M，Survivor区占0M，老年代占4.5M
        allocation4=new byte[4*_1MB];
    }
}
```

#### 2.5.5空间分配担保

空间分配担保：当Eden区的容量无法容纳一个新创建的对象，就会触发一次Minor GC，因为新生代采用标记-复制算法，所以Eden区存活的对象会被移入Survivor区中，但是当Survivor区大小不足以容纳这些存活对象时，就会使用空间分配担保机制，将这些对象移入老年代

由于空间分配担保，在发生Minor GC之前，虚拟机必须先检查老年代最大可用的连续空间是否大于新生代所有对象总空间，如果这个条件成立，那这一次Minor GC可以确保是安全的。如果不成立，则虚拟机会先查看`-XX:HandlePromotionFailure`参数的设置值是否允许担保失败（Handle Promotion Failure）；如果允许，那会继续检查老年代最大可用的连续空间是否大于历次晋升到老年代对象的平均大小，如果大于，将尝试进行一次Minor GC，若担保失败，就会导致Full GC；如果小于，或者`-XX:HandlePromotionFailure`设置不允许冒险，那这时就要改为进行一次Full GC

在JDK 6 Update 24之后，已经不再使用`-XX:HandlePromotionFailure`参数，只要老年代的连续空间大于新生代对象总大小或者历次晋升的平均大小，就会进行Minor GC，否则将进行Full GC

## 3.虚拟机性能监控、故障处理工具

### 3.1基础故障处理工具

JDK的bin目录下有着各种小工具，根据软件可用性和授权的不同，可划分为三类

- 商业授权工具

  主要是JMC（Java Mission Control）及它要使用到的JFR（Java Flight Recorder），JMC这个原本来自于JRockit的运维监控套件从JDK 7 Update 40开始就被集成到OracleJDK中，JDK 11之前都无须独立下载

- 正式支持工具

  这一类工具属于被长期支持的工具，不同平台、不同版本的JDK之间，这类工具可能会略有差异，但是不会出现某一个工具突然消失的情况

- 实验性工具

  这一类工具在它们的使用说明中被声明为“没有技术支持，并且是实验性质的”（Unsupported and Experimental）产品，日后可能会转正，也可能会在某个JDK版本中无声无息地消失。但事实上它们通常都非常稳定而且功能强大，也能在处理应用程序性能问题、定位故障时发挥很大的作用

#### 3.1.1jps：虚拟机进程状况工具

- jps功能

  可以列出正在运行的虚拟机进程，并显示虚拟机执行主类（`main()`方法所在的类）名称以及这些进程的本地虚拟机唯一ID（LVMID，Local Virtual Machine Identifier）

- jps命令格式

  `jps [options] [hostid]`

- jps执行样例

  ```cmd
  C:\Users\Admin>jps -l
  10912 org.jetbrains.jps.cmdline.Launcher
  14504 jdk.jcmd/sun.tools.jps.Jps
  2184
  ```

- jps工具主要选项

  ![image-20210403095043888](/static/img/image-20210403095043888.png)

#### 3.1.2jstat：虚拟机统计信息监视工具 

- jstat功能

  用于监视虚拟机各种运行状态信息的命令行工具。它可以显示本地或者远程虚拟机进程中的类加载、内存、垃圾收集、即时编译等运行时数据

- jstat命令格式

  `jstat [option vmid [interval[s|ms] [count]]]`

  - 参数vmid

    如果是本地虚拟机进程，那么VMID与LVMID一致；如果是远程虚拟机进程，那么VMID的格式应当是：`[protocol:][//]lvmid[@hostname[:port]/servername] `

  - 参数interval

    代表查询间隔

  - 参数count

    代表查询次数

  假设每250毫秒查询一次进程2764垃圾收集状况，一共查询20次，那么命令为：`jstat -gc 2764 250 20`

- jstat工具主要选项

  ![image-20210403100418168](/static/img/image-20210403100418168.png)

- jstat执行样例

  ```cmd
  C:\Users\Admin>jstat -gcutil 10892
    S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT    CGC    CGCT     GCT
    0.00 100.00   9.52  16.54  97.37  92.27      4    0.039     0    0.000     4    0.005    0.045
  ```

  查询结果表明：这台服务器的新生代Eden区（E，表示Eden）使用了9.52%的空间，2个Survivor区（S0、S1，表示Survivor0、Survivor1）里面S0是空的，S1空间被占满，老年代（O，表示Old）和元空间（M，表示Metaspace）则分别使用了16.54%和97.37%的空间。程序运行以来共发生Minor GC（YGC，表示Young GC）4次，总耗时0.039秒；发生Full GC（FGC，表示Full GC）0次，总耗时（FGCT，表示Full GC Time）为0秒；所有GC总耗时（GCT，表示GC Time）为0.045秒

#### 3.1.3jinfo：Java配置信息工具

- jinfo功能

  实时查看和调整虚拟机各项参数。使用jps命令的-v参数可以查看虚拟机启动时显式指定的参数列表，但如果想知道未被显式指定的参数的系统默认值，就只能使用jinfo的-flag选项进行查询了。jinfo还可以使用-sysprops选项把虚拟机进程的System.getProperties()的内容打印出来

- jinfo命令格式

  `jinfo [ option ] pid`

- jinfo执行样例

  查询CMSInitiatingOccupancyFraction参数值

  ```cmd
  C:\Users\Admin>jinfo -flag CMSInitiatingOccupancyFraction 1444 -XX:CMSInitiatingOccupancyFraction=85
  ```

#### 3.1.4jmap：Java内存映像工具

- jmap功能

  用于生成堆转储快照（一般称为heapdump或dump文件），还可以查询finalize执行队列、Java堆和方法区的详细信息，如空间使用率、当前用的是哪种收集器等

- jmap命令格式

  `jmap [ option ] vmid `

- jmap工具主要选项

  ![image-20210403103235662](/static/img/image-20210403103235662.png)

- jmap执行样例

  使用jmap生成dump文件 

  ```cmd
  C:\Users\Admin>jmap -dump:format=b,file=ddd.bin 3428
  Heap dump file created
  ```

#### 3.1.5jstack：Java栈跟踪工具

- jstack功能

  用于生成虚拟机当前时刻的线程快照（一般称为threaddump或者javacore文件，就是当前虚拟机内每一条线程正在执行的方法栈的集合），以便定位线程出现长时间停顿的原因，如线程间死锁、死循环、请求外部资源导致的长时间挂起等

- jstack命令格式

  `jstack [ option ] vmid `

- jstack工具主要选项

  ![image-20210403104932017](/static/img/image-20210403104932017.png)

- jstack执行样例

  使用jstack查看线程栈（部分结果）

  ```cmd
  C:\Users\Admin>jstack -l 10892
  2021-04-03 10:50:41
  Full thread dump OpenJDK 64-Bit Server VM (11.0.4+10-b520.11 mixed mode, sharing):
  
  Threads class SMR info:
  _java_thread_list=0x0000022e05d6e210, length=18, elements={
  0x0000022e7d0da800, 0x0000022e7d0db800, 0x0000022e7d0f9800, 0x0000022e7d0fa800,
  0x0000022e7d0fc000, 0x0000022e7d102800, 0x0000022e7d10c000, 0x0000022e7daaf000,
  0x0000022e7daba000, 0x0000022e7decc000, 0x0000022e7deca000, 0x0000022e7dfb6800,
  0x0000022e7dfde800, 0x0000022e652fe800, 0x0000022e7dfd3000, 0x0000022e7e0a4800,
  0x0000022e7f1d6000, 0x0000022e7f4af000
  }
  
  "Reference Handler" #2 daemon prio=10 os_prio=2 cpu=0.00ms elapsed=3073.78s tid=0x0000022e7d0da800 nid=0x2a94 waiting on condition  [0x000000acfadff000]
     java.lang.Thread.State: RUNNABLE
          at java.lang.ref.Reference.waitForReferencePendingList(java.base@11.0.4/Native Method)
          at java.lang.ref.Reference.processPendingReferences(java.base@11.0.4/Reference.java:241)
          at java.lang.ref.Reference$ReferenceHandler.run(java.base@11.0.4/Reference.java:213)
  
     Locked ownable synchronizers:
          - None
  ```

从JDK 5起，`java.lang.Thread`类新增了一个`getAllStackTraces()`方法用于获取虚拟机中所有线程的`StackTraceElement`对象。使用这个方法可以通过简单的几行代码完成jstack的大部分功能，在实际项目中不妨调用这个方法做个管理员页面，可以随时使用浏览器来查看线程堆栈

### 3.2可视化故障处理工具

JDK中除了附带大量的命令行工具外，还提供了几个功能集成度更高的可视化工具，用户可以使用这些可视化工具以更加便捷的方式进行进程故障诊断和调试工作。这类工具主要包括JConsole、JHSDB、VisualVM和JMC四个

#### 3.2.1JHSDB：基于服务性代理的调试工具

JHSDB是一款基于服务性代理（Serviceability Agent，SA）实现的进程外调试工具

使用JHSDB查看引用`staticObj`、`instanceObj`、`localObj`的存放位置

预期结果：`staticObj`随着`Test`的类型信息存放在方法区(JDK 7后存放于对应的Class对象，存储于Java堆中），`instanceObj`随着`Test`的对象实例存放在Java堆，`localObject`则是存放在`foo()`方法栈帧的局部变量表中

```java
/**
 * VM-Args：-Xmx10m -XX:+UseSerialGC -XX:-UseCompressedOops
 */
package site.potatoblog.tools;

public class JHSDB_TestCase {
    static  class Test{
        static ObjectHolder staticObj=new ObjectHolder();
        ObjectHolder instanceObj=new ObjectHolder();
        void foo(){
            ObjectHolder localObj=new ObjectHolder();
            System.out.println("done");//此处设置断点，方便实验
        }
    }
    private static class ObjectHolder{}
    public static void main(String...args){
        Test test=new JHSDB_TestCase.Test();
        test.foo();
    }
}
```

- 调试程序至断点处，在命令行中输入命令`jps -l`查询当前程序的进程ID

  ![image-20210406132357918](/static/img/image-20210406132357918.png)

- 使用命令`jhsdb hsdb --pid 8416`，进入JHSDB的图形化模式，使其附加测试程序的进程8416

- 当调试至断点处，测试程序总共会生成3个`ObjectHolder`对象的实例，对象实例必然在Java堆中分配，要想查找这三个对象的引用存放的位置，我们得先把这些对象从堆中查找出来

  - 点击菜单Tools->Heap Parameters，就会显示堆中的内存布局，由于采用的是Serial收集器，所以也是以Serial的分代内存布局的模式显示

    ![image-20210406132445878](/static/img/image-20210406132445878.png)

  - 打开Windows->Console窗口，使用`scanoops`命令在Java堆的新生代（从Eden起始地址到To Survivor结束地址）范围内查找`ObjectHolder`的实例，会查询出三个实例地址，并且它们的地址都落在了Eden的范围之内，也验证了新对象通常都在Eden中创建的分配规则

    ![image-20210406132831026](/static/img/image-20210406132831026.png)

  - 使用Tools->Inspector功能可以查询上述三个地址中存放的对象信息，比如

    ![image-20210406132914082](/static/img/image-20210406132914082.png)

- 使用`revptrs`命令可以通过对象地址找到该对象的引用的地址

  - 第一个引用`staticObj`：![image-20210406133001726](/static/img/image-20210406133001726.png)，其引用存放在地址0x000001c99b80d390处的Class对象中，使用Tools->Inspector功能查询该Class对象的信息，会发现引用`staticObj`是该Class对象（`JHSDB_TestCase`类对应的Class对象）的一个实例字段。在JDK 7之前，所有Class相关信息都应该存放在方法区中，但在JDK 7及之后，HotSpot虚拟机选择把类变量与类型存放在对应的Class对象中，存储于Java堆中

    ![image-20210406133737684](/static/img/image-20210406133737684.png)

  - 第二个引用`instanceObj`：![image-20210406134610851](/static/img/image-20210406134610851.png)，其引用存放在地址0x000001c99b80eb20处的`JHSDB_TestCase$Test`对象中，因为引用`instanceObj`本来就是`JHSDB_TestCase$Test`对象的实例字段，与对象一起存储于Java堆中

    ![image-20210406134856294](/static/img/image-20210406134856294.png)

  - 第三个引用`localObj`：![image-20210406135411391](/static/img/image-20210406135411391.png)，由于引用`localObj`是在方法`foo()`，理论上是存放在该方法栈帧的局部变量表中，而`revptrs`命令不支持查找栈上的指针引用，应该在在Java Thread窗口选中main线程后点击Stack Memory按钮查看该线程的栈内存即可查到

    ![image-20210406135902180](/static/img/image-20210406135902180.png)

#### 3.2.2JConsole：Java监视与管理控制台

JConsole（Java Monitoring and Management Console）是一款基于JMX（Java Management Extensions）的可视化监视、管理工具

- 启动JConsole

  通过JDK/bin目录下的jconsole.exe启动JConsole后，会自动搜索出本机运行的所有虚拟机进程，而不需要用户自己使用jps来查询

  ![image-20210406141938935](/static/img/image-20210406141938935.png)

  可以选择一个进程连接对其监控，JConsole主界面包含“概述”“内存”“线程”“类”“VM摘要”“MBean”六个页签

  ![image-20210406141735046](/static/img/image-20210406141735046.png)

- 内存监控

  “内存”页签的作用相当于可视化的`jstat`命令，用于监视被收集器管理的虚拟机内存（被收集器直接管理的Java堆和被间接管理的方法区）的变化趋势

  ```java
  /**
   * VM-Args：-Xms100m -Xmx100m -XX:+UseSerialGC
   */
  package site.potatoblog.tools;
  
  import java.util.ArrayList;
  import java.util.List;
  
  public class OOMObjectTest{
      static class OOMObject {
          public byte[] placeholder =new byte[64*1024];
      }
      public static void fillHeap(int num) throws InterruptedException{
          List<OOMObject> list=new ArrayList<>();
          for(int i=0;i<num;i++){
              Thread.sleep(50);
              list.add(new OOMObject());
          }
          System.gc();
      }
      public static void main(String...args) throws InterruptedException {
          fillHeap(1000);
      }
  }
  ```

- 线程监控

  “线程”页签的功能相当于可视化的`jstack`命令，遇到线程停顿的时候可以使用这个页签的功能进行分析

## 4.类文件结构

### 4.1概述

在 Java 中，JVM 可以理解的代码就叫做`字节码`（即扩展名为 `.class` 的文件），它不面向任何特定的处理器，只面向虚拟机，所以虚拟机和字节码文件也是Java语言实现平台无关性的基础。

JRuby、Groovy、Scala 等语言都是运行在 Java 虚拟机之上。下图展示了不同的语言被不同的编译器编译成`.class`文件最终运行在 Java 虚拟机之上。`.class`文件的二进制格式可以使用 [WinHex](https://www.x-ways.net/winhex/) 查看

![image-20210325195802846](/static/img/image-20210325195802846.png)

### 4.2Class类文件的结构

Class文件是一组以8个字节为基础单位的二进制流，各个数据项目严格按照顺序紧凑地排列在文件之中，中间没有添加任何分隔符，这使得整个Class文件中存储的内容几乎全部是程序运行的必要数据，没有空隙存在。当遇到需要占用8个字节以上空间的数据项时，则会按照高位在前的方式分割成若干个8个字节进行存储

Class文件采用两种数据类型来存储数据：

- **无符号数**

  基本的数据类型，以u1、u2、u4、u8来分别代表1个字节、2个字节、4个字节和8个字节的无符号数，无符号数可以用来描述数字、索引引用、数量值或者按照UTF-8编码构成的字符串

- **表**

  由多个无符号数或者其他表作为数据项构成的复合数据类型，所有表的命名都以`_info`结尾

整个Class文件本质上也是一张表，这张表所有的数据项严格地按如下顺序排列构成：

```java
ClassFile{
	u4 magic;//魔数，Class文件的标识符
    u2 minor_version;//Class文件的次版本号
    u2 major_version;//Class文件的主版本号
    u2 constant_pool_count;//常量池的数量
    cp_info constant_pool[constant_pool_count-1];//常量池
    u2 access_flags;//Class文件对应类的访问标记
    u2 this_class;//Class文件的对应类
    u2 super_class;//Class文件对应类的父类
    u2 interfaces_count;//Class文件对应类实现的接口的数量
    u2 interfaces[interfaces_count];//Class文件对应类实现的接口集合
    u2 fields_count;//Class文件对应类的字段的数量
    field_info fields[fields_count];//Class文件对应类的字段集合
    u2 methods_count;//Class文件对应类的方法数量
    method_info methods[methods_count];//Class文件对应类的方法集合
    u2 attributes_count;//Class文件的属性数
    attribute_info attributes[attributes_account];//Class文件的属性集合
    
}
```

#### 4.2.1魔数与Class文件的版本

- **魔数**

  每个Class文件的头4个字节，它只用于确定该文件是否为一个能被虚拟机接收的Class文件。Class文件的魔数（`magic`）值固定为`0xCAFEBABE`（0x开头表示16进制）

- **Class文件的版本**

  在魔数之后的4个字节存储的是该Class文件的版本号：第5和第6个字节是次版本号（`minor_version`），第7和第8是主版本号（`major_version`）

```java
package site.potatoblog.clazz;

public class TestClass {
    private int m;
    public int inc(){
        return m+1;
    }
    public static void main(String...args){}
}
```

**测试**：使用十六进制编辑器WinHex打开上述代码的Class文件，前8个字节为：![image-20210325211844793](/static/img/image-20210325211844793.png)，即魔数为`0xCAFEBABE`，次版本号为十进制的`0`，主版本号为十进制的`55`

**注：之后代都以TestClass.class为例**

#### 4.2.2常量池

- **常量池容量计数值**

  在主、次版本号之后的两个字节存储的是常量池容量计数值（ `constant_pool_count`），由于常量池中常量数量是不固定的，所以需要常量池容量计数值来确定范围。**常量池容量计数值是从1而不是0开始**

  **测试**：TestClass.class文件的第9和第10字节为![image-20210325213920688](/static/img/image-20210325213920688.png)，即常量池容量为十进制的`26`，代表常量池中有25项常量，索引值范围为1~25（将第0项常量空出来是有特殊考虑的，若一个数据指向常量池的0值索引代表“不引用任何一个常量池项”）

- **常量池**

  常量池（`constant_pool`）紧接在常量池容量计数值之后，是Class文件中第一个出现的表类型数据项，其主要存放两大类常量：

  - 字面量

    比较接近于 Java 语言层面的的常量概念，如文本字符串、声明为 final 的常量值等

  - 符号引用

    属于编译原理方面的概念，主要包括以下几类常量：

    - 被模块导出或者开放的包
    - 类和接口的全限定名
    - 字段的名称和描述符
    - 方法的名称和描述符
    - 方法句柄和方法类型
    - 动态调用点和动态常量

    Java代码在编译阶段是没有”连接“步骤的，所以代码在被编译为Class文件后，其Class文件中是不会保存各个方法、字段最终在内存中的布局信息，只有在虚拟机加载该Class文件时，会进行动态连接，然后从常量池获得对应的符号引用，再在类创建时或运行时解析、翻译到具体的内存地址之中

  常量池中每一项常量都是一个表，一共有17中不同类型的常量，也对应了17种表：

  |               类型               | 标志（tag） |              描述              |
  | :------------------------------: | :---------: | :----------------------------: |
  |        CONSTANT_utf8_info        |      1      |       UTF-8编码的字符串        |
  |      CONSTANT_Integer_info       |      3      |           整形字面量           |
  |       CONSTANT_Float_info        |      4      |          浮点型字面量          |
  |        CONSTANT_Long_info        |     ５      |          长整型字面量          |
  |       CONSTANT_Double_info       |     ６      |       双精度浮点型字面量       |
  |       CONSTANT_Class_info        |     ７      |       类或接口的符号引用       |
  |       CONSTANT_String_info       |     ８      |        字符串类型字面量        |
  |      CONSTANT_Fieldref_info      |     ９      |         字段的符号引用         |
  |     CONSTANT_Methodref_info      |     10      |       类中方法的符号引用       |
  | CONSTANT_InterfaceMethodref_info |     11      |      接口中方法的符号引用      |
  |    CONSTANT_NameAndType_info     |     12      |      字段或方法的符号引用      |
  |    CONSTANT_MethodHandle_info    |     15      |          表示方法句柄          |
  |     CONSTANT_MothodType_info     |     16      |          表示方法类型          |
  |      CONSTANT_Dynamic_info       |     17      |      表示一个动态计算常量      |
  |   CONSTANT_InvokeDynamic_info    |     18      |     表示一个动态方法调用点     |
  |       CONSTANT_Module_info       |     19      |          表示一个模块          |
  |      CONSTANT_Package_info       |     20      | 表示一个模块中开放或者导出的包 |

  这17种表的表结构如下：

  ![image-20210325225401395](/static/img/image-20210325225401395.png)

  ![image-20210325225418659](/static/img/image-20210325225418659.png)

  ![image-20210325225434396](/static/img/image-20210325225434396.png)

  **测试**：

  - TestClass.class文件的第11~15字节为![image-20210325230333772](/static/img/image-20210325230333772.png)，是常量池中的第一项常量，第11字节为十进制的10，即标志位为10的`CONSTANT_Methodref_info`类型的常量，所以之后的第12、13字节为`CONSTANT_Methodref_info`表中的第一个`index`项目，值为十进制的4，指向常量池中的第4项常量，即`CONSTANT_Class_info`表；第14、15字节为第二个`index`项目，值为十进制的22，指向常量池中的第22项常量，即`CONSTANT_NameAndType_info`表

  - 使用`javap`工具的`-verbose`参数可以输出TestClass.class文件中所有的字节码内容，同时会将整个常量池的25项常量计算出来

    `javap -verbose TestClass`（仅截图常量池部分）：

    ![image-20210325231609486](/static/img/image-20210325231609486.png)

#### 4.2.3访问标志

常量池结束后，紧接着的两个字节代表访问标志（`access_flags`），该标志用于识别一些类或接口的访问信息。类或接口的访问标志如下：

![image-20210325232219571](/static/img/image-20210325232219571.png)

对于没有使用到的访问标志，要求其标志值一律为零

**测试**：TestClass是一个普通Java类，不是接口、枚举、注解或者模块，被`public`关键字修饰但没有被声明为`final`和`abstract`，因此它的`ACC_PUBLIC`、`ACC_SUPER`标志应当为真，而`ACC_FINAL`、`ACC_INTERFACE`、 `ACC_ABSTRACT`、`ACC_SYNTHETIC`、`ACC_ANNOTATION`、`ACC_ENUM`、`ACC_MODULE`这七个标志应当为假。TestClass.class文件中`access_flags`的字节为![image-20210326080108430](/static/img/image-20210326080108430.png)，即`0x0001`|`0x0020`

#### 4.2.4类索引、父类索引与接口索引集合

- **类索引**

  访问标志之后的两个字节存储的是类索引（`this_class`），用于确定这个Class文件对应类的全限定名

- **父类索引**

  类索引之后的两个字节存储的是父类索引（`super_class`），用于确定这个Class文件对应类的父类的全限定名。Java只有单继承，所以父类索引只有一个，除了`java.lang.Object`之外，所有的Java类都有父类，因此除了`java.lang.Object`外，所有Java类的父类索引都不为0

- **接口索引集合**

  - 接口计数器

    父类索引之后的两个字节存储的是接口计数器（`interfaces_count`），用于表示接口索引集合的容量。如果Class文件对应类没有实现任何接口，则该值为0，后面接口索引集合不再占用任何字节

  - 接口索引集合

    接口索引集合（`interfaces`）紧接在接口计数器后，用于描述Class文件对应类实现了哪些接口

**测试**：TestClass.class文件中类索引、父类索引与接口索引集合对应的字节表示为![image-20210326082217686](/static/img/image-20210326082217686.png)，类索引`0x0003`，为十进制的3，即指向常量池中的第3项常量，即`CONSTANT_Class_info`表，而`CONSTANT_Class_info`表中的`index`项指向了常量池中的第24项常量，即`CONSTANT_Utf8_info`表，其`bytes`项就储存了该类的全限定名；父类索引`0x0004`，为十进制的4，即指向常量池中的第4项常量，即`CONSTANT_Class_info`表，其查找全限定名方式和类索引一样；接口计数器`0x0000`，为十进制的0，即该类未实现任何接口，后面的接口索引集合不占用任何字节

#### 4.2.5字段表集合

- **字段表计数器**

  接口索引集合之后的两个字节存储的是字段表计数器（`fields_count`），用于表示字段表集合的容量

- **字段表集合**

  字段表集合（`field_info`）紧接在字段表计数器之后，用于描述接口或者类中声明的变量，但不包括在方法内部声明的局部变量和从父类或者接口中继承而来的字段

  - 字段表结构

    ```java
    field_info{
        u2 access_flags;//字段的访问标志
        u2 name_index;//字段的简单名称在常量池中的索引
        u2 descriptor_index;//字段的描述符在常量池中的索引
        u2 attributes_count;//字段属性表计数器
        attribute_info attributes[attributes_count];//字段属性表
    }
    ```

    - `access_flags`

      描述字段的访问标志如下：

      ![image-20210326091329804](/static/img/image-20210326091329804.png)

    - `name_index`

      存储常量池中的一项常量的索引值，而该常量存储着字段的简单名称，比如`inc()`方法的简单名称就是`inc`

    - `descriptor_index`

      存储常量池中的一项常量的索引值，而该常量存储着字段的描述符。描述符的作用是用来描述字段的数据类型、方法的参数列表（包括数量、类型及顺序）和返回值。描述符都用一个大写的标识符来表示，其含义如下：

      ![image-20210326092509528](/static/img/image-20210326092509528.png)

      对于数组类型，每一维度将使用一个前置的`[`字符来描述

      例：

      - 一维数组`int[]`描述符为`[I`，二维数组`int[][]`描述符为`[[I`
      - 方法`void inc()`描述符为`()V`
      - 方法`int indexOf(char[]source,int sourceOffset,int sourceCount,char[]target,int targetOffset,int targetCount,int fromIndex)`的描述符为`([CII[CIII)I`		

    - `attributes_count`

      记录字段额外信息的数量

    - `attributes[attributes_count]`

      存储字段的一些额外信息，比如`final static int m=123;`，那么属性表`attribute_info`中的属性`ConstantValue`就会存储常量123

**测试**：TestClass.class字段表集合对应的字节为![image-20210326094521113](/static/img/image-20210326094521113.png)![image-20210326095536758](/static/img/image-20210326095536758.png)，字段表计数器`0x0001`，为十进制的1，表示只有一个字段，对应的也只有1个字段表；字段的访问标志`0x0002`，即`ACC_PRIVATE`为真；字段的简单名称`0x0005`，为十进制的5，指向常量池中的第5项常量，即`CONSTANT_Utf8_info`表，其值为`m`；字段的描述符`0x0006`，为十进制的6，指向常量池中的第6项常量，即`CONSTANT_Utf8_info`表，其值为`I`；属性表计数器`0x0000`，为十进制的0，说明该字段没有额外信息，后续的字段属性表集合也不占用任何字节

#### 4.2.6方法表集合

- 方法表计数器

  字段表集合之后的两个字节存储的是方法表计数器（`method_count`），用于表示方法表集合的容量

- 方法表集合

  方法表集合（`method_info`）紧接在方法表计数器之后，用于描述接口或类中的方法，如果父类方法在子类中没有被重写，那么方法表集合中也不会有来自父类的方法信息

  - 方法表结构

    ```java
    method_info{
        u2 access_flags;//方法的访问标志
        u2 name_index;//方法的简单名称在常量池中的索引
        u2 descriptor_index;//方法的描述符在常量池中的索引
        u2 attributes_count;//方法属性表计数器
        attribute_info attributes[attributes_count];//方法属性表集合
    }
    ```

    方法表结构与字段表结构一样，但是方法表中`access_flags`有些许不同。可以用于描述方法的访问标志如下：

    ![image-20210326125318082](/static/img/image-20210326125318082.png)

    方法的访问标志、名称索引、描述符索引都会被存储到方法表中相应的属性中，而方法体中代码会被存储到方法属性表中的`Code`属性里

**测试**：TestClass.class方法表集合对应的字节为![image-20210326125927385](/static/img/image-20210326125927385.png)，方法表计数器`0x0003`，为十进制的3，表示有3个方法，对应也有3个方法表；访问标志`0x0001`，为十进制的1，即`ACC_PUBLIC`为真；方法的简单名称`0x0007`，为十进制的7，指向常量池中的第7项常量，即`CONSTANT_Utf8_info`表，其值为`<init>`，构造器方法；方法描述符`0x0008`，为十进制的8，指向常量池中的第8项常量，即`CONSTANT_Utf8_info`表，其值为`()V`；方法属性表计数器`0x0001`，为十进制的1，即只有一个额外属性，对应的也只有一个属性表；方法属性表集合`0x0009`，为十进制的9，指向常量池中第9项常量，即`CONSTANT_Utf8_info`表，其值为`Code`

#### 4.2.7属性表集合

```java
   u2 attributes_count;//此类的属性表中的属性数
   attribute_info attributes[attributes_count];//属性表集合
```

在 Class 文件，字段表，方法表中都可以携带自己的属性表集合，以用于描述某些场景专有的信息。与 Class 文件中其它的数据项目要求的顺序、长度和内容不同，属性表集合的限制稍微宽松一些，不再要求各个属性表具有严格的顺序，并且只要不与已有的属性名重复，任何人实现的编译器都可以向属性表中写 入自己定义的属性信息，Java 虚拟机运行时会忽略掉它不认识的属性。

## 5.虚拟机类加载机制

### 5.1类加载的时机

一个类型从被加载到虚拟机内存中开始，到卸载出内存为止，其整个生命周期如下：

![image-20210326134552365](/static/img/image-20210326134552365.png)

其中，加载、验证、准备、初始化和卸载这五个阶段的顺序是确定的，类型的加载过程必须按照这种顺序按部就班地开始，而解析阶段则不一定：它在某些情况下可以在初始化阶段之后再开始，这是为了支持Java语言的运行时绑定特性（也称为动态绑定）

类加载过程包括：加载、连接和初始化。对于类加载过程的第一个阶段“加载”的时机，并没有强制约束。但是，对于初始化阶段的时机，被严格规定了有且只有六种情况必须立即对类进行初始化（而加载、验证、准备自然需要在此之前开始）：

- 遇到`new`、`getstatic`、`putstatic`或`invokestatic`这四条字节码指令时，如果类型没有进行过初始化，则需要先触发其初始化阶段。能够生成这四条指令的典型Java代码场景有：
  - 使用`new`关键字实例化对象的时候
  - 读取或设置一个类型的静态字段（被`final`修饰、已在编译期把结果放入常量池的静态字段除外）的时候
  - 调用一个类的静态方法的时候
- 使用`java.lang.reflect`包的方法对类型进行反射调用的时候，如果类型没有进行过初始化，则需要先触发初始化
- 当初始化类的时候，如果发现其父类还没进行过初始化，则需要先触发其父类的初始化
- 当虚拟机启动时，用户需要指定一个要执行的主类（包含`main()`方法的那个类），虚拟机会先初始化这个类
- 当使用JDK 7新加入的动态语言支持时，如果一个`java.lang.invoke.MethodHandle`实例最后的解析结果为`REF_getStatic`、`REF_putStatic`、`REF_invokeStatic`、`REF_newInvokeSpecial`四种类型的方法句 柄，并且这个方法句柄对应的类没有进行过初始化，则需要先触发其初始化
- 当一个接口中定义了JDK 8新加入的默认方法（被`default`关键字修饰的接口方法）时，如果有这个接口的实现类发生了初始化，那该接口要在其之前被初始化

上述六种行为称为对一个类型进行主动引用。除此之外，其他所有引用类型的方式都不会触发初始化，称为被动引用：

- 被动引用例一：非主动引用类字段

  ```java
  package classloading;
  
  class SuperClass {
      static{
          System.out.println("SuperClass init!");
      }
      public static int value=123;
  }
  class SubClass extends SuperClass{
      static {
          System.out.println("SubClass init!");
      }
  }
  public class NotInitialization{
      public static void main(String...args){
          //当访问一个静态字段时，只有直接定义这个字段的类才会被初始化
          //而通过子类来引用父类中定义的静态字段，只会触发父类的初始化，而不会触发子类的初始化
          System.out.println(SubClass.value);
      }
  }/*output
  SuperClass init!
  123
  */
  ```

- 被动引用例二：通过数组定义来引用类

  ```java
  package classloading;
  
  public class NotInitialization2 {
      public static void main(String...args){
          //通过数组定义来引用类并不会触发类的初始化
          //但是会触发另一个名为[SuperClass的类的初始化阶段，这是一个由虚拟机自动生成的、直接继承于java.lang.Object的子类，这个类代表了一个元素类型为SuperClass的一维数组
          SuperClass[] sca=new SuperClass[10];
      }
  }
  ```

- 被动引用例三：引用常量

  ```java
  package classloading;
  
  class ConstClass{
      static {
          System.out.println("ConstClass init!");
      }
      public static final String HELLOWORLD="hellow world";
  }
  public class NotInitialization3 {
      public static void main(String...args){
          //ConstClass类的常量HELLOWORLD会在编译期通过常量传播优化，存储到NotInitialization3类的常量池
          //所以对常量ConstClass.HELLOWORLD的引用，实际被转化为NotInitialization3对自身常量池的引用
          //实际上NotInitialization3的Class文件中并没有ConstClass类的符号引用入口，两个类在编译成Class文件后就不存在任何联系了
          //所以调用ConstClass类的常量，并不会触发该类的初始化
          System.out.println(ConstClass.HELLOWORLD);
      }
  }/*output
  hellow world
  */
  ```

### 5.2类加载的过程

类加载过程包括：加载、连接（验证、准备、解析）和初始化

#### 5.2.1加载

加载是类加载过程的第一步，在加载阶段，虚拟机需要完成以下三件事情：

- 通过一个类的全限定名来获取定义此类的二进制字节流
- 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构
- 在内存中生成一个代表这个类的`java.lang.Class`对象，作为方法区这个类的各种数据的访问入口

非数组类型的加载阶段（准确地说，是加载阶段中获取类地二进制字节流地动作）是可控性最强的阶段：既可以使用虚拟机内置的引导类加载器来完成，也可以自定义一个类加载器，通过重写类加载器的`findClass()`或`loadClass()`方法去控制字节流的获取方式

数组类本身不通过类加载器创建，它是由虚拟机直接在内存中动态构造出来的。但数组类的元素类型（指数组去掉所有维度的类型）最终还是要靠类加载器来完成加载，一个数组类（下面简称C）创建过程遵循以下规则：

- 如果数组的组件类型（指数组去掉一个维度的类型）是引用类型，那就递归采用上述加载阶段的三件事去加载这个组件类型，数组C将被标识在加载该组件类型到的类加载器的类名称空间上
- 如果数组的组件类型不是引用类型（例如`int[]`数组的组件类型为`int`），虚拟机会把数组C标记为与引导类加载器相关联
- 数组类的可访问性与它的组件类型的可访问性一致，如果组件类型不是引用类型，它的数组类的可访问性将默认为public，可被所有的类和接口访问到

#### 5.2.2验证

验证是连接阶段的第一步，这一阶段的目的是是确保Class文件的字节流中包含的信息符合《Java虚拟机规范》的全部约束要求，保证这些信息被当作代码运行后不会危害虚拟机自身的安全

验证阶段大致上会完成以下四个阶段的检验动作：

- 文件格式验证

  - 是否以魔数0xCAFEBABE开头

  - 主、次版本号是否在当前Java虚拟机接受范围之内 

  - 常量池的常量中是否有不被支持的常量类型（检查常量tag标志）

  - 指向常量的各种索引值中是否有指向不存在的常量或不符合类型的常量

  - `CONSTANT_Utf8_info`型的常量中是否有不符合UTF-8编码的数据

  - Class文件中各个部分及文件本身是否有被删除的或附加的其他信息

    ......

  该验证阶段的主要目的是保证输入的字节流能正确地解析并存储于方法区之内，是基于二进制字节流进行的，只有通过该阶段的验证之后，这段字节流才被允许进入虚拟机内存的方法区中进行存储，所以后面的三个验证阶段全部是基于方法区的存储结构上进行的，不会再直接读取、操作字节流了

- 元数据验证

  - 这个类是否有父类（除了`java.lang.Object`之外，所有的类都应当有父类）

  - 这个类的父类是否继承了不允许被继承的类（被`final`修饰的类）

  - 如果这个类不是抽象类，是否实现了其父类或接口中要求实现的所有方法

  - 类中字段、方法是否与父类产生矛盾（例如覆盖了父类的final字段，或者出现不符合规则的方法重载，例如方法参数都一致，但返回值类型却不同等）

    ......

  该验证阶段主要目的是对类的元数据信息进行语义校验，保证不存在与《Java语言规范》定义相悖的元数据信息

- 字节码验证

  - 保证任意时刻操作数栈的数据类型与指令代码序列都能配合工作，例如不会出现类似于“在操作栈放置了一个`int`类型的数据，使用时却按`long`类型来加载入局部变量表中”这样的情况

  - 保证任何跳转指令都不会跳转到方法体以外的字节码指令上

  - 保证方法体中的类型转换总是有效的，例如可以把一个子类对象赋值给父类数据类型，这是安全的，但是把父类对象赋值给子类数据类型，甚至把对象赋值给与它毫无继承关系、完全不相干的一个数据类型，则是危险和不合法的

    ......

  该验证阶段主要目的是通过数据流分析和控制流分析，确定程序语义是合法的、符合逻辑的。在第二阶段对元数据信息中的数据类型校验完毕以后，这阶段就要对类的方法体（Class文件中的Code属性）进行校验分析，保证被校验类的方法在运行时不会做出危害 虚拟机安全的行为

- 符号引用验证

  - 符号引用中通过字符串描述的全限定名是否能找到对应的类

  - 在指定类中是否存在符合方法的字段描述符以及简单名称所描述的方法和字段

  - 符号引用中的类、字段、方法的可访问性（`private`、`protected`、`public`、`<package>`）是否可被当前类访问

    ......

  该验证阶段发生在虚拟机将符号引用转化为直接引用的时候，这个转化动作将在连接的第三个阶段——解析阶段中发生。符号引用验证的主要目的是确保解析行为能正常执行

验证阶段对于虚拟机的类加载机制来说，是一个非常重要的、但不是必须执行的阶段，可以使用参数-`Xverify:none`来关闭大部分的类验证措施，以缩短虚拟机类加载的时间

#### 5.2.3准备

准备阶段是正式为类中定义的变量（即静态变量，被`static`修饰的变量）分配内存并设置类变量的初始值的阶段。在JDK 7 及之前，HotSpot使用永久代来实现方法区，类变量所使用的内存都应当在方法区中进行分配；在JDK 8及之后，类变量则会随着Class对象一起存放在Java堆中

准备阶段进行内存分配的仅包括类变量，而不包括实例变量，实例变量将会在对象实例化时随着对象一起分配在Java堆中。其次，为类变量设置的初始值是数据类型的零值（不包括被`final`修饰的编译期常量）。比如`public static int value = 123;`在准备阶段后的初始值为0而不是123

被`final`修饰的编译期常量，编译器会在编译阶段为该类变量生成成`ConstantValue`属性，然后在准备阶段虚拟机会根据其成`ConstantValue`属性为其赋值。比如`public static final int value = 123;`在准备阶段后的初始值为123

#### 5.2.4解析

解析阶段是Java虚拟机将常量池内的符号引用替换为直接引用的过程

- 符号引用

  以一组符号来描述所引用的目标，符号可以是任何形式的字面，只要使用时能无歧义地定位到目标即可

- 直接引用

  直接指向目标的指针、相对偏移量或者是一个能间接定位到目标的句柄

解析的时机：可以在类被加载器加载时就对常量池中的符号引用进行解析，也可以等到一个符号引用将要被使用前才去解析

解析动作主要针对类或接口、字段、类方法、接口方法、方法类型、方法句柄和调用点限定符这7类符号引用进行，分别对应于常量池的`CONSTANT_Class_info`、`CON-STANT_Fieldref_info`、`CONSTANT_Methodref_info`、`CONSTANT_InterfaceMethodref_info`、`CONSTANT_MethodType_info`、`CONSTANT_MethodHandle_info`、`CONSTANT_Dyna-mic_info`和`CONSTANT_InvokeDynamic_info` 8种常量类型

- 类或接口的解析

  假设当前代码所处的类为D，如果要把一个从未解析过的符号引用N解析为一个类或接口C的直接引用，那虚拟机完成整个解析的过程需要包括以下3个步骤：

  - 如果C不是一个数组类型，那虚拟机将会把代表N的全限定名传递给D的类加载器去加载这个类C。在加载过程中，由于元数据验证、字节码验证的需要，又可能触发其他相关类的加载动作，例如加载这个类的父类或实现的接口。一旦这个加载过程出现了任何异常，解析过程就宣告失败
  - 如果C是一个数组类型，并且数组的元素类型为对象，那就会按照第一点的规则加载数组元素类型。如果是基本数据类型，就会由虚拟机生成一个代表数组维度和元素的数组对象
  - 如果上面两步没有出现任何异常，那么C在虚拟机中实际上已经是一个有效的类或接口了，但在解析完成前还要进行符号引用验证，确认D是否具备对C的访问权限。如果发现不具备访问权限，将抛出`java.lang.IllegalAccessError`异常

- 字段解析

  要解析一个未被解析过的字符段符号引用，首先将会对字段表内`class_index`项中索引的`CONSTANT_Class_info`符号引用进行解析，即字段所属类或接口的符号引用。如果在解析这个类或接口符号引用的过程中出现了任何异常，都会导致字段符号引用解析的失败。如果解析成功完成，那把这个字段所属的类或接口用C表示，然后对C进行后续字段的搜索：

  - 如果C本身就包含了简单名称和字段描述符都与目标相匹配的字段，则返回这个字段的直接引用，查找结束
  - 否则，如果在C中实现了接口，将会按照继承关系从下网上递归搜索各个接口和它的父接口，如果接口中包含了简单名称和字段描述符都与目标相匹配的字段，则返回这个字段的直接引用，查找结束
  - 否则，如果C不是`java.lang.Object`，将会按照继承关系从下往上递归搜索其父类，如果在父类中包含了简单名称和字段描述符都与目标相匹配的字段，则返回这个字段的直接引用，查找结束
  - 否则，查找失败，抛出`java.lang.NoSuchFieldError`异常

  如果查找过程成功返回了引用，将会对这个字段进行权限验证，如果发现不具备对字段的访问权 

  限，将抛出`java.lang.IllegalAccessError`异常

- 方法解析

  方法解析也需要先解析出方法表的`class_index`项中索引的方法所属的类或接口的符号引用，如果解析成功，那么我们依然用C表示这个类，接下来虚拟机将会按照如下步骤进行后续的方法搜索：

  - 由于Class文件格式中类的方法和接口的方法符号引用的常量类型定义是分开的，如果在类的方法表中发现`class_index`中索引的C是个接口的话，那就直接抛出`java.lang.IncompatibleClassChangeError` 异常
  - 如果通过了第一步，在类C中查找是否有简单名称和描述符都与目标相匹配的方法，如果有则返回这个方法的直接引用，查找结束
  - 否则，在类C的父类中递归查找是否有简单名称和描述符都与与目标相匹配的方法，如果有则返回这个方法的直接引用，查找结束
  - 否则，在类C实现的接口列表及它们的父接口之中递归查找是否有简单名称和描述符都与目标相匹配的方法，如果存在匹配的方法，说明类C是一个抽象类，这时候查找结束，抛出 `java.lang.AbstractMethodError`异常
  - 否则，宣告方法查找失败，抛出`java.lang.NoSuchMethodError`

  最后，如果查找过程成功返回了直接引用，将会对这个方法进行权限验证，如果发现不具备对此 

  方法的访问权限，将抛出`java.lang.IllegalAccessError`异常

- 接口方法解析

  接口方法也需要先解析出接口方法表的`class_index`项中索引的方法所属的类或接口的符号引用，如果解析成功，依然用C表示这个接口，接下来虚拟机将会按照如下步骤进行后续的接口方法搜索：

  - 与类方法解析相反，如果在接口方法表中发现`class_index`的索引C是个类而不是接口，那么直接抛出`java.lang.IncompatibleClassChangeError`异常
  - 否则，在接口C中查找是否有简单名称和描述符都与目标相匹配的方法，如果有则返回这个方法的直接引用，查找结束
  - 否则，在接口C的父接口中递归查找，直到`java.lang.Object`类（接口方法的查找范围也会包括`Object`类中的方法）为止，看是否有简单名称和描述符都与目标相匹配的方法，如果有则返回这个方法的直接引用，查找结束
  - 对于规则3，由于Java的接口允许多重继承，如果C的不同父接口中存有多个简单名称和描述符都与目标相匹配的方法，那将会从这多个方法中返回其中一个并结束查找
  - 否则，宣告方法查找失败，抛出`java.lang.NoSuchMethodError`异常

#### 5.2.5初始化

类初始化是类加载过程的最后一个步骤，初始化前的加载过程，除了用户通过自定义类加载器的方式局部参与外，其余动作完全由虚拟机来主导控制。初始化阶段，虚拟机才真正开始执行类中编写的程序代码，将主导权交给用户程序

准备阶段，类变量已经赋过一次初始零值，而初始化阶段，就是执行类构造器`<clinit>()`方法的过程。

- `<clinit>()`方法

  该方法并不是由程序员直接编写生成的，而是编译器的自动生成物。它会自动收集类中的所有类变量的赋值动作和静态语句块（`static{}`块），收集顺序是由语句在源文件中出现的顺序决定的

  - 静态语句块中只能访问到定义在静态语句块之前的变量，定义在它之后的变量，在前面的静态语句块可以赋值，但是不能访问：

    ```java
    package classloading;
    
    public class Test {
        static{
            //可以为定义在静态语句块之后的变量赋值
            i=0;
            //不能访问定义在静态语句块之后的变量，非法向前引用
            System.out.println(i);
        }
        static int i=1;
    }
    ```

  - `<clinit>()`方法与类的构造方法（即在虚拟机视角中的实例构造器`<init>()`方法）不同，它不需要显式地调用父类构造器，虚拟机会保证在子类的`<clinit>()`方法执行前，父类的`<clinit>()`方法已经执行完毕。所以在虚拟机中第一个被执行的`<clinit>()`的类型肯定是`java.lang.Object`

  - 由于父类的`<clinit>()`方法先执行，也就是说父类中定义的镜头语句块要优先于子类的变量赋值操作

    ```java
    package classloading;
    
    public class Parent {
        public static int A=1;
        static {
            //该语句块在子类赋值操作前已经执行完毕
            A=2;
        }
        static class Sub extends Parent{
            //所以B为2
            public static int B=A;
        }
        public static void main(String...args){
            System.out.println(Sub.B);
        }
    }/*output
    2
    */
    ```

  - `<clinit>()`方法对于类或接口来说并不是必需的，如果一个类中没有静态语句块，也没有对变量的 

    赋值操作，那么编译器可以不为这个类生成`<clinit>()`方法

  - 接口中不能使用静态语句块，但接口中定义的字段默认都是`static`和`final`的，因此接口与类一样都会生成`<clinit>()`方法。但接口与类不同的是，执行接口的`<clinit>()`方法不需要先执行父接口的`<clinit>()`方法，只有当父接口中定义的变量被使用时，父接口才会被初始化。此外，接口的实现类在初始化时也一样不会执行接口的`<clinit>()`方法

  - 虚拟机必须保证一个类的`<clinit>()`方法在多线程环境中被正确地加锁同步（初始化的时候，同一个类加载器下，一个类的`<clinit>()`方法只能被执行一次），如果多个线程同时去初始化一个类，那么只会有其中一个线程去执行这个类的`<clinit>()`方法，其他线程都需要阻塞等待，直到活动线程执行完毕`<clinit>()`方法

    ```java
    package classloading;
    
    public class DeadLoopClass {
        //当一条线程在执行该类的<clinit>()方法，其余线程都会等待
        //当某一线程执行完<clinit>()方法，其余线程被唤醒后则不会再次进入<clinit>()方法，因为同一个类加载器下，一个类型只会被初始化一次
        static {
            if(true){
                System.out.println(Thread.currentThread()+"init DeadLoopClass");
                while (true){}
            }
        }
        public static void main(String...args){
            Runnable script=new Runnable() {
                @Override
                public void run() {
                    System.out.println(Thread.currentThread()+"start");
                    DeadLoopClass dlc=new DeadLoopClass();
                    System.out.println(Thread.currentThread()+"run over");
                }
            };
            Thread t1=new Thread(script);
            Thread t2=new Thread(script);
            t1.start();
            t2.start();
        }
    }/*output
    Thread[main,5,main]init DeadLoopClass
    */
    ```

### 5.3类加载器

“通过一个类的全限定名来获取描述该类的二进制字节流”是通过类加载器来完成的，我们可以自定义类加载器来决定如何去获取所需的类

#### 5.3.1类与加载器

对于任意一个类，都必须由加载它的类加载器和这个类本身一起共同确立其在虚拟机中的唯一性，每个类加载器，都有一个独立的类名称空间，也就是说，比较两个类是否“相等”，只有在这两个类是由同一个类加载器加载的前提下才有意义，否则，即使这两个类来源于同一个Class文件，被同一个虚拟机加载，只要加载它们的类加载器不同，那这两个类必定不相等

所谓两个类”相等“，包括代表类的`Class`对象的`equals()`方法、`isAssignableFrom()`方法、`isInstance()`方法的返回结果，也包括了使用`instanceof`关键字做对象所属关系判定等各种情况

```java
package site.potatoblog.classloading;

import java.io.IOException;
import java.io.InputStream;

public class ClassLoadTest {
    public static void main(String...args) throws ClassNotFoundException, IllegalAccessException, InstantiationException {
        //自定义类加载器
        ClassLoader myloader=new ClassLoader() {
            @Override
            public Class<?> loadClass(String name) throws ClassNotFoundException {
                try{
                    String fileName=name.substring(name.lastIndexOf(".")+1)+".class";
                    InputStream is=getClass().getResourceAsStream(fileName);
                    if(is==null){
                        return super.loadClass(name);
                    }
                    byte[] b=new byte[is.available()];
                    is.read(b);
                    return defineClass(name,b,0,b.length);
                }catch (IOException e){
                    throw new ClassNotFoundException(name);
                }
            }
        };
        //使用自定义类加载器来加载site.potatoblog.classloading.ClassLoadTest类
        //此时虚拟机中同时存在了两个ClassLoadTest类，都来自于同一个Class文件
        Object obj=myloader.loadClass("site.potatoblog.classloading.ClassLoadTest").newInstance();
        System.out.println(obj.getClass());
        //一个是自定义类加载器加载的ClassLoadTest类，另一个是由虚拟机的应用程序类加载器加载的
        //这两个类是相互独立的类，做对象类型检查时结果为false
        System.out.println(obj instanceof site.potatoblog.classloading.ClassLoadTest);
    }
}/*output
class site.potatoblog.classloading.ClassLoadTest
false
*/
```

#### 5.3.2双亲委派模型

在虚拟机的角度看，只存在两种不同的类加载器：

- 启动类加载器（Bootstrap Class Loader），该类加载器由C++实现，是虚拟机自身一部分
- 其他所有的类加载器，这些类加载器由Java语言实现，独立存在于虚拟机外部，并全都继承自抽象类`java.lang.ClassLoader`

JDK 8 及之前，绝大多数Java程序都会使用到以下3个系统提供到的类加载器来进行加载：

- 启动类加载器（Bootstrap Class Loader）：这个类加载器负责加载存放在`<JAVA_HOME>\lib`目录，或者被`-Xbootclasspath`参数所指定的路径中存放的，而且是虚拟机能够识别的（按照文件名识别，如rt.jar、tools.jar，名字不符合的类库即使放在lib目录中也不会被加载）类库加载到虚拟机的内存中。启动类加载器无法被Java程序直接引用，用户在编写自定义类加载器时，如果需要把加载请求委派给启动类加载器去处理，可以直接使用`null`代替

  `java.lang.Class`包的`getClassLoader()`方法的代码片段

  ```java
  /** Returns the class loader for the class. Some implementations may use null to represent the bootstrap class loader. This method will return null in such implementations if this class was loaded by the bootstrap class loader. */
  public ClassLoader getClassLoader() { 
      ClassLoader cl = getClassLoader0(); 
      //null表示启动类加载器
      if (cl == null)
          return null; 
      SecurityManager sm = System.getSecurityManager(); 
      if (sm != null) {
          ClassLoader ccl = ClassLoader.getCallerClassLoader(); 
          if (ccl != null && ccl != cl && !cl.isAncestor(ccl)) { 
              sm.checkPermission(SecurityConstants.GET_CLASSLOADER_PERMISSION);
          } 
      }
      return cl; 
  }
  ```

- 扩展类加载器（Extension Class Loader）：这个类加载器是在类`sun.misc.Launcher$ExtClassLoader`中以Java代码的形式实现的。它负责加载`<JAVA_HOME>\lib\ext`目录中，或者被`java.ext.dirs`系统变量所指定的路径中所有的类库

- 应用程序类加载器（Application Class Loader）：这个类加载器由`sun.misc.Launcher$AppClassLoader`来实现。它负责加载用户类路径（ClassPath）上所有的类库，开发者同样可以直接在代码中使用这个类加载器。如果应用程序中没有自定义过自己的类加载器，一般情况下这个就是程序中默认的类加载器

**双亲委派模型**

各种类加载器的协作关系默认采用双亲委派模型。双亲委派模型要求除了顶层的启动类加载器外，其余的类加载器都应有自己的父类加载器，类加载器之间的父子关系一般不是以继承方式实现，而是通过组合来复用父加载器的代码

- 类加载器的双亲委派模型图：

  ![image-20210328203614011](/static/img/image-20210328203614011.png)

- 双亲委派模型的工作过程：如果一个类加载器收到了类加载请求，它首先不会自己去尝试加载这个类，而是把这个请求委派给父类加载器去完成，每个层次的类加载器都是如此，因此所有的加载请求最终都会传送到最顶层的启动类加载器，只有当父加载器反馈自己无法完成这个加载请求（它的搜索范围中没有找到所需的类）时，子加载器才会尝试自己去完成加载

- 双亲委派模型的应用

  由于双亲委派模型，Java中的类随着它的类加载器一起具备了一种带有优先级的层次关系。例如类`java.lang.Object`，它存放在rt.jar之中，无论哪一个类加载器要加载这个类，最终都是委派给处于模型最顶端的启动类加载器进行加载，因此`Object`类在程序的各种类加载器环境中都能够保证是同一个类。如果没有双亲委派模型，而是每个类加载器加载自己的话就会导致程序在运行时，系统中存在多个不同`Object`类

- 双亲委派模型的实现源码

  ```java
      protected Class<?> loadClass(String name, boolean resolve)
          throws ClassNotFoundException
      {
          synchronized (getClassLoadingLock(name)) {
              // 首先检查请求加载的类是否已经被加载过了
              Class<?> c = findLoadedClass(name);
              //如果该类还没有被加载
              if (c == null) {
                  long t0 = System.nanoTime();
                  try {
                      //如果当前类加载器的父类加载器不是启动类加载器
                      if (parent != null) {
                          //那就将加载请求提交给父类加载器处理
                          c = parent.loadClass(name, false);
                      } else {
                          //否则，就调用启动类加载器来处理该加载请求
                          c = findBootstrapClassOrNull(name);
                      }
                  } catch (ClassNotFoundException e) {
                      //如果父类加载器抛出ClassNotFoundException
                      //说明父类加载器无法完成加载请求
                  }
  				//如果父类加载器无法加载该请求
                  if (c == null) {
                      long t1 = System.nanoTime();
                      //那么调用自身的findClass方法来进行加载
                      c = findClass(name);
  
                      // this is the defining class loader; record the stats
                      PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                      PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                      PerfCounter.getFindClasses().increment();
                  }
              }
              if (resolve) {
                  resolveClass(c);
              }
              return c;
          }
      }
  ```

#### 5.3.3破坏双亲委派模型

类加载器的双亲委派模型并不是一个具有强制性约束的模型，直到Java模块化出现为止，双亲委派模型主要出现过3次较大规模“被破坏”的情况：

- 双亲委派模型在JDK 1.2之后才被引入，必须要兼容那些在此之前已经存在的用户自定义类加载器的代码，而双亲委派模型的实现都在`loadClass()`方法里，所以在JDK 1.2后，通过在`java.lang.ClassLoader`中添加一个新的`protected`方法`findClass()`（如果父类加载失败，就会自动调用自己的`findClass()`方法来完成加载），引导用户尽可能去重写该方法来实现自定义的类加载逻辑，而不是在`loadClass()`方法中编写代码（如果用户想要破坏双亲委派模型，可以在自定义类加载器中重写`loadClass()`方法，否则，就应该重写`findClass()`方法）
- 双亲委派模型能很好地解决各个类加载协作时基础类型的一致性问题，即越基础的类由越上层的加载器进行加载，基础类型总是作为被用户代码继承、调用的API，但是如果基础类型又要调用回用户的代码，就必须破坏双亲委派模型。比如JNDI（Java命名与文件夹接口）服务，它的代码由启动类加载器来完成加载，是Java中很基础的类型，它需要调用由其他厂商实现并部署在应用程序的ClassPath下的JNDI服务提供者接口（Service Provider Interface，SPI）的代码，而启动类加载器是不认识且无法加载这些代码，Java只能通过引入一个线程上下文类加载器：该类加载器可以通过`java.lang.Thread`类的`setContext-ClassLoader()`方法进行设置，如果创建线程时还未设置，它将会从父线程中继承一个，如果在应用程序的全局范围内都没有设置过的话，那这个类加载器默认就是应用程序类加载器
- 代码热替换、模块热部署等需求就需要破坏类加载器的双亲委派模型

### 5.4模块化下的类加载器

Java在JDK 9引入模块化系统，为了保证兼容性，Java对类加载器做了一些变动：

- 扩展类加载器（Extension Class Loader）被平台类加载器（Platform Class Loader）取代。由于整个JDK都基于模块化进行构建，其中的Java类库都可以被扩展，所以无需保留`<JAVA_HOME>\lib\ext目录`，所以也无需使用扩展类加载器
- 平台类加载器和应用程序类加载器不再派生自`java.net.URLClassLoader`，现在启动类加载、平台类加载器、应用程序类加载器全都继承于`jdk.internal.loader.BuiltinClassLoader`

JDK 9后类加载器的委派关系图：

![image-20210329000706140](/static/img/image-20210329000706140.png)

JDK 9后虽然仍维持着三层类加载器和双亲委派架构，但类加载的委派关系发生了变动：当平台及应用程序类加载器收到类加载请求，在委派给父加载器前，会先判断该类是否能归属到某一个系统模块中，如果可以找到这样的归属关系，就优先委派给负责那个模块的加载器完成加载

## 6.虚拟机字节码执行引擎

执行引擎是虚拟机核心的组成部分之一，它是由软件自行实现的，可以不受物理条件制约地定制指令集与执行引擎的结构体系，能够执行那些不被硬件直接支持的指令集格式

在不同的虚拟机实现中，执行引擎在执行字节码的时候，通常会有解释执行（通过解释器执行）和编译执行（通过即时编译器产生本地代码执行）两种选择，也可能两者兼备，还可能会有同时包含几个不同级别的即时编译器一起工作的执行引擎。但从外观上来看，所有的Java虚拟机的执行引擎输入、输出都是一致的：输入的是字节码二进制流，处理过程是字节码解析执行的等效过程，输出的是执行结果

### 6.1运行时栈帧结构

- 虚拟机以方法作为最基本的执行单元，“栈帧”则是用于支持虚拟机进行方法调用和方法执行背后的数据结构，它也是虚拟机运行时数据区的虚拟机栈的栈元素，每一个方法从调用开始至执行结束的过程，都对应着一个栈帧在虚拟机栈里从入栈到出栈的过程

- 栈帧存储了方法的局部变量表、操作数栈、动态连接和方法返回地址和一些额外的附加信息。在编译Java程序源码的时候，栈帧中需要多大的局部变量表，需要多深的操作数栈就已经被分析计算出来，并且写入到方法表的`Code`属性之中，也就是说，一个栈帧需要分配多少内存，并不会受运行期变量数据的影响而仅仅取决于程序源码和具体的虚拟机实现的栈内存布局形式

- 一个线程中的方法调用链可能会很长，以程序的角度看，同一时刻、同一条线程里，在调用栈的所有方法都同时处于执行状态；而对于虚拟机执行引擎来讲，在活动线程中，只有位于栈顶的方法才是在运行的，其被称为“当前方法”，与该方法关联的栈帧被称为“当前栈帧”

- 栈帧的概念结构

  ![image-20210329200234620](/static/img/image-20210329200234620.png)

#### 6.1.1**局部变量表**

- 是一组变量值的存储空间，用于存放方法参数和方法内部定义的局部变量。Java程序被编译为Class文件时，就已经在方法的`Code`属性的`max_locals`数据项中确定了该方法所需分配的局部变量表的最大容量

- 局部变量表的容量以变量槽为最小单位，一个变量槽可以存放一个32位以内的数据类型（`boolean`、`byte`、`char`、`short`、`int`、`float`、`reference`和`returnAddress`），而对于64位的数据类型`long`和`double`，虚拟机会以高位对齐的方式为其分配两个连续的变量槽空间

- 虚拟机通过索引定位的方式使用局部变量表，索引值的范围是从0至局部变量表最大的变量槽数量。如果访问的是32位数据类型的变量，索引N就代表了使用第N个变量槽，如果访问的是64位数据类型的变量，则说明会同时使用第N和N+1两个变量

- 当一个方法被调用时，虚拟机会使用局部变量表来完成实参到形参到的传递。如果执行的是实例方法，那局部变量表中第0位索引的变量槽默认是用于传递方法所属对象实例的引用，在方法中可以通过关键字`this`来访问到这个隐含的参数。其余参数则按照参数表顺序排列，占用从1开始的局部变量槽，参数表分配完毕后，再根据方法体内部定义的变量顺序和作用域分配其余的变量槽

- 为节省栈帧耗用的内存，局部变量表的变量槽是可以重用的：当字节码的PC计数器的值超出了方法体中定义的某变量的作用域，那这个变量对应的变量槽就可以交给其他变量来重用。在某些情况，局部变量槽的复用会影响到垃圾收集行为：

  ```java
  /**
   * VM Args:-Xlog:gc*
   */
  package site.potatoblog.ee;
  
  public class SlotAndGC {
      public static void gc1(){
          {
              byte[] placeholder = new byte[64 * 1024 * 1024];
          }
          //理论上，当程序运行到此行已经超出placeholder的作用域，无法再访问到
          //可是垃圾回收时却没有将64M内存回收，因为其对应的变量槽还没有被重用
          System.gc();
      }
      public static void gc2(){
          {
              byte[] placeholder = new byte[64 * 1024 * 1024];
          }
          //新增一个变量，来重用原先placeholder所在的变量槽，使得placeholder被覆盖
          //所以placeholder所指向的对象也就与GC Root失去连接，从而在下一次垃圾回收时被回收
          int a=0;
          System.gc();
      }
      public static void main(String...args){
          gc1();
          gc2();
      }
  }/*output
  [0.173s][info][gc,heap,exit   ]  garbage-first heap   total 131072K, used 67550K [0x0000000081800000, 0x0000000100000000)
  [0.193s][info][gc,heap,exit   ]  garbage-first heap   total 8192K, used 990K [0x0000000081800000, 0x0000000100000000)
  */
  ```

  如果遇到一个方法，其后面的代码有一些耗时很长的操作，而前面又定义了占用了大量内存但实际上已经不会再使用的变量，应该手动将其设置为`null`，就可以把变量对应的局部变量槽清空，从而释放大量的内存空间

- 方法中的局部变量不像类变量那样，会在类加载的准备阶段被赋予系统初始值，因此局部变量在使用前一定要赋值

#### 6.1.2操作数栈

- 操作数栈也叫操作栈，同局部变量表一样，操作数栈的最大深度也在编译的时候被写入到`Code`属性的`max_stacks`数据项中，32位数据类型占用的栈容量为1，64位数据类型占用的栈容量为2。编译器的数据流分析工作保证了在方法执行的任何时候，操作数栈的深度都不会超过在`max_stacks`数据项中设定的最大值

- 当一个方法刚开始执行时，该方法的操作数栈是空的，在方法的执行过程，会有各种字节码指令往操作数栈中写入和提取内容，即出栈和入栈操作。比如整数加法的字节码指令`iadd`，该指令在运行时要求操作数栈中最接近栈顶的两个元素已经存入了两个`int`型的数值，当执行这个指令时，会把这两个`int`值出栈并相加，并把结果重新入栈

- 操作数栈中元素的数据类型必须与字节码指令的序列严格匹配，在编译程序代码的时候，编译器必须严格保证这一点，在类校验阶段的数据流分析中还要再次验证这一点。再以`iadd`指令为例，该指令只适用于整型的加法，它在执行时，最接近栈顶的两个元素必须是`int`型，不能出现一个`long`和一个`float`使用`iadd`命令相加的情况

- 两个不同栈帧作为不同方法的虚拟机栈的元素，在大多虚拟机实现中都会进行一些优化处理，令两个栈帧出现一部分重叠：让下面栈帧的部分操作数栈与说明栈帧的部分局部变量表重叠在一起。这样不仅可以节约空间，还能在进行方法调用时就可以直接共用一部分数据，无须进行额外的参数复制传递

  ![image-20210329215936744](/static/img/image-20210329215936744.png)

#### 6.1.3动态连接

每个栈帧都包含一个指向运行时常量池中该栈帧所属方法的引用，持有该引用是为了支持方法调用过程中的动态连接

字节码中的方法调用指令就以常量池里指向方法的符号引用作为参数

- 静态解析：这些符号引用一部分会在类加载阶段或者第一次使用的时候就被转化为直接引用
- 动态连接：另外一部分将在每一次运行期间都转化为直接引用

#### 6.1.4方法返回地址

当一个方法开始执行后，只有两种方式退出这个方法：

- 正常调用完成：执行引擎遇到任意一个方法返回的字节码指令，这时候可能会有返回值传递给上层到的方法调用者（方法是否有返回值以及返回值的类型将根据遇到何种方法返回指令来决定）。方法正常退出时，必须返回到最初方法被调用时的位置，栈帧中很可能会保存当时PC计数器的值，用于正确返回方法退出后的位置
- 异常调用完成：在方法执行的过程中遇到了异常，并且该异常没有在方法体内得到妥善处理。无论是虚拟机内部产生的异常，还是代码中使用`athrow`字节码指令产生的异常，只要在本方法的异常表中没有搜索到匹配的异常处理器，就会导致方法退出。该退出方式是不会给它的上层调用者提供任何返回值的，并且在方法通过异常退出后，返回地址是由异常处理器表确定的

方法退出的实际过程等同于把当前栈帧出栈，因此退出时很可能执行的操作有：恢复上层方法的局部变量表和操作数栈，把返回值（如果有）压入调用者栈帧的操作数栈中，调整PC计数器的值以指向方法调用指令后面的一条指令等

#### 6.1.5附加信息

《Java虚拟机规范》允许虚拟机实现增加一些规范里没有描述的信息到栈帧之中，例如与调试、性能收集相关的信息，这部分信息完全取决于具体的虚拟机实现

### 6.2方法调用

Class文件的编译过程是不包含连接步骤的，一切方法调用在Class文件中存储的都只是符号引用，而不是方法在实际运行时内存布局中的入口地址（直接引用），所以方法调用并不等同于方法中的代码被执行，方法调用阶段唯一任务就是确定被调用方法的版本，即调用哪一个方法

#### 6.2.1解析

- 所有方法调用的目标方法在Class文件里都是一个常量池中的符号引用，在类加载的解析阶段，会将其中一部分符号引用转化为直接引用，要求这一部分引用所关联的方法必须是“编译期可知，运行期不可变”。这类方法的调用被称为**解析**

- 字节码指令集里设计了5条方法调用指令来支持调用不同类型的方法：

  - `invokestatic`：用于调用静态方法
  - `invokespecial`：用于调用实例构造器`<init>()`方法、私有方法和父类中的方法
  - `invokevirtual`：用于调用所有的虚方法
  - `invokeinterface`：用于调用接口方法，会在运行时再确定一个实现该接口的对象
  - `invokedynamic`：先在运行时动态解析出调用点限定符所引用的方法，然后再执行该方法。前面4条调用指令，分派逻辑都固化在Java虚拟机内部，而invokedynamic指令的分派逻辑是由用户设定的引导方法来决定的

  只要能被`invokestatic`和`invokespecial`指令调用的方法，都可以在解析阶段中确定唯一的调用版本，Java中符合该条件的方法有静态方法、私有方法、实例构造器、父类方法，再加上被`final`修饰的方法（该类方法使用`invokevirtual`调用），这5中方法调用会在类加载的时候就可以把符号引用解析为该方法的直接引用。这些方法统称为”非虚方法“，其余方法就称为“虚方法”

- 解析调用一定是静态的过程，在编译期间就完全确定，在类加载的解析阶段就会把涉及的符号引用全部转变为明确的直接引用，不必延迟到运行期再去完成

#### 6.2.2分派

方法调用形式除了解析调用，还有分派调用。分派调用按照宗量数（方法的接收者与方法的参数统称为方法的宗量）可以分为单分派和多分派。分派调用可能是静态也可能是动态，所以又可以分为了静态单分派、静态多分派、动态单分派、动态多分派

- 静态分派

  `Human man=new Man()`

  - 静态类型

    上述代码的`Human`即为变量`man`的静态类型。静态类型只有在使用时会发生变化（比如对其向下转型`(Man)man`），并且最终的静态类型是在编译期可知的，即通过强制转型改变静态类型，这个改变在编译期仍是可知的

  - 运行时类型：上述代码的`Man`即为变量`man`的运行时类型。运行时类型在程序中也会发生变化，只是其变化的结果只有在运行期才可以确定，编译器在编译程序的时候并不知道一个对象的运行时类型是什么（比如`Human human = (new Random()).nextBoolean() ? new Man() : new Woman();`，只有在运行时才能知道变量`human`运行时类型是`Man`还是`Woman`）

  静态分派，即所有依赖静态类型来决定方法执行版本的分派动作。静态分派最典型应用表现就是方法重载，在编译阶段，编译器会根据参数的静态类型决定使用方法的哪个重载版本，并将确定后的方法的符号引用写到`invokevirtual`指令的参数后

  ```java
  package site.potatoblog.ee;
  
  public class StaticDispatch {
      static abstract class Human{}
      static class Man extends Human{}
      static class Woman extends Human{}
      public void sayHello(Human guy){
          System.out.println("hello guy!");
      }
      public void sayHello(Man guy){
          System.out.println("hello man!");
      }
      public void sayHello(Woman guy){
          System.out.println("hello woman!");
      }
      public static void main(String...args){
          Human man=new Man();
          Human woman=new Woman();
          StaticDispatch sd=new StaticDispatch();
          //方法重载是根据参数的静态类型来选择调用哪一个重载版本，变量man和woman的静态类型都是Human
          //所以都调用sayHello(Human)这个方法
          sd.sayHello(man);
          sd.sayHello(woman);
      }
  }/*output
  hello guy!
  hello guy!
  */
  ```

  重载匹配的优先级：

  ```java
  package site.potatoblog.ee;
  
  import java.io.Serializable;
  
  public class Overload { 
      //6.就会选用参数类型为Object的方法调用，如果该方法被注释掉
      public static void sayHello(Object arg) { 
          System.out.println("hello Object");
      }
      //2.就会选用参数类型int的方法调用，将a转化为整型数字97，如果该方法被注释掉
      public static void sayHello(int arg) { 
          System.out.println("hello int");
      }
      //3.就会选用参数类型为long的方法调用，将a转化为整型97再转化为长整型97L，如果该方法被注释掉，会按照类型为float、double的顺序（如果有）往下匹配
      public static void sayHello(long arg) {
          System.out.println("hello long"); 
      }
      //4.就会选用参数类型为Character的方法调用，将a自动装箱为Character，如果该方法被注释掉
      public static void sayHello(Character arg) { 
          System.out.println("hello Character"); 
      }
      //1.首先根据参数类型char会优先调用该方法，如果该方法被注释
      public static void sayHello(char arg) {
          System.out.println("hello char");
      }
      //7.就会选用类型为char的可变长参数
      public static void sayHello(char... arg) { 
          System.out.println("hello char ..."); 
      }
      //5.就会选用参数类型为Serializable的方法调用，将a自动装箱为Character，然后找到Character实现的接口Serializable，如果该方法被注释掉
      public static void sayHello(Serializable arg) {
          System.out.println("hello Serializable"); 
      }
      public static void main(String[] args) {
          sayHello('a'); 
      } 
  }
  ```

  静态分派发生在编译阶段，因此确定静态分派的动作不是由虚拟机来执行的

- 动态分派

  在运行期根据运行时类型来决定方法执行版本的动作。动态分派与Java语言的多态性有着密切关联

  ```java
  package site.potatoblog.ee;
  
  public class DynamicDispatch {
      static abstract class Human{
          protected abstract void sayHello();
      }
      static class Man extends Human{
          @Override
          protected void sayHello() {
              System.out.println("man say hello");
          }
      }
      static class Woman extends Human{
          @Override
          protected void sayHello() {
              System.out.println("woman say hello");
          }
      }
      public static void main(String...args){
          Human man=new Man();
          Human woman=new Woman();
          //方法sayHello的调用是通过运行时类型来判断方法调用的版本
          man.sayHello();
          woman.sayHello();
          man=new Woman();
          man.sayHello();
      }
  }/*output
  man say hello
  woman say hello
  woman say hello
  */
  ```

  使用`javap`命令输出上述代码的字节码：

  ![image-20210330104517199](/static/img/image-20210330104517199.png)

  0~15行的字节码是准备动作，用于建立`man`和`woman`的内存空间、调用`Man`和`Woman`类型的实例构造器，将这两个实例的引用存放在局部变量表的第1、2个变量槽中，这些动作对应于以下代码

  ```java
  Human man=new Man();
  Human woman=new Woman();
  ```

  16行和20行的`aload`指令分别把刚刚创建的两个对象的引用压入栈顶；17和21行是方法调用指令，这两条调用无论是指令（`invokevirtual`）还是参数（都是常量池中第22项常量，注释显示该常量为是`Human.sayHello()`的符号引用）都完全一样，但是这两句指令最终执行的目标方法并不相同，关键在于`invokevirtual`指令，该指令的运行时解析过程如下：

  - 找到操作数栈顶的第一个元素所指向的对象的实际类型，记作C
  - 如果在类型C中找到与常量中的描述符和简单名称都相符的方法，则进行访问权限校验，如果通过，则返回这个方法的直接引用，查找过程结束；不通过则返回`java.lang.IllegalAccessError`异常
  - 否则，按照继承关系从下往上依次对C的各个父类进行第二步的搜索和验证过程
  - 如果始终没有找到合适的方法，则抛出java.lang.AbstractMethodError异常

  正是因为为`invokevirtual`指令执行的第一步就是在运行期确定接收者的实际类型，所以两次调用中的 `invokevirtual`指令并不是把常量池中方法的符号引用解析到直接引用上就结束了，还会根据方法接收者 的实际类型来选择方法版本，这也是Java中方法重写的本质

  Java的多态性的根源在于虚方法调用指令`invokevirtual`的执行逻辑，所以多态性只对方法有效，对字段是无效的

- 单分派与多分派

  方法的宗量：方法的接收者与方法的参数的统称

  - 单分派

    根据一个宗量对目标方法进行选择

  - 多分派

    根据多于一个宗量对目标方法进行选择

  单分派和多分派演示：

  ```java
  package site.potatoblog.ee;
  
  public class Dispatch {
      static class QQ{}
      static class _360{}
      public static class Father{
          public void hardChoice(QQ arg){
              System.out.println("father choose qq");
          }
          public void hardChoice(_360 arg){
              System.out.println("father choose 360");
          }
      }
      public static class Son extends Father{
          @Override
          public void hardChoice(QQ arg){
              System.out.println("son choose qq");
          }
          @Override
          public void hardChoice(_360 arg){
              System.out.println("son choose 360");
          }
      }
      public static void main(String...args){
          Father father=new Father();
          Father son=new Son();
          father.hardChoice(new _360());
          son.hardChoice(new QQ());
      }
  }/*output
  father choose 360
  son choose qq
  */
  ```

  Java语言是静态多分派，动态单分派的语言：

  - 编译阶段的方法选择过程，也就是静态分派的过程。以上述代码为例，此时选择目标方法的依据有两点一是静态类型是`Father`还是`Son`，二是方法参数是`QQ`还是`360`。这次选择结果最终产物是产生了两条`invokevirtual`指令，这两条指令的参数分别为常量池中指向`Father::hardChoice(360)`及`Father::hardChoice(QQ)`方法的符号引用。由于Java的静态分派是根据两个宗量选择，所以是多分派
  - 运行阶段中虚拟机的选择，也就是动态分派的过程。在执行`son.hardChoice(new QQ())`这行代码时，更准确地说，是在执行这行代码所对应的`invokevirtual`指令时，由于编译期已经确定目标方法的签名必须为`hardChoice(QQ)`，所以虚拟机是不会关心传递过来的参数`QQ`到底是“腾讯QQ”还是“奇瑞QQ”，因为这时候参数的静态类型、运行时类型都对方法的选择不构成任何影响，唯一可以影响虚拟机选择的因素只有该方法的接收者的运行时类型。因为只有一个宗量作为选择依据，所以Java的动态分派是单分派类型

- 虚拟机动态分派的实现

  - 动态分派是执行非常频繁的动作，而且动态分派的方法版本选择过程需要运行时在接收者类型的方法元数据中搜索合适的目标方法，虚拟机出于性能考虑，会为类型在方法区中建立一个虚方法表，使用虚方法表索引来代替元数据查找，以此提高性能

  - 虚方法表中存放着各个方法的实际入口地址。如果某个方法在子类中没有被重写，那子类的虚方法表中的地址入口和父类相同方法的地址入口一致，都指向父类的实现入口。如果子类中重写了这个方法，子类虚方法表中的地址也会被替换为指向子类实现版本的入口地址
  - 为了程序实现方便，具有相同签名的方法，在父类、子类的虚方法表中都应当具有一样的索引序号，这样当类型变换时，仅需要变更查找的虚方法表，就可以从不同的虚方法表中按索引转换出所需的入口地址。虚方法表一般在类加载的连接阶段进行初始化，准备了类的变量初始值后，虚拟机会把该类的虚方法表也一同初始化完毕

  ![image-20210330201056850](/static/img/image-20210330201056850.png)

### 6.3动态类型语言支持

JDK 7的发布带来了一个新的字节码指令——`invokedynamic`指令，用以实现动态类型语言支持

#### 6.3.1动态类型语言

动态类型语言的关键特征是它的类型检查的主体过程是在运行期而不是在编译期进行的，满足这类特征的语言有Python、JavaScript等。相对地，在编译期就进行类型检查过程的语言，譬如C++和Java等

- 编译期进行与运行期进行

  ```java
  public static void main(String[] args) { 
  	int[][][] array = new int[1][0][-1];
  }
  ```

  上述代码在Java中可以正常编译，但是运行时会抛出`NegativeArraySizeException`异常，该异常是一个运行时异常，即只要代码不执行到这一行就不会出现问题。与运行时异常相对的是连接时异常，可能会在类加载阶段抛出（连接在类加载阶段进行），例如常见的`NoClassDefFoundError`就属于连接时异常

  上述代码若在C语言中，在编译期就会直接报错，而不是等到运行时才出现异常

- 类型检查

  `obj.println("hello world");`

  假设变量`obj`的静态类型为`java.io.PrintStream`，那变量obj的实际类型就必须是`PrintStream`子类（实现了`PrintStream`接口的类）才是合法的。否则，哪怕`obj`属于一个确实包含有与`println(String)`方法相同签名方法的类型，但只要它与`PrintStream`接口没有继承关系，代码依然不可能运行——因为类型检查不合法

  相同的代码在`JavaScript`中情况则不一样，无论`obj`具体是何种类型，无论其继承关系如何，只要这种类型的方法定义中确实包含有println(String)方法，能够找到相同签名的方法，调用便可成功

  产生这两种差别的根本原因在于Java在编译期已经将`println(String)`方法完整的符号引用生成出来，并作为方法调用指令的参数存储到Class文件中，例如下面这样子：

  ![image-20210330214842854](/static/img/image-20210330214842854.png)

  这个符号引用包含了该方法定义在哪个具体类型之中、方法的名字以及参数顺序、参数类型和方法返回值等信息，通过这个符号引用，虚拟机会根据该符号引用翻译出该方法的直接引用。而JavaScript等动态类型语言与Java有一个核心的差异就是变量obj本身并没有类型，变量obj的值才具有类型，所以编译器在编译时最多只能确定方法名称、参数、返回值这些信息，而不会去确定方法所在的具体类型（即方法接收者不固定）


变量无类型而变量值才有类型，这个特点也是动态类型语言的一个核心特征

#### 6.3.2Java与动态类型

Java虚拟机在面对动态类型语言的支持一直都还有所欠缺，主要表现在方法调用方面：JDK 7以前的字节码指令集中，4条方法调用指令（`invokevirtual`、`invokespecial`、`invokestatic`、`invokeinterface`）的第一个参数都是被调用的方法的符号引用，而方法的符号引用都是在编译时产生，而动态类型语言只有在运行期才能确定方法的接收者。这样，在Java虚拟机上实现的动态类型语言就不得不使用“曲线救国”的方式（如编译时留个占位符类型，运行时动态生成字节码实现具体类型到占位符类型的适配）来实现，但这样带来的副作用也很多。因此JDK 7后就引入`invokedynamic`指令以及`java.lang.invoke`包，来解决这种动态类型方法调用

#### 6.3.3`java.lang.invoke`包

引入`java.lang.invoke`包的主要目的是为之前单纯依靠符号引用来确定调用的目标方法这条路之外，提供一种新的动态确定目标方法机制，即“方法句柄”

使用方法句柄，那么无论`obj`是何种类型（临时定义的ClassA抑或是实现`PrintStream`接口的实现类`System.out`），都可以正确调用到`println()`方法

```java
package site.potatoblog.ee;

import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;

public class MethodHandleTest {
    static class ClassA{
        public void println(String s){
            System.out.println(s);
        }
    }
    //获得方法句柄
    private static MethodHandle getPrintlnMH(Object receiver) throws Throwable{
        //MethodType代表方法类型，包含了方法的返回值和具体参数
        MethodType mt=MethodType.methodType(void.class,String.class);
        //lookup()方法来自于MethodHandles，作用是是在指定类中查找符合给定的方法 名称、方法类型，并且符合调用权限的方法句柄
        //findVirtual()方法根据参数查找指定的虚方法，根据Java语言的规则，虚方法的第一个参数是隐式的，代表方法的接收者，即this指向的对象，这个参数以前是放在参数列表中进行传递，现在提供了bindTo()方法来完成
        return MethodHandles.lookup().findVirtual(receiver.getClass(),"println",mt).bindTo(receiver);
    }
    public static void main(String...args) throws Throwable {
        Object obj=System.currentTimeMillis()%2==0?System.out:new ClassA();
        //无论obj最终是哪个实现类，下面这行都能正确调用println方法
        getPrintlnMH(obj).invokeExact("icyfenix");
    }
}
```

上述代码的`getPrintlnMH()`方法实际上是模拟了`invokevirtual`指令的执行过程，只是它的分派逻辑并非固化在Class文件的字节码上，而是通过一个由用户设计的方法来实现，且该方法本身的返回值 （`MethodHandle`对象），可以视为对最终调用方法的一个引用。以此，可以通过使用`MethodHandle`就可以做到类似函数指针传参的问题：`void sort(List list, MethodHandle compare) `

`MethodHandle`与反射`Reflection`的区别：

- `Reflection`和`MethodHandle`机制本质上都是在模拟方法调用，但是`Reflection`是在模拟Java代码层次的方法调用，而`MethodHandle`是在模拟字节码层次的方法调用。在`MethodHandles.Lookup`上的3个方法`findStatic()`、`findVirtual()`、`findSpecial()`正是为了对应于`invokestatic`、`invokevirtual`（以及`invokeinterface`）和`invokespecial`这几条字节码指令的执行权限校验行为，而这些底层细节在使用`Reflection`API时是不需要关心的
- `Reflection`中的`java.lang.reflect.Method`对象远比`MethodHandle`机制中的`java.lang.invoke.MethodHandle`对象所包含的信息来得多。前者是方法在Java端的全面映像，包含了方法的签名、描述符以及方法属性表中各种属性的Java端表示方式，还包含执行权限等的运行期信息。而后者仅包含执行该方法的相关信息
- 由于`MethodHandle`是对字节码的方法指令调用的模拟，那理论上虚拟机在这方面做的各种优化（如方法内联），在`MethodHandle`上也应当可以采用类似思路去支持（但目前实现还在继续完善中），而通过反射去调用方法则几乎不可能直接去实施各类调用点优化措施
- `Reflection` API的设计目标是只为Java语言服务的，而`MethodHandle` 则设计为可服务于所有Java虚拟机之上的语言

#### 6.3.4`invokedynamic`指令

- 某种意义上可以说`invokedynamic`指令与`MethodHandle`机制的作用是一样的，都是为了解决原有4 条`invoke*`指令方法分派规则完全固化在虚拟机之中的问题，把如何查找目标方法的决定权从虚拟机转嫁到具体用户代码之中

- 每一处含有`invokedynamic`指令的位置都被称作“动态调用点（Dynamically-Computed Call Site）”，这条指令的第一个参数不再是代表方法符号引用的`CONSTANT_Methodref_info`常量，而是`CONSTANT_InvokeDynamic_info`常量，该常量包含3项信息：
  - 启动方法（Bootstrap Method，该方法存放在新增的BootstrapMethods属性中），启动方法是有固定的参数，并且返回值规定是`java.lang.invoke.CallSite`对象，该对象代表了真正要执行的目标方法调用
  - 方法类型（MethodType）
  - 名称

  虚拟机根据`CONSTANT_InvokeDynamic_info`常量中提供的信息，可以找到并执行启动方法，从而获得一个`CallSite`对象，最终调用到要执行的目标方法上

  `invokedynamic`指令示例：

  ![image-20210331193205121](/static/img/image-20210331193205121.png)

  - `2: invokedynamic #123, 0 // InvokeDynamic #0:testMethod:(Ljava/lang/String;)V` 该行可以看到`invokedynamic`指令后的第一个参数指向常量池中第123项，第二个参数0作为占位符

  - 常量池中第123项常量显示`#123=InvokeDynamic#0：#121`，说明它是一项`CONSTANT_InvokeDynamic_info`类型常量，第一个项`#0`代表启动方法取`Bootstrap Methods`属性 

    表的第0项，而后面的`#121`代表指向常量池中第121项常量，其类型为`CONSTANT_NameAndType_info`，从该常量中可以获取到方法名称和描述符，即`testMethod:(Ljava/lang/String;)V`

#### 6.3.5实战：掌控方法分派规则

在JDK 7以前，`super`关键字可以很方便地调用到父类中的方法，但是如果要访问祖父类的方法就没有办法实现了：因为在子孙类的方法中根本无法获取到一个实际类型是祖父类的对象引用（但是可以通过`super`获取父类的对象引用），而`invokevirtual`指令的分派逻辑是固定的，只能按照方法接收者的实际类型进行分派

在JDK 7之后拥有了`invokedynamic`和`java.lang.invoke`包，就可以直接解决该问题

```java
package site.potatoblog.ee;

import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.reflect.Field;

class GrandFather{
    void thinking(){
        System.out.println("i am grandfather");
    }
}
class Father extends GrandFather{
    @Override
    void thinking(){
        System.out.println("i am father");
    }
}

class Son extends Father {
    @Override
    void thinking() {
        try {
            MethodType mt = MethodType.methodType(void.class);
            Field lookupImpl = MethodHandles.Lookup.class.getDeclaredField("IMPL_LOOKUP");
            lookupImpl.setAccessible(true);
            MethodHandle mh = ((MethodHandles.Lookup) lookupImpl.get(null)).findSpecial(GrandFather.class, "thinking", mt, GrandFather.class);
            mh.invoke(this);
        } catch (Throwable e) {
        }
    }
}
public class DispatchTest {
    public static void main(String... args) {
        new Son().thinking();
    }
}
```

### 6.4基于栈的字节码解释执行引擎

许多Java虚拟机的执行引擎在执行Java代码的时候都有解释执行（通过解释器执行）和编译执行（通过即时编译器产生本地代码执行）两种选择

#### 6.4.1解释执行

大部分的程序代码转换成物理机的目标代码或虚拟机能执行的指令集之前，都需要经过下图的各个步骤，其中中间那条分支，就是解释执行的过程

![image-20210331203635939](/static/img/image-20210331203635939.png)

在Java语言中，Java程序的编译就是半独立的实现：Javac编译器完成了程序代码经过词法分析、语法分析到抽象语法树，再遍历语法树生成线性的字节码指令流的过程，这一部分动作是在虚拟机之外进行，而解释器在虚拟机的内部

#### 6.4.2基于栈的指令集与基于寄存器的指令集

Javac编译器输出的字节码指令流，基本上是一种基于栈的指令集架构，这里的栈指的就是操作数栈，字节码指令流中的指令大部分都是零地址指令，它们依赖操作数栈进行工作。与之相对的另外一套常用的指令集架构是基于寄存器的指令集，最典型的就是x86的二地址指令集，这些指令依赖寄存器工作

使用这两种指令计算1+1的结果：

- 基于栈的指令集

  ```java
  iconst_1
  iconst_1
  iadd
  istore_0
  ```

  两条`iconst_1`指令连续把两个常量1压入栈后，`iadd`指令把栈顶的两个值出栈、相加，然后把结果放回栈顶，最后`istore_0`把栈顶的值放到局部变量表的第0个变量槽中。这种指令流中的指令通常都是不带参数的，使用操作数栈中的数据作为指令的运算输入，指令的运算结果也存储在操作数栈之中

- 基于寄存器的指令集

  ```c++
  mov eax, 1
  add eax, 1
  ```

  `mov`指令把EAX寄存器的值设为1，然后add指令再把这个值加1，结果就保存在EAX寄存器里。这种指令流中的指令都包含两个单独的输入参数，依赖于寄存器来访问和存储数据

#### 6.4.3基于栈的解释器执行过程

示例：

```java
package site.potatoblog.ee;

public class calc {
    public static int test(){
        int a=100;
        int b=200;
        int c=300;
        return (a+b)+c;
    }
    public static void main(String...args){
        calc.test();
    }
}
```

上述代码中`test()`方法的字节码如下

![image-20210331205503331](/static/img/image-20210331205503331.png)

`stack=2, locals=3,  args_size=0`表示这个方法需要深度为2的操作数栈和3个变量槽的局部变量空间，以及0个参数

字节码执行过程：

- 首先，执行偏移地址为0的指令，`bipush`指令的作用是将单字节的整型常量值（-128～127）推入操作数栈，跟随有一个参数，指明推送的常量值100
- 执行偏移地址为2的指令，`istore_0`指令的作用是将操作数栈的整型值出栈并存放到第0个局部变量槽中。后续4条指令（直到偏移到第11条指令）都是做一样的事情，对应代码中把变量a、b、c赋值为100、200、300
- 执行偏移地址为11的指令，`iload_0`指令的作用是把局部变量表第0个变量槽中的整型值复制到操作数栈顶
- 执行偏移地址为12的指令，`iload_1`指令的执行过程与`iload_0`类似，把第1个变量槽的整型值入栈
- 执行偏移地址为13的指令，iadd指令的作用是将操作数栈中头两个栈顶元素出栈，做整型加法，然后把结果重新入栈。在iadd指令执行完毕后，栈中原有的100和200被出栈，它们的和300被重新入栈
- 执行偏移地址为14的指令，`iload_2`指令把存放在第2个局部变量槽中的300入栈到操作数栈中。这时操作数栈为两个整数300。下一条指令`iadd`同上
- 最后，执行偏移地址为16的指令，`ireturn`指令是方法返回指令之一，它将结束方法执行并将操作数栈顶的整型值返回给该方法的调用者

## 7.类加载及执行子系统的案例与实战

### 7.1案例分析

#### 7.1.1Tomcat：正统的类加载器

一个功能健全的Web服务器需要解决以下这些问题：

- 部署在同一个服务器上的两个Web应用程序所使用的Java类库可以实现互相隔离。两个不同的应用程序可能会依赖同一个第三方类库的不同版本，不能要求每个类库在一个服务器中只能有一个份，服务器应当能保证两个独立的应用程序的类库可以相互独立使用
-  部署在同一个服务器上的两个Web应用程序所使用的Java类库可以互相共享。例如，用户可能有10个使用Spring组织的应用程序部署在同一台服务器上，如果把10份Spring分别存放在各个应用程序的隔离目录中，将会是很大的资源浪费——类库在使用时都要被加载到服务器内存，如果类库不能共享，虚拟机的方法区就会很容易出现过度膨胀的风险
- 服务器需要尽可能保证自身的安全不受部署的Web应用程序影响。Web服务器许多都是用Java实现的，服务器本身也有类库依赖的问题，所以服务器所使用的类库与应用程序的类库互相独立
- 支持JSP应用的Web服务器，大部分都需要支持热替换功能

对于上述问题，在部署Web应用时，单独的一个ClassPath就不能满足需求了，所以各种Web服务器都提供了好几个有着不同含义的ClassPath路径供用户存放第三方类库，其中Tomcat服务器目录结构如下：

- 放置在/common目录中。类库可以被Tomcat和所有的Web应用程序共同使用
- 放置在/server目录中。类库可以被Tomcat使用，对所有的Web应用程序都不可见
- 放置在/shared目录中。类库可以被所有的Web应用程序共同使用，但对Tomcat自己不可见
- 放置在/WebApp/WEB-INF目录中。类库仅仅可以被该Web应用程序使用，对Tomcat和其他Web应用程序不可见

Tomcat服务器为支持这套目录结构，并对目录里的类库进行加载和隔离，自定义了多个类加载器，这些类加载器按经典的双亲委派模型来实现，其关系图如下：

![image-20210401100712826](/static/img/image-20210401100712826.png)

- Common类加载器

  用于加载/common/*中的类库。由双亲委派模型可得，Common类加载器所加载的类，都可以被Catalina类加载器和Shared类加载器使用

- Catalina类加载器

  也叫Server加载器，用于加载/server/*中的类库。由双亲委派模型可得，Catalina类加载器所加载的类只供自己使用，且与Shared类加载器加载的类相互隔离

- Shared类加载器

  用于加载/shared/*中的类库。由双亲委派模型得，Shared类加载器加载的类可供WebApp类加载器使用

- WebApp类加载器

  用于加载/WebApp/WEB-INF/*中的类库。由双亲委派模型模型得，各个WebApp类加载器实例之间是相互隔离的，但他们都能使用Shared类加载器加载的类

- Jsp类加载器

  加载范围仅仅是这个JSP文件所编译出来的那一个Class文件，它存在的目的就是被丢弃：当服务器检测到JSP文件被修改时，会替换掉目前的JasperLoader的实例，并通过再建立一个新的JSP类加载器来实现JSP文件的功能

上述是Tomcat 6以前是它默认的类加载器结构，在Tomcat 6及之后的版本简化了默认的目录结构，只有指定了tomcat/conf/catalina.properties配置文件的server.loader和share.loader项后才会真正建立Catalina类加载器和Shared类加载器的实例，否则会用到这两个类加载器的地方都会用Common类加载器的实例代替，而默认的配置文件中并没有设置这两个loader项，所以Tomcat 6之后也顺理成章地把/common、/server和/shared这3个目录默认合并到一起变成1个/lib目录，这个目录里的类库相当于以前/common目录中类库的作用

#### 7.1.2OSGi：灵活的类加载器架构

OSGi中的每个模块（称为Bundle）与普通的Java类库区别并不太大，两者一般都以JAR格式进行封装。在OSGI中，Bunle之间的依赖关系从传统的上层模块依赖底层模块转变为平级模块之间的额依赖而且类库的可见性能得到非常精确的控制

OSGi能实现模块级的热插拔，即当程序更新或调试出错时，可以只停用、重新安装然后启用程序到的其中一部分。OSGi拥有这些功能，必须要归功于其灵活的类加载器架构：OSGi类加载器之间只有规则，没有固定的委派关系

OSGi类加载时可能进行的查找规则如下：

- 以java.*开头的类，委派给父类加载器加载。
- 否则，委派列表名单内的类，委派给父类加载器加载。·否则，Import列表中的类（依赖的Package），委派给Export（发布的Package）这个类的Bundle的类加载器加载。

- 否则，查找当前Bundle的Classpath，使用自己的类加载器加载。

- 否则，查找是否在自己的Fragment Bundle中，如果是则委派给Fragment Bundle的类加载器加载。

- 否则，查找Dynamic Import列表的Bundle，委派给对应Bundle的类加载器加载。

- 否则，类查找失败

假设，存在Bundle A、Bundle B、BundleC3个模块，并且这3个Bundle定义的依赖关系如下所示：

- Bundle A：声明发布了packageA，依赖了java.*的包； 

- Bundle B：声明依赖了packageA和packageC，同时也依赖了java.*的包； 

- Bundle C：声明发布了packageC，依赖了packageA

那么这3个Bundle之间的类加载器及父类加载器之间的关系如下：

![image-20210401103232469](/static/img/image-20210401103232469.png)

#### 7.1.3字节码生成技术与动态代理的实现

使用到字节码生成的例子很多，比如Javac和字节码类库（比如CGLib）Web服务器中的JSP编译器，编译时织入的AOP框架，还有很常用的动态代理技术，甚至在使用反射的时候虚拟机都有可能会在运行时生成字节码来提高执行速度

动态代理示例

```java
package site.potatoblog.ee;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class DynamicProxyTest {
    interface IHello{
        void hello();
    }
    static class Hello implements IHello{

        @Override
        public void hello() {
            System.out.println("hello world");
        }
    }
    static class DynamicProxy implements InvocationHandler{
        Object originalObj;
        Object bind(Object originalObj){
            this.originalObj=originalObj;
            return Proxy.newProxyInstance(originalObj.getClass().getClassLoader(),originalObj.getClass().getInterfaces(),this);
        }
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("welcome");
            return method.invoke(originalObj,args);
        }
    }
    public static void main(String...args){
        IHello hello= (IHello) new DynamicProxy().bind(new Hello());
        hello.hello();
    }
}/*output
welcome
hello world
*/
```

调用`Proxy.newProxyInstance()`方法。虚拟机会在运行时动态生成$Proxy0.class字节码，它为传入接口中的每一个方法，以及从`Object`类中继承来的`equals()`、`hashCode()`、`toString()`方法都生成了对应的实现，并且统一调用了`InvocationHandler`对象的`invoke()`方法来实现这些方法的内容，各个方法的区别不过是传入的参数和Method对象有所不同而已，所以无论调用动态代理的哪一个方法，实际上都是在执行`InvocationHandler::invoke()`中的代理逻辑

$Proxy0.class字节码大致生产过其实就是根据Class文件格式的规范去拼装字节码

## 8.前端编译与优化

Java中的编译期可能是指一个前端编译器把`*.java`文件转变为`*.class`文件的过程

### 8.1Javac编译器

Javac编译器本身就是由Java语言编写，从Javac代码的总体结构来看，编译过程大致可以分为1一个准备过程和3个处理过程

- 准备过程：初始化插入式注解处理器
- 解析与填充符号表过程，包括：
  - 词法、语法分析。将源码的字符流转变为标记集合，构造出抽象语法树
  - 填充符号表。产生符号地址和符号信息
- 插入式注解处理器的注解处理过程：插入式注解处理器的执行阶段
- 分析与字节码生成过程，包括：
  - 标注检查。对语法的静态信息进行检查
  - 数据流及控制分析。对程序动态运行过程进行检查
  - 解语法糖。将简化代码编写的语法糖还原为原有的形式
  - 字节码生成。将前面各个步骤所生成的信息转化为字节码

上述3个处理过程里，执行插入注解时又可能会产生新的符号，如果有新的符号产生，就必须转回到之前的解析、填充符号表的过程中重新处理这些符号

![image-20210402012311112](/static/img/image-20210402012311112.png)

#### 8.1.1解析与填充符号表

- 词法、语法分析

  - 词法分析

    将源代码的字符流转变为标记集合的过程，单个字符是程序编写时的最小元素，但标记才是编译时的最小元素。关键字、变量名、字面量、运算符都可以作为标记，如`int a=b+2`这句代码中就包含了6个标记，分别是`int`、`a`、`=`、`b`、`+`、`2`，虽然关键字`int`由3个字符构成，但是它只是一个独立的标记，不可以再拆分

  - 语法分析

    根据标记序列构造抽象语法树的过程，抽象语法树是一种用来描述程序代码语法结构 树形表示方式，抽象语法树的每一个节点都代表着程序代码中的一个语法结构，例如包、类型、修饰符、运算符、接口、返回值甚至连代码注释等都可以是一种特定的语法结构

- 填充符号表

  完成了语法分析和词法分析之后，下一个阶段是对符号表进行填充的过程。符号表是由一组符号地址和符号信息构成的数据结构

#### 8.1.2注解处理器

JDK 5之后，Java语言提供了对注解的支持，注解在设计上原本是与普通的Java代码一样，都只会在程序运行期间发挥作用的，但在JDK 6中，提出了一组被称为“插入式注解处理器”的标准API，可以提前至编译期对代码中特定注解进行处理，从而影响到前端编译器的工作过程

插入式注解处理器允许读取、修改、添加抽象语法树中的任意元素，如果其在处理注解期间对语法树进行过修改，编译器将回到解析及填充符号表的过程重新处理，直到所有插入式注解处理器都没有再对语法树进行修改为止

#### 8.1.3语义分析与字节码生成

经过语法分析后，编译器能获得程序代码的抽象语法树表示，其能保证源程序的结构正确，但无法保证源程序的语义是符合逻辑。语义分析的主要任务则是对结构上正确的源程序进行上下文相关性质的检查，譬如进行类型检查、控制流检查、数据流检查，等等。比如：

```java
int a=1;
boolean b=false;
char c=2;
//后续可能出现以下三种赋值运算，只有第一种是正确的，剩下两种都不符合语义正确
int d=a+c;
int d=b+c;
char d=a+c;
```

编码时经常能在IDE中看到由红线标注的错误提示，其中绝大部分都是来源于语义分析阶段的检查结果

语义分析过程可分为：

- 标注检查

  检查的内容包括诸如变量使用前是否已被声明、变量与赋值之间的数据类型是否能够匹配等等，上述例子就属于标注检查的处理范畴。在标注检查中还会进行一个常量折叠的代码优化，比如`int a = 1 + 2;`，则在抽象语法树上仍然能看到字面量“1”“2”和操作符“+”号，但是在经过常量折叠优化之后，它们将会被折叠为字面量“3”

- 数据及控制流分析

  对程序上下文逻辑更进一步的验证，它可以检查出诸如程序局部变量在使用前是否有赋值、方法的每条路径是否都有返回值、是否所有的受查异常都被正确处理了等问题

- 解语法糖

  语法糖，即在计算机语言中添加的某种语法，这种语法对语言的编译结果和功能并没有实际影响，但是却能更方便程序员使用该语言。Java中常见的语法糖包括泛型、变长参数、自动装箱和拆箱

- 字节码生成

  字节码生成是Javac编译过程的最后一个阶段，不仅仅是把前面各个步骤所生成的信息（语法树、符号表）转化成字节码指令写到磁盘中，编译器还进行了少量的代码添加和转换工作，比如实例构造器`<init>()`方法和类构造器`<clinit>()`方法就是在该阶段被添加到语法树中

### 8.2Java语法糖的味道

#### 8.2.1泛型

- Java选择的泛型实现方式叫“类型擦除式泛型”，即其泛型只在源码中存在，在编译后的字节码文件中，全部泛型都被替换为原来的裸类型，并在相应的地方插入强制转型代码，因此对于运行期的Java语言来说，`ArrayList<int>`与`ArrayList<String>`其实是同一个类型

- Java中不支持的泛型用法

  ```java
  public class TypeErasureGenerics<E> { 
      public void doSomething(Object item) {
          if (item instanceof E) {
              // 不合法，无法对泛型进行实例判断 ... 
          }
          E newItem = new E(); // 不合法，无法使用泛型创建对象
          E[] itemArray = new E[10]; // 不合法，无法使用泛型创建数组 
      }
  }
  ```

- 在没有泛型的时代，Java中的数组是支持协变的，对应的集合类也可以存入不同类型到的元素

  ```java
  Object[] array = new String[10];
  array[0] = 10; // 编译期不会有问题，运行时会报错 
  ArrayList things = new ArrayList(); 
  things.add(Integer.valueOf(10)); //编译、运行时都不会报错
  things.add("hello world");
  ```

  为了保证这些编译出来的Class文件可以在JDK 5引入泛型之后继续运行，Java选择直接把已有的类型泛型化，即让所有需要泛型化的已有类型都原地泛型化，不添加任何平行于已有类型的泛型版，比如`ArrayList`，原地泛型化后变成了`ArrayList<T>`

- 类型擦除

  为了保证以前直接用用`ArrayList`的代码在泛型新版本里必须还能继续用这同一个容器，这就必须让所有泛型化的实例类型，譬如`ArrayList<Integer>`、`ArrayList<String>`这些全部自动成为`ArrayList`的子类型才能可以，否则类型转化就是不安全。由此就引出了“裸类型”的概念，裸类型应被视为所有该类型泛型化实例的共同父类型

  ```java
  package fc;
  
  import java.util.ArrayList;
  
  public class GenericTest {
      ArrayList<Integer> ilist=new ArrayList<>();
      ArrayList<String> slist=new ArrayList<>();
      ArrayList list;
      GenericTest(){
          //裸类型list应当被视为所有该类型泛型化实例的共同父类型
          //只有这样，以下赋值才能被视为是安全的，被系统允许的从子类到父类的安全转型
          list=ilist;
          list=slist;
      }
  }
  ```

- 如何实现裸类型

  Java直接在编译时把`ArrayList<Integer>`还原回`ArrayList`，只在元素访问、修改时自动插入一些强制类型转换和检查指令

  - 泛型擦除前

    ```java
    public static void main(String[] args) { 
        Map<String, String> map = new HashMap<String, String>();
        map.put("hello", "你好"); 
        map.put("how are you?", "吃了没？"); 
        System.out.println(map.get("hello"));
        System.out.println(map.get("how are you?")); 
    }
    ```

  - 泛型擦除后

    ```java
    public static void main(String[] args) {
        Map map = new HashMap(); 
        map.put("hello", "你好"); 
        map.put("how are you?", "吃了没？"); 
        System.out.println((String) map.get("hello"));
        System.out.println((String) map.get("how are you?"));
    }
    ```

- 泛型擦除的缺陷

  - 无法泛型化为基本数据类型

    一旦把泛型信息擦除后，到要插入强制类型转换代码的地方就没办法往下做了，因为基本数据类型`int`、`long`等与`Object`之间是不能强制转型的

    Java通过采用基本数据类型的包装类和自动装箱、拆箱机制，来实现泛型化基本数据类型

  - 运行期无法获取到泛型类信息

    ```java
    public static <T> T[] convert(List<T> list,Class<T> componentType){
        //由于泛型在运行期已经被擦除，所以需要额外传入一个Class对象来表示List对应的类型
        T[] arr= (T[]) Array.newInstance(componentType,list.size());
        return arr;
    }
    ```

  - 泛型与重载

    由于泛型会在运行期被擦除为裸类型，可能会导致方法重载出问题

    示例1：以下代码无法编译，因为参数`List<Integer>`和`List<String>`编译之后都被擦除了，变成了同一种的裸类型`List`，类型擦除导致这两个方法的特征签名变得一模一样

    ```java
    public class GenericTypes {
        public static void method(List<String> list) {
            System.out.println("invoke method(List<String> list)");
        }
        public static void method(List<Integer> list) { 
            System.out.println("invoke method(List<Integer> list)"); 
        }
    }
    ```

    示例2：以下两个代码可以运行，并不是因为方法重载成功，重载并不是根据返回值来确定，实际上在Class文件格式中，即使两个方法有相同的名称和特征签名，但返回值不同，那它们也是可以合法地共存于一个Class文件中的

    ```java
    public class GenericTypes { 
        public static String method(List<String> list) {
            System.out.println("invoke method(List<String> list)"); 
            return ""; 
        }
        public static int method(List<Integer> list) { 
            System.out.println("invoke method(List<Integer> list)"); 
            return 1; 
        }
        public static void main(String[] args) {
            method(new ArrayList<String>()); 
            method(new ArrayList<Integer>()); 
        }
    ```

#### 8.2.2自动装箱、拆箱与遍历循环

自动装箱、拆箱、遍历循环与可变长参数编译前：

```java
public static void main(String...args){
    List<Integer> list= Arrays.asList(1,2,3,4);
    int sum=0;
    for(int i:list){
        sum+=i;
    }
    System.out.println(sum);
}
```

自动装箱、拆箱、遍历循环与可变长参数编译后：

```java
public static void main(String[] args) {
    List list = Arrays.asList(new Integer[] {
        Integer.valueOf(1), 
        Integer.valueOf(2), 
        Integer.valueOf(3), 
        Integer.valueOf(4) 
    });
    int sum = 0;

   for (Iterator localIterator = list.iterator(); localIterator.hasNext(); ) { 
       int i = ((Integer)localIterator.next()).intValue();
       sum += i; 
   }

    System.out.println(sum);
}
```

 由上述例子可以看出：

- 自动装箱、拆箱在编译之后被转化成了对应的包装和还原方法，即`Integer.valueOf()`与`Integer.intValue()`方法

  - 自动装箱的陷阱

    ```java
    public static void main(String...args){
        Integer a = 1;
        Integer b = 2;
        Integer c = 3;
        Integer d = 3;
        Integer e = 321;
        Integer f = 321;
        Long g = 3L
        //Integer类有一个缓存数组存储[-128,127],如果包装类表示的数在此范围内，就返回数组中对应数的内存地址，如果不在，就会重新开辟一个内存空间存储该数
        System.out.println(c == d);
        //e、f超过了127的范围，所以会重新开辟内存来存储，所以两者引用的内存地址不一致
        System.out.println(e == f);
        //包装类的==在遇到算数运算时才会自动拆箱，拆箱后进行的就是基本数据类型值的比较
        System.out.println(c == (a + b));
        System.out.println(c.equals(a + b));
        System.out.println(g == (a + b));
        System.out.println(g.equals(a + b));//equals不处理数据转型，包装类默认的equals方法会先instanceof进行类型判断，然后通过==比较基本类型的数值
    }/*output
    true
    false
    true
    true
    true
    false
    */
    ```

- 遍历循环在编译之后把代码还原成了迭代器的实现，这就是为什么遍历循环需要遍历到的类实现`Iterable`接口的原因

- 可变长参数在编译之后会还原为一个数组类型的参数

#### 8.2.3条件编译

Java语言实现条件编译：使用条件为常量的`if`语句

```java
public static void main(String...args){
    if(true){
        System.out.println("block 1");
    }else {
        System.out.println("block 2");
    }
}
```

上述代码编译后Class文件的反编译结果：

```java
public static void main(String... args) {
    System.out.println("block 1");
}
```

Java中的条件编译也是一个语法糖，根据布尔常量的真假，编译器会把分支不成立代码块消除掉，该工作将在编译器解语法糖阶段完成

