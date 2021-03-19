const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const GameSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  created_by:{
    type: String,
    required: true
  },
  paused:{
    type: Boolean,
    default: true
  },
  song_score:{
    type: mongoose.Types.Decimal128,
    default: 1000
  },
  buffer:{
    min: Number,
    max: Number,
    playlist: {
      ids: [{
        type: String
      }],
      songs: [{
        id: String,
        name: String,
        artist: String,
        uri: String
      }]
    }
  },
  bot_playlist:{
    ids: [{
      type: String
    }],
    songs: [{
      id: String,
      name: String,
      artist: String,
      uri: String
    }]
  },
  final_playlist:[{
    name: String,
    song:{
      id: String,
      name: String,
      artist: String,
      uri: String
    }
  }],
  state: {
    type: String,
    required: true
  },
  current_song: {
    type: Number,
    default: 0
  },
  players: [{
    name: String,
    submission:{
      name: String,
      score: Number
    },
    total_score: Number,
    resolve: {
      type: Boolean,
      default: false
    },
    song: {
      id: String,
      name: String,
      artist: String,
      uri: String
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
});
module.exports = Game = mongoose.model("games", GameSchema);
