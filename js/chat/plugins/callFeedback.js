/**
 * Simple class which will show +/- type of rating after a call had finished and will integrate that with the 
 * "Feedback" dialog
 *
 * @param megaChat
 * @param options {Object}
 * @returns {CallFeedback}
 * @constructor
 */
var CallFeedback = function(megaChat, options) {
    var self = this;

    options = options || {};

    options.parentLogger = megaChat.logger;

    megaChat.unbind("onInit.CallFeedback");
    megaChat.bind("onInit.CallFeedback", function(e) {
        self.attachToChat(megaChat)
    });

    return this;
};

/**
 * Entry point, for attaching to a specific `Chat` instance
 *
 * @param megaChat {Chat}
 */
CallFeedback.prototype.attachToChat = function(megaChat) {
    var self = this;

    megaChat
        .unbind('onRoomCreated.CallFeedback')
        .bind('onRoomCreated.CallFeedback', function(e, megaRoom) {
            megaRoom
                .unbind('call-ended.CallFeedback')
                .bind('call-ended.CallFeedback', function(e, eventData) {
                    var msgId = 'call-feedback' + unixtime();
                    megaRoom.appendMessage(
                        new ChatDialogMessage({
                            messageId: msgId,
                            type: 'call-feedback',
                            authorContact: megaChat.getContactFromJid(eventData.peer),
                            timestamp: unixtime(),
                            buttons: {
                                'sendFeedback': {
                                    'type': 'primary',
                                    'text': "Send Feedback",
                                    'callback': function() {
                                        var feedbackDialog = mega.ui.FeedbackDialog.singleton($(this));
                                        feedbackDialog._type = "call-ended";
                                        feedbackDialog.bind('onHide.callEnded', function() {

                                            //TODO: Use msgid to remove the msg
                                            megaRoom.trigger('resize');

                                            feedbackDialog.unbind('onHide.callEnded');
                                        });
                                    }
                                },
                                'noThanks': {
                                    'type': 'secondary',
                                    'text': "No thanks",
                                    'callback': function() {
                                        //TODO: Use msgid to remove the msg

                                        megaRoom.trigger('resize');
                                    }
                                }
                            }
                        })
                    );
                });
        });
};
