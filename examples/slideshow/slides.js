onReady.run(function(){
	var ss = new FX.SlideShow({
		element: document.getElementById('slideshow'),
		seconds: 3,
		wrap: true,
		show: {
			prev: false,
			next: false,
			slides: true
		},
		slides: [
			{
				src: 'http://i.imgur.com/gObQ25s.jpg',
				title: 'Sandwich 1',
				href: '#'
			},
			{
				src: 'http://i.imgur.com/MkeCwuB.jpg',
				title: 'Sandwich 2',
				href: '#'
			},
			{
				src: 'http://i.imgur.com/7YNsSUH.jpg',
				title: 'Hot Dog',
				href: '#'
			}
		]
	});
});
