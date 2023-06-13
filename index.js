import { camelCase } from "../../helper/typo";

/**
 * It provides a class-based structure that organizes class structures. The classes
 * delivered to this structure are now referred to as "service containers."
 *
 * Additionally, methods can access the service instances they require by writing
 * the service's name in the parameter tunnel in camelCase format, enabling the
 * dependencies to be injected into them.
 * 
 * @module
 * @class ServiceContainer
 */
class ServiceContainer
{
	/**
	 * It stores a given class.
	 * 
	 * All of the following examples are valid.
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
	 * @param {String|Function} name a name or a named method/class
	 * @param {Function} constructor a named or anonymous method/function or a class
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
	 * It instantiates and returns a previously registered service instance with the given name.
	 *
	 * @static
	 * @param {String} serviceContainerName the camelCase name of a service (class) to be instantiated.
	 * @param {Array} args örneklenen the parameters to be passed to the class.
	 * @return {Object}
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
	 * It parses the argument names defined in the constructor of a given
  	 * method/class and returns them as an array.
	 *
	 * @static
	 * @param {Function} serviceContainer a method/class whose dependencies will be parsed.
	 * @return {Array}
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
	 * It instantiates the dependencies provided as an array and returns them as an array. If
  	 * any services are not available, they are skipped and won't be included in the returned array.
	 *
	 * @static
	 * @param {Array} dependencies an array consisting of camelCase representations of the
  	 *   dependencies to be instantiated.
	 * @returns void
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
