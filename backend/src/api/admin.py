from django.contrib import admin

from .models import UserInfo, Recipe, RecipeTag, Ingredient, UserIngredient

admin.site.register(UserInfo)
admin.site.register(Recipe)
admin.site.register(RecipeTag)
admin.site.register(Ingredient)
admin.site.register(UserIngredient)