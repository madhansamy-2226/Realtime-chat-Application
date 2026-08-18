from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    UserProfileView,
    UserSearchView,
    UserDetailView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='auth_profile'),
    path('users/search/', UserSearchView.as_view(), name='user_search'),
    path('users/<int:id>/', UserDetailView.as_view(), name='user_detail'),
]
