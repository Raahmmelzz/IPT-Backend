from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, ProductViewSet, InvoiceViewSet, ChatbotViewSet, KnowledgeBaseViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'products', ProductViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'chat', ChatbotViewSet)
router.register(r'knowledge', KnowledgeBaseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
