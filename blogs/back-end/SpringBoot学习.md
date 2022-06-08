---
title: SpringBoot 2学习
date: 2020-07-08
categories:
- Back-End
tags:
- Spring Boot
---

## 1.入门

- 简介

  SpringBoot能帮助我们更快创建出基于Spring的生产级别应用，其具有如下优点：

  - 内嵌Tomcat、 Jetty等web服务器，无需再依赖`.war`包进行部署
  - 提供starter依赖，无需再手动引入项目相关的各种繁琐的jar包，简化构建配置
  - 自动配置Spring以及第三方功能
  - 提供生产级别的监控、健康检查及外部化配置
  - 无代码生成、无需编写XML

- 使用SpringBoot 2开发部署一个简单web应用

  - 创建Maven工程
  - 引入SpringBoot依赖
  - 创建主程序类
  - 编写业务逻辑
  - 编写配置文件，修改默认配置
  - 项目部署

- 实战

  - 创建Maven工程

    创建一个空的Maven项目即可

  - 编写`pom.xml`文件，引入SpringBoot依赖

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>
    
        <groupId>site.potatoblog</groupId>
        <artifactId>SpringBootProject</artifactId>
        <version>1.0-SNAPSHOT</version>
    	<!--
    		引入spring-boot-starter-parent依赖
    		使用parent标签，标识spring-boot-starter-parent作为当前maven项目的父工程
    		spring-boot-starter-parent工程中配置了springboot相关的各种依赖以及版本号
    	-->
        <parent>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-parent</artifactId>
            <version>2.5.2</version>
        </parent>
    
        <dependencies>
            <!--
    			对于一个web项目，需要引入spring-boot-starter-web依赖，其版本号继承于父工程spring-boot-starter-parent
    			spring-boot-starter-web依赖整合了一个web项目需要的各种依赖jar包
    		-->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
            </dependency>
        </dependencies>
    	
        <build>
            <plugins>
                <!--
    				添加spring-boot-maven-plugin插件，可以将项目打包成jar包，用于项目部署
    			-->
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                </plugin>
            </plugins>
        </build>
    </project>
    ```

  - 创建主程序类

    SpringBoot项目的运行需要通过一个主程序类来完成

    `MainApplication`类

    ```java
    package boot;
    
    import org.springframework.boot.SpringApplication;
    import org.springframework.boot.autoconfigure.SpringBootApplication;
    
    //使用@SpringBootApplication标识当前类为主程序类
    @SpringBootApplication
    public class MainApplication {
    	//主程序类的main方法是SpringBoot项目运行的入口方法
        public static void main(String[] args) {
            //传入主程序类的Class对象，调用SpringApplication类的静态run方法，运行SpringBoot项目
            SpringApplication.run(MainApplication.class);
        }
    }
    ```

  - 编写业务逻辑

    编写一个控制器类，处理请求映射

    `HelloController`类

    ```java
    package boot.controller;
    
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.ResponseBody;
    
    @Controller
    public class HelloController {
        //使用@ResponseBody注解标识当前方法的返回值是直接放入响应体中返回给浏览器
        @ResponseBody
        //@RequestMapping注解标识当前方法用于处理/hello请求映射
        @RequestMapping("/hello")
        public String hello(){
            return "Hello SpringBoot 2！";
        }
    }
    ```

  - 编写配置文件

    SpringBoot会为我们整合各种依赖，我们可以编写一个整体的配置文件来修改SpringBoot项目的默认配置。SpringBoot会自动去类路径下寻找名称为`application.properties`的文件，并读取其中的配置进行修改

    `application.properties`文件

    ```properties
    #server.port，用于修改SpringBoot内嵌的Tomcat服务器的端口号
    #将默认的端口号由8080改为8888
    server.port=8888
    ```

## 2.自动配置

### 2.1SpringBoot特点

SpringBoot之所以能开发如此便捷都依赖于其两大特点：

- 依赖管理
- 自动配置

#### 2.1.1依赖管理

- SpringBoot的spring-boot-starter-parent项目作为父项目，能为当前项目作依赖管理

  - spring-boot-starter-parent项目

    ```xml
    ...  
    <!--spring-boot-starter-parent项目本身又继承于spring-boot-dependencies项目-->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-dependencies</artifactId>
        <version>2.5.2</version>
    </parent>
    ...
    ```

  - spring-boot-depencies项目

    在spring-boot-depencies项目中几乎声明了所有开发中常用jar包依赖的版本号，因此只要spring-boot-depencies项目中声明了的jar包依赖，其所有子项目在引入该jar包时，都会自动继承spring-boot-depencies中声明的版本号，不需要再手动编写版本号

    ```xml
    <properties>
      <activemq.version>5.16.2</activemq.version>
      <antlr2.version>2.7.7</antlr2.version>
      <appengine-sdk.version>1.9.89</appengine-sdk.version>
      <artemis.version>2.17.0</artemis.version>
      <aspectj.version>1.9.6</aspectj.version>
      <assertj.version>3.19.0</assertj.version>
      <atomikos.version>4.0.6</atomikos.version>
      <awaitility.version>4.0.3</awaitility.version>
      <build-helper-maven-plugin.version>3.2.0</build-helper-maven-plugin.version>
      <byte-buddy.version>1.10.22</byte-buddy.version>
      <caffeine.version>2.9.1</caffeine.version>
      <cassandra-driver.version>4.11.2</cassandra-driver.version>
      <classmate.version>1.5.1</classmate.version>
      <commons-codec.version>1.15</commons-codec.version>
      <commons-dbcp2.version>2.8.0</commons-dbcp2.version>
      <commons-lang3.version>3.12.0</commons-lang3.version>
      <commons-pool.version>1.6</commons-pool.version>
      <commons-pool2.version>2.9.0</commons-pool2.version>
      <couchbase-client.version>3.1.6</couchbase-client.version>
      ...
    </properties>
    ```

    - 补充

      如果要为当前项目引入不同于spring-boot-depencies项目中声明的版本号的jar包依赖，应该在当前项目重写该jar包依赖的版本号

      - 实战（为当前项目引入版本号为1.2.1的logback的jar包依赖）

        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <project xmlns="http://maven.apache.org/POM/4.0.0"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
            <modelVersion>4.0.0</modelVersion>
        
            <groupId>site.potatoblog</groupId>
            <artifactId>SpringBootProject</artifactId>
            <version>1.0-SNAPSHOT</version>
        
            <parent>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-parent</artifactId>
                <version>2.5.2</version>
            </parent>
        
            <dependencies>
                <dependency>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-web</artifactId>
                </dependency>
            </dependencies>
        
            <!--
        		spring-boot-depencies项目中声明的logback的jar包版本号为1.2.3
        		在当前项目重写其版本号为1.2.1即可
        	-->
            <properties>
                <logback.version>1.2.1</logback.version>
            </properties>
        
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-maven-plugin</artifactId>
                    </plugin>
                </plugins>
            </build>
        </project>
        ```

- starter场景启动器

  SpringBoot提供了很多场景启动器，每个场景启动器都会整合其对应场景所需的所有依赖jar包

  - SpringBoot的场景启动器命名都是`spring-boot-starter-*`的形式，`*`即代表对应的场景，比如spring-boot-starter-web、spring-boot-starter-jdbc等
  - 只要在当前项目中引入SpringBoot提供的starter场景启动器的依赖，Maven就会自动导入该场景所需的所有依赖jar包，因为在每个starter场景启动器中都整合了该场景所需的所有依赖jar包，比如spring-boot-starter-web整合了web场景所需的所有依赖jar包
  - SpringBoot也允许我们编写自己的场景启动器，命名形式为`*-spring-boot-starter`
  - 所有场景启动器其底层都会依赖spring-boot-starter这个核心启动器，该启动器会提供自动配置的支持

