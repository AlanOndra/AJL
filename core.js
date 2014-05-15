var onReady = {
	handlers: [],
	orsc: function(evt) {
		if(document.readyState === 'complete' || document.readyState === 4) {
			for(var i=0,l=onReady.handlers.length;i<l;i++)
				{ onReady.handlers[i](evt); }
		}
	},
	run: function() {
		if(arguments.length>0) {
			var handler = arguments[0];
			var bubble = (arguments.length > 1 && typeof arguments[1] === 'boolean')
				? arguments[1]
				: false;

			if(document.addEventListener)
				{ document.addEventListener('DOMContentLoaded',handler,bubble); }
			else if(document.attachEvent) {
				if(onReady.handlers.length===0)
					{ document.attachEvent('onreadystatechange',onReady.orsc); }
				onReady.handlers[onReady.handlers.length] = handler;
			}
			else {
				if(onReady.handlers.length===0)
					{ window.onreadystatechange = onReady.orsc; }
				onReady.handlers[onReady.handlers.length] = handler;
			}
		}
	}
};

var Element = function(options) {
	this.tag		= 'div';
	this.text		= null;
	this.attributes	= {};
	this.children	= [];
	this.events		= {};

	for(var property in options) {
		if(property in this)
			{ this[property] = options[property]; }
	}

	this.e = null;

	try {
		this.e = document.createElement(this.tag);

		for(var attr in this.attributes)
			{ this.e.setAttribute(attr,this.attributes[attr]); }

		for(var event in this.events)
			{ Element.addEvent(this.e,event,this.events[event],false); }

		if(typeof this.text === 'string' && this.text.length > 0)
			{ this.e.appendChild(document.createTextNode(this.text)); }
	}
	catch(exc)
		{ window.alert(exc.message); }

	for(var i=0,l=this.children.length,child;i<l;i++) {
		child = this.children[i];

		if(typeof child === 'string')
			{ this.e.appendChild(document.createTextNode(child)); }
		else if(child instanceof Element)
			{ child.setParent(this.e); }
	}

	this.setParent = function(parent) {
		if(parent instanceof Element) {
			this.setParent(parent.e);
		}
		else {
			parent.appendChild(this.e);

			for(var event in this.events)
				{ Element.addEvent(this.e,event,this.events[event],false); }
		}
	};
	this.setSibling = function(sibling) {
		sibling.parentNode.insertBefore(this.e,sibling);

		for(var event in this.events)
			{ Element.addEvent(this.e,event,this.events[event],false); }
	};
	this.addChild = function(element) {
		this.children[this.children.length] = element;
		element.setParent(this.e);
	};

	this.getAttribute = function(attr) {
		this.e.getAttribute(attr);
	};
	this.setAttribute = function(attr,value) {
		this.e.setAttribute(attr,value);
		this.attributes[attr] = value;
	};
	this.removeAttribute = function(attr) {
		this.e.removeAttribute(attr);
		delete this.attributes[attr];
	};
};

Element.verify = function(elmnt) {
	try
		{ return elmnt instanceof HTMLElement; }
	catch(exc)
		{ return typeof obj==="object" && obj.nodeType===1 && typeof obj.style === "object" && typeof obj.ownerDocument ==="object"; }
	return false;
};

Element.wrap = function(elmnt, recurse) {
	if(elmnt.tagName) {
		var attributes = {};
		var children = [];

		for(var i=0,l=elmnt.attributes.length;i<l;i++)
			{ attributes[elmnt.attributes.item(i).nodeName] = elmnt.attributes.item(i).nodeValue; }

		if(recurse===true) {
			for(var i=0,l=elmnt.childNodes.length;i<l;i++) {
				var child = elmnt.childNodes[i];
				if(child.nodeType === 1)
					{ children[children.length] = Element.wrap(child,recurse); }
				else if(child.nodeType===3)
					{ children[children.length] = child.nodeValue; }
			}
		}

		var elem = new Element({
			tag: elmnt.tagName,
			attributes: attributes,
			children: children
		});
		elem.e = elmnt;
		return elem;
	}
};
Element.copy = function(elmnt, recurse) {
	if(elmnt instanceof Element) {
		return new Element({
			tag: elmnt.tag,
			text: elmnt.text,
			attributes: elmnt.attributes,
			children: (recurse) ? elmnt.children : []
		});
	}
	else if(elmnt.cloneNode)
		{ return elmnt.cloneNode(recurse); }
	return false;
};
Element.prototype.copy = function(recurse)
	{ return Element.copy(this, recurse); };

