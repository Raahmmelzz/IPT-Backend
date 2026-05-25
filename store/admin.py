from django.contrib import admin
from .models import Customer, Product, Invoice, InvoiceItem, ChatMessage, KnowledgeBase

# Register the standard models
admin.site.register(Customer)
admin.site.register(Product)

# Set up the Invoice Items to display INSIDE the Invoice view
class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0 # Prevents Django from showing 3 empty rows by default
    readonly_fields = ('price_at_purchase',) # Prevent admin from accidentally changing the historic price

# Register the Invoice model and attach the items to it
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoiceid', 'customer', 'date', 'subtotal', 'tax', 'total', 'is_paid', 'payment_method')
    list_filter = ('is_paid', 'date', 'payment_method')
    search_fields = ('customer__username', 'customer__name')
    
    # This line tells Django to render the InvoiceItem rows inside this page!
    inlines = [InvoiceItemInline]
    
    # Keep the calculated totals read-only so they can't be tampered with manually
    readonly_fields = ('subtotal', 'tax', 'total', 'date')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('role', 'message', 'created_at')
    list_filter = ('role',)
    readonly_fields = ('role', 'message', 'created_at')


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'text_content')