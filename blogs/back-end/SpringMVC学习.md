---
title: SpringMVC学习
date: 2020-05-21
categories:
- Back-End
tags:
- Spring MVC
---

## 1.入门

- SpringMVC编写简单网页步骤

  - 在`web.xml`文件中配置前端控制器
  - 编写控制器类，并在类中编写请求映射方法
  - 在spring配置文件中配置视图解析器，并开启注解扫描
  - 编写jsp页面

- 简单示例

  - `web.xml`

    ```xml
    <!DOCTYPE web-app PUBLIC
     "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
     "http://java.sun.com/dtd/web-app_2_3.dtd" >
    
    <web-app>
      <display-name>Archetype Created Web Application</display-name>
      <!--配置前端控制器-->  
      <servlet>
        <servlet-name>dispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!--配置前端控制器的初始化参数--> 
        <init-param>
          <!--配置spring配置文件的位置--> 
          <param-name>contextConfigLocation</param-name>
          <param-value>classpath:mvc.xml</param-value>
        </init-param>
         <!--前端控制器本质是一个servlet，其会在第一次被访问时加载--> 
         <!--该配置选项会使前端控制器在服务器启动时就加载，且值越小越先加载--> 
        <load-on-startup>1</load-on-startup>
      </servlet>
      <!--配置前端控制器要处理的请求映射，其会将匹配的请求都拦截-->  
      <servlet-mapping>
        <servlet-name>dispatcherServlet</servlet-name>
        <!--
    		/ 表示拦截所有请求，但是不会拦截*.jsp的请求
    		/* 表示拦截所有类型的请求，包括*.jsp的请求
    	-->  
        <url-pattern>/</url-pattern>
      </servlet-mapping>
    </web-app>
    ```

    `web.xml`文件配置细节：

    - spring配置文件的位置配置

      如果不配置该项，springmvc默认会去寻找`/WEB-INF/前端控制器名-servlet.xml`文件

    - 前端控制器要处理的请求映射配置

      - `<url-pattern>`标签的值为`/`

        表示拦截所有请求，但是不会拦截`*.jsp`的请求

        - 原因
          - tomcat下的每个项目的`web.xml`都会继承tomcat服务器的`web.xml`的配置
          - 在tomcat服务器的`web.xml`的配置中有一个`DefaultServlet`，其`<url-pattern>`标签的值为`/`，用来处理所有的静态资源请求，而当前项目的`web.xml`中前端控制器的`<url-pattern>`标签的值也为`/`，覆盖了服务器的配置，从而禁用了`DefaultServlet`，所有的静态资源请求都会进入前端控制器中，而前端控制器中并没有处理静态资源请求的方法，自然就会被拦截
          - 在tomcat服务器的`web.xml`的配置中有一个`JspServlet`，其`<url-pattern>`标签的值为`*.jsp`，用来处理所有的`jsp`请求，而当前项目的`web.xml`并没有覆盖该配置，所以`*.jsp`的请求都会进入`JspServlet`中处理

      - `<url-pattern>`标签的值为`/*`

        表示拦截所有类型的请求，包括`*.jsp`的请求

  - `MyController.class`

    ```java
    package controller;
    
    import org.springframework.stereotype.Controller;
    import org.springframework.web.bind.annotation.RequestMapping;
    
    //@Controller注解标识该类是一个控制器，可以处理请求
    @Controller
    public class MyController {
        //@RequestMapping注解会匹配传来的请求映射，如果匹配，则使用该方法处理该请求
        //此处会处理项目目录下的hello请求
        @RequestMapping("/hello")
        public String toIndex(){
            //返回要前往的目标页面的地址，springmvc会在视图解析器中对该字符串进行拼接
            return "index";
        }
    }
    ```

  - `mvc.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    	<!--开启包扫描-->
        <context:component-scan base-package="controller"/>
    
        <!--配置视图解析器-->
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <!--视图解析器会将处理请求映射方法的返回值进行拼接-->
            <!--最终的前往的目标页面地址为/WEB-INF/pages/index.jsp-->
            <!--拼接前缀-->
            <property name="prefix" value="/WEB-INF/pages/"/>
            <!--拼接后缀-->
            <property name="suffix" value=".jsp"/>
        </bean>
    </beans>
    ```

  - `index.jsp`

    ```jsp
    <html>
    <body>
    <h2>Hello World!</h2>
    </body>
    </html>
    ```

- 简单示例的运行流程

  - 客户端点击链接，发送`hello`请求
  - 请求进入tomcat服务器，根据配置信息，前端控制器会收到该请求但不拦截
  - 前端控制器根据请求的地址会去寻找与该地址相匹配的`@RequestMapping`注解
  - 一旦寻找到对应的目标控制器类和目标方法，前端控制器就会利用反射执行目标类的目标方法
  - 目标方法完成后，其返回值会进入视图解析器中进行拼串处理得到完整的目标页面地址
  - 前端控制器得到完整的目标页面地址后，通过**转发**前往该页面

## 2.请求映射

### 2.1@RequestMapping注解

- 作用

  告诉SpingMVC，该方法/类是用来处理什么请求

- 标注位置

  - 类定义处

    为当前类下的所有方法提供初步的请求映射信息，该映射信息是相对于WEB应用的根目录

  - 方法处

    提供进一步的细分映射信息，该映射信息相对于类定义处的映射信息（如果类定义处未标注`@RequestMapping`注解，则相对于WEB应用的根目录）

- 属性

  - `value`

    `String[]`类型，用于提供请求映射信息

  - `method`

    `RequestMethod[]`，用于限定请求方式，默认什么请求方式都可以

    - 请求方式
      - `RequestMethod.GET`
      - `RequestMethod.POST`
      - `RequestMethod.PUT`
      - `RequestMethod.DELETE`
      - `RequestMethod.PATCH`
      - `RequestMethod.HEAD`
      - `RequestMethod.OPTIONS`
      - `RequestMethod.TRACE`

  - `params`

    `String[]`类型，用于规定请求参数

    - 举例

      - `params={"username"}`

        请求中必须带了`username`参数，才能匹配

      - `params={"!username"}`

        请求中必须没带`username`参数，才能匹配

      - `params={"username=123"}`

        请求中必须带了`username`参数，并且其值必须为123，才能匹配

  - `headers`

    `String[]`类型，用于规定请求头

  - `consumes`

    `String[]`类型，用于规定请求头中的`Content-Type`，只接受内容类型是xxx的请求

  - `produces`

    `String[]`类型，告诉浏览器返回的内容类型是什么，即给响应头中加上`Content-Type`

- `Ant`风格的请求映射

  - Ant风格

    是请求路径的一种匹配方式，`@RequestMapping`支持Ant风格的请求映射

  - Ant通配符

    - `?`

      匹配任何单字符

    - `*`

      匹配0或者任意数量的字符，只匹配一层路径

    - `**`
      匹配0或者多层路径

  - 实战

    - `?`演示

      ```java
      @Controller
      public class MyController {
          //可以匹配路径/hello01、/hello02、...、/hello0N
          @RequestMapping(value = "/hello0?")
          public String toIndex(){
              return "index";
          }
      }
      ```

    - `*`演示

      ```java
      @Controller
      public class MyController {
          //可以匹配路径/a/hello0、/abc/hello0213等
          @RequestMapping(value = "/a*/hello0*")
          public String toIndex(){
              return "index";
          }
      }
      ```

    - `**`演示

      ```java
      @Controller
      public class MyController {
          //可以匹配路径/a/hello、/a/asd/aaa/hello等
          @RequestMapping(value = "/a/**/hello")
          public String toIndex(){
              return "index";
          }
      }
      ```

- `REST`风格的请求映射

  - `REST`风格

    即（资源）表现层状态转化

    - 资源

      网络上的一个实体，可以用一个**URI**（统一资源定位符）指向它，每种资源对应一个特定的 URI。获取这个资源，访问它的URI就可以，因此 URI 即为每一个资源的独一无二的识别符。

    - 表现层

      把资源具体呈现出来的形式。比如，文本可以用 txt 格式表现，也可以用 HTML 格式、XML 格式、JSON 格式表现，甚至可以采用二进制格式

    - 状态转化

      每发出一个请求，就代表了客户端和服务器的一次交互过程。HTTP协议，是一个无状态协议，即所有的状态都保存在服务器端。因此，如果客户端想要操作服务器，必须通过某种手段，让服务器端发生“状态转化”。而这种转化是建立在表现层之上的，所以就是 “表现层状态转化”

    **总结**

    具体说，就是 HTTP 协议里面，四个表示操作方式的动词：GET、POST、PUT、DELETE。
    它们分别对应四种基本操作：**GET 用来获取资源，POST 用来新建资源，PUT 用来更新资源，DELETE 用来删除资源**

  - `REST`风格环境搭建

    由于从页面上只能发起`GET`和`POST`请求，无法发起`PUT`和`DELETE`请求，因此需要做一些转换操作：

    - 在`web.xml`文件中配置过滤器`HiddenHttpMethodFilter`，其根据传来的请求信息，将`POST`请求转换为`PUT`和`DELETE`请求
    - 在页面文件中编写一个以`POST`方式提交的表单，表单项中携带一个名为`_method`，值为`PUT`/`DELETE`的参数

  - 实战

    - 在`web.xml`文件中配置过滤器`HiddenHttpMethodFilter`

      ```xml
      <filter>
        <filter-name>hiddenHttpMethodFilter</filter-name>
        <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
      </filter>
      <filter-mapping>
        <filter-name>hiddenHttpMethodFilter</filter-name>
        <!--对所有请求都进行过滤处理-->  
        <url-pattern>/*</url-pattern>
      </filter-mapping>
      ```

      过滤器`HiddenHttpMethodFilter`的底层源码：

      ```java
      public class HiddenHttpMethodFilter extends OncePerRequestFilter {
          public static final String DEFAULT_METHOD_PARAM = "_method";
          //默认会从传入的参数中取名为_method的参数的值
          private String methodParam = "_method";
      
          public HiddenHttpMethodFilter() {
          }
      
          public void setMethodParam(String methodParam) {
              Assert.hasText(methodParam, "'methodParam' must not be empty");
              this.methodParam = methodParam;
          }
      
          protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
              //从传入的参数中取名为_method的参数的值
              String paramValue = request.getParameter(this.methodParam);
              //如果请求的方法是POST并且参数_method有值
              if ("POST".equals(request.getMethod()) && StringUtils.hasLength(paramValue)) {
                  //则将_method的参数的值变为大写
                  String method = paramValue.toUpperCase(Locale.ENGLISH);
                  //然后将传入的请求进行包装，把请求的方法变为大写的_method的参数的值
                  HttpServletRequest wrapper = new HiddenHttpMethodFilter.HttpMethodRequestWrapper(request, method);
                  filterChain.doFilter(wrapper, response);
              } else {
                  filterChain.doFilter(request, response);
              }
      
          }
      
          private static class HttpMethodRequestWrapper extends HttpServletRequestWrapper {
              private final String method;
      
              public HttpMethodRequestWrapper(HttpServletRequest request, String method) {
                  super(request);
                  //改变传入的请求的方法
                  this.method = method;
              }
      
              public String getMethod() {
                  return this.method;
              }
          }
      }
      ```

    - 编写页面表单

      ```jsp
      <!--高版本的tomcat不允许jsp发送的请求被转化为put和delete请求，所以会报405错误，因此应该设置isErrorPage为true-->
      <%@page language= "java" contentType= "text/html; charset=utf-8" pageEncoding= "utf-8" isErrorPage="true"%>
      <html>
      <body>
      <h2>Hello World!</h2>
      <!--表单项中携带一个名为_method，值为PUT/DELETE的参数-->
      <!--post请求-->
      <form action="book/1" method="post">
          <input type="submit" value="添加book1">
      </form>
      <!--put请求-->
      <form action="book/1" method="post">
          <!--该项用于给过滤器将post请求转化为put请求-->
          <input name="_method" value="PUT">
          <input type="submit" value="更新book1">
      </form>
      <!--delete请求-->    
      <form action="book/1" method="post">
          <!--该项用于给过滤器将post请求转化为delete请求-->
          <input name="_method" value="DELETE">
          <input type="submit" value="删除book1">
      </form>
      <!--get请求-->    
      <a href="book/1">获取book1</a>
      </body>
      </html>
      ```

### 2.2@PathVariable注解

- 作用

  可以将URL中占位符参数的值绑定到控制器处理方法的参数中

- 实战

  ```java
  @Controller
  public class MyController {
      //{}中的占位符page_num可以接收请求url中对应路径的值
      @RequestMapping(value = "/page/{page_num}")
      //传入占位符，@PathVariable注解可以将该占位符的值绑定到参数page_num上
      public String toIndex(@PathVariable("page_num") String page_num){
          System.out.println(page_num);
          return "index";
      }
  }
  ```

## 3.请求处理

### 4.1@RequestParam注解

- 作用

  用于获取请求参数

  **补充：**非`@RequestParam`注解获取请求参数，需要给方法添加一个和请求参数名相同的参数，这个参数会接收请求参数的值（如果请求无参数，则该参数值为`null`）

- 属性

  - `value`

    `String`类型，要获取的请求参数的名字

  - `required`

    `boolean`类型，用于规定该请求参数是否必须携带，默认为`true`（如果为`true`，但是请求并未携带该参数则报错）

  - `defaultValue`

    `String`类型，如果请求未携带指定参数，则会用该值为方法参数填充默认值

- 实战

  ```java
  @Controller
  public class MyController {
      @RequestMapping("/test")
      /**
      * 当请求url为/test时，参数un的值为potato
      * 当请求url为/test?username=aaa时，参数un的值为aaa
      *
  	*/
      public String test(@RequestParam(value = "username",required = false,defaultValue = "potato")String un){
          System.out.println(un);
          return "index";
      }
  }
  ```

### 4.2@RequestHeader注解

- 作用

  用于获取请求头

- 属性

  同`@RequestParam`注解属性类似

### 4.3@CookieValue注解

- 作用

  用于获取Cookie值

- 属性

  同`@RequestParam`注解属性类似

### 4.4传入POJO

如果处理请求映射的方法的参数是一个POJO，SrpingMVC就会去请求参数中寻找与该POJO属性名相同的参数，并把值映射到POJO的属性上（如果没有对应的参数，则绑定`null`）

- `Book.class`（POJO）

  ```java
  package pojo;
  
  public class Book {
      private String name;
      private String author;
      private Integer price;
  
      @Override
      public String toString() {
          return "Book{" +
                  "name='" + name + '\'' +
                  ", author='" + author + '\'' +
                  ", price=" + price +
                  '}';
      }
  
      public String getName() {
          return name;
      }
  
      public void setName(String name) {
          this.name = name;
      }
  
      public String getAuthor() {
          return author;
      }
  
      public void setAuthor(String author) {
          this.author = author;
      }
  
      public Integer getPrice() {
          return price;
      }
  
      public void setPrice(Integer price) {
          this.price = price;
      }
  }
  ```

- `MyController.class`

  ```java
  @Controller
  public class MyController {
  
      @RequestMapping("/")
      public String index(){
          return "index";
      }
  
      @RequestMapping(value = "/book",method = RequestMethod.POST)
      //方法参数是一个pojo，springmvc会从请求参数中寻找对应参数对该pojo进行封装
      public String addBook(Book book){
          System.out.println(book);
          return "index";
      }
  }
  ```

- `index.jsp`

  ```jsp
  <%@page language= "java" contentType= "text/html; charset=utf-8" pageEncoding= "utf-8" isErrorPage="true"%>
  <html>
      <body>
          <h2>Hello World!</h2>
          <form action="book" method="post">  
              <!--要提交的请求参数名需要和pojo属性名一致-->  
              书名：<input type="text" name="name">   
              作者: <input type="text" name="author">  
              价格: <input type="text" name="price">  
              <input type="submit" value="添加book1">
          </form>
      </body>
  </html>
  ```

### 4.5传入原生API

SpringMVC支持在处理请求映射的方法上传入原生API（`HttpServletRequest`、`HttpSession`等）

- `MyController.class`

  ```java
  @Controllerpublic class MyController {  
      @RequestMapping("/")  
      public String index(){    
          return "index"; 
      }   
      @RequestMapping(value = "/book")
      //传入原生APIHttpSession对象 
      public String addBook(HttpSession httpSession){ 
          //向Session域中设置值       
          httpSession.setAttribute("username","potato");   
          return "index";   
      }
  }
  ```

- `index.jsp`

  ```jsp
  <%@page language= "java" contentType= "text/html; charset=utf-8" pageEncoding= "utf-8" isErrorPage="true"%>
  <html>
      <body>
          <h2>Hello World!</h2>
          <h2>
              <!--取出session域中的值-->   
              <%=session.getAttribute("username")%>
          </h2>
          <a href="book">dddd</a>
      </body>
  </html>
  ```

### 4.6解决中文乱码问题

- 原生API解决

  - 请求乱码

    - POST请求

      在第一次获取请求参数前设置`request.setCharacterEncoding("UTF-8");`

    - GET请求

      在服务器的配置`server.xml`中，对相应端口配置`URIEncoding="UTF-8"`

  - 响应乱码

    在返回响应前设置`response.setCharacterEncoding("UTF-8")`

- SpringMVC解决

  SpringMVC为我们配备了一个字符编码过滤器`CharacterEncodingFilter`，能对传入的请求和返回的响应设置相应的字符编码

  - 配置字符编码过滤器`CharacterEncodingFilter`

    ```xml
    <!DOCTYPE web-app PUBLIC
     "-//Sun Microsystems, Inc.//DTD Web Application 2.3//EN"
     "http://java.sun.com/dtd/web-app_2_3.dtd" >
    
    <web-app>
      <display-name>Archetype Created Web Application</display-name>
       <!--配置字符编码过滤器--> 
      <filter>
        <filter-name>characterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
           <!--配置要为请求设置的编码--> 
          <param-name>encoding</param-name>
          <param-value>UTF-8</param-value>
        </init-param>
        <init-param>
           <!--配置forceEncoding属性，默认为false，如果为true，则会对响应也设置相同的编码--> 
          <param-name>forceEncoding</param-name>
          <param-value>true</param-value>
        </init-param>
      </filter>
       <!--配置字符编码过滤器的映射--> 
      <filter-mapping>
        <filter-name>characterEncodingFilter</filter-name>
          <!--配置过滤所有请求-->
        <url-pattern>/*</url-pattern>
      </filter-mapping>
        <servlet-name>dispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
          <param-name>contextConfigLocation</param-name>
          <param-value>classpath:mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
      </servlet>
      <servlet-mapping>
        <servlet-name>dispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>
      </servlet-mapping>
    </web-app>
    ```

    **注意：**字符编码过滤器应该配置在其他过滤器之前，保证传入的请求最先被设置编码，否则依旧可能出现乱码问题

  - `CharacterEncodingFilter`源码

    ```java
    public class CharacterEncodingFilter extends OncePerRequestFilter {
       //需要为请求设置的编码
       private String encoding;
       //标志是否为响应设置编码
       private boolean forceEncoding = false;
       ...
    
       @Override
       protected void doFilterInternal(
             HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
             throws ServletException, IOException {
    	 
          if (this.encoding != null && (this.forceEncoding || request.getCharacterEncoding() == null)) {
              //为请求设置编码
             request.setCharacterEncoding(this.encoding);
              //如果属性forceEncoding为true
             if (this.forceEncoding) {
                 //则为响应也设置相同的编码
                response.setCharacterEncoding(this.encoding);
             }
          }
          filterChain.doFilter(request, response);
       }
    
    }
    ```

## 5.数据输出

数据输出，即SpringMVC给页面携带数据

### 5.1传入Map、ModelMap和Model

除了传入原生API，可以给处理请求映射的方法传入合适的参数，SpringMVC会通过这些参数为返回的页面携带数据

- 传入`Map`对象

  ```java
  @Controller
  public class MyController {
  
      @RequestMapping("/")
      public String index(){
          return "index";
      }
  
      @RequestMapping(value = "/handle01")
      //给处理请求映射的方法传入一个Map对象
      public String handle01(Map<String,Object> map){
          //为这个Map对象增加键值对
          //这个Map对象中的键值对最终会被放到请求域中并返回给页面，页面可以从请求域中获取这些数据
          map.put("username","handle01");
          return "index";
      }
  }
  ```

- 传入`ModelMap`对象

  ```java
  @Controller
  public class MyController {
  
      @RequestMapping("/")
      public String index(){
          return "index";
      }
  
      @RequestMapping(value = "/handle02")
      //给处理请求映射的方法传入一个ModelMap对象
      public String handle02(ModelMap map){
          //为这个ModelMap对象增加键值对
          //这个ModelMap对象中的键值对最终会被放到请求域中并返回给页面，页面可以从请求域中获取这些数据
          map.put("username","handle02");
          return "index";
      }
  }
  ```

- 传入`Model`对象

  ```java
  @Controllerpublic 
  class MyController { 
      @RequestMapping("/")  
      public String index(){  
          return "index";   
      }       
      @RequestMapping(value = "/handle03") 
      //给处理请求映射的方法传入一个Model对象  
      public String handle03(Model map){ 
          //可以调用addAttribute方法向Model对象中传入数据
          //这个Model对象中保存的数据最终会被放到请求域中并返回给页面，页面可以从请求域中获取这些数据
          map.addAttribute("username","handle03");    
          return "index"; 
      }
  }
  ```

**总结**

- `ModelMap`内部继承自`LinkedHashMap`
- 传入的`Map`、`ModelMap`和`Model`对象的实际类型都是`BindingAwareModelMap`，其继承自`ExtendedModelMap`，而`ExtendedModelMap`又继承自`ModelMap`并且实现了`Model`接口
- 向这三种对象中保存数据，实际上就是向`BindingAwareModelMap`对象中保存数据，`BindingAwareModelMap`对象会将数据保存到请求域中并返回给页面

### 5.2使用ModelAndView携带数据

除了给方法传入合适的参数外，还可以改变处理请求映射的方法的返回值，SpringMVC会通过该返回值为返回的页面携带数据

原本String类型的返回值仅仅只是一个视图名，并不会携带任何数据，因此需要使用`ModelAndView`对象

```java
@Controllerpublic class MyController {    
    @RequestMapping("/")   
    public String index(){ 
        return "index";   
    }  
    @RequestMapping(value = "/handle04")
    //方法的返回值是ModelAndView对象，这是一个数据和视图的结合对象  
    public ModelAndView handle04(){    
        ModelAndView mv=new ModelAndView();   
        //设置视图名，即要返回的目标页面  
        mv.setViewName("index");   
        //为页面添加数据，最终也是放入请求域中  
        mv.addObject("username","handle04"); 
        return mv; 
    }
}
```

**总结**

- 与先前普通的`String`类型的返回值相比，`ModelAndView`对象是一个视图和数据的结合体，而`String`类型仅仅是返回一个视图名
- `ModelAndView`对象最终也是将数据存放在请求域中

## 6.视图解析

### 6.1转发

SpringMVC提供了`forward:`前缀用于指定一个转发操作

```java
@Controllerpublic 
class MyController {   
    @RequestMapping("/")  
    public String index(){   
        //注意，视图解析器不会对带有forward:前缀的视图名进行拼串处理   
        //因此使用forward:前缀指定转发操作时，需要写全转发地址   
        return "forward:/WEB-INF/pages/index.jsp"; 
    }
}
```

### 6.2重定向

SpringMVC提供了`redirect:`前缀用于指定一个重定向操作

```java
@Controllerpublic
class MyController { 
    @RequestMapping("/") 
    public String index(Book book){  
        //注意，视图解析器不会对带有redirect:前缀的视图名进行拼串处理
        //因此使用redirect:前缀指定转发操作时，需要写全重定向地址  
        return "redirect:/test.jsp";   
    }
}
```

### 6.3mvc:view-controller标签

如果发送的请求不想通过`controller`，只想直接地跳转到目标页面，这时候就可以使用`mvc:view-controller`标签，将请求直接映射到目标页面

```xml
<?xml version="1.0" encoding="UTF-8"?><beans xmlns="http://www.springframework.org/schema/beans"       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"       xmlns:context="http://www.springframework.org/schema/context"       xmlns:mvc="http://www.springframework.org/schema/mvc"       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">  
    <context:component-scan base-package="controller"/>   
    <!--		
		属性path，表示请求的路径	
 		属性view-name，表示请求要映射到的目标的页面	
	-->   
    <mvc:view-controller path="/" view-name="index"/> 
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver"> 
        <property name="prefix" value="/WEB-INF/pages/"/>  
        <property name="suffix" value=".jsp"/> 
    </bean>
</beans>
```

**注意：配置该标签后，所有带@Controller注解下的请求映射都无法解析**

**解决办法：添加`<mvc:annotation-driven/>`标签，开启注解驱动**

## 7.SpringMVC九大组件初始化细节

SpringMVC将处理逻辑细分为九大组件，对应着` DispatcherServlet `类中的九个成员变量，每一个组件都会完成SpringMVC相应的重要功能

