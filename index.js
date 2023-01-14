import { camelCase } from "../../helper/typo";

/**
 * class yapılarını düzenleyen class üstü bir yapı sağlar. Bu yapıya teslim edilen
 *   classlar artık "service container" olarak anılır.
 * 
 * Ayrıca metotlar ihtiyaç duydukları servis örneklerine erişmek için servisin adını
 *   parametre tüneline camelCase formatında yazarak bağımlılıkların kendilerine enjekte
 *   edilmelerini sağlayabilirler.
 * 
 * @module
 * @class ServiceContainer
 */
class ServiceContainer
{
	/**
	 * Verilen bir sınıfı saklar.
	 * 
	 * Aşağıdaki örneklerin tümü geçerlidir.
	 * 
	 * ```javascript
	 * ServiceContainer.register( "anonymous", function()
	 * {
	 * 
	 * });
	 * 
	 * ServiceContainer.register( function foo()
	 * {
	 * 
	 * });
	 * 
	 * ServiceContainer.register( class bar
	 * {
	 * 
	 * });
	 * ```
	 *
	 * @static
	 * @param {String|Function} name bir isim veya isimli bir metot/sınıf
	 * @param {Function} constructor isimli veya isimsiz bir metot veya bir sınıf
	 * @memberof ServiceContainer
	 * @author İsmail Ceylan
	 * @created 2020-09-07T15:01:23+0300
	 */
	static register( name, constructor )
	{
		if( name instanceof Function )
		{
			constructor = name;
			name = constructor.name;
		}

		this.registry[ camelCase( name )] = constructor;
	}

	/**
	 * Daha önceden register edilmiş adı verilen bir servisi örnekleyip döndürür.
	 *
	 * @static
	 * @param {String} serviceContainerName örneklenecek bir servis (sınıf) camelCase adı
	 * @param {Array} args örneklenen sınıfa geçirilecek parametreler
	 * @return {Object} geriye adı verilen servisin bir örneği döner
	 * @memberof ServiceContainer
	 * @author İsmail Ceylan
	 * @created 2020-09-07T15:12:06+0300
	 */
	static make( serviceContainerName, ...args )
	{
		let serviceContainer = this.registry[ camelCase( serviceContainerName )];

		if( ! serviceContainer )

			throw new ReferenceError( `Unknown service container: "${serviceContainerName}"` );
		
		let dependencies = this.loadDependencies(
			this.parseDependencies( serviceContainer )
		);

		let instance = new serviceContainer(
			...dependencies,
			...args
		);

		dependencies.forEach( dep =>
			dep.client = instance
		);

		instance.boot && instance.boot();

		return instance;
	}

	/**
	 * Verilen bir metot/sınıfın kurucusunda tanımlanan argüman isimlerini parse edip
	 *   bir dizi olarak döndürür.
	 *
	 * @static
	 * @param {Function} serviceContainer bağımlılıkları parse edilecek bir metot/class
	 * @return {Array} geriye verilen metot/sınıfın kurucusunda tanımlanan argüman isimleri döndürülür
	 * @memberof ServiceContainer
	 * @author İsmail Ceylan
	 * @created 2020-09-07T15:19:45+0300
	 */
	static parseDependencies( serviceContainer )
	{
		if( serviceContainer.dependencies )

			return serviceContainer.dependencies;
		
		let source = serviceContainer.toString();
		let matches = source.match( /constructor\s*\(\s*(.*)\s*\)|^function\s*(?:\w+)?\(\s*(.*)\s*\)/i );
		let match = matches && ( matches[ 1 ] || matches[ 2 ]);
			
		return serviceContainer.dependencies =
			match
				? match.split( "," ).map( item => item.trim())
				: [];
	}

	/**
	 * Dizi olarak verilen bağımlılıkları örnekleyip tekrar dizi olarak döndürür. Mevcut
	 *   olmayan servisler pas geçilir ve döndürülen dizide yer almazlar.
	 *
	 * @static
	 * @param {Array} dependencies örneklenecek bağımlılıkların camelCase gösterimlerinden
	 *   oluşan dizi
	 * @returns
	 * @memberof ServiceContainer
	 * @author İsmail Ceylan
	 * @created 2020-09-07T16:08:05+0300
	 */
	static loadDependencies( dependencies )
	{
		let deps = [];

		for( let dependency of dependencies )
		{
			let pureDep = dependency.slice( 1 );

			if( dependency[ 0 ] === "$" && this.registry[ pureDep ])
			
				deps.push( ServiceContainer.make( pureDep ));
		}

		return deps;
	}
}

ServiceContainer.registry = {};

export default ServiceContainer;
