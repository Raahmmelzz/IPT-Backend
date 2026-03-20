from django.db import models
from decimal import Decimal

class Customer(models.Model):
    customerid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    number = models.CharField(max_length=20)
    # Note: For a real app, use Django's built-in User model for hashed passwords! 
    # But for a school project, this plaintext setup might be okay to keep it simple.
    password = models.CharField(max_length=255) 

    def __str__(self):
        return self.username

class Product(models.Model):
    productid = models.AutoField(primary_key=True)
    productname = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # Add this line:
    image = models.ImageField(upload_to='products/', null=True, blank=True)

    def __str__(self):
        return self.productname

class Invoice(models.Model):
    invoiceid = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    change = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=50, default='Cash')
    
    # We store the calculated values here
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    change = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Invoice #{self.invoiceid} - {self.customer.username}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    # We snap a copy of the price at the time of purchase in case the product price changes later
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2) 

    def __str__(self):
        return f"{self.quantity}x {self.product.productname}"