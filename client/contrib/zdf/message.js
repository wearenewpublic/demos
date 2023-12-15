import { StyleSheet, Text, View } from "react-native";
import { UserFace } from "../../component/userface";
import { useDatastore, useObject, usePersonaKey } from "../../util/datastore";
import React, { useState } from "react";
import { Clickable, Pad } from "../../component/basics";
import { TranslatableLabel } from "../../component/translation";
import { ShallPass } from "../../prototype/Gandalf";
import { sleep } from "../../util/util";


function ActionBar({ actions, messageKey, message, alignRight }) {
    const s = ActionBarStyle;

    if(alignRight) {
        actions = actions.reverse();
    }

    return <View style={[alignRight ? s.alignRight : s.alignLeft]}>
        {actions.map((action, idx) =>
            [
                React.createElement(action, { key: idx, messageKey, message }),
                <div key={"pad-" + idx} style={{ width: 32 }} />  
            ]
        )}
    </View>
}

const ActionBarStyle = StyleSheet.create({
    alignRight: {
        marginRight: 25,
        flexDirection: 'row-reverse',
    },
    alignLeft: {
        marginLeft: 56,
        flexDirection: 'row',
    }
})

function ActionPublish({ messageKey, message, label}) {
    const datastore = useDatastore();

    if (!label) {
        label = "Publish";
    }
    
    async function publishMessage() {
        // Publish the message where it would have been in the chat history when the user sent it
        datastore.modifyObject('message', messageKey, message => ({ ...message, shallPass: ShallPass.Yes, deletedByMod: false, isPublic: true }));

        // Unlocking chat input and showing QuietSystemMessage to the commenter for 1.5 seconds
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Yes }));
        await sleep(1500);
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Unset }));
    }
    return <MessageActionButton label={label} onPress={publishMessage} />
}

function ActionPublishAppend({ messageKey, message, label}) {
    const datastore = useDatastore();

    if (!label) {
        label = "Publish";
    }
    
    async function publishMessage() {
        // Deleting the original message and posting a duplicate so it appears at the bottom of the chat history
        datastore.deleteObject("message", messageKey);
        datastore.addObject("message", { text: message.text, from: message.from, shallPass: ShallPass.Yes, deletedByMod: false });

        // Unlocking chat input and showing QuietSystemMessage to the commenter for 1.5 seconds
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Yes }));
        await sleep(1500);
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Unset }));
    }
    return <MessageActionButton label={label} onPress={publishMessage} />
}

function ActionRestore({ messageKey, message }) {
    return ActionPublish({ messageKey, message, label: "Restore" });
}

function ActionDelete({ messageKey, message }) {
    const datastore = useDatastore();
    
    async function deleteMessage() {
        // Deleting the message without changing the message order. Should be used for messages that were previously visible in the chat history
        datastore.modifyObject('message', messageKey, message => ({ ...message, shallPass: ShallPass.No, deletedByMod: true, restored: false }));
        
        // Unlocking chat input and showing QuietSystemMessage to the commenter for 1.5 seconds
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.No }));
        await sleep(1500);
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Unset }));
    }

    return <MessageActionButton label="Delete" labelColor="red" onPress={deleteMessage}/>
}

function ActionDeleteAppend({ messageKey, message }) {
    const datastore = useDatastore();
    
    async function deleteMessage() {
        // Deleting the original message and adding a new duplicate message at the bottom of the chat. It will be visually censored with "This message was removed."
        datastore.deleteObject("message", messageKey);
        datastore.addObject("message", { text: message.text, from: message.from, shallPass: ShallPass.No, deletedByMod: true, restored: false });
        
        // Unlocking chat input and showing QuietSystemMessage to the commenter for 1.5 seconds
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.No }));
        await sleep(1500);
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Unset }));
    }

    return <MessageActionButton label="Delete" labelColor="red" onPress={deleteMessage}/>
}

function ActionToggleViewHide({ messageKey, message }) {
    const datastore = useDatastore();
    const currentUser = usePersonaKey();
    
    const label = (message.isUnhidden && message.unhiddenBy === currentUser) ? "Hide" : "View";

    async function toggleMessage() {
        datastore.modifyObject('message', messageKey, message => ({ ...message, isUnhidden: !message.isUnhidden, unhiddenBy: currentUser }));
    }

    return <MessageActionButton label={label} onPress={toggleMessage}/>
}

function ActionEdit({ messageKey, message }) {
    const datastore = useDatastore();

    async function editMessage() {
        // Hide message from mod queue without deleting it
        datastore.modifyObject("message", messageKey, message => ({ ...message, shallPass: ShallPass.Unset }));
        datastore.modifyObject("persona", message.from, persona => ({ ...persona, shallPass: ShallPass.Unset, isEditing: true }));
    }

    return <MessageActionButton label="Edit" onPress={editMessage}/>
}

