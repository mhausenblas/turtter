"""
Turtter space handler.
"""

import datetime
import logging
import os
from django.utils import simplejson
from google.appengine.api import channel
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app


MAIN_SPACE_ID = 'http://turtter-space.appspot.com/main#'
MAIN_SPACE_TOKEN = ''
current_turt = {}
MAIN_SPACE_TOKEN = channel.create_channel(MAIN_SPACE_ID)
logging.info('SPACE CREATED: %s' %MAIN_SPACE_TOKEN)

class TurtterSpacePingHandler(webapp.RequestHandler):
	def post(self):
		payload = self.request.get('t')
		ping_turt = simplejson.loads(payload)
		client_id = self.request.get('from')
		logging.info('{%s} USER %s has joined the space ...' %(MAIN_SPACE_TOKEN, client_id))
		channel.send_message(MAIN_SPACE_TOKEN, payload)
		
class TurtterSpaceChatHandler(webapp.RequestHandler):
	def post(self):
		payload = self.request.get('t')
		current_turt = simplejson.loads(payload)
		logging.info('{%s} BROADCASTING %s from user <%s>' %(MAIN_SPACE_TOKEN, current_turt['data']['statement'], current_turt['data']['useruri']))
		channel.send_message(MAIN_SPACE_TOKEN, payload)

class SpacePage(webapp.RequestHandler):
	def get(self):
		template_values = {'token': MAIN_SPACE_TOKEN }
		path = os.path.join(os.path.dirname(__file__), 'index.html')
		self.response.out.write(template.render(path, template_values))

application = webapp.WSGIApplication([
	('/', SpacePage),
	('/ping', TurtterSpacePingHandler),
	('/chat', TurtterSpaceChatHandler)
	], debug=True)


def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()