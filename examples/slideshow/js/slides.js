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
				src: 'img/slide0.jpg',
				title: 'Sandwich 1',
				href: '#'
			},
			{
				src: 'img/slide1.jpg',
				title: 'Sandwich 2',
				href: '#'
			},
			{
				src: 'img/slide2.jpg',
				title: 'Hot Dog',
				href: '#'
			}
		]
	});
});
