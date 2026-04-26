from rest_framework import serializers
from .models import Customer, Product, Invoice, InvoiceItem
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['product', 'quantity', 'price_at_purchase']
        read_only_fields = ['price_at_purchase'] 

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ['invoiceid', 'customer', 'date', 'is_paid', 'payment_method', 'subtotal', 'tax', 'total', 'amount_paid', 'change', 'items']
        read_only_fields = ['subtotal', 'tax', 'total', 'date', 'change']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = validated_data.get('customer')
        # Ensure we get the amount_paid from the validated data
        amount_paid = Decimal(str(validated_data.get('amount_paid', 0)))

        # 1. Deduplication: Check if this order was JUST placed (within 3 seconds)
        recent_time = timezone.now() - timedelta(seconds=3)
        duplicate = Invoice.objects.filter(
            customer=customer,
            amount_paid=amount_paid,
            date__gte=recent_time
        ).first()

        if duplicate:
            return duplicate

        # 2. Create the main Invoice record
        invoice = Invoice.objects.create(**validated_data)
        
        subtotal = Decimal('0.00')
        
        # 3. Create items and sum up the prices
        for item in items_data:
            product = item['product']
            quantity = item['quantity']
            price = product.price 
            
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                quantity=quantity,
                price_at_purchase=price
            )
            subtotal += (price * quantity)
        
        # 4. Final Calculations
        tax = subtotal * Decimal('0.12')
        total = subtotal + tax
        
        invoice.subtotal = subtotal
        invoice.tax = tax
        invoice.total = total
        invoice.amount_paid = amount_paid
        invoice.change = amount_paid - total
        
        invoice.save() # Commit the math to DB
        return invoice