- 九大组件

  ```java
  //文件上传请求解析器（解析文件上传请求）
  private MultipartResolver multipartResolver;
  //区域信息解析器（解析区域信息，用于国际化配置）
  private LocaleResolver localeResolver;
  //主题解析器（用于主题切换）
  private ThemeResolver themeResolver;
  //保存HandlerMapping对象的列表
  private List<HandlerMapping> handlerMappings;
  //保存处理器适配器的列表
  private List<HandlerAdapter> handlerAdapters;
  //异常解析器
  private List<HandlerExceptionResolver> handlerExceptionResolvers;
  //请求到视图名转换器（用于处理无返回值的请求映射方法，将请求源地址作为视图名）
  private RequestToViewNameTranslator viewNameTranslator;
  //FlashMap管理器（用于重定向携带数据）
  private FlashMapManager flashMapManager;
  //视图解析器
  private List<ViewResolver> viewResolvers;
  ```

- 初始化细节

  ` DispatcherServlet `类继承自`FrameworkServlet`，并重写了其`onRefresh()`方法，` DispatcherServlet `类将九大组件的初始化全部放在`onRefresh`方法中，当Spring IOC容器一创建，就会调用该方法，初始化这九大组件

  - `onRefresh`方法源码

    ```java
    protected void onRefresh(ApplicationContext context) {  
        //onRefresh方法内部将初始化逻辑委托给了initStrategies方法，并传入当前ioc容器   
        initStrategies(context);
    }
    ```
  
  - `initStrategies`方法源码
  
    ```java
    protected void initStrategies(ApplicationContext context) {
        //每一个组件的初始化都对应一个方法
       initMultipartResolver(context);
       initLocaleResolver(context);
       initThemeResolver(context);
       initHandlerMappings(context);
       initHandlerAdapters(context);
       initHandlerExceptionResolvers(context);
       initRequestToViewNameTranslator(context);
       initViewResolvers(context);
       initFlashMapManager(context);
    }
    ```
  
  - 以`handlerMappings`组件初始化的方法为例
  
    ```java
    private void initHandlerMappings(ApplicationContext context) {
        //先将当前组件置为null
       this.handlerMappings = null;
    	//DispatcherServlet类的detectAllHandlerMappings属性默认为true
       if (this.detectAllHandlerMappings) {
           //从Spring容器中寻找所有HandlerMapping类型的实例并放置到一个Map对象中
          Map<String, HandlerMapping> matchingBeans =
                BeanFactoryUtils.beansOfTypeIncludingAncestors(context, HandlerMapping.class, true, false);
           //如果Spring容器中有这些HandlerMapping类型的实例
          if (!matchingBeans.isEmpty()) {
              //则直接将这些实例放到一个列表中来初始化handlerMappings组件中
             this.handlerMappings = new ArrayList<HandlerMapping>(matchingBeans.values());
             //排序
             AnnotationAwareOrderComparator.sort(this.handlerMappings);
          }
       }
        //否则
       else {
          try {
              //HANDLER_MAPPING_BEAN_NAME是一个常量，值为handlerMapping
              //尝试从容器中获取id为handlerMapping，类型为HandlerMapping的bean实例
             HandlerMapping hm = context.getBean(HANDLER_MAPPING_BEAN_NAME, HandlerMapping.class);
              //并将该实例转化成列表来初始化handlerMappings组件
             this.handlerMappings = Collections.singletonList(hm);
          }
          catch (NoSuchBeanDefinitionException ex) {
             // Ignore, we'll add a default HandlerMapping later.
          }
       }
    
       //如果上述两步中都无法找到一个HandlerMapping对象来初始化handlerMappings组件
       if (this.handlerMappings == null) {
          //则传入当前ioc容器和HandlerMapping的Class对象，使用默认策略来初始化该组件
          this.handlerMappings = getDefaultStrategies(context, HandlerMapping.class);
          if (logger.isDebugEnabled()) {
             logger.debug("No HandlerMappings found in servlet '" + getServletName() + "': using default");
          }
       }
    }
    ```
  
    - `handlerMappings`组件初始化的默认策略`getDefaultStrategies`方法
  
      ```java
      protected <T> List<T> getDefaultStrategies(ApplicationContext context, Class<T> strategyInterface) {
          //获取传入的Class对象对应的全限定名
          //此处为org.springframework.web.servlet.HandlerMapping
         String key = strategyInterface.getName();
         /**
         * 静态属性defaultStrategies是Properties类型，其随DispatcherServlet的创建，就会    * 在静态块中通过加载位于类路径下的DispatcherServlet.properties文件来完成初始化
         */
         //以传入的Class对象对应的全限定名为key，从DispatcherServlet.properties文件中获取相应的值，这些值都为类的全限定名
          //此处为org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping,org.springframework.web.servlet.mvc.annotation.DefaultAnnotationHandlerMapping
         String value = defaultStrategies.getProperty(key);
          //如果有值，则循环遍历这些值，并通过反射创建这些值对应的类实例，然后保存在一个列表中返回
         if (value != null) {
            String[] classNames = StringUtils.commaDelimitedListToStringArray(value);
            List<T> strategies = new ArrayList<T>(classNames.length); 
            for (String className : classNames) {
               try {
                  Class<?> clazz = ClassUtils.forName(className, DispatcherServlet.class.getClassLoader());
                  Object strategy = createDefaultStrategy(context, clazz);
                  strategies.add((T) strategy);
               }
               catch (ClassNotFoundException ex) {
                  throw new BeanInitializationException(
                        "Could not find DispatcherServlet's default strategy class [" + className +
                              "] for interface [" + key + "]", ex);
               }
               catch (LinkageError err) {
                  throw new BeanInitializationException(
                        "Error loading DispatcherServlet's default strategy class [" + className +
                              "] for interface [" + key + "]: problem with class file or dependent class", err);
               }
            }
            return strategies;
         }
          //如果没有对应的值
         else {
             //则返回空列表
            return new LinkedList<T>();
         }
      }
      ```
  
    **总结**
  
    - SpringMVC九大组件的初始化都交由`DispatcherServlet `的`onRefresh`方法处理，其会在Spring IOC容器初始化时被调用
    - 每个组件初始化步骤大致如下：
      - 首先，从Spring IOC容器中寻找是否有相应类型和`id`的bean实例能够初始化该组件
        - 如果有，则使用该bean实例初始化该组件
        - 否则，按照要寻找的类型的全限定名，从类路径下Spring自带的`DispatcherServlet.properties`配置文件中查找是否有与之相匹配的属性名
          - 如果有，获取该属性值（用于初始化组件的类的全限定名），通过反射得到对应的类对象并保存到一个列表中来初始化组件
          - 否则，用空列表来初始化组件

## 8.SpringMVC源码解析

### 8.1DispatcherServlet继承树分析

`DispatcherServlet`类的继承树及方法调用逻辑图如下：

![image-20210622160719499](/static/img/image-20210622160719499.png)

**总结**

前端控制`DispatcherServlet`类本质上也是一个`Servlet`，当请求方法（以`GET`请求为例）进入前端控制器后：

- 首先会去寻找`doGet`方法，最终调用其父类`FrameworkServlet`的`doGet`方法
- 父类`FrameworkServlet`的`doGet`方法内部将处理请求的逻辑委托给`processRequest`方法
- 而在`processRequest`方法内部又将处理请求的逻辑委托给`DispatcherServlet`类重写的`doService`方法
- 最终，在`DispatcherServlet`类重写的`doService`方法内部将处理请求的逻辑委托给了`doDispatch`方法

### 8.2doDispatch方法内部逻辑

