(function(){

	window.DesignPatterns = {
		Models: {},
		Collections: {},
		Views: {},
		Router: {}
	};

	window.template = function(id){
		return _.template( $( '#' + id ).html() );
	}


	var events = _.extend({}, Backbone.Events);

	// Handles the rendering of different routes
	DesignPatterns.Router = Backbone.Router.extend({
		routes: {
	      ''				: 'list',
	      'list'			: 'list',
	      'details/:id'		: 'details',
	      'search/:query' 	: 'search',
	      '*other'			: 'default'
	    },

	    list: function(){
			
			$('#page-title').html('Learning Design Patterns');

			var template = window.template( 'list-view-container' );
			$('#header').html( template({title: 'Javascript Design Patterns'}) );

			$("#design-pattern-content").html('');
			$("#design-pattern-content").html(patternView);

			$('body').attr('class','');
			$('body').addClass('list-view');

			$('#back-button').hide();
		},

	    details: function(id){
	    	var model = patternCollection.get(id);

	    	var template = window.template( 'list-view-container' );
	    	$('#header').html( template( {title : model.get('title') }) );

	    	$("#design-pattern-content").html( model.get('description') );
	    	$('body').attr('class','');
			$('body').addClass('details-view');
			$('#back-button').show();
	    },

	    search: function(){
	    	
	    },

	    default: function(other){

	    	$('#page-title').html("The page at "+other+" doesn't exist.");
	    	$("#design-pattern-content").html('');
	    	$('body').attr('class','');
			$('body').addClass('error-page');
			$('#back-button').hide();
	    }
	});

	// Setting defaults for my Pattern model
	DesignPatterns.Models.Pattern = Backbone.Model.extend({
		defaults : {
			id : 0,
			title : '',
			description : ''
		}
	});

	DesignPatterns.Collections.Patterns = Backbone.Collection.extend({
		model: DesignPatterns.Models.Pattern
	});

	// Handles rendering the entire list of design patterns
	DesignPatterns.Views.Patterns = Backbone.View.extend({
		tagName : 'ul',

		render: function(){
			this.collection.each( function(pattern){
				var patternView = new DesignPatterns.Views.Pattern({model: pattern});
				this.$el.append(patternView.render().el);
			}, this);
			return this;
		}
	});

	// Handles rendering the individual design patern item in list
	DesignPatterns.Views.Pattern = Backbone.View.extend({
		tagName : "li",

		template: template('pattern-template'),

		render: function(){
			this.$el.html( this.template( this.model.toJSON() ) );
			return this;
		}
	});


	//gather my collection and render
	var patternCollection 	= new DesignPatterns.Collections.Patterns( window.patternArray );
	var patternView 		= new DesignPatterns.Views.Patterns( {collection: patternCollection} ).render().el;


	// start my routers
	new DesignPatterns.Router;
	Backbone.history.start();
})();