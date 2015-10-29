from okcupyd.session import Session
from okcupyd.user import User

def send_message(screenname, password, minimum_age, maximum_age, location, radius, gentation, message, num):
    session = Session.login(screenname, password)
    user = User(session=session)

    for profile in user.search(minimum_age=minimum_age, maximum_age=maximum_age, location=location, radius=radius, gentation=gentation)[:num]:
        profile.message(message)