`doDispatch`方法源码：

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    //传入的请求
   HttpServletRequest processedRequest = request;
    //处理器执行链，包含了拦截器链和能处理传入请求的控制器类的相关信息
   HandlerExecutionChain mappedHandler = null;
    //标识传入的请求是否是文件上传请求
   boolean multipartRequestParsed = false;

   WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

   try {
      //ModelAndView对象，最终要返回的视图和数据
      ModelAndView mv = null;
      Exception dispatchException = null;

      try {
          //检查传入的请求是否是文件上传请求
          		//如果是，则将该请求包装成能处理文件上传的请求
          		//否则，返回原请求
         processedRequest = checkMultipart(request);
          //更新multipartRequestParsed标识
         multipartRequestParsed = (processedRequest != request);

         //获取能处理当前请求的处理器执行链
         mappedHandler = getHandler(processedRequest);
          //如果处理器执行链为null或者没有能处理当前请求的控制器类
         if (mappedHandler == null || mappedHandler.getHandler() == null) {
             //则返回错误页面并结束方法
            noHandlerFound(processedRequest, response);
            return;
         }

         //根据能处理当前请求的控制器类得到对应的处理器适配器
         HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

         String method = request.getMethod();
         boolean isGet = "GET".equals(method);
         if (isGet || "HEAD".equals(method)) {
            long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
            if (logger.isDebugEnabled()) {
               logger.debug("Last-Modified value for [" + getRequestUri(request) + "] is: " + lastModified);
            }
            if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
               return;
            }
         }

         if (!mappedHandler.applyPreHandle(processedRequest, response)) {
            return;
         }

         //处理器适配器执行对应的控制器类中的请求映射方法，并将方法的返回结果包装成一个ModelAndView对象
         mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

         if (asyncManager.isConcurrentHandlingStarted()) {
            return;
         }
		 //如果对应的请求映射方法返回值为void，则为其配置默认的视图名（发送请求的源地址），并保存到ModelAndView对象中
         applyDefaultViewName(processedRequest, mv);
         mappedHandler.applyPostHandle(processedRequest, response, mv);
      }
      catch (Exception ex) {
         dispatchException = ex;
      }
       //根据最终封装的ModelAndView对象中保存的视图名，转发到相应的页面，并将ModelAndView对象中保存的数据放到请求域中
      processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
   }
   catch (Exception ex) {
      triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
   }
   catch (Error err) {
      triggerAfterCompletionWithError(processedRequest, response, mappedHandler, err);
   }
   finally {
      if (asyncManager.isConcurrentHandlingStarted()) {
         // Instead of postHandle and afterCompletion
         if (mappedHandler != null) {
            mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
         }
      }
      else {
         // Clean up any resources used by a multipart request.
         if (multipartRequestParsed) {
            cleanupMultipart(processedRequest);
         }
      }
   }
}
```

**总结**

- 根据当前请求，调用`getHandler`方法，获取能处理当前请求的处理器执行链
- 根据处理器执行链中包含的能处理当前请求的控制器类，调用`getHandlerAdapter`方法，得到对应的处理器适配器
- 调用处理器适配器的`handle`方法，来执行控制器类中相应能处理当前请求映射的方法，并将方法的返回值包装成一个`ModelAndView`对象
- 根据`ModelAndView`对象中包含的视图名和数据，调用`processDispatchResult`方法，转发到对应页面，并将数据放到请求域中

### 8.3getHandler方法细节

`getHandler`方法源码

```java
protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
   /**
   * DispatcherServlet类的成员变量handlerMappings保存了多个HandlerMapping对象
   * 而HandlerMapping对象中的handlerMap属性保存了每一个控制器类能处理的所有请求映射信息
   * 循环遍历DispatcherServlet类的成员变量handlerMappings，获取每一个HandlerMapping对象
   */
   for (HandlerMapping hm : this.handlerMappings) {
      if (logger.isTraceEnabled()) {
         logger.trace(
               "Testing handler map [" + hm + "] in DispatcherServlet with name '" + getServletName() + "'");
      }
      //传入当前请求，调用HandlerMapping对象的getHandler方法，去handlerMap属性中查找能处理当前请求映射的控制器类，最后包装成一个HandlerExecutionChain对象返回
      HandlerExecutionChain handler = hm.getHandler(request);
       //如果找到了，方法结束，返回相应的HandlerExecutionChain对象
      if (handler != null) {
         return handler;
      }
      //否则继续循环遍历 
   }
   return null;
}
```

**总结**

- 服务器启动时，ioc容器初始化并创建前端控制器`DispatcherServlet`对象，然后根据注解扫描配置，前往相应的包中扫描所有`@Controller`注解的类实例化并注册到容器中，然后扫描这些类下的所有的`@RequestMapping`注解，获取到所有的请求映射信息
- 将这些请求映射信息作为`key`，其所在的控制器类对象作为`value`保存在相应的`HandlerMapping`对象（基于注解配置，则保存在`DefaultAnnotationHandlerMapping`对象；基于xml配置，则保存在`BeanNameUrlHandlerMapping`对象）的`handlerMap`属性中
- 最后通过解析传入的请求，获取到请求的映射信息，在每一个`HandlerMapping`对象的`handlerMap`属性中查找，如果匹配，则将请求映射信息对应的的控制器类包装成`HandlerExecutionChain`对象并返回；如果查找不到，则返回`null`

### 8.4getHandlerAdapter方法细节

`getHandlerAdapter`方法源码

```java
protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {  
    /**  
    * DispatcherServlet类的成员变量handlerAdapters保存了多个handlerAdapter对象，其support方	
    * 法实现如下：  
    *	1.HttpRequestHandlerAdapter对象  
    *      需要目标控制器类实现HttpRequestHandler接口，才能进行适配  
    *	2.SimpleControllerHandlerAdapter对象   
    *      需要目标控制器类实现Controller接口，才能进行适配  
    *	3.AnnotationMethodHandlerAdapter对象  
    *      仅需要目标控制器类中有方法即可   
    */          
    //遍历每一个handlerAdapter对象 
    for (HandlerAdapter ha : this.handlerAdapters) {  
        if (logger.isTraceEnabled()) {       
            logger.trace("Testing handler adapter [" + ha + "]");  
        }     
        //判断当前目标控制器类是否与之适配   
        //如果是，则直接返回当前handlerAdapter对象   
        //否则，继续遍历		   
        if (ha.supports(handler)) {  
            return ha;    
        }  
    }   throw new ServletException("No adapter for handler [" + handler +         "]: The DispatcherServlet configuration needs to include a HandlerAdapter that supports this handler");
}
```

**总结**

- SpringMVC中有三个处理器适配器：

  * `HttpRequestHandlerAdapter`对象

    需要目标控制器类实现`HttpRequestHandler`接口，才能进行适配

  * `SimpleControllerHandlerAdapter`对象

    需要目标控制器类实现`Controller`接口，才能进行适配

  * `AnnotationMethodHandlerAdapter`对象

    仅需要目标控制器类中有方法即可

- 循环遍历每一个`HandlerAdapter`对象，直到找到与对当前目标控制器类适配的`HandlerAdapter`对象并返回，否则抛出异常

### 8.5处理器适配器的handle方法

- 处理器适配器的`handle`方法源码

  ```java
  public ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
     //获取控制器类对应的Class对象
     Class<?> clazz = ClassUtils.getUserClass(handler);
     //根据控制器类的Class对象，从缓存中判断该控制器类是否标注了SessionAttributes注解
     Boolean annotatedWithSessionAttributes = this.sessionAnnotatedClassesCache.get(clazz);
      //如果缓存未命中
     if (annotatedWithSessionAttributes == null) {
         //则查询该类是否标注了SessionAttributes注解
        annotatedWithSessionAttributes = (AnnotationUtils.findAnnotation(clazz, SessionAttributes.class) != null);
         //如果是，则以该Class对象为key，该注解为value放到缓存中
        this.sessionAnnotatedClassesCache.put(clazz, annotatedWithSessionAttributes);
     }
  
     if (annotatedWithSessionAttributes) {
        checkAndPrepare(request, response, this.cacheSecondsForSessionAttributeHandlers, true);
     }
     else {
        checkAndPrepare(request, response, true);
     }
  
     // Execute invokeHandlerMethod in synchronized block if required.
     if (this.synchronizeOnSession) {
        HttpSession session = request.getSession(false);
        if (session != null) {
           Object mutex = WebUtils.getSessionMutex(session);
           synchronized (mutex) {
              return invokeHandlerMethod(request, response, handler);
           }
        }
     }
     //最后handle方法将目标方法的执行逻辑委托给了invokeHandlerMethod方法
     return invokeHandlerMethod(request, response, handler);
  }
  ```

- 处理器适配器的`invokeHandlerMethod`方法源码

  ```java
  protected ModelAndView invokeHandlerMethod(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
     //根据传入的控制器类，得到一个包含该控制器类的所有方法信息的方法解析器
     ServletHandlerMethodResolver methodResolver = getMethodResolver(handler);
     //根据传入的请求，从方法解析器中找到一个能处理该请求的方法 
     Method handlerMethod = methodResolver.resolveHandlerMethod(request);
     //根据方法解析器，得到一个方法执行器
     ServletHandlerMethodInvoker methodInvoker = new ServletHandlerMethodInvoker(methodResolver);
      //将传入的HttpServletRequest对象和HttpServletResponse对象包装成一个			ServletWebRequest对象
     ServletWebRequest webRequest = new ServletWebRequest(request, response);
     //创建一个隐含模型，BindingAwareModelMap对象，用于保存要传回页面的数据 
     ExtendedModelMap implicitModel = new BindingAwareModelMap();
     //调用方法执行器，执行目标方法，并将返回值保存到临时变量result中
     Object result = methodInvoker.invokeHandlerMethod(handlerMethod, handler, webRequest, implicitModel);
     //调用方法执行器的getModelAndView方法，将方法的返回值包装成一个ModelAndView对象
     ModelAndView mav =
           methodInvoker.getModelAndView(handlerMethod, handler.getClass(), result, implicitModel, webRequest);
     methodInvoker.updateModelAttributes(handler, (mav != null ? mav.getModel() : null), implicitModel, webRequest);
     return mav;
  }
  ```

  - 方法执行器的`invokeHandlerMethod`方法源码（执行目标方法）

    ```java
    public final Object invokeHandlerMethod(Method handlerMethod, Object handler,
          NativeWebRequest webRequest, ExtendedModelMap implicitModel) throws Exception {
        //为目标方法创建一个执行器
       Method handlerMethodToInvoke = BridgeMethodResolver.findBridgedMethod(handlerMethod);
    ...
         //调用resolveHandlerArguments方法为目标方法的参数绑定值
          Object[] args = resolveHandlerArguments(handlerMethodToInvoke, handler, webRequest, implicitModel);
          if (debug) {
             logger.debug("Invoking request handler method: " + handlerMethodToInvoke);
          }
          //利用反射，令目标方法可访问
          ReflectionUtils.makeAccessible(handlerMethodToInvoke);
          //最后传入控制器类及处理后的参数，调用执行器的invoke方法，利用反射，执行目标方法，并返回目标方法的返回值
          return handlerMethodToInvoke.invoke(handler, args);
       }
    ...
    }
    ```

    - `resolveHandlerArguments`方法源码（为目标方法的参数绑定值）

      ```java
      private Object[] resolveHandlerArguments(Method handlerMethod, Object handler,
            NativeWebRequest webRequest, ExtendedModelMap implicitModel) throws Exception {
        //获取到目标方法所有参数的类型
         Class<?>[] paramTypes = handlerMethod.getParameterTypes();
         //创建一个Object类型数组，用于保存处理后的参数 
         Object[] args = new Object[paramTypes.length];
         //循环遍历每一个参数
         for (int i = 0; i < args.length; i++) {
            MethodParameter methodParam = new SynthesizingMethodParameter(handlerMethod, i);
            methodParam.initParameterNameDiscovery(this.parameterNameDiscoverer);
            GenericTypeResolver.resolveParameterType(methodParam, handler.getClass());
            //保存@RequestParam注解的name属性 
            String paramName = null;
            //保存@RequestHeader注解的name属性
            String headerName = null;
            //标识是否有@RequestBody注解
            boolean requestBodyFound = false;
            //保存@CookieValue注解的name属性
            String cookieName = null;
            //保存@PathVariable注解的value属性 
            String pathVarName = null;
            //保存@ModelAttribute注解的value属性
            String attrName = null; 
            boolean required = false;
            String defaultValue = null;
            boolean validate = false;
            Object[] validationHints = null;
            //用于标注每个参数被标注的注解个数 
            int annotationsFound = 0;
            //获取当前参数标注的所有注解 
            Annotation[] paramAnns = methodParam.getParameterAnnotations();
            //遍历这些注解，并拿到每个注解的信息
            for (Annotation paramAnn : paramAnns) {
               if (RequestParam.class.isInstance(paramAnn)) {
                  RequestParam requestParam = (RequestParam) paramAnn;
                  paramName = requestParam.name();
                  required = requestParam.required();
                  defaultValue = parseDefaultValueAttribute(requestParam.defaultValue());
                  annotationsFound++;
               }
               else if (RequestHeader.class.isInstance(paramAnn)) {
                  RequestHeader requestHeader = (RequestHeader) paramAnn;
                  headerName = requestHeader.name();
                  required = requestHeader.required();
                  defaultValue = parseDefaultValueAttribute(requestHeader.defaultValue());
                  annotationsFound++;
               }
               else if (RequestBody.class.isInstance(paramAnn)) {
                  requestBodyFound = true;
                  annotationsFound++;
               }
               else if (CookieValue.class.isInstance(paramAnn)) {
                  CookieValue cookieValue = (CookieValue) paramAnn;
                  cookieName = cookieValue.name();
                  required = cookieValue.required();
                  defaultValue = parseDefaultValueAttribute(cookieValue.defaultValue());
                  annotationsFound++;
               }
               else if (PathVariable.class.isInstance(paramAnn)) {
                  PathVariable pathVar = (PathVariable) paramAnn;
                  pathVarName = pathVar.value();
                  annotationsFound++;
               }
               else if (ModelAttribute.class.isInstance(paramAnn)) {
                  ModelAttribute attr = (ModelAttribute) paramAnn;
                  attrName = attr.value();
                  annotationsFound++;
               }
               else if (Value.class.isInstance(paramAnn)) {
                  defaultValue = ((Value) paramAnn).value();
               }
               else {
                  Validated validatedAnn = AnnotationUtils.getAnnotation(paramAnn, Validated.class);
                  if (validatedAnn != null || paramAnn.annotationType().getSimpleName().startsWith("Valid")) {
                     validate = true;
                     Object hints = (validatedAnn != null ? validatedAnn.value() : AnnotationUtils.getValue(paramAnn));
                     validationHints = (hints instanceof Object[] ? (Object[]) hints : new Object[]{hints});
                  }
               }
            }
      	  //如果当前参数被标注的注解个数超过1个，则抛出异常
            if (annotationsFound > 1) {
               throw new IllegalStateException("Handler parameter annotations are exclusive choices - " +
                     "do not specify more than one such annotation on the same parameter: " + handlerMethod);
            }
      	  //如果当前参数没有被标注注解，说明是普通参数	
            if (annotationsFound == 0) {
               /**
               * 调用resolveCommonArgument方法来处理普通参数
               *   1.如果定义了自定义参数解析器，则该方法内部会调用自定义参数解析器来处理该参数
               *   2.否则，会判断该参数是否是原生API类型
               *   3.如果都不是，则返回属性UNRESOLVED指向的Object对象，用于标识该参数未解析
               */
               Object argValue = resolveCommonArgument(methodParam, webRequest);
               //如果argValue不是指向UNRESOLVED，说明该参数被解析了
               if (argValue != WebArgumentResolver.UNRESOLVED) {
                  //将argValue的值绑定到该参数上
                  args[i] = argValue;
               }
               //否则，说明该参数未被解析 
               //如果defaultValue不为空
               else if (defaultValue != null) {
                  //将defaultValue的值绑定到该参数上
                  args[i] = resolveDefaultValue(defaultValue);
               }
               //否则 
               else {
                  //获取当前参数的类型 
                  Class<?> paramType = methodParam.getParameterType();
                  //如果当前参数的类型是Model或者Map 
                  if (Model.class.isAssignableFrom(paramType) || Map.class.isAssignableFrom(paramType)) {
                     if (!paramType.isAssignableFrom(implicitModel.getClass())) {
                        throw new IllegalStateException("Argument [" + paramType.getSimpleName() + "] is of type " +
                              "Model or Map but is not assignable from the actual model. You may need to switch " +
                              "newer MVC infrastructure classes to use this argument.");
                     }
                     //则将隐含模型BindingAwareModelMap对象绑定到当前参数上 
                     args[i] = implicitModel;
                  }
                  //如果当前参数的类型是SessionStatus 
                  else if (SessionStatus.class.isAssignableFrom(paramType)) {
                     //则将属性sessionStatus的值绑定到当前参数上 
                     args[i] = this.sessionStatus;
                  }
                  //如果当前参数的类型是HttpEntity
                  else if (HttpEntity.class.isAssignableFrom(paramType)) {
                     //则将HttpEntityRequest解析后的结果绑定到对当前参数上 
                     args[i] = resolveHttpEntityRequest(methodParam, webRequest);
                  }
                  //如果当前参数的类型是Errors 
                  else if (Errors.class.isAssignableFrom(paramType)) {
                     //直接抛出异常 
                     throw new IllegalStateException("Errors/BindingResult argument declared " +
                           "without preceding model attribute. Check your handler method signature!");
                  }
                  //如果当前参数的类型是简单类型的属性 
                  else if (BeanUtils.isSimpleProperty(paramType)) {
                     //令paramName为空串 
                     paramName = "";
                  }
                  //否则，由于当前参数是普通参数，所以令attrName为空串 
                  else {
                     attrName = "";
                  }
               }
            }
      	  //利用先前获得的注解信息，解析传入的请求，调用相应的方法，为参数绑定值
            if (paramName != null) {
               args[i] = resolveRequestParam(paramName, required, defaultValue, methodParam, webRequest, handler);
            }
            else if (headerName != null) {
               args[i] = resolveRequestHeader(headerName, required, defaultValue, methodParam, webRequest, handler);
            }
            else if (requestBodyFound) {
               args[i] = resolveRequestBody(methodParam, webRequest, handler);
            }
            else if (cookieName != null) {
               args[i] = resolveCookieValue(cookieName, required, defaultValue, methodParam, webRequest, handler);
            }
            else if (pathVarName != null) {
               args[i] = resolvePathVariable(pathVarName, methodParam, webRequest, handler);
            }
            /**
            * 如果标了@ModelAttribute注解，attrName为该注解的value值
            * 否则，attrName为空串
            * 总之，无论如何attrName都不会为null，只要上述控制流程未进入，则最后一定会进入该控       * 制流程
            */
            else if (attrName != null) {
               //如果参数是自定义类型，即pojo
               //resolveModelAttribute方法会在内部利用反射创建该pojo的实例，并解析请求中的参数，将参数的值绑定到pojo对应的属性中
               WebDataBinder binder =
                     resolveModelAttribute(attrName, methodParam, implicitModel, webRequest, handler);
               boolean assignBindingResult = (args.length > i + 1 && Errors.class.isAssignableFrom(paramTypes[i + 1]));
               if (binder.getTarget() != null) {
                  doBind(binder, webRequest, validate, validationHints, !assignBindingResult);
               }
               args[i] = binder.getTarget();
               if (assignBindingResult) {
                  args[i + 1] = binder.getBindingResult();
                  i++;
               }
               implicitModel.putAll(binder.getBindingResult().getModel());
            }
         }
         //最后返回处理后的参数数组
         return args;
      }
      ```

**总结**

- 首先，根据传入的请求和控制器类，确定要执行的目标方法

- 然后创建一个隐含模型`BindingAwareModelMap`对象，用于保存要传回页面的数据

- 循环遍历目标方法的每一个参数，为目标方法的参数绑定值

  - 如果当前参数标注了注解

    则获取注解的信息，并根据该信息解析传入的请求，将解析的结果绑定到该参数上

  - 如果当前参数没有标注注解

    - 如果当前参数的类型是原生API

      则创建对应API的对象绑定到该参数上

    - 如果当前参数的类型为`Map`或者`Model`类型

      则将先前创建的隐含模型`BindingAwareModelMap`对象绑定到该参数上

    - 如果当前参数的类型为其他类型（`SessionStatus`、`HttpEntity`等）

      则创建对应的对象绑定到该参数上

    - 如果当前参数的类型为简单类型（基本数据类型等）

      则作些特殊处理

    - 如果当前参数是自定义类型

      - 则利用反射创建一个该类型的对象
      - 解析请求中的参数信息，将参数的值绑定到同名对象的属性中

- 利用反射，执行目标方法，并传入处理后的参数

- 将目标方法执行后的返回值封装成一个`ModelAndView`对象，包含了视图名和要传回页面的数据（从隐含模型中获取）

### 8.6processDispatchResult方法细节

- `processDispatchResult`方法源码

  ```java
  private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
        HandlerExecutionChain mappedHandler, ModelAndView mv, Exception exception) throws Exception {
     //标识是否出现了异常 
     boolean errorView = false;
     //如果有异常，则对其进行处理
     if (exception != null) {
        if (exception instanceof ModelAndViewDefiningException) {
           logger.debug("ModelAndViewDefiningException encountered", exception);
           mv = ((ModelAndViewDefiningException) exception).getModelAndView();
        }
        else {
           Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
           mv = processHandlerException(request, response, handler, exception);
           errorView = (mv != null);
        }
     }
  
     //如果传入的ModelAndView对象不为空并且未被清理
     if (mv != null && !mv.wasCleared()) {
        //则传入请求、响应对象和ModelAndView对象，渲染视图 
        render(mv, request, response);
        if (errorView) {
           WebUtils.clearErrorRequestAttributes(request);
        }
     }
     else {
        if (logger.isDebugEnabled()) {
           logger.debug("Null ModelAndView returned to DispatcherServlet with name '" + getServletName() +
                 "': assuming HandlerAdapter completed request handling");
        }
     }
  
     if (WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
        // Concurrent handling started during a forward
        return;
     }
  
     if (mappedHandler != null) {
        mappedHandler.triggerAfterCompletion(request, response, null);
     }
  }
  ```

- `render`方法源码（渲染视图）

  ```java
  protected void render(ModelAndView mv, HttpServletRequest request, HttpServletResponse response) throws Exception {
     //获取区域信息
     Locale locale = this.localeResolver.resolveLocale(request);
     //为响应设置区域信息 
     response.setLocale(locale);
     View view;
     //如果ModelAndView对象的view属性是String类型的
     if (mv.isReference()) {
        //则传入视图名，隐含模型，区域化信息，请求对象，来调用resolveViewName方法解析该视图名来创	建一个视图对象View
        view = resolveViewName(mv.getViewName(), mv.getModelInternal(), locale, request);
        if (view == null) {
           throw new ServletException("Could not resolve view with name '" + mv.getViewName() +
                 "' in servlet with name '" + getServletName() + "'");
        }
     }
     //否则，说明ModelAndView对象的view属性是View类型，无需进行解析创建一个视图对象
     else {
        view = mv.getView();
        if (view == null) {
           throw new ServletException("ModelAndView [" + mv + "] neither contains a view name nor a " +
                 "View object in servlet with name '" + getServletName() + "'");
        }
     }
  
     // Delegate to the View object for rendering.
     if (logger.isDebugEnabled()) {
        logger.debug("Rendering view [" + view + "] in DispatcherServlet with name '" + getServletName() + "'");
     }
     try {
        //传入隐含模型，请求和响应对象，来调用创建好的视图对象的render方法，做到真正的转发（并将数据保存在请求域中）或者重定向页面
        view.render(mv.getModelInternal(), request, response);
     }
     catch (Exception ex) {
        if (logger.isDebugEnabled()) {
           logger.debug("Error rendering view [" + view + "] in DispatcherServlet with name '" +
                 getServletName() + "'", ex);
        }
        throw ex;
     }
  }
  ```

  - `resolveViewName`方法源码（解析视图名，创建视图对象）

    ```java
    protected View resolveViewName(String viewName, Map<String, Object> model, Locale locale,      HttpServletRequest request) throws Exception {
        /**  
        * 遍历每一个视图解析器（如果容器中有配置，则使用容器中的视图解析器，否则为默认的视图解析器 
        * InternalResourceViewResolver   
        */  
        for (ViewResolver viewResolver : this.viewResolvers) {  
            //调用视图解析器的resolveViewName方法来创建视图对象  
            View view = viewResolver.resolveViewName(viewName, locale);   
            //如果解析成功，则返回该视图对象     
            if (view != null) {    
                return view;    
            }  
            //否则，继续遍历 
        }   
        return null;
    }
    ```
  
    - 视图解析器的`resolveViewName`方法（以`InternalResourceViewResolver`为例）
  
      ```java
      public View resolveViewName(String viewName, Locale locale) throws Exception {
         if (!isCache()) {
            return createView(viewName, locale);
         }
         else {
            //获取缓存key 
            Object cacheKey = getCacheKey(viewName, locale);
            //首先从Access缓存中查找是否有该视图对象 
            View view = this.viewAccessCache.get(cacheKey);
            //如果Access缓存未命中 
            if (view == null) {
               //为Creation缓存加锁同步 
               synchronized (this.viewCreationCache) {
                  //再从Creation缓存中查找是否有该视图对象 
                  view = this.viewCreationCache.get(cacheKey);
                  //如果Creation缓存未命中 
                  if (view == null) {
                     //则调用createView方法创建一个视图对象
                     view = createView(viewName, locale);
                     //如果上述方法解析失败，标识view处于未解析状态 
                     if (view == null && this.cacheUnresolved) {
                        view = UNRESOLVED_VIEW;
                     }
                     //如果解析成功 
                     if (view != null) {
                        //将新建的视图对象放到两个缓存中 
                        this.viewAccessCache.put(cacheKey, view);
                        this.viewCreationCache.put(cacheKey, view);
                        if (logger.isTraceEnabled()) {
                           logger.trace("Cached view [" + cacheKey + "]");
                        }
                     }
                  }
               }
            }
            return (view != UNRESOLVED_VIEW ? view : null);
         }
      }
      ```
  
    - `createView`方法（真正的解析视图名，创建视图对象）
  
      ```java
      protected View createView(String viewName, Locale locale) throws Exception {
         // If this resolver is not supposed to handle the given view,
         // return null to pass on to the next resolver in the chain.
         if (!canHandle(viewName, locale)) {
            return null;
         }
         //如果视图名以redirect:前缀开头，则返回一个RedirectView视图对象
         if (viewName.startsWith(REDIRECT_URL_PREFIX)) {
            String redirectUrl = viewName.substring(REDIRECT_URL_PREFIX.length());
            RedirectView view = new RedirectView(redirectUrl, isRedirectContextRelative(), isRedirectHttp10Compatible());
            return applyLifecycleMethods(viewName, view);
         }
         //如果视图名以forward:前缀开头，则返回一个InternalResourceView视图对象
         if (viewName.startsWith(FORWARD_URL_PREFIX)) {
            String forwardUrl = viewName.substring(FORWARD_URL_PREFIX.length());
            return new InternalResourceView(forwardUrl);
         }
         //如果视图名是非以上前缀开头，则交给父类的方法处理
         //其内部会获取到配置的视图解析器中的前缀和后缀为视图名进行拼串并创建一个视图对象 
         return super.createView(viewName, locale);
      }
      ```
  
  - 视图对象的`render`方法（转发（将数据存放在请求域）或重定向至页面）

    ```java
    public void render(Map<String, ?> model, HttpServletRequest request, HttpServletResponse response) throws Exception {
       if (logger.isTraceEnabled()) {
          logger.trace("Rendering view with name '" + this.beanName + "' with model " + model +
             " and static attributes " + this.staticAttributes);
       }
       //将隐含模型中的数据包装成一个Map
       Map<String, Object> mergedModel = createMergedOutputModel(model, request, response);
       //响应预准备，即设置一些请求头之类
       prepareResponse(request, response);
       //真正的转发（携带数据）或者重定向至页面
       renderMergedOutputModel(mergedModel, getRequestToExpose(request), response);
    }
    ```
  
    - `renderMergedOutputModel`方法源码（真正的转发（携带数据）或者重定向至页面）
  
      ```java
      protected void renderMergedOutputModel(
            Map<String, Object> model, HttpServletRequest request, HttpServletResponse response) throws Exception {
      
         //遍历隐含模型中的数据，并将这些数据保存到请求域中
         exposeModelAsRequestAttributes(model, request);
      
         // Expose helpers as request attributes, if any.
         exposeHelpers(request);
      
         //获取转发路径
         String dispatcherPath = prepareForRendering(request, response);
      
         //获取原生API的转发器
         RequestDispatcher rd = getRequestDispatcher(request, dispatcherPath);
         if (rd == null) {
            throw new ServletException("Could not get RequestDispatcher for [" + getUrl() +
                  "]: Check that the corresponding file exists within your web application archive!");
         }
      
         // If already included or response already committed, perform include, else forward.
         if (useInclude(request, response)) {
            response.setContentType(getContentType());
            if (logger.isDebugEnabled()) {
               logger.debug("Including resource [" + getUrl() + "] in InternalResourceView '" + getBeanName() + "'");
            }
            rd.include(request, response);
         }
      
         else {
            // Note: The forwarded resource is supposed to determine the content type itself.
            if (logger.isDebugEnabled()) {
               logger.debug("Forwarding to resource [" + getUrl() + "] in InternalResourceView '" + getBeanName() + "'");
            }
            //调用转发器的forward方法，转发请求至目标页面 
            rd.forward(request, response);
         }
      }
      ```

**总结**

- 遍历每一个视图解析器，调用其`resolveViewName`方法来解析视图名，创建视图对象
  - 如果视图名是以`redirect:`或者`forward:`前缀开头，则直接返回`RedirectView`视图对象或`InternalResourceView`视图对象
  - 否则，获取视图解析器中的前缀和后缀属性值，为视图名进行拼串，并创建一个视图对象
- 调用新建的视图对象的`render`方法来转发（携带数据）/重定向至目标页面
  - 首先遍历隐含模型中的所有数据，并将这些数据保存到请求域中
  - 如果是非重定向操作，则获取到原生`Servlet`的转发器
    - 调用转发器的`forward`方法转发至目标页面
  - 否则，调用`Response`响应对象原生的`sendRedirect`方法重定向至目标页面

## 9.数据绑定

数据绑定，即将请求中的参数信息绑定到对应请求映射方法的参数上

- SpringMVC的数据绑定分为三步：

  - 数据类型转换
  - 数据格式化
  - 数据校验

- SpringMVC的数据绑定细节：

  - SpringMVC处理数据绑定的核心组件是`DataBinder`

  - 核心组件`DataBinder`会将请求参数传递给不同组件执行相应操作

    - `ConversionService`组件

      处理数据类型转换和格式化

    - `Validator`组件

      处理数据校验

### 9.1数据类型转换

由于网页传来的请求参数信息都是`String`类型，所以在进行数据绑定时，就需要`ConversionService`组件将这些参数转换成对应类型，才能够填充到请求映射方法的参数上

SpringMVC在`ConversionService`组件中内建了很多转换器对象`Converter`并且封装在一个集合对象中，实际执行类型转换操作的正是这些转换器对象

当SpringMVC内建的类型转换器无法满足实际需求时，还可以通过自定义类型转换器来实现

- 自定义类型转换器步骤

  - 通过实现`Converter<S,T>`转换器接口，编写自定义类型转换器类
  - 利用Spring自带`ConversionServiceFactoryBean`工厂类，在IOC容器中配置一个自定义的`ConversionService`组件
    - 配置该工厂类的`converters`属性，将自定义类型转换器注册到`ConversionService`组件
  - 通过配置`<mvc:annotation-driven/>`标签的属性`conversion-service`，将自定义的`ConversionService`组件注册到SpringMVC中

- 实战

  自定义类型转换器，将一个表示`Book`对象的字符串转换成一个`Book`对象，比如`java-zwf-123`分别绑定到`Book`对象的相应属性上

  - `Book.class`（POJO）

    ```java
    public class Book {
        private String name;
        private String author;
        private Integer price;
        public Book(){
        }
        @Override
        public String toString() {
            return "Book{" +
                    "name='" + name + '\'' +
                    ", author='" + author + '\'' +
                    ", price=" + price +
                    '}';
        }
    
        public String getName() {
            return name;
        }
    
        public void setName(String name) {
            this.name = name;
        }
    
        public String getAuthor() {
            return author;
        }
    
        public void setAuthor(String author) {
            this.author = author;
        }
    
        public Integer getPrice() {
            return price;
        }
    
        public void setPrice(Integer price) {
            this.price = price;
        }
    }
    ```

  - `MyController.class`（控制器类）

    ```java
    @Controller
    public class MyController {
    
        @RequestMapping("/")
        public String index(){
            System.out.println();
            return "index";
        }
    
    	
        @RequestMapping("/hello")
        //自定义类型转换器会将请求中的字符串参数拆分，并转换为一个Book对象，绑定到book参数上
        public String index(Book book){
            System.out.println(book);
            return "index";
        }
    
    }
    ```

  - `MyConverter.class`（转换器类）

    ```java
    //实现了Converter接口
    public class MyConverter implements Converter<String, Book> {
        //Converter接口中的convert方法，用于编写类型转换的逻辑
        @Override
        public Book convert(String s) {
            String[] strings=s.split("-");
            Book book=new Book();
            book.setName(strings[0]);
            book.setAuthor(strings[1]);
            book.setPrice(Integer.parseInt(strings[2]));
            return book;
        }
    }
    ```

  - `mvc.xml`（配置`ConversionService`组件并注册）

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:mvc="http://www.springframework.org/schema/mvc"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <context:component-scan base-package="controller"/>
        <!--
    		配置mvc:annotation-driven标签的conversion-service属性，将自定义的ConversionService组件注册到SpringMVC中
    	-->
        <mvc:annotation-driven conversion-service="conversionService"/>
        <!--
    		利用ConversionServiceFactoryBean，在ioc容器中创建一个自定义的ConversionService组件
     	-->
        <bean id="conversionService" class="org.springframework.context.support.ConversionServiceFactoryBean">
            <!--
    			配置该工厂类的converters属性，这是一个集合类型
    			通过该属性，将自定义类型转换器注册到自定义的ConversionService组件中
    		-->
            <property name="converters">
                <set>
                    <bean class="converters.MyConverter"/>
                </set>
            </property>
        </bean>
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <property name="prefix" value="/WEB-INF/pages/"/>
            <property name="suffix" value=".jsp"/>
        </bean>
    </beans>
    ```

