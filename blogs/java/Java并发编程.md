---
title: Java并发编程
date: 2019-05-01
categories:
- Java
tags:
- Java并发
---

## 1.并发编程线程基础

### 1.1什么是线程

进程是系统进行资源分配和调度的基本单位，而线程是进程的一个实体，其本身是不会独立存在的。线程也是CPU分配的基本单位，操作系统在分配资源时是把资源分配给进程的，但是真正要占用CPU运行的是线程，所以CPU资源实际上是分配到线程的

在Java中，启动一个类的主函数（`main()`函数）时其实就启动了一个JVM进程，而`main()`函数所在的线程就是该进程中的一个线程，即主线程

进程和线程的关系：一个进程中有多个线程，多个线程共享进程的堆和方法区资源，但是每个线程都有自己的程序计数器和栈区域

![image-20210421220639106](/static/img/image-20210421220639106.png)

### 1.2线程创建与运行

Java中有三种线程创建方式

- 继承`Thread`类并重写`run`的方法

  ```java
  package base;
  
  public class ThreadTest {
      //继承Thread类并重写run方法
      public static class MyThread extends Thread{
          @Override
          public void run() {
              System.out.println("My Thread run");
          }
      }
      public static void main(String...args){
          //通过new创建线程对象，此时线程并未开始执行，处于就绪状态
          MyThread thread=new MyThread();
          //通过线程对象的start方法启动线程，会自动执行线程中的run方法
          //实际上调用start方法后线程并非马上执行，其也是处于就绪状态，即该线程已经获取了除CPU资源外的其他资源，一旦该线程获取到CPU资源，则立马执行run方法
          //一旦run方法执行完毕，线程就处于终止状态
          thread.start();
      }
  }
  ```

  好处：可以在`run()`方法中直接使用`this`获取当前正在运行的线程，而不需要使用`Thread.currentThread()`方法

  坏处：Java不支持多继承，所以该线程类无法再继承其他类，并且任务与线程的概念并没有抽离，该种创建线程的方式表现出线程就是任务的印象，而非线程驱动任务

- 实现`Runnable`接口

  ```java
  package base;
  
  public class ThreadTest {
      public static class RunnableTask implements Runnable{
          @Override
          public void run() {
              System.out.println("My Runable run");
          }
      }
      public static void main(String...args){
          RunnableTask runnableTask=new RunnableTask();
          //在创建Thread对象时可以向其构造参数中传入一个Runnable对象，以表示该线程要执行的任务
          //尽管此处没有一个引用指向了Thread对象，但是垃圾回收时不会回收它们
          //因为每个Thread都注册了它自己，并且在它的任务退出其run()并死亡前，垃圾回收器都无法清除它
          new Thread(runnableTask).start();
          new Thread(runnableTask).start();
          new Thread(runnableTask).start();
      }
  }
  ```

  好处：实现`Runnable`接口相比继承`Thread`类并重写`run`的方法的方式来说，其将任务与线程的概念剥离，并实现线程驱动任务，而且`Runnable`被设计为接口形式，使得实现它的类更易扩展

  坏处：无法执行有返回值的任务

- 使用`FutureTask`

  ```java
  package base;
  
  import java.util.concurrent.Callable;
  import java.util.concurrent.FutureTask;
  
  public class ThreadTest {
      public static class CallerTask implements Callable<String>{
          @Override
          public String call() throws Exception {
              return "My CallerTask";
          }
      }
      public static void main(String...args){
          //FutureTask对象创建时需要接收一个Callable对象
          FutureTask<String> futureTask=new FutureTask<>(new CallerTask());
          //在创建Thread对象时可以向其构造参数中传入一个FutureTask对象，以表示该线程要执行的任务
          //线程启动后会执行传入FutureTask对象中的Callable对象的call方法
          new Thread(futureTask).start();
          try {
              //通过调用FutureTask对象的get方法可以获取到该任务执行后的返回值
              //get方法会阻塞当前调用该方法的线程（即主线程），直到任务执行完毕并返回结果
              String result=futureTask.get();
              System.out.println(result);
          }catch (Exception e){
              e.printStackTrace();
          }
      }
  }
  ```

  与实现`Runnable`接口相比，使用`FutureTask`能够获取到任务执行完后的返回值，而实现`Runnable`接口的任务则不行

### 1.3线程通知与等待

Java中的`Object`类是所有类的父类，因此Java将所有类都需要的方法都放到了`Object`类中，即通知与等待的系列方法

- `wait()`方法

  当一个线程调用一个共享对象的`wait()`方法，该调用线程会被阻塞挂起，直到发生以下事件之一才返回：

  - 其他线程调用了该共享对象的`notify()`或者`notifyAll()`方法
  - 其他线程调用了该线程的`interrupt()`方法，该线程抛出`InterruptedException`异常返回

  **注意**：如果调用`wait()`方法的线程未事先获取该对象的监视器锁，则该线程会抛出`IllegalMonitorStateException` 异常

  一个线程如何获取一个共享对象的监视器锁：

  - 执行`synchronized`同步代码块，使用该共享对象作为参数

    ```java
    synchronized (共享对象){
        //dosomething
    }
    ```

  - 调用共享对象的方法，并且该方法使用了`synchronized`修饰

    ```java
    synchronized void add(int a){
        //dosomething
    }
    ```

  虚假唤醒：一个线程可以从挂起状态转变为可以运行状态（被唤醒），即使该线程没有被其他线程调用`notify()`、`notifyAll()`方法进行通知或者被中断，或者等待超时

  为了防止虚假唤醒，在判断一个线程被唤醒的条件是否满足时，应该采用`while`循环而非`if`条件判断

  ```java
  package base;
  import java.util.LinkedList;
  import java.util.List;
  import java.util.Queue;
  
  public class WaitTest {
      public final LinkedList<String> queue=new LinkedList<>();
      public static final int MAX_SIZE=10;
      //生产者任务
      public class Producer implements Runnable{
          @Override
          public void run() {
              //为共享对象queue加锁，当一个线程首先获取到了该对象的锁，那么后续其他要获取锁的进程都会被阻塞挂起
              synchronized (queue){
                  //当队列满，则挂起生产者线程
                  //此处使用while循环而不用if循环，是为了防止虚假唤醒
                  //如果是使用if循环，假设当前队列再增加一个元素就满容量，那么当前线程会被虚假唤醒
                  //线程被唤醒需要重新获得锁，再等待获取锁的期间，有可能其他生产者线程往队列添加了一个元素导致队列满容量
                  //那么当前线程在获取到锁后，就会直接向下执行，而非像while循环那样重新测试唤醒条件，此时该线程往队列中添加元素，则会抛出异常
                  while (queue.size()==MAX_SIZE){
                      try {
                          //wait()方法会挂起当前线程，并释放通过同步块获取的queue上的锁，以便其他线程获取锁
                          //当线程被唤醒时需要重新获取锁
                          queue.wait();
                      }catch (Exception e){
                          e.printStackTrace();
                      }
                  }
                  System.out.println("生产者生成了一个元素");
                  //添加一个元素
                  queue.addLast("");
                  //唤醒消费者线程
                  queue.notifyAll();
              }
          }
      }
      public class Consumer implements Runnable{
          @Override
          public void run() {
              synchronized (queue){
                  while (queue.size()==0){
                      try{
                          queue.wait();
                      }catch (Exception e){
                          e.printStackTrace();
                      }
                  }
                  System.out.println("消费者消费了一个元素");
                  //移除一个元素
                  queue.removeFirst();
                  //唤醒生产者线程
                  queue.notifyAll();
              }
          }
  
      }
      public static void main(String...args){
          WaitTest waitTest=new WaitTest();
          Runnable producer=waitTest.new Producer();
          Runnable counsumer=waitTest.new Consumer();
          for(int i=0;i<5;i++){
              new Thread(producer).start();
          }
          for(int i=0;i<5;i++){
              new Thread(counsumer).start();
          }
      }
  }
  ```

- `wait(long timeout)`方法

  如果一个线程调用共享对象的该方法挂起后 没有在指定的`timeout`毫秒内被其他线程调用该共享变量的`notify()` 或者`notifyAll()` 方法唤醒，那么该函数还是会因为超时而返回。如果`timeout`为0，则和`wait()`方法效果相同，`wait()`方法便是如此实现的；如果`timeout`为负则抛出异常

- `wait(long timeout,int nanos)`方法

  其内部调用的是`wait(long timeout)`方法

  ```java
      public final void wait(long timeoutMillis, int nanos) throws InterruptedException {
          //当传入的timeoutMillis为负，则抛出异常
          if (timeoutMillis < 0) {
              throw new IllegalArgumentException("timeoutMillis value is negative");
          }
  		//如果nanos为负或溢出，则抛出异常
          if (nanos < 0 || nanos > 999999) {
              throw new IllegalArgumentException(
                                  "nanosecond timeout value out of range");
          }
  		//如果nanos大于0且没有溢出，那么传入timeoutMillis加1
          if (nanos > 0 && timeoutMillis < Long.MAX_VALUE) {
              timeoutMillis++;
          }
  		//令调用该方法的线程挂起，等待timeoutMillis毫秒后返回
          wait(timeoutMillis);
      }
  ```

- `notify()`方法

  一个线程调用共享对象的`notify()`方法会随机唤醒一个在该共享变量上调用`wait`系列方法后被挂起的线程

  被唤醒的线程并不能马上从`wait`方法返回并继续执行，它必须重新获取到共享对象的监视器锁后才可以返回

  和`wait`方法类似，只有当前线程获取到了共享对象的监视器锁后，才可以调用共享对象的`notify()`方法

- `notifyAll()`方法

  `notifyAll()`方法会唤醒所有在该共享变量上调用`wait`系列方法后被挂起的线程

### 1.4等待线程执行终止的`join`方法

若当前线程需要等待其他线程执行完毕后再进行后续操作，则可以在当前线程调用其他线程的`join()`方法，那么当前线程就会被阻塞，直到这些线程执行完毕后才会返回当前线程

因为`join()`方法而被阻塞的线程，当其他线程调用此线程的`interrupt()`方法中断线程，那么此线程会抛出`InterruptedException` 异常而返回

```java
package base;

public class JoinTest {
    public static void main(String ...args) throws InterruptedException {
        //获取主线程
        Thread mainThread=Thread.currentThread();
        //设置线程t1无限循环
        Thread t1=new Thread(new Runnable() {
            @Override
            public void run() {
                while (true){

                }
            }
        });
        Thread t2=new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    //休眠1s
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                //中断主线程
                mainThread.interrupt();
            }
        });
        //启动线程t1
        t1.start();
        //启动线程t2
        t2.start();
        //主线程等待t1执行完毕
        //由于t1无限循环，所以主线程会一直阻塞，直到t2线程中断主线程后，主线程才会返回，并抛出异常
        t1.join();
    }
}
```

### 1.5让线程睡眠的`sleep`方法

`Thread`类有一个静态的`sleep`方法，调用该方法的线程会进入睡眠状态，即调用线程会暂时让出指定时间的执行权，也就是这期间该线程不参与CPU调度，**但是该线程所持有的监视器资源是不会让出的**

若其他线程调用了睡眠状态的线程的`interrupt()`方法中断该线程，那么该线程会在调用`sleep`方法的地方抛出`InterruptedException` 异常而返回

### 1.6让出CPU执行权的`yield`方法

`Thread`类有一个静态的`yield`方法，调用该方法的线程会让出CPU使用权，然后处于就绪状态，线程调度器会从线程就绪队列中获取一个线程优先级最高的线程，当然也有可能调度到刚刚让出CPU的那个线程来获取CPU执行权

### 1.7线程中断

Java的线程中断是一种线程间的协作模式，通过设置线程的中断标志并不能直接终止该线程的执行，而是被中断线程根据中断状态自行处理

- `void interrupt()`方法

  中断线程，例如线程A运行时，线程B可以调用线程A的`interrupt()`方法来设置A的中断标志位为`true`并立即返回，但是线程实际并没有被中断，它还会继续往下执行，只是其中断标志位被设置了。如果线程A调用了`wait`系列方法、`join`方法或者`sleep`方法而被阻塞挂起，这时候若线程B调用线程A的`interrupt()`方法，那么线程A会在调用这些方法的地方抛出`InterruptedException` 异常而返回

- `boolean isInterrupted()`方法

  返回当前线程的中断标志位，但不清除中断标志位

  ```java
  public boolean isInterrupted() {    
      //该方法内部是调用了重载方法isInterrupted，并传入false表示不清除中断标志位  
      return isInterrupted(false);
  }
  ```

- `boolean interrupted()`方法

  该方法是Thread类的静态方法，返回当前正在运行线程的中断标志位，然后清除其中断标志位为`false`

  ```java
  public static boolean interrupted() {   
      //该方法内部是调用了当前正在运行线程的isInterrupted方法，并传入true表示清除中断标志位  
      return currentThread().isInterrupted(true);
  }
  ```

可以通过中断标志位来判断一个线程是否终止

```java
package base;public class InterruptTest {   
    public static void main(String...args) throws InterruptedException {  
        Thread t=new Thread(new Runnable() {           
            @Override          
            public void run() {       
                //通过判断当前线程是否被中断，来决定该线程是否终止    
                while(!Thread.currentThread().isInterrupted()){    
                    System.out.println(Thread.currentThread()+"hello");
                }           
            }       
        });       
        t.start();  
        Thread.sleep(1000);      
        System.out.println("main thread interrupt t");     
        //中断线程t     
        t.interrupt();       
        t.join();        
        System.out.println("main is over"); 
    }
}
```

### 1.8理解线程上下文切换

在多线程编程中，线程个数一般都大于CPU个数，所以CPU通过时间片轮转法，为每一个线程分配一个时间片，当前线程会在时间片内占用CPU执行任务，直至执行一个时间片后会切换到下一个线程执行任务。但是，在切换前会保存上一个线程执行任务的状态，以便下次切换回这个任务时，可以再加载这个任务的状态。所以任务从保存到再加载的过程就是一次上下文切换

线程上下文切换的时机有：当前线程的CPU时间片使用完处于就绪状态时、当前线程被其他线程中断

### 1.9线程死锁

线程死锁产生必须具备四个条件

- 互斥条件

  某个资源同时只由一个线程占用，若此时还有其他线程请求获取该资源，则请求这只能等待，直至占有资源的线程释放该资源

- 请求并持有条件

  一个线程已经持有了至少一个资源，但又提出了新的资源请求，而新资源已被其他线程占有，所以当前线程会被阻塞，但阻塞的同时并不释放自己以获取的资源

- 不可剥夺条件

  线程获取到的资源在自己使用完之前不能被其他线程抢占，只有在自己使用完毕后才由自己释放该资源

- 环路等待条件

  在发生死锁时，必然存在一个线程——资源的环形链，即线程集合{T0 ,T1, T2 ,…,Tn}中T0正在等待一个T1占用的资源，T1正在等待T2占用的资源，……Tn正在等待T0占用的资源 

```java
package base;
public class DeadLockTest {   
    private static Object resourceA=new Object();
    private static Object resourceB=new Object(); 
    public static void main(String...args){      
        Thread threadA=new Thread(new Runnable() {     
            @Override            
            public void run() {            
    //互斥和不可抢占条件，resourceA是互斥资源，并且该资源无法被其他线程抢占  
                synchronized (resourceA){    
                    System.out.println(Thread.currentThread()+"get ResourceA");  
                    try{                      
                        //等待线程B获取resourceB     
                        Thread.sleep(1000);          
                    } catch (InterruptedException e) {    
                        e.printStackTrace();      
                    }	
                    System.out.println(Thread.currentThread()+"waiting get ResourceB");		    
                    //请求并持有条件，持有resourceA的同时请求resourceB，而此时resourceB已经被其他线程占有                 
                    synchronized (resourceB){  
                        System.out.println(Thread.currentThread()+"get ResourceB");               
                    }          
                }         
            }      
        });    
        Thread threadB=new Thread(new Runnable() {
            @Override            
            public void run() { 
                //互斥和不可抢占条件，resourceB是互斥资源，并且该资源无法被其他线程抢占    
                synchronized (resourceB) {   
                    System.out.println(Thread.currentThread() + "get ResourceB");                    
                    try {             
                        ////等待线程A获取resourceA     
                        Thread.sleep(1000);         
                    } catch (InterruptedException e) {  
                        e.printStackTrace();  
                    }                 
                    System.out.println(Thread.currentThread() + "waiting get Resource A");         
                    //请求并持有条件，持有resourceB的同时请求resourceA，而此时resourceA已经被其他线程占有            
                    synchronized (resourceA) { 
                        System.out.println(Thread.currentThread() + "get ResourceA");                  
                    }            
                }           
            }   
        });        
        threadA.start();   
        threadB.start();     
        //最终形成环路等待条件，线程A持有resourceA请求并等待线程B占有的resourceB，线程B持有resourceB请求并等待线程A占有的resourceA   
    }
}/*output
Thread[Thread-0,5,main]get ResourceA
Thread[Thread-1,5,main]get ResourceB
Thread[Thread-1,5,main]waiting get Resource A
Thread[Thread-0,5,main]waiting get ResourceB
*/
```

### 1.10守护线程与用户线程

Java中的线程分为两类，分别为daemon线程（守护线程）和user线程（用户线程）。JVM启动时会调用main方法，main方法所在的线程就是一个用户线程，而JVM内部启动的垃圾回收线程就是守护线程

用户线程和守护线程的区别：当最后一个用户线程结束时，JVM会正常退出，不管当前是否有守护线程，即守护线程是否结束并不影响JVM的退出

```java
package base;
public class DameonTest {  
    public static void main(String...args){  
        //守护线程无限循环       
        Thread dameonThread=new Thread(new Runnable() {    
            @Override        
            public void run() {   
                while (true){     
                }            
            }        
        });      
        //用户线程 
        Thread userThread=new Thread(new Runnable() {   
            @Override           
            public void run() {    
                try {            
                    //用户线程等待1s    
                    Thread.sleep(1000);  
                } catch (InterruptedException e) { 
                    e.printStackTrace();         
                }           
            }     
        });  
        //通过Thead对象的setDaemon方法，传入true，即可将该Thread对象设置为守护线程
        dameonThread.setDaemon(true);      
        //启动守护线程       
        dameonThread.start();   
        //启动用户线程，所有用户线程结束后，JVM会启动一个叫DestroyJavaVM的线程来终止JVM进程 
        userThread.start();  
    }
}
```

### 1.11ThreadLocal

`ThreadLocal`提供了线程的本地变量，每个线程都可以通过`set()`和`get()`方法来对这个本地变量进行操作，但不会和其他线程的本地变量进行冲突，**实现了线程的数据隔离**

多线程环境下，共享变量和线程的关系如下：

![image-20210422191727060](/static/img/image-20210422191727060.png)

而使用了`ThreadLocal`后，每个线程都会拥有自己的一份资源1，当每个线程操作资源1时，实际操作的是线程自己内部存储的该资源1的副本

![image-20210422191823487](/static/img/image-20210422191823487.png)

#### 1.11.1ThreadLocal使用示例

```java
package base;
public class ThreadLocalTest {    
    //创建一个ThreadLocal对象    
    static ThreadLocal<String> localVariable=new ThreadLocal<>();    
    static void print(String str){       
        //通过调用ThreadLocal对象的get方法可以获取一个与当前线程绑定的本地变量  
        System.out.println(str+":"+localVariable.get());      
        //ThreadLocal对象的remove方法会解除当前线程所绑定的本地变量   
        //若该注释移除，那么之后调用get方法，会获得null       
        //localVariable.remove();   
    }    
    public static void main(String...args){     
        Thread threadOne=new Thread(new Runnable() {   
            @Override          
            public void run() {  
                //ThreadLocal对象的set方法可以将一个本地变量与当前线程绑定 
                localVariable.set("threadOne local variable");       
                print("threadOne");            
                System.out.println("threadOne remove after"+":"+localVariable.get());            
            }   
        });       
        Thread threadTwo =new Thread(new Runnable() {  
            @Override           
            public void run() {   
                localVariable.set("threadTwo local variable");
                print("threadTwo"); 
                System.out.println("threadTwo remove after"+":"+localVariable.get());       
            }       
        });       
        threadOne.start(); 
        threadTwo.start();    
    }
}/*output
threadTwo:threadTwo local variable
threadOne:threadOne local variable
threadOne remove after:threadOne local variable
threadTwo remove after:threadTwo local variable
*/
```

#### 1.11.2ThreadLocal的实现原理

ThreadLocal相关类的类图结构：

![image-20210422220608521](/static/img/image-20210422220608521.png)

由图可知，`Thread`类有一个`threadLocals`和一个`inheritableThreadLocals`成员变量，这两个成员变量都是`ThreadLocalMap`（是`ThreadLocal`类的一个嵌套类）类型，其本质是一个定制化的`HashMap`，`threadLocals`变量之所以被设计为map结构，是因为每个线程可以关联多个`ThreadLocal`对象，其键是`ThreadLocal`对象，值为`Object`对象

默认情况下，`Thread`类的`threadLocals`和`inheritableThreadLocals`成员变量都为`null`，只有当前线程第一次调用`ThreadLocal`的`set`或者`get`方法时，才会创建它们

实际上，每个线程自己的本地变量并非存放在`ThreadLocal`实例中，而是存放在调用线程的`threadLoals`成员变量里面，`ThreadLocal`仅仅只是一个工具类，它通过`set`方法把`value`值存入当前调用线程的`threadLocals`成员变量，当调用线程调用它的`get`方法时，再从当前线程的`threadLocals`成员变量里取出

- `set`方法源码

  ```java
  public void set(T value) {   
      //获取当前线程    
      Thread t = Thread.currentThread(); 
      //获取当前线程的threadLocals成员变量   
      ThreadLocalMap map = getMap(t); 
      if (map != null) {      
          //如果threadLocals不为空，以自身（ThreadLocal对象）为键，传入的value（线程自己的本地变量）为值保存在threadLocals中     
          map.set(this, value);  
      } else {   
          //否则，即threadLocals为空，初始化当前线程的threadLocals成员变量
          createMap(t, value);   
      }
  }
  //初始化当前线程的threadLocals成员变量
  void createMap(Thread t, T firstValue) {  
      t.threadLocals = new ThreadLocalMap(this, firstValue);
  }
  ```

- `get`方法源码

  ```java
  public T get() {    
      //获取当前线程   
      Thread t = Thread.currentThread();  
      //获取当前线程的threadLocals成员变量   
      ThreadLocalMap map = getMap(t);    
      if (map != null) {       
          //如果threadLocals不为空，以自身为键传入getEntry方法获取对应的键值对 
          ThreadLocalMap.Entry e = map.getEntry(this);       
          if (e != null) { 
              //如果获取到的键值对不为空，那么就返回键对应的值，即与线程绑定的本地变量  
              @SuppressWarnings("unchecked")      
              T result = (T)e.value;   
              return result;        
          }   
      }    //如果threadLocals为空则初始化当前线程的threadLocals成员变量  
      return setInitialValue();
  }
  //获取线程的threadLocals成员变量
  ThreadLocalMap getMap(Thread t) {   
      return t.threadLocals;
  }
  //初始化当前线程的threadLocals成员变量
  private T setInitialValue() {
      //initialValue()方法返回null，即默认初始值为null
      T value = initialValue();   
      Thread t = Thread.currentThread();  
      ThreadLocalMap map = getMap(t);   
      if (map != null) {      
          //如果当前线程的threadLocals变量不为空，那么以自身为键，null为值保存    
          map.set(this, value);    
      } else {      
          //否则就创建一个ThreadLocalMap对象，以自身为键，以null为值，并赋值给当前线程的threadLocals变量   
          createMap(t, value);
      }   
      if (this instanceof TerminatingThreadLocal) {  
          TerminatingThreadLocal.register((TerminatingThreadLocal<?>) this); 
      }    
      return value;
  }
  ```

- `remove`方法源码

  ```java
  public void remove() {    
      //获取当前线程的threadLocals成员变量 
      ThreadLocalMap m = getMap(Thread.currentThread());  
      if (m != null) {       
          //如果threadLocals不为空，那么删除与自身相匹配的键      
          m.remove(this);  
      }
  }
  ```

#### 1.11.3ThreadLocal不支持继承性

同一个`ThreadLocal`对象在父线程中被设值，其子线程是无法通过`get`方法获取到的，从源码中可知，`set`方法是将值保存在当前线程`threadLocals`成员变量中，而子线程的`get`方法也只能获取到自己保存在`threadLocals`成员变量中的值

```java
package base;public class ThreadLocalTest {   
    static ThreadLocal<String> localVariable = new ThreadLocal<>();   
    public static void main(String... args) {   
        //此处保存将值保存在了main线程的中的threadLocals  
        localVariable.set("hello world");      
        Thread thread = new Thread(new Runnable() { 
            @Override           
            public void run() {      
                //子线程未在自己的threadLocals中保存过值，所以无法通过get方法获取 
                System.out.println("thread:" + localVariable.get());            
            }       
        });     
        thread.start();    
        System.out.println("main:" + localVariable.get());   
    }
}/*output
main:hello worldthread:null
*/                                               /
```

#### 1.11.4InheritableThreadLocal类

`InheritableThreadLocal`类的出现就是为了让子线程可以访问在父线程中设置的本地变量，其继承自`ThreadLocal`类

`InheritableThreadLocal`类实现原理的玄机在`Thread`类的私有构造器中

```java
private Thread(ThreadGroup g, Runnable target, String name,    
               long stackSize, AccessControlContext acc,     
               boolean inheritThreadLocals) {    
    	...  
        //获取当前构造该Thread对象的线程，即父线程   
        Thread parent = currentThread();    
    	...                        
        if (inheritThreadLocals && parent.inheritableThreadLocals != null)
            //如果传入的inheritThreadLocals为true并且父线程的inheritableThreadLocals成员变量不为空        
            //就将父线程的inheritableThreadLocals成员变量中的键和值来构造该Thread对象的inheritableThreadLocals成员变量       
            this.inheritableThreadLocals = ThreadLocal.createInheritedMap(parent.inheritableThreadLocals); 
    	...
}
//以父线程的inheritableThreadLocals成员变量中的键和值来构造一个ThreadLocalMap对象static
ThreadLocalMap createInheritedMap(ThreadLocalMap parentMap) {   
    return new ThreadLocalMap(parentMap);
}
```

使用示例：

```java
package base;
public class ThreadLocalTest {   
    static ThreadLocal<String> localVariable = new ThreadLocal<>();   
    public static void main(String... args) {   
        //此处保存将值保存在了main线程的中的threadLocals  
        localVariable.set("hello world");       
        Thread thread = new Thread(new Runnable() {   
            @Override           
            public void run() {           
                //子线程未在自己的threadLocals中保存过值，所以无法通过get方法获取   
                System.out.println("thread:" + localVariable.get());  
            }       
        });    
        thread.start();     
        System.out.println("main:" + localVariable.get());    
    }
}
/*output
main:hello worldthread:hello world
*/    
```

## 2.Java并发编程的其他基础知识