#### 2.1.2自动配置

以spring-boot-starter-web场景启动器为例，当我们引入该启动器，SpringBoot会为我们自动配置好该场景所需的所有组件

- 自动配好tomcat

  在spring-boot-starter-web内部会引入tomcat的场景启动器，该启动器会整合配置tomcat相关依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-tomcat</artifactId>
      <version>2.5.2</version>
      <scope>compile</scope>
  </dependency>
  ```

- 自动配好SpringMVC

  - 引入SpringMVC全套组件
  - 自动配好自动配好SpringMVC常用组件（视图解析器、文件上传解析器）

- 自动配好web常见功能（字符编码问题）

  自动配置好了所有web开发的常见场景

- 默认的包结构

  - SpringBoot会默认扫描主程序类所在包及其子包下的所有类，不再需要以前的包扫描配置。如下图，SpringBoot会扫描boot包及其子包下的所有类，将被`@Controller`注解标识的`HelloController`类注册到SpringMVC容器中

    ![image-20210707192733172](/static/img/image-20210707192733172.png)

  - 我们也可以通过注解来改变包扫描路径

    - 通过配置`@SpringBootApplication`注解的`scanBasePackages`属性来改变包扫描路径

      ```java
      //只扫描boot包下的controller包
      @SpringBootApplication(scanBasePackages = "boot.controller")
      public class MainApplication {
          public static void main(String[] args) {
              SpringApplication.run(MainApplication.class);
          }
      }
      ```

    - 通过拆分`@SpringBootApplication`注解

      ```java
      @SpringBootApplication
      //其等价于以下三个注解的组合
      @SpringBootConfiguration
      @EnableAutoConfiguration
      @ComponentScan("boot")//在该注解上改变包扫描路径
      ```

- 自动配好各种配置的默认值

  - 比如`server.port`服务器端口默认值为8080，`spring.servlet.multipart.max-file-size`文件上传最大值默认值为1MB
  - 配置文件中的各种类型的配置最终都会绑定到对应的类上，比如`server`开头的配置会被绑定到`ServerProperties`类上等

- 按需加载所有自动配置项

  - SpringBoot是按需加载所有自动配置项，比如web场景启动器只会引入web相关依赖，如果需要使用数据库，还需要引入数据库开发的场景启动器
  - SpringBoot自动配置功能都在spring-boot-autoconfigure包中，该依赖由spring-boot-starter启动器引入

### 2.2容器功能

#### 2.2.1向容器中注册组件

SpringBoot无需再编写xml配置文件来配置IOC容器，而是使用注解驱动进行配置

- `@Configuration`注解

  - 作用

    标注在类上，标识该类为配置类，相当于原来xml配置文件

  - 与`@Bean`注解搭配使用

    - `@Bean`注解

      - 作用

        标注在方法上，表示该方法的返回值会作为一个组件被注册到IOC容器中，相当于原来的`<bean>`标签

      - 属性

        - `name`

          `String`类型，用于指定注册到容器中的组件的id值，如果不配置该属性，则bean的id值为方法名

  - 属性

    - `proxyBeanMethods`

      `boolean`类型，用于指定`@Bean`注解标注的方法是否使用代理，如果不配置该属性，则默认为`true`

      - `true`

        表示使用代理，则每次调用该方法去获取一个组件，都会去IOC容器中查询该组件是否存在

        - 如果存在，则直接返回容器中存在的该组件
        - 如果不存在，则在容器新建一个组件

      - `false`

        表示不使用代理，则每次调用该方法都不会去IOC容器中查询，而是直接新建一个组件返回

    - `value`

      `@Configuration`注解标识的配置类也是一个组件会被注册到容器中，而该属性用于指定配置类组件在容器中id值

  - 实战

    - 配置类`MyConfig`

      ```java
      package boot.config;
      import boot.bean.User;
      import org.springframework.context.annotation.Bean;
      import org.springframework.context.annotation.Configuration;
      
      //将配置类注册到容器中，id值为config，并且该类下的所有的@Bean标注的方法都不会使用代理
      @Configuration(value="config",proxyBeanMethods = false)
      public class MyConfig {
      	//使用@Bean注解向容器中注册组件
          //该注解标注的方法相当于xml配置中的<bean id=getUser class=boot.bean.User bean/>标签
          @Bean
          public User getUser(){
              return new User();
          }
      }
      ```

    - 主程序类`MyApplication`

      ```java
      package boot;
      
      import boot.bean.User;
      import boot.config.MyConfig;
      import org.springframework.boot.SpringApplication;
      import org.springframework.boot.autoconfigure.SpringBootApplication;
      import org.springframework.context.ConfigurableApplicationContext;
      
      
      @SpringBootApplication
      public class MainApplication {
      
          public static void main(String[] args) {
              //SpringApplication.run方法会运行当前SpringBoot项目，并返回IOC容器
              ConfigurableApplicationContext context = SpringApplication.run(MainApplication.class);
              //从IOC容器中获取配置类组件
              MyConfig myConfig=context.getBean("config",MyConfig.class);
              //由于配置类的proxyBeanMethods属性为false，因此每次调用该类中的@Bean注解标注的方法都会获取一个新的组件
              User user1=myConfig.getUser();
              User user2=myConfig.getUser();
              //输出为false
              System.out.println(user1==user2);
          }
      }
      ```

  - `proxyBeanMethods`属性的总结

    - 如果`proxyBeanMethods`属性设置为`true`，则每次获取组件时，SpringBoot都会去IOC容器中查询，效率低
    - 如果`proxyBeanMethods`属性设置为`false`，则每次获取组件时，无需去IOC容器中查询，效率高
    - 如果注册到容器中的组件后续会被其他组件所使用，则应该将`proxyBeanMethods`属性设置为`true`，保证每次获取到的组件都是存放在容器中的那个组件

- `@Import`注解

  - 作用

    根据类的全限定名向容器中导入组件，组件id默认为该类的全限定名

  - 属性

    - `value`

      `Class`类型的数组，用于指定要导入容器中的组件对应的Class对象

  - 实战

    ```java
    package boot.config;
    
    import boot.bean.User;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.context.annotation.Import;
    
    //向容器中导入一个User类型的组件，其id为User类的全限定名
    @Import(User.class)
    @Configuration
    public class MyConfig {
    }
    ```

- `@Conditional`注解

  `@Conditional`注解用于按条件注入组件，该注解是一个根注解，其下派生了各种条件注入的注解，如下图![image-20210708023254712](/static/img/image-20210708023254712.png)

  以`@ConditionalOnBean`注解为例：

  - 作用

    根据容器中是否存在指定组件来判断是否注入当前组件

  - 属性

    - `name`

      用于指定要查询组件在容器中的id值

  - 实战

    ```java
    package boot.config;
    
    import boot.bean.User;
    import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.context.annotation.Import;
    
    //如果将该注释去除，则getUser组件将会被注入到容器中
    //@Import(User.class)
    @Configuration("config")
    public class MyConfig {
    	//判断容器中是否存在id值为boot.bean.User的组件
        	//1.如果存在，则将当前方法对应的组件注入容器中
        	//2.否则，不注入
        @ConditionalOnBean(name="boot.bean.User")
        @Bean
        public User getUser(){
            return new User();
        }
    }
    ```

#### 2.2.2原生配置文件引入

SpringBoot还可以使用注解来兼容老版的基于xml文件配置的组件

- `@ImportResource`注解

  - 作用

    用于兼容基于xml文件配置的组件，它能将xml配置文件中的组件注册到当前IOC容器中

  - 属性

    - `value`
      String类型的数组，用于指定xml配置文件的路径

  - 实战

    - xml配置文件`spring.xml`

      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <beans xmlns="http://www.springframework.org/schema/beans"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
      
          <bean id="user" class="boot.bean.User"/>
      </beans>
      ```

    - 配置类`MyConfig`

      ```java
      package boot.config;
      import org.springframework.context.annotation.Configuration;
      import org.springframework.context.annotation.ImportResource;
      
      //将类路径下的spring.xml配置文件中配置的组件注册到IOC容器中
      @ImportResource("classpath:spring.xml")
      @Configuration("config")
      public class MyConfig {
      }
      ```

