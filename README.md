# JRIApp
<b>JavaScript (TypeScript actually) HTML5 RIA framework for creating data centric applications</b>
<br/>
<p>
<b>jRIApp</b> – is an application framework for developing rich internet applications - RIA’s. It consists of two parts – 
the client and the server (<i>optional and has a respective optional db addin for the client side</i>) parts. 
The client side part was written in <b>typescript</b> language. The server side part was  written in C# (<i>but potentially can be written in any server side language</i>) 
and the demo application was implemented using ASP.NET MVC project.
<br/>
(<i>
In order to use the Demo you need Microsoft SQL Server (Express edition will suffice) installed and Microsoft's Adventure Works (the Lite version) database is attached
 <a href="https://msdn.microsoft.com/en-us/library/dd410121.aspx" target="_blank"><i>How to attach AdventureWorksLT</i></a>.
</i>)
<br/>
The framework was designed primarily for creating data centric Line of Business (LOB) applications 
which will work natively in browsers without the need for plugins. (<i>Although it can be used for other types of applications, too.</i>)
</p>
<p>
I wrote this framework because everything i searched through was not suitable for serious data centric HTML5 applications.</br>
The other frameworks offer very much what is not needed and very little of what is needed to develop 
this kind of applications<br/>
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
<li>It has an ability to wrap any existing UI Control from any framework - like JQuery UI, Bootstrapp, Kendo or anything else.</li>
<li>It has superb performance because it does not use polling for any property changes and does not use
intermixed HTML and Scripts inside template (<i>the code is 100% separated from HTML- if you choose to do it</i>).</li>
<li>And the code does not know (agnostic) about the structure of HTML page.</li>
<li>The framework uses HTML5 features implemented in most of the browsers (<i>starting from IE9</i>) and does not need Polyfills 
and the code is not overengineered.</li>
<li>Classes for using the data service can be used without using the whole framework. They can be used in React, Angular.js and
any other framework no different as when using them with this framework. They are 158 kb.(minified)</li>
</ul>
<br/>
The client side of framework is split into 5 bundles: 
<b>jriapp_shared.js</b> - the bundle with common classes (collection types, utilities, other common types)
<b>jriapp.js</b> - application class and data binding infrastructure (it depends on <b>jriapp_shared.js</b>)
<b>jriapp_ui.js</b> - element views for the User Interface (it depends on  <b>jriapp.js</b> and <b>jriapp_shared.js</b>)
<b>jriapp_db.js</b> - client side entity framework (it depends on  <b>jriapp_shared.js</b>)
<b>jriapp_langs.js</b> - local strings, needed for other than english language
<br/>
If someone does not want to use this framework, but needs only the means to work with 
databases in other frameworks, he (she) can use only <b>jriapp_shared.js</b> and <b>jriapp_db.js</b> bundles.
<br/>
It can also be used to work with NOSQL and relational databases because it can work with complex properties of unlimited depth. 
<br/>
The entities and DbContext is strongly typed because the client domain model (entities, lists, dictionaries, dbsets, dbcontext) is generated in typescript language by data service methods
and there's no need to use dynamically typed ones. It provides more reliability for the application and much more easy refactoring.
<br/>
The data service (<i>the server side</i>) can work with data managers for each entity 
(<i>it is optional, but is very useful not to have a long sheet of code inside the data service</i>). 
This feature allows to separate the CRUD and query methods for each entity into its own class.
<br/>
The Databinding uses classic property change tracking notification pattern and 
there's a <i>BaseObject</i> class in the framework which supports change notification and events.
<br/>
The Events implemented to allow for provision of a namespace when subscribing to them, 
which helps to unsubscribe from a bunch of them very easily - by just providing the namespace.
They, also, can have the priority set for them when subscribing.
<br/><br/>
I have chosen not to implement features which can be easily borrowed from third party libs.<br/>
For example, there's no dependency injection feature because the <a href="https://github.com/inversify/InversifyJS" target="_blank"><i>Inversify.js</i></a> library can be used for that.
It has no Router implementation because switching the views using the framework is done by changing the property value (the current name of the template displaying inside the dynacontent).
In the framework's SPA demo it is done by binding an anchor to a command on the view model. 
But nothing prevents from using any existing Routers implementations like <a href="https://github.com/tildeio/router.js/" target="_blank"><i>Router.js</i></a> 
and changing that view model's property value in the Router's callback function.<br/>
Also the framework  does not use handlebars style templates. 
The templates in the framework are simple HTML snippets in which data binding can be used.
What makes them very functional is that they can use element views (aka directives) which are data bound to the data context of the template's instance. 
It can implement sophisticated scenarios much simpler than by using the handlebars 
(look at the treeview demo, for example) and don't mix the code with HTML at the same time.<br/>
The framework does not use Reactive Extensions (<i>RX.js</i>) because they are heavyweight and not really needed for internal implementation.<br/>
The framework's data binding resembles Microsoft Silverlight data bindings style.<br/><br/>
The framework is protected from overposting attacks out of the box because it uses metadata on the  server which checks what is posted and it uses special
tabular format to transfer queries data to and from the server.
Protection from XSRF attacks is handled by allowing to add headers to all requests to the server. This feature can be used to attach
anti XSRF tokens to the requests.
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
LICENSE: MIT LICENSE
</p>
P.S. There are videos on my youtube channel (for the old version of the framework)<br/>
You can watch an old video of the SPA demo on <a href="http://youtu.be/m2lxFWhJghA" target="_blank">YouTube SPA Demo</a>. 
I made some improvements to the demos since that time. In addition there are more demo pages than the SPA demo in the video. 
(<i>DataGrid Demo, Master Details Demo, Many To Many Demo, Files Explorer Demo, DataBinding Demo, Collections Demo, TreeView Demo</i>)
So it is better to use the real demo to see how it works in real life.<br/>
I don't want to publish online demo because it needs to pay for that on my part, and the demos use a real database instead of per session only data.
The Demos are more real worldish than simple <b>TO DO</b> demos many framework makers publish, because i tried to test every feature in the framework using the demos, but the TO DO application is too simple for this.