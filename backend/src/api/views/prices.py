from django.http import JsonResponse
from ..models import Ingredient, UserInfo, UserIngredient
import pgeocode
import numpy as np
import math
from cachetools import LRUCache, cached
import json

from django.http import HttpRequest
	 
# note: currently this just supports US locations, but could easily be extended to more
#       see [pgeocode's readme](https://github.com/symerio/pgeocode?tab=readme-ov-file#supported-countries) for the countries this would be easy to implement for

nomi = pgeocode.Nominatim('us')

# if this were used in a production environment this would likely have to be tweaked
@cached(cache=LRUCache(maxsize=20))
def get_zipcodes_near(initial_zipcode: str, distance: float):
	raw_loc = nomi.query_postal_code(initial_zipcode)
	lon1 = float(raw_loc.latitude)
	lat1 = float(raw_loc.longitude)

	df = nomi._data_frame.copy()

	# see https://stackoverflow.com/a/25767765 
	# basically just a vectorized haversine distance formula
	df['distance'] = 6367 * 2 * np.arcsin(np.sqrt(np.sin((np.radians(df['longitude']) - math.radians(lat1))/2)**2 + math.cos(math.radians(lat1)) * np.cos(np.radians(df['longitude'])) * np.sin((np.radians(df['latitude']) - math.radians(lon1))/2)**2))
	df = df.sort_values(by=['distance'], ascending=True)

	df = df.loc[df['distance'] < distance]

	return list(df['postal_code'])

def get_ingredient_price(user: UserInfo, ingredient: Ingredient):
	try:
		ingredient_price = UserIngredient.objects.get(user=user, ingredient=ingredient)
		return JsonResponse({ 
			"success": True, 
			"suggested": False,
			"data": [{ "price": ingredient_price.price, "currency": ingredient_price.currency, "amount": ingredient_price.amount, "unit": ingredient_price.unit, "zipcode": ingredient_price.user.zipcode }]
		})
	except UserIngredient.DoesNotExist:
		pass
	
	# less than 10 km away, completely arbitrary 
	zipcodes = get_zipcodes_near(user.zipcode, 10)

	# get at most 5 of the closest user prices
	ingredients = UserIngredient.objects.filter(ingredient=ingredient, user__zipcode__in=zipcodes)[0:5]
	
	return JsonResponse({ 
		"success": True, 
		"suggested": True,
		"data": [{ "price": ing.price, "currency": ing.currency, "amount": ing.amount, "unit": ing.unit, "zipcode": ing.user.zipcode } for ing in ingredients]
	})

# get_price(ingredient=str)
def get_price(request: HttpRequest):
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })
	
	try:
		req = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({ "success": False, "error": "Invalid request json" })
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	ingredient = req.get("ingredient")

	if not isinstance(ingredient, str):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	
	try:
		ingredient_obj = Ingredient.objects.get(name=ingredient)
	except Ingredient.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Ingredient does not exist" })
	
	return get_ingredient_price(userinfo, ingredient_obj)

# get_price_by_id(ingredient=number)
def get_price_by_id(request: HttpRequest):
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })
	
	try:
		req = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({ "success": False, "error": "Invalid request json" })
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	ingredient = req.get("ingredient")

	if not isinstance(ingredient, int):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	
	try:
		ingredient_obj = Ingredient.objects.get(pk=ingredient)
	except Ingredient.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Ingredient does not exist" })
	
	return get_ingredient_price(userinfo, ingredient_obj)

# set_price(ingredient=str, price=number, currency=string, amount=number, unit=str)
def set_price(request: HttpRequest):
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })
	
	try:
		req = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({ "success": False, "error": "Invalid request json" })
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	print(req)

	ingredient = req.get("ingredient")
	price = req.get("price")
	currency = req.get("currency")
	amount = req.get("amount")
	unit = req.get("unit")

	if not (isinstance(ingredient, str) and (isinstance(price, float) or isinstance(price, int)) and isinstance(currency, str)) and (isinstance(amount, float) or isinstance(amount, int) and isinstance(unit, str)):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	
	try:
		ingredient_obj = Ingredient.objects.get(name=ingredient)
	except Ingredient.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Ingredient does not exist" })

	ing = UserIngredient.objects.create(
		user=userinfo,
		ingredient=ingredient_obj,
		price=price,
		currency=currency,
		amount=amount,
		unit=unit
	)
	ing.save()
	
	return JsonResponse({ "success": True })

# set_price(ingredient=number, price=number, currency=string)
def set_price_by_id(request: HttpRequest):
	if not request.user.is_authenticated:
		return JsonResponse({ "success": False, "error": "Unauthenticated user" })
	
	try:
		req = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({ "success": False, "error": "Invalid request json" })
	if not isinstance(req, dict): 
		return JsonResponse({ "success": False, "error": "Invalid request format" })
		
	ingredient = req.get("ingredient")
	price = req.get("price")
	currency = req.get("currency")
	amount = req.get("amount")
	unit = req.get("unit")

	if not (isinstance(ingredient, int) and (isinstance(price, float) or isinstance(price, int)) and isinstance(currency, str)) and (isinstance(amount, float) or isinstance(amount, int) and isinstance(unit, str)):
		return JsonResponse({ "success": False, "error": "Invalid request format" })

	try:
		userinfo = UserInfo.objects.get(auth_id=request.user)
	except UserInfo.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Unable to fetch user info" })
	
	try:
		ingredient_obj = Ingredient.objects.get(pk=ingredient)
	except Ingredient.DoesNotExist:
		return JsonResponse({ "success": False, "error": "Ingredient does not exist" })

	ing = UserIngredient.objects.create(
		user=userinfo,
		ingredient=ingredient_obj,
		price=price,
		currency=currency,
		amount=amount,
		unit=unit
	)
	ing.save()
	
	return JsonResponse({ "success": True })