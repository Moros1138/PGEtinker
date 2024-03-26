var Walker = require( 'walker' ),
	path = require( 'path' ),
	fs = require( 'fs' ),
	handlebars = require( 'handlebars' ),
	basePath = path.resolve( __dirname, '..' ),
	jsPath = path.join( basePath, 'src/js' ),
	fileOptions = { encoding: 'utf-8' },
	indexContent = fs.readFileSync( path.join( basePath, 'index.hbs' ), fileOptions ),
	indexTemplate = handlebars.compile( indexContent ),
	indexWritePath = path.join( basePath, 'index.html' );

handlebars.registerHelper( 'toJSON', function( input ) {
	return new handlebars.SafeString( JSON.stringify( input ) );
} );

var namespace = function( segments, node ) {
	for( var i = 0; i < segments.length; i++ ) {
		if( segments[ i ].length === 0 ) continue;

		if( !node[ segments[ i ] ] ) {
			node[ segments[ i ] ] = {};
		}

		node = node[ segments[ i ] ];
	}
};

module.exports = function() {

	var walker = Walker( jsPath ), // jshint ignore:line
		data = { files: [], directories: [] },
		done = this.async(),
		earlyFiles = [ '/utils/utils.js', '/items/AbstractContentItem.js' ];

	walker.on( 'file', function( file ) {
		var filePath = file.replace( jsPath, '' );

		if( earlyFiles.indexOf( filePath ) === -1 ) {
			data.files.push( filePath );
		}
	} );

	walker.on( 'dir', function( dir ) {
		data.directories.push( dir );
	} );

	walker.on( 'end', function() {
		data.files.sort();
		data.files = earlyFiles.concat( data.files );
		data.directories.sort();

		var directories = {};
		data.directories.forEach( function( dir ) {
			namespace( dir.replace( jsPath, '' ).split( path.sep ), directories );
		} );
		data.directories = directories;
		var ns = 'var lm=' + JSON.stringify( data.directories ) + ';';
		fs.writeFileSync( __dirname + '/ns.js', ns );
		fs.writeFile( indexWritePath, indexTemplate( data ), done );
	} );
};
