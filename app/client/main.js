import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});

Template.create.events({
    'submit form' : function (event, instance){
        event.preventDefault();
        var obj = {
            name: event.target["name"].value,
            password: event.target["password"].value,
            players: 0,
            state: 52428800
        };

        Rooms.insert(obj);
        $('.form').addClass("success");
        $('.form')[0].reset();
    }
});

Template.rooms.onCreated(function(){
    this.selectedRoom = new ReactiveVar("");
});

Template.rooms.helpers({
    rooms: function(){ return Rooms.find(); },
    
});

Template.rooms.events({
    'click .row': function(e, template)
    {
        console.log(e);
    }
});