### 2.1Java中的线程安全问题

线程安全问题，即当多个线程同时读写一个共享资源并且没有任何同步措施，导致出现脏数据或者其他不可预见的结果的问题

线程安全问题出现的时机：多个线程只是读取共享资源，而不去修改，不会出现线程安全问题，而当至少一个线程修改共享资源时，有可能会出现线程安全问题

线程安全问题案例——计数器类的实现：计数变量count是一个共享变量，多个线程可以对其进行递增操作，如果不使用同步措施，由于递增操作是非原子操作，其总共分为获取—计算—保存三个步骤，因此会导致计数不准确

|       | t1                        | t2                        | t3                    | t4         |
| ----- | ------------------------- | ------------------------- | --------------------- | ---------- |
| 线程A | 从内存读取count值到本线程 | 递增本线程count的值       | 写回主内存            |            |
| 线程B |                           | 从内存读取count值到本线程 | 递增本线程的count的值 | 写回主内存 |

假如当前count=0，t1时刻线程A读取主内存中count值到本地变量countA，然后t2时刻递增countA的值为1，同时线程B读取主内存中count的值0（因为线程A对count值的修改还没写回主内存）到本地变量countB，在t3时刻线程A才把countA的值1写回主内存，至此线程A计数完毕，同时线程B递增CountB的值为1，在t4时刻线程B把countB的值1写回主内存，至此线程B一次计数完毕。最终count的值为1，虽然count经过两次递增，最后结果却和递增一次的相同，这就是线程安全问题所带来的

### 2.2Java中共享变量的内存可见性问题

Java的内存模型规定，所有变量都存放在主内存中，当线程使用变量时，会把主内存里面的变量复制到线程自己的工作内存，线程读写变量时操作的是自己工作内存中的变量。Java的内存模型抽象概念图如下：

![image-20210424084205764](/static/img/image-20210424084205764.png)

实际中，为了加快变量的读写速度，会设计多级缓存的架构。在一个双核CPU系统架构，每个核都有自己的控制器（包含一组寄存器和操作控制器）和运算器，并且每个核都自己的一级缓存，在有些架构里还有可能有一个所有CPU都共享的二级缓存。Java内存模型中的工作内存，就对应这里的L1或者L2缓存或者CPU的寄存器。实际的线程工作内存如下图：

![image-20210424085735869](/static/img/image-20210424085735869.png)

导致共享变量内存不可见的原因分析：

假如采用上图的CPU处理架构，线程A、B使用不同CPU，同时处理一个共享变量，并且当前两级Cache都为空

- 线程A首先获取共享变量X的值，由于两级Cache都没有命中，所以加载主内存中X的值，假如为0。然后把X=0的值缓存到两级缓存中，线程A修改X的值为1，然后将其写入两级缓存Cache，并且刷新到主内存。线程A操作完毕后，线程A所在的CPU的两级Cache内和主内存里面的X的值都为1
- 线程B获取X的值，首先自己的一级缓存没有命中，然后看二级缓存，二级缓存命中了，所以返回X=1；然后线程B修改X的值为2，并将其存放到线程B所在的一级Cache和二级共享Cache中，最后更新主内存中X的值为2
- 当线程A想要再次修改X的值，此时线程A所在一级缓存命中，返回X=1，此时问题出现了，线程B明明修改了X的值为2，但是A获取的值却还是1，即线程B对共享变量的修改对于线程A是不可见的

### 2.3Java中的原子性操作

所谓的原子性操作，是指执行一系列操作时，这些操作要么去全部执行，要么全部不执行，不存在只执行一部分的情况。Java中的自增操作就不是一个原子性操作

```java
package base;
public class ThreadNotSafeCount {   
    private Long value;  
    public Long getCount(){   
        return value; 
    }    
    public void inc(){  
        ++value;   
    }
}
```

使用javap -c命令查看会自增的汇编代码，可以发现`++value`操作由2、8、9、13四步组成

![image-20210424093530267](/static/img/image-20210424093530267.png)

- 第2步：获取当前value的值并放入操作数栈顶
- 第8步：将常量1放入操作数栈顶
- 第9步：将栈顶的前两个数相加并把结果放回栈顶
- 第13步：将栈顶的结果赋给value变量

### 2.4Java中的CAS操作

Java中的线程是与操作系统的原生线程一一对应，所以当阻塞一个线程时，需要从用户态切换到内核态执行阻塞操作，这是非常耗时的操作。尽管使用锁能在并发处理中同步各个线程，但是当一个线程没有获取到锁时就会被阻塞挂起，这会导致线程上下文切换和重新调度的开销。Java提供了非阻塞的`volatile`关键字，但是其只能保证共享变量的内存可见性，不能解决读—改—写等原子性问题

CAS即Compare And Swap，其是JDK提供的非阻塞原子性操作，它通过硬件保证了比较—更新操作的原子性。JDK里的`Unsafe`类提供了一系列的`compareAndSwap*`方法，比如如下方法：

- `boolean compareAndSwapLong(Object o,long offset,long expected,long x)`：compareAndSwap即比较并交换，CAS有四个操作数，分别为：对象的内存位置，对象中的变量的偏移量、变量预期值和新的值。其操作含义是，**如果对象o中内存偏移量为offset的变量值为expected，则使用新的值x替换旧的值expected**。这是处理器提供的一个原子性指令

CAS的ABA问题：假设线程A使用CAS修改初始值为A的变量X，那么线程A会首先去获取当前变量X的值（A），然后使用CAS操作尝试修改X的值为B，如果在执行CAS前，线程B使用CAS修改了变量X的值为B，然后又使用CAS修改了变量X的值为A。那么此时，当线程A执行CAS时，虽然X的值是A，但这个A已经不是原先线程A获取的A了

CAS的ABA问题解决：JDK中的`AtomicStampedReference`类为每个变量的状态值都配备了一个时间戳（即类似版本号），每次修改时更改版本号，即可解决ABA问题

### 2.5伪共享

为了解决计算机系统中主内存和CPU之间运行速度差问题，会在CPU与主内存之间添加一级或者多级高速缓冲存储器（Cache），如下图是一个两级Cache结构：

![image-20210424104808923](/static/img/image-20210424104808923.png)

Cache内部是按行存储的，其中每一行称为一个Cache行。Cache行是Cache与主内存进行数据交换的单位，Cache行的大小一般为2的幂次数字节

![image-20210424104926994](/static/img/image-20210424104926994.png)

- 什么是伪共享

  当CPU访问某个变量时，首先会去看CPU Cache内是否有该变量，如果有则直接从中获取，否则去主内存中获取该变量，然后把该变量所在的内存区域的一个Cache行大小的内存复制到Cache中。注意，**存放到Cache行的是内存块而不是单个变量，所以可能会把多个变量存放到一个Cache行中**。当多个线程同时修改一个缓存行中的多个变量，由于同时只能有一个线程操作缓存行，所以相比将每个变量放到一个缓存行中，性能会有所下降，这就是伪共享

- 为什么会出现伪共享

  伪共享的产生是因为多个变量被放入了一个缓存行中，并且多个线程同时去写入缓存行中不同的变量。比如：

  ```java
  //假设缓存行的大小为32字节，而long类型数据为8字节，当CPU访问变量a时，会发现该变量没有在缓存中，就会去主内存把变量a以及内存地址附件的b、c、d放入缓存行
  long a;long b;long c;long d;
  ```

- 如何避免伪共享

  - 字节填充

    JDK8之前通过字节填充的方式，即创建一个变量时使用填充字段填充该变量所在的缓存和

    ```java
    //假设缓存行为64字节
    public final static FilledLong{    
        //value变量的占用8字节  
        public volatile long value=0L; 
        //往FilledLong类里填充6个long类型的变量，每个占用8字节，总共48字节
        //再加上类对象的对象头占用8字节  
        //一个FilledLong对象总共合起来刚好占用64字节，正好放入一个缓存行 
        public long p1,p2,p3,p4,p5,p6;}
    ```
  
  - 使用注解
  
    JDK8提供了一个`sun.misc.Contended`注解，以解决伪共享问题。默认情况下，`@Contended`注解只用于Java核心类，比如rt包下的类，如果要在用户路径下使用这个注解，则需要添加JVM参数：`-XX:-RestrictContended`，填充的宽度默认为128，要自定义宽度可以设置-`XX:ContendedPadddingWidth`参数
  
    ```java
    @sun.misc.Contended
    public final static FilledLong{ 
        public volatile long value=0L;
    }
    ```

### 2.6锁的概述

#### 2.6.1乐观锁与悲观锁

- 悲观锁

  指对数据被外界修改持保守态度，认为数据很容易就会被其他线程修改，所以在数据处理前先对数据进行加锁，并在整个数据处理过程中，使数据处于锁定状态

- 乐观锁

  认为数据在一般情况下不会造成冲突，所以在访问记录前不会加排他锁，而是在进行数据提交更新时，才会正式对数据冲突与否进行检测（CAS就是一种乐观锁）

#### 2.6.2公平锁与非公平锁

根据线程获取锁的抢占机制，锁可以分为：

- 公平锁

  表示线程获取锁的顺序是按照线程请求锁的时间早晚来决定

- 非公平锁

  运行时闯入，不存在先来后到的顺序

`ReetrantLock`类提供了公平和非公平锁的实现，默认情况下，`ReetrantLock`类构造的是非公平锁，因为公平锁会带来性能开销

#### 2.6.3独占锁与共享锁

根据锁只能被单个线程持有还是多个线程共同持有，可以分为：

- 独占锁：

  这是一种悲观锁，保证任何时候都只有一个线程能得到锁，`ReetrantLock`就是一种独占锁

- 共享锁

  这是一种乐观锁，它放宽了加锁的条件，允许多个线程同时进行读操作，`ReadWriteLock`读写锁就是一个共享锁，它允许一个资源可以被多线程同时进行读操作

#### 2.6.4可重入锁

一个已经获取锁的线程，可以再次获取当前锁，这个锁即可重入锁。Java内置的锁`synchronized`关键字就是一个可重入锁

#### 2.6.5自旋锁

自旋锁，即当前线程在获取锁时，如果发现锁已经被其他线程占有，它不会马上阻塞自己，在不放弃CPU使用权的情况下，多次尝试获取（默认次数是10，可使用`-XX:PreBlockSpinsh`参数设置该值），很有可能在后面几次尝试中其他线程已经释放了锁。如果尝试指定次数后仍没有获取到锁则当前线程才会被阻塞挂起

## 3.JUC包中ThreadLocalRandom类原理剖析

### 3.1Random类及其局限性

新的随机数生成需要两个步骤：

- 首先根据老的种子生成新的种子
- 然后根据新的种子来计算新的随机数

单线程情况下每次调用`nextInt`方法都是根据老的种子计算出新的种子，这种情况下是可以保证随机数产生的随机性。但是在多线程情况下，多个线程可能拿到同一个老的种子去计算新的种子，这会导致多个线程产生相同的随机值，这是不允许的，因此必须保证由老种子计算出新种子的这一步骤，必须是原子性的，为解决这一问题，`Random`类内部采用自旋重试+CAS操作保证这一步骤的原子性

```java
package tlr;import java.util.Random;
public class RandomTest {   
    public static void main(String[] args) { 
        //（1）构建Random对象时，不传参则创建一个默认种子的随机数生成器，否则创建一个指定种子的随机数生成器      
        Random random=new Random();  
        for(int i=0;i<10;++i){   
            //（2）输出0-5之间的随机数   
            System.out.println(random.nextInt(5));   
        }  
    }
}

//nextInt源码
public int nextInt(int bound) {  
    //（3）参数检查    
    if (bound <= 0)    
        throw new IllegalArgumentException(BadBound);	
    //（4）根据老的种子生成新的种子  
    int r = next(31);    
    //（5）以下代码是根据新的种子计算随机数  
    int m = bound - 1;    
    if ((bound & m) == 0)  // i.e., bound is a power of 2  
        r = (int)((bound * (long)r) >> 31);
    else {  
        for (int u = r;    
             u - (r = u % bound) + m < 0;      
             u = next(31))        
            ;  
    }    
    return r;
}
//next源码，该方法使用老种子生成新种子，并且保证这步骤是原子性的
//多线程下可能多个线程执行到了代码（6），那么多个线程拿到的当前种子的值是同一个，因此计算出的新种子也是一样的
//代码（8）的CAS操作会保证只有一个线程可以更新老的种子为新的种子，而失败的线程会通过循环重新获取更新后的种子作为当前种子去计算老的种子
protected int next(int bits) {  
    long oldseed, nextseed; 
    AtomicLong seed = this.seed;  
    do {   
        //（6）获取当前原子变量种子的值     
        oldseed = seed.get();      
        //（7）根据当前种子值计算新的种子  
        nextseed = (oldseed * multiplier + addend) & mask;
        //（8）使用CAS操作，它使用新种子去更新老种子   
    } while (!seed.compareAndSet(oldseed, nextseed)); 
    return (int)(nextseed >>> (48 - bits));
}
```

尽管`Random`类内部的通过CAS操作+自旋重试解决了多线程下会获取相同种子的问题，但是会造成大量线程进行自旋重试，这会降低并发性能

### 3.2ThreadLocalRandom

JDK 7在JUC包下新增了`ThreadLocalRandom`类，以弥补多线程高并发下`Random`类的缺陷。`ThreadLocalRandom`类的实现原理与`ThreadLocal`类类似，它让每个线程都维护一个自己的种子变量，这样每个线程生成随机数时都根据自己的老种子来生成新种子，再由新种子计算随机数，这样也就解除了原本`Random`类中多个线程使用同一个种子变量，而导致对该种子更新的竞争

多线程下使用`Random`类：

![image-20210424154940936](/static/img/image-20210424154940936.png)

多线程下使用`ThreadLocalRandom`类：

![image-20210424154958343](/static/img/image-20210424154958343.png)

### 3.3源码分析

`ThreadLocalRandom`的类图结构如下：

![image-20210424155037073](/static/img/image-20210424155037073.png)

由图可知，`ThreadLocalRandom`类继承了`Random`类并重写了`nextInt`方法，但是并没有使用继承自`Random`类中的原子性种子变量，因为具体的种子是存放在具体的调用线程的`threadLocalRandomSeed`成员变量中。与`ThreadLocal`类类似，`ThreadLocalRandom`只是一个工具类：

- 当线程调用`ThreadLocalRandom`的`current`方法时，`ThreadLocalRandom`负责初始化调用线程的`threadLocalRandomSeed`成员变量，即初始化种子
- 当调用`ThreadLocalRandom`的`nextInt`方法，实际上是获取当前线程的`threadLocalRandomSeeed`成员变量作为当前种子来生成新的种子，然后更新新的种子到当前线程的`threadLocalRandomSeeed`成员变量，而后再更根据新种子计算随机数。由于`threadLocalRandomSeeed`是线程级别的变量，在多线程中不存在竞争情况，所以不需要使用原子性变量

`ThreadLocalRandom`的主要代码实现逻辑：

- `Unsafe`机制

  ```java
  //获取Unsafe实例
  private static final Unsafe U = Unsafe.getUnsafe();
  //获取Thread类里threadLocalRandomSeed成员变量在Thread实例中的偏移量
  private static final long SEED = U.objectFieldOffset
      (Thread.class, "threadLocalRandomSeed");
  //获取Thread类里threadLocalRandomProbe成员变量在Thread实例中的偏移量
  private static final long PROBE = U.objectFieldOffset       
      (Thread.class, "threadLocalRandomProbe");
  //获取Thread类里threadLocalRandomSecondarySeed成员变量在Thread实例中的偏移量
  private static final long SECONDARY = U.objectFieldOffset    
      (Thread.class, "threadLocalRandomSecondarySeed");
  ```

- `current()`方法

  ```java
  //current方法是静态方法，所以多个线程调用该方法，返回的都是同一个ThreadLocalRandom实例
  public static ThreadLocalRandom current() { 
      //Unsafe类的getInt方法，用于获取一个对象中某个整型的成员变量的值，第一个参数为该成员变量所在的对象，第二个参数为该成员变量在该对象中偏移量  
      //获取当前线程的threadLocalRandomProbe成员变量的值    
      if (U.getInt(Thread.currentThread(), PROBE) == 0)  
          //如果当前线程的threadLocalRandomProbe成员变量的值为0（默认情况下线程的这个变量值为0），则说明当前线程是第一次调用current方法   
          //那么调用localInit方法计算当前线程的初始化种子变量    
          localInit();  
      //返回ThreadLocalRandom类的成员变量instance，其类型也是ThreadLocalRandom
      return instance;
  }
  //localInit()方法源码
  static final void localInit() {  
      //probeGenerator是一个原子性整型变量，此处计算当前线程中threadLocalRandomProbe的初始值 
      int p = probeGenerator.addAndGet(PROBE_INCREMENT);   
      //令线程的threadLocalRandomProbe在初始化后不为0   
      int probe = (p == 0) ? 1 : p;  
      //seeder是一个原子性long型变量，此处根据seeder计算当前线程的初始化种子
      long seed = mix64(seeder.getAndAdd(SEEDER_INCREMENT)); 
      //获取当前线程   
      Thread t = Thread.currentThread();  
      //将初始化化过的种子设置到当前线程   
      U.putLong(t, SEED, seed);   
      //将初始化过的threadLocalRandomProbe设置到当前线程 
      U.putInt(t, PROBE, probe);
  }
  ```

- `int nextInt(bound)`方法

  ```java
  public int nextInt(int bound) { 
      //参数校验   
      if (bound <= 0)   
          throw new IllegalArgumentException(BAD_BOUND);
      //根据当前线程中的种子计算新种子    
      int r = mix32(nextSeed());  
      //以下代码，根据新种子和bound计算随机数  
      int m = bound - 1;  
      if ((bound & m) == 0) // power of two      
          r &= m;   
      else { // reject over-represented candidates  
          for (int u = r >>> 1;     
               u + m - (r = u % bound) < 0;   
               u = mix32(nextSeed()) >>> 1)   
              ;   
      }   
      return r;
  }
  
  //nextSeed方法源码
  final long nextSeed() {  
      Thread t; long r; // read and update per-thread seed
      //该方法将生成的新种子放入当前线程的threadLocalRandomSeed成员变量中 
      U.putLong(t = Thread.currentThread(), SEED,  
                //U.getLong(t, SEED)获取当前线程中的threadLocalRandomSeed成员变量，然后再加上GAMMA值作为新种子
                r = U.getLong(t, SEED) + GAMMA);java       
          return r;
  }
  ```

## 4.JUC中原子操作类原理剖析

JUC包提供了一系列的原子性操作类，这些类都是使用非阻塞算法CAS实现的，相比使用锁实现原子性操作这在性能上有很大提高

### 4.1原子变量操作类

JUC并发包中包含有`AtomicInteger`、`AtomicLong`和`AtomicBoolean`等原子性操作类，它们原理类似，接下来以`AtomicLong`类为例。`AtomicLong`类是原子性递增或递减类，其内部使用`Unsafe`类来实现

```java
public class AtomicLong extends Number implements java.io.Serializable { 
    private static final long serialVersionUID = 1927816293512124184L;    
    //判断JVM是否支持Long类型无锁CAS   
    static final boolean VM_SUPPORTS_LONG_CAS = VMSupportsCS8();  
    private static native boolean VMSupportsCS8();	 
    //获取Unsafe实例   
    private static final jdk.internal.misc.Unsafe U = jdk.internal.misc.Unsafe.getUnsafe(); 
    //获取AtomicLong类里的value成员变量在AtomicLong实例中的偏移量 
    private static final long VALUE = U.objectFieldOffset(AtomicLong.class, "value");	
    //实际AtomicLong类实例保存的变量值   
    private volatile long value;	
    public AtomicLong(long initialValue) { 
        value = initialValue;    
    }    
    ...
}
```

`AtomicLong`类中的主要方法：

- 递增和递减相关方法

  ```java
  //调用Unsafe类的方法，原子性设置value值为原始值+1，返回值为原始值
  public final long getAndIncrement() { 
      return U.getAndAddLong(this, VALUE, 1L);
  }
  //调用Unsafe类的方法，原子性设置value值为原始值-1，返回值为原始值
  public final long getAndDecrement() {  
      return U.getAndAddLong(this, VALUE, -1L);
  }
  //调用Unsafe类的方法，原子性设置value值为原始值+1，返回值为递增后的值
  public final long incrementAndGet() {  
      return U.getAndAddLong(this, VALUE, 1L) + 1L;
  }
  //调用Unsafe类的方法，原子性设置value值为原始值-1，返回值为递减后的值
  public final long decrementAndGet() {  
      return U.getAndAddLong(this, VALUE, -1L) - 1L;
  }
  ```

  上述方法都是通过`Unsafe`类的`getAndAddLong`方法来实现的，以下是`getAndAddLong`方法的源码：

  ```java
  //通过自旋重试+CAS操作来保证操作更新的原子性
  public final long getAndAddLong(Object o, long offset, long delta) {   
      long v;   
      //多线程下，CAS操作失败的线程会循环重新获取当前值，然后再次进行CAS操作 
      do {      
          //获取当前对象o中偏移量为offset的成员变量的值   
          v = getLongVolatile(o, offset); 
          //CAS操作，原子性的更新该值    
      } while (!weakCompareAndSetLong(o, offset, v, v + delta)java); 
      return v;
  }
  ```

- `boolean compareAndSet(long expectedValue, long newValue)`方法

  ```java
  //当AtomicLong类中的原子变量value的值等于expectedValue，则使用newValue更新该value值，成功则返回true，否则返回false
  public final boolean compareAndSet(long expectedValue, long newValue) { 
      //其内部调用了Unsafe类的compareAndSetLong方法  
      return U.compareAndSetLong(this, VALUE, expectedValue, newValue);
  }
  ```

多线程下使用`AtomicLong`类统计0的个数与非原子操作类统计0的个数对比示例：

```java
package base;import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
public class Atomic { 
    //使用基本数据类型，在多线程下自增，很可能会造成最后数据的不准确   
    private static int i=0;   
    private static AtomicLong atomicLong=new AtomicLong();  
    private static Integer[] arrayOne=new Integer[]{0,1,2,3,0,5,6,0,56,0}; 
    private static Integer[] arrayTwo=new Integer[]{10,1,2,3,0,5,6,0,56,0};
    public static void main(String[] args) throws InterruptedException {   
        Thread threadOne=new Thread(new Runnable() {    
            @Override       
            public void run() {   
                int size=arrayOne.length;
                for (Integer integer : arrayOne) { 
                    if (integer == 0) {     
                        atomicLong.incrementAndGet(); 
                        i++;                   
                    }                
                }          
            }      
        }); 
        Thread threadTwo=new Thread(new Runnable() { 
            @Override           
            public void run() {    
                int size=arrayTwo.length;     
                for (Integer integer : arrayTwo) { 
                    if (integer == 0) {          
                        atomicLong.incrementAndGet(); 
                        i++;                   
                    }               
                }           
            }       
        });    
        threadOne.start();   
        threadTwo.start();  
        threadOne.join();    
        threadTwo.join();   
        System.out.println("atomic count 0:"+atomicLong.get());
        System.out.println("non-atomic count 0:"+i);   
    }
}/*output
atomic count 0:7
non-atomic count 0:6
*/
```

### 4.2JDK 8新增的原子操作类LongAdder

####  4.2.1LongAdder简单介绍

尽管`AtomicLong`类通过CAS提供了非阻塞的原子性操作，相比使用阻塞算法的同步器来说它的性能已经很好了，但是在高并发下大量线程会同时去竞争更新同一个原子变量，但是只有一个线程的CAS操作会成功，这就造成了大量线程竞争失败后，会通过无限循环不断进行自旋重试CAS操作，这会白白浪费CPU资源

因此JDK 8新增了一个原子性递增或者递减类`LongAdder`类用来克服在高并发下使用`AtomicLong`类的缺点，`AtomicLong`类的性能瓶颈是由于过多线程同时去竞争一个变量的更新而产生到的，所以`LongAdder`类的解决办法如下：将一个变量分解为多个变量，让同样多的线程去竞争多个资源

使用`AtomicLong`类，是多个线程同时竞争同一个原子变量：

![image-20210424204536402](/static/img/image-20210424204536402.png)

使用`LongAdder`类，是多个线程去争夺同一个原子变量中的多个`Cell`变量：

![image-20210424204708346](/static/img/image-20210424204708346.png)

使用`LongAdder`类：

- 其会在内部维护多个`Cell`变量，每个`Cell`里面有一个初始值为0的long型变量，因此在同等并发量的情况下，争夺单个变量更新操作的线程量会减少
- 多个线程在争夺同一个`Cell`原子变量时如果失败了，它并不会在当前`Cell`变量上一直自旋重试，而是尝试在其他`Cell`变量上进行CAS尝试
- 最后在获取`LongAdder`当前值时，是把所有`Cell`变量的`value`值累加后再加上`base`返回

`LongAdder`类中维护了一个延迟初始化的原子性更新数组（该数组保存的元素都是`Cell`类型的，默认情况下`Cell`数组是`null`）和一个基值变量`base`。之所以采用延迟初始化，是因为`Cell`数组占有内存相对较大，所以仅在需要时创建，即惰性加载

当一开始判断`Cell`数组是`null`并且并发线程较少时，所有的累加操作都是对`base`变量进行的。保持`Cell`数组的大小为2的N次方，在初始化时`Cell`数组中的`Cell`元素个数为2

#### 4.2.2LongAdder源码分析

`LongAdder`的类图结构如下：

![image-20210424212251575](/static/img/image-20210424212251575.png)

由图可知，`LongAdder`类继承自`Striped64`类，在`Striped64`类内部维护着三个变量：

- `base`：基础值，默认为0
- `cells`：是一个原子性数组，`LongAdder`的真实值是`base`值与`Cell`数组中所有`Cell`元素中的`value`值的累加
- `cellsBusy`：用来实现自旋锁，状态值只有0和1，当创建`Cell`元素，扩容`Cell`数组或者初始化`Cell`数组时，都会使用CAS操作该变量来保证同时只有一个线程能进行其中之一的操作

`Cell`类的源码如下：

```java
//由于原子性Cell对象最终都会被放入一个数组，在数组中元素的内存地址是连续的，因此为了避免伪共享，所以使用@Contended注解来对Cell类的对象进行字节填充
@jdk.internal.vm.annotation.Contended static final class Cell {    
    //由于没有对value变量加锁，所以必须使用volatile关键字，保证value变量的内存可见性  
    volatile long value;   
    Cell(long x) {     
        value = x;   
    }    
    //cas方法通过CAS操作，保证当前线程更新时被分配的Cell元素中value值的原子性   
    final boolean cas(long cmp, long val) {  
        return VALUE.compareAndSet(this, cmp, val); 
    }    
    final void reset() {  
        VALUE.setVolatile(this, 0L); 
    }   
    final void reset(long identity) { 
        VALUE.setVolatile(this, identity);
    }   
    final long getAndSet(long val) { 
        return (long)VALUE.getAndSet(this, val); 
    }   
    // VarHandle mechanics  
    private static final VarHandle VALUE;   
    static {       
        try {    
            MethodHandles.Lookup l = MethodHandles.lookup();   
            VALUE = l.findVarHandle(Cell.class, "value", long.class);   
        } catch (ReflectiveOperationException e) {  
            throw new ExceptionInInitializerError(e);  
        }   
    }
}
```

