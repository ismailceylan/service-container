# System.Core.ServiceContainer
==============================

[![Size][size-badge]][size]

[Dependency Injection][source].

Bu sınıf, diğer sınıfları düzenleyen bir yapı sağlar. Bunları üzerine register eder ve gerektiğinde birbirlerine bağımlılık olarak argüman tünelinden enjekte edilmelerini sağlar. Yani kısaca Dependency Injection isimli mimari yönelimin *otomatik biçimde* uygulanmasını mümkün kılar.

Javascript'te henüz tür dayatma gibi bir yapı native olarak desteklenmediği için sınıf/fonksiyonların argüman tünelinden talep edecekleri bağımlılıkları **camelCase** biçiminde sağlaması gerekir.

İlk önce bağımlılık alacak olan argümanlar ve ardından normal argümanlar tanımlanmalıdır. Bağımlılık ile aynı isimde normal argümanlar tanımlamamalısınız!

## Örnek Kullanım

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

## Fonksiyonel Kullanım

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
