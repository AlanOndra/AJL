var FX = {
	SlideShow: function(options) {
//		scope-safe binding
		var me = this;

//		properties
		this.element	= null;
		this.slides		= [];
		this.position	= false;
		this.seconds	= 3;
		this.timer		= false;
		this.wrap		= true;
		this.show		= {
			prev:			true,
			next:			true,
			slides:			true
		};
		this.toolbar	= null;

//		required options: element (HTMLElement) and slides (array)
		if(
			'element' in options &&
			options.element instanceof HTMLElement &&
			'slides' in options &&
			typeof options.slides === typeof [] &&
			options.slides.length > 0
		) {
			this.element	= options.element;
			this.slides		= options.slides;
			this.position	= 0;

			if('seconds' in options && typeof options.seconds == 'number')
				{ this.seconds = options.seconds; }

			if('wrap' in options && typeof options.wrap == 'boolean')
				{ this.wrap = options.wrap; }

			if('show' in options && typeof options.show == 'object') {
				if('prev' in options.show && typeof options.show.prev == 'boolean')
					{ this.show.prev = options.show.prev; }

				if('next' in options.show && typeof options.show.next == 'boolean')
					{ this.show.next = options.show.next; }

				if('slides' in options.show && typeof options.show.slides == 'boolean')
					{ this.show.slides = options.show.slides; }
			}

//			preload images
			for(var i=0,l=this.slides.length;i<l;i++)
				{ (new Image()).src = this.slides[i].src; }

//			if no a tag, create one
			var links = this.element.getElementsByTagName('a');
			var link;

			if(links.length === 0) {
				link = new Element({
					tag: 'a',
					attributes: {
						href:		me.slides[0].href,
						'class':	'slide'
					}
				});
				link.setParent(this.element);
				link = link.e;
			}
			else {
				link = links[0];
			}

//			if no img tag, create one
			var imgs = link.getElementsByTagName('img');

			if(imgs.length === 0) {
				var slides = this.slides;
				(new Element({
					tag: 'img',
					attributes: {
						src: me.slides[0].src,
						alt: me.slides[0].title,
						title: me.slides[0].title,
					}
				})).setParent(link);
			}

			if(this.show.prev || this.show.next || this.show.slides) {
//				create toolbar
				this.toolbar = new Element({
					tag: 'div',
					attributes: {
						'class': 'toolbar'
					}
				});

				if(this.show.prev) {
//					create prev button
					this.toolbar.addChild(new Element({
						tag: 'a',
						attributes: {
							'class': 'button prev',
							href: '#'
						},
						children: ['\u25c0'],
						events: {
							click: function(evt) {
								me.prev();
								return cancelEvent(evt);
							}
						}
					}));
				}

				if(this.show.next) {
//					create next button
					this.toolbar.addChild(new Element({
						tag: 'a',
						attributes: {
							'class': 'button next',
							href: '#'
						},
						children: ['\u25b6'],
						events: {
							click: function(evt) {
								me.next();
								return cancelEvent(evt);
							}
						}
					}));
				}

				if(this.show.slides) {
//					create slide inidcators
					var ul = new Element({
						tag: 'ul',
						attributes: {
							'class': 'slides'
						}
					});

					this.toolbar.addChild(ul);

					for(var i=0,l=this.slides.length;i<l;i++) {
						ul.addChild(new Element({
							tag: 'li',
							children: [
								new Element({
									tag: 'a',
									attributes: {
//									store slide number in href
										href: '#'+i
									},
									events: {
										click: function(evt) {
											var href = evt.target.href;
//											remove URL through # then convert to int
											var index = parseInt(href.substr(href.lastIndexOf('#')+1));
											me.select(index);
											return cancelEvent(evt);
										}
									},
									children: [ (i+1).toString() ]
								})
							]
						}));
					}
				}

				this.toolbar.setParent(this.element);
			}

//			select next slide
			this.next = function() {
				if(this.position !== false) {
					this.position++;
					var l = this.slides.length;

					if(this.position >= l) {
						this.position = (this.wrap)
							? 0
							: l - 1;
					}
					this.render();
				}
			};

//			select previous slide
			this.prev = function() {
				if(this.position !== false) {
					this.position--;
					var l = this.slides.length;

					if(this.position <= 0) {
						this.position = (this.wrap)
							? l - 1
							: 0;
					}
					this.render();
				}
			};

//			select slide at index
			this.select = function(index) {
				if(index >= 0 && index <= this.slides.length) {
					this.position = index;
					this.render();
				}
			};

//			update the hyperlink and image
			this.render = function() {
				clearTimeout(this.timer);

				var slide = this.slides[this.position];

//				select current
				var ul = false;

				for(var i=0,l=this.toolbar.children.length;i<l;j++) {
					if(this.toolbar.children[i].tag == 'ul')
						{ ul = this.toolbar.children[i]; break; }
				}

				if(ul) {
					for(var i=0,l=ul.children.length;i<l;i++)
						{ ul.children[i].removeClass('selected'); }
					ul.children[this.position].addClass('selected');
				}

				var link = this.element.getElementsByTagName('a')[0];
				var img = link.getElementsByTagName('img')[0];

				link.href	= slide.href;
				img.src		= slide.src;
				img.alt		= slide.title;
				img.title	= slide.title;

				this.timer = setTimeout(function(){me.next();},this.seconds*1000);
			};

			this.render();
		}
	},
	Lightbox: function(options) {
		var me = this;

		this.form		= null;
		this.id			= null;
		this.className	= null;
		this.action		= '#';
		this.method		= 'get';
		this.title		= null;
		this.toolbar	= [];
		this.content	= [];
		this.show		= {
			title:			true,
			close:			true,
			toolbar:		true
		};
		this.events		= {
			opening: [],
			open: [],
			closing: [],
			close: [],
			submit: [],
			reset: []
		};

		var methods = [
			'get',
			'post'
		];

		this.addEvent = function(event,handler) {
			if(event in this.events)
				{ this.events[event].push(handler); }
		};

		if('id' in options && typeof options.id == 'string')
			{ this.id = options.id.trim(); }

		if('className' in options && typeof options.className == 'string')
			{ this.className = options.className.trim(); }

		if('action' in options && typeof options.action == 'string' || options.action instanceof URL)
			{ this.action = options.action.toString(); }

		if('method' in options && typeof options.method == 'string' && methods.indexOf(options.method.trim().toLowerCase())!== false)
			{ this.method = options.method.trim().toLowerCase(); }

		if('title' in options && typeof options.title == 'string')
			{ this.title = options.title.trim(); }

		if('toolbar' in options && typeof options.toolbar === typeof [])
			{ this.toolbar = options.toolbar; }

		if('content' in options && typeof options.content === typeof [])
			{ this.content = options.content; }

		if('events' in options && typeof options.events == 'object') {
			for(var event in options.events)
				{ this.addEvent(event,options.events[event]); }
		}

//		create tint if doesn't exist
		var tint = document.getElementById('lb-tint');

		if(tint)
			{ tint = Element.wrap(tint); }
		else {
			tint = new Element({
				tag: 'div',
				attributes: {
					'class': 'disabled',
					id: 'lb-tint'
				}
			});

			tint.setParent(document.body);
		}

		this.form = new Element({
			tag: 'form',
			attributes: {
				id: this.id,
				'class': [
					'lightbox',
					'closed',
					this.className
				].join(' '),
				action: this.action,
				method: this.method
			},
			events: {
				submit: function(evt) {
					for(var i=0,l=me.events.submit.length;i<l;i++) {
						if(me.events.submit[i](evt)===false)
							{ return cancelEvent(evt); }
					}
				},
				reset: function(evt) {
					for(var i=0,l=me.events.reset.length;i<l;i++) {
						if(me.events.reset[i](evt)===false)
							{ return cancelEvent(evt); }
					}
				}
			}
		});

		if(this.show.title) {
			var title = new Element({
				tag: 'div',
				attributes: {
					'class': 'title'
				},
				children: [
					new Element({
						tag: 'span',
						children: [
							this.title
						]
					})
				]
			});

			if(this.show.close) {
				title.addChild(new Element({
					tag: 'a',
					attributes: {
						href: '#close',
						'class': 'button close'
					},
					children: ["\u00d7"],
					events: {
						click: function(evt){
							me.close();
							return cancelEvent(evt);
						}
					}
				}));
			}

			this.form.addChild(title);
		}

		var content = new Element({
			tag: 'div',
			attributes: {
				'class': 'content'
			}
		});

		for(var i=0,l=this.content.length;i<l;i++)
			{ content.addChild(this.content[i]); }

		this.form.addChild(content);

		if(this.show.toolbar) {
			var toolbar = new Element({
				tag: 'div',
				attributes: {
					'class': 'toolbar'
				}
			});

			for(var i=0,l=this.toolbar.length;i<l;i++)
				{ toolbar.addChild(this.toolbar[i]); }

			this.form.addChild(toolbar);
		}

		this.form.setParent(document.body);

		this.open = function() {
			var open = true;

			for(var i=0,l=this.events.opening.length;i<l;i++) {
				var event = {
					form: this.form,
					toolbar: this.toolbar,
					contents: this.contents
				};
				if(this.events.opening[i](event)===false)
					{ open = false; break; }
			}

			if(open) {
				Element.removeClass(document.getElementById('lb-tint'),'disabled');
				this.form.removeClass('closed');

				for(var i=0,l=this.events.open.length;i<l;i++) {
					var event = {
						form: this.form,
						toolbar: this.toolbar,
						contents: this.contents
					};
					if(this.events.open[i](event)===false)
						{ break; }
				}
			}
		};

		this.close = function() {
			var closed = true;

			for(var i=0,l=this.events.closing.length;i<l;i++) {
				var event = {
					form: this.form,
					toolbar: this.toolbar,
					contents: this.contents
				};
				if(this.events.closing[i](event)===false)
					{ closed = false; break; }
			}

			if(closed) {
				Element.addClass(document.getElementById('lb-tint'),'disabled');
				this.form.addClass('closed');

				for(var i=0,l=this.events.close.length;i<l;i++) {
					var event = {
						form: this.form,
						toolbar: this.toolbar,
						contents: this.contents
					};
					if(this.events.close[i](event)===false)
						{ break; }
				}
			}
		};
	}
};