`LongAdder`类的主要方法：

- `long sum()`方法源码

  ```java
  //该方法是线程不安全的，在对所有Cell对象的值进行累加的时候并没有加锁，因此该方法的返回值是不精确的
  public long sum() {   
      Cell[] cs = cells; 
      long sum = base;    
      //如果LongAdder类的成员变量cells数组不为空，则遍历cells数组，并对数组中每个Cell对象的值进行累加，最后再加上base值   
      if (cs != null) {  
          for (Cell c : cs)  
              if (c != null) 
                  sum += c.value;
      }   
      //如果LongAdder类的成员变量cells数组为空，直接返回base值 
      return sum;
  }
  ```

- `void reset()`方法源码

  ```java
  //该方法也是线程不安全的
  public void reset() { 
      Cell[] cs = cells; 
      //base值置0    
      base = 0L;  
      //如果LongAdder类的成员变量cells数组不为空，则遍历cells数组，并把数组中每个Cell对象的值重置为0    
      if (cs != null) {      
          for (Cell c : cs)   
              if (c != null)  
                  c.reset();  
      }
  }
  ```

- `long sumThenReset`方法是`sum`方法的改造版本，其会在累加对应的`Cell`对象的值后，把当前`Cell`对象的值重置为0，`base`值重置为0。这样，当多线程调用该方法时会有问题，比如考虑第一个调用线程清空`Cell`对象的值，则后一个线程调用时累加的都是0值

  ```java
  public long sumThenReset() { 
      Cell[] cs = cells; 
      //获取base值，然后将base的值置0    
      long sum = getAndSetBase(0L);   
      //如果LongAdder类的成员变量cells数组不为空，则遍历cells数组，并对数组中每个Cell对象的值进行累加，然后重置为0，最后再加上base值 
      if (cs != null) {     
          for (Cell c : cs) { 
              if (c != null)     
                  sum += c.getAndSet(0L);   
          }   
      }  
      return sum;
  }
  ```

- `void add(long x)`方法源码

  ```java
  public void add(long x) {   
      Cell[] cs; long b, v; int m; Cell c;
      //条件一：true->表示cells已经初始化过了,当前线程应该将数据写入到cells数组中对应的Cell对象  
      //      false->表示cells未初始化，当前所有线程应该将数据写到base中  
      //条件二：false->表示当前线程使用CAS操作对base值累加成功，    
      //      true->表示发生竞争了，可能需要重试或者扩容 
      if ((cs = cells) != null || !casBase(b = base, b + x)) {
          //什么时候会进来？          
          //1.true->表示cells已经初始化过了,当前线程应该将数据写入到cells数组中对应的Cell对象  
          //2.true->表示发生竞争了，可能需要重试或者扩容             
          //uncontended：true -> 未竞争  false->发生竞争
          boolean uncontended = true;		
          //条件一：true->说明 cells 未初始化，也就是多线程CAS更新base值发生竞争了
          //      false->说明 cells 已经初始化了，当前线程应该是找cells数组中自己对应的Cell对象写值 	
          //条件二：getProbe() 获取当前线程的threadLocalRandomProbe成员变量，未初始化前为0，该成员变量会在longAccumulate方法中初始化，m表示cells数组的最大索引       
          //       true-> 说明当前线程对应下标的Cell对象为空，需要创建 longAccumulate 支持   	
          //       false-> 说明当前线程对应的cell对象不为空，说明下一步想要将x值添加到该Cell对象中 
          //条件三：true->表示CAS失败，意味着当前线程CAS更新该Cell对象有竞争   
          //      false->表示CAS成功        
          if (cs == null || (m = cs.length - 1) < 0 ||   
              (c = cs[getProbe() & m]) == null ||    
              !(uncontended = c.cas(v = c.value, v + x)))   
              //都有哪些情况会调用？           
              //1.true->说明 cells 未初始化，也就是多线程写base发生竞争了[重试|初始化cells]    
              //2.true-> 说明当前线程对应下标的Cell对象为空，需要创建 longAccumulate 支持   
              //3.true->表示CAS失败，意味着当前线程CAS更新该Cell对象有竞争[重试|扩容]     
              longAccumulate(x, null, uncontended);   
      }
  }
  ```

`Striped64`类的`longAccumulate`方法源码

```java
final void longAccumulate(long x, LongBinaryOperator fn,
                          boolean wasUncontended) { 
    int h;  
    //初始化当前线程的threadLocalRandomProbe成员变量   
    if ((h = getProbe()) == 0) {   
        ThreadLocalRandom.current(); 
        // force initialization 
        h = getProbe();       
        //为什么？      
        //因为当前线程的threadLocalRandomProbe成员变量在未初始化前值为0，那么当前线程肯定是将数据写入cells[0]的对应的Cell对象中，因此不当作一次真正的竞争       
        wasUncontended = true;  
    } 
    boolean collide = false;      
    //自旋   
    done: for (;;) { 
    Cell[] cs; Cell c; int n; long v; 
        //表示cells已经初始化了，当前线程应该将数据写入到对应的cell中    
        if ((cs = cells) != null && (n = cs.length) > 0) {  
            //表示当前线程对应的下标位置的Cell对象为null，需要创建new Cell   
            if ((c = cs[(n - 1) & h]) == null) {               
                if (cellsBusy == 0) {    
                    // Try to attach new Cell  
                    Cell r = new Cell(x);   
                    // Optimistically create   
                    if (cellsBusy == 0 && casCellsBusy()) {  
                        try {             
                            // Recheck under lock 
                            Cell[] rs; int m, j;   
                            if ((rs = cells) != null &&   
                                (m = rs.length) > 0 &&
                                rs[j = (m - 1) & h] == null) {  
                                rs[j] = r;                  
                                break done;         
                            }                    
                        } finally {        
                            cellsBusy = 0;   
                        }                
                        continue;    
                        // Slot is now non-empty   
                    }              
                }             
                collide = false;   
            }            
            else if (!wasUncontended)  
                // CAS already known to fail      
                wasUncontended = true;         
            //如果当前Cell对象存在，则执行CAS设置   
            else if (c.cas(v = c.value,            
                           (fn == null) ? v + x : fn.applyAsLong(v, x))) 
                break;           
            //如果当前cells数组元素个数大于CPU个数      
            else if (n >= NCPU || cells != cs)  
                collide = false;          
            // At max size or stale 
            //判断是否有冲突        
            else if (!collide)   
                collide = true;    
            //如果当前元素个数小于CPU个数并且有冲突则扩容  
            //扩容前要判断cellsBusy标志是否为0，然后CAS操作设置cellsBusy标志为1，表示当前线程准备开始扩容 
            else if (cellsBusy == 0 && casCellsBusy()) { 
                try {                   
                    //判断cells == cs？防止当前线程在CAS操作期间，其它线程修改了该cells数组 
                    if (cells == cs)        // Expand table unless stale     
                        //扩容为原数组大小的两倍   
                        cells = Arrays.copyOf(cs, n << 1);              
                } finally {         
                    cellsBusy = 0;      
                }              
                collide = false;   
                continue;          
                // Retry with expanded table  
            }           
            //CAS 失败的线程重新计算当前线程的随机值threadLocalRandomProbe,以减少下次访问cells数组元素时的冲突机会  
            h = advanceProbe(h);     
        }		
        //如果cells数组还未被初始化，则会运行到此代码  
        //条件一：true 表示当前cells数组没有在被初始化或者扩容，也没有创建新元素    
        //条件二：cells == cs？因为其它线程可能会在你给cs赋值之后修改了cells 
        //条件三：true 表示当前线程CAS操作设置cellsBusy值为1成功，当前线程准备开始初始化操作，此时其他线程旧不能进行扩容操作
        else if (cellsBusy == 0 && cells == cs && casCellsBusy()) {   
            try {                     
                // Initialize table   
                //再判断一次cells == cs? 防止当前线程在CAS操作期间，其它线程已经初始化了，当前线程再次初始化 导致丢失数据  
                if (cells == cs) {            
                    //初始化cells数组元素个数为2       
                    Cell[] rs = new Cell[2];      
                    //计算当前线程应该访问cells数组中的哪个位置，然后新建一个Cell对象并将值写入，放入该位置  
                    rs[h & 1] = new Cell(x);            
                    cells = rs;                   
                    break done;  
                }           
            } finally {  
                //最后重置cellsBusy值为0    
                cellsBusy = 0;          
            }      
        }      
        // Fall back on using base 
        else if (casBase(v = base,       
                         (fn == null) ? v + x : fn.applyAsLong(v, x)))   
            break done;  
    }
}
```

### 4.3LongAccumulator类原理探究

`LongAdder`类是`LongAccumulator`类的一个特例，`LongAccumulator`类比`LongAdder`类功能更加强大

`LongAccumulator`类的构造方法

```java
//参数accumulatorFunction是一个LongBinaryOperator对象，这是一个双目运算器接口，可以根据输入的两个参数返回一个计算值
//参数identity是LongAccumulator累加器的初始值
public LongAccumulator(LongBinaryOperator accumulatorFunction,    
                       long identity) {    
    this.function = accumulatorFunction;
    base = this.identity = identity;
}

//LongBinaryOperator接口源码
public interface LongBinaryOperator {  
    //根据两个参数计算并返回一个值   
    long applyAsLong(long left, long right);
}
```

## 5.Java并发机制的底层实现原理

### 5.1`volatile`的应用

`volatile`是轻量级的`synchronized`，它在多处理器开发中保证了共享变量的可见性

- `volatile`的定义与实现原理

  - 定义

    如果一个字段被声明成`volatile`，Java线程内存模型确保所有线程看到这个变量的值是一致的。

  - 实现原理

    与`volatile`实现相关到的一些CPU术语

    ![image-20210425124745036](/static/img/image-20210425124745036.png)

    如果一个字段被声明为`volatile`，当我们对该字段进行写操作时，其底层汇编代码会与普通字段有些许差异：

    ```java
    //Java代码
    instance = new Singleton();
    //instance是volatile变量
    //转成汇编代码0x01a3de1d: movb $0×0,0×1104800(%esi);0x01a3de24: lock addl $0×0,(%esp);
    ```
    
    由上可知，有`volatile`修饰的共享变量在进行写操作时，其汇编代码会多出一条以`lock`为前缀的指令
    
    **`lock`前缀指令在多核处理器下的作用**：

    - 将当前线程缓存行的数据写回到系统内存
    - 这个写回内存的操作会使在其他CPU里缓存了该内存地址的数据无效
    
    多线程下对`volatile`修饰的字段处理流程：

    - 如果对声明了`volatile`的字段进行写操作，JVM就会向处理器发送一条`lock`前缀的指令，将这个变量所在缓存行的数据写回到系统内存（在写回过程中，系统会锁定这块缓存区域，并使用缓存一致性机制来确保修改的原子性，缓存一致性机制会阻止同时修改由两个以上处理器缓存的内存区域数据）
    - 但是，就算写回到内存，如果其他线程缓存的值还是旧的，再执行计算操作就会有问题。所以，在多处理器下，为了保证各个处理器的缓存是一致的，就会实现**缓存一致性协议**，每个处理器通过嗅探在总线上传播的数据来检查自己缓存的值是不是过期了，当处理器发现自己缓存行对应的内存地址被修改，就会将当前处理器的缓存行设置成无效状态，当处理器对这个数据进行修改操作的时候，会重新从系统内存中把数据读到处理器缓存里
    
    **`volatile`的两条实现原则**：
    
    - `lock`前缀指令引起处理器缓存回写到内存
    - 一个处理器的缓存回写到内存会导致其他处理器的缓存无效

### 5.2synchronized的实现原理与应用

Java中的每一个对象都可以作为锁，具体表现为以下三种形式：

- 对于普通同步方法，锁是当前实例对象
- 对于静态同步方法，锁是当前类的`Class`对象
- 对于同步方法块，锁是`synchronized`括号里配置的对象

JVM基于进入和退出`Monitor`对象来实现`synchronized`对方法和代码块的同步，代码块的同步是使用`monitorenter`和`moniterexit`指令实现，方法的同步同样也可以使用这两个指令来实现

`synchronized`的实现原理：

当源码被编译后，`monitorenter`指令会插入到同步代码块开始位置，而`moniterexit`指令是插入到方法结束处和异常处，JVM会保证每个`monitorenter`必须有对应的`monitorexit`与之配对。任何对象都有一个`monitor`与之关联，当线程执行到`monitorenter`指令时，将会尝试获取对象所对应的`monitor`的所有权，即尝试获得对象的锁

#### 5.2.1Java对象头

`synchronized`用的锁是存在Java对象头里的。如果对象是数组类型，则虚拟机用3个字宽存储对象头，如果对象为非数组类型，则用2字宽存储对象头。在32位/64位虚拟机中，1字宽等于4字节/8字节，即32bit/64bit

![image-20210425144149876](/static/img/image-20210425144149876.png)

Java对象头里的Mark Word里默认存储对象的HashCode、分代年龄和锁标记位。32位JVM的Mark Word的默认存储结构如下

![image-20210425144226771](/static/img/image-20210425144226771.png)

在运行期间，Mark Word里存储的数据会随着锁标志位的变化而变化。Mark Word可能变化为存储以下4种数据

![image-20210425144404891](/static/img/image-20210425144404891.png)

#### 5.2.2锁的升级与对比

Java SE 1.6为了减少获得锁和释放锁带来的性能消耗，引入了偏向锁和轻量级锁，自此之后，锁一共有四种状态，级别由低到高为：无锁状态、偏向锁状态、轻量级锁状态和重量级锁状态，这些状态会随着竞争情况逐渐升级，**锁可以升级但是不能降级，比如偏向锁升级为轻量级锁后就不能降级成偏向锁**

- 偏向锁 

  - 出现的原因

    大多数情况下，锁不仅不存在多线程竞争，而且总是由同一线程多次获得，为了让线程获得锁的代价更低而引入了偏向锁

  - 偏向锁的获取

    当一个线程访问同步块并获取锁时，会在对象头和栈帧中的锁记录里存储锁偏向的线程ID

    - 以后该线程在进入和退出同步块时不需要进行CAS操作来加锁和解锁，只需要测试一下对象头的Mark Word里是否存储着指向当前线程的偏向锁：
      - 如果测试成功，表示线程已经获得了锁
      - 如果测试失败，则需要再测试一下Mark Word中偏向锁的标识是否设置成1（表示当前是偏向锁）：
        - 如果没有设置（说明当前不是偏向锁），则使用CAS竞争锁
        - 如果设置了，则尝试使用CAS将对象头的偏向锁指向当前线程

  - 偏向锁的撤销

    - 机制

      偏向锁采用了一种等到竞争出现才释放锁的机制，所以当其他线程尝试竞争偏向锁时，持有偏向锁的线程才会释放锁

    - 时机

      偏向锁的撤销，需要等待全局安全点（即该时间点没有正在执行的字节码）。它会首先暂停拥有偏向锁的线程，然后检查持有偏向锁的线程是否活着：

      - 如果线程不处于活动状态，则将对象头设置成无锁状态
      - 如果线程仍然活着，拥有偏向锁的栈会被执行，遍历偏向对象的锁记录，栈中的锁记录和对象头Mark Word要么重新偏向于其他线程，要么恢复到无锁或者标记对象不适合作为偏向锁，最后唤醒暂停线程

  - 偏向锁的获得和撤销流程

  ![image-20210425193423695](/static/img/image-20210425193423695.png)

  - 偏向锁的关闭：

    偏向锁在Java 6和Java 7里是默认启用的，但是它在应用程序启动几秒钟之后才激活，如有必要可以使用JVM参数来关闭延迟：`-XX:BiasedLockingStartupDelay=0`。如果应用程序里所有的锁通常情况下处于竞争状态，可以通过JVM参数关闭偏向锁：`-XX:-UseBiasedLocking=false`，那么程序默认会进入轻量级锁状态

- 轻量级锁

  - 轻量级锁加锁

    线程在执行同步块之前，JVM会先在当前线程的栈帧中创建用于存储锁记录的空间，并将对象头中的Mark Word复制到锁记录中，此时锁记录中的Mark Word被称为Displaced Mark Word。然后线程尝试使用CAS将对象头中的Mark Word替换为指向锁记录的指针：

    - 如果成功，当前线程获得锁
    - 如果失败，表示其他线程竞争，当前线程便尝试使用自旋来获取锁

  - 轻量级锁解锁

    轻量级解锁时，会使用CAS操作将Displaced Mark Word替换回到对象头：

    - 如果成功，则表示没有竞争发生
    - 如果失败，表示当前锁存在竞争，锁就会膨胀成重量级锁

  - 轻量级锁及膨胀流程

    ![image-20210425201730732](/static/img/image-20210425201730732.png)

    当获取轻量级锁失败的线程，自旋重试到一定次数，轻量级锁就会膨胀成重量级锁，在这个状态下，任何试图获取该锁的线程都会被阻塞，直到持有该锁的线程释放锁并唤醒这些线程，这些被唤醒的线程就会进行新一轮的锁竞争

- 锁的优缺点对比

  ![image-20210425202252626](/static/img/image-20210425202252626.png)

### 5.3原子操作的实现原理

原子操作，即不可被中断的一个或一系列操作

- 处理器如何实现原子操作

  - 处理器会自动保证基本的内存操作的原子性

    保证从系统内存中读取或者写入一个字节是原子的，也就是说当一个处理器读取一个字节时，其他处理器不能访问这个字节的内存地址

  - 处理器不能自动保证复杂的内存操作的原子性

    但是处理器提供了总线锁定和缓存锁定两个机制来保证复杂内存操作（比如读改写操作，i++）的原子性：

    - 使用总线锁保证原子性

      所谓总线锁，就是使用处理器提供的一个LOCK#信号，当一个处理器在总线上输出此信号时，其他处理器的请求将被阻塞住，那么该处理器可以独占共享内存

    - 使用缓存锁保证原子性

      使用总线锁会把CPU和内存之间的通信锁住，这使得锁定期间，其他处理器不能操作其他内存地址的数据，这会导致很大的开销。因此，目前处理器在某些场合下使用缓存锁定代替总线锁定来进行优化

      所谓缓存锁定，就是指内存区域如果被缓存在处理器的缓存行中，并且在`lock`指令操作期间被锁定，那么当它执行锁操作回写到内存时，处理器不在总线上声明LOCK#信号，而是修改内部的内存地址，并允许它的缓存一致性机制来保证操作的原子性，因为缓存一致性机制会阻止同时修改由两个以上处理器缓存的内存区域数据，当某个处理器回写已被锁定的缓存行的数据时，会使其他处理器中缓存该数据的缓存行无效

      有两种情况处理器无法使用缓存锁定：

      - 当操作的数据不能被缓存在处理器内部，或操作的数据跨多个缓存行时，则处理器会调用总线锁定
      - 有些处理器不支持缓存锁定。对于Intel 486和Pentium处理器，就算锁定的内存区域在处理器的缓存行中也会调用总线锁定

  - Java如何实现原子操作

    在Java中通过锁和循环CAS的方式来实现原子操作

    - CAS实现原子操作的三大问题

      - ABA问题（详见2.4）
      - 循环时间长开销大
      - 只能保证一个共享变量的原子操作

    - 使用锁机制实现原子操作

      锁机制保证了只有获得锁的线程才能够操作锁定的内存区域。除了偏向锁，JVM实现锁的方式都用了循环CAS，即当一个线程想进入同步块的时候使用循环CAS的方式来获取锁，当它退出同步块的时候使用循环CAS释放锁

## 6.Java内存模型

### 6.1Java内存模型的基础

#### 6.1.1并发编程模型的两个关键问题

在并发编程中，需要处理两个关键问题：

- 线程之间如何通信

  通信是指线程之间以何种机制来交换信息

- 线程之间如何同步

  同步是指程序中用于控制不同线程间操作发生相对顺序的机制

在命令式编程中，线程间的通信机制分为：共享内存和消息传递。这也对应着两个不同的并发模型：

- 共享内存并发模型

  - 线程之间如何通信

    线程之间共享程序的公共状态，通过写-读内存中的公共状态来进行隐式通信

  - 线程之间如何同步

    同步是显式进行，必须显式指定某个方法或某段代码需要在线程之间互斥执行

- 消息传递并发模型

  - 线程之间如何通信

    线程之间没有公共状态，必须通过发送消息来显式进行通信

  - 线程之间如何同步

    同步是隐式进行，因为消息的发送必须在消息的接收之前

#### 6.1.2Java内存模型的抽象结构

在Java中，所有实例域、静态域和数组元素都存储在堆内存中，堆内存在线程之间共享。局部变量，方法定义参数和异常处理器参数都存储在栈中，是线程私有的，不会在线程间共享，也就不会有内存可见性问题，也不受内存模型的影响

Java线程之间的通信由Java内存模型（JMM）控制，JMM决定一个线程对共享变量的写入何时对另一个线程可见。JMM规定：线程之间的共享变量都存储在主内存中，每个线程都有一个私有的本地内存，本地内存中存储了该线程需要读/写的共享变量的副本

JMM抽象结构图：

![image-20210426134543798](/static/img/image-20210426134543798.png)

如果线程A和线程B之间要通信，则必须经历一下两个步骤：

- 线程A把本地内存A中更新过的共享变量刷新到主内存中
- 线程B到主内存中读取线程A之前已更新过的共享变量

![image-20210426140521566](/static/img/image-20210426140521566.png)

如上所示，本地内存A和本地内存B保存着主内存中共享变量x的副本。假设初始时，这3个内存中的x值都为0

- 线程A在执行时，把更新后的x值（假设值为1）临时存放在自己的本地内存A中
- 当线程A和线程B需要通信时，线程A首先会把自己本地内存中修改后的x值刷新到主内 存中，此时主内存中的x值变为了1
- 随后，线程B到主内存中去读取线程A更新后的x值，此时线程B的本地内存的x值也变为了1

#### 6.1.3从源代码到指令序列的重排序

执行程序时，为了提高性能，编译器和处理器常常会对指令做重排序。重排序分为以下3类：

- 编译器优化的重排序

  编译器在不改变单线程程序语义的前提下，可以重新安排语句的执行顺序

- 指令级并行的重排序

  现代处理器采用了指令级并行技术来将多条指令重叠执行，如果不存在数据依赖性，处理器可以改变语句对应机器指令的执行顺序

- 内存系统的重排序

  由于处理器使用缓存和读/写缓冲区，这使得加载和存储操作看上去可能是在乱序执行

从Java源代码到最终实际执行的指令序列，会分别经历以上3种重排序：

![image-20210426141137910](/static/img/image-20210426141137910.png)

上述的1属于编译器重排序，2和3属于处理器重排序。这些重排序可能会导致多线程程序出现内存可见性问题。对于编译器，JMM的编译器重排序规则会禁止特定类型的编译器重排序（不是所有的编译器重排序都要禁止）。对于处理器重排序，JMM的处理器重排序规则会要求Java编译器在生成指令序列时，插入特定类型的内存屏障指令，通过内存屏障指令来禁止特定类型的处理器重排序

#### 6.1.4并发编程模型的分类

现代处理器都会使用写缓冲区，但是该缓冲区仅对它所在的处理器可见，这个特性可能会使得处理器对内存的读/写操作顺序不一致

![image-20210426143534833](/static/img/image-20210426143534833.png)

假设线程A、B按程序的顺序并行执行内存访问，那么最终结果可能得到x=y=0，具体原因如下：

![image-20210426143617702](/static/img/image-20210426143617702.png)

- 处理器A和B可以同时把共享变量写入自己的写缓冲区，即操作A1和B1
- 然后从主内存中读取另一个共享变量，即操作A2和B2
- 最后处理器A和B才把自己写缓冲区中保存的脏数据刷新到内存中，即操作A3和B3

从内存操作实际发生的顺序来看，写-读操作被重排序了，因为真正的写操作其实是A3和B3，而实际先发生的却是读操作A2和B2。**因此，由于写缓冲区的存在，现代的处理器都会允许对写-读操作进行重排序**

常见处理器的重排序规则表如下：

![image-20210426144319200](/static/img/image-20210426144319200.png)

为了保证内存可见性，Java编译器在生成指令序列的适当位置会插入内存屏障指令来禁止特定类型的处理器重排序,内存屏障类型表如下：

![image-20210426144550915](/static/img/image-20210426144550915.png)

StoreLoadBarriers是一个“全能型”的屏障，它同时具有其他3个屏障的效果。执行该屏障开销会很昂贵，因为当前处理器通常要把写缓冲区中的数据全部刷新到内存中

#### 6.1.5hanppens-before简介

在JMM中，如果一个操作执行的结果需要对另一个操作可见，那么这两个操作之间必须要存在happens-before关系，两个操作既可以是在一个线程之内，也可以是在不同线程之间

- 程序顺序规则：一个线程中的每个操作，happens-before于该线程中的任意后续操作
- 监视器锁规则：对一个锁的解锁，happens-before于随后对这个锁的加锁
- `volatile`变量规则：对一个`volatile`域的写，happens-before于任意后续对这个`volatile`域的读
- 传递性：如果A happens-before B，且B happens-before C，那么A happens-before C

### 6.2重排序

#### 6.2.1数据依赖性

如果两个操作访问同一个变量，且这两个操作中有一个为写操作，此时这两个操作之间就存在数据依赖性。数据依赖分为下列3中类型：

![image-20210426150535438](/static/img/image-20210426150535438.png)

如果两个操作之间存在数据依赖性，那么只要重排序这两个操作的执行顺序，程序的执行结果就会被改变。因此，编译器和处理器在重排序时，不会改变存在数据依赖关系的两个操作的执行顺序（**仅在单线程下有保证，多线程下是不会被编译器和处理器所考虑**）

#### 6.2.2as-if-serial语义

as-if-serial语义，即不管怎么重排序，单线程程序的执行结果不能被改变。as-if-serial的语义，保证了单线程下编译器和处理器不会对存在数据依赖关系的操作做重排序，因为这种重排序会改变执行结果

```java
double pi = 3.14; // A 
double r = 1.0; // B
double area = pi * r * r; // C
```

上述三个操作的数据依赖关系如下：

![image-20210426155315975](/static/img/image-20210426155315975.png)

A和C之间存在数据依赖关系，同时B和C之间也存在数据依赖关系。因此在最终执行的指令序列中，C不能被重排序到A和B的前面（C排到A和B的前面，程序的结果将会被改变）。但A和B之间没有数据依赖关系，编译器和处理器可以重排序A和B之间的执行顺序，因此最终会产生两种执行顺序：

![image-20210426162148193](/static/img/image-20210426162148193.png)

#### 6.2.3程序顺序规则

根据happens-before的程序顺序规则，上面计算圆的面积的示例代码存在3个happens-before关系：

