var throttle = require('lodash-node/modern/functions/throttle');
var chessground = require('chessground');
var partial = chessground.util.partial;
var data = require('./data');
var round = require('./round');
var ground = require('./ground');
var socket = require('./socket');
var promotion = require('./promotion');
var hold = require('./hold');
var replayCtrl = require('./replay/replayCtrl');
var clockCtrl = require('./clock/clockCtrl');
var i18n = require('../i18n');
var status = require('./status');

module.exports = function(cfg, router, socketSend) {
  var clockIntervId;

  this.data = data({}, cfg);

  this.vm = {
    flip: false,
    reloading: false,
    redirecting: false,
    showingActions: false
  };

  this.socket = new socket(socketSend, this);

  this.flip = function() {
    this.vm.flip = !this.vm.flip;
    this.chessground.set({
      orientation: this.vm.flip ? this.data.opponent.color : this.data.player.color
    });
  }.bind(this);

  this.setTitle = function() {
    if (this.data.player.spectator) return;
    if (status.finished(this.data)) {
      this.title = i18n('gameOver');
    } else if (round.isPlayerTurn(this.data)) {
      this.title = i18n('yourTurn');
    } else {
      this.title = i18n('waitingForOpponent');
    }
  };
  this.setTitle();

  this.sendMove = function(orig, dest, prom) {
    var move = {
      from: orig,
      to: dest
    };
    if (prom) move.promotion = prom;
    this.socket.send('move', move, {
      ackable: true
    });
  }.bind(this);

  this.userMove = function(orig, dest, meta) {
    hold.register(this.socket, meta.holdTime);
    if (!promotion.start(this, orig, dest, meta.premove)) this.sendMove(orig, dest);
  }.bind(this);

  this.apiMove = function(o) {
    if (this.replay.active) this.replay.vm.late = true;
    else this.chessground.apiMove(o.from, o.to);
    if (this.data.game.threefold) this.data.game.threefold = false;
    this.data.game.moves.push(o.san);
    round.setOnGame(this.data, o.color, true);
    m.redraw();
  }.bind(this);

  this.chessground = ground.make(this.data, cfg.game.fen, this.userMove);

  this.reload = function(cfg) {
    this.replay.onReload(cfg);
    this.data = data(this.data, cfg);
    if (!this.replay.active) ground.reload(this.chessground, this.data, cfg.game.fen, this.vm.flip);
  }.bind(this);

  this.clock = this.data.clock ? new clockCtrl(
    this.data.clock,
    this.data.player.spectator ? function() {} : throttle(partial(this.socket.send, 'outoftime'), 500)
  ) : false;

  this.isClockRunning = function() {
    return this.data.clock && round.playable(this.data) &&
      ((this.data.game.turns - this.data.game.startedAtTurn) > 1 || this.data.clock.running);
  }.bind(this);

  this.clockTick = function() {
    if (this.isClockRunning()) this.clock.tick(this.data.game.player);
  }.bind(this);

  if (this.clock) clockIntervId = setInterval(this.clockTick, 100);

  this.replay = new replayCtrl(this);

  this.router = router;

  this.onunload = function() {
    if (clockIntervId) clearInterval(clockIntervId);
  };
};
