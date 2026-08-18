import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from chat.models import Conversation, Message

User = get_user_model()

def seed():
    print("[+] Seeding database with Madhan, Santhosh, and Manoj...")
    
    users_data = [
        {
            "username": "madhan",
            "email": "madhan@example.com",
            "password": "password123",
            "first_name": "Madhan",
            "last_name": "Kumar",
            "bio": "Full Stack Developer",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=madhan"
        },
        {
            "username": "santhosh",
            "email": "santhosh@example.com",
            "password": "password123",
            "first_name": "Santhosh",
            "last_name": "Raj",
            "bio": "Python & Django Developer",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=santhosh"
        },
        {
            "username": "manoj",
            "email": "manoj@example.com",
            "password": "password123",
            "first_name": "Manoj",
            "last_name": "Prabhakar",
            "bio": "Frontend React Developer",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=manoj"
        }
    ]

    created_users = {}
    for u in users_data:
        user, created = User.objects.get_or_create(username=u['username'], defaults={
            'email': u['email'],
            'first_name': u['first_name'],
            'last_name': u['last_name'],
            'bio': u['bio'],
            'avatar_url': u['avatar_url'],
            'is_online': False
        })
        user.first_name = u['first_name']
        user.last_name = u['last_name']
        user.bio = u['bio']
        user.avatar_url = u['avatar_url']
        user.set_password(u['password'])
        user.save()
        print(f"Configured user: {user.username} ({user.first_name})")
        created_users[u['username']] = user

    # Create conversations
    madhan = created_users['madhan']
    santhosh = created_users['santhosh']
    manoj = created_users['manoj']

    # Conversation 1: Madhan and Santhosh
    c1 = Conversation.get_or_create_between(madhan, santhosh)
    if not c1.messages.exists():
        Message.objects.create(conversation=c1, sender=santhosh, content="Hi Madhan! How is the project going?", is_read=True)
        Message.objects.create(conversation=c1, sender=madhan, content="Hey Santhosh! Working on real-time chat with Django Channels.", is_read=True)
        Message.objects.create(conversation=c1, sender=santhosh, content="Awesome! Let's test the WebSocket connection.", is_read=False)
        c1.save()
        print("Created sample messages for Madhan & Santhosh")

    # Conversation 2: Madhan and Manoj
    c2 = Conversation.get_or_create_between(madhan, manoj)
    if not c2.messages.exists():
        Message.objects.create(conversation=c2, sender=manoj, content="Hello Madhan, React frontend design is ready!", is_read=True)
        Message.objects.create(conversation=c2, sender=madhan, content="Great work Manoj! Clean and simple design.", is_read=False)
        c2.save()
        print("Created sample messages for Madhan & Manoj")

    print("[SUCCESS] Seeding complete with Madhan, Santhosh, and Manoj!")

if __name__ == '__main__':
    seed()
