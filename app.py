import warnings
warnings.filterwarnings("ignore")
import requests
from bs4 import BeautifulSoup
import smtplib
import time
from datetime import datetime
from email.mime.text import MIMEText

# Function to send notification email
def send_email(subject, body, receiver):
    mail_server = 'smtp.gmail.com'
    mail_port = 587  
    mail_use_tls = True
    mail_username = 'sabanci.class.check@gmail.com'
    mail_password = 'ktwwnoyhefnxwomg'
    mail_default_sender = 'sabanci.class.check@gmail.com'

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = mail_default_sender
    msg['To'] = receiver

    try:
        server = smtplib.SMTP(mail_server, mail_port)
        if mail_use_tls:
            server.starttls()
        server.login(mail_username, mail_password)
        server.sendmail(mail_default_sender, receiver, msg.as_string())
        print("Email sent!")
    except Exception as e:
        print(f"Failed to send email: {e}")
    finally:
        server.quit()

def construct_url_with_crn(crn):
    base_url = 'https://suis.sabanciuniv.edu/prod/bwckschd.p_disp_detail_sched?term_in=202302&crn_in='
    return f"{base_url}{crn}"

def check_class_availability(url, last_known_seats, receiver):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    remaining_seats_element = soup.select_one('th.ddlabel[scope="row"]:contains("Seats") + td + td + td.dddefault')
    
    if remaining_seats_element:
        current_seats = remaining_seats_element.text.strip()
        print(f"{datetime.now()}: There are {current_seats} remaining seat(s).")
        
        # Check if remaining seats have changed
        if current_seats != last_known_seats:
            if current_seats == '0':
                print(f"{datetime.now()}: Seats are back to 0.")
            else:
                send_email("Class Spot Available", f"A spot in the class has opened up! There are {current_seats} remaining seat(s).", receiver)
            return current_seats  # Update the last known seats with current seats
    else:
        print(f"{datetime.now()}: Couldn't find the remaining seats element on the page.")
    return last_known_seats  # No change, return the last known value


email_username = input("Enter the first part of your Sabanci Univ email (everything before '@sabanciuniv.edu'): ")
receiver_email = f"{email_username}@sabanciuniv.edu"

crn_code = input("Enter the CRN code: ")
url = construct_url_with_crn(crn_code)

send_email("Script Started", "The class availability checking script has started.", receiver_email)

last_known_seats = '0' 


while True:
    last_known_seats = check_class_availability(url, last_known_seats, receiver_email)
    time.sleep(15)  # Adjust the timing as needed
