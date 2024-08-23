from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import logout as auth_logout, login as auth_login, authenticate
import json
from ..models import UserInfo

from django.http import HttpRequest

# login(username=str, password=str)
def login(request: HttpRequest):
	try:
		req = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({ "success": False, "error": "Invalid request json" })
	if not isinstance(req, dict):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	username = req.get("username")
	password = req.get("password")
	if not (isinstance(username, str) and isinstance(password, str)):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	user = authenticate(request, username=username, password=password)
	if user is None:
		return JsonResponse({ "success": False, "error": "Invalid credentials" })
	
	auth_login(request, user)

	try:
		userinfo = UserInfo.objects.get(auth_id=user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })


	return JsonResponse({ "success": True, "data": {
		"id": userinfo.id,
		"username": userinfo.username,
		"display_name": userinfo.display_name,
		"tags": [{ "name": tag.name, "id": tag.id } for tag in userinfo.tags.all()],
	} })

# logout()
def logout(request: HttpRequest):
	auth_logout(request)
	return JsonResponse({ "success": True })

# create_user(username=str, display_name=str email=str, password=str, zipcode=str)
def create_user(request: HttpRequest):
	try:
		req = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({ "success": False, "error": "Invalid request json" })

	# validate request body
	if not isinstance(req, dict):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	username = req.get("username")
	email = req.get("email")
	password = req.get("password")
	display_name = req.get("display_name")
	zipcode = req.get("zipcode")
	if not (isinstance(username, str) and isinstance(email, str) and isinstance(display_name, str) and isinstance(password, str) and isinstance(zipcode, str)):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	try:
		existing_user = UserInfo.objects.get(username=username)
		existing_auth_user = User.objects.get(username=username)
		return JsonResponse({ "success": False, "error": "User account already exists" })
	except UserInfo.DoesNotExist:
		pass

	user = User.objects.create_user(username, email, password)
	user.save()
	auth_login(request, user)

	userinfo = UserInfo.objects.create(
		auth_id=user,
		username=username,
		display_name=display_name,
		email=email,
		zipcode=zipcode
	)
	userinfo.save()

	return JsonResponse({ "success": True, "data": { 
		"id": userinfo.id,
		"username": userinfo.username,
		"display_name": userinfo.display_name,
		"tags": [{ "name": tag.name, "id": tag.id } for tag in userinfo.tags.all()],
	} })
	