#### 2.2.3配置绑定

SpringBoot可以通过注解实现将配置文件中的属性与JavaBean的属性进行绑定

- `@ConfigurationProperties`注解

  - 作用

    标注在类上，并且该类必须是容器中的组件才能生效，将配置文件中的属性配置绑定到该类的属性上

  - 属性

    - `prefix`

      `String`类型，用于指定要配置文件中要与JavaBean属性绑定的属性名前缀

  - 实战

    - `application.properties`

      ```properties
      user.name=potato
      user.age=21
      user.sex=男
      ```

    - `User`类

      ```java
      package boot.bean;
      
      import org.springframework.boot.context.properties.ConfigurationProperties;
      import org.springframework.stereotype.Component;
      
      //将该类注册容器中，使得@ConfigurationProperties注解生效
      @Component
      //该JavaBean属性只与配置文件中以user为前缀的属性进行绑定
      @ConfigurationProperties(prefix = "user")
      public class User {
          private String name;
          private String age;
          private String sex;
      
          public String getName() {
              return name;
          }
      
          public void setName(String name) {
              this.name = name;
          }
      
          public String getAge() {
              return age;
          }
      
          public void setAge(String age) {
              this.age = age;
          }
      
          public String getSex() {
              return sex;
          }
      
          public void setSex(String sex) {
              this.sex = sex;
          }
      }
      ```

- `@EnableConfigurationProperties`注解

  - 作用

    只能标注在配置类上，它能将指定类注册到容器中，并且指定类必须被`@ConfigurationProperties`注解标注

  - 属性

    `Class`类型的数组，用于指定要注册到容器中的用于配置绑定的类

  - 实战

    - `User`类

      ```java
      package boot.bean;
      
      import org.springframework.boot.context.properties.ConfigurationProperties;
      
      //开启User类的配置绑定功能
      @ConfigurationProperties(prefix = "user")
      public class User {
          private String name;
          private String age;
          private String sex;
      
          public String getName() {
              return name;
          }
      
          public void setName(String name) {
              this.name = name;
          }
      
          public String getAge() {
              return age;
          }
      
          public void setAge(String age) {
              this.age = age;
          }
      
          public String getSex() {
              return sex;
          }
      
          public void setSex(String sex) {
              this.sex = sex;
          }
      }
      ```

    - `MyConfig`类

      ```java
      package boot.config;
      import boot.bean.User;
      
      import org.springframework.boot.context.properties.EnableConfigurationProperties;
      import org.springframework.context.annotation.Configuration;
      
      @Configuration
      //将User类注册到容器中
      @EnableConfigurationProperties(User.class)
      public class MyConfig {
      }
      ```

### 2.3自动配置原理

`@SpringBootApplication`注解用于标注一个SpringBoot主程序类，该注解是`@SpringBootConfiguration`、`@EnableAutoConfiguration`和`@ComponentScan`三个注解的组合，其中`@EnableAutoConfiguration`注解是自动配置原理的关键所在

- `@EnableAutoConfiguration`注解

  该注解也是一个合成注解，由以下两个注解组合而成

  ```java
  @AutoConfigurationPackage
  //向容器中注册AutoConfigurationImportSelector组件
  @Import(AutoConfigurationImportSelector.class)
  ```

  - `@AutoConfigurationPackage`注解

    该注解内部使用了`@Import`注解，向容器中注册`AutoConfigurationPackages.Registrar`组件

    ```java
    @Import(AutoConfigurationPackages.Registrar.class)
    ```

    - `AutoConfigurationPackages.Registrar`组件

      该组件会获取到`@SpringBootApplication`注解标注的主程序类所在的包，并扫描该包下的所有组件批量注册到容器中

      ```java
      static class Registrar implements ImportBeanDefinitionRegistrar, DeterminableImports {
      
         @Override
         public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
            //根据注解信息获取主程序类所在的包，并对该包下的所有组件进行批量注册 
            register(registry, new PackageImports(metadata).getPackageNames().toArray(new String[0]));
         }
      
         @Override
         public Set<Object> determineImports(AnnotationMetadata metadata) {
            return Collections.singleton(new PackageImports(metadata));
         }
      ```

  - `AutoConfigurationImportSelector`组件

    该组件会通过`getAutoConfigurationEntry`方法获取到类路径下所有的`spring.factories`文件，并根据这些文件中指明的类的全限定名，按需注册到容器中

    - `spring.factories`文件（以`spring-boot-autoconfigure`包下的该文件为例）

      ```properties
      # Initializers
      org.springframework.context.ApplicationContextInitializer=\
      org.springframework.boot.autoconfigure.SharedMetadataReaderFactoryContextInitializer,\
      org.springframework.boot.autoconfigure.logging.ConditionEvaluationReportLoggingListener
      
      # Application Listeners
      org.springframework.context.ApplicationListener=\
      org.springframework.boot.autoconfigure.BackgroundPreinitializer
      
      # Environment Post Processors
      org.springframework.boot.env.EnvironmentPostProcessor=\
      org.springframework.boot.autoconfigure.integration.IntegrationPropertiesEnvironmentPostProcessor
      
      # Auto Configuration Import Listeners
      org.springframework.boot.autoconfigure.AutoConfigurationImportListener=\
      org.springframework.boot.autoconfigure.condition.ConditionEvaluationReportAutoConfigurationImportListener
      ...
      ```

    - `getAutoConfigurationEntry`方法

      ```java
      protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
          if (!isEnabled(annotationMetadata)) {
              return EMPTY_ENTRY;
          }
          AnnotationAttributes attributes = getAttributes(annotationMetadata);
          //获取spring-boot-autoconfigure包下的spring.factories文件，并根据根据注解信息按需注册该文件中的相应组件
          List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
          configurations = removeDuplicates(configurations);
          Set<String> exclusions = getExclusions(annotationMetadata, attributes);
          checkExcludedClasses(configurations, exclusions);
          configurations.removeAll(exclusions);
          configurations = getConfigurationClassFilter().filter(configurations);
          fireAutoConfigurationImportEvents(configurations, exclusions);
          return new AutoConfigurationEntry(configurations, exclusions);
      }
      ```


## 3.配置文件

### 3.1文件类型

