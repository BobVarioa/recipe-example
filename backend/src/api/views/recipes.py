from django.http import JsonResponse
from markdown_it import MarkdownIt
from mdformat.renderer import MDRenderer
import nh3
import json
from datetime import datetime, timezone
from ..models import RecipeIngredient, UserInfo, RecipeTag, Ingredient, Recipe

from django.http import HttpRequest
from mdformat.renderer import RenderTreeNode, RenderContext

def html_block_sanitizer(node: RenderTreeNode, context: RenderContext) -> str:
	content = node.content.rstrip("\n").lstrip()
	return nh3.clean(content)


def html_inline_sanitizer(node: RenderTreeNode, context: RenderContext) -> str:
	return nh3.clean(node.content)

class HTMLSanitizerPlugin:
	RENDERERS = {
		"html_block": html_block_sanitizer,
		"html_inline": html_inline_sanitizer
	}

renderer = MDRenderer()
options = {
	"parser_extension": [HTMLSanitizerPlugin()]
}
env = {}
md = MarkdownIt("js-default")

# get_recipes(tags=str[], limit=number)
def get_recipes(request: HttpRequest):
	req = json.loads(request.body)
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	tags = req.get("tags")
	limit = req.get("limit")

	if not (isinstance(tags, list) and isinstance(limit, int)):
		return JsonResponse({ "success": False, "error": "Invalid request format" })
	
	if limit > 50:
		limit = 50
	
	try:
		recipe_tags = [RecipeTag.objects.get(name=tag) for tag in tags]
	except RecipeTag.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Invalid tag" })

	if len(recipe_tags) == 0:
		recipes_query = Recipe.objects.all()
	else:
		recipes_query = Recipe.objects.filter(tags__in=recipe_tags)

	recipes = recipes_query.distinct().order_by("-published_at")[0:limit]

	json_recipes = []

	for recipe in recipes:
		json_recipes.append({
			"id": recipe.id,
			"title": recipe.title,
			"user_id": recipe.user.id,
			"username": recipe.user.username,
			"display_name": recipe.user.display_name,
			"tags": [{ "name": tag.name, "id": tag.id } for tag in recipe.tags.all()],
			"ingredients": [{ "name": ing.ingredient.name, "id": ing.id, "amount": ing.amount, "unit": ing.unit } for ing in recipe.ingredients.all()],
			# we don't send the body here as ultimately, 
			# it's superfluous data: we'll refetch it whenever we access the specific recipe 
			# this also helps because it's likely the largest element in the model
		})

	return JsonResponse({ "success": True, "data": json_recipes })


# get_recipes_by_user(user=number, limit=number)
def get_recipes_by_user(request: HttpRequest):
	req = json.loads(request.body)
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	user = req.get("user")
	limit = req.get("limit")

	if not (isinstance(user, int) and isinstance(limit, int)):
		return JsonResponse({ "success": False, "error": "Invalid request format" })
	
	if limit > 50:
		limit = 50
	
	try:
		userinfo = UserInfo.objects.get(pk=user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })

	recipes = Recipe.objects.filter(user=userinfo).distinct().order_by("-published_at")[0:limit]

	json_recipes = []

	for recipe in recipes:
		json_recipes.append({
			"id": recipe.id,
			"title": recipe.title,
			"user_id": recipe.user.id,
			"username": recipe.user.username,
			"display_name": recipe.user.display_name,
			"tags": [{ "name": tag.name, "id": tag.id } for tag in recipe.tags.all()],
			"ingredients": [{ "name": ing.ingredient.name, "id": ing.id, "amount": ing.amount, "unit": ing.unit } for ing in recipe.ingredients.all()],
			# we don't send the body here as ultimately, 
			# it's superfluous data: we'll refetch it whenever we access the specific recipe 
			# this also helps because it's likely the largest element in the model
		})

	return JsonResponse({ "success": True, "data": json_recipes })

# get_recipe(id=number)
def get_recipe(request: HttpRequest):
	req = json.loads(request.body)
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	id = req.get("id")

	if not isinstance(id, int):
		return JsonResponse({ "success": False, "error": "Invalid request format" })
	
	try:
		recipe = Recipe.objects.get(pk=id)
	except Recipe.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Invalid recipe id" })

	return JsonResponse({ 
		"success": True, 
		"data": { 
			"title": recipe.title,
			"user_id": recipe.user.id,
			"username": recipe.user.username,
			"display_name": recipe.user.display_name,
			"body": recipe.body,
			"tags": [{ "name": tag.name, "id": tag.id } for tag in recipe.tags.all()],
			"ingredients": [{ "name": ing.ingredient.name, "id": ing.ingredient.id, "amount": ing.amount, "unit": ing.unit  } for ing in recipe.ingredients.all()],
		} 
	})

# publish_recipe(title=str, ingredients=str[], tags={name: str, amount: float, unit: str}[], body=str)
def publish_recipe(request: HttpRequest):
	try:
		req = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({ "success": False, "error": "Invalid request json" })
	
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	title = req.get("title")
	tags = req.get("tags")
	ingredients = req.get("ingredients")
	body = req.get("body")

	if not (isinstance(tags, list) and isinstance(ingredients, list) and isinstance(body, str) and isinstance(title, str)):
		return JsonResponse({ "success": False, "error": "Invalid request format" })
	
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })

	recipe_tags = [RecipeTag.objects.get_or_create(name=tag)[0] for tag in tags]
	recipe_ingredients = []

	# note: if this was used in production, we would likely want to find similar ingredients as well, not just exact matches
	for ing in ingredients:
		if not isinstance(ing, dict):
			return JsonResponse({ "success": False, "error": "Invalid request format" })

		ing_name = ing.get("name")
		ing_amount = ing.get("amount")
		ing_unit = ing.get("unit")

		if not (isinstance(ing_name, str) and (isinstance(ing_amount, float) or isinstance(ing_amount, int)) and isinstance(ing_unit, str)):
			return JsonResponse({ "success": False, "error": "Invalid request format" })

		real_ing = Ingredient.objects.get_or_create(name=ing_name)[0]

		recipe_ingredients.append(RecipeIngredient.objects.get_or_create(ingredient=real_ing, amount=ing_amount, unit=ing_unit)[0])

	tokens = md.parse(body)
	recipe_body = renderer.render(tokens, options, env)

	recipe = Recipe.objects.create(
		title=title,
		user=userinfo,
		body=recipe_body,
		published_at=datetime.now(tz=timezone.utc)
	)
	recipe.ingredients.set(recipe_ingredients)
	recipe.tags.set(recipe_tags)

	recipe.save()
	
	return JsonResponse({ "success": True, "data": { "id": recipe.id } })
