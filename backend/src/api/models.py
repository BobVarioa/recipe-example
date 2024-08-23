from django.db import models
from django.contrib.auth.models import User

class Ingredient(models.Model):
	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['name'], name="%(app_label)s_%(class)s_unique")
		]
	name = models.CharField(max_length=50)

class RecipeTag(models.Model):
	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['name'], name="%(app_label)s_%(class)s_unique")
		]
	name = models.CharField(max_length=30)

class UserInfo(models.Model):
	auth_id = models.ForeignKey(User, on_delete=models.CASCADE)
	username = models.CharField(max_length=30)
	display_name = models.CharField(max_length=60)
	email = models.CharField(max_length=50)
	zipcode = models.CharField(max_length=12)
	tags = models.ManyToManyField(RecipeTag)

class UserIngredient(models.Model):
	user = models.ForeignKey(UserInfo, on_delete=models.CASCADE)
	ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
	price = models.FloatField()
	currency = models.CharField(max_length=10)
	amount = models.FloatField()
	unit = models.CharField(max_length=10)

class RecipeIngredient(models.Model): 
	ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
	amount = models.FloatField()
	unit = models.CharField(max_length=10)

class Recipe(models.Model):
	title = models.CharField(max_length=150)
	user = models.ForeignKey(UserInfo, on_delete=models.CASCADE) 
	body = models.TextField(max_length=10000)
	tags = models.ManyToManyField(RecipeTag)
	ingredients = models.ManyToManyField(RecipeIngredient)
	published_at = models.DateTimeField()
