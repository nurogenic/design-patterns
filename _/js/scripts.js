(function(){

	window.DesignPatterns = {
		Models: {},
		Collections: {},
		Views: {},
		Router: {},
		Helpers: {}
	};

	var bEvents = _.extend({}, Backbone.Events);

	// Helpers
	// Helper functions I use periodically
	DesignPatterns.Helpers = {
		
		template: function(id){
			return _.template( $( '#' + id ).html() );
		},

		updateBodyClass: function(newClass){
			$('body').attr('class','');
			$('body').addClass(newClass);
		},

		incrementId: function(newPattern){
			var patternCount = patternCollection.toJSON().length;
			newPattern.model.set('id', patternCount);
		},

		alertError: function(error){
			alert(error);
		}
	};

	// Router
	// Handles the rendering of different routes
	DesignPatterns.Router = Backbone.Router.extend({
		routes: {
	      ''				: 'list',
	      'list(/)'			: 'list',
	      'details(/):id'	: 'details',
	      'add(/)'			: 'add',
	      'search(/):query'	: 'search',
	      '*other'			: 'default'
	    },

	    list: function(){
			var thisTemplate = new DesignPatterns.Views.ShowPatterns();
	    	bEvents.trigger('patternTemplate:all');
		},

	    details: function(id){
	    	var thisTemplate = new DesignPatterns.Views.ShowPattern();
	    	bEvents.trigger('patternTemplate:show', id);
	    },

	    add: function(){
	    	var thisTemplate = new DesignPatterns.Views.AddPattern();
	    	bEvents.trigger('patternTemplate:add');
	    },

	    search: function(){
	    },

	    default: function(other){
	    	var thisTemplate = new DesignPatterns.Views.Error();
	    	bEvents.trigger('patternTemplate:error', other);
	    }
	});

	// Model
	// Setting defaults for my Pattern model
	DesignPatterns.Models.Pattern = Backbone.Model.extend({
		defaults : {
			id : 0,
			title : '',
			description : ''
		}
	});

	// Collection
	// Defines Pattern Model Collection
	DesignPatterns.Collections.Patterns = Backbone.Collection.extend({
		model: DesignPatterns.Models.Pattern
	});

	// Collection View
	// Handles rendering the entire list of design patterns
	DesignPatterns.Views.Patterns = Backbone.View.extend({
		tagName : 'ul',

		initialize: function(){
			this.collection.on('add', this.addOne, this);
		},

		render: function(){
			this.collection.each( function(pattern){
				var patternView = new DesignPatterns.Views.Pattern({model: pattern});
				this.$el.append(patternView.render().el);
			}, this);
			return this;
		},

		addOne: function(pattern){
			var newPattern = new DesignPatterns.Views.Pattern({ model: pattern});

			DesignPatterns.Helpers.incrementId(newPattern);

			this.$el.append( newPattern.render().el );
		}
	});

	// View		
	// Handles rendering the individual design patern item in list
	DesignPatterns.Views.Pattern = Backbone.View.extend({
		tagName : "li",

		template: DesignPatterns.Helpers.template('pattern-template'),

		render: function(){
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		}
	});

	// Page View
	// Handles adding new pattern
	DesignPatterns.Views.AddPattern = Backbone.View.extend({
		tagName: 'form',

		id: 'add-new-pattern',

		template: DesignPatterns.Helpers.template('add-one'),

		events: {
			'submit' : 'submit'
		},

		initialize: function(){
			bEvents.on('patternTemplate:add', this.render, this);
		},

		render: function(){
			var template = DesignPatterns.Helpers.template( 'header-template' );
	    	$('#header').html( template( {title : 'Add A New Design Pattern' }) );

	    	$("#design-pattern-content").html( this.$el.html(this.template) );

	    	DesignPatterns.Helpers.updateBodyClass('add-new');

			$('#back-button').show();
			$('#add-button').hide();
			return this;
		},

		submit: function(e){
			e.preventDefault();

			var inputTitle 			= $('input[name="design-pattern-name"]');
			var inputDescription 	= $('textarea[name="design-pattern-description"]');

			var patternTitle = inputTitle.val();
			var patternDescription = inputDescription.val();

			if(patternTitle !== '' && patternDescription !== ''){
				inputTitle.val('');
				inputDescription.val('').html('');
				patternCollection.add( { title: patternTitle , description: patternDescription } );
				router.navigate("list", {trigger: true});
			} else{
				DesignPatterns.Helpers.alertError("Please fill out all the information.");
			}

		}
	});

	// Page View
	// Handles showing specific pattern details
	DesignPatterns.Views.ShowPattern = Backbone.View.extend({

		template: DesignPatterns.Helpers.template( 'header-template' ),

		initialize: function(){
			bEvents.on('patternTemplate:show', this.render, this)
		},

		render: function(id){
			var model = patternCollection.get(id);
			$("#header").html( this.$el.html(this.template({title : model.get('title')})) );
			$("#design-pattern-content").html( model.get('description') );
			
			DesignPatterns.Helpers.updateBodyClass('details-view');

			$('#back-button').show();
			$('#add-button').hide();
			return this;
		}
	});

	// Page View
	// Handles showing all patterns
	DesignPatterns.Views.ShowPatterns = Backbone.View.extend({

		template: DesignPatterns.Helpers.template( 'header-template' ),

		initialize: function(){
			bEvents.on('patternTemplate:all', this.render, this)
		},

		render: function(){
			$("#header").html( this.$el.html(this.template({title: 'Javascript Design Patterns'})) );
			$("#design-pattern-content").html(patternView);

			DesignPatterns.Helpers.updateBodyClass('list-view');

			$('#back-button').hide();
			$('#add-button').show();

			return this;
		}	
	});

	// Page View
	// 404 Error page
	DesignPatterns.Views.Error = Backbone.View.extend({
		template: DesignPatterns.Helpers.template( 'header-template' ),

		initialize: function(){
			bEvents.on('patternTemplate:error', this.render, this)
		},

		render: function(other){

			$("#header").html( this.$el.html(this.template({title: 'The page at "'+other+'" doesn\'t exist.'})) );

	    	$("#design-pattern-content").html('');
			
			DesignPatterns.Helpers.updateBodyClass('error-page');

			$('#back-button').show();
			$('#add-button').hide();

			return this;
		}
	});

	
	// Gather my collection and render
	var patternCollection 	= new DesignPatterns.Collections.Patterns( window.patternArray );
	var patternView 		= new DesignPatterns.Views.Patterns( {collection: patternCollection} ).render().el;

	// Start my routers
	var router = new DesignPatterns.Router;
	Backbone.history.start();
})();