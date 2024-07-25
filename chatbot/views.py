import os
import time
import re
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from openai import OpenAI
import json
import logging

logger = logging.getLogger(__name__)

api_key = os.getenv('REACT_APP_OPENAI_API_KEY')
client = OpenAI(api_key=api_key)
assistant_id = None
vector_store_id = None
thread_id = None

def extract_email(user_input):
    email_regex = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    email_match = re.search(email_regex, user_input)
    return email_match.group(0) if email_match else None

def save_contact(user_input, new_thread_id):
    file_path = os.path.join(os.path.dirname(__file__), 'collected_data/customer_data.txt')
    email = extract_email(user_input)
    if not email:
        return

    try:
        with open(file_path, 'r') as f:
            existing_data = f.read()
    except FileNotFoundError:
        existing_data = ''

    lines = existing_data.split('\n')
    email_exists = False
    existing_id = None

    for line in lines:
        if line.strip():
            stored_email, id = map(str.strip, line.split(': '))
            if stored_email == email:
                email_exists = True
                existing_id = id.replace(',', '')

    new_data = f"{email}: {new_thread_id}\n"

    if email_exists:
        global thread_id
        thread_id = existing_id
    else:
        with open(file_path, 'a') as f:
            f.write(new_data)

def remove_source(text):
    text = str(text)
    text = re.sub(r'\【.*?\】', '', text)
    text = re.sub(r'\*+', '', text)
    return text.strip()

def parse_button_map():
    button_map = {}
    file_path = os.path.join(os.path.dirname(__file__), 'files/buttons.txt')
    try:
        with open(file_path, 'rb') as f:
            content = f.read().strip().decode('utf-8')
    except FileNotFoundError:
        return HttpResponse(status=500, content=f"No instructions file found.")
    entries = content.split('=====')
    for entry in entries:
        key, value = entry.split('===')
        button_map[key.strip()] = value.strip()
    return button_map

button_map = parse_button_map()

@csrf_exempt
def get_assistant(request):
    logger.debug("Fetching assistant")
    global assistant_id, vector_store_id

    try:
        assistant_id = 'asst_pWdX4pmMFCbAhdogpiIGouhT'
        return JsonResponse({'assistant_id': 'asst_pWdX4pmMFCbAhdogpiIGouhT'})

    except Exception as e:
        logger.error('Error fetching assistant: %s', str(e))
        return HttpResponse(status=500, content=f"An error occurred while creating assistant: {str(e)}")

@csrf_exempt
def send_message(request):
    global assistant_id, thread_id

    data = json.loads(request.body)
    user_input = data.get('input')

    try:
        if not thread_id:
            thread = client.beta.threads.create()
            thread_id = thread.id

        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_input,
        )

        if '@' in user_input:
            save_contact(user_input, thread_id)

        if user_input in button_map:
            answer = button_map[user_input]
        else:
            run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=assistant_id)

            while True:
                response = client.beta.threads.runs.retrieve(run_id=run.id, thread_id=thread_id)
                if response.status not in ["in_progress", "queued"]:
                    break
                time.sleep(2)

            message_list = client.beta.threads.messages.list(thread_id)
            last_message = next((msg for msg in message_list.data if msg.run_id == run.id and msg.role == 'assistant'), None)
            answer = remove_source(last_message.content[0].text.value)

        if answer:
            return JsonResponse({'response': answer})
        else:
            return HttpResponse(status=500, content='No response from the assistant.')

    except Exception as e:
        logger.error('Error retrieving response: %s', str(e))
        return HttpResponse(status=500, content=f"An error occurred while retrieving response: {str(e)}")