- properties类型

  - 基本语法
    - 注释内容由 # 或者! 开头， 如果# 或者!不在开头，则不作为注释
    - key,value之间用 `=` 或者 `:` 分隔
    - key 不能换行，value可以换行，换行符是`\` ，且换行后的`\t`、空格都会忽略

- yaml类型

  - 基本语法

    - key和value之间用`:`分隔，注意`:`后需要一个空格再接value
    - 大小写敏感
    - 使用缩进表示层级关系
    - 缩进时不允许使用Tab键，只允许使用空格
    - 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可

    - `#`表示注释
    - 字符串无需加引号，如果要加，`''`与`""`表示字符串内容是否会被转义
      - `''`表示直接输出字符串内容不转义
      - `""`表示字符串会被转义输出

  - 数据类型（表示value的数据类型）

    - 字面量

      单个的、不可再分的值，比如数字、日期、字符串等，书写形式如下：

      ```yaml
      key: value
      ```

    - 对象

      一组键值对的集合，书写形式如下：

      ```yaml
      #行内写法
      key: {k1: v1,k2: v2}
      #或者展开,以-开头表示一个键值对
      key:
        - k1: v1
        - k2: v2
      ```

    - 数组

      一组按次序排列的值，书写形式如下：

      ```yaml
      #行内写法
      key: [v1,v2,v3]
      #或者展开，以-开头表示一个元素
      key:
        - v1
        - v2
      ```

  - 实战

    - `Person`类

      ```java
      package boot.bean;
      import org.springframework.boot.context.properties.ConfigurationProperties;
      import org.springframework.stereotype.Component;
      
      import java.util.*;
      
      @Component
      //与配置文件中person前缀的属性进行绑定
      @ConfigurationProperties(prefix = "person")
      public class Person {
          private String userName;
          private Boolean boss;
          private Date birth;
          private Integer age;
          private Pet pet;
          private String[] interests;
          private List<String> animal;
          private Map<String, Object> score;
          private Set<Double> salarys;
          private Map<String, List<Pet>> allPet;
      	//getter、setter方法
          ...
      }
      ```

    - `Pet`类

      ```java
      package boot.bean;
      public class Pet {
          private String name;
          private Double weight;
       	//getter、setter方法
          ...
      }
      ```

    - `application.yaml`

      ```yaml
      person:
        user-name: potato
        age: 21
        birth: 2021/10/20 20:12:33
        pet:
          - name: 阿狗
          - weight: 50.2
        boss: true
        score:
          - 语文: 100
          - 数学: 200
        interests: [java,c++]
        animal:
          - 大象
          - 猫
        salarys: [1000.2,2000.3]
        all-pet:
          sick:
            - {name: tom}
            - {name: jerry,weight: 47}
          health: [{name: mario,weight: 47}]
      ```

### 3.2配置提示

开发中在编写配置文件为自定义类进行属性绑定时，是不会产生相应的提示信息，我们需要引入一些依赖才行，并且在项目打包成jar包时应该将此类与业务逻辑无关的依赖排除

