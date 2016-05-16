PlayersList = new Mongo.Collection('players');

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    'player': function() {
      return PlayersList.find({}, {sort: {score: -1, name: 1}});
    },
    'selectedPlayer': function(){
      var player = Session.get('selectedPlayer');
      return PlayersList.findOne({_id: player});
    }
  });

  Template.leaderboard.events({
    'click .increment': function(e) {
      var selectedPlayer = Session.get('selectedPlayer');
      PlayersList.update({_id: selectedPlayer}, {$inc: {score: 5}});
    },
    'click .decrement': function(e) {
      var player = Session.get('selectedPlayer');
      PlayersList.update({_id: player}, {$inc:{score:-5}});
    }
  })

  Template.playerDisplay.helpers({
    'selectedClass': function() {
      var player = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      return player == selectedPlayer ? 'selected' : null;
    }
  })

  Template.playerDisplay.events({
    'click .player': function(e) {
      Session.set('selectedPlayer', this._id);
    },
  })
}

if (Meteor.isServer) {

}

