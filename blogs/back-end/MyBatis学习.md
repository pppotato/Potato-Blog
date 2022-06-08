---
title: MyBatis学习
date: 2020-02-03
categories:
- Back-End
tags:
- MyBatis
---

## 1.入门

- 简介

  MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录

- MyBatis操作数据库

  MyBatis操作数据库步骤：

  -  创建一个MyBatis全局配置文件

    其中配置了获取数据库连接实例的数据源（DataSource）以及决定事务作用域和控制方式的事务管理器等等

  - 创建SQL映射文件

    其中封装了操作数据库的SQL语句，并将这些SQL语句映射到相应的唯一标识id（**SQL映射文件需要注册到MyBatis的全局配置文件中才能生效**）

  - 使用`SqlSessionFactoryBuilder`类读取MyBatis的全局配置文件，并将其中的配置属性封装来构造一个`SqlSessionFactory`实例

    每个基于MyBatis 的应用都是以一个 `SqlSessionFactory` 的实例为核心的，要使用MyBatis操作数据库，必须先构建`SqlSessionFactory` 的实例

  - 通过`SqlSessionFactory`获取`SqlSession`实例来直接执行已映射的SQL语句

    每一个`SqlSession`实例提供了数据库执行SQL命令所需的所有方法

- 简单示例

  - MyBatis全局配置文件

    ```xml
    <!--mybatis-config.xml-->
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE configuration
            PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
            "http://mybatis.org/dtd/mybatis-3-config.dtd">
    <!--MyBatis配置-->
    <configuration>
        <!--默认应用id为development的环境-->
        <environments default="development">
            <!-- id为development的环境配置-->
            <environment id="development">
                <!--事务管理器-->
                <transactionManager type="JDBC"/>
                <!--数据源-->
                <dataSource type="POOLED">
                    <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                    <property name="url" value="jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC&amp;useUnicode=true&amp;characterEncoding=utf8"/>
                    <property name="username" value="root"/>
                    <property name="password" value="apotato666"/>
                </dataSource>
            </environment>
        </environments>
        <!--将sql映射文件注册到全局配置文件中-->
        <mappers>
            <!--映射文件所在文件路径-->
            <mapper resource="mapper/EmployeeMapper.xml"/>
        </mappers>
    </configuration>
    ```

  - SQL映射文件

    ```xml
    <!--EmployeeMapper-->
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <!--名称空间-->
    <mapper namespace="site.potatoblog.dao.EmployeeMapper">
        	<!--
    		select标签，编写查询的sql语句，
    		id，该查询语句的唯一标识，用于映射该sql语句
    		resultType，查询得到的结果需要封装的类型
    		#{id}，从传递过来的参数中取出id值
    		-->
            <select id="selectEmployee" resultType="site.potatoblog.Employee">
                select * from employee where id = #{id};
            </select>
    </mapper>
    ```

  - 测试

    ```java
    @Test
    public void test() throws IOException {
        //mybatis全局配置文件的路径
        String resource = "conf/mybatis-config.xml";
        //将mybatis全局配置文件读入一个输入流中
        InputStream inputStream = Resources.getResourceAsStream(resource);
        //读取输入流中的属性配置来封装一个SqlSessionFactory实例
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        //通过SqlSessionFactory实例的openSession()方法来获取SqlSession实例
        SqlSession openSession = sqlSessionFactory.openSession();
        try {
            //通过SqlSession实例的selectOne方法，传入sql语句的唯一标识和执行sql语句所需的参数，来执行SQL映射文件中相应的查询语句
            Employee employee = openSession.selectOne("site.potatoblog.EmployeeMapper.selectEmployee", 1);
            System.out.println(employee);
        }finally {
            //最后要调用SqlSession实例的close方法，关闭与数据库的连接
            openSession.close();
        }
    }
    ```

- 接口绑定

  ```java
  Employee employee = openSession.selectOne("site.potatoblog.EmployeeMapper.selectEmployee", 1);
  ```

  上述例子中，sql语句的映射需要依靠字符串字面值来唯一标识，并且`selectOne`方法的第二个参数是`Object`类型，因此该参数可以接收任何值，是类型不安全的，所以MyBatis提供了接口绑定

  - 什么是接口

    所谓接口绑定，即将SQL映射文件与Java接口进行绑定，相应的SQL语句规则也与接口中对应的方法进行绑定

  - 实现原理

    通过动态代理的方式，创建一个代理类实现该接口，最后调用接口中的方法，就会转由代理类完成，最后映射到相应的SQL语句

  - 接口绑定的好处

    不依赖于字符串字面值，并且由于接口方法的参数会强制限定传入的类型，因此是类型安全的

  使用接口绑定修改上述示例：

  - `EmployeeMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface EmployeeMapper {
        //该方法限定了传入的参数必须是int类型
        Employee selectEmployee(Integer id);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <!--SQL映射文件的名称空间，就是与之绑定的接口的全限定名-->
    <mapper namespace="site.potatoblog.dao.EmployeeMapper">
        	<!--select标签的id值就是与之绑定的接口中对应的方法-->
            <select id="selectEmployee" resultType="site.potatoblog.Employee">
                select * from employee where id = #{id};
            </select>
    </mapper>
    ```

  - 测试

    ```java
    @Test
    public void test01() throws IOException{
        //mybatis全局配置文件的路径
        String resource = "conf/mybatis-config.xml";
        //将mybatis全局配置文件读入一个输入流中
        InputStream inputStream = Resources.getResourceAsStream(resource);
        //读取输入流中的属性配置来封装一个SqlSessionFactory实例
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession openSession = sqlSessionFactory.openSession();
        try{
            //获取EmployeeMapper接口的实现类对象，即代理对象
            EmployeeMapper mapper=openSession.getMapper(EmployeeMapper.class);
            //由代理对象执行接口方法映射的SQL语句
            Employee employee = mapper.selectEmployee(1);
            System.out.println(employee);
            //org.apache.ibatis.binding.MapperProxy@1fb669c3
            System.out.println(mapper);
        }finally {
            //最后要调用SqlSession实例的close方法，关闭与数据库的连接
            openSession.close();
        }
    }
    ```

- 总结
  - `SqlSession`实例代表和数据库的一次会话，用完必须关闭
  - `SqlSession`实例是非线程安全的，它只能作为局部变量使用 ，不能声明为类的成员变量
  - MyBatis会为与SQL映射文件绑定的接口生成一个代理对象，用来执行SQL映射文件中的SQL语句
  - 两个重要的配置文件：
    - MyBatis全局配置文件，配置了构造`SqlSessionFactory`实例的相应属性
    - SQL映射文件，配置了每一个SQL语句的映射信息

## 2.MyBatis-全局配置文件

- `properties`标签

  用于引入外部properties配置文件（properties配置文件用于将一些配置信息抽离，方便随时修改）

  - 属性`url`

    引入网络路径或者磁盘路径下的资源

  - 属性`resource`

    引入类路径下的资源

  示例：

  - properties配置文件

    ```properties
    #db.properties
    jdbc.driver=com.mysql.cj.jdbc.Driver
    jdbc.url=jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC&useUnicode=true&characterEncoding=utf8
    jdbc.username=root
    jdbc.password=apotato666
    ```

  - MyBatis全局配置文件

    ```xml
    <!--mybatis-config.xml-->
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE configuration
            PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
            "http://mybatis.org/dtd/mybatis-3-config.dtd">
    <configuration>
        <!--引入类路径下的properties配置文件-->
        <properties resource="db.properties"/>
        <environments default="development">
            <environment id="development">
                <transactionManager type="JDBC"/>
                <dataSource type="POOLED">
                    <!--通过${}的形式，动态的读取properties配置文件中的信息-->
                    <property name="driver" value="${jdbc.driver}"/>
                    <property name="url" value="${jdbc.url}"/>
                    <property name="username" value="${jdbc.username}"/>
                    <property name="password" value="${jdbc.password}"/>
                </dataSource>
            </environment>
        </environments>
        <mappers>
            <mapper resource="mapper/EmployeeMapper.xml"/>
        </mappers>
    </configuration>
    ```

- `settings`标签

  用于调整MyBatis的设置项，这些设置会改变MyBatis的运行时行为。可调整的设置项如下：

  | 设置名                           | 描述                                                         | 有效值                                                       | 默认值                                                |
  | :------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :---------------------------------------------------- |
  | cacheEnabled                     | 全局性地开启或关闭所有映射器配置文件中已配置的任何缓存。     | true \| false                                                | true                                                  |
  | lazyLoadingEnabled               | 延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。 特定关联关系中可通过设置 `fetchType` 属性来覆盖该项的开关状态。 | true \| false                                                | false                                                 |
  | aggressiveLazyLoading            | 开启时，任一方法的调用都会加载该对象的所有延迟加载属性。 否则，每个延迟加载属性会按需加载（参考 `lazyLoadTriggerMethods`)。 | true \| false                                                | false （在 3.4.1 及之前的版本中默认为 true）          |
  | multipleResultSetsEnabled        | 是否允许单个语句返回多结果集（需要数据库驱动支持）。         | true \| false                                                | true                                                  |
  | useColumnLabel                   | 使用列标签代替列名。实际表现依赖于数据库驱动，具体可参考数据库驱动的相关文档，或通过对比测试来观察。 | true \| false                                                | true                                                  |
  | useGeneratedKeys                 | 允许 JDBC 支持自动生成主键，需要数据库驱动支持。如果设置为 true，将强制使用自动生成主键。尽管一些数据库驱动不支持此特性，但仍可正常工作（如 Derby）。 | true \| false                                                | False                                                 |
  | autoMappingBehavior              | 指定 MyBatis 应如何自动映射列到字段或属性。 NONE 表示关闭自动映射；PARTIAL 只会自动映射没有定义嵌套结果映射的字段。 FULL 会自动映射任何复杂的结果集（无论是否嵌套）。 | NONE, PARTIAL, FULL                                          | PARTIAL                                               |
  | autoMappingUnknownColumnBehavior | 指定发现自动映射目标未知列（或未知属性类型）的行为。`NONE`: 不做任何反应`WARNING`: 输出警告日志（`'org.apache.ibatis.session.AutoMappingUnknownColumnBehavior'` 的日志等级必须设置为 `WARN`）`FAILING`: 映射失败 (抛出 `SqlSessionException`) | NONE, WARNING, FAILING                                       | NONE                                                  |
  | defaultExecutorType              | 配置默认的执行器。SIMPLE 就是普通的执行器；REUSE 执行器会重用预处理语句（PreparedStatement）； BATCH 执行器不仅重用语句还会执行批量更新。 | SIMPLE REUSE BATCH                                           | SIMPLE                                                |
  | defaultStatementTimeout          | 设置超时时间，它决定数据库驱动等待数据库响应的秒数。         | 任意正整数                                                   | 未设置 (null)                                         |
  | defaultFetchSize                 | 为驱动的结果集获取数量（fetchSize）设置一个建议值。此参数只可以在查询设置中被覆盖。 | 任意正整数                                                   | 未设置 (null)                                         |
  | defaultResultSetType             | 指定语句默认的滚动策略。（新增于 3.5.2）                     | FORWARD_ONLY \| SCROLL_SENSITIVE \| SCROLL_INSENSITIVE \| DEFAULT（等同于未设置） | 未设置 (null)                                         |
  | safeRowBoundsEnabled             | 是否允许在嵌套语句中使用分页（RowBounds）。如果允许使用则设置为 false。 | true \| false                                                | False                                                 |
  | safeResultHandlerEnabled         | 是否允许在嵌套语句中使用结果处理器（ResultHandler）。如果允许使用则设置为 false。 | true \| false                                                | True                                                  |
  | mapUnderscoreToCamelCase         | 是否开启驼峰命名自动映射，即从经典数据库列名 A_COLUMN 映射到经典 Java 属性名 aColumn。 | true \| false                                                | False                                                 |
  | localCacheScope                  | MyBatis 利用本地缓存机制（Local Cache）防止循环引用和加速重复的嵌套查询。 默认值为 SESSION，会缓存一个会话中执行的所有查询。 若设置值为 STATEMENT，本地缓存将仅用于执行语句，对相同 SqlSession 的不同查询将不会进行缓存。 | SESSION \| STATEMENT                                         | SESSION                                               |
  | jdbcTypeForNull                  | 当没有为参数指定特定的 JDBC 类型时，空值的默认 JDBC 类型。 某些数据库驱动需要指定列的 JDBC 类型，多数情况直接用一般类型即可，比如 NULL、VARCHAR 或 OTHER。 | JdbcType 常量，常用值：NULL、VARCHAR 或 OTHER。              | OTHER                                                 |
  | lazyLoadTriggerMethods           | 指定对象的哪些方法触发一次延迟加载。                         | 用逗号分隔的方法列表。                                       | equals,clone,hashCode,toString                        |
  | defaultScriptingLanguage         | 指定动态 SQL 生成使用的默认脚本语言。                        | 一个类型别名或全限定类名。                                   | org.apache.ibatis.scripting.xmltags.XMLLanguageDriver |
  | defaultEnumTypeHandler           | 指定 Enum 使用的默认 `TypeHandler` 。（新增于 3.4.5）        | 一个类型别名或全限定类名。                                   | org.apache.ibatis.type.EnumTypeHandler                |
  | callSettersOnNulls               | 指定当结果集中值为 null 的时候是否调用映射对象的 setter（map 对象时为 put）方法，这在依赖于 Map.keySet() 或 null 值进行初始化时比较有用。注意基本类型（int、boolean 等）是不能设置成 null 的。 | true \| false                                                | false                                                 |
  | returnInstanceForEmptyRow        | 当返回行的所有列都是空时，MyBatis默认返回 `null`。 当开启这个设置时，MyBatis会返回一个空实例。 请注意，它也适用于嵌套的结果集（如集合或关联）。（新增于 3.4.2） | true \| false                                                | false                                                 |
  | logPrefix                        | 指定 MyBatis 增加到日志名称的前缀。                          | 任何字符串                                                   | 未设置                                                |
  | logImpl                          | 指定 MyBatis 所用日志的具体实现，未指定时将自动查找。        | SLF4J \| LOG4J \| LOG4J2 \| JDK_LOGGING \| COMMONS_LOGGING \| STDOUT_LOGGING \| NO_LOGGING | 未设置                                                |
  | proxyFactory                     | 指定 Mybatis 创建可延迟加载对象所用到的代理工具。            | CGLIB \| JAVASSIST                                           | JAVASSIST （MyBatis 3.3 以上）                        |
  | vfsImpl                          | 指定 VFS 的实现                                              | 自定义 VFS 的实现的类全限定名，以逗号分隔。                  | 未设置                                                |
  | useActualParamName               | 允许使用方法签名中的名称作为语句参数名称。 为了使用该特性，你的项目必须采用 Java 8 编译，并且加上 `-parameters` 选项。（新增于 3.4.1） | true \| false                                                | true                                                  |
  | configurationFactory             | 指定一个提供 `Configuration` 实例的类。 这个被返回的 Configuration 实例用来加载被反序列化对象的延迟加载属性值。 这个类必须包含一个签名为`static Configuration getConfiguration()` 的方法。（新增于 3.2.3） | 一个类型别名或完全限定类名。                                 | 未设置                                                |
  | shrinkWhitespacesInSql           | 从SQL中删除多余的空格字符。请注意，这也会影响SQL中的文字字符串。 (新增于 3.5.5) | true \| false                                                | false                                                 |
  | defaultSqlProviderType           | Specifies an sql provider class that holds provider method (Since 3.5.6). This class apply to the `type`(or `value`) attribute on sql provider annotation(e.g. `@SelectProvider`), when these attribute was omitted. | A type alias or fully qualified class name                   | Not set                                               |

  示例——开启驼峰命名自动映射：

  ```xml
  <settings>
      <!--
      	假设Java对象的属性名是aColumn，对应的数据库列名为a_column
      	那么开启该配置，也能将数据库中a_column字段的值映射到Java对象的aColumn属性
      	默认该配置是不开启，所以默认情况下是无法映射成功
      -->
      <setting name="mapUnderscoreToCamelCase" value="true"/>
  </settings>
  ```