- 引入依赖

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-configuration-processor</artifactId>
      <optional>true</optional>
  </dependency>
  ```

- 项目打包时排除该依赖

  ```xml
  <build>
      <plugins>
          <plugin>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-maven-plugin</artifactId>
              <configuration>
                  <excludes>
                      <exclude>
                          <groupId>org.springframework.boot</groupId>
                          <artifactId>spring-boot-configuration-processor</artifactId>
                      </exclude>
                  </excludes>
              </configuration>
          </plugin>
      </plugins>
  </build>
  ```

## 4.web开发

对于web开发，SpringBoot已经自动配置好了SpringMVC，能适应大多数场景

### 4.1静态资源访问

- 静态资源目录

  对于静态资源的访问无需再进行手动配置，SpringBoot规定静态资源只要放置在类路径下的`static`文件夹、`public`文件夹、`resources`文件夹、或者`/META-INF/resources`文件夹下

  ![image-20210708165505701](/static/img/image-20210708165505701.png)

  - 改变默认的静态资源目录

    可以通过修改配置文件的相应配置来修改静态资源默认存放的目录

    ```yaml
    spring:
      web:
        resources:
          #将静态资源默认存放的目录修改为类路径下的res文件夹
          static-locations: classpath:/res/
    ```

- 静态资源请求映射前缀

  默认静态资源访问路径是无前缀，即`/**`，对于静态资源访问可以直接通过`当前项目名/静态资源名`的URL形式进行访问，也可以通过修改配置文件的相应配置来修改静态资源默认的访问路径前缀

  ```yaml
  spring:
    mvc:
    	#将静态资源的请求映射前缀修改为/res/**
    	#即以后访问静态资源，都应该通过“当前项目名/res/静态资源名”的URL形式进行访问
      static-path-pattern: /res/**
  ```

- 静态资源访问原理

  SpringMVC内置的一个静态资源处理器能处理静态资源，其能处理的请求映射默认是`/**`，即会处理所有请求映射，当一个请求映射进入SpringMVC：

  - 首先会去控制器类中寻找是否有能处理该请求映射的方法，如果有，则直接由该控制器类进行处理，否则进入下个流程
  - 如果所有控制器类中的方法都无法处理该请求映射，则该请求映射会被静态资源处理器处理，根据映射信息，从类路径下的静态资源目录中查找

- 欢迎页支持

  SpringBoot还提供了便捷的欢迎页支持，只需要编写一个`index.html`文件并放置在静态资源文件夹下，SpringBoot就会自动发现并将其设置为web项目的欢迎页

  **注意：**不能配置静态资源请求映射前缀，否则会导致web项目的欢迎页无法访问，因为欢迎页也是一个静态资源，添加了前缀，则无法通过项目根路径`/`进行访问

- 自定义网页图标favicon

  SpringBoot还提供了便捷的网页图标自定义，只需将一个名称为`favicon.ico`的文件放置在静态资源文件夹下，SpringBoot就会自动发现并将该文件设置为网页图标

  **注意：**不能配置静态资源请求映射前缀，否则会导致网页图标无法显示

#### 4.1.1静态资源配置原理

- SpringBoot在启动时会根据场景启动器按需加载一些自动配置类

- SpringMVC的自动配置功能大部分依赖于`WebMvcAutoConfiguration`这个自动配置类，该类被标注的注解如下

  ```java
  //指定WebMvcAutoConfiguration类为配置类
  @Configuration(proxyBeanMethods = false)
  //按条件向容器中注册WebMvcAutoConfiguration这个组件
  @ConditionalOnWebApplication(type = Type.SERVLET)
  @ConditionalOnClass({ Servlet.class, DispatcherServlet.class, WebMvcConfigurer.class })
  @ConditionalOnMissingBean(WebMvcConfigurationSupport.class)
  @AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE + 10)
  @AutoConfigureAfter({ DispatcherServletAutoConfiguration.class, TaskExecutionAutoConfiguration.class,
  		ValidationAutoConfiguration.class })
  public class WebMvcAutoConfiguration {
      ...
  }
  ```

- `WebMvcAutoConfiguration`自动配置类中定义了一个嵌套类`WebMvcAutoConfigurationAdapter`，其内部定义了静态资源访问的相关逻辑，其部分源码如下

  ```java
  //指定WebMvcAutoConfigurationAdapter类为配置类
  @Configuration(proxyBeanMethods = false)
  //向容器中注册一个EnableWebMvcConfiguration类型的组件
  @Import(EnableWebMvcConfiguration.class)
  /**
   *将WebMvcProperties类,ResourceProperties类, WebProperties类注册到容器中，并开启它们的配置绑定功能
   *	1.WebMvcProperties类会与配置文件中以spring.mvc为前缀的属性进行绑定
   *	2.WebProperties类会与配置文件中以spring.web为前缀的属性进行绑定
   *  3.ResourceProperties类会与配置文件中以spring.resources为前缀的属性进行绑定
   */	
  @EnableConfigurationProperties({ WebMvcProperties.class,
                                  org.springframework.boot.autoconfigure.web.ResourceProperties.class, WebProperties.class })
  @Order(0)
  public static class WebMvcAutoConfigurationAdapter implements WebMvcConfigurer, ServletContextAware {
  
      private static final Log logger = LogFactory.getLog(WebMvcConfigurer.class);
  
      private final Resources resourceProperties;
  
      private final WebMvcProperties mvcProperties;
  
      private final ListableBeanFactory beanFactory;
  
      private final ObjectProvider<HttpMessageConverters> messageConvertersProvider;
  
      private final ObjectProvider<DispatcherServletPath> dispatcherServletPath;
  
      private final ObjectProvider<ServletRegistrationBean<?>> servletRegistrations;
  
      private final ResourceHandlerRegistrationCustomizer resourceHandlerRegistrationCustomizer;
  
      private ServletContext servletContext;
  	//当配置类中只有一个有参构造器，则有参构造器的所有参数都会去容器中寻找对应的组件并进行绑定
      public WebMvcAutoConfigurationAdapter(
          org.springframework.boot.autoconfigure.web.ResourceProperties resourceProperties,
          WebProperties webProperties, WebMvcProperties mvcProperties, ListableBeanFactory beanFactory,
          ObjectProvider<HttpMessageConverters> messageConvertersProvider,
          ObjectProvider<ResourceHandlerRegistrationCustomizer> resourceHandlerRegistrationCustomizerProvider,
          ObjectProvider<DispatcherServletPath> dispatcherServletPath,
          ObjectProvider<ServletRegistrationBean<?>> servletRegistrations) {
          this.resourceProperties = resourceProperties.hasBeenCustomized() ? resourceProperties
              : webProperties.getResources();
          this.mvcProperties = mvcProperties;
          this.beanFactory = beanFactory;
          this.messageConvertersProvider = messageConvertersProvider;
          this.resourceHandlerRegistrationCustomizer = resourceHandlerRegistrationCustomizerProvider.getIfAvailable();
          this.dispatcherServletPath = dispatcherServletPath;
          this.servletRegistrations = servletRegistrations;
          this.mvcProperties.checkConfiguration();
      }
  	
      //处理静态资源访问的逻辑
      @Override
      public void addResourceHandlers(ResourceHandlerRegistry registry) {
          //首先判断配置文件中的spring.web.resources.add-mappings属性
          	//add-mappings属性值为默认为true，表示不禁用静态资源访问
          	//add-mappings属性值为false，表示禁用静态资源访问
          if (!this.resourceProperties.isAddMappings()) {
              //add-mappings属性值为false，则说明静态资源访问被禁用，方法直接结束
              logger.debug("Default resource handling disabled");
              return;
          }
          //否则，处理静态资源访问的相关逻辑
          //注册处理/webjars/**类型请求映射的处理器，与该类型相匹配的请求映射会去类路径下的/META-INF/resources/webjars/寻找对应的静态资源
          addResourceHandler(registry, "/webjars/**", "classpath:/META-INF/resources/webjars/");
          //注册静态资源处理器：
          	//根据配置文件中spring.mvc.static-path-pattern的值来设值静态资源处理器能处理的请求映射类型，默认为/**
          	//根据配置文件中spring.web.resources.static-locations的值来设置静态资源处理器要去哪些目录中寻找对应的静态资源，默认为那四个目录
          addResourceHandler(registry, this.mvcProperties.getStaticPathPattern(), (registration) -> {
              registration.addResourceLocations(this.resourceProperties.getStaticLocations());
              if (this.servletContext != null) {
                  ServletContextResource resource = new ServletContextResource(this.servletContext, SERVLET_LOCATION);
                  registration.addResourceLocations(resource);
              }
          });
      }
  
      //上述的addResourceHandler方法源码，用于注册静态资源相关的处理器
      private void addResourceHandler(ResourceHandlerRegistry registry, String pattern,
                                      Consumer<ResourceHandlerRegistration> customizer) {
          if (registry.hasMappingForPattern(pattern)) {
              return;
          }
          //为传入的请求映射类型注册一个处理器
          ResourceHandlerRegistration registration = registry.addResourceHandler(pattern);
          customizer.accept(registration);
          //根据配置文件中的spring.web.resources.cache.period的值为该类型的请求映射配置缓存，设置缓存的时间
          //spring.web.resources.cache.period配置请求映射缓存的时间
          registration.setCachePeriod(getSeconds(this.resourceProperties.getCache().getPeriod()));
          registration.setCacheControl(this.resourceProperties.getCache().getCachecontrol().toHttpCacheControl());
          registration.setUseLastModified(this.resourceProperties.getCache().isUseLastModified());
          customizeResourceHandlerRegistration(registration);
      }
  
  }
  
  ```

- `WebMvcAutoConfiguration`自动配置类中定义了一个嵌套类`EnableWebMvcConfiguration`，其内部定义了欢迎页支持的相关逻辑，其部分源码如下

  ```java
  //指定EnableWebMvcConfiguration类为配置类
  @Configuration(proxyBeanMethods = false)
  //将WebProperties类注册到容器中，并开启它们的配置绑定功能
  @EnableConfigurationProperties(WebProperties.class)
  public static class EnableWebMvcConfiguration extends DelegatingWebMvcConfiguration implements ResourceLoaderAware {
  
      private final Resources resourceProperties;
  
      private final WebMvcProperties mvcProperties;
  
      private final WebProperties webProperties;
  
      private final ListableBeanFactory beanFactory;
  
      private final WebMvcRegistrations mvcRegistrations;
  
      private ResourceLoader resourceLoader;
  
      @SuppressWarnings("deprecation")
      public EnableWebMvcConfiguration(
          org.springframework.boot.autoconfigure.web.ResourceProperties resourceProperties,
          WebMvcProperties mvcProperties, WebProperties webProperties,
          ObjectProvider<WebMvcRegistrations> mvcRegistrationsProvider,
          ObjectProvider<ResourceHandlerRegistrationCustomizer> resourceHandlerRegistrationCustomizerProvider,
          ListableBeanFactory beanFactory) {
          this.resourceProperties = resourceProperties.hasBeenCustomized() ? resourceProperties
              : webProperties.getResources();
          this.mvcProperties = mvcProperties;
          this.webProperties = webProperties;
          this.mvcRegistrations = mvcRegistrationsProvider.getIfUnique();
          this.beanFactory = beanFactory;
      }
  	
      //	//处理欢迎页请求映射的相关逻辑
      @Bean
      public WelcomePageHandlerMapping welcomePageHandlerMapping(ApplicationContext applicationContext,
                                                                 FormattingConversionService mvcConversionService, ResourceUrlProvider mvcResourceUrlProvider) {
          //WelcomePageHandlerMapping构造器中定义了处理欢迎页请求映射的相关逻辑
          WelcomePageHandlerMapping welcomePageHandlerMapping = new WelcomePageHandlerMapping(
              new TemplateAvailabilityProviders(applicationContext), applicationContext, getWelcomePage(),
              this.mvcProperties.getStaticPathPattern());
          welcomePageHandlerMapping.setInterceptors(getInterceptors(mvcConversionService, mvcResourceUrlProvider));
          welcomePageHandlerMapping.setCorsConfigurations(getCorsConfigurations());
          return welcomePageHandlerMapping;
      }
  
  }
  ```

  - `WelcomePageHandlerMapping`的构造方法

    ```java
    WelcomePageHandlerMapping(TemplateAvailabilityProviders templateAvailabilityProviders,
                              ApplicationContext applicationContext, Resource welcomePage, String staticPathPattern) {
        //如果静态资源目录下存在对应的index.html文件并且静态资源处理器能处理的请求映射是/**类型
        if (welcomePage != null && "/**".equals(staticPathPattern)) {
            logger.info("Adding welcome page: " + welcomePage);
            //则当访问项目根路径时，便会自动转发至index.html文
            setRootViewName("forward:index.html");
        }
        else if (welcomeTemplateExists(templateAvailabilityProviders, applicationContext)) {
            logger.info("Adding welcome page template: index");
            setRootViewName("index");
        }
    }
    ```

### 4.3请求处理

#### 4.3.1REST风格的请求映射支持

- SpringBoot提供了支持REST风格的请求映射注解：

  - `GetMapping`

    用于处理`GET`方式的请求映射，其底层相当于`@RequestMapping(method = {RequestMethod.GET})`

  - `PostMapping`

    用于处理`POST`方式的请求映射，其底层相当于`@RequestMapping(method = {RequestMethod.POST})`

  - `DeleteMapping`

    用于处理`DELETE`方式的请求映射，其底层相当于`@RequestMapping(method = {RequestMethod.DELETE})`

  - `PutMapping`

    用于处理`PUT`方式的请求映射，其底层相当于`@RequestMapping(method = {RequestMethod.PUT})`

- 开启REST风格的请求映射支持

  SpringMVC中的`HiddenHttpMethodFilter`过滤器可以将`POST`方式的请求包装成`PUT`或者`DELETE`方式，SpringBoot中也在`WebMvcAutoConfiguration` 自动配置类中为我们配置了这个过滤器：

  ```java
  @Bean
  //条件注入，当容器中不存在HiddenHttpMethodFilter类型的组件时，才会将该过滤器注入容器中
  @ConditionalOnMissingBean(HiddenHttpMethodFilter.class)
  //条件注入，当配置文件中spring.mvc.hiddenmethod.filter.enabled属性存在时，该属性值默认为false
  	//如果该属性值为true，才会将该过滤器注入容器中
  	//如果该属性值为false，则不将该过滤器注入容器中
  @ConditionalOnProperty(prefix = "spring.mvc.hiddenmethod.filter", name = "enabled", matchIfMissing = false)
  public OrderedHiddenHttpMethodFilter hiddenHttpMethodFilter() {
     return new OrderedHiddenHttpMethodFilter();
  }
  ```

  因此，SpringBoot默认是不将`HiddenHttpMethodFilter`过滤器注入容器中，必须要在配置文件中将`spring.mvc.hiddenmethod.filter.enabled`属性值设置为`true`，才可以开启REST风格的请求映射支持

- 自定义`HiddenHttpMethodFilter`过滤器

  只需要在配置类中向容器中注入一个自定义的`HiddenHttpMethodFilter`过滤器即可，SpringBoot一旦发现容器中存在`HiddenHttpMethodFilter`类型的组件存在时，就不会将其自身默认的`HiddenHttpMethodFilter`过滤器注入容器，而是会采用我们自定义的过滤器组件来支持REST风格的请求映射

  配置类`MyConfig`

  ```java
  package boot.config;
  
  import org.springframework.context.annotation.Bean;
  import org.springframework.context.annotation.Configuration;
  import org.springframework.web.filter.HiddenHttpMethodFilter;
  
  @Configuration
  public class MyConfig {
      @Bean
      public HiddenHttpMethodFilter hiddenHttpMethodFilter(){
          //创建一个HiddenHttpMethodFilter对象
          HiddenHttpMethodFilter hiddenHttpMethodFilter=new HiddenHttpMethodFilter();
          //自定义其接收的MethodParam值，将默认的接收_method修改为_m
          hiddenHttpMethodFilter.setMethodParam("_m");
          return hiddenHttpMethodFilter;
      }
  }
  ```

#### 4.3.2新增的请求参数注解

- `@RequestAttribute`注解

  - 作用

    获取请求域中指定属性的值，通常用于处理转发的请求

  - 属性

    - `value`

      `String`类型，指定要获取请求域中的属性对应的属性名

    - `required`

      `boolean`类型，用于规定该请求参数是否必须携带，默认为`true`（如果为`true`，但是请求并未携带该参数则报错）

  - 实战

    控制器类`HelloController`

    ```java
    package boot.controller;
    
    import org.springframework.stereotype.Controller;
    import org.springframework.ui.Model;
    import org.springframework.web.bind.annotation.RequestAttribute;
    import org.springframework.web.bind.annotation.RequestMapping;
    import org.springframework.web.bind.annotation.ResponseBody;
    
    
    @Controller
    public class HelloController {
        @RequestMapping("/")
        public String index(Model model){
            //向请求域中保存一个属性，其属性名为status，值为200
            model.addAttribute("status",200);
            //将请求转发给/success
            return "forward:/success";
        }
        @RequestMapping("/success")
        @ResponseBody
        //使用@RequestAttribute注解从请求域中取出属性名为status的值，并绑定到参数code
        public Integer hello(@RequestAttribute("status") Integer code){
            return code;
        }
    }
    ```

- `@MatrixVariable`注解

  - 作用

    获取请求中的矩阵参数

  - 矩阵参数

    比如一个请求URL为`/cars/sell;low=34;high=52`，则`low`和`high`都是矩阵参数，它们通过`;`相隔

  - 属性

    - `value`

      `String`类型，指定要获取的矩阵参数的名字

    - `pathVar`

      `String`类型，指定要获取的矩阵参数对应的路径层级，比如`/boss/1;age=20/2;age=30`，同时出现两个同名的矩阵参数，就需要该属性指定要获取的矩阵参数对应的路径层级

    - `required`

      `boolean`类型，用于规定该请求参数是否必须携带，默认为`true`（如果为`true`，但是请求并未携带该参数则报错）

  - 开启支持矩阵参数支持

    SpringBoot默认会移除请求url分号后的内容，因此默认不支持矩阵参数，所以需要进行配置

    配置类`MyConfig`

    ```java
    package boot.config;
    
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
    import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
    import org.springframework.web.util.UrlPathHelper;
    
    @Configuration
    public class MyConfig {
    	//通过向容器中注册一个自定义的WebMvcConfigurer类来实现
        @Bean
        public WebMvcConfigurer webMvcConfigurer(){
            return new WebMvcConfigurer() {
                @Override
                public void configurePathMatch(PathMatchConfigurer configurer) {
                    UrlPathHelper urlPathHelper=new UrlPathHelper();
                    //取消移除url分号后的内容
                    urlPathHelper.setRemoveSemicolonContent(false);
                    configurer.setUrlPathHelper(urlPathHelper);
                }
            };
        }
    }
    ```

  - 实战

    控制器类`HelloController`

    ```java
    package boot.controller;
    
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.*;
    
    import java.util.HashMap;
    import java.util.Map;
    
    
    @Controller
    public class HelloController {
        @RequestMapping("/boss/{bossId}/{empId}")
        @ResponseBody
        //获取{bossId}这个路径层次下的age矩阵参数，绑定到参数bossAge，获取{empId}这个路径层次下的age矩阵参数，绑定到参数empAge
        public String boss(@PathVariable("bossId")String bossId,@PathVariable("empId")String empId,@MatrixVariable(value = "age",pathVar = "bossId")Integer bossAge,@MatrixVariable(value = "age",pathVar = "empId")Integer empAge){
            Map<String,Object> map=new HashMap<>();
            map.put("bid",bossId);
            map.put("eid",empId);
            map.put("bage",bossAge);
            map.put("eage",empAge);
            return map.toString();
        }
    }
    ```

### 4.4视图解析与模板引擎

SpringBoot中使用thymeleaf模板引擎和配置对应的视图解析器，只需要引入thymeleaf场景启动器，SpringBoot会根据该启动器自动配置好thymeleaf模板引擎和解析thymeleaf的视图解析器

- 引入thymeleaf场景启动器

  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-thymeleaf</artifactId>
  </dependency>
  ```

