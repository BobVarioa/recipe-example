from django.http import JsonResponse
from ..models import UserInfo, RecipeTag
import json

from django.http import HttpRequest

# get_tags
def get_tags(request: HttpRequest):
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	
	tags = [{ "name": tag.name, "id": tag.id } for tag in userinfo.tags.all()]
	return JsonResponse({ "success": True, "data": tags })
	
# set_tags(tags=str[])
def set_tags(request: HttpRequest):
	req = json.loads(request.body)
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	tags = req.get("tags")
	if not isinstance(tags, list):
		return JsonResponse({ "success": False, "error": "Invalid request format" })
	
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	# skips non existent tags
	recipe_tags = RecipeTag.objects.filter(name__in=tags)
	for tag in recipe_tags:
		userinfo.tags.add(tag)

	return JsonResponse({ "success": True })

# set_tags_by_id(tags=number[])
def set_tags_by_id(request: HttpRequest):
	req = json.loads(request.body)
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	tags = req.get("tags")
	if not isinstance(tags, list):
		return JsonResponse({ "success": False, "error": "Invalid request format" })
	
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	# skips non existent tags
	recipe_tags = RecipeTag.objects.filter(pk__in=tags)
	for tag in recipe_tags:
		userinfo.tags.add(tag)

	return JsonResponse({ "success": True })

# get_public_user(id=number) 
def get_public_user(request: HttpRequest):
	req = json.loads(request.body)
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	id = req.get("id")
	if not isinstance(id, int):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	try:
		userinfo = UserInfo.objects.get(pk=id)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	
	return JsonResponse({ "success": True, "data": { "id": userinfo.id, "username": userinfo.username, "display_name": userinfo.display_name } })