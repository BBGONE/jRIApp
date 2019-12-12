# JRIApp
<b>JavaScript (TypeScript actually) HTML5 RIA framework for creating data centric applications</b>
<br/>
<p>
I have moved the DEMO to the <b>ASP NET.Core</b> platform <a href="https://github.com/BBGONE/JRIApp.Core" target="_blank"><b>JRIApp.Core</b></a>. Also the new DEMO version have been restyled with twitter bootstrap 4.
</p>
<p>
<b>jRIApp</b> � is an application framework for developing rich internet applications - RIA�s. It consists of two parts � 
the client and the server (<i>optional and has a respective optional db addin for the client side</i>) parts. 
The client side part was written in <b>typescript</b> language. The server side part was  written in C# (<i>but potentially can be written in any server side language</i>) 
and the demo application was implemented using ASP.NET MVC project.
<br/>
You can watch a short video of the demo on <a href="https://youtu.be/dQyOOw2dK4w" target="_blank"><b>YouTube</b></a> and <a href="https://www.youtube.com/watch?v=m2lxFWhJghA" target="_blank"><b>Older video</b></a>. 
<br/>
The framework was designed primarily for creating data centric Line of Business (LOB) applications 
which will work natively in browsers without the need for plugins.
</p>
<p>
I  have written this framework because existing frameworks which i had found was not suitable for the data centric HTML5 applications.</br>
</br>
The framework uses (Model-View-ViewModel) MVVM architecture:<br/>
<ul>
<li>It is written in typescript that can be compiled to ES5, ES6 or possibly to any future EcmaScript standards.</li>
<li>It can work with (<i>data bind to</i>) any HTML Element or Web Component and subscribe to its events, declaratively.</li>
<li>It has a built-in ability to work with data stores (databases) on the server</li>
<li>It has components such as Data Grid and others (<i>they can be used declaratively</i>). It's easy to add custom ones.</li>
<li>It can load modules, CSS and HTML templates on demand (<i>a template can load CSS and JavaScript modules declaratively</i>)</li>
<li>It can be used to wrap any existing UI Control from other framework - like JQuery UI, Bootstrap or anything else.</li>
<li>It has a superb performance because it does not use polling for any property changes and does not use scripts inside the templates (<i>the code is 100% separated from the HTML markup- if you choose to do it</i>).</li>
<li>And the code is agnostic about the structure of a HTML page.</li>
<li>The framework code is not overengineered.</li>
<li>Besides the relational databases it also can be used to work with NOSQL</i></li>
<li>It is mature and used to create the real applications in an insurance company where i work</i></li>
<li>Parts of the framework can be used independently. The classes for using the data service (<i>the DbContext</i>) can be used without using the whole framework. They can be used in the ReactJS, AngularJS and
other framework no different as when using them with this framework.<br/> 
They are 169KB (when minified or 40KB gzipped) and they are not dependenent on JQuery.<br>
The User Interface implementation is optional  and can be omitted or replaced with a custom one.
</li>
</ul>
<p>The framework is superior over ReactJS and AngularJS for creation of large data centric applications 
(<i>since they need a lot of the plumbing code to provide the data through the hierarchical component tree</i>).
Instead, the JRIApp allows abitrary placing individual components on the page, including declarative means of supplying the data to the constructor (<i>through the injection or the databinding</i>).
The JRIApp can use its own templates which have the datacontexts to obtain the data in them, it also has a view switching (<i>like the *ngIf in AngularJS, but with its own means</i>). 
The JRIApp allows a very easy use of components built with different third party libraries like the <b>React.js</b>
(<i>for example, if we have a complex React component which we want to reuse - we can wrap it in an element view and use it like any other one in our applications,
the component can be used declaratively on the page exposing properties which can be databound. The Demo shows how to do it.</i>).
The applications are developed much faster and without losing the ability to maintain them in the long term.
</p>
<br/>
The client side of framework is split into 5 bundles:<br/>
<b>jriapp_shared.js</b> - the bundle with common classes (collection types, utilities, other common types)<br/>
<b>jriapp.js</b> - application class and data binding infrastructure (it depends on <b>jriapp_shared.js</b>)<br/>
<b>jriapp_ui.js</b> - element views for the User Interface (it depends on  <b>jriapp.js</b> and <b>jriapp_shared.js</b>)<br/>
<b>jriapp_db.js</b> - client side entity framework (it depends on  <b>jriapp_shared.js</b>)<br/>
<b>jriapp_langs.js</b> - local strings, needed for other than english language<br/><br/>
If someone needs only the means to work with the databases in other frameworks, he (she) can only use the <b>jriapp_shared.js</b> and the <b>jriapp_db.js</b> bundles.
<br/><br/>
 The server side part provides a code generation feature. The client side domain model (<i>entities, lists, dictionaries, dbsets, dbcontext</i>) is generated in statically typed typescript language.
 It provides more reliability for the application and much more easy refactoring and maintenance.