- SpringBoot会根据该启动器自动配置好thymeleaf模板引擎和解析thymeleaf的视图解析器

  - `ThymeleafAutoConfiguration`类

    用于自动配置thymeleaf模板引擎和解析thymeleaf的视图解析器

    ```java
    @Configuration(proxyBeanMethods = false)
    //将ThymeleafProperties类注入容器，并开启它的配置绑定功能
    @EnableConfigurationProperties(ThymeleafProperties.class)
    //当容器中存在TemplateMode和SpringTemplateEngine类型的组件时，才会自动配置thymeleaf
    @ConditionalOnClass({ TemplateMode.class, SpringTemplateEngine.class })
    @AutoConfigureAfter({ WebMvcAutoConfiguration.class, WebFluxAutoConfiguration.class })
    public class ThymeleafAutoConfiguration {
        ...
    }
    ```

  - `ThymeleafProperties`类

    保存了和thymleaf相关的所有配置值

    ```java
    //将配置文件中以spring.thymeleaf为前缀的属性与该类绑定
    @ConfigurationProperties(prefix = "spring.thymeleaf")
    public class ThymeleafProperties {
    
       private static final Charset DEFAULT_ENCODING = StandardCharsets.UTF_8;
       
       //thymeleaf的视图解析器的默认前缀
       public static final String DEFAULT_PREFIX = "classpath:/templates/";
       //thymeleaf的视图解析器的默认后缀
       public static final String DEFAULT_SUFFIX = ".html";
       ...
    }
    ```

