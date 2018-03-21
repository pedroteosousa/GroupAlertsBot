const lowdb = require('lowdb')
const db = lowdb('db.json')

module.exports = {db: db}

module.exports.user = (function () {
	var User = {}
	db.defaults({users: []}).write()
	User.create = function (id) {
		db.get('users').push({
			id: id,
			messages: [],
		}).write()
		return db.get('users').find({id: id})
	}
	User.get =  function (id) {
		var user = db.get('users').find({id: id})
		if (user.isUndefined().value())
			return module.exports.user.create(id)
		return user
	}
	User.migrate = function (old_id, new_id) {
		var user = User.get(old_id).assign({id : new_id}).write()
		return user
	}
	User.add_msg = function (id, msg, from) {
		var user = User.get(id)
		var messages = user.get('messages').value()
		var name = from.username
		if (name === undefined)
			name = from.first_name
		messages.push({text: msg, username: name})
		user.assign({messages: messages}).write()
		return user
	}
	User.rmv_msg = function (id, index) {
		var user = User.get(id)
		var messages = user.get('messages').value()
		if (messages.length <= index || index < 0)
			return false
		messages.splice(index, 1)
		user.assign({messages: messages}).write()
		return true
	}
	return User
})()
