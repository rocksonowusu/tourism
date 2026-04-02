from django.urls import path
from . import views

urlpatterns = [
    path('', views.health_check, name='health_check'),
    path('email-test/', views.email_test, name='email_test'),
]
