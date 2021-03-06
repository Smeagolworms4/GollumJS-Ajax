GollumJS.NS(GollumJS, function() {

	this.Ajax = new GollumJS.Class({
		
		request: function (param) {
			return new GollumJS.Promise (function(resolve, reject) {
				$.ajax (param)
					.done(resolve)    
					.fail(reject)
				; 
			});
		}
	});

});

GollumJS.NS(GollumJS.Ajax, function() {
	
	var Promise = GollumJS.Promise;
	var JSON = JSON3;
	
	this.Proxy = new GollumJS.Class({
		
		Extends: GollumJS.Ajax,
		
		calling: {},
		results: {},
		
		initialize: function () {
			this.parent().apply(this, arguments);
		},
		
		
		request: function (param) {
			
			var _this = this;
			var id = this.getId(param);
			
			if (this.results[id] !== undefined) {
				return Promise.resolve(this.results[id]);
			}
			if (this.calling[id] !== undefined) {
				return new Promise(function (resolve, reject) {
					_this.calling[id].push({
						resolve: resolve, 
						reject : reject
					});
				});
			}
			
			this.calling[id] = [];
			
			return new Promise(function (resolve, reject) {
				
				_this.calling[id].push({
					resolve: resolve, 
					reject : reject
				});
				
				_this.parent().request(param)
					.then(function (data) {
						
						_this.results[id] = data;
						
						if (_this.calling[id]) {
							for (var i = 0; i < _this.calling[id].length; i++) {
								_this.calling[id][i].resolve(data);
							}
							delete (_this.calling[id]);
						}
					})
					.catch(function (error) {
						if (_this.calling[id]) {
							for (var i = 0; i < _this.calling[id].length; i++) {
								_this.calling[id][i].reject(error);
							}
							delete _this.calling[id];
						}
					})
				;
			});
		},
		
		getId: function (param) {
			return JSON.stringify ([
				param.url,
				param.dataType,
				param.param
			]);
		}
	});

});

GollumJS.config = GollumJS.Utils.extend ({
	
	node: {
		gollumjs_ajax_path: typeof __dirname !== 'undefined' ? __dirname : "" 
	},

	src: {
		path: [ '%node.gollumjs_ajax_path%/index.js' ],
		excludesPath: ["%node.gollumjs_ajax_path%/src"],
	},
	
	className: {
		ajax: {
			ajax: 'GollumJS.Ajax',
			proxy: 'GollumJS.Ajax.Proxy'
		}
	},
	
	services: {
		ajax: {
			class: '%className.ajax.ajax%'
		},
		ajaxProxy: {
			class: '%className.ajax.proxy%'
		}
	}

}, GollumJS.config);


function (err) {
			if(err) {
				return console.error(err);
			}
			console.log (__dirname+"/../index.js => OK");
		}