- A happens-before B
- B happens-before C
- A happens-before C

尽管此处A happens-before B，但实际执行时B是可以排在A之前执行的，JMM并不要求A一定要在B之前执行。JMM仅仅要求前一个操作执行的结果对后一个操作可见，且前一个操作按顺序排在第二个操作之前，只要重排序后的结果与happens-before顺序执行的结果一致，JMM就允许这种重排序

#### 6.2.4重排序对多线程的影响

```java
package advanced;public class ReorderExample {
    int a = 0;   
    boolean flag = false; 
    public void writer() {   
        a = 1;//1    
        flag = true;//2 
    }    
    public void reader() {  
        if (flag) {//3   
            int i = a * a;//4  
        }    
    }
}
```

假设有两个线程A和B，A首先执行`writer()`方法，随后B线程接着执行`reader()`方法，在多线程下，当线程B在执行操作4时，不一定能看到线程A在操作1对共享变量a的写入

原因：多线程操作的重排序所导致的，由于操作1和2没有数据依赖关系，所以编译器和处理器可以对这两个操作重排序；同样，操作3和4没有数据依赖关系，编译器和处理器也可以对这两个操作重排序

- 操作1和2重排序后

  ![image-20210426183139652](/static/img/image-20210426183139652.png)

  线程A首先写标记变量flag，随后线程B读这个变量。由于条件判断为真，线程B将读取变量a。此时，变量a还没有被线程A写入

- 操作3和4重排序后

  ![image-20210426184741564](/static/img/image-20210426184741564.png)

  操作3和4由于存在控制依赖关系，所以编译器和处理器会采用猜测执行，执行线程B的处理器可以提前读取并计算a*a，然后把计算结果临时保存到一个名为重排序缓冲的硬件缓存中。当操作3的条件判断为真时，就把该计算结果写入变量i中，但是线程B读取a时，线程A还未写入该变量

### 6.3volatile的内存语义

#### 6.3.1volatile的特性

**对`volatile`变量的单个读/写等价于使用同一个锁对普通变量（没有`volatile`修饰）的单个读/写操作做了同步**。因此，`volatile`变量自身具有两个特性：

- 可见性

  锁的happens-before规则保证释放锁和获取锁的两个线程之间的内存可见性，即对一个`volatile`变量的读，总是能看到任意线程对这个`volatile`变量最后的写入

- 原子性

  对任意单个`volatile`变量的读/写具有原子性（即使是64位的long型和double型），但对于多个`volatile`变量的读/写操作，比如`volatile++`这种复合操作，其整体上是不具有原子性

```java
class VolatileFeaturesExample {    
    volatile long vl = 0L; // 使用volatile声明64位的long型变量   
    public void set(long l) {        
        vl = l; // 单个volatile变量的写   
    }    public void getAndIncrement () {
        vl++; // 复合（多个）volatile变量的读/写  
    }    public long get() {     
        return vl; // 单个volatile变量的读 
    }
}
```

上述代码等价于下面的代码

```java
class VolatileFeaturesExample {    
    long vl = 0L; // 64位的long型普通变量   
    public synchronized void set(long l) {        
        // 对单个的普通变量的写用同一个锁同步
        vl = l;  
    }   
    public void getAndIncrement () { // 普通方法调用   
        long temp = get(); // 调用已同步的读方法     
        temp += 1L; // 普通写操作    
        set(temp); // 调用已同步的写方法 
    }
    public synchronized long get() { 
        // 对单个的普通变量的读用同一个锁同步
        return vl;    
    }
}
```

#### 6.3.2volatile写-读建立的hanppens-before关系

`volatile`变量的写-读可以实现线程之间的通信。从内存语义的角度上讲：

- **`volatile`的写和锁的释放有相同的内存语义**
- **`volatile`的读和锁的获取具有相同的内存语义**

```java
package advanced;public class VolatileExample { 
    int a=0;   
    volatile boolean flag=false;
    public void writer(){   
        a=1;//1      
        flag=true;//2 
    }   
    public void reader(){   
        if(flag){//3     
            int i=a*a;//4  
        }   
    }
}
```

假设线程A执行`writer()`方法之后，线程B执行`reader()`方法。根据happens-before规则，这个过程建立的happens-before关系可以分为3类： 

- 根据程序次序规则，1 happens-before 2，3 happens-before 4
- 根据`volatile`规则，2 happens-before 3
- 根据happens-before的传递性规则，1 happens-before 4

这里A线程写一个`volatile`变量后，B线程读同一个`volatile`变量，那么A线程在写`volatile`变量之前所有可见的共享变量，在B线程读同一个`volatile`变量后，将立即变得对B线程可见

#### 6.3.3volatile写-读的内存语义

- `volatile`写的内存语义

  当写一个volatile变量时，JMM会把该线程对应的本地内存中的共享变量值刷新到主内存

- `volatile`读的内存语义

  当读一个volatile变量时，JMM会把该线程对应的本地内存置为无效。线程接下来将从主内存中读取共享变量

也就是说，读线程B读一个`volatile`变量后，写线程A在写这个`volatile`变量之前所有可见的共享变量的值都将立即变得对读线程B可见

**总结**

`volatile`写和`volatile`读的内存语义实质上是实现了共享内存模型下两个线程之间的通信：

- 线程A写一个volatile变量，实质上是线程A向接下来要读这个`volatile`变量的某个线程发出了（其对共享变量所做修改的）消息
- 线程B读一个volatile变量，实质上是线程B接收了之前某个线程发出的（在写这个`volatile`变量之前对共享变量所做修改的）消息

#### 6.3.4volatile内存语义的实现

JMM为了实现`volatile`内存语义，会限制编译器和处理器的重排序规则：

![image-20210426211427079](/static/img/image-20210426211427079.png)

- 当第二个操作是`volatile`写时，无论第一个操作是什么，都不能重排序。该规则保证`volatile`写之前的操作不会被编译器重排序到`volatile`写之后
- 当第一个操作是`volatile`读时，无论第二个操作是什么，都不能重排序。该规则保证`volatile`读之后的操作不会被编译器重排序到`volatile`读之前
- 当第一个操作是`volatile`写，第二个操作是`volatile`读时，不能重排序

为了实现volatile的内存语义，编译器在生成字节码时，会在指令序列中插入内存屏障来禁止特定类型的处理器重排序：

- 在每个`volatile`写操作的前面插入一个StoreStore屏障

  StoreStore屏障可以保证在`volatile`写之前，其前面的所有普通写操作已经对任意处理器可见。因为StoreStore屏障将保障上面所有的普通写在volatile写之前刷新到主内存

- 在每个`volatile`写操作的后面插入一个StoreLoad屏障

  由于一个`volatile`写之后未必会是一个`volatile`写/读（比如，一个`volatile`写之后方法立即return），因此，JMM采取在每个`volatile`写的后面，或者在每个`volatile`读的前面插入一个StoreLoad屏障，以保证程序结果的正确性

![image-20210426212709735](/static/img/image-20210426212709735.png)



- 在每个`volatile`读操作的后面插入一个LoadLoad屏障
- 在每个`volatile`读操作的后面插入一个LoadStore屏障

![image-20210426213538266](/static/img/image-20210426213538266.png)

在实际执行时，只要不改变`volatile`写-读的内存语义，编译器可以根据具体情况省略不必要的屏障

### 6.4锁的内存语义

#### 6.4.1锁的释放-获取建立的happens-before关系

```java
package advanced;public class MonitorExample {   
    int a=0;   
    public synchronized void writer(){//1  
        a++;//2    
    }//3   
    public synchronized void reader(){//4 
        int i=a;//5 
    }//6
}
```

假设线程A执行`writer()`方法，随后线程B执行`reader()`方法。根据happens-before规则，这个过程包含的happens-before关系可以分为3类：

- 根据程序次序规则，1 happens-before 2,2 happens-before 3;4 happens-before 5,5 happens- 

  before 6

- 根据监视器锁规则，3 happens-before 4

- 根据happens-before的传递性，2 happens-before 5

所以，线程A在释放锁之前所有可见的共享变量，在线程B获取同一个锁后，将立刻变得对线程B可见

#### 6.4.2锁的释放和获取的内存语义

- 锁的释放的内存语义

  当线程释放锁时，JMM会把该线程对于的本地内存中的共享变量刷新到主内存中

- 锁的获取的内存语义

  当线程获取锁时，JMM会把该线程对应的本地内存置为无效，从而使得被监视器保护的临界区代码（获取锁和释放锁之间的代码）必须从主内存中读取共享变量

**总结**

锁的释放和获取的内存语义实质上是实现了共享内存模型下两个线程之间的通信：

- 线程A释放一个锁，实质上是线程A向接下来将要获取这个锁的某个线程发出了（线程A对共享变量所做修改的）消息
- 线程B获取一个锁，实质上是线程B接收了之前某个线程发出的（在释放这个锁之前对共享变量所做修改的）消息

#### 6.4.3锁内存语义的实现

以`ReentrantLock`类为例：

- 公平锁加锁和释放锁的核心源码

  ```java
  //加锁方法
  protected final boolean tryAcquire(int acquires) { 
      final Thread current = Thread.currentThread(); 
      //获取锁的开始，首先读一个volatile变量state  
      int c = getState();
      if (c == 0) {    
          //根据公平原则来判断当前线程是否有资格使用CAS获取锁  
          if (!hasQueuedPredecessors() &&  
              compareAndSetState(0, acquires)) {
              setExclusiveOwnerThread(current);  
              return true;      
          }    
      }    
      else if (current == getExclusiveOwnerThread()) {
          int nextc = c + acquires;   
          if (nextc < 0)   
              throw new Error("Maximum lock count exceeded");   
          setState(nextc);    
          return true;    
      }   
      return false;
  }
  
  //释放锁方法
  protected final boolean tryRelease(int releases) { 
      int c = getState() - releases;   
      if (Thread.currentThread() != getExclusiveOwnerThread())  
          throw new IllegalMonitorStateException();  
      boolean free = false;    
      if (c == 0) {    
          free = true;     
          setExclusiveOwnerThread(null); 
      }   
      //释放锁的最后，写volatile变量state   
      setState(c);   
      return free;
  }
  ```

  **结论**

  - 公平锁在释放锁的最后写`volatile`变量`state`
  - 在获取锁时首先读这个`volatile`变量，然后用公平原则判断当前线程是否有资格使用CAS获取锁

  由`volatile`的happens-before规则，释放锁的线程在写`volatile`变量之前可见的共享变量，在获取锁的线程读取同一个`volatile`变量后将立即变得对获取锁的线程可见

- 非公平锁加锁和释放锁的核心源码

  ```java
  //加锁方法
  final boolean nonfairTryAcquire(int acquires) {  
      final Thread current = Thread.currentThread();  
      //获取锁的开始，首先读一个volatile变量state  
      int c = getState();    
      if (c == 0) {  
          //使用CAS操作获取锁     
          if (compareAndSetState(0, acquires)) {  
              setExclusiveOwnerThread(current); 
              return true;     
          }   
      }    
      else if (current == getExclusiveOwnerThread()) {  
          int nextc = c + acquires;  
          if (nextc < 0) // overflow     
              throw new Error("Maximum lock count exceeded");  
          setState(nextc);    
          return true; 
      }   
      return false;
  }
  
  //释放锁方法
  @ReservedStackAccess
  protected final boolean tryRelease(int releases) { 
      int c = getState() - releases;   
      if (Thread.currentThread() != getExclusiveOwnerThread()) 
          throw new IllegalMonitorStateException();  
      boolean free = false;  
      if (c == 0) {      
          free = true;  
          setExclusiveOwnerThread(null); 
      }  
      //释放锁的最后，写volatile变量state   
      setState(c); 
      return free;
  }
  ```

  **结论**

  - 非公平锁在释放锁的最后写`volatile`变量`state`
  - 非公平锁在获取锁时首先读这个`volatile`变量，然后使用CAS操作获取锁（同时具有`volatile`读和`volatile`写的内存语义)

- 关于CAS

  **CAS操作同时具有`volatile`读和`volatile`写的内存语义**。由于编译器不会对`volatile`读与`volatile`读后面的任意内存操作重排序；编译器不会对`volatile`写与`volatile`写前面的任意内存操作重排序。所以，**编译器不能对CAS与CAS前面和后面的任意内存操作重排序**

- CAS实现

  CAS操作对应系统底层的汇编指令`cmpxchg`，即比较并交换操作数。在多线程环境下，系统会为`cmpxchg`指令加上`lock`前缀，`lock`前缀作用如下：

  - 确保对内存的读-改-写操作原子执行
  - 禁止该指令，与之前和之后的读和写指令重排序
  - 把写缓冲区中的所有数据刷新到内存中

  `lock`前缀作用的2、3点所具有的内存屏障效果，足以同时实现`volatile`读和`volatile`写的内存语义

**总结**

锁释放-获取的内存语义的实现至少有下面两种方式：

- 利用`volatile`变量的写-读所具有的内存语义
- 利用CAS所附带的`volatile`读和`volatile`写的内存语义

#### 6.4.4concurrent包的实现

concurrent包底层都是依托`volatile`和CAS操作来实现的：

- 首先，声明共享变量为`volatile`
- 然后，使用CAS原子条件更新来实现线程之间的同步
- 同时，配合以`volatile`的读/写和CAS所具有的`volatile`读和写的内存语义来实现线程间的通信

concurrent包实现示意图：

![image-20210427103828562](/static/img/image-20210427103828562.png)

### 6.5final域的内存语义

对于`final`域，编译器和处理器要遵守两个重排序规则：

- 在构造方法内对一个`final`域的写入，与随后把这个构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序
- 初次读一个包含`final`域的对象的引用，与随后初次读这个`final`域，这两个操作之间不能重排序

示例：

```java
package advanced;public class FinalExample {   
    int i; // 普通变量  
    final int j; // final变量  
    static FinalExample obj;  
    public FinalExample () { // 构造函数
        i = 1; // 写普通域   
        j = 2; // 写final域   
    }   
    public static void writer () { // 写线程A执行      
        obj = new FinalExample (); 
    }   
    public static void reader () { // 读线程B执行  
        FinalExample object = obj; // 读对象引用    
        int a = object.i; // 读普通域        
        int b = object.j; // 读final域     
    }
}
```

假设一个线程A执行`writer()`方法，随后另一个线程B执行`reader()`方法，下面都使用该示例说明

#### 6.5.1写final域的重排序规则

写`final`域的重排序规则禁止把final域的写重排序到构造方法之外，其实现如下：

- JMM禁止编译器把`final`域的写重排序到构造方法之外
- 编译器会在`final`域的写之后，构造方法return之前，插入一个StoreStore屏障。这个屏障禁止处理器把`final`域的写重排序到构造函数之外

![image-20210427211124140](/static/img/image-20210427211124140.png)

由图可知，写普通域的操作被编译器重排序到了构造方法之外，线程B错误地读取了普通变量`i`初始化之前的值（默认值0）。而写`final`域的操作，被写`final`域的重排序规则限定在了构造方法之内，使得线程B能正确读取`final`变量初始化之后的操作

**结论**

写`final`域的重排序规则可以确保：在对象引用被任意线程可见之前，对象的`final`域已经被正确初始化过，而普通域没有这个保证

#### 6.5.2读`final`域的重排序规则

读`final`域的重排序规则是，在一个线程中，初次读对象引用与初次读该对象包含的`final`域，JMM禁止处理器重排序这两个操作，其实现如下：

- 编译器会在读`final`域操作的前面插入一个LoadLoad屏障

![image-20210427211910724](/static/img/image-20210427211910724.png)

由图可知，读对象的普通域的操作被处理器重排序到读对象引用之前，而此时该域还没被写线程A写入，这是一个错误的读取操作。而读`final`域的重排序规则会把读对象`final`域的操作限定在读对象引用之后，使得对象的`final`域被正确的读取

**结论**

读`final`域的重排序规则可以确保：在读一个对象的`final`域之前，一定会先读包含这个`final`域的对象的引用

#### 6.5.3final域为引用类型

如果`final`域是引用类型，对于此情况，写`final`域的重排序规则对编译器和处理器增加了如下约束：在构造方法内对一个`final`引用的对象的成员域的写入，与随后在构造函数外把这个被构造对象的引用赋值给一个引用变量，这两个操作之间不能重排序

#### 6.5.4为什么final引用不能从构造函数内“溢出”

写`final`域的重排序规则除了需要编译器和处理器的保证外，程序代码本身也必须要保证：在构造方法内部，不能让这个被构造对象的引用被其他线程可见，即对象引用不能从构造方法中逸出

```java
public class FinalReferenceEscapeExample {   
    final int i;   
    static FinalReferenceEscapeExample obj;
    public FinalReferenceEscapeExample () {
        i = 1; // 1写final域       
        obj = this; // 2 this引用在此"逸出"  
    }    public static void writer() {   
        new FinalReferenceEscapeExample (); 
    }    public static void reader() {  
        if (obj != null) { // 3      
            int temp = obj.i; // 4    
        }   
    }
}
```

尽管写`final`域的重排序规则保证操作1不会被重排序到规则方法外部，但是操作1和操作2却可以重排序：

![image-20210427213334944](/static/img/image-20210427213334944.png)

由于操作1和操作2重排序，使得对象还没构造完成就已经逸出线程A，使得其对线程B可见，因此`final`域在还没初始化前就有可能被线程B读取

### 6.6happens-before

happens-before规则总结：

- 程序顺序规则：一个线程中的每个操作，happens-before于该线程中的任意后续操作
- 监视器锁规则：对一个锁的解锁，happens-before于随后对这个锁的加锁
- `volatile`变量规则：对一个`volatile`域的写，happens-before于任意后续对这个`volatile`域的读
- 传递性：如果A happens-before B，且B happens-before C，那么A happens-before C
- `start()`规则：如果线程A执行操作`ThreadB.start()`（启动线程B），那么A线程的`ThreadB.start()`操作happens-before于线程B中的任意操作
- `join()`规则：如果线程A执行操作`ThreadB.join()`并成功返回，那么线程B中的任意操作happens-before于线程A从`ThreadB.join()`操作成功返回。

### 6.7双重检查锁定与延迟初始化

#### 6.7.1双重检查锁定的由来

对于一些高开销的对象初始化，一般采用延迟初始化，即在使用这些对象时才进行初始化

- 非线程安全的延迟初始化对象

  ```java
  package advanced;
  public class UnsafeLazyInitialization {    
      private static class Instance{       
      }    
      private static Instance instance;  
      public static Instance getInstance(){   
          if(instance==null){//1:A线程执行   
              instance=new Instance();//2：B线程执行
          }        return instance; 
      }
  }
  ```

  假设线程A在执行代码1的同时，B线程执行代码2，此时线程A可能会看到`instance`引用的对象还没有完成初始化

- 加锁实现线程安全的延迟初始化

  ```java
  package advanced;
  public class SafeLazyInitialization {
      private static Instance instance;   
      private static class Instance{}   
      public synchronized static Instance getInstance(){
          if(instance==null){        
              instance=new Instance(); 
          }      
          return instance; 
      }
  }
  ```

  尽管使用`synchronized`来对多线程下`getInstance()`方法进行同步处理，但是如果该方法被多线程频繁调用，将会导致执行性能下降：如果该`Instance`已经被创建，后续所有线程调用该方法，都必须先获取锁，才能判断该`Instance`是否被创建

- 使用双重检查锁定来降低同步的开销

  ```java
  package advanced;
  public class DoubleCheckedLocking { 
      private static Instance instance; 
      private static class Instance{}    
      public static Instance getInstance(){ 
          if(instance==null){//1：第一次检查  
              synchronized (DoubleCheckedLocking.class){//2：加锁 
                  if(instance==null){//3：第二次检查      
                      instance=new Instance();//4：创建对象   
                  }         
              }   
          }      
          return instance;  
      }
  }
  ```
  
  使用双重检查锁定，那么第一次检查`Instance`是否创建就不需要再获取锁，这样可以大幅降低`synchronized`带来的性能开销，但是上述代码依旧有可能出问题

#### 6.7.2问题的根源

问题的根源就出在代码4`instance=new Instance();`，该行代码可以分解为以下3行伪代码：

```java
memory = allocate(); // 1：分配对象的内存空间 
ctorInstance(memory); // 2：初始化对象 
instance = memory; // 3：设置instance指向刚分配的内存地址
```

上述代码2和代码3之间，可能会被重排序：

```java
memory = allocate(); // 1：分配对象的内存空间
instance = memory; // 3：设置instance指向刚分配的内存地址
// 注意，此时对象还没有被初始化！ 
ctorInstance(memory); // 2：初始化对象
```

重排序后的代码在单线程内是没有任何问题的，因为单线程环境下保证了初次访问对象引用这一操作一定排在初始化对象这一操作之后

![image-20210428094715966](/static/img/image-20210428094715966.png)

但在多线程环境下，就可能会出现大问题，这也是双重检查锁定的问题根源：

![image-20210428094810074](/static/img/image-20210428094810074.png)

当线程A在创建`instance=new Instance();`时发生重排序，那么线程B就会判断引用`instance`不为`null`，导致未初始化对象`Instance`被B线程访问

**解决方案**

- 不允许操作2和操作3重排序
- 允许2和3重排序，但不允许其他线程看到这个重排序

#### 6.7.3基于volatile的解决方案

将双重检查锁定中要延迟初始化对象的引用声明为`volatile`，即可实现线程安全的延迟初始化

```java
package advanced;public class SafeDoubleCheckedLocking { 
    private volatile static Instance instance;  
    private static class Instance{}   
    public static Instance getInstance(){    
        if(instance==null){            
            synchronized (DoubleCheckedLocking.class){  
                if(instance==null){     
                    instance=new Instance();
                }           
            }     
        }     
        return instance;  
    }
}
```

当对象的引用被声明为`volatile`后，操作2和操作3就会被禁止重排序：

![image-20210428095658893](/static/img/image-20210428095658893.png)

#### 6.7.4基于类初始化的解决方案

一个类只有一个`Class`对象，JVM会在执行类的初始化期间去获取一个锁，该锁可以同步多个线程对同一个类的`Class`对象的初始化，以保证每个类只有一个`Class`对象

借助JVM的这个特性，可以实现一种线程安全的延迟初始化

```java
package advanced;
public class InstanceFactory {  
    private static class Instance{}    
    private static class InstanceHolder{  
        public static Instance instance=new Instance(); 
    }    
    public static Instance getInstance(){  
        return InstanceHolder.instance;//访问Instance类的静态成员变量，使其初始化
    }
}
```

假设两个线程并发执行`getInstance()`方法，`InstanceHolder.instance`就会触发`InstanceHolder`类初始化，而JVM会通过锁机制，保证同时只有一个线程能初始化该类，即使在`instance=new Instance()`中，操作2和操作3重排序，但这对其他线程是不可见的：

![image-20210428135330258](/static/img/image-20210428135330258.png)

多线程下，类初始化的处理过程：

- 通过在`Class`对象上同步（即获取Class对象的初始化锁），来控制类或接口的初始化。这个获取锁的线程会一直等待，直到当前线程能够获取到这个初始化锁

  ![image-20210428141526527](/static/img/image-20210428141526527.png)

- 线程A执行类的初始化，同时线程B在初始化锁对应的condition上等待

  ![image-20210428141654728](/static/img/image-20210428141654728.png)

- 线程A设置state=initialized，然后唤醒在condition中等待的所有线程

- 线程B结束类的初始化处理

  ![image-20210428141811524](/static/img/image-20210428141811524.png)

## 7.JUC包中锁原理剖析

### 7.1LockSupport工具类

JUC包中的`LockSupport`是个工具类，其主要作用是挂起和唤醒线程，该工具类是创建锁和其他同步类的基础`LockSupport`类是使用`Unsafe`类实现的，其主要方法如下：

`LockSupport`类的与每个使用它的线程都会关联一个许可证，默认情况下调用该类的方法的线程是不持有许可证的

- `void park()`方法

  这是一个静态方法。如果调用`park()`方法的线程已经拿到了与`LockSupport`类关联的许可证，则该方法在调用后会立即返回，否则该线程就会被阻塞挂起，直到调用线程获得与`LockSupport`类关联的许可证或者调用线被中断（返回时不会抛出任何异常）

- `void unpark(Thread thread)`方法

  这是一个静态方法。当一个线程调用`unpark`方法时，如果参数`thread`线程没有持有与`LockSupport`类关联的许可证，则让`thread`线程持有：

  - 如果`thread`之前因调用`park()`方法而被挂起，则调用`unpark`方法后，该线程会被唤醒
  - 如果`thread`之前没有调用`park()`方法，则调用`unpark`方法后，在调用`park()`方法，其会立刻返回

- `void parkNanos(long nanos)`方法

  这是一个静态方法。与`park`方法类似，只是如果没有拿到许可证，则调用线程会被挂起`nanos`时间后自动返回

- `void park(Object blocker)`方法

  这是一个静态方法。当线程在没有持有许可证的情况下调用`park`方法而被阻塞挂起时，传入的参数blocker对象就会被记录到该线程内部。参数`blocker`一般都是传入当前类的对象引用`this`，方便排查

  源码：

  ```java
  public static void park(Object blocker) {   
      //获取当前线程  
      Thread t = Thread.currentThread();  
      //将传入的参数blocker对象放入当前线程   
      setBlocker(t, blocker);  
      //挂起线程   
      U.park(false, 0L); 
      //当线程被唤醒后就清除当前线程存储的blocker对象  
      setBlocker(t, null);
  }
  ```

- `void park(Object blocker,long nanos)`方法

  同上，多了超时时间

- `void parkUtil(Object blocker,long deadline)`方法

  同上，只是第二个参数`deadline`不是超时时间，而是某个时间点

使用`LockSupport`类设计一个先进先出锁：

```java
package jucl;import java.util.Queue;import java.util.concurrent.ConcurrentLinkedQueue;import java.util.concurrent.atomic.AtomicBoolean;import java.util.concurrent.locks.LockSupport;public class FIFOMutex {  
    //使用原子变量来作锁标记   
    private final AtomicBoolean locked=new AtomicBoolean(false); 
    //等待队列，用于保存未获取到锁而等待的线程   
    private final Queue<Thread> waiters=new ConcurrentLinkedQueue<>(); 
    //加锁    
    public void locked(){    
    //保存中断标志      
        boolean wasInterrupted=false;   
        //获取当前线程        
        Thread current=Thread.currentThread();   
        //先放入等待队列       
        waiters.add(current);     
        //如果当前等待队列队首不是当前线程，则将当前线程挂起
        //如果当前等待队列队首是当前线程，则CAS操作原子变量，将锁标记设为true，即竞争获取锁，失败的就挂起
        while (waiters.peek()!=current||!locked.compareAndSet(false,true)){ 
            LockSupport.park(this);          
            //如果当前挂起线程被中断唤醒，则保存中断标志然后忽略，重新进入循环  
            if(Thread.interrupted()){        
                wasInterrupted=true;        
            }       
        }   
        //获取到锁的线程，移除等待队列    
        waiters.remove();      
        if(wasInterrupted){        
            //如果线程挂起阶段有被中断，则还原线程挂起阶段的中断标志 
            current.interrupt();      
        }   
    }   
    //解锁  
    public void unlock(){  
        //设置锁标记为false，即释放锁   
        locked.set(false);  
        //然后唤醒等待队列队首的线程     
        LockSupport.unpark(waiters.peek()); 
    }
}
```

