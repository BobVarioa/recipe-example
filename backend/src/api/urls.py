from django.contrib import admin
from django.urls import include, path

from .views import auth, prices, recipes, user

urlpatterns = [
	path("login", auth.login),
	path("logout", auth.logout),
	path("create_user", auth.create_user),
	
	path("set_tags", user.set_tags),
	path("set_tags_by_id", user.set_tags_by_id),
	path("get_tags", user.get_tags),
	path("get_public_user", user.get_public_user),

	path("get_recipes", recipes.get_recipes),
	path("get_recipes_by_user", recipes.get_recipes_by_user),
	path("get_recipe", recipes.get_recipe),
	path("publish_recipe", recipes.publish_recipe),

	path("get_price", prices.get_price),
	path("get_price_by_id", prices.get_price_by_id),
	path("set_price", prices.set_price),
	path("set_price_by_id", prices.set_price_by_id),

]
