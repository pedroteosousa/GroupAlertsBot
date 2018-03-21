const bot_api = require('node-telegram-bot-api')
const fs = require('fs')
const db = require('./db')

const token = fs.readFileSync('token.txt', 'utf8').trim()

const bot = new bot_api(token, {polling: true})

const add_msg = "Send me a message to add."
const rmv_msg = "Send me the number of the message to delete."

var sendHTML = function (id, message) {
	bot.sendMessage(id, message, {
		parse_mode: 'html',
		disable_web_page_preview: true
	})
}

bot.on('message', (message) => {
	var id = message.chat.id
	if (message.reply_to_message) {
		var reply = message.reply_to_message
		if (reply.text == add_msg) {
			db.user.add_msg(id, message.text, message.from)
			sendHTML(id, "Message was added sucessfully.")
		}
		if (reply.text == rmv_msg) {
			if (db.user.rmv_msg(id, parseInt(message.text)-1))
				sendHTML(id, "Message was deleted sucessfully.")
			else
				sendHTML(id, "There was a problem deleting the message.")
		}
	}
})

bot.onText(/^\/add(@\w+)*$/, (message) => {
	var id = message.chat.id
	bot.sendMessage(id, add_msg, {
		reply_to_message_id: message.message_id,
		reply_markup: {
			force_reply: true,
			selective: true
		}
	})
})

bot.onText(/^\/remove(@\w+)*$/, (message) => {
	var id = message.chat.id
	bot.sendMessage(id, rmv_msg, {
		reply_to_message_id: message.message_id,
		reply_markup: {
			force_reply: true,
			selective: true
		}
	})
})

var formatMessages = function (msg) {
	if (msg === undefined || msg.length === 0) {
		return "There are no alerts."
	}
	var message = ""
	for (var i in msg) {
		message += "<b>Alert " + (parseInt(i)+1) + ":</b> " + msg[i].text +
			" <code>- " + msg[i].username + "</code>\n\n"
	}
	return message
}

bot.onText(/^\/alerts(@\w+)*$/, (message) => {
	var id = message.chat.id
	var messages = db.user.get(id).get('messages').value()
	var response = formatMessages(messages)
	sendHTML(message.chat.id, response)
})
