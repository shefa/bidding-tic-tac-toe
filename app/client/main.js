import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';


Template.game.events({
  'click #betBtn': function(e, template)
  {
      var id = FlowRouter.getParam("_id");
      var room = Rooms.findOne(id);
      if( !room.players.includes(Meteor.userId) )
      {
        alert("You cannot play in this game!");
        return;
      } 

      var bet = parseInt(prompt("Bid amount(0-"+template.state.moneyFirst+")",""));

      if(bet>=0&&bet<=template.state.moneyFirst)
      {
        if(room.players[0]===Meteor.userId)
        Rooms.update(FlowRouter.getParam("_id"),{"$set":{"bidFirst":bet}});
        else Rooms.update(FlowRouter.getParam("_id"),{"$set":{"bidSecond":bet}});
      }

      else alert("Incorrect bid amount!");
  }
});


Template.game.helpers({
  game: function()
  {
    return Rooms.findOne(FlowRouter.getParam("_id"));
  },
  setup: function()
  {
    Template.instance().state = Meteor.decodeState(this.state);
    if(this.bidFirst>=0&&this.bidSecond>=0)
    {
      var first;
      if(this.bidFirst==this.bidSecond)
      {
        first = Template.instance().state.tie;
        if(Template.instance().state.tie===1) Template.instance().state.tie=0;
        else Template.instance().state.tie=1;
      }
      else first = this.bidFirst>this.bidSecond;

      Template.instance().state.moneyFirst+=this.bidSecond-this.bidFirst;

      this.bidFirst=-1;
      this.bidSecond=-1;

      this.toMove=first;
      this.state = Meteor.encodeState(Template.instance().state);

      Rooms.update(FlowRouter.getParam("_id"),this);
    }
  },
  after: function()
  {
    var s = Template.instance().state;
    console.log(s);
    var curr = 0;
    for(var i=0;i<2;i++)
    {
      for(var j=0;j<2;j++)
      {
        if(s.placed[i][j])
        {
          if(s.ma3x[i][j]==0) $("#"+curr).html(Meteor.tic_x);
          else $("#"+curr).html(Meteor.tic_o);
        }

        curr++;
      }
    }
  },
  waiting: function()
  {
    return this.toMove>=0;
  },
  mymove: function()
  {
    var me=-1;
    if(!this.players.includes(Meteor.userId)) return false;
    if(Meteor.userId===this.players[0]) me=0;
    else me=1;
    
    if(me===this.toMove) return true;
    return false;
  },
  whoami: function()
  {
    if(!this.players.includes(Meteor.userId)) return "spectator";
    if(Meteor.userId===this.players[0]) return "Player 1";
    return "Player 2";
  },
  myMoney: function()
  {
    return Template.instance().state.moneyFirst;
  },
  enemyMoney: function()
  {
    return 200-Template.instance().state.moneyFirst;
  },
  myBet: function()
  {
    if(this.bidFirst>=0) return '<i class="check icon"></i>';
    else return '<i class="times icon"></i>';
  },
  enemyBet: function()
  {
    if(this.bidSecond>=0) return '<i class="check icon"></i>';
    else return '<i class="times icon"></i>';
  },
  tieBreak: function()
  {
    return Meteor.userId == Rooms.findOne(FlowRouter.getParam("_id")).players[Template.instance().state.tie];
  }
});

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
            players: [],
            state: 52428800,
            bidFirst: -1,
            bidSecond: -1,
            toMove: -1
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
    you: function(){ return this.players.includes(Meteor.userId); },
    picSelected: function(){ return (Template.instance().selectedRoom.get()!=="");}
});

Template.rooms.events({
    'click .row': function(e, template)
    {
        var t = e.target;
        while(t.attributes['id']===undefined) t=t.parentElement;
        var id = t.attributes['id'].value; 
        var old = document.getElementById(template.selectedRoom.get());
        if(old!==undefined&&old!==null) old.style.cssText="padding: 1em 3em !important; box-shadow: white 0px 0px 0px 2px inset !important;"
        t.style.cssText="padding: 1em 3em !important; box-shadow: coral 0px 0px 0px 2px inset !important;"
        template.selectedRoom.set(id);
    },
    'click #joinBtn': function(e, template)
    {
        var id = template.selectedRoom.get();
        var r = Rooms.findOne(id);
        if(id!==undefined&&id!==null&&r!=undefined&&(r.players.length<2 || r.players.includes(Meteor.userId)) )
        {
            if(r.password===prompt("Please enter the room password","")) 
            {
                if(r.players.includes(Meteor.userId)==false)
                Rooms.update(id,{"$push":{"players":Meteor.userId}});
                FlowRouter.go('game.page',{_id: id});
            }
            else alert("Wrong password!");
        }
        else alert("Can't join room!")
    },
    'click #deleteBtn': function(e, template)
    {
        var id = template.selectedRoom.get();
        if(id!==undefined&&id!==null&&Rooms.findOne(id).password===prompt("Please enter the room password","")) 
        Rooms.remove(id);
        else alert("Wrong password!");
    }
});
