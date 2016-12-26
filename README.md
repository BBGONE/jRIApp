# JRIApp
<b>JavaScript (TypeScript actually) HTML5 RIA framework for creating data centric applications</b>
<br/>
<p>
<b>jRIApp</b> – is an application framework for developing rich internet applications - RIA’s. It consists of two parts – 
the client and the server (<i>optional and has a respective optional db addin for the client side</i>) parts. 
The client side part was written in <b>typescript</b> language. The server side part was  written in C# (<i>but potentially can be written in any server side language</i>) 
and the demo application was implemented using ASP.NET MVC project.
<br/>
You can watch a short video of the demo on <a href="https://youtu.be/dQyOOw2dK4w" target="_blank"><b>YouTube</b></a> and <a href="https://www.youtube.com/watch?v=m2lxFWhJghA" target="_blank"><b>Older video</b></a>. 
<br/>
The framework was designed primarily for creating data centric Line of Business (LOB) applications 
which will work natively in browsers without the need for plugins. (<i>Although it can be used for other types of applications, too.</i>)
</p>
<p>
I wrote this framework because everything i searched through was not suitable for serious data centric HTML5 applications.</br>
The other frameworks offer very much what is not needed and very little of what is needed to develop this kind of applications<br/>
(<i>P.S. - the framework depends on JQuery, Moment, QTip, Require. The Moment, QTip and Require are easily replaceable, 
but JQuery is more widely used in the framework (<i>but also can be replaced if needs be</i>).
</i>
).
</br>
The framework is based on (Model-View-ViewModel) MVVM architecture:<br/>
<ul>
<li>It is written in typescript that can be compiled to ES5, ES6 or possibly to any future EcmaScript standards - just recompile it with new settings.</li>
<li>It can work with (<i>data bind to</i>) any HTML Element or Web Component and subscribe to its events, declaratively.</li>
<li>It has built-in ability to work with data stores on the server (<i>Much like Microsoft Entity Framework does</i>)</li>
<li>It has useful components as Data Grid and others (<i>and be used declaratively</i>). It's easy to add custom ones.</li>
<li>It can load modules, CSS and HTML templates on demand (<i>a template can load CSS and JavaScript modules</i>)</li>
<li>It has an ability to wrap any existing UI Control from any framework - like JQuery UI, Bootstrap or anything else.</li>
<li>It has superb performance because it does not use polling for any property changes and does not use
intermixed HTML and Scripts inside template (<i>the code is 100% separated from HTML- if you choose to do it</i>).</li>
<li>And the code does not know (agnostic) about the structure of HTML page.</li>
<li>The framework uses HTML5 features implemented in most of the browsers (<i>starting from IE9</i>) and does not need Polyfills 
and the code is not overengineered.</li>
<li>Besides relational databases it can also be used to work with NOSQL because it can work with complex properties of unlimited depth. 
<i>(the properties can be complex objects which can also contain complex properties)</i><br/>
Also, it can work with JSON to bind values extracted from it to the UI controls - it's an easy path to work with NOSQL DB. 
</li>
<li>Classes for using the data service can be used without using the whole framework. They can be used in React, Angular.js and
any other framework no different as when using them with this framework. They are 158 kb.(minified)</li>
</ul>
<br/>
The client side of framework is split into 5 bundles:<br/>
<b>jriapp_shared.js</b> - the bundle with common classes (collection types, utilities, other common types)<br/>
<b>jriapp.js</b> - application class and data binding infrastructure (it depends on <b>jriapp_shared.js</b>)<br/>
<b>jriapp_ui.js</b> - element views for the User Interface (it depends on  <b>jriapp.js</b> and <b>jriapp_shared.js</b>)<br/>
<b>jriapp_db.js</b> - client side entity framework (it depends on  <b>jriapp_shared.js</b>)<br/>
<b>jriapp_langs.js</b> - local strings, needed for other than english language<br/><br/>
If someone does not want to use this framework, but needs only the means to work with 
databases in other frameworks, he (she) can use only <b>jriapp_shared.js</b> and <b>jriapp_db.js</b> bundles.
<br/><br/>
	The worst thing about JavaScript is that it is not statically typed, so if you need to maintain a lot of JavaScript code you'll need to be very disciplined 
(and your team members as well) or you'll end up in maintenance hell (<i>This is especially true for data centric applications which greatly benefit from statically typed client side domain model</i>).<br/> 
By using code generation feature, The client side domain model (<i>entities, lists, dictionaries, dbsets, dbcontext</i>) is generated in statically typed typescript language.
 It provides more reliability for the application and much more easy refactoring and maintenance.
<br/>
	The data service (<i>on the server side</i>) can work with data managers for each entity (<i>it is optional, but is very useful not to have a long sheet of code inside the data service</i>). 
This feature allows to separate the CRUD and query methods for each entity into its own class. (<i>in the demo i used a mix to show that is possible to use any style</i>)
<br/>
	The Databinding uses classic property change event notification pattern and there's a <i>BaseObject</i> class in the framework which supports change notification and events.
<br/>
	The Events implemented to allow for provision of a namespace when subscribing to them, which helps to unsubscribe from a bunch of them very easily - by just providing the namespace.
They, also, can have the priority set for them when subscribing (<i>event priority is used in the db bundle to have the highest event priority for the association which subscribes
to the collection events, and the above normal priority is also used in the dataview class. Everywhere else is used the normal priority for subscription</i>).
<br/>
Another thing to mention is that this framework uses approach of beefed up data side (<i>entities, view models, element views</i>) and no code user interface side (<i>templates</i>).
In other frameworks you can use coding constructs (<i>if, else, foreach ...</i>) inside templates and referencing parent data contexts in there. 
But in this framework it's the reverse of it.
The coding constructs moved to the element views (<i>where the logic belongs</i>) and instead of referencing some parent datacontext inside the template (<i>using parent keyword, for example</i>), 
anybody can expose object instances for databinding using properties.<br/>
Templates and Data Forms use the datacontext for databinding inside of them and each property on the application instance is also available for it. 
If that's not enough (<i>sometimes it is</i>), entities allow to set custom values and expose them through calculated fields (<i>look into the treeview demo, for example</i>). 
So with this set of options nobody who uses this framework will ever have a roadblock to bind some values, because anyone can always expose the data in the needed context.
<br/>
<br/>
The full framework minified size is 380KB (or 85,5 kb gzipped).
</p>
<p>
	<b>The framework contains the docs which at present for the old version of the framework (it can be used anyway)</b>
<p/> 
<b>The Demos include:</b>
<p>
The <b>RIAppDemo</b> is the demo project which uses this framework and it also includes server side components of this framework - The Data Service.<br/> 
The <b>NancySelfHost</b> is another demo project which shows how to use the jriapp framework with NancyFX framework (http://nancyfx.org/) in self hosting environment.<br/>
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