### 9.2数据格式化

从本质上讲，数据格式化也是数据类型转换的一种，Spring格式化模块中定义了一个实现`ConversionService` 接口的 `FormattingConversionService` 实现类，该类既具有类型转换的功能，又具有格式化的功能

如果想要改变Spring对某些类型默认的格式化操作，可以自定义数据格式化

- 自定义数据格式化步骤

  - 对需要格式化的POJO对象的属性添加注解来限定格式
  - 如果是使用SpringMVC内置的类型转换器，则只需要在配置文件中添加`<mvc:annotation-driven/>`标签即可
  - 如果是自定义类型转换器，则需要将原来用于创建`ConversionService`组件的工厂类变为`FormattingConversionServiceFactoryBean`，使得创建出来的`ConversionService`组件既具有类型转换，又具有数据格式化的功能

- 实战——日期格式化

  Spring默认只接收`yyyy/MM/dd`格式的日期字符串，其余格式一律报错，现在需要自定义格式化，将其改变为只接收`yyyy-MM-dd`的日期字符串

  - `Book.class`

    ```java
    public class Book {
        private String name;
        private String author;
        private Integer price;
        //为日期类型的属性添加格式化注解@DateTimeFormat
        //属性pattern表示限定接收格式为yyyy-MM-dd的日期字符串
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        private Date date;
        public Book(){
        }
        @Override
        public String toString() {
            return "Book{" +
                    "name='" + name + '\'' +
                    ", author='" + author + '\'' +
                    ", price=" + price +
                    ", date=" +date+
                    '}';
        }
    
        public String getName() {
            return name;
        }
    
        public void setName(String name) {
            this.name = name;
        }
    
        public String getAuthor() {
            return author;
        }
    
        public void setAuthor(String author) {
            this.author = author;
        }
    
        public Integer getPrice() {
            return price;
        }
    
        public void setPrice(Integer price) {
            this.price = price;
        }
    
        public Date getDate() {
            return date;
        }
    
        public void setDate(Date date) {
            this.date = date;
        }
    }
    ```

  - `mvc.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:mvc="http://www.springframework.org/schema/mvc"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <context:component-scan base-package="controller"/>
        <!--添加<mvc:annotation-driven/>标签-->
        <mvc:annotation-driven/>
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <property name="prefix" value="/WEB-INF/pages/"/>
            <property name="suffix" value=".jsp"/>
        </bean>
    </beans>
    ```