Element.remove = function(elmnt) {
	if(elmnt instanceof Element)
		{ return elmnt.e.parentNode.removeChild(elmnt.e); }
	else if(elmnt.parentNode)
		{ return elmnt.parentNode.removeChild(elmnt); }
	return false;
};
Element.prototype.remove= function()
	{ return Element.remove(this); };

Element.addEvent = function() {
	var elmnt = (arguments.length > 0)
		? arguments[0]
		: false;
	var type = (arguments.length > 1)
		? arguments[1]
		: false;
	var handler = (arguments.length > 2)
		? arguments[2]
		: false;
	var bubble = (arguments.length > 3)
		? arguments[3]
		: false;

	if(arguments.length > 2) {
		if(elmnt instanceof Element) {
			if(!(type in elmnt.events))
				{ elmnt.events[type] = []; }

			elmnt.events[type][elmnt.events[type].length] = handler;
			Element.addEvent(elmnt.e, type, handler, bubble);
		}
		else {
			if(typeof handler == 'function') {
				if(elmnt.addEventListener)
					{ elmnt.addEventListener(type, handler, bubble); }
				else if(elmnt.attachEvent)
					{ elmnt.attachEvent('on'+type, handler); }
				else
					{ elmnt['on'+type] = handler; }
			}
		}
	}
};
Element.prototype.addEvent = function() {
	var type = (arguments.length > 0)
		? arguments[0]
		: false;
	var handler = (arguments.length > 1)
		? arguments[1]
		: false;
	var bubble = (arguments.length > 2)
		? arguments[2]
		: false;

	if(arguments.length>1) {
		Element.addEvent(this, type, handler, bubble);
		return true;
	}
	else {
		return false;
	}
};

Element.removeEvent = function(elmnt, type, handler, bubble) {
	if(elmnt instanceof Element) {
		for(var i=0,l=elmnt.events[type];i<l;i++) {
			var h = elmnt.events[type][i];
			if(h === handler)
				{ elmnt.events[type].splice(i,1); }
		}
		Element.removeEvent(elmnt.e, type, handler, bubble);
	}
	else if(Element.verify(elmnt)) {
		if(elmnt.removeEventListener)
			{ elmnt.removeEventListener(type, handler, bubble); }
		else if(elmnt.detachEvent)
			{ elmnt.detachEvent(type, handler); }
		else
			{ elmnt['on'+type] = null; }
	}
};
Element.prototype.removeEvent = function(type, handler, bubble)
	{ Element.removeEvent(this, type, handler, bubble); };

Element.getStyle = function(elmnt,style) {
	var e = (elmnt instanceof Element)
		? elmnt.e
		: ((Element.verify(elmnt))
			? elmnt
			: false
		);

	if(e) {
		if(window.getComputedStyle)
			{ return window.getComputedStyle(e)[style]; }
		if(e.currentStyle)
			{ return e.currentStyle[style]; }
		if(e.style)
			{ return e.style[style]; }
	}
	return false;
};
Element.prototype.getStyle = function(style)
	{ return Element.getStyle(this,style); };

Element.setStyle = function(elmnt,style,val) {
	var e = (elmnt instanceof Element)
		? elmnt.e
		: ((Element.verify(elmnt))
			? elmnt
			: false
		);

	return (e)
		? e.style[style] = val
		: false;
};
Element.prototype.setStyle = function(style,val)
	{ Element.setStyle(this,style,val); };

Element.getClasses = function(elmnt) {
	if(elmnt instanceof Element)
		{ return elmnt.e.className.split(/\s+/); }
	else if(Element.verify(elmnt) && typeof elmnt.className === 'string')
		{ return elmnt.className.split(/\s+/); }
	return false;
};
Element.prototype.getClasses = function()
	{ return Element.getClasses(this); };

Element.hasClass = function(elmnt,className) {
	var classes = Element.getClasses(elmnt);
	return (classes && classes.indexOf(className) >= 0);
};
Element.prototype.hasClass = function(className)
	{ return Element.hasClass(this, className); };