- `typeAliases`标签

   可以为Java类型起别名，它仅用于 XML 配置，意在降低冗余的全限定类名书写

  示例：

  - 为某个Java类型起别名

    ```xml
    <typeAliases>
        <!--
    		type:指定要起别名的java类型的全限定名
    		alias：指定新的别名（没有指定该属性，则默认别名为类名小写，即employee
    	-->
        <typeAlias type="site.potatoblog.bean.Employee" alias="emp"/>
    </typeAliases>
    ```

  - 为某个包下的所有类批量起别名

    ```xml
    <typeAliases>
        <!--
    		package:为某个包下的所有类批量起默认别名，都为类名小写
    		name：指定包名
    		注意：如果指定包下的子包有同名类，则会出错
    	-->
        <package name="site.potatoblog.bean"/>
    </typeAliases>
    ```

  - 使用注解`@Alias`注解为某个类型指定新的别名

    ```java
    @Alias("emp")
    public class Employee {}
    ```

  注：MyBatis已经为Java内置的一些类型起了别名，比如基本数据类型等

- `typeHandlers`标签

  类型处理器。MyBatis 在设置SQL语句中的参数或从结果集中取出一个值时， 都会用类型处理器将获取到的值以合适的方式转换成 Java 类型

  我们可以重写或者创建一个类型处理器来处理不支持的或非标准的类型，然后通过`typeHandlers`标签将自定义的类型处理器注册到MyBatis的全局配置文件中

- `plugins`标签

  插件。MyBatis 允许你在映射语句执行过程中的某一点进行拦截调用，然后通过插件增强该功能

  我们可以自定义一个插件，然后通过`plugins`标签将插件注册到MyBatis全局配置文件中

- `environments`标签

  用于为MyBatis配置多种环境，该机制有助于将SQL映射应用于多种数据库之中

  示例：

  ```xml
  <!--
  	environments：包含多种环境，属性default指定默认使用某种环境，可以通过更改default达到快速切换环境的效果
  	environment：配置一个具体的环境信息，属性id是对该具体环境的一个唯一标识
  	environment标签必须包含两个子标签：
  		transactionManager：事务管理器，属性type有三种取值：
  			JDBC:JdbcTransactionFactory类型的别名
  			MANAGER：ManagedTransactionFactory类型的别名
  			自定义事物管理器（通过实现TransactionFactory接口）
  		dataSource：数据源，属性type四种取值：
  			UNPOOLED:这个数据源的实现会每次请求时打开和关闭连接
  			POLLED:这种数据源的实现利用连接池将JDBC连接对象组织起来，避免了创建新的连接实例时所必需的初始化和认证时间
  			JNDI:这个数据源实现是为了能在如EJB或应用服务器这类容器中使用，容器可以集中或在外部配置数据源，然后放置一个JNDI上下文的数据源引用
  			自定义数据源（通过实现DataSourceFactory接口）		
  -->
  <environments default="development">
      <environment id="development">
          <transactionManager type="JDBC"/>
          <dataSource type="POOLED">
              <property name="driver" value="${jdbc.driver}"/>
              <property name="url" value="${jdbc.url}"/>
              <property name="username" value="${jdbc.username}"/>
              <property name="password" value="${jdbc.password}"/>
          </dataSource>
      </environment>
      <environment id="test">
          <transactionManager type="MANGER"/>
          <dataSource type="JNDI">
          </dataSource>
      </environment>
  </environments>
  ```

- `databaseIdProvider`标签

  用于支持多数据库厂商

  - 属性`type`：固定值为`DB_VENDOR`，是`VendorDatabaseIdProvider`类型的别名，其会将 `databaseId` 设置为 `DatabaseMetaData#getDatabaseProductName()` 返回的字符串，即返回数据库厂商的标识

  示例：

  - MyBatis全局配置文件（部分）

    ```xml
    <databaseIdProvider type="DB_VENDOR">
        <!--
    		为不同数据库厂商标识起别名
    	-->
        <property name="MySQL" value="mysql"/>
        <property name="Oracle" value="oracle"/>
        <property name="SQL Server" value="sqlserver"/>
    </databaseIdProvider>
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.EmployeeMapper">
        	<!--
    			在select标签中的databaseId属性设置数据库厂商
    			MyBatis可以根据不同的数据库厂商执行不同的语句
    			如果同时找到带有databaseId和不带databaseId的相同语句，则后者会被舍弃
    		-->
            <select id="selectEmployee" resultType="site.potatoblog.bean.Employee" databaseId="mysql">
                select * from employee where id = #{id};
            </select>
            <select id="selectEmployee" resultType="site.potatoblog.bean.Employee" databaseId="oracle">
                select * from employee where id = #{id};
            </select>
                <select id="selectEmployee" resultType="site.potatoblog.bean.Employee">
                select * from employee where id = #{id};
            </select>
    </mapper>
    ```

- `mappers`标签

  用于将SQL映射文件注册到MyBatis全局配置文件中

  - 子标签`mapper`

    配置具体的SQL文件路径

    - 属性`url`

      引入网络路径或者磁盘路径下的SQL映射文件

    - 属性`resource`

      引入类路径下的SQL映射文件

    - 属性`class`

      引入与SQL映射文件绑定的接口（接口的全限定名）

      - 使用该属性注册，如果有SQL映射文件，则SQL映射文件名与接口必须同名，且与接口处于同一目录下
      - 使用该属性注册，如果没有SQL映射文件，则所有的SQL语句都是利用注解写在接口上

  - 子标签`package`

    批量注册包下所有与映射文件绑定（或者带SQL语句的注解）的接口

  示例：

  - 使用`mapper`标签的属性`class`引入接口：

    MyBatis全局配置文件（部分）

    ```xml
    <mappers>
        <mapper class="site.potatoblog.dao.EmployeeMapper"/>
    </mappers>
    ```

    - 有映射文件

      - 映射文件与绑定的接口处于同一目录下

        ![image-20210530081403292](/static/img/image-20210530081403292.png)

      - idea默认扫描resources里面的mapper文件，所以还需要在`pom.xml`中添加如下代码，让idea把java包下的mapper文件也扫描一下：

        ```xml
        <build>
            <resources>
                <resource>
                    <directory>src/main/java</directory>
                    <includes>
                        <include>**/*.xml</include>
                    </includes>
                </resource>
            </resources>
        </build>
        ```

    - 无映射文件（使用注解）

      利用注解，将SQL语句绑定到接口上

      ```java
      package site.potatoblog.dao;
      
      import org.apache.ibatis.annotations.Select;
      import site.potatoblog.bean.Employee;
      
      public interface EmployeeMapper {
          //使用Select注解封装SQL语句
          @Select("select * from employee where id = #{id}")
          Employee selectEmployee(Integer id);
      }
      ```

  - 使用`package`标签批量注册

    MyBatis全局配置文件（部分）

    ```xml
    <mappers>
        <package name="site.potatoblog.dao"/>
    </mappers>
    ```

    - 有映射文件

      映射文件要放在扫描包下

    - 无映射文件（使用注解）

      利用注解，将SQL语句绑定到接口上

  推荐：

  -  重要的，复杂的Dao接口，我们编写SQL映射文件
  - 不重要的，简单的Dao接口，为了开发快速可以使用注解

## 3.MyBatis-映射文件