### 9.3数据校验

如果传入的方法参数中有需要进行数据校验的，SpringMVC便会对其进行校验，并将校验的结果封装成一个`BindingResult`对象

- 数据校验步骤

  - 首先，对需要校验的POJO对象的属性添加注解来设置校验规则
  - 然后对需要校验的请求映射方法参数添加`@Validated`注解
  - 在添加了`@Valid`注解的参数后面，紧跟一个`BindingResult`类型的参数，SpringMVC会将前一个参数的校验结果封装到该参数中
  - 在配置文件中添加`<mvc:annotation-driven/>`标签

- 实战

  - `Book.class`

    ```java
    public class Book {
        //每个设置校验规则的注解都有一个message属性，用于指定错误信息
        @Length(min = 6,max = 10,message = "长度应在6-10")
        @NotNull(message = "不能为空")
        private String name;
        @NotNull(message = "不能为空")
        private String author;
        @NotNull(message = "不能为空")
        private Integer price;
        @DateTimeFormat(pattern = "yyyy-MM-dd")
        @Past(message = "这应该是一个过去时间")
        private Date date;
        public Book(){
            System.out.println("初始化...");
        }
        @Override
        public String toString() {
            return "Book{" +
                    "name='" + name + '\'' +
                    ", author='" + author + '\'' +
                    ", price=" + price +
                    ", date=" +date+
                    '}';
        }
    
        public String getName() {
            return name;
        }
    
        public void setName(String name) {
            this.name = name;
        }
    
        public String getAuthor() {
            return author;
        }
    
        public void setAuthor(String author) {
            this.author = author;
        }
    
        public Integer getPrice() {
            return price;
        }
    
        public void setPrice(Integer price) {
            this.price = price;
        }
    
        public Date getDate() {
            return date;
        }
    
        public void setDate(Date date) {
            this.date = date;
        }
    }
    ```

  - `MyController.class`

    ```java
    @Controller
    public class MyController {
    
        @RequestMapping("/")
        public String index(){
            System.out.println();
            return "index";
        }
    
    
        @RequestMapping("/hello")
        //需要校验的参数是book，需要添加@Valid注解，并且后面紧跟一个用于保存校验结果的BindingResult对象
        public String index(@Valid Book book, BindingResult bindingResult, Model errors){
            Map<String,Object> errorsMap=new HashMap<>();
            //判断校验结果是否出错
            if(bindingResult.hasErrors()){
                //获取每一个字段的校验结果
                for(FieldError fieldError:bindingResult.getFieldErrors()){
                    errorsMap.put(fieldError.getField(),fieldError.getDefaultMessage());
                }
                //保存到隐含模型中，在返回页面时会放置在请求域中
                //用于前端进行错误信息hui'xin
                errors.addAttribute("errors",errorsMap);
                return "index";
            }else{
                System.out.println("book");
                return "redirect:/success.jsp";
            }
        }
    }
    ```
    
  - `mvc.xml`
  
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:mvc="http://www.springframework.org/schema/mvc"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <context:component-scan base-package="controller"/>
        <!--添加<mvc:annotation-driven/>标签-->
        <mvc:annotation-driven/>
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <property name="prefix" value="/WEB-INF/pages/"/>
            <property name="suffix" value=".jsp"/>
        </bean>
    </beans>
    ```

### 9.4<mvc:annotation-driven />标签

- 如果在配置文件中配置了`<mvc:annotation-driven/>`标签
  - 其会向IOC容器中自动注册

    - `RequestMappingHandlerMapping` 
    - `RequestMappingHandlerAdapter` 
    -  `ExceptionHandlerExceptionResolver` 

    前两个会替换掉原先容器中`DefaultAnnotationHandlerMapping`和`AnnotationMethodHandlerAdapter`这两个`bean`，用于处理基于注解方式的请求映射；而最后一个会替换掉原先容器中的`AnnotationMethodHandlerExceptionResolver`这个`bean`，用于处理基于注解方式的异常处理

  - 提供以下支持

    - 支持使用`ConversionService`组件进行类型转换
    - 支持使用`@NumberFormat` 、`@DateTimeFormat`注解完成数据类型的格式化
    - 支持使用 @Valid 注解进行数据校验
    - 支持使用 `@RequestBody` 和 `@ResponseBody` 注解

- 解决静态资源访问的问题

  - 方法

    使用`<mvc:default-servlet-handler/>`标签搭配`<mvc:annotation-driven/>`标签

  - 分析

    - `<mvc:default-servlet-handler/>`标签

      如果配置了该标签

      - SpringMVC会使用`SimpleUrlHandlerMapping`替换掉原先容器中`DefaultAnnotationHandlerMapping`
      - `SimpleUrlHandlerMapping`的属性`urlMap`是用于保存请求`url`到`servlet`的映射
      - `SimpleUrlHandlerMapping`的属性`urlMap`只保存了一条信息，即`/** -> org.springframework.web.servlet.resource.DefaultServletHttpRequestHandler#0`，表示所有的请求都交付tomcat处理：
        - tomcat对于所有的静态资源请求可以处理
        - 而对于我们原本基于注解配置的请求映射，tomcat无法处理

    - `<mvc:annotation-driven/>`标签

      如果在配置了`<mvc:default-servlet-handler/>`标签的基础上，再配置`<mvc:annotation-driven/>`标签

      - SpringMVC会向容器中再注册一个`RequestMappingHandlerMapping` 
      - `RequestMappingHandlerMapping` 的属性`mappingRegistry`是用于保存基于注解配置的请求映射信息
      - 当一个请求进来，SpringMVC会遍历每一个处理器执行链
        - 如果是静态资源请求，`RequestMappingHandlerMapping` 无法处理时，便会交付给`SimpleUrlHandlerMapping`处理
        - 如果是基于注解的请求映射，就会直接由`RequestMappingHandlerMapping`处理

## 10.ajax相关的请求与响应

- `@ResponseBody`注解

  - 作用

    会将返回的数据放入响应体中

    - 如果返回的数据是对象，会自动将对象转换为JSON格式的字符串返回（需要引入jackson包）

  - 标注位置

    - 如果标注在方法上，说明当前方法的返回值会放入响应体中返回给浏览器
    - 如果标注在类上，说明当前类的所有方法的返回值都会放入响应体中返回给浏览器

  - 实战

    - `Book.class`

      ```java
      public class Book {
          private String name;
          private String author;
          private Integer price;
          //可以使用 @JsonIgnore注解，使该对象转换成json格式的字符串时，不将该属性纳入
          @JsonIgnore
          private Date date;
          public Book(){
              System.out.println("初始化...");
          }
          @Override
          public String toString() {
              return "Book{" +
                      "name='" + name + '\'' +
                      ", author='" + author + '\'' +
                      ", price=" + price +
                      ", date=" +date+
                      '}';
          }
      
          public String getName() {
              return name;
          }
      
          public void setName(String name) {
              this.name = name;
          }
      
          public String getAuthor() {
              return author;
          }
      
          public void setAuthor(String author) {
              this.author = author;
          }
      
          public Integer getPrice() {
              return price;
          }
      
          public void setPrice(Integer price) {
              this.price = price;
          }
      
          public Date getDate() {
              return date;
          }
      
          public void setDate(Date date) {
              this.date = date;
          }
      }
      ```

    - `MyController.class`

      ```java
      @Controller
      public class MyController {
      
          @RequestMapping("/")
          public String index(){
              System.out.println();
              return "index";
          }
      
          @ResponseBody
          @RequestMapping("/hello")
          public Book testAjax(){
              Book book=new Book();
              book.setName("c++");
              book.setAuthor("zwf");
              book.setPrice(123);
              //Book对象会被转换成Json格式的字符串并放入响应体中返回
              return book;
          }
      }
      ```

- `@RequestBody`注解

  - 作用

    将请求体中的数据绑定到该注解标注的参数上

    - 如果请求体是JSON数据，且对应的参数是对象类型，则会将JSON数据转换成对应的对象

  - 实战

    - `MyController.class`

      ```java
      @Controller
      public class MyController {
      
          @RequestMapping("/")
          public String index(){
              System.out.println();
              return "index";
          }
          @ResponseBody
          @RequestMapping("/hello")
          //获取请求体并将其绑定到参数book上
          public Book testAjax(@RequestBody Book book){
              return book;
          }
      
      }
      ```

    - `index.jsp`

      ```jsp
      <%@page language= "java" contentType= "text/html; charset=utf-8" pageEncoding= "utf-8"  isELIgnored="false"%>
      <html>
      <body>
      <h2>Hello World!</h2>
      <form action="hello">
          <a href="">获取书籍信息</a>
      </form>
      </body>
      <script src="${pageContext.request.contextPath}/js/jquery-3.5.1.js"></script>
      <script>
          $("a").click(function () {
              var book={
                  "name":"c++",
                  "author":"zwf",
                  "price":123,
                  "date":2021/5/20
              };
              //将js对象转换成json字符串
              book=JSON.stringify(book);
              //向服务器端发送json数据
              $.ajax({
                  url:"${pageContext.request.contextPath}/hello",
                  data:book,
                  type:"POST",
                  contentType:"application/json",
                  success:function (result) {
                      console.log(result);
                  }
              });
              return false
          })
      </script>
      </html>
      ```

- `HttpEntity`类型参数

  - 作用

    如果在请求映射方法的某个参数是`HttpEntity`类型，则该参数能与请求体和请求头中的数据绑定

  - 泛型

    泛型参数是请求头和请求体中的数据类型

  - 实战

    - `MyController.class`

      ```java
      @Controller
      public class MyController {
      
          @RequestMapping("/")
          public String index(){
              System.out.println();
              return "index";
          }
          @RequestMapping("/hello")
          //可以获取到请求体和请求头，并绑定到str参数上
          public String testAjax(HttpEntity<String> str){
              System.out.println(str);
              return "index";
          }
      }
      ```

- `ResponseEntity`类型返回值

  - 作用

    可以为响应设置响应头、响应体和状态码

  - 泛型

    泛型参数是响应体中的数据类型

  - 实战

    - `MyController.class`

      ```java
      @Controller
      public class MyController {
      
          @RequestMapping("/")
          public String index(){
              System.out.println();
              return "index";
          }
          @RequestMapping("/hello")
          //ResponseEntity<String>类型的返回值，响应体中的数据为String类型
          public ResponseEntity<String> testAjax(){
              //创建一个ResponseEntity对象，需要三个参数，响应体、响应头和状态码
              return new ResponseEntity<String>("<h1>ResponseEntity</h1>",null, HttpStatus.OK);
          }
      }
      ```

## 11.文件上传

SpringMVC的九大组件之一文件上传解析器，可以使得文件上传功能开发更方便

- 文件上传环境搭建

  - 页面表单配置`enctype`属性为`multipart/form-data`，表示发送文件上传请求
  - 配置文件上传解析器
  - 在请求映射方法中添加一个`MultipartFile`对象，用于接收文件

- 实战

  - `index.jsp`

    ```jsp
    <%@page language= "java" contentType= "text/html; charset=utf-8" pageEncoding= "utf-8"  isELIgnored="false"%>
    <html>
    <body>
    <h2>Hello World!</h2>
    <!--配置enctype属性为multipart/form-data-->    
    <form action="hello" enctype="multipart/form-data" method="post">
        <input type="file" name="img"/>
        <input type="submit">
    </form>
    </body>
    </html>
    ```

  - `mvc.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:mvc="http://www.springframework.org/schema/mvc"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <context:component-scan base-package="controller"/>
        <mvc:default-servlet-handler/>
        <mvc:annotation-driven/>
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <property name="prefix" value="/WEB-INF/pages/"/>
            <property name="suffix" value=".jsp"/>
        </bean>
        <!--配置一个id名为multipartResolver的文件上传解析器-->
        <bean id="multipartResolver" class="org.springframework.web.mujavaltipart.commons.CommonsMultipartResolver">
            <!--配置属性maxUploadSize，最大上传的文件大小-->
            <property name="maxUploadSize" value="#{1024*1024*20}"/>
            <!--配置属性defaultEncoding，配置文件上传请求的默认编码-->
            <property name="defaultEncoding" value="UTF-8"/>
        </bean>
    </beans>
    ```

  - `MyController.class`

    ```java
    @Controller
    public class MyController {
    
        @RequestMapping("/")
        public String index(){
            System.out.println();
            return "index";
        }
        @RequestMapping("/hello")
        //使用MultipartFile对象接收文件
        public String testAjax(@RequestParam("img") MultipartFile multipartFile) throws IOException {
            //使用transferTo方法可以将接收到的文件转化到本地
            multipartFile.transferTo(new File("C:\\Users\\Admin\\IdeaProjects\\SpringMVCProject\\src"+multipartFile.getOriginalFilename()));
            return "index";
        }
    }
    ```

## 12.拦截器

相较于JavaWeb的过滤器， SpringMVC也提供了拦截器，可以对请求进行拦截处理，并且功能更强大

### 12.1自定义拦截器

- 步骤

  - 编写拦截器类，通过实现`HandlerInterceptor`接口

    `HandlerInterceptor`接口有三个方法：

    - `preHandle`方法

      在拦截的请求映射对应的目标方法之前被调用

      该方法的返回值为`boolean`类型：

      - 如果为`true`，表示将请求放行
      - 否则，拦截该请求

    - `postHandle`方法

      在拦截的请求映射对应的目标方法之后被调用

    - `afterompletion`方法

      在请求结束来到目标页面后被调用

  - 在配置文件中注册该拦截器类

    - 配置该拦截器需要拦截的请求映射

- 实战

  - `MyInterceptor.class`

    ```java
    public class MyInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            System.out.println("目标方法运行之前被调用...");
            return true;
        }
    
        @Override
        public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
            System.out.println("目标方法运行之后被调用...");
        }
    
        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
            System.out.println("来到目标页面之后被调用...");
        }
    }
    ```

  - `mvc.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:mvc="http://www.springframework.org/schema/mvc"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <context:component-scan base-package="controller"/>
        <mvc:default-servlet-handler/>
        <mvc:annotation-driven/>
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <property name="prefix" value="/WEB-INF/pages/"/>
            <property name="suffix" value=".jsp"/>
        </bean>
        <!--<mvc:interceptors>标签可以配置多个拦截器-->
        <mvc:interceptors>
            <!-- <mvc:interceptor>可以配置单个拦截器-->
            <mvc:interceptor>
                <!--配置拦截的请求映射-->
                <mvc:mapping path="/hello"/>
                <!--配置拦截器类-->
                <bean class="interceptors.MyInterceptor"/>
            </mvc:interceptor>
        </mvc:interceptors>
    </beans>
    ```

### 12.2拦截器

我们可以从`DispatcherServlet`类的`doDispatch`方法中查看拦截器的运行流程逻辑

- `doDispatch`方法

  ```java
  protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
     HttpServletRequest processedRequest = request;
     HandlerExecutionChain mappedHandler = null;
     boolean multipartRequestParsed = false;
  
     WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
  
     try {
        ModelAndView mv = null;
        Exception dispatchException = null;
  
        try {
           processedRequest = checkMultipart(request);
           multipartRequestParsed = (processedRequest != request);
  
           //获取处理器执行链，包含了控制器类和拦截器链的信息
           mappedHandler = getHandler(processedRequest);
           if (mappedHandler == null || mappedHandler.getHandler() == null) {
              noHandlerFound(processedRequest, response);
              return;
           }
  
           //获取处理器适配器
           HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());
            ...
  		 //执行每一个拦截器的preHandle方法
           if (!mappedHandler.applyPreHandle(processedRequest, response)) {
              //如果拦截器链中有一个拦截器的preHandle方法返回false，则doDispatch方法直接结束 
              return;
           }
  
           //执行目标请求映射方法
           mv = ha.handle(processedRequest, response, mappedHandler.getHandler());
  
           if (asyncManager.isConcurrentHandlingStarted()) {
              return;
           }
  
           applyDefaultViewName(processedRequest, mv);
           //执行每一个拦截器的postHandle方法
           mappedHandler.applyPostHandle(processedRequest, response, mv);
        }
        catch (Exception ex) {
           dispatchException = ex;
        }
        //处理请求映射方法的执行结果并转发/重定向至目标页面 
        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
     }
     catch (Exception ex) {
        //如果有异常，则会进入triggerAfterCompletion方法 
        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
     }
     catch (Error err) {
        triggerAfterCompletionWithError(processedRequest, response, mappedHandler, err);
     }
     finally {
        if (asyncManager.isConcurrentHandlingStarted()) {
           // Instead of postHandle and afterCompletion
           if (mappedHandler != null) {
              mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
           }
        }
        else {
           // Clean up any resources used by a multipart request.
           if (multipartRequestParsed) {
              cleanupMultipart(processedRequest);
           }
        }
     }
  }
  ```

  - `mappedHandler.applyPreHandle(HttpServletRequest,HttpServletResponse)`方法（执行每一个拦截器的`preHandle`方法）

    ```java
    boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {
        //获取所有的拦截器
       HandlerInterceptor[] interceptors = getInterceptors();
       if (!ObjectUtils.isEmpty(interceptors)) {
          //遍历每一个拦截器 
          for (int i = 0; i < interceptors.length; i++) {
             HandlerInterceptor interceptor = interceptors[i];
             //执行每一个拦截器的preHandle方法 
             if (!interceptor.preHandle(request, response, this.handler)) {
                //如果当前拦截器的preHandle方法返回false，说明对当前请求不放行
                //触发triggerAfterCompletion方法，然后方法结束返回false 
                triggerAfterCompletion(request, response, null);
                return false;
             }
              //否则，记录一下当前拦截器的索引
              //interceptorIndex属性用于记录最后一个放行请求的拦截器的索引
             this.interceptorIndex = i;
          }
       }
       return true;
    }
    ```

  - `mappedHandler.applyPostHandle(HttpServletRequest,HttpServletResponse,ModelAndView)`方法（执行每一个拦截器的`postHandle`方法）

    ```java
    void applyPostHandle(HttpServletRequest request, HttpServletResponse response, ModelAndView mv) throws Exception {
        //获取所有的拦截器
       HandlerInterceptor[] interceptors = getInterceptors();
       if (!ObjectUtils.isEmpty(interceptors)) {
           //从拦截器链的最后一个拦截器开始，逆序遍历
          for (int i = interceptors.length - 1; i >= 0; i--) {
             HandlerInterceptor interceptor = interceptors[i];
             //执行每一个拦截器的postHandle方法 
             interceptor.postHandle(request, response, this.handler, mv);
          }
       }
    }
    ```

  - `processDispatchResult`方法（处理请求映射方法的执行结果并转发/重定向至目标页面）

    ```java
    private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
          HandlerExecutionChain mappedHandler, ModelAndView mv, Exception exception) throws Exception {
        //处理请求映射执行结果并转发/重定向至目标页面
        ...
       if (mappedHandler != null) {
          //当请求完成返回到目标页面后，才会执行triggerAfterCompletion方法 
          mappedHandler.triggerAfterCompletion(request, response, null);
       }
    }
    ```

  - `triggerAfterCompletion(HttpServletRequest, HttpServletResponse, Exception)`方法

    ```java
    void triggerAfterCompletion(HttpServletRequest request, HttpServletResponse response, Exception ex)
          throws Exception {
    	//获取所有的拦截器
       HandlerInterceptor[] interceptors = getInterceptors();
       if (!ObjectUtils.isEmpty(interceptors)) {
           //从最后一个放行请求的拦截器开始，逆序遍历
          for (int i = this.interceptorIndex; i >= 0; i--) {
             HandlerInterceptor interceptor = interceptors[i];
             try {
                 //尝试执行每一个拦截器的afterCompletion方法
                interceptor.afterCompletion(request, response, this.handler, ex);
             }
             catch (Throwable ex2) {
                logger.error("HandlerInterceptor.afterCompletion threw exception", ex2);
             }
          }
       }
    }
    ```

**总结**

- 当请求进入`DispatcherServlet`类中，SpringMVC会按照配置中定义拦截器的顺序，执行每一个拦截器的`preHandle`方法
  - 如果拦截器链中某一个拦截器的`preHandle`方法返回`false`
    - 触发`triggerAfterCompletion`方法，从最后一个放行请求的拦截器开始，逆序遍历并执行每一个拦截器的 `afterCompletion`方法
    - `DispatcherServlet`类的`doDispatch`方法结束
  - 否则，`DispatcherServlet`类的`doDispatch`方法逻辑继续执行
- 执行目标请求映射方法
- 从拦截器链中的最后一个拦截器开始，逆序遍历并执行每一个拦截器的`postHandle`方法 
- 处理请求映射执行结果并转发/重定向至目标页面后，从最后一个放行请求的拦截器开始，逆序遍历并执行每一个拦截器的`afterCompletion`方法
- 如果上述步骤中，有任何一步抛出异常，则从最后一个放行请求的拦截器开始，逆序遍历并执行每一个拦截器的`afterCompletion`方法

**只要一个拦截器放行请求，无论如何其`afterCompletion`方法都会被执行**

## 13.异常处理

SpringMVC默认提供三种异常处理解析器：

- 根据是否添加`<mvc:annotation-driven/>`标签
  - 如果是，则为`ExceptionHandlerExceptionResolver`
  - 否则，为`AnnotationMethodHandlerExceptionResolver`
- `ResponseStatusExceptionResolver`
- `DefaultHandlerExceptionResolver`

### 13.1@ExceptionHandler注解

对于所有标注了`@ExceptionHandler`注解的方法都会由`ExceptionHandlerExceptionResolver`解析器或者`AnnotationMethodHandlerExceptionResolver`解析器处理

- 作用

  用于标注当前方法是专门处理这个类发生的异常

- 属性

  - `value`	

    `Class<? extends Throwable>[]`类型，用于指定当前方法可以处理的异常

- 方法参数

  被标注了`@ExceptionHandler`注解的方法，可以为其添加一个`Exception`类型的参数，用于接收异常信息

- 实战

  - 局部异常处理

    - `MyController.class`

      ```java
      @Controller
      public class MyController {
      	
          @RequestMapping("/")
          public String index(){
              //抛出异常
              int i=10/0;
              return "index";
          }
      	
          //使用注解@ExceptionHandler标注error方法为处理异常的方法
          //只要MyController类中的请求映射方法抛出了异常，就会进入该方法处理
          //然后将抛出的异常绑定到参数ex上，最后将异常信息放入请求域中返回给错误页面用于回显
          @ExceptionHandler(value = Exception.class)
          public String error(Exception ex,Model model){
              model.addAttribute("ex",ex.getMessage());
              return "error";
          }
      }
      ```

    - `error.jsp`

      ```jsp
      <%@page language= "java" contentType= "text/html; charset=utf-8" pageEncoding= "utf-8"  isELIgnored="false"%>
      <html>
      <head>
          <title>错误</title>
      </head>
      <body>
      <h1>出错了！错误信息为${requestScope.get("ex")}</h1>
      </body>
      </html>
      ```

  - 全局异常处理

    可以创建一个专门处理全局异常的类，即任何一个控制器类中的请求映射方法出现异常，都由该类处理

    - 步骤

      - 编写处理全局异常的类
      - 使用`@ControllerAdvice`注解标识这个类为处理全局异常的类并将其注册到IOC容器中

    - 示例

      - `HandlerErrorController.class`

        ```java
        //任何一个控制器类的请求映射方法出错，都会进入该类中寻找对应的异常处理方法
        @ControllerAdvice
        public class HandlerErrorController {
            @ExceptionHandler(value = Exception.class)
            public String error(Exception ex, Model model){
                model.addAttribute("ex",ex.getMessage());
                return "error";
            }
        }
        ```

- 异常处理优先级

  - 如果有`@ExceptionHandler`注解标注的方法能处理当前异常，则精确优先
  - 如果全局异常处理与局部异常处理都能处理当前异常，则局部优先

### 13.2@ResponseStatus注解

对于所有标注了`@ResponseStatus`注解的方法都会由`ResponseStatusExceptionResolver`解析器处理，该注解不能标注在正常的请求映射方法上，否则会出错

- 作用

  用于改变HTTP响应的状态码

- 属性

  - `value`

    `HttpStatus`类型，用于指定HTTP响应的状态码

  - `reason`

    `String`类型，用于指定输出的错误信息

- 实战

  - `MyController.class`

    ```java
    @Controller
    public class MyController {
        @RequestMapping("/")
        public String index(){
            return "index";
        }
        @RequestMapping("/hello")
        public String test(String un){
            //如果请求参数un不为potato，则抛出自定义异常
            if(!un.equals("potato")){
                throw new UserNameException();
            }
            return "index";
        }
    }
    ```

  - `UserNameException.class`

    ```java
    //为自定义异常类添加注解@ResponseStatus，只要任何一个请求映射方法抛出该异常且未被处理，就会返回一个指定响应码和错误信息的页面
    @ResponseStatus(reason = "拒绝登录",value = HttpStatus.BAD_REQUEST)
    public class UserNameException extends RuntimeException {
    }
    ```

### 13.3SpringMVC的默认异常处理解析器

SpringMVC自带的异常如果没有被前两个异常处理解析器处理，则都会由默认异常处理解析器`DefaultHandlerExceptionResolver`来处理

### 13.4XML方式配置异常处理

` SimpleMappingExceptionResolver`异常处理解析器可以被用于XML方式配置异常处理

- 步骤

  - 在配置文件中配置` SimpleMappingExceptionResolver`，将其注册到IOC容器
    - 配置` SimpleMappingExceptionResolver`的属性`exceptionMappings`
      - 属性`exceptionMappings`是`Properties`类型，用于指定哪些异常要前往哪些页面
    - 配置` SimpleMappingExceptionResolver`的属性`exceptionAttribute`
      - 属性`exceptionAttribute`是`String`类型，用于指定保存在请求域中错误信息的`key`名，默认为`exception`

- 实战

  - `mvc.xml`

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:mvc="http://www.springframework.org/schema/mvc"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <context:component-scan base-package="controller"/>
        <mvc:default-servlet-handler/>
        <mvc:annotation-driven/>
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <property name="prefix" value="/WEB-INF/pages/"/>
            <property name="suffix" value=".jsp"/>
        </bean>
        <bean 
     <!--配置SimpleMappingExceptionResolver-->
     class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
           <!--配置属性exceptionMappings-->
            <property name="exceptionMappings">
                <props>
                    <!--指定哪些异常要前往哪些页面-->
                    <prop key="java.lang.Exception">error</prop>
                </props>
            </property>	
        	<!--配置属性exceptionAttribute，指定保存在请求域中错误信息的key名-->
            <property name="exceptionAttribute" value="ex"/>
        </bean>
    </beans>
    ```

### 13.5异常处理运行流程

我们可以从`DispatcherServlet`类的`doDispatch`方法中查看异常处理的运行流程逻辑

- `doDispatch`方法

  ```java
  protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
     HttpServletRequest processedRequest = request;
     HandlerExecutionChain mappedHandler = null;
     boolean multipartRequestParsed = false;
  
     WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
  
     try {
        ModelAndView mv = null;
        Exception dispatchException = null;
  
        try {
            //执行拦截器逻辑和请求映射方法
            ...
        }
         //如果上述步骤抛出异常，则将其捕获并保存在dispatchException变量中
        catch (Exception ex) {
           dispatchException = ex;
        }
         //传入补捕获的异常，交由processDispatchResult方法处理
        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
     }
     catch (Exception ex) {
        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
     }
     catch (Error err) {
        triggerAfterCompletionWithError(processedRequest, response, mappedHandler, err);
     }
     finally {
        if (asyncManager.isConcurrentHandlingStarted()) {
           // Instead of postHandle and afterCompletion
           if (mappedHandler != null) {
              mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
           }
        }
        else {
           // Clean up any resources used by a multipart request.
           if (multipartRequestParsed) {
              cleanupMultipart(processedRequest);
           }
        }
     }
  }
  ```

- `processDispatchResult`方法（内部会处理执行请求映射方法期间抛出的异常）

  ```java
  private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
        HandlerExecutionChain mappedHandler, ModelAndView mv, Exception exception) throws Exception {
  
     boolean errorView = false;
  	//如果执行请求映射方法期间抛出了异常
     if (exception != null) {
         //先判断该异常是否是ModelAndViewDefiningException类型
        if (exception instanceof ModelAndViewDefiningException) {
           logger.debug("ModelAndViewDefiningException encountered", exception);
            //如果是，则获取显示错误的ModelAndView对象
           mv = ((ModelAndViewDefiningException) exception).getModelAndView();
        }
         //否则
        else {
            //获取抛出异常的请求映射方法所在的控制器类
           Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
            //调用processHandlerException方法处理抛出的异常
           mv = processHandlerException(request, response, handler, exception);
           errorView = (mv != null);
        }
     }
     ...
  }
  ```

- `processHandlerException`方法（处理执行请求映射方法期间抛出的非`ModelAndViewDefiningException`类型异常）

  ```java
  protected ModelAndView processHandlerException(HttpServletRequest request, HttpServletResponse response,
        Object handler, Exception ex) throws Exception {
  
     // Check registered HandlerExceptionResolvers...
     ModelAndView exMv = null;
      //遍历每一个异常处理解析器
     for (HandlerExceptionResolver handlerExceptionResolver : this.handlerExceptionResolvers) {
         //调用每一个异常处理解析器的resolveException来处理该异常
         //如果处理成功会返回一个ModelAndView对象
        exMv = handlerExceptionResolver.resolveException(request, response, handler, ex);
         //如果处理成功，则跳出循环
        if (exMv != null) {
           break;
        }
        //否则，继续遍历 
     }
      //如果异常处理成功
     if (exMv != null) {
         //判断该ModelAndView对象的view和model属性是否为空
        if (exMv.isEmpty()) {
            //如果是，则将异常对象保存在请求域中，key为exception
           request.setAttribute(EXCEPTION_ATTRIBUTE, ex);
           return null;
        }
        // 如果该ModelAndView对象的view属性为空
        if (!exMv.hasView()) {
            //则为该ModelAndView对象设置视图名为请求的源地址
           exMv.setViewName(getDefaultViewName(request));
        }
        if (logger.isDebugEnabled()) {
           logger.debug("Handler execution resulted in exception - forwarding to resolved error view: " + exMv, ex);
        }
        WebUtils.exposeErrorRequestAttributes(request, ex, getServletName());
        return exMv;
     }
     //如果异常无法被处理，则抛出异常
     throw ex;
  }
  ```

**总结**

- 如果执行请求映射方法期间抛出了异常，则该异常会先被捕获并传入`processHandlerException`方法进行处理

- 在`processHandlerException`方法内部，会先判断异常的类型

  - 如果异常是`ModelAndViewDefiningException`类型，则获取显示错误的`ModelAndView`对象
  - 否则，遍历每一个异常处理解析器来处理该异常

- 如果该异常被其中一个异常处理解析器处理，则会返回一个`ModelAndView`对象，并对其进行判断

  - 如果该`ModelAndView`对象的`view`属性和`model`属性都为空

    则将异常对象保存在请求域中，`key`为`exception`

  - 如果该`ModelAndView`对象的`view`属性为空

    则为该`ModelAndView`对象设置视图名为请求的源地址
