from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Customer, Product, Invoice
from .serializers import CustomerSerializer, ProductSerializer, InvoiceSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        try:
            # Check if a customer exists with this EXACT username and password
            customer = Customer.objects.get(username=username, password=password)
            serializer = self.get_serializer(customer)
            return Response(serializer.data) 
        except Customer.DoesNotExist:
            return Response(
                {"error": "Invalid username or password"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer