# JRIApp
<b>JavaScript (TypeScript actually) HTML5 RIA framework for creating data centric applications</b>
<br/>
<p>
<b>jRIApp</b> – is an application framework for developing rich internet applications - RIA’s. It consists of two parts – 
the client and the server (<i>optional and has a respective optional db addin for the client side</i>) parts. 
The client side part was written in <b>typescript</b> language. The server side part was  written in C# (<i>but potentially can be written in any server side language</i>) 
and the demo application was implemented using ASP.NET MVC project.
<br/>
You can watch a short video of the demo on <a href="https://youtu.be/dQyOOw2dK4w" target="_blank"><b>YouTube</b></a> and <a href="https://www.youtube.com/watch?v=m2lxFWhJghA" target="_blank"><b>Older video</b></a> (<em>although not in the best of quality and a bit outdated</em>). 
<br/>
The framework was designed primarily for creating data centric Line of Business (LOB) applications 
which will work natively in browsers without the need for plugins. (<i>Although it can be used for other types of applications, too.</i>)
</p>
<p>
I wrote this framework because everything i searched for was not suitable for serious desktoplike data centric HTML5 applications.</br>
The other frameworks offer very much what is not needed and very little of what is needed to develop this kind of applications<br/>
They are heavy on dependencies (<i>react app downloads more than 900 npm packages</i>), they can not easily
work with external data, modify it, and commit changes to server (<i>very tedious</i>).
<br/>
<br/>
For example, in React applications you need to keep server side data in a dedicated store and pay attention to immutability of the store data.<br/>
It is not really needed because for the storage of the server side data this framework uses its own dedicated store - dbContext (<i>source of truth and have its own state</i>), and the entities in essence are not inherently immutable. 
You can easily display the same entity's data in multiple places of the User interface and every change in the data will update only parts of the UI which uses it.<br/>
But, the best is the combination of React and this framework - the React shines at rendering logic and this framework shines at using html templates (forms) with databinding which is easily integrated with the React. The React is <em>better used</em> as small islands of the UI (<i>where the rendering logic is needed, not everywhere</i>). It keeps a limited dependence on it, which is good for longevity of the projects.<br/>
<br/>
There's no recent changes in this framework because it is stable now, and i can not find any bugs in it in working projects. So there's no need to change anything in it for now. Typescript makes it even more stable,
because on recompilation with a newer typescript version you get automatically updated version. It can be recompiled to ES6 (instead of ES5) or a newer target easily.
<br/><br/>
(<i>P.S. - the framework depends on JQuery, Moment, QTip, RequireJS. The Moment, QTip and RequireJS are easily replaceable. 
JQuery is used only in the UI part of the framework only for a datepicker, a dialog and a tabs controls.
</i>
).
</br>
The framework is based on (Model-View-ViewModel) MVVM architecture:<br/>
<ul>
<li>It is written in typescript that can be compiled to ES5, ES6 or possibly to any future EcmaScript standards - just recompile it with new settings.</li>
<li>It can work with (<i>data bind to</i>) any HTML Element or Web Component and subscribe to its events, declaratively.</li>
<li>It has built-in ability to work with data stores on the server (<i>Much like Microsoft Entity Framework does</i>)</li>
<li>It has useful components as a Data Grid and others (<i>they are used declaratively and support databinding</i>). It's easy to add new custom ones. Even the new emerging <a href="https://www.webcomponents.org/" target="_blank"><b>web components</b></a> can be enhanced to use databindings to their properties</li>
<li>It can load modules, CSS and HTML templates on demand the first time a template is used (<i>a template can declaratively describe what CSS and JavaScript modules it needs</i>)
It is useful when the modules are only needed for the template, and not needed in other parts of the application.
</li>
<li>It has an ability to wrap any existing UI Control from any framework - like JQuery UI, Bootstrap or anything else. By the way, any <b>extraneous</b> to the framework component could be wrapped and used seamlessly (<i>React components included</i>). So, in the cases if we have something to reuse as a piece of the UI, we can take it and use it.</li>
<li>React components can be wrapped and used declaratively on the HTML page, and React components can use templates with TwoWay databinding in them. It gives a developer a stongly enhanced level of productivity.</li>
<li>It has superb performance because it does not use polling for any property changes and does not use intermixed HTML and Scripts inside a template (<i>the code is 100% separated from HTML- if you choose to do it</i>).</li>
<li>Developers can create unit tests for the view model and the model, without using the view. The unit tests for the view model can exercise exactly the same functionality as used by the view.</li>
<li>The app UI can be redesigned without touching the code. Therefore, a new version of the view should work with the existing view model.</li>
<li>The framework uses HTML5 features implemented in most of the browsers (<i>starting from IE9</i>) and does not need Polyfills 
and the code is not overengineered.</li>
<li>Besides relational databases it can be also used to work with NOSQL because it can work with complex properties of unlimited depth. 
<i>(the properties can be complex objects which can also contain complex properties)</i><br/>
Also, it can work with JSON to bind values extracted from it to the UI controls - it's an easy path to work with NOSQL DB. 
</li>
<li>Classes for using the data service can be used without using the whole framework. They can be used in React, Angular.js and
any other framework no different as when using them with this framework.<br/> 
They are 169KB (when minified or 40KB gzipped) and they are not dependenent on JQuery.
</li>
</ul>
<br/>
The client side of framework is split into 5 bundles:<br/>
<b>jriapp_shared.js</b> - the bundle with common classes (collection types, utilities, other common types)<br/>
<b>jriapp.js</b> - application class and data binding infrastructure (it depends on <b>jriapp_shared.js</b>)<br/>
<b>jriapp_ui.js</b> - element views for the User Interface (it depends on  <b>jriapp.js</b> and <b>jriapp_shared.js</b>). The UI controls in it can be fully replaced with
custom versions. It is just an example how the controls could be created.<br/>
<b>jriapp_db.js</b> - client side entity framework (it depends on  <b>jriapp_shared.js</b>)<br/>
<b>jriapp_langs.js</b> - local strings, needed for other than english language<br/><br/>
If someone does not want to use this framework, but needs only the means to work with 
databases in other frameworks, he (she) can use only <b>jriapp_shared.js</b> and <b>jriapp_db.js</b> bundles.
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
<br/>
 The Full framework minified size is 450KB (or 100KB gzipped).
</p>
<p>
 <b>The framework contains the docs</b>
<p/> 
<b>The Demo application includes:</b>
<p>
The <b>RIAppDemo</b> is the demo project which uses this framework and it also includes server side components of this framework - The Data Service.<br/> 
The <b>DemoTS</b> contains typescript projects which contain code for client side part of the demo project (<i>RIAppDemo</i>).<br/>
On compilation those project produce a set of javascript files which are referenced in the demo projects HTML pages.
</p>
<p>
By using the data service you can generate strongly typed client side domain model in typescript language.
See the DemoTS project for an example. (the DEMODB.ts file contains the generated code.)
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