<br/>
 The data service (<i>on the server side</i>) can work with data managers for each entity (<i>it is optional, but is very useful not to have a long sheet of code inside the data service</i>). 
 This feature allows to separate the CRUD and query methods for each entity into its own class. (<i>in the demo i used a mix to show that is possible to use any style</i>)
<br/>
 The Databinding uses classic property change event notification pattern and there's a <i>BaseObject</i> class in the framework which supports change notification and events.
<br/>
 Subscription to custom object's events can provide a namespace when subscribing to them, which allows to unsubscribe from a bunch of them very easily - by just providing the namespace.
 The events can also have a priority set for them when subscribing (<i>event priority is used in the db bundle to have the highest event priority for the association which subscribes
 to the collection events, and the above normal priority is also used in the dataview class. Everywhere else is used the normal priority for subscription</i>).
<br/>
  Testing is very easy because user interface is separate from the code. It is very similar to creating and testing applications
with Microsoft Windows Presentation Foundation (WPF).
<br/>
<br/>
 Full framework minified size is 438KB (or 98KB gzipped).
</p>
<b>The Demos include:</b>
<p>
The <b>RIAppDemo</b> is the demo project which uses this framework and it also includes server side components of this framework - The Data Service.<br/> 
The <b>demoTS</b> contains typescript projects which contain code for client side part of the demo projects (the <i>RIAppDemo</i> and the <i>NancySelfHost</i>).<br/>
On compilation those project produce a set of javascript files which are referenced in the demo projects HTML pages<br/>

The <b>WebsocketServer</b> is a demo implementation of a websocket service which supplies quotes of the day. It is used in the DataGrid Demo example. 
It is created using <a href="https://github.com/sta/websocket-sharp" target="_blank">websocket-sharp</a> implementation.
</p>
<p>
	By using the data service you can generate strongly typed client side domain model in typescript language.
See the demoTS project for an example. (the DEMODB.ts file contains the generated code.)
The documentation explains how you can use the framework in more details.
</p>
<p>
<i>
	In order to use the Demo you need Microsoft SQL Server (Express edition will suffice) installed and Microsoft's Adventure Works (the Lite version) database is attached<br/>
For that, first find under which account MS SQL is running (using Transact SQL or just watch it in the services)<br/>
<pre>
--TSQL to find under which account the Server is running
DECLARE @sqlser varchar(120);
EXEC master..xp_regread @rootkey='HKEY_LOCAL_MACHINE', 
@key='SYSTEM\CurrentControlSet\Services\MSSQLSERVER', 
@value_name='objectname', @value=@sqlser OUTPUT;
SELECT convert(varchar(30),@sqlser) as [ACCOUNT]
</pre>
<br/>
If it is running under <b>SYSTEM</b> account then just attach the AdventureWorks database with the next command<br/>
<pre>
--do not forget to edit the path to the db file!
CREATE DATABASE AdventureWorksLT2012   
ON (FILENAME = 'C:\DATA\DB\DATA\AdventureWorksLT2012_Data.mdf') 
FOR ATTACH_REBUILD_LOG;
</pre>
If it is running under <b>NT Service\MSSQLSERVER</b> account then you need to grant full access right to the folder with the db file to this account.
And you need to execute script to attach the db from Sql Server Management Studio by starting it using 'Run As Administrator'
</i>
</p>
<p>
LICENSE: MIT LICENSE
</p>