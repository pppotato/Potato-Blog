---
title: Spring学习
date: 2020-03-05
categories:
- Back-End
tags:
- Spring
---

## 1.Spring入门

### 1.1Spring IOC(控制反转)

**IOC设计思想**：**控制**即将设计好的对象交给spring IOC容器管理，由IOC容器控制对象的创建。**反转**即把原本由程序员主动获取对象的依赖对象及外部资源的操作交由spring IOC容器来帮忙创建及注入依赖对象。

**IOC原理**：通过配置文件+反射的方式实现对象之间的解耦合

```xml
<!--配置文件BeanFactory.xml-->
<?xml version="1.0" encoding="UTF-8"?>
<!--beans标签是整个配置文件的根节点，包含一个或多个bean标签-->
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
<!--bean标签用于创建一个实例bean，id的值为这个bean的标识且必须唯一，class的值为某个类的全路径，IOC容器会通过这个全路径反射得到这个类并生成实例bean-->
<bean id="us" class="com.imooc.ioc.demo1.UserServiceImpl"/>
</beans>
```

```java
//接口类
package com.imooc.ioc.demo1;
public interface UserService {
    void sayHello();
}
//实现类
package com.imooc.ioc.demo1;
public class UserServiceImpl implements UserService {
    public void sayHello(){
        System.out.println("hello spring!");
    }
}
//测试类
package com.imooc.ioc.demo1;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class SpringDemo1 {
    @Test
    public void demo1(){
        
//传入一个或多个xml文件名给ClassPathXmlApplicationContext类，用于加载xml配置文件，创建Spring容器
        ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("BeanFactory.xml");//传入多个文件名，用逗号相隔
        
//getBean方法需要传入一个字符串参数，classPathXmlApplicationContext类就会从先前加载的xml配置文件中，寻找id和参数相匹配的bean标签，并从该标签中的class属性对应的全路径名，反射对应的类，并生成该类的实例bean
        UserService userService=(UserService)classPathXmlApplicationContext.getBean("us");//getBean方法返回的Object对象，需要进行强制转换
        userService.sayHello();
    }
}
```

### 1.2DI(依赖注入)

**DI设计思想**：**依赖**即应用程序依赖于IOC容器，应用程序需要IOC容器来提供对象需要的外部资源，**注入**即当应用程序某个对象需要一些外部资源（包括对象、资源、常量数据）时，由IOC容器注入该对象。

## 2.Spring Bean管理

### 2.1Spring工厂类

