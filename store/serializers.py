from rest_framework import serializers
from .models import Customer, Product, Invoice, InvoiceItem
from decimal import Decimal

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
        # Frontend cannot send 'price_at_purchase', backend sets it!
        read_only_fields = ['price_at_purchase'] 

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True) # Enables sending an array of items

    class Meta:
        model = Invoice
        fields = ['invoiceid', 'customer', 'date', 'is_paid', 'payment_method', 'subtotal', 'tax', 'total', 'amount_paid', 'change', 'items']
        # Frontend cannot dictate totals. We calculate them.
        read_only_fields = ['subtotal', 'tax', 'total', 'date']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # 1. Create the blank invoice first
        invoice = Invoice.objects.create(**validated_data)
        
        subtotal = Decimal('0.00')
        
        # 2. Loop through the items React sent us
        for item in items_data:
            product = item['product']
            quantity = item['quantity']
            
            # SECURE: Pull price directly from the Product model, ignoring frontend!
            actual_price = product.price 
            
            # Create the line item
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                quantity=quantity,
                price_at_purchase=actual_price
            )
            # Add to subtotal
            subtotal += (actual_price * quantity)
        
        # 3. Calculate Tax (e.g., 12%) and Total
        tax_rate = Decimal('0.12') # Change this to whatever your local tax rate is
        tax = subtotal * tax_rate
        total = subtotal + tax
        
        # 4. Save calculations back to the invoice
        invoice.subtotal = subtotal
        invoice.tax = tax
        invoice.total = total
        

        paid = validated_data.get('amount_paid', Decimal('0.00'))
        invoice.amount_paid = paid
        invoice.change = paid - total
        
        invoice.save()
        
        return invoice