PlayersList = new Mongo.Collection('players');

Meteor.methods({
  'createPlayer': function(playerName) {
    check(playerName, String);
    var currentPlayerId = this.userId;
    if (currentPlayerId) {
      PlayersList.insert({
        owner: this.userId,
        name: playerName,
        score: 0
      })
    }
  },

  'removePlayer': function(playerId) {
    check(playerId, String);
    var currentPlayerId = this.userId;

    if (currentPlayerId) {
      PlayersList.remove({
        _id: playerId,
        owner: currentPlayerId
      })
    }
  },

  'modifyScore': function(playerId, score) {
    check(score, Match.Integer);
    check(playerId, String);
    var currentPlayerId = this.userId;

    if (currentPlayerId && (score == -5 || score == 5)) {
      PlayersList.update(
        {
          _id: playerId,
          owner: currentPlayerId
        },
        {
          $inc: {score: score}
        }
      );
    }
  }
});

if (Meteor.isClient) {

  Meteor.subscribe('thePlayers');

  Template.leaderboard.helpers({
    'player': function() {
      return PlayersList.find({owner: Meteor.userId()}, {sort: {score: -1, name: 1}});
    },
    'selectedPlayer': function(){
      var player = Session.get('selectedPlayer');
      return PlayersList.findOne({_id: player});
    }
  });

  Template.leaderboard.events({
    'click .modify-score': function(e) {
      var selectedPlayer = Session.get('selectedPlayer');
      var score = Number($(e.target).data('score'));
      Meteor.call('modifyScore', selectedPlayer, score)
    }
  });

  Template.playerDisplay.helpers({
    'selectedClass': function() {
      var player = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      return player == selectedPlayer ? 'selected' : null;
    }
  });

  Template.playerDisplay.events({
    'click .player': function(e) {
      Session.set('selectedPlayer', this._id);
    },
    'click .delete-player': function(e){
      
      Meteor.call('removePlayer', this._id);
      e.stopPropagation();
    }
  });

  Template.addPlayer.events({
    'submit .add-player': function(e){
      e.preventDefault();

      var name = $('.add-player input[name=name]').val();
      Meteor.call('createPlayer', name);
      $('.add-player input[name=name]').val('');
    }
  })

}

if (Meteor.isServer) {

  Meteor.publish('thePlayers', function() {
    var currentPlayerId = this.userId;
    return PlayersList.find({owner: currentPlayerId});
  });
}