![img](https://img-blog.csdnimg.cn/20181223124611216.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1cyNjEyODg4,size_16,color_FFFFFF,t_70)

**ClassPathXmlApplicationContext**：传入一个或多个xml文件名给ClassPathXmlApplicationContext类，用于加载类路径下的xml配置文件，创建Spring容器

**FileSystemXmlApplicationContext**：传入一个或多个xml文件的路径给FileSystemXmlApplicationContext类，用于加载文件系统下的xml配置文件，创建Spring容器

**ApplicationContext**：是**BeanFactory**的一个子接口，拥有更多的功能，**ClassPathXmlApplicationContext**和**FileSystemXmlApplicationContext**都是**ApplicationContext**的实现类，**ApplicationContext类在加载配置文件的时候，就会将Spring管理的所有类都实例化**。

**BeanFactory（已过时）**：Spring工厂类的顶层接口，**只有在调用getBean方法时，才会生成类的实例。**

### 2.2Spring Bean管理

##### 2.21Spring Bean管理（XML方式）

- **Bean实例化的三种方式**

  1. 采用无参构造器的方式

     ```xml
     <!--配置文件BeanFactory.xml-->
     <?xml version="1.0" encoding="UTF-8"?>
     <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
             <bean id="bean1" class="com.imooc.ioc.demo2.Bean1"/>
     </beans>
     ```

     ```java
     //目标类
     package com.imooc.ioc.demo2;
     public class Bean1 {
         //当spring生成Bean1类的实例时，该类的无参构造器就会被调用执行
         public Bean1(){
             System.out.println("Bean1被实例化了...");
         }
     }
     //测试类
     package com.imooc.ioc.demo2;
     import org.junit.jupiter.api.Test;
     import org.springframework.context.support.ClassPathXmlApplicationContext;
     
     public class SpringDemo2 {
         @Test
         public void demo1(){
             ClassPathXmlApplicationContext applicationContext=new ClassPathXmlApplicationContext("BeanFactory.xml");//打印结果：Bean1被实例化了...
             Bean1 bean1=(Bean1)applicationContext.getBean("bean1");
         }
     }
     ```

  2. 采用静态工厂的方式：将对象创建的过程封装到静态方法中 , 当客户端需要对象时 , 只需要简单地调用静态方法 , 而不需要关心创建对象的细节。

     ```xml
     <!--配置文件BeanFactory.xml-->
     <?xml version="1.0" encoding="UTF-8"?>
     <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
     <!--采用静态工厂的方式来实例化一个bean，此时bean标签的class属性不再指向bean实例的实现类，而是指向静态工厂类，同时还需要属性factory-method指定静态工厂-->
             <bean id="bean2" class="com.imooc.ioc.demo2.Bean2Factory" factory-method="CreateBean2"/>
     </beans>
     ```

     ```java
     //目标类
     package com.imooc.ioc.demo2;
     //由静态工厂类生成Bean2的实例，所以类本身无需做任何操作
     public class Bean2 {
     }
     //静态工厂类
     package com.imooc.ioc.demo2;
     public class Bean2Factory {
         //CreateBean2方法用于生成Bean2的实例
         public static Bean2 CreateBean2(){
             System.out.println("Bean2被实例化了...");
             return new Bean2();//返回Bean2的实例
         }
     }
     //测试类
     package com.imooc.ioc.demo2;
     import org.junit.jupiter.api.Test;
     import org.springframework.context.support.ClassPathXmlApplicationContext;
     public class SpringDemo2 {
         @Test
         public void demo2(){
             ClassPathXmlApplicationContext applicationContext=new ClassPathXmlApplicationContext("BeanFactory.xml");//打印结果：Bean2被实例化了...
             Bean2 bean2=(Bean2)applicationContext.getBean("bean2");
         }
     }
     ```

  3. 采用实例工厂的方式：将对象的创建过程封装到另外一个对象实例的方法里。当客户端需要请求对象时 , 只需要简单的调用该实例方法而不需要关心对象的创建细节

     ```xml
     <!--配置文件BeanFactory.xml-->
     <?xml version="1.0" encoding="UTF-8"?>
     <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
         	<!--注册实例工厂-->
             <bean id="bean3Factory" class="com.imooc.ioc.demo2.Bean3Factory"/>
         	<!--属性factory-bean指定实例工厂，factory-method指定实例工厂类中用于实例化bean的方法-->
             <bean id="bean3" factory-bean="bean3Factory" factory-method="CreateBean3"/>
     </beans>
     ```
     
     ```java
     //目标类
     package com.imooc.ioc.demo2;
     //由实例工厂类生成Bean3的实例，所以类本身无需做任何操作
     public class Bean3 {
     }
     
     //实例工厂类
     package com.imooc.ioc.demo2;
     public class Bean3Factory {
         ////CreateBean3方法用于生成Bean3的实例
         public Bean3 CreateBean3(){
             System.out.println("Bean3被实例化...");
             return new Bean3();//返回Bean3的实例
         }
     }
     //测试类
     package com.imooc.ioc.demo2;
     import org.junit.jupiter.api.Test;
     import org.springframework.context.support.ClassPathXmlApplicationContext;
     public class SpringDemo2 {
         @Test
         public void demo3(){
             ClassPathXmlApplicationContext applicationContext=new ClassPathXmlApplicationContext("BeanFactory.xml");//打印结果：Bean3被实例化了...
             Bean3 bean3=(Bean3)applicationContext.getBean("bean3");
         }
     }
     ```
     
  4. 采用实现`FactoryBean`的工厂类的方式：Spring提供了一个`FactoryBean`接口，用户可以实现该接口来创建自己的工厂类，通过复写接口中的方法可以实现自定义Bean的创建过程

     ```xml
     <!--配置文件BeanFactory.xml-->
     <?xml version="1.0" encoding="UTF-8"?>
     <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
         <!--
     		将实现了FactoryBean接口的工厂类注册到Spring容器中
     		当获取该工厂Bean时，Spring会自动调用工厂Bean中的getObject()方法返回要创建的Bean实例
     	-->
         <bean id="myFactoryBean" class="com.imooc.ioc.demo2.MyFactoryBean"/>
     </beans>
     ```

     ```java
     //目标类
     package com.imooc.ioc.demo2;
     //由实现了FactoryBean接口的工厂类生成Bean4的实例，所以类本身无需做任何操作
     public class Bean4 {
     }
     
     //实现了FactoryBean接口的工厂类
     package com.imooc.ioc.demo2;
     import org.springframework.beans.factory.FactoryBean;
     
     public class MyFactoryBean implements FactoryBean<Bean4> {
         //getObject(),工厂方法，用于获取要创建的Bean实例
         @Override
         public Bean4 getObject() throws Exception {
             System.out.println("Bean4被实例化了...");
             return new Bean4();
         }
     	//getObjectType()用于获取要创建的Bean对应的Class对象
         @Override
         public Class<?> getObjectType() {
             return Bean4.class;
         }
     	
         //isSingleton()用于控制当前要创建的Bean是否为单例
         @Override
         public boolean isSingleton() {
             return true;
         }
     }
     
     //测试类
     package com.imooc.ioc.demo2;
     import org.junit.jupiter.api.Test;
     import org.springframework.context.support.ClassPathXmlApplicationContext;
     
     public class SpringDemo2 {
         @Test
         public void demo4(){
             //采用这种方式，在加载配置文件时，并不会实例化Bean4
             ClassPathXmlApplicationContext applicationContext=new ClassPathXmlApplicationContext("BeanFactory.xml");
             Bean4 bean4=(Bean4)applicationContext.getBean("myFactoryBean");//打印Bean4被实例化...
         }
     }
     ```

     **注意：**使用实现了`FactoryBean`接口的工厂类来实例化Bean，在加载配置文件时，是不会将对应的Bean实例化，只有调用`getBean`方法获取对应的Bean时，才会进行实例化

- **Bean的配置**

  Bean标签属性
  
  - id：表示Bean在IOC容器中的名称，必须唯一
  
  - name：同id属性，但若Bean名称中含特殊字符，只能使用name属性指定，不可以使用id
  
  - class：用于设置一个类的完全路径名称，以便IOC容器生成类的实例
  
  - scope：配置Bean的作用域
  
    - 如果是单例作用域，那么每次加载配置文件时，对应的bean都会实例化
    - 如果是多例作用域，那么只有在调用`getBean`方法获取，对应的`bean`才会实例化，并且每次获取的`bean`都是不同的
    
    ```xml
    <!--singleton表示单例模式，每次调用getBean生成的所有实例都指向同一引用--> 
    <!--不指定scope属性默认为singleton-->
    <bean name="bean1" class="com.imooc.ioc.demo2.Bean1" scope="singleton"/> 
    
    <!--prototype表示多例模式，每次调用getBean都会生成不同的实例-->
    <bean name="bean1" class="com.imooc.ioc.demo2.Bean1" scope="prototype"/>
    ```
  
- **Bean的生命周期**

  ![img](https://img-blog.csdn.net/2018100810403571?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0FwZW9wbA==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
  
  ```java
  //Bean.java
  package com.imooc.ioc.demo3;
  import org.springframework.beans.BeansException;
  import org.springframework.beans.factory.*;
  
  public class Bean implements BeanNameAware, BeanFactoryAware, InitializingBean, DisposableBean {
      String name;
      public Bean(){
          System.out.println("第一步：Bean被实例化了...");
      }
      public void init(){
          System.out.println("第七步：Bean被初始化了...");
      }
      public void end(){
          System.out.println("第十一步：执行用户配置的销毁方法");
      }
  
      public void setName(String name) {
          System.out.println("第二步：封装Bean的属性");
      }
  
      //setBeanName用于让bean获取自己的id属性值，传入的字符串s即为bean在xml配置文件中的id
      @Override
      public void setBeanName(String s) {
          System.out.println("第三步：若Bean实现了BeanNameAware，则执行setBeanName");
      }
  
      //setBeanFactory用于让bean获取spring容器
      @Override
      public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
          System.out.println("第四步：若Bean实现了BeanFactoryAware，则执行setBeanFactory");
      }
  
      @Override
      public void afterPropertiesSet() throws Exception {
          System.out.println("第六步：若Bean实现了InitializingBean，则执行afterPropertiesSet");
      }
      public void method(){
          System.out.println("第九步：执行Bean自身的业务方法");
      }
  
      @Override
      public void destroy() throws Exception {
          System.out.println("第十步：若Bean实现了DisposableBean，则执行destroy方法");
      }
  }
  //MyBeanPostProcessor.java
  package com.imooc.ioc.demo3;
  import org.springframework.beans.BeansException;
  import org.springframework.beans.factory.config.BeanPostProcessor;
  
  public class MyBeanPostProcessor implements BeanPostProcessor {
      @Override
      public Object postProcessBeforeInitialization(Object o, String s) throws BeansException {
          System.out.println("第五步：若存在类实现BeanPostProcessor，则执行postProcessBeforeInitialization");
          return o;
      }
  
      @Override
      public Object postProcessAfterInitialization(Object o, String s) throws BeansException {
          System.out.println("第八步：若存在类实现BeanPostProcessor，则执行postProcessAfterInitialization");
          return o;
      }
  }
  ```
  
  ```XML
  <!--配置文件BeanFactory.xml-->
  <?xml version="1.0" encoding="UTF-8"?>
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
      <!--init-method用于指定bean实例初始化时调用的方法，destroy-method用于指定bean实例销毁时调用的方法-->
      <!--destroy-method属性仅在scope属性值为singleton时生效-->
          <bean id="bean" class="com.imooc.ioc.demo3.Bean" init-method="init" destroy-method="end">
                  <property name="name" value="spring"/>
          </bean>
          <bean class="com.imooc.ioc.demo3.MyBeanPostProcessor"/>
  </beans>
  ```
  
- **BeanPostProcessor搭配动态代理增强方法**

  ```java
  //MyBeanPostProcessor.java
  package com.imooc.ioc.demo3;
  import org.springframework.beans.BeansException;
  import org.springframework.beans.factory.config.BeanPostProcessor;
  import java.lang.reflect.InvocationHandler;
  import java.lang.reflect.Method;
  import java.lang.reflect.Proxy;
  
  public class MyBeanPostProcessor implements BeanPostProcessor {
      @Override
      public Object postProcessBeforeInitialization(Object o, String s) throws BeansException {
          return o;
      }
  
      //实现了BeanPostProcessor接口的类可通过重写postProcessAfterInitialization方法搭配动态代理实现方法的增强
      @Override
      public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
          if("userDao".equals(beanName)) {//当beanName为userDao时则生成一个代理类对其进行增强
              Object proxy = Proxy.newProxyInstance(bean.getClass().getClassLoader(), bean.getClass().getInterfaces(), new InvocationHandler() {
                  @Override
                  public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                      if ("save".equals(method.getName())) {
                          System.out.println("权限验证");
                          return method.invoke(bean, args);
                      }
                      return method.invoke(bean, args);
                  }
              });
              return proxy;
          }
          else {
              return bean;//否则啥也不做，直接返回bean实例
          }
      }
  }
  
  ```

- **Spring的属性注入**

  **注入方式：**

  1. 通过构造函数注入

     ```java
     //User.java
     package com.imooc.ioc.demo4;
     public class User {
         private String name;
         private Customer customer;
         public User(String name,Customer customer){
             this.name=name;
             this.customer=customer;
         }
     }
     //Customer.java
     package com.imooc.ioc.demo4;
     
     public class Customer {
         private String name;
         public Customer(String name){
             this.name=name;
         }
     }
     ```

     ```xml
     <!--applicationcontext.xml-->
     <?xml version="1.0" encoding="UTF-8"?>
     <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
         <bean id="customer" class="com.imooc.ioc.demo4.Customer">
            <!--在bean标签下使用constructor-arg子标签即可对构造函数进行属性注入-->
            <!--可以通过name属性，type属性，index属性寻找对应的属性名
            <!--name属性表示构造函数中对应的参数名，type属性表示构造函数中对应参数的类型名，index属性表示构造函数中参数的下标-->
             <constructor-arg name="name" value="李四"/>
         </bean>
         <bean id="user" class="com.imooc.ioc.demo4.User">
             <!--属性value和ref表示需要注入构造函数中对应参数的值，value的值只能是基本数据类型，ref的值只能是对象的引用-->
             <constructor-arg name="name" value="张三"/>
             <constructor-arg name="customer" ref="customer"/>
         </bean>
     </beans>
     ```

  2. 通过setter方法注入

     ```java
     //Person.java
     package com.imooc.ioc.demo4;
     
     public class Person {
         private String name;
         //只有设置了setter的方法，才可以在配置文件中使用property标签
         public void setName(String name) {
             this.name = name;
         }
     }
     ```

     ```xml
     <!--applicationcontext.xml-->
     <?xml version="1.0" encoding="UTF-8"?>
     <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
         <bean id="person" class="com.imooc.ioc.demo4.Person">
             <!--实例bean对应的类必须拥有setter方法才可使用property标签-->
             <property name="name" value="potato"/>
         </bean>
     </beans>
     ```

     - **采用p名称空间的属性注入：**

       语法：

       - 注入属性的值为基本数据类型时：**` p:属性名=""`**

       - 注入属性的值为对象的引用时：**`p:属性名-ref=""`**

       ```xml
       <!--applicationcontext.xml-->
       <?xml version="1.0" encoding="UTF-8"?>
       <beans xmlns="http://www.springframework.org/schema/beans"
       <!--要使用p名称空间，需要在配置文件中添加xmlns:p="http://www.springframework.org/schema/p"-->       
              xmlns:p="http://www.springframework.org/schema/p"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
       	<!--要采用p名称空间的属性注入，对应的类必须拥有setter方法-->
           <bean id="customer" class="com.imooc.ioc.demo4.Customer" p:name="李四"/>
           <bean id="user" class="com.imooc.ioc.demo4.User" p:name="张三" p:customer-ref="customer"/>
       </beans>
       ```

     - **采用SpEL（spring表达式语言）的属性注入：**

       语法：**`#{表达式}`**

       - **`#{'xxx'}`**：使用字符串
       - **`#{beanId}`**：使用另一个bean
       - **`#{beanId.attr}`**：使用另一个bean的属性
       - **`{beanId.method()}`**：使用另一bean的方法
       - **#{T(class).method}`**：使用某个静态类的方法attr`**
       - **`**`#{T(class).attr}`**：使用某个静态类的属性

       ```xml
       <!--applicationcontext.xml-->
       <?xml version="1.0" encoding="UTF-8"?>
       <beans xmlns="http://www.springframework.org/schema/beans"
              xmlns:p="http://www.springframework.org/schema/p"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
           <bean id="exp1" class="com.imooc.ioc.demo4.Example1">
               <!--调用了静态类Math的属性PI和bean实例exp2的getmoney()方法-->
               <property name="money" value="#{T(java.lang.Math).PI+exp2.getmoney()}"/>
               <!--在使用SpEL的属性注入时，不管注入的值为对象的引用还是基本数据类型，都使用value属性进行赋值-->
               <property name="example2" value="#{exp2}"/>
           </bean>
           <bean id="exp2" class="com.imooc.ioc.demo4.Example2"/>
       </beans>
       ```

     - **复杂类型的属性注入**

       1. **数组类型**：

          ```xml
          <!--在property的子标签下采用list和value标签来完成数组类型的属性注入-->
          <bean id="collections" class="com.imooc.ioc.demo5.Collections">
              <property name="arr">
              <list>
                  <value>123</value>
                  <value>456</value>
              </list>
          </bean>
          ```

       2. **List集合类型**：

          ```xml
          <!--在property的子标签下采用list和value标签来完成列表类型的属性注入-->
          <bean id="collections" class="com.imooc.ioc.demo5.Collections">
              <property name="list">
                  <list>
                      <value>123</value>
                      <value>456</value>
                  </list>
              </property>
          </bean>
          ```

       3. **Set集合类型**：

          ```xml
          <!--在property的子标签下采用set和value标签来完成集合类型的属性注入-->
          <bean id="collections" class="com.imooc.ioc.demo5.Collections">
              <property name="set">
                  <set>
                      <value>123</value>
                      <value>456</value>
                  </set>
              </property>
          </bean>
          ```

       4. **Map集合类型**：

          ```xml
          <!--在property的子标签下采用map和entry标签来完成Map类型的属性注入-->
          <bean id="collections" class="com.imooc.ioc.demo5.Collections">
              <property name="map">
                  <map>
                      <!--entry标签用于描述键值对-->
                      <entry key="123" value="456"/>
                      <entry key="789" value="abc"/>
                  </map>
              </property>
          </bean>
          ```

       5. **Properties类型**：

          ```xml
          <!--在property的子标签下采用props和prop标签来完成Properties类型的属性注入-->
          <bean id="collections" class="com.imooc.ioc.demo5.Collections">
              <property name="properties">
                  <props>
                      <prop key="123">456</prop>
                      <prop key="789">abc</prop>
                  </props>
              </property>
          </bean>
          ```

- **补充知识：**

  - 为属性赋`null`值

    `<null/>`标签可以表示Java中的`null`

    - `application.xml`

      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <beans xmlns="http://www.springframework.org/schema/beans"
             xmlns:p="http://www.springframework.org/schema/p"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
          <bean id="person" class="com.imooc.ioc.demo4.Person">
              <!--为Person类的name属性赋值null-->
              <property name="name">
                  <null/>
              </property>
          </bean>
      </beans>
      ```

    - `Person`类

      ```java
      package com.imooc.ioc.demo4;
      
      public class Person {
          private String name;
          public void setName(String name) {
              this.name=name;
          }
      
          public String getName() {
              return name;
          }
      }
      ```

  - 引用内部bean

    当一个Bean中的属性是引用类型的时候，我们可以为相应属性标签的`ref`属性赋值一个外部`bean`的id值来达到引用这个外部`bean`，也可以直接在属性标签内部直接新建一个`bean`标签

    - `application.xml`

      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <beans xmlns="http://www.springframework.org/schema/beans"
             xmlns:p="http://www.springframework.org/schema/p"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
          <bean id="exp1" class="com.imooc.ioc.demo4.Example1">
              <!--
      			使用内部bean标签来初始化example2属性
      			相当于example2=new Example2()
      		-->
              <property name="example2">
                  <bean class="com.imooc.ioc.demo4.Example2"/>
              </property>
          </bean>
      </beans>
      ```

    - `Example1`类

      ```xm
      package com.imooc.ioc.demo4;
      
      public class Example1 {
          private double money;
          private Example2 example2;
      
          public void setMoney(double money) {
              this.money = money;
          }
      
          @Override
          public String toString() {
              return "Example1{" +
                      "money=" + money +
                      ", example2=" + example2 +
                      '}';
          }
      
          public void setExample2(Example2 example2) {
              this.example2 = example2;
          }
      }
      ```

    - `Example2`类

      ```java
      package com.imooc.ioc.demo4;
      
      public class Example2 {
          public double getmoney(){
              return 100.00;
          }
      }
      ```

  - 使用`util`名称空间创建集合类型的`bean`，方便其他`bean`引用（普通的`<map/>`、`<list/>`标签无法被其他bean引用）

    - `application.xml`

      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <beans xmlns="http://www.springframework.org/schema/beans"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             <!--需要添加util名称空间-->
             xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/util
      http://www.springframework.org/schema/util/spring-util-4.2.xsd"
             xmlns:util="http://www.springframework.org/schema/util">
          <!--相当于myMap=new LinkedHashMap()-->
          <util:map id="myMap">
              <entry key="123" value="456"/>
              <entry key="789" value="abc"/>
          </util:map>
          <bean id="collection" class="com.imooc.ioc.demo5.Collections">
              <!--引用使用util名称空间创建的map对象-->
              <property name="map" ref="myMap"/>
          </bean>
      </beans>
      ```
  
    - `Collections`类
  
      ```java
      package com.imooc.ioc.demo5;
      
      import java.util.*;
      
      public class Collections {
          private Map<Integer,String> map;
          public void setMap(Map<Integer, String> map) {
              this.map = map;
          }
      }
      ```
  
  - 级联属性赋值
  
    如果一个Bean的属性是引用类型的，那么该属性的属性就是级联属性，可以直接通过`属性名.属性名`直接为其赋值（**注意：需要赋值的级联属性必须具有getter和setter方法**）
  
    - `application.xml`
  
      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <beans xmlns="http://www.springframework.org/schema/beans"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"
             xmlns:util="http://www.springframework.org/schema/util">
          <bean id="customer" class="com.imooc.ioc.demo4.Customer">
              <property name="name" value="aaa"/>
          </bean>
          <bean id="user" class="com.imooc.ioc.demo4.User">
              <property name="customer" ref="customer"/>
              <!--属性customer的name属性值先被初始化为aaa-->
              <!--然后将属性customer的name属性值修改为bbb-->
              <property name="customer.name" value="bbb"/>
          </bean>
      </beans>
      ```
  
    - `User`类
  
      ```java
      package com.imooc.ioc.demo4;
      
      public class User {
          private String name;
          private Customer customer;
      
          public void setName(String name) {
              this.name = name;
          }
      
          public void setCustomer(Customer customer) {
              this.customer = customer;
          }
      
          public String getName() {
              return name;
          }
      
          public Customer getCustomer() {
              return customer;
          }
      
          @Override
          public String toString() {
              return "User{" +
                      "name='" + name + '\'' +
                      ", customer=" + customer +
                      '}';
          }
      }
      ```
  
    - `Customer`类
  
      ```java
      package com.imooc.ioc.demo4;
      
      public class Customer {
          private String name;
      
          public void setName(String name) {
              this.name = name;
          }
      
          public String getName() {
              return name;
          }
      
          @Override
          public String toString() {
              return "Customer{" +
                      "name='" + name + '\'' +
                      '}';
          }
      }
      ```
  
  - 通过继承实现`bean`配置信息的重用
  
    当要复用另一个`bean`的配置信息时，可以使用`bean`标签的`parent`属性，指定要复用的`bean`标签id
  
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"
           xmlns:util="http://www.springframework.org/schema/util">
        <bean id="person01" class="com.imooc.ioc.demo4.Person">
            <property name="name" value="aaa"/>
            <property name="age" value="12"/>
        </bean>
        <!--
    		parent属性指定要复用的bean标签
    		此时person02会继承person01的配置信息，同时在此基础上还能进行增加和修改
    	-->
        <bean id="person02" class="com.imooc.ioc.demo4.Person" parent="person01">
            <property name="name" value="bbb"/>
        </bean>
    </beans>
    ```
    
  - 通过`abstract`属性创建一个模板`bean`
  
    模板`bean`的配置信息是用于被其他`bean`标签继承，并且模板`bean`是无法实例化的，即无法通过模板`bean`标签来获取一个实例`bean`
  
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"
           xmlns:util="http://www.springframework.org/schema/util">
        <!--属性abstract为true，表明当前bean标签是用于创建模板bean，其配置信息只能被其他bean标签继承，不能用于实例化bean-->
        <bean id="person01" class="com.imooc.ioc.demo4.Person" abstract="true">
            <property name="name" value="aaa"/>
            <property name="age" value="12"/>
        </bean>
    </beans>
    ```
  
  - 引用外部配置文件
  
    - `application.xml`
  
      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <beans xmlns="http://www.springframework.org/schema/beans"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             <!--要引用外部配置文件，需要引用context名称空间-->
             xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context
      http://www.springframework.org/schema/context/spring-context-4.2.xsd"
             xmlns:context="http://www.springframework.org/schema/context">
      	<!--
      		使用context标签可以加载外部配置文件，属性location指定外部配置文件的路径
      		classpath:，表示引用类路径下的一个资源
      	-->
          <context:property-placeholder location="classpath:test.properties"/>
          <bean id="person" class="com.imooc.ioc.demo4.Person">
              <!--可以使用${属性名}来引用外部配置文件中对应的属性值-->
              <property name="name" value="${Person.name}"/>
          </bean>
      </beans>
      ```
    
    - `test.properties`
    
      ```properties
      Person.name="aaa"
      ```

##### 2.22Spring Bean管理（注解方式）

1.首先开启注解扫描（在xml文件中配置）：**`<context:component-scan base-package="要开启注解扫描的包名"/>`**（能扫描包下所有带注解的类）

2.用注解定义Bean：

- **@Component**：描述Spring框架中的Bean

- **@Repository**：用于对DAO实现类进行标注 

- **@Service**：用于对于Service实现类进行标注

- **@Controller**：用于对于Controller实现类进行标注

  ```java
  package com.imooc.ioc;
  import org.springframework.stereotype.Component;
  @Component("exp")//@Component("BeanId")等同于xml中<bean id="exp" class="com.imooc.ioc.demo6.exp"/>
  public class Example {
  }
  ```

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="
          http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
          http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd"> 
      <!--开启注解扫描,扫描在ioc包下所有带注解的类-->
      <context:component-scan base-package="com.imooc.ioc"/>
  </beans>
  ```

3.使用注解的属性注入（使用注解方式的属性注入无需要求类有setter方法）：

- **@Value**：对基本数据类型的属性注入

- **@Autowired**：默认按照类型进行自动注入，如果存在两个Bean类型相同，则按照名称自动注入。有一个required属性，默认为true，表示注入的时候，该bean必须存在，否则就会注入失败；当属性值为false，表示忽略当前要注入的bean，如果有直接注入，没有跳过，不会报错。

- **@Qualifier**：要求同类型同名称的属性注入，需要同**@Autowired**搭配使用，否则无法自动注入

- **@Resource**：要求同类型同名称的属性注入，相当于**@Autowired**和**@Qualifier**搭配使用

  ```java
  //Example.java
  package com.imooc.ioc.demo6;
  import com.imooc.ioc.demo6.Example2;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.beans.factory.annotation.Qualifier;
  import org.springframework.beans.factory.annotation.Value;
  import org.springframework.stereotype.Component;
  
  @Component("exp")
  public class Example {
      @Value("123")
      String s;
      @Autowired//@Autowired会在同一个包下寻找Example2类型的Bean实例，并注入
      public  Example2 example2;
      @Autowired
      @Qualifier(value = "exp2")//@Autowired搭配@Qualifier使用，即强制寻找名称相匹配的Bean实例，并注入
      public Example2 example;
      @Resource(name = "exp2")//等同于@Autowired+@Qualifier
      public Example2 example3;
  }
  //Example2.java
  package com.imooc.ioc.demo6;
  import org.springframework.stereotype.Component;
  @Component("exp2")
  public class Example2 {
  }
  ```

4.Spring的其他注解

- **@PostConstruct**：当Bean初始化时spring会调用被该注解注册的方法

- **@PreDestroy**：当Bean被销毁时spring会调用被该注解注册的方法

- **@Scope**：指定Bean的作用范围

  ```java
  package com.imooc.ioc.demo6;
  import org.springframework.context.annotation.Scope;
  import org.springframework.stereotype.Component;
  import javax.annotation.PostConstruct;
  import javax.annotation.PreDestroy;
  
  @Component(value = "bean")
  @Scope(value = "prototype")//默认value值为singleton，该注解相当于xml方式中的<bean id="xxx" class="xxx" scope="prototype"/>
  public class Bean {
      @PostConstruct//该注解相当于xml方式中的<bean id="xxx" class="xxx" init-method="init"/>
      public void init(){
          System.out.println("Bean被初始化了..");
      }
      @PreDestroy//该注解相当于xml方式中的<bean id="xxx" class="xxx" destroy-method="destroy"/>
      public void destroy(){
          System.out.println("Bean被销毁了...");
      }
  }
  ```

### 2.3Spring的xml和注解整合开发

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200131133559366.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzMwNTM1OQ==,size_16,color_FFFFFF,t_70)

​	`<context:annotation-config/>`：开启属性注入的注解（因为Bean交由xml配置文件管理，所以不必开启注解的包扫描）

- Bean交由xml配置文件管理
- 属性注入交由注解方式管理

## 3.Spring IOC源码解析

```java
@Test
public void sourceTest(){
    //初始化IOC容器
    ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("applicationcontext.xml");
    //获取实例bean
    Person person=classPathXmlApplicationContext.getBean("person",Person.class);
    System.out.println(person);
}
```

1. 初始化IOC容器

   - 首先传入xml配置文件名，调用`ClassPathXmlApplicationContext`类的构造器来初始化一个IOC容器，`ClassPathXmlApplicationContext`类的构造器源码如下：

     ```java
     public ClassPathXmlApplicationContext(String configLocation) throws BeansException {
         //其内部最终都委托给另一个重载构造器
         this(new String[] {configLocation}, true, null);
     }
     
     //另一个重载构造器
     public ClassPathXmlApplicationContext(String[] configLocations, boolean refresh, ApplicationContext parent)
           throws BeansException {
        super(parent);
         //将传入的xml配置文件路径保存到类的属性中
        setConfigLocations(configLocations);
         //refresh默认都为true
        if (refresh) {
           //最终将初始化的任务委托给refresh()方法 
           refresh();
        }
     }
     ```

   - `ClassPathXmlApplicationContext`类继承自`AbstractRefreshableConfigApplicationContext`类，`AbstractRefreshableConfigApplicationContext`类重写了其父类的`refresh()`方法

     ```java
     @Override
     public void refresh() throws BeansException, IllegalStateException {
         //加锁同步，使得多线程下同时只会创建一个IOC容器
        synchronized (this.startupShutdownMonitor) {
           //准备容器刷新
           prepareRefresh();
           //创建一个ConfigurableListableBeanFactory工厂，其实际类型为DefaultListableBeanFactory
           ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
     
           //解析xml配置文件，将配置信息加载到新建的DefaultListableBeanFactory工厂
           prepareBeanFactory(beanFactory);
     
           try {
              //这是一个空方法，提供给子类复写逻辑，用来定制BeanFactory工厂
              postProcessBeanFactory(beanFactory);
     
              //实例化并调用所有已注册的BeanFactoryPostProcessor
              invokeBeanFactoryPostProcessors(beanFactory);
     
              //注册所有的BeanPostProcessor，将所有实现了BeanPostProcessor接口的类加载到DefaultListableBeanFactory工厂中
              registerBeanPostProcessors(beanFactory);
     
              //初始化消息源
              initMessageSource();
     
              //初始化事件监听多路广播器
              initApplicationEventMulticaster();
     
     		 //是一个空方法，提供给子类复写逻辑，用来定制BeanFactory工厂
              onRefresh();
     
              //注册监听器
              registerListeners();
     
              //初始化所有非懒加载的单例bean
              finishBeanFactoryInitialization(beanFactory);
     
              // 发布对应事件
              finishRefresh();
           }
     
           catch (BeansException ex) {
              if (logger.isWarnEnabled()) {
                 logger.warn("Exception encountered during context initialization - " +
                       "cancelling refresh attempt: " + ex);
              }
     
              // Destroy already created singletons to avoid dangling resources.
              destroyBeans();
     
              // Reset 'active' flag.
              cancelRefresh(ex);
     
              // Propagate exception to caller.
              throw ex;
           }
     
           finally {
              // Reset common introspection caches in Spring's core, since we
              // might not ever need metadata for singleton beans anymore...
              resetCommonCaches();
           }
        }
     }
     ```

     - `AbstractRefreshableConfigApplicationContext`类的`finishBeanFactoryInitialization`方法

       ```java
       protected void finishBeanFactoryInitialization(ConfigurableListableBeanFactory beanFactory) {
          //初始化类型转换服务
          if (beanFactory.containsBean(CONVERSION_SERVICE_BEAN_NAME) &&
                beanFactory.isTypeMatch(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class)) {
             beanFactory.setConversionService(
                   beanFactory.getBean(CONVERSION_SERVICE_BEAN_NAME, ConversionService.class));
          }
       
          //织入第三方模块
          String[] weaverAwareNames = beanFactory.getBeanNamesForType(LoadTimeWeaverAware.class, false, false);
          for (String weaverAwareName : weaverAwareNames) {
             getBean(weaverAwareName);
          }
       
          //停止使用临时的类加载器进行类型匹配
          beanFactory.setTempClassLoader(null);
       
          //冻结配置，不再修改
          beanFactory.freezeConfiguration();
       
          //最终将初始化所有非懒加载的单例bean委托给DefaultListableBeanFactory类的preInstantiateSingletons()方法
          beanFactory.preInstantiateSingletons();
       }
       ```

     - `DefaultListableBeanFactory`类的`preInstantiateSingletons()`方法

       ```java
       public void preInstantiateSingletons() throws BeansException {
          if (this.logger.isDebugEnabled()) {
             this.logger.debug("Pre-instantiating singletons in " + this);
          }
          
          //获取xml配置文件中所有bean标签的id
          List<String> beanNames = new ArrayList<String>(this.beanDefinitionNames);
       
          //遍历所有bean标签的id
          for (String beanName : beanNames) {
             //根据id获取到每个bean标签的详细信息
             RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
             //如果该bean标签是非abstract、非懒加载并且是单例作用域
             if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
                 //则再判断该bean标签定义的是否是一个实现了FactoryBean接口的bean
                if (isFactoryBean(beanName)) {
                   final FactoryBean<?> factory = (FactoryBean<?>) getBean(FACTORY_BEAN_PREFIX + beanName);
                   boolean isEagerInit;
                   if (System.getSecurityManager() != null && factory instanceof SmartFactoryBean) {
                      isEagerInit = AccessController.doPrivileged(new PrivilegedAction<Boolean>() {
                         @Override
                         public Boolean run() {
                            return ((SmartFactoryBean<?>) factory).isEagerInit();
                         }
                      }, getAccessControlContext());
                   }
                   else {
                      isEagerInit = (factory instanceof SmartFactoryBean &&
                            ((SmartFactoryBean<?>) factory).isEagerInit());
                   }
                   if (isEagerInit) {
                      getBean(beanName);
                   }
                }
                //如果该bean标签定义的bean没有实现FactoryBean接口
                else {
                    //则调用getBean方法，传入bean标签的id，来实例化这个bean
                   getBean(beanName);
                }
             }
          }
       }
       ```

     - `getBean(String)`方法源码

       ```java
       public Object getBean(String name) throws BeansException {
           //其内部被委托给doGetBean方法
           return doGetBean(name, null, null, false);
       }
       ```

     - `doGetBean`方法源码

       ```java
       protected <T> T doGetBean(
             final String name, final Class<T> requiredType, final Object[] args, boolean typeCheckOnly)
             throws BeansException {
          //对传入的bean标签的id作些简单处理	
          final String beanName = transformedBeanName(name);
          Object bean;
       	
          	//spring会将每个实例化的单例bean放到DefaultSingletonBeanRegistry类的singletonObjects成员变量（单例对象缓存）中，该成员变量是一个ConcurrentHashMap对象，保存着bean name --> bean instance的映射
          //根据bean标签的id从单例对象缓存中获取：
           	//如果单例对象缓存中存在该bean，则返回对应的bean
           	//否则，返回null
          Object sharedInstance = getSingleton(beanName);
          if (sharedInstance != null && args == null) {
             if (logger.isDebugEnabled()) {
                if (isSingletonCurrentlyInCreation(beanName)) {
                   logger.debug("Returning eagerly cached instance of singleton bean '" + beanName +
                         "' that is not fully initialized yet - a consequence of a circular reference");
                }
                else {
                   logger.debug("Returning cached instance of singleton bean '" + beanName + "'");
                }
             }
             bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
          }
          //如果单例对象缓存中不存在该bean，说明我们正准备实例化这个bean
          else {
             // Fail if we're already creating this bean instance:
             // We're assumably within a circular reference.
             if (isPrototypeCurrentlyInCreation(beanName)) {
                throw new BeanCurrentlyInCreationException(beanName);
             }
       
             // Check if bean definition exists in this factory.
             BeanFactory parentBeanFactory = getParentBeanFactory();
             if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
                // Not found -> check parent.
                String nameToLookup = originalBeanName(name);
                if (args != null) {
                   // Delegation to parent with explicit args.
                   return (T) parentBeanFactory.getBean(nameToLookup, args);
                }
                else {
                   // No args -> delegate to standard getBean method.
                   return parentBeanFactory.getBean(nameToLookup, requiredType);
                }
             }
       	  //用于标记当前bean已经被创建，防止多线程下重复创建该bean	
             if (!typeCheckOnly) {
                markBeanAsCreated(beanName);
             }
       
             try {
                 //获取bean标签的详细信息
                final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
                //对整合的bean标签的详细信息进行检查
                checkMergedBeanDefinitition(mbd, beanName, args);
       
                //获取当前bean标签的dependsOn属性，即获取创建当前bean之前需要提前创建的bean
                String[] dependsOn = mbd.getDependsOn();
                 //如果dependsOn不为空，则循环遍历创建这些bean
                if (dependsOn != null) {
                   for (String dependsOnBean : dependsOn) {
                      if (isDependent(beanName, dependsOnBean)) {
                         throw new BeanCreationException(mbd.getResourceDescription(), beanName,
                               "Circular depends-on relationship between '" + beanName + "' and '" + dependsOnBean + "'");
                      }
                      registerDependentBean(dependsOnBean, beanName);
                      getBean(dependsOnBean);
                   }
                }
       
                // 如果当前要创建的bean是单例作用域
                if (mbd.isSingleton()) {
                   //则将单例对象实例化的任务委托给DefaultSingletonBeanRegistry类的getSingleton方法
                   sharedInstance = getSingleton(beanName, new ObjectFactory<Object>() {
                      @Override
                      public Object getObject() throws BeansException {
                         try {
                            return createBean(beanName, mbd, args);
                         }
                         catch (BeansException ex) {
                            // Explicitly remove instance from singleton cache: It might have been put there
                            // eagerly by the creation process, to allow for circular reference resolution.
                            // Also remove any beans that received a temporary reference to the bean.
                            destroySingleton(beanName);
                            throw ex;
                         }
                      }
                   });
                   bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
                }
                 ....
                     
          return (T) bean;
       }
       ```

     - `DefaultSingletonBeanRegistry`类的`getSingleton`方法

       ```java
       public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
          Assert.notNull(beanName, "'beanName' must not be null");
           //加锁同步
          synchronized (this.singletonObjects) {
              //根据bean标签的id从单例对象缓存中获取相应的bean
             Object singletonObject = this.singletonObjects.get(beanName);
              //如果单例对象缓存中没有
             if (singletonObject == null) {
                if (this.singletonsCurrentlyInDestruction) {
                   throw new BeanCreationNotAllowedException(beanName,
                         "Singleton bean creation not allowed while the singletons of this factory are in destruction " +
                         "(Do not request a bean from a BeanFactory in a destroy method implementation!)");
                }
                if (logger.isDebugEnabled()) {
                   logger.debug("Creating shared instance of singleton bean '" + beanName + "'");
                }
                beforeSingletonCreation(beanName);
                boolean newSingleton = false;
                boolean recordSuppressedExceptions = (this.suppressedExceptions == null);
                if (recordSuppressedExceptions) {
                   this.suppressedExceptions = new LinkedHashSet<Exception>();
                }
                try {
                    //调用ObjectFactory类的getObject()方法来实例化该单例对象，其内部根据bean标签的详细信息通过反射获取
                   singletonObject = singletonFactory.getObject();
                   //设置 newSingleton为true，说明该对象是刚刚创建的
                   newSingleton = true;
                }
                catch (IllegalStateException ex) {
                   // Has the singleton object implicitly appeared in the meantime ->
                   // if yes, proceed with it since the exception indicates that state.
                   singletonObject = this.singletonObjects.get(beanName);
                   if (singletonObject == null) {
                      throw ex;
                   }
                }
                catch (BeanCreationException ex) {
                   if (recordSuppressedExceptions) {
                      for (Exception suppressedException : this.suppressedExceptions) {
                         ex.addRelatedCause(suppressedException);
                      }
                   }
                   throw ex;
                }
                finally {
                   if (recordSuppressedExceptions) {
                      this.suppressedExceptions = null;
                   }
                   afterSingletonCreation(beanName);
                }
                if (newSingleton) {
                    //如果该对象是刚刚创建的，将该单例对象添加到单例对象缓存中
                   addSingleton(beanName, singletonObject);
                }
             }
             return (singletonObject != NULL_OBJECT ? singletonObject : null);
          }
       }
       ```

2. 获取实例bean

   调用`ClassPathXmlApplicationContext`对象的`getBean`方法，其内部最终也是调用`doGetBean`方法

## 4.Spring传统AOP开发

### 4.1AOP概述及相关术语

**AOP（面向切面编程）**：采用横向抽取机制，取代了传统纵向继承体系重复性代码（性能监视，事务管理，安全检查，缓存）

**AOP相关术语**：

- **JoinPoint（连接点）**：指程序执行过程可以拦截到的点，因为Spring只支持方法类型的连接点，所以在Spring中连接点指的就是可以被拦截到的方法，实际上连接点还可以是字段或者构造器
- **Pointcut（切点）**：指我们要对哪些**JoinPoint**进行拦截的定义（**即定义了切面在何处完成功能**）
- **Advice（通知）**：指在拦截到**JoinPoint**要做的事情（**即定义了切面何时要完成什么功能**），通知分为前置通知，后置通知，环绕通知，异常通知，最终通知
- **Aspect（切面）**：切点和通知的结合		
- **Target（目标对象）**：代理的目标对象
- **Weaving（织入）**：织入是把切面应用到目标对象并创建新的代理对象的过程。切面在指定的连接点被织入到目标对象中。Spring采用动态代理织入，AspectJ采用编译期织入和类装载期织入。
- **Proxy（代理）**：一个类被AOP织入切面后，就会产生一个结果代理类。

### 4.2AOP的底层实现

Spring AOP底层通过**JDK动态代理**和**CGLIB动态代理**实现对目标Bean执行横向织入：

1. 若目标Bean实现了若干接口，则Spring默认采用JDK动态代理实现 
2. 若目标Bean没有实现任何接口，则Spring采用CGLIB动态代理实现
3. 若目标Bean实现了若干接口，也可以强制Spring采用CGLIB动态代理实现

- **JDK动态代理**：在程序运行过程中，通过反射机制生成一个代理对象，在调用具体方法前调用InvokeHandler来处理。由于生成的代理类对象必须继承`Proxy`类，实现实现类的接口，所以java的单继承机制只允许JDK的动态代理只能代理实现了接口的类。

  ![img](https://img-blog.csdn.net/20160810080241992?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

  -  新建一个接口
  - 为接口创建一个实现类
  - 创建代理类实现java.lang.reflect.InvocationHandler接口

  ```java
  //UserDao.java 接口
  package com.imooc.demo1;
  public interface UserDao {
      void delete();
      void find();
      void save();
      void update();
  }
  //UserDaoImpl.java 实现类
  package com.imooc.demo1;
  public class UserDaoImpl implements UserDao {
  
      public void delete() {
          System.out.println("删除用户...");
      }
  
      public void find() {
          System.out.println("查询用户...");
      }
  
      public void save() {
          System.out.println("保存用户...");
      }
  
      public void update() {
          System.out.println("更新用户...");
      }
  }
  //MyJdkProxy.java 代理类
  package com.imooc.demo1;
  import java.lang.reflect.InvocationHandler;
  import java.lang.reflect.Method;
  import java.lang.reflect.Proxy;
  public class MyJdkProxy implements InvocationHandler {//JDK动态代理的代理类必须实现InvocationHandler接口
      private Object target;//代理类拥有一个私有属性，用于保存实现类的对象
      public MyJdkProxy(Object target){
          this.target=target;
      }
      public Object CreateProxy(){
          //Proxy.newProxyInstance方法会返回一个代理对象
          //Proxy.newProxyInstance方法有三个参数，第一个参数loader定义了用哪个类加载器加载代理对象，第二个参数interfaces定义了代理对象需要实现哪些接口，第三个参数h定义了当代理对象调用方法时会关联到哪一个InvocationHandler对象上
          //Proxy.newProxyInstance生成的代理对象必须继承Proxy类，实现实现类的接口(因为java单继承，所以动态代理只能代理实现了接口的类)
          return Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), this);//用实现类对象的类加载器和接口及自身来实例化一个代理对象
      }
  	//实现了InvocationHandler接口的类必须重写invoke方法
      //代理对象调用实现类对象的方法时，都会关联到InvocationHandler对象的invoke方法上
      //参数proxy指代理对象，参数method指代理对象所要调用实现类对象的某个方法的Method对象，参数args指调用实现类对象的某个方法时需要传入的参数
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
          if ("save".equals(method.getName())) {//若当前代理对象调用的方法名为save，则打印
              System.out.println("权限校验...");
              //Method对象的invoke方法表示调用该Method对象所代表的方法
              return method.invoke(target, args);//Method对象的invoke方法有两个参数，第一个参数obj表示该方法所属的类实例(实现类对象),第二个参数args表示调用该方法所需要传入的参数，返回值为该方法的返回值
          } else {
              return method.invoke(target,args);
          }
      }
  }
  //测试类
  package com.imooc.demo1;
  import org.junit.jupiter.api.Test;
  import org.springframework.context.support.ClassPathXmlApplicationContext;
  public class SpringDemo1 {
      @Test
      public void demo1(){
          UserDao userDao=new UserDaoImpl();//创建实现类的实例
          UserDao proxy=(UserDao)new MyJdkProxy(userDao).CreateProxy();//创建代理对象
          //代理对象调用实现类的方法，这些方法都得经过代理对象的invoke方法
          proxy.delete();
          proxy.find();
          proxy.update();
          proxy.save(); ;
      }
  }
  ```

- **CGLIB动态代理**：采用了非常底层的字节码技术，其原理是通过字节码技术使得代理类继承目标类，并在代理类中采用方法拦截的技术拦截所有目标类方法的调用，顺势织入横切逻辑，无论目标类是否有实现接口，CGLIB都能为其创建一个动态代理类。

  - 新建一个目标类

  - 创建代理类实现org.springframework.cglib.proxy.MethodInterceptor接口

    ```java
    //UserDao.java 目标类
    package com.imooc.demo2;
    public class UserDao {
    
        public void delete() {
            System.out.println("删除用户...");
        }
    
        public void find() {
            System.out.println("查询用户...");
        }
    
        public void save() {
            System.out.println("保存用户...");
        }
    
        public void update() {
            System.out.println("更新用户...");
        }
    }
    //MyCglibProxy.java 代理类
    package com.imooc.demo2;
    import org.springframework.cglib.proxy.Enhancer;
    import org.springframework.cglib.proxy.MethodInterceptor;
    import org.springframework.cglib.proxy.MethodProxy;
    import java.lang.reflect.Method;
    public class MyCglibProxy implements MethodInterceptor {//CGLIB动态代理的代理类必须实现MethodInterceptor接口
        private Object target;//代理类拥有一个私有属性，用于保存目标类的对象
        public MyCglibProxy(Object target){
            this.target=target;
        }
        public Object CreateProxy(){
            //创建增强类
            Enhancer enhancer=new Enhancer();
            //设置生成的代理类的父类为传入的目标类
            enhancer.setSuperclass(target.getClass());
            //设置方法的拦截回调为当前对象，即方法拦截的时候会调用intercept方法
            enhancer.setCallback(this);
            //创建代理类对象并返回
            return enhancer.create();
    
        }
        @Override
        //intercept方法会对正在调用的目标类的方法进行拦截
        //参数proxy指代理对象，参数method指代理对象所要调用目标类对象的某个方法的Method对象，参数args指调用目标类对象的某个方法时需要传入的参数，参数methodProxy指生成的代理对象对方法代理的引用
        public Object intercept(Object proxy, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
            if("save".equals(method.getName())){//若当前代理对象调用的方法名为save，则打印
                System.out.println("权限校验...");
                //MethodProxy对象的invokeSuper表示调用父类的该方法(即调用目标类的该方法)
                return methodProxy.invokeSuper(proxy,args);//MethodProxy对象的invokeSuper有两个参数，第一个参数obj表示代理对象，第二个参数args表示调用父类的该方法所需的参数，返回值为父类该方法的返回值
            }
            else {
                return methodProxy.invokeSuper(proxy,args);
            }
        }
    }
    //测试类
    package com.imooc.demo2;
    import org.junit.jupiter.api.Test;
    public class SpringDemo2 {
        @Test
        public void demo1(){
            UserDao userDao=new UserDao();//创建目标类对象
            MyCglibProxy myCglibProxy=new MyCglibProxy(userDao);//创建代理类
            UserDao proxy=(UserDao)myCglibProxy.CreateProxy();//创建代理对象
            //代理对象调用目标类对象的方法都会被代理对象的intercept方法所拦截
            proxy.delete();
            proxy.find();
            proxy.update();
            proxy.save(); 
        }
    }
    ```

### 4.3AOP的通知类型

- **前置通知**（org.springframework.aop.MethodBeforeAdvice）：在目标方法执行前实施增强
- **后置通知**（org.springframework.aop.AfterReturningAdvice）：在目标方法执行后实施增强
- **环绕通知**（org.aopalliance.intercept.MethodInterceptor）：在目标方法执行前后都实施增强
- **异常抛出通知**（org.springframework.aop.ThrowsAdvice）：在方法抛出异常后实施增强

### 4.4AOP的切面类型

- **Advisor（一般切面）**：一般切面的**Advice（通知）**本身就是一个切面，即一般切面会对目标类的所有的方法进行拦截
- **PointcutAdvisor（具有切点的切面）**：可以指定拦截目标类的哪些方法

### 4.5切面案例的代码实现

Spring AOP提供了**ProxyFactoryBean**类用于生成代理对象。

**ProxyFactoryBean**的属性：

1. `target`：需要代理的目标类
2. `proxyInterfaces`：代理类需要实现的接口
3. `interceptorNames`：需要应用到目标对象上的通知Bean的名字，可以是拦截器，advisor和其他通知类型的名字
4. `proxyTargetClass`：是否对类代理而不是接口，当设置为true时，使用CGLIB代理，否则为JDK动态代理
5. `singleton`：返回的代理对象是否为单实例，默认为单例模式
6. `optimize`：设置为true时，强制使用CGLIB代理

**一般切面案例**：

```java
//UserDao.java 接口
package com.imooc.demo2;
public class UserDao {

    public void delete() {
        System.out.println("删除用户...");
    }

    public void find() {
        System.out.println("查询用户...");
    }

    public void save() {
        System.out.println("保存用户...");
    }

    public void update() {
        System.out.println("更新用户...");
    }
}
//UserDaoImpl.java 实现类
package com.imooc.demo1;
public class UserDaoImpl implements UserDao {
	public void delete() {
        System.out.println("删除用户...");
    }

    public void find() {
        System.out.println("查询用户...");
    }

    public void save() {
        System.out.println("保存用户...");
    }

    public void update() {
        System.out.println("更新用户...");
    }
}
//MyBeforeAdvice.java 通知类
package com.imooc.demo3;
import org.springframework.aop.MethodBeforeAdvice;
import java.lang.reflect.Method;
//MyBeforeAdvice实现了MethodBeforeAdvice接口，需要重写before方法，为前置通知类型
public class MyBeforeAdvice implements MethodBeforeAdvice {
    //当代理对象执行目标方法前，会调用这个方法
    @Override
    public void before(Method method, Object[] args, Object target) throws Throwable {
            System.out.println("前置通知");
    }
}
//测试类
package com.imooc.demo3;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class SpringDemo3 {
    @Test
    public void demo1(){
        ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("aop.xml");
        //获取的是Bean名称为studentDaoProxy的代理对象，才能将通知应用到目标方法
        StudentDao studentDao=(StudentDao)classPathXmlApplicationContext.getBean("studentDaoProxy");
        //通过代理对象调用目标对象的方法
        studentDao.save();
    }
}
```

```xml
<!--aop.xml xml配置文件-->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="
        http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <!--配置目标类-->
    <bean id="studentDao" class="com.imooc.demo3.StudentDaoImpl"/>
    <!--配置通知类型，此处为前置通知-->
    <bean id="myBeforeAdvice" class="com.imooc.demo3.MyBeforeAdvice"/>
    <!--通过ProxyFactoryBean类来生成代理对象-->
    <bean id="studentDaoProxy" class="org.springframework.aop.framework.ProxyFactoryBean">
        <!--配置需要代理的目标类-->
        <property name="target" ref="studentDao"/>
        <!--配置代理类需要实现的接口-->
        <property name="proxyInterfaces" value="com.imooc.demo3.StudentDao"/>
        <!--配置要应用到目标对象上的通知Bean的名字-->
        <property name="interceptorNames" value="myBeforeAdvice"/>
    </bean>
</beans>
```

**具有切点的切面案例**：

Spring AOP提供了**RegexpMethodPointcutAdvisor**类来实现具有切点的切面。

**RegexpMethodPointcutAdvisor**的属性：

`pattern`：值是单个正则表达式，用于匹配需要增强的单个方法

`advice`：表示正则表达式的匹配规则需要应用到的通知Bean实例

`patterns`：值是多个正则表达式，用于匹配需要增强的多个方法，每个正则表达式用逗号相隔

```java
//UserDao.java 目标类
package com.imooc.demo4;
public class UserDao {
    public void delete() {
        System.out.println("删除用户...");
    }

    public void find() {
        System.out.println("查询用户...");
    }

    public void save() {
        System.out.println("保存用户...");
    }

    public void update() {
        System.out.println("更新用户...");
    }
}
//MyAroundAdvice.java 通知类
package com.imooc.demo4;
import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
//MyAroundAdvice实现了MethodInterceptor接口，需要重写invoke方法，为环绕通知类型
public class MyAroundAdvice implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation methodInvocation) throws Throwable {
        System.out.println("方法实施前");
        //methodInvocation.proceed()方法就是调用拦截到的方法
        Object object=methodInvocation.proceed();
        System.out.println("方法实施后");
        return object;
    }
}
```

```xml
<!--aop.xml xml配置文件-->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="
        http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <!--配置目标类-->
    <bean id="userDao" class="com.imooc.demo4.UserDao"/>
    <!--配置通知类型，此处为环绕通知-->
    <bean id="myAroundAdvice" class="com.imooc.demo4.MyAroundAdvice"/>
	<!--配置切面-->
    <bean id="methodPointcutAdvisor" class="org.springframework.aop.support.RegexpMethodPointcutAdvisor">
        <!--创建拦截方法时所匹配的正则表达式，此处匹配为拦截save方法-->
        <property name="pattern" value=".*save.*"/>
        <!--配置正则表达式规则需要应用到的通知Bean实例-->
        <property name="advice" ref="myAroundAdvice"/>
    </bean>
    <!--创建代理对象-->
    <bean id="userDaoProxy" class="org.springframework.aop.framework.ProxyFactoryBean">
        <property name="target" ref="userDao"/>
        <!--配置使用cglib代理-->
        <property name="proxyTargetClass" value="true"/>
        <!--methodPointcutAdvisor切面封装了通知和切点，所以此时interceptorNames的值应该为methodPointcutAdvisor-->
        <property name="interceptorNames" value="methodPointcutAdvisor"/>
    </bean>
</beans>
```

### 4.6Spring传统AOP自动创建代理

自动创建代理：基于BeanPostProcessor，在Bean创建的过程中完成增强，生成的Bean就是代理

- **BeanNameAutoProxyCreator**：基于Bean名称的自动创建代理

  **BeanNameAutoProxyCreator**的属性：

  `beanNames`：beanNames的属性值用于匹配对应的bean实例，并为其他自动创建代理

  `interceptorNames`：需要应用到目标对象上的通知Bean的名字，可以是拦截器，advisor和其他通知类型的名字

  ```xml
  <!--aop.xml-->
  <?xml version="1.0" encoding="UTF-8"?>
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="
          http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
          http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
      <!--配置目标类-->
      <bean id="userDao" class="com.imooc.demo5.UserDao"/>
      <bean id="stuDao" class="com.imooc.demo5.StuDao"/>
      <!--配置通知类型-->
      <bean id="myAroundAdvice" class="com.imooc.demo5.MyAroundAdvice"/>
      <!--配置自动创建代理-->
      <bean class="org.springframework.aop.framework.autoproxy.BeanNameAutoProxyCreator">
          <!--为所有名称以Dao结尾的Bean创建代理-->
          <property name="beanNames" value="*Dao"/>
          <property name="interceptorNames" value="myAroundAdvice"/>
      </bean>
  </beans>
  ```

- **DefaultAdvisorAutoProxyCreator**： 根据Advisor本身包含信息自动创建代理

  ```xml
  <!--aop.xml-->
  <?xml version="1.0" encoding="UTF-8"?>
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="
          http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
          http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
      <!--配置目标类-->
      <bean id="userDao" class="com.imooc.demo6.UserDao"/>
      <bean id="stuDao" class="com.imooc.demo6.StuDao"/>
      <!--配置通知类型-->
      <bean id="myAroundAdvice" class="com.imooc.demo6.MyAroundAdvice"/>
      <!--配置切面-->
      <bean id="methodPointcutAdvisor" class="org.springframework.aop.support.RegexpMethodPointcutAdvisor">
          <!--对特定包下的类的方法进行拦截,字符.需要\转义-->
          <property name="pattern" value="com\.imooc\.demo6\.UserDao\.save"/>
          <property name="advice" ref="myAroundAdvice"/>
      </bean>
      <!--配置自动创建代理-->
      <!--DefaultAdvisorAutoProxyCreator会根据methodPointcutAdvisor中包含的切面信息自动创建代理-->
      <bean class="org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator"/>
  </beans>
  ```

## 5.Spring基于AspectJ的AOP开发

### 5.1ApectJ简介

![img](https://img2020.cnblogs.com/blog/1855281/202005/1855281-20200505184715777-194865691.png)

### 5.2AspectJ的注解开发aop

1. **通知类型的介绍**：

   - **@Before**：前置通知，相当于**MethodBeforeAdvice**
   - **@AfterReturning**：后置通知，相当于**AfterReturningAdvice**
   - **@Around**：环绕通知，相当于**MethodInterceptor**
   - **@AfterThrowing**：异常抛出通知，相当于**ThrowsAdvice**
   - **@After**：最终final通知，不管是否异常，该通知都会执行

2. **在通知中通过value属性定义切点**

   通过**execution**函数，可以定义切点的方法切入

   语法：**`@通知类型(value="execution(<访问修饰符>?<返回类型><方法名>(<参数名>)<异常>)")`**

   例子：

   匹配所有类的public方法：`execution(public * *(..))`

   匹配指定包下所有类方法：`execution(* com.imooc.Dao.*(..))`（不包含子包），`execution(* com.imooc.Dao..*(..))`（..*表示包、子孙包下所有类）

   匹配指定类所有方法：`execution(* com.imooc.UserService.*(..))`

   匹配实现特定接口所有类方法：`execution(* com.imooc.UserDao+.*(..))`

   匹配所有save开头的方法：`execution(* save*(..))`

3. **入门案例**

   - 定义目标类

   - 定义切面类

   - 注册到配置文件中生成实例

     ```java
     //UserDao.java 目标类
     package com.imooc.aspect.demo1;
     
     public class UserDao {
         public void delete() {
             System.out.println("删除用户...");
         }
     
         public void find() {
             System.out.println("查询用户...");
         }
     
         public void save() {
             System.out.println("保存用户...");
         }
     
         public void update() {
             System.out.println("更新用户...");
         }
     }
     //MyAspect.java 切面类
     package com.imooc.aspect.demo1;
     import org.aspectj.lang.annotation.Aspect;
     import org.aspectj.lang.annotation.Before;
     
     @Aspect//@Aspect会把当前类标识为一个切面供容器读取
     public class MyAspect {
         //@Before标识当前方法为前置通知，value属性用于定义切点，此处为拦截UserDao类中的所有方法
         @Before(value = "execution(* com.imooc.aspect.demo1.UserDao.*(..))")
         public void before(){
             System.out.println("前置通知...");
         }
     }
     ```

     ```xml
     <!--aspectj.xml-->
     <?xml version="1.0" encoding="UTF-8"?>
     <beans xmlns="http://www.springframework.org/schema/beans"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:aop="http://www.springframework.org/schema/aop" xsi:schemaLocation="
             http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
             http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd"> <!-- bean definitions here -->
         <!--开启AspectJ的注解开发，自动代理-->
         <!--要使用AspectJ的注解必须在配置文件中加上这句-->
         <aop:aspectj-autoproxy/>
         <!--配置目标类实例-->
         <bean id="userDao" class="com.imooc.aspect.demo1.UserDao"/>
          <!--配置切面类实例-->
         <bean class="com.imooc.aspect.demo1.MyAspect"/>
     </beans>
     ```

4. **通知的补充**

   - **@Before**：可以在标识为前置通知的方法中传入JoinPoint对象，用来获得切点信息

     ```java
     package com.imooc.aspect.demo1;
     import org.aspectj.lang.JoinPoint;
     import org.aspectj.lang.annotation.Aspect;
     import org.aspectj.lang.annotation.Before;
     
     @Aspect
     public class MyAspect {
         @Before(value = "execution(* com.imooc.aspect.demo1.UserDao.save*(..))")
         public void Before(JoinPoint joinPoint){
             System.out.println("前置通知"+joinPoint);//joinpoint输出结果为execution(void com.imooc.aspect.demo1.UserDao.save())
         }
     }
     ```

   - **@AfterReturning**：通过**@AfterReturning**的returning属性可以获得目标方法的返回值，returning属性值为被标识为后置通知的方法对应的参数名

     ```java
     package com.imooc.aspect.demo1;
     import org.aspectj.lang.annotation.AfterReturning;
     import org.aspectj.lang.annotation.Aspect;
     
     @Aspect
     public class MyAspect {
         @AfterReturning(value = "execution(* com.imooc.aspect.demo1.UserDao.delete*(..))",returning = "result")//returning的值对应AfterReturning方法的参数名result
         public void AfterReturning(Object result){
             System.out.println("后置通知"+result);
         }
     }
     ```

   - **@Around**：**@Around**标识为环绕通知的方法的返回值即为目标方法的返回值，参数ProceedingJoinPoint对象用于拦截目标方法的执行

     ```java
     package com.imooc.aspect.demo1;
     import org.aspectj.lang.ProceedingJoinPoint;
     import org.aspectj.lang.annotation.Around;
     import org.aspectj.lang.annotation.Aspect;
     
     @Aspect
     public class MyAspect {
         //@Around标识的方法返回值必须为Object类型，用于返回目标方法的返回值，且必须拥有一个ProceedingJoinPoint类型的参数
         @Around(value = "execution(* com.imooc.aspect.demo1.UserDao.find*(..))")
         public Object Around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
             System.out.println("目标方法执行前...");
             //ProceedingJoinPoint对象的proceed方法用于调用目标方法，即执行目标方法并返回目标方法的返回值
             Object object=proceedingJoinPoint.proceed();
             System.out.println("目标方法执行后...");
             return object;
         }
     }
     ```

   - **@AfterThrowing**：可以设置throwing属性，throwing属性的值为被标识为异常抛出通知的方法对应的参数名

     ```java
     package com.imooc.aspect.demo1;
     import org.aspectj.lang.annotation.AfterThrowing;
     import org.aspectj.lang.annotation.Aspect;
     
     @Aspect
     public class MyAspect {
         @AfterThrowing(value = "execution(* com.imooc.aspect.demo1.UserDao.update*(..))",throwing = "e")
        	//throwing的值对应AfterThrowing的参数名e
         public void AfterThrowing(Throwable e) {
             System.out.println("异常抛出通知"+e.getMessage());//Throwable对象用于获取异常对象的信息
         }
     }
     ```

   - **@After**：无论是否出现异常，最终通知总是会被执行

     ```java
     package com.imooc.aspect.demo1;
     import org.aspectj.lang.annotation.After;
     import org.aspectj.lang.annotation.Aspect;
     
     @Aspect
     public class MyAspect {
         //即使update方法抛出异常，最终通知也会执行
         @After(value = "execution(* com.imooc.aspect.demo1.UserDao.update*(..))")
         public void After() {
             System.out.println("最终通知...");
         }
     }
     ```

5. **通过@Pointcut为切点命名**
   在每个通知内定义切点，会造成工作量大，不易维护，对于重复的切点可以用**@Pointcut**进行定义

   使用**@Pointcut**定义的切点方法格式：`private void 方法名(){}`（方法名即为切点名）

   当通知需要应用到多个切点时，可以使用`||`连接

   ```java
   package com.imooc.aspect.demo1;
   import org.aspectj.lang.annotation.Aspect;
   import org.aspectj.lang.annotation.Before;
   import org.aspectj.lang.annotation.Pointcut;
   
   @Aspect
   public class MyAspect {
       @Before(value ="myPointcut()||myPointcut2()")//将前置通知应用到切点1和切点2
       public void Before() {
           System.out.println("前置通知...");
       }
       //因为切点只能是方法，所以使用 @Pointcut定义的切点必须为私有的返回值为空的无参方法，这些方法仅仅是为了给切点命名，无需编写任何逻辑
       @Pointcut(value = "execution(* com.imooc.aspect.demo1.UserDao.update*(..))")
       private void myPointcut(){}
       @Pointcut(value = "execution(* com.imooc.aspect.demo1.UserDao.save*(..))")
       private void myPointcut2(){}
   
   }
   ```

### 5.3AspectJ的xml方式开发aop

```java
//UserDao.java 目标类
package com.imooc.aspect.demo2;
public class UserDao {
    public void delete() {
        System.out.println("删除用户...");
    }

    public void find() {
        System.out.println("查询用户...");
    }

    public void save() {
        System.out.println("保存用户...");
    }

    public void update() {
        System.out.println("更新用户...");
    }
    public void add(){
        System.out.println("添加用户...");
    }
}
//MyAspectXml.java 切面类
package com.imooc.aspect.demo2;
import org.aspectj.lang.ProceedingJoinPoint;
//切面类用于配置通知
public class MyAspectXml {
    public void Before(){
        System.out.println("前置通知...");
    }
    public Object Around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        System.out.println("环绕通知前...");
        Object object=proceedingJoinPoint.proceed();
        System.out.println("环绕通知后...");
        return object;
    }
    public void AfterReturning(Object result){
        System.out.println("后置通知..."+result);
    }
    public void AfterThrowing(Throwable e){
        System.out.println("异常抛出通知..."+e.getMessage());
    }
    public void After(){
        System.out.println("最终通知...");
    }
}
```

```xml
<!--aspectj.xml-->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:aop="http://www.springframework.org/schema/aop" xsi:schemaLocation="
        http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd">
    <!--配置目标类-->
    <bean id="userDao" class="com.imooc.aspect.demo2.UserDao"/>
    <!--配置切面类-->
    <bean id="myAspectXml" class="com.imooc.aspect.demo2.MyAspectXml"/>
    <!--配置aop相关信息-->
    <aop:config>
        <!--配置切点信息-->
        <aop:pointcut id="myPointcut" expression="execution(* com.imooc.aspect.demo2.UserDao.save*(..))"/>
        <aop:pointcut id="myPointcut2" expression="execution(* com.imooc.aspect.demo2.UserDao.find*(..))"/>
        <aop:pointcut id="myPointcut3" expression="execution(* com.imooc.aspect.demo2.UserDao.update*(..))"/>
        <aop:pointcut id="myPointcut4" expression="execution(* com.imooc.aspect.demo2.UserDao.delete*(..))"/>
        <aop:pointcut id="myPointcut5" expression="execution(* com.imooc.aspect.demo2.UserDao.add*(..))"/>
        <!--配置切面信息-->
        <!--<aop:aspect>标签可以用于配置多个切面-->
        <!--<aop:advisor>标签只能用于配置单个切面-->
        <aop:aspect ref="myAspectXml"><!--生成切面类实例-->
            <!--配置通知类型所匹配切面类中对应的方法，配置切点对象-->
            <aop:before method="Before" pointcut-ref="myPointcut"/>
            <aop:around method="Around" pointcut-ref="myPointcut2"/>
            <aop:after-returning method="AfterReturning" pointcut-ref="myPointcut3" returning="result"/>
            <aop:after-throwing method="AfterThrowing" pointcut-ref="myPointcut4" throwing="e"/>
            <aop:after method="After" pointcut-ref="myPointcut5"/>
        </aop:aspect>
    </aop:config>
</beans>
```

## 6.JDBC Template

### 6.1JDBC Template的概念

为了使 JDBC 更加易于使用，Spring 在 JDBCAPI 上定义了一个抽象层，以此建立一个JDBC存取框架。作为 SpringJDBC 框架的核心， JDBC 模板的设计目的是为不同类型的JDBC操作提供模板方法。每个模板方法都能控制整个过程，并允许覆盖过程中的特定任务。通过这种方式，可以在尽可能保留灵活性的情况下,将数据库存取的工作量降到最低。

![img](https://img2020.cnblogs.com/blog/1855281/202005/1855281-20200506200205930-421567717.png)

### 6.2JDBC Template的基本使用

1. 环境搭建

   在maven的pom.xml文件中除了添加spring的相关依赖，还需要添加mysql和spring jdbc的相关依赖

   ```xml
   <depencies>
     <dependency>
         <!-- 连接到mysql -->
         <groupId>mysql</groupId>
         <artifactId>mysql-connector-java</artifactId>
         <version>8.0.21</version>
     </dependency>
     <dependency>
         <groupId>org.springframework</groupId>
         <artifactId>spring-jdbc</artifactId>
         <version>4.2.4.RELEASE</version>
       </dependency>
       <dependency>
         <groupId>org.springframework</groupId>
         <artifactId>spring-tx</artifactId>
         <version>4.2.4.RELEASE</version>
       </dependency>
   </depencies>  
   ```

   配置spring的配置文件

   ```xml
   <!--jdbc.xml-->
   <?xml version="1.0" encoding="UTF-8" ?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:context="http://www.springframework.org/schema/context"
          xmlns:aop="http://www.springframework.org/schema/aop"
          xmlns:tx="http://www.springframework.org/schema/tx"
          xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd
       http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context.xsd
       http://www.springframework.org/schema/aop
       http://www.springframework.org/schema/aop/spring-aop.xsd
       http://www.springframework.org/schema/tx
       http://www.springframework.org/schema/tx/spring-tx.xsd">
       <!--配置数据源-->
       <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
           <!--配置连接mysql时的用户名和密码-->
           <property name="username" value="root"/>
           <property name="password" value="apotato666"/>
           <!--配置连接到指定数据库的url，此处为selection_course数据库-->
           <property name="url" value="jdbc:mysql://localhost:3306/selection_course?useUnicode=true&amp;characterEncoding=utf-8"/>
           <!--配置jdbc驱动类-->
           <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
       </bean>
       <!--配置spring的JDBC Template-->
       <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
           <!--设置数据源对象-->
           <property name="dataSource" ref="dataSource"/>
       </bean>
   </beans>
   ```

2. 常用方法

   - **execute方法**：可以执行任何sql语句，但通常用于执行DDL操作

     ```java
     import org.junit.jupiter.api.Test;
     import org.springframework.context.support.ClassPathXmlApplicationContext;
     import org.springframework.jdbc.core.JdbcTemplate;
     public class demo {
         @Test
         public void demo1(){
             ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
             //获得JdbcTemplate实例
             JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
             //使用execute方法执行sql语句，即在selection_course数据库中创建一个user表
             jdbcTemplate.execute("CREATE TABLE USER(id int,name varchar (20))");
         }
     }
     ```

   - **update方法**：对数据进行增删改

     - `int update(String sql)`：参数sql接收sql语句（不带占位符的）
     - `int update(String sql,Object[] args)`：参数sql接收sql语句，参数args接收一个Object类型的数组，用于填充sql语句中的占位符，返回值为整型，表示update方法执行后影响的行数
     - `int update(String sql,Object...args)`：同上，只是参数args变成了可变长参数

     ```java
     import org.junit.jupiter.api.Test;
     import org.springframework.context.support.ClassPathXmlApplicationContext;
     import org.springframework.jdbc.core.JdbcTemplate;
     
     public class demo {
         @Test
         public void demo2(){
             ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
             JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
             //sql语句，此处为向student表插入记录，?为占位符，第一个?指代name的值，第二个?指代sex的值
             String sql="INSERT INTO student(name,sex) values(?,?)";
             //Object数组{"张三","男"}会填充占位符所代表的值
             jdbcTemplate.update(sql,new Object[]{"张三","男"});
         }
         @Test
         public void demo3(){
             ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
             JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
             //sql语句，此处为修改id为xx的数据的sex属性
             String sql="UPDATE student SET sex=? WHERE id=?";
             //可变长参数"男",1会填充占位符所代表的值
             jdbcTemplate.update(sql,"男",1);
         }
     }
     ```

   - **batchUpdate方法**：对批量数据进行增删改

     - `int batchUpdate(String[] sql)`：参数sql接收一个字符串数组，包含多条sql语句，可以是插入删除更新（该方法多用于执行多个不同的sql语句）
     - `int batchUpdate(String sql,List<Object[]>args)`：参数sql接收一个sql语句，参数args接受一个列表容器，列表中的每个元素都是一个Object类型数组，数组中的每个元素都用于填充相应的占位符（该方法用于执行单个sql语句多次）

     ```java
     import org.junit.jupiter.api.Test;
     import org.springframework.context.support.ClassPathXmlApplicationContext;
     import org.springframework.jdbc.core.JdbcTemplate;
     import java.util.ArrayList;
     import java.util.List;
     
     public class demo {
         @Test
         public void demo4(){
             ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
             JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
             String[] sqls={
                     "INSERT INTO student(name,sex) values('李四','男')",
                     "INSERT INTO student(name,sex) values('王五','女')",
                     "UPDATE student SET sex='女' WHERE id=1"
             };
             //执行多条不同的sql语句，比如插入和更新
             jdbcTemplate.batchUpdate(sqls);
         }
         @Test
         public void demo5(){
             ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
             JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
             String sql="INSERT INTO student(name,sex) values(?,?)";
             List<Object[]> list=new ArrayList<>();
             list.add(new Object[]{"老刘","男"});
             list.add(new Object[]{"翠花","女"});
             list.add(new Object[]{"老李","男"});
             //执行单条sql语句多次，执行插入的sql语句，向数据库中插入三条数据
             jdbcTemplate.batchUpdate(sql,list);
         }
     }
     ```

   - **query与queryXXX 方法**：对数据进行查询

     - 查询简单对象：

       获取单条数据：

       - `T queryForObject(String sql,Class<T> type)`：参数sql接收一条sql语句（无占位符），参数type用于将查询到的数据转换为指定的java类型，返回值为type对应的类型

       - `T queryForObject(String sql,Object[] args,Class<T> type)`参数sql接收一条sql语句，参数args接收一个Object类型的数组，用于填充sql语句中的占位符，参数type用于将查询到的数据转换为指定的java类型

       - `T queryForObject(String sql,Class<T> type,Object...args)`：同上，只是参数args变成了可变长参数

         ```java
         import org.junit.jupiter.api.Test;
         import org.springframework.context.support.ClassPathXmlApplicationContext;
         import org.springframework.jdbc.core.JdbcTemplate;
         
         public class demo {
         	@Test
             public void demo6(){
                 ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
                 JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
                 //查询student表的数据条目
                 String sql="SELECT count(*) FROM student";
                 //查询到的数据被转化为int类型
                 int count=jdbcTemplate.queryForObject(sql,Integer.class);
                 System.out.println(count);
             }
         }
         ```

       获取多条数据：

       - `List<T> queryForList(String sql,Class<T> type)`：参数sql接收一条sql语句（无占位符），参数type用于将查询到的多条数据转换为指定的java类型并存到列表容器，返回值为type对应的类型的列表容器

       - `List<T> queryForList(String sql,Object[] args,Class<T> type)`：参数sql接收一条sql语句，参数args接收一个Object类型的数组，用于填充sql语句中的占位符，参数type用于将查询到的数据转换为指定的java类型并存到列表容器

       - `List<T> queryForList(String sql,Class<T> type,Object...args)`：同上，只是参数args变成了可变长参数

         ```java
         import org.junit.jupiter.api.Test;
         import org.springframework.context.support.ClassPathXmlApplicationContext;
         import org.springframework.jdbc.core.JdbcTemplate;
         import java.util.List;
         
         public class demo {
             @Test
             public void demo7(){
                 ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
                 JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
                 //查询student表中所有性别为男的人的名字
                 String sql="SELECT name FROM student WHERE sex=?";
                 //查询到的多条数据被转化为String类型并存入列表
                 List<String> list=jdbcTemplate.queryForList(sql,String.class,"男");
                 System.out.println(list);
             }
         }
         ```

     - 查询复杂对象（封装为Map对象)：

       获取单条数据：

       - `Map queryForMap(String sql)`：参数sql接收一条sql语句（无占位符），返回值为一个Map对象，Map的key对应查询的字段名，value对应字段名的值

       - `Map queryForMap(String sql,Object[] args)`：参数sql接收一条sql语句，参数args接收一个Object类型的数组，用于填充sql语句中的占位符

       - `Map queryForMap(String sql,Object...args)`：同上，只是参数args变成了可变长参数

         ```java
         import org.junit.jupiter.api.Test;
         import org.springframework.context.support.ClassPathXmlApplicationContext;
         import org.springframework.jdbc.core.JdbcTemplate;
         import java.util.List;
         import java.util.Map;
         
         public class demo { 
           	@Test
             public void demo8(){
                 ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
                 JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
                 //查询student表中id为1的一行数据
                 String sql="SELECT * FROM student where id=1";
                 //返回{id=1, name=张三, sex=女, born=null}，即Map对象的key对应一行数据的各个字段名，value对应字段名的值
                 Map<String,Object> map=jdbcTemplate.queryForMap(sql);
                 System.out.println(map);
             }
         }
         ```

       获取多条数据：

       - `List<Map<String,Object>> queryForList(String sql)`：参数sql接收一条sql语句（无占位符），返回值为一个每个元素都是Map对象的List列表容器，Map的key对应查询的字段名，value对应字段名的值

       - `List<Map<String,Object>> queryForList(String sql,Object[] args)`：参数sql接收一条sql语句，参数args接收一个Object类型的数组，用于填充sql语句中的占位符

       - `List<Map<String,Object>> queryForList(String sql,Object...args)`：同上，只是参数args变成了可变长参数

         ```java
         import org.junit.jupiter.api.Test;
         import org.springframework.context.support.ClassPathXmlApplicationContext;
         import org.springframework.jdbc.core.JdbcTemplate;
         import java.util.List;
         import java.util.Map;
         
         public class demo {
         	@Test
             public void demo9(){
                 ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
                 JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
                 //查询student表中的所有数据
                 String sql="SELECT * FROM student";
                 //返回的列表中的每个Map对象的key都对应每一行数据的字段名，value对应字段名的值
                 List<Map<String,Object>> list=jdbcTemplate.queryForList(sql);
                 System.out.println(list);
             }
         }
         ```

     - 查询复杂对象（封装为实体对象）：

       获取单条数据：

       - `T queryForObject(String sql,RowMapper<T> mapper)`：参数sql接收一条sql语句（无占位符）,参数mapper是一个实现RowMapper接口的类的对象，用于将获得的数据转化为对应的实体对象，返回值为对应的实体类型的对象。

       - `T queryForObject(String sql,Object[] args,RowMapper<T> mapper)`：参数sql接收一条sql语句，参数args接收一个Object类型的数组，用于填充sql语句中的占位符，参数mapper是一个实现RowMapper接口的类的对象，用于将获得的数据转化为对应的实体对象，返回值为对应的实体类型的对象。

       - `T queryForObject(String sql,RowMapper<T> mapper,Object...args)`：同上，只是参数args变成了可变长参数

         ```java
         import org.junit.jupiter.api.Test;
         import org.springframework.context.support.ClassPathXmlApplicationContext;
         import org.springframework.jdbc.core.JdbcTemplate;
         import org.springframework.jdbc.core.RowMapper;
         import java.sql.ResultSet;
         import java.sql.SQLException;
         import java.util.Map;
         
         public class demo {
         	@Test
             public void demo10(){
                 ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
                 JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
                 //查询id为1的一行数据
                 final String sql="SELECT * FROM student WHERE id=1";
                 //转化为实体类Student的对象
                 final Student student=jdbcTemplate.queryForObject(sql, new RowMapper<Student>() {
                     //必须实现RowMapper接口的方法mapRow，该方法用于实现数据到实体对象的转换
                     //参数resultSet是结果集，查询得到的数据都存放在结果集里
                     //参数i为当前操作的行数
                     @Override
                     public Student mapRow(ResultSet resultSet, int i) throws SQLException {
                         Student student1=new Student();
                         student1.setId(resultSet.getInt("id"));//获取数据的id属性值
                         student1.setName(resultSet.getString("name"));//获取数据的name属性值
                         student1.setSex(resultSet.getString("sex"));//获取数据的sex属性值
                         student1.setBorn(resultSet.getDate("born"));//获取数据的born属性值
                         return student1;
                     }
                 });
                 System.out.println(student);
             }
         }
         ```

       获取多条数据：

       - `List<T> query(String sql,RowMapper<T> mapper)`：参数sql接收一条sql语句（无占位符）,参数mapper是一个实现RowMapper接口的类的对象，用于将获得的多条数据转化为对应的实体对象并存入List列表容器中，返回值为对应实体类的List列表容器

       - `List<T> query(String sql,Object[] args,RowMapper<T> mapper)`：参数sql接收一条sql语句，参数args接收一个Object类型的数组，用于填充sql语句中的占位符，参数mapper是一个实现RowMapper接口的类的对象，用于将获得的多条数据转化为对应的实体对象并存入List列表容器中

       - `List<T> query(String sql,RowMapper<T> mapper,Object...args)`：同上，只是参数args变成了可变长参数

         ```java
         import org.junit.jupiter.api.Test;
         import org.springframework.context.support.ClassPathXmlApplicationContext;
         import org.springframework.jdbc.core.JdbcTemplate;
         import org.springframework.jdbc.core.RowMapper;
         import java.sql.ResultSet;
         import java.sql.SQLException;
         import java.util.List;
         
         public class demo {
         	@Test
             public void demo10(){
                 ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
                 JdbcTemplate jdbcTemplate=(JdbcTemplate)classPathXmlApplicationContext.getBean("jdbcTemplate");
                 //查询student表中所有学生的数据
                 String sql="SELECT * FROM student";
                 //将转换后的实体对象存入List列表容器
                 List<Student> list=jdbcTemplate.query(sql, new RowMapper<Student>() {
                     @Override
                     public Student mapRow(ResultSet resultSet, int i) throws SQLException {
                         Student student1=new Student();
                         student1.setId(resultSet.getInt("id"));
                         student1.setName(resultSet.getString("name"));
                         student1.setSex(resultSet.getString("sex"));
                         student1.setBorn(resultSet.getDate("born"));
                         return student1;
                     }
                 });
                 System.out.println(list);
             }
         }
         ```

3. 实战例子

   ```java
   //CourseDao.java Dao接口
   package com.imooc.sc.dao;
   import com.imooc.sc.entity.Course;
   import java.util.List;
   public interface CourseDao {
       void insert(Course course);
       void delete(int id);
       void update(Course course);
       Course findOne(int id);
       List<Course> findAll();
   }
   //CourseDaoImpl.java
   package com.imooc.sc.dao.impl;
   import com.imooc.sc.dao.CourseDao;
   import com.imooc.sc.entity.Course;
   import com.imooc.sc.entity.Student;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.jdbc.core.JdbcTemplate;
   import org.springframework.jdbc.core.RowMapper;
   import org.springframework.stereotype.Repository;
   import java.sql.ResultSet;
   import java.sql.SQLException;
   import java.util.List;
   @Repository("courseDao")//标识为Dao
   public class CourseDaoImpl implements CourseDao {
       @Autowired//自动注入JdbcTemplate实例
       private JdbcTemplate jdbcTemplate;
       //实现接口方法，增删改查
       @Override
       public void insert(Course course) {
           String sql = "INSERT INTO course(name,score) VALUES(?,?)";
           jdbcTemplate.update(sql,course.getName(),course.getScore());
       }
   
       @Override
       public void delete(int id) {
           String sql = "DELETE FROM course WHERE id=?";
           jdbcTemplate.update(sql,id);
       }
   
       @Override
       public void update(Course course) {
           String sql = "UPDATE course SET name=?,score=? WHERE id=?";
           jdbcTemplate.update(sql,course.getName(),course.getScore(),course.getId());
       }
   
       @Override
       public Course findOne(int id) {
           String sql = "SELECT * FROM course WHERE id=?";
           Course course=jdbcTemplate.queryForObject(sql, new CourseRowMapper(),id);
           return course;
       }
   
       @Override
       public List<Course> findAll() {
           String sql = "SELECT * FROM course";
           List<Course> courseList=jdbcTemplate.query(sql, new CourseRowMapper());
           return courseList;
       }
       private static class CourseRowMapper implements RowMapper<Course> {
           @Override
           public Course mapRow(ResultSet resultSet, int i) throws SQLException {
               Course course=new Course();
               course.setId(resultSet.getInt("id"));
               course.setName(resultSet.getString("name"));
               course.setScore(resultSet.getInt("score"));
               return course;
           }
       }
   }
   //Course.java 实体类
   package com.imooc.sc.entity;
   
   import org.springframework.beans.factory.annotation.Value;
   import org.springframework.stereotype.Component;
   
   //实体类用于和数据库中的数据实现映射关系
   @Component("course")//标识为组件
   public class Course {
       private int id;
       private String name;
       private int score;
   
       public int getId() {
           return id;
       }
       @Value(value = "1004")
       public void setId(int id) {
           this.id = id;
       }
   
       @Override
       public String toString() {
           return "Course{" +
                   "id=" + id +
                   ", name='" + name + '\'' +
                   ", score=" + score +
                   '}';
       }
   
       public String getName() {
           return name;
       }
       @Value(value = "化学")
       public void setName(String name) {
           this.name = name;
       }
   
       public int getScore() {
           return score;
       }
       @Value(value = "100")
       public void setScore(int score) {
           this.score = score;
       }
   }
   
   //Main.java 测试类
   package com.imooc.sc;
   import com.imooc.sc.dao.CourseDao;
   import com.imooc.sc.entity.Course;
   import org.junit.jupiter.api.Test;
   import org.springframework.context.support.ClassPathXmlApplicationContext;
   import java.util.ArrayList;
   import java.util.List;
   
   public class Main {
       @Test
       public void demo() {
           ClassPathXmlApplicationContext classPathXmlApplicationContext=new ClassPathXmlApplicationContext("jdbc.xml");
           CourseDao courseDao=(CourseDao)classPathXmlApplicationContext.getBean("courseDao");
           Course course=(Course)classPathXmlApplicationContext.getBean("course");
              courseDao.insert(course);
           Course course1=courseDao.findOne(1004);
           System.out.println(course1);
           List<Course> courseList=new ArrayList<>();
           courseList=courseDao.findAll();
           System.out.println(courseList);
           courseDao.update(course);
           courseDao.delete(1004);
       }
   }
   ```

## 7.Spring事务

### 7.1声明式事务

- 声明式事务的配置
  - Spring中提供了事务管理器（事务切面），需要在xml配置文件中配置这个事务管理器
  - 开启基于注解的声明式事务，依赖tx名称空间
  - 给事务方法添加注解

  `applicationContext.xml`

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:aop="http://www.springframework.org/schema/aop"
         xmlns:tx="http://www.springframework.org/schema/tx"
         xmlns:context="http://www.springframework.org/schema/context"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/aop
      http://www.springframework.org/schema/aop/spring-aop-4.2.xsd
      http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-4.2.xsd
      http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.2.xsd">
      <!--开启包扫描-->
      <context:component-scan base-package="dao,service"/>
      <!--引入外部配置文件-->
      <context:property-placeholder location="classpath:db.properties"/>
      <!--配置数据源-->
      <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
          <property name="driverClass" value="${jdbc.driver}"/>
          <property name="jdbcUrl" value="${jdbc.url}"/>
          <property name="user" value="${jdbc.username}"/>
          <property name="password" value="${jdbc.password}"/>
      </bean>
      <!--配置jdbcTemplate-->
      <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
          <property name="dataSource" ref="dataSource"/>
      </bean>
      <!--配置事务管理器-->
      <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
          <property name="dataSource" ref="dataSource"/>
      </bean>
      <!--开启声明式事务-->
      <tx:annotation-driven/>
  </beans>
  ```

  `EmployeeDao.class`

  ```java
  package dao;
  
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.jdbc.core.JdbcTemplate;
  import org.springframework.stereotype.Repository;
  
  @Repository
  public class EmployeeDao {
      @Autowired
      JdbcTemplate jdbcTemplate;
  
      public void upateGender(Integer id,String gender){
          jdbcTemplate.update("update employee set gender=? where id=?",new Object[]{gender,id});
      }
      public void updateName(Integer id,String name){
          jdbcTemplate.update("update employee set last_name=? where id=?",new Object[]{name,id});
      }
  }
  ```

  `EmployeeService.class`

  ```java
  package service;
  
  import dao.EmployeeDao;
  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.stereotype.Service;
  import org.springframework.transaction.annotation.Transactional;
  
  @Service
  public class EmployeeService {
      @Autowired
      EmployeeDao employeeDao;
      //添加@Transactional注解
      //该方法同时对name和gender进行修改，只要其中一个出错，则这两个方法都无法修改成功
      @Transactional
      public void updateNameAndGender(Integer id,String name,String gender){
          employeeDao.upateGender(id,gender);
          employeeDao.updateName(id,name);
      }
  }
  ```

- `@Transactional`注解

  `@Transactional`注解具有诸多属性：

  - `isolation`：`Isolation`类型，设置事务的隔离级别

    - 事务并发问题

      - 脏读
        1. 事务1修改了某条记录
        2. 事务2读取了事务1更新后的记录值
        3. 事务1回滚
        4. 此时事务2读取到的就是一个脏数据
      - 不可重复读
        1. 事务1读取了某条记录值
        2. 事务2修改了该记录
        3. 事务1再次读取该记录值，此时和第一次读取时值不一致
      - 幻读
        1. 事务1读取了表中的一部分数据
        2. 事务2向表中插入新的行
        3. 事务1再读取表时，会发现多出了一些行

    - 事务的隔离级别

      - 读未提交

        `Isolation.READ_UNCOMMITTED`，允许事务1读取事务2未提交的修改，无法避免脏读、不可重复读和幻读

      - 读已提交

        `Isolation.READ_COMMITTED`，要求事务1只能读取事务2已提交的修改，无法避免不可重复读和幻读

      - 可重复读（MySQL的默认隔离级别）

        `Isolation.REPEATABLE_READ`，要求事务1在读取一个字段的期间，禁止其他事务对该字段进行修改，无法避免幻读

      - 串行化

        `Isolation.SERIALIZABLE`，要求事务串行执行，效率非常低

  - `propagation`：`Propagation`类型，设置事务的传播行为

    - 什么是事务的传播行为

      即如果有多个事务嵌套运行，子事务是否要和父事务共用一个事务

    - 事务的传播行为

      - `PROPAGATION_REQUIRED`

        如果有事务在运行，当前的方法就在这个事务内运行，否则，就启动一个新的事务，并在自己的事务内运行

      - `PROPAGATION_REQUIRES_NEW`

        当前的方法必须启动新事务，并在它自己的事务内运行，如果有事务正在运行，则将该事务挂起直至新事务结束

      - `PROPAGATION_SUPPORTS`

        如果有事务在运行，当前的方法就在这个事务内运行，否则该方法非事务的运行

      - `PROPAGATION_NOT_SUPPORTED`

        当前方法不应该运行在事务中，如果有运行的事务，将它挂起

      - `PROPAGATION_MANDATORY`

        如果有事务在运行，当前方法就在这个事务内运行，如果没有正在运行的事务，则抛出异常

      - `PROPAGATION_NEVER`

        当前方法不能运行在事务内，如果有运行的事务，则抛出异常

      - `PROPAGATION_NESTED`

        如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则执行与`PROPAGATION_REQUIRED`类似的操作

    - 事务传播行为失效

      **在同一个类中，事务方法之间的嵌套调用，普通方法和事务方法之间的嵌套调用，都不会开启新的事务**

      原因：Spring采用的动态代理机制来实现声明式事务，当检测到某个类中有`@Transactional`注解，Spring会使用CGLib字节码生成技术来为该类创建一个代理类：

      - 事务方法之间的嵌套调用（方法A调用方法B）

        方法A在调用时，被代理对象拦截，执行开启事务的操作，然后代理对象会调用原对象的方法A，而此时原对象的方法A内部就会调用原对象的方法B，所以不会走代理逻辑

      - 普通方法和事务方法之间的嵌套调用（普通方法A调用事务方法B）

        由于普通方法A无注解，所以代理对象直接调用原对象的方法A，而此时原对象的方法A内部就会调用原对象的方法B，所以不会走代理逻辑

  - `timeout`：`int`类型，设置事务的超时时间，事务超出指定时间则自动终止并回滚

  - `readOnly`：`boolean`类型，设置事务的只读属性

    - 当事务中只包含查询操作时，可以将该属性设置为`true`来加快查询速度

  - `rollbackFor`：`Class[]`类型，对于哪些异常，事务需要回滚

    - 事务默认发生编译时异常不回滚，可以通过设置该属性来对编译时异常回滚

  - `rollbackForClassName`：`String[]`类型，同上，但是值为异常类的全限定名

  - `noRollbackFor`：`Class[]类型`，对于哪些异常，事务不需要回滚

    - 事务默认发生运行时异常回滚，可以通过设置该属性来对运行时异常不回滚

  - `noRollbackForClassName`：`String[]`类型，同上，但是值为异常类的全限定名

### 7.2基于xml配置的事务

- 基于xml事务的配置

  - 配置事务管理器
  - 配置事务通知
  - 配置aop中的切面，编写切入点表达式，将切点和事务通知结合来控制事务

  `application.xml`

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <beans xmlns="http://www.springframework.org/schema/beans"
         xmlns:aop="http://www.springframework.org/schema/aop"
         xmlns:tx="http://www.springframework.org/schema/tx"
         xmlns:context="http://www.springframework.org/schema/context"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/aop
      http://www.springframework.org/schema/aop/spring-aop-4.2.xsd
      http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-4.2.xsd
      http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.2.xsd">
      <context:component-scan base-package="dao,service"/>
  
      <!--引入外部配置文件-->
      <context:property-placeholder location="classpath:db.properties"/>
      <!--配置数据源-->
      <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
          <property name="driverClass" value="${jdbc.driver}"/>
          <property name="jdbcUrl" value="${jdbc.url}"/>
          <property name="user" value="${jdbc.username}"/>
          <property name="password" value="${jdbc.password}"/>
      </bean>
      <!--配置jdbcTemplate-->
      <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
          <property name="dataSource" ref="dataSource"/>
      </bean>
      <!--配置事务管理器-->
      <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
          <property name="dataSource" ref="dataSource"/>
      </bean>
      <!--配置aop中的切面-->
      <aop:config>
          <!--切点，需要拦截的方法-->
          <aop:pointcut id="txPointCut" expression="execution(* service.EmployeeService.*(..))"/>
          <!--将事务通知和切点结合-->
          <aop:advisor advice-ref="myTxAdvice" pointcut-ref="txPointCut"/>
      </aop:config>
      <!--配置事务通知，属性transaction-manager指定该通知需要应用到的事务管理器-->
      <tx:advice id="myTxAdvice" transaction-manager="transactionManager">
          <!--配置事务通知的属性-->
          <tx:attributes>
              <!--配置切点中需要开启事务的方法和事务的相关属性-->
              <tx:method name="updateNameAndGender" propagation="REQUIRED"/>
              <tx:method name="updateName" propagation="REQUIRES_NEW"/>
              <tx:method name="updateGender" propagation="REQUIRES_NEW"/>
          </tx:attributes>
      </tx:advice>
  </beans>
  
  ```

  