export function MessageActionButton({ label, formatParams, onPress, labelColor }) {
    const s = MessageActionButtonStyle;
    const [hover, setHover] = useState(false);
    return <Clickable style={s.clicker} onHoverChange={setHover}>
        <TranslatableLabel
            style={[
                !hover ? s.text : [s.text, s.hoverText],
                labelColor ? { color: labelColor } : undefined
            ]}
            onPress={onPress}
            label={label}
            formatParams={formatParams} />
    </Clickable>
}

const MessageActionButtonStyle = StyleSheet.create({
    text: {
        fontSize: 11,
        textTransform: 'uppercase',
        marginTop: 4,
        color: '#666'
    },
    hoverText: {
        color: '#000',
        textDecorationLine: 'underline'
    }
})


export function DeletableMessage({messageKey, selfIsMod}) {
    const s = DeletableMessageStyle;
    const message = useObject('message', messageKey);
    const currentUser = usePersonaKey();
    const fromMe = message.from == currentUser;
    const actions = [ActionDelete];
    return <View>
        <View style={[s.messageHolder, fromMe ? s.myMessageHolder : {}]}> 
            {fromMe ? null : 
                <UserFace userId={message.from} />
            }
            <View style={[s.messageBubble, fromMe ? s.myMessageBubble : s.theirMessageBubble]}>
                {fromMe ? null : 
                    <MessageAuthorInfo messageKey={messageKey} />
                }
                <Text style={fromMe ? s.myMessageText : {}}>{message.text}</Text>
            </View>
        </View>

        {/* Only mods should be able to delete messages */}
        {selfIsMod ?
            <>
                <ActionBar actions={actions} messageKey={messageKey} message={message} />
            </>
            : null
        }
    </View>
}

const DeletableMessageStyle = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
        marginHorizontal: 8,
    },
    myMessageText: {
        color: '#fff'
    },
    myMessageHolder: {
        justifyContent: 'flex-end',
    },
    theirMessageBubble: {
        backgroundColor: '#eee',
        marginRight: 64
    },
    myMessageBubble: {
        backgroundColor: '#0084FF',
        marginLeft: 64
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        paddingVertical: 6,
        maxWidth: 500,
        flexShrink: 1
    }
})


export function QueuedMessage({ messageKey }) {
    const s = QueuedMessageStyle;
    const message = useObject('message', messageKey);
    const actions = [ActionPublishAppend, ActionDeleteAppend];

    return <View>
        <View style={s.messageHolder}>
            <UserFace userId={message.from} />
            <View style={[s.messageBubble, s.theirMessageBubble]}>
                <MessageAuthorInfo messageKey={messageKey} />
                <Text>{message.text}</Text>
            </View>
        </View>
        <ActionBar actions={actions} messageKey={messageKey} message={message} />
        <Pad size={5}/>
    </View>
}

const QueuedMessageStyle = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
        marginHorizontal: 8,
    },
    theirMessageBubble: {
        backgroundColor: '#ffe0e0',
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        paddingVertical: 6,
        maxWidth: 500,
        flexShrink: 1
    }
})


export function DeletedMessage({ messageKey, selfIsMod }) {
    const s = DeletedMessageStyle;
    const message = useObject('message', messageKey);
    const currentUser = usePersonaKey();
    const fromMe = message.from == currentUser;
    const alignRight = fromMe ? true : false;

    // Users can view their own deleted messages, mods can view and restore deleted messages
    let actions = (selfIsMod && !message.restored) ? [ActionToggleViewHide, ActionRestore] : [ActionToggleViewHide];

    let displayText = "This message was removed by the auto-moderator because it violates our community guidelines.";
    if (message.restored) {
        displayText = "This message was restored by a moderator."
    }
    else if (message.deletedByMod) {
        displayText = "This message was removed by a moderator because it violates our community guidelines."
    }

    return <View>
        <View style={[s.messageHolder, fromMe ? s.myMessageHolder : {}, s.deleted]}> 
            {fromMe ? null : 
                <UserFace userId={message.from} />
            }
            <View style={[s.messageBubble, fromMe ? s.myMessageBubble : s.theirMessageBubble]}>
                {fromMe ? null : 
                    <MessageAuthorInfo messageKey={messageKey} />
                }
                {
                    (message.isUnhidden && message.unhiddenBy === currentUser) ?
                        <Text style={[fromMe ? s.myMessageText : {}]}>{message.text}</Text>
                        : <Text style={[fromMe ? s.myMessageText : {}, s.infoText]}>{displayText}</Text>
                }
            </View>
        </View>

        {selfIsMod || fromMe ?
            <ActionBar actions={actions} messageKey={messageKey} message={message} alignRight={alignRight}/>
            : null
        }
    </View>
}

