jQuery(function($){ChiliBook.codeLanguage=function(el){var recipeName=jQuery(el).attr("class");recipeName=recipeName.replace(/\s*{.*}\s*/,"");return recipeName?recipeName:'';}
ChiliBook.recipeFolder=foswiki.pubUrlPath+'/'+foswiki.systemWebName+'/JQueryPlugin/plugins/chili/recipes/';ChiliBook.automaticSelector='pre';if(ChiliBook.automatic){$(ChiliBook.automaticSelector).livequery(function(){$(this).chili();});}});