由于SpringBoot为thymeleaf的视图解析器配置了默认前缀为`classpath:/templates/`，因此开发时只需要将html放置在类路径下的`templates`文件夹下

### 4.5拦截器

- SpringBoot配置自定义拦截器步骤：

  - 编写自定义拦截器，通过实现`HandlerInterceptor`接口来完成
  - 将自定义拦截器注册到容器中
    - 配置自定义拦截器要拦截的请求映射

- 实战

  SpringBoot提供了一个`WebMvcConfigurer`接口，用于让配置类实现来达到定制化SpringMVC功能的目的

  - 拦截器`LoginInterceptor`

    ```java
    package boot.interceptors;
    
    import org.springframework.web.servlet.HandlerInterceptor;
    
    import javax.servlet.http.HttpServletRequest;
    import javax.servlet.http.HttpServletResponse;
    
    public class LoginInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            if(request.getSession().getAttribute("user")!=null){
                return true;
            }
            response.sendRedirect(request.getContextPath()+"/login");
            return false;
        }
    }
    ```
    
  - 通过实现`WebMvcConfigurer`接口，将自定义拦截器注册到容器中
  
    ```java
    package boot.config;
    
    import boot.interceptors.LoginInterceptor;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
    import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
    
    //标识为配置类
    @Configuration
    //让配置类实现WebMvcConfigurer接口，来定制化SpringMVC功能
    public class MyConfig implements WebMvcConfigurer {
        //通过实现该接口的addInterceptors方法，向容器中配置并注册拦截器
        @Override
        public void addInterceptors(InterceptorRegistry registry) {
            //addInterceptor方法用于将自定义拦截器注册到容器，addPathPatterns用于配置拦截的请求映射
            registry.addInterceptor(new LoginInterceptor()).addPathPatterns("/admin/**");
        }
    }
    ```

### 4.6文件上传

引入web场景启动器，SpringBoot就会根据`MultipartAutoConfiguration`类为我们自动配置好文件上传功能

- `MultipartAutoConfiguration`类

  ```java
  @Configuration(proxyBeanMethods = false)
  @ConditionalOnClass({ Servlet.class, StandardServletMultipartResolver.class, MultipartConfigElement.class })
  //即使配置文件中缺少spring.servlet.multipart.enabled属性，也会向容器中注册该组件，即默认启动文件上传功能
  @ConditionalOnProperty(prefix = "spring.servlet.multipart", name = "enabled", matchIfMissing = true)
  @ConditionalOnWebApplication(type = Type.SERVLET)
  //将MultipartProperties类注册到容器中，并开启它的配置绑定功能
  @EnableConfigurationProperties(MultipartProperties.class)
  public class MultipartAutoConfiguration {
      ...
  }
  ```

- `MultipartProperties`类

  ```java
  //与配置文件中以spring.servlet.multipart为前缀的属性进行绑定
  @ConfigurationProperties(prefix = "spring.servlet.multipart", ignoreUnknownFields = false)
  public class MultipartProperties {
      ...
  }
  ```

SpringBoot中使用文件上传功能，仅需使用`@RequestPart`标识请求参数中的`MultipartFile`类型的参数，还可以修改配置文件设置文件上传的相关配置

- 控制器类`MyController`

  ```java
  @Controller
  public class MyController {
      @PostMapping("/handleFile")
      //使用@RequestPart注解标识文件上传参数
      public String handleFile(@RequestPart("file") MultipartFile multipartFile) throws IOException {
          //使用transferTo将文件保存至本地
          multipartFile.transferTo(new File("D:\\"+multipartFile.getOriginalFilename()));
          return "index";
      }
  }
  ```

- 配置文件`application.yaml`

  ```yaml
  spring:
    servlet:
      multipart:
        #配置上传文件最大值为1MB
        max-file-size: 1MB
  ```

### 4.7错误处理

- 默认规则

  - 默认情况下，Spring Boot提供`/error`处理所有错误的映射
  - 对于机器客户端，它将生成JSON响应，其中包含错误，HTTP状态和异常消息的详细信息。对于浏览器客户端，响应一个“ whitelabel”错误视图，以HTML格式呈现相同的数据

- 自定义规则

  - 自定义错误页面

    自定义的错误页面只需要放置在静态资源目录下的`error`文件夹下或者模板引擎目录下的`error`文件夹下，SpringBoot都会帮我们自动解析该文件夹下文件名为`404`以及`5xx`的页面

    - 对于`404`错误，SpringBoot会将其映射到`error`文件夹下的`404`页面文件
    - 对于所有以5开头的错误，SpringBoot会将其映射到`error`文件夹下的`5xx`页面文件
    - SpringBoot会将错误信息放入请求域中，用于错误页面回显

### 4.8定制化SpringMVC

定制化的常见方式

- 编写自定义配置类搭配`@Bean`注解来替换容器中的默认组件
- 编写一个配置类实现 `WebMvcConfigurer` 接口即可定制化web功能
- `@EnableWebMvc` 搭配实现`WebMvcConfigurer`接口的配置类，可以全面接管SpringMVC，所有规则全部自己重新配置
- 修改配置文件中相应属性

## 5.数据访问

### 5.1配置数据源

SpringBoot中配置数据源

- 步骤
  - 引入JDBC场景启动器，就会为我们自动导入`HikariDataSource`数据源、JDBC以及事务相关的包
  - 引入MySQL数据库驱动
  - 编写配置文件，通过设置以`spring.datasource`为前缀的属性值来配置数据源

