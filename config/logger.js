var winston = require( 'winston' ),
	fs = require( 'fs' ),
	logDir = 'logs', // Or read from a configuration
	env = process.env.NODE_ENV || 'development',
	logger;

winston.setLevels( winston.config.npm.levels );
winston.addColors( winston.config.npm.colors );

if ( !fs.existsSync( logDir ) ) {
	// Create the directory if it does not exist
	fs.mkdirSync( logDir );
}
logger = new( winston.Logger )( {
	transports: [
		new winston.transports.Console( {
			colorize: true
		} ),
		new winston.transports.File( {
			filename: logDir + '/logs.log',
			maxsize: 1024 * 1024 * 10, // 10MB
			json : false
		} )
    ],
	exceptionHandlers: [
		new winston.transports.File( {
			filename: logDir + '/exceptions.log'
		} )
    ],
    exitOnError: false
} );

module.exports = logger;