Element.addClass = function(elmnt,className) {
	if(!Element.hasClass(elmnt,className)) {
		if(elmnt instanceof Element) {
			elmnt.attributes['class'] = elmnt.e.className;
			return elmnt.e.className += ' ' + className;
		}
		else if(Element.verify(elmnt) && typeof elmnt.className === 'string')
			{ return elmnt.className += ' ' + className; }
	}
	return false;
};
Element.prototype.addClass = function(className)
	{ return Element.addClass(this, className); };

Element.removeClass = function(elmnt,className) {
	var classes = Element.getClasses(elmnt);

	if(classes) {
		var index = classes.indexOf(className);

		while(index >= 0) {
			classes.splice(index,1);
			index = classes.indexOf(className);
		}

		if(elmnt instanceof Element) {
			elmnt.attributes['class'] = elmnt.e.className;
			return elmnt.e.className = classes.join(' ');
		}
		else if(Element.verify(elmnt) && typeof elmnt.getAttribute('class') === 'string')
			{ return elmnt.className = classes.join(' '); }
	}

	return false;
};
Element.prototype.removeClass = function(className)
	{ return Element.removeClass(this, className); };

Element.getDataSet = function(elmnt) {
	var prefix = 'data-';

	if(elmnt instanceof Element)
		{ return Element.getDataSet(elmnt.e); }

	var dataset = {};
	var attrs = elmnt.attributes;

	for(var i=0,l=attrs.length;i<l;i++) {
		var attr = attrs.item(i);
		if(attr.nodeName.substr(0,prefix.length)===prefix)
			{ dataset[attr.nodeName.substr(prefix.length)] = attr.nodeValue; }
	}
	return dataset;
};
Element.prototype.getDataSet = function()
	{ return Element.getDataSet(this.e); };

Element.setDataSet = function(elmnt,obj) {
	var prefix = 'data-';

	if(elmnt instanceof Element) {
		Element.setDataSet(elmnt.e, obj);
		for(var prop in elmnt.attributes) {
			if(prop.substr(0,prefix.length)===prefix)
				{ delete elmnt.attributes[prop]; }
		}
		for(var prop in obj)
			{ elmnt.attributes[prefix+prop] = obj[prop]; }
	}
	else {
		var attrs = elmnt.attributes;
		var i = attrs.length;

		while(i--) {
			var attr = attrs.item(i);
			if(attr.nodeName.substr(0,prefix.length)===prefix)
				{ elmnt.removeAttribute(attr.nodeName); }
		}

		for(var prop in obj)
			{ elmnt.setAttribute('data-'+prop,obj[prop]); }
	}
};
Element.prototype.setDataSet = function(obj)
	{ Element.setDataSet(this.e,obj); };

Element.getData = function(elmnt,attr,def) {
	var prefix = 'data-';
	if(elmnt instanceof Element)
		{ return Element.getData(elmnt.e,attr,def); }
	try
		{ return elmnt.getAttribute(prefix+attr) || def || null; }
	catch(exc)
		{ return def || null; }
};
Element.prototype.getData = function()
	{ return Element.getData(this.e); };

Element.setData = function(elmnt,attr,value) {
	var prefix = 'data-';
	if(elmnt instanceof Element) {
		Element.setData(elmnt.e,attr,value);
		elmnt.attributes[prefix+attr] = value;
	}
	else
		{ elmnt.setAttribute(prefix+attr,value); }
};
Element.prototype.setData = function(attr,value)
	{ Element.setData(this.e, attr, value); };

var JS = {
	files: [],
	import: function(options) {
		var scripts = document.getElementsByTagName('script');
		var first = (scripts.length>0) ? scripts[0] : false;
		var load, error;

		if('file' in options && typeof options.file === 'string') {
			var type = ('type' in options && typeof options.type === 'string')
				? options.type
				: 'text/javascript';

			var script = document.createElement('script');
			script.setAttribute('type',type);
			script.setAttribute('src',options.file);

			load = function(evt) {
				if(evt.type === 'load') {
					JS.files[JS.files.length] = options.file;

					if('load' in options)
						{ options.load(evt); }

					Element.removeEvent(script,'load',load);
					Element.removeEvent(script,'readystatechange',load);
					Element.removeEvent(script,'error',error);
				}
				else {
					if(this.readyState === 'complete') {
					//	hack: if loaded, readyState remains the same
						this.children;

						if(this.readyState === 'complete') {
							if('load' in options)
								{ options.load(evt); }
						}
						else {
							if('fail' in options)
								{ options.fail(evt); }

							for(var i=JS.files.length; i--; i>=0) {
								if(JS.files[i] === options.file)
									{ JS.files.splice(i,1); }
							}
						}
						Element.removeEvent(script,'load',load);
						Element.removeEvent(script,'readystatechange',load);
						Element.removeEvent(script,'error',error);
					}
				}
			};

			error = function(evt) {
				if('fail' in options)
					{ options.fail(evt); }

				Element.removeEvent(script,'load',load);
				Element.removeEvent(script,'readystatechange',load);
				Element.removeEvent(script,'error',error);

				for(var i=JS.files.length; i--; i>=0) {
					if(JS.files[i] === options.file)
						{ JS.files.splice(i,1); }
				}
			};

			if(!first)
				{ document.head.appendChild(script); }
			else
				{ document.head.insertBefore(script,first); }

			JS.files[JS.files.length] = options.file;

			Element.addEvent(script,'load',load);
			Element.addEvent(script,'readystatechange',load);
			Element.addEvent(script,'error',error);
		}
	}
};