const DeletedMessageStyle = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
        marginHorizontal: 8
    },
    myMessageText: {
        color: '#fff'
    },
    myMessageHolder: {
        justifyContent: 'flex-end',
    },
    theirMessageBubble: {
        backgroundColor: '#eee',
        marginRight: 64
    },
    myMessageBubble: {
        backgroundColor: '#0084FF',
        marginLeft: 64
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        paddingVertical: 6,
        maxWidth: 500,
        flexShrink: 1
    },
    infoText: {
        fontStyle: "italic"
    },
    deleted: {
        opacity: 0.75
    }
})


export function PendingMessage({ messageKey }) {
    const s = PendingMessageStyle;
    const message = useObject('message', messageKey);
    const currentUser = usePersonaKey();
    const fromMe = message.from === currentUser;

    {/* Show edit button if your own message is pending for mod approval */}
    const actions = (fromMe && message.shallPass === ShallPass.Maybe) ? [ActionEdit] : null;

    return <View>
        <View style={[s.messageHolder, fromMe ? s.myMessageHolder : {}, s.pending]}> 
            {fromMe ? null : 
                <UserFace userId={message.from} />
            }
            <View style={[s.messageBubble, fromMe ? s.myMessageBubble : s.theirMessageBubble]}>
                {fromMe ? null : 
                    <MessageAuthorInfo messageKey={messageKey} />
                }
                <Text style={[fromMe ? s.myMessageText : {}, s.pendingText]}>{message.text}</Text>
            </View>
        </View>
        <View style={s.actionAndInfo}>
            { actions ?
                <ActionBar actions={actions} messageKey={messageKey} message={message} />
                : null
            }
            <QuietSystemMessageCustomizable label={"Pending..."} alignLabel={"flex-end"} labelFontSize={"11px"} marginRight={"4px"} />
        </View>
    </View>    
}

const PendingMessageStyle = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
        marginHorizontal: 8
    },
    myMessageText: {
        color: '#fff'
    },
    myMessageHolder: {
        justifyContent: 'flex-end'
    },
    theirMessageBubble: {
        backgroundColor: '#eee',
        marginRight: 64
    },
    myMessageBubble: {
        backgroundColor: '#0084FF',
        marginLeft: 64
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        paddingVertical: 6,
        maxWidth: 500,
        flexShrink: 1
    },
    pendingText: {
        // fontStyle: "italic",
    },
    pending: {
        opacity: 0.75
    },
    actionAndInfo: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        marginRight: 20
    }
})


export function ModMessage({ messageKey }) {
    const s = ModMessageStyle;
    const message = useObject('message', messageKey);
    const currentUser = usePersonaKey();
    const fromMe = message.from == currentUser;
    return <View style={[s.messageHolder, fromMe ? s.myMessageHolder : {}]}> 
        {fromMe ? null : 
            <UserFace userId={message.from} />
        }
        <View style={[s.messageBubble, fromMe ? s.myMessageBubble : s.theirMessageBubble]}>
            {fromMe ? null : 
                <MessageAuthorInfo messageKey={messageKey} isMod={true}/>
            }
            <Text style={fromMe ? s.myMessageText : {}}>{message.text}</Text>
        </View>
    </View>
}

const ModMessageStyle = StyleSheet.create({
    messageHolder: {
        flexDirection: 'row',
        marginHorizontal: 8
    },
    myMessageText: {
        color: '#fff'
    },
    myMessageHolder: {
        justifyContent: 'flex-end',
    },
    theirMessageBubble: {
        backgroundColor: "#ffd9b2",
        marginRight: 64
    },
    myMessageBubble: {
        backgroundColor: '#0084FF',
        marginLeft: 64
    },
    messageBubble: {
        borderRadius: 16,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        paddingVertical: 6,
        maxWidth: 500,
        flexShrink: 1
    }
})

export function QuietSystemMessageCustomizable({label, alignLabel, labelFontSize, marginTop, marginBottom, marginLeft, marginRight, formatParams}) {
    const s = QuietSystemMessageCustomizableStyle;
    return <TranslatableLabel
        style={[
            s.text,
            {
                alignSelf: alignLabel,
                marginTop: marginTop,
                marginBottom: marginBottom,
                marginLeft: marginLeft,
                marginRight: marginRight,
                fontSize: labelFontSize
            }
        ]}
        label={label}
        formatParams={formatParams} />
}

const QuietSystemMessageCustomizableStyle = StyleSheet.create({
    text: {
        color: '#999',
        alignSelf: 'center'
    }
});


function MessageAuthorInfo({messageKey, isMod}) {
    const s = MessageAuthorInfoStyle;
    const message = useObject('message', messageKey);
    const user = useObject('persona', message.from);
    return <View style={s.authorInfoBox}> 
        {isMod ?
            <Text style={s.authorName}>{user.name} 🛡️</Text>
            : <Text style={s.authorName}>{user.name}</Text>
        }
    </View>
}

const MessageAuthorInfoStyle = StyleSheet.create({
    authorName: {
        fontWeight: 'bold',
        fontSize: 12
    },
    authorInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    }
});