### 7.2抽象同步队列AQS概述

#### 7.2.1AQS——锁的底层支持

AQS，即`AbstractQueuedSynchronizer`同步等待队列的简称。JUC包中锁的底层就是使用AQS实现的，其类图结构如下：

![image-20210428164927619](/static/img/image-20210428164927619.png)

由图可知，AQS是一个双向队列，其内部通过节点`head`和`tail`记录队首和队尾元素，队列的元素类型为`Node`：

- `Node`中的`thread`变量用来存放进入AQS队列里面的线程
- `Node`节点内部的`SHARED`用来标记该线程是获取共享资源时被阻塞挂起后放入AQS队列
- `Node`节点内部的`EXCLUSIVE`用来标记线程是否是获取独占资源时被挂起后放入AQS队列
- `Node`节点内部的`waitStatus`用来记录当前线程等待状态，可以为`CANCELLED` （线程被取消了）、`SIGNAL` 线程需要被唤醒）、`CONDITION`（线程在条件队列里面等待）、 `PROPAGATE`（释放共享资源时需要通知其他节点）
- `prev` 记录当前节点的前驱节点， `next`记录当前节点的后继节点

AQS内部维护了一个单一的状态信息`state`，在不同锁的实现中，其表示的含义是不同的：

- 对于`ReentrantLock`类来说，`state`表示当前线程获取锁的可重入次数
- 对于读写锁``ReentrantReadWriterLock`类来说，`state`的高16位表示读状态，即获取该读锁的次数，低16位表示获取到写锁的线程的可重入次数
- 对于`semaphore`类来说，`state`表示当前可用信号的个数
- 对于`CountDownlatch`类来说，`state`表示计数器当前值

AQS有个内部类`ConditionObject`，用来结合锁实现线程同步。`ConditionObject`是条件变量，每个条件变量都对应一个条件队列，用来存放调用条件变量的`await`方法后被阻塞的线程。成员变量`firstWaiter`和`lastWaiter`用来表示这个条件队列的头、尾元素

对于AQS来说，线程同步的关键在于对状态值`state`进行操作，根据`state`是否属于一个线程，操作`state`的方式分为：

- 独占方式

  独占方式下，获取和释放资源的方法为：

  - `void acquire(int arg)`

    `acquire`方法源码如下：

    ```java
    //当一个线程调用该方法获取独占资源时
    public final void acquire(int arg) {   
        //首先调用tryAcquire方法尝试获取资源：
        //1.如果成功则直接返回，acquire方法结束   
        //2.如果失败，则将当前线程封装为类型为Node.EXCLUSIVE的Node节点插入到AQS阻塞队列的尾部，并调用LockSupport.park(this)方法挂起自己，同时忽略其他线程对该线程的中断，并返回中断标志    
        if (!tryAcquire(arg) &&      
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))    
            //acquireQueued方法会返回当前线程的中断标志，如果为true，则调用selfInterrupt()恢复线程的中断标志  
            selfInterrupt();
    }
    ```

  - `void acquireInterruptibly(int arg)`

    同上，只是该方法会对中断进行响应，即当线程在调用该方法获取资源失败被挂起时，其他线程中断了该线程，那么该线程会抛出`InterruptedException`异常而返回

  - `boolean release(int arg)`

    `release`方法源码如下：

    ```java
    //当一个线程调用该方法释放独占资源时
    public final boolean release(int arg) {  
        //首先调用tryRelease方法尝试释放资源：  
        //1.如果失败，则release方法结束，直接返回false  
        //2.如果成功，则执行以下代码，并返回true   
        if (tryRelease(arg)) {     
            Node h = head;      
            //如果当前AQS阻塞队列不为空并且头结点不是初始状态（waitStatus为0，表示该节点是初始状态）     
            if (h != null && h.waitStatus != 0)  
                //则唤醒AQS阻塞队列头结点中保存的线程 
                unparkSuccessor(h);       
            return true;  
        }    return false;
    }
    ```

- 共享方式

  共享方式下，获取和释放资源的方法为：

  - `void acquireShared(int arg)`

    `acquireShared`方法源码如下：

    ```java
    //当一个线程调用该方法获取共享资源时
    public final void acquireShared(int arg) {
        //首先调用tryAcquireShared方法尝试获取资源：
        	//1.如果成功则直接返回，acquireShared方法结束
        	//2.如果失败，则将当前线程封装为类型为Node.SHARED的Node节点插入到AQS阻塞队列的尾部，并调用LockSupport.park(this)方法挂起自己，同时忽略其他线程对该线程的中断
        if (tryAcquireShared(arg) < 0)
            doAcquireShared(arg);
    }
    ```

  - `void acquireSharedInterruptibly(int arg)`

    同上，只是该方法会对中断进行响应，即当线程在调用该方法获取资源失败被挂起时，其他线程中断了该线程，那么该线程会抛出`InterruptedException`异常而返回

  - `boolean releaseShared(int arg)`

    `releaseShared`方法源码如下：

    ```java
    //当一个线程调用该方法释放共享资源时
    public final boolean releaseShared(int arg) {
        //首先调用tryReleaseShared方法尝试释放资源
        	//1.如果失败，则release方法结束，直接返回false
        	//2.如果成功，则执行以下代码，并返回true
        if (tryReleaseShared(arg)) {
            //该方法内部使用LockSupport.park(thread)方法唤醒阻塞队列里的一个线程
            doReleaseShared();
            return true;
        }
        return false;
    }
    ```

**注意**

AQS类中并没有提供可用的`tryAcquire`、`tryAcquireShared`和`tryRelease`、`tryReleaseShared`，这些方法都是需要子类去重写覆盖

AQS阻塞队列的维护：

- 入队操作

  当一个线程获取资源失败后该线程会被转换为对应的`Node`节点，然后调用`enq(final Node node)`方法将该节点插入到AQS阻塞队列中

  `enq`方法源码如下：

  ```java
  private Node enq(Node node) {
      //无限for循环
      //如果队列未初始化，则会先初始化然后再重新进入循环，执行入队操作
      //如果队列是已初始化的，先获取当前尾节点，然后用CAS操作重新设置当前入队节点为尾节点，CAS失败的线程会重新进入循环，重新获取当前尾节点操作
      for (;;) {
          //获取当前尾节点
          Node oldTail = tail;
          if (oldTail != null) {
              //如果尾节点不为空，使用VarHandle以原子操作将当前入队节点的prev指向当前尾节点
              node.setPrevRelaxed(oldTail);
              //使用CAS操作将tail指向当前入队节点node
              if (compareAndSetTail(oldTail, node)) {
                  //如果CAS操作成功，将原尾节点的next指向当前入队节点
                  oldTail.next = node;
                  //然后返回原尾节点
                  return oldTail;
              }
          } else {
              //如果当前尾节点为空，则说明队列未初始化
              //需要先初始化阻塞队列
              initializeSyncQueue();
          }
      }
  }
  ```

#### 7.2.2AQS——条件变量的支持

对于内置锁`synchronized`来说，`notify`和`wait`系列方法是配合该锁实现线程间同步，而条件变量`ConditionObject`对象的`signal`和`await`系列方法也是用来配合锁（使用AQS实现的锁）实现线程间同步

使用AQS实现的锁与内置锁`synchronized`的区别：

`synchronized`同时只能与一个共享变量的`notify`或`wait`方法实现同步，而AQS的一个锁可以对应多个条件变量

条件变量的使用：

```java
package jucl;

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ConditionObjectTest {
    //创建一个独占锁对象
    ReentrantLock lock=new ReentrantLock();
    //使用独占锁对象的newCondition()方法即可为该锁构建一个条件变量
    Condition conditionObject= lock.newCondition();
    public void await(){
        //加锁
        lock.lock();
        try {
            System.out.println("begin wait");
            //await方法挂起当前线程
            //同样地，如果当前线程没有获取到锁前调用了条件变量的awiat方法会抛出异常
            conditionObject.await();
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            //最后解锁
            lock.unlock();
        }
    }
    public void signal(){
        //加锁
        lock.lock();
        try{
            System.out.println("begin signal");
            //唤醒条件变量中的某一个挂起线程
            //同样地，如果当前线程没有获取到锁前调用了条件变量的signal方法会抛出异常
            conditionObject.signal();
            System.out.println("end signal");
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            //最后释放锁
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        ConditionObjectTest c=new ConditionObjectTest();
        new Thread(new Runnable() {
            @Override
            public void run() {
                c.await();
            }
        });
        new Thread(new Runnable() {
            @Override
            public void run() {
                c.signal();
            }
        }).start();
    }
}

```

一个条件变量`ConditionObject`也就对应着一个条件队列，如果线程了调用条件变量的`await`方法，就会将该线程放入条件变量对应的条件队列中；当另外一个线程调用条件变量的`signal`或者`signalAll`方法，就会把条件变量对应的条件队列里的一个或者全部线程移出并重新放入AQS的阻塞队列中

**总结**

一个锁对应一个AQS阻塞队列，对应多个条件变量，每个条件变量有自己的一个条件队列

![image-20210430163853067](/static/img/image-20210430163853067.png)

### 7.3独占锁`ReentrantLock`的原理

#### 7.3.1类图结构

`ReentrantLock`是可重入的独占锁，其内部是使用AQS来实现的，同一时间只有一个线程可以获取锁，其他获取锁的线程会被阻塞而被放入该锁的AQS阻塞队列里面

`ReentrantLock`类图结构如下：

![image-20210430175106584](/static/img/image-20210430175106584.png)

由图可知，`ReentrantLock`类有三个内部类，其中内部类`Sync`继承了AQS，内部类`NonfairSync`和`FairSync`继承了`Sync`，用于实现非公平锁和公平锁。

`ReentrantLock`类根据传入的参数决定创建的是公平锁还是非公平锁。默认地，使用无参构造器构造一个`ReentrantLock`对象，创建的是一个非公平锁

```java
public ReentrantLock() {
    sync = new NonfairSync();
}

public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

**在`ReentrantLock`类中，AQS的`state`状态值表示一个线程获取该锁的可重入次数**

#### 7.3.2获取锁

- `void lock()`方法

  当一个线程调用该方法时，说明该线程希望获取锁：

  - 如果锁当前没有被其他线程占用并且当前线程之前没有获取过该锁，则当前线程会获取到该锁，然后设置当前锁的拥有者为当前线程，并设置AQS的`state`值为1，然后返回
  - 如果当前线程之前已经获取过该锁，则这次只是简单地将AQS的`state`值加1后返回
  - 如果该锁已经被其他线程持有，则调用该方法的线程会被放入AQS队列后阻塞挂起

  源码：

  ```java
  public void lock() {
      //ReentrantLock将获取锁的方法委托给了内部类Sync的acquire方法
      //传入参数1，表示要获取锁的次数
      sync.acquire(1);
  }
  
  //内部类Sync的acquire方法源码
  public final void acquire(int arg) {
      //与AQS不同，内部类Sync继承了AQS并重写了tryAcquire方法
      //由于多态，此处会根据ReentrantLock的具体实现（公平锁/非公平锁）调用对应子类的tryAcquire方法
      if (!tryAcquire(arg) &&
          //tryAcquire方法如果返回false，则会把当前线程放入AQS阻塞队列
          acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
          selfInterrupt();
  }
  ```

  `ReentrantLock`不同实现对应的`tryAcquire`方法源码：

  - 非公平锁

    ```java
    protected final boolean tryAcquire(int acquires) {
        //ReentrantLock将非公平锁的tryAcquire方法委托给了内部类Sync的nonfairTryAcquire方法
        return nonfairTryAcquire(acquires);
    }
    
    //内部类Sync的nonfairTryAcquire方法源码
    final boolean nonfairTryAcquire(int acquires) {
        //获取当前线程
        final Thread current = Thread.currentThread();
        //读AQS当前的state值，state被volatile修饰
        int c = getState();
        //如果state值为0，说明锁未被任何线程获取
        if (c == 0) {
            //使用CAS操作尝试将state的值设置为1
            //如果CAS操作失败，直接返回false，方法结束
            if (compareAndSetState(0, acquires)) {
                //如果CAS操作成功，则设置锁的拥有者为当前线程
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        //如果state值不为0，说明锁已经被线程获取了
        //判断当前线程是否为锁的拥有者
        //如果不是，则直接返回false，方法结束
        else if (current == getExclusiveOwnerThread()) {
            //如果当前线程是锁的拥有者，则计算state加1后的值
            int nextc = c + acquires;
            //如果state加1后的值溢出，则抛出异常
            if (nextc < 0) // overflow
                throw new Error("Maximum lock count exceeded");
            //设置state的值为state加1后的值
            setState(nextc);
            return true;
        }
        return false;
    }
    ```

  - 公平锁

    ```java
    protected final boolean tryAcquire(int acquires) {
        //获取当前线程
        final Thread current = Thread.currentThread();
        //读AQS当前的state值
        int c = getState();
        //如果state值为0，说明锁未被任何线程获取
        if (c == 0) {
            //判断当前AQS阻塞队列中的当前线程节点是否有前驱节点，如果有，则直接返回false，方法结束
            //如果没有，则用CAS操作尝试将state的值设置为1
            //如果CAS操作失败，直接返回false，方法结束    
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                //如果CAS操作成功，则设置锁的拥有者为当前线程
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        //同非公平锁
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
    
    //内部类Sync的hasQueuedPredecessors方法源码
    public final boolean hasQueuedPredecessors() {
        Node h, s;
        //如果头节点为空，说明当前AQS阻塞队列为空，则直接返回false，方法结束
        if ((h = head) != null) {
            //如果头节点的下一个节点为空或者头结点的下一个节点不为空且为被CANCELLED状态（等待超时或中断）
            if ((s = h.next) == null || s.waitStatus > 0) {
                s = null; // traverse in case of concurrent cancellation
                //从AQS阻塞队列尾部向前遍历，找到最靠前的等待运行状态的节点
                for (Node p = tail; p != h && p != null; p = p.prev) {
                    if (p.waitStatus <= 0)
                        s = p;
                }
            }
            //如果最靠前的等待运行状态的节点不为空，并且该节点保存的线程和当前线程一致，则返回true，方法结束
            //否则返回false，方法结束
            if (s != null && s.thread != Thread.currentThread())
                return true;
        }
        return false;
    }
    ```

#### 7.3.3释放锁

- `void unlock()`方法

  当一个线程调用该方法时，说明该线程希望释放锁：

  - 如果当前线程持有该锁，则调用该方法会让该锁内部的AQS的`state`值减1
  - 如果该锁内部的AQS的`state`值减1后为0，则当前线程会释放该锁，否则只是减1
  - 如果当前线程没有持有该锁而调用了该方法，则会抛出`IllegalMonitorStateException`异常

  源码：

  ```java
  public void unlock() {
      //ReentrantLock将释放锁的方法委托给了内部类Sync的release方法
      //传入参数1，表示要释放锁的次数
      sync.release(1);
  }
  
  //内部类Sync的release方法
  public final boolean release(int arg) {
      //调用内部类Sync重写的tryRelease方法
      if (tryRelease(arg)) {
          //如果tryReleas方法返回true，则唤醒当前AQS阻塞队列的头结点所保存的线程
          Node h = head;
          if (h != null && h.waitStatus != 0)
              unparkSuccessor(h);
          return true;
      }
      return false;
  }
  ```

  内部类Sync重写的`tryRelease`方法源码：

  ```java
  protected final boolean tryRelease(int releases) {
      //读取当前AQS的state的值并计算其减1后的值
      int c = getState() - releases;
      //如果当前线程不是该锁的持有者，则抛出异常
      if (Thread.currentThread() != getExclusiveOwnerThread())
          throw new IllegalMonitorStateException();
      boolean free = false;
      //如果state减1后的值为0，则将该锁的持有者设置为空，方法返回true
      //如果不为0，则方法返回false
      if (c == 0) {
          free = true;
          setExclusiveOwnerThread(null);
      }
      //设置state的值为state减1后的值
      setState(c);
      return free;
  }
  ```

### 7.4读写锁ReentrantReadWriteLock原理

#### 7.4.1类图结构

![image-20210506105117804](/static/img/image-20210506105117804.png)

由图可知，`ReentrantReadWriteLock`内部维护了一个`ReadLock`和一个`WriteLock`，它们都继承自内部类`Sync`，而`Sync`继承自AQS，并且也提供了公平和非公平的实现

**在`ReentrantReadWriteLock`中，AQS的`state`值的高16位表示所有线程获取读锁次数的总和，低16位表示获取到写锁的线程的可重入次数**

#### 7.4.2写锁的获取与释放

在`ReentrantReadWriteLock`中写锁使用内部类`WriteLock`来实现

- `void lock()`

  写锁是一个独占锁，某时只有一个线程可以获取该锁：

  - 如果当前没有线程获取到读锁或写锁，则当前线程可以获取到写锁然后返回
  - 如果当前已经有线程获取到读锁或写锁，则当前请求写锁的线程会被阻塞挂起
  - 写锁和读锁都是可重入锁，如果当前线程已经获取了该锁，再次获取只是简单地把可重入次数加1后直接返回

  源码：

  ```java
  public void lock() {
      //ReentrantLock将获取写锁的方法委托给了内部类Sync的acquire方法
      //传入参数1，表示要获取写锁的次数
      sync.acquire(1);
  }
  
  //内部类Sync的acquire方法源码
  public final void acquire(int arg) {
      //与AQS不同，内部类Sync继承了AQS并重写了tryAcquire方法
      if (!tryAcquire(arg) &&
          //tryAcquire方法如果返回false，则会把当前线程放入AQS阻塞队列
          acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
          selfInterrupt();
  }
  ```

  内部类`Sync`重写的`tryAcquire`方法：

  ```java
  protected final boolean tryAcquire(int acquires) {
      //获取当前线程
      Thread current = Thread.currentThread();
      //读取AQS的state值
      int c = getState();
      //获取写锁的可重入次数
      int w = exclusiveCount(c);
      //如果state值不为0说明读锁或者写锁已经被某线程获取
      if (c != 0) {
          //如果写锁的可重入次数为0，说明没有线程获取写锁，但是有线程获取了读锁，直接返回false，方法结束
          //如果写锁的可重入次数不为0，则判断写锁的拥有者是否为当前线程，如果不是，直接返回false，方法结束
          if (w == 0 || current != getExclusiveOwnerThread())
              return false;
          //代码到此处，说明当前线程获取了写锁，判断写锁的可重入次数加1后是否超过最大次数，如果是则抛出异常
          if (w + exclusiveCount(acquires) > MAX_COUNT)
              throw new Error("Maximum lock count exceeded");
          //设置AQS的state值为state加1后的值
          setState(c + acquires);
          return true;
      }
      //如果state值为0，说明当前没有线程获取到读锁和写锁
     	//由于多态，此处会根据读写锁的具体实现（公平锁/非公平锁）调用对应子类的writerShouldBlock方法
      if (writerShouldBlock() ||
          //如果writerShouldBlock方法返回false，则使用CAS操作将state的值加1，如果失败，直接返回false，方法结束
          !compareAndSetState(c, c + acquires))
          return false;
      //设置写锁的拥有者为当前线程
      setExclusiveOwnerThread(current);
      return true;
  }
  ```

  读写锁不同实现对应的`writerShouldBlock()`方法源码：

  - 非公平锁

    ```java
    final boolean writerShouldBlock() {
        //对于非公平锁来说，该方法永远返回false
        return false;
    }
    ```

  - 公平锁

    ```java
    final boolean writerShouldBlock() {
        //对于公平锁来说，该方法被委托给hasQueuedPredecessors()来完成
        return hasQueuedPredecessors();
    }
    ```

- `void unlock()`

  尝试释放锁：

  - 如果当前线程持有该锁，则调用该方法会让该锁内部的AQS的`state`值减1
  - 如果该锁内部的AQS的`state`值减1后为0，则当前线程会释放该锁，否则只是减1
  - 如果当前线程没有持有该锁而调用了该方法，则会抛出`IllegalMonitorStateException`异常

  源码：

  ```java
  public void unlock() {
      //读写锁将释放写锁的方法委托给了内部类Sync的release方法
      //传入参数1，表示要释放写锁的次数
      sync.release(1);
  }
  
  //内部类Sync的release方法
  public final boolean release(int arg) {
      //调用内部类Sync重写的tryRelease方法
      if (tryRelease(arg)) {
          //如果tryReleas方法返回true，则唤醒当前AQS阻塞队列的头结点所保存的线程
          Node h = head;
          if (h != null && h.waitStatus != 0)
              unparkSuccessor(h);
          return true;
      }
      return false;
  }
  ```

  内部类Sync重写的`tryRelease`方法源码：

  ```java
  protected final boolean tryRelease(int releases) {
      //判断当前线程是否为写锁的拥有者，如果不是则抛出异常
      if (!isHeldExclusively())
          throw new IllegalMonitorStateException();
      //读取当前AQS的state的值并计算其减1后的值
      int nextc = getState() - releases;
      //如果state减1后的值为0，则将该锁的持有者设置为空，方法返回true
      //如果不为0，则方法返回false
      boolean free = exclusiveCount(nextc) == 0;
      if (free)
          setExclusiveOwnerThread(null);
      //设置state值为state减1
      setState(nextc);
      return free;
  }
  ```

#### 7.4.3读锁的获取与释放

在`ReentrantReadWriteLock`中写锁使用内部类`ReadLock`来实现

- `void lock()`

  读锁是一个共享锁：

  - 如果当前没有其他线程持有写锁，则当前线程可以获取读锁，AQS的`state`的高16位的值会加1，然后方法返回
  - 否则如果其他一个线程持有写锁，则对当前线程会被阻塞

  源码：

  ```java
  public void lock() {    
      //读写锁将获取读锁的方法委托给了内部类Sync的acquireShared方法   
      //传入参数1，表示要获取读锁的次数    
      sync.acquireShared(1);
  }
  
  //内部类Sync的acquireShared方法源码
  public final void acquireShared(int arg) {    
      //与AQS不同，内部类Sync继承了AQS并重写了tryAcquire方法    
      if (tryAcquireShared(arg) < 0)        
          //调用AQS的doAcquireShared方法        
          doAcquireShared(arg);
  }
  ```

  内部类Sync重写的`tryAcquireShared`方法源码：

  ```java
  protected final int tryAcquireShared(int unused) { 
      //获取当前线程    
      Thread current = Thread.currentThread();    
      //读取AQS的state值  
      int c = getState();   
      //如果写锁被占用，并且当前线程不是写锁的拥有者，则返回-1，方法结束 
      //否则：    	
      	//1.写锁未被占用   		
      	//2.写锁被占用但是写锁的持有者为当前线程   
     	//此时方法能够继续运行    
      if (exclusiveCount(c) != 0 &&        
          getExclusiveOwnerThread() != current)   
          return -1;    
      //获取读锁计数   
      int r = sharedCount(c); 
      //尝试获取读锁   
      //如果readerShouldBlock方法返回false并且读锁计数小于最大次数并且CAS操作设置state高16位值加1成功，方法会继续运行   
      //否则，即条件判断失败的线程会进入fullTryAcquireShared方法中进行重试  
      if (!readerShouldBlock() &&   
          r < MAX_COUNT &&  
          compareAndSetState(c, c + SHARED_UNIT)) {
          //如果读锁计数为0，说明这是第一个线程获取读锁    
          if (r == 0) {        
              //使用成员变量firstReader来保存第一个获取到读锁的线程       
              firstReader = current;          
              //使用成员变量firstReaderHoldCount来保存第一个获取到读锁的线程获取读锁的可重入次数 
              firstReaderHoldCount = 1;       
          } else if (firstReader == current) {
              //如果读锁计数不为0，则说明已经有线程获取了读锁，并且如果当前线程是第一个获取到读锁的线程，则将其可重入次数加1           
              firstReaderHoldCount++;     
          } else {         
              //如果读锁计数不为0并且当前线程也不是第一个获取到读锁的线程，则记录每一个线程获取读锁的可重入次数            
              //成员变量cachedHoldCounter记录了最后一个获取读锁的线程获取读锁的可重入次数           
              HoldCounter rh = cachedHoldCounter;       
              //如果cachedHoldCounter为空，或者cachedHoldCounter不为空但是当前线程不是最后一个获取读锁的线程，则将当前线程获取读锁的可重入次数放入cachedHoldCounter中，此时当前即最后一个获取读锁的线程            
              if (rh == null ||     
                  rh.tid != LockSupport.getThreadId(current))
                  //readHolds是ThreadLock变量，用于保存除第一个获取读锁线程外的其他线程获取读锁的可重入次数               
                  cachedHoldCounter = rh = readHolds.get();    
              else if (rh.count == 0)            
                  readHolds.set(rh);            
              //当前线程获取读锁的可重入次数加1            
              rh.count++;       
          }        
          return 1;    
      }    
      //fullTryAcquireShared方法与tryAcquireShared方法类似，进入该方法的线程会通过自循环旋获取读锁 
      return fullTryAcquireShared(current);
  }
  ```

  读写锁不同实现对应的`readerShouldBlock()`方法源码：

  - 非公平锁

    ```java
    final boolean readerShouldBlock() {
        //对于非公平锁来说，该方法被委托给AQS的apparentlyFirstQueuedIsExclusive方法实现
        return apparentlyFirstQueuedIsExclusive();
    }
    
    //AQS的apparentlyFirstQueuedIsExclusive方法源码
    final boolean apparentlyFirstQueuedIsExclusive() {
        Node h, s;
        //如果当前AQS队列不为空并且AQS队列节点数大于1并且头结点的下一个节点是因为获取写锁而被放入阻塞队列中并且头结点的下一个节点保存的线程不为空，则返回true，否则返回false
        return (h = head) != null &&
            (s = h.next)  != null &&
            !s.isShared()         &&
            s.thread != null;
    }
    ```

  - 公平锁

    ```java
    final boolean readerShouldBlock() {
        return hasQueuedPredecessors();
    }
    ```

- `void unlock()`

  源码：

  ```java
  public void unlock() {
      //读写锁将释放读锁的方法委托给了内部类Sync的releaseShared方法
      //传入参数1，表示要释放读锁的次数
      sync.releaseShared(1);
  }
  
  //内部类Sync的releaseShared方法
  public final boolean releaseShared(int arg) {
      //首先调用tryReleaseShared方法尝试释放资源
      	//1.如果失败，则release方法结束，直接返回false
      	//2.如果成功，则执行以下代码，并返回true
      if (tryReleaseShared(arg)) {
          doReleaseShared();
          return true;
      }
      return false;
  }
  ```

  内部类Sync重写的`tryReleaseShared`方法源码：

  ```java
  protected final boolean tryReleaseShared(int unused) {
      //获取当前线程
      Thread current = Thread.currentThread();
      //如果当前线程是第一个获取读锁的线程
      if (firstReader == current) {
          //如果第一个获取读锁的线程的可重入次数为1，则将firstReader成员变量置空
          if (firstReaderHoldCount == 1)
              firstReader = null;
          //否则，将第一个获取读锁的线程的可重入次数减1
          else
              firstReaderHoldCount--;
       //如果当前线程不是第一个获取读锁的线程，则照例将它们的可重入次数减1
      } else {
          HoldCounter rh = cachedHoldCounter;
          if (rh == null ||
              rh.tid != LockSupport.getThreadId(current))
              rh = readHolds.get();
          int count = rh.count;
          if (count <= 1) {
              readHolds.remove();
              if (count <= 0)
                  throw unmatchedUnlockException();
          }
          --rh.count;
      }
      //无限循环自旋
      for (;;) {
          //获取当前AQS的state值
          int c = getState();
          //计算state高16位减1后的值
          int nextc = c - SHARED_UNIT;
          //使用CAS操作将state值设置为state高16位减1后的值
          	//1.如果CAS成功且当前state高16位的值为0，则返回true，否则返回false
          	//2.如果CAS失败，则无限循环自旋，直到CAS更新成功为止
          if (compareAndSetState(c, nextc))
              return nextc == 0;
      }
  }
  ```
  
- 锁降级

  即写锁降级为读锁。如果当前线程拥有写锁，再获取读锁，随后释放先前拥有的写锁的过程就是锁降级

## 8.JUC包中并发队列原理剖析

JDK中的并发安全队列可以按照实现方式的不同分为：

- 阻塞队列

  使用锁实现

- 非阻塞队列

  使用循环CAS实现

### 8.1ConcurrentLinkedQueued原理探究

`ConcurrentLinkedQueued`是线程安全的无界非阻塞队列，其底层使用单向链表实现

#### 8.1.1类图结构

![image-20210506195515047](/static/img/image-20210506195515047.png)

#### 8.1.2ConcurrentLinkedQueue原理介绍

- 入队列的过程

  - 添加元素1。队列更新`head`节点的`next`节点为元素1节点。又因为`tail`节点默认情况下等于`head`节点，所以它们的`next`节点都指向元素1节点
  - 添加元素2。队列首先设置元素1节点的`next`节点为元素2节点，然后更新`tail`节点指向元素2节点
  - 添加元素3。设置`tail`节点的`next`节点为元素3节点
  - 添加元素4。设置元素3的`next`节点为元素4节点，然后将`tail`节点指向元素4节点
  
  ![image-20210506201437763](/static/img/image-20210506201437763.png)
  
- 入队主要做的两件事

  - 将入队节点设置成当前队尾节点的下一个节点
  - 更新`tail`节点：
    - 如果`tail`节点的`next`节点不为空，则将入队节点设置成`tail`节点
    - 如果`tail`节点的`next`节点为空，则将入队节点设置成`tail`节点的`next`节点

  **综上，`tail`节点在`ConcurrentLinkedQueue`中并不总是尾节点**

- `offer`方法源码

  ```java
  public boolean offer(E e) {
      //使用传入的参数创建一个入队节点，并且对该参数进行检查，确保传入的参数为null时会抛出异常
      final Node<E> newNode = new Node<E>(Objects.requireNonNull(e));
      //无限循环
      for (Node<E> t = tail, p = t;;) {
          //获取tail节点的下一个节点
          Node<E> q = p.next;
          //如果tail节点的下一个节点为空
          if (q == null) {
              //使用CAS操作将tail节点的下一个节点设置成入队节点
              //CAS失败的线程会重新进入循环获取最新的tail节点
              if (NEXT.compareAndSet(p, null, newNode)) {
                  //判断当前tail节点是不是尾节点
                  if (p != t) // hop two nodes at a time; failure is OK
                      //如果不是，则将入队节点设为tail节点
                      TAIL.weakCompareAndSet(this, t, newNode);
                  return true;
              }
          }
          //如果p的next为自身，说明tail节点已经脱离队列，需要重新定位头结点
          else if (p == q)
              p = (t != (t = tail)) ? t : head;
          //如果tail节点的下一个节点不为null且两者不等
          else
              //定位尾节点，方便下一次元素插入
              p = (p != t && t != (t = tail)) ? t : q;
      }
  }
  ```
  
- 出队列

  `ConcurrentLinkedQueue`并不是每次出队时都更新`head`节点：

  - 当`head`节点里有元素时，直接弹出`head`节点里的元素，而不会更新`head`节点
  - 当`head`节点里没有元素时，出队操作才会更新`head`节点

  ![image-20210507085630464](/static/img/image-20210507085630464.png)

- `poll`方法源码

  ```java
  public E poll() {
      restartFromHead: for (;;) {
          //每次迭代，p=q都使p指向下一个元素
          for (Node<E> h = head, p = h, q;; p = q) {
              final E item;
              //如果head节点中元素不为空，则使用CAS操作将head节点中的元素设为空
              if ((item = p.item) != null && p.casItem(item, null)) {
                  //更新头结点
                  if (p != h) // hop two nodes at a time
                      updateHead(h, ((q = p.next) != null) ? q : p);
                  return item;
              }
              //如果head节点中元素为空并且head节点的下一个节点为空，则说明当前队列已经空了
              else if ((q = p.next) == null) {
                  //更新头结点
                  updateHead(h, p);
                  return null;
              }
              //如果p节点自引用了，则重新进入循环，寻找新的队列头结点
              else if (p == q)
                  continue restartFromHead;
          }
      }
  }
  
  //updateHead方法源码
  final void updateHead(Node<E> h, Node<E> p) {
      //如果h不等于p，则使用CAS操作将head节点指向p节点
      if (h != p && HEAD.compareAndSet(this, h, p))
          //如果CAS成功则让h节点自引用
          NEXT.setRelease(h, h);
  }
  ```

### 8.2LinkedBlockingQueue原理探究

`LinkedBlockingQueue`是使用独占锁实现的有界阻塞队列，底层数据结构也是单向链表

#### 8.2.1类图结构

![image-20210507130825369](/static/img/image-20210507130825369.png)

`LinkedBlockingQueue`内部采用两个`ReentrantLock`锁实例，来分别控制元素入队和出队的原子性：

- `takeLock`用来控制同时只有一个线程可以从队列头获取元素，其他线程必须等待
- `putLock`用来控制同时只有一个线程可以在队列尾添加元素，其他线程必须等待

`LinkedBlockingQueue`内部采用两个条件变量，来分别存放进出队被阻塞的线程：

- `notEmpty`中的条件队列用来存放执行出队操作被阻塞的线程
- `notFull`中的条件队列用来存放执行入队操作被阻塞的线程

#### 8.2.2LinkedBlockingQueue原理介绍

- `put`操作

  - 向队尾插入一个元素，如果队列中有空闲则插入后直接返回
  - 如果队列已满则阻塞当前线程，直到队列有空闲插入成功后返回
  - 如果在阻塞时被其他线程设置了中断标志，则被阻塞线程会抛出`InterruptedException`异常而返回
  - 如果插入的元素为`null`，则会抛出NPE异常

  `put`方法源码：

  ```java
  public void put(E e) throws InterruptedException {
      //判断插入元素是否为null
      if (e == null) throw new NullPointerException();
      final int c;
      //创建入队节点
      final Node<E> node = new Node<E>(e);
      //获取入队锁putLock
      final ReentrantLock putLock = this.putLock;
      //获取计算队列元素的原子变量count
      final AtomicInteger count = this.count;
      //加锁且会对中断做出响应
      putLock.lockInterruptibly();
      try {
          //如果队列已满
          while (count.get() == capacity) {
              //则将当前线程放入notFull条件队列中挂起
              notFull.await();
          }
          //如果队列中还有空闲位置，则将节点入队
          enqueue(node);
          //递增队列元素的计数器count并返回递增前的值
          c = count.getAndIncrement();
          //如果递增后队列元素的个数还是小于最大容量
          if (c + 1 < capacity)
              //则唤醒notFull条件队列中的一个线程，通知它可以进行入队操作
              notFull.signal();
      } finally {
          //最后释放入队锁
          putLock.unlock();
      }
      //如果c为0，则说明执行完入队操作后队列里至少有一个元素
      if (c == 0)
          //唤醒notEmpty条件队列中的一个线程，通知它可以进行出队操作
          signalNotEmpty();
  }
  
  //signalNotEmpty方法源码
  private void signalNotEmpty() {
      final ReentrantLock takeLock = this.takeLock;
      takeLock.lock();
      try {
          //要唤醒notEmpty条件队列中的一个线程，需要先获取出队锁takeLock才能进行操作
          notEmpty.signal();
      } finally {
          takeLock.unlock();
      }
  }
  ```

- `take`操作

  - 如果队列为空则阻塞当前线程直到队列不为空然后返回元素
  - 如果在阻塞时被其他线程设置了中断标志，则被阻塞线程会抛出`InterruptedException`异常而返回

  `take`方法源码：

  ```java
  public E take() throws InterruptedException {
      final E x;
      final int c;
      //获取计算队列元素的原子变量count
      final AtomicInteger count = this.count;
      //获取出队锁takeLock
      final ReentrantLock takeLock = this.takeLock;
      //加锁且会对中断做出响应
      takeLock.lockInterruptibly();
      try {
          //如果当前队列元素个数为0
          while (count.get() == 0) {
              //则将当前线程放入notEmpty条件队列中挂起
              notEmpty.await();
          }
          //如果当前队列元素个数不为0，则将头结点出队
          x = dequeue();
          //递减队列元素的计数器count并返回递减前的值
          c = count.getAndDecrement();
          //如果c大于1，则说明执行完出队操作后，队列不为空
          if (c > 1)
              //唤醒notEmpty条件队列中的一个线程，通知它执行出队操作
              notEmpty.signal();
      } finally {
          //最后释放出队锁
          takeLock.unlock();
      }
      //如果c为最大容量，则说明执行完出队操作后，队列中至少有一个空闲位置
      if (c == capacity)
          //唤醒notFull条件队列中的一个线程，通知它执行入队操作
          signalNotFull();
      return x;
  }
  
  //signalNotFull方法源码
  private void signalNotFull() {
      final ReentrantLock putLock = this.putLock;
      putLock.lock();
      try {
          //要唤醒notFull条件队列中的一个线程，需要先获取入队锁putLock才能进行操作
          notFull.signal();
      } finally {
          putLock.unlock();
      }
  }
  ```

- `remove`操作

  删除队列里指定的元素，有则删除并返回`true`，没有则返回`false`

  ```java
  public boolean remove(Object o) {
      //如果删除的元素为null，则直接返回false
      if (o == null) return false;
      //获取双重锁，获取后，其他线程进行入队或出队操作就会被阻塞挂起
      fullyLock();
      try {
          //遍历队列找到则删除并返回true
          for (Node<E> pred = head, p = pred.next;
               p != null;
               pred = p, p = p.next) {
              if (o.equals(p.item)) {
                  unlink(p, pred);
                  return true;
              }
          }
          //找不到返回false
          return false;
      } finally {
          //最后释放双重锁
          fullyUnlock();
      }
  }
  
  //fullyLock方法源码
  void fullyLock() {
      //获取入队、出队两把锁
      putLock.lock();
      takeLock.lock();
  }
  
  //unlink方法源码
  void unlink(Node<E> p, Node<E> pred) {
      //出队节点保存的元素置空
      p.item = null;
      //令出队节点的上一个节点指向出队节点的下一个节点
      pred.next = p.next;
      //如果出队节点是尾节点
      if (last == p)
          //则将尾节点指向出队节点的上一个节点
          last = pred;
      //递减队列元素的计数器count并返回递减前的值
      if (count.getAndDecrement() == capacity)
          //如果删除前的元素个数为最大容量，则说明执行完删除操作后，队列中至少有一个空闲位置
          notFull.signal();
  }
  ```

## 9.Java中线程池的线程池

合理使用线程池可以带来3个好处：

- 降低资源消耗。通过重复利用已创建的线程降低线程创建和销毁造成的消耗
- 提高响应速度。当任务到达时，任务可以不需要等到线程创建就能立即执行
- 提高线程的可管理性。由线程池进行统一分配、调优和监控

### 9.1线程池的实现原理

当提交一个新任务到线程池中，线程池的处理流程如下：

- 线程池判断核心线程池里的线程是否都在执行任务：
  - 如果不是，则创建一个新的工作线程来执行任务
  - 如果是，则进入下个流程
- 线程池判断工作队列是否已经满：
  - 如果没有，则将新提交的任务存储在这个工作队列里
  - 如果满了，则进入下个流程
- 线程池判断线程池的线程是否都处于工作状态：
  - 如果没有，则创建一个新的工作线程来执行任务
  - 如果是，则交给饱和策略来处理这个任务

![image-20210507203737765](/static/img/image-20210507203737765.png)

线程池状态含义：

- `RUNNING`：接受新任务并且处理阻塞队列里的任务
- `SHUTDOWN`：拒绝新任务但是处理阻塞队列里的任务
- `STOP`：拒绝新任务并且抛弃阻塞队列里的任务，同时会中断正在处理的任务
- `TIDYING`：所有任务都执行完（包含阻塞队列里的任务）后当前线程池活动线程数为0，将要调用`terminated`方法
- `TERMINATED`：终止状态。`terminated`方法调用完成后的状态

### 9.2源码分析

线程池类`ThreadPoolExecutor`的 `execute`方法的作用是提交任务`command`到线程池进行执行

![image-20210508092616670](/static/img/image-20210508092616670.png)

`ThreadPoolExecutor`执行`execute`方法分为下面4种情况：

1. 如果当前运行的线程少于`corePoolSize`，则创建新线程来执行任务（该步骤的执行，需要获取全局锁）
2. 如果运行的线程等于或多于`corePoolSize`，则将任务加入`BlockingQueue`
3. 如果无法将任务加入`BlockingQueue`（队列已满），则创建新的线程来处理任务（该步骤的执行，需要获取全局锁）
4. 如果创建新线程将使当前运行的线程数超出`maximumPoolSize`，任务将被拒绝，并调用`RejectedExecutionHandler.rejectedExecution()`方法

#### 9.2.1`execute`方法

用于执行提交的任务

- 源码

  ```java
  public void execute(Runnable command) {
      //如果传入的任务为空，则抛出异常
      if (command == null)
          throw new NullPointerException();
      //获取当前线程池状态+线程个数变量的组合值
      int c = ctl.get();
      //如果当前线程池中的线程个数小于corePoolSize
      if (workerCountOf(c) < corePoolSize) {
          //则新增线程运行
          if (addWorker(command, true))
              return;
          c = ctl.get();
      }
      //如果线程池处于RUNNING状态并且当前线程池中的线程个数不小于corePoolSize，则添加任务到阻塞队列
      if (isRunning(c) && workQueue.offer(command)) {
          //如果成功添加任务到阻塞队列中，则再次获取当前线程池状态+线程个数变量的组合值，以便进行二次检查
          int recheck = ctl.get();
          //再次检查当前线程池状态是否处RUNNING，如果不是，则从阻塞队列中删除任务，并执行拒绝策略
          if (! isRunning(recheck) && remove(command))
              reject(command);
          //否则如果当前线程池为空，则添加一个线程
          else if (workerCountOf(recheck) == 0)
              addWorker(null, false);
      }
      //如果任务添加到阻塞队列失败，说明阻塞队列已满，或者线程池不是RUNNING状态，则新增线程来处理任务
      else if (!addWorker(command, false))
          //如果新增线程失败，则执行拒绝策略
          reject(command);
  }
  ```

- 总结：

  - 任务非空校验
  - 获取线程池的线程数量和运行状态，并进行比较判断：
    - 如果线程数量小于核心线程数，则尝试新增一个核心线程来执行此任务：
      - 如果新增成功，则方法结束
      - 如果新增失败，说明并发情况下线程池发生了变化，则重新获取线程数量和运行状态，方法继续向下运行
    - 如果线程数量大于等于核心线程数并且处于`Running`态，则尝试将任务添加到阻塞队列
      - 如果添加成功，则二次校验线程池的运行状态，因为可能存在有些线程在我们上次检查后死了，或者线程池被关闭了
        - 如果二次校验，线程池是非`Running`态，则将任务从阻塞队列中移除，并执行拒绝策略
        - 否则，说明线程池是`Running`态，则判断线程池中的线程个数是否为0，如果为0，则需要新增一个线程让其从阻塞队列中去取任务来运行
    - 否则，说明阻塞队列已满或者线程池处于非`Running`态，则尝试新增线程来执行此任务
      - 如果新增线程失败，说明线程个数已达最大线程数或者线程池已关闭，则执行拒绝策略

#### 9.2.2`addWorker`方法

用于新增线程

- 源码

  ```java
  private boolean addWorker(Runnable firstTask, boolean core) {
      retry:
      //外层无限循环
      for (int c = ctl.get();;) {
          //1.如果当前线程池状态为STOP、TIDYING或者TERMINATED，则直接返回false，方法结束
          //2.如果当前线程池状态为SHUTDOWN并且已经有了第一个任务，则直接返回false，方法结束
          //3.如果当前线程池状态为SHUTDOWN并且任务队列为空，则直接返回false，方法结束
          if (runStateAtLeast(c, SHUTDOWN)
              && (runStateAtLeast(c, STOP)
                  || firstTask != null
                  || workQueue.isEmpty()))
              return false;
  		//内层无限循环CAS增加线程个数
          for (;;) {
              //如果创建的是核心线程，则判断当前线程池中的线程个数是否大于核心线程的数量
              //如果创建的是普通线程，则判断当前线程池中的线程个数是否大于线程的最大数量
              //如果是，则直接返回false，方法结束
              if (workerCountOf(c)
                  >= ((core ? corePoolSize : maximumPoolSize) & COUNT_MASK))
                  return false;
              //使用CAS操作增加线程个数，同时只会有一个线程成功
              if (compareAndIncrementWorkerCount(c))
                  //CAS成功的线程，退出循环
                  break retry;
              //如果CAS失败了，则再次获取线程池状态
              c = ctl.get();  // Re-read ctl
              //判断当前线程池状态是否变化，如果是非RUNNING，则跳至外层循环
              if (runStateAtLeast(c, SHUTDOWN))
                  continue retry;
              // else CAS failed due to workerCount change; retry inner loop
          }
      }
  	//代码运行到此处说明CAS操作成功
      boolean workerStarted = false;
      boolean workerAdded = false;
      Worker w = null;
      try {
          //创建一个Worker对象，即工作线程
          w = new Worker(firstTask);
          final Thread t = w.thread;
          if (t != null) {
              //获取全局独占锁
              final ReentrantLock mainLock = this.mainLock;
              //加锁，为了实现workers同步，因为可能多个线程调用了线程池的execute方法
              //workers是一个哈希集合，用于存放Worker对象
              mainLock.lock();
              try {
                  //重新获取线程池状态
                  int c = ctl.get();
  				//再次对线程池状态进行检查，以避免在获取锁前调用了shutdown接口
                  if (isRunning(c) ||
                      (runStateLessThan(c, STOP) && firstTask == null)) {
                      if (t.getState() != Thread.State.NEW)
                          //如果线程池已经被关闭，则抛出异常，最后释放锁
                          throw new IllegalThreadStateException();
                      //将Worker对象加入workers中
                      workers.add(w);
                      //设置新增工作线程成功标志为true
                      workerAdded = true;
                      int s = workers.size();
                      if (s > largestPoolSize)
                          largestPoolSize = s;
                  }
              } finally {
                  //最后释放全局锁
                  mainLock.unlock();
              }
              //如果工作线程新增成功
              if (workerAdded) {
                  //则启动工作线程
                  t.start();
                  //设置工作线程启动成功标志为true
                  workerStarted = true;
              }
          }
      } finally {
          //最后，如果工作线程启动失败
          if (! workerStarted)
              //则进入添加工作线程失败方法
              addWorkerFailed(w);
      }
      return workerStarted;
  }
  ```

- 总结

  整体分为两个部分：

  - 第一部分为两层无限循环

    - 最外层循环判断当前线程池是否可以进行新增线程操作
      - 如果线程池状态是`STOP`、`TIDYING`或者`TERMINATED`，则直接返回`false`，方法结束
      - 如果线程池状态是`SHUTDOWN`，说明当前线程池不会再处理提交的任务，只会处理阻塞队列中的任务。因此，当阻塞队列为空或者提交的任务不为空时，则直接返回`false`，方法结束
    - 内层循环
      - 首先判断新增线程类型
        - 如果是核心线程，那么如果当前线程数量大于等于核心线程数，则直接返回`false`，方法结束
        - 如果是普通线程，那么如果当前线程数量大于等于最大线程数，则直接返回`false`，方法结束
      - 使用CAS更新线程池的线程数量
        - 如果成功，则退出两层循环
        - 如果失败，重新获取线程池状态，如果为非`Running`，则重新进入两层循环，否则从内层循环开始

  - 第二部分为创建`Worker`工作线程对象并启动

    - 通过提交的任务来构造一个工作线程对象
    - 获取全局可重入独占锁，加锁同步
      - 二次校验线程池状态，失败则抛出异常
      - 如果二次校验成功，则将该`Worker`对象加入一个`HashSet`集合中，并标记`workerAdded`变量为`true`，表示该`Worker`对象已被添加
    - 释放全局可重入独占锁
    - 如果`Worker`对象被添加到集合中，则将该`Worker`对象对应的工作线程启动，并标记`workerStarted`变量为`true`，表示该`Worker`对象对应的工作线程已启动
    - 如果该`Worker`对象对应的工作线程启动失败，则再次获取全局锁，将该`Worker`对象移出集合，并将线程池的线程个数回滚，最后释放全局锁

    

### 9.3线程池的使用

#### 9.3.1线程池的创建

`ThreadPoolExecutor`的构造方法

```java
ThreadPoolExecutor(int corePoolSize,int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler)
```

- `corePoolSize`：核心线程池大小。当提交一个任务到线程池中，线程池会创建一个线程来执行任务，即使其他空闲的线程都能够执行新任务也会创建线程，直到需要执行的任务数大于核心线程池大小时就不再创建
- `maximumPoolSize`：线程池允许创建的最大线程数。如果队列满了，并且已创建的线程数小于最大线程数，则线程池会再创建新的线程执行任务
- `keepAliveTime`：当线程池中线程数量大于`corePoolSize`时且处于空闲状态时所保持存活的时间
- `unit`：参数`keepAliveTime`的单位
- `workQueue`：用于保存等待执行的任务的阻塞队列。可选以下几个阻塞队列：
  - `ArrayBlockingQueue`：是一个基于数组结构的有界阻塞队列，此队列按FIFO原则对元素进行排序
  - `LinkedBlockingQueue`：一个基于链表结构的阻塞队列，此队列按FIFO排序元素，吞吐量通常要高于`ArrayBlockingQueue`。静态工厂方法`Executors.newFixedThreadPool()`使用了这个队列
  - `SynchronousQueue`：一个不存储元素的阻塞队列。每个插入操作必须等到另一个线程调用移除操作，否则插入操作一直处于阻塞状态，吞吐量通常要高于`LinkedBlockingQueue`，静态工厂方法`Executors.newCachedThreadPool`使用了这个队列
  - `PriorityBlockingQueue`：一个具有优先级的无限阻塞队列
- `threadFactory`：用于设置创建线程的工厂
- `handler`：饱和策略。当队列和线程池都满了，说明线程池处于饱和状态，那么必须采取一种策略处理提交的新任务：
  - `AbortPolicy`：直接抛出异常（默认采取的策略）
  - `CallerRunsPolicy`：只用调用者所在线程来运行任务
  - `DiscardOldestPolicy`：丢弃队列里最近的一个任务，并执行当前任务
  - `DiscardPolicy`：不处理，丢弃掉

#### 9.3.2向线程池提交任务

可以使用`execute()`和`submit()`方法向线程池提交任务：

- `execute()`方法用于提交不需要返回值的任务
- `submit()`方法用于提交需要返回值的任务。线程池会返回一个`future`类对象，可以通过`future`的`get()`方法来获取返回值，`get()`方法会阻塞当前线程直到任务完成后返回

#### 9.3.3关闭线程池

通过调用线程池的`shutdown`或`shutdownNow`方法来关闭线程池，其原理如下：

- 遍历线程池中的工作线程
- 然后逐个的调用线程的`interrupt`方法来中断线程（无法响应中断的任务可能永远无法终止）

`shutdown`和`shutdownNow`方法的区别：

- `shutdownNow`方法首先将线程池的状态设置为`STOP`，然后尝试停止所有正在执行或暂停任务的线程，并返回等待执行任务的列表
- `shutdown`方法只是将线程池的状态设置为`SHUTDOWN`，然后中断所有没有正在执行任务的线程，但是正在执行任务的线程不会被中断，阻塞队列中的任务也会继续执行

#### 9.3.4合理地配置线程池

- CPU密集型任务应配置尽可能小的线程，如配置Ncpu+1个线程的线程池
- IO密集型任务线程并不是一直在执行任务，则应配 置尽可能多的线程，如2*Ncpu
- 混合型的任务，如果可以拆分，将其拆分成一个CPU密集型任务 和一个IO密集型任务，只要这两个任务执行的时间相差不是太大，那么分解后执行的吞吐量将高于串行执行的吞吐量。如果这两个任务执行时间相差太大，则没必要进行分解
- 优先级不同的任务可以使用优先级队列`PriorityBlockingQueue`来处理。它可以让优先级高的任务先执行
- 执行时间不同的任务可以交给不同规模的线程池来处理，或者可以使用优先级队列，让执行时间短的任务先执行
- 依赖数据库连接池的任务，因为线程提交SQL后需要等待数据库返回结果，等待的时间越长，则CPU空闲时间就越长，那么线程数应该设置得越大，这样才能更好地利用CPU
- 建议使用有界队列。有界队列能增加系统的稳定性和预警能力

## 10.Executor框架

Java的线程既是工作单元，也是执行机制。从JDK 5开始，工作单元和执行机制被分离开了。工作单元包括`Runnable`和`Callable`，而执行机制由`Executor`框架提供

### 10.1Executor框架简介

#### 10.1.1Executor框架的两级调度模型

- 在HotSpot VM的线程模型中，Java线程被一对一映射为本地操作系统线程：
  - 当Java线程启动时，会创建一个本地操作系统线程
  - 当Java线程终止时，这个操作系统线程也会被回收

- `Executor`框架的两级调度模型：
  - 在上层，Java多线程通常把应用分解为若干个任务，然后使用用户级的调度器（`Executor`框架）将这些任务映射为固定数量的线程
  - 在底层，操作系统内核将这些线程映射到硬件处理器上

![image-20210508205831775](/static/img/image-20210508205831775.png)

- `Executor`框架的结构

  `Executor`框架主要由3大部分组成：

  - 任务

    包括被执行任务需要实现的接口：`Runable`接口和`Callable`接口

  - 任务的执行

    包括任务执行机制的核心接口`Executor`，以及继承自`Executor`的`ExecutorService`接口。`Executor`框架有两个关键类实现了`ExecutorService`接口（`ThreadPoolExecutor`和`ScheduledThreadPoolExecutor`）

  - 异步计算的结果

    包括接口`Future`和实现`Future`接口的`FutureTask`类

  `Executor`框架结构示意图：

  ![image-20210508214858474](/static/img/image-20210508214858474.png)

- `Executor`框架的使用

  - 主线程首先要创建实现`Runnable`或者`Callable`接口的任务对象。工具类`Executors`会把一个`Runnable`对象封装为一个`Callable`对象（通过`Executors`的静态方法`callable` ）
  - 然后可以把`Runnable`对象直接交给`ExecutorService`执行（通过`ExecutorService`对象的`execute`方法）；或者也可以把`Runnable`对象或`Callable`对象提交给`ExecutorService`执行（通过`ExecutorService`对象的`submit`方法）
  - 如果执行的是`ExecutorService`对象的`submit`方法，将会返回一个实现`Future`接口的对象，即`FutureTask`对象。由于该对象实现了`Runnable`，我们也可以创建一个`FutureTask`对象，然后直接交给`ExecutorService`执行
  - 最后，主线程可以执行`FutureTask`对象的`get`方法来等待任务执行完成。主线程也可以执行`FutureTask`对象的`cancel`方法来取消此任务的执行

- `Executor`框架成员

  - `ThreadPoolExcutor`

    通常使用工厂类`Executors`来创建，可以创建3种类型的`ThreadPoolExcutor`：

    - `FixedThreadPool`

      创建使用固定线程数的线程池。`FixedThreadPool`适用于为了满足资源管理的需求，而需要限制当前线程数量的应用场景，它适用于负载比较重的服务器

      ```java
      public static ExecutorService newFixedThreadPool(int nThreads) {
          //创建一个核心线程个数和最大线程个数都为nThreads的线程池，并且阻塞队列长度为Integer.MAX_VALUE
          //keepAliveTime设为0，说明只要线程个数比核心线程个数多并且当前空闲则回收
          return new ThreadPoolExecutor(nThreads, nThreads,
                                        0L, TimeUnit.MILLISECONDS,
                                        new LinkedBlockingQueue<Runnable>());
      }
      ```

      `FixedThreadPool`工作流程：

      - 如果当前运行的线程数少于`corePoolSize`，则创建新线程来执行任务
      - 在线程池完成预热后（当前运行的线程数等于`corePoolSize`），将任务加入`LinkedBlockingQueue`
      - 线程执行完1中的任务后，会在循环中反复从`LinkedBlockingQueue`获取任务来执行

      ![image-20210509143811052](/static/img/image-20210509143811052.png)

      `FixedThreadPool`使用的是无界队列，因此会带来如下影响：

      - 线程池中的线程数不会超过`corePoolSize`，因为当线程池中的线程数达到`corePoolSize`后，新任务将在无界队列中等待
      - 由于1，导致参数`maximumPoolSize`是无效参数
      - 由于1和2，导致参数`keepAliveTime`是无效参数
      - 由于使用无界队列，运行中的`FixedThreadPool`不会拒绝任务

    - `SingleThreadExecutor`

      创建使用单个线程的线程池。`SingleThreadExecutor`适用于需要保证顺序地执行各个任务；并且在任意时间点，不会有多个线程是活动的应用场景

      ```java
      public static ExecutorService newSingleThreadExecutor() {
          //创建一个核心线程个数和最大线程个数都为1的线程池，并且阻塞队列长度为Integer.MAX_VALUE
        	//keepAliveTime设为0，说明只要线程个数比核心线程个数多并且当前空闲则回收
          return new FinalizableDelegatedExecutorService
              (new ThreadPoolExecutor(1, 1,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>()));
      }
      ```

      `SingleThreadExecutor`工作流程：

      - 如果当前运行的线程少于`corePoolSize`（即线程池中无运行的线程），则创建一个新线程来执行任务
      - 在线程池完成预热之后（当前线程池中有一个运行的线程），将任务加入`LinkedBlockingQueue`
      - 线程执行完1中的任务后，会在一个无限循环中反复从`LinkedBlockingQueue`获取任务来执行

      ![image-20210509144044196](/static/img/image-20210509144044196.png)

      `SingleThreadExecutor`使用的也是无界队列，影响如上

    - `CachedThreadPool`

      创建一个会根据需要创建新线程的线程池。`CachedThreadPool`是大小无界的线程池，适用于执行很多的短期异步任务的小程序，或者是负载较轻的服务器

      ```java
      public static ExecutorService newCachedThreadPool() {
          //创建一个初始线程个数为0，最大线程个数为Integer.MAX_VALUE的线程池
          //其阻塞队列为同步队列，即加入同步队列的任务会被马上执行，同步队列里最多只会有一个任务
          //keepAliveTime设为60，说明只要当前线程在60s内空闲则回收
          return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                        60L, TimeUnit.SECONDS,
                                        new SynchronousQueue<Runnable>());
      }
      ```

      `CachedThreadPool`工作流程：

      - 由于`corePoolSize`为0，所以首先执行`SynchronousQueue.offer(Runnable task)`。如果当前线程池中有空闲线程正在执行`SynchronousQueue.poll(keepAliveTime,TimeUnit.NANOSECONDS)`，那么主线程执行`offer`操作与空闲线程执行的`poll`操作配对成功，主线程把任务交给空闲线程执行，`execute()`方法执行完成；否则执行下面步骤2
      - 当初始线程池为空，或者线程池中当前没有空闲线程时，将没有线程执行 `poll`操作。这种情况下，步骤1将失败。此时`CachedThreadPool`会创建一个新线程执行任务，`execute()`方法执行完成
      - 步骤2中新建的线程将任务完毕后，会继续执行`poll`操作，并最多等待60秒，如果60秒内主线程提交了一个新任务，那么这个空闲线程将会执行主线程提交的新任务；否则，这个空闲线程将终止

      ![image-20210509145613974](/static/img/image-20210509145613974.png)

  - `ScheduledThreadPoolExecutor`

    通常使用工厂类`Executors`来创建，其可以创建2种类型的`ScheduledThreadPoolExecutor`：

    - `ScheduledThreadPoolExecutor`

      创建包含若干个线程的线程池。`ScheduledThreadPoolExecutor`适用于需要多个后台线程执行周期任务，同时为了满足资源管理的需求而需要限制后台线程的数量的应用场景

    - `SingleThreadScheduledExecutor`

      创建只包含一个线程的线程池。`SingleThreadScheduledExecutor`适用于需要单个后台线程执行周期任务，同时需要保证顺序地执行各个任务的应用场景

  - `Future`接口

    `Future`接口和实现`Future`接口的`FutureTask`类用来表示异步计算的结果。当我们把`Runnable`接口或`Callable`接口的实现类通过`submit`方法提交给线程池对象，线程池对象就会给我们返回一个`FutureTask`对象

  - `Runnable`接口和`Callable`接口

    `Runnable`接口和`Callable`接口的实现类，都可以被线程池对象执行。它们的区别在于`Runnable`不会返回结果，而`Callable`可以返回结果

### 10.2ScheduledThreadPoolExecutor详解 

`ScheduledThreadPoolExecutor`继承自`ThreadPoolExecutor`。它主要用来在给定的延迟之后运行任务，或者定期执行任务

`ScheduledThreadPoolExecutor`采用的是`DelayedWorkQueue`作为其阻塞队列，该队列实质上就是一个延迟队列

#### 10.2.1ScheduledThreadPoolExecutor的运行机制

`ScheduledThreadPoolExecutor`的执行主要分为两大部分：

- 当调用`ScheduledThreadPoolExecutor`的`scheduleAtFixedRate()`方法或者`scheduleWithFixedDelay()`方法时，会向`ScheduledThreadPoolExecutor`的`DelayedWorkQueue`添加一个实现了`RunnableScheduledFutur`接口的`ScheduledFutureTask`
- 线程池中的线程从`DelayedWorkQueue`中获取`ScheduledFutureTask`，然后执行任务

`ScheduledThreadPoolExecutor`为了实现周期性的执行任务，对父类对`ThreadPoolExecutor`做了如下的修改：

- 使用`DelayedWorkQueue`作为任务队列
- 获取任务的方式不同
- 执行周期任务后，增加了额外的处理

#### 10.2.2ScheduledThreadPoolExecutor的实现

`ScheduledThreadPoolExecutor`的`scheduleAtFixedRate()`方法和`scheduleWithFixedDelay()`方法内部会将传入的任务（即`Runnable`的实现类）转换为一个实现了`RunnableScheduledFutur`接口的`ScheduledFutureTask`。在`ScheduledFutureTask`内部主要包含3个成员变量：

- `long`型成员变量`time`，表示这个任务将要被执行的具体时间
- `long`型成员变量`sequenceNumber`，表示这个任务被添加到`ScheduledThreadPoolExecutor`中的序号
- `long`型成员变量`period`，表示任务执行的间隔周期

`DelayedWorkQueue`中真正存放的是`ScheduledFutureTask`对象，该队列内部封装了一个`PriorityQueue`，这个`PriorityQueue`会对队列中的`ScheduledFutureTask`进行排序：

- 排序时，`time`小的排在前面（时间早的任务先执行）
- 如果两个`ScheduledFutureTask`的`time`相同，就比较`sequenceNumber`，`sequenceNumber`小的排在前面（如果两个任务执行时间相同，则提交的任务先执行）

`ScheduledThreadPoolExecutor`执行周期任务的工作流程：

- 线程1从`DelayedWorkQueue`中获取已到期的`ScheduledFutureTask`，即该`ScheduledFutureTask`的`time`小于等于当前时间
- 线程1执行这个`ScheduledFutureTask`
- 线程1修改`ScheduledFutureTask`的`time`变量为下次将要执行的时间
- 线程1把这个修改`time`之后的`ScheduledFutureTask`放回`DelayedWorkQueue`中

![image-20210509161454325](/static/img/image-20210509161454325.png)

线程从`DelayedWorkQueue`中获取任务的方法源码，即`DelayedWorkQueue.take()`：

```java
public RunnableScheduledFuture<?> take() throws InterruptedException {
    final ReentrantLock lock = this.lock;
    //获取可中断响应的独占锁
    lock.lockInterruptibly();
    try {
        //无限循环
        for (;;) {
            //获取队首元素
            RunnableScheduledFuture<?> first = queue[0];
            //如果队首元素为空，说明队列为空
            if (first == null)
                //则将该线程放入条件队列挂起
                available.await();
            //如果队首元素不为空
            else {
                //查看队首元素还剩多少时间过期
                long delay = first.getDelay(NANOSECONDS);
                //如果delay小于等于0，则说明已经队首元素已经过期
                if (delay <= 0L)
                    //将队首元素出队
                    return finishPoll(first);
                //如果队首元素还没过期则等待，等待时不保留引用，将first置为null
                first = null; // don't retain ref while waiting
                //如果当前leader线程不为空
                if (leader != null)
                    //则将该线程放入条件队列挂起
                    available.await();
                //如果当前leader为空
                else {
                    //则获取当前线程，并将当前线程设置为leader线程
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        //将该线程放入条件队列中等待直到当前队首元素过期返回
                        available.awaitNanos(delay);
                    } finally {
                        //最后将leader线程置空
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        //最后如果leader线程为空，且队首有元素，则唤醒条件队列中的一个线程
        if (leader == null && queue[0] != null)
            available.signal();
        //解锁
        lock.unlock();
    }
}
```

线程将任务重新放回`DelayedWorkQueue`中的方法源码，即`DelayedWorkQueue.offer()`：

```java
public boolean offer(Runnable x) {
    //如果传入的任务为空，则抛出异常
    if (x == null)
        throw new NullPointerException();
    //将传入的任务转换为RunnableScheduledFuture对象
    RunnableScheduledFuture<?> e = (RunnableScheduledFuture<?>)x;
    final ReentrantLock lock = this.lock;
    //获取独占锁
    lock.lock();
    try {
        //获取队列中的元素个数
        int i = size;
        //如果队列的元素个数大于队列的长度
        if (i >= queue.length)
            //则扩容
            grow();
        //递增队列中的元素个数，因为即将执行添加操作
        size = i + 1;
        //如果i为0，则说明当前队列中还没添加任何元素
        if (i == 0) {
            //则将该元素添加至队首
            queue[0] = e;
            //设置该元素在堆中的索引
            setIndex(e, 0);
        } else {
            //如果队列中有元素，则通过堆排序来添加该元素
            siftUp(i, e);
        }
        //如果该元素是首个插入队列中的元素
        if (queue[0] == e) {
            //则将leader线程置空
            leader = null;
            //并唤醒条件队列中的一个线程，通知它继续执行出队操作
            available.signal();
        }
    } finally {
        //最后解锁
        lock.unlock();
    }
    return true;
}
```

### 10.3FutureTask详解

#### 10.3.1FutureTask简介

`FutureTask`除了实现`Future`接口外，还实现了`Runnable`接口。因此，`FutureTask`可以交给`Executor`执行，也可以由调用线程直接执行（`FutureTask.run()`）。根据`FutureTask.run()`的执时机，`FutureTask`可以处于以下3种状态：

- 未启动

  当创建一个`FutureTask` 对象，但`FutureTask.run()`方法还未执行之前

- 已启动

  `FutureTask.run()`方法被执行的过程中

- 已完成

  `FutureTask.run()`执行完成后正常结束，或被取消（`FutureTask.cancel()`），或执行`FutureTask.run()`方法时抛出异常而结束

![image-20210510102523471](/static/img/image-20210510102523471.png)

`FutureTask`处于不同状态时，调用`get`方法和`cancel`方法的效果：

- 当`FutureTask`处于未启动或已启动状态时，执行`FutureTask.get()`方法将导致调用线程阻塞
- 当`FutureTask`处于已完成状态时，执行`FutureTask.get()`方法将导致调用线程立即返回结果或者抛出异常
- 当`FutureTask`处于未启动状态时，执行`FutureTask.cancel()`方法将导致此任务永远不会被执行
- 当`FutureTask`处于已启动状态时，执行`FutureTask.cancel(true)`方法将以中断执行此任务线程的方式来试图停止任务
- 当`FutureTask`处于已启动状态时，执行`FutureTask.cancel(false)`方法将不会对正在执行此任务的线程产生影响
- 当`FutureTask`处于已完成状态时，执行`FutureTask.cancel(...)`方法将返回`false`

![image-20210510103626837](/static/img/image-20210510103626837.png)

#### 10.3.2FutureTask的实现

`FutureTask`内部通过维护一个`state`状态变量，并使用CAS同步控制，再用一个队列保存等待的线程。这个`state`状态变量总共有7种取值：

```java
private static final int NEW          = 0;// 初始状态
private static final int COMPLETING   = 1;//执行中状态
private static final int NORMAL       = 2;//正常运行结束状态
private static final int EXCEPTIONAL  = 3;// 运行中异常
private static final int CANCELLED    = 4;//任务被取消
private static final int INTERRUPTING = 5;//任务正在被中断
private static final int INTERRUPTED  = 6;//任务已被中断
```

`get`方法源码：

```java
public V get() throws InterruptedException, ExecutionException {
    //获取状态变量state
    int s = state;
    //如果state小于等于COMPLETING，说明任务还未完成
    if (s <= COMPLETING)
        //则调用awaitDone方法对当前线程进行阻塞
        s = awaitDone(false, 0L);
    //如果state大于COMPLETING，说明任务正常完成或者不正常结束，交由report方法处理
    return report(s);
}

//report源码
private V report(int s) throws ExecutionException {
    //获取任务完成的结果
    Object x = outcome;
    //如果任务是正常运行结束
    if (s == NORMAL)
        //则直接返回任务的结果，方法结束
        return (V)x;
    //如果任务是被取消或者被中断
    if (s >= CANCELLED)
        //则抛出异常
        throw new CancellationException();
    //如果都不是以上，说明任务运行出错，抛出异常
    throw new ExecutionException((Throwable)x);
}
```

`awaitDone`方法源码：

```java
private int awaitDone(boolean timed, long nanos)
    throws InterruptedException {
    long startTime = 0L;    // Special value 0L means not yet parked
    WaitNode q = null;
    boolean queued = false;
    //无限循环
    for (;;) {
        //获取当前任务状态
        int s = state;
        //如果当前任务正常完成/被取消/被中断/任务出异常
        if (s > COMPLETING) {
            if (q != null)
                q.thread = null;
            //则直接返回当前状态
            return s;
        }
        //如果当前任务正在运行
        else if (s == COMPLETING)
            //则让出当前线程的时间片，给任务先执行
            Thread.yield();
        //如果当前线程被中断
        else if (Thread.interrupted()) {
            //则将等待队列中的该线程移除
            removeWaiter(q);
            //并抛出异常
            throw new InterruptedException();
        }
        //如果当前任务为NEW状态，则将当前线程放入等待队列
        else if (q == null) {
            if (timed && nanos <= 0L)
                return s;
            q = new WaitNode();
        }
        else if (!queued)
            queued = WAITERS.weakCompareAndSet(this, q.next = waiters, q);
        //如果get方法设置了超时时间
        else if (timed) {
            final long parkNanos;
            if (startTime == 0L) { // first time
                startTime = System.nanoTime();
                if (startTime == 0L)
                    startTime = 1L;
                parkNanos = nanos;
            } else {
                long elapsed = System.nanoTime() - startTime;
                //如果到达超时时间，则将该线程从等待队列中移除
                if (elapsed >= nanos) {
                    removeWaiter(q);
                    //并返回当前任务状态
                    return state;
                }
                parkNanos = nanos - elapsed;
            }
            //如果还没到达超时时间，则再次检查当前任务是否还是处于NEW状态
            if (state < COMPLETING)
                //如果是则阻塞当前线程
                LockSupport.parkNanos(this, parkNanos);
        }
        else
            //如果没有设置超时时间，就直接阻塞当前线程
            LockSupport.park(this);
    }
}
```

## 11.Java并发工具类

### 11.1CountDownLatch原理剖析

#### 11.1.1案例介绍

有时候需要在主线程中去开启多个线程去执行任务，并且主线程需要等待所有子线程执行完毕后再进行汇总。这个需求只要通过`join()`方法即可实现，但是JDK中还提供了`CountDownLatch`类，其比`join()`方法更为灵活

```java
//CountDownLatch示例
package utils;

import java.util.concurrent.CountDownLatch;

public class JoinCountDownLatch {
    //创建一个CountDownLatch实例，内部维护一个计数器
    private static volatile CountDownLatch countDownLatch=new CountDownLatch(2);
    public static void main(String[] args) throws InterruptedException {
        Thread threadOne = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    //第一个子线程执行完毕后，将计数器减1
                    countDownLatch.countDown();
                }
                System.out.println("child threadOne over!");
            }
        });
        Thread threadTwo = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    //第二个子线程执行完毕后，将计数器减1
                    countDownLatch.countDown();
                }
                System.out.println("child threadTwo over!");
            }
        });
        threadOne.start();
        threadTwo.start();
        System.out.println("wait all child thread over!");
        //调用CountDownLatch实例的await方法的主线程会阻塞，直到其内部计数器变为0后返回
        countDownLatch.await();
        System.out.println("all child thread over!");
    }
}/*output
wait all child thread over!
child threadOne over!
child threadTwo over!
all child thread over!
*/
```

`CountDownLatch`与`join()`方法的区别：

- 调用一个子线程的`join()`方法，该线程就会一直被阻塞直到子线程运行完毕；而`CountDownLatch`则使用计数器来允许子线程运行完毕或者在运行中递减计数，即`CountDownLatch`可以在子线程运行的任何时候让`await`方法返回而不一定要等到线程结束
- 使用线程池来管理线程时，我们是无法调用线程的`join`方法，而`CountDownLatch`可以完成`join`的功能

#### 11.1.2实现原理探究

`CountDownLatch`是基于AQS实现的，内部计数器的值就是AQS的`state`值，其类图结构如下：

![image-20210510184910572](/static/img/image-20210510184910572.png)

由图可知，`CountDownLatch`的一个内部类`Sync`继承了AQS并且重写了`tryAcquireShared`和`tryReleaseShared`方法

- `CountDownLatch`的构造方法：

  ```java
  public CountDownLatch(int count) {
      //如果传入的计数器的值小于0，则抛出异常
      if (count < 0) throw new IllegalArgumentException("count < 0");
      //然后将AQS的state值设置为传入的count
      this.sync = new Sync(count);
  }
  
  //内部类Sync的构造方法
  Sync(int count) {
      setState(count);
  }
  ```

- `void await()`方法源码：

  ```java
  public void await() throws InterruptedException {
      //await方法内部被委托给AQS的acquireSharedInterruptibly方法
      sync.acquireSharedInterruptibly(1);
  }
  
  //AQS的acquireSharedInterruptibly方法源码
  public final void acquireSharedInterruptibly(int arg)
      throws InterruptedException {
      //如果线程被中断，则抛出异常返回
      if (Thread.interrupted())
          throw new InterruptedException();
      //调用子类Sync重写的tryAcquireShared方法，判断当前计数器值是否为0，如果为0，则直接返回
      if (tryAcquireShared(arg) < 0)
          //如果不为0，则将该线程放入AQS阻塞队列等待
          doAcquireSharedInterruptibly(arg);
  }
  ```

- 内部类`Sync`重写的`tryAcquireShared`方法源码：

  ```java
  protected int tryAcquireShared(int acquires) 
      //获取当前AQS的state值
      //如果为0，返回1，否则，返回-1
      return (getState() == 0) ? 1 : -1;
  }
  ```

- `void countDown()`方法源码：

  ```java
  public void countDown() {
      //countDown方法内部被委托给AQS的releaseShared方法
      sync.releaseShared(1);
  }
  
  //AQS的releaseShared方法源码
  public final boolean releaseShared(int arg) {
      //调用子类Sync重写的tryReleaseShared方法，判断当前计数器值递减后是否为0
      if (tryReleaseShared(arg)) {
          //如果为0，则唤醒AQS等待队列中的一个线程
          doReleaseShared();
          return true;
      }
      return false;
  }
  ```

- 内部类`Sync`重写的`tryReleaseShared`方法源码：

  ```java
  protected boolean tryReleaseShared(int releases) {
      // Decrement count; signal when transition to zero
      //无限循环+CAS递减state值
      for (;;) {
          //获取当前AQS的state值
          int c = getState();
          //如果当前state值为0，则直接返回false，方法结束
          //如果没有该条件，当state值已经为0，而其他线程又调用了该方法，则state值会变为负数
          if (c == 0)
              return false;
          //计算当前state减1后的值
          int nextc = c - 1;
          //使用CAS操作将当前state值设为state值减1
          //如果CAS失败，则重新进入循环获取state值
          if (compareAndSetState(c, nextc))
              //如果CAS成功，则判断递减后的state值是否为0
              //如果为0，则返回true，否则，返回false
              return nextc == 0;
      }
  }
  ```

### 11.2回环屏障CyclicBarrier原理探究

`CountDownLatch`的计数器是一次性的，即当`CountDownLatch`内部计数器的值变为0后，再调用其`await`方法和`countDown`方法都会立刻返回。因此，JDK还提供了`CyclicBarrier`类，其内部计数器是可重置的，不仅如此，它还能让一组线程达到一个屏障（同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续运行

#### 11.2.1案例介绍

`CyclicBarrier`适用于多线程计算数据，最后合并计算结果的场景

```java
//CyclicBarrier示例
package utils;

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CycleBarrierTest1 {
    //创建一个CyclicBarrier实例
    //第一个参数为计数器初始值，第二个参数为所有子线程都到达屏障后（即计数器值减为0）所要执行的任务
    private static CyclicBarrier cyclicBarrier=new  CyclicBarrier(2,new Runnable(){
        @Override
        public void run(){
            System.out.println(Thread.currentThread()+"task 1 merge result");
        }
    });

    public static void main(String[] args) {
        //创建一个固定大小为2的线程池
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        executorService.submit(new Runnable() {
            @Override
            public void run() {
                System.out.println(Thread.currentThread()+"task 1-1");
                System.out.println(Thread.currentThread()+"enter in barrier");
                try {
                    //等待其他子线程到达屏障点
                    cyclicBarrier.await();
                    System.out.println(Thread.currentThread()+"enter out barrier");
                } catch (InterruptedException | BrokenBarrierException e) {
                    e.printStackTrace();
                }
            }
        });
        executorService.submit(new Runnable() {
            @Override
            public void run() {
                System.out.println(Thread.currentThread()+"task 1-2");
                System.out.println(Thread.currentThread()+"enter in barrier");
                try {
                    //等待其他子线程到达屏障点
                    cyclicBarrier.await();
                    System.out.println(Thread.currentThread()+"enter out barrier");
                } catch (InterruptedException | BrokenBarrierException e) {
                    e.printStackTrace();
                }
            }
        });
        //关闭线程池
        executorService.shutdown();
    }
}/*output
Thread[pool-1-thread-1,5,main]task 1-1
Thread[pool-1-thread-2,5,main]task 1-2
Thread[pool-1-thread-2,5,main]enter in barrier
Thread[pool-1-thread-1,5,main]enter in barrier
Thread[pool-1-thread-1,5,main]task 1 merge result
Thread[pool-1-thread-1,5,main]enter out barrier
Thread[pool-1-thread-2,5,main]enter out barrier
*/
```

#### 11.2.2实现原理探究

`CyclicBarrier`内部是基于独占锁实现，其本质也是基于AQS，其类图结构如下：

![image-20210510195136193](/static/img/image-20210510195136193.png)

- `CyclicBarrier`成员变量分析：
  - `parties`

    用于保存计数器的初始值，该变量是一个编译时常量，其值是不可变的。当内部计数器为0后，`CyclicBarrier`可通过该成员变量，重置内部的计数器

  - `count`

    计数器。其初始值等于成员变量`parties`，每当有线程调用`await`方法，该变量值就会递减1，当值为0时，也就表示所有线程都到了屏障点

  - `barrierCommand`

    当所有线程都到达屏障点时所要执行的任务

  - `generation`

    `generation`内部有一个变量`broken`，用来记录对当前屏障是否被打破

- `CyclicBarrier`的构造方法：

  ```java
  public CyclicBarrier(int parties, Runnable barrierAction) {
      //如果传入的计数器初始值小于0，则抛出异常
      if (parties <= 0) throw new IllegalArgumentException();
      this.parties = parties;
      this.count = parties;
      this.barrierCommand = barrierAction;
  }
  ```

- `int await()`方法

  当线程调用`CyclicBarrier`的该方法时会被阻塞，直到满足以下条件之一才会返回：

  - `parties`个线程调用了`await()`方法，即计数器值为0，所有线程都到达屏障点
  - 其他线程调用了当前线程的`interrupt()`方法中断了当前线程，则当前线程抛出`InterruptedException`异常返回
  - 与当前屏障点关联的`Generation`对象的`broken`标志被设置为`true`时，会抛出`BrokenBarrierException`异常而返回

  源码：

  ```java
  public int await() throws InterruptedException, BrokenBarrierException {
      try {
          //await方法内部被委托给dowait方法
          //第一个参数为false，说明不设置超时时间，此时第二个参数也就没有意义
          return dowait(false, 0L);
      } catch (TimeoutException toe) {
          throw new Error(toe); // cannot happen
      }
  }
  ```

- `int dowait(boolean timed,long nanos)`方法：

  该方法实现了`CyclicBarrier`的核心功能，其源码如下：

  ```java
  private int dowait(boolean timed, long nanos)
      throws InterruptedException, BrokenBarrierException,
             TimeoutException {
      //获取独占锁
      final ReentrantLock lock = this.lock;
      //加锁
      lock.lock();
      try {
          //获取成员变量generation
          final Generation g = generation;
  		//如果generation内部的broken标志为true
          if (g.broken)
              //则抛出异常
              throw new BrokenBarrierException();
  		//如果当前线程被中断
          if (Thread.interrupted()) {
              //则打破屏障，并唤醒所有调用await方法阻塞的线程，然后重置计数器
              breakBarrier();
              //抛出异常
              throw new InterruptedException();
          }
  		//将计数器递减1
          int index = --count;
          //如果计数器递减1后值为0，说明所有线程都到达屏障点，准备执行初始化时传递的任务
          if (index == 0) {  // tripped
              //则获取成员变量barrierCommand
              Runnable command = barrierCommand;
              //如果barrierCommand不为空
              if (command != null) {
                  try {
                      //则执行该任务
                      command.run();
                  } catch (Throwable ex) {
                      //如果该任务抛出异常，则打破屏障，并唤醒所有调用await方法阻塞的线程，然后重置计数器
                      breakBarrier();
                      //抛出异常
                      throw ex;
                  }
              }
              //唤醒其他因调用await方法而被阻塞的线程，并重置计数器和成员变量generation
              nextGeneration();
              return 0;
          }
  
          //如果计数器递减1后值不为0，说明所有线程还没有到达屏障点，则阻塞当前线程
          for (;;) {
              try {
                  //如果没有设置超时时间
                  if (!timed)
                      //则将当前线程放入trip条件队列挂起
                      trip.await();
                  //如果设置了超时时间，并且该时间大于0
                  else if (nanos > 0L)
                      //则将当前线程放入trip条件队列中挂起相应时间
                      nanos = trip.awaitNanos(nanos);
              } catch (InterruptedException ie) {
                  if (g == generation && ! g.broken) {
                      breakBarrier();
                      throw ie;
                  } else {
                      // We're about to finish waiting even if we had not
                      // been interrupted, so this interrupt is deemed to
                      // "belong" to subsequent execution.
                      Thread.currentThread().interrupt();
                  }
              }
  
              if (g.broken)
                  throw new BrokenBarrierException();
  
              if (g != generation)
                  return index;
  
              if (timed && nanos <= 0L) {
                  breakBarrier();
                  throw new TimeoutException();
              }
          }
      } finally {
          //最后解锁
          lock.unlock();
      }
  }
  
  //breakBarrier方法源码
  private void breakBarrier() {
      //broken标志设置为true
      generation.broken = true;
      //重置计数器
      count = parties;
      //唤醒条件队列中所有线程
      trip.signalAll();
  }
  
  //nextGeneration方法源码
  private void nextGeneration() {
      //唤醒条件队列中所有线程
      trip.signalAll();
      //重置计数器
      count = parties;
      //重置generation
      generation = new Generation();
  }
  ```

### 11.3信号量Semaphore原理探究

`Semaphore`信号量内部也维护了一个计数器，但与`CountDownLatch`和`CyclicBarrier`不同的是，其内部的计数器是可以递增的，并且在一开始初始化`Semaphore`时可以指定一个初始值

#### 11.3.1案例介绍

`Semaphore`信号量是用来控制同时访问特定资源的线程数量，比如数据库连接：假设我们可以启动几十个线程，但是数据库的连接数只有10个，这时我们必须控制只有10个线程同时获取数据库连接保存数据，否则会报错无法获取数据库连接

```java
//使用Semaphore来做流量控制
package utils;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

public class SemaphoreTest {
    //30个线程数
    private static final int THREAD_COUNT=30;
    //创建固定30个线程的线程池
    private static ExecutorService threadPool= Executors.newFixedThreadPool(THREAD_COUNT);
    //创建信号量Semaphore实例
    private static Semaphore semaphore=new Semaphore(10);
    public static void main(String[] args) {
        for(int i=0;i<THREAD_COUNT;i++){
            threadPool.execute(new Runnable() {
                @Override
                public void run() {
                    try {
                        //获取一个信号量资源，内部计数器减1，如果当前信号量资源为0，则阻塞当前线程
                        semaphore.acquire();
                        System.out.println("save data");
                        //释放一个信号量资源，内部计数器加1
                        semaphore.release();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            });
        }
        //关闭线程池
        threadPool.shutdown();
    }
}
```

#### 11.3.2实现原理探究

`Semaphore`内部还是使用AQS实现，其类图结构如下：

![image-20210510215723628](/static/img/image-20210510215723628.png)

由图可知，`Semaphore`内部类`Sync`继承自AQS，并且该内部类有两个实现类，用来指定获取信号量时是否采用公平策略

- `void acquire()`方法

  当前线程调用该方法的目的是希望获取一个信号量资源：

  - 如果当前信号量个数大于0，则当前信号量的计数会减1，然后该方法直接返回
  - 如果当前信号量个数等于0，则当前线程会被放入AQS阻塞队列，并且会对中断做出响应

  源码：

  ```java
  public void acquire() throws InterruptedException {
      //acquire方法内部被委托给内部类Sync的acquireSharedInterruptibly方法
      //传递参数1，表示希望获取1个信号量资源
      sync.acquireSharedInterruptibly(1);
  }
  
  //内部Sync的acquireSharedInterruptibly方法源码
  public final void acquireSharedInterruptibly(int arg)
      throws InterruptedException {
      //响应中断
      if (Thread.interrupted())
          throw new InterruptedException();
      //调用Sync子类重写的tryAcquireShared方法，这里根据构造方法确定是否使用公平策略
      if (tryAcquireShared(arg) < 0)
          //如果获取信号量失败则将当前线程放入阻塞队列。然后再次尝试，如果失败则调用park方法挂起当前线程
          doAcquireSharedInterruptibly(arg);
  }
  
  ```

- Sync子类重写的`tryAcquireShared`方法源码 

  - 非公平策略：

    ```java
    protected int tryAcquireShared(int acquires) {
        //该方法内部被委托给内部类NonFairSync的nonfairTryAcquireShared方法来实现
        return nonfairTryAcquireShared(acquires);
    }
    
    //内部类NonFairSync的nonfairTryAcquireShared方法源码
    final int nonfairTryAcquireShared(int acquires) {
        //无限循环
        for (;;) {
            //获取当前信号量个数
            int available = getState();
            //计算当前信号量剩余值
            int remaining = available - acquires;
            //如果当前剩余值不小于0则使用CAS操作将AQS的state值设为该剩余值,如果CAS操作成功，则返回该剩余值，方法结束；否则，重新进入循环，获取最新的信号量个数
            //如果当前剩余值小于0，则返回该剩余值，方法结束
            if (remaining < 0 ||
                compareAndSetState(available, remaining))
                return remaining;
        }
    }
    ```

  - 公平策略：

    ```java
    protected int tryAcquireShared(int acquires) {
        for (;;) {
            //比非公平策略，多了一个条件
            //判断当前线程在阻塞队列中是否有前驱节点，如果有，则返回-1，方法直接结束
            if (hasQueuedPredecessors())
                return -1;
            //否则，执行以下逻辑
            int available = getState();
            int remaining = available - acquires;
            if (remaining < 0 ||
                compareAndSetState(available, remaining))
                return remaining;
        }
    }
    ```

- `void release()`方法

  该方法的作用是把当前`Semaphore`对象的信号量增加1：

  - 如果当前有线程因为调用`acquire`方法被阻塞而被放入AQS的阻塞队列，则会根据公平策略选择一个信号量个数能被满足的线程进行激活，被激活的线程会尝试获取刚增加的信号量

  源码：

  ```java
  public void release() {
      //release方法内部被委托给内部类Sync的releaseShared方法
      //传递参数1，表示希望释放1个信号量资源    
      sync.releaseShared(1);
  }
  
  //内部类Sync的releaseShared方法源码
  public final boolean releaseShared(int arg) {
      //调用内部类Sync重写的tryAcquireShared方法，尝试释放资源
      if (tryReleaseShared(arg)) {
          //释放资源成功则调用unpark方法唤醒AQS阻塞队列中的一个线程
          doReleaseShared();
          return true;
      }
      return false;
  }
  ```
  
- 内部类Sync重写的tryAcquireShared方法源码：

  ```java
  protected final boolean tryReleaseShared(int releases) {
      //无限循环
      for (;;) {
          //获取当前信号量个数
          int current = getState();
          //计算释放后的信号量个数
          int next = current + releases;
          //如果释放后的信号量个数溢出，则抛出异常
          if (next < current) // overflow
              throw new Error("Maximum permit count exceeded");
          //使用CAS操作将AQS的state值设为释放后的信号量个数
          //如果CAS成功则返回true，方法结束
          //否则，重新进入循环，获取最新的state值
          if (compareAndSetState(current, next))
              return true;
      }
  }
  ```

## 12.Java并发编程实践

### 12.1并发组件ConcurrentHashMap使用注意事项

```java
package action;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class TestMap {
   static ConcurrentHashMap<String, List<String>> map= new ConcurrentHashMap<>();

    public static void main(String[] args) {
        Thread threadOne = new Thread(new Runnable() {
            @Override
            public void run() {
                List<String> list1=new ArrayList<>();
                list1.add("device1");
                list1.add("device2");
                map.put("topic1",list1);
                System.out.println(map);
            }
        });
        Thread threadTwo = new Thread(new Runnable() {
            @Override
            public void run() {
                List<String> list1=new ArrayList<>();
                list1.add("device11");
                list1.add("device22");
                map.put("topic1",list1);
                System.out.println(map);
            }
        });
        threadOne.start();
        threadTwo.start();
    }
}
```

上述代码最终输出结果如下：

```java
{topic1=[device1, device2]}
{topic1=[device1, device2]}
```

或者

```java
{topic1=[device11, device22]}
{topic1=[device11, device22]}
```

使用`ConcurrentHashMap`的`put`方法，会导致输出的`map`数据丢失，因为`put`方法如果发现`map`里存在这个`key`，则使用`value`覆盖该`key`对应的老的`value`值

此处应该使用`putIfAbsent`方法，该方法如果发现已经存在该`key`则返回该`key`对应的`value`，但并不进行覆盖，如果不存在则新增该`key`，并且该方法的判断和写入都是原子性操作

```java
package action;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class TestMap {
   static ConcurrentHashMap<String, List<String>> map= new ConcurrentHashMap<>();

    public static void main(String[] args) {
        Thread threadOne = new Thread(new Runnable() {
            @Override
            public void run() {
                List<String> list1=new ArrayList<>();
                list1.add("device1");
                list1.add("device2");
                List<String> oldlist= map.putIfAbsent("topic1",list1);
                if(oldlist!=null){
                    oldlist.addAll(list1);
                }
                System.out.println(map);
            }
        });
        Thread threadTwo = new Thread(new Runnable() {
            @Override
            public void run() {
                List<String> list1=new ArrayList<>();
                list1.add("device11");
                list1.add("device22");
                List<String> oldlist= map.putIfAbsent("topic1",list1);
                if(oldlist!=null){
                    oldlist.addAll(list1);
                }
                System.out.println(map);
            }
        });
        threadOne.start();
        threadTwo.start();
    }
}/*output
{topic1=[device1, device2, device11, device22]}
{topic1=[device1, device2, device11, device22]}
*/
```

### 12.2SimpleDateFormat是线程不安全的

`SimpleDateFormat`是Java提供的一个格式化和解析日期的工具类，但是它是线程不安全的，在多线程下共用一个`SimpleDateFormat`实例对日期进行解析或者格式化会导致程序错误

#### 12.2.1问题复现

```java
package action;

import java.text.ParseException;
import java.text.SimpleDateFormat;

public class TestSimpleDateFormat {
    //创建单例实例
    static SimpleDateFormat sdf=new SimpleDateFormat("yyy-MM-dd HH:mm:ss");

    public static void main(String[] args) {
        //多个线程并启动
        for (int i = 0; i < 10; i++) {
            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        //多个线程共用一个单例对日期进行解析
                        System.out.println(sdf.parse("2021-12-13 11:17:22"));
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                }
            });
            thread.start();
        }
    }
}
```

上述代码中，多个线程共用一个单例`SimpleDateFormat`对日期进行解析，最终运行会抛出`java.lang.NumberFormatException`异常

#### 12.2.2问题分析

`SimpleDateFormat`的类图结构如下：

![image-20210511095050747](/static/img/image-20210511095050747.png)

每个`SimpleDateFormat`实例里面都保存了一个`Calendar`对象，`SimpleDateFormat`之所以是线程不安全的，就是因为`Calendar`是线程不安全：其内部存放日期数据的变量都是线程不安全的，如`fields`、`time`等

`parse`方法源码：

```java
public Date parse(String text, ParsePosition pos)
{
    //解析日期字符串，并将解析好的数据放入CalendarBuilder的实例calb中
	...
    Date parsedDate;
    try {
       	//使用calb中解析好的日期数据设置calendar
        parsedDate = calb.establish(calendar).getTime();
       	...
    }
    // An IllegalArgumentException will be thrown by Calendar.getTime()
    // if any fields are out of range, e.g., MONTH == 17.
    catch (IllegalArgumentException e) {
		...
        return null;
    }

    return parsedDate;
}

//calb.establish方法源码
Calendar establish(Calendar cal) {
    ...
    //(3)重置日期对象cal的属性值
    cal.clear();
    //(4)使用calb中的属性设置cal
    ...
    //(5)返回设置好的cal对象
    return cal;
}

//代码（3）中的cal.clear方法源码
public final void clear(){
    for (int i = 0; i < fields.length; ) {
        stamp[i] = fields[i] = 0; // UNSET == 0
        isSet[i++] = false;
    }
    areAllFieldsSet = areFieldsSet = false;
    isTimeSet = false;
}
```

从源码中可以看出，代码（3）、（4）、（5）并不是原子性操作。当多个线程调用`parse`方法时，比如线程A执行了代码（3）和代码（4），也就是设置好了`cal`对象，但是在执行代码（5）之前，线程B执行了代码（3），清空了`cal`对象。由于多个线程共用了的是一个`cal`对象，所以线程A执行代码（5）返回的可能就是被线程B清空的对象，或者也有可能线程B执行了代码（4），设置被线程A修改的`cal`对象，从而导致程序出现错误

解决方案：

- 每次使用时`new`一个`SimpleDateFormat`的实例，这样可以保证每个实例使用自己的`Calendar`实例（开销大）

- 使用内置锁`synchronized`对`parse`方法进行同步（性能会下降）

- 使用`ThreadLoal`，这样每个线程都拥有自己的`SimpleDateFormat`的实例（推荐使用）

  ```java
  package action;
  
  import java.text.DateFormat;
  import java.text.ParseException;
  import java.text.SimpleDateFormat;
  
  public class TestSimpleDateFormat {
      //创建ThreadLocal实例
      static ThreadLocal<DateFormat> safesdf=new ThreadLocal<>(){
          @Override
          protected DateFormat initialValue() {
              return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
          }
      };
  
      public static void main(String[] args) {
          for (int i = 0; i < 10; i++) {
              Thread thread = new Thread(new Runnable() {
                  @Override
                  public void run() {
                      try {
                          //调用线程本地的SimpleDateFormat实例
                          System.out.println(safesdf.get().parse("2021-12-13 11:17:22"));
                      } catch (ParseException e) {
                          e.printStackTrace();
                      }finally {
                          //使用完h
                          safesdf.remove();
                      }
                  }
              });
              thread.start();
          }
      }
  }
  ```

### 12.3创建线程和线程池要指定与业务相关的名称

在日常开发中，当在一个应用中需要创建多个线程或者线程池时最好给每个线程或者线程池根据业务类型设置具体的名称，以便在出现问题时方便进行定位

#### 12.3.1创建线程需要有线程名

指定名称的线程比未指定名称的线程更容易定位问题所在：

```java
package action;

public class testThreadName {
    public static void main(String[] args) {
        Thread threadOne = new Thread(new Runnable() {
            @Override
            public void run() {
                //指定该线程名称为ThreadOne
                //当抛出异常时，控制台会打印Exception in thread "ThreadOne" 
                throw new NullPointerException();
            }
        }, "ThreadOne");
        Thread threadTwo = new Thread(new Runnable() {
            @Override
            public void run() {
                //未指定名称的线程
                //当抛出异常时，控制台会打印Exception in thread "Thread-0"
                throw new NullPointerException();
            }
        });
        threadOne.start();
        threadTwo.start();
    }
}
```

#### 12.3.2创建线程池时也需要指定线程池的名称

指定名称的线程池比未指定名称的线程池更容易定位问题所在：

```java
package action;

import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;


public class TestThreadPoolName {
    static class NamedThreadFactory implements ThreadFactory{
        private static final AtomicInteger poolNumber =new AtomicInteger(1);
        private final ThreadGroup group;
        private final AtomicInteger threadNumber=new AtomicInteger(1);
        private final String namePrefix;

        NamedThreadFactory(String name){
            SecurityManager s=System.getSecurityManager();
            group=(s!=null)?s.getThreadGroup():Thread.currentThread().getThreadGroup();
            if(name==null||name.isEmpty()){
                name="pool";
            }
            //将传入的name设置为线程池的名称
            namePrefix=name+"-"+poolNumber.getAndIncrement()+"-thread-";
        }

        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(group, r,
                    namePrefix + threadNumber.getAndIncrement(),
                    0);
            if (t.isDaemon())
                t.setDaemon(false);
            if (t.getPriority() != Thread.NORM_PRIORITY)
                t.setPriority(Thread.NORM_PRIORITY);
            return t;
        }
    }
    //使用线程工厂来为线程池命名，指定名称为ThreadPoolOne
    static ThreadPoolExecutor executorOne=new ThreadPoolExecutor(5, 5, 1, TimeUnit.MINUTES, new LinkedBlockingQueue<>(),new NamedThreadFactory("ThreadPoolOne"));
    //未命名的线程池
    static ThreadPoolExecutor executorTwo=new ThreadPoolExecutor(5,5,1,TimeUnit.MINUTES,new LinkedBlockingQueue<>());

    public static void main(String[] args) {
        executorOne.execute(new Runnable() {
            @Override
            public void run() {
                //指定了名称的线程池
                //当抛出异常时，控制台会打印Exception in thread "ThreadPoolOne-1-thread-1"
                throw new NullPointerException();
            }
        });
        executorTwo.execute(new Runnable() {
            @Override
            public void run() {
                //未指定名称的线程池
                //当抛出异常时，控制台会打印Exception in thread "pool-1-thread-1"
                throw new NullPointerException();
            }
        });
        executorOne.shutdown();
        executorTwo.shutdown();
    }
}
```

### 12.4使用线程池的情况下当程序结束时记得调用shutdown关闭线程池

在使用完线程池后要记得调用`shutdown`方法来关闭线程池，否则会导致线程池资源一直不被释放

#### 12.4.1问题分析

线程池默认的线程工厂`ThreadFactory`创建的线程是用户线程，而线程池中的核心线程只要被创建了就会一直存在，而`shutdown`方法的作用就是让这些核心线程终止

### 12.5线程池使用FutureTask时需要注意的事情

线程池使用`FutureTask`时如果把拒绝策略设置为`DiscardPolicy`和`DiscardOldestPolicy`，并且在被拒绝的任务的`Future`对象上的调用了无参的`get`方法，将导致调用的线程一直被阻塞

#### 12.5.1问题复现

```java
package action;

import java.util.concurrent.*;

public class FutureTest {
    //创建单个线程的线程池，并且阻塞队列长度为1
    private final static ThreadPoolExecutor executorService=new ThreadPoolExecutor(1,1,1L, TimeUnit.MINUTES,new ArrayBlockingQueue<>(1),new ThreadPoolExecutor.DiscardPolicy());

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        //添加任务1，该任务由唯一的线程执行
        Future<?> futureOne=executorService.submit(new Runnable() {
            @Override
            public void run() {
                System.out.println("start runnable one");
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        //添加任务2，该任务会被放入阻塞队列中
        Future<?> futureTwo=executorService.submit(new Runnable() {
            @Override
            public void run() {
                System.out.println("start runnable two");
            }
        });
        //添加任务3，任务3由于队列已满所以触发了拒绝策略被丢弃
        Future<?> futureThree=null;
        try {
            futureThree = executorService.submit(new Runnable() {
                @Override
                public void run() {
                    System.out.println("start runnable three");
                }
            });
        }catch (Exception e){
            System.out.println(e.getLocalizedMessage());
        }
        System.out.println("task one "+futureOne.get());
        System.out.println("task two "+futureTwo.get());
        //（1）此处，调用任务3的无参get方法会被一直阻塞在此
        System.out.println("task three "+(futureThree==null?null:futureThree.get()));
        executorService.shutdown();
    }
}/*output
start runnable one
start runnable two
task one null
task two null
*/
```

#### 12.5.2问题分析

线程池的`submit`方法被调用后是一定会返回一个不为空的`Future`对象，所以代码（1）无论如何都会调用`get`方法

线程池的`submit`方法源码：

```java
public Future<?> submit(Runnable task) {
    //如果传入的线程为空则会抛出异常
    if (task == null) throw new NullPointerException();
    //装饰Runnable为Future对象，此时该对象处于NEW状态
    RunnableFuture<Void> ftask = newTaskFor(task, null);
    //假设传入的是任务3，则此时会执行拒绝策略（实际上这个拒绝策略啥也不做），所以该方法会直接返回
    execute(ftask);
    //最终返回给用户一个处于NEW状态的Future对象
    return ftask;
}
```

由于最终用户得到的是一个处于`NEW`状态的`Future`对象，而`get`方法仅在对象的状态值大于`COMPLETING`时返回，否则等待。状态值`NEW`是小于`COMPLETING`的，所以导致任务3调用`get`后，一直等待

解决方案：

- 重写`DiscardPolicy`的拒绝策略
- 使用带超时时间的`get`方法

### 12.6使用ThreadLocal不当可能会导致内存泄漏

#### 12.6.1为何会出现内存泄露

`ThreadLocal`只是一个工具类，本身不存储值，它只是作为一个`key`来让线程从`ThreadLocalMap`获取`value`

在`ThreadLocal`的生命周期中，都存在这些引用：

![image-20210512091954527](/static/img/image-20210512091954527.png)

图中的虚线，表示`ThreadLocalMap`是使用`ThreadLocal`的弱引用作为`key`

原因：假设当前线程还存在的情况，由于`ThreadLocalMap`使用`ThreadLocal`的弱引用作为`key`，这个`key`会在GC时被回收，导致`ThreadLocalMap`中出现`key`为`null`但是`value`不为`null`，而这个`value`也永远无法访问，即内存泄露

`ThreadLocalMap`的设计中已经考虑到内存泄露的情况，所以在`ThreadLocal`的`get`,`set`,`remove`方法里面都会找一些时机对这些`key`为`null`的`entry`进行清理，但这些清理不是必须发生的

`ThreadLocalMap`的`remove`方法源码：

```java
private void remove(ThreadLocal<?> key) {
    Entry[] tab = table;
    int len = tab.length;
    int i = key.threadLocalHashCode & (len-1);
    for (Entry e = tab[i];
         e != null;
         e = tab[i = nextIndex(i, len)]) {
        //找到对应的ThreadLocal对象
        if (e.get() == key) {
            //调用WeakReference的clear方法清除对ThreadLocal的弱引用
            e.clear();
            //清理key为null的元素
            expungeStaleEntry(i);
            return;
        }
    }
}

//ThreadLocal的expungeStaleEntry方法源码
private int expungeStaleEntry(int staleSlot) {
    Entry[] tab = table;
    int len = tab.length;

    //去掉对value的引用
    tab[staleSlot].value = null;
    tab[staleSlot] = null;
    size--;
    Entry e;
    int i;
    for (i = nextIndex(staleSlot, len);
         (e = tab[i]) != null;
         i = nextIndex(i, len)) {
        ThreadLocal<?> k = e.get();
        //如果key为null，则去掉对value的引用，并清除该元素
        if (k == null) {
            e.value = null;
            tab[i] = null;
            size--;
        } else {
            int h = k.threadLocalHashCode & (len - 1);
            if (h != i) {
                tab[i] = null;

                while (tab[h] != null)
                    h = nextIndex(h, len);
                tab[h] = e;
            }
        }
    }
    return i;
}
```

解决方案：

每次使用完毕`ThreadLocal`，都应该及时调用`remove`方法

#### 12.6.2在线程池中使用ThreadLocal导致的内存泄漏

```java
package action;

import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class ThreadPoolTest {
    static class LocalVarible{
        private Long[] a=new Long[1024*1024];
    }
    //创建一个核心线程数和最大线程数都为5的线程池
    final static ThreadPoolExecutor poolExcutor=new ThreadPoolExecutor(5,5,1, TimeUnit.MINUTES,new LinkedBlockingQueue<>());
    //ThreadLocal对象
    final static ThreadLocal<LocalVarible> localVariable=new ThreadLocal<>();

    public static void main(String[] args) throws InterruptedException {
        for (int i=0;i<50;i++){
            poolExcutor.execute(new Runnable() {
                @Override
                public void run() {
                    //以ThreadLocal对象的弱引用为key，LocalVarible对象为value
                    localVariable.set(new LocalVarible());
                    System.out.println("use local variable");
                    //代码（1）
					//localVariable.remove();
                }
            });
            Thread.sleep(1000);
        }
        System.out.println("pool execute over");
    }
}
```

上述代码由于没有调用线程池的`shutdown`方法，所以JVM进程不会退出，运行代码，使用`jconsole`监控堆内存变化：

- 代码（1）注释后的堆内存变化：

  ![image-20210512130332428](/static/img/image-20210512130332428.png)

  在任务运行结束后，执行GC，堆内存还占用着大概20MB的内存

- 代码（1）未注释的堆内存变化：

  ![image-20210512130607456](/static/img/image-20210512130607456.png)

  在任务运行结束后，执行GC，堆内存还占用着大概4MB的内存

由此可见，在使用完毕`ThreadLocal`对象后未执行`remove`方法的程序发生了内存泄漏，其原因如下：

任务执行完毕后，线程池的核心线程是会一直存在，直到JVM进程被杀死，所以在GC后，`ThreadLocalMap`中所有`ThreadLocal`对象的软引用都被回收，而以 `ThreadLocal`对象的软引用为`key`所对应的`value`不会被回收，导致内存泄露



