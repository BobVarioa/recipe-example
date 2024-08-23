from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
	path('api/', include('src.api.urls')),
]
if settings.DEBUG:
	urlpatterns.extend(static(settings.STATIC_URL, document_root=settings.STATIC_ROOT))
	# catch-all for the SPA is only needed during debug because apache handles this for
	urlpatterns.extend([
		path('', TemplateView.as_view(template_name='index.html'), name="home"),
		path('<path:resource>', TemplateView.as_view(template_name='index.html'), name="catchall")
	])