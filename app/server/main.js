import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  Meteor.usersIP=[];
});


Meteor.methods({
	'getId':function()
	{
		var userIp = this.connection.clientAddress;
		if(Meteor.usersIP[userIp]===undefined) Meteor.usersIP[userIp]=Math.random();
		return Meteor.usersIP[userIp];
	}
});