- 增删改查示例

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.EmployeeMapper">
        	<!--
    			查询语句
    		-->
            <select id="getEmpById" resultType="site.potatoblog.bean.Employee">
                select * from employee where id = #{id};
            </select>
         	<!--
    			插入语句
    			参数parameterType，指定传入的参数类型，可以省略
    		-->   	
            <insert id="addEmp" parameterType="site.potatoblog.bean.Employee">
                insert into employee(last_name,gender,email) values(#{lastName},#{gender},#{email})
            </insert>
        	<!--
    			更新语句
    		-->    
            <update id="updateEmp">
                update employee set last_name=#{lastName},gender=#{gender},email=#{email} where id=#{id}
            </update>
        	<!--
    			删除语句
    		-->   
            <delete id="deleteEmpById">
                delete from employee where id=#{id}
            </delete>
    </mapper>
    ```

  - `EmployeeMapper`接口

    ```java
    package site.potatoblog.dao;
    import site.potatoblog.bean.Employee;
    
    public interface EmployeeMapper {
        Employee getEmpById(Integer id);
        void addEmp(Employee employee);
        void updateEmp(Employee employee);
        void deleteEmpById(Integer id);
    }
    ```

  - 测试

    ```java
    /**
     * 测试增删改查
     * 1.MyBatis允许增删改语句绑定的方法直接定义以下类型返回值
     *     void
     *     Integer、Long：表示增删改操作影响的行数
     *     Boolean：如果增删改操作影响的行数大于0，则返回true，否则返回false
     * 2.对于增删改操作，我们需要手动提交事务
     *   也可以在创建SqlSession实例时，设置为自动提交事务：
     *   SqlSession openSession = sqlSessionFactory.openSession(true);
     */
    @Test
    public void test02() throws IOException{
        String resource = "conf/mybatis-config.xml";
        InputStream inputStream = Resources.getResourceAsStream(resource);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
        SqlSession openSession = sqlSessionFactory.openSession();
        try {
            EmployeeMapper mapper = openSession.getMapper(EmployeeMapper.class);
            //测试添加
            //mapper.addEmp(new Employee(null,"jerry","男","jerry@qq.com"));
            //测试删除
            //mapper.deleteEmpById(7);
            //测试更新
            //mapper.updateEmp(new Employee(1,"jerry","女","jerry@qq.com"));
            //测试查找
            //Employee employee=mapper.getEmpById(1);
            //System.out.println(employee);
            //手动提交事务
            openSession.commit();
        }finally {
            openSession.close();
        }
    }
    ```

- `insert`/`update`标签获取主键的值

  - 获取自增主键的值

    通过`insert`/`update`标签中的属性实现：

    - 属性`useGeneratedKeys`

      默认为`false`，设置为`true`时，MyBatis会使用 JDBC 的 `getGeneratedKeys` 方法来取出由数据库内部生成的主键值

    - 属性`keyProperty`

      指定与主键对应的Java Bean属性，MyBatis会使用`getGeneratedKeys`的返回值设置它的值

    示例：

    - SQL映射文件

      ```xml
      <?xml version="1.0" encoding="utf-8" ?>
      <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
      <mapper namespace="site.potatoblog.dao.EmployeeMapper">
              <insert id="addEmp" parameterType="site.potatoblog.bean.Employee" useGeneratedKeys="true" keyProperty="id">
                  insert into employee(last_name,gender,email) values(#{lastName},#{gender},#{email})
              </insert>
      </mapper>
      ```

    - 测试

      ```java
      @Test
      public void test03() throws IOException{
          String resource = "conf/mybatis-config.xml";
          InputStream inputStream = Resources.getResourceAsStream(resource);
          SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
          SqlSession openSession = sqlSessionFactory.openSession();
          try {
              EmployeeMapper mapper = openSession.getMapper(EmployeeMapper.class);
              Employee employee=new Employee(null,"tom","男","tom@qq.com");
              mapper.addEmp(employee);
              //完成添加操作后，MyBatis会将取出的主键值封装到对应JavaBean属性中
              //此时employee中的id值便不再为空
              System.out.println(employee.getId());
              openSession.commit();
          }finally {
              openSession.close();
          }
      }
      ```

  - 获取非自增主键值

    通过`insert`/`update`标签中的子标签实现：

    - `selectKey`标签

      用于编写查询主键的SQL语句

    示例：

    - SQL映射文件

      ```xml
      <?xml version="1.0" encoding="utf-8" ?>
      <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
      <mapper namespace="site.potatoblog.dao.EmployeeMapper">
              <insert id="addEmp" parameterType="site.potatoblog.bean.Employee">
                  <selectKey keyProperty="id" order="AFTER" resultType="Integer">
                      <!--
      					order="AFTER"：当前selectKey标签会在插入sql语句之后运行
      					此处一般编写从主键序列中获取当前主键值，然后封装到对应的JavaBean属性
      				-->
                  </selectKey>
                  insert into employee(id,last_name,gender,email) values(#{从主键序列中取主键},#{lastName},#{gender},#{email})
              </insert>
                  <insert id="addEmp" parameterType="site.potatoblog.bean.Employee">
                  <selectKey keyProperty="id" order="BEFORE" resultType="Integer">
                      <!--
      					order="BEFORE"：当前selectKey标签会在插入sql语句之前运行
      					此处一般编写从主键序列中获取下一个主键值，然后封装到对应的JavaBean属性
      					之后在插入sql语句执行时，就直接从JavaBean属性中取出对应的id值
      				-->
                  </selectKey>
                  insert into employee(id,last_name,gender,email) values(#{id},#{lastName},#{gender},#{email})
              </insert>
      </mapper>
      ```

- 参数处理规则

  MyBatis会根据传入的参数个数、类型的不同，采取不同的处理，使得参数的值能正确传入到SQL语句中	

  - 单个参数

    如果传入的是单个参数，MyBatis不做任何特殊处理

    取值：此时我们可以在SQL语句中通过`#{任意值}`取出参数（因为是单个参数，所以`#{}`中的内容仅充当占位符的作用，可以填入参数名，也可以填入其他值）

    示例：

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.EmployeeMapper">
        	<!--
    			以下两种形式的SQL语句都能正确的取出参数值
    		-->
            <select id="getEmpById" resultType="site.potatoblog.bean.Employee">
                select * from employee where id = #{id};
            </select>
        	<select id="getEmpById" resultType="site.potatoblog.bean.Employee">
                select * from employee where id = #{abc};
            </select>
    </mapper>
    ```

  - 多个参数

    如果传入的是多个参数，MyBatis会将这些参数封装到一个Map对象中：

    - 默认情况

      默认情况下，多个参数会被封装成一个个键值对保存在Map对象中，MyBatis会根据每个参数传入的顺序进行编号并加上固定前缀`param`和`arg` 作为这个参数的键`key`（param1...paramN，和arg0...argN），值`value`为传入的参数值

      取值：向`#{}`中填入参数对应的`key`，来从Map对象中取出相应的参数值

      示例：

      ```xml
      <?xml version="1.0" encoding="utf-8" ?>
      <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
      <mapper namespace="site.potatoblog.dao.EmployeeMapper">
          <!--以下两种形式的SQL语句都能正确的取出参数值-->
          <!--MyBatis会为每个参数值都设置两个key，一个是param前缀开头，一个是arg开头的-->
          <select id="getEmpByIdAndGender" resultType="site.potatoblog.bean.Employee">
                  select * from employee where id=#{arg0} and gender=#{arg1}
              </select>
          <select id="getEmpByIdAndGender" resultType="site.potatoblog.bean.Employee">
                  select * from employee where id=#{param0} and gender=#{param1}
              </select>
      </mapper>
      ```

    - 使用注解命名参数

      默认情况下，每个参数的固定`key`为`paramN`和`argN`，这会使得代码难以阅读。所以通常我们都需要在接口方法参数的声明处，使用`@Param`注解来为传入的参数设置键名，这样MyBatis在将参数封装到Map对象中的时候，会把参数对应的键名改为`@Param`注解中的值

      取值：向`#{}`中填入参数对应的`@Param`注解设置的键名，来从Map对象中取出相应的参数值

      注意：如果使用注解设置了参数的键名，那么MyBatis原生的固定键名（`argN`）就不再起作用（`paramN`还可以）

      示例：

      - `EmployeeMapper`接口

        ```java
        package site.potatoblog.dao;
        import org.apache.ibatis.annotations.Param;
        import site.potatoblog.bean.Employee;
        
        public interface EmployeeMapper {
            //使用@Param注解，为传入的参数设置键名
            Employee getEmpByIdAndGender(@Param("id")Integer id,@Param("gender")String gender);
        }
        ```

      - SQL映射文件

        ```xml
        <?xml version="1.0" encoding="utf-8" ?>
        <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
        <mapper namespace="site.potatoblog.dao.EmployeeMapper">
            <!--使用注解后，取出参数值时，应该传入@Param注解中设置的键名-->
            <select id="getEmpByIdAndGender" resultType="site.potatoblog.bean.Employee">
                select * from employee where id=#{id} and gender=#{gender}
            </select>
        </mapper>
        ```

  - 参数类型是普通Java Bean

    如果多个参数恰好是业务逻辑的数据模型，我们可以直接传入业务模型中对应的Java Bean

    取值：`#{Java Bean中的属性名}`即可取出传入的Java Bean的属性值

    示例：

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.EmployeeMapper">
        <!--
    		传入的是Employee对象
    		取出参数值是按属性名取值
    	-->
        <insert id="addEmp" parameterType="site.potatoblog.bean.Employe">
        insert into employee(last_name,gender,email) values(#{lastName},#{gender},#{email})
        </insert>
    </mapper>
    ```

  - 参数类型是Map对象

    如果多个参数不是业务逻辑的数据模型，没有对应的Java Bean，我们也可以将多个参数封装到一个Map对象并传入

    取值：`#{键名}`即可取出传入的Map对象键名对应的`value`值

    示例：

    - `EmployeeMapper`接口

      ```java
      package site.potatoblog.dao;
      import site.potatoblog.bean.Employee;
      import java.util.Map;
      
      public interface EmployeeMapper {
          Employee getEmpByIdAndGender(Map<String,Object> map);
      }
      ```

    - SQL映射文件

      ```xml
      <?xml version="1.0" encoding="utf-8" ?>
      <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
      <mapper namespace="site.potatoblog.dao.EmployeeMapper">
          <!--
      		传入的是Map对象
      		取出参数值是按键取值
      	-->
          <select id="getEmpByIdAndGender" resultType="site.potatoblog.bean.Employee">
              select * from employee where id=#{id} and gender=#{gender}
          </select>
      </mapper>
      ```

    - 测试

      ```java
      @Test
      public void test05() throws IOException {
          String resource = "conf/mybatis-config.xml";
          InputStream inputStream = Resources.getResourceAsStream(resource);
          SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
          SqlSession openSession = sqlSessionFactory.openSession();
          try {
              EmployeeMapper mapper = openSession.getMapper(EmployeeMapper.class);
              Map<String,Object> map=new HashMap<>();
              //将多个参数封装到Map对象中去
              map.put("id",1);
              map.put("gender","女");
              Employee employee=mapper.getEmpByIdAndGender(map);
              System.out.println(employee);
              openSession.commit();
          }finally {
              openSession.close();
          }
      }
      ```

  - 参数类型是Collection（List、Set）类型或者是数组

    如果传入的参数是参数类型是Collection类型或者数组，MyBatis也会将该参数封装到Map中，并且设置它的键名为`collection`。如果是List类型，MyBatis还会再为其设置一个键名为`list`；如果是数组，MyBatis还会再为其设置一个键名为`array`

    取值：`#{键名[索引]}`即可取出Collection类型或数组中的对应索引的参数值

    示例：

    - `EmployeeMapper`接口

      ```java
      package site.potatoblog.dao;
      import site.potatoblog.bean.Employee;
      import java.util.List;
      
      public interface EmployeeMapper {
          Employee getEmpByIdAndGender(List<Object> list);
      }
      ```

    - SQL映射文件

      ```xml
      <?xml version="1.0" encoding="utf-8" ?>
      <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
      <mapper namespace="site.potatoblog.dao.EmployeeMapper">
          <select id="getEmpByIdAndGender" resultType="site.potatoblog.bean.Employee">
              select * from employee where id=#{collection[0]} and gender=#{list[1]}
          </select>
      </mapper>
      ```

    - 测试

      ```java
      @Test
      public void test06() throws IOException {
          String resource = "conf/mybatis-config.xml";
          InputStream inputStream = Resources.getResourceAsStream(resource);
          SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
          SqlSession openSession = sqlSessionFactory.openSession();
          try {
              EmployeeMapper mapper = openSession.getMapper(EmployeeMapper.class);
              List<Object> list=new ArrayList<>();
              list.add(1);
              list.add("女");
              Employee employee=mapper.getEmpByIdAndGender(list);
              System.out.println(employee);
              openSession.commit();
          }finally {
              openSession.close();
          }
      } 
      ```

  - 参数值的获取

    -  `#{}`：以预编译的形式，将参数设置到SQL语句中，防止SQL注入
    - `${}`：直接取出参数的值拼装在SQL语句中，会有安全问题

- `select`标签

  - 属性`resultType`

    返回值类型

    - 如果返回的是集合类型，`resultType`应该设置成集合中元素的类型

      示例：

      - `EmployeeMapper`接口

        ```java
        package site.potatoblog.dao;
        import site.potatoblog.bean.Employee;
        import java.util.List;
        
        public interface EmployeeMapper {
            //返回的是集合类型
            List<Employee> getAll();
        }
        ```

      - SQL映射文件

        ```xml
        <?xml version="1.0" encoding="utf-8" ?>
        <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
        <mapper namespace="site.potatoblog.dao.EmployeeMapper">
            <!--resultType应该设置成集合类型的元素类型-->
            <select id="getAll" resultType="site.potatoblog.bean.Employee">
                select * from employee
            </select>
        </mapper>
        ```

    - 如果返回的是Map类型：

      - 如果返回的记录只有一条，`resultType`应设置成`map`（MyBatis给Map的全限定名取的缩写），其中返回的Map对象，`key`为列名，`value`为列名对应的值

        示例：

        - `EmployeeMapper`接口

          ```java
          package site.potatoblog.dao;
          import site.potatoblog.bean.Employee;
          import java.util.Map;
          
          public interface EmployeeMapper {
              Map<String,Object> getMapById(Integer id);
          }
          ```

        - SQL映射文件

          ```xml
          <?xml version="1.0" encoding="utf-8" ?>
          <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
          <mapper namespace="site.potatoblog.dao.EmployeeMapper">
              <!--resultType应设置成map-->
              <select id="getMapById" resultType="map">
                  select * from employee where id=#{id}
              </select>
          </mapper>
          ```

      - 如果返回的记录是多条，并且希望以每条记录中的某一列名对应的值作为`key`，`value`为每条记录封装后的Java Bean，此时`resultType`应设置成记录封装后的Java Bean类型，并且在接口方法声明处，使用`@MapKey`注解来指定相应的`key`

        - `EmployeeMapper`接口

          ```java
          package site.potatoblog.dao;
          import org.apache.ibatis.annotations.MapKey;
          import org.apache.ibatis.annotations.Param;
          import site.potatoblog.bean.Employee;
          
          import java.util.List;
          import java.util.Map;
          
          public interface EmployeeMapper {
              //告诉MyBatis将返回结果封装为Map时，以每条记录封装为Employee对象后的id属性值作为Map的key
              @MapKey("id")
              Map<Integer,Employee> getAllAsMap();
          }
          ```

        - SQL映射文件

          ```xml
          <?xml version="1.0" encoding="utf-8" ?>
          <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
          <mapper namespace="site.potatoblog.dao.EmployeeMapper">
              <!--
          		由于是多条记录，resultType应设为元素类型
          		最后在封装为Map时，通过@MapKey注解指定的属性名
          		以元素类型中对应的属性值作为key
          	-->
              <select id="getAllAsMap" resultType="site.potatoblog.bean.Employee">
                  select * from employee
              </select>
          </mapper>
          ```

  - 属性`resultMap`

    属性`resultType`会根据MyBatis的自动映射规则，将结果集封装到对应的类型中，但是有时候自动映射规则并不能满足我们的需求，此时就需要`resultMap`（注意，`resultMap`和`resultType`不可以同时使用），其值应是某个`resultMap`标签的唯一标识符

- `resultMap`标签

  用于自定义结果集的映射规则

  - 普通映射
    - 属性`type`

      表示结果集最终要封装成的Java Bean类型

    - 属性`id`

      该`resultMap`标签的唯一标识符

    - 子标签`id`

      用于定义主键列的封装规则

    - 子标签`result`

      用于定义普通列的封装规则

    `resultMap`标签的每一个子标签都有两个属性用于完成结果集到Java Bean的映射：

    - 属性`column`

      指定结果集中的列名

    - 属性`property`

      指定Java Bean中的属性名

    示例：

    - `EmployeeMapper`接口

      ```java
      package site.potatoblog.dao;
      import site.potatoblog.bean.Employee;
      
      public interface EmployeeMapper {
          Employee getEmpByResultMap(Integer id);
      }
      ```

    - SQL映射文件

      ```xml
      <?xml version="1.0" encoding="utf-8" ?>
      <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
      <mapper namespace="site.potatoblog.dao.EmployeeMapper">
          <!--自定义结果集映射规则-->
          <resultMap id="MyEmp" type="site.potatoblog.bean.Employee">
              <id column="id" property="id"/>
              <result column="last_name" property="lastName"/>
              <result column="email" property="email"/>
              <result column="gender" property="gender"/>
          </resultMap>
          <!--使用resultMap属性，指定某个具体的结果集映射规则-->
          <select id="getEmpByResultMap" resultMap="MyEmp">
              select * from  employee where id=#{id}
          </select>
      </mapper>
      ```

  - 高级映射

    - Java Bean类型的属性封装

      场景分析：`Employee`对象中还包含了`Department`对象，我们希望通过多表（`employee`表和`department`表）连接查询，将取出的员工信息封装到`Employee`对象中，取出的部门信息封装到`Employee`对象中的`Department`对象

      示例：

      - `Employee`类

        ```java
        package site.potatoblog.bean;
        
        public class Employee {
            private Integer id;
            private String lastName;
            private String gender;
            private Department department;
        }
        ```

      - `Department`类

        ```java
        package site.potatoblog.bean;
        
        public class Department {
            private Integer id;
            private String deptName;
        }
        ```
        - 方法一：通过级联属性（`Employee`对象中的`Department`对象的属性就相当于级联属性）实现

          - `EmployeeMapper`接口

            ```java
            package site.potatoblog.dao;
            import site.potatoblog.bean.Employee;
            
            public interface EmployeeMapper {
                Employee getEmpAndDept(Integer id);
            }
            ```

          - SQL映射文件

            ```xml
            <?xml version="1.0" encoding="utf-8" ?>
            <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
            <mapper namespace="site.potatoblog.dao.EmployeeMapper">
                <resultMap id="MyDifEmp" type="site.potatoblog.bean.Employee">
                    <id column="id" property="id"/>
                    <result column="lastName" property="lastName"/>
                    <result column="gender" property="gender"/>
                    <!--
                如果Java Bean中的属性也是一个Java Bean，则可以通过属性名.级联属性名的形式，将结果集映射到对应的属性中去
                将结果集中的did的值映射到级联属性department.id
                将结果集中的deptName的值映射到级联属性department.deptName
               -->
                    <result column="did" property="department.id"/>
                    <result column="deptName" property="department.deptName"/>
                </resultMap>
                <select id="getEmpAndDept" resultMap="MyDifEmp">
                    select e.id id,e.last_name lastName,e.gender gender,e.d_id did,d.id did,d.dept_name deptName from employee e,department d where e.d_id=d.id AND e.id=#{id}
                </select>
            </mapper>
            ```

        - 方法二：通过`association`子标签实现

          - `association`子标签

            用于定义当前封装的对象需要关联的Java Bean对象的封装规则

            - 属性`property`

              指定当前对象的哪个属性是属于关联对象的

            - 属性`javaType`（不可省略）

              需要关联的Java Bean对象的类型

          - `EmployeeMapper`接口

            ```java
            package site.potatoblog.dao;
            import site.potatoblog.bean.Employee;
            
            public interface EmployeeMapper {
                Employee getEmpAndDept(Integer id);
            }
            ```

          - SQL映射文件

            ```xml
            <?xml version="1.0" encoding="utf-8" ?>
            <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
            <mapper namespace="site.potatoblog.dao.EmployeeMapper">
                <resultMap id="MyDifEmp" type="site.potatoblog.bean.Employee">
                    <id column="id" property="id"/>
                    <result column="lastName" property="lastName"/>
                    <result column="gender" property="gender"/>
                    <!--
                		定义Employee对象的属性department的封装规则
                		因为属性department是Department对象，所以指定javaType为Department类的全限定名
                		此时，在association标签内部，结果集对应字段的值应该映射到关联对象中的属性
                		比如字段did应该映射到关联对象属性名为id的属性
               		-->
                    <association property="department" javaType="site.potatoblog.bean.Department">
                        <id column="did" property="id"/>
                        <result column="deptName" property="deptName"/>
                    </association>
                </resultMap>
                <select id="getEmpAndDept" resultMap="MyDifEmp">
                    select e.id id,e.last_name lastName,e.gender gender,e.d_id did,d.id did,d.dept_name deptName from employee e,department d where e.d_id=d.id AND e.id=#{id}
                </select>
            </mapper>
            ```

    -  集合类型的属性封装

      场景分析：`Department`对象中包含了一个`List<Employee>`类型的属性，用来存储该部门下的所有员工信息，我们可以通过多表连接查询，将取出的员工信息封装到`Department`对象的集合属性中，取出的部门信息封装到`Department`对象

      示例：

      - `Employee`类

        ```java
        package site.potatoblog.bean;
        public class Employee {
            private Integer id;
            private String lastName;
            private String gender;
        }
        ```

      - `Department`类

        ```java
        package site.potatoblog.bean;
        
        public class Department {
            private Integer id;
            private String deptName;
            private List<Employee> employees;
        }
        ```

        - 方法：通过`collection`子标签实现

          - `collection`子标签

            用于定义集合类型属性的封装规则

            - 属性`property`

              指定当前对象的哪个属性是属于集合类型的

            - 属性`ofType`

              指定集合中的元素类型

          - `EmployeeMapper`接口

            ```java
            package site.potatoblog.dao;
            import site.potatoblog.bean.Department;
            
            public interface EmployeeMapper {
                Department getDeptById(Integer id);
            }
            ```

          - SQL映射文件

            ```xml
            <?xml version="1.0" encoding="utf-8" ?>
            <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
            <mapper namespace="site.potatoblog.dao.EmployeeMapper">
                <resultMap id="MyDept" type="site.potatoblog.bean.Department">
                    <id column="id" property="id"/>
                    <result column="deptName" property="deptName"/>
                    <!--
            			指定当前Department对象的employees属性是集合类型，并且ofType属性指定了该集合中的元素类				型是Employee类型
                   		此时，在collection标签内部，结果集对应字段的值应该映射到指定的集合元素类型对象中的属性
                		比如字段eid应该映射到集合元素类型对象属性名为id的属性
            		-->
                    <collection property="employees" ofType="site.potatoblog.bean.Employee">
                        <id column="eid" property="id"/>
                        <result column="lastName" property="lastName"/>
                        <result column="gender" property="gender"/>
                    </collection>
                </resultMap>
                <select id="getDeptById" resultMap="MyDept">
                    select e.id eid,e.last_name lastName,e.gender gender,e.d_id id,d.id id,d.dept_name deptName from employee e,department d where e.d_id=d.id AND d.id=#{id}
                </select>
            </mapper>
            ```

    - 分步查询

      场景分析

      1. 先按照员工`id`查询员工信息
      2. 根据查询到的员工信息中的部门`id`去部门表中查出部门信息
      3. 最后将部门信息和员工信息封装到`Employee`对象中

      该场景可以通过`association`子标签中的`select`属性实现（如果是集合类型的属性，也可以通过`collection`子标签的`select`属性实现）：

      - 属性`select`

        指定某个查询标签的唯一标识符。`association`标签会执行该查询标签对应的SQL语句，并将返回的结果集自动封装到属性`property`指定的对象属性中

      示例：

      - `EmployeeMapper`接口

        ```java
        package site.potatoblog.dao;
        import site.potatoblog.bean.Department;
        import site.potatoblog.bean.Employee;
        
        public interface EmployeeMapper {
            Employee getEmpByStep(Integer id);
            Department getDept(Integer id);
        }
        ```

      - SQL映射文件

        ```xml
        <?xml version="1.0" encoding="utf-8" ?>
        <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
        <mapper namespace="site.potatoblog.dao.EmployeeMapper">
            <resultMap id="MyEmpByStep" type="site.potatoblog.bean.Employee">
                <id column="id" property="id"/>
                <result column="last_name" property="lastName"/>
                <result column="gender" property="gender"/>
                <!--
                    通过select属性，执行getDept这个select标签的SQL语句，属性column指定将当前结果集中的d_id的值作			  为参数传入
                    最终返回的结果集会自动封装到属性property指定的对象属性中，即Department对象
        			注意：如果指定的select标签的SQL语句需要传入多个参数，可以将多列的值封装成map传递过去，比如 	column={id=d_id}。取值时，按键名取即可，比如#{id}
          		 -->
                <association property="department" select="getDept" column="d_id"/>
            </resultMap>
            <select id="getEmpByStep" resultMap="MyEmpByStep">
                select * from employee where id=#{id}
            </select>
            <select id="getDept" resultType="site.potatoblog.bean.Department">
                select id,dept_name deptName from department where id=#{id}
            </select>
        </mapper>
        ```

      优化：

       上述分步查询员工信息的方法，每次调用都会执行两条SQL语句：

      1. 按照员工`id`查询员工信息
      2. 根据查询到的员工信息中的部门`id`去部门表中查出部门信息

      我们可以在全局配置文件中开启`lazyLoadingEnabled`（延迟加载所有关联对象属性）设置，并关闭`aggressiveLazyLoading`（立即加载所有关联对象属性）设置，这样每次查询员工信息，只会执行第一条SQL语句，只有在关联对象属性被使用到时，第二条SQL语句才会按需加载

      对于开启`lazyLoadingEnabled`设置，我们也可以在特定关联关系的标签中通过设置 `fetchType` 属性（`lazy`：懒加载/`eager`：立即执行）来覆盖该项的开关状态

    - 动态改变封装行为

      场景分析：查询某个员工信息然后根据某列的值做出不同的封装行为

      示例：

      - 方法：通过`discriminator`子标签实现

        - `discriminator`子标签

          用于判定某列的值，然后根据某列的值改变封装行为

          - 属性`javaType`：列值对应的java类型
          - 属性`column`：指定判定的列名

      - `EmployeeMapper`接口

        ```java
        package site.potatoblog.dao;
        import site.potatoblog.bean.Employee;
        
        public interface EmployeeMapper {
            Employee getEmpByDescri(Integer id);
        }
        ```

      - SQL映射文件

        ```xml
        <?xml version="1.0" encoding="utf-8" ?>
        <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
        <mapper namespace="site.potatoblog.dao.EmployeeMapper">
            <resultMap id="MyDescri" type="site.potatoblog.bean.Employee">
                <!--
        			使用discriminator子标签判定当前查出的员工性别是否为男：
        				1：如果是，将结果集last_name字段映射到Employee的gender属性
        				2：否则，就自动映射
        		-->
                <discriminator javaType="string" column="gender">
                    <case value="女" resultType="site.potatoblog.bean.Employee"/>
                    <case value="男" resultType="site.potatoblog.bean.Employee">
                        <result column="last_name" property="gender"/>
                    </case>
                </discriminator>
            </resultMap>
            <select id="getEmpByDescri" resultMap="MyDescri">
                select * from employee where id=#{id}
            </select>
        </mapper>
        ```

### 源码解析—参数处理规则

MyBatis对于参数的处理规则都封装在`ParamNameResolver`类中，其核心源码如下：

```java
package org.apache.ibatis.reflection;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.binding.MapperMethod.ParamMap;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;

public class ParamNameResolver {
  //固定名称前缀param
  private static final String GENERIC_NAME_PREFIX = "param";
  /**
  	*成员变量names是一个Map对象，键key保存的是传入参数的顺序，值value要分多种情况考虑：
    *1、@Param注解的值   2、传入的参数名   3、 names的元素个数，相当于当前元素的索引
    */
  private final SortedMap<Integer, String> names;
  //标识是否有使用@Param注解   
  private boolean hasParamAnnotation;

  //ParamNameResolver类的构造器，用于保存传入参数的顺序和确定参数取值时对应的键名
  public ParamNameResolver(Configuration config, Method method) {
    //获取所有参数的类型
    final Class<?>[] paramTypes = method.getParameterTypes();
    //获取所有参数的注解
    final Annotation[][] paramAnnotations = method.getParameterAnnotations();
    final SortedMap<Integer, String> map = new TreeMap<>();
    int paramCount = paramAnnotations.length;
    //循环遍历
    for (int paramIndex = 0; paramIndex < paramCount; paramIndex++) {
      //跳过特殊参数
      if (isSpecialParameter(paramTypes[paramIndex])) {
        continue;
      }
      String name = null;
      //循环遍历当前参数的每一个注解，判断当前参数是否有使用@Param注解
      for (Annotation annotation : paramAnnotations[paramIndex]) {
        //如果当前注解是Param类型的
        if (annotation instanceof Param) {
          //则将hasParamAnnotation标识置为true
          hasParamAnnotation = true;
         //然后取出@Param注解的值赋给name变量
          name = ((Param) annotation).value();
          break;
        }
      }
      //如果name变量为空，说明当前参数没有使用@Param注解
      if (name == null) {
        //如果MyBatis全局配置文件中配置了isUseActualParamName选项
        if (config.isUseActualParamName()) {
          //则将当前参数的名字赋给name变量
          name = getActualParamName(method, paramIndex);
        }
        //如果既没有配置也没有使用注解
        if (name == null) {
          //则name变量的值为当前map的元素个数，即自身插入到map中的索引
          name = String.valueOf(map.size());
        }
      }
      //最后，以当前参数的传入顺序为键，以name为值，放到map中
      map.put(paramIndex, name);
    }
    //循环结束后，让成员变量names指向这个map
    names = Collections.unmodifiableSortedMap(map);
  }
    
  //该方法封装了参数处理规则的核心逻辑
  public Object getNamedParams(Object[] args) {
    //获取names这个Map对象的元素个数，即获取参数个数
    final int paramCount = names.size();
    //如果传入的参数为空或者参数个数为0，直接返回null
    if (args == null || paramCount == 0) {
      return null;
    //否则，如果当前参数个数为1并且没有使用@Param注解
    } else if (!hasParamAnnotation && paramCount == 1) {
      //则直接返回当前参数的值，args[0]
      return args[names.firstKey()];
     //否则，说明当前参数个数不为1或者参数列表中有参数使用了@Param注解
    } else {
      //先创建一个Map对象param
      final Map<String, Object> param = new ParamMap<>();
      int i = 0;
      //循环遍历names中的键值对
      for (Map.Entry<Integer, String> entry : names.entrySet()) {
        //以names中的value作为key，然后通过names中的key作为索引获取参数的值来作为value，放入param
        param.put(entry.getValue(), args[entry.getKey()]);
        //然后再为每个参数设置以param为前缀的固定key，value为参数的值
        final String genericParamName = GENERIC_NAME_PREFIX + String.valueOf(i + 1);
        //如果有@Param注解的值就是paramN的形式，则直接略过
        if (!names.containsValue(genericParamName)) {
          //否则，以paramN的形式作为key，value为参数的值，放入param中
          param.put(genericParamName, args[entry.getKey()]);
        }
        i++;
      }
      //最后返回param这个Map对象
      return param;
    }
  }
}
```

**总结**：

假设传入MyBatis中的参数列表为：`(@Param("id")Integer id,@Param("gender")String gender,String email)`，传入的参数数组为：`Object[] args={1,"男","aaa@qq.com"}`，则MyBatis的对该参数列表和参数数组的处理流程如下：

- 首先在构造函数中，循环遍历参数列表：

  - 对于每一个标了`@Param`注解的参数，取出`@Param`注解的值赋值给临时变量`name`
  - 对于没有标`@Param`注解的参数：
    - 如果全局配置文件中，开启了`useActualParamName`设置，则将该参数的名字赋值给临时变量`name`
    - 否则的话，临时变量`name`的值为当前参数在参数列表中的索引
  - 最后，以当前参数在参数列表中的索引为`key`，以临时变量`name`的值为`value`，存入成员变量`names`这个Map对象中

  循环结束后，`names`成员变量应为：`{0=”id",1="gender",2="3"}`（未开启`useActualParamName`设置）

- 然后在`getNamedParams`方法中对传入的参数数组进行处理：

  - 如果传入的参数为空或者参数个数为0，则该方法直接返回空

  - 否则，如果当前参数个数为1并且该参数没有使用`@Param`注解，则获取`names`成员变量中的第一个键值（即0）作为索引，取出参数数组中该参数的值（即`args[0]`）并返回

  - 否则，说明当前参数个数不为1或者参数列表中有参数使用了`@Param注解`

    - 新建一个Map对象
    - 循环遍历`names`成员变量中的键值对：
      - 取出每一个`value`（即 `"id"`、`"gender"`、`"3"`）作为这个Map对象的键，取出每一个`key`（即0、1、2）作为参数数组中的索引来获得相应的参数值，并将这些参数值作为Map对象的值
      - 再为每一个参数值设置一个以（`param`为前缀+参数索引+1）的固定`key`
    - 最后返回该Map对象

    最终，返回的Map对象为：`{"id"=1,"gender"="男","3"=aaa@qq.com,"param1"=1,"param2"="男","param3"="aaa@qq.com"}`

## 4.动态SQL

动态SQL是 MyBatis 的强大特性之一。传统的使用JDBC的方法去拼接SQL语句十分麻烦，例如拼接时要确保不能忘记添加必要的空格，还要注意去掉列表最后一个列名的逗号。而MyBatis的动态SQL正是为了解决这一问题而出现

- `if`标签

  根据条件判断是否拼接`if`标签中的SQL语句

  - 属性`test`：判断条件表达式

  示例：

  判断传入的`Employee`对象的某个字段是否有值来拼接查询条件

  -  `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface DynamicSqlMapper {
        Employee getEmpByIf(Employee employee);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <select id="getEmpByIf" resultType="site.potatoblog.bean.Employee">
            select * from employee where
            <!--
    			判断传入的Employee对象的id字段是否为空：
    				1.如果是，则不拼接
    				2.如果不是，则拼接这个查询条件
    		-->
            <if test="id!=null">
                id=#{id}
            </if>
            <!--
    			判断传入的Employee对象的gender字段是否为空/空字符串：
    				1.如果是，则不拼接
    				2.如果不是，则拼接这个查询条件
    		-->        
            <if test="gender!=null and gender!=''">
                and gender=#{gender}
            </if>
            <!--
    			判断传入的Employee对象的lastName字段是否为空/空字符串：
    				1.如果是，则不拼接
    				2.如果不是，则拼接这个查询条件
    		-->        
            <if test="lastName!=null and lastName!=''">
                and last_name=#{lastName}
            </if>
            <!--
    			判断传入的Employee对象的email字段是否为空/空字符串：
    				1.如果是，则不拼接
    				2.如果不是，则拼接这个查询条件
    		-->        
            <if test="email!=null and email!=''">
                and email=#{email}
            </if>
        </select>
    </mapper>
    ```

- `where`标签

  上述`if`标签拼接的查询条件是有问题的：假如我们只穿入一个`gender`值，那么拼接后的SQL语句就会变成`select * from employee where and gender=#{gender}`。因此只要第一个`if`没有拼接，那么之后的每一个拼接的SQL语句都会多一个前置的`and`

  `where`标签可以解决上述问题，它能封装所有查询条件，并且为我们去除多余的前置`and`/`or`

  示例：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface DynamicSqlMapper {
        Employee getEmpByWhere(Employee employee);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <select id="getEmpByWhere" resultType="site.potatoblog.bean.Employee">
            select * from employee
            <!--
    			不再使用原生where，MyBatis的where标签能帮我们去除多余的前置and
    			即使id为空，后续多余的前置and也会被去除
    		-->
            <where>
                <if test="id!=null">
                    id=#{id}
                </if>
                <if test="gender!=null and gender!=''">
                    and gender=#{gender}
                </if>
                <if test="lastName!=null and lastName!=''">
                    and last_name=#{lastName}
                </if>
                <if test="email!=null and email!=''">
                    and email=#{email}
                </if>
            </where>
        </select>
    </mapper>
    ```

- `trim`标签

  `where`标签只能去除多余的前置`and`/`or`，如果我们将`and`写为后置的形式，那么`where`标签是也是会出现和`if`标签同样的问题

  此时，`trim`标签可以解决上述问题，  它能为所包含的内容的前缀和后缀自定义截取规则

  - 属性`prefix`

    为`trim`标签体中的整个字符串添加一个前缀

  - 属性`prefixOverrides`

    去掉`trim`标签体中的整个字符串前面多余的字符

  - 属性`suffix`

    为`trim`标签体中的整个字符串添加一个后缀

  - 属性`suffixOverrides`

    去掉`trim`标签体中的整个字符串后面多余的字符

  示例：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface DynamicSqlMapper {
        Employee getEmpByTrim(Employee employee);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <select id="getEmpByTrim" resultType="site.potatoblog.bean.Employee">
            select * from employee
            <!--
    			为整个字符串添加一个前缀where并去除整个字符串后缀多余的and
    		-->
            <trim prefix="where" suffixOverrides="and">
                <if test="id!=null">
                    id=#{id} and
                </if>
                <if test="gender!=null and gender!=''">
                     gender=#{gender} and
                </if>
                <if test="lastName!=null and lastName!=''">
                    and last_name=#{lastName} and
                </if>
                <if test="email!=null and email!=''">
                    email=#{email}
                </if>
            </trim>
        </select>
    </mapper>
    ```

- `choose`标签

   分支选择标签，用于进行多选一判断

  - 子标签`when`

    用于定义分支条件

  - 子标签`otherwise`

    相当于默认分支，当所有分支都不成功时，就进入默认分支

  示例：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface DynamicSqlMapper {
        Employee getEmpByChoose(Employee employee);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <select id="getEmpByChoose" resultType="site.potatoblog.bean.Employee">
            select * from employee
            <where>
                <!--
    				当id不为空，则查id
    				否则，gender不为空，则查gender
    				否则，lastName不为空，则查lastName
    				否则，email不为空，则查email
    				否则，不带条件查询
    			-->
                <choose>
                    <when test="id!=null">
                        id=#{id}
                    </when>
                    <when test="gender!=null and gender!=''">
                        and gender=#{gender}
                    </when>
                    <when test="lastName!=null and lastName!=''">
                        and last_name=#{lastName}
                    </when>
                    <when test="email!=null and email!=''">
                        and email=#{email}
                    </when>
                    <otherwise>
    
                    </otherwise>
                </choose>
            </where>
        </select>
    </mapper>
    ```

- `set`标签

  用于封装所有修改条件，并且为我们去除多余的后置`,`

  示例：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface DynamicSqlMapper {
        void updateBySet(Employee employee);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <update id="updateBySet">
            update employeeset
            <!--
    			不再使用原生set，MyBatis的set标签能帮我们去除多余的后置逗号
    			即使email为空，后续多余的后置逗号也会被去除
    		-->        
            <set>
                <if test="gender!=null and gender!=''">
                    gender=#{gender},
                </if>
                <if test="lastName!=null and lastName!=''">
                     last_name=#{lastName},
                </if>
                <if test="email!=null and email!=''">
                    email=#{email}
                </if>
            </set>
            <where>
                id=#{id}
            </where>
        </update>
    </mapper>
    ```

- `foreach`标签

  用于遍历集合/Map/数组类型

  - 属性`collection`

    指定哪个参数是用于遍历的集合/Map/数组类型（注意，集合类型的参数在传入时会被封装在一个Map对象中，该Map对象的`key`为`collection`）

  - 属性`item`

    将当前遍历出的元素赋值给`item`属性指定的变量

    - 历的是集合/数组时，当前遍历出的元素表示当前索引对应的值
    - 遍历的是Map时，当前遍历出的元素表示的当前`key`对应的`value`

  - 属性`index`

    将当前遍历出的元素赋值给`index`属性指定的变量

    - 遍历的是集合/数组时，当前遍历出的元素表示索引
    - 遍历的是Map时，当前遍历出的元素表示的`key`

  - 属性`separator`

    每个元素之间的分隔符

  - 属性`open`

    为遍历出的结果整体拼接一个开始字符串

  - 属性`close`

    为遍历出的结果整体拼接一个结束字符串

  示例1：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    import java.util.List;
    
    public interface DynamicSqlMapper {
        Employee getEmpByForEach(List<Integer> ids);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <select id="getEmpByForEach" resultType="site.potatoblog.bean.Employee">
            select * from employee where id in
            <!--
    			传入的参数是List<Integer> ids，会被封装到一个Map对象中，因此在取值时应该按键取值，
    			键名可以是list/collection
    			假如传入的是{1，2，3，4}
    			该foreach标签拼接会得到(1,2,3,4)
    		-->
            <foreach collection="collection" item="item_id" separator="," open="(" close=")" index="index_id">
                #{item_id}
            </foreach>
        </select>
    </mapper>
    ```

  示例2：

  使用`foreach`标签进行批量保存

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    import java.util.List;
    
    public interface DynamicSqlMapper {
        void addEmpsByForEach(List<Employee> emps);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <!--
    		批量插入
    	-->
        <insert id="addEmpsByForEach">
            insert into employee(last_name,gender,email) values
            <foreach collection="collection" item="emp" separator=",">
                (#{emp.lastName},#{emp.gender},#{emp.email})
            </foreach>
        </insert>
    </mapper>
    ```

- 内置参数

  MyBatis有两个内置参数，可以用于动态SQL进行判断或取值

  - `_databaseId`：表示当前数据库厂商标识
  - `_parameter`：表示传入的整个参数
    - 单个参数：`_parameter`就是这个参数
    - 多个参数：参数会被封装为一个Map对象，`_parameter`就是这个Map对象

  示例：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface DynamicSqlMapper {
        Employee getEmpByBuiltIn(Employee employee);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
        <select id="getEmpByBuiltIn" resultType="site.potatoblog.bean.Employee">
            <if test="_databaseId=='mysql'">
                select * from employee
                <!--此处_parameter就等于传入的Employee对象-->
                <if test="_parameter!=null">
                    where id=#{_parameter.id}
                </if>
            </if>
        </select>
    </mapper>
    ```

- `bind`标签

  允许创建一个变量，并将其绑定到当前的上下文

  `bind`标签在模糊查询的SQL语句中非常有用：

  - 我们是无法使用`'%#{}%'`这种方式，为取出的值拼接两个`%`
  - 使用`'%${}%'`这种方式虽然可行，但是有可能会导致SQL注入问题

  示例：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    import java.util.List;
    
    public interface DynamicSqlMapper {
        List<Employee> getEmpsByBind(String lastName);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <select id="getEmpsByBind" resultType="site.potatoblog.bean.Employee">
            <!--
    			使用bind标签创建一个变量，假设传入的lastName为o，则该变量值为%o%
    		-->
            <bind name="pattern" value="'%'+lastName+'%'"/>
            select * from employee where last_name like #{pattern}
        </select>
    </mapper>
    ```

- `sql`标签

  用于抽取可重用的SQL片段
  - 属性`id`

    该SQL片段的唯一标识符

  通过这个唯一标识符，后续可以使用`include`标签来引用该片段，还可以在`include`标签的子标签中定义变量，然后在`sql`标签中通过`${变量名}`进行取值

  示例：

  - `DynamicSqlMapper`接口

    ```java
    package site.potatoblog.dao;
    
    import site.potatoblog.bean.Employee;
    
    public interface DynamicSqlMapper {
        void addEmpBySql(Employee employee);
    }
    ```

  - SQL映射文件

    ```xml
    <?xml version="1.0" encoding="utf-8" ?>
    <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
    <mapper namespace="site.potatoblog.dao.DynamicSqlMapper">
        <insert id="addEmpBySql">
            <!--
    			通过include标签引入重用的sql片段，并且自定义一个变量，值为email
    		-->
            insert into employee(
            <include refid="insertColumn">
                <property name="col" value="email"/>
        	</include>
            ) value (#{lastName},#{gender},#{email})
        </insert>
        <!--
    		封装了可重用的sql片段，即插入的列名，并且使用${}取出include标签中定义的变量值
    	-->
        <sql id="insertColumn">
            last_name,gender,${col}
        </sql>
    </mapper>
    ```

## 5.MyBatis-缓存机制

MyBatis系统中默认定义了两级缓存：

- 一级缓存

  也叫本地缓存，是`SqlSession`级别的缓存，即一个`SqlSession`对应一个一级缓存，该缓存是默认开启的，无法关闭

  - 作用

    与数据库同一次会话期间查询到的数据会放在本地缓存中，以后如果需要获取相同的数据，直接从缓存中拿，没必要再去查询数据库

  - 一级缓存失效情况

    - 使用两个不同的`SqlSession`实例查询相同的数据

      原因：处于不同的会话，对应的一级缓存也不同

    -  使用相同`SqlSession`实例，但是两次查询条件不同

      原因：当前一级缓存可能还没有这个数据

    - 使用相同`SqlSession`实例，但是两次查询之间执行了增删改操作

      原因：增删改操作可能会改变缓存中的数据

    - 使用相同`SqlSession`实例，但是两次查询之间手动清除了一级缓存（通过`sqlSessin`的`clearCache()`方法）

      原因：一级缓存被清空

- 二级缓存 

  也叫全局缓存，基于`namespace`级别的缓存，即一个`namespace`对应一个二级缓存，该缓存是需要手动开启的

  - 工作机制

    - 一个会话，查询一条数据，这个数据就会被放在当前会话的一级缓存中
    - 如果会话关闭或提交，一级缓存中的数据就会被保存到二级缓存中，新的会话查询信息，如果二级缓存中有该条信息，则直接从二级缓存中获取，否则，再以相同的形式去一级缓存中查找，如果都没有，才会去数据库中查找

  - 开启二级缓存配置

    -  在全局配置文件中开启`cacheEnabled`设置

      ```xml
      <settings>
          <setting name="cacheEnabled" value="true"/>
      </settings>
      ```

    - 在SQL映射文件中配置使用二级缓存：

      通过`cache`标签开启二级缓存

      - `cache`标签

        - 属性`eviction`

          缓存回收策略（默认是`LRU`）

          - `LRU`：最近最少使用的，移除最长时间不被使用的对象
          - `FIFO`：先进先出，按对象进入缓存的顺序来移除它们
          - `SOFT`：软引用，移除基于垃圾回收器状态和软引用规则的对象
          - `WEAK`：弱引用，更积极地移除基于垃圾回收器状态和软引用规则的对象

        - 属性`flushInterval`

          刷新间隔，单位毫秒，默认情况是不设置，即没有刷新间隔，缓存仅仅调用语句时刷新

        - 属性`size`

          代表缓存最多可以存储多少个对象

        - 属性`readOnly`

          只读设置（默认是`false`）

          - `true`：只读缓存，会给所有调用者返回缓存对象的引用，该设置会让性能提升，但同时调用者不能将获得的缓存对象进行修改，否则会改变缓存中的数据
          - `false`：读写缓存，会返回缓存对象的拷贝（通过序列化），性能上会慢一些，但是安全（注意，开启该设置时，对应的JavaBean应该实现序列化接口`Serializable`）

缓存有关的设置和属性：

- 设置`cacheEnabled=false`，关闭的是二级缓存，一级缓存始终开启不会被关闭
- 每个`select`标签都有一个`useCache`属性，设置查询时是否使用缓存，默认为`true`，如果设置为`false`，默认不使用的也是二级缓存，一级缓存一直可以使用
- 每个增删改标签都有一个`flushCache`属性，设置增删改操作后是否清空缓存，默认为`true`，即一级、二级缓存都被清空；查标签也有`flushCache`属性，默认为`false`
- `sqlSessin`的`clearCache()`方法只会清空当前会话的一级缓存
- `localCacheScope`：本地缓存作用域，默认值为 `SESSION`，会缓存一个会话中执行的所有查询， 若设置值为 `STATEMENT`，本地缓存将仅用于执行语句，对相同 `SqlSession` 的不同查询将不会进行缓存。

## 6.MyBatis-逆向工程

`MyBatis Generator`简称MBG，是一个专门为MyBatis框架使用者定制的代码生成器，可以快速的根据表生成对应的映射文件，接口，以及bean类。支持基本的增删改查，以及QBC风格的条件查询。但是表连接、存储过程等这些复杂SQL的定义需要我们手工编写

- MBG使用
  - 编写MBG的配置文件

    - `context`标签

      配置上下文环境

      - 属性`targetRuntime`

        生成相应的运行环境

        - 取值`MyBatis3`

          可以生成带条件的增删改查代码

        - 取值`MyBatis3Simple`

          可以生成基本的增删改查

    - `jdbcConnection`标签

      配置数据库连接信息

      - 属性`driverClass`

        所使用的数据库驱动

      - 属性`connectionURL`

        数据库的连接地址

      - 属性`userId`

        连接数据库的用户名

      - 属性`password`

        连接数据库的密码

    - `javaModelGenerator`标签

      配置JavaBean的生成策略

      - 属性`targetPackage`

        JavaBean生成后存放的包名

      - 属性`targetProject`

        包名所在的目录

    - `sqlMapGenerator`标签

      配置SQL映射文件的生成策略

      - 属性`targetPackage`

        SQL映射文件生成后存放的包名

      - 属性`targetProject`

        包名所在的目录

    - `javaClientGenerator`标签

      配置Mapper接口的生成策略

      - 属性`targetPackage`

        Mapper接口生成后存放的包名

      - 属性`targetProject`

        包名所在的目录

    - `table`标签

      配置要逆向解析的数据表

      - 属性`tableName`

        表名

      - 属性`domainObjectName`

        对应生成的JavaBean名

    ```xml
    <!--mbg-config.xml-->
    <!DOCTYPE generatorConfiguration PUBLIC
            "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
            "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
    <generatorConfiguration>
        <context id="simple" targetRuntime="MyBatis3">
            <!--数据库连接信息配置-->
            <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                          connectionURL="jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC&amp;useUnicode=true&amp;characterEncoding=utf8" userId="root" password="apotato666" />
    
    		<!--javaBean的生成策略-->
            <javaModelGenerator targetPackage="site.potatoblog.bean" targetProject=".\src\main\java"/>
    		<!--映射文件的生成策略-->
            <sqlMapGenerator targetPackage="mapper" targetProject=".\src\main\resources"/>
    		<!--dao接口java文件的生成策略-->
            <javaClientGenerator type="XMLMAPPER" targetPackage="site.potatoblog.dao" targetProject=".\src\main\java"/>
    		<!--数据表与javaBean的映射-->
            <table tableName="manager" domainObjectName="Manager"/>
        </context>
    </generatorConfiguration>
    ```

  - 执行MBG配置文件，生成代码

    ```java
    @Test
    public void mbgTest() throws InvalidConfigurationException, IOException, XMLParserException, SQLException, InterruptedException {
        List<String> warnings = new ArrayList<String>();
        boolean overwrite = true;
        File configFile = new File("src/main/resources/conf/mbg-config.xml");
        ConfigurationParser cp = new ConfigurationParser(warnings);
        Configuration config = cp.parseConfiguration(configFile);
        DefaultShellCallback callback = new DefaultShellCallback(overwrite);
        MyBatisGenerator myBatisGenerator = new MyBatisGenerator(config, callback, warnings);
        myBatisGenerator.generate(null);
    }
    ```

## 7.MyBatis-运行原理

MyBatis操作数据库流程如下：

- 获取`SqlSessionFactory`对象
- 获取`SqlSession`对象
- 获取接口的实现类代理对象（`MapperProxy`对象）
- 执行增删改查操作

深入源码，探究每一步：

- `SqlSessionFactory`对象的初始化

  1. `SqlSessionFactory`对象的创建来自于`SqlSessionFactoryBuilder`对象的`build`方法

     ```java
     public SqlSessionFactory build(InputStream inputStream) {
       //该方法内部将SqlSessionFactory对象的创建委托给了另一个重载的build方法
       return build(inputStream, null, null);
     }
     ```

  2. 另一个重载的`build`方法

     ```java
     public SqlSessionFactory build(InputStream inputStream, String environment, Properties properties) {
       try {
         //1.创建一个xml解析器，用于解析传入的输入流（即MyBatis全局配置文件）
         XMLConfigBuilder parser = new XMLConfigBuilder(inputStream, environment, properties);
         //2.最后调用xml解析器的parse方法解析全局配置文件，并将解析好的结果传入又一个重载的build方法
         return build(parser.parse());
       } catch (Exception e) {
         throw ExceptionFactory.wrapException("Error building SqlSession.", e);
       } finally {
         ErrorContext.instance().reset();
         try {
           inputStream.close();
         } catch (IOException e) {
           // Intentionally ignore. Prefer previous error.
         }
       }
     }
     ```

     1. `parser.parse()`方法（解析全局配置文件）

        ```java
        public Configuration parse() {
          //如果全局配置文件已经被解析过，则直接抛出异常
          if (parsed) {
            throw new BuilderException("Each XMLConfigBuilder can only be used once.");
          }
          //设置解析标志为true
          parsed = true;
          //解析全局配置文件中的configuration标签中的内容，并将解析结果封装到成员变	  量configuration中
          //该成员变量是一个Configuration对象   
          parseConfiguration(parser.evalNode("/configuration"));
          //返回成员变量configuration
          return configuration;
        }
        ```

        - `parseConfiguration`方法源码

          ```java
          private void parseConfiguration(XNode root) {
              try {
                  //解析properties标签中的内容，并将解析结果封装到成员变量configuration中
                  propertiesElement(root.evalNode("properties"));
                  Properties settings = settingsAsProperties(root.evalNode("settings"));
                  loadCustomVfs(settings);
                  loadCustomLogImpl(settings);
                  //解析typeAlias标签中的内容，并将解析结果封装到成员变量configuration中
                  typeAliasesElement(root.evalNode("typeAliases"));
                  //解析plugin标签中的内容，并将解析结果封装到成员变量configuration中
                  pluginElement(root.evalNode("plugins"));
                  //解析objectFactory标签中的内容，并将解析结果封装到成员变量configuration中
                  objectFactoryElement(root.evalNode("objectFactory"));
                  //解析objectWrapperFactory标签中的内容，并将解析结果封装到成员变量configuration中
            objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));
                  //解析reflectorFactory标签中的内容，并将解析结果封装到成员变量configuration中
            reflectorFactoryElement(root.evalNode("reflectorFactory"));
                  //解析settings标签中的内容，并将解析结果封装到成员变量configuration中
                  settingsElement(settings);
                  //解析environment标签中的内容，并将解析结果封装到成员变量configuration中
                  environmentsElement(root.evalNode("environments"));
                  //解析databaseIdProvider标签中的内容，并将解析结果封装到成员变量configuration中
           databaseIdProviderElement(root.evalNode("databaseIdProvider"));
                  //解析typeHandlers标签中的内容，并将解析结果封装到成员变量configuration中
                  typeHandlerElement(root.evalNode("typeHandlers"));
                  //解析mappers标签中的内容，并将解析结果封装到成员变量configuration中
                  mapperElement(root.evalNode("mappers"));
              } catch (Exception e) {
                  throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + e, e);
              }
          }
          ```

        - `mapperElement`方法源码（`mappers`标签的解析过程）

          ```java
          private void mapperElement(XNode parent) throws Exception {
              ...
              String resource = child.getStringAttribute("resource");
              String url = child.getStringAttribute("url");
              String mapperClass = child.getStringAttribute("class");
              //如果mapper标签的resource属性有值
              if (resource != null && url == null && mapperClass == null) {
                  ErrorContext.instance().resource(resource);
                  //获取位于类路径下的SQL映射文件的输入流
                  InputStream inputStream = Resources.getResourceAsStream(resource);
                  //创建一个xml解析器，用于解析SQL映射文件
                  XMLMapperBuilder mapperParser = new XMLMapperBuilder(inputStream, configuration, resource, configuration.getSqlFragments());
                  //调用解析器的parse方法，解析SQL映射文件，并将解析的结果封装到成员变量configuration中
                  mapperParser.parse();
              }
              ...
          }
          ```

        - `mapperParser.parse()`方法内部会调用`configurationElement(parser.evalNode("/mapper"));`来解析SQL映射文件中的`mapper`标签

          ```java
          private void configurationElement(XNode context) {
            try {
              //获取属性namespace的值 
              String namespace = context.getStringAttribute("namespace");
              if (namespace == null || namespace.equals("")) {
                throw new BuilderException("Mapper's namespace cannot be empty");
              }
              //设置当前的名称空间的值为该namespace  
              builderAssistant.setCurrentNamespace(namespace);
              //解析cache-ref标签中的内容，并将解析的结果封装到成员变量		  configuration中 
              cacheRefElement(context.evalNode("cache-ref"));
              //解析cache标签中的内容，并将解析的结果封装到成员变量		    	  configuration中       
              cacheElement(context.evalNode("cache"));
              //解析parameterMap标签中的内容，并将解析的结果封装到成员变量  		 configuration中
            parameterMapElement(context.evalNodes("/mapper/parameterMap"));
                //解析resultMap标签中的内容，并将解析的结果封装到成员变量  	           configuration中
            resultMapElements(context.evalNodes("/mapper/resultMap"));
                //解析sql标签中的内容，并将解析的结果封装到成员变量  		           configuration中
              sqlElement(context.evalNodes("/mapper/sql"));
                //解析增删改查标签中的内容，并将解析的结果封装到成员变量  		         configuration中
            buildStatementFromContext(context.evalNodes("select|insert|update|delete"));
            } catch (Exception e) {
              throw new BuilderException("Error parsing Mapper XML. The XML location is '" + resource + "'. Cause: " + e, e);
            }
          }
          ```

        - `buildStatementFromContext`内部也会创建一个xml解析器`statementParser`：

          - 通过调用解析器的`parseStatementNode()`解析增删改查标签中的内容
          - 解析的结果将封装成一个`MappedStatement`对象
          - 最后以该标签的`id`属性为`key`，`MappedStatement`对象为`value`，存放到成员变量`configuration`的一个Map类型的属性`Map<String, MappedStatement> mappedStatements`

     2. 接收全局配置文件解析结果的`build`方法

        当`parser.parse()`完成后，此时成员变量`configuration`中保存了全局配置文件以及SQL映射文件中的所有信息，并被传递给最终的`build`方法来初始化一个`SqlSessionFactory`对象

        最终的`build`方法源码：

        ```java
        public SqlSessionFactory build(Configuration config) {
          //该方法内部会创建一个DefaultSqlSessionFactory对象，并且根据传入			configuration成员变量来进行初始化
          return new DefaultSqlSessionFactory(config);
        }
        ```

  3. 最终返回一个`DefaultSqlSessionFactory`对象，包含了全局配置文件和SQL映射文件的信息

  **总结：**

  - 创建`SqlSessionFactoryBuilder`对象，调用该对象的`build(InputStream)`方法
  - `build(InputStream)`方法根据传入的MyBatis全局配置文件的输入流创建相应的xml解析器`parser`
  - 调用解析器`parser`的`parse()`方法解析全局配置文件：
    - 解析全局配置文件中的每一个标签，并将解析的结果保存在一个`Configuration`对象中
      - 在解析全局配置文件中的`mappers`标签时，MyBatis会根据`mappers`标签中的`resource`属性值寻找到对应的SQL映射文件，然后获得该SQL映射文件的输入流，再根据该输入流为SQL映射文件创建一个xml解析器`mapperParser`
        - 调用解析器`mapperParser`的`parse()`方法解析SQL映射文件：
          - 解析SQL映射文件中的每一个标签，并将解析的结果保存在上述`Configuration`对象中
            - 在解析SQL映射文件中的增删改查标签时，MyBatis还会为这些标签额外创建一个解析器`statementParser`
              - 调用解析器`statementParser`的`parseStatementNode()`方法解析增删改查标签：
                - 解析增删改查标签中的每个属性和子标签，将结果封装成一个`MappedStatement`对象
                - 以该标签的`id`属性值为`key`，该标签对应`MappedStatement`对象为`value`，封装到上述`Configuration`对象的一个Map类型的属性`Map<String, MappedStatement> mappedStatements`中
    - 上述流程结束后，`parse()`方法将会返回该`Configuration`对象，包含了全局配置文件和SQL映射文件的所有信息
  - 调用`build(Configuration)`方法，将传入的的`Configuration`对象传递给`SqlSessionFactory`的实现类`DefaultSqlSessionFactory`类的构造器来初始化一个`DefaultSqlSessionFactory`实例
  - 最终返回的是一个`SqlSessionFactory`的实现类`DefaultSqlSessionFactory`对象，包含了全局配置文件和SQL映射文件的信息

- `SqlSession`对象的获取

  1. `SqlSession`对象的获取来自于`SqlSessionFactory`对象（实际上是`DefaultSqlSessionFactory`对象）的`openSession()`方法

     ```java
     //DefaultSqlSessionFactory对象重写的openSession方法源码
     @Override
     public SqlSession openSession() {
       //该方法内部被委托给了openSessionFromDataSource方法
       return openSessionFromDataSource(configuration.getDefaultExecutorType(), null, false);
     }
     ```

  2. `openSessionFromDataSource`方法

     ```java
       private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level, boolean autoCommit) {
         Transaction tx = null;
         try {
           //DefaultSqlSessionFactory对象的成员变量configuration包含了全局配置文件		和SQL映射文件的信息
           //从成员变量configuration获取环境信息，即全局配置文件中environments标签的		内容
           final Environment environment = configuration.getEnvironment();
           //通过该环境信息创建一个事务工厂  
           final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
           //创建事务对象  
           tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
           //传入的参数execType表示执行器的类型，可以在全局配置文件的settings中对      		defaultExecutorType设置进行修改，共有三种类型：SIMPLE,REUSE,BATCH（默		 认为SIMPLE)
           //根据设置的defaultExecutorType创建相应的执行器Executor对象
           final Executor executor = configuration.newExecutor(tx, execType);
           //最后将DefaultSqlSessionFactory对象的成员变量configuration、新建的			Executor对象以及是否自动提交标识（默认为false）传入SqlSession的实现类			DefaultSqlSession类的构造器，来初始化一个DefaultSqlSession实例
           return new DefaultSqlSession(configuration, executor, autoCommit);
         } catch (Exception e) {
           closeTransaction(tx); // may have fetched a connection so lets call close()
           throw ExceptionFactory.wrapException("Error opening session.  Cause: " + e, e);
         } finally {
           ErrorContext.instance().reset();
         }
       }
     ```

     - 执行器`Executor`对象的创建来自于`Configuration`对象的`newExecutor`方法

       ```java
       public Executor newExecutor(Transaction transaction, ExecutorType executorType) {
         //如果用户在全局配置文件中设置defaultExecutorType，那么executorType就是默	   认的SIMPLE
         executorType = executorType == null ? defaultExecutorType : executorType;
         //二次判断确保executorType不会为空  
         executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
         Executor executor;
          //如果executorType是BATCH类型的，则创建一个BatchExcutor执行器对象 
         if (ExecutorType.BATCH == executorType) {
           executor = new BatchExecutor(this, transaction);
          //否则，如果executorType是REUSE类型的，则创建一个REUSE执行器对象   
         } else if (ExecutorType.REUSE == executorType) {
           executor = new ReuseExecutor(this, transaction);
           //否则，就创建一个SimpleExecutor执行器对象  
         } else {
           executor = new SimpleExecutor(this, transaction);
         }
         //如果全局配置文件中开启了二级缓存配置  
         if (cacheEnabled) {
           //则还需要将新创建好的执行器对象传入CachingExecutor类中进行包装，使得该执行		器具有缓存功能  
           executor = new CachingExecutor(executor);
         }
         //最后再使用每一个拦截器（插件）重新包装新创建好的执行器对象并返回  
         executor = (Executor) interceptorChain.pluginAll(executor);
         return executor;
       }
       ```

     - 每一个执行器`Executor`对象在创建后都会被传入拦截器链的`pluginAll`方法中进行重新包装

       ```java
       public Object pluginAll(Object target) {
         //遍历每一个拦截器   
         for (Interceptor interceptor : interceptors) {
           //将传入的目标对象传入拦截器的plugin方法中进行重新包装并返回  
           target = interceptor.plugin(target);
         }
         return target;
       }
       ```

  3. 最终返回的是一个`SqlSession`的实现类`DefaultSqlSession`对象，包含了一个具有全局配置文件和SQL映射文件信息的`Configuration`对象和一个`Executor`执行器对象

  **总结：**

  - 调用`SqlSessionFactory`对象（实际上是`DefaultSqlSessionFactory`对象）的`openSession()`方法
  - 从`DefaultSqlSessionFactory`对象的成员变量`configuration`（包含了全局配置文件和SQL映射文件信息）中获取相应信息来创建一个事务对象
  - 根据创建好的事务对象和全局配置文件中的`defaultExecutorType`设置的值创建一个`Executor`执行器对象：
    - `defaultExecutorType`设置共有3中取值：
      - `SIMPLE`：普通的执行器（默认取值）
      - `REUSE`：该执行器会重用预处理语句
      - `BATCH`：该执行器不仅重用语句还会执行批量更新
    - 如果全局配置文件中开启了二级缓存设置，那么再生成相应的`Executor`执行器对象时后，还会再用`CachingExecutor`类对其进行包装，使生成的`Executor`对象具有缓存功能
    - 最后，还需要遍历每一个拦截器对象，将新生成的`Executor`对象传入的拦截器对象的`plugin`方法中进行重新包装并返回
  - 然后将`DefaultSqlSessionFactory`对象的成员变量`configuration`和新生成的`Executor`执行器对象传入`SqlSession`的实现类`DefaultSqlSession`类的构造器，来初始化一个`DefaultSqlSession`实例
  - 最后返回的是一个`SqlSession`的实现类`DefaultSqlSession`对象，包含了一个具有全局配置文件和SQL映射文件信息的`Configuration`对象和一个`Executor`执行器对象
  
- 接口的实现类代理对象的获取

  1. 接口的实现类代理对象的获取来自于`SqlSession`对象（实际上是`DefaultSqlSession`对象）的`getMapper(Class)`方法

     ```java
     //DefaultSqlSession对象重写的getMapper方法
     @Override
     public <T> T getMapper(Class<T> type) {
       //该方法内部被委托给了Configuration对象的getMapper方法,传入接口的Class对象
       return configuration.getMapper(type, this);
     }
     ```

  2. `Configuration`对象的`getMapper(Class,SqlSession)`方法 

     ```java
     public <T> T getMapper(Class<T> type, SqlSession sqlSession) {
       //该方法内部被委托给了MapperRegistry对象的getMapper方法,传入接口的Class对象和     DefaultSqlSession对象 
       return mapperRegistry.getMapper(type, sqlSession);
     }
     ```

  3. `MapperRegistry`对象的`getMapper(Class,SqlSession)`方法

     `MapperRegistry`对象用于注册，获取和判断是否Mapper接口已经被注册

     在创建`SqlSessionFactory`对象，解析SQL映射文件时，会将`mapper`标签中的属性`namespace`对应的接口保存在`MapperRegistry`对象中的一个Map类型的属性`knownMappers`中，以接口的类型为`key`，`MapperProxyFactory`（为接口生成代理实现类的工厂）对象为`value`存储

     ```java
     public <T> T getMapper(Class<T> type, SqlSession sqlSession) {
         //获得为接口生成代理实现类的工厂
       final MapperProxyFactory<T> mapperProxyFactory = (MapperProxyFactory<T>) knownMappers.get(type);
       if (mapperProxyFactory == null) {
         throw new BindingException("Type " + type + " is not known to the MapperRegistry.");
       }
       try {
           //传入DefaultSqlSession实例，调用代理实现类工厂对象的newInstance方法，生成		一个代理实现类的实例
         return mapperProxyFactory.newInstance(sqlSession);
       } catch (Exception e) {
         throw new BindingException("Error getting mapper instance. Cause: " + e, e);
       }
     }
     ```

  4. `MapperProxyFactory`对象的`newInstance(SqlSession)`方法

     ```java
     public T newInstance(SqlSession sqlSession) {
         //创建一个MapperProxy对象，该对象实现了InvocationHandler接口
         final MapperProxy<T> mapperProxy = new MapperProxy<>(sqlSession, mapperInterface, methodCache);
         //最终委托给newInstance(MapperProxy)方法来实现生成代理对象
         return newInstance(mapperProxy);
     }
     ```

  5. 调用`newInstance(MapperProxy)`方法来生成代理对象

     实际底层还是依托JDK动态代理，传入与SQL映射文件绑定的接口的类加载器、接口本身和一个`MapperProxy`对象（方法拦截器）来生成代理对象

     只要代理对象调用了接口中的方法，就会被方法拦截器拦截，从而进入`MapperProxy`对象的`invoke`方法中，实现相应的逻辑

     ```java
     protected T newInstance(MapperProxy<T> mapperProxy) {
       //使用JDK动态代理生成代理对象，最终返回的类型是MapperProxy
       return (T) Proxy.newProxyInstance(mapperInterface.getClassLoader(), new Class[] { mapperInterface }, mapperProxy);
     }
     ```

  6. 最终返回的代理对象是`MapperProxy`类型的

  **总结：**

  - 调用`SqlSession`对象（实际上是实际上是`DefaultSqlSession`对象）的`getMapper(Class)`方法，传入接口的`Class`对象
  - 根据接口的`Class`对象，从`MapperRegistry`对象（用于注册，获取和判断是否Mapper接口已经被注册）的Map类型的属性`knownMappers`中获取`MapperProxyFactory`对象（为接口生成代理实现类的工厂）
  - 调用`MapperProxy`对象`newInstance(SqlSession)`方法，传入`DefaultS qlSession`对象，创建一个`MapperProxy`方法拦截器对象（实现了`InvocationHandler`接口），然后传入`newInstance(MapperProxy)`方法
  - 在`newInstance(MapperProxy)`方法内部，依托JDK动态代理，传入与SQL映射文件绑定的接口的类加载器、接口本身和一个`MapperProxy`对象（方法拦截器）来生成代理对象
  - 最终返回的是一个`MapperProxy`类型的代理对象，包含了能执行增删改查操作的`DefaultSqlSession`对象
  
- 增删改查操作流程（以查询为例）

  1. 调用接口方法查询单个数据，最终进入接口的实现类（`MapperProxy`类）代理对象的`invoke`方法

     ```java
     @Override
     public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
         try {
             //如果是Object类的方法（toString之类），则直接返回
             if (Object.class.equals(method.getDeclaringClass())) {
                 return method.invoke(this, args);
             } else if (method.isDefault()) {
                 if (privateLookupInMethod == null) {
                     return invokeDefaultMethodJava8(proxy, method, args);
                 } else {
                     return invokeDefaultMethodJava9(proxy, method, args);
                 }
             }
         } catch (Throwable t) {
             throw ExceptionUtil.unwrapThrowable(t);
         }
         //如果不是Object类的方法（说明是接口方法）
         //将接口方法包装成MapperMethod对象，包含了接口方法信息及其对应的SQL语句的指令信息等
         final MapperMethod mapperMethod = cachedMapperMethod(method);
         //传入代理对象中保存的DefaultSqlSession对象和接口方法的参数，最终返回MapperMethod对象execute方法的执行结果
         return mapperMethod.execute(sqlSession, args);
     }
     ```

  2. `MapperMethod`对象的`execute`方法会根据`MapperMethod`对象中保存的SQL语句的指令信息执行不同的操作

     ```java
     public Object execute(SqlSession sqlSession, Object[] args) {
       Object result;
       //判断MapperMethod对象中保存的指令类型（以查询为例）
       switch (command.getType()) {
         case INSERT: {
           Object param = method.convertArgsToSqlCommandParam(args);
           result = rowCountResult(sqlSession.insert(command.getName(), param));
           break;
         }
         case UPDATE: {
           Object param = method.convertArgsToSqlCommandParam(args);
           result = rowCountResult(sqlSession.update(command.getName(), param));
           break;
         }
         case DELETE: {
           Object param = method.convertArgsToSqlCommandParam(args);
           result = rowCountResult(sqlSession.delete(command.getName(), param));
           break;
         }
         //如果指令类型是SELECT,说明是查询语句      
         case SELECT:
           //如果接口方法的返回值是空并且拥有ResultHandler类型参数  
           if (method.returnsVoid() && method.hasResultHandler()) {
               //则调用executeWithResultHandler方法
             executeWithResultHandler(sqlSession, args);
             result = null;
               //如果接口方法的返回值是多个
           } else if (method.returnsMany()) {
               //则调用executeForMany方法
             result = executeForMany(sqlSession, args);
               //如果方法的返回值是Map类型
           } else if (method.returnsMap()) {
               //则调用executeForMap方法
             result = executeForMap(sqlSession, args);
               //如果方法的返回值是Cursor类型
           } else if (method.returnsCursor()) {
               //则调用executeForCursor方法
             result = executeForCursor(sqlSession, args);
           } else {
               //如果都不是以上类型，则对传入的参数进行处理
             Object param = method.convertArgsToSqlCommandParam(args);
               //传入接口方法对应的SQL标签的id和处理后的参数，调用DefaultSqlSession对象的selectOne方法，获得查询单个数据的结果
             result = sqlSession.selectOne(command.getName(), param);
             if (method.returnsOptional()
                 && (result == null || !method.getReturnType().equals(result.getClass()))) {
               result = Optional.ofNullable(result);
             }
           }
           break;
         case FLUSH:
           result = sqlSession.flushStatements();
           break;
         default:
           throw new BindingException("Unknown execution method for: " + command.getName());
       }
       if (result == null && method.getReturnType().isPrimitive() && !method.returnsVoid()) {
         throw new BindingException("Mapper method '" + command.getName()
             + " attempted to return null from a method with a primitive return type (" + method.getReturnType() + ").");
       }
       return result;
     }
     ```

  3. 调用`DefaultSqlSession`对象的`selectOne`方法查询单个数据

     ```java
     @Override
     public <T> T selectOne(String statement, Object parameter) {
         //无论是查询单个数据还是查询多个数据，最终内部都是调用DefaultSqlSession对象的selectList方法，传入接口方法对应的SQL标签的id和处理后的参数，获取返回的结果集
       List<T> list = this.selectList(statement, parameter);
         //如果结果集的数量为1，说明是查询单个数据
       if (list.size() == 1) {
           //则直接返回该数据
         return list.get(0);
           //否则，说明查询的是多个数据
       } else if (list.size() > 1) {
           //抛出异常
         throw new TooManyResultsException("Expected one result (or null) to be returned by selectOne(), but found: " + list.size());
       } else {
           //如果都不是，则返回空
         return null;
       }
     }
     ```

     - `DefaultSqlSession`对象的`selectList`方法

       ```java
       @Override
       public <E> List<E> selectList(String statement, Object parameter) {
           //内部委托给了DefaultSqlSession对象的selectList(String,Object,RowBounds)方法
         return this.selectList(statement, parameter, RowBounds.DEFAULT);
       }
       ```

     - `DefaultSqlSession`对象的`selectList(String,Object,RowBounds)`方法

       ```java
       @Override
       public <E> List<E> selectList(String statement, Object parameter, RowBounds rowBounds) {
         try {
           //传入SQL标签的id，从DefaultSqlSession对象的configuration属性中获取该SQL标签的详细信息
           MappedStatement ms = configuration.getMappedStatement(statement);
           //调用DefaultSqlSession对象的executor属性（执行器Executor对象）的query方法，获取查询的结果
           //wrapCollection方法用于处理集合类型的参数  
           return executor.query(ms, wrapCollection(parameter), rowBounds, Executor.NO_RESULT_HANDLER);
         } catch (Exception e) {
           throw ExceptionFactory.wrapException("Error querying database.  Cause: " + e, e);
         } finally {
           ErrorContext.instance().reset();
         }
       }
       ```
       
       -  `wrapCollection(Object)`方法处理集合类型参数
       
         ```java
         private Object wrapCollection(final Object object) {
             //如果参数是集合类型
           if (object instanceof Collection) {
             StrictMap<Object> map = new StrictMap<>();
               //则以collection为key，参数值为value放入map中
             map.put("collection", object);
               //如果参数还是List类型
             if (object instanceof List) {
                 //则再增加一个键值对，以list为key，参数值为value放入map中
               map.put("list", object);
             }
               //最后返回这个map
             return map;
               //如果参数不是集合类型且不为空并且参数是一个数组
           } else if (object != null && object.getClass().isArray()) {
             StrictMap<Object> map = new StrictMap<>();
               //则以array为key，参数值为value放入map中
             map.put("array", object);
               //最后返回这个map
             return map;
           }
             //如果都不是，则原样返回
           return object;
         }
         ```
       
     - `Executor`对象的`query(MappedStatement, Object, RowBounds, ResultHandler)`方法

       ```java
       @Override
       public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
           //调用MappedStatement对象的getBoundSql获取对应SQL语句的详细信息
           //包括SQL语句、参数占位符、传入的参数等
         BoundSql boundSql = ms.getBoundSql(parameterObject);
           //为此次查询生成一个缓存key
         CacheKey key = createCacheKey(ms, parameterObject, rowBounds, boundSql);
           //调用重载的query方法，获取查询的结果
         return query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
       }
       ```

       - 如果开启了二级缓存配置，则调用`CachingExecutor`对象的`query(MappedStatement, Object, RowBounds, ResultHandler , CacheKey, BoundSql)`方法

         ```java
         @Override
         public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql)
             throws SQLException {
             //从MappedStatement对象中获取二级缓存
           Cache cache = ms.getCache();
             //如果二级缓存不为空，则从二级缓存中寻找
           if (cache != null) {
             flushCacheIfRequired(ms);
             if (ms.isUseCache() && resultHandler == null) {
               ensureNoOutParams(ms, boundSql);
               @SuppressWarnings("unchecked")
               List<E> list = (List<E>) tcm.getObject(cache, key);
               if (list == null) {
                 list = delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
                 tcm.putObject(cache, key, list); // issue #578 and #116
               }
               return list;
             }
           }
             //否则调用SimpleExecutor执行器对象（默认的执行器对象，如果配置了其他选项Batch/Reuse，则为对应的执行器对象）的query方法返回
           return delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
         }
         ```

       - 如果没有开启二级缓存配置，则调用对应的`Executor`对象（Batch/Reuse/Simple）的`query(MappedStatement, Object, RowBounds, ResultHandler , CacheKey, BoundSql)`方法，默认是 `SimpleExecutor`执行器对象

         ```java
         @Override
         public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
           ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
           if (closed) {
             throw new ExecutorException("Executor was closed.");
           }
           if (queryStack == 0 && ms.isFlushCacheRequired()) {
             clearLocalCache();
           }
           List<E> list;
           try {
             queryStack++;
               //传入之前生成的缓存key，从本地缓存中查询
             list = resultHandler == null ? (List<E>) localCache.getObject(key) : null;
               //如果本地缓存中有，则无需操作数据库
             if (list != null) {
               handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
             } else {
                 //否则调用queryFromDatabase方法从数据库中取
               list = queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
             }
           } finally {
             queryStack--;
           }
           if (queryStack == 0) {
             for (DeferredLoad deferredLoad : deferredLoads) {
               deferredLoad.load();
             }
             // issue #601
             deferredLoads.clear();
             if (configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
               // issue #482
               clearLocalCache();
             }
           }
           return list;
         }
         ```

       - `SimpleExecutor`执行器对象的`queryFromDatabase`方法

         ```java
         private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
           List<E> list;
             //先将之前生成的缓存key放入本地缓存中，值为一个占位符
           localCache.putObject(key, EXECUTION_PLACEHOLDER);
           try {
               //尝试从数据库中取出相应的结果集
             list = doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
           } finally {
               //最后删除这个键值对
             localCache.removeObject(key);
           }
             //如果从数据库中取出结果集的过程没有错误，则以缓存key为键，查询出的结果集为值，放入本地缓存中
           localCache.putObject(key, list);
           if (ms.getStatementType() == StatementType.CALLABLE) {
             localOutputParameterCache.putObject(key, parameter);
           }
             //最后返回结果集
           return list;
         }
         ```

         - `SimpleExecutor`执行器对象的`doQuery`方法

           ```java
           @Override
           public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
               //先定义一个空的Statement对象（MyBatis底层也是采用的原生JDBC）
             Statement stmt = null;
             try {
                 //获取配置信息
               Configuration configuration = ms.getConfiguration();
                 //创建一个StatementHandler对象
               StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
                 //传入StatementHandler对象，调用prepareStatement方法创建一个Statement对象
               stmt = prepareStatement(handler, ms.getStatementLog());
                 //最后调用StatementHandler对象的query方法从数据库中获取数据
               return handler.query(stmt, resultHandler);
             } finally {
               closeStatement(stmt);
             }
           }
           ```

           - `StatementHandler`对象的创建

             - 首先调用`Configuration`对象的`newStatementHandler`方法

               ```java
               public StatementHandler newStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
                   //创建的是一个RoutingStatementHandler对象
                 StatementHandler statementHandler = new RoutingStatementHandler(executor, mappedStatement, parameterObject, rowBounds, resultHandler, boundSql);
                   //将新建的RoutingStatementHandler对象传入拦截器链的pluginAll方法中封装
                 statementHandler = (StatementHandler) interceptorChain.pluginAll(statementHandler);
                   //最后返回该RoutingStatementHandler对象
                 return statementHandler;
               }
               ```

             - `RoutingStatementHandler`类的构造器

               ```java
               public RoutingStatementHandler(Executor executor, MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
                 //根据SQL标签的statementType属性的配置进行判断
                 //默认是PREPARED
                 switch (ms.getStatementType()) {
                   case STATEMENT:
                     delegate = new SimpleStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
                     break;
                   case PREPARED:
                         //默认最终生成的是一个PreparedStatementHandler对象
                     delegate = new PreparedStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
                     break;
                   case CALLABLE:
                     delegate = new CallableStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
                     break;
                   default:
                     throw new ExecutorException("Unknown statement type: " + ms.getStatementType());
                 }
               }
               ```

             所以最终生成的`StatementHandler`对象是一个`PreparedStatementHandler`对象，并且`StatementHandler`对象的两个属性`parameterHandler`（默认生成的是`DefaultParameterHandler`对象）和`resultSetHandler`（默认生成的是`DefaultResultSetHandler`对象）也会随之初始化

           - `Statement`对象的创建

             - 调用`SimpleExecutor`对象的`prepareStatement`方法

               ```java
               private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
                 Statement stmt;
                   //连接数据库
                 Connection connection = getConnection(statementLog);
                   //创建一个PreparedStatement对象
                 stmt = handler.prepare(connection, transaction.getTimeout());
                   //通过StatementHandler对象的parameterize方法进行参数预编译
                 handler.parameterize(stmt);
                 return stmt;
               }
               ```

             -  `StatementHandler`对象（默认是`PreparedStatementHandler`对象）的`parameterize`方法

               ```java
               @Override
               public void parameterize(Statement statement) throws SQLException {
                   //调用StatementHandler对象的属性parameterHandler的setParameters方法进行参数预编译
                 parameterHandler.setParameters((PreparedStatement) statement);
               }
               ```

             - `ParameterHandler`对象（默认是`DefaultParameterHandler`对象）的`setParameters`方法

               ```java
               @Override
               public void setParameters(PreparedStatement ps) {
                   ...
                       try {
                           //最终使用TypeHandler对象的setParameter方法为每一个传入的PreparedStatement对象进行预编译
                         typeHandler.setParameter(ps, i + 1, value, jdbcType);
                       } catch (TypeException | SQLException e) {
                         throw new TypeException("Could not set parameters for mapping: " + parameterMapping + ". Cause: " + e, e);
                       }
                   ...
               }
               ```

           - `StatementHandler`对象（默认是`PreparedStatementHandler`对象）的`query`方法

             ```java
             @Override
             public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
               PreparedStatement ps = (PreparedStatement) statement;
                 //调用PreparedStatement对象的execute方法，执行sql语句
               ps.execute();
                 //调用ResultSetHandler对象的handleResultSets方法对查询得到的结果集进行封装处理并返回，其内部也是依托TypeHandler对象完成
               return resultSetHandler.handleResultSets(ps);
             }
             ```

  4. 最终返回查询出的结果

  **总结：**

  - 调用接口方法查询单个数据，会被代理类`MapperProxy`的`invoke`方法拦截，然后将接口方法包装成`MapperMethod`对象（包含了接口方法信息及其对应的SQL语句的指令信息等），最后调用该对象的`execute`方法，传入代理对象内部保存的`DefaultSqlSession`实例和接口方法参数
  - 在`MapperMethod`对象的`execute`方法内部：
    - 首先会根据接口方法对应的SQL标签类型（SELECT/INSERT/UPDATE/DELETE等）的不同，执行不同的逻辑
      - 如果是查询标签，还会根据接口方法的返回值类型，执行不同的逻辑
        - 如果返回值类型不是空/多值/Map/Cursor类型的，则对传入的参数进行处理
        - 然后调用`DefaultSqlSession`对象的`selectOne`方法查询单个数据，传入接口方法对应的SQL标签id及处理后的参数
  - 在`DefaultSqlSession`对象的`selectOne`方法内部：
    - 被委托给`DefaultSqlSession`对象的`selectList`执行，传入接口方法对应的SQL标签id及处理后的参数：
      - 首先获取`MappedStatement`对象，包含了SQL标签的详细信息
      - 然后判断处理过后的参数是否是集合类型或者数组，如果是，则增加相应的键值对；如果不是，则不作为
      - 最后，将查询逻辑委托给`Executor`执行器对象（默认是`SimpleExecutor`对象）的`query`方法，传入`MappedStatement`对象，处理后的参数，`RowBound`对象：
        - 首先获取SQL语句的详细信息，封装成一个BoundSql对象
        - 然后为此次查询创建一个缓存key
        - 根据缓存配置进行判断：
          - 如果开启了二级缓存，则根据之前生成的缓存key从二级缓存中寻找：
            - 如果二级缓存中有，则直接返回相应的结果
            - 如果二级缓存中没有，则执行没有开启二级缓存相应的逻辑，然后将查询的结果放入二级缓存，并返回结果
          - 如果没有开启二级缓存，则根据之前生成的缓存key从一级缓存中查找：
            - 如果一级缓存中有，则直接返回相应的结果
            - 如果一级缓存中没有，则将查询逻辑委托给`Executor`执行器对象（默认是`SimpleExecutor`对象）的`queryFromDatabase`方法，传入`MappedStatement`对象，处理后的参数，`RowBound`对象，缓存key，`BoundSql`对象：
              - 首先根据`MappedStatement`对象，处理后的参数，`RowBound`对象，`BoundSql`对象这些参数创建一个`StatementHandler`对象：
                - 根据SQL标签`statementType`属性值判断生成不同具体的`StatementHandler`对象，默认生成的是`PreparedStatementHandler`对象
                - 最后，还需要遍历每一个拦截器对象，将新生成的`StatementHandler`对象传入的拦截器对象的`plugin`方法中进行重新包装并返回
              - 在`StatementHandler`对象创建后，其属性`parameterHandler`（`ParameterHandler`对象）和属性`resultSetHandler`（`ResultSetHandler`对象）也会被初始化
                - 默认生成的`DefaultParameterHandler`对象和`DefaultResultSetHandler`
                - 最后，还需要遍历每一个拦截器对象，将新生成的`ParameterHandler`对象和`ResultSetHandler`对象传入的拦截器对象的`plugin`方法中进行重新包装并返回
              - 通过`StatementHandler`对象创建原生JDBC的`PreparedStatement`对象
              - 通过`StatementHandler`对象的属性`parameterHandler`（`ParameterHandler`对象）对`PreparedStatement`对象进行参数预编译
                - 内部通过`TypeHandler`对象，将参数设置到SQL语句中
              - 调用`PreparedStatement`对象的`execute`方法执行SQL语句，从数据库中取出结果集
              - 通过`StatementHandler`对象的属性`resultSetHandler`（`ResultSetHandler`对象）对得到的结果集进行处理
                - 内部通过`TypeHandler`对象，从结果集中取出对应列的值
              - 最后将处理后的结果放入一级缓存中，然后返回结果
  - 最终获得查询到的结果

  **图解总结：**

  ![image-20210611164434237](/static/img/image-20210611164434237.png)

- `StatementHandler`：处理sql语句预编译，设置参数等相关工作；
- `ParameterHandler`：设置预编译参数用的
- `ResultSetHandler`：处理结果集
- `TypeHandler`：在整个过程中，进行数据库类型和javaBean类型的映射

### 运行原理总结

- 根据全局配置文件和SQL映射文件来初始化`DefaultSqlSessionFactory`的属性`configuration`，它是一个`Configuration`对象
- 通过`DefaultSqlSessionFactory`来创建一个`DefaultSqlSession`对象，它内部包含了一个具有全局配置文件和SQL映射文件信息的`Configuration`对象和一个`Executor`执行器对象（由全局配置文件中的`defaultExecutorType`设置的值创建出相应的`Executor`对象）
- 通过`DefaultSqlSession`对象获取到接口对应的代理实现类对象`MapperProxy`，生成的代理对象内部包含了`DefaultSqlSession`对象
- 执行增删改查方法：
  - 调用`DefaultSqlSession`对象的增删改查方法，其内部会委托给`Executor`执行器对象来完成
  - `Executor`执行器对象在完成增删改查的逻辑时，内部会创建一个`StatementHandler`对象，同时也会创建出`ParameterHandler`对象和`ResultSetHandler`对象
  - 通过`StatementHandler`对象创建出原生JDBC操纵数据库的`Statement`对象
  - 通过`StatementHandler`对象为`StatementHandler`对象进行参数预编译，其内部使用`ParameterHandler`对象来给SQL语句设置参数
  - 执行`Statement`对象对应的SQL语句对数据库进行增删改查
  - 最后通过`StatementHandler`对象来处理结果集，其内部使用`ResultSetHandler`对象来处理结果集

## 8.MyBatis-插件

- MyBatis四大核心对象

  - `ParameterHandler`

    处理SQL的参数对象

  - `ResultSetHandler`

    处理SQL的返回结果集

  - `StatementHandler`

    数据库的处理对象，用于执行SQL语句

  - `Executor`

    MyBatis的执行器，用于执行增删改查操作

- MyBatis插件原理

  - 借助于责任链的模式，在四大核心对象创建时对其拦截处理
  - 使用动态代理对拦截的目标对象进行包装

- MyBatis插件流程

  - 在四大核心对象创建时，每个创建出来的对象都不是直接返回，而是将其传入`interceptorChain.pluginAll(Object)`中
  - 在`pluginAll`方法内部，遍历所有插件，并将参数（四大对象之一）传入插件的`plugin(Object)`方法中进行包装
  - 在`plugin`方法内部，会判断传入的对象是否是要拦截的目标对象：
    - 如果是，则使用JDK动态代理为该目标对象创建代理对象
    - 否则，将该对象原样返回
  - 最后生成的对象不再是原来的四大对象之一，而是一个`Proxy`对象，目标对象的所有方法都由代理对象`Proxy`来执行，并且只要调用了目标方法，就会被插件的`intercept`方法拦截，执行额外的逻辑

- 单插件开发

  - 编写`Interceptor`接口的实现类，即插件

    ```java
     public class MyPlugin implements Interceptor {
        //拦截目标对象的目标方法的执行
        @Override
        public Object intercept(Invocation invocation) throws Throwable {
            System.out.println("方法执行前...");
            //参数invocation是一个Invocation对象，其方法proceed()会执行目标方法，并返回目标方法的返回值
            Object result=invocation.proceed();
            System.out.println("方法执行后...");
            return result;
        }
    	
        //包装目标对象，为目标对象创建一个代理对象
        @Override
        public Object plugin(Object target) {
            System.out.println("MyPlugin...");
            //传入目标对象及拦截器本身，Plugin.wrap方法内部会使用JDK动态代理为目标对象生成一个代理对象
            Object wrap= Plugin.wrap(target,this);
            return wrap;
        }
    
        //将插件注册时的property属性设置进来
        @Override
        public void setProperties(Properties properties) {
            System.out.println("插件的配置信息"+properties);
        }
    }
    ```

  - 为插件类添加注解`Intercepts`来确定要拦截的目标对象及其目标方法

    ```java
    //拦截StatementHandler对象的parameterize方法
    @Intercepts({
            @Signature(type = StatementHandler.class,method = "parameterize",args = java.sql.Statement.class)
    })
    public class MyPlugin implements Interceptor {
        ...
    }
    ```

    `@Intercepts`的值是接收一个`Signature`类型的数组，`@Signature`注解有三个属性：

    - `type`：要拦截的目标对象
    - `method`：要拦截的目标对象的目标方法名
    - `args`：拦截的目标方法所需的参数列表

  - 在全局配置文件中注册插件

    ```xml
    <plugins>
        <!--plugin标签用于注册插件，属性interceptor接收插件的全限定名-->
        <plugin interceptor="site.potatoblog.dao.MyPlugin">
            <!--plugin标签的子标签property用于设置插件的配置信息-->
            <property name="setting" value="plugin"/>
        </plugin>
    </plugins>
    ```

- 多插件开发

  - 创建代理对象时，按照插件配置的顺序进行包装
  - 执行目标方法后，是按照代理的逆向进行执行

## 9.MyBatis-扩展

- 批量操作

  在MyBatis中，可以通过动态SQL来实现批量操作的SQL语句，但也可以直接通过 MyBatis 的 BATCH 方式执行增删改方法

  ```java
  @Test
  public void testBatch() throws IOException{
      SqlSessionFactory sqlSessionFactory=getSqlSessionFactory();
      //可以在创建SqlSession对象时，传入ExecutorType.BATCH来创建一个可以执行批量操作的SqlSession对象
      SqlSession openSession=sqlSessionFactory.openSession(ExecutorType.BATCH);
      try{
          EmployeeMapper mapper=openSession.getMapper(EmployeeMapper.class);
          //保存一万条数据
          //在BATCH模式下，会重复使用已经预处理的语句来设置参数，最后一次性执行
          for(int i=0;i<10000;i++){
              mapper.addEmp(new Employee(null,"abc"+i,"男","@"+i));
          }
          openSession.commit();
      }finally {
          openSession.close();
      }
  }
  ```

  MyBatis使用BATCH 方式批量操作会大幅缩短时间，以上述代码为例：

  - BATCH 方式

    预编译SQL语句执行一次，设置参数执行一万次，最终SQL语句只执行一次

  - 普通方式

    预编译SQL语句执行一万次，设置参数执行一万次，最终SQL语句执行一万次

  注意：

  可以在全局配置文件中为`defaultExecutorType`设置配置BATCH，但是这样会使得所有依赖该全局配置文件生成的`SqlSession`对象都执行的是批量操作。所以最好还是在创建`SqlSession`对象时配置BATCH，只让当前这个`SqlSession`对象能批量操作
  
- 自定义类型处理器

  我们可以自定义类型处理器，在设置参数和处理结果的过程中，自定义某些javaBean类型到数据库类型的映射

  - 自定义类型处理器开发

    为枚举类设计一个自定义类型处理器，使得设置参数时设置的是枚举类的`code`属性，处理结果时，返回的是`code`属性对应的枚举类型

    ```java
    package site.potatoblog.bean;
    
    public enum MyEnum {
        LOGIN("100","用户登录"),LOGOUT("200","用户登出"),REMOVE("300","不存在");
        String code;
        String msg;
        MyEnum(String code, String msg){
            this.code=code;
            this.msg=msg;
        }
    
        public String getCode() {
            return code;
        }
    
        public void setCode(String code) {
            this.code = code;
        }
    
        public String getMsg() {
            return msg;
        }
    
        public void setMsg(String msg) {
            this.msg = msg;
        }
    
        public static MyEnum getEnum(String code){
            MyEnum myEnum=null;
            switch (code){
                case "100":
                    myEnum=LOGIN;
                    break;
                case "200":
                    myEnum=LOGOUT;
                    break;
                case "300":
                    myEnum=REMOVE;
                    break;
            }
            return myEnum;
        }
    }
    ```

    - 编写`TypeHandler`接口的实现，即自定义类型处理器

      ```java
      package site.potatoblog.dao;
      
      import org.apache.ibatis.type.JdbcType;
      import org.apache.ibatis.type.TypeHandler;
      import site.potatoblog.bean.MyEnum;
      
      import java.sql.CallableStatement;
      import java.sql.PreparedStatement;
      import java.sql.ResultSet;
      import java.sql.SQLException;
      
      public class MyTypeHandler implements TypeHandler<MyEnum> {
          //设置参数
          @Override
          public void setParameter(PreparedStatement ps, int i, MyEnum parameter, JdbcType jdbcType) throws SQLException {
              //只将传入的枚举类型的code属性设置为参数
              ps.setString(i,parameter.getCode());
          }
      	//处理结果
          @Override
          public MyEnum getResult(ResultSet rs, String columnName) throws SQLException {
              //从结果集中获取code值
              String code=rs.getString(columnName);
              //最后返回code值对应的枚举类型
              return MyEnum.getEnum(code);
          }
      
          @Override
          public MyEnum getResult(ResultSet rs, int columnIndex) throws SQLException {
              return null;
          }
      
          @Override
          public MyEnum getResult(CallableStatement cs, int columnIndex) throws SQLException {
              return null;
          }
      }
      ```

    - 将自定义类型处理器注册到全局配置文件中

      ```xml
      <typeHandlers>
          <!--typeHandler标签用于注册自定义类型处理器，handler属性接收自定义类型处理器的全限定名，javaType属性用于设置需要处理的javaBe-->
          <typeHandler handler="site.potatoblog.dao.MyTypeHandler" javaType="site.potatoblog.bean.MyEnum"/>
      </typeHandlers>
      ```
