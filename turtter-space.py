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
tclients = {}

class TurtterSpaceChatHandler(webapp.RequestHandler):
	def post(self):
		payload = self.request.get('t')
		sender = self.request.get('c')
		current_turt = simplejson.loads(payload)
		logging.info('{%s} BROADCASTING %s from user <%s>:' %(sender, current_turt['data']['statement'], current_turt['data']['useruri']))
		for tcl in tclients:
			if tcl == sender: # broadcast to all clients but the sender
				# logging.info(' not echoing to sender %s' %(tcl))
				pass
			else:
				channel.send_message(tcl, payload)
				# logging.info(' SENDING to client %s' %(tcl))

class TurtterSpaceJoinHandler(webapp.RequestHandler):
	def post(self):
		payload = self.request.get('t')
		sender = self.request.get('c')
		current_turt = simplejson.loads(payload)
		logging.info('{%s} BROADCASTING %s from user <%s>:' %(sender, current_turt['data']['statement'], current_turt['data']['useruri']))
		for tcl in tclients:
			channel.send_message(tcl, payload)
			logging.info(' SENDING to client %s' %(tcl))

class SpacePage(webapp.RequestHandler):
	def get(self):
		client_id = os.urandom(16).encode('hex')
		channel_key = channel.create_channel(client_id)
		tclients[client_id] = channel_key
		template_values = { 'channel': channel_key, 'client' : client_id }
		logging.info('{%s} NEW client with ID %s' %(channel_key, client_id))
		path = os.path.join(os.path.dirname(__file__), 'index.html')
		self.response.out.write(template.render(path, template_values))

application = webapp.WSGIApplication([
	('/', SpacePage),
	('/chat', TurtterSpaceChatHandler),
	('/join', TurtterSpaceJoinHandler)
	], debug=True)


def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()