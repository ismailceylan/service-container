# Service Container

[Dependency Injection][source].

This class provides a structure that organizes other classes. It registers them and enables them to be injected into each other through the argument tunnel as dependencies when needed. In short, it enables the architectural approach called Dependency Injection.

Since there is no native support for features like type casting in JavaScript, classes/functions need to provide their dependencies that they will request from the argument tunnel in camelCase format.

First, the arguments that will receive dependencies should be defined, followed by regular arguments. You should not define regular arguments with the same name as a dependency!

## Usage

```js
import ServiceContainer from "system/core/service-container";

class Gasoline{}
class Coal{}
class V8Engine
{
	constructor( gasoline )
	{
		this.fuel = gasoline;
	}
}

class StirlingEngine
{
	constructor( coal )
	{
		this.fuel = coal;
	}
}

class AstonMartinDB9
{
	constructor( v8Engine, stirlingEngine, color )
	{
		this.engine = v8Engine;
		this.backupEngine = stirlingEngine;
		this.color = color;
	}
}

ServiceContainer.register( V8Engine );
ServiceContainer.register( StirlingEngine );
ServiceContainer.register( Gasoline );
ServiceContainer.register( Coal );
ServiceContainer.register( AstonMartinDB9 );

console.log(
	ServiceContainer.make( "AstonMartinDB9", "antrasit" )
);

// <AstonMartinDB9>
// {
//		color: "antrasit"
// 		engine: <V8Engine>
//		{
//			client: <AstonMartinDB9>{circular}
//			fuel: <Gasoline>
//			{
//				client: <V8Engine>{circular}
//			}
//		}
//		backupEngine: <StirlingEngine>
//		{
//			client: <AstonMartinDB9>{circular}
//			fuel: <Coal>
//			{
//				client: <StirlingEngine>{circular}
//			}
//		}
// }
```

## Functional Equivalent

```js
// ...

ServiceContainer.register( function AstonMartinDB9( v8Engine, color )
{
	this.engine = v8Engine;
	this.color = color;
});

// or

ServiceContainer.register( "AstonMartinDB9", function( v8Engine, color )
{
	this.engine = v8Engine;
	this.color = color;
});

console.log(
	ServiceContainer.make( "AstonMartinDB9", "antrasit" )
);
// <AstonMartinDB9>
// {
// 		engine: <V8Engine>
//		{
//			fuel: <Gasoline>{}
//		}
//		color: "antrasit"
// }
```

## Lisans

[MIT][license] © [İsmail Ceylan][author]

<!-- Linkler -->

[license]: license
[author]: https://github.com/ismailceylan
[source]: https://en.wikipedia.org/wiki/Dependency_injection