/**
 * Creates new URL object.
 * @param {type} url URL to parse.
 * @returns {URL}
 */
var URL = function(url) {
	this.href		= null;
	this.protocol	= null;
	this.host		= null;
	this.hostname	= null;
	this.port		= null;
	this.pathname	= '/';
	this.filename	= null;
	this.search		= null;
	this.hash		= null;
	this.parameters	= {};

	this.go = function()
		{ window.location = this.toString(); };

	if(typeof url !== 'string') {
		this.isValid = function()
			{ return false; };
	}
	else {
		var regex = /^([a-z]+\:\/\/)([a-z0-9_.-]+)(\:[0-9]{1,5})?(\/[^\?\#]*)?(\?[^\#]+)?(\#.+)?$/i;
		var matches = url.trim().match(regex);

		if(matches === null || matches === undefined) {
			this.isValid = function()
				{ return false; };
		}
		else {
			this.isValid = function()
				{ return true; };

			this.href		= matches[0];
            this.protocol	= matches[1].substr(0,matches[1].indexOf(':'));
            this.host		= matches[2];
			this.hostname	= matches[2];
			this.pathname	= matches[4] || '/';
			this.search		= matches[5];
			this.hash		= matches[6];

			this.filename = (this.pathname.length > 1 && this.pathname !== '/')
				? this.pathname.substring(this.pathname.lastIndexOf('/')+1)
				: null;

            if(matches[3] !== undefined) {
                this.host += matches[3];
			    this.port = parseInt(matches[3].substring(1));
            }

			if(this.search !== undefined) {
				var searchstring = this.search.replace('?','');
				var params = searchstring.split('&');

				for(var i=0,l=params.length,param=params[i];i<l;i++,param=params[i]) {
					if(param.indexOf('=')!==false) {
						var p = param.split('=');
						var key = p[0];
						var val = p[1];

						if(key.substr(key.length-2) === '[]') {
							key = key.substr(0,key.length-2);
							if(!(key in this.parameters))
								{ this.parameters[key] = []; }

							this.parameters[key][this.parameters[key].length] = val;
						}
						else {
							this.parameters[key] = val;
						}
					}
					else {
						this.parameters[param] = true;
					}
				}
			}
		}
	}
};

var Storage = {
	data: {},
	has: function(key) {
		return (key in this.data);
	},
	get: function(key,def) {
		return (key in this.data)
			? this.data[key] || def
			: def;
	},
	set: function(key,value) {
		return this.data[key] = value;
	},
	remove: function(key) {
		if(key in this.data)
			{ delete this.data[key]; }
	},
	clear: function() {
		this.data = {};
	}
};

var Cookie = {
	has: function(key) {
		if(document.cookie.length>0) {
			var lines = document.cookie.split('; ');
			var k;

			for(var i=0,l=lines.length;i<l;i++) {
				var line = lines[i];

				k = (line.indexOf('=')>=0)
					? line.substr(0,line.indexOf('='))
					: line;

				if(k===key)
					{ return true; }
			};
		}
		return false;
	},
	all: function() {
		var params = {};

		if(document.cookie.length>0) {
			var lines = document.cookie.split('; ');

			for(var i=0,l=lines.length;i<l;i++) {
				var line = lines[i];

				if(line.indexOf('=')>=0)
					{ params[line.substr(0,line.indexOf('='))] = line.substr(line.indexOf('=')+1); }
				else
					{ params[line] = null; }
			}
		}

		return params;
	},
	get: function(key,def) {
		return (this.has(key))
			? decodeURIComponent(this.all()[key]) || def
			: def;
	},
	set: function(key,value,exp) {
		var val = encodeURIComponent(value);

		var expstr = (exp instanceof Date)
			? ('; expires=' + exp.toUTCString())
			: '';

		document.cookie = key+'='+val+expstr;
	},
	remove: function(key) {
		if(this.has(key))
			{ Cookie.set(key+'=0; expires=' + new Date(0).toUTCString()); }
	},
	clear: function() {
		var params = Cookie.all();

		for(key in params)
			{ Cookie.remove(key); }
	}
};

var HTTP = {
	url: new URL(window.location.href),
	request: {
		has: function(key) {
			if(window.location.search.length > 1) {
				var query = window.location.search.substr(1).split('&');
				var k;

				for(var i=0,l=query.length,q=query[i];i<l;i++,q=query[i]) {
					k = (q.indexOf('=')>0)
						? q.substr(0,q.indexOf('='))
						: q;

					if(k.substr(k.length-2)==='[]')
						{ k = k.substring(-2); }

					if(k===key)
						{ return true; }
				};
			}
			return false;
		},
		all: function() {
			var params = {};
			if(window.location.search.length > 1) {
				var query = window.location.search.substr(1).split('&');

				for(var i=0,l=query.length,q=query[i];i<l;i++,q=query[i]) {
					var key;
					var value = null;

					if(q.indexOf('=')>=0) {
						key = q.substr(0,q.indexOf('='));
						value = q.substr(q.indexOf('=')+1);
					}
					else
						{ key = q; }

					if(key.substr(key.length-2)==='[]') {
						key = key.substr(0,key.length-2);
						if(!(key in params))
							{ params[key] = []; }
						params[key][params[key].length] = value;
					}
					else
						{ params[key] = value; }
				}
			}
			return params;
		},
		get: function(key,def) {
			return(key in HTTP.request.all())
				? this.all()[key] || def || null
				: def;
		}
	}
};

var Locale = {
	messages: {},
	get: function() {
		if(document.documentElement.hasOwnProperty('lang'))
			{ return document.documentElement.lang.toLowerCase(); }
		if(window.navigator.hasOwnProperty('language'))
			{ return window.navigator.language.toLowerCase(); }
		if(navigator.hasOwnProperty('userLanguage'))
			{ return navigator.userLanguage.toLowerCase(); }
		return Locale.getDefault();
	},
	def: 'en',
	setDefault: function(locale) {
		if(typeof locale === 'string' && locale.match(/^[a-z]{2,3}(-[a-z]{2,3})?$/i) !== null)
			{ Locale.def = locale.toLowerCase(); }
	},
	getDefault: function() {
		return Locale.def;
	},
	setMessage: function(handle,messages) {
		if(typeof handle === 'string' && typeof messages === 'object') {
			if(!(handle in Locale.messages))
				{ Locale.messages[handle] = {}; }
			for(var locale in messages) {
				if(typeof locale === 'string' && locale.match(/^[a-z]{2,3}(-[a-z]{2,3})?$/i) !== null && typeof messages[locale] === 'string')
					{ Locale.messages[handle][locale.toLowerCase()] = messages[locale]; }
			}
		}
	},
	getMessage: function(handle) {
		var locale = Locale.get();
		var hyphen = locale.indexOf('-');
		var group = (hyphen>=0) ? locale.substr(0,locale.indexOf('-')) : locale;

		if(handle in Locale.messages) {
			if(locale in Locale.messages[handle])
				{ return Locale.messages[handle][locale]; }
			if(group in Locale.messages[handle])
				{ return Locale.messages[handle][group]; }
		}
		return false;
	}
};

function cancelEvent(event) {
	if(event.preventDefault)
		{ event.preventDefault(); }
	else if(event.returnValue)
		{ event.returnValue = false; }
	return false;
}

function random(min,max) {
	return Math.floor(Math.random()*(max-min+1))+min;
}

function noScript() {
	var ns = document.getElementById('noscript');
	if(ns) { ns.parentNode.removeChild(ns); }
}

function getScripts(){
	var scripts = document.getElementsByTagName('script');
	for(var i=0,l=scripts.length;i<l;i++) { JS.files[i] = scripts[i].src; }
}

onReady.run(noScript);
onReady.run(getScripts);