- 实战

  - 引入JDBC场景启动器

    ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    ```

  - 引入MySQL数据库驱动

    ```xml
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    ```

  - 编写配置文件

    ```yaml
    spring:
      datasource:
        driver-class-name: com.mysql.cj.jdbc.Driver
        username: root
        password: apotato666
        url: jdbc:mysql://localhost:3306/potatoblog?serverTimezone=UTC&useUnicode=true&characterEncoding=utf8
    ```

### 5.2整合MyBatis

引入第三方MyBatis的场景启动器，自动配置MyBatis相关依赖

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.0</version>
</dependency>
```

其自动配置原理依托于 `MybatisAutoConfiguration`：

```java
@org.springframework.context.annotation.Configuration
//当容器中存在SqlSessionFactory和SqlSessionFactoryBean组件时，注入MybatisAutoConfiguration
@ConditionalOnClass({ SqlSessionFactory.class, SqlSessionFactoryBean.class })
//当容器中只存在一个备选的数据源时，注入MybatisAutoConfiguration
@ConditionalOnSingleCandidate(DataSource.class)
//将MybatisProperties类注入容器，并开启它的配置绑定绑定
@EnableConfigurationProperties(MybatisProperties.class)
@AutoConfigureAfter({ DataSourceAutoConfiguration.class, MybatisLanguageDriverAutoConfiguration.class })
public class MybatisAutoConfiguration implements InitializingBean {
    ...
   //自动向容器中注册并配置好SqlSessionFactory组件   
  @Bean
  @ConditionalOnMissingBean
  public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
    SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
    factory.setDataSource(dataSource);
    factory.setVfs(SpringBootVFS.class);
    if (StringUtils.hasText(this.properties.getConfigLocation())) {
      factory.setConfigLocation(this.resourceLoader.getResource(this.properties.getConfigLocation()));
    }
    applyConfiguration(factory);
    if (this.properties.getConfigurationProperties() != null) {
      factory.setConfigurationProperties(this.properties.getConfigurationProperties());
    }
    if (!ObjectUtils.isEmpty(this.interceptors)) {
      factory.setPlugins(this.interceptors);
    }
    if (this.databaseIdProvider != null) {
      factory.setDatabaseIdProvider(this.databaseIdProvider);
    }
    if (StringUtils.hasLength(this.properties.getTypeAliasesPackage())) {
      factory.setTypeAliasesPackage(this.properties.getTypeAliasesPackage());
    }
    if (this.properties.getTypeAliasesSuperType() != null) {
      factory.setTypeAliasesSuperType(this.properties.getTypeAliasesSuperType());
    }
    if (StringUtils.hasLength(this.properties.getTypeHandlersPackage())) {
      factory.setTypeHandlersPackage(this.properties.getTypeHandlersPackage());
    }
    if (!ObjectUtils.isEmpty(this.typeHandlers)) {
      factory.setTypeHandlers(this.typeHandlers);
    }
    if (!ObjectUtils.isEmpty(this.properties.resolveMapperLocations())) {
      factory.setMapperLocations(this.properties.resolveMapperLocations());
    }
    Set<String> factoryPropertyNames = Stream
        .of(new BeanWrapperImpl(SqlSessionFactoryBean.class).getPropertyDescriptors()).map(PropertyDescriptor::getName)
        .collect(Collectors.toSet());
    Class<? extends LanguageDriver> defaultLanguageDriver = this.properties.getDefaultScriptingLanguageDriver();
    if (factoryPropertyNames.contains("scriptingLanguageDrivers") && !ObjectUtils.isEmpty(this.languageDrivers)) {
      // Need to mybatis-spring 2.0.2+
      factory.setScriptingLanguageDrivers(this.languageDrivers);
      if (defaultLanguageDriver == null && this.languageDrivers.length == 1) {
        defaultLanguageDriver = this.languageDrivers[0].getClass();
      }
    }
    if (factoryPropertyNames.contains("defaultScriptingLanguageDriver")) {
      // Need to mybatis-spring 2.0.2+
      factory.setDefaultScriptingLanguageDriver(defaultLanguageDriver);
    }

    return factory.getObject();
  }
   
  //自动向容器中注册并配置好SqlSessionTemplate组件，其内部整合了SqlSession 
  @Bean
  @ConditionalOnMissingBean
  public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
    ExecutorType executorType = this.properties.getExecutorType();
    if (executorType != null) {
      return new SqlSessionTemplate(sqlSessionFactory, executorType);
    } else {
      return new SqlSessionTemplate(sqlSessionFactory);
    }
  }
  //嵌套类，该类会去扫描所有带@Mapper注解的接口并注册到容器中
  public static class AutoConfiguredMapperScannerRegistrar implements BeanFactoryAware, ImportBeanDefinitionRegistrar {

        private BeanFactory beanFactory;

        @Override
        public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

            if (!AutoConfigurationPackages.has(this.beanFactory)) {
                logger.debug("Could not determine auto-configuration package, automatic mapper scanning disabled.");
                return;
            }

            logger.debug("Searching for mappers annotated with @Mapper");

            List<String> packages = AutoConfigurationPackages.get(this.beanFactory);
            if (logger.isDebugEnabled()) {
                packages.forEach(pkg -> logger.debug("Using auto-configuration base package '{}'", pkg));
            }

            BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition(MapperScannerConfigurer.class);
            builder.addPropertyValue("processPropertyPlaceHolders", true);
            builder.addPropertyValue("annotationClass", Mapper.class);
            builder.addPropertyValue("basePackage", StringUtils.collectionToCommaDelimitedString(packages));
            BeanWrapper beanWrapper = new BeanWrapperImpl(MapperScannerConfigurer.class);
            Set<String> propertyNames = Stream.of(beanWrapper.getPropertyDescriptors()).map(PropertyDescriptor::getName)
                .collect(Collectors.toSet());
            if (propertyNames.contains("lazyInitialization")) {
                // Need to mybatis-spring 2.0.2+
                builder.addPropertyValue("lazyInitialization", "${mybatis.lazy-initialization:false}");
            }
            if (propertyNames.contains("defaultScope")) {
                // Need to mybatis-spring 2.0.6+
                builder.addPropertyValue("defaultScope", "${mybatis.mapper-default-scope:}");
            }
            registry.registerBeanDefinition(MapperScannerConfigurer.class.getName(), builder.getBeanDefinition());
        }

  ...

}
```

SpringBoot整合MyBatis

- 步骤

  - 编写SQL映射文件
  - 编写SQL映射文件对应的接口，并使用`@Mapper`（相当于`@Repository`）标识，将该接口注册到容器中
  - 编写配置文件，配置MyBatis的相关配置

- 实战

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="boot.dao.BlogDao">
        <insert id="insert">
            insert blog value(#{id},#{title},#{md},#{html},#{date},#{tag},#{status})
        </insert>
    </mapper>
    ```

  - SQL映射文件对应的接口

    ```java
    package boot.dao;
    
    import boot.bean.Blog;
    import org.apache.ibatis.annotations.Mapper;
    import org.springframework.stereotype.Repository;
    
    //使用@Mapper标识该接口是SQL映射文件对应的接口
    @Mapper
    public interface BlogDao {
        void insert(Blog blog);
    }
    ```

  - 编写配置文件

    ```yaml
    spring:
      datasource:
        driver-class-name: com.mysql.cj.jdbc.Driver
        username: root
        password: apotato666
        url: jdbc:mysql://localhost:3306/potatoblog?serverTimezone=UTC&useUnicode=true&characterEncoding=utf8
    mybatis:
      #配置Mapper映射文件所在位置
      mapper-locations: classpath:mappers/BlogMapper.xml
    ```

