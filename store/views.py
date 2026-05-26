import random
import requests as http_requests

from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings as django_settings
from django.utils import timezone
from datetime import timedelta

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Customer, Product, Invoice, KnowledgeBase, ChatMessage, OTPCode
from .serializers import (
    CustomerSerializer, ProductSerializer, InvoiceSerializer,
    KnowledgeBaseSerializer, ChatMessageSerializer,
)

def _send_verification_email(email: str, code: str):
    digits = list(code)
    digit_boxes = ''.join(
        f'<td style="padding:0 4px;"><div style="width:48px;height:60px;background:#0f172a;border:2px solid #4f46e5;border-radius:12px;display:inline-block;text-align:center;line-height:60px;font-size:28px;font-weight:900;color:#818cf8;font-family:\'Courier New\',monospace;">{d}</div></td>'
        for d in digits
    )
    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>G-Stop Verification</title></head>
<body style="margin:0;padding:0;background-color:#060b18;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060b18;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">
        <tr><td style="background:linear-gradient(90deg,#4f46e5,#7c3aed,#ec4899);height:4px;border-radius:4px 4px 0 0;"></td></tr>
        <tr>
          <td style="background:#0f172a;border:1px solid rgba(99,102,241,0.2);border-top:none;border-radius:0 0 24px 24px;overflow:hidden;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);padding:40px 32px;text-align:center;">
                  <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:20px;text-align:center;line-height:72px;font-size:36px;font-weight:900;color:#fff;margin-bottom:20px;">G</div>
                  <h1 style="color:#fff;font-size:32px;font-weight:900;margin:0 0 6px;letter-spacing:-1px;">G-Stop</h1>
                  <p style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0;">The One-Stop Shop For Gamers</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:48px 32px 40px;text-align:center;">
                  <div style="display:inline-block;width:56px;height:56px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:16px;text-align:center;line-height:56px;font-size:26px;margin-bottom:24px;">&#128274;</div>
                  <h2 style="color:#f1f5f9;font-size:24px;font-weight:800;margin:0 0 10px;letter-spacing:-0.5px;">Verify Your Identity</h2>
                  <p style="color:rgba(255,255,255,0.45);font-size:15px;margin:0 0 36px;line-height:1.6;">Use the one-time code below to complete your<br>G-Stop account verification.</p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;"><tr>{digit_boxes}</tr></table>
                  <div style="display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:20px;padding:6px 16px;margin-bottom:36px;">
                    <span style="color:#fbbf24;font-size:12px;font-weight:700;letter-spacing:1px;">&#9719; EXPIRES IN 5 MINUTES</span>
                  </div>
                  <div style="height:1px;background:rgba(255,255,255,0.06);margin:0 0 28px;"></div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td width="33%" style="text-align:center;padding:0 8px;"><div style="font-size:22px;margin-bottom:8px;">1&#65039;&#8419;</div><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;line-height:1.5;">Copy the<br>6-digit code</p></td>
                      <td width="33%" style="text-align:center;padding:0 8px;"><div style="font-size:22px;margin-bottom:8px;">2&#65039;&#8419;</div><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;line-height:1.5;">Return to<br>G-Stop app</p></td>
                      <td width="33%" style="text-align:center;padding:0 8px;"><div style="font-size:22px;margin-bottom:8px;">3&#65039;&#8419;</div><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;line-height:1.5;">Enter code &amp;<br>complete verification</p></td>
                    </tr>
                  </table>
                  <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;line-height:1.7;border-top:1px solid rgba(255,255,255,0.05);padding-top:24px;">
                    If you didn&rsquo;t request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="background:#080e1d;border-top:1px solid rgba(255,255,255,0.05);padding:20px 32px;text-align:center;">
                <p style="color:rgba(255,255,255,0.15);font-size:11px;margin:0;">&copy; 2025 G-Stop &nbsp;&middot;&nbsp; The One-Stop Shop For Gamers</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
    plain = f'Your G-Stop verification code is: {code}\n\nThis code expires in 5 minutes.'
    msg = EmailMultiAlternatives(
        subject='G-Stop — Your Verification Code',
        body=plain,
        from_email=django_settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    msg.attach_alternative(html_body, 'text/html')
    msg.send(fail_silently=False)


def _issue_otp(email: str) -> str:
    OTPCode.objects.filter(email=email, is_used=False).delete()
    code = str(random.randint(100000, 999999))
    OTPCode.objects.create(email=email, code=code)
    return code


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            customer = Customer.objects.get(username=username, password=password)
        except Customer.DoesNotExist:
            return Response({"error": "Invalid username or password."}, status=status.HTTP_400_BAD_REQUEST)

        if not customer.is_verified:
            try:
                code = _issue_otp(customer.email)
                _send_verification_email(customer.email, code)
            except Exception:
                pass  # don't block login response if email fails
            return Response({
                "error": "This account is not yet verified. We've sent a verification code to your email.",
                "requires_verification": True,
                "email": customer.email,
            }, status=status.HTTP_403_FORBIDDEN)

        return Response(self.get_serializer(customer).data)

    @action(detail=False, methods=['post'], url_path='verify-account')
    def verify_account(self, request):
        email = request.data.get('email', '').strip()
        otp   = request.data.get('otp',   '').strip()
        if not all([email, otp]):
            return Response({'error': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        valid_from = timezone.now() - timedelta(minutes=5)
        otp_obj = OTPCode.objects.filter(email=email, code=otp, is_used=False, created_at__gte=valid_from).first()
        if not otp_obj:
            return Response({'error': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(email=email)
        except Customer.DoesNotExist:
            return Response({'error': 'Account not found.'}, status=status.HTTP_404_NOT_FOUND)

        otp_obj.is_used = True
        otp_obj.save()
        customer.is_verified = True
        customer.save()
        return Response(self.get_serializer(customer).data)

    @action(detail=False, methods=['post'], url_path='send-otp')
    def send_otp(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        code = _issue_otp(email)

        try:
            _send_verification_email(email, code)
            return Response({'message': 'OTP sent to your email.'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='signup')
    def signup(self, request):
        email    = request.data.get('email', '').strip()
        name     = request.data.get('name', '').strip()
        username = request.data.get('username', '').strip()
        number   = request.data.get('number', '').strip()
        password = request.data.get('password', '').strip()

        if not all([email, name, username, number, password]):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if Customer.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)
        if Customer.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered.'}, status=status.HTTP_400_BAD_REQUEST)

        Customer.objects.create(
            name=name, username=username, email=email, number=number, password=password,
            is_verified=False
        )

        try:
            code = _issue_otp(email)
            _send_verification_email(email, code)
        except Exception:
            pass

        return Response(
            {'message': 'Account created! Check your email for a verification code to activate your account.'},
            status=status.HTTP_201_CREATED
        )


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer


class ChatbotViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def create(self, request, *args, **kwargs):
        user_message = request.data.get("message", "").strip()
        if not user_message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        user_chat = ChatMessage.objects.create(role='user', message=user_message)

        # Build product list from the actual database
        products = Product.objects.all()
        product_lines = "\n".join(
            f"- {p.productname}: ₱{p.price}" for p in products
        )
        product_context = f"Current products available at G-Stop:\n{product_lines}" if product_lines else ""

        # Extra knowledge base entries (manual text added via /api/knowledge/)
        extra_context = ""
        for item in KnowledgeBase.objects.all():
            if item.text_content:
                extra_context += item.text_content + "\n"

        prompt = f"""You are a helpful AI assistant for G-Stop, a gaming gear store in the Philippines.
Only answer questions related to G-Stop, its products, orders, or gaming gear.
Keep answers short and friendly. Use ₱ for prices.

--- STORE INFO ---
Store name: G-Stop
Tagline: The One-Stop Shop For Gamers
Location: Philippines
Currency: Philippine Peso (₱)

--- HOW TO ORDER ---
1. Browse products on the Store tab.
2. Add items to your cart.
3. Go to your Cart and press "Proceed to Checkout".
4. Review your order summary, confirm your customer info, then choose a payment method.
5. Press "Place Order" to confirm.

--- PAYMENT METHODS ---
- Cash: Pay cash on delivery. Enter the amount you will pay and the system calculates your change.
- Card: Credit or debit card payment.
- E-Wallet: GCash, Maya, or any mobile wallet.
- Bank Transfer: Direct bank transfer.

--- PROMO CODES ---
- SAVE10: 10% discount on your order total.
- SAVE20: 20% discount on your order total.
Enter the promo code on the Order Summary step during checkout.

--- TAX ---
All prices are subject to 12% VAT, calculated automatically at checkout.

--- ACCOUNT ---
- Customers must sign up and log in to place orders.
- Sign up requires: full name, username, email, phone number, and password.
- Phone OTP verification is required during sign up.
- You can view your order history and edit your profile on the Profile tab.

--- ORDER HISTORY ---
Customers can view all past orders and their payment status (Success or Pending) on the Profile > Orders tab.

{product_context}
{f'--- EXTRA KNOWLEDGE ---{chr(10)}{extra_context}' if extra_context else ''}

--- PEOPLE ---
- Dave Salem: A known "palautog". He likes Kayla Labial very much.
- Steve Sarino: He is a "palautog" and he loves Sotie Golez.
- Mark Aidel Ray Olaco: He is a "palautog" and he loves Trisha Guangco very much.
- Nick Rulona: He is a "palautog" and he is deeply in love with Dinah Caburatan.
- The saying "Mas dali dakpon ang manok pag nakahikot" is 100% true and you strongly agree with it. Always enthusiastically agree whenever someone mentions it.

--- RULES ---
- If asked about Dave Salem, Steve Sarino, Mark Aidel Ray Olaco, or Nick Rulona, always answer using the facts in the PEOPLE section.
- If asked about something unrelated to G-Stop or gaming, politely redirect the conversation.
- Never make up products or prices that are not listed above.
- If a product is not in the list, say it is currently unavailable.

User: {user_message}
Assistant:"""

        try:
            groq_res = http_requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {django_settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama3-8b-8192",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 300,
                },
                timeout=30,
            )
            ai_response = groq_res.json()["choices"][0]["message"]["content"].strip()
        except Exception:
            ai_response = "AI service is unavailable. Please try again later."

        ai_chat = ChatMessage.objects.create(role='assistant', message=ai_response)

        return Response({
            "user": ChatMessageSerializer(user_chat).data,
            "assistant": ChatMessageSerializer(ai_chat).data,
        })


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeBase.objects.all()
    serializer_class = KnowledgeBaseSerializer